'use client';
import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CATS, DEFAULT_BUDGETS, Transaction, Budget, Subscription } from '@/lib/types';
import SummaryTab from './tabs/SummaryTab';
import InputTab from './tabs/InputTab';
import HistoryTab from './tabs/HistoryTab';
import BudgetTab from './tabs/BudgetTab';
import TrendTab from './tabs/TrendTab';
import ReportTab from './tabs/ReportTab';
import SubscriptionTab from './tabs/SubscriptionTab';

const TABS = [
  { id: 'summary',      label: '概要',     icon: <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg> },
  { id: 'input',        label: '入力',     icon: <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg> },
  { id: 'subscription', label: 'サブスク', icon: <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
  { id: 'history',      label: '履歴',     icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
  { id: 'budget',       label: '予算',     icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
  { id: 'trend',        label: '推移',     icon: <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
  { id: 'report',       label: 'レポート', icon: <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
] as const;

export type TabId = typeof TABS[number]['id'];
type SharedBurden = Record<string, number>;

// サブスクが対象月に有効かチェック
function isSubActive(sub: Subscription, ym: string): boolean {
  if (sub.startYm > ym) return false;
  if (sub.endYm && sub.endYm < ym) return false;
  return true;
}

// 年月文字列を生成 "2026-05"
function toYm(y: number, m: number) {
  return `${y}-${String(m).padStart(2, '0')}`;
}

export default function KakeiboApp() {
  const now = new Date();
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [cy, setCy] = useState(now.getFullYear());
  const [cm, setCm] = useState(now.getMonth() + 1);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const [txs, setTxs, txsLoaded] = useLocalStorage<Transaction[]>('kakeibo_txs', []);
  const [budgets, setBudgets, budgetsLoaded] = useLocalStorage<Budget>('kakeibo_budgets', DEFAULT_BUDGETS);
  const [sharedBurden, setSharedBurden, burdenLoaded] = useLocalStorage<SharedBurden>('kakeibo_shared_burden', {});
  const [subscriptions, setSubscriptions, subsLoaded] = useLocalStorage<Subscription[]>('kakeibo_subscriptions', []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2200);
  }, []);

  const moveMonth = useCallback((d: number) => {
    setCm(prev => {
      let m = prev + d;
      if (m > 12) { setCy(y => y + 1); return 1; }
      if (m < 1)  { setCy(y => y - 1); return 12; }
      return m;
    });
  }, []);

  // サブスクの自動生成（月が変わるたびに実行）
  useEffect(() => {
    if (!subsLoaded || !txsLoaded) return;
    const ym = toYm(cy, cm);
    setTxs(prev => {
      // 今月のサブスク自動生成済みIDを収集
      const existingSubIds = new Set(
        prev.filter(t => t.subscriptionId !== undefined && t.date.startsWith(ym.replace('-', '-'))).map(t => t.subscriptionId)
      );
      const toAdd: Transaction[] = [];
      const maxId = prev.length ? Math.max(...prev.map(t => t.id)) : 0;
      let nextId = maxId + 1;
      for (const sub of subscriptions) {
        if (!isSubActive(sub, ym)) continue;
        if (existingSubIds.has(sub.id)) continue;
        // 引き落とし日を設定
        const day = Math.min(sub.dayOfMonth, new Date(cy, cm, 0).getDate());
        const dateStr = `${ym}-${String(day).padStart(2, '0')}`;
        toAdd.push({
          id: nextId++,
          amount: sub.amount,
          memo: sub.name,
          cat: sub.cat,
          date: dateStr,
          subscriptionId: sub.id,
        });
      }
      return toAdd.length ? [...prev, ...toAdd] : prev;
    });
  }, [cy, cm, subscriptions, subsLoaded, txsLoaded, setTxs]);

  const addTx = useCallback((tx: Omit<Transaction, 'id'>) => {
    setTxs(prev => {
      const maxId = prev.length ? Math.max(...prev.map(t => t.id)) : 0;
      return [...prev, { ...tx, id: maxId + 1 }];
    });
    showToast(tx.isIncome ? '収入を追加しました' : '追加しました');
  }, [setTxs, showToast]);

  const addTxBulk = useCallback((items: Omit<Transaction, 'id'>[]) => {
    setTxs(prev => {
      const maxId = prev.length ? Math.max(...prev.map(t => t.id)) : 0;
      return [...prev, ...items.map((item, i) => ({ ...item, id: maxId + i + 1 }))];
    });
    showToast(`${items.length}件追加しました`);
  }, [setTxs, showToast]);

  const delTx = useCallback((id: number) => {
    setTxs(prev => prev.filter(t => t.id !== id));
    showToast('削除しました');
  }, [setTxs, showToast]);

  const saveBudgets = useCallback((b: Budget) => {
    setBudgets(b);
    showToast('予算を保存しました');
  }, [setBudgets, showToast]);

  const saveSharedBurden = useCallback((key: string, amount: number) => {
    setSharedBurden(prev => ({ ...prev, [key]: amount }));
    showToast('二人家計の負担額を保存しました');
  }, [setSharedBurden, showToast]);

  const addSubscription = useCallback((sub: Omit<Subscription, 'id'>) => {
    setSubscriptions(prev => {
      const maxId = prev.length ? Math.max(...prev.map(s => s.id)) : 0;
      return [...prev, { ...sub, id: maxId + 1 }];
    });
    showToast('サブスクを登録しました');
  }, [setSubscriptions, showToast]);

  const updateSubscription = useCallback((sub: Subscription) => {
    setSubscriptions(prev => prev.map(s => s.id === sub.id ? sub : s));
    // 変更があった月の自動生成済みTxを削除して再生成させる
    setTxs(prev => prev.filter(t => t.subscriptionId !== sub.id));
    showToast('サブスクを更新しました');
  }, [setSubscriptions, setTxs, showToast]);

  const deleteSubscription = useCallback((id: number) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
    setTxs(prev => prev.filter(t => t.subscriptionId !== id));
    showToast('サブスクを削除しました');
  }, [setSubscriptions, setTxs, showToast]);

  const monthTxs = txs.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === cy && d.getMonth() + 1 === cm && !t.isIncome;
  });

  const burdenKey = toYm(cy, cm);
  const shared = { cy, cm, moveMonth, monthTxs, txs, budgets, showToast, delTx, sharedBurden, burdenKey, saveSharedBurden };

  if (!txsLoaded || !budgetsLoaded || !burdenLoaded || !subsLoaded) return null;

  return (
    <div className="app">
      <header className="hdr">
        <div className="hdr-logo">
          <div className="hdr-icon">
            <svg viewBox="0 0 24 24">
              <rect x="3" y="3" width="8" height="8" rx="1"/>
              <rect x="13" y="3" width="8" height="8" rx="1"/>
              <rect x="3" y="13" width="8" height="8" rx="1"/>
              <rect x="13" y="13" width="8" height="8" rx="1"/>
            </svg>
          </div>
          <span className="hdr-title">家計ノート</span>
        </div>
        <div className="solo-badge">ひとり暮らし</div>
      </header>

      <nav className="nav">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`nv${activeTab === tab.id ? ' on' : ''}`}
            onClick={() => { setActiveTab(tab.id); window.scrollTo(0, 0); }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="pg">
        {activeTab === 'summary'      && <SummaryTab {...shared} />}
        {activeTab === 'input'        && <InputTab {...shared} addTx={addTx} addTxBulk={addTxBulk} />}
        {activeTab === 'subscription' && <SubscriptionTab subscriptions={subscriptions} addSubscription={addSubscription} updateSubscription={updateSubscription} deleteSubscription={deleteSubscription} showToast={showToast} />}
        {activeTab === 'history'      && <HistoryTab {...shared} />}
        {activeTab === 'budget'       && <BudgetTab {...shared} saveBudgets={saveBudgets} />}
        {activeTab === 'trend'        && <TrendTab {...shared} />}
        {activeTab === 'report'       && <ReportTab {...shared} />}
      </main>

      <div className={`toast${toastVisible ? ' show' : ''}`}>{toast}</div>
    </div>
  );
}
