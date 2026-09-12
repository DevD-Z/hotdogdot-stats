import {json,sameOrigin,isAdmin} from '../../../server';
import {randomUUID} from 'node:crypto';

const LICENSEGATE_API = 'https://api.licensegate.io';
const API_KEY = process.env.LICENSEGATE_API_KEY || '6012d608-e322-4aca-8029-bc7c3fa220fb';

type RemoteKey = {
 id: number;
 active: boolean;
 licenseKey: string;
 name: string;
 notes: string;
 expirationDate: string | null;
 createdAt: string;
};

export async function GET(_request:Request){
 if(!await isAdmin())return json({error:'FORBIDDEN'},403);
 try{
  const r=await fetch(`${LICENSEGATE_API}/admin/licenses?take=100`,{
   headers:{'Authorization':API_KEY,'Content-Type':'application/json'},
   signal:AbortSignal.timeout(10000)
  });
  if(!r.ok)return json({error:'UPSTREAM_ERROR'},r.status);
  const data=await r.json();
  const licenses=((data.licenses||[]) as RemoteKey[]).sort((a,b)=>new Date(b.createdAt||0).getTime()-new Date(a.createdAt||0).getTime());
  return json({licenses,count:data.count||licenses.length});
 }catch{
  return json({error:'UNAVAILABLE'},503);
 }
}

export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'FORBIDDEN'},403);
 if(!await isAdmin())return json({error:'FORBIDDEN'},403);
 try{
  const body=await request.json();
  const key=(body.customKey||randomUUID()).trim();
  const name=(body.name||'CookieRun Bot Key').trim();
  const notes=(body.notes||'Created from Web Dashboard').trim();
  const days=Number(body.days)||30;
  
  // Future expiration date in ISO format
  const expDate=days<=0
   ? '2099-12-31T23:59:59.000Z'
   : new Date(Date.now()+days*86400000).toISOString();

  const payload={
   active:true,
   licenseKey:key,
   name,
   notes,
   ipLimit:2000000000,
   licenseScope:'cookierun-mobile-licensed',
   expirationDate:expDate,
   validationPoints:2000000000,
   validationLimit:2000000000,
   replenishAmount:2000000000,
   replenishInterval:'DAY'
  };

  const r=await fetch(`${LICENSEGATE_API}/admin/licenses`,{
   method:'POST',
   headers:{'Authorization':API_KEY,'Content-Type':'application/json'},
   body:JSON.stringify(payload),
   signal:AbortSignal.timeout(10000)
  });

  if(!r.ok){
   const err=await r.text();
   return json({error:'CREATE_FAILED',details:err},r.status);
  }

  const created=await r.json();
  return json({ok:true,license:created},201);
 }catch{
  return json({error:'BAD_REQUEST'},400);
 }
}

export async function DELETE(request:Request){
 if(!sameOrigin(request))return json({error:'FORBIDDEN'},403);
 if(!await isAdmin())return json({error:'FORBIDDEN'},403);
 try{
  const body=await request.json();
  const id=Number(body.id);
  if(!id)return json({error:'BAD_ID'},400);

  const r=await fetch(`${LICENSEGATE_API}/admin/licenses/${id}`,{
   method:'DELETE',
   headers:{'Authorization':API_KEY},
   signal:AbortSignal.timeout(10000)
  });

  if(!r.ok)return json({error:'DELETE_FAILED'},r.status);
  return json({ok:true});
 }catch{
  return json({error:'BAD_REQUEST'},400);
 }
}
