import { useState, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  LayoutDashboard, User, Send, History, ChevronRight, X, Check,
  AlertCircle, Upload, Edit2, Save, ExternalLink, Briefcase,
  Calendar, Building, Eye, Copy, CheckCheck
} from "lucide-react";

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  navyDark:  "#001A57",
  navy:      "#002FA7",
  blue:      "#006FE8",
  blueLight: "#E8F0FF",
  bluePale:  "#F0F5FF",
  red:       "#D0021B",
  redLight:  "#FFF0F2",
  white:     "#FFFFFF",
  grayBg:    "#F4F7FC",
  grayLine:  "#DDE4F0",
  grayMid:   "#8A97B0",
  grayText:  "#4A5568",
  dark:      "#1A2340",
  success:   "#00875A",
  successBg: "#E6F6F0",
};

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const SK = { PROFILE: "aa_profile", HISTORY: "aa_history" };
function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function persist(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

// ─── PROFILE SCHEMA ───────────────────────────────────────────────────────────
const EMPTY_PROFILE = {
  fullName:"", email:"", phone:"", addressStreet:"", addressCity:"",
  addressState:"", addressZip:"", linkedin:"", portfolio:"",
  desiredTitle:"", salaryMin:"", salaryMax:"", workAuth:"",
  employmentType:"", startDate:"", willingToRelocate:"",
  yearsExperience:"", educationLevel:"", degree:"", university:"",
  graduationYear:"", isOver18:"", authorizedToWork:"", requiresSponsorship:"",
  workedHereBefore:"", heardAboutUs:"", gender:"", veteranStatus:"",
  disabilityStatus:"", emergencyContactName:"", emergencyContactPhone:"",
  resumeFileName:"", coverLetterFileName:"",
};

const SECTIONS = [
  { title:"Personal Information", fields:[
    {key:"fullName",    label:"Full Name",          type:"text",   placeholder:"Jane Smith"},
    {key:"email",       label:"Email Address",       type:"email",  placeholder:"jane@example.com"},
    {key:"phone",       label:"Phone Number",        type:"tel",    placeholder:"+1 (555) 000-0000"},
    {key:"addressStreet",label:"Street Address",     type:"text",   placeholder:"123 Main St"},
    {key:"addressCity", label:"City",                type:"text",   placeholder:"New York"},
    {key:"addressState",label:"State",               type:"text",   placeholder:"NY"},
    {key:"addressZip",  label:"ZIP Code",            type:"text",   placeholder:"10001"},
    {key:"linkedin",    label:"LinkedIn URL",        type:"url",    placeholder:"https://linkedin.com/in/..."},
    {key:"portfolio",   label:"Portfolio / Website", type:"url",    placeholder:"https://yoursite.com"},
  ]},
  { title:"Job Preferences", fields:[
    {key:"desiredTitle",     label:"Desired Job Title",    type:"text",   placeholder:"Senior Software Engineer"},
    {key:"salaryMin",        label:"Minimum Salary ($)",   type:"number", placeholder:"80000"},
    {key:"salaryMax",        label:"Maximum Salary ($)",   type:"number", placeholder:"120000"},
    {key:"workAuth",         label:"Work Authorization",   type:"select", options:["US Citizen","Green Card","H-1B","OPT/CPT","Other"]},
    {key:"employmentType",   label:"Employment Type",      type:"select", options:["Full-time","Part-time","Contract","Internship","Freelance"]},
    {key:"startDate",        label:"Available Start Date", type:"date"},
    {key:"willingToRelocate",label:"Willing to Relocate?",type:"select", options:["Yes","No","Open to discussion"]},
  ]},
  { title:"Experience & Education", fields:[
    {key:"yearsExperience", label:"Years of Experience",       type:"number", placeholder:"5"},
    {key:"educationLevel",  label:"Highest Education Level",   type:"select", options:["High School / GED","Some College","Associate's Degree","Bachelor's Degree","Master's Degree","PhD / Doctorate","Other"]},
    {key:"degree",          label:"Degree / Field of Study",   type:"text",   placeholder:"Computer Science"},
    {key:"university",      label:"University / School Name",  type:"text",   placeholder:"MIT"},
    {key:"graduationYear",  label:"Graduation Year",           type:"number", placeholder:"2019"},
  ]},
  { title:"Eligibility Questions", fields:[
    {key:"isOver18",          label:"Are you 18 or older?",               type:"select", options:["Yes","No"]},
    {key:"authorizedToWork",  label:"Legally authorized to work in US?",  type:"select", options:["Yes","No"]},
    {key:"requiresSponsorship",label:"Require visa sponsorship?",          type:"select", options:["Yes","No"]},
    {key:"workedHereBefore",  label:"Have you previously worked here?",   type:"select", options:["Yes","No"]},
    {key:"heardAboutUs",      label:"How did you hear about us?",         type:"select", options:["LinkedIn","Indeed","Company Website","Referral","Job Fair","Other"]},
  ]},
  { title:"Voluntary Self-Identification", subtitle:"Optional — does not affect your application.", fields:[
    {key:"gender",          label:"Gender",          type:"select", options:["Male","Female","Non-binary","Prefer not to say","Other"]},
    {key:"veteranStatus",   label:"Veteran Status",  type:"select", options:["Not a veteran","Protected veteran","Prefer not to say"]},
    {key:"disabilityStatus",label:"Disability Status",type:"select",options:["No disability","Has a disability","Prefer not to say"]},
  ]},
  { title:"Emergency Contact", fields:[
    {key:"emergencyContactName",  label:"Emergency Contact Name",  type:"text", placeholder:"John Smith"},
    {key:"emergencyContactPhone", label:"Emergency Contact Phone", type:"tel",  placeholder:"+1 (555) 000-0000"},
  ]},
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" });
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div style={{ position:"fixed", bottom:28, right:28, zIndex:9999, display:"flex", flexDirection:"column", gap:10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display:"flex", alignItems:"center", gap:12,
          background:C.white,
          border:`1.5px solid ${t.type==="success" ? C.success : C.red}`,
          borderLeft:`5px solid ${t.type==="success" ? C.success : C.red}`,
          borderRadius:10, padding:"14px 18px", minWidth:320,
          boxShadow:"0 8px 32px rgba(0,47,167,0.15)",
          animation:"slideUp 0.3s cubic-bezier(.22,.68,0,1.2)",
        }}>
          <div style={{ width:32,height:32,borderRadius:"50%",background:t.type==="success"?C.successBg:C.redLight,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            {t.type==="success" ? <Check size={16} color={C.success}/> : <AlertCircle size={16} color={C.red}/>}
          </div>
          <span style={{ flex:1, fontSize:14, fontWeight:500, color:C.dark }}>{t.message}</span>
          <button onClick={()=>remove(t.id)} style={{ background:"none",border:"none",cursor:"pointer",color:C.grayMid,padding:0,display:"flex" }}><X size={14}/></button>
        </div>
      ))}
    </div>
  );
}
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type="success") => {
    const id = Date.now();
    setToasts(p=>[...p,{id,message:msg,type}]);
    setTimeout(()=>setToasts(p=>p.filter(t=>t.id!==id)), 4500);
  },[]);
  const remove = useCallback(id=>setToasts(p=>p.filter(t=>t.id!==id)),[]);
  return { toasts, add, remove };
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const iStyle = (enabled) => ({
  width:"100%", boxSizing:"border-box",
  background: enabled ? C.white : C.grayBg,
  border:`1.5px solid ${C.grayLine}`,
  borderRadius:8, padding:"10px 14px",
  color: enabled ? C.dark : C.grayText,
  fontSize:14, outline:"none",
  cursor: enabled ? "text" : "default",
  fontFamily:"inherit",
  transition:"border 0.2s, box-shadow 0.2s",
  display:"block",
});
const sStyle = (enabled) => ({
  ...iStyle(enabled),
  appearance:"none", WebkitAppearance:"none",
  backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238A97B0' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
  backgroundRepeat:"no-repeat", backgroundPosition:"right 12px center", paddingRight:36,
  cursor: enabled ? "pointer" : "default",
});

