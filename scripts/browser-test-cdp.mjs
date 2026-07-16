import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { mkdtemp, writeFile } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { createZip } from '../src/zip.js';

const require = createRequire(import.meta.url);
let WebSocket;
try { WebSocket = require('ws'); }
catch { WebSocket = require('/usr/share/nodejs/ws'); }

const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

class CDPPage {
  constructor(target, onError) {
    this.target = target;
    this.onError = onError;
    this.sequence = 0;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      this.socket.once('open', resolve);
      this.socket.once('error', reject);
    });
    this.socket.on('message', (raw) => this.handle(JSON.parse(raw)));
    await Promise.all([this.send('Page.enable'), this.send('Runtime.enable'), this.send('Log.enable')]);
  }

  handle(message) {
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
      return;
    }
    if (message.method === 'Runtime.exceptionThrown') {
      this.onError(`pageerror: ${message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text}`);
    } else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
      const text = message.params.args.map((argument) => argument.value ?? argument.description ?? '').join(' ');
      this.onError(`console: ${text}`);
    } else if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
      this.onError(`log: ${message.params.entry.text}`);
    }
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.sequence;
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const response = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true,
    });
    if (response.exceptionDetails) {
      throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
    }
    return response.result.value;
  }

  async waitFor(expression, message = expression, timeout = 15_000) {
    const started = Date.now();
    while (Date.now() - started < timeout) {
      try { if (await this.evaluate(`Boolean(${expression})`)) return; }
      catch { /* Navigation can briefly destroy the execution context. */ }
      await delay(75);
    }
    throw new Error(`等待超时：${message}`);
  }

  click(selector) {
    return this.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); if (!element) throw new Error('找不到 ${selector}'); element.click(); return true; })()`);
  }

  async pointerClick(selector, xRatio, y) {
    const point = await this.evaluate(`(() => { const rect = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x: rect.left + rect.width * ${xRatio}, y: rect.top + ${y} }; })()`);
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', clickCount: 1 });
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', clickCount: 1 });
  }

  async addFiles(selector, files) {
    const records = files.map((file) => ({
      name: file.name,
      type: file.type,
      data: Buffer.from(file.data).toString('base64'),
    }));
    await this.evaluate(`(() => {
      const input = document.querySelector(${JSON.stringify(selector)});
      const transfer = new DataTransfer();
      for (const record of ${JSON.stringify(records)}) {
        const bytes = Uint8Array.from(atob(record.data), (character) => character.charCodeAt(0));
        transfer.items.add(new File([bytes], record.name, { type: record.type }));
      }
      input.files = transfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
  }

  async screenshot(file) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: true });
    await writeFile(path.resolve(file), Buffer.from(data, 'base64'));
  }

  close() {
    this.socket.close();
  }
}

function chromeExecutable() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  return ['/usr/bin/google-chrome', '/snap/bin/chromium', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync);
}

async function createPage(port, baseURL, errors, mobile = false) {
  const target = await fetch(`http://127.0.0.1:${port}/json/new?about%3Ablank`, { method: 'PUT' }).then((response) => response.json());
  const page = new CDPPage(target, (error) => errors.push(error));
  await page.connect();
  if (mobile) {
    await page.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await page.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  } else {
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 920, deviceScaleFactor: 1, mobile: false });
  }
  await page.send('Page.navigate', { url: baseURL });
  await page.waitFor('window.__SHOWTIME__?.selfTests', '应用初始化和浏览器自测');
  return page;
}

const baseURL = process.argv[2] || process.env.SHOWTIME_BASE_URL || 'http://127.0.0.1:4173/';
const executablePath = chromeExecutable();
if (!executablePath) throw new Error('未找到可执行的 Chrome / Chromium。');

const port = await freePort();
const profile = await mkdtemp(path.join(os.tmpdir(), 'showtime-atlas-cdp-'));
const browser = spawn(executablePath, [
  '--headless',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  '--no-first-run',
  '--remote-allow-origins=*',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });
browser.stderr.resume();

