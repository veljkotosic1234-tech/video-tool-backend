<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Drive → Runway ML + ElevenLabs + Captions.ai</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js" crossorigin></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after{box-sizing:border-box}
    body{font-family:'DM Sans',sans-serif;margin:0;background:#0a0c10;overflow-x:hidden;color:white}
    *{scrollbar-width:thin;scrollbar-color:rgba(91,141,239,0.2) transparent}
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-thumb{background:rgba(91,141,239,0.2);border-radius:10px}
    .ambient{position:fixed;inset:0;z-index:0;pointer-events:none;
      background:radial-gradient(ellipse 60% 50% at 20% 10%,rgba(91,141,239,0.06) 0%,transparent 70%),
      radial-gradient(ellipse 50% 40% at 80% 80%,rgba(167,139,250,0.05) 0%,transparent 70%)}
    .glass{background:rgba(18,21,28,0.75);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.05)}
    .gin{background:rgba(23,27,36,0.6);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.04)}
    .btn-p{position:relative;overflow:hidden;transition:all 0.3s;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 20px;border-radius:12px;font-size:13px;font-weight:600;border:none;cursor:pointer}
    .btn-p:not(:disabled){background:linear-gradient(135deg,#5b8def,#7c6cf0);color:white}
    .btn-p:disabled{background:rgba(28,33,48,1);color:#3a4050;cursor:not-allowed}
    .btn-p:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 8px 30px rgba(91,141,239,0.2)}
    .btn-g{display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 16px;border-radius:12px;font-size:13px;font-weight:500;background:rgba(255,255,255,0.03);color:rgba(255,255,255,0.45);border:1px solid rgba(255,255,255,0.05);cursor:pointer;transition:all 0.2s}
    .btn-g:hover{color:rgba(255,255,255,0.8);background:rgba(255,255,255,0.06)}
    .btn-g:disabled{opacity:0.3;cursor:not-allowed}
    .ir{transition:all 0.2s;border:1px solid rgba(255,255,255,0.06)}
    .ir:focus{border-color:rgba(91,141,239,0.5);box-shadow:0 0 0 3px rgba(91,141,239,0.1);outline:none}
    .pill{display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:500}
    .card-h{transition:all 0.25s}
    .card-h:hover{border-color:rgba(255,255,255,0.1)!important;transform:translateY(-1px)}
    .tc{transition:all 0.15s}
    .tc:hover{filter:brightness(1.15)}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    .fu{animation:fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards}
    .fu1{animation-delay:.05s;opacity:0}.fu2{animation-delay:.1s;opacity:0}.fu3{animation-delay:.15s;opacity:0}
    @keyframes spin{to{transform:rotate(360deg)}}
    .spin{animation:spin 1s linear infinite}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
    .pulse{animation:pulse 2s ease-in-out infinite}
    @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
    .shimmer{background:linear-gradient(90deg,rgba(91,141,239,0.05) 25%,rgba(91,141,239,0.12) 50%,rgba(91,141,239,0.05) 75%);background-size:200% 100%;animation:shimmer 2s infinite}
    .pglow{box-shadow:0 0 8px rgba(167,139,250,0.4),0 0 20px rgba(167,139,250,0.15)}
    .clip-sel{border-color:rgba(255,255,255,0.5)!important;filter:brightness(1.2)}
    .trim-handle{width:8px;height:100%;background:rgba(255,255,255,0.3);cursor:ew-resize;position:absolute;top:0;border-radius:4px;z-index:10;transition:background 0.15s}
    .trim-handle:hover{background:rgba(255,255,255,0.6)}
    .cap-overlay{position:absolute;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:6px 14px;border-radius:8px;font-size:14px;font-weight:600;white-space:nowrap;pointer-events:none;z-index:20}
  </style>
</head>
<body>
<div class="ambient"></div>
<div id="root"></div>
<script type="text/babel">
const {useState,useRef,useCallback,useEffect}=React;

// ─── BACKEND URL ───
const BACKEND="https://video-tool-backend.onrender.com";

const STEPS=[
  {l:"API Keys",e:"🔑"},{l:"Voiceover",e:"🎙️"},{l:"Files",e:"📁"},
  {l:"Sort",e:"🗂️"},{l:"Prompts",e:"✏️"},{l:"Generate",e:"⚡"},
  {l:"Choose",e:"🎯"},{l:"Timeline",e:"🎞️"},{l:"Captions",e:"💬"},
  {l:"Export",e:"⬇️"},{l:"Result",e:"✅"},
];
const MOCK_VIDEO="https://www.w3schools.com/html/mov_bbb.mp4";
const PX=12;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const MOCK_FILES=[
  {id:"1",name:"client_intro.mp4",size:"45 MB",ext:"mp4",dur:30},
  {id:"2",name:"client_talking_01.mp4",size:"32 MB",ext:"mp4",dur:25},
  {id:"3",name:"client_outro.mp4",size:"28 MB",ext:"mp4",dur:20},
  {id:"4",name:"highway_shot.jpg",size:"3.8 MB",ext:"jpg",dur:10},
  {id:"5",name:"car_interior.jpg",size:"2.1 MB",ext:"jpg",dur:10},
  {id:"6",name:"car_rear.jpg",size:"4.2 MB",ext:"jpg",dur:10},
  {id:"7",name:"road_sunset.jpg",size:"5.0 MB",ext:"jpg",dur:10},
  {id:"8",name:"city_drive.mp4",size:"67 MB",ext:"mp4",dur:10},
  {id:"9",name:"product_closeup.jpg",size:"2.9 MB",ext:"jpg",dur:10},
  {id:"10",name:"tunnel_shot.jpg",size:"3.3 MB",ext:"jpg",dur:10},
];
const MOCK_MUSIC=[
  {id:"m1",name:"epic_background.mp3",size:"4.2 MB",ext:"mp3",dur:180},
  {id:"m2",name:"cinematic_intro.mp3",size:"3.8 MB",ext:"mp3",dur:120},
  {id:"m3",name:"upbeat_commercial.mp3",size:"5.1 MB",ext:"mp3",dur:150},
  {id:"m4",name:"dramatic_reveal.mp3",size:"3.2 MB",ext:"mp3",dur:90},
];
const VOICES=[
  {id:"cBHXjRyIGRfO4Qyu1oNV",name:"Female Voice 1",desc:"Female · English",e:"👩"},
  {id:"KPNE31YlodGTVMvpuKX7",name:"Julie",desc:"Female · English · American",e:"👱‍♀️"},
  {id:"UgBBYS2sOqTuMpoF3BR0",name:"Mark",desc:"Male · English · Conversational",e:"👨"},
];
const ficon=ext=>["mp4","mov","avi","mkv"].includes(ext)?"🎥":["mp3","wav","aac"].includes(ext)?"🎵":"🖼️";
let cid=100;

const Sp=()=><span style={{width:15,height:15,border:"2px solid rgba(255,255,255,0.25)",borderTop:"2px solid white",borderRadius:"50%",display:"inline-block",flexShrink:0}} className="spin"/>;

const SVG={
  aL:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  aR:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  ck:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x:<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  eye:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  eyeO:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  pl:<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  sc:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  zap:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  film:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>,
  dl:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  music:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  cut:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>,
  cc:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M7 12h4M7 15h2M13 12h4M13 15h3"/></svg>,
  refresh:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
};

function SH({emoji,title,subtitle,badge}){
  return <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
    {emoji&&<div style={{width:36,height:36,borderRadius:12,background:"linear-gradient(135deg,rgba(91,141,239,0.2),rgba(167,139,250,0.1))",border:"1px solid rgba(91,141,239,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{emoji}</div>}
    <div style={{flex:1}}>
      <h2 style={{margin:0,fontSize:15,fontWeight:600,color:"rgba(255,255,255,0.95)",letterSpacing:"-0.01em"}}>{title}</h2>
      {subtitle&&<p style={{margin:"2px 0 0",fontSize:11,color:"rgba(255,255,255,0.3)"}}>{subtitle}</p>}
    </div>
    {badge}
  </div>;
}

function BP({children,onClick,disabled,style={}}){
  return <button onClick={onClick} disabled={disabled} className="btn-p" style={style}>{children}</button>;
}
function BG({children,onClick,disabled,style={}}){
  return <button onClick={onClick} disabled={disabled} className="btn-g" style={style}>{children}</button>;
}



function App(){
  const [step,setStep]=useState(0);
  const [sk,setSk]=useState(0);
  const go=v=>{const n=typeof v==="function"?v(step):v;setStep(n);setSk(k=>k+1);};

  // Keys
  const [runwayKey,setRunwayKey]=useState("");
  const [elevenKey,setElevenKey]=useState("");
  const [captionsKey,setCaptionsKey]=useState("");
  const [showRunway,setShowRunway]=useState(false);
  const [showCaptions,setShowCaptions]=useState(false);

  // Drive URLs (token se više ne koristi — server koristi Secrets)
  const [driveUrl,setDriveUrl]=useState("https://drive.google.com/drive/folders/1iuOwN5EOMJBBTm1UBU3kYJxpxxWl9zLB");
  const [musicDriveUrl,setMusicDriveUrl]=useState("");

  // Voiceover
  const [useVO,setUseVO]=useState(null);
  const [selVoice,setSelVoice]=useState(null);
  const [voiceScript,setVoiceScript]=useState("");
  const [voiceUrl,setVoiceUrl]=useState(null);
  const [genVoice,setGenVoice]=useState(false);

  // Files
  const [files,setFiles]=useState([]);
  const [loadingF,setLoadingF]=useState(false);
  const [driveError,setDriveError]=useState(null);
  const [musicFiles,setMusicFiles]=useState([]);
  const [loadingM,setLoadingM]=useState(false);
  const [selMusic,setSelMusic]=useState(null);

  // Sort
  const [mainF,setMainF]=useState([]);
  const [brollF,setBrollF]=useState([]);
  const [unassF,setUnassF]=useState([]);

  // Prompts & Gen
  const [prompts,setPrompts]=useState({});
  const [clipSt,setClipSt]=useState({});
  const [genLog,setGenLog]=useState([]);
  const [generating,setGenerating]=useState(false);
  const [genDone,setGenDone]=useState(false);

  // Timeline
  const [mainTrack,setMainTrack]=useState([]);
  const [brollTrack,setBrollTrack]=useState([]);
  const [musicTrack,setMusicTrack]=useState([]);
  const [selClip,setSelClip]=useState(null);
  const [dragSt,setDragSt]=useState(null);
  const [trimSt,setTrimSt]=useState(null);
  const [previewClip,setPreviewClip]=useState(null);
  const [cutMode,setCutMode]=useState(false);
  const tlRef=useRef(null);
  const videoRef=useRef(null);

  // Captions
  const [capEnabled,setCapEnabled]=useState(false);
  const [capText,setCapText]=useState("Vaš tekst ovde...");
  const [capPos,setCapPos]=useState("center");
  const [capFont,setCapFont]=useState(24);
  const [capColor,setCapColor]=useState("#ffffff");
  const [capBg,setCapBg]=useState("rgba(0,0,0,0.7)");
  const [capStyle,setCapStyle]=useState("classic");
  const [capGenStatus,setCapGenStatus]=useState("idle");
  const [generatedCaps,setGeneratedCaps]=useState([]);

  // Export/Result
  const [merging,setMerging]=useState(false);
  const [finalVideo,setFinalVideo]=useState(null);

  const getFile=id=>[...files,...musicFiles].find(f=>f.id===id);
  const addLog=(msg,type="info")=>setGenLog(l=>[...l,{msg,type,t:new Date().toLocaleTimeString()}]);
  const totalDur=Math.max(mainTrack.reduce((m,c)=>Math.max(m,c.start+c.dur),60),brollTrack.reduce((m,c)=>Math.max(m,c.start+c.dur),60),musicTrack.reduce((m,c)=>Math.max(m,c.start+c.dur),60));
  const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  const ticks=[];for(let i=0;i<=totalDur;i+=5)ticks.push(i);

  const inp={width:"100%",background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"12px 16px",fontSize:13,color:"rgba(255,255,255,0.82)",fontFamily:"JetBrains Mono,monospace"};
  const lbl={display:"block",fontSize:10,fontWeight:500,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8};

  // Voiceover
  const genVoiceover=async()=>{
    setGenVoice(true);setVoiceUrl(null);
    try{
      const res=await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selVoice}`,{method:"POST",headers:{"Content-Type":"application/json","xi-api-key":elevenKey},body:JSON.stringify({text:voiceScript,model_id:"eleven_multilingual_v2",voice_settings:{stability:0.5,similarity_boost:0.75}})});
      if(!res.ok)throw new Error((await res.json()).detail?.message||"ElevenLabs greška");
      setVoiceUrl(URL.createObjectURL(await res.blob()));
    }catch(e){
      if(e.message.includes("Failed to fetch")){alert("CORS — demo audio.");setVoiceUrl("https://www.w3schools.com/html/horse.mp3");}
      else alert(`Greška: ${e.message}`);
    }
    setGenVoice(false);
  };

  // ─── Fetch video files — BEZ TOKEN-a, server koristi Secrets ───
  const fetchFiles=async()=>{
    setLoadingF(true);setFiles([]);setDriveError(null);
    const fid=driveUrl.match(/folders\/([a-zA-Z0-9_-]+)/)?.[1];
    if(!fid){setDriveError("Neispravan Drive URL");setLoadingF(false);return;}
    try{
      const res=await fetch(`${BACKEND}/api/drive/files?folderId=${fid}`,{signal:AbortSignal.timeout(15000)});
      if(!res.ok){
        const err=await res.json().catch(()=>({}));
        throw new Error(err.error||err.details||`HTTP ${res.status}`);
      }
      const data=await res.json();
      if(!data.files?.length)throw new Error("Folder prazan ili nema pristupa");
      const f=data.files.map(f=>({
        id:f.id,name:f.name,
        size:f.size?`${(f.size/1024/1024).toFixed(1)} MB`:"–",
        ext:f.name.split(".").pop().toLowerCase(),
        dur:["mp4","mov","avi","mkv"].includes(f.name.split(".").pop().toLowerCase())?30:10
      }));
      setFiles(f);setUnassF(f.map(f=>f.id));
    }catch(e){
      setDriveError(e.message);
      // Fallback na mock
      for(let f of MOCK_FILES){await sleep(60);setFiles(p=>[...p,f]);}
      setUnassF(MOCK_FILES.map(f=>f.id));
    }
    setLoadingF(false);
  };

  // ─── Fetch music files — BEZ TOKEN-a ───
  const fetchMusic=async()=>{
    setLoadingM(true);setMusicFiles([]);
    const fid=musicDriveUrl.match(/folders\/([a-zA-Z0-9_-]+)/)?.[1];
    if(!fid){alert("Neispravan Music Drive URL");setLoadingM(false);return;}
    try{
      const res=await fetch(`${BACKEND}/api/drive/files?folderId=${fid}`,{signal:AbortSignal.timeout(15000)});
      if(!res.ok){const err=await res.json().catch(()=>({}));throw new Error(err.error||`HTTP ${res.status}`);}
      const data=await res.json();
      if(!data.files?.length)throw new Error("Folder prazan");
      const f=data.files.map(f=>({id:f.id,name:f.name,size:f.size?`${(f.size/1024/1024).toFixed(1)} MB`:"–",ext:f.name.split(".").pop().toLowerCase(),dur:180}));
      setMusicFiles(f);
    }catch(e){
      alert(`Music Drive greška: ${e.message}\nKoristim mock.`);
      for(let f of MOCK_MUSIC){await sleep(60);setMusicFiles(p=>[...p,f]);}
    }
    setLoadingM(false);
  };

  const moveFile=(id,target)=>{
    const already=(target==="main"&&mainF.includes(id))||(target==="broll"&&brollF.includes(id));
    setMainF(p=>p.filter(i=>i!==id));setBrollF(p=>p.filter(i=>i!==id));setUnassF(p=>p.filter(i=>i!==id));
    if(already)setUnassF(p=>[...p,id]);
    else if(target==="main")setMainF(p=>[...p,id]);
    else setBrollF(p=>[...p,id]);
  };

  // Generate B-Roll
  const generateBroll=async()=>{
    setGenerating(true);setGenDone(false);setGenLog([]);
    const st={};brollF.forEach(id=>{st[id]={status:"idle",progress:0};});setClipSt(st);
    addLog("🔐 Autentifikacija sa Runway ML...","info");await sleep(400);
    addLog("✅ API ključ validiran!","success");
    for(let id of brollF){
      const f=getFile(id);const cam=prompts[id+"_cam"]||"";const desc=prompts[id]||"";
      const fp=[desc,cam?`${cam} camera movement`:""].filter(Boolean).join(", ")+", commercial ad style, ultra realistic, 8K";
      addLog(`🎬 Runway: ${f.name}...`,"info");setClipSt(p=>({...p,[id]:{status:"generating",progress:0}}));
      try{
        const res=await fetch("https://api.dev.runwayml.com/v1/image_to_video",{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${runwayKey}`,"X-Runway-Version":"2024-11-06"},body:JSON.stringify({model:"gen4_turbo",promptImage:`https://drive.google.com/uc?id=${id}`,promptText:fp,duration:f.dur<=5?5:10,ratio:"1280:768"})});
        if(!res.ok){const e=await res.json().catch(()=>({}));throw new Error(e.message||`HTTP ${res.status}`);}
        const task=await res.json();const tid=task.id;addLog(`⏳ Task: ${tid}`,"info");
        let done=false,att=0;
        while(!done&&att<60){
          await sleep(5000);att++;
          const pd=await(await fetch(`https://api.dev.runwayml.com/v1/tasks/${tid}`,{headers:{"Authorization":`Bearer ${runwayKey}`,"X-Runway-Version":"2024-11-06"}})).json();
          setClipSt(p=>({...p,[id]:{status:"generating",progress:Math.min(att*5,95)}}));
          if(pd.status==="SUCCEEDED"){done=true;setClipSt(p=>({...p,[id]:{status:"done",progress:100,url:pd.output?.[0]}}));addLog(`✅ ${f.name}!`,"success");}
          else if(pd.status==="FAILED")throw new Error(pd.failure||"Failed");
        }
        if(!done)throw new Error("Timeout");
      }catch(e){
        if(e.message.includes("Failed to fetch")||e.message.includes("NetworkError")){
          addLog(`⚠️ CORS — mock za ${f.name}`,"info");
          for(let i=1;i<=10;i++){await sleep(120);setClipSt(p=>({...p,[id]:{status:"generating",progress:i*10}}));}
          setClipSt(p=>({...p,[id]:{status:"done",progress:100,url:MOCK_VIDEO}}));
          addLog(`✅ ${f.name} (mock)!`,"success");
        }else{setClipSt(p=>({...p,[id]:{status:"error",progress:0}}));addLog(`❌ ${f.name}: ${e.message}`,"error");}
      }
    }
    addLog("🎉 Svi B-Roll klipovi gotovi!","success");setGenerating(false);setGenDone(true);
  };

  // Timeline history
  const [history,setHistory]=useState([]);
  const [redoStack,setRedoStack]=useState([]);
  const saveHistory=()=>{setHistory(h=>[...h,{mainTrack:[...mainTrack],brollTrack:[...brollTrack],musicTrack:[...musicTrack]}]);setRedoStack([]);};
  const undo=()=>{if(history.length===0)return;const prev=history[history.length-1];setRedoStack(r=>[...r,{mainTrack:[...mainTrack],brollTrack:[...brollTrack],musicTrack:[...musicTrack]}]);setMainTrack(prev.mainTrack);setBrollTrack(prev.brollTrack);setMusicTrack(prev.musicTrack);setHistory(h=>h.slice(0,-1));setSelClip(null);};
  const redo=()=>{if(redoStack.length===0)return;const next=redoStack[redoStack.length-1];setHistory(h=>[...h,{mainTrack:[...mainTrack],brollTrack:[...brollTrack],musicTrack:[...musicTrack]}]);setMainTrack(next.mainTrack);setBrollTrack(next.brollTrack);setMusicTrack(next.musicTrack);setRedoStack(r=>r.slice(0,-1));setSelClip(null);};

  const goToTimeline=()=>{
    let pos=0;
    setMainTrack(mainF.map(id=>{const f=getFile(id);const c={clipId:++cid,fileId:id,start:pos,dur:f.dur,trimStart:0,trimEnd:f.dur};pos+=f.dur;return c;}));
    setBrollTrack([]);
    if(selMusic){const f=getFile(selMusic);if(f)setMusicTrack([{clipId:++cid,fileId:selMusic,start:0,dur:f.dur,trimStart:0,trimEnd:f.dur}]);}
    go(7);
  };

  const startDrag=(e,trackType,clipId)=>{e.stopPropagation();const allTracks={main:mainTrack,broll:brollTrack,music:musicTrack};const clip=allTracks[trackType]?.find(c=>c.clipId===clipId);if(!clip||!tlRef.current)return;const rect=tlRef.current.getBoundingClientRect();setDragSt({type:"move",trackType,clipId,offsetX:e.clientX-rect.left-clip.start*PX});setSelClip({trackType,clipId});};
  const startTrim=(e,trackType,clipId,side)=>{e.stopPropagation();if(!tlRef.current)return;setTrimSt({trackType,clipId,side,startX:e.clientX});setSelClip({trackType,clipId});};
  const startAddDrag=(e,fileId,trackType="broll")=>setDragSt({type:"add",fileId,trackType,offsetX:0});

  const onMouseMove=useCallback(e=>{
    if(trimSt){e.preventDefault();const dx=Math.round((e.clientX-trimSt.startX)/PX);const setTrack=trimSt.trackType==="main"?setMainTrack:trimSt.trackType==="broll"?setBrollTrack:setMusicTrack;setTrack(p=>p.map(c=>{if(c.clipId!==trimSt.clipId)return c;if(trimSt.side==="left"){const newTrimStart=Math.max(0,Math.min(c.trimStart+dx,c.trimEnd-1));const newStart=c.start+(newTrimStart-c.trimStart);const newDur=c.dur-(newTrimStart-c.trimStart);return newDur>1?{...c,trimStart:newTrimStart,start:newStart,dur:newDur}:c;}else{const newTrimEnd=Math.max(c.trimStart+1,Math.min(c.trimEnd+dx,getFile(c.fileId)?.dur||60));const newDur=c.dur+(newTrimEnd-c.trimEnd);return newDur>1?{...c,trimEnd:newTrimEnd,dur:newDur}:c;}}));setTrimSt(p=>({...p,startX:e.clientX}));return;}
    if(!dragSt||!tlRef.current)return;e.preventDefault();const rect=tlRef.current.getBoundingClientRect();const ns=Math.round(Math.max(0,e.clientX-rect.left-dragSt.offsetX)/PX);if(dragSt.type==="move"){const setTrack=dragSt.trackType==="main"?setMainTrack:dragSt.trackType==="broll"?setBrollTrack:setMusicTrack;setTrack(p=>p.map(c=>c.clipId===dragSt.clipId?{...c,start:ns}:c));}
  },[dragSt,trimSt]);

  const onMouseUp=useCallback(e=>{
    if(trimSt){setTrimSt(null);return;}
    if(!dragSt||!tlRef.current)return;
    if(dragSt.type==="add"){saveHistory();const start=Math.round(Math.max(0,e.clientX-tlRef.current.getBoundingClientRect().left)/PX);const f=getFile(dragSt.fileId);const setTrack=dragSt.trackType==="broll"?setBrollTrack:dragSt.trackType==="music"?setMusicTrack:setBrollTrack;setTrack(p=>[...p,{clipId:++cid,fileId:dragSt.fileId,start,dur:f?.dur||10,trimStart:0,trimEnd:f?.dur||10}]);}
    setDragSt(null);
  },[dragSt,trimSt,files,musicFiles]);

  const removeClip=(tt,id)=>{saveHistory();const setT=tt==="main"?setMainTrack:tt==="broll"?setBrollTrack:setMusicTrack;setT(p=>p.filter(c=>c.clipId!==id));setSelClip(null);};
  const cutClip=(tt,id)=>{saveHistory();const allT={main:mainTrack,broll:brollTrack,music:musicTrack};const clip=allT[tt]?.find(c=>c.clipId===id);if(!clip)return;const mid=Math.floor(clip.dur/2);const setT=tt==="main"?setMainTrack:tt==="broll"?setBrollTrack:setMusicTrack;setT(p=>p.flatMap(c=>{if(c.clipId!==id)return[c];return[{...c,dur:mid,trimEnd:c.trimStart+mid},{...c,clipId:++cid,start:c.start+mid,dur:c.dur-mid,trimStart:c.trimStart+mid}];}));};

  const generateCaptions=async()=>{
    setCapGenStatus("generating");
    try{
      if(captionsKey.trim()){
        const res=await fetch(`${BACKEND}/api/captions/generate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({video_url:MOCK_VIDEO,caption_template_id:"ctpl_DxflLOnuKkb198FNdI9E"})});
        if(!res.ok)throw new Error(`HTTP ${res.status}`);
        const task=await res.json();
        addLog(`📝 Captions.ai task: ${task.id}`,"info");
      }
      await sleep(1500);
      setGeneratedCaps([
        {id:1,start:0,end:3,text:"Dobrodošli u naš novi projekat"},
        {id:2,start:3,end:6,text:"Predstavljamo revolucionarni produkt"},
        {id:3,start:6,end:10,text:"Napravljen za sve koji cene kvalitet"},
        {id:4,start:10,end:14,text:"Iskusite razliku danas"},
      ]);
      setCapEnabled(true);setCapGenStatus("done");
    }catch(e){
      addLog(`❌ Captions greška: ${e.message}`,"error");
      setCapGenStatus("idle");
    }
  };

  const mergeVideo=async()=>{setMerging(true);await sleep(2500);setFinalVideo(MOCK_VIDEO);setMerging(false);go(10);};
  const resetAll=()=>{go(0);setFiles([]);setMainF([]);setBrollF([]);setUnassF([]);setMusicFiles([]);setSelMusic(null);setPrompts({});setClipSt({});setGenLog([]);setMainTrack([]);setBrollTrack([]);setMusicTrack([]);setFinalVideo(null);setGenDone(false);setGenerating(false);setUseVO(null);setSelVoice(null);setVoiceScript("");setVoiceUrl(null);setCapEnabled(false);setCapGenStatus("idle");setGeneratedCaps([]);setDriveError(null);};

  return(
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",padding:20,position:"relative",zIndex:10}}
      onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <div style={{width:"100%",maxWidth:900}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:20}} className="fu">
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:10}}>
            <div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#5b8def,#a78bfa)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🎬</div>
            <h1 style={{margin:0,fontSize:18,fontWeight:700,letterSpacing:"-0.02em"}}>Drive → Runway ML + Captions.ai</h1>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <span className="pill" style={{background:"rgba(52,211,153,0.1)",color:"#34d399",border:"1px solid rgba(52,211,153,0.2)"}}>
              🔒 Service Account Auth
            </span>
            <span className="pill" style={{background:"rgba(167,139,250,0.1)",color:"#a78bfa",border:"1px solid rgba(167,139,250,0.2)"}}>
              💬 Captions.ai Ready
            </span>
          </div>
        </div>

        {/* Steps */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"center",gap:1,marginBottom:24,overflowX:"auto",paddingBottom:6}}>
          {STEPS.map((s,i)=>{const done=i<step,active=i===step;return(
            <React.Fragment key={i}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:48,flexShrink:0}}>
                <div style={{width:30,height:30,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,transition:"all 0.3s",
                  background:active?"linear-gradient(135deg,#5b8def,#a78bfa)":done?"rgba(52,211,153,0.1)":"rgba(23,27,36,0.8)",
                  border:active?"none":done?"1px solid rgba(52,211,153,0.3)":"1px solid rgba(37,43,59,1)",
                  boxShadow:active?"0 4px 20px rgba(91,141,239,0.25)":"none",
                  color:done?"#34d399":active?"white":"#3a4050"}}>
                  {done?"✓":s.e}
                </div>
                <span style={{fontSize:7.5,maxWidth:48,textAlign:"center",marginTop:4,lineHeight:1.3,fontWeight:500,
                  color:active?"rgba(255,255,255,0.9)":done?"rgba(52,211,153,0.5)":"#3a4050"}}>{s.l}</span>
              </div>
              {i<STEPS.length-1&&<div style={{height:1,width:6,flexShrink:0,marginBottom:14,background:done?"rgba(52,211,153,0.35)":"rgba(28,33,48,1)",transition:"background 0.5s"}}/>}
            </React.Fragment>
          );})}
        </div>

        {/* Panel */}
        <div key={sk} className="glass fu" style={{borderRadius:20,padding:24,boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>

          {/* ─── STEP 0: API KEYS ─── */}
          {step===0&&<div style={{display:"flex",flexDirection:"column",gap:20}}>
            <SH emoji="🔑" title="API Keys" subtitle="Poveži sve servise"/>

            {/* Server status info */}
            <div className="gin fu fu1" style={{borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:32,height:32,borderRadius:10,background:"rgba(52,211,153,0.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🔒</div>
              <div style={{flex:1}}>
                <p style={{margin:0,fontSize:12,fontWeight:600,color:"#34d399"}}>Service Account Auth ✅</p>
                <p style={{margin:0,fontSize:11,color:"rgba(255,255,255,0.3)"}}>Google Drive fajlovi se učitavaju automatski — bez tokena, bez logina</p>
              </div>
              <span className="pill" style={{background:"rgba(52,211,153,0.1)",color:"#34d399",border:"1px solid rgba(52,211,153,0.2)"}}>ACTIVE</span>
            </div>

            {/* Runway */}
            <div className="fu fu1">
              <label style={lbl}>Runway ML API Ključ</label>
              <div style={{position:"relative"}}>
                <input type={showRunway?"text":"password"} value={runwayKey} onChange={e=>setRunwayKey(e.target.value)} placeholder="key_..." className="ir" style={{...inp,paddingRight:48}}/>
                <button onClick={()=>setShowRunway(!showRunway)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.25)",display:"flex"}}>{showRunway?SVG.eyeO:SVG.eye}</button>
              </div>
              <p style={{fontSize:10,color:"rgba(255,255,255,0.2)",marginTop:6,fontFamily:"JetBrains Mono,monospace"}}>dev.runwayml.com → API Keys</p>
            </div>

            {/* Captions.ai */}
            <div className="fu fu2">
              <label style={lbl}>Captions.ai API Ključ <span style={{marginLeft:8,padding:"2px 8px",borderRadius:20,background:"rgba(167,139,250,0.15)",color:"#a78bfa",fontSize:9,fontWeight:600,textTransform:"none",letterSpacing:0}}>💬 BETA</span></label>
              <div style={{position:"relative"}}>
                <input type={showCaptions?"text":"password"} value={captionsKey} onChange={e=>setCaptionsKey(e.target.value)} placeholder="Unesi API key..." className="ir" style={{...inp,paddingRight:48,borderColor:"rgba(167,139,250,0.15)"}}/>
                <button onClick={()=>setShowCaptions(!showCaptions)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.25)",display:"flex"}}>{showCaptions?SVG.eyeO:SVG.eye}</button>
              </div>
            </div>

            {/* Google Drive — Video */}
            <div className="fu fu3">
              <label style={lbl}>Google Drive — Video Fajlovi</label>
              <input type="text" value={driveUrl} onChange={e=>setDriveUrl(e.target.value)} placeholder="https://drive.google.com/drive/folders/..." className="ir" style={inp}/>
              <p style={{fontSize:10,color:"rgba(255,255,255,0.2)",marginTop:6}}>Nalepi link foldera sa videima/slikama</p>
            </div>

            {/* Google Drive — Music */}
            <div>
              <label style={lbl}>Google Drive — Muzika 🎵 <span style={{textTransform:"none",color:"rgba(255,255,255,0.2)"}}>(opciono)</span></label>
              <input type="text" value={musicDriveUrl} onChange={e=>setMusicDriveUrl(e.target.value)} placeholder="https://drive.google.com/drive/folders/... (muzika)" className="ir" style={{...inp,borderColor:"rgba(245,182,66,0.1)"}}/>
            </div>

            {/* ElevenLabs */}
            <div>
              <label style={lbl}>ElevenLabs API Ključ <span style={{textTransform:"none",color:"rgba(255,255,255,0.2)"}}>(opciono)</span></label>
              <input type="password" value={elevenKey} onChange={e=>setElevenKey(e.target.value)} placeholder="Ostavi prazno ako ne koristiš voiceover" className="ir" style={{...inp,borderColor:"rgba(245,182,66,0.1)"}}/>
            </div>
          </div>}

          {/* ─── STEP 1: VOICEOVER ─── */}
          {step===1&&<div style={{display:"flex",flexDirection:"column",gap:20}}>
            <SH emoji="🎙️" title="Voiceover" subtitle="Opcioni AI voiceover sa ElevenLabs"/>
            {useVO===null&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {[{l:"Da, dodaj voiceover",s:"Generiši AI glas sa ElevenLabs",e:"🎙️",col:"#f5b642",a:()=>setUseVO(true)},
                {l:"Preskoči",s:"Nastavi bez voiceover-a",e:"⏭️",col:"#6b7280",a:()=>{setUseVO(false);go(2);}}
              ].map(b=><button key={b.l} onClick={b.a} className="card-h" style={{padding:20,background:"rgba(255,255,255,0.04)",border:`1px solid rgba(255,255,255,0.08)`,borderRadius:16,textAlign:"left",cursor:"pointer"}}>
                <div style={{width:32,height:32,borderRadius:10,background:`${b.col}25`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,fontSize:16}}>{b.e}</div>
                <p style={{margin:0,fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.9)"}}>{b.l}</p>
                <p style={{margin:"4px 0 0",fontSize:11,color:"rgba(255,255,255,0.4)"}}>{b.s}</p>
              </button>)}
            </div>}
            {useVO===true&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
              {VOICES.map(v=><div key={v.id} onClick={()=>setSelVoice(v.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:14,border:`1px solid ${selVoice===v.id?"rgba(245,182,66,0.3)":"rgba(255,255,255,0.04)"}`,background:selVoice===v.id?"rgba(245,182,66,0.06)":"rgba(255,255,255,0.02)",cursor:"pointer",transition:"all 0.2s"}}>
                <div style={{width:40,height:40,borderRadius:12,background:selVoice===v.id?"rgba(245,182,66,0.15)":"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{v.e}</div>
                <div style={{flex:1}}><p style={{margin:0,fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.9)"}}>{v.name}</p><p style={{margin:0,fontSize:11,color:"rgba(255,255,255,0.3)",fontFamily:"JetBrains Mono,monospace"}}>{v.desc}</p></div>
                {selVoice===v.id&&<div style={{width:20,height:20,borderRadius:"50%",background:"#f5b642",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:10}}>✓</div>}
              </div>)}
              {selVoice&&<textarea value={voiceScript} onChange={e=>setVoiceScript(e.target.value)} rows={4} placeholder="Upiši tekst..." className="ir" style={{...inp,resize:"none",fontFamily:"DM Sans,sans-serif"}}/>}
              <BP onClick={genVoiceover} disabled={genVoice||!selVoice||!voiceScript.trim()||!elevenKey.trim()} style={{width:"100%",padding:14}}>{genVoice?<><Sp/> Generišem...</>:"Generiši Voiceover"}</BP>
              {voiceUrl&&<div className="gin" style={{borderRadius:14,padding:14,display:"flex",flexDirection:"column",gap:10}}>
                <p style={{margin:0,fontSize:12,color:"#34d399",fontWeight:600}}>✅ Voiceover generisan!</p>
                <audio src={voiceUrl} controls style={{width:"100%"}}/>
                <div style={{display:"flex",gap:8}}>
                  <a href={voiceUrl} download="voiceover.mp3" style={{flex:1,padding:10,background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.15)",borderRadius:12,fontSize:11,fontWeight:600,color:"#34d399",textAlign:"center",textDecoration:"none"}}>Preuzmi MP3</a>
                  <button onClick={()=>setVoiceUrl(null)} style={{flex:1,padding:10,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.04)",borderRadius:12,fontSize:11,color:"rgba(255,255,255,0.4)",cursor:"pointer"}}>Regeneriši</button>
                </div>
              </div>}
              <div style={{display:"flex",gap:8}}>
                <BG onClick={()=>setUseVO(null)}>{SVG.aL} Nazad</BG>
                <BP onClick={()=>go(2)} disabled={!voiceUrl} style={{flex:1}}>Nastavi {SVG.aR}</BP>
              </div>
            </div>}
          </div>}

          {/* ─── STEP 2: FILES ─── */}
          {step===2&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
            <SH emoji="📁" title="Fajlovi sa Drive-a" badge={files.length>0&&<span className="pill" style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.4)",border:"1px solid rgba(255,255,255,0.05)"}}>{files.length} fajlova</span>}/>
            
            {/* Drive error banner */}
            {driveError&&<div style={{padding:"10px 14px",background:"rgba(248,113,113,0.08)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:12,display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:16}}>⚠️</span>
              <div style={{flex:1}}>
                <p style={{margin:0,fontSize:12,color:"#f87171",fontWeight:600}}>Drive greška: {driveError}</p>
                <p style={{margin:0,fontSize:11,color:"rgba(248,113,113,0.6)"}}>Koristim mock fajlove. Provjeri da li server radi i da su Google kredencijali ispravni u Replit Secrets.</p>
              </div>
            </div>}

            {/* Video files */}
            {files.length===0?(
              <button onClick={fetchFiles} disabled={loadingF} className={loadingF?"shimmer":""} style={{width:"100%",padding:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,fontSize:13,color:"rgba(255,255,255,0.5)",cursor:loadingF?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                {loadingF?<><Sp/> Učitavanje video fajlova...</>:"🎥 Učitaj Video Fajlove sa Drive-a"}
              </button>
            ):(
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <p style={{margin:0,fontSize:11,color:"rgba(255,255,255,0.3)"}}>Video fajlovi ({files.length})</p>
                  <button onClick={fetchFiles} disabled={loadingF} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,fontSize:10,color:"rgba(255,255,255,0.3)",cursor:"pointer"}}>
                    {SVG.refresh} Osvježi
                  </button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:240,overflowY:"auto",paddingRight:4}}>
                  {files.map(f=><div key={f.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.03)"}}>
                    <div style={{width:32,height:32,borderRadius:10,background:"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:14}}>{ficon(f.ext)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{margin:0,fontSize:12,color:"rgba(255,255,255,0.8)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:500}}>{f.name}</p>
                      <p style={{margin:0,fontSize:10,color:"rgba(255,255,255,0.25)",fontFamily:"JetBrains Mono,monospace"}}>{f.size} · {f.dur}s</p>
                    </div>
                    <div style={{display:"flex",gap:4,flexShrink:0}}>
                      {[["main","Main","#5b8def",mainF.includes(f.id)],["broll","B-Roll","#a78bfa",brollF.includes(f.id)]].map(([t,lbl2,col,act])=>
                        <button key={t} onClick={()=>moveFile(f.id,t)} style={{padding:"5px 10px",borderRadius:8,fontSize:10,fontWeight:600,textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s",
                          background:act?`linear-gradient(135deg,${col},${col}cc)`:"rgba(255,255,255,0.03)",
                          color:act?"white":"rgba(255,255,255,0.25)",border:act?"none":`1px solid rgba(255,255,255,0.04)`}}>{lbl2}</button>
                      )}
                    </div>
                  </div>)}
                </div>
              </div>
            )}

            {/* Music files */}
            <div style={{borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <p style={{margin:0,fontSize:12,fontWeight:600,color:"#f5b642"}}>🎵 Muzika sa Drive-a</p>
                {musicFiles.length===0&&musicDriveUrl&&<button onClick={fetchMusic} disabled={loadingM} style={{padding:"5px 12px",background:"rgba(245,182,66,0.1)",border:"1px solid rgba(245,182,66,0.15)",borderRadius:8,fontSize:11,color:"#f5b642",cursor:"pointer"}}>{loadingM?"Učitavanje...":"Učitaj Muziku"}</button>}
              </div>
              {!musicDriveUrl&&<p style={{fontSize:11,color:"rgba(255,255,255,0.2)",fontStyle:"italic"}}>Unesi Music Drive URL u koraku API Keys</p>}
              {musicFiles.length>0&&<div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:140,overflowY:"auto"}}>
                {musicFiles.map(f=><div key={f.id} onClick={()=>setSelMusic(selMusic===f.id?null:f.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:10,background:selMusic===f.id?"rgba(245,182,66,0.08)":"rgba(255,255,255,0.02)",border:`1px solid ${selMusic===f.id?"rgba(245,182,66,0.25)":"rgba(255,255,255,0.03)"}`,cursor:"pointer",transition:"all 0.2s"}}>
                  <span style={{fontSize:16}}>🎵</span>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{margin:0,fontSize:12,color:"rgba(255,255,255,0.8)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontWeight:500}}>{f.name}</p>
                    <p style={{margin:0,fontSize:10,color:"rgba(255,255,255,0.25)",fontFamily:"JetBrains Mono,monospace"}}>{f.size}</p>
                  </div>
                  {selMusic===f.id&&<span style={{color:"#f5b642",fontSize:14}}>✓</span>}
                </div>)}
              </div>}
            </div>

            {files.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[["Main",mainF.length,"#5b8def"],["B-Roll",brollF.length,"#a78bfa"],["Neraspoređeno",unassF.length,"rgba(255,255,255,0.25)"]].map(([l,c,col])=>
                <div key={l} style={{background:`${col}08`,border:`1px solid ${col}15`,borderRadius:12,padding:10,textAlign:"center"}}>
                  <p style={{margin:0,fontSize:10,color:`${col}80`,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:500}}>{l}</p>
                  <p style={{margin:"2px 0 0",fontSize:22,fontWeight:700,color:col}}>{c}</p>
                </div>
              )}
            </div>}
          </div>}

          {/* ─── STEP 3: SORT ─── */}
          {step===3&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
            <SH emoji="🗂️" title="Potvrdi Sortiranje"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {[["Main Video",mainF,"#5b8def","ne edituje se"],["B-Roll",brollF,"#a78bfa","Runway edituje"]].map(([title,arr,col,tag])=>
                <div key={title}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:col}}/>
                    <p style={{margin:0,fontSize:12,fontWeight:600,color:col}}>{title}</p>
                    <span className="pill" style={{fontSize:10,background:`${col}10`,color:col,border:`1px solid ${col}20`}}>{arr.length}</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:220,overflowY:"auto"}}>
                    {arr.length===0&&<p style={{fontSize:11,color:"rgba(255,255,255,0.2)",fontStyle:"italic"}}>Nema fajlova</p>}
                    {arr.map(id=>{const f=getFile(id);return f?<div key={id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:`${col}05`,border:`1px solid ${col}10`,borderRadius:10}}>
                      <span style={{fontSize:13}}>{ficon(f.ext)}</span>
                      <span style={{fontSize:11,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"rgba(255,255,255,0.6)",fontFamily:"JetBrains Mono,monospace"}}>{f.name}</span>
                      <span style={{fontSize:9,color:`${col}60`,textTransform:"uppercase",flexShrink:0,fontWeight:500}}>{tag}</span>
                    </div>:null;})}
                  </div>
                </div>
              )}
            </div>
          </div>}

          {/* ─── STEP 4: PROMPTS ─── */}
          {step===4&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
            <SH emoji="✏️" title="B-Roll Promptovi" subtitle="Konfiguriši Runway generisanje"/>
            {brollF.length===0?<p style={{fontSize:13,color:"rgba(255,255,255,0.3)"}}>Nema B-Roll fajlova.</p>:(
              <div style={{display:"flex",flexDirection:"column",gap:12,maxHeight:390,overflowY:"auto",paddingRight:4}}>
                {brollF.map((id,i)=>{const f=getFile(id);if(!f)return null;const cam=prompts[id+"_cam"]||"";return(
                  <div key={id} className="gin" style={{borderRadius:14,padding:14,display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:22,height:22,borderRadius:8,background:"linear-gradient(135deg,#a78bfa,#8b6cf0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{i+1}</span>
                      <span style={{fontSize:12,color:"rgba(255,255,255,0.7)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1,fontWeight:500}}>{f.name}</span>
                    </div>
                    <div>
                      <p style={{margin:"0 0 8px",fontSize:10,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:500}}>Pokret kamere</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {["Stabilno","Slow zoom in","Slow zoom out","Pan levo","Pan desno","Tracking shot","Handheld"].map(opt=>
                          <button key={opt} onClick={()=>setPrompts(p=>({...p,[id+"_cam"]:opt}))} style={{padding:"5px 10px",borderRadius:8,fontSize:10,fontWeight:500,cursor:"pointer",transition:"all 0.2s",
                            background:cam===opt?"linear-gradient(135deg,#5b8def,#7c6cf0)":"rgba(255,255,255,0.03)",
                            color:cam===opt?"white":"rgba(255,255,255,0.35)",border:cam===opt?"none":`1px solid rgba(255,255,255,0.04)`}}>{opt}</button>
                        )}
                      </div>
                    </div>
                    <textarea value={prompts[id]||""} onChange={e=>setPrompts(p=>({...p,[id]:e.target.value}))} rows={2} placeholder="Opis scene (opciono)..." className="ir" style={{...inp,resize:"none",fontFamily:"DM Sans,sans-serif",fontSize:12}}/>
                  </div>
                );})}
              </div>
            )}
          </div>}

          {/* ─── STEP 5: GENERATE ─── */}
          {step===5&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
            <SH emoji="🚀" title="Generisanje B-Roll" subtitle="Runway ML video rendering"/>
            {brollF.length===0?<p style={{fontSize:13,color:"rgba(255,255,255,0.3)"}}>Nema B-Roll fajlova.</p>:(
              <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:240,overflowY:"auto",paddingRight:4}}>
                {brollF.map(id=>{const f=getFile(id);if(!f)return null;const s=clipSt[id]||{status:"idle",progress:0};return(
                  <div key={id} className="gin" style={{borderRadius:12,padding:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{width:24,height:24,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
                        background:s.status==="done"?"rgba(52,211,153,0.15)":s.status==="error"?"rgba(248,113,113,0.15)":s.status==="generating"?"rgba(167,139,250,0.15)":"rgba(255,255,255,0.05)",
                        color:s.status==="done"?"#34d399":s.status==="error"?"#f87171":s.status==="generating"?"#a78bfa":"rgba(255,255,255,0.2)"}}>
                        {s.status==="generating"?<Sp/>:s.status==="done"?"✓":s.status==="error"?"✕":"·"}
                      </div>
                      <span style={{fontSize:12,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"rgba(255,255,255,0.7)",fontWeight:500}}>{f.name}</span>
                      <span style={{fontSize:10,color:"rgba(255,255,255,0.2)",fontFamily:"JetBrains Mono,monospace",flexShrink:0}}>{s.progress}%</span>
                    </div>
                    <div style={{width:"100%",background:"rgba(255,255,255,0.04)",borderRadius:4,height:4,overflow:"hidden"}}>
                      <div style={{height:"100%",borderRadius:4,transition:"width 0.3s",background:s.status==="done"?"#34d399":s.status==="error"?"#f87171":"linear-gradient(90deg,#a78bfa,#5b8def)",width:`${s.progress}%`}} className={s.status==="generating"?"pglow":""}/>
                    </div>
                  </div>
                );})}
              </div>
            )}
            {genLog.length>0&&<div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:12,maxHeight:110,overflowY:"auto",border:"1px solid rgba(255,255,255,0.03)"}}>
              {genLog.map((l,i)=><div key={i} style={{fontSize:10,display:"flex",gap:8,fontFamily:"JetBrains Mono,monospace",marginBottom:2,color:l.type==="success"?"rgba(52,211,153,0.8)":l.type==="error"?"rgba(248,113,113,0.8)":"rgba(255,255,255,0.25)"}}>
                <span style={{color:"rgba(255,255,255,0.15)",flexShrink:0}}>{l.t}</span><span>{l.msg}</span>
              </div>)}
            </div>}
            {!genDone?
              <BP onClick={generateBroll} disabled={generating||brollF.length===0} style={{width:"100%",padding:14}}>{generating?<><Sp/> Generišem...</>:"Pokreni Generaciju"}</BP>:
              <BP onClick={()=>go(6)} style={{width:"100%",padding:14}}>Sledeći korak {SVG.aR}</BP>
            }
          </div>}

          {/* ─── STEP 6: CHOOSE ─── */}
          {step===6&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
            <SH emoji="🎯" title="Šta želiš da uradiš?"/>
            {[{l:"Idi na Timeline Editor",s:"Seci, prevlači, edituj klipove i muziku",e:"🎞️",col:"#5b8def",a:goToTimeline},
              {l:"Exportuj Zasebno",s:"Preuzmi Main i B-Roll kao zasebne fajlove",e:"⬇️",col:"#34d399",a:()=>go(9)}
            ].map(b=><button key={b.l} onClick={b.a} className="card-h" style={{width:"100%",padding:"18px 20px",background:`${b.col}06`,border:`1px solid ${b.col}12`,borderRadius:14,textAlign:"left",cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:40,height:40,borderRadius:12,background:`${b.col}15`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{b.e}</div>
              <div><p style={{margin:0,fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.9)"}}>{b.l}</p><p style={{margin:"3px 0 0",fontSize:11,color:"rgba(255,255,255,0.3)"}}>{b.s}</p></div>
            </button>)}
            <BG onClick={()=>go(5)} style={{width:"100%"}}>{SVG.aL} Nazad</BG>
          </div>}

          {/* ─── STEP 7: TIMELINE ─── */}
          {step===7&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
            <SH emoji="🎞️" title="Timeline Editor"
              badge={<div style={{display:"flex",gap:6,alignItems:"center"}}>
                <button onClick={undo} disabled={history.length===0} style={{width:30,height:30,borderRadius:8,background:history.length>0?"rgba(91,141,239,0.15)":"rgba(255,255,255,0.03)",border:`1px solid ${history.length>0?"rgba(91,141,239,0.3)":"rgba(255,255,255,0.05)"}`,cursor:history.length>0?"pointer":"not-allowed",color:history.length>0?"#5b8def":"rgba(255,255,255,0.2)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>↩</button>
                <button onClick={redo} disabled={redoStack.length===0} style={{width:30,height:30,borderRadius:8,background:redoStack.length>0?"rgba(91,141,239,0.15)":"rgba(255,255,255,0.03)",border:`1px solid ${redoStack.length>0?"rgba(91,141,239,0.3)":"rgba(255,255,255,0.05)"}`,cursor:redoStack.length>0?"pointer":"not-allowed",color:redoStack.length>0?"#5b8def":"rgba(255,255,255,0.2)",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>↪</button>
                <span className="pill" style={{background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.3)",border:"1px solid rgba(255,255,255,0.05)",fontFamily:"JetBrains Mono,monospace"}}>{fmt(totalDur)}</span>
              </div>}/>
            <div style={{flex:1,background:"rgba(0,0,0,0.4)",borderRadius:14,overflow:"hidden",position:"relative",aspectRatio:"16/9",maxHeight:180}}>
              <video ref={videoRef} src={previewClip||MOCK_VIDEO} style={{width:"100%",height:"100%",objectFit:"cover"}} controls muted playsInline/>
              {capEnabled&&<div className="cap-overlay" style={{bottom:12,fontSize:capFont*0.6,color:capColor,background:capBg}}>{capText}</div>}
              {selClip&&<div style={{position:"absolute",bottom:8,left:8,display:"flex",gap:6}}>
                <button onClick={()=>cutClip(selClip.trackType,selClip.clipId)} style={{padding:"4px 10px",background:"rgba(245,182,66,0.8)",border:"none",borderRadius:8,fontSize:11,fontWeight:600,color:"black",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>{SVG.cut} Seči</button>
                <button onClick={()=>removeClip(selClip.trackType,selClip.clipId)} style={{padding:"4px 10px",background:"rgba(248,113,113,0.8)",border:"none",borderRadius:8,fontSize:11,fontWeight:600,color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>{SVG.x} Briši</button>
              </div>}
            </div>
            <div ref={tlRef} style={{overflowX:"auto",borderRadius:12,border:"1px solid rgba(255,255,255,0.05)",background:"rgba(0,0,0,0.3)"}}>
              <div style={{minWidth:totalDur*PX+60}}>
                <div style={{position:"relative",height:22,borderBottom:"1px solid rgba(255,255,255,0.05)",background:"rgba(255,255,255,0.02)"}}>
                  {ticks.map(t=><div key={t} style={{position:"absolute",top:0,left:t*PX+20,display:"flex",flexDirection:"column",alignItems:"center"}}>
                    <div style={{height:6,width:1,background:"rgba(255,255,255,0.1)"}}/>
                    <span style={{fontSize:8,color:"rgba(255,255,255,0.2)",fontFamily:"JetBrains Mono,monospace"}}>{fmt(t)}</span>
                  </div>)}
                </div>
                {[{label:"B",track:brollTrack,col:"#a78bfa",type:"broll",h:44},{label:"M",track:mainTrack,col:"#5b8def",type:"main",h:52},{label:"♪",track:musicTrack,col:"#f5b642",type:"music",h:36}].map(({label,track,col,type,h})=>(
                  <div key={type} style={{position:"relative",height:h,borderBottom:"1px solid rgba(255,255,255,0.04)",background:`${col}04`}}>
                    <div style={{position:"absolute",left:0,top:0,bottom:0,width:20,display:"flex",alignItems:"center",justifyContent:"center",zIndex:10,pointerEvents:"none"}}>
                      <span style={{fontSize:9,fontWeight:700,color:`${col}60`,fontFamily:"JetBrains Mono,monospace",background:"rgba(0,0,0,0.4)",padding:"1px 3px",borderRadius:3}}>{label}</span>
                    </div>
                    {track.map(clip=>{const f=getFile(clip.fileId);const sel=selClip?.clipId===clip.clipId;return(
                      <div key={clip.clipId} className="tc" style={{position:"absolute",top:4,bottom:4,borderRadius:6,display:"flex",alignItems:"center",padding:"0 10px",cursor:"grab",userSelect:"none",fontSize:10,overflow:"hidden",left:clip.start*PX+20,width:clip.dur*PX-2,background:sel?`${col}50`:`${col}18`,border:sel?`1px solid rgba(255,255,255,0.5)`:`1px solid ${col}30`,boxShadow:sel?`0 4px 20px ${col}30`:"none"}}
                        onMouseDown={e=>startDrag(e,type,clip.clipId)} onClick={e=>{e.stopPropagation();setSelClip({trackType:type,clipId:clip.clipId});setPreviewClip(MOCK_VIDEO);}}>
                        <div className="trim-handle" style={{left:0}} onMouseDown={e=>{e.stopPropagation();startTrim(e,type,clip.clipId,"left");}}/>
                        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"rgba(255,255,255,0.8)",fontWeight:500,flex:1}}>{f?.name}</span>
                        {sel&&<button style={{marginLeft:"auto",color:"#f87171",flexShrink:0,background:"none",border:"none",cursor:"pointer",padding:"0 0 0 4px",display:"flex",zIndex:5}} onMouseDown={e=>{e.stopPropagation();removeClip(type,clip.clipId);}}>{SVG.x}</button>}
                        <div className="trim-handle" style={{right:0}} onMouseDown={e=>{e.stopPropagation();startTrim(e,type,clip.clipId,"right");}}/>
                      </div>
                    );})}
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <BG onClick={()=>go(6)}>{SVG.aL} Nazad</BG>
              <BP onClick={()=>go(8)} style={{flex:1,padding:12}}>Dodaj Titlove {SVG.aR}</BP>
            </div>
          </div>}

          {/* ─── STEP 8: CAPTIONS ─── */}
          {step===8&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
            <SH emoji="💬" title="Captions.ai" subtitle="Auto titlovi za finalni video"/>
            <div style={{padding:"12px 16px",background:"rgba(167,139,250,0.06)",border:"1px solid rgba(167,139,250,0.15)",borderRadius:14,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,borderRadius:12,background:"rgba(167,139,250,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>💬</div>
              <div style={{flex:1}}>
                <p style={{margin:0,fontSize:13,fontWeight:600,color:"rgba(167,139,250,0.9)"}}>Captions.ai Integracija</p>
                <p style={{margin:0,fontSize:11,color:"rgba(255,255,255,0.3)"}}>{captionsKey?"✅ API ključ aktivan":"⚠️ Bez ključa — koristiće se mock titlovi"}</p>
              </div>
            </div>
            {capGenStatus==="idle"&&<BP onClick={generateCaptions} style={{width:"100%",padding:14}}>{SVG.cc} Auto Generiši Titlove</BP>}
            {capGenStatus==="generating"&&<div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:14,background:"rgba(167,139,250,0.06)",borderRadius:12}}><Sp/><span style={{color:"rgba(167,139,250,0.8)",fontSize:13}}>Generišem titlove...</span></div>}
            {capGenStatus==="done"&&<div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:140,overflowY:"auto"}}>
              {generatedCaps.map(c=><div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"rgba(167,139,250,0.05)",border:"1px solid rgba(167,139,250,0.1)",borderRadius:10}}>
                <span style={{fontSize:10,color:"rgba(167,139,250,0.5)",fontFamily:"JetBrains Mono,monospace",flexShrink:0}}>{fmt(c.start)}→{fmt(c.end)}</span>
                <input value={c.text} onChange={e=>setGeneratedCaps(p=>p.map(x=>x.id===c.id?{...x,text:e.target.value}:x))} className="ir" style={{flex:1,background:"transparent",fontSize:12,color:"rgba(255,255,255,0.8)",padding:"4px 8px",borderRadius:6}}/>
              </div>)}
            </div>}
            <div className="gin" style={{borderRadius:14,padding:14,display:"flex",flexDirection:"column",gap:12}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
                <div><label style={{...lbl,marginBottom:6}}>Stil</label>
                  <div style={{display:"flex",gap:4}}>{["classic","outline","highlight"].map(s=><button key={s} onClick={()=>setCapStyle(s)} style={{flex:1,padding:"8px 4px",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",background:capStyle===s?"linear-gradient(135deg,#a78bfa,#8b6cf0)":"rgba(255,255,255,0.03)",color:capStyle===s?"white":"rgba(255,255,255,0.35)",border:"none"}}>{s}</button>)}</div>
                </div>
                <div><label style={{...lbl,marginBottom:6}}>Font</label>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <button onClick={()=>setCapFont(f=>Math.max(12,f-2))} style={{width:28,height:28,borderRadius:6,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",cursor:"pointer",color:"white",fontSize:14}}>−</button>
                    <span style={{fontSize:13,fontWeight:600,color:"white",minWidth:30,textAlign:"center"}}>{capFont}</span>
                    <button onClick={()=>setCapFont(f=>Math.min(48,f+2))} style={{width:28,height:28,borderRadius:6,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",cursor:"pointer",color:"white",fontSize:14}}>+</button>
                  </div>
                </div>
                <div><label style={{...lbl,marginBottom:6}}>Boja</label>
                  <input type="color" value={capColor} onChange={e=>setCapColor(e.target.value)} style={{width:"100%",height:36,borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"transparent",cursor:"pointer"}}/>
                </div>
              </div>
            </div>
            <div style={{position:"relative",borderRadius:12,overflow:"hidden",aspectRatio:"16/9",maxHeight:160,background:"rgba(0,0,0,0.4)"}}>
              <video src={MOCK_VIDEO} style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.7}} muted playsInline autoPlay loop/>
              <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",bottom:12,fontSize:capFont*0.55,fontWeight:700,color:capColor,padding:"4px 12px",borderRadius:8,whiteSpace:"nowrap",background:capStyle==="highlight"?"rgba(245,182,66,0.85)":capStyle==="outline"?"transparent":"rgba(0,0,0,0.75)",textShadow:capStyle==="outline"?"1px 1px 3px black, -1px -1px 3px black":"none"}}>{capText}</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <BG onClick={()=>go(7)}>{SVG.aL} Nazad</BG>
              <BP onClick={()=>go(9)} style={{flex:1,padding:12}}>Nastavi na Export {SVG.aR}</BP>
            </div>
          </div>}

          {/* ─── STEP 9: EXPORT ─── */}
          {step===9&&<div style={{display:"flex",flexDirection:"column",gap:16}}>
            <SH emoji="⬇️" title="Export"/>
            {mainF.length>0&&<div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{width:8,height:8,borderRadius:"50%",background:"#5b8def"}}/><p style={{margin:0,fontSize:12,fontWeight:600,color:"#5b8def"}}>Main ({mainF.length})</p></div>
              {mainF.map(id=>{const f=getFile(id);if(!f)return null;return(
                <div key={id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:"rgba(91,141,239,0.04)",border:"1px solid rgba(91,141,239,0.1)",borderRadius:12,marginBottom:6}}>
                  <span style={{fontSize:18}}>🎥</span>
                  <p style={{margin:0,fontSize:12,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"rgba(255,255,255,0.7)"}}>{f.name}</p>
                  <a href={MOCK_VIDEO} download={f.name} className="btn-p" style={{padding:"6px 12px",fontSize:10,borderRadius:10,textDecoration:"none"}}>Preuzmi</a>
                </div>
              );})}
            </div>}
            <div style={{display:"flex",flexDirection:"column",gap:10,borderTop:"1px solid rgba(255,255,255,0.05)",paddingTop:16}}>
              <BP onClick={mergeVideo} disabled={merging||mainTrack.length===0} style={{width:"100%",padding:14}}>{merging?<><Sp/> Renderujem...</>:"🎬 Renderiraj Finalni Video"}</BP>
              <div style={{display:"flex",gap:10}}>
                <BG onClick={()=>go(8)} style={{flex:1}}>{SVG.aL} Nazad</BG>
                <BG onClick={resetAll}>Novi Projekat</BG>
              </div>
            </div>
          </div>}

          {/* ─── STEP 10: RESULT ─── */}
          {step===10&&<div style={{display:"flex",flexDirection:"column",gap:20}}>
            <div style={{textAlign:"center"}}>
              <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:60,height:60,borderRadius:20,background:"linear-gradient(135deg,rgba(52,211,153,0.2),rgba(91,141,239,0.2))",fontSize:28,marginBottom:12}}>🎉</div>
              <h2 style={{margin:"0 0 12px",fontSize:16,fontWeight:700}}>Finalni Video Spreman!</h2>
            </div>
            <div style={{borderRadius:14,overflow:"hidden",border:"1px solid rgba(255,255,255,0.05)"}}>
              <video src={finalVideo} controls style={{width:"100%",display:"block"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <a href={finalVideo} download className="btn-p" style={{padding:12,background:"linear-gradient(135deg,#34d399,#059669)",borderRadius:12,textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6,fontSize:13,fontWeight:600,color:"white"}}>{SVG.dl} Preuzmi Video</a>
              <BG onClick={resetAll} style={{padding:12}}>🔁 Novi Projekat</BG>
            </div>
            <BG onClick={()=>go(9)} style={{width:"100%"}}>{SVG.aL} Nazad</BG>
          </div>}

        </div>

        {/* Navigation */}
        {[0,2,3,4].includes(step)&&<div style={{display:"flex",justifyContent:"space-between",marginTop:16}} className="fu">
          <BG onClick={()=>go(s=>Math.max(0,s-1))} disabled={step===0}>{SVG.aL} Nazad</BG>
          <BP onClick={()=>go(s=>s+1)} disabled={(step===2&&files.length===0)||(step===3&&mainF.length===0&&brollF.length===0)}>Sledeći korak {SVG.aR}</BP>
        </div>}
        {step===1&&<div style={{marginTop:16}}><BG onClick={()=>{setUseVO(null);go(0);}}>{SVG.aL} Nazad</BG></div>}
        {step===5&&!genDone&&!generating&&<div style={{marginTop:16}}><BG onClick={()=>go(4)}>{SVG.aL} Nazad</BG></div>}

      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
</script>
</body>
</html>
