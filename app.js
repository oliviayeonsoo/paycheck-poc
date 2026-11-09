import { PAYDAY, START_BALANCE, LOAN_FILL, INSURANCE_DUE, BANKS, EMPLOYEES, LANG_LABEL, LANG_NATIVE, I18N, COMPOSE, ARCHIVE, OWNER_ARCHIVE, REMIT, EXTRA, REPLIES } from './data.js?v=20261109h';
import { won, num, slip, total, premiums, checks, allChecks } from './engine.js?v=20261109h';

// 같은 앱을 세 가지로 연다. body의 data-mode로 고른다
//   demo   (index.html):        사장님과 직원 화면 전체 + 데모 메뉴. 발표용
//   owner  (owner/index.html):  사장님 화면만. 사장님 인터뷰용
//   worker (worker/index.html): 직원 화면만. 직원 인터뷰용
const MODE = document.body.dataset.mode || 'demo';
const WORKER = MODE === 'worker';
const OWNER = MODE === 'owner';
const STORE = { demo: 'paycheck-poc-v1', owner: 'paycheck-owner-v1', worker: 'paycheck-worker-v1' }[MODE];
const $app = document.getElementById('app');
const $sheet = document.getElementById('sheet-root');
const $toast = document.getElementById('toast');
const $guide = document.getElementById('guide');

/* ---------- 상태 ---------- */

function freshState() {
  return {
    bank: 'kbank',
    registered: false,
    linked: true,
    balance: START_BALANCE,
    loanUsed: false,
    employees: EMPLOYEES.map(e => ({ ...e })),
    sendSlip: true,
    insPay: 'due', // 'due': 납부기한에 자동 납부, 'now': 급여와 함께 지금 납부
    sent: null,
    viewed: { a: false, b: true, c: true },
    inquiries: [{ emp: 'c', key: 'lodgingQ', reply: null }],
    empView: 'a',
    empLang: { a: 'vi', b: 'vi', c: 'ne' },
    infoKey: 'lodging',
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return { ...freshState(), ...JSON.parse(raw) };
  } catch (e) { /* 저장소를 못 쓰면 새로 시작 */ }
  return freshState();
}

let state = load();

function save() {
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* 무시 */ }
}

const bank = () => BANKS.find(b => b.id === state.bank) || BANKS[0];
const emp = id => state.employees.find(e => e.id === id);
// 오늘 계좌에서 나갈 돈: 급여, 그리고 지금 함께 내기로 했으면 4대보험료
const outflow = () => total(state.employees) + (state.insPay === 'now' ? premiums(state.employees).total : 0);

/* ---------- 공통 조각 ---------- */

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const icon = {
  back: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chev: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  info: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v5M10 6.2v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  doc: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 3h7l4 4v14H7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 3v4h4M10 12h5M10 16h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  globe: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
  warn: '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="#0B1F4F"/><path d="M10 5.5v5.5M10 14v.2" stroke="#FFE300" stroke-width="2" stroke-linecap="round"/></svg>',
};

const nav = (title, back) => `
  <header class="nav">
    <button class="icon-btn" data-go="${back}" aria-label="뒤로">${icon.back}</button>
    <span class="nav-title">${esc(title)}</span>
    <span class="icon-btn" aria-hidden="true"></span>
  </header>`;

const badgeNew = '<span class="badge-new">NEW</span>';
const checkDot = '<span class="check-dot">' + icon.check + '</span>';
const kv = (k, v, cls = '') => `<div class="kv ${cls}"><span>${esc(k)}</span><b>${v}</b></div>`;
const toggle = (on, action, label) =>
  `<button class="toggle ${on ? 'on' : ''}" role="switch" aria-checked="${on}" aria-label="${esc(label)}" data-action="${action}"><i></i></button>`;

/* ---------- 화면: 사장님 ---------- */

function home() {
  const next = state.registered ? 'preview' : 'register';
  return `
  <section class="screen">
    <header class="nav home-nav"><h1>홈</h1><span class="pill">사장님</span></header>
    <main class="content">
      <div class="banner">이벤트 배너</div>
      <button class="card new feature" data-go="${next}">
        ${badgeNew}
        <span class="won-tile">₩</span>
        <span class="feature-text">
          <b>외국인 직원 급여</b>
          <span>이체하면 모국어 명세서까지 자동으로</span>
          <em>직원 ${state.employees.length}명, 다음 급여일 ${PAYDAY.month}월 ${PAYDAY.day}일</em>
        </span>
        <span class="chev">${icon.chev}</span>
      </button>
      <h2 class="section-title">사장님 편의</h2>
      <div class="grid4">
        ${['거래처조회', '신용리포트', '근태관리', '더보기'].map(l =>
          `<button class="tile" data-toast="PoC에서는 '외국인 직원 급여'만 열려요"><i></i><span>${l}</span></button>`).join('')}
      </div>
    </main>
    <nav class="tabbar">
      ${['홈', '이체', '혜택', '전체'].map((l, i) =>
        `<button class="${i === 0 ? 'on' : ''}" ${i ? 'data-toast="PoC에서는 홈 탭만 열려요"' : ''}><i></i><span>${l}</span></button>`).join('')}
    </nav>
  </section>`;
}

function register() {
  const a = emp('a');
  const others = state.employees.filter(e => e.id !== 'a').map(e => e.name).join(', ');
  return `
  <section class="screen">
    ${nav('직원 등록', 'home')}
    <main class="content">
      <h1 class="h1">외국인 직원을 등록해요</h1>
      <div class="card gray">
        <b class="card-title">${esc(a.name)}</b>
        <div class="chips"><span>${a.nation}</span><span>${LANG_LABEL[a.lang]}</span><span>${a.visa}</span></div>
        ${kv('급여 계좌', esc(a.account))}
        <p class="more">+ ${esc(others)}도 함께 등록돼요</p>
      </div>
      <div class="card new">
        ${badgeNew}
        <b class="card-title">공제 템플릿</b>
        ${kv('숙식비', `월 ${won(a.lodgingConsent)}`)}
        ${kv('4대보험', '자동 계산')}
        ${kv('서면 동의서', '<span class="navy">업로드 완료</span>')}
      </div>
      <div class="card gray row-between">
        <span><b class="card-title">사장이지 연동</b><small>출퇴근 기록과 급여 계산값을 불러와요</small></span>
        ${toggle(state.linked, 'toggle-linked', '사장이지 연동')}
      </div>
    </main>
    <footer class="cta"><button class="btn primary" data-action="register">등록 완료</button></footer>
  </section>`;
}

