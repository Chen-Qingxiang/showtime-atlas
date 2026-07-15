import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateWorkspaceRange,
  indexBackgroundCSV,
  inferScale,
  recommendBackgrounds,
} from '../src/background-recommendations.js';

const vocabulary = {
  tags: ['china', 'literature', 'politics'],
  regions: ['china', 'europe', 'global'],
};
const synonyms = {
  tags: { china: ['中国', '北宋'], literature: ['文学', '诗词'], politics: ['政治'] },
  regions: { china: ['中国', '北宋'], europe: ['欧洲'], global: ['全球'] },
};

function workspace(rawTime = '1900~1950', input = {}) {
  return {
    name: input.name || '专题研究',
    topic: input.topic || '',
    description: input.description || '',
    layers: rawTime ? [{
      id: 'primary',
      name: input.layerName || '主线',
      file: input.file || 'primary.csv',
      events: [{ rawTime, title: input.title || '专题事件', metadata: input.metadata || {} }],
    }] : [],
  };
}

function background(id, input = {}) {
  return {
    id,
    name: input.name || id,
    file: input.file || `background/${id}.csv`,
    tags: input.tags || [],
    regions: input.regions || ['global'],
    scale: input.scale || 'year',
    density: 'medium',
    timeRange: input.timeRange || { start: 1800, end: 2000 },
  };
}

test('聚合所有用户图层时间并按跨度推断尺度', () => {
  const value = workspace(null);
  value.layers = [
    { events: [{ rawTime: '公元前500~公元前400', title: '早期' }] },
    { events: [{ start: 1900, end: 1950, title: '晚期' }] },
  ];
  assert.deepEqual(aggregateWorkspaceRange(value), { start: -499, end: 1950 });
  assert.equal(inferScale({ start: 1900, end: 1950 }), 'year');
  assert.equal(inferScale({ start: -500, end: 1950 }), 'mixed');
  assert.equal(inferScale({ start: -13_800_000_000, end: 0 }), 'deep-time');
});

test('背景 CSV 索引复用既有解析器并生成范围', () => {
  const indexed = indexBackgroundCSV(background('indexed'), '# time,title\n# 测试\n1200~1250,阶段一\n1300,阶段二');
  assert.deepEqual(indexed.timeRange, { start: 1200, end: 1300 });
  assert.equal(indexed.eventCount, 2);
  assert.equal(indexed.indexIssueCount, 0);
});

test('不重叠的背景层不会进入推荐', () => {
  const recommendations = recommendBackgrounds(workspace('1900~1950'), [
    background('overlap', { timeRange: { start: 1800, end: 2000 } }),
    background('future', { timeRange: { start: 2100, end: 2200 } }),
  ], { vocabulary, synonyms });
  assert.deepEqual(recommendations.map((entry) => entry.id), ['overlap']);
});

test('时间条件相同时优先推荐同尺度背景', () => {
  const recommendations = recommendBackgrounds(workspace('1900~1950'), [
    background('mixed', { scale: 'mixed' }),
    background('same-scale', { scale: 'year' }),
  ], { vocabulary, synonyms });
  assert.equal(recommendations[0].id, 'same-scale');
  assert.ok(recommendations[0].score > recommendations[1].score);
});

test('区域倾向是软加权并保留全局候选', () => {
  const research = workspace('1000~1100', { topic: '北宋文学与政治', title: '中国诗词研究' });
  const recommendations = recommendBackgrounds(research, [
    background('europe', { regions: ['europe'], timeRange: { start: 900, end: 1200 }, tags: ['literature'] }),
    background('global', { regions: ['global'], timeRange: { start: 900, end: 1200 }, tags: ['literature'] }),
    background('china', { regions: ['china'], timeRange: { start: 900, end: 1200 }, tags: ['literature'] }),
  ], { vocabulary, synonyms });
  assert.equal(recommendations[0].id, 'china');
  assert.ok(recommendations.some((entry) => entry.id === 'global'));
  assert.ok(recommendations.find((entry) => entry.id === 'china').match.matchedRegions.includes('china'));
});

test('推荐结果携带时间、尺度、区域与标签四类解释', () => {
  const [recommendation] = recommendBackgrounds(
    workspace('1000~1100', { topic: '北宋文学', title: '诗词' }),
    [background('china-literature', { regions: ['china'], tags: ['china', 'literature'], timeRange: { start: 900, end: 1200 } })],
    { vocabulary, synonyms },
  );
  assert.equal(recommendation.reasons.length, 4);
  assert.deepEqual(recommendation.reasons.map((reason) => reason.split('：')[0]), ['时间', '尺度', '区域', '标签']);
  assert.deepEqual(recommendation.match.matchedTags, ['china', 'literature']);
});

test('空数据不崩溃，已加载、已拒绝和尺度悬殊候选被排除', () => {
  assert.deepEqual(recommendBackgrounds({ name: '', topic: '', description: '', layers: [] }, [], { vocabulary, synonyms }), []);

  const research = workspace('1900~1950', { file: 'background/loaded.csv' });
  const recommendations = recommendBackgrounds(research, [
    background('loaded', { file: 'background/loaded.csv' }),
    background('dismissed'),
    background('deep', { scale: 'deep-time', timeRange: { start: -1_000_000, end: 2000 } }),
    background('kept'),
  ], { vocabulary, synonyms, excludedIds: new Set(['dismissed']) });
  assert.deepEqual(recommendations.map((entry) => entry.id), ['kept']);
});
