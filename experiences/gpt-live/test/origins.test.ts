import assert from 'node:assert/strict';
import test from 'node:test';
import {isAllowedOrigin} from '../netlify/functions/origins.mjs';
const primary='https://shanto-portfolio-live.netlify.app';
const additional='https://shantomathew.com,https://www.shantomathew.com';
test('accepts the explicit portfolio preview and custom domains',()=>{
 for(const origin of [primary,...additional.split(',')])assert.equal(isAllowedOrigin(origin,primary,additional),true);
});
test('rejects missing, opaque, insecure, suffix and unrelated origins',()=>{
 for(const origin of [null,'null','http://shantomathew.com','https://shantomathew.com.evil.test','https://evil.test','https://shanto.mathew.com',primary+'/'])assert.equal(isAllowedOrigin(origin,primary,additional),false);
});
test('invalid deployment origin configuration fails closed',()=>{
 for(const extra of ['*','https://shantomathew.com/','https://user:pass@shantomathew.com','http://shantomathew.com','garbage'])assert.equal(isAllowedOrigin(primary,primary,extra),false);
 assert.equal(isAllowedOrigin(primary,primary),true);
});
