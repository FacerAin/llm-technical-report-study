#!/usr/bin/env node
/** Render a reading-map Markdown into the paged HTML shell. One H3 = one page. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node render_reading_map.mjs input.md output.html [--title "Title"]');
  process.exit(1);
}
const input = path.resolve(args[0]), output = path.resolve(args[1]);
const explicitTitle = args.includes('--title') ? args[args.indexOf('--title') + 1] : null;
let moduleName = process.env.MARKED_MODULE || 'marked';
if (path.isAbsolute(moduleName)) {
  if (fs.statSync(moduleName).isDirectory()) {
    const pkg = JSON.parse(fs.readFileSync(path.join(moduleName, 'package.json'), 'utf8'));
    moduleName = path.join(moduleName, pkg.module || pkg.main);
  }
  moduleName = pathToFileURL(moduleName).href;
}
const {Marked} = await import(moduleName);
const md = new Marked({gfm: true, breaks: false});

const PARTS = ['overview', 'architecture', 'data', 'post', 'alignment', 'background', 'common'];
const LABELS = {overview: '한눈에 보기', architecture: 'Architecture & Pre-training', data: 'Data & Synthesis',
  post: 'Post-training', alignment: 'Alignment & RL', background: 'Background', common: '검토 기록'};
const escape = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const plain = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');

const source = fs.readFileSync(input, 'utf8');
const tokens = md.lexer(source);
// Relative file links are rebased when the HTML is written to another folder.
md.walkTokens(tokens, token => {
  if (!['link', 'image'].includes(token.type) || /^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(token.href)) return;
  const [, file, rest] = /^([^?#]*)(.*)$/.exec(token.href);
  const target = path.resolve(path.dirname(input), decodeURIComponent(file));
  token.href = path.relative(path.dirname(output), target).split(path.sep).map(encodeURIComponent).join('/') + rest;
});

const h1 = tokens.find(t => t.type === 'heading' && t.depth === 1);
const title = explicitTitle || (h1 ? plain(md.parseInline(h1.text)) : path.basename(input, '.md'));
const isComment = t => t.type === 'html' && /^\s*<!--[\s\S]*?-->\s*$/.test(t.raw);
const isAnchor = t => ['html', 'paragraph'].includes(t.type) && /^\s*(?:<a\s+id=["'][^"']+["']\s*><\/a>\s*)+$/.test(t.raw);
const meaningful = list => list.some(t => t.type !== 'space' && !isComment(t) && !isAnchor(t));

const pages = [];
let part = 'common', group = null, page = null;
const usedIds = new Set([...source.matchAll(/<a\s+id=["']([^"']+)["']/g)].map(m => m[1]));
const pageId = n => { let id = 'p' + n; while (usedIds.has(id)) id += '-x'; usedIds.add(id); return id; };
const startPage = (name, carried = []) => {
  page = {part, group, title: name, tokens: [...carried]};
  pages.push(page);
};
for (const token of tokens) {
  if (token === h1) continue;
  const marker = isComment(token) && /<!--\s*part:\s*([a-z]+)\s*-->/i.exec(token.raw);
  if (marker) {
    const name = marker[1].toLowerCase();
    if (!PARTS.includes(name)) throw new Error(`Unknown part marker: ${name}`);
    part = name; page = null; continue;
  }
  if (token.type === 'heading' && token.depth === 2) {
    group = plain(md.parseInline(token.text)); page = null; continue;
  }
  if (token.type === 'heading' && token.depth === 3) {
    // Anchors written just before the H3 belong to the new page.
    const carried = [];
    while (page && page.tokens.length && (isAnchor(page.tokens.at(-1)) || page.tokens.at(-1).type === 'space')) carried.unshift(page.tokens.pop());
    startPage(plain(md.parseInline(token.text)), carried);
    continue;
  }
  if (!page) {
    if (token.type === 'space' || isComment(token)) continue;
    startPage(group || title);
  }
  page.tokens.push(token);
}
const visible = pages.filter(p => meaningful(p.tokens));
if (!visible.length) throw new Error('No reading-map pages found. Each page needs an H3 heading and content.');

const renderTokens = list => {
  const copy = list.filter(t => !isComment(t));
  copy.links = tokens.links;
  return md.parser(copy).replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, '</table></div>');
};
const kindOf = p => {
  if (/질문/.test(p.title) && p.part !== 'overview') return 'questions';
  if (p.tokens.some(isAnchor) && p.part !== 'overview' && p.part !== 'common') return 'concept';
  return 'text';
};
const totals = Object.fromEntries(PARTS.map(k => [k, visible.filter(p => p.part === k).length]));
const seen = {};
const body = visible.map((p, i) => {
  const n = seen[p.part] = (seen[p.part] || 0) + 1;
  return `<section class="paper-page" id="${pageId(i + 1)}" data-part="${p.part}" data-kind="${kindOf(p)}" data-page-title="${escape(p.title)}">` +
    `<div class="eyebrow"><b>${escape(LABELS[p.part])}</b> · ${n} / ${totals[p.part]}</div>` +
    `<h2>${escape(p.title)}</h2><div class="body">${renderTokens(p.tokens)}</div></section>`;
}).join('\n');

const here = path.dirname(fileURLToPath(import.meta.url));
let shell = fs.readFileSync(path.join(here, '../assets/reading-map-shell.html'), 'utf8');
const sourceHref = path.relative(path.dirname(output), input).split(path.sep).map(encodeURIComponent).join('/');
const slots = [
  [/<title data-reading-map-title>[^<]*<\/title>/, `<title>${escape(title)}</title>`],
  [/<h1 class="ttl" data-reading-map-title>[^<]*<\/h1>/, `<h1 class="ttl">${escape(title)}</h1>`],
  [/<a class="source-link" data-reading-map-source href="[^"]*">[^<]*<\/a>/, `<a class="source-link" href="${escape(sourceHref)}">Markdown ↗</a>`],
  [/<!-- READING_MAP_BODY -->[\s\S]*<!-- \/READING_MAP_BODY -->/, body],
];
for (const [pattern, value] of slots) {
  if (!pattern.test(shell)) throw new Error('Reading-map shell is missing a required content slot.');
  shell = shell.replace(pattern, () => value);
}
// Every in-page link must reach an id that exists in the output.
const ids = new Set([...shell.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
const missing = [...new Set([...body.matchAll(/href="#([^"]+)"/g)].map(m => decodeURIComponent(m[1])))].filter(id => !ids.has(id));
if (missing.length) throw new Error(`Links point to missing anchors: ${missing.join(', ')}`);
fs.mkdirSync(path.dirname(output), {recursive: true});
fs.writeFileSync(output, shell);
console.log(`${output}: ${visible.length} pages ${JSON.stringify(Object.fromEntries(Object.entries(totals).filter(([, v]) => v)))}`);
