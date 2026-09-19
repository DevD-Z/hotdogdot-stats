import test from 'node:test';
import assert from 'node:assert/strict';
import {newerLatest} from '../lib/latest-round.ts';
const round=(revision=1)=>({session:'a',startedAt:100,updatedAt:200,revision,values:[1,0,1,0,0,0,0,0,0,0,0,0,0,0]});
test('same-second results update; duplicates, delayed full refreshes and malformed data do not regress latest',()=>{
 const start=round(),result={...round(2),values:[1,1,0,1000,1,0,0,0,0,1,0,0,0,0]};
 assert.equal(newerLatest(start,result),result);
 assert.equal(newerLatest(result,start),result);
 assert.equal(newerLatest(result,{...result}),result);
 assert.equal(newerLatest(result,{...round(3),values:[]}),result);
 assert.equal(newerLatest(result,null),result);
 assert.equal(newerLatest(null,start),start);
 const next={...round(),session:'b',startedAt:101};
 assert.equal(newerLatest(result,next),next);
 assert.equal(newerLatest(next,{...result,updatedAt:999}),next);
 assert.equal(newerLatest(result,{...round(),revision:undefined,updatedAt:999}),result);
});
