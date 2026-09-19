import test from 'node:test';
import assert from 'node:assert/strict';
const origin=process.env.TEST_ORIGIN||'http://localhost:3000';
test('anonymous visitor cannot read private statistics',async()=>{
 const r=await fetch(origin+'/api/stats');assert.equal(r.status,401);assert.match(r.headers.get('cache-control'),/no-store/);
 const latest=await fetch(origin+'/api/stats?latest=1');assert.equal(latest.status,401);assert.match(latest.headers.get('cache-control'),/no-store/);
});
test('anonymous visitor cannot read administrator statistics',async()=>{
 const r=await fetch(origin+'/api/admin');assert.equal(r.status,403);
 assert.equal((await fetch(origin+'/api/admin?latest=1')).status,403);
});
test('cross-origin login and logout are rejected',async()=>{
 for(const route of ['login','logout']){
  const r=await fetch(origin+'/api/'+route,{method:'POST',headers:{Origin:'https://untrusted.example','Content-Type':'application/json'},body:'{}'});
  assert.equal(r.status,403);
 }
});
test('oversized and empty login requests are rejected before backend verification',async()=>{
 for(const [body,status] of [[JSON.stringify({key:'x'.repeat(3000)}),413],[JSON.stringify({key:''}),400]]){
  const r=await fetch(origin+'/api/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body});assert.equal(r.status,status);
 }
});

test('anonymous visitor cannot access key management',async()=>{
 const r1=await fetch(origin+'/api/admin/keys');assert.equal(r1.status,403);
 const r2=await fetch(origin+'/api/admin/keys',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'});assert.equal(r2.status,403);
 const r3=await fetch(origin+'/api/admin/keys',{method:'DELETE',headers:{Origin:origin,'Content-Type':'application/json'},body:'{}'});assert.equal(r3.status,403);
});
