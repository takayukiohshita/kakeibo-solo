'use client';
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import MonthRow from '../MonthRow';
import { Transaction, Budget, CATS, HIST_DATA, fmt } from '@/lib/types';

Chart.register(...registerables);

type Props = { cy: number; cm: number; moveMonth: (d: number) => void; monthTxs: Transaction[]; txs: Transaction[]; budgets: Budget; };

export default function TrendTab({ cy, cm, moveMonth, monthTxs, budgets }: Props) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<Chart | null>(null);

  const curExp = monthTxs.reduce((s, t) => s + t.amount, 0);
  const tb = CATS.reduce((s, c) => s + (budgets[c.name] || 0), 0);
  const ymKey = `${cy}/${cm.toString().padStart(2, '0')}`;
  const data = [...HIST_DATA.filter(d => d.ym !== ymKey), { ym: ymKey, exp: curExp }].sort((a, b) => a.ym.localeCompare(b.ym));

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInst.current) { chartInst.current.destroy(); chartInst.current = null; }
    chartInst.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: data.map(d => d.ym),
        datasets: [
          { label: '実績', data: data.map(d => d.exp || null), borderColor: '#2563eb', backgroundColor: 'rgba(37,99,235,0.07)', tension: .35, pointRadius: 4, pointBackgroundColor: '#2563eb', fill: true, borderWidth: 2 },
          { label: '予算', data: data.map(() => tb), borderColor: '#9ca3af', borderDash: [6, 4], tension: 0, pointRadius: 0, fill: false, borderWidth: 1.5 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { ticks: { callback: (v) => `¥${Math.round(Number(v) / 10000)}万`, maxTicksLimit: 5 }, grid: { color: 'rgba(0,0,0,0.04)' } },
          x: { ticks: { autoSkip: true, maxTicksLimit: 9, maxRotation: 45, font: { size: 10 } }, grid: { display: false } },
        },
      },
    });
    return () => { chartInst.current?.destroy(); };
  }, [cy, cm, curExp, tb]);

  return (
    <>
      <MonthRow cy={cy} cm={cm} moveMonth={moveMonth} />

      <div className="sec">
        <div className="sec-hd">
          <span className="sec-title">月別支出の推移</span>
          <div className="trend-legend">
            <span className="tl-item"><div className="tl-line" style={{ background: '#2563eb' }} />実績</span>
            <span className="tl-item"><div className="tl-line" style={{ background: '#9ca3af', borderTop: '2px dashed #9ca3af', height: 0 }} />予算</span>
          </div>
        </div>
        <div style={{ position: 'relative', height: 200 }}>
          <canvas ref={chartRef} role="img" aria-label="月別支出推移グラフ" />
        </div>
      </div>

      <div className="sec">
        <div className="sec-hd"><span className="sec-title">月別サマリー</span></div>
        {[...data].filter(d => d.exp > 0).reverse().map(d => {
          const sav = tb - d.exp;
          return (
            <div key={d.ym} className="ms-row">
              <span className="ms-month">{d.ym}</span>
              <div className="ms-right">
                <div className="ms-amt">{fmt(d.exp)}</div>
                <div className={`ms-savings ${sav >= 0 ? 'grn' : 'red'}`}>{sav >= 0 ? `貯蓄 ${fmt(sav)}` : `超過 +${fmt(-sav)}`}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
