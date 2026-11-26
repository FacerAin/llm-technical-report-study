# W06 Post-training 발표 대본

## @overview
제 파트는 DeepSeek-V3의 Post-training입니다. 다만 학습 방법 자체보다는 SFT를 어떤 설정으로 돌렸는지, 그리고 그 결과 모델이 얼마나 잘하는지를 보는 평가 절이 대부분입니다. 평가는 두 번 나옵니다. 사전학습이 끝난 Base 모델을 한 번, 후학습까지 끝난 Chat 모델을 한 번 봅니다.

## @cost
먼저 비용입니다. H800을 시간당 2달러로 빌렸다고 치면 전체 학습이 약 558만 달러입니다. 이 중 후학습은 5K GPU hours로, 전체의 0.2%도 안 됩니다. 사전학습이 비용의 대부분이라는 뜻이고, 다만 이 숫자에는 선행 연구와 ablation 비용이 빠져 있다는 점을 원문도 밝힙니다.

## @sft
SFT 설정은 한 문단이 전부입니다. 1.5M 샘플을 2 epoch 돌리고, 학습률은 cosine으로 5e-6에서 1e-6까지 내립니다. W02 Llama 2, W04 Qwen2.5와 나란히 놓으면 2 epoch에 작은 학습률이라는 틀은 같고, 데이터 규모가 가장 큽니다. sequence 길이나 batch size는 적혀 있지 않습니다.

## @packing
설정에서 눈여겨볼 건 packing과 sample masking입니다. 짧은 샘플을 그냥 padding하면 계산이 낭비되니 여러 샘플을 한 줄에 이어 붙입니다. 그런데 그대로 두면 뒤 샘플 B의 토큰이 앞 샘플 A를 attend합니다. 그래서 샘플 경계에서 attention을 끊어, 오른쪽 그림처럼 같은 샘플 안에서만 보게 합니다. 구현 방법은 원문에 없습니다.

## @base-method
이제 Base 평가입니다. 방식이 세 가지입니다. 객관식은 보기마다 확률을 비교하는 perplexity 방식, 수학이나 코드처럼 답을 써야 하는 건 생성해서 채점합니다. Pile-test는 BPB를 쓰는데, 모델마다 tokenizer가 달라 토큰 단위 perplexity는 공정하지 않기 때문이라고 원문이 이유를 적었습니다.

## @t3
Table 3은 Base 모델 네 개 비교입니다. V3-Base는 활성 37B인데 31개 중 22개에서 최고입니다. 저자는 V2와 Qwen2.5는 전반적으로 앞서고 LLaMA 405B는 대부분 앞선다고 씁니다. 표를 세어 보면 대체로 맞지만, 이전 모델인 V2-Base가 RACE 같은 5개에서는 오히려 더 높습니다.

## @t3-en
English 행을 보면 BBH, MMLU 계열, DROP 같은 지식과 추론은 1위입니다. 반면 RACE 독해와 PIQA, NaturalQuestions에서는 LLaMA 405B에 뒤집니다. 저자 표현도 English는 competitive or better로 조심스럽습니다.

## @t3-code
차이가 가장 큰 곳은 Code와 Math입니다. 9개 모두 1위이고, 활성 파라미터가 11배인 LLaMA보다 MATH에서 12.6점 높습니다. 중국어는 Qwen2.5와 비슷하고 CMMLU만 뒤집니다.

## @chat-bench
Chat 모델은 벤치마크를 더 붙입니다. 지시 따르기, 긴 문맥, 실제 저장소를 고치는 SWE-Bench나 Aider, 경쟁 프로그래밍, 경시 수학입니다. 비교 대상은 이전 DeepSeek 두 개, Qwen2.5, LLaMA 405B, 그리고 Claude 3.5 Sonnet과 GPT-4o입니다.

## @chat-cfg
숫자를 읽기 전 조건입니다. 모든 모델 출력을 8K 토큰으로 자릅니다. 경시 수학은 temperature 0.7로 16번 돌려 평균을 내고, MATH-500은 greedy입니다. SWE-Bench는 agentless 방식이라 에이전트 성능과는 다릅니다.

## @t6
Table 6입니다. 오픈모델과 비교하면 22개 중 20개에서 최고고, 예외는 MMLU에서 LLaMA와 0.1 차이, CLUEWSC에서 Qwen에 0.5 뒤진 것뿐입니다. 폐쇄 모델과는 Claude보다 16개, GPT-4o보다 20개에서 높습니다.

## @t6-en
영어 쪽은 긴 문맥에서 강합니다. DROP과 LongBench v2는 1위, FRAMES는 GPT-4o 다음입니다. 대학원 수준 지식인 GPQA는 Claude보다 6점 낮지만 나머지는 크게 앞섭니다.

## @t6-sqa
SimpleQA는 거꾸로 약점입니다. 영어 사실 지식은 GPT-4o와 Claude에 밀리는데, 중국어 버전 C-SimpleQA는 1위입니다. 저자는 중국어 지식에 토큰을 더 배정했기 때문이라고 설명하지만, 실험으로 보여 주지는 않았습니다.

## @t6-code
코드는 둘로 갈립니다. HumanEval이나 LiveCodeBench 같은 알고리즘 문제는 1위이고, Codeforces percentile은 2위보다 16점 높습니다. 실제 저장소를 고치는 SWE-Bench와 Aider-Edit은 Claude 다음입니다. 저자는 알고리즘 쪽 강점을 R1 distillation 덕으로 봅니다.

## @t6-math
수학은 가장 압도적입니다. AIME, MATH-500, CNMO 모두 1위이고, 저자는 2위보다 약 10% 높다고 썼지만 실제 차이는 10에서 27점입니다. 이것도 R1 distillation 효과라고 설명합니다. 중국어 C-Eval과 CLUEWSC는 Qwen과 비슷합니다.

## @t7
마지막으로 LLM이 채점하는 열린 대화 평가입니다. Arena-Hard 85.5로 Claude와 동급이고, AlpacaEval은 70으로 2위보다 18점 높습니다. 하나 짚을 건, 본문은 Arena-Hard를 86% 이상이라고 썼는데 표는 85.5라는 점입니다.

## @summary
정리하면, SFT는 2 epoch짜리 단순한 설정이고 후학습 비용은 전체의 0.2%가 안 됩니다. 그런데도 Base와 Chat 모두 오픈모델 중 최고입니다. 강점은 수학과 알고리즘 코딩, 약점은 영어 사실 지식과 실제 저장소 수정입니다.
