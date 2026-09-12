import {createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
export const ADMIN_COOKIE='__Host-cradmin';
const lifetime=3600;
function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
function secret(){const value=process.env.ADMIN_ACCESS_KEY||'';return value.length>=40?value:'';}
export function checkAdminKey(entered:unknown){const expected=secret();return !!expected&&typeof entered==='string'&&entered.length<=512&&equal(entered,expected);}
function signature(payload:string,key:string){return createHmac('sha256',key).update('hotdogdot-admin-session:'+payload).digest('base64url');}
export function createAdminSession(now=Date.now()){
 const key=secret();if(!key)throw new Error('Admin is not configured');
 const payload=Buffer.from(JSON.stringify({scope:'admin',exp:Math.floor(now/1000)+lifetime,nonce:randomBytes(16).toString('hex')})).toString('base64url');
 return payload+'.'+signature(payload,key);
}
export function verifyAdminSession(value:string,now=Date.now()){
 try{
  const key=secret();if(!key||value.length>2048)return false;
  const [payload,sig,...extra]=value.split('.');if(!payload||!sig||extra.length||!equal(sig,signature(payload,key)))return false;
  const data=JSON.parse(Buffer.from(payload,'base64url').toString('utf8'));
  const time=Math.floor(now/1000);return data.scope==='admin'&&Number.isInteger(data.exp)&&data.exp>time&&data.exp<=time+lifetime;
 }catch{return false;}
}