function preview() {
  const t = total(state.employees);
  const short = t - state.balance;
  const balanceCard = short > 0 ? `
      <div class="card new soft">
        ${badgeNew}
        <b class="card-title">잔액이 ${won(short)} 부족해요</b>
        <p class="desc">급여일 전에 사업자 운전자금으로 채울 수 있어요</p>
        <button class="btn white" data-sheet="loan">한도 확인하기</button>
      </div>` : `
      <div class="card gray ok-line">
        ${checkDot}<span><b>잔액이 충분해요</b><small>${state.loanUsed ? `운전자금 ${won(LOAN_FILL)}을 채웠어요` : '급여일에 바로 보낼 수 있어요'}</small></span>
      </div>`;
  return `
  <section class="screen">
    ${nav(`${PAYDAY.month}월 급여`, 'home')}
    <main class="content">
      <span class="dday">D-${PAYDAY.dDay}</span>
      <h1 class="h1">급여일까지 ${PAYDAY.dDay}일 남았어요</h1>
      <div class="card gray">
        <small>이번 달 급여 (${state.linked ? '사장이지 계산' : '직접 입력'})</small>
        <b class="big">${won(t)}</b>
        <small>직원 ${state.employees.length}명</small>
      </div>
      ${balanceCard}
    </main>
    <footer class="cta"><button class="btn primary" data-go="confirm">급여 보내기</button></footer>
  </section>`;
}

function confirm() {
  const t = total(state.employees);
  const issues = allChecks(state.employees);
  const minwageIssue = issues.some(i => i.type === 'minwage');
  const warn = issues.length ? issues.map(i => `
      <div class="card new soft">
        ${badgeNew}
        <b class="card-title">이체 전에 확인해 주세요</b>
        <p class="desc">${esc(i.text)}</p>
        <small>판정이 아닌 참고 알림이에요</small>
      </div>`).join('') : `
      <div class="card new ok-line">
        ${badgeNew}${checkDot}<span><b>이체 전 점검을 통과했어요</b><small>최저임금과 숙식비 동의 금액을 확인했어요</small></span>
      </div>`;
  return `
  <section class="screen">
    ${nav('이체 확인', 'preview')}
    <main class="content">
      <h1 class="h1">${state.employees.length}명에게 ${won(t)}을 보낼게요</h1>
      <div class="card gray">
        <small>받는 사람</small>
        ${state.employees.map(e => kv(e.name, won(slip(e).net), 'light')).join('')}
      </div>
      ${warn}
      <div class="check-line">${minwageIssue ? icon.warn : checkDot}<span>${minwageIssue ? '최저임금을 다시 확인해 주세요' : '최저임금 확인 완료'}</span></div>
      <div class="row-between plain"><span>명세서 함께 보내기</span>${toggle(state.sendSlip, 'toggle-slip', '명세서 함께 보내기')}</div>
      ${insuranceCard()}
    </main>
    <footer class="cta two">
      <button class="btn secondary" data-sheet="edit">수정하기</button>
      <button class="btn primary" data-action="send">${issues.length ? '그대로 보내기' : '보내기'}</button>
    </footer>
  </section>`;
}

function insuranceCard() {
  const p = premiums(state.employees);
  const modes = [['due', `${INSURANCE_DUE} 자동 납부`], ['now', '지금 함께 내기']];
  return `
      <div class="card new">
        ${badgeNew}
        <b class="card-title">이번 달 4대보험료도 챙길게요</b>
        <small>국민건강보험공단 통합 고지 기준</small>
        ${kv('직원 몫 (급여에서 공제)', won(p.worker), 'light')}
        ${kv('사장님 몫', won(p.owner), 'light')}
        <hr>
        ${kv('공단에 낼 금액', won(p.total))}
        <div class="seg ins-seg" role="radiogroup" aria-label="4대보험료 납부 시점">
          ${modes.map(([m, label]) => `<button role="radio" aria-checked="${state.insPay === m}" class="${state.insPay === m ? 'on' : ''}" data-action="ins-pay" data-mode="${m}">${label}</button>`).join('')}
        </div>
        <small>직원 몫은 명세서의 보험료 공제와 같은 금액이에요. 외국인 직원은 국적에 따라 국민연금 적용이 달라서, 공단 고지액을 그대로 반영해요.</small>
      </div>`;
}

function insuranceLine(s) {
  if (!s.ins) return '';
  return s.ins.mode === 'now'
    ? `<div class="check-line small">${checkDot}<span>4대보험료 ${won(s.ins.amount)}도 공단에 함께 냈어요</span></div>`
    : `<div class="check-line small">${checkDot}<span>4대보험료 ${won(s.ins.amount)}은 ${INSURANCE_DUE}에 자동으로 내요</span></div>`;
}

function done() {
  const s = state.sent;
  if (!s) return confirm();
  const rows = state.employees.map(e => kv(e.name, s.slip ? `${LANG_LABEL[e.lang]} 카톡` : '이체만 완료', 'light')).join('');
  return `
  <section class="screen">
    <main class="content center-top">
      <span class="big-check">${icon.check}</span>
      <b class="huge">${won(s.total)}</b>
      <p class="muted">${state.employees.length}명에게 보냈어요</p>
      <div class="card ${s.slip ? 'new' : 'gray'} left">
        ${s.slip ? badgeNew : ''}
        <b class="card-title">${s.slip ? '지급 확인 명세서를 보냈어요' : '명세서는 보내지 않았어요'}</b>
        ${rows}
        <hr>
        <div class="check-line small">${checkDot}<span>은행이 ${PAYDAY.month}월 ${PAYDAY.day}일 ${s.time} 지급을 확인했어요</span></div>
        ${insuranceLine(s)}
      </div>
      ${s.slip && !OWNER ? '<button class="link" data-go="chat">직원 휴대폰에서 보기</button>' : ''}
    </main>
    <footer class="cta"><button class="btn primary" data-go="records">확인</button></footer>
  </section>`;
}

