import {createClient} from "@supabase/supabase-js";
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
export default async req=>{
 if(req.method!=="POST")return json({message:"Method not allowed"},405);
 try{
  const {code}=await req.json(); const clean=String(code||"").trim().toUpperCase();
  if(!clean)return json({message:"Kod girmen gerekiyor."},400);
  const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL, secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!secret)return json({message:"Sunucu bağlantısı eksik."},500);
  const db=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data,error}=await db.rpc("consume_access_code",{p_code:clean});
  if(error)return json({message:"Kod sistemi henüz kurulmamış veya veritabanı ayarı eksik."},500);
  if(!data?.ok)return json({message:data?.message||"Kod geçersiz veya daha önce kullanılmış."},400);
  return json({ok:true});
 }catch(e){return json({message:"İşlem sırasında hata oluştu."},500)}
}
