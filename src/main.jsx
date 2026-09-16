import React, {useEffect,useMemo,useState} from "react";
import {createRoot} from "react-dom/client";
import {createClient} from "@supabase/supabase-js";
import "./style.css";

const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb=url&&key?createClient(url,key):null;

const fallback={
 title:"QUEQu Sniper",
 subtitle:"Kitlere katılım sürecini daha pratik hale getiren topluluk projesi.",
 intro:"Onlarca farklı kit, farklı kurallar ve uzun bekleme süreleri. Burada proje hakkında bilgiler, indirme seçenekleri ve güncel bağlantılar tek yerde.",
 discord:"stsse",
 downloads:[
  {title:"🐍 Python Dosyası",desc:"Kaynak kodun tamamı • Kod incelemek / düzenlemek isteyenler",url:"#"},
  {title:"📁 Build Dosyaları",desc:"Derlenmiş ara dosyalar • Kendi EXE'ni üretmek isteyenler",url:"#"},
  {title:"💻 EXE Dosyası",desc:"Windows için hazır çalıştırılabilir • Direkt kullanmak isteyenler",url:"#"}
 ],
 warnings:[
  ["Discord ToS riski","Otomasyon, self-bot veya kullanıcı hesabını programatik olarak kontrol eden araçlar Discord kurallarına aykırı olabilir. Hesap kısıtlaması veya ban riski bulunabilir."],
  ["Sunucu kuralları","MCTiers, PVPTiers ve benzeri sunucuların kendi kuralları vardır. Otomasyon ilgili sunucunun kurallarına aykırı olabilir."],
  ["Hesap güvenliği","Üçüncü taraf dosyaları yalnızca güvendiğin kaynaktan indir. Kaynağı doğrulamadan çalıştırma."],
  ["Eğitim amacı","Proje Python, otomasyon mantığı ve yazılım geliştirme pratiği amacıyla paylaşılmaktadır. Kullanırken ilgili kurallara ve yasalara uy."]
 ]
};

