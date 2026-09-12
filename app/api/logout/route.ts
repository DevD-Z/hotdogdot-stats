import {json,sameOrigin} from '../../server';
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'FORBIDDEN'},403);
 return json({ok:true},200,{'Set-Cookie':'__Host-crstats=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0'});
}
