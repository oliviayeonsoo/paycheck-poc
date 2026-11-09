// 데모 데이터. 모든 이름과 금액은 예시다.

export const PAYDAY = { month: 9, day: 25, weekday: '금요일', year: 2026, dDay: 3 };

// 2026년 최저임금 (시간급)
export const MIN_WAGE = 10320;

// 급여일 기준 사업자 계좌 잔액
export const START_BALANCE = 8320000;

// 운전자금으로 채우는 기본 금액
export const LOAN_FILL = 1200000;

// 4대보험료 납부기한 (급여 달의 다음 달 10일)
export const INSURANCE_DUE = '10월 10일';

export const BANKS = [
  { id: 'kbank', name: '케이뱅크', short: 'K' },
  { id: 'kakaobank', name: '카카오뱅크', short: 'k' },
];

// lodging: 이번 달 숙식비 공제 입력값, lodgingPrev: 지난달 공제액, lodgingConsent: 서면 동의 금액
// insurance: 4대보험 직원 몫(급여에서 공제), employerIns: 사장님 몫. 둘을 합친 금액이 공단 고지액이다
export const EMPLOYEES = [
  {
    id: 'a', name: '응우옌 반 A', nation: '베트남', lang: 'vi', visa: 'E-9', account: 'OO은행 1234',
    base: 2600000, hours: 209, lodging: 350000, lodgingPrev: 150000, lodgingConsent: 300000, insurance: 70000, employerIns: 77000,
  },
  {
    id: 'b', name: '쩐 티 B', nation: '베트남', lang: 'vi', visa: 'E-9', account: 'OO은행 5678',
    base: 2650000, hours: 209, lodging: 150000, lodgingPrev: 150000, lodgingConsent: 300000, insurance: 80000, employerIns: 88000,
  },
  {
    id: 'c', name: '람 C', nation: '네팔', lang: 'ne', visa: 'E-9', account: 'OO은행 9012',
    base: 4950000, hours: 209, lodging: 0, lodgingPrev: 0, lodgingConsent: 0, insurance: 230000, employerIns: 253000,
  },
];

export const LANG_LABEL = { vi: '베트남어', ne: '네팔어', pt: '포르투갈어', ko: '한국어' };
export const LANG_NATIVE = { vi: 'Tiếng Việt', ne: 'नेपाली', pt: 'Português', ko: '한국어' };

// 직원 화면 문구. 베트남어, 네팔어, 포르투갈어(브라질)는 PoC용 예시 번역이라 원어민 검수가 필요하다.
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
    note: '명세서는 한국어 원문에 직원 모국어를 함께 적어요. 법적 효력은 한국어 원문 기준이에요.',
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
    note: 'Bảng lương ghi bản gốc tiếng Hàn kèm tiếng mẹ đẻ của bạn. Bản tiếng Hàn có giá trị pháp lý.',
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
    note: 'तलब विवरणमा कोरियाली मूल पाठसँगै तपाईंको भाषा पनि लेखिन्छ। कानुनी रूपमा कोरियाली पाठ मान्य हुन्छ।',
    ask: 'साहूलाई सोध्नुहोस्',
    askTitle: 'के सोध्न चाहनुहुन्छ?',
    sent: 'साहूलाई पठाइयो',
    q: {
      lodgingQ: 'बसोबास र खाना खर्च के हो?',
      diff: 'यो महिनाको तलब किन फरक छ?',
      hours: 'म मेरो काम गरेको घण्टा जाँच्न चाहन्छु',
    },
  },
  pt: {
    chatTitle: 'Seu holerite de setembro chegou',
    depositOk: 'Depósito confirmado',
    view: 'Ver holerite',
    slipTitle: 'Holerite de setembro',
    match: 'O valor do holerite é igual ao valor depositado',
    confirmed: t => `O banco confirmou o pagamento em 25/9 às ${t}`,
    section: 'Detalhes do pagamento',
    base: 'Salário base',
    lodging: 'Moradia e alimentação',
    insurance: 'Seguros sociais',
    net: 'Valor líquido',
    lodgingQ: 'O que é moradia e alimentação?',
    lodgingA: 'É o custo da moradia e das refeições oferecidas pelo empregador. Só pode ser descontado até o valor que você aceitou por escrito.',
    insuranceQ: 'O que são os seguros sociais?',
    insuranceA: 'É a parte que o trabalhador paga da previdência nacional, do plano de saúde e do seguro-desemprego.',
    note: 'O holerite mostra o texto original em coreano junto com o seu idioma. O texto em coreano é o que vale legalmente.',
    ask: 'Perguntar ao chefe',
    askTitle: 'O que você quer perguntar?',
    sent: 'Enviado ao seu chefe',
    q: {
      lodgingQ: 'O que é moradia e alimentação?',
      diff: 'Por que meu salário deste mês é diferente do mês passado?',
      hours: 'Quero conferir minhas horas trabalhadas',
    },
  },
};

