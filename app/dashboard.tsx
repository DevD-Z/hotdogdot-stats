'use client';
import {useEffect,useState,useCallback} from 'react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Table,TableHeader,TableBody,TableHead,TableRow,TableCell} from '@/components/ui/table';
import {KeyRound,Package,RefreshCw,ShieldCheck,Timer,Activity,LogOut} from 'lucide-react';
type Session={session:string;startedAt:number;values:number[];updatedAt:number;license?:string};
type Data={sessions:Session[];latest?:Session|null;hasMore?:boolean};
const boxNames=['ไม้','เงิน','ทอง','รุ้ง','ไม่ทราบชนิด'];
const num=(n:number)=>n.toLocaleString('th-TH');
const duration=(n:number)=>`${Math.floor(n/60000)}:${String(Math.floor(n/1000)%60).padStart(2,'0')}`;
const date=(n:number)=>new Date(n).toLocaleString('th-TH',{dateStyle:'short',timeStyle:'short'});
export default function Dashboard({admin=false}:{admin?:boolean}){
 const [key,setKey]=useState(''),[data,setData]=useState<Data|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[offset,setOffset]=useState(0),[observedAt,setObservedAt]=useState(0);
 const refresh=useCallback(async()=>{setBusy(true);try{
  const r=await fetch(`/api/${admin?'admin':'stats'}?offset=${offset}`,{cache:'no-store'});
  if(r.status===401||(admin&&r.status===403)){setData(null);return;}
  if(!r.ok)throw new Error(r.status===403?'บัญชีนี้ไม่มีสิทธิ์แอดมิน':'โหลดสถิติไม่ได้ กรุณาลองอีกครั้ง');
  setData(await r.json());setObservedAt(Date.now());setError('');
 }catch(e){setError((e as Error).message);}finally{setBusy(false);}},[admin,offset]);
 useEffect(()=>{const first=setTimeout(()=>{void refresh();},0);const timer=setInterval(()=>{void refresh();},60000);return()=>{clearTimeout(first);clearInterval(timer);};},[refresh]);
 async function login(event:React.SyntheticEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setError('');try{
  const r=await fetch(admin?'/api/admin/login':'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});setKey('');
  if(!r.ok)throw new Error(r.status===403?'KEY ไม่ถูกต้อง หมดอายุ หรือไม่มีสิทธิ์':r.status===429?'ลองบ่อยเกินไป กรุณารอสักครู่':'ตรวจ KEY ไม่สำเร็จ กรุณาลองอีกครั้ง');
  setOffset(0);await refresh();
 }catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function logout(){await fetch(admin?'/api/admin/logout':'/api/logout',{method:'POST'});setData(null);setKey('');setOffset(0);}
 const latest=data?.latest,v=latest?.values;
 const totals=data?.sessions.reduce((sum,s)=>sum.map((n,i)=>n+(s.values[i+4]||0)),[0,0,0,0,0])||[0,0,0,0,0];
 return <main className="workspace">
  <header className="topbar"><Link className="brand" href="/"><Activity size={28}/><span>hotdogdot<small>CookieRun Stats</small></span></Link><nav><Link href={admin?'/':'/admin'}><ShieldCheck size={16}/>{admin?'สถิติส่วนตัว':'แอดมิน'}</Link>{data&&<Button variant="ghost" onClick={logout}><LogOut/>ออกจากระบบ</Button>}</nav></header>
  <section className="heading"><div><span className="eyebrow">{admin?'ADMIN OVERVIEW':'YOUR RUNS'}</span><h1>{admin?'สถิติทุก KEY':'สถิติการเล่นของคุณ'}</h1></div>{data&&<Button variant="outline" disabled={busy} onClick={refresh}><RefreshCw/>อัปเดต</Button>}</section>
  {error&&<p className="error" role="alert">{error}</p>}
  {!data?<section className="login-panel"><div className="login-icon"><KeyRound size={30}/></div><h2>{admin?'เข้าสู่ระบบแอดมิน':'ดูสถิติด้วย KEY'}</h2><p>{admin?'ใช้รหัสลับแอดมินที่ผู้ดูแลกำหนด':'ใช้ KEY เดียวกับแอป CookieRun เพื่อดูข้อมูลของคุณ'}</p><form onSubmit={login}><label htmlFor="key">{admin?'รหัสลับแอดมิน':'License KEY'}</label><Input id="key" type="password" required maxLength={512} value={key} onChange={e=>setKey(e.target.value)} autoComplete="off" placeholder={admin?'กรอกรหัสลับแอดมิน':'กรอก KEY ของคุณ'}/><Button type="submit" disabled={busy}>{busy?'กำลังตรวจสอบ…':admin?'เข้าสู่ระบบ':'ดูสถิติของฉัน'}</Button></form><small>{admin?'KEY สำหรับเล่นเกมใช้เข้าหน้านี้ไม่ได้':'ไม่บันทึก KEY ในเบราว์เซอร์หรือ URL'}</small></section>:<>
   {admin&&!data?<p className="empty">{busy?'กำลังโหลดสถิติ…':'ไม่สามารถเข้าถึงข้อมูลแอดมินได้'}</p>:<>
    <div className="metrics"><article><span><Activity/>รอบที่จบ {admin?'ในหน้านี้':'ในเซสชันล่าสุด'}</span><strong>{num(admin?data!.sessions.reduce((n,s)=>n+s.values[1],0):v?.[1]||0)}</strong></article><article><span><Package/>กล่องรวมในหน้านี้</span><strong>{num(totals.reduce((a,b)=>a+b,0))}</strong></article><article><span><Timer/>{admin?'อัปเดตล่าสุด':'รอบปัจจุบัน / ล่าสุด'}</span><strong className="compact">{admin?(latest?date(latest.updatedAt*1000):'—'):v?duration(v[3]):'—'}</strong></article></div>
    {!admin&&latest&&<section className="run-strip"><span className={`dot ${observedAt/1000-latest.updatedAt>150?'stale':''}`}/><div><b>รอบที่ {v?.[0]} · {v?.[2]?'กำลังเล่น ณ เวลาที่ส่งข้อมูล':'จบรอบหรือไม่ได้เล่น'}</b><p>กล่องรอบนี้ {num(v!.slice(9,14).reduce((a,b)=>a+b,0))} ใบ · อัปเดต {date(latest.updatedAt*1000)}</p></div><small>ข้อมูลส่งประมาณทุก 60 วินาที</small></section>}
    <section className="box-section"><h2>Mystery Box <small>รวมเซสชันในหน้านี้</small></h2><div className="boxes">{boxNames.map((name,i)=><article key={name} className={`box box-${i}`}><Package/><span>{name}</span><strong>{num(totals[i])}</strong></article>)}</div></section>
    <section className="history"><h2>{admin?'KEY และเซสชันการเล่น':'ประวัติเซสชัน'}</h2>{!data?.sessions.length?<div className="empty"><Package size={32}/><h3>ยังไม่มีสถิติส่งเข้ามา</h3><p>เปิดแอปที่รองรับสถิติ แล้วเริ่มเล่น<br/>ข้อมูลจะแสดงหลังแอปส่งอัปเดตสำเร็จ</p></div>:<Table><TableHeader><TableRow>{admin&&<TableHead>รหัสทะเบียน KEY</TableHead>}<TableHead>เริ่มเซสชัน</TableHead><TableHead>รอบที่จบ</TableHead><TableHead>กล่อง</TableHead><TableHead>อัปเดตล่าสุด</TableHead></TableRow></TableHeader><TableBody>{data.sessions.map(s=><TableRow key={`${s.license||''}${s.session}`}>{admin&&<TableCell><code title={s.license}>{s.license?.slice(0,14)}…</code></TableCell>}<TableCell>{date(s.startedAt)}</TableCell><TableCell>{num(s.values[1])}</TableCell><TableCell>{num(s.values.slice(4,9).reduce((a,b)=>a+b,0))}</TableCell><TableCell>{date(s.updatedAt*1000)}</TableCell></TableRow>)}</TableBody></Table>}</section>
    <div className="paging"><Button variant="outline" disabled={busy||offset===0} onClick={()=>setOffset(Math.max(0,offset-50))}>ก่อนหน้า</Button><span>หน้า {offset/50+1}</span><Button variant="outline" disabled={busy||!data?.hasMore} onClick={()=>setOffset(offset+50)}>ถัดไป</Button></div>
   </>}
  </>}
  <footer>สถิติจากภาพที่แอปตรวจพบ · ไม่รวมข้อมูลที่ยังไม่ได้ส่ง · ไม่แสดง KEY จริง</footer>
 </main>;
}