function records() {
  const status = e => {
    const inq = state.inquiries.filter(q => q.emp === e.id && !q.reply).length;
    if (inq) return `<b>문의 ${inq}건</b>`;
    if (!state.sent && e.id === 'a') return '<b class="t-gray">이체 전</b>';
    return state.viewed[e.id] ? '<b class="navy">열람과 대조 완료</b>' : '<b class="t-gray">발송 완료, 열람 전</b>';
  };
  const allDone = state.sent && state.employees.every(e => state.viewed[e.id]) && state.inquiries.every(q => q.reply);
  const inquiries = state.inquiries.map((q, idx) => {
    const e = emp(q.emp);
    const lang = q.lang || e.lang;
    return `
      <div class="card gray">
        <small>${esc(e.name)}의 문의</small>
        <b class="quote">“${esc(I18N.ko.q[q.key])}”</b>
        <small>${lang === 'ko' ? '한국어로 받은 문의' : `${LANG_LABEL[lang]}에서 한국어로 번역됨`}</small>
        ${q.reply
          ? `<div class="reply"><small>보낸 답장</small><p>${esc(REPLIES[q.reply - 1].ko)}</p>${lang === 'ko' ? '' : `<p class="tr">${esc(REPLIES[q.reply - 1][lang])}</p>`}</div>`
          : `<button class="btn white" data-sheet="reply" data-idx="${idx}">답장하기</button>`}
      </div>`;
  }).join('');
  return `
  <section class="screen">
    ${nav('급여 기록', state.sent ? 'done' : 'home')}
    <main class="content">
      <h1 class="h1">${allDone ? `${PAYDAY.month}월 급여, 모두 확인됐어요` : `${PAYDAY.month}월 급여 기록`}</h1>
      <div class="card new">
        ${badgeNew}
        <b class="card-title">열람과 대조</b>
        ${state.employees.map(e => `<div class="kv light"><span>${esc(e.name)}</span>${status(e)}</div>`).join('')}
        ${state.sent && state.sent.ins ? `<hr>${kv('4대보험료', state.sent.ins.mode === 'now' ? `<span class="navy">${won(state.sent.ins.amount)} 납부 완료</span>` : `${INSURANCE_DUE} 자동 납부 예약`, 'light')}` : ''}
      </div>
      ${inquiries}
      <button class="card new row-between" data-go="slips">
        ${badgeNew}
        <span><b class="card-title">직원별 명세서 보관함</b><small>보낸 명세서와 열람 기록을 직원마다 모아 봐요</small></span>
        <b class="link-text">보기 ›</b>
      </button>
      <button class="card new row-between" data-sheet="benefit">
        ${badgeNew}
        <span><b class="card-title">성실 지급 12개월째</b><small>사업자 대출 금리 우대 대상이에요</small></span>
        <b class="link-text">혜택 보기 ›</b>
      </button>
    </main>
    <footer class="cta"><button class="btn primary" data-action="print">기록 PDF 내려받기</button></footer>
  </section>`;
}

/* ---------- 화면: 직원 ---------- */

function chat() {
  const e = emp(state.empView);
  const L = I18N[state.empLang[e.id]];
  const time = state.sent ? state.sent.time : '14:02';
  const amount = slip(e).net;
  return `
  <section class="screen kakao">
    <header class="nav kakao-nav">
      <button class="icon-btn" data-go="${WORKER ? 'start' : state.sent ? 'done' : 'home'}" aria-label="뒤로">${icon.back}</button>
      <span class="nav-title left">${esc(bank().name)}</span>
      <span class="icon-btn" aria-hidden="true"></span>
    </header>
    <main class="content">
      <div class="date-chip">${PAYDAY.year}년 ${PAYDAY.month}월 ${PAYDAY.day}일 ${PAYDAY.weekday}</div>
      <div class="msg">
        <span class="avatar">${esc(bank().short)}</span>
        <div class="msg-body">
          <small class="sender">${esc(bank().name)}</small>
          <div class="msg-row">
            <div class="bubble">
              ${badgeNew}
              <b class="bubble-head">${esc(L.chatTitle)}</b>
              <div class="bubble-body">
                <small>${esc(I18N.ko.chatTitle)}</small>
                <b class="amount">${won(amount)}</b>
                <div class="check-line small">${checkDot}<span>${esc(L.depositOk)}</span></div>
                <button class="btn gray" data-go="payslip">${esc(L.view)}</button>
              </div>
            </div>
            <time>${timeLabel(time)}</time>
          </div>
        </div>
      </div>
      ${state.sent ? '' : '<p class="hint">아직 사장님이 급여를 보내지 않았어요. 보낸 뒤의 모습을 미리 보여 드려요.</p>'}
    </main>
  </section>`;
}

function timeLabel(t) {
  const [h, m] = t.split(':').map(Number);
  return `${h < 12 ? '오전' : '오후'} ${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')}`;
}

function payslip() {
  const e = emp(state.empView);
  const lang = state.empLang[e.id];
  const L = I18N[lang];
  const K = I18N.ko;
  const s = slip(e);
  const time = state.sent ? state.sent.time : '14:02';
  const row = (key, value, info) => {
    const active = info && state.infoKey === key;
    return `
      <${info ? `button data-action="info" data-key="${key}"` : 'div'} class="slip-row ${active ? 'active' : ''}">
        <span class="lbl"><b>${esc(L[key])}${info ? ' ' + icon.info : ''}</b>${lang !== 'ko' ? `<small>${esc(K[key])}</small>` : ''}</span>
        <span class="val">${value}</span>
      </${info ? 'button' : 'div'}>`;
  };
  const infoKey = state.infoKey;
  const explain = infoKey ? `
      <div class="card new soft">
        ${badgeNew}
        <b class="card-title">${esc(L[infoKey + 'Q'])}</b>
        <p class="desc">${esc(L[infoKey + 'A'])}</p>
        ${lang !== 'ko' ? `<small>${esc(K[infoKey + 'A'])}</small>` : ''}
      </div>` : '';
  return `
  <section class="screen">
    <header class="nav slip-nav">
      <button class="icon-btn" data-go="chat" aria-label="뒤로">${icon.back}</button>
      <span class="nav-title left">${esc(L.slipTitle)}</span>
      <button class="pill" data-sheet="lang">${LANG_NATIVE[lang]}</button>
    </header>
    <main class="content">
      <div class="card new ok-line">
        ${badgeNew}${checkDot}
        <span><b>${esc(K.match)}</b>${lang !== 'ko' ? `<em>${esc(L.match)}</em>` : ''}<small>${esc(L.confirmed(time))}</small></span>
      </div>
      <div class="card gray slip">
        <small>${esc(L.section)}</small>
        ${row('base', num(s.base))}
        ${s.lodging ? row('lodging', '-' + num(s.lodging), true) : ''}
        ${row('insurance', '-' + num(s.insurance), true)}
        <hr>
        <div class="slip-row total"><span class="lbl"><b>${esc(L.net)}</b>${lang !== 'ko' ? `<small>${esc(K.net)}</small>` : ''}</span><span class="val">${num(s.net)}</span></div>
      </div>
      ${explain}
      <div class="tiles2">
        <button class="tile2" data-go="archive"><span class="tile2-icon">${icon.doc}</span><b>${esc(EXTRA[lang].archive)}</b></button>
        <button class="tile2" data-go="remit"><span class="tile2-icon">${icon.globe}</span><b>${esc(EXTRA[lang].remit)}</b></button>
      </div>
      <p class="fine">${esc(L.note)}${lang !== 'ko' ? `<br>${esc(K.note)}` : ''}</p>
    </main>
    <footer class="cta"><button class="btn primary" data-sheet="ask">${esc(L.ask)}</button></footer>
  </section>`;
}

