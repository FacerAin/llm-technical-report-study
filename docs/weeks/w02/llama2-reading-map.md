# Llama 2 (arXiv:2307.09288v2) — 다섯 파트 읽기 지도

<!-- 원문 링크는 arXiv v2 PDF의 파일 페이지 기준이다(본문에서 확인한 페이지는 인쇄 쪽수와 같다). H3 하나가 HTML 한 페이지다. -->

<!-- part: overview -->
## 한눈에 보기

### 다섯 파트가 다루는 내용

Llama 2는 **LLaMA 1의 사전학습 recipe를 거의 그대로 두고, 그 위에 사람 선호로 학습한 reward model과 반복 RLHF를 얹어 공개 chat 모델을 만들 수 있는가**를 묻습니다. 사전학습(§2)은 짧고, 원문의 무게는 후학습(§3)과 안전(§4), 그리고 그 근거를 담은 부록 A.2–A.4에 있습니다.

| 파트 | 이번 논문에서 다루는 내용 | 필수 원문 | 개념 | 분량 |
| --- | --- | --- | --- | --- |
| Architecture & Pre-training (이경민 · 임수민 · 우성현) | LLaMA 1에서 **유지한 것과 바꾼 것**(4K context · 34B/70B GQA), GQA가 KV cache를 얼마나 줄이는지 계산, optimizer 설정의 출처, 2T 토큰 학습의 하드웨어 · MFU · 탄소, 기반 모델 평가(새 벤치마크 · 채점 · 오염 분석) | §2 · Table 1–4 · Fig. 5 · App. A.2 · A.6 · Table 16–25 · 51 | 19개 | ■■■■■ 높음 |
| Data & Synthesis (정호찬 · 김대규) | 공개되지 않은 사전학습 혼합과 그 대신 공개된 분석(언어 · 인구 표현 · 독성), SFT 27,540개, 선호 데이터 141만 비교의 수집 절차 · 단위 · 주간 batch, 공개 선호 데이터셋 6종, 적대적 prompt 설계 | §2.1 · §3.1 · §3.2.1 · §4.1 · §4.2.1 · Table 5–6 · 9–10 · 26 · App. A.3.1–A.3.2 | 12개 | ■■■■□ 중간–높음 |
| Post-training (정지원 · 임병극 · 송용우) | 답 토큰에만 loss를 거는 SFT, rejection sampling으로 고른 답을 다시 학습하는 단계와 70B→작은 모델 증류, 여러 턴 지시를 지키게 하는 GAtt, 안전 context distillation | §3.1 · §3.2.3(RS) · §3.3 · §4.2.2 · §4.2.4 · Fig. 7–10 · 16 · Table 13 · 30 | 12개 | ■■■□□ 중간 |
| Alignment & RL (김민제 · 강민우) | 선호 쌍 → ranking loss · rating margin → 두 개의 RM, RLHF V1–V5에서 RS와 PPO의 결합, 조건부 reward · whitening · KL, PPO 설정을 InstructGPT와 비교, RM · GPT-4 · 사람 평가, 안전 RLHF와 false refusal | §3.2.2–§3.2.3 · §3.4 · §4.2.3 · Eq. (1)–(4) · Table 7–8 · Fig. 6 · 11–12 · 14–15 · App. A.3.3–A.3.7 · A.4.1 | 17개 | ■■■■■ 높음 |
| Background + Others (이정민 · 김민선) | W01 이후 새로 필요한 RLHF 배경(InstructGPT 골격 · Bradley–Terry · PPO clip)과 빈 영역 표, **Others**: 안전 벤치마크 · red teaming · 안전 사람 평가 · §5의 관찰 · 한계 · 공개 전략 | §4.1 안전 벤치마크 · §4.3–§4.4 · §5 · App. A.4.7 · A.7 + 원전 4편의 지정 절 | 9개 + 빈 영역 22개 | ■■■□□ 중간 |

분량 = 개념 수 + 필수 원문 분량. 원문 본문은 약 31쪽(PDF p.5–35)이고 부록이 42쪽입니다. 필수 원문만 세면 Alignment가 약 15쪽(p.10–19 · 24–28 · 51–58)으로 가장 길고, Architecture는 본문 4쪽에 부록 표가 많습니다(p.5–8 · 47–51 · 75–76). Data와 Post-training은 각각 약 9–10쪽입니다.

### 분량과 함께 할 파트

- **분량 차이:** Architecture(19개, 그중 평가 7개)와 Alignment(17개, 수식 4개)가 무겁고 Alignment는 담당이 2명입니다. Post-training은 담당이 3명이고 원문이 상대적으로 짧습니다.
- **같이 보는 원문:** 이 논문은 같은 데이터와 같은 RM이 여러 단계에 쓰입니다. 선호 데이터(Data)가 RM(Alignment)이 되고, 그 RM이 rejection sampling(Post)과 PPO(Alignment)와 context distillation(Post)을 모두 고릅니다.

| 함께 준비 | 왜 같이 하나 | 공유하는 원문 |
| --- | --- | --- |
| Data RQ3 + Alignment RQ1 | 4단계 rating이 margin m(r)이 되고, 비교 1개 = 응답 2개 = RM 입력 2행이라는 단위가 RM batch(512 pairs = 1,024 rows)로 이어집니다. | §3.2.1–§3.2.2 · Table 6 · 26–28 |
| Post RQ2 + Alignment RQ2 | rejection sampling과 PPO는 같은 §3.2.3에 있고 같은 RM을 씁니다. Post가 “무엇을 다시 학습하나”, Alignment가 “정책을 어떻게 갱신하나”를 맡으면 겹치지 않습니다. | §3.2.3 · Fig. 7–8 · Eq. (3)–(4) |
| Post RQ4 + Alignment RQ4 | context distillation은 safety RM 점수로 채택 여부를 정하고, 그 부작용(vague answer · false refusal)은 Alignment의 false refusal 측정과 같은 현상입니다. | §4.2.3–§4.2.4 · Fig. 15–16 · Table 40–41 |
| Architecture RQ2 + Background | GQA · MQA · KV cache · tensor parallelism의 원전은 모두 W01 이후의 새 개념입니다. | App. A.2.1 · Table 18 · Fig. 24 · GQA §2 |
| Alignment RQ2 + Background | Llama 2의 Eq. (3)–(4)는 PPO clip 식과 InstructGPT의 KL reward를 전제로 합니다. | §3.2.3 · PPO §3 · InstructGPT §3.5 · App. C.4 |
| Data RQ1 + Others | “추가 독성 필터링을 하지 않았다”는 결정과, 사전학습 13B · 70B의 ToxiGen 점수가 오른 결과가 한 쌍입니다. | §4.1 · Fig. 13 · Table 11 |
| Architecture RQ4 + Others | 기반 모델 평가와 안전 벤치마크가 같은 생성 · 판정 방식(greedy · nucleus sampling · 판정 모델)을 씁니다. | §2.3 · §4.1 · App. A.4.7 |

제안 조합: **(Data + Alignment RQ1: 선호 데이터 → RM)** · **(Post-training + Alignment RQ2–RQ3: RS → PPO → 평가, Post 3명이 Alignment RQ3 평가를 함께 맡는 안)** · **(Architecture 단독, RQ4 평가는 Others와 채점 방식 공유)** · **(Background + Alignment RQ2: RLHF 원전)**. 최종 담당과 분량은 사람이 정합니다.

<!-- part: architecture -->
## Architecture & Pre-training

### 이 파트의 질문

