'use client';
import MonthRow from '../MonthRow';
import { CATS, Budget, Transaction, fmt, catMap } from '@/lib/types';

type Props = {
  cy: number; cm: number; moveMonth: (d: number) => void;
  monthTxs: Transaction[]; txs: Transaction[]; budgets: Budget;
};

export default function SummaryTab({ cy, cm, moveMonth, monthTxs, txs, budgets }: Props) {
  const inc = txs.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === cy && d.getMonth() + 1 === cm && t.isIncome;
  }).reduce((s, t) => s + t.amount, 0);
  const exp = monthTxs.reduce((s, t) => s + t.amount, 0);
  const bal = inc - exp;
  const tb = CATS.reduce((s, c) => s + (budgets[c.name] || 0), 0);
  const diff = tb - exp;
  const cm2 = catMap(monthTxs);

  return (
    <>
      <MonthRow cy={cy} cm={cm} moveMonth={moveMonth} />

      <div className="hero">
        <div className="hero-lbl">今月の支出合計</div>
        <div className="hero-amount">{fmt(exp)}</div>
        <div className="hero-sub">
          {diff >= 0 ? `予算まで残り ${fmt(diff)}` : `予算を ${fmt(-diff)} 超過`}
        </div>
        <div className="hero-cards">
          <div className="hero-card">
            <div className="hero-card-lbl">収入</div>
            <div className="hero-card-val">{fmt(inc)}</div>
            <div className={`hero-card-note ${inc > 0 ? 'grn-txt' : ''}`}>{inc > 0 ? '今月の手取り' : '未入力'}</div>
          </div>
          <div className="hero-card">
            <div className="hero-card-lbl">収支</div>
            <div className="hero-card-val">{fmt(bal)}</div>
            <div className={`hero-card-note ${bal >= 0 ? 'grn-txt' : 'red-txt'}`}>{bal >= 0 ? '黒字' : '赤字'}</div>
          </div>
        </div>
      </div>

      <div className="sec">
        <div className="sec-hd">
          <span className="sec-title">支出内訳</span>
          <span className="sec-note">― 実績　― 予算</span>
        </div>
        {CATS.map(c => {
          const sp = cm2[c.name] || 0;
          const bg = budgets[c.name] || 0;
          const pct = bg ? Math.min(100, Math.round(sp / bg * 100)) : 0;
          return (
            <div key={c.name} className="cat-row">
              <div className="cat-dot" style={{ background: c.color }} />
              <div className="cat-name">{c.name}</div>
              <div className="cat-bar-wrap">
                <div className="bar-bg">
                  <div className="bar-fill" style={{ width: `${pct}%`, background: c.color }} />
                </div>
              </div>
              <div className="cat-nums">
                {sp ? fmt(sp) : '¥0'} <span className="cat-budget-txt">/ {fmt(bg)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
