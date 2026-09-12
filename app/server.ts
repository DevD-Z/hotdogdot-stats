const config=process.env;
import {cookies} from 'next/headers';
import {ADMIN_COOKIE,verifyAdminSession} from '../lib/admin-session';
export function json(data:unknown,status=200,extra:Record<string,string>={}){
 return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
}
export function sameOrigin(request:Request){return request.headers.get('Origin')===new URL(request.url).origin;}
export async function isAdmin(){
 return verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value||'');
}
export async function bridge(operation:'login'|'stats'|'admin',request:Request,body:Record<string,unknown>){
 if(!config.WEB_BRIDGE_SECRET||!config.LICENSE_BACKEND_URL)throw new Error('Not configured');
 const url=new URL(config.LICENSE_BACKEND_URL);if(url.protocol!=='https:')throw new Error('HTTPS required');
 // Never forward browser-supplied identity or authorization headers.
 const response=await fetch(new URL('/v1/web/'+operation,url),{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','Authorization':'Bearer '+config.WEB_BRIDGE_SECRET},body:JSON.stringify({...body,client:request.headers.get('cf-connecting-ip')||'site'}),signal:AbortSignal.timeout(12000)});
 return response;
}
export function token(request:Request){return request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('__Host-crstats='))?.slice(15)||'';}
export async function forward(operation:'stats'|'admin',request:Request){
 try{
  if(operation==='admin'&&!await isAdmin())return json({error:'FORBIDDEN'},403);
  if(operation==='stats'&&!token(request))return json({error:'UNAUTHORIZED'},401);
  const offset=Number(new URL(request.url).searchParams.get('offset')||0);
  const r=await bridge(operation,request,{token:token(request),offset});
  return json(await r.json(),r.status);
 }catch{return json({error:'UNAVAILABLE'},503);}
}
