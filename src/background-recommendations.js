import { parseTimelineCSV } from './csv.js';
import { formatTimeValue, parseTimeExpression } from './time.js';

const SCALE_ORDER = { 'deep-time': 0, mixed: 1, year: 2 };
const SCALE_LABELS = { 'deep-time': '深时', mixed: '跨时期', year: '年尺度' };

function finiteRange(start, end) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return start <= end ? { start, end } : { start: end, end: start };
}

function eventRange(event) {
  const parsed = event?.rawTime ? parseTimeExpression(event.rawTime) : null;
  return finiteRange(
    Number.isFinite(event?.start) ? event.start : parsed?.start,
    Number.isFinite(event?.end) ? event.end : parsed?.end,
  );
}

export function aggregateEventRange(events = []) {
  let start = Infinity;
  let end = -Infinity;
  for (const event of events || []) {
    const range = eventRange(event);
    if (!range) continue;
    start = Math.min(start, range.start);
    end = Math.max(end, range.end);
  }
  return finiteRange(start, end);
}

export function aggregateWorkspaceRange(workspace) {
  return aggregateEventRange((workspace?.layers || []).flatMap((layer) => layer.events || []));
}

export function indexBackgroundCSV(entry, text, options = {}) {
  const parsed = parseTimelineCSV(text, {
    layerId: entry.id,
    layerName: entry.name,
    fileName: entry.file,
    now: options.now,
  });
  return {
    ...entry,
    timeRange: aggregateEventRange(parsed.events),
    eventCount: parsed.events.length,
    indexIssueCount: parsed.report.issues.filter((issue) => issue.severity === 'error').length,
  };
}

export function inferScale(range) {
  if (!range) return null;
  const span = Math.max(0, range.end - range.start);
  if (span >= 1_000_000) return 'deep-time';
  if (span <= 100) return 'year';
  return 'mixed';
}

export function intersectRanges(left, right) {
  if (!left || !right) return null;
  const start = Math.max(left.start, right.start);
  const end = Math.min(left.end, right.end);
  return start <= end ? { start, end } : null;
}

