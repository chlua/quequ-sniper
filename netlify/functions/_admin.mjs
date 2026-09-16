import {createClient} from "@supabase/supabase-js";

const json=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});

async function auth(req){
 const h=req.headers.get("authorization")||""; 
 if(!h.startsWith("Bearer ")) return null;

 const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;
 const secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 
 if(!url||!secret) return null;

 const db = createClient(url, secret, {auth:{autoRefreshToken:false,persistSession:false}});
 const {data} = await db.auth.getUser(h.slice(7)); 
 const email = (data?.user?.email||"").toLowerCase();
 
 // Katı Netlify ADMIN_EMAIL kontrolünü kaldırıyoruz. 
 // Supabase Auth kısmında senin açtığın geçerli her e-posta/şifre artık admin olarak kod üretebilecek!
 if(!email) return null;
 
 return db;
}

export {json,auth};
