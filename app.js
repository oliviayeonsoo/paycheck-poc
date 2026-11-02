import { PAYDAY, START_BALANCE, LOAN_FILL, BANKS, EMPLOYEES, LANG_LABEL, LANG_NATIVE, I18N, REPLIES } from './data.js';
import { won, num, slip, total, checks, allChecks } from './engine.js';

const STORE = 'paycheck-poc-v1';
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

/* ---------- 공통 조각 ---------- */

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const icon = {
  back: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chev: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  info: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v5M10 6.2v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
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
    </main>
    <footer class="cta two">
      <button class="btn secondary" data-sheet="edit">수정하기</button>
      <button class="btn primary" data-action="send">${issues.length ? '그대로 보내기' : '보내기'}</button>
    </footer>
  </section>`;
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
      </div>
      ${s.slip ? '<button class="link" data-go="chat">직원 휴대폰에서 보기</button>' : ''}
    </main>
    <footer class="cta"><button class="btn primary" data-go="records">확인</button></footer>
  </section>`;
}

function records() {
  const status = e => {
    const inq = state.inquiries.filter(q => q.emp === e.id && !q.reply).length;
    if (inq) return `<b>문의 ${inq}건</b>`;
    if (!state.sent && e.id === 'a') return '<b class="gray">이체 전</b>';
    return state.viewed[e.id] ? '<b class="navy">열람과 대조 완료</b>' : '<b class="gray">발송 완료, 열람 전</b>';
  };
  const allDone = state.sent && state.employees.every(e => state.viewed[e.id]) && state.inquiries.every(q => q.reply);
  const inquiries = state.inquiries.map((q, idx) => {
    const e = emp(q.emp);
    return `
      <div class="card gray">
        <small>${esc(e.name)}의 문의</small>
        <b class="quote">“${esc(I18N.ko.q[q.key])}”</b>
        <small>${LANG_LABEL[e.lang]}에서 한국어로 번역됨</small>
        ${q.reply
          ? `<div class="reply"><small>보낸 답장</small><p>${esc(REPLIES[q.reply - 1].ko)}</p><p class="tr">${esc(REPLIES[q.reply - 1][e.lang])}</p></div>`
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
      </div>
      ${inquiries}
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
      <button class="icon-btn" data-go="${state.sent ? 'done' : 'home'}" aria-label="뒤로">${icon.back}</button>
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
      <p class="fine">명세서는 한국어 원문에 직원 모국어를 함께 적어요. 법적 효력은 한국어 원문 기준이에요.</p>
    </main>
    <footer class="cta"><button class="btn primary" data-sheet="ask">${esc(L.ask)}</button></footer>
  </section>`;
}

/* ---------- 시트 ---------- */

function sheetHtml(kind, data) {
  if (kind === 'loan') {
    const short = Math.max(0, total(state.employees) - state.balance);
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
    return `
      <h3>${esc(e.name)}에게 답장</h3>
      <p class="desc">고른 문장이 ${LANG_LABEL[e.lang]}로 번역돼 카톡으로 가요.</p>
      ${REPLIES.map((r, i) => `
        <button class="card gray choice" data-action="reply" data-idx="${data.idx}" data-reply="${i + 1}">
          <b>${esc(r.ko)}</b><small>${esc(r[e.lang])}</small>
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
    const langs = [...new Set([e.lang, 'ko', 'vi', 'ne'])];
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
    <button class="btn secondary reset" data-action="reset">처음부터 다시</button>
    <p class="fine">실제 금융 서비스가 아니에요. 이름, 금액, 은행 화면은 모두 예시이고 번역은 원어민 검수 전이에요.</p>`;
}

/* ---------- 라우팅 ---------- */

const ROUTES = { home, register, preview, confirm, done, records, chat, payslip };

function route() {
  const r = location.hash.replace(/^#\/?/, '');
  return ROUTES[r] ? r : 'home';
}

function render() {
  const r = route();
  if (r === 'payslip' && !state.viewed[state.empView] && state.sent) {
    state.viewed[state.empView] = true;
    save();
  }
  $app.innerHTML = ROUTES[r]();
  $app.querySelector('.content')?.scrollTo(0, 0);
  document.body.dataset.route = r;
  $guide.innerHTML = guideHtml();
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
  register: () => { state.registered = true; toast('외국인 직원 3명을 등록했어요'); go('preview'); },
  loan: () => {
    const short = Math.max(0, total(state.employees) - state.balance);
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
    if (state.balance < t) {
      toast(`잔액이 ${won(t - state.balance)} 부족해요`);
      openSheet('loan');
      return false;
    }
    state.balance -= t;
    state.sent = { total: t, time: nowTime(), slip: state.sendSlip };
    state.viewed = { a: false, b: true, c: true };
    go('done');
  },
  reply: el => {
    state.inquiries[Number(el.dataset.idx)].reply = Number(el.dataset.reply);
    closeSheet();
    toast('번역해서 보냈어요');
  },
  ask: el => {
    const e = emp(state.empView);
    state.inquiries.push({ emp: e.id, key: el.dataset.key, reply: null });
    closeSheet();
    toast(I18N[state.empLang[e.id]].sent);
  },
  lang: el => { state.empLang[state.empView] = el.dataset.lang; closeSheet(); },
  info: el => { state.infoKey = state.infoKey === el.dataset.key ? null : el.dataset.key; },
  bank: el => { state.bank = el.dataset.bank; toast(`${bank().name} 앱에 탑재된 모습으로 바꿨어요`); },
  emp: el => { state.empView = el.dataset.emp; state.infoKey = 'lodging'; },
  reset: () => { state = freshState(); closeSheet(); go('home'); toast('처음부터 다시 시작해요'); },
  print: () => { renderPrint(); window.print(); return false; },
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
    <p>이 문서는 공모전 PoC 데모가 만든 예시 기록이에요.</p>`;
}

render();
let hinted = false;
try { hinted = sessionStorage.getItem('paycheck-hint') === '1'; sessionStorage.setItem('paycheck-hint', '1'); } catch (e) { /* 무시 */ }
if (!hinted && route() === 'home') {
  const mobile = !matchMedia('(min-width: 760px)').matches;
  setTimeout(() => toast("'외국인 직원 급여' 카드를 눌러 시작해요"), 500);
  if (mobile) setTimeout(() => toast('왼쪽 가장자리 손잡이를 누르면 장면을 바로 열 수 있어요'), 3000);
}
