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

function renderFile(input, name) {
  const output = path.join(temporary, 'rendered', name + '.html');
  execFileSync(process.execPath, [renderer, input, output], {
    env: process.env,
    encoding: 'utf8',
  });
  const html = fs.readFileSync(output, 'utf8');
  const pages = [...html.matchAll(/<section class="paper-page"([^>]*)>([\s\S]*?)<\/section>/g)]
    .map(([, attributes, body]) => ({
      part: /data-part="([^"]+)"/.exec(attributes)?.[1],
      title: /data-page-title="([^"]+)"/.exec(attributes)?.[1],
      section: /data-section="([^"]+)"/.exec(attributes)?.[1],
      body,
    }));
  assert.ok(pages.length, 'The renderer must produce reading pages.');
  return {html, pages};
}

function renderMarkdown(markdown, name) {
  const input = path.join(temporary, name + '.md');
  fs.writeFileSync(input, markdown);
  return renderFile(input, name);
}

function anchoredPage(pages, id) {
  const matching = pages.filter(page => page.body.includes(`id="${id}"`));
  assert.equal(matching.length, 1, `Anchor ${id} must occur on exactly one page.`);
  return matching[0];
}

test('the supplied template keeps each PART scope and workload in that PART', () => {
  const {pages} = renderFile(path.join(here, '../assets/reading-map-template.md'), 'template');
  const scopes = pages.filter(page => page.title === '범위·분량과 상대 부담');
  assert.equal(scopes.length, 5);
  const expected = {
    'Architecture &amp; Pre-training': 'architecture',
    'Data &amp; Synthesis': 'data',
    'Post-training': 'post',
    'Alignment &amp; RL': 'alignment',
    Background: 'background',
  };
  for (const [section, part] of Object.entries(expected)) {
    assert.equal(scopes.find(page => page.section === section)?.part, part,
      `${section} must retain its scope and workload page.`);
  }
});

test('an explicit common section keeps aggregate rows that name individual PARTs', () => {
  const {pages} = renderMarkdown(`# 공통 집계 사례

<!-- part: common -->
## 전체 집계와 범위 조정

| 문제 | 유지할 목표 | 결정 |
| --- | --- | --- |
| Architecture & Pre-training | 구조 목표 유지 | 사람 검토 대기 |
| Alignment & RL | 보상 목표 유지 | 사람 검토 대기 |

- 사람 검토: 미검토
`, 'common');
  assert.ok(pages.every(page => page.part === 'common'),
    'Part names inside a common aggregate must not move its rows to another PART.');
  const body = pages.map(page => page.body).join('\n');
  assert.ok(body.includes('구조 목표 유지'));
  assert.ok(body.includes('보상 목표 유지'));
  assert.ok(body.includes('사람 검토: 미검토'));
});

test('legacy documents still recognize owners with and without colons', () => {
  const {pages} = renderMarkdown(`# 기존 문서 사례

## 핵심 주제와 원문 근거

<a id="k01"></a>

### K01 — 구조
- 목표: G1; 주관: Architecture & Pre-training; 공동 참조: Background
- 원문 근거: 구조가 계승되었다.

<a id="k02"></a>

### K02 — 데이터
- 목표 G2; 주관 Data & Synthesis; 공동 참조 Post-training
- 원문 근거: 데이터 조성은 미공개이다.

## 외부 배경 원전

<a id="e01"></a>

### E01 — 선수 개념
- 주관: Background; 공동 참조: Architecture & Pre-training
- 원전 확인 상태: 확인 필요
`, 'legacy');
  assert.equal(anchoredPage(pages, 'k01').part, 'architecture');
  assert.equal(anchoredPage(pages, 'k02').part, 'data');
  assert.equal(anchoredPage(pages, 'e01').part, 'background');
});

test('pagination preserves source statements, unique anchors, and evidence links', () => {
  const statements = Array.from({length: 9}, (_, i) =>
    `보존 문장 ${i + 1}: ${'조건과 대상 단계를 유지한다. '.repeat(12).trim()}`);
  const {html, pages} = renderMarkdown(`# 내용 보존 사례

<!-- part: architecture -->
## 구조 담당

<a id="k01"></a>

### K01 — 조건부 근거
- 주관: Architecture & Pre-training; 공동 참조: Background
${statements.map(statement => '- ' + statement).join('\n')}

원문은 [정확한 판본](https://example.com/paper?v=2#sec-3), 배경은 [E01](#e01), 관련 파일은 [근거](자료/근거.md)를 확인한다.

<!-- part: background -->
## 배경 담당

<a id="e01"></a>

### E01 — 외부 원전
- 주관: Background; 공동 참조: Architecture & Pre-training
- 원전 미확인: 확인 필요이며 미수행으로 단정하지 않는다.

<!-- part: architecture -->
## 구조 추가 읽기

### 공백과 읽기 계획
- 사람 검토: 미검토
- 앞의 [K01](#k01) 조건을 유지한다.
`, 'preservation');
  const architecture = pages.filter(page => page.part === 'architecture');
  assert.ok(architecture.length > 2, 'Long evidence must be split across multiple pages.');
  for (const statement of statements) {
    assert.equal(architecture.filter(page => page.body.includes(statement)).length, 1,
      'Every original statement must survive on exactly one page.');
  }
  assert.equal(anchoredPage(pages, 'k01').part, 'architecture');
  assert.equal(anchoredPage(pages, 'e01').part, 'background');
  assert.ok(html.includes('href="https://example.com/paper?v=2#sec-3"'));
  assert.ok(html.includes('href="#k01"'));
  assert.ok(html.includes('href="#e01"'));
  assert.ok(html.includes(`href="../${encodeURIComponent('자료')}/${encodeURIComponent('근거.md')}"`));
  assert.ok(pages.find(page => page.section === '구조 추가 읽기')?.body.includes('사람 검토: 미검토'));
  assert.ok(anchoredPage(pages, 'e01').body.includes('원전 미확인: 확인 필요이며 미수행으로 단정하지 않는다.'));
});