try {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) break;
    } catch { /* Chrome is still starting. */ }
    if (attempt === 99) throw new Error('Chrome DevTools 端口启动超时。');
    await delay(100);
  }

  const errors = [];
  const page = await createPage(port, baseURL, errors);
  assert.equal(await page.evaluate('window.__SHOWTIME__.selfTests.passed'), true);
  assert.equal(await page.evaluate('Boolean(document.querySelector("h1#project-name")?.offsetParent)'), true);

  await page.click('[data-action="open-example-project"]');
  await page.waitFor('window.__SHOWTIME__.workspace.name === "苏轼与北宋背景"', '完整示例加载');
  assert.equal(await page.evaluate('window.__SHOWTIME__.workspace.layers.length'), 6);
  assert.equal(await page.evaluate('window.__SHOWTIME__.workspace.views.length'), 2);

  await page.click('[data-action="load-recommended"]');
  await page.waitFor('document.querySelectorAll("#background-recommendation-dialog .background-recommendation").length > 0', '桌面推荐卡片');
  const firstRecommendation = await page.evaluate(`(() => {
    const card = document.querySelector('#background-recommendation-dialog .background-recommendation');
    return { id: card.dataset.backgroundId, text: card.innerText };
  })()`);
  assert.match(firstRecommendation.text, /时间：.*尺度：.*区域：.*标签：/s);
  await page.click(`[data-background-id="${firstRecommendation.id}"] [data-action="dismiss-background-recommendation"]`);
  assert.equal(await page.evaluate(`document.querySelectorAll('.background-recommendation[data-background-id="${firstRecommendation.id}"]').length`), 0);
  assert.equal(await page.evaluate('!document.querySelector("#reset-background-dismissals").hidden'), true);
  await page.evaluate('document.querySelector("#background-recommendation-dialog").close()');

  let expectedLayerCount = await page.evaluate('window.__SHOWTIME__.workspace.layers.length');
  await page.evaluate(`(() => { document.querySelector('#background-select').value = ${JSON.stringify(firstRecommendation.id)}; document.querySelector('[data-action="load-background"]').click(); })()`);
  expectedLayerCount += 1;
  await page.waitFor(`window.__SHOWTIME__.workspace.layers.length === ${expectedLayerCount}`, '拒绝项仍可手动加载');

  await page.click('[data-action="load-recommended"]');
  await page.waitFor('document.querySelectorAll("#background-recommendation-dialog .background-recommendation").length > 0', '重新计算推荐');
  await page.click('#reset-background-dismissals');
  await page.click('#background-recommendation-dialog .background-recommendation [data-action="load-background-recommendation"]');
  expectedLayerCount += 1;
  await page.waitFor(`window.__SHOWTIME__.workspace.layers.length === ${expectedLayerCount}`, '单层推荐加载');
  await page.evaluate('document.querySelector("#background-recommendation-dialog").close()');

  const viewBeforeSearch = await page.evaluate('({ ...window.__SHOWTIME__.workspace.view })');
  await page.evaluate(`(() => { const input = document.querySelector('#global-search'); input.value = '乌台诗案'; input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await page.waitFor('document.querySelectorAll("#search-results .result-item").length > 0', '搜索结果');
  await page.click('#search-results .result-item');
  assert.match(await page.evaluate('document.querySelector("#event-details").innerText'), /乌台诗案/);
  await page.evaluate(`(() => { const input = document.querySelector('#global-search'); input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await page.waitFor(`window.__SHOWTIME__.workspace.view.start === ${viewBeforeSearch.start} && window.__SHOWTIME__.workspace.view.end === ${viewBeforeSearch.end}`, '搜索前视图恢复');

  await page.pointerClick('#timeline-canvas', 0.55, 80);
  await page.click('[data-action="add-second-probe"]');
  await page.pointerClick('#timeline-canvas', 0.68, 90);
  await page.waitFor('window.__SHOWTIME__.workspace.probes.length === 2', '双时间探针');
  assert.match(await page.evaluate('document.querySelector("#probe-results").innerText'), /两个时点比较/);

  await page.addFiles('#data-files', [{ name: 'single.csv', type: 'text/csv', data: 'time,title\n1080,单文件导入事件' }]);
  expectedLayerCount += 1;
  await page.waitFor(`window.__SHOWTIME__.workspace.layers.length === ${expectedLayerCount}`, '单 CSV 导入');
  await page.addFiles('#data-files', [
    { name: 'multi-a.csv', type: 'text/csv', data: 'time,title\n1081,多文件甲' },
    { name: 'multi-b.csv', type: 'text/csv', data: 'time,title\n1082,多文件乙' },
  ]);
  expectedLayerCount += 2;
  await page.waitFor(`window.__SHOWTIME__.workspace.layers.length === ${expectedLayerCount}`, '多 CSV 导入');
  const legacyZip = createZip([
    { name: '02_context.csv', data: 'time,title\n1069~1085,王安石变法' },
    { name: '01_main.csv', data: 'time,title\n1079,乌台诗案' },
  ]);
  await page.addFiles('#data-files', [{ name: 'legacy.zip', type: 'application/zip', data: legacyZip }]);
  expectedLayerCount += 2;
  await page.waitFor(`window.__SHOWTIME__.workspace.layers.length === ${expectedLayerCount}`, '旧 ZIP 导入');
  assert.match(await page.evaluate('document.querySelector("#quality-results").innerText'), /成功事件/);

  await page.click('[data-action="save-workspace"]');
  await page.waitFor('/保存/.test(document.querySelector("#autosave-status").textContent)', 'IndexedDB 保存');
  await page.send('Page.reload', { ignoreCache: true });
  await page.waitFor(`window.__SHOWTIME__?.workspace?.layers?.length === ${expectedLayerCount}`, 'IndexedDB 重载恢复');
  assert.equal(await page.evaluate('window.__SHOWTIME__.workspace.name'), '苏轼与北宋背景');
  assert.equal(await page.evaluate('window.__SHOWTIME__.selfTests.passed'), true);

  await page.evaluate(`(() => {
    window.__capturedDownloads = [];
    HTMLAnchorElement.prototype.click = function captureDownload() { window.__capturedDownloads.push(this.download || ''); };
  })()`);
  await page.click('[data-action="export-project"]');
  await page.waitFor('window.__capturedDownloads.some((name) => name.endsWith(".showtime.zip"))', '项目包导出');
  await page.click('[data-action="export-svg"]');
  await page.waitFor('window.__capturedDownloads.some((name) => name.endsWith(".svg"))', 'SVG 导出');
  await page.click('[data-action="export-png"]');
  await page.waitFor('window.__capturedDownloads.some((name) => name.endsWith(".png"))', 'PNG 导出');
  await page.click('[data-action="show-statistics-all"]');
  await page.waitFor('/事件记录/.test(document.querySelector("#analysis-results").innerText)', '统计分析');
  if (process.argv[3]) await page.screenshot(process.argv[3]);

  const mobile = await createPage(port, baseURL, errors, true);
  assert.equal(await mobile.evaluate('Boolean(document.querySelector("#global-search")?.offsetParent)'), true);
  assert.equal(await mobile.evaluate('Boolean(document.querySelector("#timeline-canvas")?.offsetParent)'), true);
  assert.equal(await mobile.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), true);
  assert.equal(await mobile.evaluate('document.body.classList.contains("left-collapsed") && document.body.classList.contains("right-collapsed")'), true);
  await mobile.click('[data-action="load-recommended"]');
  await mobile.waitFor('document.querySelectorAll("#background-recommendation-dialog .background-recommendation").length > 0', '390px 推荐卡片');
  assert.equal(await mobile.evaluate(`(() => { const element = document.querySelector('#background-recommendation-dialog .recommendation-actions button'); const rect = element.getBoundingClientRect(); return rect.width > 0 && rect.height > 0; })()`), true);
  assert.equal(await mobile.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), true);
  assert.ok(await mobile.evaluate('document.querySelector("#background-recommendation-dialog").getBoundingClientRect().width') <= 390);
  await mobile.evaluate('document.querySelector("#background-recommendation-dialog").close()');
  if (process.argv[4]) await mobile.screenshot(process.argv[4]);
  await mobile.click('.panel-toggle.left');
  assert.equal(await mobile.evaluate('!document.body.classList.contains("left-collapsed") && document.body.classList.contains("right-collapsed")'), true);
  await mobile.click('.panel-toggle.left');
  await mobile.click('.panel-toggle.right');
  assert.equal(await mobile.evaluate('document.body.classList.contains("left-collapsed") && !document.body.classList.contains("right-collapsed")'), true);
  await mobile.click('.panel-toggle.right');

  mobile.close();
  page.close();
  assert.deepEqual(errors, []);
  console.log('Browser verification passed via Chrome DevTools fallback: explainable recommendations, reject/manual override, desktop imports/search/probes/storage/exports/statistics, self-tests, and 390px touch layout.');
} finally {
  browser.kill('SIGTERM');
}
