import {requireChatGPTUser,chatGPTSignOutPath} from '../chatgpt-auth';
import {isAdmin} from '../server';
import Dashboard from '../dashboard';
export const dynamic='force-dynamic';
export default function AdminPage(){return <ProtectedAdmin/>;}
async function ProtectedAdmin(){
 await requireChatGPTUser('/admin');
 if(!await isAdmin())return <main className="workspace"><section className="login-panel"><h1>ไม่มีสิทธิ์แอดมิน</h1><p>เฉพาะบัญชีเจ้าของเว็บที่ได้รับอนุญาตเท่านั้น</p><a href={chatGPTSignOutPath('/admin')} target="_top">เปลี่ยนบัญชี</a></section></main>;
 return <Dashboard admin/>;
}
