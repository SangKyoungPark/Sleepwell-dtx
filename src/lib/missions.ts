import type { Mission } from "@/types";

export const MISSIONS: Mission[] = [
  // === 1주차: 관찰 & 인식 ===
  { id: "w1d1", week: 1, day: 1, title: "오늘 카페인 마지막 섭취 시각 기록하기", description: "커피, 녹차, 에너지음료 등 카페인 음료를 마지막으로 마신 시각을 적어보세요. 인식하는 것이 첫 걸음입니다.", category: "hygiene", difficulty: "easy" },
  { id: "w1d2", week: 1, day: 2, title: "취침 1시간 전 스마트폰 내려놓기", description: "블루라이트는 수면 호르몬(멜라토닌) 분비를 억제합니다. 오늘 하루만 시도해보세요.", category: "hygiene", difficulty: "easy" },
  { id: "w1d3", week: 1, day: 3, title: "잠들기 전 걱정 3가지 적어보기", description: "머릿속 걱정을 종이나 메모앱에 꺼내놓으면, 뇌가 '처리 완료'로 인식해 마음이 가벼워집니다.", category: "cognitive", difficulty: "easy" },
  { id: "w1d4", week: 1, day: 4, title: "침실 온도 18~20도로 맞추기", description: "체온이 살짝 낮아져야 잠이 잘 옵니다. 침실 온도를 확인하고 조절해보세요.", category: "hygiene", difficulty: "easy" },
  { id: "w1d5", week: 1, day: 5, title: "기상 알람을 하나로 통일하기", description: "5분 간격 여러 알람은 수면 품질을 떨어뜨립니다. 알람 하나로 일어나보세요.", category: "hygiene", difficulty: "easy" },
  { id: "w1d6", week: 1, day: 6, title: "이번 주 수면 일지 패턴 돌아보기", description: "기록한 수면 일지를 보며, 어떤 날 잘 잤고 어떤 날 못 잤는지 비교해보세요.", category: "cognitive", difficulty: "easy" },
  { id: "w1d7", week: 1, day: 7, title: "나만의 '수면 방해 요인' 1가지 찾기", description: "이번 주 관찰을 바탕으로, 내 수면을 가장 방해하는 요인 1가지를 정해보세요.", category: "cognitive", difficulty: "easy" },

  // === 2주차: 수면 위생 실천 ===
  { id: "w2d1", week: 2, day: 1, title: "오후 2시 이후 카페인 금지 도전", description: "카페인의 반감기는 약 6시간입니다. 오후 2시 이후에는 디카페인이나 허브차로 대체해보세요.", category: "hygiene", difficulty: "medium" },
  { id: "w2d2", week: 2, day: 2, title: "나만의 취침 루틴 30분 만들기", description: "매일 같은 순서로 반복하면 뇌가 '잠 잘 시간'을 인식합니다. 예: 양치 → 스트레칭 → 독서 → 취침", category: "hygiene", difficulty: "medium" },
  { id: "w2d3", week: 2, day: 3, title: "침대에서 수면 외 활동 줄이기", description: "침대에서는 수면과 친밀한 활동만! 유튜브, SNS, 업무는 다른 공간에서 해보세요.", category: "restriction", difficulty: "medium" },
  { id: "w2d4", week: 2, day: 4, title: "저녁 식사 후 가벼운 산책 15분", description: "과격한 운동은 피하되, 가벼운 산책은 수면에 도움이 됩니다. 저녁 식사 후 동네 한 바퀴 돌아보세요.", category: "hygiene", difficulty: "medium" },
  { id: "w2d5", week: 2, day: 5, title: "취침 전 조명을 따뜻한 색으로 바꾸기", description: "형광등 대신 따뜻한 조명(전구색)을 사용하면 멜라토닌 분비에 도움이 됩니다.", category: "hygiene", difficulty: "easy" },
  { id: "w2d6", week: 2, day: 6, title: "주말에도 같은 시간에 기상하기", description: "주말 늦잠은 월요일 불면의 원인이 됩니다. 평일과 30분 이내 차이로 일어나보세요.", category: "restriction", difficulty: "hard" },
  { id: "w2d7", week: 2, day: 7, title: "2주차 돌아보기: 개선된 점 찾기", description: "1주차와 비교해서 달라진 점을 찾아보세요. 작은 변화도 의미 있습니다.", category: "cognitive", difficulty: "easy" },

  // === 3주차: 이완 훈련 ===
  { id: "w3d1", week: 3, day: 1, title: "4-7-8 호흡법 3회 실습하기", description: "4초 들숨 → 7초 참기 → 8초 날숨. 부교감 신경이 활성화되어 긴장이 풀립니다.", category: "relaxation", difficulty: "easy" },
  { id: "w3d2", week: 3, day: 2, title: "점진적 근이완법(PMR) 따라하기", description: "발부터 머리까지, 각 근육을 5초 긴장 → 10초 이완. 온몸의 긴장을 풀어보세요.", category: "relaxation", difficulty: "medium" },
  { id: "w3d3", week: 3, day: 3, title: "바디스캔 명상 10분 해보기", description: "누워서 발끝부터 머리끝까지 천천히 주의를 이동시키며, 몸의 감각을 관찰합니다.", category: "relaxation", difficulty: "medium" },
  { id: "w3d4", week: 3, day: 4, title: "취침 전 감사 일기 3줄 적기", description: "오늘 감사한 것 3가지를 적으면, 긍정적 감정 상태로 잠자리에 들 수 있습니다.", category: "cognitive", difficulty: "easy" },
  { id: "w3d5", week: 3, day: 5, title: "자기 전 좋아하는 이완법 반복하기", description: "이번 주 배운 이완법 중 가장 편했던 것을 골라 반복해보세요.", category: "relaxation", difficulty: "easy" },
  { id: "w3d6", week: 3, day: 6, title: "낮 시간에 스트레스 해소법 1가지 실천", description: "낮의 스트레스가 밤 수면에 영향을 줍니다. 운동, 산책, 대화 등 자신만의 해소법을 찾아보세요.", category: "relaxation", difficulty: "medium" },
  { id: "w3d7", week: 3, day: 7, title: "3주차 돌아보기: 이완법 효과 비교", description: "호흡법, PMR, 바디스캔 중 어떤 것이 가장 도움이 되었는지 생각해보세요.", category: "cognitive", difficulty: "easy" },

  // === 4주차: 인지 재구성 ===
  { id: "w4d1", week: 4, day: 1, title: "'잠 못 자면 큰일' 생각 기록하기", description: "잠들기 전 떠오르는 수면 관련 부정적 생각을 적어보세요. 적는 것만으로도 거리 두기가 됩니다.", category: "cognitive", difficulty: "medium" },
  { id: "w4d2", week: 4, day: 2, title: "부정적 생각에 대안 찾기", description: "'내일 회의 망할 거야' → '잠을 좀 못 자도 회의는 할 수 있어'. 현실적인 대안을 적어보세요.", category: "cognitive", difficulty: "medium" },
  { id: "w4d3", week: 4, day: 3, title: "걱정 시간 15분 정하기", description: "취침 2시간 전, 걱정만 하는 시간 15분을 정해두세요. 그 시간 외에는 걱정을 미뤄둡니다.", category: "cognitive", difficulty: "hard" },
  { id: "w4d4", week: 4, day: 4, title: "수면 믿음 체크리스트 점검하기", description: "'8시간 못 자면 건강에 큰 문제가 생긴다' — 이런 생각이 실제로 맞는지 점검해보세요.", category: "cognitive", difficulty: "medium" },
  { id: "w4d5", week: 4, day: 5, title: "시계 치우기 또는 돌려놓기", description: "밤에 시계를 확인하는 행동은 불안을 키웁니다. 알람만 설정하고 시계를 보이지 않게 해보세요.", category: "cognitive", difficulty: "easy" },
  { id: "w4d6", week: 4, day: 6, title: "잠 못 잔 다음 날, 실제로 어땠는지 기록", description: "예상만큼 나쁘지 않았다면, 불면에 대한 공포가 줄어듭니다.", category: "cognitive", difficulty: "easy" },
  { id: "w4d7", week: 4, day: 7, title: "4주차 돌아보기: 생각이 달라졌나?", description: "수면에 대한 생각이 처음과 비교해 어떻게 바뀌었는지 돌아보세요.", category: "cognitive", difficulty: "easy" },

  // === 5주차: 수면 제한 ===
  { id: "w5d1", week: 5, day: 1, title: "나의 평균 수면효율 확인하기", description: "지난 주 수면 일지의 수면효율 평균을 확인합니다. 이 값이 맞춤 취침시간의 기준이 됩니다.", category: "restriction", difficulty: "easy" },
  { id: "w5d2", week: 5, day: 2, title: "맞춤 취침시간 설정하기", description: "수면효율이 85% 미만이면, 침대 시간을 30분 줄여보세요. 졸릴 때만 침대에 가세요.", category: "restriction", difficulty: "hard" },
  { id: "w5d3", week: 5, day: 3, title: "20분 이내 잠이 안 오면 침대 떠나기", description: "침대에서 뒤척이지 말고 일어나서 단조로운 활동을 하다가, 졸리면 다시 눕습니다.", category: "restriction", difficulty: "hard" },
  { id: "w5d4", week: 5, day: 4, title: "기상 시각 엄수하기", description: "아무리 잠을 못 자도 정해진 시각에 일어납니다. 이것이 수면 드라이브를 높이는 핵심입니다.", category: "restriction", difficulty: "hard" },
  { id: "w5d5", week: 5, day: 5, title: "낮잠 금지 도전", description: "낮잠은 밤 수면 욕구를 줄입니다. 졸리더라도 낮잠 대신 가벼운 활동으로 버텨보세요.", category: "restriction", difficulty: "hard" },
  { id: "w5d6", week: 5, day: 6, title: "수면효율 85% 이상이면 취침시간 15분 앞당기기", description: "수면 제한의 보상! 효율이 좋아지면 조금씩 침대 시간을 늘려갑니다.", category: "restriction", difficulty: "medium" },
  { id: "w5d7", week: 5, day: 7, title: "5주차 돌아보기: 수면효율 변화 확인", description: "수면 제한 전후의 수면효율을 비교해보세요. 수치가 올랐다면 큰 진전입니다.", category: "restriction", difficulty: "easy" },

  // === 6주차: 유지 & 재발 방지 ===
  { id: "w6d1", week: 6, day: 1, title: "나만의 수면 루틴 최종 정리", description: "6주간 경험한 것 중 나에게 가장 효과적이었던 것들을 모아 '나의 수면 루틴'을 정리합니다.", category: "hygiene", difficulty: "easy" },
  { id: "w6d2", week: 6, day: 2, title: "ISI 재평가하기", description: "처음 했던 ISI 자가진단을 다시 합니다. 점수 변화를 확인해보세요.", category: "cognitive", difficulty: "easy" },
  { id: "w6d3", week: 6, day: 3, title: "재발 대처 카드 만들기", description: "'불면이 다시 오면?' 대처법을 3가지 적어놓으세요. 미리 준비하면 당황하지 않습니다.", category: "cognitive", difficulty: "medium" },
  { id: "w6d4", week: 6, day: 4, title: "수면 일지 유지 계획 세우기", description: "프로그램이 끝나도 일주일에 몇 번은 기록을 계속하면 관리에 도움이 됩니다.", category: "hygiene", difficulty: "easy" },
  { id: "w6d5", week: 6, day: 5, title: "감사와 격려의 시간", description: "6주간 잘 해온 자신에게 격려의 말을 해주세요. 변화는 쉬운 일이 아닙니다.", category: "cognitive", difficulty: "easy" },
  { id: "w6d6", week: 6, day: 6, title: "주변 사람에게 수면 팁 공유하기", description: "배운 것을 누군가에게 알려주면, 본인도 더 잘 기억하게 됩니다.", category: "cognitive", difficulty: "easy" },
  { id: "w6d7", week: 6, day: 7, title: "최종 리포트 확인하기", description: "6주간의 수면 데이터 변화를 확인하고, 다음 목표를 세워보세요.", category: "cognitive", difficulty: "easy" },
];

/**
 * 특정 주차/일차의 미션 가져오기
 */
export function getMission(week: number, day: number): Mission | undefined {
  return MISSIONS.find((m) => m.week === week && m.day === day);
}

/**
 * 특정 주차의 전체 미션 가져오기
 */
export function getWeekMissions(week: number): Mission[] {
  return MISSIONS.filter((m) => m.week === week);
}
