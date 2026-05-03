'use client';

type Props = { cy: number; cm: number; moveMonth: (d: number) => void; };

export default function MonthRow({ cy, cm, moveMonth }: Props) {
  return (
    <div className="month-row">
      <button className="marr" onClick={() => moveMonth(-1)}>‹</button>
      <span className="month-txt">{cy}年{cm}月</span>
      <button className="marr" onClick={() => moveMonth(1)}>›</button>
    </div>
  );
}
