'use client';
import MonthRow from '../MonthRow';
import { CATS, Transaction, Budget, fmt, catOf, catMap } from '@/lib/types';

type Props = { cy: number; cm: number; moveMonth: (d: number) => void; monthTxs: Transaction[]; txs: Transaction[]; budgets: Budget; };

export default function HistoryTab({ cy, cm, moveMonth, monthTxs }: Props) {
  const exp = monthTxs.reduce((s, t) => s + t.amount, 0);
  const cm2 = catMap(monthTxs);

  const first = new Date(cy, cm - 1, 1);
  const last = new Date(cy, cm, 0);
  const startDay = first.getDay();
  const byDay: Record<number, { total: number; cats: string[] }> = {};
  monthTxs.forEach(t => {
    const d = new Date(t.date).getDate();
    if (!byDay[d]) byDay[d] = { total: 0, cats: [] };
    byDay[d].total += t.amount;
    byDay[d].cats.push(catOf(t.cat).color);
  });
  const now = new Date();
  const isCur = now.getFullYear() === cy && now.getMonth() + 1 === cm;
  const todayD = now.getDate();

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < startDay; i++) cells.push(<td key={`e${i}`} />);
  for (let d = 1; d <= last.getDate(); d++) {
    const dow = (startDay + d - 1) % 7;
    const info = byDay[d];
    const cls = ['cal-day', dow === 0 ? 'sun' : dow === 6 ? 'sat' : '', isCur && d === todayD ? 'today-d' : '', info ? 'has-tx' : ''].filter(Boolean).join(' ');
    cells.push(
      <td key={d}>
        <div className="cal-cell">
          <div className={cls}>{d}</div>
          {info && <>
            <div className="cal-amt">{fmt(info.total)}</div>
            <div className="cal-dots">{info.cats.slice(0, 3).map((c, i) => <div key={i} className="cal-dot" style={{ background: c }} />)}</div>
          </>}
        </div>
      </td>
    );
    if (dow === 6 && d < last.getDate()) cells.push(<tr key={`r${d}`} />);
  }

  const rows: React.ReactNode[][] = [[]];
  cells.forEach(cell => {
    if ((cell as React.ReactElement).key?.toString().startsWith('r')) {
      rows.push([]);
    } else {
      rows[rows.length - 1].push(cell);
    }
  });

  return (
    <>
      <MonthRow cy={cy} cm={cm} moveMonth={moveMonth} />

      <div className="sec">
        <div className="sec-hd">
          <span className="sec-title">カレンダー</span>
          <span className="sec-note">今月合計 {fmt(exp)}</span>
        </div>
        <div className="cal-wrap">
          <table className="cal">
            <thead>
              <tr>
                {['日','月','火','水','木','金','土'].map((d, i) => (
                  <th key={d} className={i === 0 ? 'sun' : i === 6 ? 'sat' : ''}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const trs: React.ReactNode[] = [];
                let current: React.ReactNode[] = [];
                let dayNum = 1 - startDay;
                for (let week = 0; week < 6; week++) {
                  const tds: React.ReactNode[] = [];
                  for (let dow = 0; dow < 7; dow++) {
                    const d = dayNum;
                    if (d < 1 || d > last.getDate()) {
                      tds.push(<td key={`${week}-${dow}`} />);
                    } else {
                      const info = byDay[d];
                      const cls = ['cal-day', dow === 0 ? 'sun' : dow === 6 ? 'sat' : '', isCur && d === todayD ? 'today-d' : '', info ? 'has-tx' : ''].filter(Boolean).join(' ');
                      tds.push(
                        <td key={`${week}-${dow}`}>
                          <div className="cal-cell">
                            <div className={cls}>{d}</div>
                            {info && <>
                              <div className="cal-amt">{fmt(info.total)}</div>
                              <div className="cal-dots">{info.cats.slice(0, 3).map((c, i2) => <div key={i2} className="cal-dot" style={{ background: c }} />)}</div>
                            </>}
                          </div>
                        </td>
                      );
                    }
                    dayNum++;
                  }
                  if (dayNum - 7 <= last.getDate()) trs.push(<tr key={week}>{tds}</tr>);
                }
                return trs;
              })()}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sec">
        <div className="sec-hd"><span className="sec-title">カテゴリ別集計</span></div>
        {CATS.filter(c => cm2[c.name]).length === 0
          ? <div className="empty-msg">支出データなし</div>
          : CATS.filter(c => cm2[c.name]).map(c => {
            const sp = cm2[c.name];
            const pct = exp ? Math.min(100, Math.round(sp / exp * 100)) : 0;
            return (
              <div key={c.name} className="cat-total-row">
                <div className="cat-dot" style={{ background: c.color }} />
                <div className="cat-name">{c.name}</div>
                <div className="cat-total-bar">
                  <div className="bar-bg"><div className="bar-fill" style={{ width: `${pct}%`, background: c.color }} /></div>
                </div>
                <div className="cat-val">{fmt(sp)}</div>
              </div>
            );
          })}
        <div className="total-row">
          <span className="total-lbl">合計</span>
          <span className="total-amt">{fmt(exp)}</span>
        </div>
      </div>
    </>
  );
}
