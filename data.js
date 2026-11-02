// 데모 데이터. 모든 이름과 금액은 예시다.

export const PAYDAY = { month: 9, day: 25, weekday: '금요일', year: 2026, dDay: 3 };

// 2026년 최저임금 (시간급)
export const MIN_WAGE = 10320;

// 급여일 기준 사업자 계좌 잔액
export const START_BALANCE = 8320000;

// 운전자금으로 채우는 기본 금액
export const LOAN_FILL = 1200000;

export const BANKS = [
  { id: 'kbank', name: '케이뱅크', short: 'K' },
  { id: 'kakaobank', name: '카카오뱅크', short: 'k' },
];

// lodging: 이번 달 숙식비 공제 입력값, lodgingPrev: 지난달 공제액, lodgingConsent: 서면 동의 금액
export const EMPLOYEES = [
  {
    id: 'a', name: '응우옌 반 A', nation: '베트남', lang: 'vi', visa: 'E-9', account: 'OO은행 1234',
    base: 2600000, hours: 209, lodging: 350000, lodgingPrev: 150000, lodgingConsent: 300000, insurance: 70000,
  },
  {
    id: 'b', name: '쩐 티 B', nation: '베트남', lang: 'vi', visa: 'E-9', account: 'OO은행 5678',
    base: 2650000, hours: 209, lodging: 150000, lodgingPrev: 150000, lodgingConsent: 300000, insurance: 80000,
  },
  {
    id: 'c', name: '람 C', nation: '네팔', lang: 'ne', visa: 'E-9', account: 'OO은행 9012',
    base: 4950000, hours: 209, lodging: 0, lodgingPrev: 0, lodgingConsent: 0, insurance: 230000,
  },
];

export const LANG_LABEL = { vi: '베트남어', ne: '네팔어', ko: '한국어' };
export const LANG_NATIVE = { vi: 'Tiếng Việt', ne: 'नेपाली', ko: '한국어' };

// 직원 화면 문구. 베트남어와 네팔어는 PoC용 예시 번역이라 원어민 검수가 필요하다.
export const I18N = {
  ko: {
    chatTitle: '9월 급여명세서가 도착했어요',
    depositOk: '입금 확인 완료',
    view: '명세서 보기',
    slipTitle: '9월 급여명세서',
    match: '명세서 금액과 입금액이 같아요',
    confirmed: t => `은행이 9월 25일 ${t} 지급을 확인했어요`,
    section: '지급 명세',
    base: '기본급',
    lodging: '숙식비',
    insurance: '보험료',
    net: '실수령',
    lodgingQ: '숙식비란?',
    lodgingA: '사장님이 제공한 숙소와 식사 비용이에요. 서면으로 동의한 금액까지만 빠져요.',
    insuranceQ: '보험료란?',
    insuranceA: '국민연금, 건강보험, 고용보험 중 직원이 내는 몫이에요.',
    ask: '사장님에게 문의하기',
    askTitle: '무엇이 궁금한가요?',
    sent: '사장님께 보냈어요',
    q: {
      lodgingQ: '숙식비가 뭐예요?',
      diff: '이번 달 급여가 왜 지난달과 달라요?',
      hours: '제 근무 시간을 확인하고 싶어요',
    },
  },
  vi: {
    chatTitle: 'Bảng lương tháng 9 đã đến',
    depositOk: 'Đã xác nhận tiền vào',
    view: 'Xem bảng lương',
    slipTitle: 'Bảng lương tháng 9',
    match: 'Số tiền khớp với tiền đã nhận',
    confirmed: t => `Ngân hàng đã xác nhận thanh toán lúc ${t} ngày 25/9`,
    section: 'Chi tiết lương',
    base: 'Lương cơ bản',
    lodging: 'Tiền ăn ở',
    insurance: 'Bảo hiểm',
    net: 'Thực nhận',
    lodgingQ: 'Tiền ăn ở là gì?',
    lodgingA: 'Là chi phí chỗ ở và bữa ăn do chủ cửa hàng cung cấp. Chỉ được trừ tối đa số tiền bạn đã đồng ý bằng văn bản.',
    insuranceQ: 'Bảo hiểm là gì?',
    insuranceA: 'Là phần người lao động đóng cho lương hưu quốc gia, bảo hiểm y tế và bảo hiểm việc làm.',
    ask: 'Hỏi chủ cửa hàng',
    askTitle: 'Bạn muốn hỏi điều gì?',
    sent: 'Đã gửi cho chủ cửa hàng',
    q: {
      lodgingQ: 'Tiền ăn ở là gì?',
      diff: 'Sao lương tháng này khác tháng trước?',
      hours: 'Tôi muốn kiểm tra giờ làm của mình',
    },
  },
  ne: {
    chatTitle: 'सेप्टेम्बरको तलब विवरण आयो',
    depositOk: 'रकम जम्मा भएको पुष्टि भयो',
    view: 'तलब विवरण हेर्नुहोस्',
    slipTitle: 'सेप्टेम्बरको तलब विवरण',
    match: 'विवरणको रकम र जम्मा भएको रकम मिल्यो',
    confirmed: t => `बैंकले 9/25, ${t} मा भुक्तानी पुष्टि गर्‍यो`,
    section: 'तलबको विवरण',
    base: 'आधारभूत तलब',
    lodging: 'बसोबास र खाना खर्च',
    insurance: 'बीमा',
    net: 'खुद प्राप्त रकम',
    lodgingQ: 'बसोबास र खाना खर्च के हो?',
    lodgingA: 'साहूले दिएको बस्ने ठाउँ र खानाको खर्च हो। तपाईंले लिखित सहमति दिएको रकमसम्म मात्र काटिन्छ।',
    insuranceQ: 'बीमा के हो?',
    insuranceA: 'राष्ट्रिय पेन्सन, स्वास्थ्य बीमा र रोजगार बीमामा कामदारले तिर्ने भाग हो।',
    ask: 'साहूलाई सोध्नुहोस्',
    askTitle: 'के सोध्न चाहनुहुन्छ?',
    sent: 'साहूलाई पठाइयो',
    q: {
      lodgingQ: 'बसोबास र खाना खर्च के हो?',
      diff: 'यो महिनाको तलब किन फरक छ?',
      hours: 'म मेरो काम गरेको घण्टा जाँच्न चाहन्छु',
    },
  },
};

// 사장님 답장 템플릿과 직원 언어로 보이는 미리보기
export const REPLIES = [
  {
    ko: '숙식비는 숙소와 식사 비용이에요. 서면으로 동의한 금액만큼만 빠져요.',
    vi: 'Tiền ăn ở là chi phí chỗ ở và bữa ăn. Chỉ trừ đúng số tiền bạn đã đồng ý bằng văn bản.',
    ne: 'बसोबास र खाना खर्च भनेको बस्ने ठाउँ र खानाको खर्च हो। लिखित सहमति दिएको रकम मात्र काटिन्छ।',
  },
  {
    ko: '이번 달은 근무 시간이 달라서 금액이 달라요. 근무 기록을 보내 드릴게요.',
    vi: 'Tháng này giờ làm khác nên số tiền khác. Tôi sẽ gửi bảng chấm công cho bạn.',
    ne: 'यो महिना काम गरेको घण्टा फरक भएकाले रकम फरक छ। म तपाईंलाई हाजिरी विवरण पठाउँछु।',
  },
];
