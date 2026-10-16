# 논문 읽기·발표 스킬

| 순서 | 스킬 | 결과 |
| --- | --- | --- |
| Skills 1 · [#170](https://github.com/Pseudo-Lab/llm-technical-report-study/issues/170) | [extract-paper-parts](extract-paper-parts/SKILL.md) | 원문 근거를 다섯 PART로 묶은 Markdown·HTML 읽기 지도 |
| Skills 2 · [#169](https://github.com/Pseudo-Lab/llm-technical-report-study/issues/169) | [create-paper-presentation](create-paper-presentation/SKILL.md) | 검토된 분석에서 구성한 HTML 발표자료와 화면 검토 피드백 |

추출 → 사람의 범위·근거 검토 → 발표자료 제작 순으로 사용한다. 검토 전 초안을 요청받으면 검토 상태를 명시한다. 두 스킬은 원래 파트와 목차, 원문 근거, 실험 조건과 불확실성을 유지하며 담당 범위나 공식 학습목표를 임의로 확정하지 않는다.

읽기 지도는 다섯 PART를 선택하고 해당 PART 안에서 한 페이지씩 넘긴다. 첫 화면부터 하단 이동 버튼을 표시하며, K/E 근거 링크는 해당 PART와 페이지를 함께 연다. [읽기 화면 양식](extract-paper-parts/assets/reading-map-shell.html)을 브라우저에서 직접 열면 동작하는 미리보기를 볼 수 있다.

## 실행

아래 명령은 저장소 루트에서 실행한다. Markdown 렌더러에는 Node.js와 `marked`, 발표자료 생성기에는 Python 3, 브라우저 검사기에는 Node.js와 Playwright 및 Chromium이 필요하다. 생성된 HTML은 별도 서버 없이 브라우저에서 열 수 있다.

```sh
# Skills 1: 작성한 Markdown으로 읽기 화면 생성
node skills/extract-paper-parts/scripts/render_reading_map.mjs input.md output.html
node skills/extract-paper-parts/scripts/test_render_reading_map.mjs

# Skills 2: 포함된 3장 예시로 발표자료 생성·검사
python3 skills/create-paper-presentation/scripts/build_deck.py \
  skills/create-paper-presentation/assets/example-slides.json /tmp/paper-example.html
node skills/create-paper-presentation/scripts/check_deck.cjs \
  /tmp/paper-example.html /tmp/paper-example-check
```

기본 모듈 탐색이 안 되면 `MARKED_MODULE` 또는 `PLAYWRIGHT_MODULE`에 설치된 모듈 경로를 지정한다. Playwright의 기본 브라우저가 없으면 `CHROME_PATH`에 Chrome 실행 파일 경로를 지정할 수 있다. 구체적인 입력 양식과 검토 절차는 각 `SKILL.md`를 따른다. 브라우저 검사는 화면·이동·로컬 링크를 확인하며 원문 사실성이나 사람의 이해도를 대신 검증하지 않는다.