// ─── FIELD COMPONENT (defined OUTSIDE parent to prevent remount bug) ──────────
function ProfileField({ field, value, enabled, onChange }) {
  if (field.type === "select") {
    return (
      <select value={value} disabled={!enabled} onChange={onChange} style={sStyle(enabled)}>
        <option value="">— Select —</option>
        {field.options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  return (
    <input
      type={field.type}
      value={value}
      disabled={!enabled}
      placeholder={field.placeholder||""}
      onChange={onChange}
      style={iStyle(enabled)}
    />
  );
}

function Btn({ children, variant="primary", onClick, disabled, style={} }) {
  const v = {
    primary: { background:C.navy,    color:C.white,    border:"none" },
    red:     { background:C.red,     color:C.white,    border:"none" },
    outline: { background:C.white,   color:C.navy,     border:`1.5px solid ${C.navy}` },
    ghost:   { background:"transparent", color:C.grayText, border:`1.5px solid ${C.grayLine}` },
    success: { background:C.success, color:C.white,    border:"none" },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:"inline-flex", alignItems:"center", gap:7,
      padding:"10px 20px", borderRadius:8, fontSize:13.5, fontWeight:700,
      cursor:disabled?"not-allowed":"pointer", fontFamily:"inherit",
      transition:"opacity 0.15s", opacity:disabled?0.5:1, letterSpacing:"0.01em",
      ...v[variant], ...style
    }}>{children}</button>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{
      background:C.white, borderRadius:14,
      border:`1px solid ${C.grayLine}`,
      boxShadow:"0 2px 12px rgba(0,47,167,0.06)",
      ...style
    }}>{children}</div>
  );
}

