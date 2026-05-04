'use client';
import { useState } from 'react';
import { CATS, Subscription, fmt, todayStr } from '@/lib/types';

type Props = {
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (sub: Subscription) => void;
  deleteSubscription: (id: number) => void;
  showToast: (msg: string) => void;
};

const EMPTY: Omit<Subscription, 'id'> = {
  name: '', amount: 0, cat: '通信費', dayOfMonth: 1,
  startYm: todayStr().slice(0, 7), endYm: null, memo: '',
};

export default function SubscriptionTab({ subscriptions, addSubscription, updateSubscription, deleteSubscription, showToast }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Subscription, 'id'>>(EMPTY);

  const totalMonthly = subscriptions
    .filter(s => !s.endYm || s.endYm >= todayStr().slice(0, 7))
    .reduce((s, sub) => s + sub.amount, 0);

  const openAdd = () => {
    setForm({ ...EMPTY, startYm: todayStr().slice(0, 7) });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (sub: Subscription) => {
    setForm({ name: sub.name, amount: sub.amount, cat: sub.cat, dayOfMonth: sub.dayOfMonth, startYm: sub.startYm, endYm: sub.endYm, memo: sub.memo });
    setEditId(sub.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { showToast('サービス名を入力してください'); return; }
    if (!form.amount || form.amount <= 0) { showToast('金額を入力してください'); return; }
    if (editId !== null) {
      updateSubscription({ ...form, id: editId });
    } else {
      addSubscription(form);
    }
    setShowForm(false);
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`「${name}」を削除しますか？\n過去に自動生成された取引も削除されます。`)) {
      deleteSubscription(id);
    }
  };

  const isActive = (sub: Subscription) => {
    const now = todayStr().slice(0, 7);
    return sub.startYm <= now && (!sub.endYm || sub.endYm >= now);
  };

  return (
    <>
      {/* サマリーカード */}
      <div className="hero" style={{ marginBottom: 14 }}>
        <div className="hero-lbl">登録中のサブスク</div>
        <div className="hero-amount">{fmt(totalMonthly)}<span style={{ fontSize: 14, fontWeight: 400, opacity: .7 }}> / 月</span></div>
        <div className="hero-sub">{subscriptions.filter(isActive).length}件が現在有効</div>
      </div>

      {/* 登録ボタン */}
      {!showForm && (
        <button
          onClick={openAdd}
          style={{ width: '100%', padding: 13, background: '#14532d', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 14 }}
        >
          + サブスクを追加
        </button>
      )}

      {/* 入力フォーム */}
      {showForm && (
        <div className="sec" style={{ marginBottom: 14 }}>
          <div className="sec-hd">
            <span className="sec-title">{editId !== null ? 'サブスクを編集' : 'サブスクを追加'}</span>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
          </div>

          <label className="flbl">サービス名</label>
          <input className="finput" type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="例）Netflix、Spotify" />

          <label className="flbl">月額（円）</label>
          <input className="finput" type="number" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))} placeholder="0" min="0" />

          <label className="flbl">カテゴリ</label>
          <select className="finput" value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}>
            {CATS.map(c => <option key={c.name}>{c.name}</option>)}
          </select>

          <label className="flbl">毎月の引き落とし日</label>
          <select className="finput" value={form.dayOfMonth} onChange={e => setForm(f => ({ ...f, dayOfMonth: +e.target.value }))}>
            {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
              <option key={d} value={d}>{d}日</option>
            ))}
          </select>

          <label className="flbl">開始年月</label>
          <input className="finput" type="month" value={form.startYm} onChange={e => setForm(f => ({ ...f, startYm: e.target.value }))} />

          <label className="flbl">終了年月（空欄 = 無期限）</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="finput"
              type="month"
              value={form.endYm || ''}
              onChange={e => setForm(f => ({ ...f, endYm: e.target.value || null }))}
              style={{ flex: 1 }}
            />
            {form.endYm && (
              <button
                onClick={() => setForm(f => ({ ...f, endYm: null }))}
                style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap', flexShrink: 0 }}
              >クリア</button>
            )}
          </div>

          <label className="flbl">メモ（任意）</label>
          <input className="finput" type="text" value={form.memo} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} placeholder="例）ファミリープラン" />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
            <button onClick={() => setShowForm(false)} style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 10, background: '#fff', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              キャンセル
            </button>
            <button onClick={handleSave} style={{ padding: 12, border: 'none', borderRadius: 10, background: '#14532d', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              {editId !== null ? '更新する' : '登録する'}
            </button>
          </div>
        </div>
      )}

      {/* サブスク一覧 */}
      {subscriptions.length === 0 ? (
        <div className="sec"><div className="empty-msg">サブスクが登録されていません</div></div>
      ) : (
        <>
          {/* 有効中 */}
          {subscriptions.filter(isActive).length > 0 && (
            <div className="sec">
              <div className="sec-hd"><span className="sec-title">有効中</span></div>
              {subscriptions.filter(isActive).map(sub => {
                const cat = CATS.find(c => c.name === sub.cat) || { color: '#9ca3af' };
                return (
                  <div key={sub.id} style={{ padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e' }}>{sub.name}</div>
                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                          {sub.cat}・毎月{sub.dayOfMonth}日
                          {sub.endYm ? `・${sub.endYm}まで` : '・無期限'}
                          {sub.memo ? `・${sub.memo}` : ''}
                        </div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap' }}>{fmt(sub.amount)}</div>
                      <div style={{ display: 'flex', gap: 4, marginLeft: 4, flexShrink: 0 }}>
                        <button onClick={() => openEdit(sub)} style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', color: '#6b7280', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✎</button>
                        <button onClick={() => handleDelete(sub.id, sub.name)} style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', color: '#9ca3af', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                      </div>
                    </div>
                    <div style={{ marginTop: 8, background: '#f3f4f6', borderRadius: 6, height: 4, overflow: 'hidden' }}>
                      <div style={{ width: '100%', height: '100%', background: cat.color, borderRadius: 6 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 終了済み */}
          {subscriptions.filter(s => !isActive(s)).length > 0 && (
            <div className="sec">
              <div className="sec-hd"><span className="sec-title">終了済み</span></div>
              {subscriptions.filter(s => !isActive(s)).map(sub => (
                <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #f3f4f6', opacity: .5 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{sub.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub.cat}・{sub.endYm}終了</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#6b7280' }}>{fmt(sub.amount)}</div>
                  <button onClick={() => openEdit(sub)} style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', color: '#6b7280', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✎</button>
                  <button onClick={() => handleDelete(sub.id, sub.name)} style={{ width: 28, height: 28, border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', color: '#9ca3af', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
