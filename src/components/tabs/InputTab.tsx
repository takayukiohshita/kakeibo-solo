'use client';
import { useState } from 'react';
import MonthRow from '../MonthRow';
import { CATS, Transaction, Budget, fmt, catOf, catMap } from '@/lib/types';

type Props = {
  cy: number; cm: number; moveMonth: (d: number) => void;
  monthTxs: Transaction[]; txs: Transaction[]; budgets: Budget;
  delTx: (id: number) => void;
};

export default function HistoryTab({ cy, cm, moveMonth, monthTxs, delTx }: Props) {
  const [openCat, setOpenCat] = useState<string | null>(null);
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
              <tr>{['日','月','火','水','木','金','土'].map((d,i)=><th key={d} className={i===0?'sun':i===6?'sat':''}>{d}</th>)}</tr>
            </thead>
            <tbody>
              {(()=>{
                const trs: React.ReactNode[]=[];
                let dayNum=1-startDay;
                for(let week=0;week<6;week++){
                  const tds: React.ReactNode[]=[];
                  for(let dow=0;dow<7;dow++){
                    const d=dayNum;
                    if(d<1||d>last.getDate()){tds.push(<td key={`${week}-${dow}`}/>);}
                    else{
                      const info=byDay[d];
                      const cls=['cal-day',dow===0?'sun':dow===6?'sat':'',isCur&&d===todayD?'today-d':'',info?'has-tx':''].filter(Boolean).join(' ');
                      tds.push(<td key={`${week}-${dow}`}><div className="cal-cell"><div className={cls}>{d}</div>{info&&<><div className="cal-amt">{fmt(info.total)}</div><div className="cal-dots">{info.cats.slice(0,3).map((c,i2)=><div key={i2} className="cal-dot" style={{background:c}}/>)}</div></>}</div></td>);
                    }
                    dayNum++;
                  }
                  if(dayNum-7<=last.getDate())trs.push(<tr key={week}>{tds}</tr>);
                }
                return trs;
              })()}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sec">
        <div className="sec-hd"><span className="sec-title">カテゴリ別集計</span><span className="sec-note">タップで内訳を表示</span></div>
        {CATS.filter(c=>cm2[c.name]).length===0
          ?<div className="empty-msg">支出データなし</div>
          :CATS.filter(c=>cm2[c.name]).map(c=>{
            const sp=cm2[c.name];
            const pct=exp?Math.min(100,Math.round(sp/exp*100)):0;
            const isOpen=openCat===c.name;
            const catTxs=[...monthTxs].filter(t=>t.cat===c.name).sort((a,b)=>b.date.localeCompare(a.date));
            return(
              <div key={c.name}>
                <div className="cat-total-row" style={{cursor:'pointer',userSelect:'none'}} onClick={()=>setOpenCat(isOpen?null:c.name)}>
                  <div className="cat-dot" style={{background:c.color}}/>
                  <div className="cat-name">{c.name}</div>
                  <div className="cat-total-bar"><div className="bar-bg"><div className="bar-fill" style={{width:`${pct}%`,background:c.color}}/></div></div>
                  <div className="cat-val">{fmt(sp)}</div>
                  <div style={{marginLeft:8,color:'#9ca3af',fontSize:11,transform:isOpen?'rotate(180deg)':'rotate(0deg)',transition:'transform .2s'}}>▼</div>
                </div>
                {isOpen&&(
                  <div style={{background:'#f9fafb',borderRadius:8,margin:'0 0 4px',padding:'4px 0',border:'1px solid #f3f4f6'}}>
                    {catTxs.map(t=>{
                      const d=new Date(t.date);
                      const ds=`${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')}`;
                      return(
                        <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 14px',borderBottom:'1px solid #f3f4f6'}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:600,color:'#1a1a2e',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.memo||t.cat}</div>
                            <div style={{fontSize:11,color:'#9ca3af',marginTop:1}}>{ds}</div>
                          </div>
                          <div style={{fontSize:13,fontWeight:700,color:'#1a1a2e',whiteSpace:'nowrap'}}>{fmt(t.amount)}</div>
                          <button
                            style={{width:28,height:28,border:'1px solid #e5e7eb',borderRadius:6,background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#9ca3af',fontSize:13,flexShrink:0,marginLeft:4}}
                            onClick={e=>{e.stopPropagation();if(confirm('この取引を削除しますか？'))delTx(t.id);}}
                          >✕</button>
                        </div>
                      );
                    })}
                    <div style={{padding:'8px 14px',fontSize:12,color:'#6b7280',textAlign:'right',fontWeight:600}}>小計 {fmt(sp)}</div>
                  </div>
                )}
              </div>
            );
          })}
        <div className="total-row"><span className="total-lbl">合計</span><span className="total-amt">{fmt(exp)}</span></div>
      </div>
    </>
  );
}
