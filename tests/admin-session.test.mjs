import test from 'node:test';
import assert from 'node:assert/strict';
import {checkAdminKey,createAdminSession,verifyAdminSession} from '../lib/admin-session.ts';
test('admin access rejects game keys, forged cookies, expired sessions and rotated credentials',()=>{
 const old=process.env.ADMIN_ACCESS_KEY;
 try{
  process.env.ADMIN_ACCESS_KEY='test-only-admin-secret-'.repeat(3);
  assert.equal(checkAdminKey('game-license-key'),false);
  assert.equal(checkAdminKey(process.env.ADMIN_ACCESS_KEY),true);
  const token=createAdminSession(1000000);
  assert(verifyAdminSession(token,1000001));
  assert(!verifyAdminSession(token+'x',1000001));
  assert(!verifyAdminSession(token+'.extra',1000001));
  assert(!verifyAdminSession(token,4600000));
  process.env.ADMIN_ACCESS_KEY='different-test-only-secret-'.repeat(3);
  assert(!verifyAdminSession(token,1000001));
  delete process.env.ADMIN_ACCESS_KEY;
  assert(!verifyAdminSession(token,1000001));assert(!checkAdminKey(''));
 }finally{if(old===undefined)delete process.env.ADMIN_ACCESS_KEY;else process.env.ADMIN_ACCESS_KEY=old;}
});
