import {auth,json} from "./_admin.mjs";
export default async req=>{
 if(req.method!=="POST")return json({message:"Method not allowed"},405);
 const db=await auth(req); if(!db)return json({message:"Yetkisiz."},403);
 try{
  const {site}=await req.json(); if(!site||typeof site!=="object")return json({message:"Geçersiz içerik."},400);
  const clean={title:String(site.title||"").slice(0,120),subtitle:String(site.subtitle||"").slice(0,300),intro:String(site.intro||"").slice(0,1200),discord:String(site.discord||"").slice(0,100),
   heroImage:String(site.heroImage||"").slice(0,2000),
   downloads:Array.isArray(site.downloads)?site.downloads.slice(0,12).map(x=>({title:String(x.title||"").slice(0,100),desc:String(x.desc||"").slice(0,300),url:String(x.url||"").slice(0,2000)})):[],
   warnings:Array.isArray(site.warnings)?site.warnings.slice(0,12).map(x=>[String(x?.[0]||"").slice(0,120),String(x?.[1]||"").slice(0,800)]):[]};
  const {error}=await db.from("site_content").upsert({id:1,content:clean,updated_at:new Date().toISOString()},{onConflict:"id"}); if(error)return json({message:error.message},400);
  return json({message:"Site güncellendi.",site:clean});
 }catch(e){return json({message:"Kaydedilemedi."},500)}
}
