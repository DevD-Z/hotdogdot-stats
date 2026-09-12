import {bridge,json,sameOrigin} from '../../server';
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'FORBIDDEN'},403);
 try{
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'BAD_REQUEST'},400);
  const reader=request.body?.getReader();if(!reader)return json({error:'BAD_REQUEST'},400);
  let raw='';const decoder=new TextDecoder();let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2048){await reader.cancel();return json({error:'TOO_LARGE'},413);}raw+=decoder.decode(value,{stream:true});}
  raw+=decoder.decode();const {key}=JSON.parse(raw);
  if(typeof key!=='string'||!key.trim()||key.length>512)return json({error:'BAD_REQUEST'},400);
  const r=await bridge('login',request,{key:key.trim()});
  if(!r.ok)return json({error:'LOGIN_FAILED'},r.status);
  const data=await r.json() as {token:string};
  return json({ok:true},200,{'Set-Cookie':`__Host-crstats=${data.token}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=300`});
 }catch{return json({error:'UNAVAILABLE'},503);}
}
