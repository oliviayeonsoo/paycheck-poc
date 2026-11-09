// 이체 전 점검과 명세서 계산. 판정이 아니라 사장님에게 보여 주는 참고 알림을 만든다.
import { MIN_WAGE } from './data.js?v=20261109g';

export const won = n => `${Math.round(n).toLocaleString('ko-KR')}원`;
export const num = n => Math.round(n).toLocaleString('ko-KR');

export function slip(e) {
  return {
    base: e.base,
    lodging: e.lodging,
    insurance: e.insurance,
    net: e.base - e.lodging - e.insurance,
  };
}

export function total(employees) {
  return employees.reduce((sum, e) => sum + slip(e).net, 0);
}

// 4대보험 고지액: 직원 몫(명세서에서 공제한 보험료)과 사장님 몫을 더한 금액
export function premiums(employees) {
  const worker = employees.reduce((sum, e) => sum + e.insurance, 0);
  const owner = employees.reduce((sum, e) => sum + e.employerIns, 0);
  return { worker, owner, total: worker + owner };
}

export function checks(e) {
  const issues = [];
  const hourly = e.base / e.hours;
  if (hourly < MIN_WAGE) {
    issues.push({
      type: 'minwage', id: e.id,
      text: `${e.name}의 시급이 2026년 최저임금(${num(MIN_WAGE)}원)보다 낮아요`,
    });
  }
  if (e.lodging > e.lodgingConsent) {
    issues.push({
      type: 'lodging', id: e.id,
      text: `${e.name}의 숙식비 공제가 서면 동의 금액(${won(e.lodgingConsent)})보다 많아요`,
    });
  }
  return issues;
}

export function allChecks(employees) {
  return employees.flatMap(checks);
}