// 사장님 답장 템플릿과 직원 언어로 보이는 미리보기
// 직원이 사장님께 보내는 카톡 초안. 질문을 고르면 명세서 금액을 넣은 한국어 메시지를 입력창에 써 두고,
// 노란 상자에 직원 언어로 뜻을 보여 준다. preview는 그 상자의 제목, edited는 한국어를 직접 고쳤을 때 안내
// 금액은 그 언어의 천 단위 표기로 쓴다 (포르투갈어, 베트남어는 150.000)
const n = (v, locale = 'ko-KR') => v.toLocaleString(locale);
export const COMPOSE = {
  ko: {
    boss: '사장님',
    autoTr: '한국어로 그대로 보내요',
    hint: '메시지는 사장님께 그대로 전달돼요.',
    attach: '첨부: 9월 급여명세서',
    preview: '',
    edited: '',
    placeholder: '메시지를 입력하세요',
    send: '보내기',
    notSent: '데모라서 실제로 보내지는 않아요',
    msg: {
      lodgingQ: s => `사장님, 9월 명세서에서 숙식비 ${n(s.lodging)}원이 빠졌는데 어떤 비용인지 알려 주실 수 있나요?`,
      diff: s => `사장님, 9월 실수령액이 ${n(s.net)}원인데 지난달과 왜 다른지 궁금해요.`,
      hours: () => '사장님, 9월 제 근무 시간 기록을 볼 수 있을까요?',
    },
  },
  vi: {
    boss: 'Chủ cửa hàng',
    autoTr: 'Gửi bằng tiếng Hàn',
    hint: 'Tin nhắn được gửi cho chủ cửa hàng bằng tiếng Hàn. Ô màu vàng cho bạn biết ý nghĩa bằng tiếng Việt.',
    attach: 'Đính kèm: Bảng lương tháng 9',
    preview: 'Nghĩa bằng tiếng Việt',
    edited: 'Bạn đã sửa câu tiếng Hàn.',
    placeholder: 'Nhập tin nhắn',
    send: 'Gửi',
    notSent: 'Bản demo: tin nhắn chưa được gửi thật.',
    msg: {
      lodgingQ: s => `Chào chủ, trong bảng lương tháng 9 có trừ tiền ăn ở ${n(s.lodging, 'vi-VN')} won. Anh/chị giải thích giúp em khoản này là gì được không ạ?`,
      diff: s => `Chào chủ, lương thực nhận tháng 9 của em là ${n(s.net, 'vi-VN')} won. Sao lại khác tháng trước ạ?`,
      hours: () => 'Chào chủ, em có thể xem bảng chấm công tháng 9 của em được không ạ?',
    },
  },
  ne: {
    boss: 'साहू',
    autoTr: 'कोरियालीमा पठाइन्छ',
    hint: 'सन्देश साहूलाई कोरियालीमा पठाइन्छ। पहेँलो बाकसमा नेपालीमा अर्थ देखिन्छ।',
    attach: 'संलग्न: सेप्टेम्बरको तलब विवरण',
    preview: 'नेपालीमा अर्थ',
    edited: 'तपाईंले कोरियाली सन्देश बदल्नुभयो।',
    placeholder: 'सन्देश लेख्नुहोस्',
    send: 'पठाउनुहोस्',
    notSent: 'डेमो: सन्देश साँच्चै पठाइएको छैन।',
    msg: {
      lodgingQ: s => `साहूजी, सेप्टेम्बरको तलबबाट बसोबास र खाना खर्च ${n(s.lodging)} वन काटिएको छ। यो के खर्च हो भनेर बताइदिनुहुन्छ?`,
      diff: s => `साहूजी, सेप्टेम्बरको मेरो खुद तलब ${n(s.net)} वन छ। यो गत महिनाभन्दा किन फरक छ?`,
      hours: () => 'साहूजी, के म सेप्टेम्बरको मेरो काम गरेको घण्टाको विवरण हेर्न सक्छु?',
    },
  },
  pt: {
    boss: 'Chefe',
    autoTr: 'Enviado em coreano',
    hint: 'A mensagem vai para o seu chefe em coreano. O quadro amarelo mostra o que ela significa em português.',
    attach: 'Anexo: Holerite de setembro',
    preview: 'Em português, significa',
    edited: 'Você alterou a mensagem em coreano.',
    placeholder: 'Digite uma mensagem',
    send: 'Enviar',
    notSent: 'Demonstração: a mensagem não foi enviada de verdade.',
    msg: {
      lodgingQ: s => `Oi, chefe. No holerite de setembro foram descontados ${n(s.lodging, 'pt-BR')} wons de moradia e alimentação. Pode me explicar o que é esse desconto?`,
      diff: s => `Oi, chefe. Meu salário líquido de setembro foi ${n(s.net, 'pt-BR')} wons. Por que está diferente do mês passado?`,
      hours: () => 'Oi, chefe. Posso ver o registro das minhas horas trabalhadas em setembro?',
    },
  },
};