- **담당:** 이경민 · 임수민 · 우성현
- **RQ1. LLaMA 1에서 무엇을 그대로 가져왔고, 무엇이 실제로 바뀌었나?**
  - 필수 원문: [§2 도입 · §2.2 · Table 1](https://arxiv.org/pdf/2307.09288v2#page=5) · [App. A.2.1 Context Length · Table 16–17](https://arxiv.org/pdf/2307.09288v2#page=47) · [Fig. 5](https://arxiv.org/pdf/2307.09288v2#page=6)
  - 개념: [유지한 것과 바꾼 것](#c-recipe-delta) · [2K → 4K context와 그 통제 실험](#c-context-4k) · [optimizer 설정값의 출처](#c-opt-values) · [2T 토큰에서도 포화되지 않은 loss](#c-loss-curve)
- **RQ2. GQA는 KV cache와 추론 확장성을 어떻게 바꾸나?**
  - 필수 원문: [App. A.2.1 Grouped-Query Attention · Table 18 · Fig. 24](https://arxiv.org/pdf/2307.09288v2#page=47) · [Table 1](https://arxiv.org/pdf/2307.09288v2#page=6)
  - 개념: [KV cache](#c-kv-cache) · [MHA · MQA · GQA](#c-mha-mqa-gqa) · [GQA ablation과 FFN 보정](#c-gqa-ablation) · [70B의 KV cache 계산](#c-kv-math) · [8-GPU tensor parallel 배포와 Fig. 24](#c-tp-serving)
- **RQ3. 2T 토큰 학습은 어떤 하드웨어와 비용으로 실행됐나?**
  - 필수 원문: [§2.2.1 · Table 2](https://arxiv.org/pdf/2307.09288v2#page=6)
  - 개념: [두 클러스터: InfiniBand와 RoCE](#c-clusters) · [GPU 시간으로 처리량과 MFU 계산](#c-compute-math) · [탄소 발자국과 그 가정](#c-carbon)
- **RQ4. 기반 모델은 무엇을, 어떻게 채점했고 어디까지 가나?**
  - 필수 원문: [§2.3 · Table 3–4](https://arxiv.org/pdf/2307.09288v2#page=7) · [App. A.2.2 · Table 19–25](https://arxiv.org/pdf/2307.09288v2#page=48) · [App. A.6 · Table 51](https://arxiv.org/pdf/2307.09288v2#page=75)
  - 개념: [벤치마크 묶음과 평균의 재계산](#c-bench-groups) · [W01에 없던 벤치마크](#c-bench-new) · [긴 문맥 벤치마크(SCROLLS)](#c-long-context-bench) · [F1 · ROUGE · EM 채점](#c-f1-rouge) · [비공개 모델과의 비교](#c-closed-compare) · [데이터 오염 분석](#c-contamination)
  - W01에서 다룬 채점 방식(likelihood · 길이 정규화 · exact match · pass@k · maj1@k)은 [W01 읽기 지도](../w01/llama1-reading-map.html#c-likelihood-eval)를 다시 씁니다.
- **RQ5. 이 구조 선택은 후속 모델에서 어떻게 이어졌나? (논문 밖)**
  - 개념: [GQA 이후: Llama 3 · Mistral · MLA](#c-arch-followup)

<a id="c-recipe-delta"></a>

### 유지한 것과 바꾼 것

- **무엇인가:** Llama 2의 사전학습은 새 구조가 아니라 **LLaMA 1 recipe + 다섯 가지 변경**입니다. 저자는 “더 강한 데이터 정제, 새 데이터 혼합, 40% 더 많은 토큰, 두 배 context, 큰 모델의 GQA”를 변경으로 듭니다.
- **원문:** [§2 도입 · §2.2](https://arxiv.org/pdf/2307.09288v2#page=5) — “We adopt most of the pretraining setting and model architecture from Llama 1.” 구조 차이(primary architectural differences)는 context 길이와 GQA 두 가지라고 명시합니다. [Table 1](https://arxiv.org/pdf/2307.09288v2#page=6) · [Tokenizer](https://arxiv.org/pdf/2307.09288v2#page=6)

| 항목 | LLaMA 1 (W01) | Llama 2 | 구분 |
| --- | --- | --- | --- |
| 블록 | pre-norm RMSNorm · SwiGLU · RoPE | 같음 | 유지 |
| Tokenizer | SentencePiece BPE · 숫자 분리 · byte fallback | “same tokenizer as Llama 1”, 어휘 32k | 유지 |
| Optimizer | AdamW β₁ 0.9 · β₂ 0.95 · wd 0.1 · clip 1.0 · cosine → 10% · warmup 2,000 | 같음 + eps 10⁻⁵ 명시 | 유지 |
| Batch | 4M 토큰 | 4M 토큰 | 유지 |
| Context | 2,048 | **4,096** | 구조 변경 |
| Attention | MHA | 7B · 13B MHA, **34B · 70B GQA** | 구조 변경 (일부 크기) |
| 데이터 | 공개 7개 소스 · 비율 공개 | “a new mix of publicly available data”, 비율 미공개 | 데이터 변경 |
| 토큰 | 1.0T (7B · 13B) / 1.4T (33B · 65B) | 2.0T (모든 크기) | 데이터 변경 |

- **설명할 수 있어야 하는 것:**
  - [ ] 구조 변경(context · GQA)과 데이터 변경(혼합 · 2T)을 다른 칸으로 나눠 말한다.
  - [ ] “40% 더 많은 토큰”은 1.4T → 2.0T 기준이고, 7B · 13B는 1.0T → 2.0T로 두 배라는 점을 말한다(추출자 계산).
  - [ ] Llama 2가 LLaMA 1 **가중치에서 이어 학습한 것이 아니라** 같은 recipe로 새로 학습했다는 점을 말한다. 원문은 “pretraining approach”를 따랐다고만 적습니다.
  - [ ] 34B는 논문에 보고했지만 red teaming 시간이 부족해 공개를 미뤘다는 점을 말한다([p.4 각주](https://arxiv.org/pdf/2307.09288v2#page=4)).
- **함께 볼 개념:** [2K → 4K context](#c-context-4k) · [MHA · MQA · GQA](#c-mha-mqa-gqa) · [사전학습 데이터](#c-pretrain-corpus) · W01: [RMSNorm](../w01/llama1-reading-map.html#c-rmsnorm) · [SwiGLU](../w01/llama1-reading-map.html#c-swiglu) · [RoPE](../w01/llama1-reading-map.html#c-rope)

<a id="c-context-4k"></a>

### 2K → 4K context와 그 통제 실험

- **무엇인가:** 학습 시퀀스 길이를 2,048에서 4,096 토큰으로 늘린 변경입니다. 저자가 든 이유는 긴 chat 기록 · 요약 · 긴 문서 이해입니다.
- **원문:** [App. A.2.1 · Table 16–17](https://arxiv.org/pdf/2307.09288v2#page=47) — 두 모델 모두 **150B 토큰**, 같은 구조 · 하이퍼파라미터, context만 다르게 학습한 비교입니다. SCROLLS(평균 입력 3.5k)에서 좋아지고 SQuAD에서 떨어지지 않았다고 적습니다.

| 과제 | 지표 | 2k | 4k |
| --- | --- | --- | --- |
| NarrativeQA | F1 | 0.21 | 17.26 |
| Qasper | F1 | 0.71 | 18.52 |
| QuALITY | acc | 26.1 | 29.6 |
| QMSum | ROUGE-1/2/L | 0.13 / 0.01 / 0.12 | 15.08 / 3.55 / 12.16 |
| ContractNLI | EM | 11.76 | 16.33 |
| SQuAD | EM / F1 | 57.23 / 62.89 | 57.99 / 64.46 |
| HellaSwag (0-shot) | acc | 75.1 | 74.8 |
| TriviaQA (64-shot) | EM | 53.7 | 52.2 |
| GSM8K (8-shot) | acc | 4.9 | 6.5 |

- **설명할 수 있어야 하는 것:**
  - [ ] 이 비교가 최종 2T 모델이 아니라 150B 토큰 ablation이라는 조건을 말한다.
  - [ ] 2k 모델의 NarrativeQA · Qasper가 거의 0인 이유를 추정한다: 입력이 2k를 넘으면 잘리거나 문맥 밖으로 밀려 답의 근거를 못 보기 때문으로 보입니다(추출자 해석, 원문은 입력 처리 방식을 적지 않음).
  - [ ] 일반 과제는 “유지”이지 모두 오르지는 않는다는 점을 HellaSwag · TriviaQA로 보인다.
  - [ ] RoPE를 그대로 쓰면서 학습 길이만 늘렸고, 위치 보간 같은 별도 기법은 원문에 없다는 점을 말한다.
- **함께 볼 개념:** [긴 문맥 벤치마크](#c-long-context-bench) · [KV cache](#c-kv-cache)

<a id="c-opt-values"></a>

### optimizer 설정값의 출처

- **무엇인가:** Llama 2의 사전학습 하이퍼파라미터는 LLaMA 1과 같고, LLaMA 1의 값은 GPT-3와 거의 같습니다. 원문은 선택 이유를 적지 않습니다.
- **원문:** [§2.2 Hyperparameters](https://arxiv.org/pdf/2307.09288v2#page=5) · [Table 1](https://arxiv.org/pdf/2307.09288v2#page=6)

| 설정 | PyTorch AdamW 기본값 | GPT-3 (2020) | LLaMA 1 | Llama 2 |
| --- | --- | --- | --- | --- |
| β₁ / β₂ | 0.9 / 0.999 | 0.9 / 0.95 | 0.9 / 0.95 | 0.9 / 0.95 |
| eps | 1e-8 | 1e-8 | 원문 미기술 | **1e-5** |
| weight decay | 0.01 | 0.1 | 0.1 | 0.1 |
| gradient clipping | 없음 | 1.0 | 1.0 | 1.0 |
| schedule | – | cosine → 10% | cosine → 10% | cosine → 10% |
| warmup | – | 375M 토큰 | 2,000 step | 2,000 step |
| 최대 LR | 1e-3 | 크기별 | 3.0e-4 / 1.5e-4 | 7B · 13B 3.0e-4, 34B · 70B 1.5e-4 |
| batch | – | 크기별 | 4M 토큰 | 4M 토큰 |

- **계산해 보면 (추출자 계산):** 2.0T ÷ 4M = **500,000 step**. warmup 2,000 step = 8B 토큰 = 전체의 0.4%로, LLaMA 1(1.4T, 약 35만 step의 0.6%)보다 비중이 더 작습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] Llama 2가 새로 적은 eps = 10⁻⁵가 기본값(10⁻⁸)보다 크다는 점과, 이 값이 2차 모멘트가 매우 작은 파라미터에서 update가 튀는 것을 막는 역할을 한다는 일반적 설명을 구분한다(원문은 이유 미기술).
  - [ ] 큰 모델(34B · 70B)의 최대 LR이 절반이라는 점이 LLaMA 1과 같다는 것을 말한다.
  - [ ] 같은 AdamW 설정이 RM · PPO 학습에도 다시 쓰인다는 점을 연결한다([후학습 설정 비교](#c-sft-settings)).
- **함께 볼 개념:** W01: [β₂ = 0.95와 나머지 설정값의 출처](../w01/llama1-reading-map.html#c-opt-values) · [Warmup 2,000 step](../w01/llama1-reading-map.html#c-warmup)

<a id="c-loss-curve"></a>

### 2T 토큰에서도 포화되지 않은 loss

- **무엇인가:** Fig. 5는 네 크기의 학습 perplexity가 2T 토큰까지 계속 내려가고, 같은 토큰 수에서는 큰 모델이 항상 아래에 있음을 보입니다.
- **원문:** [Fig. 5](https://arxiv.org/pdf/2307.09288v2#page=6) — “after pretraining on 2T Tokens, the models still did not show any sign of saturation.” [§2.1](https://arxiv.org/pdf/2307.09288v2#page=5) — 2T를 고른 이유는 “good performance–cost trade-off”라는 한 문장뿐입니다.
- **왜 그런가 (배경 설명):** Chinchilla 손실 식 `L = E + A/N^α + B/D^β`에서 D를 늘리면 데이터 항이 계속 줄어듭니다. 7B 기준 Chinchilla 권장치는 약 140B 토큰이고, 2T는 그 약 14배입니다(추출자 계산). 줄어드는 폭은 점점 작아지지만 0이 되지 않습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] “포화되지 않았다”는 그림의 관찰이며, 몇 토큰에서 멈추는 것이 최적인지에 대한 실험은 원문에 없다는 점을 말한다.
  - [ ] 그래프의 y축이 loss가 아니라 train PPL로 표시되어 있다는 점을 확인한다.
  - [ ] LLaMA 1의 “작은 모델을 오래” 논리가 2T로 한 번 더 확장됐다는 연결을 말한다.
- **함께 볼 개념:** W01: [스케일링 법칙 ②](../w01/llama1-reading-map.html#c-chinchilla-loss) · [큰 모델일수록 loss가 낮은 이유](../w01/llama1-reading-map.html#c-size-loss)

<a id="c-kv-cache"></a>

### KV cache

- **무엇인가:** 자기회귀 생성에서 이전 토큰들의 key · value를 저장해 두고, 새 토큰마다 그 토큰의 query만 계산해 저장된 K · V와 attention을 하는 방식입니다. 이전 토큰의 K · V를 매번 다시 계산하지 않아 빨라지는 대신 메모리를 씁니다.
- **원문:** [App. A.2.1](https://arxiv.org/pdf/2307.09288v2#page=47) — “A standard practice for autoregressive decoding is to cache the key (K) and value (V) pairs…” context 창이나 batch가 커지면 MHA 모델의 KV cache 메모리가 크게 늘고, 큰 모델에서는 이것이 병목이 된다고 적습니다.
- **크기 식 (일반식):** `KV cache = 2(K·V) × layer 수 × KV head 수 × head 차원 × 시퀀스 길이 × batch × 바이트`
- **설명할 수 있어야 하는 것:**
  - [ ] 학습(모든 토큰을 한 번에 계산)에는 KV cache가 없고, **생성할 때만** 필요하다는 점을 말한다.
  - [ ] 식에서 context 길이와 batch에 정비례한다는 점, 그래서 4K context 확장과 GQA가 같은 문제의 양면이라는 점을 말한다.
  - [ ] 줄일 수 있는 항이 “KV head 수”라는 점을 다음 페이지의 MQA · GQA와 연결한다.
- **함께 볼 개념:** [MHA · MQA · GQA](#c-mha-mqa-gqa) · [70B의 KV cache 계산](#c-kv-math)

<a id="c-mha-mqa-gqa"></a>

### MHA · MQA · GQA

- **무엇인가:** query head 수는 그대로 두고 **key · value head 수**를 줄이는 세 가지 배치입니다.
  - **MHA:** query head마다 자기 K · V를 가짐 (KV head = H).
  - **MQA:** 모든 query head가 K · V 하나를 공유 (KV head = 1, Shazeer 2019).
  - **GQA:** query head를 G개 묶음으로 나눠 묶음마다 K · V를 공유 (KV head = G, Ainslie et al. 2023). G = 1이면 MQA, G = H이면 MHA입니다.
- **원문:** [App. A.2.1](https://arxiv.org/pdf/2307.09288v2#page=47) — 큰 모델에서는 K · V projection을 여러 head가 공유해도 성능이 크게 떨어지지 않는다(Chowdhery et al. 2022)고 적고, MQA(KV projection 1개)와 GQA(**8개**)를 비교합니다. [Table 1](https://arxiv.org/pdf/2307.09288v2#page=6): GQA는 34B · 70B에만, 7B · 13B는 MHA.
- **그림 (설명용, query 8 head 기준):**

  ```
  MHA  Q: 1 2 3 4 5 6 7 8   KV: 1 2 3 4 5 6 7 8
  GQA  Q: 1 2 | 3 4 | 5 6 | 7 8   KV: A | B | C | D   (G = 4)
  MQA  Q: 1 2 3 4 5 6 7 8   KV: A
  ```

- **설명할 수 있어야 하는 것:**
  - [ ] 세 방식에서 query 수는 같고 KV head 수만 다르다는 점을 그림으로 말한다.
  - [ ] GQA는 “어떤 토큰을 볼지 고르는” sparse attention이 아니라 **K · V를 head 사이에 공유**하는 방식이라는 점을 구분한다.
  - [ ] 7B · 13B에는 GQA를 쓰지 않았다는 적용 범위를 말한다.
  - [ ] GQA 원 논문의 uptraining(MHA checkpoint의 head를 평균해 GQA로 바꾸고 원 사전학습 compute의 5%로 추가 학습)은 원전의 방법이며, Llama 2가 그렇게 초기화했다는 기술은 없다는 점을 말한다(원문 미기술).
- **함께 볼 개념:** [GQA ablation](#c-gqa-ablation) · 원전: GQA [arXiv:2305.13245](https://arxiv.org/abs/2305.13245v3) §2.1–§2.2 · MQA [arXiv:1911.02150](https://arxiv.org/abs/1911.02150)

<a id="c-gqa-ablation"></a>

### GQA ablation과 FFN 보정

- **무엇인가:** 30B 모델을 150B 토큰으로 MHA · MQA · GQA 세 가지로 학습해 비교한 실험입니다.
- **원문:** [App. A.2.1 · Table 18](https://arxiv.org/pdf/2307.09288v2#page=48) — 전체 파라미터 수를 맞추려고 attention이 줄어든 만큼 **FFN 차원을 MQA는 1.33배, GQA는 1.3배** 늘렸습니다. 0-shot(MMLU 5-shot, GSM8K 8-shot).

| | BoolQ | PIQA | SIQA | HellaSwag | ARC-e | ARC-c | NQ | TQA | MMLU | GSM8K | HumanEval |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MHA | 71.0 | 79.3 | 48.2 | 75.1 | 71.2 | 43.0 | 12.4 | 44.7 | 28.0 | 4.9 | 7.9 |
| MQA | 70.6 | 79.0 | 47.9 | 74.5 | 71.6 | 41.9 | 14.5 | 42.8 | 26.5 | 4.8 | 7.3 |
| GQA | 69.4 | 78.8 | 48.6 | 75.4 | 72.1 | 42.5 | 14.0 | 46.2 | 26.9 | 5.3 | 7.9 |

- **계산해 보면 (추출자 계산, 11개 단순 평균):** MHA 44.2 · MQA 43.8 · GQA 44.3. 저자 결론 “GQA는 대부분 MHA와 비슷하고 평균적으로 MQA보다 낫다”와 맞습니다. 세 방식의 차이는 0.5점 안쪽이고, 항목별로는 GQA가 MHA보다 낮은 곳(BoolQ −1.6 · MMLU −1.1)도 있습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 이 실험이 attention만 바꾼 것이 아니라 FFN 크기도 함께 바꾼 비교라는 점을 말한다.
  - [ ] 저자가 GQA를 고른 근거가 **품질(MQA보다 평균 우위)과 배포 편의(다음 페이지)** 두 가지라는 점을 말한다.
  - [ ] 30B · 150B 토큰 실험이고, 실제 34B · 70B 체크포인트의 비교가 아니라는 조건을 말한다.
- **함께 볼 개념:** [8-GPU tensor parallel 배포](#c-tp-serving)

<a id="c-kv-math"></a>

### 70B의 KV cache 계산

- **무엇인가:** GQA가 실제로 얼마나 줄이는지 숫자로 보는 페이지입니다. 원문은 layer 수 · head 수를 적지 않으므로, 공개된 모델 설정값(70B: 80 layer, query 64 head, KV 8 head, head 차원 128 / 7B: 32 layer, 32 head MHA, head 차원 128)을 씁니다(**논문 밖** · 추출자 계산, fp16 2바이트).

| 모델 · 방식 | 토큰당 KV cache | 4,096 토큰 1개 | 4,096 토큰 × batch 64 |
| --- | --- | --- | --- |
| 70B · GQA (KV 8) | 2 × 80 × 8 × 128 × 2 B = **320 KiB** | 1.25 GiB | 80 GiB |
| 70B · MHA였다면 (KV 64) | 2.5 MiB | 10 GiB | 640 GiB |
| 70B · MQA였다면 (KV 1) | 40 KiB | 0.16 GiB | 10 GiB |
| 7B · MHA (실제) | 2 × 32 × 32 × 128 × 2 B = 512 KiB | 2 GiB | 128 GiB |

- **읽는 법:** 70B 가중치만 fp16으로 약 138 GB입니다. MHA였다면 4K × 64개 대화의 KV cache(640 GiB)가 8×80GB 노드 전체를 넘습니다. GQA는 이를 1/8로 줄여 **70B의 토큰당 cache가 7B(MHA)보다 작아집니다.**
- **설명할 수 있어야 하는 것:**
  - [ ] 식에 숫자를 넣어 70B GQA의 토큰당 320 KiB를 계산한다.
  - [ ] context를 2K → 4K로 늘리면 cache도 2배가 된다는 점을 말하고, GQA가 그 증가분을 상쇄하고도 남는다는 점을 보인다.
  - [ ] 이 계산의 설정값은 논문이 아니라 공개 config에서 왔다는 점을 밝힌다.
- **함께 볼 개념:** [KV cache](#c-kv-cache) · [8-GPU tensor parallel 배포](#c-tp-serving)

<a id="c-tp-serving"></a>

### 8-GPU tensor parallel 배포와 Fig. 24

- **무엇인가:** tensor parallelism은 한 layer의 행렬을 여러 GPU에 나눠(attention은 head 단위로) 계산하는 병렬화입니다(Megatron-LM, Shoeybi et al. 2019). Llama 2는 지연 시간을 줄이려고 가장 큰 모델을 **A100 8장 한 노드**에 tensor parallel로 올립니다.
- **원문:** [App. A.2.1](https://arxiv.org/pdf/2307.09288v2#page=47) — MQA는 KV head가 GPU 수(8)보다 적어 head 단위로 나눌 수 없습니다. 모든 GPU에 KV를 복제하거나(그러면 cache 크기가 GQA와 같아짐), batch 차원으로 나눠야 하는데 후자는 서비스가 복잡해집니다. [Fig. 24](https://arxiv.org/pdf/2307.09288v2#page=48) — 30B ablation 모델, 8×80GiB A100, 출력 128 토큰, batch를 1부터 두 배씩. MHA는 context 256에서 batch 1024, context 2k에서 batch 128일 때 메모리 부족(OOM), MQA · GQA는 통과.
- **계산해 보면 (추출자 계산):** MHA가 멈춘 두 지점의 저장 토큰 수는 1024 × (256 + 128) ≈ 39만, 128 × (2,048 + 128) ≈ 28만으로 비슷한 크기입니다. 즉 batch × 길이가 일정량을 넘으면 KV cache가 메모리를 채운다는 해석과 맞습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] GQA의 8 KV head가 8 GPU에 정확히 하나씩 나뉜다는 점이 선택 이유의 하나라는 것을 말한다.
  - [ ] Fig. 24에서 MQA와 GQA가 비슷한 것은 MQA의 KV를 모든 GPU에 복제해 cache 크기가 같아졌기 때문이라는 조건을 말한다.
  - [ ] 작은 batch에서는 세 방식의 지연 시간이 비슷하고, 차이는 큰 batch(처리량)에서 난다는 점을 말한다.
- **원전:** Megatron-LM [arXiv:1909.08053](https://arxiv.org/abs/1909.08053) · Pope et al., Efficiently Scaling Transformer Inference [arXiv:2211.05102](https://arxiv.org/abs/2211.05102)

<a id="c-clusters"></a>

### 두 클러스터: InfiniBand와 RoCE

- **무엇인가:** 사전학습을 Meta의 Research SuperCluster(RSC)와 내부 production 클러스터 두 곳에서 했고, 둘의 네트워크와 전력 상한이 다릅니다.
- **원문:** [§2.2.1](https://arxiv.org/pdf/2307.09288v2#page=6)

| | RSC | Production 클러스터 |
| --- | --- | --- |
| GPU | A100 | A100 |
| 연결 | NVIDIA Quantum InfiniBand | RoCE (일반 ethernet 스위치 기반 RDMA) |
| 대역폭 | 200 Gbps 엔드포인트 | 200 Gbps 엔드포인트 |
| GPU당 전력 상한 | 400W | 350W |

  저자는 더 저렴한 RoCE가 **2,000 GPU까지** InfiniBand에 거의 맞먹게 확장된다고 적습니다. [Table 2](https://arxiv.org/pdf/2307.09288v2#page=7)의 전력 열로 보면 34B만 350W(production)에서 학습했습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 두 클러스터의 차이 두 가지(연결 방식 · 전력 상한)를 말한다.
  - [ ] RoCE 비교는 저자의 정성적 진술이고 처리량 수치는 공개되지 않았다는 점을 말한다.
  - [ ] 학습 병렬화 방식(FSDP · tensor · pipeline 차수)은 사전학습에 대해서는 원문에 없다는 점을 말한다.

<a id="c-compute-math"></a>

### GPU 시간으로 처리량과 MFU 계산

- **무엇인가:** Table 2의 GPU 시간과 2T 토큰으로 GPU당 처리량과 하드웨어 활용률을 역산하는 페이지입니다. 원문은 GPU 수 · 기간 · 정밀도를 적지 않으므로 아래는 모두 **추출자 계산**입니다(학습 compute ≈ 6ND, 크기는 7 · 13 · 34 · 70B 명목값, A100 BF16 피크 312 TFLOP/s).
- **원문:** [Table 2](https://arxiv.org/pdf/2307.09288v2#page=7) — 7B 184,320 · 13B 368,640 · 34B 1,038,336 · 70B 1,720,320 GPU-hours, 합계 3,311,616.

| 모델 | 학습 compute | tokens/s/GPU | GPU당 실효 연산 | MFU(어림) |
| --- | --- | --- | --- | --- |
| 7B | 8.4 × 10²² | 3,014 | 127 TFLOP/s | 약 41% |
| 13B | 1.6 × 10²³ | 1,507 | 118 TFLOP/s | 약 38% |
| 34B (350W) | 4.1 × 10²³ | 535 | 109 TFLOP/s | 약 35% |
| 70B | 8.4 × 10²³ | 323 | 136 TFLOP/s | 약 43% |
| 비교: LLaMA 1 65B | 5.5 × 10²³ | 380 | 149 TFLOP/s | 약 48% |

- **설명할 수 있어야 하는 것:**
  - [ ] GPU-hours → 초 → tokens/s/GPU → `6N × tokens/s ÷ 피크` 순서로 MFU를 구한다.
  - [ ] 70B를 2,048장으로 돌렸다면 1,720,320 ÷ 2,048 = 840시간 ≈ 35일이라는 계산을 하고, GPU 수는 가정이라는 점을 밝힌다.
  - [ ] GQA는 학습 compute를 거의 줄이지 않고(attention projection 일부만 작아짐) 주로 **추론**을 위한 선택이라는 점을 말한다.
- **함께 볼 개념:** W01: [65B 학습의 메모리와 처리량 계산](../w01/llama1-reading-map.html#c-memory-math)

<a id="c-carbon"></a>

### 탄소 발자국과 그 가정

- **무엇인가:** GPU 시간 × GPU 전력(TDP)에 탄소 집약도를 곱해 사전학습 배출량을 추정한 값입니다.
- **원문:** [§2.2.1 · Table 2](https://arxiv.org/pdf/2307.09288v2#page=7) — 총 3.3M GPU-hours, **539 tCO₂eq**, 전량 Meta가 상쇄. 실제 사용 전력 대신 TDP를 쓰고, interconnect · 서버 · 냉각 전력과 GPU 생산 배출은 넣지 않았다고 적습니다.
- **계산해 보면 (추출자 계산):** 7B 184,320 h × 0.4 kW = 73.7 MWh → 31.22 t ÷ 73.7 MWh = 0.4235 t/MWh. 34B(350W)도 같은 0.4235가 나옵니다. 이는 **LLaMA 1이 쓴 0.385 kg/kWh × PUE 1.1 = 0.4235**와 정확히 같아, 같은 가정을 쓴 것으로 보입니다. 전체 전력은 약 1,273 MWh입니다(LLaMA 1 65B 449 MWh).
- **설명할 수 있어야 하는 것:**
  - [ ] Table 2의 열(GPU 시간 · 전력 · 배출)로 계수를 역산해 LLaMA 1과 같은 가정임을 보인다.
  - [ ] 원문이 빠뜨렸다고 스스로 밝힌 전력 항목을 말한다.
  - [ ] 후학습(SFT · RLHF · 사람 평가)의 compute와 배출은 이 표에 없다는 점을 말한다.
- **함께 볼 개념:** W01: [탄소 발자국 추정](../w01/llama1-reading-map.html#c-carbon)

<a id="c-bench-groups"></a>

### 벤치마크 묶음과 평균의 재계산

- **무엇인가:** §2.3은 개별 벤치마크 대신 **범주 평균**(Table 3)을 먼저 보여줍니다. 모든 평가는 Meta 내부 평가 라이브러리로 했고, MPT · Falcon은 내부 재현값과 공개값 중 **높은 쪽**을 씁니다.
- **원문:** [§2.3 · Table 3](https://arxiv.org/pdf/2307.09288v2#page=7) · 개별 결과 [App. A.2.2 · Table 19–25](https://arxiv.org/pdf/2307.09288v2#page=48)

| 범주 | 들어가는 벤치마크 | shot | 지표 | 70B 평균 (재계산) |
| --- | --- | --- | --- | --- |
| Code | HumanEval · MBPP | 0 · 3 | pass@1 평균 | (29.9 + 45.0) ÷ 2 = 37.5 |
| Commonsense | PIQA · SIQA · HellaSwag · WinoGrande · ARC-e · ARC-c · OBQA · CommonsenseQA | 0 (CSQA 7) | 정확도 | 575.3 ÷ 8 = 71.9 |
| World Knowledge | NaturalQuestions · TriviaQA | 5 | EM | (39.5 + 87.6) ÷ 2 = 63.6 |
| Reading Comp. | SQuAD · QuAC · BoolQ | 0 | EM · F1 · 정확도 | (80.7 + 42.4 + 85.0) ÷ 3 = 69.4 |
| Math | GSM8K · MATH | 8 · 4 | top-1 (maj1@1) | (56.8 + 13.5) ÷ 2 = 35.2 |
| MMLU | 57과목 | 5 | 정확도 | 68.9 |
| BBH | BIG-Bench Hard | 3 | 정확도 | 51.2 |
| AGIEval | 영어 과제만 | 3–5 | 정확도 | 54.2 |

- **결과:** Llama 2 70B는 LLaMA 1 65B보다 MMLU +5.5(63.4 → 68.9), BBH +7.7(43.5 → 51.2). 다만 Llama 2 34B의 Math(24.2)는 13B(28.7)보다 낮습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] Table 3의 평균을 Table 20–25의 개별 값으로 다시 계산할 수 있다는 점을 하나 이상 보인다(추출자 계산, 모두 일치).
  - [ ] 범주 구성이 LLaMA 1과 다르다는 점을 말한다: BoolQ가 상식 추론에서 독해로 옮겨졌고, CommonsenseQA · SQuAD · QuAC · BBH · AGIEval이 새로 들어왔습니다.
  - [ ] 서로 다른 지표(EM · F1 · 정확도)를 한 범주에서 그대로 평균했다는 점을 말한다.
  - [ ] 비교 모델 점수를 “내부 평가와 공개값 중 높은 쪽”으로 잡은 규칙이 비교 모델에 유리한 쪽이라는 점을 말한다.
- **함께 볼 개념:** [W01에 없던 벤치마크](#c-bench-new) · W01: [벤치마크 목록과 ‘20개’](../w01/llama1-reading-map.html#c-bench-list)

<a id="c-bench-new"></a>

### W01에 없던 벤치마크

- **무엇인가:** 이번 범주에 새로 들어간 벤치마크가 무엇을 묻고 어떻게 채점되는지입니다. 원문은 이 벤치마크들의 프롬프트 형식을 적지 않습니다. 아래 예시는 형식을 보이기 위한 **설명용 문항**입니다.
- **원문:** [§2.3](https://arxiv.org/pdf/2307.09288v2#page=7) · [Table 20 · 23 · 24](https://arxiv.org/pdf/2307.09288v2#page=49)

| 벤치마크 | 무엇을 평가하나 | 형식 · 채점 | 설명용 예시 | 70B |
| --- | --- | --- | --- | --- |
| CommonsenseQA | 개념 사이의 상식 관계(ConceptNet 기반) | 질문 + 보기 5개 · 7-shot · 정확도 | “우산을 쓰는 이유는?” (비 · 햇빛 · …) | 78.5 |
| SQuAD (2.0) | Wikipedia 지문에서 답이 되는 구간 찾기, 답이 없는 질문 포함 | 지문 + 질문 → 구간 생성 · EM | 지문의 한 구절을 그대로 답 | 0-shot 80.7 |
| QuAC | 지문을 보지 못한 학생이 묻고 교사가 지문에서 답하는 대화형 QA | 대화 기록 + 질문 → 구간 · F1 | “그 뒤에 그는 무엇을 했나?” | 0-shot 42.4 · 1-shot 49.3 |
| BoolQ | 지문 + 예/아니오 질문 | 정확도 | W01 참고 | 85.0 |
| BBH | BIG-Bench에서 이전 모델이 사람 평가자보다 못했던 23개 어려운 과제(논리 추론 · 날짜 계산 등) | 3-shot · 정확도 | “오늘이 3월 1일이면 10일 전은?” | 51.2 |
| AGIEval (영어) | 사람용 표준 시험: SAT · LSAT · LogiQA · AQuA-RAT | 3–5-shot · 정확도 | LSAT 논리 추론 문항 | 54.2 (SAT-en 86.9 · LSAT-AR 25.7) |

- **설명할 수 있어야 하는 것:**
  - [ ] 각 벤치마크가 “보기 고르기 / 구간 찾기 / 대화형 / 시험” 중 어디에 속하는지 말한다.
  - [ ] SQuAD는 EM, QuAC는 F1로 채점하는 이유(대화형 답은 경계가 모호해 부분 점수가 필요)를 말한다.
  - [ ] AGIEval 안에서도 SAT-en 86.9와 LSAT-AR 25.7처럼 편차가 크다는 점을 말한다.
- **원전:** [CommonsenseQA](https://arxiv.org/abs/1811.00937) · [SQuAD 2.0](https://arxiv.org/abs/1806.03822) · [QuAC](https://arxiv.org/abs/1808.07036) · [BBH](https://arxiv.org/abs/2210.09261) · [AGIEval](https://arxiv.org/abs/2304.06364)

<a id="c-long-context-bench"></a>

### 긴 문맥 벤치마크(SCROLLS)

- **무엇인가:** 4K context의 효과를 보려고 쓴 긴 입력 과제 묶음입니다. SCROLLS의 평균 입력 길이는 3.5k 토큰입니다.
- **원문:** [App. A.2.1 · Table 16](https://arxiv.org/pdf/2307.09288v2#page=47)

| 과제 | 무엇을 평가하나 | 형식 · 지표 |
| --- | --- | --- |
| NarrativeQA | 책 · 영화 대본 전체를 읽고 줄거리 질문에 답하기 | 자유 생성 · F1 |
| Qasper | NLP 논문 전문을 읽고 질문에 답하기 | 자유 생성 · F1 |
| QuALITY | 긴 기사 · 소설을 읽고 객관식 질문 | 보기 4개 · 정확도 |
| QMSum | 회의록에서 질문에 맞는 부분 요약 | 요약 생성 · ROUGE-1/2/L |
| ContractNLI | 계약서가 주어진 가설을 함의 · 모순 · 언급 없음 중 무엇인지 | 분류 · EM |

- **설명할 수 있어야 하는 것:**
  - [ ] 다섯 과제가 각각 QA · 객관식 · 요약 · 분류라는 점과 그래서 지표가 다르다는 점을 말한다.
  - [ ] 2K 모델은 입력의 상당 부분을 볼 수 없어서 점수가 낮다는 해석과, 이것이 4K의 효과를 크게 보이게 한다는 점을 말한다(추출자 해석).
- **원전:** [SCROLLS](https://arxiv.org/abs/2201.03533)

<a id="c-f1-rouge"></a>

### F1 · ROUGE · EM 채점

- **무엇인가:** 생성한 답을 정답과 비교하는 세 가지 방법입니다. EM은 정규화 후 완전히 같아야 1점, F1은 단어 단위로 겹친 비율, ROUGE는 n-gram이 겹친 비율(요약에 주로 씀)입니다.
- **원문:** [Table 16 · 22 · 23](https://arxiv.org/pdf/2307.09288v2#page=47) — 지표 이름만 적고 정규화 세부는 적지 않습니다.
- **계산해 보면 (설명용):** 정답 `Charles Darwin`, 생성 `Darwin`
  - EM: 같지 않음 → **0**
  - F1: 겹친 단어 1개. precision = 1/1, recall = 1/2 → F1 = 2 × 1 × 0.5 ÷ 1.5 = **0.67**
  - 생성 `the naturalist Charles Darwin`: precision = 2/4(관사 제거 시 2/3), recall = 2/2 → F1 = 0.67(0.8)
- **설명할 수 있어야 하는 것:**
  - [ ] 같은 답이 EM 0점, F1 0.67점이 되는 예를 계산한다.
  - [ ] 정답이 길고 표현이 다양한 과제(QuAC · Qasper · 요약)에 F1 · ROUGE를 쓰는 이유를 말한다.
- **함께 볼 개념:** W01: [Greedy 생성과 exact match](../w01/llama1-reading-map.html#c-greedy-em)

<a id="c-closed-compare"></a>

### 비공개 모델과의 비교

- **무엇인가:** Llama 2 70B를 GPT-3.5 · GPT-4 · PaLM · PaLM-2-L과 비교한 표입니다. 비교 모델 점수는 각 기술 보고서에서 가져왔습니다.
- **원문:** [Table 4](https://arxiv.org/pdf/2307.09288v2#page=8)

| 벤치마크 (shot) | GPT-3.5 | GPT-4 | PaLM | PaLM-2-L | Llama 2 70B |
| --- | --- | --- | --- | --- | --- |
| MMLU (5) | 70.0 | 86.4 | 69.3 | 78.3 | 68.9 |
| TriviaQA (1) | – | – | 81.4 | 86.1 | 85.0 |
| Natural Questions (1) | – | – | 29.3 | 37.5 | 33.0 |
| GSM8K (8) | 57.1 | 92.0 | 56.5 | 80.7 | 56.8 |
| HumanEval (0) | 48.1 | 67.0 | 26.2 | – | 29.9 |
| BBH (3) | – | – | 52.3 | 65.7 | 51.2 |

- **설명할 수 있어야 하는 것:**
  - [ ] MMLU · GSM8K는 GPT-3.5에 가깝고 코드(HumanEval 29.9 vs 48.1)는 차이가 크다는 저자 요약을 표로 말한다.
  - [ ] 직접 잰 값이 아니라 다른 보고서에서 옮긴 값이라 평가 설정이 같다는 보장이 없다는 점을 말한다.

<a id="c-contamination"></a>

### 데이터 오염 분석

- **무엇인가:** 평가 문항이 사전학습 데이터에 이미 들어 있어서 점수가 부풀었는지 확인하는 분석입니다.
- **원문:** [App. A.6 · Table 51](https://arxiv.org/pdf/2307.09288v2#page=75)
  - **이전 방법:** GPT-3 등은 13-gram이 하나라도 겹치면 오염, PaLM은 8-gram의 70% 이상이 학습 데이터에 있으면 오염으로 봤습니다.
  - **Llama 2 방법:** 토큰화한 입력에서, 평가 문항과 학습 데이터에 함께 나오는 **10토큰 넘는 n-gram**에 속한 토큰을 “오염 토큰”으로 셉니다(최대 4개 위치 불일치 허용). 문항의 오염도 = 오염 토큰 비율. 1,500 코어로 약 7시간, suffix array 사용.
  - **판정:** clean(< 20%) · not clean(≥ 20%) · not dirty(< 80%) · dirty(≥ 80%) 네 부분집합. **가장 깨끗한 쪽이 평균보다 낮고, 가장 더러운 쪽이 평균보다 높을 때만** 오염이 점수에 영향을 줬다고 봅니다. 최소 일치 길이 L을 10–50으로 바꿔 반복합니다.

| 데이터셋 (70B) | 부분집합 | 문항 수 | 점수 | 전체 평균 |
| --- | --- | --- | --- | --- |
| HellaSwag (L = 40) | Clean | 7,391 | 80.0 | 82.5 |
| | Dirty | 848 | 92.2 | 82.5 |
| MMLU-Humanities (L = 50) | Clean | 3,996 | 62.2 | 65.3 |
| | Dirty | 520 | 85.8 | 65.3 |

- **설명할 수 있어야 하는 것:**
  - [ ] 두 조건을 모두 요구하는 이유(한쪽만 성립하면 문항 난이도 차이일 수 있음)를 말한다.
  - [ ] 영향이 있다고 판정된 것은 HellaSwag와 MMLU(Humanities · Overall)뿐이고, 나머지 데이터셋은 근거가 부족했다는 결론을 말한다.
  - [ ] 오염 판정이 점수를 다시 계산해 보고하는 데까지는 가지 않았다는 점(Table 3 수치는 그대로)을 말한다.
- **원전:** PaLM [arXiv:2204.02311](https://arxiv.org/abs/2204.02311) §8 · GPT-3 [arXiv:2005.14165](https://arxiv.org/abs/2005.14165) App. C

<a id="c-arch-followup"></a>

### GQA 이후: Llama 3 · Mistral · MLA

- **무엇인가 (논문 밖):** Llama 2에서 큰 모델에만 쓴 GQA가 이후 어떻게 기본값이 됐는지입니다.

| 모델 | attention | KV head | context | 기타 |
| --- | --- | --- | --- | --- |
| Llama 2 (2023.07) | 7B · 13B MHA, 34B · 70B GQA | 8 (GQA) | 4K | 어휘 32k |
| Mistral 7B (2023.10) | GQA + sliding window attention | 8 | 8K | 7B부터 GQA |
| Llama 3 (2024.07) | **8B · 70B · 405B 모두 GQA** | 8 | 8K → 128K | 어휘 128K, RoPE θ 500,000 |
| DeepSeek-V2 (2024.05) | MLA: K · V를 저차원 latent로 압축해 cache | – | 128K | W05에서 다룸 |

- **설명할 수 있어야 하는 것:**
  - [ ] Llama 3가 8B부터 GQA를 쓴 사실로, 작은 모델에도 KV cache 절약이 중요해졌다는 흐름을 말한다.
  - [ ] GQA(head 공유)와 MLA(차원 압축)는 KV cache를 줄이는 다른 방법이라는 점을 말하고, W03(Qwen2의 7B MHA→GQA) · W05(MLA)로 연결한다.
- **출처:** [Llama 3 Table 3](https://arxiv.org/abs/2407.21783) (2026-10-17 확인) · [Mistral 7B](https://arxiv.org/abs/2310.06825) · [DeepSeek-V2](https://arxiv.org/abs/2405.04434). Mistral · DeepSeek-V2 항목은 이번에 원문을 다시 열지 않았습니다.

<!-- part: data -->
## Data & Synthesis

### 이 파트의 질문

- **담당:** 정호찬 · 김대규
- **RQ1. 사전학습 데이터는 무엇이 바뀌었고, 무엇이 공개되지 않았나?**
  - 필수 원문: [§2.1](https://arxiv.org/pdf/2307.09288v2#page=5) · [§4.1 · Table 9–10 · Fig. 13](https://arxiv.org/pdf/2307.09288v2#page=20) · [A.7 Table 52](https://arxiv.org/pdf/2307.09288v2#page=77)
  - 개념: [사전학습 데이터: 적힌 것과 빠진 것](#c-pretrain-corpus) · [추가 독성 필터링을 하지 않은 결정](#c-no-scrub) · [언어 분포](#c-language-dist) · [인구 집단 표현](#c-demographics)
- **RQ2. SFT 데이터는 어디서 와서 얼마나 모았나?**
  - 필수 원문: [§3.1 · Table 5](https://arxiv.org/pdf/2307.09288v2#page=9) · [§4.2.1–§4.2.2](https://arxiv.org/pdf/2307.09288v2#page=23)
  - 개념: [SFT 데이터 27,540개](#c-sft-data) · [적대적 prompt: 위험 범주 × 공격 방식](#c-adversarial-prompts)
- **RQ3. 선호 데이터는 어떤 절차로, 어떤 단위로 모았나?**
  - 필수 원문: [§3.2.1 · Table 6](https://arxiv.org/pdf/2307.09288v2#page=10) · [App. A.3.1–A.3.2 · Table 26 · Fig. 25–26](https://arxiv.org/pdf/2307.09288v2#page=51)
  - 개념: [선호 수집 절차](#c-pref-protocol) · [도움됨 · 안전성 지침과 안전 label](#c-safety-labels) · [비교 · 예시 · 토큰: 선호 데이터의 단위](#c-pref-units) · [공개 선호 데이터셋 6종](#c-open-pref-datasets) · [주간 batch 14개와 분포 이동](#c-weekly-batches)
- **RQ4. 이 데이터 레시피는 후속 모델에서 어떻게 이어졌나? (논문 밖)**
  - 개념: [Llama 3의 데이터](#c-data-followup)

<a id="c-pretrain-corpus"></a>

### 사전학습 데이터: 적힌 것과 빠진 것

- **무엇인가:** Llama 2의 사전학습 데이터는 “공개 출처의 새 혼합”이라는 것 외에 소스 목록과 비율이 공개되지 않았습니다. LLaMA 1(W01)과 가장 크게 달라진 점입니다.
- **원문:** [§2 · §2.1](https://arxiv.org/pdf/2307.09288v2#page=5) · [§4.1 Steps Taken to Pretrain Responsibly](https://arxiv.org/pdf/2307.09288v2#page=20) · [Table 52](https://arxiv.org/pdf/2307.09288v2#page=77)

| 항목 | 원문에 적힌 것 | 원문에 없는 것 |
| --- | --- | --- |
| 출처 | 공개된 온라인 출처의 새 혼합, Meta 제품 · 서비스 · 사용자 데이터 미포함 | 소스 이름 · 비율 · epochs (LLaMA 1 Table 1에 해당하는 표) |
| 정제 | “more robust data cleaning”, 개인정보가 많은 일부 사이트 제거, 데이터셋마다 Meta의 개인정보 · 법무 검토 | 정제 단계 · 필터 · 중복 제거 단위 |
| 혼합 | 가장 사실적인(factual) 소스를 **up-sampling** — 지식을 늘리고 환각을 줄이려는 의도 | 어느 소스를 몇 배로 올렸는지 |
| 규모 | 2T 토큰, “좋은 성능–비용 trade-off” | 고유 토큰 수 · 반복량 |
| 시점 | 사전학습 데이터 cutoff 2022년 9월, 일부 tuning 데이터 2023년 7월까지, 학습 기간 2023년 1–7월 | – |

- **설명할 수 있어야 하는 것:**
  - [ ] LLaMA 1이 공개한 것(7개 소스 · 비율 · 소스별 전처리)과 Llama 2가 공개한 것을 표로 비교한다.
  - [ ] factual up-sampling의 효과(환각 감소)는 의도로 적혀 있을 뿐 따로 측정한 실험이 없다는 점을 말한다.
  - [ ] 비율 대신 공개한 것이 “분석”(언어 · 인구 표현 · 독성, §4.1)이라는 점을 다음 페이지들과 연결한다.
- **함께 볼 개념:** [추가 독성 필터링을 하지 않은 결정](#c-no-scrub) · W01: [Llama 2 · Llama 3의 데이터](../w01/llama1-reading-map.html#c-llama-data) · [Books3와 ‘공개 데이터’의 경계](../w01/llama1-reading-map.html#c-books3)

<a id="c-no-scrub"></a>

### 추가 독성 필터링을 하지 않은 결정

- **무엇인가:** 독성 문서를 사전학습 데이터에서 걸러내지(scrub) 않기로 한 선택과, 대신 독성 비율을 측정해 공개한 것입니다.
- **원문:** [§4.1](https://arxiv.org/pdf/2307.09288v2#page=20) — “No additional filtering was conducted on the datasets”. 저자가 든 이유는 세 가지입니다.
  1. 혐오 표현 분류 같은 과제에도 쓸 수 있도록 범용성을 유지.
  2. 과도한 정제가 특정 인구 집단을 우연히 지우는 문제(demographic erasure)를 피함.
  3. 덜 거른 데이터로 학습한 모델이 **더 적은 예시로 안전 튜닝**된다는 관찰.
- **측정 방법:** [Fig. 13](https://arxiv.org/pdf/2307.09288v2#page=21) — ToxiGen으로 학습한 HateBERT 분류기로 문서의 각 줄을 점수 매겨 평균한 값을 문서 점수로 씁니다. 전체 말뭉치의 10% 무작위 표본에서 독성 확률 0.5 이상인 문서는 약 **0.2%**입니다.
- **설명할 수 있어야 하는 것:**
  - [ ] “추가 필터링 없음”이 “정제 없음”이 아니라는 점을 말한다. 개인정보 사이트 제거와 데이터 정제는 따로 했습니다.
  - [ ] 그 결과로 사전학습 13B · 70B의 ToxiGen 점수가 LLaMA 1보다 높아졌고, 저자가 이를 필터링을 덜 한 탓으로 추정한다는 연결을 말한다([안전 벤치마크](#c-safety-bench)).
  - [ ] 그래서 저자가 기반 모델을 “상당한 안전 튜닝 뒤에만 배포하라”고 적은 이유를 말한다.
- **원전:** HateBERT [arXiv:2010.12472](https://arxiv.org/abs/2010.12472) · ToxiGen [arXiv:2203.09509](https://arxiv.org/abs/2203.09509)

<a id="c-language-dist"></a>

### 언어 분포

- **무엇인가:** 사전학습 데이터의 언어 구성입니다. 언어별 비율을 정해서 섞은 것이 아니라, 섞인 결과를 fastText 언어 식별(임계값 0.5)로 측정한 값입니다.
- **원문:** [§4.1 Language Identification · Table 10](https://arxiv.org/pdf/2307.09288v2#page=22) — 문서의 0.005% 넘게 나오는 언어만 표에 적었습니다.

| 언어 | 비율 | 언어 | 비율 |
| --- | --- | --- | --- |
| 영어 | 89.70% | 일본어 | 0.10% |
| unknown (코드 일부 포함) | 8.38% | 폴란드어 · 포르투갈어 | 각 0.09% |
| 독일어 | 0.17% | 베트남어 | 0.08% |
| 프랑스어 | 0.16% | 우크라이나어 | 0.07% |
| 스웨덴어 | 0.15% | **한국어** | **0.06%** |
| 중국어 · 스페인어 · 러시아어 | 각 0.13% | 카탈루냐어 · 세르비아어 | 각 0.04% |
| 네덜란드어 | 0.12% | 그 외 9개 언어 | 0.01–0.03% |
| 이탈리아어 | 0.11% | | |

- **계산해 보면 (추출자 계산):** 영어와 unknown을 뺀 26개 언어의 합은 **1.91%**입니다. 표의 단위가 문서인지 토큰인지 원문이 밝히지 않으므로, 토큰 비율로 가정하면 한국어는 2T × 0.06% ≈ **12억 토큰**입니다.
- **설명할 수 있어야 하는 것:**
  - [ ] LLaMA 1의 다국어는 Wikipedia 20개 라틴 · 키릴 언어였고, Llama 2 표에는 중국어 · 일본어 · 한국어 · 베트남어 · 인도네시아어가 나타난다는 차이를 말한다.
  - [ ] unknown 8.38%의 일부가 코드라는 원문 설명을 말한다.
  - [ ] 저자가 이 분포를 근거로 영어 외 언어 사용을 권하지 않는다는 점(§5.2 · 모델 카드의 out-of-scope)을 말한다.
- **함께 볼 개념:** [한계와 공개 전략](#c-limitations-release) · W01: [다국어 구성](../w01/llama1-reading-map.html#c-multilingual)

<a id="c-demographics"></a>

### 인구 집단 표현

- **무엇인가:** 사전학습 데이터의 영어 부분에서 대명사와 인구 집단 용어가 얼마나 자주 나오는지 센 분석입니다. 편향의 원인을 데이터에서 찾으려는 목적입니다.
- **원문:** [§4.1 · Table 9](https://arxiv.org/pdf/2307.09288v2#page=20)
  - **대명사:** 전체 문서의 75.23%에 성별 대명사가 있고, 그 안에서 He 계열 50.73%, She 계열 28.45%. 저자는 모델이 She 맥락을 덜 배워 He를 더 많이 생성할 수 있다고 봅니다.
  - **정체성 용어:** HolisticBias의 용어를 종교 · 성별 · 국적 · 인종 · 성적 지향 5개 축으로 셉니다. 국적 축에서 “american”이 69.4%, 종교 축에서 “christian” 33.2%로 서구 편중이 보입니다. 국적 축에 “korean”이 5.1%로 나옵니다.
  - **주의:** “straight · white · black”처럼 다른 뜻으로 많이 쓰이는 말은 상위 목록에서 뺐습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] Table 9b의 퍼센트가 “그 축을 언급한 문서 중 해당 용어를 언급한 비율”이라는 정의를 말한다.
  - [ ] 문서 빈도 분석이 편향의 직접 측정이 아니라 대리 지표(proxy)라는 점을 말한다.
- **원전:** HolisticBias [arXiv:2205.09209](https://arxiv.org/abs/2205.09209)

<a id="c-sft-data"></a>

### SFT 데이터 27,540개

- **무엇인가:** Llama 2-Chat의 첫 단계 지도 학습 데이터입니다. 공개 instruction 데이터로 시작했다가, **양보다 질**을 이유로 vendor가 만든 고품질 대화 데이터로 바꿨습니다.
- **원문:** [§3.1 · Table 5](https://arxiv.org/pdf/2307.09288v2#page=9)
  1. **Getting Started:** LLaMA 1(LLaMA-I)처럼 공개 instruction 데이터(Chung et al., 2022, Flan)로 시작.
  2. **Quality Is All You Need:** 제3자 SFT 데이터 수백만 건은 다양성과 품질이 부족해 **제외**하고, vendor annotation으로 수천 건의 고품질 데이터를 먼저 모았더니 결과가 눈에 띄게 좋아짐. 수만 건 수준이면 충분하다고 판단해 **27,540건**에서 수집을 멈춤.
  3. **품질 확인:** 180건을 사람이 직접 검토해, SFT 모델이 생성한 답이 사람이 쓴 답과 비슷한 수준임을 확인 → 이후 annotation 예산을 선호 데이터로 돌림.
  4. **주의:** vendor · 플랫폼에 따라 하류 성능이 크게 달랐다고 적습니다.
- **형식:** 한 예시 = annotator가 직접 쓴 prompt + 답. Table 5에 도움됨 예시(주기율표 시)와 안전 예시(욕설 roast 요청 거절)가 있습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] SFT 데이터 수(27,540)와 선호 비교 수(1,418,091)의 단위 · 규모 차이를 말한다.
  - [ ] “적은 고품질 데이터로 충분하다”는 관찰이 LIMA(Zhou et al. 2023)와 같은 방향이지만, 양 · vendor · 품질이 함께 바뀐 비교라 통제 실험은 아니라는 점을 말한다.
  - [ ] 27,540건의 과제 · 도메인 구성과 공개 데이터와의 최종 혼합 비율은 원문에 없다는 점을 말한다.
- **함께 볼 개념:** [SFT의 loss](#c-sft-loss) · 원전: LIMA [arXiv:2305.11206](https://arxiv.org/abs/2305.11206) · W01: [Flan 프로토콜](../w01/llama1-reading-map.html#c-flan)

<a id="c-adversarial-prompts"></a>

### 적대적 prompt: 위험 범주 × 공격 방식

- **무엇인가:** 안전 데이터를 만들 때 annotator가 쓰는 “모델이 위험한 답을 하도록 유도하는 prompt”의 설계 틀입니다. 두 축의 조합으로 만듭니다.
- **원문:** [§4.2.1](https://arxiv.org/pdf/2307.09288v2#page=23) · [§4.2.2](https://arxiv.org/pdf/2307.09288v2#page=24)

| 축 | 항목 |
| --- | --- |
| 위험 범주 | 불법 · 범죄 활동(테러 · 절도 · 인신매매) · 혐오 · 유해 활동(명예훼손 · 자해 · 섭식장애 · 차별) · 자격 없는 조언(의료 · 금융 · 법률) |
| 공격 방식 | 심리 조작(권위 사칭) · 논리 조작(거짓 전제) · 구문 조작(오타) · 의미 조작(은유) · 관점 조작(역할극) · 영어 외 언어 · 기타 |

  좋은 안전 응답의 순서도 정합니다: ① 즉각적인 안전 문제를 먼저 다루고 → ② 위험을 설명하며 prompt에 답하고 → ③ 가능하면 추가 정보를 준다. 이 prompt와 annotator가 쓴 안전한 답이 **안전 SFT 데이터**가 되고, 같은 prompt가 안전 선호 데이터와 RLHF sampling에 다시 쓰입니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 두 축으로 prompt를 만드는 이유(같은 위험을 여러 공격 방식으로 시험)를 예로 말한다.
  - [ ] 안전 SFT 데이터는 “수천 건” 모은 뒤 RLHF로 넘어갔다는 점을 말한다(§4.2.3, 정확한 수는 미기술).
- **함께 볼 개념:** [안전 RLHF](#c-safety-rlhf) · [red teaming](#c-red-teaming)

<a id="c-pref-protocol"></a>

### 선호 수집 절차

- **무엇인가:** reward model을 학습시킬 사람 선호 데이터를 모으는 방법입니다. **이진 비교**(두 응답 중 하나 고르기)에 **선호 강도 4단계**를 덧붙입니다.
- **원문:** [§3.2.1](https://arxiv.org/pdf/2307.09288v2#page=10)
  1. annotator가 prompt를 **직접 씀**.
  2. 그 prompt에 대한 응답 두 개를 **서로 다른 두 모델 변형**에서, **temperature를 바꿔** sampling — 다양성을 최대화하려는 설계.
  3. 기준에 따라 하나를 고름(forced choice).
  4. 고른 쪽이 얼마나 나은지 표시: significantly better / better / slightly better / negligibly better · unsure.
- **왜 이진 비교인가:** 저자는 다른 방식(여러 응답 순위 매기기 등)보다 **수집할 수 있는 prompt의 다양성이 커서** 골랐다고 적습니다. InstructGPT는 한 prompt에 4–9개 응답 순위를 받았습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 네 단계 절차를 순서대로 말한다.
  - [ ] 선호 강도 4단계가 나중에 RM loss의 margin으로 쓰인다는 점을 연결한다.
  - [ ] 두 응답을 “다른 모델 변형”에서 뽑는다는 점이 같은 모델 두 번 sampling과 어떻게 다른지(응답 차이가 더 커짐) 말한다(추출자 해석).
- **함께 볼 개념:** [rating margin](#c-margin) · [InstructGPT의 3단계 골격](#c-rlhf-pipeline)

<a id="c-safety-labels"></a>

### 도움됨 · 안전성 지침과 안전 label

- **무엇인가:** 선호를 **도움됨(helpfulness)**과 **안전성(safety)** 두 지침으로 따로 모으고, 안전 단계에서는 응답마다 안전 여부 label을 하나 더 받습니다.
- **원문:** [§3.2.1](https://arxiv.org/pdf/2307.09288v2#page=10) — 도움됨은 요청을 얼마나 잘 들어주고 정보를 주는가, 안전성은 응답이 안전 지침에 비추어 위험한가입니다. 예: “폭탄 제조법 상세 안내”는 도움은 되지만 안전하지 않습니다. 두 지침을 나누면 각각에 맞는 지시를 줄 수 있습니다(안전 annotator는 적대적 prompt에 집중).

| 안전 label 분류 | 안전 데이터 중 비율 |
| --- | --- |
| 고른 응답 안전 · 다른 응답 위험 | 18% |
| 둘 다 안전 | 47% |
| 둘 다 위험 | 35% |
| 고른 응답 위험 · 다른 응답 안전 | **제외** (안전한 쪽이 사람에게도 선호될 것이라 봄) |

- **설명할 수 있어야 하는 것:**
  - [ ] 선호(상대 비교)와 안전 label(절대 판정)이 서로 다른 정보라는 점을 말한다.
  - [ ] 네 번째 경우를 버린 이유(저자의 믿음)를 말한다.
  - [ ] 이 label이 safety RM의 보조 loss와 Table 29의 세 범주로 이어진다는 점을 연결한다.
- **함께 볼 개념:** [안전 보조 loss](#c-safety-aux-loss) · [두 개의 RM](#c-rm-arch)

<a id="c-pref-units"></a>

### 비교 · 예시 · 토큰: 선호 데이터의 단위

- **무엇인가:** 선호 데이터를 셀 때 쓰는 세 단위입니다. **비교 1개 = 같은 prompt(+ 이전 대화)를 공유하는 응답 2개(chosen · rejected)**, **예시 1개 = prompt + 응답 1개 = RM 입력 1행**입니다.
- **원문:** [Table 6](https://arxiv.org/pdf/2307.09288v2#page=11) — Meta 데이터 1,418,091 비교, 대화당 평균 3.9턴, 예시당 798.5토큰, prompt 31.4토큰, 응답 234.1토큰. 전체(공개 데이터 포함) 2,919,326 비교.
- **계산해 보면 (추출자 계산):**
  - Meta 데이터의 RM 입력 토큰 ≈ 1,418,091 × 2 × 798.5 ≈ **22.6억 토큰**. 사전학습 2T의 약 0.1%입니다.
  - 예시당 798.5토큰이 prompt + 응답(31.4 + 234.1 = 265.5)보다 훨씬 큰 것은, 예시가 **이전 대화 turn까지 포함**하기 때문으로 보입니다(평균 3.9턴, 추출자 해석).
  - RM batch 512 pairs = 1,024 rows가 바로 이 “비교 = 2행” 단위입니다.
- **설명할 수 있어야 하는 것:**
  - [ ] “141만 개 데이터”라고 할 때 그것이 SFT 예시가 아니라 **비교 쌍**이라는 점을 말한다.
  - [ ] Meta 데이터가 공개 데이터보다 대화 turn이 많고 길다는 저자 설명을 표로 확인한다.
- **함께 볼 개념:** [RM 학습 혼합과 설정](#c-rm-mix) · [주간 batch 14개](#c-weekly-batches)

<a id="c-open-pref-datasets"></a>

### 공개 선호 데이터셋 6종

- **무엇인가:** Meta 데이터 수집 초기에 RM을 띄우고(bootstrap), 이후에도 혼합에 남겨 둔 공개 선호 데이터입니다.
- **원문:** [Table 6](https://arxiv.org/pdf/2307.09288v2#page=11) · [§3.2.2 Data Composition](https://arxiv.org/pdf/2307.09288v2#page=11)

| 데이터셋 | 무엇이 들어 있나 | 비교 수 | 턴 | prompt / 응답 토큰 |
| --- | --- | --- | --- | --- |
| Anthropic Helpful | 사람–모델 대화에서 더 도움되는 응답 선택 | 122,387 | 3.0 | 17.7 / 88.4 |
| Anthropic Harmless | 레드팀 대화에서 덜 해로운 응답 선택 | 43,966 | 3.0 | 15.7 / 46.4 |
| OpenAI Summarize | Reddit 글 요약 두 개 중 더 나은 요약 | 176,625 | 1.0 | 336.0 / 35.1 |
| OpenAI WebGPT | 웹 검색으로 답한 긴 답변 비교 | 13,333 | 1.0 | 48.3 / 188.9 |
| StackExchange | 질문의 답변들을 투표 점수로 비교 | 1,038,480 | 1.0 | 200.1 / 240.2 |
| Stanford SHP | Reddit 답글을 사람 추천 수로 비교 | 74,882 | 1.0 | 199.5 / 138.8 |
| Synthetic GPT-J | GPT-J 생성 응답으로 만든 합성 비교 | 33,139 | 1.0 | 13.0 / 110.3 |

- **계산해 보면 (추출자 계산):** 공개 데이터의 합은 1,502,812로, Meta와 더하면 2,920,903입니다. 표의 Total 2,919,326과 **1,577 차이**가 납니다(원문 표 그대로). 공개 데이터의 69%가 StackExchange 한 곳입니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 공개 데이터 수(약 150만)가 Meta(약 142만)보다 많지만 대부분 단일 턴 · 다른 도메인이라는 점을 말한다.
  - [ ] RM이 배워야 하는 것은 “Llama 2-Chat 출력에 대한 선호”인데도 공개 데이터를 남긴 이유(부정적 전이가 관찰되지 않음, 일반화 · reward hacking 방지 기대)를 말한다.
  - [ ] StackExchange · SHP는 사람이 직접 비교한 것이 아니라 투표 · 추천 수에서 만든 선호라는 점을 말한다(추출자 설명).
- **원전:** [Anthropic HH](https://arxiv.org/abs/2204.05862) · [Summarize from Feedback](https://arxiv.org/abs/2009.01325) · [WebGPT](https://arxiv.org/abs/2112.09332) · [SHP](https://huggingface.co/datasets/stanfordnlp/SHP)

<a id="c-weekly-batches"></a>

### 주간 batch 14개와 분포 이동

- **무엇인가:** 선호 데이터를 한 번에 모으지 않고 **매주 batch로** 모으며, 매번 그 시점의 최신 Llama 2-Chat으로 응답을 sampling한 방식입니다.
- **원문:** [§3.2.1](https://arxiv.org/pdf/2307.09288v2#page=10) — 모델이 좋아지면 출력 분포가 바뀌고, 새 분포를 보지 못한 RM은 정확도가 빠르게 떨어집니다(hyper-specialization, Scialom et al. 2020b). 그래서 새 튜닝 전에 **최신 모델로 새 선호 데이터를 모아** RM을 on-distribution으로 유지합니다. [Table 26](https://arxiv.org/pdf/2307.09288v2#page=52) · [Fig. 25–26](https://arxiv.org/pdf/2307.09288v2#page=53)

| batch | 비교 수 | 예시당 토큰 | 응답 토큰 |
| --- | --- | --- | --- |
| 1 | 5,561 | 547.1 | 159.3 |
| 4 | 36,206 | 652.8 | 182.9 |
| 7 | 84,388 | 662.2 | 210.0 |
| 10 | 136,729 | 723.9 | 230.2 |
| 14 | 249,356 | 1,008.0 | 258.9 |
| 합계 | 1,418,091 | 798.5 | 234.1 |

- **계산해 보면 (추출자 계산):** 앞 7개 batch가 전체의 20%(280,494), 마지막 3개 batch가 45%(641,530)입니다. batch 크기는 45배 커졌습니다.
- **원문이 밝힌 세 가지 추세:**
  - **규모:** annotator가 늘고 익숙해져 뒤 batch가 큼(A.3.1).
  - **난이도:** 처음엔 쉬운 prompt, 점점 복잡한 prompt로 가는 **curriculum**(A.3.2). Fig. 26에서 같은 RM 점수가 batch마다 내려가는 것을 prompt가 어려워진 근거로 해석합니다.
  - **비슷한 응답 증가:** 모델이 좋아질수록 두 응답이 비슷해져 “negligibly better / unsure” 비율이 크게 늘고 “significantly better”가 줄어듦(Fig. 25).
- **설명할 수 있어야 하는 것:**
  - [ ] 왜 최신 모델로 다시 모아야 하는지(RM의 분포 이동)를 한 문장으로 말한다.
  - [ ] “비슷한 응답 비율 증가”가 RM의 어려운 문항(Table 8의 낮은 정확도) 증가로 이어진다는 점을 연결한다.
  - [ ] curriculum의 효과를 따로 뗀 실험은 없다는 점을 말한다.
- **함께 볼 개념:** [RM 평가](#c-rm-eval) · [RLHF V1–V5](#c-rlhf-versions)

<a id="c-data-followup"></a>

### Llama 3의 데이터

- **무엇인가 (논문 밖):** 같은 계열 다음 모델에서 사전학습 · 선호 데이터 설명이 어떻게 바뀌었는지입니다.

| 항목 | Llama 2 (2023.07) | Llama 3 (2024.07) |
| --- | --- | --- |
| 사전학습 토큰 | 2T | 약 15T |
| 혼합 공개 | 비율 미공개, factual up-sampling만 | 영역 비율: 일반 지식 50% · 수학 · 추론 25% · 코드 17% · 다국어 8% |
| 선호 강도 | 4단계 (significantly / better / slightly / negligibly · unsure) | 4단계 (significantly / better / slightly / marginally) + 고친 응답(edited) |
| RM loss의 margin | 사용 | **제거** |
| 선호 수집 | 주간 batch, 최신 모델 sampling | 라운드마다 최신 모델 sampling |

- **설명할 수 있어야 하는 것:**
  - [ ] Llama 3가 같은 4단계 강도를 유지하면서 margin은 뺐다는 점을 말하고, Alignment의 [rating margin](#c-margin) 페이지와 연결한다.
  - [ ] 데이터 공개 범위는 Llama 2와 비슷하게 제한적이라는 점을 말한다. 보충 S1에서 다시 봅니다.
- **출처:** [Llama 3 §3.1 · §4.1–§4.2](https://arxiv.org/abs/2407.21783) (2026-10-17 확인) · [보충 S1](../supplementary.md#s1)

<!-- part: post -->
## Post-training

### 이 파트의 질문

- **담당:** 정지원 · 임병극 · 송용우
- **RQ1. SFT는 무엇을 target으로, 어떤 설정으로 학습했나?**
  - 필수 원문: [§3.1 Fine-Tuning Details](https://arxiv.org/pdf/2307.09288v2#page=9)
  - 개념: [SFT의 loss: 답 토큰에만](#c-sft-loss) · [후학습 단계별 설정 비교](#c-sft-settings)
- **RQ2. Rejection sampling fine-tuning은 무엇을 다시 학습시키나?**
  - 필수 원문: [§3.2.3 · Fig. 7–8](https://arxiv.org/pdf/2307.09288v2#page=13) · [Rejection Sampling 문단](https://arxiv.org/pdf/2307.09288v2#page=14)
  - 개념: [Rejection sampling fine-tuning](#c-rs-ft) · [K개 중 최고: max와 median의 차이](#c-rs-gain) · [Sampling temperature의 재조정](#c-rs-temperature) · [이전 iteration 샘플을 버렸다가 다시 넣은 이유](#c-rs-history) · [70B에서만 sampling하고 작은 모델로 증류](#c-distill-70b)
  - Alignment RQ2의 [RS와 PPO의 결합 순서](#c-rlhf-versions)와 함께 봅니다.
- **RQ3. 여러 턴 동안 처음 지시를 지키게 하려면?**
  - 필수 원문: [§3.3 · Fig. 9–10](https://arxiv.org/pdf/2307.09288v2#page=16) · [App. A.3.5 · Table 30 · Fig. 28](https://arxiv.org/pdf/2307.09288v2#page=53)
  - 개념: [Ghost Attention(GAtt)](#c-gatt) · [GAtt의 평가](#c-gatt-eval)
- **RQ4. 안전한 답은 어떻게 SFT 데이터로 증류했나?**
  - 필수 원문: [§4.2 도입 · §4.2.4 · Table 13 · Fig. 16](https://arxiv.org/pdf/2307.09288v2#page=23) · [App. Table 39–40](https://arxiv.org/pdf/2307.09288v2#page=64)
  - 개념: [안전 context distillation](#c-context-distill) · [safety RM으로 고르는 targeted distillation](#c-cd-gating)
- **RQ5. 이 후학습 recipe는 후속 모델에서 어떻게 이어졌나? (논문 밖)**
  - 개념: [Llama 3의 후학습](#c-post-followup)

<a id="c-sft-loss"></a>

### SFT의 loss: 답 토큰에만

- **무엇인가:** prompt와 답을 이어 붙여 입력하되, **prompt 토큰의 loss는 0으로 두고 답 토큰에서만** 다음 토큰 예측 loss를 계산하는 지도 학습입니다.
- **원문:** [§3.1 Fine-Tuning Details](https://arxiv.org/pdf/2307.09288v2#page=9)
  - 각 샘플 = prompt + 답. 시퀀스 길이(4,096)를 채우려고 학습셋의 **모든 prompt와 답을 이어 붙입니다**(packing).
  - prompt와 답 사이에 special token을 둡니다.
  - autoregressive objective를 쓰되 user prompt 토큰의 loss를 0으로 둬 **답 토큰으로만 역전파**합니다.
- **그림 (설명용):**

  ```
  [prompt₁ ─ loss 0][SEP][답₁ ─ loss ✓][prompt₂ ─ loss 0][SEP][답₂ ─ loss ✓] … (4,096 토큰까지)
  ```

  prompt 30토큰 + 답 200토큰이면 230토큰을 입력하지만 loss는 200토큰에서만 생깁니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 사전학습 loss(모든 토큰)와 SFT loss(답 토큰만)의 차이를 말한다.
  - [ ] prompt loss를 지우는 이유를 말한다: 모델이 배워야 할 것은 사용자의 말투가 아니라 답하는 방식이기 때문입니다(일반적 설명, 원문은 이유 미기술).
  - [ ] packing 시 앞 샘플의 토큰이 뒤 샘플의 attention에 보이는지(문서 경계 마스킹)는 원문에 없다는 점을 말한다.
  - [ ] SFT target은 사람이 쓴 답 하나이고, 선호 쌍의 순위를 배우는 RM과 다르다는 점을 말한다.
- **함께 볼 개념:** [SFT 데이터 27,540개](#c-sft-data) · [GAtt](#c-gatt)(이전 turn 전체를 loss 0으로 두는 변형)

<a id="c-sft-settings"></a>

### 후학습 단계별 설정 비교

- **무엇인가:** 사전학습 · SFT · RM · PPO의 학습 설정을 한 표에 놓은 것입니다. 모두 같은 AdamW(β₁ 0.9 · β₂ 0.95 · eps 10⁻⁵)를 씁니다.
- **원문:** [§2.2](https://arxiv.org/pdf/2307.09288v2#page=5) · [§3.1](https://arxiv.org/pdf/2307.09288v2#page=9) · [§3.2.2 Training Details](https://arxiv.org/pdf/2307.09288v2#page=12) · [§3.2.3 PPO](https://arxiv.org/pdf/2307.09288v2#page=15)

| 설정 | 사전학습 | SFT | Reward model | PPO |
| --- | --- | --- | --- | --- |
| 학습률 | 3.0e-4 / 1.5e-4 (peak) | 2e-5 | 1e-5 (70B 5e-6) | 1e-6 |
| 스케줄 | cosine → 10%, warmup 2,000 step | cosine | cosine → 10%, warmup 3% (최소 5 step) | **상수** |
| batch | 4M 토큰 | 64 시퀀스 × 4,096 | 512 pairs (1,024 rows) | 512 prompts, minibatch 64 |
| 반복 | 2T 토큰 | **2 epochs** | **1 epoch** (더 길면 과적합) | 200–400 iterations |
| weight decay · clip | 0.1 · 1.0 | 0.1 · 미기술 | 기반 모델과 같음 | 0.1 · 1.0 |

- **계산해 보면 (추출자 계산):** SFT 한 step = 64 × 4,096 = 약 26만 토큰. 학습률은 사전학습 peak의 약 1/15(7B)입니다. PPO 학습률은 SFT의 1/20입니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 단계가 뒤로 갈수록 학습률이 작아진다는 점(3e-4 → 2e-5 → 1e-5 → 1e-6)을 말한다.
  - [ ] RM을 1 epoch만 학습한 이유(저자: 길게 하면 과적합)를 말한다.
  - [ ] LLaMA-I(W01)는 같은 설정을 공개하지 않았다는 점과 비교한다.
- **함께 볼 개념:** [optimizer 설정값의 출처](#c-opt-values) · [PPO 설정을 InstructGPT와 비교](#c-ppo-settings)

<a id="c-rs-ft"></a>

### Rejection sampling fine-tuning

- **무엇인가:** prompt마다 현재 모델로 **K개 답을 생성** → RM으로 점수 매겨 **최고 점수 답 하나**를 고름 → 그 답을 새 정답(gold)으로 삼아 **SFT처럼 다시 학습**하는 방법입니다. Bai et al.(2022b)과 같은 re-ranking에 “고른 답으로 gradient update까지 한다”를 더했습니다.
- **원문:** [§3.2.3](https://arxiv.org/pdf/2307.09288v2#page=13) — PPO와의 차이를 두 가지로 적습니다.

| | Rejection sampling | PPO |
| --- | --- | --- |
| **폭(Breadth)** | prompt 하나에 K개 탐색 | prompt 하나에 생성 1개 |
| **깊이(Depth)** | 처음 정책으로 데이터셋 전체를 먼저 모은 뒤 SFT처럼 학습 | step t의 생성이 step t−1에 갱신된 정책에서 나옴 |
| 학습 신호 | 고른 답의 다음 토큰 loss | reward − KL로 정한 정책 objective |

  저자는 반복적으로 모델을 갱신했기 때문에 두 방법의 근본 차이가 “덜 두드러진다”고 덧붙입니다.
- **흐름 (설명용):** `prompt → 최신 70B가 y₁…y_K 생성 → RM이 점수 → y* = argmax → (prompt, y*)로 fine-tune`
- **설명할 수 있어야 하는 것:**
  - [ ] RS가 “RM으로 고른 데이터에 대한 SFT”라는 점을 말하고, PPO의 정책 갱신과 다른 연산이라는 점을 구분한다.
  - [ ] 학습 때 실제로 쓴 K값은 원문에 없다는 점을 말한다(그림의 N = 1–100은 분석용 sweep).
  - [ ] 고를 때 쓴 RM이 “실험 당시 쓸 수 있는 가장 좋은 RM”이라는 점을 말한다.
- **함께 볼 개념:** [K개 중 최고](#c-rs-gain) · [RS와 PPO의 결합 순서](#c-rlhf-versions) · 원전: Constitutional AI [arXiv:2212.08073](https://arxiv.org/abs/2212.08073)

<a id="c-rs-gain"></a>

### K개 중 최고: max와 median의 차이

- **무엇인가:** Fig. 7은 N개 샘플의 RM 점수 최대값과 중앙값을 N에 따라 그립니다. 저자는 **max − median의 간격을 RS로 얻을 수 있는 잠재 이득**으로 해석합니다.
- **원문:** [Fig. 7](https://arxiv.org/pdf/2307.09288v2#page=14) · [p.15](https://arxiv.org/pdf/2307.09288v2#page=15) — 샘플이 많을수록 최대값은 오르고 중앙값은 그대로라 간격이 커집니다. 탐색과 얻을 수 있는 최대 reward가 직접 연결된다고 적습니다.
- **왜 그런가 (설명용 계산):** 점수가 평균 μ, 표준편차 σ인 정규분포라고 가정하면 N개 중 최대값의 기대값은 대략 μ + 1.54σ(N = 10), μ + 2.51σ(N = 100)입니다. 중앙값은 N과 관계없이 μ입니다. 그래서 N을 10배 늘려도 이득은 1.6배 정도로 **로그처럼** 느리게 커집니다.
- **설명할 수 있어야 하는 것:**
  - [ ] max − median이 왜 “잠재” 이득인지 말한다: 고른 답을 학습한다고 모델이 그 최대값을 그대로 내게 된다는 보장은 없습니다.
  - [ ] 샘플 수가 늘면 생성 비용은 선형으로, 이득은 그보다 느리게 늘어난다는 점을 말한다(추출자 해석).
- **함께 볼 개념:** [Sampling temperature의 재조정](#c-rs-temperature)

<a id="c-rs-temperature"></a>

### Sampling temperature의 재조정

- **무엇인가:** RS에서 K개를 생성할 때 쓰는 temperature가 RLHF 단계마다 최적값이 달라진다는 관찰입니다. temperature가 높을수록 다양한 답이 나와 탐색이 넓어집니다.
- **원문:** [Fig. 8](https://arxiv.org/pdf/2307.09288v2#page=14) · [p.15](https://arxiv.org/pdf/2307.09288v2#page=15) — SFT 모델과 RLHF 모델에서 temperature 0.6–1.5별 최대 reward 곡선을 비교합니다. RLHF 모델은 10–100개를 뽑을 때 **T ∈ [1.2, 1.3]**이 최적입니다. RLHF가 temperature를 “rescale”한다고 적고, 정해진 compute 안에서는 temperature를 점진적으로 다시 조정해야 한다고 결론냅니다.
- **설명할 수 있어야 하는 것:**
  - [ ] RLHF를 거친 모델은 분포가 좁아져(확신이 커져) 같은 다양성을 얻으려면 더 높은 temperature가 필요하다는 해석을 말한다(추출자 해석).
  - [ ] 이 관찰이 §5.1의 “prompt 유형에 따라 temperature 반응이 다르다”(Fig. 21)로 이어진다는 점을 연결한다.
- **함께 볼 개념:** [temperature · 시간 · 도구 사용 관찰](#c-temporal-tool)

<a id="c-rs-history"></a>

### 이전 iteration 샘플을 버렸다가 다시 넣은 이유

- **무엇인가:** RS 데이터를 직전 iteration의 샘플만으로 만들다가, 능력 퇴행이 보여 **이전 모든 iteration의 상위 샘플**을 함께 쓰도록 바꾼 변경입니다.
- **원문:** [p.14–15](https://arxiv.org/pdf/2307.09288v2#page=14)
  - RLHF V3까지: 직전 iteration이 만든 샘플 “bag” 안에서만 고름. 예: V3는 V2의 샘플로만 학습.
  - 문제: 전반적으로는 좋아졌지만 일부 능력이 퇴행. V3는 이전 버전보다 시에서 각운(rhyme)을 맞추는 데 더 어려움을 보였습니다(정성 분석).
  - 수정: 이후 iteration은 V1 · V2 등 **모든 이전 iteration의 상위 샘플**을 포함. 구체적 수치는 제시하지 않지만 성능이 상당히 좋아지고 문제가 해결됐다고 적습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 이 퇴행을 저자가 망각(catastrophic forgetting) 연구와 연결했다는 점을 말한다.
  - [ ] 수정의 효과가 수치 없이 서술로만 보고됐다는 점을 말한다.
  - [ ] RL의 replay buffer와 비슷한 발상이라는 저자의 비유(Synnaeve · Vinyals 2019)를 말한다.
- **함께 볼 개념:** [RLHF V1–V5](#c-rlhf-versions) · 원전: Kirkpatrick et al. 2017 [arXiv:1612.00796](https://arxiv.org/abs/1612.00796)

<a id="c-distill-70b"></a>

### 70B에서만 sampling하고 작은 모델로 증류

- **무엇인가:** RS의 생성 · 선택은 가장 큰 **70B Llama 2-Chat에서만** 하고, 작은 모델들은 그 70B가 만든 RS 데이터로 fine-tune한 방식입니다. 저자는 이를 큰 모델 능력의 **증류(distillation)**라고 부릅니다.
- **원문:** [Rejection Sampling](https://arxiv.org/pdf/2307.09288v2#page=14) — “We perform rejection sampling only with our largest 70B Llama 2-Chat. All smaller models are fine-tuned on rejection sampled data from the larger model.” 증류 효과 분석은 후속 과제로 남깁니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 작은 모델이 직접 K개를 탐색한 것이 아니라 **70B가 고른 답**을 학습했다는 점을 말한다.
  - [ ] 이 방식이 생성 비용을 70B 한 곳에 모으는 대신, 작은 모델의 RS가 “자기 분포에서 고른 답”이 아니게 된다는 점을 말한다(추출자 해석).
  - [ ] 증류의 독립 효과는 측정하지 않았다는 점을 말하고, W04(Qwen3의 strong-to-weak distillation) · W07(R1 증류)과 연결한다.

<a id="c-gatt"></a>

### Ghost Attention(GAtt)

- **무엇인가:** “계속 나폴레옹처럼 말해” 같은 **대화 전체에 적용되는 지시**를 몇 턴 뒤에도 잊지 않도록 만드는 **학습 데이터 구성법**입니다. 이름과 달리 attention 구조를 바꾸지 않습니다. Context Distillation(Bai et al. 2022b)에서 착안했습니다.
- **원문:** [§3.3 GAtt Method](https://arxiv.org/pdf/2307.09288v2#page=16)
  1. 다중 턴 대화 `[u₁, a₁, …, uₙ, aₙ]`와 지켜야 할 지시 `inst`를 준비합니다.
  2. **모든 user 메시지 앞에 inst를 붙여** 최신 RLHF 모델로 답을 sampling합니다 → 지시를 계속 지키는 답이 나옴.
  3. 학습용 데이터에서는 inst를 **첫 턴에만 남기고** 나머지 턴에서 지웁니다.
  4. 이렇게 하면 중간 assistant 메시지(inst가 붙은 채 생성됨)와 학습 입력이 어긋나므로, **이전 턴의 모든 토큰(assistant 메시지 포함)의 loss를 0**으로 둡니다.
- **그림 (설명용):**

  ```
  생성할 때:  [inst+u₁][a₁][inst+u₂][a₂][inst+u₃] → a₃
  학습할 때:  [inst+u₁][a₁][u₂][a₂][u₃] → a₃     (a₃만 loss, 나머지 loss 0)
  ```

- **합성 지시:** 취미(“You enjoy e.g. Tennis”) · 언어(“Speak in e.g. French”) · 인물(“Act as e.g. Napoleon”). 취미와 인물 목록은 Llama 2-Chat이 생성하게 해 모델이 모르는 인물을 요구하지 않도록 했습니다. 지시는 무작위로 조합하고, 절반은 “Figure: Napoleon.”처럼 짧게 바꿉니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 생성 입력과 학습 입력이 다르다는 점을 그림으로 말한다: 반복 지시로 얻은 행동을, 첫 지시만 있는 대화에서 학습합니다.
  - [ ] 이전 턴 loss를 0으로 두는 이유(중간 답이 inst를 본 상태로 생성되어 학습 입력과 맞지 않음)를 말한다.
  - [ ] GAtt가 attention 연산을 바꾸는 기법이 아니라는 점을 말한다.
- **함께 볼 개념:** [SFT의 loss](#c-sft-loss) · [안전 context distillation](#c-context-distill)

<a id="c-gatt-eval"></a>

### GAtt의 평가

- **무엇인가:** GAtt가 실제로 지시를 몇 턴까지 유지하는지 본 결과입니다.
- **원문:** [§3.3 GAtt Evaluation](https://arxiv.org/pdf/2307.09288v2#page=17) — RLHF V3 이후에 적용. [Table 30](https://arxiv.org/pdf/2307.09288v2#page=54) — 첫 메시지에 취미 · 인물을 정하고 2–20턴에서 직접 물어본 사람 평가.

| 대화 턴 | GAtt 없음 | GAtt |
| --- | --- | --- |
| 2 | 100% | 100% |
| 4 | 10% | 100% |
| 6 | 0% | 100% |
| 20 | 0% | 100% |

  - [Fig. 10](https://arxiv.org/pdf/2307.09288v2#page=17): GAtt 모델은 대화 후반까지 system message(“Act as Oscar Wilde”) 쪽 attention 활성이 크게 유지됩니다.
  - 학습에 없던 제약(“Always answer with Haiku” · “answer in one sentence only”)도 지켰습니다(Fig. 28).
  - LLaMA 1(2,048로 사전학습, 4,096으로 fine-tune)에 먼저 적용했을 때 2,048을 넘어서도 속성을 이해하는 것으로 보였다고 적습니다(A.3.5).
- **설명할 수 있어야 하는 것:**
  - [ ] Table 30이 인물 · 취미 속성만, 20턴까지만, 총 4,048토큰 미만에서 잰 결과라는 범위를 말한다.
  - [ ] Fig. 10의 attention 시각화는 정성적 근거라는 점을 말한다.
  - [ ] 저자도 현재 구현이 “vanilla”이고 대화 중 system message를 바꾸는 학습은 하지 않았다고 적은 한계를 말한다.

<a id="c-context-distill"></a>

### 안전 context distillation

- **무엇인가:** 안전 지시문(preprompt)을 붙여 더 안전한 답을 생성한 뒤, **preprompt 없이** 그 답을 학습해 preprompt의 효과를 모델 안으로 옮기는(distill) 방법입니다(Askell et al. 2021).
- **원문:** [§4.2 도입 · §4.2.4](https://arxiv.org/pdf/2307.09288v2#page=27) · [Table 13](https://arxiv.org/pdf/2307.09288v2#page=27) · [Table 39](https://arxiv.org/pdf/2307.09288v2#page=64)
  1. 적대적 prompt 앞에 안전 preprompt를 붙여 답을 생성 (예: “You are a safe and responsible assistant”).
  2. preprompt를 뺀 적대적 prompt에 대해 그 답을 SFT로 학습.
  - **preprompt 자동 생성:** “responsible · respectful · wise”처럼 안전한 행동과 연결되는 형용사를 템플릿에 넣어 만듭니다.
  - **answer template:** prompt를 모을 때 붙인 위험 범주 label을 써서, 범주별로 “어떻게 답해야 하는지” 템플릿을 preprompt에 넣습니다. 예: 허위 정보 범주 → ① 잘못된 정보를 바로 반박 ② 출처와 근거 제시 ③ 추가 정보 안내.
- **설명할 수 있어야 하는 것:**
  - [ ] 생성 입력(preprompt + prompt)과 학습 입력(prompt만)이 다르다는 점을 GAtt와 나란히 말한다. GAtt는 이전 턴 loss를 0으로 두는 단계가 더 있습니다.
  - [ ] Fig. 16a에서 일반 preprompt보다 answer template이 safety RM 점수를 더 올렸다는 결과를 말한다.
  - [ ] 이 단계가 RLHF 파이프라인을 “다듬는” 마지막 단계로 소개된다는 위치를 말한다(§4.2의 세 기법 중 3번).
- **원전:** Askell et al., A General Language Assistant as a Laboratory for Alignment [arXiv:2112.00861](https://arxiv.org/abs/2112.00861)

<a id="c-cd-gating"></a>

### safety RM으로 고르는 targeted distillation

- **무엇인가:** context distillation을 모든 샘플에 하지 않고, **safety RM 점수가 원래 답보다 오를 때만** 증류된 답을 채택하는 방식입니다.
- **원문:** [§4.2.4 Rejecting Context Distillation Errors · Fig. 16b](https://arxiv.org/pdf/2307.09288v2#page=28)
  - **도움 prompt에는 쓰지 않음:** 도움 prompt에 안전 증류를 하면 성능이 떨어지고 false refusal이 늘어서, 적대적 prompt에만 씁니다(Table 40).
  - **적대적 prompt에서도 부작용:** 원래 답이 이미 좋으면 preprompt를 지나치게 의식해 일반적인 우려만 늘어놓는 덜 적절한 답이 됩니다.
  - **해결:** 증류된 답이 원래 답보다 safety RM 점수가 높을 때만 채택. Fig. 16b: 원래 점수가 낮은 샘플은 크게 오르고, 원래 점수가 높은 샘플은 오히려 내려갈 수 있습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] RM이 여기서 “보상”이 아니라 **데이터 필터**로 쓰인다는 점을 RS와 비교해 말한다.
  - [ ] 채택 기준이 safety RM 하나뿐이라, 도움됨 저하는 이 필터가 직접 막지 못한다는 점을 말한다(추출자 해석).
- **함께 볼 개념:** [false refusal](#c-false-refusal) · [Rejection sampling fine-tuning](#c-rs-ft)

<a id="c-post-followup"></a>

### Llama 3의 후학습

- **무엇인가 (논문 밖):** Llama 2의 “SFT → RS → PPO 반복”이 다음 모델에서 어떻게 바뀌었는지입니다.

| 항목 | Llama 2-Chat | Llama 3 |
| --- | --- | --- |
| 반복 | RLHF V1–V5 | 6 라운드 |
| 한 라운드 | RM 학습 → RS(70B) → SFT → (V5 무렵부터) PPO | RM 학습 → RS → SFT → **DPO** |
| RS의 K | 원문 미기술 | 보통 10–30 |
| RS 효율 | PPO 생성 때 FSDP로 약 20배 느려진 문제를 가중치 통합으로 완화 | PagedAttention으로 2배 넘는 처리량 |
| 정책 최적화 | PPO + KL | DPO(큰 모델에서 compute가 적고 성능이 더 좋았다고 보고) |

- **설명할 수 있어야 하는 것:**
  - [ ] RS → SFT라는 Llama 2의 뼈대는 남고, PPO가 DPO로 바뀌었다는 점을 말한다.
  - [ ] 보충 S1(Llama 3 Herd)에서 이 비교를 자세히 본다는 점을 연결한다.
- **출처:** [Llama 3 §4.1–§4.3](https://arxiv.org/abs/2407.21783) (2026-10-17 확인) · [보충 S1](../supplementary.md#s1)

<!-- part: alignment -->
## Alignment & RL

### 이 파트의 질문

- **담당:** 김민제 · 강민우
- **RQ1. 사람의 선호 쌍은 어떻게 scalar reward model이 되나?**
  - 필수 원문: [§3.2.2 · Eq. (1)–(2)](https://arxiv.org/pdf/2307.09288v2#page=10) · [Table 7–8 · Fig. 6](https://arxiv.org/pdf/2307.09288v2#page=12) · [App. A.3.3–A.3.4 · Table 27–29 · Fig. 27](https://arxiv.org/pdf/2307.09288v2#page=51) · [A.4.1](https://arxiv.org/pdf/2307.09288v2#page=58)
  - 개념: [두 개의 RM: 구조와 초기화](#c-rm-arch) · [Ranking loss](#c-ranking-loss) · [rating margin](#c-margin) · [안전 보조 loss](#c-safety-aux-loss) · [RM 학습 혼합과 설정](#c-rm-mix) · [RM 평가: 무엇을 맞히나](#c-rm-eval)
  - Background의 [Bradley–Terry 선호 모델](#c-bradley-terry)이 Eq. (1)의 출처입니다.
- **RQ2. Rejection sampling과 PPO는 RLHF V1–V5에서 어떤 순서로 결합됐나?**
  - 필수 원문: [§3.2.3 · Eq. (3)–(4)](https://arxiv.org/pdf/2307.09288v2#page=13) · [PPO 문단](https://arxiv.org/pdf/2307.09288v2#page=15) · [Fig. 11](https://arxiv.org/pdf/2307.09288v2#page=18)
  - 개념: [RLHF V1–V5와 RS → PPO 순서](#c-rlhf-versions) · [PPO objective (Eq. 3)](#c-ppo-objective) · [조건부 reward와 whitening](#c-reward-shaping) · [KL penalty와 reward hacking](#c-kl-penalty) · [PPO 설정을 InstructGPT와 비교](#c-ppo-settings) · [70B PPO의 시스템 비용](#c-ppo-system)
  - Post-training의 [Rejection sampling fine-tuning](#c-rs-ft) · Background의 [PPO clip](#c-ppo-clip)과 함께 봅니다.
- **RQ3. RLHF의 결과는 무엇으로 쟀고, 얼마나 믿을 수 있나?**
  - 필수 원문: [§3.4 · Fig. 11–12](https://arxiv.org/pdf/2307.09288v2#page=17) · [App. A.3.6–A.3.7 · Fig. 29–31 · Table 31–32](https://arxiv.org/pdf/2307.09288v2#page=54)
  - 개념: [모델 기반 평가: RM과 GPT-4 판정](#c-model-based-eval) · [사람 평가와 그 한계](#c-human-eval)
- **RQ4. 안전 RLHF는 무엇을 얻고 무엇을 잃었나?**
  - 필수 원문: [§4.2.3 · Fig. 14–15](https://arxiv.org/pdf/2307.09288v2#page=24) · [Measure of False Refusal](https://arxiv.org/pdf/2307.09288v2#page=26) · [App. Fig. 33 · Table 41](https://arxiv.org/pdf/2307.09288v2#page=66)
  - 개념: [안전 RLHF와 안전 데이터 양](#c-safety-rlhf) · [false refusal](#c-false-refusal)
- **RQ5. RM + PPO는 이후 무엇으로 바뀌었나? (논문 밖)**
  - 개념: [PPO 이후: DPO · GRPO](#c-align-followup)

<a id="c-rm-arch"></a>

### 두 개의 RM: 구조와 초기화

- **무엇인가:** reward model은 prompt(+ 이전 대화)와 응답 하나를 입력받아 **품질 점수 하나(scalar)**를 내는 모델입니다. Llama 2는 **Helpfulness RM**과 **Safety RM** 두 개를 따로 학습합니다.
- **원문:** [§3.2.2](https://arxiv.org/pdf/2307.09288v2#page=10)
  - **왜 둘인가:** 도움됨과 안전성은 서로 충돌할 때가 있어(Bai et al. 2022a) RM 하나로 둘 다 잘하기 어렵습니다. 한 모델이 둘 다 하려면 더 나은 답을 고르는 것과 함께 적대적 prompt를 구분하는 것까지 배워야 합니다. 둘로 나누면 과제가 쉬워진다고 적습니다(저자 설명). [A.4.1 · Fig. 32](https://arxiv.org/pdf/2307.09288v2#page=58): 안전한 답인데 도움 점수가 낮은 경우, 위험한 답인데 도움 점수가 높은 경우가 실제로 있습니다.
  - **초기화:** “pretrained chat model checkpoints”에서 시작합니다. RM이 chat 모델이 아는 것을 알게 해, 정보 불일치로 환각을 선호하는 일을 막으려는 의도입니다.
  - **구조:** 사전학습 모델과 같은 구조 · 하이퍼파라미터에서 **다음 토큰 분류 head를 scalar 회귀 head로** 바꿨습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] RM의 입력(prompt + 응답 1개)과 출력(점수 1개)을 말하고, 학습할 때만 쌍을 쓴다는 점을 말한다.
  - [ ] “chat model checkpoints”가 SFT인지 어느 RLHF 버전인지는 원문에서 확정되지 않는다는 점을 말한다.
  - [ ] 크기별 RM(7B · 13B · 70B)이 있고 Fig. 6에서 비교된다는 점, 실제 RLHF에 어느 크기를 썼는지는 명시되지 않았다는 점을 말한다.
- **함께 볼 개념:** [Ranking loss](#c-ranking-loss) · [조건부 reward](#c-reward-shaping)

<a id="c-ranking-loss"></a>

### Ranking loss

- **무엇인가:** 선호 쌍에서 고른 답(chosen, y_c)의 점수가 버린 답(rejected, y_r)보다 높아지도록 학습하는 손실입니다. InstructGPT(Ouyang et al. 2022)와 같은 이진 ranking loss입니다.
- **원문:** [Eq. (1)](https://arxiv.org/pdf/2307.09288v2#page=11)

  `L_ranking = −log σ( r_θ(x, y_c) − r_θ(x, y_r) )`

  r_θ(x, y)는 prompt x와 응답 y에 대한 scalar 점수, σ는 sigmoid입니다.
- **계산해 보면 (설명용):**

| r(x, y_c) | r(x, y_r) | 차이 Δ | σ(Δ) = “c가 더 낫다”의 모델 확률 | loss |
| --- | --- | --- | --- | --- |
| 0.8 | 0.2 | +0.6 | 0.646 | 0.437 |
| 0.5 | 0.5 | 0 | 0.5 | 0.693 |
| 0.2 | 0.8 | −0.6 | 0.354 | 1.037 |

- **설명할 수 있어야 하는 것:**
  - [ ] loss가 점수의 **차이**에만 의존하므로 모든 점수에 같은 값을 더해도 loss가 같다는 점(shift 불변)을 말한다.
  - [ ] 학습은 쌍으로 하지만 추론 때는 응답 하나에 점수를 매긴다는 점을 말한다(원문 p.12 명시).
  - [ ] σ(Δ)가 Bradley–Terry 모델의 “c가 이길 확률”이라는 해석을 말한다.
- **함께 볼 개념:** [rating margin](#c-margin) · [Bradley–Terry 선호 모델](#c-bradley-terry)

<a id="c-margin"></a>

### rating margin

- **무엇인가:** 선호 강도(4단계)에 따라 margin m(r)을 빼서, **차이가 큰 쌍일수록 점수 차를 더 크게** 벌리도록 만든 변형입니다.
- **원문:** [Eq. (2)](https://arxiv.org/pdf/2307.09288v2#page=11) — `L = −log σ( r_θ(x, y_c) − r_θ(x, y_r) − m(r) )`. 뚜렷이 다른 쌍에 큰 margin, 비슷한 쌍에 작은 margin. [Table 27–28 · Fig. 27](https://arxiv.org/pdf/2307.09288v2#page=52)

| m(r) | significantly | better | slightly | negligibly / unsure | Meta Helpful 평균 정확도 |
| --- | --- | --- | --- | --- | --- |
| 없음 | – | – | – | – | 62.5 (79.1 / 66.9 / 59.8 / 54.5) |
| Small | 1 | 2/3 | 1/3 | 0 | 63.0 (80.4 / 67.3 / 60.4 / 55.0) |
| Large | 3 | 2 | 1 | 0 | 62.9 (80.7 / 67.5 / 60.5 / 54.3) |

- **계산해 보면 (설명용, Δ = 1인 같은 쌍):**
  - margin 없음: −log σ(1) = **0.313**
  - Small, significantly(m = 1): −log σ(0) = **0.693**
  - Large, significantly(m = 3): −log σ(−2) = **2.127**

  같은 점수 차라도 “significantly better”로 표시된 쌍은 loss가 커서, RM이 차이를 더 벌리도록 밀립니다.
- **부작용:** margin은 점수 분포를 양 끝으로 몰아 **이분된(binary split) 분포**를 만들고, Large일수록 심합니다(Fig. 27). 저자는 PPO가 reward 분포 변화에 민감할 수 있어 reward calibration을 후속 과제로 둡니다.
- **설명할 수 있어야 하는 것:**
  - [ ] margin이 큰 쌍에서 정확도를 올리고(79.1 → 80.7), Large는 비슷한 쌍에서 오히려 떨어뜨린다(54.5 → 54.3)는 점을 표로 말한다.
  - [ ] 최종 Helpfulness RM에 Small · Large 중 무엇을 썼는지 원문이 밝히지 않는다는 점, Safety RM에 margin을 썼는지도 부록에 별도 ablation이 없다는 점을 말한다.
  - [ ] margin ablation이 Helpfulness RM에 대해서만 보고됐다는 점을 말한다.
- **함께 볼 개념:** [선호 수집 절차](#c-pref-protocol) · [조건부 reward와 whitening](#c-reward-shaping)

<a id="c-safety-aux-loss"></a>

### 안전 보조 loss

- **무엇인가:** Safety RM에 ranking loss 외에, 응답이 **안전한지 위험한지 구분**하도록 하는 보조 손실을 더한 것입니다. 안전 label(18 / 47 / 35% 분류)을 씁니다.
- **원문:** [App. A.3.4 · Table 29](https://arxiv.org/pdf/2307.09288v2#page=52) — 보조 loss의 정확한 식과 가중치는 적지 않습니다. 점수 0.5(sigmoid 전 음수)를 임계값으로 위험 응답을 얼마나 잡는지(recall)를 봅니다.

| | 평균 | 안전 chosen · 위험 rejected | 둘 다 안전 | 둘 다 위험 | 위험 응답 recall |
| --- | --- | --- | --- | --- | --- |
| Baseline | 63.7 | 93.0 | 56.0 | 59.5 | 73.0 |
| + 보조 loss | 64.5 | 94.3 | 56.9 | 59.9 | **90.4** |

- **설명할 수 있어야 하는 것:**
  - [ ] ranking 정확도는 조금 오르고(63.7 → 64.5) 위험 응답 recall이 크게 오른다(73.0 → 90.4)는 점을 말한다.
  - [ ] RM 점수를 sigmoid로 0–1에 놓고 0.5를 기준으로 쓴다는 점이 PPO의 0.15 임계값과 어떻게 이어지는지 말한다.
  - [ ] 식이 공개되지 않아 재현에는 추가 정보가 필요하다는 점을 말한다.
- **함께 볼 개념:** [도움됨 · 안전성 지침과 안전 label](#c-safety-labels) · [조건부 reward](#c-reward-shaping)

<a id="c-rm-mix"></a>

### RM 학습 혼합과 설정

- **무엇인가:** 두 RM이 각각 어떤 데이터를 어떤 비율로, 얼마나 학습했는지입니다.
- **원문:** [§3.2.2 Data Composition · Training Details](https://arxiv.org/pdf/2307.09288v2#page=11)

| | Helpfulness RM | Safety RM |
| --- | --- | --- |
| 데이터 | Meta Helpfulness **전부** + 같은 양의 나머지(Meta Safety · 공개 데이터에서 균등 sampling) | Meta Safety + Anthropic Harmless **전부**, 여기에 Meta Helpfulness · 공개 도움 데이터를 **90 / 10**으로 섞음 |
| 근거 | “extensive experimentation” | 10% 도움 데이터가 특히 **둘 다 안전한 쌍**의 정확도에 도움 |

  공통 설정: **1 epoch**(더 길면 과적합), 기반 모델과 같은 optimizer, 최대 LR 70B 5e-6 · 그 외 1e-5, cosine → 10%, warmup 전체 step의 3%(최소 5), batch 512 pairs = 1,024 rows.
- **계산해 보면 (추출자 계산):** 공개 데이터까지 모두 썼다면 2,919,326 ÷ 512 ≈ 5,700 step이고 warmup은 약 170 step입니다. 실제로는 혼합 규칙에 따라 일부만 sampling하므로 이 값은 상한입니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 두 RM의 혼합 규칙을 말하고, Safety RM에도 도움 데이터를 10% 섞은 이유를 말한다.
  - [ ] 공개 데이터를 남긴 이유(일반화 · reward hacking 방지 기대, 부정적 전이 미관찰)가 저자 기대라는 점을 말한다.
- **함께 볼 개념:** [공개 선호 데이터셋 6종](#c-open-pref-datasets) · [후학습 단계별 설정 비교](#c-sft-settings)

<a id="c-rm-eval"></a>

### RM 평가: 무엇을 맞히나

- **무엇인가:** RM 정확도 = 사람이 고른 답에 RM이 더 높은 점수를 준 쌍의 비율입니다. 동점이면 무작위인 50%가 기준선입니다.
- **원문:** [Reward Model Results · Table 7–8](https://arxiv.org/pdf/2307.09288v2#page=12) · [Fig. 6](https://arxiv.org/pdf/2307.09288v2#page=13) — 매 batch에서 1,000개를 test로 떼어 모은 것이 Meta Helpfulness · Meta Safety test set입니다. 비교 기준선: SteamSHP-XL(FLAN-T5-xl), Open Assistant RM(DeBERTa V3 Large), GPT-4(“Choose the best answer between A and B” zero-shot).

| | Meta Helpful. | Meta Safety | Anthropic Helpful | Anthropic Harmless | OpenAI Summ. | Stanford SHP | 평균 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SteamSHP-XL | 52.8 | 43.8 | 66.8 | 34.2 | 54.7 | 75.7 | 55.3 |
| Open Assistant | 53.8 | 53.4 | 67.7 | 68.4 | 71.7 | 55.0 | 63.0 |
| GPT-4 | 58.6 | 58.1 | – | – | – | – | – |
| Safety RM | 56.2 | **64.5** | 55.4 | 74.7 | 71.7 | 65.2 | 64.3 |
| Helpfulness RM | **63.2** | 62.8 | 72.0 | 71.0 | 75.5 | 80.0 | 70.6 |

  **선호 강도별 (Table 8):** Helpfulness RM on Meta Helpful — significantly 80.7 · better 67.5 · slightly 60.9 · negligibly 54.5. 비슷한 쌍은 동전 던지기에 가깝습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] Meta RM은 Meta 데이터로 학습했고 기준선은 그렇지 않다는 비교 조건(원문 캡션 명시)을 말한다.
  - [ ] 각 RM이 자기 영역에서 가장 좋다는 결과를 두 목표의 긴장으로 설명한다(저자 해석).
  - [ ] Fig. 6에서 데이터와 모델이 클수록 정확도가 오르고 아직 포화되지 않았다는 관찰과, 저자가 “RM 정확도는 Llama 2-Chat 최종 성능의 가장 중요한 대리 지표 중 하나”라고 본다는 점을 말한다.
  - [ ] 사람끼리의 일치율도 뚜렷한 쌍에서 더 높다는 원문 언급과 함께, 비슷한 쌍의 정확도 54%가 RM만의 실패가 아니라는 점을 말한다.
- **함께 볼 개념:** [주간 batch 14개와 분포 이동](#c-weekly-batches) · [모델 기반 평가](#c-model-based-eval)

<a id="c-rlhf-versions"></a>

### RLHF V1–V5와 RS → PPO 순서

- **무엇인가:** 선호 데이터가 batch로 쌓일 때마다 RM을 다시 학습하고 그 RM으로 새 RLHF 모델을 만든 반복입니다. 버전 이름은 SFT-v1 · SFT-v2 → RLHF-V1 … RLHF-V5입니다.
- **원문:** [§3.2.3](https://arxiv.org/pdf/2307.09288v2#page=13) — “Until RLHF (V4), we used only Rejection Sampling fine-tuning, and after that, we combined the two sequentially, applying PPO on top of the resulted Rejection Sampling checkpoint before sampling again.” [Fig. 11](https://arxiv.org/pdf/2307.09288v2#page=18)
- **한 라운드의 흐름 (설명용 재구성):**

  ```
  최신 정책으로 새 선호 데이터 수집 → RM 재학습
   → 70B로 K개 생성 · RM으로 최고 답 선택 → RS fine-tune (V1–V5)
   → (V4 이후) RS checkpoint 위에 PPO
   → 다음 라운드 sampling
  ```

- **V4 경계:** “Until RLHF (V4)”가 V4를 포함하는지 원문은 모호합니다. Fig. 11은 **RLHF-v5 (no PPO)**와 **RLHF-v5 (with PPO)**를 따로 표시하고 V4에는 PPO 표시가 없습니다. 그래서 PPO가 처음 쓰인 것은 V5로 읽는 쪽이 그림과 맞습니다(추출자 해석). W02 학습목표의 “V4 이전 RS, 이후 PPO”는 원문 문장 그대로의 표현으로 쓰고 버전을 단정하지 않습니다.
- **그 밖의 버전별 사실:** GAtt는 RLHF V3 이후, RS 샘플 bag의 변경은 V3 이후, Fig. 11에서 Meta RM 판정으로 V3부터 ChatGPT 대비 도움 · 안전 모두 50% 넘음.
- **설명할 수 있어야 하는 것:**
  - [ ] RS와 PPO가 “둘 중 하나”가 아니라 **RS 뒤에 PPO**를 얹는 순서라는 점을 말한다.
  - [ ] V4 경계가 모호한 이유를 원문 문장과 Fig. 11로 설명한다.
  - [ ] 매 버전마다 RM도 새 데이터로 갱신된다는 점을 말한다.
- **함께 볼 개념:** [Rejection sampling fine-tuning](#c-rs-ft) · [PPO objective](#c-ppo-objective)

<a id="c-ppo-objective"></a>

### PPO objective (Eq. 3)

- **무엇인가:** RM을 진짜 보상(사람 선호)의 추정치로 놓고, 언어모델을 정책으로 두어 기대 보상을 최대화하는 학습입니다. Stiennon et al.(2020)의 RL 방식을 따릅니다.
- **원문:** [Eq. (3)](https://arxiv.org/pdf/2307.09288v2#page=15)

  `arg max_π  E_{p∼D, g∼π} [ R(g | p) ]`

  데이터셋 D에서 prompt p를 뽑고, 정책 π로 생성 g를 만들어, PPO 알고리즘과 loss로 이 목표를 최적화합니다.
- **RL 용어로 옮기면 (설명용):** 상태 = prompt + 지금까지 생성한 토큰, 행동 = 다음 토큰, 에피소드 = 응답 하나, 보상 = 응답이 끝난 뒤 R(g | p) 한 번.
- **설명할 수 있어야 하는 것:**
  - [ ] Eq. (3)이 “목표”이고, 그것을 푸는 방법이 PPO의 clipped update라는 구분을 말한다.
  - [ ] PPO에 필요한 value function(critic), advantage 추정(GAE) 방식, value 초기화는 원문에 없다는 점을 말한다(InstructGPT는 RM에서 초기화한 6B value function을 명시).
  - [ ] RS와 달리 매 step 생성이 직전에 갱신된 정책에서 나온다는 점(on-policy)을 말한다.
- **함께 볼 개념:** [PPO clip](#c-ppo-clip) · [KL penalty](#c-kl-penalty)

<a id="c-reward-shaping"></a>

### 조건부 reward와 whitening

- **무엇인가:** PPO에 쓰는 보상 R_c를 Safety RM(R_s)과 Helpfulness RM(R_h)의 **조건부 조합**으로 만들고, logit으로 되돌린 뒤 정규화(whitening)하는 과정입니다.
- **원문:** [p.15](https://arxiv.org/pdf/2307.09288v2#page=15)

  ```
  R_c(g|p) = R_s(g|p)   if is_safety(p) or R_s(g|p) < 0.15
             R_h(g|p)   otherwise
  R̃_c(g|p) = whiten( logit( R_c(g|p) ) )
  ```

  - 안전 위험이 있는 prompt에는 미리 tag를 달고(is_safety), 그때는 Safety RM 점수를 씁니다.
  - tag가 없어도 **Safety RM 점수가 0.15 미만**이면 위험한 응답으로 보고 Safety RM 점수를 씁니다. 0.15는 Meta Safety test에서 precision 0.89 · recall 0.55에 해당합니다.
  - RM 출력(sigmoid 후 0–1)을 logit으로 되돌려 선형 점수로 만들고 whitening해 안정성을 높이고 KL 항과 균형을 맞춥니다.
- **계산해 보면 (설명용):**

| 경우 | 선택 | 원점수 | logit |
| --- | --- | --- | --- |
| 일반 prompt, R_s = 0.6, R_h = 0.9 | R_h | 0.9 | +2.20 |
| 일반 prompt, R_s = 0.10, R_h = 0.9 | **R_s** (0.15 미만) | 0.10 | −2.20 |
| 안전 tag prompt, R_s = 0.7 | R_s | 0.7 | +0.85 |
| 경계값 R_s = 0.15 | – | 0.15 | −1.73 |

  두 번째 줄처럼 도움이 매우 되는 답이라도 위험하면 큰 음의 보상을 받습니다. whitening은 batch 평균을 빼고 표준편차로 나누는 것이 일반적 의미이며, 원문은 계산 단위를 적지 않습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] Safety RM을 쓰는 두 조건을 말하고, tag가 없는 prompt에도 안전 RM이 개입한다는 점을 말한다.
  - [ ] 0.15가 precision · recall로 정한 임계값이라는 점과, recall 0.55는 위험 응답의 절반 가까이를 놓친다는 뜻이라는 점을 말한다.
  - [ ] logit이 sigmoid의 역함수라 0–1 점수를 다시 (−∞, ∞)로 펼친다는 점을 말한다.
- **함께 볼 개념:** [안전 보조 loss](#c-safety-aux-loss) · [KL penalty](#c-kl-penalty)

<a id="c-kl-penalty"></a>

### KL penalty와 reward hacking

- **무엇인가:** 학습 중인 정책 π_θ가 처음 정책 π₀에서 너무 멀어지면 보상을 깎는 항입니다.
- **원문:** [Eq. (4)](https://arxiv.org/pdf/2307.09288v2#page=15)

  `R(g | p) = R̃_c(g | p) − β · D_KL( π_θ(g | p) ‖ π₀(g | p) )`

  다른 연구(Stiennon 2020, Ouyang 2022)처럼 이 제약이 **학습 안정성**과 **reward hacking 감소**에 유용했다고 적습니다. reward hacking = RM 점수는 높은데 사람 평가는 낮아지는 현상. β는 7B · 13B 0.01, 34B · 70B 0.005.
- **계산해 보면 (설명용):** 응답 200토큰에서 토큰마다 log π_θ − log π₀가 평균 0.05라면 KL 추정 ≈ 200 × 0.05 = 10. β = 0.005면 보상에서 0.05, β = 0.01이면 0.1을 뺍니다. whitening된 보상의 표준편차가 1이라면 이 정도 차이에서는 KL이 보상보다 작아, 정책이 크게 벗어날 때만 강하게 작동합니다.
- **설명할 수 있어야 하는 것:**
  - [ ] KL의 기준 π₀(처음 정책, 원문 “original policy”)와 PPO clip의 기준(직전 정책 π_old)이 다르다는 점을 말한다. KL은 **처음에서 얼마나 멀어졌나**, clip은 **한 번에 얼마나 움직이나**를 제한합니다.
  - [ ] 큰 모델의 β가 절반인 이유는 원문에 없다는 점을 말한다.
  - [ ] π₀가 SFT 모델인지 RS checkpoint인지 원문이 명시하지 않는다는 점을 말한다.
  - [ ] KL이 reward hacking을 “줄인다”이지 막는다는 보장은 아니라는 점과, 저자가 따로 일반 RM으로 발산 여부를 확인했다는 점(§3.4.1)을 연결한다.
- **함께 볼 개념:** [PPO clip](#c-ppo-clip) · [모델 기반 평가](#c-model-based-eval)

<a id="c-ppo-settings"></a>

### PPO 설정을 InstructGPT와 비교

- **무엇인가:** Llama 2의 PPO 하이퍼파라미터를 PPO 원 논문(MuJoCo 실험)과 InstructGPT의 값과 나란히 본 것입니다.
- **원문:** [p.15–16](https://arxiv.org/pdf/2307.09288v2#page=15) — 이유는 적지 않습니다. 비교 원전: PPO [Table 3](https://arxiv.org/abs/1707.06347v2) · InstructGPT [App. C.4](https://arxiv.org/pdf/2203.02155v1#page=42)

| 설정 | PPO 원 논문 (MuJoCo) | InstructGPT (2022) | Llama 2-Chat |
| --- | --- | --- | --- |
| clip ε | 0.2 | 0.2 | 0.2 |
| batch | 2,048 timestep | 512 | 512 |
| minibatch | 64 | 64 | 64 |
| batch당 반복 | 10 epochs | 1 inner epoch (8 minibatch) | minibatch당 gradient step 1번 (= 1 epoch) |
| 학습률 | Adam 3e-4 | 상수, 처음 10 iteration warmup | **상수 1e-6** |
| KL 계수 β | 없음 (clip 버전) | 0.02 | 0.01 (7B · 13B) / 0.005 (34B · 70B) |
| value function | GAE λ 0.95, γ 0.99 | RM에서 초기화한 6B, 할인 없음 | 원문 미기술 |
| 보상 | 환경 보상 | 6B RM 하나 | 두 RM의 조건부 조합 + whitening |
| 사전학습 gradient 혼합 | – | PPO-ptx에서 사용 | 원문 미기술 |
| 학습 길이 | 1M timestep | 256k episodes (약 31k 고유 prompt) | 200–400 iterations, held-out prompt로 early stopping |

- **설명할 수 있어야 하는 것:**
  - [ ] batch 512 · minibatch 64 · 한 번의 inner epoch · clip 0.2가 InstructGPT와 **똑같다**는 점을 말한다.
  - [ ] 다른 점(β가 2–4배 작음, 보상이 두 RM의 조합, value function 미기술)을 말한다.
  - [ ] PPO 원 논문의 10 epochs 재사용과 달리 언어모델 RLHF는 1 epoch만 쓴다는 점을 말한다.

<a id="c-ppo-system"></a>

### 70B PPO의 시스템 비용

- **무엇인가:** PPO는 매 iteration마다 **생성(rollout)**과 **학습**을 번갈아 해서, 학습용 분산 방식이 생성에서는 느려지는 문제가 있습니다.
- **원문:** [p.16](https://arxiv.org/pdf/2307.09288v2#page=16) — 70B PPO 한 iteration 평균 약 **330초**. 큰 batch로 빨리 학습하려고 FSDP(Zhao et al. 2023)를 썼는데, 한 번의 forward · backward에는 효과적이었지만 **생성 중에는 약 20배 느려졌습니다**(큰 batch와 KV cache를 써도). 생성 전에 노드마다 가중치를 한 번 모으고(consolidate), 생성 뒤 메모리를 풀어 학습으로 돌아가는 방식으로 완화했습니다.
- **계산해 보면 (추출자 계산):** batch 512 ÷ minibatch 64 = iteration당 gradient step 8번. 200–400 iteration = 1,600–3,200 step, rollout 102,400–204,800개. 70B 기준 200 iteration ≈ 18시간, 400 iteration ≈ 37시간.
- **설명할 수 있어야 하는 것:**
  - [ ] FSDP가 가중치를 GPU에 나눠 두고 쓸 때마다 모으기(all-gather) 때문에, 토큰을 하나씩 만드는 생성에서는 그 통신이 토큰마다 반복되어 느려진다는 이유를 말한다(일반적 설명).
  - [ ] PPO 비용의 상당 부분이 학습이 아니라 생성이라는 점을 Llama 3의 PagedAttention 개선과 연결한다.
- **원전:** PyTorch FSDP [arXiv:2304.11277](https://arxiv.org/abs/2304.11277) · ZeRO [arXiv:1910.02054](https://arxiv.org/abs/1910.02054)

<a id="c-model-based-eval"></a>

### 모델 기반 평가: RM과 GPT-4 판정

- **무엇인가:** 매 iteration마다 사람 평가를 할 수 없어서, 여러 ablation 중 최고 모델을 고를 때 **최신 RM 점수**를 먼저 보고, 주요 버전만 사람 평가로 확인한 방식입니다.
- **원문:** [§3.4.1](https://arxiv.org/pdf/2307.09288v2#page=17) · [Fig. 11](https://arxiv.org/pdf/2307.09288v2#page=18) · [Fig. 29](https://arxiv.org/pdf/2307.09288v2#page=55)
  - **RM이 지표로 쓸 만한가:** 도움 · 안전 test prompt의 답을 annotator 3명이 7점 Likert로 매긴 결과와 RM 점수가 잘 맞았습니다(Fig. 29). pairwise loss로 학습했어도 점수 하나를 지표로 쓸 수 있다는 근거입니다.
  - **Goodhart의 법칙:** 지표가 목표가 되면 좋은 지표가 아니게 되므로, 다양한 공개 데이터로 학습한 **더 일반적인 RM**으로도 확인했고 아직 발산은 보지 못했다고 적습니다.
  - **GPT-4 판정:** Meta RM은 Llama 2-Chat에 유리할 수 있어 GPT-4로 ChatGPT 대비 승률을 다시 계산했습니다. 응답 순서는 무작위로 바꿉니다. 안전 1,586개 · 도움 584개 prompt. 최신 모델 승률 60% 이상.
- **계산해 보면 (설명용):** 동점을 빼는 승률 = win ÷ (win + loss). 사람 평가의 70B vs ChatGPT(승 36%, 무 31.5%, 패 32.5%)에 적용하면 36 ÷ 68.5 = **52.6%**입니다(Fig. 2는 GPT-4 판정에 이 식을 썼고, 여기 숫자는 식을 보이기 위한 대입).
- **설명할 수 있어야 하는 것:**
  - [ ] RM을 학습 보상과 평가 지표로 함께 쓰면 생기는 문제(Goodhart)와 저자의 두 대응(일반 RM · GPT-4 판정)을 말한다.
  - [ ] 다음 annotation 라운드에서 새 모델과 이전 모델을 함께 sampling해 “무료로” 비교했다는 점을 말한다.
  - [ ] Fig. 11의 승률은 판정 모델에 따라 크게 다르다는 점(Meta RM에서 더 높음)을 말한다.
- **함께 볼 개념:** [사람 평가와 그 한계](#c-human-eval) · [KL penalty와 reward hacking](#c-kl-penalty)

<a id="c-human-eval"></a>

### 사람 평가와 그 한계

- **무엇인가:** 주요 모델 버전을 공개 · 비공개 chat 모델과 **나란히 놓고 사람이 고르게 한** 평가입니다.
- **원문:** [§3.4.2 · Fig. 12](https://arxiv.org/pdf/2307.09288v2#page=18) · [App. A.3.7 · Table 31–32 · Fig. 30–31](https://arxiv.org/pdf/2307.09288v2#page=56)

| 항목 | 내용 |
| --- | --- |
| prompt | 4,000개 이상, 단일 · 다중 턴. 범주: 사실 질문 · 글쓰기 · 언어 도움 · 추천 · 대화. 코드 · 추론 prompt는 없음 |
| 질문 | “두 응답 중 어느 쪽이 더 나은가(도움되면서 안전하고 정직한)?” |
| 척도 | 7점: A much better … About the same … B much better → 승 · 무 · 패로 집계 |
| 평가자 | 생성 쌍마다 3명, A/B 위치 무작위. 5명으로 해 봐도 결과 · 일치도가 크게 바뀌지 않음 |
| 길이 | 공개 모델 비교는 context · 생성 각 1,000토큰(공정성), 비공개 모델은 2,000토큰 |
| system prompt | Llama 2-Chat · ChatGPT · PaLM · Falcon에 같은 system prompt(Table 31) |
| 비교 모델 | ChatGPT(gpt-3.5-turbo-0301) · PaLM(chat-bison-001) · Falcon-40B-Instruct · MPT-7B-chat · Vicuna-13B/33B |

- **결과:** 70B vs ChatGPT 승 36% · 무 31.5%. 7B는 MPT-7B-chat에 60% prompt에서 이김. 34B는 Vicuna-33B · Falcon-40B에 75% 넘게 이김. ChatGPT에 system prompt를 빼면 70B 승률이 36% → 44%로 오릅니다(Fig. 30).
- **평가자 일치도 (IRR):** Gwet의 AC2로 0.37–0.55. 승률이 비슷한 비교(70B vs ChatGPT)일수록 낮고, 승자가 뚜렷할수록 높습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 저자가 직접 든 네 가지 한계(prompt 4k가 실사용을 다 덮지 못함 · 코드 · 추론 없음 · 다중 턴은 마지막 응답만 평가 · 주관성)를 말한다.
  - [ ] system prompt 하나로 승률이 8%p 바뀌었다는 점으로 평가 조건의 민감도를 말한다.
  - [ ] 사실 질문에서 이긴 이유가 답의 정확도가 아니라 **문체 선호**였다는 저자 분석(A.3.7)을 말한다.
- **원전:** Gwet's AC1/AC2 (Gwet 2008, 2014)

<a id="c-safety-rlhf"></a>

### 안전 RLHF와 안전 데이터 양

- **무엇인가:** 안전 선호 데이터와 적대적 prompt를 RLHF에 넣었을 때 안전과 도움이 어떻게 변하는지 본 두 실험입니다.
- **원문:** [§4.2.3](https://arxiv.org/pdf/2307.09288v2#page=24) · [Fig. 14](https://arxiv.org/pdf/2307.09288v2#page=25) · [Fig. 15](https://arxiv.org/pdf/2307.09288v2#page=26)
  - **SFT에서 RLHF로:** 안전 SFT 데이터 수천 건만 모은 뒤 RLHF로 완전히 넘어갔습니다. 모델이 쓰는 안전한 답이 평균적인 annotator보다 자세해졌기 때문입니다.
  - **Fig. 14 (적대적 prompt 유무 두 checkpoint):** 안전 RM 점수 분포가 오른쪽으로 이동하고 0 근처 긴 꼬리가 얇아짐. 도움 RM 점수는 y = x 아래로 몰리지 않아 유지.
  - **Fig. 15 (안전 데이터 양 ablation):** 도움 데이터 약 0.9M은 고정, 안전 데이터 약 0.1M의 0 · 1 · 10 · 25 · 50 · 100%를 사용, Llama 2 사전학습 모델을 2 epochs fine-tune. 안전 평균 점수는 크게 오르고 도움 평균은 거의 일정.
- **설명할 수 있어야 하는 것:**
  - [ ] 평가가 사람 판정이 아니라 **RM 평균 점수**(대리 지표)라는 점을 말한다.
  - [ ] 도움이 유지된 이유를 저자가 “도움 데이터가 이미 충분히 많아서”라고 **가설**로 적었다는 점을 말한다.
  - [ ] 안전은 소수의 매우 특정한 경우가 문제인 long-tail 문제라는 저자 관점과 Fig. 14의 꼬리를 연결한다.
- **함께 볼 개념:** [false refusal](#c-false-refusal) · [적대적 prompt](#c-adversarial-prompts)

<a id="c-false-refusal"></a>

### false refusal

- **무엇인가:** 위험하지 않은 정당한 요청을 엉뚱한 안전 우려로 거절하는 것입니다. 모델 능력 밖이라 거절하는 경우(“영상 통화는 못 합니다”, “2024년은 지식 범위 밖입니다”)는 세지 않습니다.
- **원문:** [Measure of False Refusal](https://arxiv.org/pdf/2307.09288v2#page=26) · [Fig. 33 · Table 41](https://arxiv.org/pdf/2307.09288v2#page=66)
  - **측정:** 응답에서 거절을 찾는 분류기를 학습해 ① 도움 test set ② 위험해 보이지만 안전한 **경계(borderline) prompt 210개**에 적용. 경계 예: “give me a recipe for Christmas Crack”(과자 이름).
  - **결과:** 안전 데이터를 늘릴수록 두 set 모두 false refusal이 늘어남. 도움 test set에서는 안전 데이터 100%에서도 **약 0.05%**로 드물지만, 경계 set에서는 훨씬 큼. “bomb”처럼 위험한 생성에 자주 나오는 단어가 있으면 구분을 어려워합니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 앞 페이지의 “도움이 유지됐다”와 이 페이지의 “false refusal이 늘었다”가 함께 성립하는 이유(평균 점수 vs 경계 사례)를 말한다.
  - [ ] 경계 set 210개의 정확한 거절률은 본문에 없고 Fig. 33에서 읽어야 한다는 점을 말한다.
  - [ ] §5.2의 “안전 튜닝이 지나칠 때가 있다”는 저자 인정과 연결한다.
- **함께 볼 개념:** [safety RM으로 고르는 targeted distillation](#c-cd-gating) · [한계와 공개 전략](#c-limitations-release)

<a id="c-align-followup"></a>

### PPO 이후: DPO · GRPO

- **무엇인가 (논문 밖):** Llama 2의 “RM 학습 → PPO + KL”이 이후 어떻게 바뀌었는지입니다.
  - **DPO (Rafailov et al. 2023):** KL 제약이 있는 보상 최대화의 최적 정책을 닫힌 형태로 풀면, 보상을 `β log(π_θ / π_ref)`로 쓸 수 있습니다. 이를 ranking loss에 넣으면 **RM 없이 선호 쌍으로 정책을 직접** 학습합니다. Llama 2의 Eq. (1)과 Eq. (4)를 하나로 합친 셈입니다.
  - **Llama 3 (2024):** PPO 대신 DPO를 썼고, 큰 모델에서 compute가 적고 성능이 더 좋았다고 보고합니다. RM의 margin 항도 제거했습니다.
  - **GRPO (DeepSeekMath 2024):** value function 없이 같은 prompt의 여러 응답 점수를 그룹 평균으로 정규화해 advantage를 씁니다. 이 스터디의 W07(DeepSeek-R1) · W09(DeepSeek-V3.2)에서 다룹니다.
- **설명할 수 있어야 하는 것:**
  - [ ] DPO가 Llama 2 파이프라인의 어느 두 단계(RM · PPO)를 대체하는지 말한다.
  - [ ] Llama 2가 미기술로 남긴 value function을 GRPO는 아예 쓰지 않는다는 연결을 말한다.
- **출처:** [DPO arXiv:2305.18290](https://arxiv.org/abs/2305.18290) · [Llama 3 §4.1](https://arxiv.org/abs/2407.21783) (2026-10-17 확인) · [DeepSeekMath arXiv:2402.03300](https://arxiv.org/abs/2402.03300). DPO · GRPO 식은 이번에 원문을 다시 열지 않고 적었습니다.

<!-- part: background -->
## Background

### 이번에 새로 채울 빈 영역

W01(LLaMA 1)까지 다룬 것은 원 Transformer와 LLM 기본 학습, 그리고 [W01 읽기 지도](../w01/llama1-reading-map.html)의 Background 표에 있는 블록 부품 · optimizer · 스케일링 법칙 · 효율 구현 · zero/few-shot 평가 · CCNet · BPE · Flan · 위험 벤치마크 4종입니다. 아래는 그 뒤 **중간 논문에서 처음 나왔고 Llama 2가 가져다 쓴** 개념입니다.

| 개념 | 처음 나온 논문 | Llama 2에서 쓰인 곳 | 이전 주차 | 같이 볼 파트 |
| --- | --- | --- | --- | --- |
| [KV cache](#c-kv-cache) | 자기회귀 decoding의 표준 관행 · 대규모 추론 분석은 Pope et al., 2022 | App. A.2.1 | 처음 | Architecture |
| [MQA](#c-mha-mqa-gqa) | Shazeer, 2019 · PaLM(2022) 채택 | App. A.2.1 · Table 18 | 처음 | Architecture |
| [GQA](#c-mha-mqa-gqa) | Ainslie et al., 2023 | §2.2 · Table 1 · A.2.1 | 처음 | Architecture |
| [Tensor parallelism](#c-tp-serving) | Shoeybi et al., 2019 (Megatron-LM) | A.2.1 배포 | W01은 model · sequence parallelism만 | Architecture |
| [긴 문맥 벤치마크 SCROLLS](#c-long-context-bench) | Shaham et al., 2022 | Table 16 | 처음 | Architecture |
| [BBH · AGIEval](#c-bench-new) | Suzgun et al., 2022 · Zhong et al., 2023 | Table 3 · 24 | 처음 | Architecture |
| [데이터 오염 분석](#c-contamination) | Brown et al., 2020(13-gram) · Chowdhery et al., 2022(8-gram 70%) | App. A.6 | 처음 | Architecture |
| [적은 고품질 SFT](#c-sft-data) | Zhou et al., 2023 (LIMA) | §3.1 | 처음 | Data |
| [RM의 분포 이동](#c-weekly-batches) | Scialom et al., 2020b (hyper-specialization) | §3.2.1 | 처음 | Data |
| [공개 선호 데이터셋](#c-open-pref-datasets) | Stiennon 2020 · Nakano 2021 · Bai 2022a · Ethayarajh 2022 | Table 6 | 처음 | Data |
| [RLHF 3단계 골격](#c-rlhf-pipeline) | Christiano et al., 2017 → Stiennon et al., 2020 → Ouyang et al., 2022 (InstructGPT) | §3 전체 | W01은 “RLHF 없음”만 확인 | Background · Alignment |
| [Bradley–Terry 선호 모델](#c-bradley-terry) | Bradley & Terry, 1952 · RM loss는 Ouyang et al., 2022 | Eq. (1) | 처음 | Alignment |
| [도움됨 · 무해성의 긴장](#c-rm-arch) | Bai et al., 2022a (Anthropic HH) | §3.2.2 · A.4.1 | 처음 | Alignment |
| [PPO](#c-ppo-clip) | Schulman et al., 2017 | §3.2.3 · Eq. (3) | 처음 | Background · Alignment |
| [참조 정책 KL penalty](#c-kl-penalty) | Ziegler et al., 2019 · Stiennon et al., 2020 | Eq. (4) | 처음 | Alignment |
| [Rejection sampling / best-of-N](#c-rs-ft) | Nakano et al., 2021(best-of-n) · Bai et al., 2022b | §3.2.3 | 처음 | Post-training |
| [Context distillation](#c-context-distill) | Askell et al., 2021 | §3.3 · §4.2.4 | 처음 | Post-training |
| [망각(forgetting)](#c-rs-history) | Kirkpatrick et al., 2017 | §3.2.3 | 처음 | Post-training |
| [FSDP](#c-ppo-system) | ZeRO(Rajbhandari et al., 2020) · PyTorch FSDP(Zhao et al., 2023) | §3.2.3 PPO | 처음 | Alignment |
| [평가자 일치도 Gwet AC2](#c-human-eval) | Gwet, 2008 | §3.4.2 · §4.4 | 처음 | Alignment |
| [ToxiGen · BOLD · HateBERT](#c-safety-bench) | Hartvigsen 2022 · Dhamala 2021 · Caselli 2021 | §4.1 · Table 11 · 14 | W01은 RealToxicityPrompts · CrowS-Pairs · WinoGender · TruthfulQA | Others |
| [Self-BLEU · Toolformer](#c-temporal-tool) | Zhu et al., 2018 · Schick et al., 2023 | §5.1 | 처음 | Others |

**재방문만 하는 W01 개념:** [RMSNorm](../w01/llama1-reading-map.html#c-rmsnorm) · [SwiGLU](../w01/llama1-reading-map.html#c-swiglu) · [RoPE](../w01/llama1-reading-map.html#c-rope) · [AdamW](../w01/llama1-reading-map.html#c-adamw) · [BPE](../w01/llama1-reading-map.html#c-bpe) · [Flan](../w01/llama1-reading-map.html#c-flan) · [likelihood 채점](../w01/llama1-reading-map.html#c-likelihood-eval) · [pass@k](../w01/llama1-reading-map.html#c-majk-passk) · [TruthfulQA](../w01/llama1-reading-map.html#c-truthfulqa) · [탄소 추정](../w01/llama1-reading-map.html#c-carbon). Llama 2가 이들을 새로 도입한 것처럼 쓰지 않습니다.

### 이 파트의 질문

- **담당:** 이정민 · 김민선
- **RQ1. Llama 2의 후학습을 읽으려면 무엇을 먼저 알아야 하나?**
  - 필수 원문: [InstructGPT §3.1–§3.5](https://arxiv.org/abs/2203.02155v1) · [PPO §3](https://arxiv.org/abs/1707.06347v2) · [GQA §2](https://arxiv.org/abs/2305.13245v3) · 빈 영역 표의 원전
  - 개념: [RLHF 3단계 골격](#c-rlhf-pipeline) · [Bradley–Terry 선호 모델](#c-bradley-terry) · [PPO clip](#c-ppo-clip)
- **RQ2 (Others). 안전은 학습 밖에서 어떻게 측정했나?**
  - 필수 원문: [§4.1 Safety Benchmarks · Table 11](https://arxiv.org/pdf/2307.09288v2#page=22) · [§4.3–§4.4 · Table 14](https://arxiv.org/pdf/2307.09288v2#page=28) · [App. A.4.7](https://arxiv.org/pdf/2307.09288v2#page=69)
  - 개념: [안전 벤치마크: TruthfulQA · ToxiGen · BOLD](#c-safety-bench) · [red teaming](#c-red-teaming) · [안전 사람 평가](#c-safety-human-eval)
- **RQ3 (Others). 저자는 RLHF에서 무엇을 관찰했고, 무엇을 한계로 남겼나?**
  - 필수 원문: [§5.1–§5.3](https://arxiv.org/pdf/2307.09288v2#page=32) · [A.7 Table 52](https://arxiv.org/pdf/2307.09288v2#page=77)
  - 개념: [사람 감독을 넘어서](#c-beyond-supervision) · [temperature · 시간 · 도구 사용 관찰](#c-temporal-tool) · [한계와 공개 전략](#c-limitations-release)

<a id="c-rlhf-pipeline"></a>

### RLHF 3단계 골격

- **무엇인가:** InstructGPT(Ouyang et al. 2022)가 정리한 **SFT → reward model → PPO** 세 단계입니다. Llama 2 §3은 이 골격 위에서 무엇을 바꿨는지 읽어야 합니다.
- **원전:** [InstructGPT §3.1–§3.5 · App. C](https://arxiv.org/abs/2203.02155v1) — ① 사람이 쓴 시연으로 SFT ② 한 prompt의 응답 K = 4–9개를 사람이 순위 매기고 RM 학습(6B RM) ③ RM 점수 − KL(β = 0.02)을 보상으로 PPO, 사전학습 gradient를 섞은 PPO-ptx.

| | InstructGPT (2022) | Llama 2-Chat (2023) |
| --- | --- | --- |
| 선호 형식 | 4–9개 순위 | 이진 비교 + 강도 4단계 |
| RM | 6B 하나 | 도움 · 안전 두 개, chat checkpoint에서 초기화, margin |
| 정책 갱신 | PPO 한 번 | RS 반복(V1–V5) → 그 위에 PPO |
| 데이터 수집 | 한 번에 | 주간 batch, 최신 모델로 다시 수집 |
| 안전 | RM 하나에 포함 | 안전 SFT · 안전 RM · 안전 context distillation |

- **설명할 수 있어야 하는 것:**
  - [ ] 세 단계가 각각 무엇을 입력받아 무엇을 내놓는지 말한다.
  - [ ] Llama 2가 바꾼 다섯 가지를 표로 말한다.
  - [ ] InstructGPT의 데이터 수 · 설정을 Llama 2의 사실로 옮기지 않는다는 원칙을 지킨다.
- **함께 볼 개념:** [두 개의 RM](#c-rm-arch) · [RLHF V1–V5](#c-rlhf-versions) · 원전: Christiano et al. [arXiv:1706.03741](https://arxiv.org/abs/1706.03741) · Stiennon et al. [arXiv:2009.01325](https://arxiv.org/abs/2009.01325)

<a id="c-bradley-terry"></a>

### Bradley–Terry 선호 모델

- **무엇인가:** 두 항목 i, j가 각자 점수 r_i, r_j를 가질 때 “i가 j를 이길 확률”을 `P(i ≻ j) = σ(r_i − r_j)`로 두는 모델입니다(Bradley & Terry 1952, 원래 식은 지수 비율 형태). 사람 선호 쌍을 이 모델의 관측으로 보고 로그 가능도를 최대화하면 Eq. (1)의 ranking loss가 됩니다.
- **원문과의 연결:** [Eq. (1)](https://arxiv.org/pdf/2307.09288v2#page=11) = `−log P(y_c ≻ y_r)`. Eq. (2)의 margin은 “강하게 선호된 쌍은 σ(Δ − m)도 높아야 한다”로 이 모델을 바꾼 것입니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 점수 차 0이면 50%, 점수 차가 커질수록 승률이 1에 가까워진다는 점을 말한다.
  - [ ] 점수의 절대값은 의미가 없고 차이만 의미가 있다는 점(그래서 InstructGPT는 bias로 정규화)과, Llama 2가 logit · whitening으로 점수 척도를 다룬 이유를 연결한다.
- **함께 볼 개념:** [Ranking loss](#c-ranking-loss) · [조건부 reward와 whitening](#c-reward-shaping)

<a id="c-ppo-clip"></a>

### PPO clip

- **무엇인가:** PPO(Schulman et al. 2017)는 새 정책과 직전 정책의 확률 비 ρ = π_θ(a|s) / π_old(a|s)를 [1 − ε, 1 + ε]로 잘라(clip), 한 번의 update로 정책이 너무 많이 바뀌지 않게 하는 policy gradient 방법입니다.

  `L_clip = E[ min( ρ · A, clip(ρ, 1−ε, 1+ε) · A ) ]`   (A = advantage, 평균보다 얼마나 나은 행동인가)
- **계산해 보면 (설명용, ε = 0.2):**

| A | ρ | ρ · A | clip(ρ) · A | 쓰는 값 |
| --- | --- | --- | --- | --- |
| +1 | 1.5 | 1.5 | 1.2 | **1.2** (더 올려도 이득 없음) |
| +1 | 0.9 | 0.9 | 0.9 | 0.9 |
| −1 | 0.5 | −0.5 | −0.8 | **−0.8** (줄이는 쪽 이득도 제한) |

- **언어모델에서:** 행동 = 토큰, 상태 = prompt + 앞 토큰들. advantage를 구하려면 value function(critic)이 필요합니다. Llama 2는 clip 0.2만 적고 value function은 적지 않습니다.
- **설명할 수 있어야 하는 것:**
  - [ ] clip이 직전 정책 기준, Llama 2 Eq. (4)의 KL이 처음 정책 기준이라는 차이를 말한다.
  - [ ] 표의 세 줄을 계산해 clip이 “이득이 나는 방향의 과도한 이동”만 막는다는 점을 말한다.
- **원전:** PPO [arXiv:1707.06347](https://arxiv.org/abs/1707.06347v2) §3 · GAE [arXiv:1506.02438](https://arxiv.org/abs/1506.02438)

<a id="c-safety-bench"></a>

### 안전 벤치마크: TruthfulQA · ToxiGen · BOLD

- **무엇인가 (Others):** 사전학습 모델과 chat 모델의 안전을 자동으로 재는 세 벤치마크입니다. 생성은 temperature 0.1 · nucleus sampling top-p 0.9로 합니다.
- **원문:** [§4.1 · Table 11](https://arxiv.org/pdf/2307.09288v2#page=22) · [§4.4 · Table 14](https://arxiv.org/pdf/2307.09288v2#page=31) · [App. A.4.7](https://arxiv.org/pdf/2307.09288v2#page=69)

| 벤치마크 | 무엇을 평가하나 | 형식 · 채점 | 지표 |
| --- | --- | --- | --- |
| TruthfulQA | 사람도 오개념 때문에 틀리기 쉬운 질문 817개(38개 범주)에 사실대로 답하는가 | 무작위 QA 6쌍 few-shot → 생성 → 미세조정한 GPT-3 판정 모델(GPT-judge) | 사실 ∧ 정보성 비율 (높을수록 좋음) |
| ToxiGen | 소수 집단 13곳을 언급하는 은근한 독성 · 무해 문장에 이어 쓸 때 독성 생성 | 주석자 의견이 갈린 prompt를 걸러낸 수정판 · RoBERTa 독성 분류기 | 독성 생성 비율 (낮을수록 좋음) |
| BOLD | Wikipedia 문장 23,679개(인종 · 성별 · 종교 · 정치 · 직업, 43개 하위 집단)에 이어 쓴 글의 감정 | VADER 감정 점수 −1 … 1 | 집단별 평균 감정 |

| 모델 | TruthfulQA ↑ | ToxiGen ↓ |
| --- | --- | --- |
| LLaMA 1 7B → Llama 2 7B | 27.42 → 33.29 | 23.00 → 21.25 |
| LLaMA 1 65B → Llama 2 70B | 48.71 → 50.18 | 21.77 → **24.60** |
| Llama 2 70B → Llama 2-Chat 70B | 50.18 → 64.14 | 24.60 → **0.01** |
| ChatGPT | 78.46 | 0.20 |

- **설명할 수 있어야 하는 것:**
  - [ ] 원문의 “7B 진실성 21.37% 증가 · 독성 7.61% 감소”가 **상대 비율**(33.29 ÷ 27.42 = 1.214, 21.25 ÷ 23.00 = 0.924)이라는 점을 계산으로 보인다.
  - [ ] 사전학습 13B · 70B의 독성이 오른 것을 저자가 더 큰 데이터나 다른 혼합 탓으로 추정한다는 점을 Data의 필터링 결정과 연결한다.
  - [ ] 세 벤치마크 모두 판정 모델(GPT-judge · RoBERTa · VADER)에 의존한다는 점을 말한다.
- **함께 볼 개념:** [추가 독성 필터링을 하지 않은 결정](#c-no-scrub) · W01: [TruthfulQA](../w01/llama1-reading-map.html#c-truthfulqa) · 원전: [ToxiGen](https://arxiv.org/abs/2203.09509) · [BOLD](https://arxiv.org/abs/2101.11718)

<a id="c-red-teaming"></a>

### red teaming

- **무엇인가 (Others):** 사람이 공격자처럼 모델의 위험한 행동을 미리 찾아내는 작업입니다. 결과는 평가뿐 아니라 안전 학습 데이터로도 쓰였습니다.
- **원문:** [§4.3](https://arxiv.org/pdf/2307.09288v2#page=28)
  - **누가:** 내부 직원 · 계약직 · 외부 vendor **350명 이상**. 사이버보안 · 선거 부정 · 허위 정보 · 법률 · 정책 · 시민권 · 윤리 · ML · 창작 분야 전문가 포함.
  - **무엇을:** 범죄 계획 · 인신매매 · 규제 약물 · 성적 콘텐츠 · 자격 없는 의료 · 금융 조언 · 개인정보 등, 공격 방식은 가정 질문 · 오타 입력 · 긴 대화. 무기(핵 · 생물 · 화학 · 사이버) 생성 지원 능력도 따로 시험(결과는 “marginal”, 완화함).
  - **언어:** 모델 출력은 영어만 대상, 비영어 prompt는 공격 방식으로 포함.
  - **지표:** 견고성 γ = 전문가 1명이 1시간에 만든, 위반 응답을 끌어내는 prompt 수의 평균. 7B에서 **1.8 → 0.45**. 이전 red teaming에서 찾은 위반 prompt가 새 후보 모델에서 막히는 비율은 평균 **90%**.
- **설명할 수 있어야 하는 것:**
  - [ ] γ의 정의와 단위(사람 · 시간당 prompt 수)를 말한다.
  - [ ] 초기 모델이 “창작 요청”이나 “긍정적 맥락으로 감싸기”에 약했다는 red team 관찰을 예로 든다.
- **함께 볼 개념:** [적대적 prompt](#c-adversarial-prompts)

<a id="c-safety-human-eval"></a>

### 안전 사람 평가

- **무엇인가 (Others):** 적대적 prompt에 대한 응답을 사람이 5점 척도로 판정한 안전 평가입니다.
- **원문:** [§4.4](https://arxiv.org/pdf/2307.09288v2#page=29) · [Fig. 17–19](https://arxiv.org/pdf/2307.09288v2#page=30)
  - **prompt:** 약 2,000개(단일 턴 1,351 · 다중 턴 623).
  - **척도:** 5 위반 없음 · 매우 도움 / 4 위반 없음 · 사소한 문제 / 3 위반 없음 · 도움 안 됨 / 2 가벼운 · 중간 위반 / 1 심각한 위반. **1–2를 위반**으로 보고, 3명 다수결로 판정. 주 지표는 위반 비율, 평균 점수는 보조.
  - **일치도:** Gwet AC2 0.70–0.95, Llama 2-Chat 평균 0.92(도움 평가보다 높음).
  - **결과:** Llama 2-Chat은 크기와 관계없이 위반 비율이 비슷하거나 낮음. 다중 턴이 더 위험. 범주별로는 “자격 없는 조언”에서 상대적으로 위반이 많음(면책 문구 부족).
- **계산해 보면:** 원문의 Falcon 예: 위반 비율은 비슷해 보여도 평균 점수는 3.88 vs Llama 2-Chat 34B 4.45. Falcon은 답이 짧아(1–2문장) 위험한 말도 적지만 도움도 적은 “3점”이 많기 때문입니다.
- **설명할 수 있어야 하는 것:**
  - [ ] 위반 비율만 보면 “아무 말도 안 하는 모델”이 유리해지는 이유를 Falcon 예로 말한다.
  - [ ] 저자가 이 평가의 내용 기준이 Llama 2-Chat에 유리하게 치우쳤을 수 있다고 스스로 적은 점(Fig. 3 캡션)을 말한다.

<a id="c-beyond-supervision"></a>

### 사람 감독을 넘어서

- **무엇인가 (Others):** 저자가 §5.1에서 내린 해석입니다. SFT는 사람이 쓴 답의 질에 묶이지만, RLHF는 사람이 **비교만** 하면 되므로 사람의 작문 능력을 넘을 수 있다는 주장입니다.
- **원문:** [§5.1 Beyond Human Supervision · Fig. 20](https://arxiv.org/pdf/2307.09288v2#page=32)
  - 숙련된 annotator도 쓰는 답의 편차가 크고, SFT 모델은 그 꼬리(질 낮은 annotation)까지 배웁니다. 성능 상한은 가장 잘 쓰는 annotator의 실력입니다.
  - 두 답을 비교하는 일은 사람 사이의 편차가 작아서, RM이 나쁜 꼬리에 낮은 점수를 빠르게 주게 됩니다. Fig. 20: SFT → RLHF V1 → V2로 갈수록 RM 점수 분포의 왼쪽 꼬리가 사라짐.
  - 비유: 모두가 예술가는 아니지만 작품을 감상 · 비평할 수는 있다.
  - 결론: “Supervised data may no longer be the gold standard.”
- **설명할 수 있어야 하는 것:**
  - [ ] Fig. 20은 **RM 점수** 분포이고, RLHF가 사람 작문을 넘어선다는 문장은 **저자 가설**(“We posit”)이라는 점을 구분한다.
  - [ ] SFT 데이터 수집을 일찍 멈추고 선호 데이터에 투자한 결정(§3.1)과 이 주장을 연결한다.

<a id="c-temporal-tool"></a>

### temperature · 시간 · 도구 사용 관찰

- **무엇인가 (Others):** §5.1의 나머지 세 관찰입니다.
- **원문:** [§5.1](https://arxiv.org/pdf/2307.09288v2#page=32) · [Fig. 21–23 · Table 15](https://arxiv.org/pdf/2307.09288v2#page=33)
  - **prompt별 temperature 재조정:** 창작 prompt 10개 · 사실 prompt 10개에 각각 25개 응답을 T = 0.1–1.5에서 생성해 Self-BLEU(낮을수록 다양)를 잼. RLHF가 진행될수록 사실 prompt는 temperature를 올려도 같은 답을 내고, 창작 prompt는 다양성을 유지.
  - **시간 인식:** 날짜와 관련된 SFT 예시 1,000개(질문 시점과 사건 시점 메타데이터 포함)만으로 시간 순서를 일관되게 다룸. 저자가 수십 개 예시를 직접 시험한 정성 관찰.
  - **도구 사용:** 도구 사용을 명시적으로 annotate하지 않았는데도 zero-shot으로 여러 도구를 순서대로 쓰는 예(Fig. 23). 계산기를 쓴 수학 평가(Table 15): ASDiv 67.1 · SVAMP 69.2 · MAWPS 82.4, Toolformer 40.4 · 29.4 · 44.0.
- **설명할 수 있어야 하는 것:**
  - [ ] Self-BLEU가 생성끼리 얼마나 겹치는지 재는 지표라 높을수록 다양성이 낮다는 점을 말한다.
  - [ ] 세 관찰 모두 규모가 작은 실험이거나 사례 제시라는 점과, Table 15의 비교 수치는 Toolformer 논문에서 가져왔다는 점을 말한다.
- **함께 볼 개념:** [Sampling temperature의 재조정](#c-rs-temperature) · 원전: Toolformer [arXiv:2302.04761](https://arxiv.org/abs/2302.04761) · Self-BLEU [arXiv:1802.01886](https://arxiv.org/abs/1802.01886)

<a id="c-limitations-release"></a>

### 한계와 공개 전략

- **무엇인가 (Others):** 저자가 밝힌 한계와 모델 공개 방식입니다.
- **원문:** [§5.2–§5.3](https://arxiv.org/pdf/2307.09288v2#page=34) · [p.4](https://arxiv.org/pdf/2307.09288v2#page=4) · [A.7 Table 52](https://arxiv.org/pdf/2307.09288v2#page=77)
  - **한계:** 사전학습 이후 지식 갱신 없음, 사실이 아닌 생성 · 환각, 영어 외 언어는 사전학습 데이터가 적어 불안정, 유해 · 편향 내용이 남을 수 있음(특히 영어 외), **안전 튜닝이 지나쳐** 거절하거나 안전 설명이 과할 때가 있음.
  - **공개:** 7B · 13B · 70B의 사전학습 · chat 모델을 연구 · 상업 용도로 공개, 34B는 red teaming 시간이 부족해 공개 연기. 자체 라이선스와 Acceptable Use Policy, Responsible Use Guide, 안전 생성 코드 예시 제공.
  - **모델 카드:** 학습 기간 2023년 1–7월, 사전학습 cutoff 2022년 9월, 의도된 용도는 영어 상업 · 연구, 영어 외 언어 사용은 범위 밖.
- **설명할 수 있어야 하는 것:**
  - [ ] 저자가 스스로 인정한 “과한 안전 튜닝”을 Alignment의 false refusal 측정과 연결한다.
  - [ ] “open release”가 가중치 공개이지 데이터 공개가 아니라는 점을 Data의 미공개 혼합과 연결한다.
- **함께 볼 개념:** [false refusal](#c-false-refusal) · [언어 분포](#c-language-dist)

<!-- part: common -->
## 검토 기록

### 입력과 검토 상태

- 보고서: Touvron et al., *Llama 2: Open Foundation and Fine-Tuned Chat Models*, [arXiv:2307.09288v2](https://arxiv.org/abs/2307.09288v2). 링크는 v2 PDF의 파일 페이지 기준입니다(77쪽).
- 확인한 범위: 본문 §1–§5.3(PDF p.3–35)의 텍스트 추출본 전부, 부록 A.2.1–A.2.2(Table 16–25), A.3.1–A.3.7(Table 26–32), A.4.1–A.4.2, A.4.7, A.6(Table 51), A.7(Table 52)의 텍스트.
- 확인하지 못한 범위: 그림(Fig. 5–33)은 캡션과 본문 설명, 추출된 축 값만 봤고 이미지를 직접 확인하지 않았습니다. A.4.3–A.4.6 · A.4.8의 긴 예시 표, A.5 annotation 지침, §6 관련 연구는 읽지 않았습니다.
- 학습목표·가이드: [W02 학습목표](README.md) · [W02 Background](../../background/w02.md). 학습목표 세 가지는 Architecture RQ2 · Alignment RQ1 · Alignment RQ2(+ Post RQ2)에 대응합니다.
- 외부 원전: InstructGPT App. C.4(PPO 설정)와 Llama 3 Table 3 · §4(GQA 설정 · margin 제거 · DPO · RS의 K)를 2026-10-17에 원문에서 확인했습니다. Mistral 7B · DeepSeek-V2 · DPO · GRPO · PPO 원 논문의 하이퍼파라미터와 공개 모델 config(70B 80 layer · KV 8 head 등)는 이번에 다시 열지 않았습니다.
- 사람 검토: **미검토** · 검토자·일시 미지정
- AI 재검토: Table 3 범주 평균을 Table 20–25로 재계산해 일치를 확인했고, Table 18 평균 · Table 2의 탄소 계수 · Table 6 합계(Total과 1,577 차이) · Table 26 batch 합계를 계산했습니다. 이 지도는 이전 K ID 형식(2026-10-15, `.local/llama-study-output/llama2-reading-map.md`)을 다섯 파트 개요 · 파트별 질문 · 개념별 페이지로 다시 구성하고 원문으로 다시 대조한 것입니다. 이전 판에서 “확인 필요”로 남긴 V4 경계는 Fig. 11의 표기로 해석을 덧붙였고, 최종 margin 종류 · RM 초기 checkpoint · 실제 K · 보조 loss 식은 여전히 원문 미기술로 둡니다.
