# W06 Post-training 발표 대본

## @overview
제 파트는 DeepSeek-V3의 Post-training입니다. SFT 설정이 핵심이고, 그 설정 한 문단에서 질문 하나가 나옵니다. 평가는 결론만 짧게 보겠습니다.

## @cost
비용부터 보면, H800을 시간당 2달러로 쳐도 전체 학습이 약 558만 달러입니다. 이 중 후학습은 5K GPU hours로 전체의 0.2%도 안 됩니다. 사전학습이 비용 대부분이고, 이 숫자엔 선행 연구·ablation 비용은 빠져 있습니다.

## @sft-data
제 파트는 아니지만 흐름상 SFT 데이터를 두 장 짚겠습니다. 전체 1.5M instances이고 도메인마다 만드는 방법이 다릅니다. 그중 reasoning, 즉 수학과 코드 경쟁 문제, 논리 퍼즐 데이터는 내부 R1 모델로 생성합니다. 문제는 R1이 만든 데이터가 정확도는 강한데 overthinking, 형식 불량, 과도한 길이라는 문제가 있다는 겁니다. 반대로 일반 형식의 reasoning 데이터는 명료하고 간결한데 정확도가 R1만 못합니다. 그래서 저자의 목표는 이 둘을 balance하는 것, R1의 정확도는 가져오고 장황함은 버리는 것입니다.

## @sft-pipeline
그 방법이 이 네 단계입니다. 먼저 code, mathematics, general reasoning 각 도메인마다 SFT와 RL을 조합한 파이프라인으로 expert 모델을 따로 학습합니다. 이 expert 모델이 최종 모델용 데이터 생성기 역할을 합니다. 둘째로, 학습할 때 문제 하나마다 SFT 샘플을 두 종류 만듭니다. 하나는 문제와 원래 응답을 묶은 것, 다른 하나는 system prompt와 문제, 그리고 R1의 응답을 묶은 것입니다. 이 system prompt는 모델이 reflection과 verification을 하도록 유도하게 설계했습니다. 셋째, RL 단계에서 high-temperature sampling으로 두 패턴이 섞인 응답을 생성하게 하고, 수백 step이 지나면 system prompt가 없어도 R1 패턴을 쓰게 됩니다. 마지막으로 RL이 끝난 expert 모델을 생성원으로 rejection sampling을 걸어 고품질 데이터만 최종 SFT 데이터로 추립니다. 이렇게 해서 정확하면서 간결한 데이터를 얻는다는 겁니다. Non-reasoning 데이터는 창작이나 롤플레이, 단순 QA인데 V2.5가 생성하고 사람이 검수하는 것으로 간단합니다.

## @sft
SFT 설정은 한 문단입니다. 1.5M 샘플을 2 epoch 돌리고, 학습률은 cosine으로 5e-6에서 1e-6까지 내립니다. W02 Llama 2, W04 Qwen2.5와 나란히 놓으면 2 epoch에 작은 학습률이라는 틀은 같고, 데이터 규모가 가장 큽니다. 그리고 마지막 줄, 여러 샘플을 한 sequence에 packing하되 sample masking으로 서로 못 보게 한다는 문장이 오늘 질문의 출발점입니다.

## @rq-problem
짧은 샘플을 패딩으로 채우면 계산이 아까우니 여러 샘플을 이어 붙입니다. 이게 packing인데, 사실 여기서 결정이 두 개로 갈립니다. 하나는 무엇을 같이 넣을까입니다. 그냥 쭉 이어 붙이고 길이에 맞춰 자르면 문서가 중간에 잘리고, Ding et al.의 Best-fit Packing은 bin packing으로 그 잘림을 줄입니다. V3가 §4.1에서 document packing method라고 부른 게 이쪽입니다. 다른 하나는 넣은 다음 서로 보게 둘까입니다. 이어 붙이면 모델 입장에서는 그냥 하나의 긴 시퀀스라서, 뒤 샘플이 앞 샘플을 attention으로 봅니다. 끊으려면 attention mask를 따로 손봐야 하고 그게 sample masking입니다. 오늘 볼 질문은 두 번째입니다.

## @mask-grid
그림으로 보면 명확합니다. 샘플 A, B, C를 각각 3토큰씩 한 시퀀스에 넣은 경우입니다. 행은 지금 예측하는 토큰, 열은 그 토큰이 참고할 수 있는 토큰입니다. 왼쪽이 마스킹을 안 한 경우인데, causal mask만 걸려 있어서 자기보다 앞이면 다른 샘플이어도 다 봅니다. 주황색 칸이 그 부분, 즉 B와 C가 앞 샘플을 보고 있는 겁니다. 오른쪽이 sample masking을 건 경우입니다. 주황색 칸이 사라지고 블록 대각선 모양만 남습니다. 각 샘플이 자기 안에서만 attend하니까, Ding et al. 표현으로는 각 샘플을 따로 학습한 것과 동등한 상태가 됩니다. 참고로 이건 9토큰으로 줄인 그림이고, 실제 SFT에서는 한 시퀀스에 샘플 수십 개가 들어갑니다.

