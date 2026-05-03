'use client';
import { useState } from 'react';
import MonthRow from '../MonthRow';
import { CATS, Transaction, Budget, fmt, catMap } from '@/lib/types';

type Props = { cy: number; cm: number; moveMonth: (d: number) => void; monthTxs: Transaction[]; txs: Transaction[]; budgets: Budget; showToast: (msg: string) => void; };

export default function ReportTab({ cy, cm, moveMonth, monthTxs, budgets }: Props) {
  const [reportText, setReportText] = useState('');
  const [loading, setLoading] = useState(false);

  const exp = monthTxs.reduce((s, t) => s + t.amount, 0);
  const cm2 = catMap(monthTxs);
  const tb = CATS.reduce((s, c) => s + (budgets[c.name] || 0), 0);
  const diff = tb - exp;

  const genReport = async () => {
    setLoading(true);
    setReportText('AIレポートを生成中...');
    const catSummary = CATS.filter(c => cm2[c.name]).map(c => `${c.name}:${fmt(cm2[c.name])}(予算${fmt(budgets[c.name])})`).join('、');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: `あなたは家計アドバイザーです。以下のひとり暮らしの家計データを分析し、日本語で具体的なアドバイスを200字程度で提供してください。\n月：${cy}年${cm}月\n支出合計：${fmt(exp)}\n予算合計：${fmt(tb)}\n差分：${diff >= 0 ? '貯蓄' + fmt(diff) : '超過+' + fmt(-diff)}\nカテゴリ別：${catSummary}` }],
        }),
      });
      const d = await res.json();
      setReportText(d.content?.[0]?.text || 'レポートを生成できませんでした。');
    } catch {
      setReportText('AIレポート生成にはAnthropicのAPIキーが必要です。');
    }
    setLoading(false);
  };

  return (
    <>
      <MonthRow cy={cy} cm={cm} moveMonth={moveMonth} />

      <div className="sec">
        <div className="sec-hd">
          <span className="sec-title">AIファイナンスレポート</span>
          <button className="report-btn" onClick={genReport} disabled={loading}>
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            {loading ? '生成中...' : 'レポート生成'}
          </button>
        </div>
        {reportText ? (
          <div className="report-content">{reportText}</div>
        ) : (
          <div className="report-empty">
            <div className="report-empty-icon">
              <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div className="report-empty-txt">「レポート生成」でAIが予算対比を含め分析します</div>
          </div>
        )}
      </div>

      <div className="sec">
        <div className="sec-hd"><span className="sec-title">分析対象：{cy}年{cm}月</span></div>
        {CATS.map(c => (
          <div key={c.name} className="report-cat-row">
            <div className="report-cat-lft">
              <div className="cat-dot" style={{ background: c.color }} />
              {c.name}
            </div>
            <div>
              <span className="report-cat-amt">{cm2[c.name] ? fmt(cm2[c.name]) : '¥0'}</span>
              <span className="report-cat-bud"> / {fmt(budgets[c.name] || 0)}</span>
            </div>
          </div>
        ))}
        <div className="report-total">
          <span className="total-lbl">合計</span>
          <span>
            <span className="total-amt">{fmt(exp)}</span>
            <span style={{ fontSize: 12, color: diff >= 0 ? '#059669' : '#ef4444', marginLeft: 8 }}>
              {diff >= 0 ? `貯蓄 ${fmt(diff)}` : `超過 +${fmt(-diff)}`}
            </span>
          </span>
        </div>
      </div>
    </>
  );
}
