import {createHash, timingSafeEqual} from 'node:crypto';
export const THEMES=['original','midnight','ocean','rose','forest'];
export const EMOTIONS=['happy','thoughtful','excited','sad','playful','angry','calm'];
export const EFFECTS=['confetti','sparkles','bounce','rain','snow','wind','pond','aurora','constellation','spotlight','surprise','clear'];
export const DELIVERIES=['neutral','warm','laugh','mock_cry','mock_grumpy','whisper','surprised'];
export const INTENTS=['exploring','comparing','evaluating','recruiting','technical','contact','unknown'];
export const ACTIVITY_TYPES=['navigate','open','filter','save','compare','dismiss','view'];
export type Performance={emotion:string;delivery:string};
export type Awareness={currentSection:string|null;openItem:string|null;visibleItems:string[];recentActions:{type:string;target?:string}[];intent:{label:string;confidence:string;evidence:string[]}};
function object(value:unknown,keys:string[],label:string):Record<string,unknown>{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error(`Invalid ${label}`);
 const result=value as Record<string,unknown>;
 if(Object.keys(result).some(key=>!keys.includes(key)))throw new Error(`Unknown ${label} fields`);
 return result;
}
function knownId(value:unknown,ids:string[]):string{
 if(typeof value!=='string'||value.length>80||!ids.includes(value))throw new Error('Unknown awareness item');
 return value;
}
function idList(value:unknown,ids:string[],limit:number):string[]{
 if(!Array.isArray(value)||value.length>limit)throw new Error('Invalid awareness item list');
 return [...new Set(value.map(item=>knownId(item,ids)))];
}
export function validateAwareness(value:unknown,ids:string[]):Awareness{
 const a=value===undefined?{}:object(value,['currentSection','openItem','visibleItems','recentActions','intent'],'awareness');
 const intent=a.intent===undefined?{}:object(a.intent,['label','confidence','evidence'],'intent');
 const label=intent.label??'unknown',confidence=intent.confidence??'low';
 if(typeof label!=='string'||!INTENTS.includes(label)||typeof confidence!=='string'||!['low','medium','high'].includes(confidence))throw new Error('Invalid awareness intent');
 const recent=a.recentActions??[];
 if(!Array.isArray(recent)||recent.length>8)throw new Error('Invalid recent activity list');
 return {
  currentSection:a.currentSection==null?null:knownId(a.currentSection,ids),
  openItem:a.openItem==null?null:knownId(a.openItem,ids),
  visibleItems:idList(a.visibleItems??[],ids,8),
  recentActions:recent.map(item=>{
   const action=object(item,['type','target'],'recent activity');
   if(typeof action.type!=='string'||!ACTIVITY_TYPES.includes(action.type))throw new Error('Invalid activity type');
   return {type:action.type,...(action.target===undefined?{}:{target:knownId(action.target,ids)})};
  }),
  intent:{label,confidence,evidence:idList(intent.evidence??[],ids,4)},
 };
}
export function sanitizeGuideState(value:unknown,ids:string[]):Record<string,string|string[]>{
 if(!value||typeof value!=='object'||Array.isArray(value))return {};
 const input=value as Record<string,unknown>,result:Record<string,string|string[]>={};
 for(const key of ['section','view'])if(typeof input[key]==='string'&&ids.includes(input[key]))result[key]=input[key];
 if(typeof input.theme==='string'&&THEMES.includes(input.theme))result.theme=input.theme;
 if(typeof input.density==='string'&&['comfortable','compact'].includes(input.density))result.density=input.density;
 if(typeof input.category==='string'&&['All','Software','APIs','Compute','Equipment'].includes(input.category))result.category=input.category;
 for(const key of ['saved','compare','resources'])if(Array.isArray(input[key]))result[key]=input[key].filter((id:unknown):id is string=>typeof id==='string'&&id.length<=80&&ids.includes(id)).slice(0,8);
 return result;
}
export function validatePerformance(value:unknown):Performance|undefined{
 if(value===undefined)return undefined;
 const p=object(value,['emotion','delivery'],'performance');
 if(typeof p.emotion!=='string'||!EMOTIONS.includes(p.emotion)||typeof p.delivery!=='string'||!DELIVERIES.includes(p.delivery))throw new Error('Invalid performance');
 return {emotion:p.emotion,delivery:p.delivery};
}
export function validateGuideReply(value:unknown,ids:string[],mode:'visitor'|'proactive'='visitor'):{answer:string;actions:Action[];performance?:Performance}{
 if(mode==='proactive'){
  const silent={answer:'',actions:[]};
  try{
   const reply=object(value,['answer','actions','performance'],'guide response');
   if(typeof reply.answer!=='string')return silent;
   const answer=reply.answer.trim();
   if(!answer||answer.length>240||!answer.endsWith('?')||(answer.match(/\?/g)||[]).length!==1)return silent;
   // Validate the proposed batch, but never return any proactive page mutation.
   validateActions(reply.actions,ids);
   let performance:Performance|undefined;
   try{performance=validatePerformance(reply.performance);}catch{/* Omit unsupported unprompted expression. */}
   const safePerformance=performance&&['calm','thoughtful','happy','playful'].includes(performance.emotion)&&['neutral','warm'].includes(performance.delivery)?performance:undefined;
   return {answer,actions:[],...(safePerformance?{performance:safePerformance}:{})};
  }catch{return silent;}
 }
 const reply=object(value,['answer','actions','performance'],'guide response');
 if(typeof reply.answer!=='string'||!reply.answer.trim()||reply.answer.length>1800)throw new Error('The guide returned an incomplete answer. Please try a shorter question.');
 const actions=validateActions(reply.actions,ids),performance=validatePerformance(reply.performance);
 return {answer:reply.answer.trim(),actions,...(performance?{performance}:{})};
}
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
