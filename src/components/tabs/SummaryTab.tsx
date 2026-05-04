'use client';
import { useState } from 'react';
import MonthRow from '../MonthRow';
import { CATS, Budget, Transaction, fmt, catMap } from '@/lib/types';

type Props = {
  cy: number; cm: number; moveMonth: (d: number) => void;
  monthTxs: Transaction[]; txs: Transaction[]; budgets: Budget;
  sharedBurden: Record<string, number>;
  burdenKey: string;
  saveSharedBurden: (key: string, amount: number) => void;
  [key: string]: unknown;
};

export default function SummaryTab({ cy, cm, moveMonth, monthTxs, txs, budgets, sharedBurden, burdenKey, saveSharedBurden }: Props) {
  const [editingBurden, setEditingBurden] = useState(false);
  const [burdenInput, setBurdenInput] = useState('');

  const inc = txs.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === cy && d.getMonth() + 1 === cm && t.isIncome;
  }).reduce((s, t) => s + t.amount, 0);

  const exp = monthTxs.reduce((s, t) => s + t.amount, 0);
  const burden = sharedBurden[burdenKey] || 0;
  // 最終残高 = 収入 - 本アプリ支出 - 二人家計負担額
  const finalBal = inc - exp - burden;
  const tb = CATS.reduce((s, c) => s + (budgets[c.name] || 0), 0);
  const diff = tb - exp;
  const cm2 = catMap(monthTxs);

  const handleSaveBurden = () => {
    const v = parseFloat(burdenInput);
    if (!isNaN(v) && v >= 0) {
      saveSharedBurden(burdenKey, v);
    }
    setEditingBurden(false);
    setBurdenInput('');
  };

  return (
    <>
      <MonthRow cy={cy} cm={cm} moveMonth={moveMonth} />

      {/* ヒーローカード */}
      <div className="hero">
        <div className="hero-lbl">最終残高（収入 − 支出 − 二人家計）</div>
        <div className="hero-amount">{fmt(finalBal)}</div>
        <div className="hero-sub">
          {diff >= 0 ? `個人予算まで残り ${fmt(diff)}` : `個人予算を ${fmt(-diff)} 超過`}
        </div>
        {/* 4枠カード */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="hero-card">
            <div className="hero-card-lbl">収入</div>
            <div className="hero-card-val">{inc > 0 ? fmt(inc) : '未入力'}</div>
            <div className={`hero-card-note ${inc > 0 ? 'grn-txt' : ''}`}>{inc > 0 ? '今月の手取り' : '入力タブから追加'}</div>
          </div>
          <div className="hero-card">
            <div className="hero-card-lbl">個人支出</div>
            <div className="hero-card-val">{fmt(exp)}</div>
            <div className="hero-card-note" style={{ opacity: .7 }}>本アプリの支出</div>
          </div>
          <div className="hero-card" style={{ cursor: 'pointer' }} onClick={() => { setEditingBurden(true); setBurdenInput(String(burden || '')); }}>
            <div className="hero-card-lbl">二人家計 負担額</div>
            {editingBurden ? (
              <div onClick={e => e.stopPropagation()} style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                <input
                  type="number"
                  value={burdenInput}
                  onChange={e => setBurdenInput(e.target.value)}
                  placeholder="0"
                  autoFocus
                  style={{ flex: 1, padding: '4px 6px', borderRadius: 6, border: '1px solid rgba(255,255,255,.4)', background: 'rgba(255,255,255,.2)', color: '#fff', fontSize: 13, width: '100%', minWidth: 0 }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSaveBurden(); if (e.key === 'Escape') setEditingBurden(false); }}
                />
                <button onClick={handleSaveBurden} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,.3)', color: '#fff', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>保存</button>
              </div>
            ) : (
              <>
                <div className="hero-card-val">{burden > 0 ? fmt(burden) : '未入力'}</div>
                <div className="hero-card-note red-txt">{burden > 0 ? 'タップで編集' : 'タップして入力'}</div>
              </>
            )}
          </div>
          <div className="hero-card">
            <div className="hero-card-lbl">収支合計</div>
            <div className="hero-card-val">{fmt(inc - exp - burden)}</div>
            <div className={`hero-card-note ${finalBal >= 0 ? 'grn-txt' : 'red-txt'}`}>{finalBal >= 0 ? '黒字' : '赤字'}</div>
          </div>
        </div>
      </div>

      {/* 支出内訳 */}
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
