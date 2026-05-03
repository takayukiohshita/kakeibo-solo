'use client';
import { useState, useEffect } from 'react';
import MonthRow from '../MonthRow';
import { CATS, Transaction, Budget, fmt, catMap } from '@/lib/types';

type Props = { cy: number; cm: number; moveMonth: (d: number) => void; monthTxs: Transaction[]; txs: Transaction[]; budgets: Budget; saveBudgets: (b: Budget) => void; showToast: (msg: string) => void; };

export default function BudgetTab({ cy, cm, moveMonth, monthTxs, budgets, saveBudgets }: Props) {
  const [editBudgets, setEditBudgets] = useState<Budget>({ ...budgets });
  useEffect(() => { setEditBudgets({ ...budgets }); }, [budgets]);

  const exp = monthTxs.reduce((s, t) => s + t.amount, 0);
  const cm2 = catMap(monthTxs);
  const tb = CATS.reduce((s, c) => s + (budgets[c.name] || 0), 0);
  const diff = tb - exp;

  return (
    <>
      <MonthRow cy={cy} cm={cm} moveMonth={moveMonth} />

      <div className="budget-hero">
        <div className="bh-title">今月の予算 VS 実績</div>
        <div className="bh-grid">
          <div><div className="bh-lbl">予算合計</div><div className="bh-val bh-blue">{fmt(tb)}</div></div>
          <div><div className="bh-lbl">実績合計</div><div className="bh-val">{fmt(exp)}</div></div>
          <div><div className="bh-lbl">差分</div><div className={`bh-val ${diff >= 0 ? 'bh-grn' : 'bh-red'}`}>{diff >= 0 ? `−${fmt(diff)}` : `+${fmt(-diff)}`}</div></div>
        </div>
      </div>

      <div className="sec">
        <div className="sec-hd"><span className="sec-title">カテゴリ別 予算 VS 実績</span></div>
        {CATS.map(c => {
          const sp = cm2[c.name] || 0;
          const bg = budgets[c.name] || 0;
          const pct = bg ? Math.min(100, Math.round(sp / bg * 100)) : 0;
          const d = sp - bg;
          return (
            <div key={c.name} className="cat-row">
              <div className="cat-dot" style={{ background: c.color }} />
              <div className="cat-name">{c.name}</div>
              <div className="cat-bar-wrap">
                <div className="bar-bg"><div className="bar-fill" style={{ width: `${pct}%`, background: c.color }} /></div>
              </div>
              <div className="cat-nums">{fmt(sp)} <span className="cat-budget-txt">/ {fmt(bg)}</span></div>
              <div className={`vs-diff ${d <= 0 ? 'under' : 'over'}`}>{d <= 0 ? '–' : `+${fmt(d)}`}</div>
            </div>
          );
        })}
      </div>

      <div className="sec">
        <div className="sec-hd"><span className="sec-title">予算を編集</span></div>
        {CATS.map(c => (
          <div key={c.name} className="bud-edit-row">
            <div className="cat-dot" style={{ background: c.color }} />
            <div className="cat-name">{c.name}</div>
            <span className="bud-curr">現在 {fmt(budgets[c.name] || 0)}</span>
            <input
              className="finput"
              style={{ width: 120, textAlign: 'right', padding: '7px 8px', fontSize: 13 }}
              type="number"
              value={editBudgets[c.name] || ''}
              placeholder="変更後の予算"
              onChange={e => setEditBudgets(prev => ({ ...prev, [c.name]: Number(e.target.value) }))}
            />
          </div>
        ))}
        <button className="save-btn" onClick={() => saveBudgets(editBudgets)}>✓ 予算を保存</button>
      </div>
    </>
  );
}