// 직원 화면의 지난 명세서 보관함. 9월은 앱이 계산한 이번 달 명세서를 쓴다
export const ARCHIVE = [
  { month: 4, net: 2350000, time: '13:48' },
  { month: 5, net: 2380000, time: '14:05' },
  { month: 6, net: 2410000, time: '13:57' },
  { month: 7, net: 2380000, time: '14:11' },
  { month: 8, net: 2330000, time: '14:02' },
];

// 해외송금 예시 조건. 환율과 수수료는 데모용 숫자다
export const REMIT = {
  fee: 5000,
  quick: [500000, 1000000, 1500000],
  start: 1500000,
  // 직원 언어별 받는 나라 통화. 한국어로 보는 직원은 데모 직원(베트남)의 통화로
  currency: {
    vi: { code: 'VND', locale: 'vi-VN', rate: 18.6, digits: 0 },
    ko: { code: 'VND', locale: 'vi-VN', rate: 18.6, digits: 0 },
    ne: { code: 'NPR', locale: 'en-IN', rate: 0.097, digits: 0 },
    pt: { code: 'BRL', locale: 'pt-BR', rate: 0.0040, digits: 2 },
  },
};

// 보관함과 송금 화면 문구
export const EXTRA = {
  ko: {
    archive: '지난 명세서',
    archiveSub: '은행이 지급을 확인한 급여 기록이에요',
    month: m => `${m}월`,
    confirmed: '은행 지급 확인',
    total: '6개월 합계',
    proof: '소득 확인서 만들기',
    proofTitle: '',
    proofNote: '체류 연장이나 비자 서류에 낼 수 있어요.',
    remit: '본국으로 송금',
    received: '방금 들어온 9월 급여',
    amount: '보낼 금액',
    recipient: '받는 사람',
    recipientName: '가족 (베트남 은행 계좌)',
    rate: '환율 (예시)',
    fee: '수수료',
    get: '받는 금액',
    note: '환율과 수수료는 데모용 예시예요.',
    send: '송금하기',
    notSent: '데모라서 실제로 송금되지는 않아요',
  },
  vi: {
    archive: 'Bảng lương các tháng trước',
    archiveSub: 'Các khoản lương đã được ngân hàng xác nhận',
    month: m => `Tháng ${m}`,
    confirmed: 'Ngân hàng đã xác nhận',
    total: 'Tổng 6 tháng',
    proof: 'Tạo giấy xác nhận thu nhập',
    proofTitle: 'Giấy xác nhận thu nhập',
    proofNote: 'Dùng khi gia hạn lưu trú hoặc làm hồ sơ visa.',
    remit: 'Gửi tiền về nước',
    received: 'Lương tháng 9 vừa nhận',
    amount: 'Số tiền gửi',
    recipient: 'Người nhận',
    recipientName: 'Mẹ (tài khoản ngân hàng ở Việt Nam)',
    rate: 'Tỷ giá (ví dụ)',
    fee: 'Phí',
    get: 'Người nhận sẽ nhận',
    note: 'Tỷ giá và phí chỉ là ví dụ cho bản demo.',
    send: 'Gửi tiền',
    notSent: 'Bản demo: chưa chuyển tiền thật.',
  },
  ne: {
    archive: 'पुराना तलब विवरणहरू',
    archiveSub: 'बैंकले भुक्तानी पुष्टि गरेका तलबहरू',
    month: m => ['', '', '', '', 'अप्रिल', 'मे', 'जुन', 'जुलाई', 'अगस्ट', 'सेप्टेम्बर'][m],
    confirmed: 'बैंकले पुष्टि गरेको',
    total: '6 महिनाको जम्मा',
    proof: 'आय प्रमाणपत्र बनाउनुहोस्',
    proofTitle: 'आय प्रमाणपत्र',
    proofNote: 'भिसा वा बसाइ अवधि थप्दा प्रयोग गर्न सकिन्छ।',
    remit: 'घर पैसा पठाउनुहोस्',
    received: 'भर्खर आएको सेप्टेम्बरको तलब',
    amount: 'पठाउने रकम',
    recipient: 'प्रापक',
    recipientName: 'आमा (नेपालको बैंक खाता)',
    rate: 'विनिमय दर (उदाहरण)',
    fee: 'शुल्क',
    get: 'प्रापकले पाउने',
    note: 'दर र शुल्क डेमोका लागि उदाहरण मात्र हुन्।',
    send: 'पठाउनुहोस्',
    notSent: 'डेमो: साँच्चै पैसा पठाइएको छैन।',
  },
  pt: {
    archive: 'Holerites anteriores',
    archiveSub: 'Pagamentos confirmados pelo banco',
    month: m => ['', '', '', '', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro'][m],
    confirmed: 'Confirmado pelo banco',
    total: 'Total de 6 meses',
    proof: 'Gerar comprovante de renda',
    proofTitle: 'Comprovante de renda',
    proofNote: 'Útil para renovar o visto ou a permanência.',
    remit: 'Enviar dinheiro para casa',
    received: 'Salário de setembro recebido',
    amount: 'Valor a enviar',
    recipient: 'Destinatário',
    recipientName: 'Mãe (conta em banco no Brasil)',
    rate: 'Câmbio (exemplo)',
    fee: 'Tarifa',
    get: 'Sua família recebe',
    note: 'Câmbio e tarifa são apenas exemplos desta demonstração.',
    send: 'Enviar',
    notSent: 'Demonstração: nenhum dinheiro foi enviado.',
  },
};

export const REPLIES = [
  {
    ko: '숙식비는 숙소와 식사 비용이에요. 서면으로 동의한 금액만큼만 빠져요.',
    vi: 'Tiền ăn ở là chi phí chỗ ở và bữa ăn. Chỉ trừ đúng số tiền bạn đã đồng ý bằng văn bản.',
    ne: 'बसोबास र खाना खर्च भनेको बस्ने ठाउँ र खानाको खर्च हो। लिखित सहमति दिएको रकम मात्र काटिन्छ।',
    pt: 'Moradia e alimentação é o custo do alojamento e das refeições. Só é descontado o valor que você aceitou por escrito.',
  },
  {
    ko: '이번 달은 근무 시간이 달라서 금액이 달라요. 근무 기록을 보내 드릴게요.',
    vi: 'Tháng này giờ làm khác nên số tiền khác. Tôi sẽ gửi bảng chấm công cho bạn.',
    ne: 'यो महिना काम गरेको घण्टा फरक भएकाले रकम फरक छ। म तपाईंलाई हाजिरी विवरण पठाउँछु।',
    pt: 'Este mês as horas trabalhadas foram diferentes, por isso o valor mudou. Vou te enviar o registro de ponto.',
  },
];