// 사장님과의 카톡방. 사장님께 보낼 한국어 메시지가 입력창에 써져 있고, 위 노란 상자에 직원 언어로 뜻이 보인다
function compose() {
  const e = emp(state.empView);
  if (!state.draft) {
    const lang = state.empLang[e.id];
    const text = COMPOSE.ko.msg.lodgingQ(slip(e));
    state.draft = { key: 'lodgingQ', lang, text, original: text };
  }
  const d = state.draft;
  const C = COMPOSE[d.lang];
  const L = I18N[d.lang];
  const s = slip(e);
  const edited = d.text !== d.original;
  const attachLine = { lodgingQ: `${L.lodging} -${num(s.lodging)}`, diff: `${L.net} ${num(s.net)}` }[d.key];
  return `
  <section class="screen kakao">
    <header class="nav kakao-nav">
      <button class="icon-btn" data-go="payslip" aria-label="뒤로">${icon.back}</button>
      <span class="nav-title left">${esc(C.boss)}<small class="sub">${esc(C.autoTr)}</small></span>
      <span class="icon-btn" aria-hidden="true"></span>
    </header>
    <main class="content">
      <div class="date-chip">${PAYDAY.year}년 ${PAYDAY.month}월 ${PAYDAY.day}일 ${PAYDAY.weekday}</div>
      <p class="sys-bubble">${esc(C.hint)}</p>
    </main>
    <footer class="composer">
      ${attachLine ? `<div class="attach"><span class="attach-icon" aria-hidden="true">${icon.info}</span><span><b>${esc(C.attach)}</b><small>${esc(attachLine)}</small></span></div>` : ''}
      ${d.lang !== 'ko' ? `
      <div class="tr-preview">
        <small>${esc(C.preview)}</small>
        <p id="tr-preview-text" class="${edited ? 'muted' : ''}">${esc(edited ? C.edited : C.msg[d.key](s))}</p>
      </div>` : ''}
      <div class="draft-row">
        <textarea data-draft rows="3" placeholder="${esc(C.placeholder)}" aria-label="${esc(C.placeholder)}">${esc(d.text)}</textarea>
        <button class="send-btn" data-action="send-msg" aria-label="${esc(C.send)}">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 19V6M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </footer>
  </section>`;
}

// 사장님용 직원별 명세서 보관함: 직원마다 6개월 동안 보낸 명세서와 교부 기록
function ownerSlipRows(e) {
  const past = OWNER_ARCHIVE[e.id].map(r => ({ ...r, status: r.inquiry ? 'answered' : 'done' }));
  const s = state.sent;
  const inq = state.inquiries.filter(q => q.emp === e.id);
  const now = {
    month: PAYDAY.month, net: slip(e).net, current: true,
    sent: s ? s.time : null, slip: s ? s.slip : false,
    viewed: s && state.viewed[e.id] ? '18:40' : null,
    status: !s ? 'before' : inq.some(q => !q.reply) ? 'inquiry' : state.viewed[e.id] ? 'done' : 'unread',
  };
  return [now, ...past.reverse()];
}

const SLIP_STATUS = {
  done: '<b class="navy">열람과 대조 완료</b>',
  answered: '<b class="navy">문의 1건, 답변 완료</b>',
  inquiry: '<b>문의 있음</b>',
  unread: '<b class="t-gray">발송 완료, 열람 전</b>',
  before: '<b class="t-gray">이체 전</b>',
};

function slips() {
  const e = emp(state.slipEmp || 'a');
  const rows = ownerSlipRows(e);
  const sentCount = rows.filter(r => r.sent && r.slip !== false).length;
  const viewedCount = rows.filter(r => r.viewed).length;
  return `
  <section class="screen">
    ${nav('직원별 명세서 보관함', 'records')}
    <main class="content">
      <div class="seg emp-seg" role="tablist" aria-label="직원 고르기">
        ${state.employees.map(x => `<button role="tab" aria-selected="${x.id === e.id}" class="${x.id === e.id ? 'on' : ''}" data-action="slip-emp" data-emp="${x.id}">${esc(x.name)}</button>`).join('')}
      </div>
      <div class="card gray">
        <b class="card-title">${esc(e.name)}</b>
        <div class="chips"><span>${e.nation}</span><span>${LANG_LABEL[e.lang]} 명세서</span><span>${e.visa}</span></div>
        ${kv('6개월 동안 보낸 명세서', `${sentCount}건`, 'light')}
        ${kv('직원이 열어 본 명세서', `${viewedCount}건`, 'light')}
      </div>
      <div class="card new archive">
        ${badgeNew}
        ${rows.map((r, i) => `
          <button class="arch-row ${r.current ? 'current' : ''}" data-sheet="slip-detail" data-idx="${i}">
            <span class="lbl"><b>${r.month}월</b><small>${r.sent ? `${r.month}월 ${PAYDAY.day}일 ${r.sent} ${LANG_LABEL[e.lang]}로 발송` : '아직 보내지 않았어요'}</small></span>
            <span class="val"><b>${num(r.net)}</b><small>${SLIP_STATUS[r.status]}</small></span>
          </button>`).join('')}
      </div>
      <p class="fine">달을 누르면 그달 명세서와 교부 기록(발송, 열람, 대조 시각)을 볼 수 있어요.</p>
    </main>
    <footer class="cta"><button class="btn primary" data-action="slips-print">보관함 전체 내려받기 (6개월)</button></footer>
  </section>`;
}

// 지난 명세서 보관함: 은행이 지급을 확인한 6개월 기록과 소득 확인서
function archiveRows() {
  const e = emp(state.empView);
  const sept = { month: PAYDAY.month, net: slip(e).net, time: state.sent ? state.sent.time : '14:02', current: true };
  return [...ARCHIVE, sept].reverse();
}

function archive() {
  const lang = state.empLang[state.empView];
  const X = EXTRA[lang];
  const rows = archiveRows();
  const sum = rows.reduce((a, r) => a + r.net, 0);
  return `
  <section class="screen">
    ${nav(X.archive, 'payslip')}
    <main class="content">
      <p class="muted">${esc(X.archiveSub)}</p>
      <div class="card gray archive">
        ${rows.map(r => `
          <${r.current ? 'button data-go="payslip"' : 'div'} class="arch-row ${r.current ? 'current' : ''}">
            <span class="lbl"><b>${esc(X.month(r.month))}</b><small>${PAYDAY.year}.${r.month}.${PAYDAY.day} ${r.time}</small></span>
            <span class="val"><b>${num(r.net)}</b><small>${checkDot}${esc(X.confirmed)}</small></span>
          </${r.current ? 'button' : 'div'}>`).join('')}
        <hr>
        <div class="arch-row total"><span class="lbl"><b>${esc(X.total)}</b></span><span class="val"><b>${num(sum)}</b></span></div>
      </div>
      <p class="fine">${esc(X.proofNote)}</p>
    </main>
    <footer class="cta"><button class="btn primary" data-action="proof">${esc(X.proof)}</button></footer>
  </section>`;
}

