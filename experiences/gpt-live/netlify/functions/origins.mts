// Explicit deployment-owned origins only. The preview remains the watchdog
// destination; custom domains may call the same API without permitting outsiders.
export function isAllowedOrigin(origin:string|null,primary:string,additional=''):boolean {
 const origins=[primary,...additional.split(',').map(value=>value.trim()).filter(Boolean)];
 if(!origin||!origins.length)return false;
 try {
  if(origins.some(value=>{const url=new URL(value);return url.protocol!=='https:'||url.origin!==value;}))return false;
  return origins.includes(origin);
 }catch{return false;}
}