## @rq-contrast
§4.1 사전학습을 보면, document packing은 쓰지만 cross-sample attention masking은 쓰지 않는다고 명시합니다. 반면 §5.1 SFT Settings는 정반대로, sample masking을 써서 샘플끼리 안 보이게 한다고 씁니다. 같은 논문, 같은 모델인데 단계마다 선택이 다릅니다. 이유는 원문에 없고, §4.1은 이 packing 방식이 Ding et al. 2024에서 왔다고만 밝힙니다.

## @rq-related
그래서 그 Ding et al. 2024를 직접 찾아봤습니다. Best-fit Packing이라는 방법인데, 놀랍게도 packing과 함께 cross-document attention masking도 같이 씁니다. 즉 V3는 이 논문에서 영감을 받았다면서 masking 부분만 빼고 가져온 셉니다. Zhao et al. 2024도 같은 chunking에 masking만 추가했더니 perplexity, in-context learning, 지식 질의가 전부 개선됐다고 보고합니다. Llama 3도 문서 경계 attention mask를 사전학습에 썼고, 표준 사전학습엔 영향이 적지만 긴 문맥 continued pretraining에서는 중요하다고 합니다. 세 논문 모두 masking 쪽이 유리하거나 필요하다고 보는 셉니다.

## @mask-meaning
그러면 같은 선택이 단계마다 어떤 의미인지 정리해보겠습니다. 출발점은 한 줄에 섞이는 대상이 다르다는 겁니다. 사전학습에서 섞이는 건 서로 다른 문서이고, SFT에서 섞이는 건 서로 다른 instruction-response 쌍입니다.

안 막으면 뭐가 보이냐도 다릅니다. 사전학습에서는 앞 문서 전체가 그냥 문맥처럼 보이는 거고, SFT에서는 앞 샘플의 질문과 정답이 그대로 보입니다.

그게 문제인 정도도 다릅니다. 사전학습 쪽은 Zhao et al.이 측정한 게 있는데, 둘째 문서의 256번째 토큰까지 attention의 45에서 52%가 다른 문서로 향한다고 합니다. 꽤 많은 양이 무관한 데로 새는 거죠. 다만 Llama 3는 표준 사전학습에서는 영향이 적다고 하니 평가가 갈립니다. SFT 쪽은 제 해석인데, SFT는 보통 prompt를 빼고 답 토큰에만 loss를 겁니다. 그러면 앞 샘플의 답이 보일 때 그게 바로 지금 생성할 답에 영향을 줍니다. 게다가 추론할 때는 대화 하나만 들어오니까, 학습 때 남의 샘플을 참고하던 습관은 train-test mismatch가 됩니다.

그래서 V3의 선택을 보면, 사전학습은 막지 않았습니다. 14.8T 토큰에 4% 비용을 쓰지 않기로 한 걸로 추정하는데 원문 근거는 없습니다. SFT는 막았고, 원문 표현 그대로 isolated and mutually invisible입니다. 이게 맞는 선택이었는지는 ablation이 없어서 V3 논문만으로는 알 수 없고, 열린 질문으로 남겨둡니다.

## @eval-base
이제 평가입니다. Base 모델 평가는 간단히, V3-Base가 31개 벤치마크 중 22개에서 최고입니다. 저자는 V2와 Qwen2.5는 전반적으로, LLaMA 405B는 대부분 앞선다고 쓰는데, 표를 세어보면 대체로 맞지만 V2-Base가 5개에서는 오히려 더 높습니다. Code와 Math 9개는 전부 1위이고 차이도 가장 큽니다.

## @eval-chat
Chat 평가는 벤치마크를 더 붙여서 오픈모델과 Claude, GPT-4o까지 7개를 비교합니다. 오픈모델 중에서는 22개 중 20개가 최고이고, GPT-4o와 비교해도 20개에서 앞섭니다. 수학은 2위와 10에서 27점까지 차이가 나는 압도적인 영역입니다. 약점은 SimpleQA 같은 영어 사실 지식, 그리고 실제 저장소를 고치는 SWE-Bench와 Aider-Edit인데, 여기는 Claude와 GPT-4o 다음입니다.

## @eval-open
마지막으로 LLM이 채점하는 열린 대화 평가입니다. Arena-Hard 85.5로 85% 넘은 첫 오픈모델이고, 본문은 86% 이상이라고 적었는데 표는 85.5라 살짝 다릅니다. AlpacaEval은 70.0으로 2위 Claude보다 18점 높습니다.

## @summary
정리하면 세 가지입니다. SFT는 2 epoch짜리 단순한 설정이고 후학습 비용은 전체의 0.2%가 안 됩니다. 그런데 packing과 masking은 단계마다 다르게 선택했고, 다른 논문들은 대체로 masking 쪽이 유리하다고 봅니다. 그러면서도 Base와 Chat 모두 오픈모델 중 최고를 찍었습니다.