function normalizeText(value) {
  return String(value ?? '').normalize('NFKC').toLocaleLowerCase().replace(/[_/]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function list(value) {
  if (Array.isArray(value)) return value;
  return value == null || value === '' ? [] : [value];
}

function metadataText(metadata = {}) {
  const sources = (metadata.sources || []).flatMap((source) => [source.source, source.quotation]);
  return [
    metadata.description,
    metadata.location,
    ...list(metadata.locations),
    ...list(metadata.people),
    ...list(metadata.tags),
    metadata.notes,
    ...sources,
  ];
}

export function collectWorkspaceText(workspace) {
  const parts = [workspace?.name, workspace?.topic, workspace?.description, workspace?.references];
  for (const layer of workspace?.layers || []) {
    parts.push(layer.name, layer.file, ...list(layer.tags), ...list(layer.regions));
    for (const event of layer.events || []) parts.push(event.title, ...metadataText(event.metadata));
  }
  return normalizeText(parts.filter(Boolean).join(' '));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countTerm(text, rawTerm) {
  const term = normalizeText(rawTerm);
  if (!term) return 0;
  const asciiOnly = /^[a-z0-9 -]+$/.test(term);
  if (asciiOnly) {
    const expression = new RegExp(`(^|[^a-z0-9])${escapeRegExp(term).replace(/\\ /g, '\\s+')}($|[^a-z0-9])`, 'g');
    return Math.min(3, [...text.matchAll(expression)].length);
  }
  let count = 0;
  let offset = 0;
  while (count < 3) {
    const index = text.indexOf(term, offset);
    if (index < 0) break;
    count += 1;
    offset = index + Math.max(1, term.length);
  }
  return count;
}

function extractFamily(text, values = [], aliases = {}) {
  const signals = {};
  for (const value of values) {
    const terms = new Set([value, String(value).replace(/-/g, ' '), ...(aliases[value] || [])]);
    const score = [...terms].reduce((sum, term) => sum + countTerm(text, term), 0);
    if (score) signals[value] = score;
  }
  return signals;
}

export function extractResearchSignals(workspace, vocabulary = {}, synonyms = {}) {
  const text = collectWorkspaceText(workspace);
  return {
    tags: extractFamily(text, vocabulary.tags, synonyms.tags),
    regions: extractFamily(text, vocabulary.regions, synonyms.regions),
  };
}

function rangeLabel(range) {
  if (!range) return '未知';
  const start = formatTimeValue(range.start);
  const end = formatTimeValue(range.end);
  return range.start === range.end ? start : `${start}～${end}`;
}

function scaleDistance(left, right) {
  if (!(left in SCALE_ORDER) || !(right in SCALE_ORDER)) return null;
  return Math.abs(SCALE_ORDER[left] - SCALE_ORDER[right]);
}

function sortedSignals(signals) {
  return Object.entries(signals).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).map(([value]) => value);
}

function buildReasons(match, entry) {
  const { userRange, overlap, overlapCoverage, userScale, inferredRegions, matchedRegions, matchedTags } = match;
  const time = overlap
    ? `时间：重叠 ${rangeLabel(overlap)}，覆盖专题范围 ${Math.round(overlapCoverage * 100)}%`
    : userRange ? '时间：背景范围不可用' : '时间：专题暂无可聚合事件范围';
  const scale = userScale
    ? `尺度：专题为${SCALE_LABELS[userScale]}，背景为${SCALE_LABELS[entry.scale] || entry.scale}${userScale === entry.scale ? '（一致）' : ''}`
    : `尺度：专题尺度未知，背景为${SCALE_LABELS[entry.scale] || entry.scale}`;
  const region = matchedRegions.length
    ? `区域：匹配 ${matchedRegions.join('、')}`
    : inferredRegions.length && entry.regions?.includes('global')
      ? `区域：全球层可对照 ${inferredRegions.slice(0, 3).join('、')}`
      : inferredRegions.length ? `区域：未直接匹配（专题倾向 ${inferredRegions.slice(0, 3).join('、')}）` : '区域：未推断到明确倾向';
  const tags = matchedTags.length ? `标签：命中 ${matchedTags.join('、')}` : '标签：未命中受控主题词';
  return [time, scale, region, tags];
}

function asSet(values) {
  if (values instanceof Set) return values;
  return new Set(values || []);
}

export function recommendBackgrounds(workspace, backgrounds = [], options = {}) {
  const vocabulary = options.vocabulary || {};
  const synonyms = options.synonyms || {};
  const limit = Math.max(0, Number.isFinite(options.limit) ? options.limit : 5);
  const excludedIds = asSet(options.excludedIds);
  const loadedFiles = new Set((workspace?.layers || []).map((layer) => layer.file).filter(Boolean));
  const userRange = aggregateWorkspaceRange(workspace);
  const userScale = inferScale(userRange);
  const signals = extractResearchSignals(workspace, vocabulary, synonyms);
  const inferredRegions = sortedSignals(signals.regions);
  const inferredTags = sortedSignals(signals.tags);

  if (!userRange && !inferredRegions.length && !inferredTags.length) return [];

  const candidates = [];
  for (const entry of backgrounds || []) {
    if (!entry?.id || loadedFiles.has(entry.file) || excludedIds.has(entry.id)) continue;
    const backgroundRange = finiteRange(entry.timeRange?.start, entry.timeRange?.end);
    const overlap = intersectRanges(userRange, backgroundRange);
    if (userRange && (!backgroundRange || !overlap)) continue;

    const distance = scaleDistance(userScale, entry.scale);
    if (distance != null && distance >= 2) continue;

    let score = 0;
    let overlapCoverage = 0;
    if (userRange && overlap) {
      const userSpan = userRange.end - userRange.start;
      const backgroundSpan = backgroundRange.end - backgroundRange.start;
      const overlapSpan = overlap.end - overlap.start;
      overlapCoverage = userSpan === 0 ? 1 : Math.min(1, overlapSpan / userSpan);
      const specificity = userSpan === 0
        ? 1 / Math.max(1, backgroundSpan + 1)
        : overlapSpan / Math.max(userSpan, backgroundSpan, 1e-9);
      score += overlapCoverage * 48 + specificity * 12;
    }

    if (distance === 0) score += 18;
    else if (distance === 1) score += 5;

    const matchedRegions = (entry.regions || []).filter((region) => region !== 'global' && signals.regions[region]);
    if (matchedRegions.length) {
      score += Math.min(24, matchedRegions.reduce((sum, region) => sum + 8 + Math.min(4, signals.regions[region]), 0));
    } else if (inferredRegions.length && entry.regions?.includes('global')) score += 2;

    const matchedTags = (entry.tags || []).filter((tag) => signals.tags[tag]);
    score += Math.min(32, matchedTags.reduce((sum, tag) => sum + 6 + Math.min(4, signals.tags[tag]), 0));

    const match = {
      userRange,
      backgroundRange,
      overlap,
      overlapCoverage,
      userScale,
      backgroundScale: entry.scale,
      inferredRegions,
      matchedRegions,
      inferredTags,
      matchedTags,
    };
    candidates.push({ ...entry, score: Number(score.toFixed(3)), match, reasons: buildReasons(match, entry) });
  }

  return candidates
    .sort((left, right) => right.score - left.score
      || right.match.matchedRegions.length - left.match.matchedRegions.length
      || right.match.matchedTags.length - left.match.matchedTags.length
      || left.name.localeCompare(right.name, 'zh-CN'))
    .slice(0, limit);
}
