'use client';
import {useEffect,useState,useCallback,useRef} from 'react';
import {newerLatest,type Session} from '../lib/latest-round';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Table,TableHeader,TableBody,TableHead,TableRow,TableCell} from '@/components/ui/table';
import {KeyRound,Package,RefreshCw,ShieldCheck,Timer,Activity,LogOut,Plus,Trash2,Copy,Check,Key} from 'lucide-react';

type Data={sessions:Session[];latest?:Session|null;hasMore?:boolean};
type LicenseKeyItem={id:number;active:boolean;licenseKey:string;name:string;notes:string;expirationDate:string|null;createdAt:string};

const boxNames=['ไม้','เงิน','ทอง','รุ้ง','ไม่ทราบชนิด'];
const num=(n:number)=>n.toLocaleString('th-TH');
const duration=(n:number)=>`${Math.floor(n/60000)}:${String(Math.floor(n/1000)%60).padStart(2,'0')}`;
const date=(n:number)=>new Date(n).toLocaleString('th-TH',{dateStyle:'short',timeStyle:'short'});

export default function Dashboard({admin=false}:{admin?:boolean}){
 const [key,setKey]=useState(''),[data,setData]=useState<Data|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[offset,setOffset]=useState(0),[observedAt,setObservedAt]=useState(0);
 const activeRequest=useRef<AbortController|null>(null);
 const pendingRefresh=useRef(false);
 const generation=useRef(0);
 const cancelRefresh=useCallback(()=>{
  generation.current++;pendingRefresh.current=false;activeRequest.current?.abort();activeRequest.current=null;
 },[]);
 
 // Admin Key Management state
 const [keysList,setKeysList]=useState<LicenseKeyItem[]>([]);
 const [keysLoading,setKeysLoading]=useState(false);
 const [showKeyForm,setShowKeyForm]=useState(false);
 const [newKeyName,setNewKeyName]=useState('');
 const [newKeyNotes,setNewKeyNotes]=useState('');
 const [newKeyDays,setNewKeyDays]=useState(30);
 const [newCustomKey,setNewCustomKey]=useState('');
 const [createdKey,setCreatedKey]=useState<string|null>(null);
 const [copiedKey,setCopiedKey]=useState<string|null>(null);
 const [keyActionError,setKeyActionError]=useState('');

 const refresh=useCallback(async function refreshRequest(latestOnly=false){
  if(activeRequest.current){if(!latestOnly)pendingRefresh.current=true;return;}
  const controller=new AbortController(),epoch=generation.current;
  activeRequest.current=controller;
  if(!latestOnly)setBusy(true);
  try{
   const r=await fetch(`/api/${admin?'admin':'stats'}?${latestOnly?'latest=1':`offset=${offset}`}`,{cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(15000)])});
   if(epoch!==generation.current)return;
   if(r.status===401||(admin&&r.status===403)){setData(null);return;}
   if(!r.ok)throw new Error(r.status===403?'บัญชีนี้ไม่มีสิทธิ์แอดมิน':'โหลดสถิติไม่ได้ กรุณาลองอีกครั้ง');
   const incoming=await r.json();
   if(epoch!==generation.current)return;
   setData(previous=>{
    const latest=newerLatest(previous?.latest,incoming.latest);
    if(latestOnly)return previous&&latest!==previous.latest?{...previous,latest}:previous;
    return {...incoming,latest};
   });setObservedAt(Date.now());setError('');
  }catch(e){if(!controller.signal.aborted&&!latestOnly)setError((e as Error).message);}
  finally{if(activeRequest.current===controller){
   activeRequest.current=null;setBusy(false);
   if(pendingRefresh.current){pendingRefresh.current=false;void refreshRequest();}
  }}
 },[admin,offset]);

 const fetchKeys=useCallback(async()=>{
  if(!admin)return;
  setKeysLoading(true);
  try{
   const r=await fetch('/api/admin/keys',{cache:'no-store'});
   if(r.ok){
    const d=await r.json();
    setKeysList(d.licenses||[]);
   }
  }catch{}
  finally{setKeysLoading(false);}
 },[admin]);

 useEffect(()=>{
  const first=setTimeout(()=>{
   void refresh();
   if(admin)void fetchKeys();
  },0);
  const timer=setInterval(()=>{
   void refresh();
   if(admin)void fetchKeys();
  },60000);
  return()=>{clearTimeout(first);clearInterval(timer);cancelRefresh();};
 },[refresh,fetchKeys,admin,cancelRefresh]);

 const signedIn=data!==null;
 useEffect(()=>{
  if(!signedIn)return;
  let stopped=false,polling=false,timer:ReturnType<typeof setTimeout>;
  async function poll(){
   if(polling||stopped)return;
   polling=true;
   if(document.visibilityState==='visible')await refresh(true);
   polling=false;
   if(!stopped)timer=setTimeout(poll,2000);
  }
  function visible(){if(document.visibilityState==='visible'){clearTimeout(timer);void poll();}}
  timer=setTimeout(poll,0);
  document.addEventListener('visibilitychange',visible);
  return()=>{stopped=true;clearTimeout(timer);document.removeEventListener('visibilitychange',visible);};
 },[signedIn,refresh]);

 useEffect(()=>{
  if(data?.latest)console.debug('[stats-web] UI updated',data.latest.session,data.latest.revision??data.latest.updatedAt);
 },[data?.latest]);

 async function login(event:React.SyntheticEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError('');
  try{
   const r=await fetch(admin?'/api/admin/login':'/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});
   setKey('');
   if(!r.ok)throw new Error(r.status===403?'KEY ไม่ถูกต้อง หมดอายุ หรือไม่มีสิทธิ์':r.status===429?'ลองบ่อยเกินไป กรุณารอสักครู่':'ตรวจ KEY ไม่สำเร็จ กรุณาลองอีกครั้ง');
   setOffset(0);
   await refresh();
   if(admin)await fetchKeys();
  }catch(e){setError((e as Error).message);}
  finally{setBusy(false);}
 }

 async function logout(){
  cancelRefresh();
  setData(null);
  await fetch(admin?'/api/admin/logout':'/api/logout',{method:'POST'});
  setData(null);setKey('');setOffset(0);setKeysList([]);setCreatedKey(null);
 }

 async function handleCreateKey(e:React.SyntheticEvent<HTMLFormElement>){
  e.preventDefault();
  setKeysLoading(true);
  setKeyActionError('');
  setCreatedKey(null);
  try{
   const r=await fetch('/api/admin/keys',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
     name:newKeyName,
     notes:newKeyNotes,
     days:newKeyDays,
     customKey:newCustomKey
    })
   });
   if(!r.ok){
    const err=await r.json().catch(()=>({}));
    throw new Error(err.details||'สร้างคีย์ไม่สำเร็จ');
   }
   const res=await r.json();
   setCreatedKey(res.license.licenseKey);
   setNewKeyName('');
   setNewKeyNotes('');
   setNewCustomKey('');
   setShowKeyForm(false);
   await fetchKeys();
  }catch(e){
   setKeyActionError((e as Error).message);
  }finally{
   setKeysLoading(false);
  }
 }

 async function handleDeleteKey(id:number,keyText:string){
  if(!confirm(`ยืนยันการลบคีย์: ${keyText} ?\n(เมื่อลบแล้ว คีย์นี้จะไม่สามารถใช้ในแอปได้อีก)`))return;
  setKeysLoading(true);
  setKeyActionError('');
  try{
   const r=await fetch('/api/admin/keys',{
    method:'DELETE',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id})
   });
   if(!r.ok)throw new Error('ลบคีย์ไม่สำเร็จ');
   await fetchKeys();
  }catch(e){
   setKeyActionError((e as Error).message);
  }finally{
   setKeysLoading(false);
  }
 }

 function copyKey(text:string){
  void navigator.clipboard.writeText(text);
  setCopiedKey(text);
  setTimeout(()=>setCopiedKey(null),2000);
 }

 const latest=data?.latest,v=latest?.values;
 const totals=data?.sessions.reduce((sum,s)=>sum.map((n,i)=>n+(s.values[i+4]||0)),[0,0,0,0,0])||[0,0,0,0,0];

 return <main className="workspace">
  <header className="topbar">
   <Link className="brand" href="/"><Activity size={28}/><span>hotdogdot<small>CookieRun Stats</small></span></Link>
   <nav>
    <Link href={admin?'/':'/admin'}><ShieldCheck size={16}/>{admin?'สถิติส่วนตัว':'แอดมิน'}</Link>
    {data&&<Button variant="ghost" onClick={logout}><LogOut/>ออกจากระบบ</Button>}
   </nav>
  </header>
  
  <section className="heading">
   <div>
    <span className="eyebrow">{admin?'ADMIN OVERVIEW':'YOUR RUNS'}</span>
    <h1>{admin?'ระบบจัดการและสถิติทุก KEY':'สถิติการเล่นของคุณ'}</h1>
   </div>
   {data&&<Button variant="outline" disabled={busy||keysLoading} onClick={()=>{void refresh();if(admin)void fetchKeys();}}><RefreshCw/>อัปเดต</Button>}
  </section>

  {error&&<p className="error" role="alert">{error}</p>}

  {!data?<section className="login-panel">
   <div className="login-icon"><KeyRound size={30}/></div>
   <h2>{admin?'เข้าสู่ระบบแอดมิน':'ดูสถิติด้วย KEY'}</h2>
   <p>{admin?'ใช้รหัสลับแอดมินที่ผู้ดูแลกำหนด':'ใช้ KEY เดียวกับแอป CookieRun เพื่อดูข้อมูลของคุณ'}</p>
   <form onSubmit={login}>
    <label htmlFor="key">{admin?'รหัสลับแอดมิน':'License KEY'}</label>
    <Input id="key" type="password" required maxLength={512} value={key} onChange={e=>setKey(e.target.value)} autoComplete="off" placeholder={admin?'กรอกรหัสลับแอดมิน':'กรอก KEY ของคุณ'}/>
    <Button type="submit" disabled={busy}>{busy?'กำลังตรวจสอบ…':admin?'เข้าสู่ระบบ':'ดูสถิติของฉัน'}</Button>
   </form>
   <small>{admin?'KEY สำหรับเล่นเกมใช้เข้าหน้านี้ไม่ได้':'ไม่บันทึก KEY ในเบราว์เซอร์หรือ URL'}</small>
  </section>:<>
   {admin&&!data?<p className="empty">{busy?'กำลังโหลดสถิติ…':'ไม่สามารถเข้าถึงข้อมูลแอดมินได้'}</p>:<>
    
    {/* Admin Key Management Section */}
    {admin&&<section className="keys-manager">
     <div className="keys-header">
      <div>
       <h2>จัดการคีย์แอป (License Keys) <small>ทั้งหมด {keysList.length} คีย์</small></h2>
       <p className="subtext">สร้างคีย์ใหม่ให้ผู้ใช้งาน หรือลบคีย์ที่ไม่ต้องการ</p>
      </div>
      <Button variant="default" onClick={()=>setShowKeyForm(!showKeyForm)} disabled={keysLoading}>
       <Plus size={16}/>{showKeyForm?'ปิดฟอร์ม':'สร้างคีย์ใหม่'}
      </Button>
     </div>

     {keyActionError&&<p className="error" role="alert">{keyActionError}</p>}

     {createdKey&&<div className="created-banner">
      <div>
       <span className="tag">สร้างคีย์สำเร็จ!</span>
       <strong>{createdKey}</strong>
      </div>
      <Button variant="outline" onClick={()=>copyKey(createdKey)}>
       {copiedKey===createdKey?<Check size={16}/>:<Copy size={16}/>}
       {copiedKey===createdKey?'คัดลอกแล้ว':'คัดลอก KEY'}
      </Button>
     </div>}

     {showKeyForm&&<form onSubmit={handleCreateKey} className="create-form">
      <h3>สร้าง License KEY ใหม่</h3>
      <div className="form-grid">
       <div>
        <label htmlFor="new-key-name">ชื่อคีย์ / ลูกค้า</label>
        <Input id="new-key-name" placeholder="เช่น สมชาย VIP, ลูกค้า Discord" value={newKeyName} onChange={e=>setNewKeyName(e.target.value)}/>
       </div>
       <div>
        <span style={{fontSize:'13px',color:'#a6b6cb',display:'block',marginBottom:'6px'}}>กำหนดอายุการใช้งาน</span>
        <div className="duration-buttons">
         {[
          {label:'7 วัน',val:7},
          {label:'30 วัน (1 เดือน)',val:30},
          {label:'90 วัน (3 เดือน)',val:90},
          {label:'365 วัน (1 ปี)',val:365},
          {label:'ตลอดชีพ',val:0}
         ].map(opt=>(
          <Button key={opt.val} type="button" variant={newKeyDays===opt.val?'default':'outline'} onClick={()=>setNewKeyDays(opt.val)} className="dur-btn">
           {opt.label}
          </Button>
         ))}
        </div>
       </div>
       <div>
        <label htmlFor="new-key-custom">รหัส KEY ที่ต้องการ (เว้นว่างไว้เพื่อให้ระบบสุ่ม UUID ให้อัตโนมัติ)</label>
        <Input id="new-key-custom" placeholder="เว้นว่างไว้เพื่อสุ่มคีย์อัตโนมัติ" value={newCustomKey} onChange={e=>setNewCustomKey(e.target.value)}/>
       </div>
       <div>
        <label htmlFor="new-key-notes">หมายเหตุ</label>
        <Input id="new-key-notes" placeholder="บันทึกช่วยจำสำหรับแอดมิน" value={newKeyNotes} onChange={e=>setNewKeyNotes(e.target.value)}/>
       </div>
      </div>
      <div className="form-actions">
       <Button type="submit" disabled={keysLoading}>{keysLoading?'กำลังสร้าง…':'ยืนยันสร้างคีย์'}</Button>
       <Button type="button" variant="ghost" onClick={()=>setShowKeyForm(false)}>ยกเลิก</Button>
      </div>
     </form>}

     <div className="keys-table-container">
      {!keysList.length?<div className="empty"><Key size={32}/><h3>ยังไม่มีคีย์ในระบบ</h3></div>:<Table>
       <TableHeader>
        <TableRow>
         <TableHead>License KEY</TableHead>
         <TableHead>ชื่อ / ลูกค้า</TableHead>
         <TableHead>วันหมดอายุ</TableHead>
         <TableHead>สถานะ</TableHead>
         <TableHead>สร้างเมื่อ</TableHead>
         <TableHead style={{textAlign:'right'}}>จัดการ</TableHead>
        </TableRow>
       </TableHeader>
       <TableBody>
        {keysList.map(item=>{
         const isExpired=item.expirationDate&&new Date(item.expirationDate).getTime()<observedAt;
         const isLifetime=!item.expirationDate||new Date(item.expirationDate).getFullYear()>=2099;
         return <TableRow key={item.id}>
          <TableCell>
           <div className="key-cell">
            <code>{item.licenseKey}</code>
            <button type="button" className="icon-copy" title="คัดลอก KEY" onClick={()=>copyKey(item.licenseKey)}>
             {copiedKey===item.licenseKey?<Check size={14} color="#41dcc3"/>:<Copy size={14}/>}
            </button>
           </div>
          </TableCell>
          <TableCell>
           <b>{item.name||'—'}</b>
           {item.notes&&<small style={{display:'block',color:'#8194ad'}}>{item.notes}</small>}
          </TableCell>
          <TableCell>
           {isLifetime?'ตลอดชีพ':new Date(item.expirationDate!).toLocaleDateString('th-TH')}
          </TableCell>
          <TableCell>
           <span className={`status-badge ${isExpired?'expired':item.active?'active':'inactive'}`}>
            {isExpired?'หมดอายุ':item.active?'ใช้งานได้':'ปิดใช้งาน'}
           </span>
          </TableCell>
          <TableCell>
           {new Date(item.createdAt).toLocaleDateString('th-TH')}
          </TableCell>
          <TableCell style={{textAlign:'right'}}>
           <Button variant="ghost" size="sm" className="btn-delete" title="ลบคีย์นี้" disabled={keysLoading} onClick={()=>handleDeleteKey(item.id,item.licenseKey)}>
            <Trash2 size={16}/>
           </Button>
          </TableCell>
         </TableRow>;
        })}
       </TableBody>
      </Table>}
     </div>
    </section>}

    <div className="metrics">
     <article><span><Activity/>รอบที่จบ {admin?'ในหน้านี้':'ในเซสชันล่าสุด'}</span><strong>{num(admin?data!.sessions.reduce((n,s)=>n+s.values[1],0):v?.[1]||0)}</strong></article>
     <article><span><Package/>กล่องรวมในหน้านี้</span><strong>{num(totals.reduce((a,b)=>a+b,0))}</strong></article>
     <article><span><Timer/>{admin?'อัปเดตล่าสุด':'รอบปัจจุบัน / ล่าสุด'}</span><strong className="compact">{admin?(latest?date(latest.updatedAt*1000):'—'):v?duration(v[3]):'—'}</strong></article>
    </div>

    {!admin&&latest&&<section className="run-strip"><span className={`dot ${observedAt/1000-latest.updatedAt>150?'stale':''}`}/><div><b>รอบที่ {v?.[0]} · {v?.[2]?'กำลังเล่น ณ เวลาที่ส่งข้อมูล':'จบรอบหรือไม่ได้เล่น'}</b><p>กล่องรอบนี้ {num(v!.slice(9,14).reduce((a,b)=>a+b,0))} ใบ · อัปเดต {date(latest.updatedAt*1000)}</p></div><small>อัปเดตรอบล่าสุดอัตโนมัติ</small></section>}
    <section className="box-section"><h2>Mystery Box <small>รวมเซสชันในหน้านี้</small></h2><div className="boxes">{boxNames.map((name,i)=><article key={name} className={`box box-${i}`}><Package/><span>{name}</span><strong>{num(totals[i])}</strong></article>)}</div></section>
    
    <section className="history">
     <h2>{admin?'ประวัติเซสชันที่เชื่อมต่อ':'ประวัติเซสชัน'}</h2>
     {!data?.sessions.length?<div className="empty"><Package size={32}/><h3>ยังไม่มีสถิติส่งเข้ามา</h3><p>เปิดแอปที่รองรับสถิติ แล้วเริ่มเล่น<br/>ข้อมูลจะแสดงหลังแอปส่งอัปเดตสำเร็จ</p></div>:<Table>
      <TableHeader>
       <TableRow>
        {admin&&<TableHead>รหัสทะเบียน KEY</TableHead>}
        <TableHead>เริ่มเซสชัน</TableHead>
        <TableHead>รอบที่จบ</TableHead>
        <TableHead>กล่อง</TableHead>
        <TableHead>อัปเดตล่าสุด</TableHead>
       </TableRow>
      </TableHeader>
      <TableBody>
       {data.sessions.map(s=><TableRow key={`${s.license||''}${s.session}`}>
        {admin&&<TableCell><code title={s.license}>{s.license?.slice(0,14)}…</code></TableCell>}
        <TableCell>{date(s.startedAt)}</TableCell>
        <TableCell>{num(s.values[1])}</TableCell>
        <TableCell>{num(s.values.slice(4,9).reduce((a,b)=>a+b,0))}</TableCell>
        <TableCell>{date(s.updatedAt*1000)}</TableCell>
       </TableRow>)}
      </TableBody>
     </Table>}
    </section>

    <div className="paging">
     <Button variant="outline" disabled={busy||offset===0} onClick={()=>setOffset(Math.max(0,offset-50))}>ก่อนหน้า</Button>
     <span>หน้า {offset/50+1}</span>
     <Button variant="outline" disabled={busy||!data?.hasMore} onClick={()=>setOffset(offset+50)}>ถัดไป</Button>
    </div>
   </>}
  </>}
  <footer>สถิติจากภาพที่แอปตรวจพบ · ไม่รวมข้อมูลที่ยังไม่ได้ส่ง · ไม่แสดง KEY จริงในประวัติการเล่น</footer>
 </main>;
}