// 해외송금: 방금 들어온 급여에서 본국 가족에게. 보내기 직전에서 멈춘다
function remitReceive(amount, lang) {
  const c = REMIT.currency[lang];
  const v = Math.max(0, amount - REMIT.fee) * c.rate;
  return new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.code, minimumFractionDigits: c.digits, maximumFractionDigits: c.digits }).format(v);
}

function remit() {
  const e = emp(state.empView);
  const lang = state.empLang[e.id];
  const X = EXTRA[lang];
  const c = REMIT.currency[lang];
  const net = slip(e).net;
  const amount = Math.min(state.remitAmount || REMIT.start, net);
  const rate = new Intl.NumberFormat(c.locale, { maximumFractionDigits: 4 }).format(c.rate);
  return `
  <section class="screen">
    ${nav(X.remit, 'payslip')}
    <main class="content">
      <div class="card gray">
        <small>${esc(X.received)}</small>
        <b class="big">${won(net)}</b>
      </div>
      <div class="card new">
        ${badgeNew}
        <label class="remit-field">${esc(X.amount)}
          <span class="remit-input"><input type="text" inputmode="numeric" value="${num(amount)}" data-remit aria-label="${esc(X.amount)}"><em>원</em></span>
        </label>
        <div class="chips pick">${REMIT.quick.map(q => `<button data-action="remit-quick" data-val="${q}">${num(q)}</button>`).join('')}</div>
        <hr>
        ${kv(X.recipient, esc(X.recipientName), 'light')}
        ${kv(X.rate, `1원 = ${rate} ${c.code}`, 'light')}
        ${kv(X.fee, won(REMIT.fee), 'light')}
        <div class="kv remit-get"><span>${esc(X.get)}</span><b id="remit-get">${remitReceive(amount, lang)}</b></div>
      </div>
      <p class="fine">${esc(X.note)}</p>
    </main>
    <footer class="cta"><button class="btn primary" data-action="remit-send">${esc(X.send)}</button></footer>
  </section>`;
}

/* ---------- 시트 ---------- */

function sheetHtml(kind, data) {
  if (kind === 'loan') {
    const short = Math.max(0, outflow() - state.balance);
    return `
      <h3>사업자 운전자금</h3>
      <p class="desc">급여일 잔액 부족분을 바로 채울 수 있어요.</p>
      <div class="card gray">
        ${kv('부족한 금액', won(short))}
        ${kv('채울 금액', won(Math.max(short, LOAN_FILL)))}
        ${kv('예상 금리', '연 4.9%부터')}
        ${kv('상환', '다음 달 매출 입금일')}
      </div>
      <small class="fine">PoC 예시 조건이에요. 실제 한도와 금리는 심사에 따라 달라요.</small>
      <button class="btn primary" data-action="loan">${won(Math.max(short, LOAN_FILL))} 채우기</button>`;
  }
  if (kind === 'edit') {
    const issues = allChecks(state.employees);
    const targets = issues.length ? [...new Set(issues.map(i => i.id))] : state.employees.map(e => e.id);
    return `
      <h3>공제 금액 수정</h3>
      <p class="desc">고친 금액으로 다시 점검해요.</p>
      ${targets.map(id => {
        const e = emp(id);
        return `
        <div class="card gray edit">
          <b class="card-title">${esc(e.name)}</b>
          <label>숙식비 공제 <span class="muted">(동의 금액 ${won(e.lodgingConsent)})</span>
            <input type="text" inputmode="numeric" value="${num(e.lodging)}" data-edit="${id}" aria-label="${esc(e.name)} 숙식비 공제">
          </label>
          <div class="chips pick">
            <button data-fill="${id}" data-val="${e.lodgingPrev}">지난달과 같게 ${won(e.lodgingPrev)}</button>
            <button data-fill="${id}" data-val="${e.lodgingConsent}">동의 금액 ${won(e.lodgingConsent)}</button>
          </div>
        </div>`;
      }).join('')}
      <button class="btn primary" data-action="save-edit">다시 점검하기</button>`;
  }
  if (kind === 'slip-detail') {
    const e = emp(state.slipEmp || 'a');
    const r = ownerSlipRows(e)[data.idx];
    const ins = e.insurance;
    const lodging = r.current ? slip(e).lodging : e.lodgingPrev;
    const base = r.net + lodging + ins;
    const day = `${r.month}월 ${PAYDAY.day}일`;
    return `
      <h3>${esc(e.name)}, ${r.month}월 명세서</h3>
      <div class="card gray">
        ${kv('기본급', won(base), 'light')}
        ${lodging ? kv('숙식비', '-' + won(lodging), 'light') : ''}
        ${kv('보험료', '-' + won(ins), 'light')}
        <hr>
        ${kv('실지급', won(r.net))}
      </div>
      <div class="card gray">
        <small>교부 기록</small>
        ${kv('지급', r.sent ? `${day} ${r.sent} 은행 확인` : '이체 전', 'light')}
        ${kv('명세서 발송', r.sent && r.slip !== false ? `${day} ${r.sent} ${LANG_LABEL[e.lang]} 카톡` : '-', 'light')}
        ${kv('직원 열람', r.viewed ? `${day} ${r.viewed}` : '-', 'light')}
        ${kv('입금 대조', r.viewed ? '일치' : '-', 'light')}
        ${r.inquiry ? kv('받은 문의', `“${esc(r.inquiry)}” 답변 완료`, 'light') : ''}
      </div>
      <button class="btn primary" data-close>확인</button>`;
  }
  if (kind === 'benefit') {
    return `
      <h3>성실 지급 혜택</h3>
      <p class="desc">12개월 동안 급여일에 맞춰 지급하고 명세서를 교부한 기록이 있어요.</p>
      <div class="card gray">
        ${kv('지급 기록', '12개월 연속')}
        ${kv('명세서 교부', '36건 모두 확인')}
        ${kv('사업자 대출 금리', '<span class="navy">0.2%p 우대</span>')}
      </div>
      <small class="fine">PoC 예시 혜택이에요.</small>
      <button class="btn primary" data-close>확인</button>`;
  }
  if (kind === 'reply') {
    const q = state.inquiries[data.idx];
    const e = emp(q.emp);
    const lang = q.lang || e.lang;
    return `
      <h3>${esc(e.name)}에게 답장</h3>
      <p class="desc">${lang === 'ko' ? '고른 문장이 카톡으로 가요.' : `고른 문장이 ${LANG_LABEL[lang]}로 번역돼 카톡으로 가요.`}</p>
      ${REPLIES.map((r, i) => `
        <button class="card gray choice" data-action="reply" data-idx="${data.idx}" data-reply="${i + 1}">
          <b>${esc(r.ko)}</b>${lang === 'ko' ? '' : `<small>${esc(r[lang])}</small>`}
        </button>`).join('')}`;
  }
  if (kind === 'ask') {
    const e = emp(state.empView);
    const L = I18N[state.empLang[e.id]];
    return `
      <h3>${esc(L.askTitle)}</h3>
      ${Object.keys(L.q).map(k => `
        <button class="card gray choice" data-action="ask" data-key="${k}">
          <b>${esc(L.q[k])}</b>${state.empLang[e.id] !== 'ko' ? `<small>${esc(I18N.ko.q[k])}</small>` : ''}
        </button>`).join('')}`;
  }
  if (kind === 'lang') {
    const e = emp(state.empView);
    const langs = [...new Set([e.lang, 'ko', 'vi', 'ne', 'pt'])];
    return `
      <h3>명세서 언어</h3>
      ${langs.map(l => `
        <button class="card ${state.empLang[e.id] === l ? 'new' : 'gray'} choice" data-action="lang" data-lang="${l}">
          <b>${LANG_NATIVE[l]}</b><small>${LANG_LABEL[l]}</small>
        </button>`).join('')}`;
  }
  if (kind === 'demo') return `<h3>데모 메뉴</h3>${guideHtml(true)}`;
  return '';
}

