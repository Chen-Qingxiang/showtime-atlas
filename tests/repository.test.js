import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { parseCSVLine, parseTimelineCSV } from '../src/csv.js';

test('背景 manifest、受控词表与仓库 CSV 保持完整一致', async () => {
  const manifest = JSON.parse(await readFile(new URL('../background/manifest.json', import.meta.url), 'utf8'));
  const vocabulary = JSON.parse(await readFile(new URL('../background/vocabulary.json', import.meta.url), 'utf8'));
  const synonyms = JSON.parse(await readFile(new URL('../background/synonyms.json', import.meta.url), 'utf8'));
  const files = (await readdir(new URL('../background/', import.meta.url))).filter((name) => name.endsWith('.csv'));
  const ids = new Set();
  const referencedFiles = new Set();

  assert.equal(manifest.length, files.length);
  assert.equal(new Set(vocabulary.tags).size, vocabulary.tags.length);
  assert.equal(new Set(vocabulary.regions).size, vocabulary.regions.length);
  assert.ok(Object.keys(synonyms.tags).every((tag) => vocabulary.tags.includes(tag)), '同义词文件含未登记 tag');
  assert.ok(Object.keys(synonyms.regions).every((region) => vocabulary.regions.includes(region)), '同义词文件含未登记 region');
  assert.ok(Object.values(synonyms.tags).every((aliases) => Array.isArray(aliases) && aliases.every((alias) => typeof alias === 'string' && alias.trim())), 'tag 同义词必须是非空字符串数组');
  assert.ok(Object.values(synonyms.regions).every((aliases) => Array.isArray(aliases) && aliases.every((alias) => typeof alias === 'string' && alias.trim())), 'region 同义词必须是非空字符串数组');

  for (const entry of manifest) {
    assert.match(entry.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${entry.id}: id 必须使用 kebab-case`);
    assert.ok(entry.name, `${entry.id}: name 不能为空`);
    assert.ok(!ids.has(entry.id), `${entry.id}: id 重复`);
    assert.ok(!referencedFiles.has(entry.file), `${entry.id}: file 重复`);
    ids.add(entry.id);
    referencedFiles.add(entry.file);

    assert.ok(entry.file.startsWith('background/'), `${entry.id}: file 必须是 background/ 相对路径`);
    assert.ok(files.includes(entry.file.slice('background/'.length)), `${entry.id}: CSV 不存在`);
    assert.ok(Array.isArray(entry.tags) && entry.tags.length > 0, `${entry.id}: tags 不能为空`);
    assert.ok(Array.isArray(entry.regions) && entry.regions.length > 0, `${entry.id}: regions 不能为空`);
    assert.ok(entry.tags.every((tag) => vocabulary.tags.includes(tag)), `${entry.id}: 含未登记 tag`);
    assert.ok(entry.regions.every((region) => vocabulary.regions.includes(region)), `${entry.id}: 含未登记 region`);
    assert.ok(vocabulary.scales.includes(entry.scale), `${entry.id}: scale 非法`);
    assert.ok(vocabulary.densities.includes(entry.density), `${entry.id}: density 非法`);

    const text = await readFile(new URL(`../${entry.file}`, import.meta.url), 'utf8');
    assert.match(text, /^# time,title(?:\r?\n|\r)/, `${entry.id}: 缺少两列注释头`);
    assert.match(text, /^# 来源框架：/m, `${entry.id}: 缺少来源框架`);
    assert.match(text, /^# 用于研究定位与比较，不是权威或完整年表/m, `${entry.id}: 缺少研究边界声明`);

    const dataLines = text.split(/\r\n|\n|\r/).filter((line) => line.trim() && !line.trim().startsWith('#'));
    for (const line of dataLines) {
      const parsed = parseCSVLine(line);
      assert.equal(parsed.unclosedQuote, false, `${entry.id}: 引号未闭合`);
      assert.equal(parsed.fields.length, 2, `${entry.id}: 数据行必须严格两列`);
    }

    const result = parseTimelineCSV(text, { layerId: entry.id, layerName: entry.name, fileName: entry.file });
    const blocking = result.report.issues.filter((issue) => !['open_interval', 'mixed_precision'].includes(issue.type));
    assert.deepEqual(blocking, [], `${entry.id}: CSV 含阻断或质量漂移`);
    assert.ok(result.events.length >= 8, `${entry.id}: 少于 8 条，无法构成研究定向层`);
    if (entry.density !== 'high') assert.ok(result.events.length <= 40, `${entry.id}: 超过低/中密度上限`);
  }

  assert.deepEqual([...files].sort(), [...referencedFiles].map((file) => file.slice('background/'.length)).sort());
});

test('Manifest schema 与 fixture Manifest 都是有效 JSON', async () => {
  const schema = JSON.parse(await readFile(new URL('../docs/manifest.schema.json', import.meta.url), 'utf8'));
  const fixture = JSON.parse(await readFile(new URL('../examples/苏轼与北宋背景.showtime/00_manifest.json', import.meta.url), 'utf8'));
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(fixture.format, 'showtime-project');
  assert.equal(fixture.version, '1.0');
  assert.ok(fixture.layers.some((layer) => layer.lod?.level === 'overview'));
  assert.ok(fixture.layers.some((layer) => layer.lod?.level === 'detailed'));
});

test('新模块中没有阻断主流程的 TODO 或占位异常', async () => {
  const names = (await readdir(new URL('../src/', import.meta.url))).filter((name) => name.endsWith('.js'));
  const source = (await Promise.all(names.map((name) => readFile(new URL(`../src/${name}`, import.meta.url), 'utf8')))).join('\n');
  assert.equal(/\bTODO\b|not implemented|暂未实现/i.test(source), false);
});
