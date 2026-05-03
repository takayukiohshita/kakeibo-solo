export type Transaction = {
  id: number;
  amount: number;
  memo: string;
  cat: string;
  date: string;
  isIncome?: boolean;
};

export type Budget = Record<string, number>;

export type Category = {
  name: string;
  color: string;
};

export const CATS: Category[] = [
  { name: '食費',   color: '#2563eb' },
  { name: '日用品', color: '#059669' },
  { name: '衣服',   color: '#7c3aed' },
  { name: '美容品', color: '#db2777' },
  { name: '交際費', color: '#d97706' },
  { name: '医療費', color: '#dc2626' },
  { name: '教育費', color: '#0891b2' },
  { name: '交通費', color: '#65a30d' },
  { name: '通信費', color: '#0d9488' },
  { name: '保険料', color: '#9333ea' },
  { name: '旅行費', color: '#c2410c' },
  { name: '筋トレ', color: '#1d4ed8' },
];

export const DEFAULT_BUDGETS: Budget = {
  食費: 35000, 日用品: 20000, 衣服: 20000, 美容品: 20000,
  交際費: 15000, 医療費: 20000, 教育費: 20000, 交通費: 10000,
  通信費: 8000, 保険料: 85000, 旅行費: 20000, 筋トレ: 15000,
};

export const HIST_DATA = [
  { ym: '2024/10', exp: 198327 }, { ym: '2024/11', exp: 302110 },
  { ym: '2024/12', exp: 289021 }, { ym: '2025/01', exp: 258786 },
  { ym: '2025/02', exp: 259539 }, { ym: '2025/03', exp: 320807 },
  { ym: '2025/04', exp: 237595 }, { ym: '2025/05', exp: 312324 },
  { ym: '2025/06', exp: 322329 }, { ym: '2025/07', exp: 335674 },
  { ym: '2025/08', exp: 420980 }, { ym: '2025/09', exp: 420749 },
  { ym: '2025/10', exp: 572001 }, { ym: '2025/11', exp: 320602 },
  { ym: '2025/12', exp: 378772 }, { ym: '2026/01', exp: 431916 },
  { ym: '2026/02', exp: 342919 }, { ym: '2026/03', exp: 355586 },
  { ym: '2026/04', exp: 298000 },
];

export function fmt(n: number): string {
  return '¥' + Math.round(n).toLocaleString('ja-JP');
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function catOf(name: string): Category {
  return CATS.find(c => c.name === name) || { name, color: '#9ca3af' };
}

export function catMap(list: Transaction[]): Record<string, number> {
  const m: Record<string, number> = {};
  list.forEach(t => { m[t.cat] = (m[t.cat] || 0) + t.amount; });
  return m;
}
