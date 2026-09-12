import {json,sameOrigin} from '../../../server';
import {ADMIN_COOKIE} from '../../../../lib/admin-session';
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'FORBIDDEN'},403);
 return json({ok:true},200,{'Set-Cookie':`${ADMIN_COOKIE}=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0`});
}
