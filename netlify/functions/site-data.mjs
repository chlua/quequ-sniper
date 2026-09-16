import { createClient } from "@supabase/supabase-js";
const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
export default async ()=>{try{
 const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL, secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!secret)return json({site:null});
 const db=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
 const {data,error}=await db.from("site_content").select("content").eq("id",1).maybeSingle();
 if(error)return json({site:null});
 return json({site:data?.content||null});
}catch(e){return json({site:null})}}