function api(path,opts){return fetch("/api/"+path,{headers:{"Content-Type":"application/json",...(opts?.headers||{})},...opts})}
function useSite(){
 const [site,setSite]=useState(fallback),[loading,setLoading]=useState(true);
 useEffect(()=>{api("site-data").then(r=>r.ok?r.json():null).then(d=>{if(d?.site)setSite({...fallback,...d.site})}).catch(()=>{}).finally(()=>setLoading(false))},[]);
 return [site,setSite,loading];
}
function App(){
 const [site,setSite,loading]=useSite();
 const [gate,setGate]=useState(false),[admin,setAdmin]=useState(false),[notice,setNotice]=useState("");
 const [access,setAccess]=useState(localStorage.getItem("mc_access")==="1");
 const [code,setCode]=useState("");
 const [session,setSession]=useState(null);
 useEffect(()=>{sb?.auth.getSession().then(({data})=>setSession(data.session)); if(sb){const {data}=sb.auth.onAuthStateChange((_e,s)=>setSession(s));return()=>data.subscription.unsubscribe()}},[]);
 const submitCode=async e=>{e.preventDefault();setNotice("");const r=await api("redeem-code",{method:"POST",body:JSON.stringify({code})});const d=await r.json().catch(()=>({}));if(r.ok){sessionStorage.setItem("mc_access","1");setAccess(true);setGate(false);setCode("")}else setNotice(d.message||"Kod geçersiz.");};
 const logout=async()=>{await sb?.auth.signOut();setSession(null)};
 return <div className="app">
   <div className="noise"/><div className="orb o1"/><div className="orb o2"/><div className="orb o3"/>
   <header><div className="brand"><span className="logo">M</span><div><b>{site.title}</b><small>COMMUNITY PROJECT</small></div></div><button className="navbtn" onClick={()=>setGate(true)}>Giriş kodu</button></header>
   {!access ? <main className="locked">
      <div className="lockcard"><div className="lockicon">✦</div><span className="eyebrow">ÖZEL ERİŞİM</span><h1>Devam etmek için<br/><em>giriş kodunu</em> kullan.</h1><p>Size verilen tek kullanımlık kodu gir. Kod başarıyla kullanıldığında içerik açılır.</p><button className="bigbtn" onClick={()=>setGate(true)}>Giriş yap <span>→</span></button><div className="tiny">Kodlar tek kişiliktir ve bir kez kullanılabilir.</div></div>
   </main> : <main>
      <section className="hero"><div className="eyebrow">MCTIERS × PVPTIERS</div><h1>{site.subtitle}</h1><p>{site.intro}</p>{site.heroImage&&<img className="heroimage" src={site.heroImage} alt="" /> }<div className="chips"><span>✓ Açık kaynak</span><span>⚡ Pratik</span><span>◈ Topluluk</span></div></section>
      <section className="content">
        <div className="sectionhead"><span>01</span><div><h2>İndirme seçenekleri</h2><p>Proje dosyalarına ulaşmak için aşağıdaki bağlantıları kullan.</p></div></div>
        <div className="downloads">{site.downloads.map((x,i)=><a className="download" href={x.url||"#"} target={x.url?.startsWith("http")?"_blank":undefined} rel="noreferrer" key={i}><div><h3>{x.title}</h3><p>{x.desc}</p></div><span>↗</span></a>)}</div>
        <div className="contact"><div><span className="eyebrow">İLETİŞİM</span><h2>Dosyalar herkese açık değil.</h2><p>İndirme bağlantıları veya destek için Discord üzerinden ulaşabilirsin.</p></div><div className="discord">{site.discord}</div></div>
        <div className="sectionhead"><span>02</span><div><h2>Riskler & sorumluluk</h2><p>Kullanmadan önce bu maddeleri dikkatlice oku.</p></div></div>
        <div className="warnings">{site.warnings.map((w,i)=><article key={i}><span>0{i+1}</span><div><h3>{w[0]}</h3><p>{w[1]}</p></div></article>)}</div>
        <div className="footer">Eğitim ve kolaylık amaçlı topluluk projesi · © {new Date().getFullYear()}</div>
      </section>
   </main>}
   <button className="adminfab" onClick={()=>setAdmin(true)}>⚙ Admin</button>
   {gate&&<Gate onClose={()=>setGate(false)} code={code} setCode={setCode} submit={submitCode} notice={notice}/>}
   {admin&&<Admin session={session} setSession={setSession} close={()=>setAdmin(false)} site={site} setSite={setSite} logout={logout}/>}
 </div>
}

function Gate({onClose,code,setCode,submit,notice}){
 return <div className="backdrop"><div className="modal gate"><button className="x" onClick={onClose}>×</button><div className="modalmark">✦</div><span className="eyebrow">ERİŞİM KODU</span><h2>Giriş yap</h2><p>Tek kullanımlık kodunu aşağıya gir.</p><form onSubmit={submit}><input autoFocus value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="XXXX-XXXX" required/><button className="bigbtn">İçeri gir →</button></form>{notice&&<div className="error">{notice}</div>}</div></div>
}

