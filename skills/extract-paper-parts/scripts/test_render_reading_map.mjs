#!/usr/bin/env node
/** Run with Node.js; MARKED_MODULE is inherited by the real renderer. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {after, test} from 'node:test';

const here = path.dirname(fileURLToPath(import.meta.url));
const renderer = path.join(here, 'render_reading_map.mjs');
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'reading-map-test-'));
after(() => fs.rmSync(temporary, {recursive: true, force: true}));

function render(markdown, name) {
  const input = path.join(temporary, name + '.md');
  const output = path.join(temporary, 'out', name + '.html');
  fs.writeFileSync(input, markdown);
  execFileSync(process.execPath, [renderer, input, output], {env: process.env, encoding: 'utf8', stdio: 'pipe'});
  const html = fs.readFileSync(output, 'utf8');
  const pages = [...html.matchAll(/<section class="paper-page"([^>]*)>([\s\S]*?)<\/section>/g)].map(([, attrs, body]) => ({
    part: /data-part="([^"]+)"/.exec(attrs)[1],
    kind: /data-kind="([^"]+)"/.exec(attrs)[1],
    title: /data-page-title="([^"]+)"/.exec(attrs)[1],
    body,
  }));
  return {html, pages};
}

const sample = `# 예시 — 다섯 파트 읽기 지도

<!-- part: overview -->
## 한눈에 보기

### 다섯 파트가 다루는 내용

| 파트 | 내용 | 분량 |
| --- | --- | --- |
| Architecture & Pre-training | 블록 | ■■■□□ 중간 |

### 분량과 함께 할 파트

- Post와 Alignment를 함께 준비한다.

<!-- part: architecture -->
## Architecture & Pre-training

### 이 파트의 질문

- **RQ1. 블록은 무엇이 다른가?**
  - 개념: [RMSNorm](#c-rmsnorm)

<a id="c-rmsnorm"></a>

### RMSNorm

- **무엇인가:** 평균을 빼지 않는 정규화.
- **설명할 수 있어야 하는 것:**
  - [ ] LayerNorm과 차이

<!-- part: background -->
## Background

### 이번에 새로 채울 빈 영역

| 개념 | 처음 나온 논문 |
| --- | --- |
| [RMSNorm](#c-rmsnorm) | Zhang & Sennrich 2019 |
`;

test('each H3 becomes one page in its marked part, in source order', () => {
  const {pages} = render(sample, 'basic');
  assert.deepEqual(pages.map(p => [p.part, p.title]), [
    ['overview', '다섯 파트가 다루는 내용'],
    ['overview', '분량과 함께 할 파트'],
    ['architecture', '이 파트의 질문'],
    ['architecture', 'RMSNorm'],
    ['background', '이번에 새로 채울 빈 영역'],
  ]);
});

test('concept anchors move onto the concept page and links resolve', () => {
  const {pages, html} = render(sample, 'anchors');
  const concept = pages.find(p => p.title === 'RMSNorm');
  assert.equal(concept.kind, 'concept');
  assert.match(concept.body, /<a id="c-rmsnorm"><\/a>/);
  assert.equal(pages.find(p => p.title === '이 파트의 질문').kind, 'questions');
  assert.doesNotMatch(pages.find(p => p.title === '이 파트의 질문').body, /id="c-rmsnorm"/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /<div class="table-scroll"><table>/);
  assert.doesNotMatch(html, /preview-overview/, 'shell preview pages are replaced');
});

test('a link to a missing concept fails the render', () => {
  assert.throws(() => render(sample.replace('(#c-rmsnorm) | Zhang', '(#c-missing) | Zhang'), 'missing'), /missing anchors: c-missing/);
});

test('an unknown part marker fails the render', () => {
  assert.throws(() => render(sample.replace('part: background', 'part: misc'), 'marker'), /Unknown part marker/);
});

test('the bundled template renders', () => {
  const template = fs.readFileSync(path.join(here, '../assets/reading-map-template.md'), 'utf8')
    .replace(/\(#c-\{slug\}\)/g, '(#c-slug)').replace(/<a id="c-\{slug\}"><\/a>/g, '<a id="c-slug"></a>');
  const {pages} = render(template, 'template');
  assert.deepEqual([...new Set(pages.map(p => p.part))], ['overview', 'architecture', 'data', 'post', 'alignment', 'background', 'common']);
});
