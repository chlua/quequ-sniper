import {randomBytes} from "node:crypto";
import {auth,json} from "./_admin.mjs";

export default async req=>{
 if(req.method!=="POST") return json({message:"Method not allowed"},405);
 const db=await auth(req); 
 if(!db) return json({message:"Yetkisiz."},403);
 
 try{
  const body=await req.json().catch(()=>({})); 
  const count=Math.min(10,Math.max(1,Number(body.count)||1));
  const label=String(body.label||"genel").slice(0,60); 
  const rows=[];
  
  for(let i=0;i<count;i++){
    const raw=randomBytes(5).toString("hex").toUpperCase(); 
    // Formatı veritabanımızdaki access_codes tablosunun 'code' yapısına tam uyumlu hale getiriyoruz
    const code=raw.slice(0,4)+"-"+raw.slice(4,8)+"-"+raw.slice(8); 
    rows.push({code,label,is_used:false});
  }
  
  const {error}=await db.from("access_codes").insert(rows); 
  if(error) return json({message:error.message},400);
  
  return json({codes:rows.map(x=>x.code)});
 }catch(e){
  return json({message:"Kod üretilemedi."},500);
 }
}
