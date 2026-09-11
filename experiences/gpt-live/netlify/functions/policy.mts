import {createHash, timingSafeEqual} from 'node:crypto';
export const THEMES=['original','midnight','ocean','rose','forest'];
export const EMOTIONS=['happy','thoughtful','excited','sad','playful','angry','calm'];
export const EFFECTS=['confetti','sparkles','bounce','spotlight','clear'];
export type Action={type:string;target?:string;value?:string};
export function validateActions(input:unknown,ids:string[]):Action[]{
 if(!Array.isArray(input)||input.length>4) throw new Error('Invalid action list');
 return input.map((item:unknown)=>{
  if(!item||typeof item!=='object'||Array.isArray(item))throw new Error('Invalid action');
  const a=item as Record<string,unknown>;
  if(typeof a.type!=='string'||Object.keys(a).some(k=>!['type','target','value'].includes(k)))throw new Error('Unknown action fields');
  const value=typeof a.value==='string'?a.value:''; const target=typeof a.target==='string'?a.target:'';
  if(['navigate','highlight'].includes(a.type)&&ids.includes(target))return {type:a.type,target};
  if(a.type==='theme'&&THEMES.includes(value))return {type:a.type,value};
  if(a.type==='emotion'&&EMOTIONS.includes(value))return {type:a.type,value};
  if(a.type==='effect'&&EFFECTS.includes(value))return {type:a.type,value};
  if(a.type==='density'&&['comfortable','compact'].includes(value))return {type:a.type,value};
  if(a.type==='filter'&&typeof a.value==='string'&&value.length<=100)return {type:a.type,value};
  if(a.type==='rewrite'&&target==='hero'&&value.trim()&&value.length<=180)return {type:a.type,target,value};
  if(a.type==='reset')return {type:'reset'};
  throw new Error('Action is outside website permissions');
 });
}
export const hash=(value:string)=>createHash('sha256').update(value).digest('hex');
export function equal(a:string,b:string){return Buffer.byteLength(a)===Buffer.byteLength(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));}
export function withinBudget(slot:number,limit=20){return Number.isSafeInteger(limit)&&limit>0&&Number.isSafeInteger(slot)&&slot>=0&&slot<limit;}
