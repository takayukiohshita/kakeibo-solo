'use client';
import { useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { CATS, DEFAULT_BUDGETS, Transaction, Budget } from '@/lib/types';
import SummaryTab from './tabs/SummaryTab';
import InputTab from './tabs/InputTab';
import HistoryTab from './tabs/HistoryTab';
import BudgetTab from './tabs/BudgetTab';
import TrendTab from './tabs/TrendTab';
import ReportTab from './tabs/ReportTab';

const TABS = [
  { id: 'summary', label: '概要', icon: <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg> },
  { id: 'input',   label: '入力', icon: <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg> },
  { id: 'history', label: '履歴', icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> },
  { id: 'budget',  label: '予算', icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg> },
  { id: 'trend',   label: '推移', icon: <svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> },
  { id: 'report',  label: 'レポート', icon: <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
] as const;

export type TabId = typeof TABS[number]['id'];

export default function KakeiboApp() {
  const now = new Date();
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [cy, setCy] = useState(now.getFullYear());
  const [cm, setCm] = useState(now.getMonth() + 1);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const [txs, setTxs, txsLoaded] = useLocalStorage<Transaction[]>('kakeibo_txs', []);
  const [budgets, setBudgets, budgetsLoaded] = useLocalStorage<Budget>('kakeibo_budgets', DEFAULT_BUDGETS);

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

  const addTx = useCallback((tx: Omit<Transaction, 'id'>) => {
    setTxs(prev => {
      const maxId = prev.length ? Math.max(...prev.map(t => t.id)) : 0;
      return [...prev, { ...tx, id: maxId + 1 }];
    });
    showToast('追加しました');
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

  const monthTxs = txs.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === cy && d.getMonth() + 1 === cm && !t.isIncome;
  });

  const shared = { cy, cm, moveMonth, monthTxs, txs, budgets, showToast };

  if (!txsLoaded || !budgetsLoaded) return null;

  return (
    <div className="app">
      {/* Header */}
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

      {/* Nav */}
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

      {/* Pages */}
      <main className="pg">
        {activeTab === 'summary' && <SummaryTab {...shared} />}
        {activeTab === 'input'   && <InputTab {...shared} addTx={addTx} addTxBulk={addTxBulk} delTx={delTx} />}
        {activeTab === 'history' && <HistoryTab {...shared} delTx={delTx} />}
        {activeTab === 'budget'  && <BudgetTab {...shared} saveBudgets={saveBudgets} />}
        {activeTab === 'trend'   && <TrendTab {...shared} />}
        {activeTab === 'report'  && <ReportTab {...shared} />}
      </main>

      {/* Toast */}
      <div className={`toast${toastVisible ? ' show' : ''}`}>{toast}</div>
    </div>
  );
}