function openSheet(kind, data = {}) {
  $sheet.dataset.kind = kind;
  $sheet.innerHTML = `
    <div class="backdrop" data-close></div>
    <div class="sheet" role="dialog" aria-modal="true">
      <span class="grip" aria-hidden="true"></span>
      ${sheetHtml(kind, data)}
    </div>`;
  requestAnimationFrame(() => $sheet.classList.add('open'));
}

function closeSheet() {
  $sheet.classList.remove('open');
  setTimeout(() => { if (!$sheet.classList.contains('open')) $sheet.innerHTML = ''; }, 220);
}

let toastTimer;
function toast(msg) {
  $toast.textContent = msg;
  $toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $toast.classList.remove('show'), 2200);
}

/* ---------- 데모 안내 ---------- */

const SCENES = [
  ['home', '1', '사장님 홈', '연결'],
  ['register', '1-2', '직원 등록', '연결'],
  ['preview', '2', '급여일 미리보기', '준비'],
  ['confirm', '3', '이체 확인', '점검'],
  ['done', '4', '이체 완료', '지급'],
  ['records', '5', '급여 기록', '증명과 보상'],
  ['chat', 'E1', '카카오톡 알림', '직원'],
  ['payslip', 'E2', '모국어 명세서', '직원'],
];

function guideHtml(inSheet = false) {
  const cur = route();
  return `
    ${inSheet ? '' : `<p class="eyebrow">공모전 PoC</p><h2>페이체크</h2>
    <p class="lead">은행 앱의 급여 이체에 붙는 외국인 직원 급여 모듈이에요. 휴대폰으로 QR이나 링크를 열면 실제 앱처럼 눌러 볼 수 있어요.</p>`}
    <ol class="scene-list">
      ${SCENES.map(([r, code, name, stage]) => `
        <li><button class="${cur === r ? 'on' : ''}" data-go="${r}" ${inSheet ? 'data-close' : ''}>
          <span class="code">${code}</span><span>${name}</span><small>${stage}</small>
        </button></li>`).join('')}
    </ol>
    <div class="opt">
      <span>탑재 은행</span>
      <div class="seg">${BANKS.map(b => `<button class="${state.bank === b.id ? 'on' : ''}" data-action="bank" data-bank="${b.id}">${b.name}</button>`).join('')}</div>
    </div>
    <div class="opt">
      <span>직원 화면</span>
      <div class="seg">${['a', 'c'].map(id => `<button class="${state.empView === id ? 'on' : ''}" data-action="emp" data-emp="${id}">${esc(emp(id).name)}</button>`).join('')}</div>
    </div>
    <div class="opt">
      <span>직원 화면 언어</span>
      <div class="seg">${['vi', 'ne', 'pt', 'ko'].map(l => `<button class="${state.empLang[state.empView] === l ? 'on' : ''}" data-action="lang" data-lang="${l}">${LANG_NATIVE[l]}</button>`).join('')}</div>
    </div>
    <button class="btn secondary reset" data-action="reset">처음부터 다시</button>
    <p class="fine">실제 금융 서비스가 아니에요. 이름, 금액, 은행 화면은 모두 예시이고 번역은 원어민 검수 전이에요.</p>`;
}

/* ---------- 라우팅 ---------- */

// 직원 전용 첫 화면: 언어 고르기
function start() {
  return `
  <section class="screen">
    <main class="content center-top start">
      <span class="won-tile big-tile">₩</span>
      <h1 class="h1">Choose your language</h1>
      <p class="muted">명세서를 볼 언어를 골라 주세요</p>
      <div class="lang-list">
        ${['vi', 'ne', 'pt', 'ko'].map(l => `
          <button class="card gray choice" data-action="pick-lang" data-lang="${l}">
            <b>${LANG_NATIVE[l]}</b><small>${LANG_LABEL[l]}</small>
          </button>`).join('')}
      </div>
      <p class="fine">Demo for a contest, not a real bank service. 공모전용 예시 화면이에요.</p>
    </main>
  </section>`;
}

const ROUTES = {
  demo: { home, register, preview, confirm, done, records, slips, chat, payslip, compose, archive, remit },
  owner: { home, register, preview, confirm, done, records, slips },
  worker: { start, chat, payslip, compose, archive, remit },
}[MODE];

