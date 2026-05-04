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

export const HIST_DATA: { ym: string; exp: number }[] = [];

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
