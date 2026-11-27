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
짧은 샘플을 패딩으로 채우면 계산이 아까우니 여러 샘플을 이어 붙입니다. 그런데 이어 붙이고 나면 뒤 샘플이 앞 샘플을 attention으로 볼 수 있습니다. 이걸 그대로 둘지, 경계에서 끊을지가 질문입니다. 그리고 DeepSeek-V3는 이 질문에 사전학습과 SFT에서 다른 답을 냅니다.

## @rq-contrast
§4.1 사전학습을 보면, document packing은 쓰지만 cross-sample attention masking은 쓰지 않는다고 명시합니다. 반면 §5.1 SFT Settings는 정반대로, sample masking을 써서 샘플끼리 안 보이게 한다고 씁니다. 같은 논문, 같은 모델인데 단계마다 선택이 다릅니다. 이유는 원문에 없고, §4.1은 이 packing 방식이 Ding et al. 2024에서 왔다고만 밝힙니다.

## @rq-related
그래서 그 Ding et al. 2024를 직접 찾아봤습니다. Best-fit Packing이라는 방법인데, 놀랍게도 packing과 함께 cross-document attention masking도 같이 씁니다. 즉 V3는 이 논문에서 영감을 받았다면서 masking 부분만 빼고 가져온 셉니다. Zhao et al. 2024도 같은 chunking에 masking만 추가했더니 perplexity, in-context learning, 지식 질의가 전부 개선됐다고 보고합니다. Llama 3도 문서 경계 attention mask를 사전학습에 썼고, 표준 사전학습엔 영향이 적지만 긴 문맥 continued pretraining에서는 중요하다고 합니다. 세 논문 모두 masking 쪽이 유리하거나 필요하다고 보는 셉니다.

## @rq-wrap
정리하면, masking은 다른 연구에서 대체로 도움이 되는데 V3는 사전학습에서는 빼고 SFT에서만 썼습니다. 추정해보면 사전학습은 14.8T 토큰 규모라 masking의 효율 비용(Zhao et al. 추정 약 4%)이 부담됐을 수 있고, SFT는 1.5M으로 규모가 작아 그 비용을 감당할 수 있었을 수 있습니다. 다만 이건 제 추정이고, 원문에 ablation이 없어 확인은 안 됩니다.

## @eval-base
이제 평가입니다. Base 모델 평가는 간단히, V3-Base가 31개 벤치마크 중 22개에서 최고입니다. 저자는 V2와 Qwen2.5는 전반적으로, LLaMA 405B는 대부분 앞선다고 쓰는데, 표를 세어보면 대체로 맞지만 V2-Base가 5개에서는 오히려 더 높습니다. Code와 Math 9개는 전부 1위이고 차이도 가장 큽니다.

## @eval-chat
Chat 평가는 벤치마크를 더 붙여서 오픈모델과 Claude, GPT-4o까지 7개를 비교합니다. 오픈모델 중에서는 22개 중 20개가 최고이고, GPT-4o와 비교해도 20개에서 앞섭니다. 수학은 2위와 10에서 27점까지 차이가 나는 압도적인 영역입니다. 약점은 SimpleQA 같은 영어 사실 지식, 그리고 실제 저장소를 고치는 SWE-Bench와 Aider-Edit인데, 여기는 Claude와 GPT-4o 다음입니다.

## @eval-open
마지막으로 LLM이 채점하는 열린 대화 평가입니다. Arena-Hard 85.5로 85% 넘은 첫 오픈모델이고, 본문은 86% 이상이라고 적었는데 표는 85.5라 살짝 다릅니다. AlpacaEval은 70.0으로 2위 Claude보다 18점 높습니다.

## @summary
정리하면 세 가지입니다. SFT는 2 epoch짜리 단순한 설정이고 후학습 비용은 전체의 0.2%가 안 됩니다. 그런데 packing과 masking은 단계마다 다르게 선택했고, 다른 논문들은 대체로 masking 쪽이 유리하다고 봅니다. 그러면서도 Base와 Chat 모두 오픈모델 중 최고를 찍었습니다.