function route() {
  const r = location.hash.replace(/^#\/?/, '');
  if (ROUTES[r]) return r;
  return WORKER ? 'start' : 'home';
}

let lastRoute = null;

function render() {
  const r = route();
  if (r === 'payslip' && !state.viewed[state.empView] && state.sent) {
    state.viewed[state.empView] = true;
    save();
  }
  // 같은 화면을 다시 그릴 때(토글, 선택)는 스크롤 위치를 지키고, 화면이 바뀔 때만 맨 위로
  const keepScroll = r === lastRoute ? ($app.querySelector('.content')?.scrollTop || 0) : 0;
  lastRoute = r;
  $app.innerHTML = ROUTES[r]();
  $app.querySelector('.content')?.scrollTo(0, keepScroll);
  document.body.dataset.route = r;
  if (MODE === 'demo') $guide.innerHTML = guideHtml();
  const draftBox = $app.querySelector('[data-draft]');
  if (draftBox) fitDraft(draftBox);
  const demoSheet = $sheet.classList.contains('open') && $sheet.dataset.kind === 'demo' && $sheet.querySelector('.sheet');
  if (demoSheet) demoSheet.innerHTML = `<span class="grip" aria-hidden="true"></span>${sheetHtml('demo')}`;
}

function go(r) {
  if (route() === r) render();
  else location.hash = '#/' + r;
}

window.addEventListener('hashchange', render);

/* ---------- 동작 ---------- */

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const actions = {
  'toggle-linked': () => { state.linked = !state.linked; },
  'toggle-slip': () => { state.sendSlip = !state.sendSlip; },
  'ins-pay': el => { state.insPay = el.dataset.mode; },
  register: () => { state.registered = true; toast('외국인 직원 3명을 등록했어요'); go('preview'); },
  loan: () => {
    const short = Math.max(0, outflow() - state.balance);
    state.balance += Math.max(short, LOAN_FILL);
    state.loanUsed = true;
    closeSheet();
    toast('운전자금을 채웠어요');
  },
  'save-edit': () => {
    document.querySelectorAll('[data-edit]').forEach(input => {
      const v = Number(String(input.value).replace(/[^\d]/g, '')) || 0;
      emp(input.dataset.edit).lodging = v;
    });
    closeSheet();
    toast(allChecks(state.employees).length ? '아직 확인할 항목이 있어요' : '점검을 통과했어요');
  },
  send: () => {
    const t = total(state.employees);
    const out = outflow();
    if (state.balance < out) {
      toast(`잔액이 ${won(out - state.balance)} 부족해요`);
      openSheet('loan');
      return false;
    }
    state.balance -= out;
    state.sent = { total: t, time: nowTime(), slip: state.sendSlip, ins: { mode: state.insPay, amount: premiums(state.employees).total } };
    state.viewed = { a: false, b: true, c: true };
    go('done');
  },
  reply: el => {
    state.inquiries[Number(el.dataset.idx)].reply = Number(el.dataset.reply);
    closeSheet();
    toast('번역해서 보냈어요');
  },
  ask: el => {
    // 질문을 고르면 바로 보내지 않고, 사장님 카톡방에 메시지 초안을 써 둔다
    const e = emp(state.empView);
    const lang = state.empLang[e.id];
    // 사장님께 가는 메시지는 한국어. 직원 언어 문장은 뜻을 보여 주는 데만 쓴다
    const text = COMPOSE.ko.msg[el.dataset.key](slip(e));
    state.draft = { key: el.dataset.key, lang, text, original: text };
    closeSheet();
    go('compose');
    return false;
  },
  'send-msg': () => {
    const d = state.draft;
    if (!d) return false;
    // 직원 전용 페이지는 인터뷰용이라 보내기 직전에서 멈춘다
    if (WORKER) { toast(COMPOSE[d.lang].notSent); return false; }
    state.inquiries.push({ emp: state.empView, key: d.key, reply: null, lang: d.lang });
    state.draft = null;
    toast(I18N[d.lang].sent);
    go('payslip');
    return false;
  },
  lang: el => { state.empLang[state.empView] = el.dataset.lang; closeSheet(); },
  info: el => { state.infoKey = state.infoKey === el.dataset.key ? null : el.dataset.key; },
  bank: el => { state.bank = el.dataset.bank; toast(`${bank().name} 앱에 탑재된 모습으로 바꿨어요`); },
  emp: el => { state.empView = el.dataset.emp; state.infoKey = 'lodging'; },
  reset: () => { state = freshState(); closeSheet(); go('home'); toast('처음부터 다시 시작해요'); },
  print: () => { renderPrint(); window.print(); return false; },
  proof: () => { renderProof(); window.print(); return false; },
  'slip-emp': el => { state.slipEmp = el.dataset.emp; },
  'slips-print': () => { renderSlipsPrint(); window.print(); return false; },
  'remit-quick': el => { state.remitAmount = Number(el.dataset.val); },
  'remit-send': () => { toast(EXTRA[state.empLang[state.empView]].notSent); return false; },
};

document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-go],[data-action],[data-sheet],[data-toast],[data-close],[data-fill]');
  if (!el) return;
  if (el.dataset.fill) {
    const input = document.querySelector(`[data-edit="${el.dataset.fill}"]`);
    if (input) input.value = num(Number(el.dataset.val));
    return;
  }
  if (el.dataset.toast) { toast(el.dataset.toast); return; }
  if (el.dataset.sheet) { openSheet(el.dataset.sheet, { idx: Number(el.dataset.idx) }); return; }
  if (el.dataset.action) {
    const fn = actions[el.dataset.action];
    const result = fn ? fn(el) : undefined;
    save();
    if (result !== false && !el.dataset.go) render();
    if (el.dataset.close !== undefined && el.dataset.action !== 'reset') closeSheet();
    return;
  }
  if (el.dataset.go) {
    if (el.dataset.close !== undefined) closeSheet();
    go(el.dataset.go);
    return;
  }
  if (el.dataset.close !== undefined) closeSheet();
});

// 송금 금액을 바꾸면 받는 금액만 다시 계산한다 (입력 중인 칸은 다시 그리지 않는다)
document.addEventListener('input', ev => {
  const box = ev.target.closest('[data-remit]');
  if (!box) return;
  const net = slip(emp(state.empView)).net;
  const raw = Number(box.value.replace(/[^\d]/g, '')) || 0;
  const v = Math.min(raw, net);
  if (raw > net) box.value = num(net); // 받은 급여보다 많이는 못 보낸다
  state.remitAmount = v;
  const out = document.getElementById('remit-get');
  if (out) out.textContent = remitReceive(v, state.empLang[state.empView]);
  save();
});

// 메시지 입력창을 내용 길이에 맞춰 늘린다 (최대 높이는 CSS max-height)
function fitDraft(box) {
  box.style.height = 'auto';
  box.style.height = box.scrollHeight + 'px';
}

// 한국어 초안을 직접 고치면, 노란 상자의 뜻풀이 대신 "한국어를 고쳤어요" 안내로 바꾼다
document.addEventListener('input', ev => {
  const box = ev.target.closest('[data-draft]');
  if (!box || !state.draft) return;
  fitDraft(box);
  state.draft.text = box.value;
  const preview = document.getElementById('tr-preview-text');
  if (preview) {
    const edited = box.value !== state.draft.original;
    const C = COMPOSE[state.draft.lang];
    preview.textContent = edited ? C.edited : C.msg[state.draft.key](slip(emp(state.empView)));
    preview.classList.toggle('muted', edited);
  }
  save();
});

