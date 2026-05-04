'use client';
import { useState } from 'react';
import MonthRow from '../MonthRow';
import { CATS, Budget, Transaction, fmt, catMap, catOf } from '@/lib/types';

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
  const [openCat, setOpenCat] = useState<string | null>(null);

  const inc = txs.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === cy && d.getMonth() + 1 === cm && t.isIncome;
  }).reduce((s, t) => s + t.amount, 0);

  const exp = monthTxs.reduce((s, t) => s + t.amount, 0);
  const burden = sharedBurden[burdenKey] || 0;
  const finalBal = inc - exp - burden;
  const tb = CATS.reduce((s, c) => s + (budgets[c.name] || 0), 0);
  const diff = tb - exp;
  const cm2 = catMap(monthTxs);

  const handleSaveBurden = () => {
    const v = parseFloat(burdenInput);
    if (!isNaN(v) && v >= 0) saveSharedBurden(burdenKey, v);
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
                  type="number" value={burdenInput} onChange={e => setBurdenInput(e.target.value)}
                  placeholder="0" autoFocus
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

      {/* 支出内訳（タップで内訳展開） */}
      <div className="sec">
        <div className="sec-hd">
          <span className="sec-title">支出内訳</span>
          <span className="sec-note">タップで内訳を表示</span>
        </div>
        {CATS.map(c => {
          const sp = cm2[c.name] || 0;
          const bg = budgets[c.name] || 0;
          const pct = bg ? Math.min(100, Math.round(sp / bg * 100)) : 0;
          const isOpen = openCat === c.name;
          const catTxs = [...monthTxs]
            .filter(t => t.cat === c.name)
            .sort((a, b) => b.date.localeCompare(a.date));

          return (
            <div key={c.name}>
              {/* カテゴリ行 */}
              <div
                className="cat-row"
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => setOpenCat(isOpen ? null : c.name)}
              >
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
                <div style={{ marginLeft: 6, color: '#9ca3af', fontSize: 11, transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>▼</div>
              </div>

              {/* 内訳リスト */}
              {isOpen && (
                <div style={{ background: '#f9fafb', borderRadius: 8, margin: '0 0 4px', padding: '4px 0', border: '1px solid #f3f4f6' }}>
                  {catTxs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 12, color: '#9ca3af' }}>取引なし</div>
                  ) : catTxs.map(t => {
                    const d = new Date(t.date);
                    const ds = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
                    const c2 = catOf(t.cat);
                    return (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.memo || t.cat}
                            {t.subscriptionId ? <span style={{ marginLeft: 6, fontSize: 10, background: '#eff6ff', color: '#2563eb', padding: '1px 5px', borderRadius: 4 }}>サブスク</span> : null}
                          </div>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{ds}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap' }}>{fmt(t.amount)}</div>
                      </div>
                    );
                    void c2;
                  })}
                  <div style={{ padding: '8px 14px', fontSize: 12, color: '#6b7280', textAlign: 'right', fontWeight: 600 }}>
                    小計 {fmt(sp)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