function Admin({session,setSession,close,site,setSite,logout}){
 const [email,setEmail]=useState(""),[pass,setPass]=useState(""),[msg,setMsg]=useState(""),[tab,setTab]=useState("content");
 const [draft,setDraft]=useState(site);
 const [newCode,setNewCode]=useState(""),[generated,setGenerated]=useState("");
 const [newItem,setNewItem]=useState({title:"",desc:"",url:""});
 useEffect(()=>setDraft(site),[site]);
 async function login(e){e.preventDefault();setMsg("");if(!sb)return setMsg("Supabase bağlantısı eksik.");const {data,error}=await sb.auth.signInWithPassword({email,password:pass});if(error)setMsg(error.message);else{setSession(data.session);setPass("")}}
 async function save(){setMsg("");const token=session?.access_token;if(!token)return;const r=await api("admin/content",{method:"POST",headers:{Authorization:`Bearer ${token}`},body:JSON.stringify({site:draft})});const d=await r.json().catch(()=>({}));setMsg(d.message||"Kaydedildi.");if(r.ok)setSite(d.site||draft)}
 async function makeCode(){setMsg("");const token=session?.access_token;if(!token)return;const r=await api("admin/codes",{method:"POST",headers:{Authorization:`Bearer ${token}`},body:JSON.stringify({count:1,label:newCode||"genel"})});const d=await r.json().catch(()=>({}));if(r.ok){setGenerated(d.codes?.[0]||"");setNewCode("")}else setMsg(d.message||"Kod üretilemedi.")}
 if(!session)return <div className="backdrop"><div className="modal"><button className="x" onClick={close}>×</button><div className="modalmark">⚙</div><span className="eyebrow">YÖNETİCİ</span><h2>Admin paneli</h2><p>Yalnızca yetkili yönetici hesabı.</p><form onSubmit={login}><input type="email" placeholder="Admin e-posta" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Şifre" value={pass} onChange={e=>setPass(e.target.value)} required/><button className="bigbtn">Giriş yap →</button></form>{msg&&<div className="error">{msg}</div>}</div></div>;
 return <div className="backdrop"><div className="modal admin"><button className="x" onClick={close}>×</button><div className="adminhead"><div><span className="eyebrow">YÖNETİM</span><h2>Site paneli</h2></div><button className="logout" onClick={logout}>Çıkış</button></div><div className="tabs"><button className={tab==="content"?"on":""} onClick={()=>setTab("content")}>İçerik</button><button className={tab==="downloads"?"on":""} onClick={()=>setTab("downloads")}>İndirmeler</button><button className={tab==="codes"?"on":""} onClick={()=>setTab("codes")}>Kod üret</button></div>
 {tab==="content"&&<div className="editgrid"><label>Başlık<input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label><label>Alt başlık<textarea value={draft.subtitle} onChange={e=>setDraft({...draft,subtitle:e.target.value})}/></label><label>Giriş açıklaması<textarea value={draft.intro} onChange={e=>setDraft({...draft,intro:e.target.value})}/></label><label>Discord<input value={draft.discord} onChange={e=>setDraft({...draft,discord:e.target.value})}/></label><label className="wide">Görsel URL (isteğe bağlı)<input value={draft.heroImage||""} onChange={e=>setDraft({...draft,heroImage:e.target.value})} placeholder="https://.../gorsel.png"/></label><label className="wide">Risk maddeleri<textarea value={draft.warnings.map(x=>x.join(" — ")).join("\n")} onChange={e=>setDraft({...draft,warnings:e.target.value.split("\n").filter(Boolean).map(x=>{let a=x.split(" — ");return [a.shift(),a.join(" — ")]})})}/></label><button className="bigbtn wide" onClick={save}>Değişiklikleri kaydet</button></div>}
 {tab==="downloads"&&<div><div className="editgrid"><label>Yeni başlık<input value={newItem.title} onChange={e=>setNewItem({...newItem,title:e.target.value})}/></label><label>Açıklama<input value={newItem.desc} onChange={e=>setNewItem({...newItem,desc:e.target.value})}/></label><label className="wide">İndirme linki<input value={newItem.url} onChange={e=>setNewItem({...newItem,url:e.target.value})}/></label><button className="bigbtn wide" onClick={()=>{if(!newItem.title)return;setDraft({...draft,downloads:[...draft.downloads,newItem]});setNewItem({title:"",desc:"",url:""})}}>Ekle</button></div><div className="downloadlist">{draft.downloads.map((x,i)=><div className="row" key={i}><div><b>{x.title}</b><small>{x.url}</small></div><button onClick={()=>setDraft({...draft,downloads:draft.downloads.filter((_,j)=>j!==i)})}>Sil</button></div>)}<button className="bigbtn wide" onClick={save}>İndirmeleri kaydet</button></div></div>}
 {tab==="codes"&&<div className="codebox"><p>Yeni ziyaretçiye vereceğin tek kullanımlık erişim kodunu üret.</p><input placeholder="Etiket (ör. Enes)" value={newCode} onChange={e=>setNewCode(e.target.value)}/><button className="bigbtn wide" onClick={makeCode}>Kod üret</button>{generated&&<div className="generated"><small>BU KODU KOPYALA</small><strong>{generated}</strong><p>Bu kod yalnızca bir kez kullanılabilir.</p></div>}</div>}
 {msg&&<div className="success">{msg}</div>}</div></div>
}
createRoot(document.getElementById("root")).render(<App/>);
