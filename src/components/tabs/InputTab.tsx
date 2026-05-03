'use client';
import { useState } from 'react';
import MonthRow from '../MonthRow';
import { CATS, Transaction, fmt, catOf, todayStr } from '@/lib/types';

type MultiItem = { id: number; date: string; cat: string; amount: string; memo: string; };

type Props = {
  cy: number; cm: number; moveMonth: (d: number) => void;
  monthTxs: Transaction[]; txs: Transaction[]; budgets: Record<string, number>;
  addTx: (tx: Omit<Transaction, 'id'>) => void;
  addTxBulk: (items: Omit<Transaction, 'id'>[]) => void;
  delTx: (id: number) => void;
  showToast: (msg: string) => void;
};

export default function InputTab({ cy, cm, moveMonth, monthTxs, addTx, addTxBulk, delTx, showToast }: Props) {
  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [date, setDate] = useState(todayStr());
  const [cat, setCat] = useState(CATS[0].name);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [multiItems, setMultiItems] = useState<MultiItem[]>([
    { id: 1, date: todayStr(), cat: CATS[0].name, amount: '', memo: '' }
  ]);

  const handleSingle = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { showToast('金額を入力してください'); return; }
    addTx({ amount: amt, memo, cat, date: date || todayStr() });
    setAmount(''); setMemo('');
  };

  const handleMulti = () => {
    const valid = multiItems.filter(m => parseFloat(m.amount) > 0);
    if (!valid.length) { showToast('金額を入力してください'); return; }
    addTxBulk(valid.map(m => ({ amount: parseFloat(m.amount), memo: m.memo, cat: m.cat, date: m.date || todayStr() })));
    setMultiItems([{ id: Date.now(), date: todayStr(), cat: CATS[0].name, amount: '', memo: '' }]);
  };

  const addMultiItem = () => setMultiItems(prev => [...prev, { id: Date.now(), date: todayStr(), cat: CATS[0].name, amount: '', memo: '' }]);
  const removeMultiItem = (id: number) => setMultiItems(prev => prev.length > 1 ? prev.filter(m => m.id !== id) : prev);
  const updateMulti = (id: number, key: keyof MultiItem, val: string) =>
    setMultiItems(prev => prev.map(m => m.id === id ? { ...m, [key]: val } : m));

  const sorted = [...monthTxs].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <MonthRow cy={cy} cm={cm} moveMonth={moveMonth} />

      <div className="input-tog">
        <button className={`it-btn${mode === 'multi' ? ' on' : ''}`} onClick={() => setMode('multi')}>一括入力</button>
        <button className={`it-btn${mode === 'single' ? ' on' : ''}`} onClick={() => setMode('single')}>1件入力</button>
      </div>

      <div className="sec" style={{ marginBottom: 14 }}>
        {mode === 'single' ? (
          <>
            <div className="upload-area" onClick={() => showToast('レシートアップロード機能（準備中）')}>
              <div className="upload-icon">
                <svg viewBox="0 0 24 24"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
              </div>
              <div className="upload-title">レシートをアップロード</div>
              <div className="upload-sub">タップまたはドラッグ＆ドロップ</div>
            </div>
            <div className="form-sec-title">支出を追加</div>
            <label className="flbl">日付</label>
            <input className="finput" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <label className="flbl">カテゴリ</label>
            <select className="finput" value={cat} onChange={e => setCat(e.target.value)}>
              {CATS.map(c => <option key={c.name}>{c.name}</option>)}
            </select>
            <label className="flbl">金額（円）</label>
            <input className="finput" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" min="0" />
            <label className="flbl">メモ（任意）</label>
            <input className="finput" type="text" value={memo} onChange={e => setMemo(e.target.value)} placeholder="例）イオン、ランチ等" />
            <button className="submit-btn" onClick={handleSingle}>+ 追加する</button>
          </>
        ) : (
          <>
            <div className="upload-area" onClick={() => showToast('複数レシートアップロード機能（準備中）')}>
              <div className="upload-icon">
                <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div className="upload-title">複数のレシートを一度に選択</div>
              <div className="upload-sub">タップして複数選択 / ドラッグ＆ドロップ</div>
            </div>
            <div className="sec-hd">
              <span className="form-sec-title">支出リスト</span>
              <span className="sec-note">0件入力済み</span>
            </div>
            {multiItems.map((item, i) => (
              <div key={item.id} className="multi-item">
                <div className="multi-item-hd">
                  <span className="multi-no">#{i + 1}</span>
                  <button className="multi-close" onClick={() => removeMultiItem(item.id)}>✕</button>
                </div>
                <div className="frow2">
                  <div>
                    <label className="flbl">日付</label>
                    <input className="finput" type="date" value={item.date} onChange={e => updateMulti(item.id, 'date', e.target.value)} />
                  </div>
                  <div>
                    <label className="flbl">カテゴリ</label>
                    <select className="finput" value={item.cat} onChange={e => updateMulti(item.id, 'cat', e.target.value)}>
                      {CATS.map(c => <option key={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="frow2" style={{ marginTop: 8 }}>
                  <div>
                    <label className="flbl">金額（円）</label>
                    <input className="finput" type="number" value={item.amount} onChange={e => updateMulti(item.id, 'amount', e.target.value)} placeholder="0" />
                  </div>
                  <div>
                    <label className="flbl">メモ</label>
                    <input className="finput" type="text" value={item.memo} onChange={e => updateMulti(item.id, 'memo', e.target.value)} placeholder="店名など" />
                  </div>
                </div>
              </div>
            ))}
            <button className="add-item-btn" onClick={addMultiItem}>+ 項目を追加</button>
            <button className="submit-btn" onClick={handleMulti}>まとめて追加する</button>
          </>
        )}
      </div>

      <div className="sec">
        <div className="sec-hd">
          <span className="sec-title">{cy}年{cm}月の入力一覧</span>
        </div>
        {sorted.length === 0 ? (
          <div className="empty-msg">取引がありません</div>
        ) : sorted.map(t => {
          const c = catOf(t.cat);
          const d = new Date(t.date);
          const ds = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
          return (
            <div key={t.id} className="tx-item">
              <div className="cat-dot" style={{ background: c.color }} />
              <div className="tx-info">
                <div className="tx-name">{t.memo || t.cat}</div>
                <div className="tx-meta">{ds} <span style={{ color: c.color, fontWeight: 600 }}>{t.cat}</span></div>
              </div>
              <div className="tx-amt">{fmt(t.amount)}</div>
              <button className="icon-btn del" onClick={() => { if (confirm('この取引を削除しますか？')) delTx(t.id); }}>✕</button>
            </div>
          );
        })}
      </div>
    </>
  );
}
