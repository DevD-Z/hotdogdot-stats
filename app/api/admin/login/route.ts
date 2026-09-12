import {json,sameOrigin} from '../../../server';
import {ADMIN_COOKIE,checkAdminKey,createAdminSession} from '../../../../lib/admin-session';
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'FORBIDDEN'},403);
 if(!process.env.ADMIN_ACCESS_KEY||process.env.ADMIN_ACCESS_KEY.length<40)return json({error:'NOT_CONFIGURED'},503);
 if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'BAD_REQUEST'},400);
 try{
  const reader=request.body?.getReader();if(!reader)return json({error:'BAD_REQUEST'},400);
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const item=await reader.read();if(item.done)break;size+=item.value.length;if(size>2048){await reader.cancel();return json({error:'TOO_LARGE'},413);}chunks.push(item.value);}
  const data=JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if(!checkAdminKey(data.key))return json({error:'FORBIDDEN'},403);
  return json({ok:true},200,{'Set-Cookie':`${ADMIN_COOKIE}=${createAdminSession()}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=3600`});
 }catch{return json({error:'BAD_REQUEST'},400);}
}