document.getElementById('demo-tab').addEventListener('click', () => openSheet('demo'));

/* ---------- 기록 출력 ---------- */

function renderPrint() {
  const s = state.sent;
  document.getElementById('print-root').innerHTML = `
    <h1>${PAYDAY.year}년 ${PAYDAY.month}월 급여 지급과 교부 기록</h1>
    <p>지급 확인: ${s ? `${PAYDAY.month}월 ${PAYDAY.day}일 ${s.time}` : '아직 이체 전'} · 탑재 은행: ${esc(bank().name)} (PoC 예시)</p>
    <table>
      <thead><tr><th>직원</th><th>기본급</th><th>숙식비</th><th>보험료</th><th>실지급</th><th>명세서 언어</th><th>열람과 대조</th></tr></thead>
      <tbody>${state.employees.map(e => {
        const p = slip(e);
        return `<tr><td>${esc(e.name)}</td><td>${num(p.base)}</td><td>${num(p.lodging)}</td><td>${num(p.insurance)}</td><td>${num(p.net)}</td><td>${LANG_LABEL[e.lang]}</td><td>${state.viewed[e.id] ? '완료' : '대기'}</td></tr>`;
      }).join('')}</tbody>
    </table>
    ${s && s.ins ? `<p>4대보험료 ${num(s.ins.amount)}원: ${s.ins.mode === 'now' ? '급여일에 함께 납부' : `${INSURANCE_DUE} 자동 납부 예약`}</p>` : ''}
    <p>이 문서는 공모전 PoC 데모가 만든 예시 기록이에요.</p>`;
}

// 사장님용 보관함 전체 출력: 직원마다 6개월 명세서와 교부 기록
function renderSlipsPrint() {
  document.getElementById('print-root').innerHTML = `
    <h1>직원별 명세서 교부 기록 (${PAYDAY.year}년 4월 ~ ${PAYDAY.month}월)</h1>
    <p>탑재 은행: ${esc(bank().name)} (PoC 예시)</p>
    ${state.employees.map(e => `
      <h2>${esc(e.name)} (${e.nation}, ${LANG_LABEL[e.lang]} 명세서)</h2>
      <table>
        <thead><tr><th>월</th><th>실지급액(원)</th><th>발송</th><th>열람</th><th>상태</th></tr></thead>
        <tbody>${ownerSlipRows(e).slice().reverse().map(r => `<tr><td>${r.month}월</td><td>${num(r.net)}</td><td>${r.sent ? `${r.month}.${PAYDAY.day} ${r.sent}` : '-'}</td><td>${r.viewed ? `${r.month}.${PAYDAY.day} ${r.viewed}` : '-'}</td><td>${SLIP_STATUS[r.status].replace(/<[^>]+>/g, '')}</td></tr>`).join('')}</tbody>
      </table>`).join('')}
    <p>이 문서는 공모전 PoC 데모가 만든 예시 기록이에요.</p>`;
}

// 직원용 소득 확인서: 은행이 지급을 확인한 6개월 기록 (체류 연장, 비자 서류용)
function renderProof() {
  const e = emp(state.empView);
  const lang = state.empLang[e.id];
  const X = EXTRA[lang];
  const rows = archiveRows().reverse();
  const sum = rows.reduce((a, r) => a + r.net, 0);
  document.getElementById('print-root').innerHTML = `
    <h1>급여 지급 확인서${X.proofTitle ? ` (${esc(X.proofTitle)})` : ''}</h1>
    <p>이름: ${esc(e.name)} · 기간: ${PAYDAY.year}.${rows[0].month} ~ ${PAYDAY.year}.${rows[rows.length - 1].month} · 확인 기관: ${esc(bank().name)} (PoC 예시)</p>
    <table>
      <thead><tr><th>월</th><th>지급일</th><th>은행 확인 시각</th><th>실지급액(원)</th></tr></thead>
      <tbody>${rows.map(r => `<tr><td>${r.month}월</td><td>${PAYDAY.year}.${r.month}.${PAYDAY.day}</td><td>${r.time}</td><td>${num(r.net)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="3">합계</td><td>${num(sum)}</td></tr></tfoot>
    </table>
    <p>이 문서는 은행이 실제 이체로 확인한 급여 지급 기록을 모은 것이에요. 공모전 PoC 데모가 만든 예시 문서예요.</p>`;
}

// 직원 화면은 급여가 이미 나간 9월 25일 상태에서 시작한다. ?lang=pt 처럼 언어를 붙이면 언어 고르기를 건너뛴다
function openWorkerDemo() {
  const lang = new URLSearchParams(location.search).get('lang');
  state.registered = true;
  state.empView = 'a';
  state.infoKey = 'lodging';
  const a = emp('a');
  if (a.lodging > a.lodgingConsent) a.lodging = a.lodgingPrev;
  if (!state.sent) {
    const t = total(state.employees);
    state.balance = Math.max(state.balance, t) - t;
    state.sent = { total: t, time: '14:02', slip: true, ins: { mode: 'due', amount: premiums(state.employees).total } };
  }
  if (lang && I18N[lang]) {
    state.empLang.a = lang;
    if (!location.hash) history.replaceState(null, '', location.search + '#/chat');
  }
  save();
}

// 예전 직원 링크(?lang=pt)는 직원 전용 페이지로 넘긴다. 이미 나눠 준 QR도 그대로 쓸 수 있다
const params = new URLSearchParams(location.search);
const linkLang = params.get('lang');
if (MODE === 'demo' && linkLang && I18N[linkLang]) location.replace(`worker/?lang=${linkLang}`);

// ?reset 을 붙여 열면 그 페이지의 진행 상태를 지우고 처음부터 (인터뷰 사이에 같은 휴대폰을 쓸 때)
if (params.has('reset')) {
  state = freshState();
  save();
  params.delete('reset');
  const rest = params.toString();
  history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
}

if (WORKER) {
  actions['pick-lang'] = el => { state.empLang.a = el.dataset.lang; go('chat'); };
  openWorkerDemo();
}
render();
let hinted = false;
try { hinted = sessionStorage.getItem(`paycheck-hint-${MODE}`) === '1'; sessionStorage.setItem(`paycheck-hint-${MODE}`, '1'); } catch (e) { /* 무시 */ }
if (!WORKER && !hinted && route() === 'home') {
  const mobile = !matchMedia('(min-width: 760px)').matches;
  setTimeout(() => toast("'외국인 직원 급여' 카드를 눌러 시작해요"), 500);
  if (mobile && MODE === 'demo') setTimeout(() => toast('왼쪽 가장자리 손잡이를 누르면 장면을 바로 열 수 있어요'), 3000);
}