const tdStyle = { padding:"14px 18px", fontSize:13.5, color:C.grayText, verticalAlign:"middle" };
const overlayStyle = { position:"fixed", inset:0, background:"rgba(0,26,87,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, backdropFilter:"blur(4px)" };
const modalStyle = { background:C.white, borderRadius:16, padding:"32px 36px", width:"100%", maxWidth:560, maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 64px rgba(0,26,87,0.25)" };

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ history }) {
  const chartData = (() => {
    const counts = {};
    history.forEach(a => {
      const d = a.submissionDate?.split("T")[0];
      if (d) counts[d] = (counts[d]||0)+1;
    });
    return Object.entries(counts).sort(([a],[b])=>a.localeCompare(b)).map(([date,count])=>({
      date: new Date(date).toLocaleDateString("en-US",{month:"short",day:"numeric"}),
      Applications: count
    }));
  })();
  const total = history.length;
  const thisMonth = history.filter(a => {
    if (!a.submissionDate) return false;
    const d=new Date(a.submissionDate), n=new Date();
    return d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear();
  }).length;
  const companies = [...new Set(history.map(a=>a.company).filter(Boolean))];

  return (
    <div style={{ padding:"36px 44px", maxWidth:1100 }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:30, fontWeight:800, color:C.navyDark, margin:0, fontFamily:"'Poppins',sans-serif" }}>Dashboard</h1>
        <p style={{ color:C.grayMid, fontSize:14, marginTop:5 }}>Your application activity at a glance.</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:28 }}>
        {[
          {label:"Total Applications",    value:total,            color:C.navy,    bg:C.blueLight, icon:<Send size={20}/>},
          {label:"Submitted This Month",  value:thisMonth,        color:C.success, bg:C.successBg, icon:<Calendar size={20}/>},
          {label:"Companies Reached",     value:companies.length, color:"#7B4FE9", bg:"#F3EEFF",   icon:<Building size={20}/>},
        ].map(s=>(
          <Card key={s.label} style={{ padding:"24px 28px", display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ width:50,height:50,borderRadius:14,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",color:s.color,flexShrink:0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:34,fontWeight:800,color:C.navyDark,lineHeight:1,fontFamily:"'Poppins',sans-serif" }}>{s.value}</div>
              <div style={{ fontSize:13,color:C.grayMid,marginTop:4 }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>
      <Card style={{ padding:"28px 32px", marginBottom:24 }}>
        <h2 style={{ fontSize:16,fontWeight:700,color:C.navyDark,marginBottom:24 }}>Applications Over Time</h2>
        {chartData.length===0 ? (
          <div style={{ height:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,color:C.grayMid }}>
            <Send size={32} color={C.grayLine}/>
            <p style={{ fontSize:14 }}>No data yet — submit your first application to see your chart.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{top:5,right:10,left:-20,bottom:0}}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.blue} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={C.blue} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grayLine}/>
              <XAxis dataKey="date" tick={{fill:C.grayMid,fontSize:12}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:C.grayMid,fontSize:12}} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip contentStyle={{background:C.white,border:`1px solid ${C.grayLine}`,borderRadius:8,color:C.dark,fontSize:13}}/>
              <Area type="monotone" dataKey="Applications" stroke={C.navy} strokeWidth={2.5} fill="url(#blueGrad)" dot={{fill:C.navy,strokeWidth:0,r:4}}/>
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>
      {companies.length>0 && (
        <Card style={{ padding:"24px 28px" }}>
          <h2 style={{ fontSize:15,fontWeight:700,color:C.navyDark,marginBottom:16 }}>Recently Applied Companies</h2>
          <div style={{ display:"flex",flexWrap:"wrap",gap:10 }}>
            {companies.slice(0,10).map(c=>(
              <span key={c} style={{ background:C.blueLight,color:C.navy,borderRadius:20,padding:"6px 16px",fontSize:13,fontWeight:600 }}>{c}</span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── USER PROFILE ─────────────────────────────────────────────────────────────
function UserProfile({ profile, setProfile, showToast }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...profile });

  // Sync if profile changes externally (e.g. storage load)
  // Note: we DON'T sync on every profile change to avoid overwriting draft while editing
  const handleEdit = () => { setDraft({ ...profile }); setEditing(true); };
  const handleCancel = () => { setDraft({ ...profile }); setEditing(false); };

  const handleSave = () => {
    setProfile(draft);
    persist(SK.PROFILE, draft);
    setEditing(false);
    showToast("Profile saved successfully!", "success");
  };

  // Generic field change handler — stable reference avoids remounts
  const handleChange = useCallback((key) => (e) => {
    setDraft(prev => ({ ...prev, [key]: e.target.value }));
  }, []);

  const handleFileUpload = (key) => (e) => {
    const f = e.target.files[0];
    if (f) setDraft(prev => ({ ...prev, [key]: f.name }));
  };

  return (
    <div style={{ padding:"36px 44px", maxWidth:920 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
        <div>
          <h1 style={{ fontSize:30,fontWeight:800,color:C.navyDark,margin:0,fontFamily:"'Poppins',sans-serif" }}>User Profile</h1>
          <p style={{ color:C.grayMid,fontSize:14,marginTop:5 }}>Your details are used to auto-fill job applications.</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          {editing ? (
            <>
              <Btn variant="ghost" onClick={handleCancel}>Cancel</Btn>
              <Btn variant="primary" onClick={handleSave}><Save size={15}/> Save Profile</Btn>
            </>
          ) : (
            <Btn variant="outline" onClick={handleEdit}><Edit2 size={15}/> Edit Profile</Btn>
          )}
        </div>
      </div>

      {SECTIONS.map(sec => (
        <Card key={sec.title} style={{ padding:"26px 30px", marginBottom:20 }}>
          <div style={{ marginBottom:20 }}>
            <h2 style={{ fontSize:15,fontWeight:700,color:C.navyDark,margin:0 }}>{sec.title}</h2>
            {sec.subtitle && <p style={{ fontSize:12.5,color:C.grayMid,marginTop:4 }}>{sec.subtitle}</p>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px 24px" }}>
            {sec.fields.map(f => (
              <div key={f.key}>
                <label style={{ display:"block",fontSize:12,color:C.grayMid,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em" }}>
                  {f.label}
                </label>
                {/* ProfileField is defined outside — no remount on re-render */}
                <ProfileField
                  field={f}
                  value={draft[f.key] || ""}
                  enabled={editing}
                  onChange={handleChange(f.key)}
                />
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Documents */}
      <Card style={{ padding:"26px 30px", marginBottom:20 }}>
        <div style={{ marginBottom:20 }}>
          <h2 style={{ fontSize:15,fontWeight:700,color:C.navyDark }}>Documents</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
          {[
            {key:"resumeFileName",     label:"Resume"},
            {key:"coverLetterFileName",label:"Cover Letter"},
          ].map(doc=>(
            <div key={doc.key}>
              <label style={{ display:"block",fontSize:12,color:C.grayMid,fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.05em" }}>{doc.label}</label>
              {draft[doc.key] ? (
                <div style={{ display:"flex",alignItems:"center",gap:10,background:C.successBg,border:`1px solid #A8E6CE`,borderRadius:8,padding:"10px 14px" }}>
                  <Check size={14} color={C.success}/>
                  <span style={{ fontSize:13,color:C.success,fontWeight:600,flex:1 }}>{draft[doc.key]}</span>
                  {editing && (
                    <label style={{ cursor:"pointer",color:C.navy,fontSize:12,fontWeight:700 }}>
                      Replace
                      <input type="file" accept=".pdf,.doc,.docx" style={{ display:"none" }} onChange={handleFileUpload(doc.key)}/>
                    </label>
                  )}
                </div>
              ) : (
                <label style={{
                  display:"flex",alignItems:"center",gap:10,
                  background:editing?C.bluePale:C.grayBg,
                  border:`1.5px dashed ${editing?C.blue:C.grayLine}`,
                  borderRadius:8, padding:16, cursor:editing?"pointer":"default",
                  color:C.grayMid, fontSize:13, transition:"all 0.2s"
                }}>
                  <Upload size={16} color={editing?C.blue:C.grayMid}/>
                  {editing ? `Upload ${doc.label}` : `No ${doc.label} uploaded`}
                  {editing && <input type="file" accept=".pdf,.doc,.docx" style={{ display:"none" }} onChange={handleFileUpload(doc.key)}/>}
                </label>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── COPY BUTTON ──────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={handleCopy} title="Copy" style={{
      background:"none", border:`1px solid ${C.grayLine}`, borderRadius:5,
      cursor:"pointer", color: copied ? C.success : C.grayMid,
      padding:"2px 6px", display:"inline-flex", alignItems:"center", gap:3, fontSize:11, fontFamily:"inherit"
    }}>
      {copied ? <><CheckCheck size={11}/> Copied</> : <><Copy size={11}/> Copy</>}
    </button>
  );
}

// ─── APPLICATIONS SCREEN ──────────────────────────────────────────────────────
function ApplicationsScreen({ profile, addToHistory, showToast }) {
  const [url, setUrl]           = useState("");
  const [launched, setLaunched] = useState(false);
  const [showMeta, setShowMeta] = useState(false);
  const [meta, setMeta]         = useState({ positionTitle:"", company:"" });
  const [launchedUrl, setLaunchedUrl] = useState("");

  // Profile field pairs for the reference panel
  const profileRows = [
    ["Full Name",       profile.fullName],
    ["Email",           profile.email],
    ["Phone",           profile.phone],
    ["Address",         [profile.addressStreet, profile.addressCity, profile.addressState, profile.addressZip].filter(Boolean).join(", ")],
    ["LinkedIn",        profile.linkedin],
    ["Portfolio",       profile.portfolio],
    ["Desired Title",   profile.desiredTitle],
    ["Salary Range",    profile.salaryMin && profile.salaryMax ? `$${Number(profile.salaryMin).toLocaleString()} – $${Number(profile.salaryMax).toLocaleString()}` : ""],
    ["Work Auth",       profile.workAuth],
    ["Employment",      profile.employmentType],
    ["Experience",      profile.yearsExperience ? `${profile.yearsExperience} years` : ""],
    ["Education",       profile.educationLevel],
    ["University",      profile.university],
    ["Grad Year",       profile.graduationYear],
    ["Authorized",      profile.authorizedToWork],
    ["Sponsorship",     profile.requiresSponsorship],
    ["Start Date",      profile.startDate],
    ["Relocate",        profile.willingToRelocate],
    ["Resume",          profile.resumeFileName],
    ["Cover Letter",    profile.coverLetterFileName],
    ["Emergency Name",  profile.emergencyContactName],
    ["Emergency Phone", profile.emergencyContactPhone],
  ].filter(([,v]) => v);

  const handleLaunch = () => {
    if (!url.trim()) return;
    let u = url.trim();
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    window.open(u, "_blank", "noopener,noreferrer");
    setLaunchedUrl(u);
    setLaunched(true);
  };

  const handleReset = () => { setLaunched(false); setUrl(""); setLaunchedUrl(""); setShowMeta(false); };

  const handleConfirm = () => {
    addToHistory({ id:Date.now(), submissionDate:new Date().toISOString(), ...meta, jobUrl:launchedUrl });
    showToast("🎉 Application recorded successfully!", "success");
    handleReset();
  };

  return (
    <div style={{ padding:"36px 44px", maxWidth:1100 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:30,fontWeight:800,color:C.navyDark,margin:0,fontFamily:"'Poppins',sans-serif" }}>Submit Application</h1>
        <p style={{ color:C.grayMid,fontSize:14,marginTop:5 }}>Open a job posting, fill it using your profile data below, then record it here.</p>
      </div>

      {/* URL Input Card */}
      <Card style={{ padding:"28px 32px", marginBottom:20 }}>
        <label style={{ display:"block",fontSize:12,color:C.grayMid,fontWeight:600,marginBottom:10,textTransform:"uppercase",letterSpacing:"0.05em" }}>
          Job Application URL
        </label>
        <div style={{ display:"flex", gap:12 }}>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key==="Enter" && handleLaunch()}
            placeholder="https://company.com/careers/apply/12345"
            style={{ ...iStyle(true), flex:1, fontSize:14 }}
          />
          <Btn variant="primary" onClick={handleLaunch} disabled={!url.trim()}>
            <ExternalLink size={15}/> Open in New Tab
          </Btn>
        </div>

        {/* Why not iframe — transparent explanation */}
        <div style={{ marginTop:14, background:C.blueLight, border:`1px solid #BDD0FF`, borderRadius:10, padding:"12px 16px", display:"flex", gap:10, alignItems:"flex-start" }}>
          <AlertCircle size={15} color={C.navy} style={{ marginTop:1,flexShrink:0 }}/>
          <p style={{ fontSize:13,color:C.navy,lineHeight:1.6,margin:0 }}>
            <strong>Why a new tab?</strong> Most job sites use a security header called <code style={{ background:"#D6E4FF",borderRadius:3,padding:"1px 4px",fontSize:12 }}>X-Frame-Options</code> which blocks embedding in iframes. The application opens in a new tab — use the <strong>Profile Reference</strong> panel below to copy your details into the form.
          </p>
        </div>
      </Card>

      {/* Launched state */}
      {launched && !showMeta && (
        <Card style={{ padding:"22px 28px", marginBottom:20, borderLeft:`4px solid ${C.blue}` }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <div>
              <div style={{ fontSize:14,fontWeight:700,color:C.navyDark,marginBottom:2 }}>Application opened in new tab</div>
              <div style={{ fontSize:12,color:C.grayMid,wordBreak:"break-all" }}>{launchedUrl}</div>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="ghost" onClick={handleReset}><X size={14}/> Cancel</Btn>
              <Btn variant="success" onClick={()=>setShowMeta(true)}><Check size={14}/> Mark as Submitted</Btn>
            </div>
          </div>
        </Card>
      )}

      {/* Profile Reference Panel */}
      <Card style={{ padding:"24px 28px" }}>
        <h2 style={{ fontSize:15,fontWeight:700,color:C.navyDark,marginBottom:4 }}>📋 Profile Reference</h2>
        <p style={{ fontSize:13,color:C.grayMid,marginBottom:20 }}>Copy these values directly into the job application form.</p>

        {profileRows.length === 0 ? (
          <div style={{ textAlign:"center", padding:"32px 0", color:C.grayMid, fontSize:14 }}>
            <User size={32} color={C.grayLine} style={{ display:"block",margin:"0 auto 10px" }}/>
            No profile data yet. Go to <strong>User Profile</strong> to enter your information.
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:12 }}>
            {profileRows.map(([label, value]) => (
              <div key={label} style={{ background:C.grayBg, borderRadius:8, padding:"10px 14px", border:`1px solid ${C.grayLine}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:11,color:C.grayMid,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3 }}>{label}</div>
                    <div style={{ fontSize:13.5,color:C.dark,fontWeight:500,wordBreak:"break-all" }}>{value}</div>
                  </div>
                  <CopyBtn text={value}/>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Record Submission Modal */}
      {showMeta && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:8 }}>
              <div style={{ width:42,height:42,borderRadius:12,background:C.blueLight,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Check size={20} color={C.navy}/>
              </div>
              <h2 style={{ fontSize:20,fontWeight:800,color:C.navyDark,fontFamily:"'Poppins',sans-serif" }}>Record Submission</h2>
            </div>
            <p style={{ fontSize:13.5,color:C.grayMid,marginBottom:24 }}>Enter position details to save this application to your history.</p>
            {[
              {key:"positionTitle", label:"Position Title", placeholder:"e.g. Senior Engineer"},
              {key:"company",       label:"Company",        placeholder:"e.g. Acme Corp"},
            ].map(f=>(
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={{ display:"block",fontSize:12,color:C.grayMid,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em" }}>{f.label}</label>
                <input
                  type="text"
                  value={meta[f.key]}
                  onChange={e=>setMeta(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.placeholder}
                  style={iStyle(true)}
                />
              </div>
            ))}
            <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:28 }}>
              <Btn variant="ghost" onClick={()=>setShowMeta(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={handleConfirm}><Check size={14}/> Save to History</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HISTORIC APPLICATIONS ────────────────────────────────────────────────────
function HistoricApplications({ history, setHistory, showToast }) {
  const [sel,   setSel]   = useState(null);
  const [draft, setDraft] = useState(null);

  const open  = app => { setSel(app); setDraft({...app}); };
  const close = ()  => { setSel(null); setDraft(null); };

  const handleSave = () => {
    const updated = history.map(a => a.id===draft.id ? draft : a);
    setHistory(updated);
    persist(SK.HISTORY, updated);
    showToast("Application updated.", "success");
    close();
  };

  return (
    <div style={{ padding:"36px 44px", maxWidth:1100 }}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:30,fontWeight:800,color:C.navyDark,margin:0,fontFamily:"'Poppins',sans-serif" }}>Historic Applications</h1>
        <p style={{ color:C.grayMid,fontSize:14,marginTop:5 }}>{history.length} application{history.length!==1?"s":""} on record</p>
      </div>
      <Card style={{ overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.navyDark }}>
              {["Submission Date","Position Title","Company","Job Posting URL",""].map(h=>(
                <th key={h} style={{ textAlign:"left",padding:"14px 18px",fontSize:11.5,color:"rgba(255,255,255,0.65)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.length===0 ? (
              <tr><td colSpan={5} style={{ padding:"60px 18px",textAlign:"center",color:C.grayMid,fontSize:14 }}>
                <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12 }}>
                  <Send size={36} color={C.grayLine}/>
                  <p>No applications yet. Head to the Applications tab to get started.</p>
                </div>
              </td></tr>
            ) : history.slice().reverse().map((app,i)=>(
              <tr key={app.id} onClick={()=>open(app)}
                style={{ borderBottom:`1px solid ${C.grayLine}`,cursor:"pointer",background:i%2===0?C.white:C.grayBg,transition:"background 0.12s" }}
                onMouseEnter={e=>e.currentTarget.style.background=C.blueLight}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?C.white:C.grayBg}
              >
                <td style={tdStyle}><span style={{ background:C.blueLight,color:C.navy,padding:"4px 10px",borderRadius:6,fontSize:12.5,fontWeight:600 }}>{fmtDate(app.submissionDate)}</span></td>
                <td style={{ ...tdStyle,fontWeight:700,color:C.navyDark }}>{app.positionTitle||"—"}</td>
                <td style={tdStyle}>{app.company||"—"}</td>
                <td style={tdStyle}><span style={{ color:C.blue,fontSize:13,maxWidth:260,display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{app.jobUrl||"—"}</span></td>
                <td style={{ ...tdStyle,textAlign:"right" }}><Eye size={15} color={C.grayMid}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {sel && draft && (
        <div style={overlayStyle} onClick={e=>{ if(e.target===e.currentTarget) close(); }}>
          <div style={modalStyle}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24 }}>
              <h2 style={{ fontSize:20,fontWeight:800,color:C.navyDark,fontFamily:"'Poppins',sans-serif" }}>Application Details</h2>
              <button onClick={close} style={{ background:"none",border:"none",cursor:"pointer",color:C.grayMid,display:"flex",padding:4 }}><X size={20}/></button>
            </div>
            {[
              {key:"positionTitle",  label:"Position Title"},
              {key:"company",        label:"Company"},
              {key:"jobUrl",         label:"Job Posting URL"},
              {key:"submissionDate", label:"Submission Date", readonly:true, display:fmtDate(draft.submissionDate)},
            ].map(f=>(
              <div key={f.key} style={{ marginBottom:16 }}>
                <label style={{ display:"block",fontSize:12,color:C.grayMid,fontWeight:600,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em" }}>{f.label}</label>
                {f.readonly
                  ? <div style={{ ...iStyle(false) }}>{f.display}</div>
                  : <input type="text" value={draft[f.key]||""} onChange={e=>setDraft(p=>({...p,[f.key]:e.target.value}))} style={iStyle(true)}/>
                }
              </div>
            ))}
            <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:28 }}>
              <Btn variant="ghost" onClick={close}>Close without Saving</Btn>
              <Btn variant="primary" onClick={handleSave}><Save size={14}/> Save Changes</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const NAV = [
  {id:"dashboard",    label:"Dashboard",            icon:LayoutDashboard},
  {id:"profile",      label:"User Profile",          icon:User},
  {id:"applications", label:"Applications",          icon:Send},
  {id:"history",      label:"Historic Applications", icon:History},
];

function Sidebar({ active, setActive }) {
  return (
    <div style={{ width:242,background:C.navyDark,display:"flex",flexDirection:"column",padding:"0 0 24px",flexShrink:0 }}>
      <div style={{ padding:"28px 24px 24px",borderBottom:`1px solid rgba(255,255,255,0.1)`,marginBottom:12 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:38,height:38,background:C.blue,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Briefcase size={20} color="#fff"/>
          </div>
          <div>
            <div style={{ fontSize:16,fontWeight:800,color:C.white,fontFamily:"'Poppins',sans-serif",lineHeight:1.2 }}>AutoApply</div>
            <div style={{ fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:1 }}>Job Assistant</div>
          </div>
        </div>
      </div>
      <nav style={{ flex:1,padding:"8px 12px" }}>
        <div style={{ fontSize:10,color:"rgba(255,255,255,0.28)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",padding:"8px 12px 10px" }}>Navigation</div>
        {NAV.map(item=>{
          const Icon=item.icon, on=active===item.id;
          return (
            <button key={item.id} onClick={()=>setActive(item.id)} style={{
              display:"flex",alignItems:"center",gap:12,width:"100%",
              padding:"11px 14px",borderRadius:9,border:"none",cursor:"pointer",
              background:on?C.blue:"transparent",
              color:on?C.white:"rgba(255,255,255,0.5)",
              fontSize:13.5,fontWeight:on?700:400,
              marginBottom:3,transition:"all 0.15s",textAlign:"left",fontFamily:"inherit"
            }}>
              <Icon size={17}/><span style={{ flex:1 }}>{item.label}</span>{on&&<ChevronRight size={14}/>}
            </button>
          );
        })}
      </nav>
      <div style={{ padding:"0 16px" }}>
        <div style={{ background:"rgba(255,255,255,0.06)",borderRadius:10,padding:"12px 14px",border:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:6,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em" }}>Auto-Fill Status</div>
          <div style={{ display:"flex",alignItems:"center",gap:7 }}>
            <div style={{ width:8,height:8,borderRadius:"50%",background:"#22c55e",boxShadow:"0 0 6px #22c55e" }}/>
            <span style={{ fontSize:12.5,color:"rgba(255,255,255,0.65)",fontWeight:600 }}>Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen,  setScreen]  = useState("dashboard");
  const [profile, setProfile] = useState(()=>({...EMPTY_PROFILE,...load(SK.PROFILE,{})}));
  const [history, setHistory] = useState(()=>load(SK.HISTORY,[]));
  const { toasts, add:showToast, remove:removeToast } = useToast();

  const addToHistory = entry => {
    const updated = [...history, entry];
    setHistory(updated);
    persist(SK.HISTORY, updated);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body, #root { height:100%; }
        body { font-family:'Inter',-apple-system,sans-serif; background:${C.grayBg}; }
        input, select, button, textarea { font-family:inherit; }
        input:focus, select:focus { border-color:${C.blue} !important; box-shadow:0 0 0 3px ${C.blueLight}; outline:none; }
        ::-webkit-scrollbar { width:6px; height:6px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${C.grayLine}; border-radius:3px; }
        @keyframes slideUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
        button { outline:none; }
      `}</style>
      <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
        <Sidebar active={screen} setActive={setScreen}/>
        <main style={{ flex:1, overflowY:"auto", background:C.grayBg }}>
          {screen==="dashboard"    && <Dashboard history={history}/>}
          {screen==="profile"      && <UserProfile profile={profile} setProfile={setProfile} showToast={showToast}/>}
          {screen==="applications" && <ApplicationsScreen profile={profile} addToHistory={addToHistory} showToast={showToast}/>}
          {screen==="history"      && <HistoricApplications history={history} setHistory={setHistory} showToast={showToast}/>}
        </main>
      </div>
      <Toast toasts={toasts} remove={removeToast}/>
    </>
  );
}
