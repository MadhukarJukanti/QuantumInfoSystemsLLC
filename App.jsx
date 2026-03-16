import { useState, useEffect, useRef } from "react";
import { auth, db, googleProvider } from "./firebase.js";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { collection, doc, getDocs, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";

// ── Exact design tokens from quantuminfosystems.com static site
const C = {
  navy:      '#1a3a5c',
  blue:      '#2a6496',
  blueLt:    '#5ba8d4',
  blueTint:  '#eef6fb',
  blueRule:  '#d0e8f5',
  text:      '#2d3748',
  textLt:    '#718096',
  textXs:    '#a0aec0',
  white:     '#ffffff',
  off:       '#f9fbfd',
  border:    '#e8f0f7',
  warn:      '#f4b942',
  danger:    '#e53e3e',
  success:   '#38a169',
  purple:    '#6b46c1',
  sh:        '0 2px 16px rgba(42,100,150,0.08)',
  shMd:      '0 8px 32px rgba(42,100,150,0.12)',
  shLg:      '0 20px 60px rgba(42,100,150,0.16)',
};

const DNA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none">
  <defs>
    <linearGradient id="dna-top" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5ba8d4"/><stop offset="100%" stop-color="#2a6496"/>
    </linearGradient>
    <linearGradient id="dna-bot" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a6496"/><stop offset="100%" stop-color="#5ba8d4"/>
    </linearGradient>
    <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5ba8d4" stop-opacity="0.9"/><stop offset="100%" stop-color="#2a6496" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <ellipse cx="100" cy="100" rx="62" ry="22" stroke="url(#orbit-grad)" stroke-width="2.5" fill="none" opacity="0.75"/>
  <ellipse cx="100" cy="100" rx="62" ry="22" stroke="url(#orbit-grad)" stroke-width="2.5" fill="none" opacity="0.75" transform="rotate(60 100 100)"/>
  <ellipse cx="100" cy="100" rx="62" ry="22" stroke="url(#orbit-grad)" stroke-width="2.5" fill="none" opacity="0.75" transform="rotate(-60 100 100)"/>
  <path d="M 84 28 C 72 50, 112 72, 100 94 C 88 116, 72 130, 84 172" stroke="url(#dna-top)" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <path d="M 116 28 C 128 50, 88 72, 100 94 C 112 116, 128 130, 116 172" stroke="url(#dna-bot)" stroke-width="3.5" stroke-linecap="round" fill="none"/>
  <line x1="88" y1="42" x2="112" y2="38" stroke="#5ba8d4" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
  <line x1="93" y1="57" x2="107" y2="58" stroke="#3d8fc0" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
  <line x1="103" y1="71" x2="97" y2="74" stroke="#2a6496" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
  <line x1="100" y1="86" x2="100" y2="90" stroke="#2a6496" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
  <line x1="97" y1="102" x2="103" y2="106" stroke="#3d8fc0" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
  <line x1="93" y1="118" x2="107" y2="122" stroke="#5ba8d4" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
  <line x1="88" y1="134" x2="112" y2="138" stroke="#5ba8d4" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
  <line x1="88" y1="150" x2="112" y2="154" stroke="#3d8fc0" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
  <line x1="90" y1="165" x2="110" y2="163" stroke="#2a6496" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
  <circle cx="84" cy="28" r="4" fill="#5ba8d4"/>
  <circle cx="86" cy="60" r="3.5" fill="#3d8fc0"/>
  <circle cx="94" cy="94" r="3.5" fill="#2a6496"/>
  <circle cx="88" cy="130" r="3.5" fill="#3d8fc0"/>
  <circle cx="84" cy="172" r="4" fill="#5ba8d4"/>
  <circle cx="116" cy="28" r="4" fill="#5ba8d4"/>
  <circle cx="114" cy="60" r="3.5" fill="#3d8fc0"/>
  <circle cx="106" cy="94" r="3.5" fill="#2a6496"/>
  <circle cx="112" cy="130" r="3.5" fill="#3d8fc0"/>
  <circle cx="116" cy="172" r="4" fill="#5ba8d4"/>
  <circle cx="100" cy="100" r="7" fill="url(#dna-top)"/>
  <circle cx="100" cy="100" r="3.5" fill="#fff" opacity="0.9"/>
</svg>`;

const GS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Poppins', sans-serif; background: #f9fbfd; color: #2d3748; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #eef6fb; }
  ::-webkit-scrollbar-thumb { background: #d0e8f5; border-radius: 4px; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
  @keyframes spin { to{transform:rotate(360deg);} }
  @keyframes pulse2 { 0%,100%{opacity:1;}50%{opacity:.4;} }
  .fu { animation: fadeUp .3s ease forwards; }
  .fi { animation: fadeIn .25s ease forwards; }
  .spin { animation: spin 1s linear infinite; display:inline-block; }
  @keyframes slideIn { from{transform:translateX(100%);} to{transform:translateX(0);} }
  .drawer { animation: slideIn .28s cubic-bezier(.4,0,.2,1) forwards; }
  input:focus, select:focus, textarea:focus { border-color: #5ba8d4 !important; box-shadow: 0 0 0 3px rgba(91,168,212,0.12) !important; outline: none; }
  button { transition: all .2s ease; cursor: pointer; }
  button:hover { transform: translateY(-1px); }
  @keyframes drawerIn { from{transform:translateX(100%); opacity:0;} to{transform:translateX(0); opacity:1;} }
  @keyframes modalPop { from{opacity:0;transform:scale(0.95) translateY(16px);}to{opacity:1;transform:scale(1) translateY(0);} }
  .modal-box { animation: modalPop .25s cubic-bezier(.16,1,.3,1) forwards; }
  @keyframes modalPop { from{opacity:0;transform:scale(0.95) translateY(16px);}to{opacity:1;transform:scale(1) translateY(0);} }
  .modal-box { animation: modalPop .25s cubic-bezier(.16,1,.3,1) forwards; }
`;

const STAGES = [
  { id:'new',       label:'New',       color:'#2a6496', bg:'#eef6fb' },
  { id:'submitted', label:'Submitted', color:'#b7791f', bg:'#fffaf0' },
  { id:'interview', label:'Interview', color:'#6b46c1', bg:'#faf5ff' },
  { id:'placed',    label:'Placed',    color:'#276749', bg:'#f0fff4' },
  { id:'rejected',  label:'Rejected',  color:'#c53030', bg:'#fff5f5' },
];

const RESOURCES = [
  { id:'java',   label:'Senior Java Engineer',   color:'#2a6496', bg:'#eef6fb'  },
  { id:'dotnet', label:'Senior .NET Developer',  color:'#b7791f', bg:'#fffaf0'  },
  { id:'devops', label:'Senior DevOps Engineer', color:'#276749', bg:'#f0fff4'  },
  { id:'data',   label:'Senior Data Engineer',   color:'#6b46c1', bg:'#faf5ff'  },
];

const SEED_CONSULTANTS = [
  { id:'c1', name:'Alex Rivera',    role:'java',   rate:'$85', avail:'Immediate', skills:['Java 17','Spring Boot','Kafka','AWS'],   email:'alex@example.com',   phone:'555-0101', status:'available', resumeName:'AlexRivera_Resume.pdf',   notes:'Strong fintech domain', yoe:12 },
  { id:'c2', name:'Jordan Kim',     role:'devops', rate:'$90', avail:'Immediate', skills:['Kubernetes','Terraform','AWS','Docker'], email:'jordan@example.com', phone:'555-0102', status:'available', resumeName:'JordanKim_Resume.pdf',   notes:'HIPAA certified', yoe:10 },
  { id:'c3', name:'Morgan Patel',   role:'data',   rate:'$88', avail:'Immediate', skills:['Databricks','Snowflake','Python','dbt'], email:'morgan@example.com', phone:'555-0103', status:'available', resumeName:'MorganPatel_Resume.pdf', notes:'Healthcare data expert', yoe:9  },
  { id:'c4', name:'Casey Thompson', role:'dotnet', rate:'$82', avail:'Immediate', skills:['C#','.NET 8','Azure','ASP.NET Core'],   email:'casey@example.com',  phone:'555-0104', status:'available', resumeName:'CaseyThompson_Resume.pdf', notes:'Finance background', yoe:11 },
];
const SEED_RECRUITERS = [
  { id:'r1', name:'Sarah Johnson',  company:'TechForce Staffing',    email:'sjohnson@techforce.com',  phone:'555-1001', vertical:'Finance,Healthcare', hotlists:12, lastContact:'2026-03-05', notes:'Sends daily hotlists 9am' },
  { id:'r2', name:'Mike Chen',      company:'ApexTech Solutions',    email:'mchen@apextech.com',      phone:'555-1002', vertical:'Commercial',          hotlists:8,  lastContact:'2026-03-04', notes:'Prefers C2C only' },
  { id:'r3', name:'Priya Williams', company:'DataBridge Recruiting', email:'pwilliams@databridge.com',phone:'555-1003', vertical:'Healthcare',           hotlists:5,  lastContact:'2026-03-06', notes:'Strong hospital network' },
];
const SEED_CLIENTS = [
  { id:'cl1', name:'HealthFirst Systems', industry:'Healthcare', contact:'David Park',  email:'dpark@healthfirst.com', openReqs:3, tier:'A', notes:'HIPAA strict' },
  { id:'cl2', name:'Capital One Markets', industry:'Finance',    contact:'Lisa Brown',  email:'lbrown@capitalone.com', openReqs:2, tier:'A', notes:'Strong Java demand' },
  { id:'cl3', name:'RetailCo Digital',    industry:'Commercial', contact:'Tom Singh',   email:'tsingh@retailco.com',   openReqs:1, tier:'B', notes:'DevOps transformation' },
];
const SEED_JOBS = [
  { id:'j1', title:'Senior Java Developer',    stage:'submitted', consultantId:'c1', recruiterId:'r1', clientId:'cl2', location:'Remote',    rate:'$85/hr', duration:'12 months', skills:'Java, Spring Boot, Kafka', submittedDate:'2026-03-05', interviewDate:'', notes:'Good fit', source:'hotlist' },
  { id:'j2', title:'DevOps Engineer – Cloud',  stage:'interview', consultantId:'c2', recruiterId:'r2', clientId:'cl3', location:'Dallas TX', rate:'$92/hr', duration:'6 months',  skills:'Kubernetes, Terraform',   submittedDate:'2026-03-03', interviewDate:'2026-03-10 2:00 PM', notes:'2nd round', source:'dice' },
  { id:'j3', title:'Data Engineer – HealthIT', stage:'new',       consultantId:'c3', recruiterId:'r3', clientId:'cl1', location:'Remote',    rate:'$88/hr', duration:'12 months', skills:'Databricks, Snowflake',   submittedDate:'', interviewDate:'', notes:'', source:'hotlist' },
];
const SEED_INTERVIEWS = [
  { id:'i1', jobId:'j2', consultantId:'c2', clientId:'cl3', date:'2026-03-10', time:'2:00 PM', type:'Video', interviewer:'Tom Singh', status:'scheduled', notes:'Prepare Kubernetes questions', followupDate:'2026-03-12' },
];

// ── Shared style helpers
const S = {
  inp: { background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:10, padding:'11px 14px', color:'#1e293b', fontSize:13, width:'100%', fontFamily:"'Poppins',sans-serif", fontWeight:400, transition:'all .15s' },
  ta:  { background:C.white, border:`1.5px solid ${C.border}`, borderRadius:9, padding:'10px 13px', color:C.text, fontSize:13, width:'100%', fontFamily:"'Poppins',sans-serif", resize:'vertical', lineHeight:1.7 },
  lbl: { fontSize:11, color:C.navy, fontWeight:600, marginBottom:5, display:'block', letterSpacing:'.2px' },
  btn: (solid=true, color=C.navy) => solid
    ? { background:color, color:'#fff', border:`2px solid ${color}`, borderRadius:999, padding:'9px 22px', fontSize:13, fontWeight:600, fontFamily:"'Poppins',sans-serif", boxShadow:'0 4px 12px rgba(26,58,92,0.18)', cursor:'pointer', whiteSpace:'nowrap' }
    : { background:'transparent', color:color, border:`2px solid ${C.blueRule}`, borderRadius:999, padding:'9px 22px', fontSize:13, fontWeight:600, fontFamily:"'Poppins',sans-serif", cursor:'pointer', whiteSpace:'nowrap' },
  pill:(color, bg) => ({ display:'inline-flex', alignItems:'center', gap:4, background:bg||`${color}15`, color, fontSize:10.5, fontWeight:600, letterSpacing:'.5px', padding:'3px 11px', borderRadius:999, border:`1px solid ${color}30` }),
  card: { background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'22px 24px', boxShadow:C.sh },
  cardHover: { background:C.white, border:`1px solid ${C.border}`, borderRadius:12, padding:'22px 24px', boxShadow:C.sh, transition:'transform .25s, box-shadow .25s, border-color .25s' },
  modal: { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(15,30,50,0.55)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:'32px' },
  mbox: (w=660) => ({ background:C.white, border:`1px solid ${C.border}`, borderRadius:20, width:'100%', maxWidth:w, maxHeight:'80vh', overflowY:'auto', boxShadow:'0 32px 80px rgba(15,30,50,0.28)', padding:'28px 32px' }),
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 },
  h1: { fontFamily:"'Poppins',sans-serif", fontSize:22, fontWeight:700, color:C.navy, letterSpacing:'-0.5px' },
  h2: { fontFamily:"'Poppins',sans-serif", fontSize:15, fontWeight:600, color:C.navy },
  sep: { height:1, background:C.border, margin:'20px 0' },
  editPage: { background:C.white, border:`1px solid ${C.border}`, borderRadius:14, padding:'32px 36px', maxWidth:680, margin:'0 auto', boxShadow:C.shMd },
  editHdr: { display:'flex', alignItems:'center', gap:14, marginBottom:28, paddingBottom:20, borderBottom:`1px solid ${C.border}` },
  tag: { fontSize:10, fontWeight:700, letterSpacing:3, textTransform:'uppercase', color:C.blue },
  toast:(t) => ({ position:'fixed', bottom:24, right:24, background:t==='err'?'#fff5f5':C.white, border:`1px solid ${t==='err'?C.danger:C.success}`, color:t==='err'?C.danger:C.success, borderRadius:10, padding:'12px 22px', fontSize:13, fontWeight:500, zIndex:400, animation:'fadeUp .2s ease', boxShadow:C.shMd }),
};

// ── DNA Logo component
function Logo({ size=36 }) {
  return (
    <div style={{ width:size, height:size, flexShrink:0 }}
      dangerouslySetInnerHTML={{ __html: DNA_SVG }}/>
  );
}

// ════════════════════════════════════════════════
// LOGIN SCREEN — Firebase Auth
// ════════════════════════════════════════════════
function LoginScreen() {
  const [mode, setMode]         = useState('login'); // 'login' | 'reset'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const friendlyError = (code) => {
    if (['auth/user-not-found','auth/wrong-password','auth/invalid-credential'].includes(code))
      return 'Invalid email or password.';
    if (code === 'auth/invalid-email') return 'Please enter a valid email address.';
    if (code === 'auth/popup-closed-by-user') return 'Google sign-in was cancelled.';
    if (code === 'auth/user-disabled') return 'This account has been disabled. Contact your admin.';
    return 'Something went wrong. Please try again.';
  };

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!email.trim()) { setError('Email is required'); return; }
    if (mode !== 'reset' && !password.trim()) { setError('Password is required'); return; }
    setLoading(true);
    try {
      if (mode === 'reset') {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Reset link sent! Check your email.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e) { setError(friendlyError(e.code)); }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) { setError(friendlyError(e.code)); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(175deg,#dff0fa 0%,#eef6fb 30%,#f6fafd 60%,#ffffff 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:20, position:'relative', overflow:'hidden', fontFamily:"'Poppins',sans-serif" }}>
      <style>{GS}</style>

      {/* Dot grid overlay — exact from static site */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(#b8ddf2 1px, transparent 1px)', backgroundSize:'28px 28px', opacity:.35, pointerEvents:'none' }}/>
      {/* Radial glow */}
      <div style={{ position:'absolute', top:-160, left:'50%', transform:'translateX(-50%)', width:900, height:900, borderRadius:'50%', background:'radial-gradient(circle,rgba(91,168,212,0.13) 0%,transparent 68%)', pointerEvents:'none' }}/>

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:440 }} className="fu">
        {/* Logo lockup */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:32 }}>
          <div style={{ display:'flex', alignItems:'center', gap:11, marginBottom:10 }}>
            <Logo size={52}/>
            <div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:18, color:C.navy, letterSpacing:'-0.3px', lineHeight:1.15 }}>QuantumInfo Systems</div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:500, fontSize:9.5, color:C.blueLt, letterSpacing:'2.5px', textTransform:'uppercase' }}>Talent Solutions</div>
            </div>
          </div>
          <div style={{ fontSize:13, color:C.textLt, fontWeight:300 }}>
            {mode==='login'  ? 'Sign in to your team account' : mode==='signup' ? 'Create your team account' : 'Reset your password'}
          </div>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.92)', border:`1px solid ${C.blueRule}`, borderRadius:16, padding:'32px 30px', boxShadow:C.shLg, backdropFilter:'blur(8px)' }}>

          {mode !== 'reset' && (
            <>
              <button onClick={handleGoogle} disabled={loading}
                style={{ width:'100%', background:C.white, color:C.text, border:`1.5px solid ${C.border}`, borderRadius:9, padding:'11px 20px', fontSize:13.5, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:20, fontFamily:"'Poppins',sans-serif", boxShadow:'0 2px 8px rgba(42,100,150,0.08)' }}>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                </svg>
                {loading ? <span className="spin" style={{color:C.blue}}>⟳</span> : 'Continue with Google'}
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
                <div style={{ flex:1, height:1, background:C.border }}/>
                <span style={{ fontSize:11, color:C.textXs, textTransform:'uppercase', letterSpacing:1 }}>or</span>
                <div style={{ flex:1, height:1, background:C.border }}/>
              </div>
            </>
          )}

          {error   && <div style={{ background:'#fff5f5', border:`1px solid #feb2b2`, color:C.danger, borderRadius:8, padding:'10px 14px', fontSize:12.5, marginBottom:14 }}>⚠ {error}</div>}
          {success && <div style={{ background:'#f0fff4', border:`1px solid #9ae6b4`, color:C.success, borderRadius:8, padding:'10px 14px', fontSize:12.5, marginBottom:14 }}>✓ {success}</div>}

          {mode==='signup' && (
            <div style={{ marginBottom:13 }}>
              <label style={S.lbl}>Full Name</label>
              <input style={S.inp} placeholder="Alex Rivera" value={name} onChange={e=>setName(e.target.value)}/>
            </div>
          )}
          <div style={{ marginBottom:13 }}>
            <label style={S.lbl}>Work Email</label>
            <input style={S.inp} type="email" placeholder="you@quantuminfosystems.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
          </div>
          {mode !== 'reset' && (
            <div style={{ marginBottom:20 }}>
              <label style={S.lbl}>Password</label>
              <input style={S.inp} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSubmit()}/>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{ ...S.btn(), width:'100%', padding:'12px', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {loading ? <span className="spin">⟳</span> : mode==='login' ? '→ Sign In' : '→ Send Reset Link'}
          </button>

          <div style={{ marginTop:18, textAlign:'center', fontSize:12.5, color:C.textLt }}>
            {mode==='login' && (
              <span style={{ color:C.blue, cursor:'pointer' }} onClick={()=>{setMode('reset');setError('');}}>Forgot password?</span>
            )}
            {mode==='reset' && (
              <span style={{ color:C.blue, cursor:'pointer' }} onClick={()=>{setMode('login');setError('');setSuccess('');}}>← Back to sign in</span>
            )}
          </div>
          {mode==='login' && (
            <div style={{ marginTop:16, padding:'12px 14px', background:C.blueTint, border:`1px solid ${C.blueRule}`, borderRadius:8, fontSize:11.5, color:C.textLt, textAlign:'center' }}>
              🔒 Access is by invitation only. Contact your admin to get access.
            </div>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:22, fontSize:11.5, color:C.textXs }}>
          © 2026 Quantum Info Systems · <a href="mailto:hr@quantuminfosystems.com" style={{ color:C.blue, textDecoration:'none' }}>hr@quantuminfosystems.com</a>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════
export default function App() {
  const [user, setUser]               = useState(null);
  const [userRole, setUserRole]       = useState(null); // 'admin' | 'recruiter' | 'viewer' | null
  const [authLoading, setAuthLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [tab, setTab]                 = useState('dashboard');
  const [consultants, setConsultants] = useState(SEED_CONSULTANTS);
  const [recruiters,  setRecruiters]  = useState(SEED_RECRUITERS);
  const [clients,     setClients]     = useState(SEED_CLIENTS);
  const [jobs,        setJobs]        = useState(SEED_JOBS);
  const [interviews,  setInterviews]  = useState(SEED_INTERVIEWS);
  const [submissions, setSubmissions] = useState([]);
  const [modal,       setModal]       = useState(null);
  const [toast,       setToast]       = useState(null);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [aiResult,    setAiResult]    = useState(null);
  const [sideOpen,    setSideOpen]    = useState(true);

  // ── Firebase Auth listener + role check
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null); setUserRole(null); setAccessDenied(false);
        setAuthLoading(false);
        return;
      }
      try {
        // Check if user exists in our whitelist
        const userDoc = await getDocs(collection(db, 'users'));
        const users = userDoc.docs.map(d => ({ id: d.id, ...d.data() }));
        const match = users.find(u => u.email?.toLowerCase() === firebaseUser.email?.toLowerCase());
        if (!match || match.status === 'disabled') {
          // Not whitelisted — sign them out immediately
          await signOut(auth);
          setUser(null); setUserRole(null); setAccessDenied(true);
          setAuthLoading(false);
          return;
        }
        setUser(firebaseUser);
        setUserRole(match.role || 'viewer');
        setAccessDenied(false);
      } catch (e) {
        // If users collection empty (first time setup), let admin through
        setUser(firebaseUser);
        setUserRole('admin');
        setAccessDenied(false);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // ── Real-time Firestore listeners
  useEffect(() => {
    if (!user) return;
    const unsubs = [
      onSnapshot(collection(db,'consultants'), s => { if(!s.empty) setConsultants(s.docs.map(d=>({id:d.id,...d.data()}))); }),
      onSnapshot(collection(db,'recruiters'),  s => { if(!s.empty) setRecruiters(s.docs.map(d=>({id:d.id,...d.data()}))); }),
      onSnapshot(collection(db,'clients'),     s => { if(!s.empty) setClients(s.docs.map(d=>({id:d.id,...d.data()}))); }),
      onSnapshot(collection(db,'jobs'),        s => { if(!s.empty) setJobs(s.docs.map(d=>({id:d.id,...d.data()}))); }),
      onSnapshot(collection(db,'interviews'),  s => { if(!s.empty) setInterviews(s.docs.map(d=>({id:d.id,...d.data()}))); }),
      onSnapshot(collection(db,'submissions'), s => { setSubmissions(s.docs.map(d=>({id:d.id,...d.data()}))); }),
    ];
    return () => unsubs.forEach(u => u());
  }, [user]);

  // ── Save helpers — write a single doc to Firestore
  const saveDoc = async (col, id, data) => {
    try { await setDoc(doc(db, col, id), data); } catch (e) { console.error('Save error:', e); }
  };
  const deleteFireDoc = async (col, id) => {
    try { await deleteDoc(doc(db, col, id)); } catch (e) { console.error('Delete error:', e); }
  };

  const handleLogout = async () => { await signOut(auth); };
  const showToast = (msg,type='ok') => { setToast({msg,type}); setTimeout(()=>setToast(null),3200); };
  const closeModal = () => { setModal(null); setAiResult(null); };

  const runAiMatch = async (jobText, resumeText) => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/claude', { method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:
          `You are a tech staffing AI. Return ONLY JSON (no markdown):\n{"matchScore":0-100,"matchReason":"2 sentences","bestResource":"Java|.NET|DevOps|Data","emailSubject":"string","emailBody":"full email","keySkillsMatched":["s1"],"gaps":["g1"]}\nJOB:\n${jobText}\nCONSULTANT:\n${resumeText}`}] }) });
      const data = await res.json();
      const txt = data.content?.map(c=>c.text||'').join('')||'';
      setAiResult(JSON.parse(txt.replace(/```json|```/g,'').trim()));
    } catch { showToast('AI error — check connection','err'); }
    setAiLoading(false);
  };

  if (authLoading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(175deg,#dff0fa,#eef6fb)',fontFamily:"'Poppins',sans-serif"}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:28,marginBottom:12}} className="spin">⟳</div>
        <div style={{color:'#2a6496',fontSize:14}}>Loading...</div>
      </div>
    </div>
  );
  if (accessDenied) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(175deg,#dff0fa,#eef6fb)',fontFamily:"'Poppins',sans-serif",padding:20}}>
      <div style={{background:'#fff',borderRadius:16,padding:'40px 36px',maxWidth:400,textAlign:'center',boxShadow:'0 20px 60px rgba(26,58,92,0.16)'}}>
        <div style={{fontSize:40,marginBottom:16}}>🔒</div>
        <div style={{fontFamily:"'Poppins',sans-serif",fontWeight:700,fontSize:18,color:'#1a3a5c',marginBottom:10}}>Access Denied</div>
        <div style={{fontSize:13.5,color:'#718096',lineHeight:1.7,marginBottom:24}}>Your account has not been approved yet. Contact your admin to get access to the Quantum Info Systems platform.</div>
        <a href="mailto:hr@quantuminfosystems.com" style={{display:'inline-block',background:'#1a3a5c',color:'#fff',borderRadius:999,padding:'10px 28px',fontSize:13,fontWeight:600,textDecoration:'none'}}>Contact Admin</a>
      </div>
    </div>
  );
  if (!user) return <LoginScreen />;

  const today = new Date();
  const stats = {
    available:  consultants.filter(c=>c.status==='available').length,
    newJobs:    jobs.filter(j=>j.stage==='new').length,
    submitted:  jobs.filter(j=>j.stage==='submitted').length,
    interviews: jobs.filter(j=>j.stage==='interview').length,
    placed:     jobs.filter(j=>j.stage==='placed').length,
    followups:  submissions.filter(s => {
      if (s.status !== 'sent') return false;
      const days = Math.floor((today - new Date(s.sentAt)) / 86400000);
      return days >= 3 && s.status !== 'replied';
    }).length,
  };

  const NAV = [
    { id:'dashboard',   icon:'⊞', label:'Dashboard'      },
    { id:'consultants', icon:'◈', label:'Consultants'    },
    { id:'pipeline',    icon:'⇉', label:'Job Pipeline'   },
    { id:'recruiters',  icon:'◎', label:'Recruiters'     },
    { id:'clients',     icon:'▣', label:'Clients'        },
    { id:'interviews',  icon:'◆', label:'Interviews'     },
    { id:'ai',          icon:'✦', label:'AI Matcher'     },
    { id:'import',      icon:'↓', label:'Import Hotlist' },
    { id:'jobfinder',   icon:'🔍', label:'Job Finder'     },
    { id:'submissions', icon:'📤', label:'Submissions'    },
    { id:'analytics',   icon:'📊', label:'Analytics'      },
    ...(userRole==='admin'?[{ id:'users', icon:'👥', label:'Team Access' }]:[]),
  ];

  return (
    <div style={{ background:C.off, minHeight:'100vh', display:'flex', fontFamily:"'Poppins',sans-serif" }}>
      <style>{GS}</style>

      {/* ── SIDEBAR — matches nav style from static site */}
      <div style={{ width:sideOpen?240:64, background:C.white, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:50, transition:'width .2s ease', overflow:'hidden', boxShadow:'2px 0 12px rgba(42,100,150,0.06)' }}>

        {/* Logo header */}
        <div style={{ padding:'18px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10, minHeight:70, background:C.white }}>
          <Logo size={38}/>
          {sideOpen && (
            <div style={{ flex:1, overflow:'hidden' }}>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:13.5, color:C.navy, letterSpacing:'-0.3px', whiteSpace:'nowrap' }}>QuantumInfo Systems</div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:500, fontSize:8.5, color:C.blueLt, letterSpacing:'2.5px', textTransform:'uppercase', marginTop:2 }}>Talent Platform</div>
            </div>
          )}
          <button onClick={()=>setSideOpen(p=>!p)}
            style={{ background:'transparent', border:'none', color:C.textXs, cursor:'pointer', fontSize:14, padding:4, flexShrink:0, borderRadius:6, lineHeight:1 }}>
            {sideOpen ? '←' : '→'}
          </button>
        </div>

        {/* Nav links */}
        <div style={{ flex:1, overflowY:'auto', padding:'10px 8px' }}>
          {NAV.map(n => {
            const active = tab===n.id;
            return (
              <div key={n.id} onClick={()=>setTab(n.id)} title={n.label}
                style={{ display:'flex', alignItems:'center', gap:10, padding:sideOpen?'9px 12px':'9px 10px', cursor:'pointer', borderRadius:9,
                  color:active?C.blue:C.textLt, background:active?C.blueTint:'transparent',
                  fontWeight:active?600:400, fontSize:13, transition:'all .15s', whiteSpace:'nowrap', marginBottom:2, border:`1px solid ${active?C.blueRule:'transparent'}` }}>
                <span style={{ fontSize:14, flexShrink:0, width:18, textAlign:'center' }}>{n.icon}</span>
                {sideOpen && n.label}
              </div>
            );
          })}
        </div>

        {/* Bench indicator */}
        {sideOpen && (
          <div style={{ padding:'10px 16px', borderTop:`1px solid ${C.border}` }}>
            <div style={{ background:C.blueTint, border:`1px solid ${C.blueRule}`, borderRadius:9, padding:'10px 12px', marginBottom:8 }}>
              <div style={{ fontSize:10, color:C.textXs, fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:4 }}>On Bench</div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:22, color:C.navy, lineHeight:1 }}>{stats.available}</div>
              <div style={{ fontSize:11, color:C.blue, marginTop:2 }}>Available · C2C · Immediate</div>
            </div>
            <a href="https://quantuminfosystems.com" target="_blank" rel="noreferrer"
              style={{ display:'flex', alignItems:'center', gap:7, fontSize:11.5, color:C.textLt, textDecoration:'none', padding:'7px 10px', borderRadius:8, transition:'all .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background=C.blueTint;e.currentTarget.style.color=C.blue;}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=C.textLt;}}>
              <span style={{ fontSize:12 }}>🌐</span> quantuminfosystems.com
            </a>
          </div>
        )}

        {/* User */}
        <div style={{ borderTop:`1px solid ${C.border}`, padding:'12px 14px', background:C.off }}>
          {sideOpen ? (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:34, height:34, borderRadius:'50%', background:`linear-gradient(135deg,${C.blueLt},${C.blue})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={{ fontSize:12.5, color:C.navy, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.displayName || user.email?.split('@')[0]}</div>
                <div style={{ fontSize:10.5, color:C.textXs, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</div>
                <div style={{ marginTop:3 }}><span style={{ background:userRole==='admin'?'#faf5ff':userRole==='recruiter'?C.blueTint:C.off, color:userRole==='admin'?'#6b46c1':userRole==='recruiter'?C.blue:C.textLt, fontSize:9.5, fontWeight:700, padding:'2px 7px', borderRadius:999, border:`1px solid ${userRole==='admin'?'#d6bcfa':userRole==='recruiter'?C.blueRule:C.border}`, letterSpacing:.5, textTransform:'uppercase' }}>{userRole||'viewer'}</span></div>
              </div>
              <button onClick={handleLogout} title="Sign out"
                style={{ background:'transparent', border:'none', color:C.textXs, cursor:'pointer', fontSize:15, padding:4, borderRadius:6 }}>⏻</button>
            </div>
          ) : (
            <div style={{ display:'flex', justifyContent:'center' }}>
              <button onClick={handleLogout} title="Sign out"
                style={{ background:'transparent', border:'none', color:C.textXs, cursor:'pointer', fontSize:16 }}>⏻</button>
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT */}
      <div style={{ marginLeft:sideOpen?240:64, flex:1, padding:'28px 32px', transition:'margin-left .2s ease', minHeight:'100vh' }}>
        {tab==='dashboard'   && <Dashboard   stats={stats} jobs={jobs} consultants={consultants} interviews={interviews} submissions={submissions} setTab={setTab} saveDoc={saveDoc} showToast={showToast}/>}
        {tab==='consultants' && <Consultants consultants={consultants} setConsultants={setConsultants} jobs={jobs} modal={modal} setModal={setModal} closeModal={closeModal} showToast={showToast} saveDoc={saveDoc} deleteFireDoc={deleteFireDoc}/>}
        {tab==='pipeline'    && <Pipeline    jobs={jobs} setJobs={setJobs} consultants={consultants} recruiters={recruiters} clients={clients} modal={modal} setModal={setModal} closeModal={closeModal} showToast={showToast} saveDoc={saveDoc} deleteFireDoc={deleteFireDoc}/>}
        {tab==='recruiters'  && <Recruiters  recruiters={recruiters} setRecruiters={setRecruiters} consultants={consultants} jobs={jobs} modal={modal} setModal={setModal} closeModal={closeModal} showToast={showToast} saveDoc={saveDoc} deleteFireDoc={deleteFireDoc}/>}
        {tab==='clients'     && <Clients     clients={clients} setClients={setClients} modal={modal} setModal={setModal} closeModal={closeModal} showToast={showToast} saveDoc={saveDoc} deleteFireDoc={deleteFireDoc}/>}
        {tab==='interviews'  && <Interviews  interviews={interviews} setInterviews={setInterviews} consultants={consultants} clients={clients} modal={modal} setModal={setModal} closeModal={closeModal} showToast={showToast} saveDoc={saveDoc} deleteFireDoc={deleteFireDoc}/>}
        {tab==='ai'          && <AIMatcher   consultants={consultants} runAiMatch={runAiMatch} aiLoading={aiLoading} aiResult={aiResult} setAiResult={setAiResult} showToast={showToast}/>}
        {tab==='import'      && <ImportHotlist jobs={jobs} setJobs={setJobs} recruiters={recruiters} showToast={showToast} setTab={setTab}/>}
        {tab==='jobfinder'   && <JobFinder consultants={consultants} jobs={jobs} setJobs={setJobs} showToast={showToast} saveDoc={saveDoc}/> }
        {tab==='submissions' && <Submissions submissions={submissions} setSubmissions={setSubmissions} consultants={consultants} recruiters={recruiters} jobs={jobs} showToast={showToast} saveDoc={saveDoc} deleteFireDoc={deleteFireDoc}/>}
        {tab==='analytics'   && <Analytics jobs={jobs} submissions={submissions} consultants={consultants} recruiters={recruiters} interviews={interviews}/>}
        {tab==='users' && userRole==='admin' && <UserManager db={db} showToast={showToast} currentUser={user}/>}
      </div>

      {toast && <div style={S.toast(toast.type)}>{toast.msg}</div>}
    </div>
  );
}


// ════════════════════════════════════════════════
// REUSABLE MODAL COMPONENT
// ════════════════════════════════════════════════
function Modal({ title, subtitle, onClose, onSave, saveLabel='Save', width=480, children }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      style={{
        position:'fixed', top:0, left:0, right:0, bottom:0,
        background:'rgba(10,20,40,0.35)',
        backdropFilter:'blur(4px)',
        zIndex:9999,
        display:'flex',
        justifyContent:'flex-end',
      }}
      onClick={onClose}>

      {/* Right-side drawer panel */}
      <div
        style={{
          position:'relative',
          width:'100%',
          maxWidth:width,
          height:'100vh',
          background:'#fff',
          display:'flex',
          flexDirection:'column',
          boxShadow:'-8px 0 48px rgba(10,20,40,0.18)',
          animation:'drawerIn .28s cubic-bezier(.4,0,.2,1) forwards',
        }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          padding:'24px 28px 18px',
          borderBottom:'1.5px solid #e8f0f7',
          display:'flex',
          justifyContent:'space-between',
          alignItems:'flex-start',
          flexShrink:0,
          background:'#fff',
        }}>
          <div>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:19, fontWeight:700, color:'#1a3a5c', letterSpacing:'-0.4px' }}>{title}</div>
            {subtitle && <div style={{ fontSize:12.5, color:'#718096', marginTop:4, fontWeight:400 }}>{subtitle}</div>}
          </div>
          <button
            onClick={onClose}
            onMouseEnter={e=>{ e.currentTarget.style.background='#fee2e2'; e.currentTarget.style.color='#dc2626'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#f1f5f9'; e.currentTarget.style.color='#64748b'; }}
            style={{ background:'#f1f5f9', border:'none', borderRadius:10, width:36, height:36, fontSize:17, color:'#64748b', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s', marginLeft:16, marginTop:2 }}>
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ padding:'24px 28px 16px', overflowY:'auto', flex:1 }}>
          {children}
        </div>

        {/* Sticky footer */}
        <div style={{
          padding:'16px 28px 24px',
          borderTop:'1.5px solid #e8f0f7',
          display:'flex',
          gap:10,
          justifyContent:'flex-end',
          flexShrink:0,
          background:'#f8fafc',
        }}>
          <button
            onClick={onClose}
            onMouseEnter={e=>e.currentTarget.style.background='#f1f5f9'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}
            style={{ background:'transparent', color:'#718096', border:'1.5px solid #e2e8f0', borderRadius:999, padding:'10px 24px', fontSize:13, fontWeight:600, fontFamily:"'Poppins',sans-serif", cursor:'pointer', transition:'all .2s' }}>
            Cancel
          </button>
          <button
            onClick={onSave}
            style={{ background:'#1a3a5c', color:'#fff', border:'none', borderRadius:999, padding:'10px 28px', fontSize:13, fontWeight:600, fontFamily:"'Poppins',sans-serif", cursor:'pointer', boxShadow:'0 4px 14px rgba(26,58,92,0.22)', transition:'all .2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='#2a6496'; e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='#1a3a5c'; e.currentTarget.style.transform=''; }}>
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
// ════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════
function Dashboard({ stats, jobs, consultants, interviews, submissions, setTab, saveDoc, showToast }) {
  const upcoming = interviews.filter(i=>i.status==='scheduled').slice(0,4);
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded]   = useState(false);

  const seedDatabase = async () => {
    setSeeding(true);
    try {
      for (const c of SEED_CONSULTANTS) await saveDoc('consultants', c.id, c);
      for (const r of SEED_RECRUITERS)  await saveDoc('recruiters',  r.id, r);
      for (const cl of SEED_CLIENTS)    await saveDoc('clients',     cl.id, cl);
      for (const j of SEED_JOBS)        await saveDoc('jobs',        j.id, j);
      for (const i of SEED_INTERVIEWS)  await saveDoc('interviews',  i.id, i);
      setSeeded(true);
      showToast('✅ Database initialized! Refresh to see data.');
    } catch(e) { showToast('Error seeding database','err'); }
    setSeeding(false);
  };
  const kpis = [
    { label:'On Bench',    val:stats.available,  color:C.navy,    bg:C.blueTint,   tab:'consultants', sub:'Available C2C' },
    { label:'Submitted',   val:stats.submitted,  color:'#b7791f', bg:'#fffaf0',    tab:'pipeline',    sub:'Awaiting Response' },
    { label:'Interviews',  val:stats.interviews, color:'#6b46c1', bg:'#faf5ff',    tab:'interviews',  sub:'Scheduled' },
    { label:'Placed',      val:stats.placed,     color:'#276749', bg:'#f0fff4',    tab:'pipeline',    sub:'This cycle' },
    { label:'Follow-ups',  val:stats.followups,  color:C.danger,  bg:'#fff5f5',    tab:'submissions', sub:'Need reply (3d+)' },
  ];
  return (
    <div className="fu">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <div style={{ ...S.tag, marginBottom:4 }}>Overview</div>
          <div style={S.h1}>Dashboard</div>
          <div style={{ fontSize:13, color:C.textLt, marginTop:3, fontWeight:300 }}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button style={S.btn(false)} onClick={()=>setTab('import')}>↓ Import Hotlist</button>
          <button style={S.btn()} onClick={()=>setTab('pipeline')}>+ Add Job</button>
        </div>
      </div>

      {/* First-time setup banner */}
      {!seeded && stats.available===0 && jobs.length===0 && (
        <div style={{ background:'#eef6fb', border:`1px solid ${C.blueRule}`, borderRadius:12, padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
          <div>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:14, color:C.navy, marginBottom:3 }}>👋 Welcome! Initialize your database</div>
            <div style={{ fontSize:12.5, color:C.textLt, fontWeight:300 }}>Click to load sample consultants, jobs, recruiters and clients into Firestore. You can edit or delete them after.</div>
          </div>
          <button style={{ ...S.btn(), whiteSpace:'nowrap', padding:'10px 24px' }} onClick={seedDatabase} disabled={seeding}>
            {seeding ? <span className="spin">⟳</span> : '🚀 Initialize DB'}
          </button>
        </div>
      )}
      {seeded && (
        <div style={{ background:'#f0fff4', border:'1px solid #9ae6b4', borderRadius:12, padding:'12px 20px', marginBottom:20, fontSize:13, color:'#276749', fontWeight:500 }}>
          ✅ Database initialized! Please refresh the page to load your data from Firestore.
        </div>
      )}

      {/* KPI strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:24 }}>
        {kpis.map(k=>(
          <div key={k.label} onClick={()=>setTab(k.tab)}
            style={{ ...S.card, borderTop:`3px solid ${k.color}`, cursor:'pointer', transition:'transform .2s, box-shadow .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=C.shMd;}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=C.sh;}}>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:34, fontWeight:700, color:k.color, lineHeight:1 }}>{k.val}</div>
            <div style={{ fontSize:12.5, color:C.navy, fontWeight:600, marginTop:6 }}>{k.label}</div>
            <div style={{ fontSize:11, color:C.textXs, fontWeight:300, marginTop:2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {stats.followups > 0 && (
        <div style={{ background:'#fff5f5', border:`1px solid #feb2b2`, borderRadius:12, padding:'14px 20px', marginBottom:18, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:20 }}>🔔</span>
            <div>
              <div style={{ fontWeight:600, color:C.danger, fontSize:13.5 }}>{stats.followups} submission{stats.followups>1?'s':''} need follow-up</div>
              <div style={{ fontSize:12, color:'#c53030', marginTop:2 }}>No reply in 3+ days — follow up now to maximize placement chances</div>
            </div>
          </div>
          <button style={{ ...S.btn(true, C.danger), padding:'8px 18px', fontSize:12 }} onClick={()=>setTab('submissions')}>View All →</button>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:18 }}>
        {/* Pipeline bars */}
        <div style={S.card}>
          <div style={{ ...S.tag, marginBottom:6 }}>Pipeline</div>
          <div style={{ ...S.h2, marginBottom:16 }}>Job Status Overview</div>
          {STAGES.filter(s=>s.id!=='rejected').map(st=>{
            const count = jobs.filter(j=>j.stage===st.id).length;
            const pct = jobs.length ? Math.round(count/jobs.length*100) : 0;
            return (
              <div key={st.id} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:13, color:C.text, fontWeight:400 }}>{st.label}</span>
                  <span style={{ fontFamily:"'Poppins',sans-serif", fontWeight:600, color:st.color, fontSize:13 }}>{count}</span>
                </div>
                <div style={{ height:7, background:C.off, borderRadius:4, border:`1px solid ${C.border}`, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${C.blueLt},${C.blue})`, borderRadius:4, transition:'width .6s ease' }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming interviews */}
        <div style={S.card}>
          <div style={{ ...S.tag, marginBottom:6 }}>Schedule</div>
          <div style={{ ...S.h2, marginBottom:16 }}>Upcoming Interviews</div>
          {upcoming.length===0
            ? <div style={{ textAlign:'center', padding:'28px 0', color:C.textXs, fontSize:13 }}>No interviews scheduled</div>
            : upcoming.map(iv=>{
              const con = consultants.find(c=>c.id===iv.consultantId);
              const days = Math.ceil((new Date(iv.date)-new Date())/(864e5));
              return (
                <div key={iv.id} style={{ display:'flex', gap:12, alignItems:'center', padding:'11px 0', borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ background:C.blueTint, border:`1px solid ${C.blueRule}`, borderRadius:9, padding:'8px 12px', textAlign:'center', flexShrink:0, minWidth:50 }}>
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:C.navy, fontSize:20, lineHeight:1 }}>{days<1?'✓':days}</div>
                    <div style={{ fontSize:8.5, color:C.textXs, textTransform:'uppercase', letterSpacing:.5 }}>{days<1?'today':'days'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:13, color:C.navy, fontWeight:500 }}>{con?.name||'Unknown'}</div>
                    <div style={{ fontSize:11.5, color:C.textLt, fontWeight:300 }}>{iv.date} · {iv.time} · {iv.type}</div>
                  </div>
                </div>
              );
            })
          }
        </div>

        {/* Bench summary */}
        <div style={S.card}>
          <div style={{ ...S.tag, marginBottom:6 }}>Talent Bench</div>
          <div style={{ ...S.h2, marginBottom:16 }}>Available Consultants</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {RESOURCES.map(r=>{
              const avail = consultants.filter(c=>c.role===r.id&&c.status==='available').length;
              return (
                <div key={r.id} style={{ background:r.bg, border:`1px solid ${r.color}22`, borderRadius:10, padding:'14px 16px' }}>
                  <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:28, color:r.color, lineHeight:1 }}>{avail}</div>
                  <div style={{ fontSize:11.5, color:C.text, marginTop:4, lineHeight:1.4, fontWeight:400 }}>{r.label.replace('Senior ','')}</div>
                  <div style={{ fontSize:10, color:r.color, marginTop:6, fontWeight:600 }}>C2C · Immediate</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent jobs */}
        <div style={S.card}>
          <div style={{ ...S.tag, marginBottom:6 }}>Recent Activity</div>
          <div style={{ ...S.h2, marginBottom:16 }}>Latest Jobs</div>
          {jobs.slice(0,5).map(j=>{
            const st = STAGES.find(s=>s.id===j.stage);
            const con = consultants.find(c=>c.id===j.consultantId);
            return (
              <div key={j.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:`1px solid ${C.border}` }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:st?.color, flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, color:C.navy, fontWeight:500 }}>{j.title}</div>
                  <div style={{ fontSize:11.5, color:C.textLt, fontWeight:300 }}>{con?.name||'Unassigned'} · {j.location}</div>
                </div>
                <span style={S.pill(st?.color, st?.bg)}>{j.stage}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// CONSULTANTS
// ════════════════════════════════════════════════
function Consultants({ consultants, setConsultants, jobs, modal, setModal, closeModal, showToast, saveDoc, deleteFireDoc }) {
  const blank = { name:'', role:'java', rate:'', avail:'Immediate', skills:'', email:'', phone:'', yoe:'', notes:'', status:'available', resumeName:'' };
  const [form, setForm] = useState(blank);
  const fileRef = useRef();

  const save = async () => {
    if (!form.name.trim()) return;
    const skills = typeof form.skills==='string' ? form.skills.split(',').map(s=>s.trim()).filter(Boolean) : form.skills;
    const id = modal?.data?.id || 'c'+Date.now();
    const data = {...form, skills, id};
    if (modal?.data?.id) { setConsultants(p=>p.map(c=>c.id===id?data:c)); showToast('✅ Updated'); }
    else { setConsultants(p=>[...p, data]); showToast('✅ Consultant added'); }
    await saveDoc('consultants', id, data);
    closeModal();
  };

  return (
    <div className="fu">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <div style={{ ...S.tag, marginBottom:4 }}>Talent Bench</div>
          <div style={S.h1}>Consultants</div>
          <div style={{ fontSize:13, color:C.textLt, marginTop:3, fontWeight:300 }}>{consultants.filter(c=>c.status==='available').length} available · C2C · Immediate start</div>
        </div>
        <button style={S.btn()} onClick={()=>{setForm(blank);setModal({type:'consultant',data:null});}}>+ Add Consultant</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
        {consultants.map(c=>{
          const r = RESOURCES.find(x=>x.id===c.role);
          const cJobs = jobs.filter(j=>j.consultantId===c.id);
          const initials = c.name.split(' ').map(n=>n[0]).join('');
          return (
            <div key={c.id} style={{ ...S.card, borderLeft:`4px solid ${r?.color||C.blue}`, transition:'transform .2s,box-shadow .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=C.shMd;e.currentTarget.style.borderColor=r?.color||C.blue;}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=C.sh;}}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ width:46, height:46, borderRadius:'50%', background:r?.bg||C.blueTint, border:`2px solid ${r?.color||C.blue}30`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:16, color:r?.color||C.blue, flexShrink:0 }}>
                    {initials}
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:15, color:C.navy }}>{c.name}</div>
                    <div style={{ fontSize:11.5, color:r?.color||C.blue, marginTop:2, fontWeight:500 }}>{r?.label||c.role}</div>
                  </div>
                </div>
                <span style={S.pill(c.status==='available'?C.success:'#b7791f', c.status==='available'?'#f0fff4':'#fffaf0')}>{c.status}</span>
              </div>

              <div style={{ display:'flex', gap:20, marginBottom:12, flexWrap:'wrap' }}>
                <span style={{ fontSize:12.5, color:C.textLt }}>💰 {c.rate}/hr C2C</span>
                <span style={{ fontSize:12.5, color:C.textLt }}>⏱ {c.yoe} yrs</span>
                <span style={{ fontSize:12.5, color:C.blue, fontWeight:500 }}>⚡ {c.avail}</span>
              </div>

              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:12 }}>
                {(Array.isArray(c.skills)?c.skills:c.skills?.split(',')||[]).slice(0,5).map(sk=>(
                  <span key={sk} style={{ background:r?.bg||C.blueTint, color:r?.color||C.blue, border:`1px solid ${r?.color||C.blue}20`, fontSize:10.5, fontWeight:500, padding:'3px 10px', borderRadius:999 }}>{sk.trim()}</span>
                ))}
              </div>

              {c.resumeName && <div style={{ fontSize:11.5, color:C.textXs, marginBottom:10 }}>📄 {c.resumeName}</div>}

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, borderTop:`1px solid ${C.border}` }}>
                <span style={{ fontSize:11.5, color:C.textXs }}>{cJobs.length} job{cJobs.length!==1?'s':''} in pipeline</span>
                <div style={{ display:'flex', gap:8 }}>
                  <button style={{ ...S.btn(false, C.blue), padding:'5px 14px', fontSize:11 }} onClick={()=>{setForm({...c,skills:Array.isArray(c.skills)?c.skills.join(', '):c.skills});setModal({type:'consultant',data:c});}}>Edit</button>
                  <button style={{ ...S.btn(false, C.danger), padding:'5px 14px', fontSize:11 }} onClick={()=>{setConsultants(p=>p.filter(x=>x.id!==c.id));deleteFireDoc('consultants',c.id);showToast('Removed');}}>Remove</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal?.type==='consultant' && <Modal title={modal.data?'Edit Consultant':'Add Consultant'} subtitle="C2C consultant profile" onClose={closeModal} onSave={save} saveLabel={modal.data?'Update Consultant':'Add Consultant'}>
        <div style={S.grid2}>
          <div><label style={S.lbl}>Full Name *</label><input style={S.inp} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Alex Rivera"/></div>
          <div><label style={S.lbl}>Role</label><select style={S.inp} value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>{RESOURCES.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select></div>
          <div><label style={S.lbl}>Email</label><input style={S.inp} value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
          <div><label style={S.lbl}>Phone</label><input style={S.inp} value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/></div>
          <div><label style={S.lbl}>Rate (C2C/hr)</label><input style={S.inp} value={form.rate} onChange={e=>setForm(p=>({...p,rate:e.target.value}))} placeholder="$85"/></div>
          <div><label style={S.lbl}>Years Experience</label><input style={S.inp} type="number" value={form.yoe} onChange={e=>setForm(p=>({...p,yoe:e.target.value}))}/></div>
          <div><label style={S.lbl}>Availability</label><select style={S.inp} value={form.avail} onChange={e=>setForm(p=>({...p,avail:e.target.value}))}>{['Immediate','2 weeks','30 days'].map(a=><option key={a}>{a}</option>)}</select></div>
          <div><label style={S.lbl}>Status</label><select style={S.inp} value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>{['available','on assignment','unavailable'].map(a=><option key={a}>{a}</option>)}</select></div>
        </div>
        <div style={{marginTop:16}}><label style={S.lbl}>Skills (comma separated)</label><input style={S.inp} value={form.skills} onChange={e=>setForm(p=>({...p,skills:e.target.value}))} placeholder="Java 17, Spring Boot, Kafka, AWS"/></div>
        <div style={{marginTop:16}}>
          <label style={S.lbl}>Resume</label>
          <input type="file" ref={fileRef} style={{display:'none'}} accept=".pdf,.doc,.docx" onChange={e=>{if(e.target.files[0])setForm(p=>({...p,resumeName:e.target.files[0].name}));}}/>
          <div style={{display:'flex',gap:10,alignItems:'center',marginTop:6}}>
            <button style={{...S.btn(false,C.blue),padding:'8px 16px',fontSize:12}} onClick={()=>fileRef.current?.click()}>📎 Choose File</button>
            {form.resumeName&&<span style={{fontSize:12,color:C.success,fontWeight:500}}>✓ {form.resumeName}</span>}
          </div>
        </div>
        <div style={{marginTop:16}}><label style={S.lbl}>Notes</label><textarea style={{...S.ta,minHeight:80}} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/></div>
      </Modal>}
    </div>
  );
}

// ════════════════════════════════════════════════
// PIPELINE
// ════════════════════════════════════════════════
function Pipeline({ jobs, setJobs, consultants, recruiters, clients, modal, setModal, closeModal, showToast, saveDoc, deleteFireDoc }) {
  const blank = { title:'', stage:'new', consultantId:'', recruiterId:'', clientId:'', location:'Remote', rate:'', duration:'', skills:'', notes:'', source:'hotlist', submittedDate:'', interviewDate:'' };
  const [form, setForm] = useState(blank);

  const save = async () => {
    if (!form.title.trim()) return;
    const id = modal?.data?.id || 'j'+Date.now();
    const data = {...form, id};
    if (modal?.data?.id) { setJobs(p=>p.map(j=>j.id===id?data:j)); showToast('✅ Updated'); }
    else { setJobs(p=>[data,...p]); showToast('✅ Added to pipeline'); }
    await saveDoc('jobs', id, data);
    closeModal();
  };

  const draftEmail = (job) => {
    const con = consultants.find(c=>c.id===job.consultantId);
    const r = RESOURCES.find(x=>x.id===con?.role)||RESOURCES[0];
    return `Subject: C2C Consultant – ${r.label} | Quantum Info Systems\n\nHi [Recruiter],\n\nWe have a ${r.label} available immediately for the ${job.title} role.\n\nLocation: ${job.location} · Rate: ${job.rate}\nSkills: ${job.skills}\nConsultant: ${con?.name||'[Name]'} · ${con?.rate||job.rate}/hr C2C\n\nResume available on request.\n\nBest regards,\nQuantum Info Systems\nhr@quantuminfosystems.com`;
  };

  return (
    <div className="fu">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <div style={{ ...S.tag, marginBottom:4 }}>Kanban Board</div>
          <div style={S.h1}>Job Pipeline</div>
          <div style={{ fontSize:13, color:C.textLt, marginTop:3, fontWeight:300 }}>{jobs.length} positions tracked</div>
        </div>
        <button style={S.btn()} onClick={()=>{setForm(blank);setModal({type:'job',data:null});}}>+ Add Job</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, alignItems:'start' }}>
        {STAGES.map(st=>{
          const col = jobs.filter(j=>j.stage===st.id);
          return (
            <div key={st.id} style={{ background:st.bg, borderRadius:12, padding:12, border:`1px solid ${st.color}20` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:12, fontWeight:600, color:st.color }}>{st.label}</span>
                <span style={{ background:C.white, color:st.color, fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:999, border:`1px solid ${st.color}30` }}>{col.length}</span>
              </div>
              {col.map(job=>{
                const con = consultants.find(c=>c.id===job.consultantId);
                const r = RESOURCES.find(x=>x.id===con?.role);
                return (
                  <div key={job.id} style={{ ...S.card, marginBottom:8, padding:'13px 14px' }}>
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:12.5, fontWeight:600, color:C.navy, marginBottom:6, lineHeight:1.35 }}>{job.title}</div>
                    {con && <div style={{ ...S.pill(r?.color||C.blue, r?.bg||C.blueTint), marginBottom:7, fontSize:9.5 }}>{con.name}</div>}
                    <div style={{ fontSize:11, color:C.textLt, marginBottom:9 }}>📍 {job.location} · {job.rate}</div>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:7 }}>
                      {STAGES.filter(s=>s.id!==st.id).slice(0,2).map(ns=>(
                        <button key={ns.id} style={{ background:ns.bg, color:ns.color, border:`1px solid ${ns.color}30`, borderRadius:999, padding:'3px 9px', fontSize:10, fontWeight:500, cursor:'pointer' }}
                          onClick={()=>{const updated={...job,stage:ns.id};setJobs(p=>p.map(j=>j.id===job.id?updated:j));saveDoc('jobs',job.id,updated);}}>→{ns.label}</button>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:4, paddingTop:7, borderTop:`1px solid ${C.border}` }}>
                      <button style={{ background:C.blueTint, color:C.blue, border:`1px solid ${C.blueRule}`, borderRadius:6, padding:'4px 8px', fontSize:10, fontWeight:500 }} onClick={()=>{setForm({...job});setModal({type:'job',data:job});}}>Edit</button>
                      <button style={{ background:'#f0fff4', color:C.success, border:'1px solid #9ae6b430', borderRadius:6, padding:'4px 8px', fontSize:10, fontWeight:500 }} onClick={()=>{navigator.clipboard.writeText(draftEmail(job));showToast('📋 Email copied!');}}>Copy Email</button>
                      <button style={{ background:'#fff5f5', color:C.danger, border:'1px solid #feb2b230', borderRadius:6, padding:'4px 8px', fontSize:10, fontWeight:500 }} onClick={()=>{setJobs(p=>p.filter(j=>j.id!==job.id));deleteFireDoc('jobs',job.id);showToast('Removed');}}>✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {modal?.type==='job' && (
        <Modal title={modal.data?'Edit Job':'Add Job'} subtitle="Job pipeline entry" onClose={closeModal} onSave={save} saveLabel={modal.data?'Update Job':'Add Job'} width={640}>
          <div style={{ marginBottom:14 }}><label style={S.lbl}>Job Title *</label><input style={S.inp} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Senior Java Developer – Remote"/></div>
          <div style={S.grid2}>
            <div><label style={S.lbl}>Stage</label><select style={S.inp} value={form.stage} onChange={e=>setForm(p=>({...p,stage:e.target.value}))}>{STAGES.map(s=><option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
            <div><label style={S.lbl}>Consultant</label><select style={S.inp} value={form.consultantId} onChange={e=>setForm(p=>({...p,consultantId:e.target.value}))}><option value="">-- Select --</option>{consultants.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label style={S.lbl}>Recruiter</label><select style={S.inp} value={form.recruiterId} onChange={e=>setForm(p=>({...p,recruiterId:e.target.value}))}><option value="">-- Select --</option>{recruiters.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
            <div><label style={S.lbl}>Client</label><select style={S.inp} value={form.clientId} onChange={e=>setForm(p=>({...p,clientId:e.target.value}))}><option value="">-- Select --</option>{clients.map(cl=><option key={cl.id} value={cl.id}>{cl.name}</option>)}</select></div>
            <div><label style={S.lbl}>Location</label><input style={S.inp} value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))}/></div>
            <div><label style={S.lbl}>Rate</label><input style={S.inp} value={form.rate} onChange={e=>setForm(p=>({...p,rate:e.target.value}))} placeholder="$85/hr"/></div>
            <div><label style={S.lbl}>Duration</label><input style={S.inp} value={form.duration} onChange={e=>setForm(p=>({...p,duration:e.target.value}))} placeholder="12 months"/></div>
            <div><label style={S.lbl}>Source</label><select style={S.inp} value={form.source} onChange={e=>setForm(p=>({...p,source:e.target.value}))}>{['hotlist','dice','linkedin','indeed','techfetch','referral','other'].map(s=><option key={s}>{s}</option>)}</select></div>
          </div>
          <div style={{ marginTop:14 }}><label style={S.lbl}>Required Skills</label><input style={S.inp} value={form.skills} onChange={e=>setForm(p=>({...p,skills:e.target.value}))}/></div>
          <div style={{ marginTop:14 }}><label style={S.lbl}>Notes</label><textarea style={{ ...S.ta, minHeight:70 }} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/></div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// RECRUITERS
// ════════════════════════════════════════════════
function Recruiters({ recruiters, setRecruiters, consultants, jobs, modal, setModal, closeModal, showToast, saveDoc, deleteFireDoc }) {
  const blank = { name:'', company:'', email:'', phone:'', vertical:'', notes:'', hotlists:0, lastContact:'' };
  const [form, setForm] = useState(blank);
  const [search, setSearch] = useState('');
  const [emailModal, setEmailModal] = useState(null); // { recruiter, consultant, job, body, subject }
  const [emailConsultant, setEmailConsultant] = useState('');
  const [emailJob, setEmailJob] = useState('');

  const buildEmail = (recruiter, conId, jobId) => {
    const con = consultants.find(c=>c.id===conId);
    const job = jobs.find(j=>j.id===jobId);
    const role = RESOURCES.find(r=>r.id===con?.role);
    const subject = con && job
      ? `C2C Consultant Available – ${role?.label||con.role} | ${con.name} | Quantum Info Systems`
      : `C2C Consultant Available – Quantum Info Systems`;
    const body = con
      ? `Hi ${recruiter.name?.split(' ')[0]||'there'},\n\nI hope you're doing well! I'm reaching out from Quantum Info Systems regarding an excellent ${role?.label||'Senior'} available immediately for C2C engagement.\n\nConsultant: ${con.name}\nRole: ${role?.label||con.role}\nRate: ${con.rate}/hr C2C\nAvailability: ${con.avail||'Immediate'}\nSkills: ${Array.isArray(con.skills)?con.skills.join(', '):con.skills||''}\nExperience: ${con.yoe||'10'}+ years\n${job?`\nPosition: ${job.title}\nLocation: ${job.location||'Remote'}\nClient Rate: ${job.rate||''}\n`:''}\nResume available on request. Would love to discuss if this is a fit for any of your current openings.\n\nBest regards,\nQuantum Info Systems\nhr@quantuminfosystems.com\n+1 (xxx) xxx-xxxx`
      : `Hi ${recruiter.name?.split(' ')[0]||'there'},\n\nI hope you're doing well! We have highly skilled senior consultants available immediately for C2C.\n\nPlease reply if you'd like profiles for any of your open positions.\n\nBest regards,\nQuantum Info Systems\nhr@quantuminfosystems.com`;
    return { subject, body };
  };

  const openGmail = (recruiter, subject, body) => {
    const url = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(recruiter.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
    // Update last contact date
    const today = new Date().toISOString().split('T')[0];
    const updated = {...recruiter, lastContact: today, hotlists: (Number(recruiter.hotlists)||0)+1};
    setRecruiters(p=>p.map(r=>r.id===recruiter.id ? updated : r));
    saveDoc('recruiters', recruiter.id, updated);
    showToast('✉ Gmail opened · last contact updated');
  };

  const save = async () => {
    if (!form.name.trim()) return;
    const id = modal?.data?.id || 'r'+Date.now();
    const data = { ...form, id, hotlists: Number(form.hotlists)||0 };
    if (modal?.data?.id) { setRecruiters(p=>p.map(r=>r.id===id ? data : r)); showToast('✅ Updated'); }
    else { setRecruiters(p=>[...p, data]); showToast('✅ Recruiter added'); }
    await saveDoc('recruiters', id, data);
    closeModal();
  };

  const filtered = recruiters.filter(r =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.company?.toLowerCase().includes(search.toLowerCase()) ||
    r.vertical?.toLowerCase().includes(search.toLowerCase())
  );

  const verticalColors = { Healthcare:C.success, Finance:'#b7791f', Commercial:C.purple, default:C.blue };
  const vColor = (v='') => {
    for (const [k,c] of Object.entries(verticalColors)) if (v.includes(k)) return c;
    return verticalColors.default;
  };

  return (
    <div className="fu">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <div style={{ ...S.tag, marginBottom:4 }}>Contacts</div>
          <div style={S.h1}>Recruiter Database</div>
          <div style={{ fontSize:13, color:C.textLt, marginTop:3, fontWeight:300 }}>{recruiters.length} contacts · hotlist sources</div>
        </div>
        <button style={S.btn()} onClick={()=>{ setForm(blank); setModal({type:'recruiter',data:null}); }}>+ Add Recruiter</button>
      </div>

      {/* Search */}
      <div style={{ marginBottom:18 }}>
        <input style={{ ...S.inp, maxWidth:320 }} placeholder="🔍  Search name, company, vertical…" value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {/* Clean table */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', boxShadow:C.sh }}>
        {/* Table header */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 2.2fr 1.4fr 90px 160px', gap:0, padding:'10px 20px', background:C.off, borderBottom:`1.5px solid ${C.border}` }}>
          {['Recruiter','Company','Email / Phone','Verticals','Hotlists','Actions'].map(h=>(
            <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:C.textXs }}>{h}</div>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 && (
          <div style={{ padding:'40px 20px', textAlign:'center', color:C.textXs, fontSize:13 }}>
            {search ? 'No recruiters match your search.' : 'No recruiters yet — click + Add Recruiter to get started.'}
          </div>
        )}
        {filtered.map((r, i) => {
          const verts = (r.vertical||'').split(',').map(v=>v.trim()).filter(Boolean);
          return (
            <div key={r.id}
              style={{ display:'grid', gridTemplateColumns:'2fr 2fr 2.2fr 1.4fr 90px 160px', gap:0,
                padding:'14px 20px', borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : 'none',
                background: i%2===0 ? C.white : '#fafcff', alignItems:'center',
                transition:'background .15s' }}
              onMouseEnter={e=>e.currentTarget.style.background=C.blueTint}
              onMouseLeave={e=>e.currentTarget.style.background=i%2===0?C.white:'#fafcff'}>

              {/* Name + last contact */}
              <div>
                <div style={{ fontSize:13.5, fontWeight:600, color:C.navy, marginBottom:2 }}>{r.name}</div>
                {r.lastContact && <div style={{ fontSize:11, color:C.textXs }}>Last contact: {r.lastContact}</div>}
              </div>

              {/* Company */}
              <div style={{ fontSize:13, color:C.text, fontWeight:400 }}>{r.company}</div>

              {/* Email + phone stacked */}
              <div>
                {r.email && <div style={{ fontSize:12.5, color:C.blue, marginBottom:2 }}>{r.email}</div>}
                {r.phone && <div style={{ fontSize:11.5, color:C.textLt }}>{r.phone}</div>}
              </div>

              {/* Vertical pills */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {verts.length > 0
                  ? verts.map(v=><span key={v} style={{ ...S.pill(vColor(v)), fontSize:9.5, padding:'2px 8px' }}>{v}</span>)
                  : <span style={{ color:C.textXs, fontSize:11 }}>—</span>}
              </div>

              {/* Hotlists count */}
              <div style={{ textAlign:'center' }}>
                <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:22, fontWeight:700, color:C.navy, lineHeight:1 }}>{r.hotlists||0}</span>
                {r.notes && <div style={{ fontSize:9.5, color:C.textXs, marginTop:2, maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={r.notes}>{r.notes}</div>}
              </div>

              {/* Actions */}
              <div style={{ display:'flex', gap:5, justifyContent:'flex-end', flexWrap:'wrap' }}>
                <button
                  title="Compose Gmail submission"
                  style={{ background:'#fef9ec', color:'#b7791f', border:'1px solid #f6d860', borderRadius:7, padding:'5px 10px', fontSize:12, fontWeight:600, cursor:'pointer' }}
                  onClick={()=>{ setEmailConsultant(''); setEmailJob(''); setEmailModal(r); }}>✉ Email</button>
                <button
                  style={{ background:C.blueTint, color:C.blue, border:`1px solid ${C.blueRule}`, borderRadius:7, padding:'5px 10px', fontSize:11, fontWeight:600, cursor:'pointer' }}
                  onClick={()=>{ setForm({...r}); setModal({type:'recruiter',data:r}); }}>Edit</button>
                <button
                  style={{ background:'#fff5f5', color:C.danger, border:'1px solid #feb2b230', borderRadius:7, padding:'5px 10px', fontSize:11, fontWeight:600, cursor:'pointer' }}
                  onClick={()=>{ setRecruiters(p=>p.filter(x=>x.id!==r.id)); deleteFireDoc('recruiters',r.id); showToast('Removed'); }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gmail Compose Modal */}
      {emailModal && (
        <Modal
          title="✉ Send Submission"
          subtitle={`To: ${emailModal.name}  ·  ${emailModal.email}`}
          onClose={()=>setEmailModal(null)}
          onSave={()=>{ const {subject,body}=buildEmail(emailModal,emailConsultant,emailJob); openGmail(emailModal,subject,body); setEmailModal(null); }}
          saveLabel="Open in Gmail →"
          width={560}>
          <div style={{ marginBottom:14 }}>
            <label style={S.lbl}>Select Consultant (optional)</label>
            <select style={S.inp} value={emailConsultant} onChange={e=>setEmailConsultant(e.target.value)}>
              <option value="">— General inquiry (no specific consultant) —</option>
              {consultants.map(c=><option key={c.id} value={c.id}>{c.name} · {RESOURCES.find(r=>r.id===c.role)?.label||c.role} · {c.rate}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={S.lbl}>Select Job / Position (optional)</label>
            <select style={S.inp} value={emailJob} onChange={e=>setEmailJob(e.target.value)}>
              <option value="">— No specific job —</option>
              {jobs.map(j=><option key={j.id} value={j.id}>{j.title} · {j.location}</option>)}
            </select>
          </div>
          {(() => {
            const { subject, body } = buildEmail(emailModal, emailConsultant, emailJob);
            return (
              <div style={{ background:'#f8fafc', border:`1px solid ${C.border}`, borderRadius:12, padding:16, fontSize:12.5, color:C.text }}>
                <div style={{ fontWeight:600, color:C.navy, marginBottom:8, fontSize:12, letterSpacing:.3 }}>PREVIEW</div>
                <div style={{ fontWeight:600, color:C.text, marginBottom:8, fontSize:12.5 }}>Subject: {subject}</div>
                <div style={{ whiteSpace:'pre-wrap', color:C.textLt, lineHeight:1.7, maxHeight:200, overflowY:'auto', fontSize:12 }}>{body}</div>
              </div>
            );
          })()}
        </Modal>
      )}

      {modal?.type==='recruiter' && (
        <Modal title={modal.data?'Edit Recruiter':'Add Recruiter'} subtitle="Recruiter contact details" onClose={closeModal} onSave={save} saveLabel={modal.data?'Update Recruiter':'Add Recruiter'} width={540}>
          <div style={S.grid2}>
            <div><label style={S.lbl}>Full Name *</label><input style={S.inp} value={form.name} placeholder="Sarah Johnson" onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
            <div><label style={S.lbl}>Company</label><input style={S.inp} value={form.company} placeholder="TechForce Staffing" onChange={e=>setForm(p=>({...p,company:e.target.value}))}/></div>
            <div><label style={S.lbl}>Email</label><input style={S.inp} type="email" value={form.email} placeholder="name@company.com" onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
            <div><label style={S.lbl}>Phone</label><input style={S.inp} value={form.phone} placeholder="555-000-0000" onChange={e=>setForm(p=>({...p,phone:e.target.value}))}/></div>
            <div><label style={S.lbl}>Verticals</label><input style={S.inp} value={form.vertical} placeholder="Healthcare, Finance" onChange={e=>setForm(p=>({...p,vertical:e.target.value}))}/></div>
            <div><label style={S.lbl}>Last Contact</label><input type="date" style={S.inp} value={form.lastContact} onChange={e=>setForm(p=>({...p,lastContact:e.target.value}))}/></div>
            <div><label style={S.lbl}>Hotlists Sent</label><input type="number" style={S.inp} value={form.hotlists} min={0} onChange={e=>setForm(p=>({...p,hotlists:e.target.value}))}/></div>
          </div>
          <div style={{ marginTop:14 }}>
            <label style={S.lbl}>Notes</label>
            <textarea style={{ ...S.ta, minHeight:80 }} value={form.notes} placeholder="Sends daily hotlists, prefers C2C only…" onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// CLIENTS
// ════════════════════════════════════════════════
function Clients({ clients, setClients, modal, setModal, closeModal, showToast, saveDoc, deleteFireDoc }) {
  const blank = { name:'', industry:'Healthcare', contact:'', email:'', openReqs:0, tier:'B', notes:'' };
  const [form, setForm] = useState(blank);
  const tierColor = { A:C.success, B:C.blue, C:C.textLt };
  const tierBg    = { A:'#f0fff4',  B:C.blueTint, C:C.off };
  const save = async () => {
    if (!form.name.trim()) return;
    const id = modal?.data?.id || 'cl'+Date.now();
    const data = {...form, id, openReqs:Number(form.openReqs)||0};
    if (modal?.data?.id) { setClients(p=>p.map(cl=>cl.id===id?data:cl)); showToast('✅ Updated'); }
    else { setClients(p=>[...p, data]); showToast('✅ Client added'); }
    await saveDoc('clients', id, data);
    closeModal();
  };
  return (
    <div className="fu">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <div style={{ ...S.tag, marginBottom:4 }}>Accounts</div>
          <div style={S.h1}>Clients & Vendors</div>
          <div style={{ fontSize:13, color:C.textLt, marginTop:3, fontWeight:300 }}>{clients.length} companies · {clients.reduce((a,c)=>a+Number(c.openReqs||0),0)} open reqs</div>
        </div>
        <button style={S.btn()} onClick={()=>{setForm(blank);setModal({type:'client',data:null});}}>+ Add Client</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
        {clients.map(cl=>(
          <div key={cl.id} style={{ ...S.card, borderTop:`3px solid ${tierColor[cl.tier]||C.blue}`, transition:'transform .2s,box-shadow .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=C.shMd;}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=C.sh;}}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:15, color:C.navy }}>{cl.name}</div>
              <span style={S.pill(tierColor[cl.tier]||C.blue, tierBg[cl.tier]||C.blueTint)}>Tier {cl.tier}</span>
            </div>
            <div style={{ fontSize:12.5, color:C.textLt, marginBottom:5 }}>🏭 {cl.industry}</div>
            <div style={{ fontSize:12.5, color:C.text, marginBottom:4 }}>👤 {cl.contact}</div>
            <div style={{ fontSize:12.5, color:C.blue, marginBottom:10 }}>{cl.email}</div>
            {cl.notes && <div style={{ fontSize:11.5, color:C.textXs, marginBottom:12, fontStyle:'italic', borderTop:`1px solid ${C.border}`, paddingTop:8 }}>{cl.notes}</div>}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, borderTop:`1px solid ${C.border}` }}>
              <div>
                <span style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:22, color:C.navy }}>{cl.openReqs}</span>
                <span style={{ fontSize:11.5, color:C.textXs, fontWeight:300 }}> open reqs</span>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button style={{ ...S.btn(false, C.blue), padding:'5px 12px', fontSize:11 }} onClick={()=>{setForm({...cl});setModal({type:'client',data:cl});}}>Edit</button>
                <button style={{ ...S.btn(false, C.danger), padding:'5px 12px', fontSize:11 }} onClick={()=>{setClients(p=>p.filter(x=>x.id!==cl.id));deleteFireDoc('clients',cl.id);showToast('Removed');}}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {modal?.type==='client' && (
        <Modal title={modal.data?'Edit Client':'Add Client'} subtitle="Client account details" onClose={closeModal} onSave={save} saveLabel={modal.data?'Update Client':'Add Client'} width={520}>
          <div style={S.grid2}>
            <div><label style={S.lbl}>Company *</label><input style={S.inp} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
            <div><label style={S.lbl}>Industry</label><select style={S.inp} value={form.industry} onChange={e=>setForm(p=>({...p,industry:e.target.value}))}>{['Healthcare','Finance','Commercial','Insurance','Retail','Government','Other'].map(i=><option key={i}>{i}</option>)}</select></div>
            <div><label style={S.lbl}>Contact Name</label><input style={S.inp} value={form.contact} onChange={e=>setForm(p=>({...p,contact:e.target.value}))}/></div>
            <div><label style={S.lbl}>Email</label><input style={S.inp} value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
            <div><label style={S.lbl}>Open Reqs</label><input type="number" style={S.inp} value={form.openReqs} onChange={e=>setForm(p=>({...p,openReqs:e.target.value}))}/></div>
            <div><label style={S.lbl}>Tier</label><select style={S.inp} value={form.tier} onChange={e=>setForm(p=>({...p,tier:e.target.value}))}><option>A</option><option>B</option><option>C</option></select></div>
          </div>
          <div style={{ marginTop:14 }}><label style={S.lbl}>Notes</label><textarea style={{ ...S.ta, minHeight:80 }} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/></div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// INTERVIEWS
// ════════════════════════════════════════════════
function Interviews({ interviews, setInterviews, consultants, clients, modal, setModal, closeModal, showToast, saveDoc, deleteFireDoc }) {
  const blank = { consultantId:'', clientId:'', date:'', time:'', type:'Video', interviewer:'', status:'scheduled', notes:'', followupDate:'' };
  const [form, setForm] = useState(blank);
  const save = async () => {
    if (!form.consultantId||!form.date) return;
    const id = modal?.data?.id || 'i'+Date.now();
    const data = {...form, id};
    if (modal?.data?.id) { setInterviews(p=>p.map(i=>i.id===id?data:i)); showToast('✅ Updated'); }
    else { setInterviews(p=>[...p, data]); showToast('✅ Interview scheduled'); }
    await saveDoc('interviews', id, data);
    closeModal();
  };
  const upcoming = interviews.filter(i=>i.status==='scheduled').sort((a,b)=>a.date>b.date?1:-1);
  return (
    <div className="fu">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <div style={{ ...S.tag, marginBottom:4 }}>Calendar</div>
          <div style={S.h1}>Interviews</div>
          <div style={{ fontSize:13, color:C.textLt, marginTop:3, fontWeight:300 }}>{upcoming.length} upcoming · {interviews.filter(i=>i.status==='completed').length} completed</div>
        </div>
        <button style={S.btn()} onClick={()=>{setForm(blank);setModal({type:'interview',data:null});}}>+ Schedule Interview</button>
      </div>
      {upcoming.map(iv=>{
        const con = consultants.find(c=>c.id===iv.consultantId);
        const cl = clients.find(c=>c.id===iv.clientId);
        const days = Math.ceil((new Date(iv.date)-new Date())/(864e5));
        return (
          <div key={iv.id} style={{ ...S.card, marginBottom:12, display:'flex', gap:16, alignItems:'center', borderLeft:`4px solid ${C.blue}` }}>
            <div style={{ background:C.blueTint, border:`1px solid ${C.blueRule}`, borderRadius:10, padding:'10px 16px', textAlign:'center', flexShrink:0, minWidth:56 }}>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:26, fontWeight:700, color:C.navy, lineHeight:1 }}>{days<1?'!':days}</div>
              <div style={{ fontSize:8.5, color:C.textXs, textTransform:'uppercase', letterSpacing:.5 }}>{days<1?'today':days===1?'day':'days'}</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:15, color:C.navy, marginBottom:4 }}>{con?.name||'Unknown Consultant'}</div>
              <div style={{ fontSize:12.5, color:C.textLt, fontWeight:300 }}>📅 {iv.date} · {iv.time} · {iv.type}</div>
              <div style={{ fontSize:12.5, color:C.textLt, fontWeight:300 }}>🏢 {cl?.name||'Client'} · 👤 {iv.interviewer}</div>
              {iv.notes && <div style={{ fontSize:11.5, color:'#b7791f', marginTop:5, background:'#fffaf0', padding:'5px 10px', borderRadius:6, display:'inline-block' }}>💡 {iv.notes}</div>}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              <button style={S.btn()} onClick={()=>{const u={...iv,status:'completed'};setInterviews(p=>p.map(i=>i.id===iv.id?u:i));saveDoc('interviews',iv.id,u);showToast('✅ Marked complete');}}>Complete</button>
              <button style={{ ...S.btn(false, C.blue), padding:'7px 16px', fontSize:12 }} onClick={()=>{setForm({...iv});setModal({type:'interview',data:iv});}}>Edit</button>
              <button style={{ ...S.btn(false, C.danger), padding:'7px 16px', fontSize:12 }} onClick={()=>{setInterviews(p=>p.filter(i=>i.id!==iv.id));deleteFireDoc('interviews',iv.id);showToast('Removed');}}>Cancel</button>
            </div>
          </div>
        );
      })}
      {interviews.length===0 && (
        <div style={{ ...S.card, textAlign:'center', padding:'56px 0' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📅</div>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:15, color:C.navy, marginBottom:8 }}>No interviews yet</div>
          <button style={S.btn()} onClick={()=>{setForm(blank);setModal({type:'interview',data:null});}}>Schedule First Interview</button>
        </div>
      )}
      {modal?.type==='interview' && (
        <Modal title={modal.data?'Edit Interview':'Schedule Interview'} subtitle="Set date, time and consultant" onClose={closeModal} onSave={save} saveLabel={modal.data?'Update':'Schedule'} width={520}>
          <div style={S.grid2}>
            <div><label style={S.lbl}>Consultant *</label><select style={S.inp} value={form.consultantId} onChange={e=>setForm(p=>({...p,consultantId:e.target.value}))}><option value="">-- Select --</option>{consultants.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label style={S.lbl}>Client</label><select style={S.inp} value={form.clientId} onChange={e=>setForm(p=>({...p,clientId:e.target.value}))}><option value="">-- Select --</option>{clients.map(cl=><option key={cl.id} value={cl.id}>{cl.name}</option>)}</select></div>
            <div><label style={S.lbl}>Date *</label><input type="date" style={S.inp} value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
            <div><label style={S.lbl}>Time</label><input style={S.inp} value={form.time} onChange={e=>setForm(p=>({...p,time:e.target.value}))} placeholder="2:00 PM"/></div>
            <div><label style={S.lbl}>Interview Type</label><select style={S.inp} value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>{['Video','Phone','Onsite','Technical'].map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label style={S.lbl}>Interviewer Name</label><input style={S.inp} value={form.interviewer} onChange={e=>setForm(p=>({...p,interviewer:e.target.value}))}/></div>
            <div><label style={S.lbl}>Status</label><select style={S.inp} value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>{['scheduled','completed','cancelled','no-show'].map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label style={S.lbl}>Follow-up Date</label><input type="date" style={S.inp} value={form.followupDate} onChange={e=>setForm(p=>({...p,followupDate:e.target.value}))}/></div>
          </div>
          <div style={{ marginTop:14 }}><label style={S.lbl}>Prep Notes</label><textarea style={{ ...S.ta, minHeight:80 }} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/></div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// AI MATCHER
// ════════════════════════════════════════════════
function AIMatcher({ consultants, runAiMatch, aiLoading, aiResult, setAiResult, showToast }) {
  const [jobText, setJobText]           = useState('');
  const [consultantId, setConsultantId] = useState('');
  const [customResume, setCustomResume] = useState('');
  const scoreColor = s => s>=80?C.success:s>=50?'#b7791f':C.danger;
  const scoreBg    = s => s>=80?'#f0fff4':s>=50?'#fffaf0':'#fff5f5';

  const go = () => {
    if (!jobText.trim()) return;
    const con = consultants.find(c=>c.id===consultantId);
    const resumeText = customResume || (con ? `Name:${con.name}\nRole:${con.role}\nSkills:${Array.isArray(con.skills)?con.skills.join(','):con.skills}\nRate:${con.rate}\nExp:${con.yoe}yrs` : 'Senior tech consultant');
    runAiMatch(jobText, resumeText);
  };

  return (
    <div className="fu">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <div style={{ ...S.tag, marginBottom:4 }}>Powered by Claude</div>
          <div style={S.h1}>AI Matcher</div>
          <div style={{ fontSize:13, color:C.textLt, marginTop:3, fontWeight:300 }}>Paste a job → get match score + submission email instantly</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div>
          <div style={{ ...S.card, marginBottom:14 }}>
            <label style={{ ...S.lbl, marginBottom:8, fontSize:12 }}>Job Requirement</label>
            <textarea style={{ ...S.ta, minHeight:200 }} value={jobText} onChange={e=>setJobText(e.target.value)} placeholder="Paste job description here..."/>
          </div>
          <div style={S.card}>
            <label style={{ ...S.lbl, marginBottom:8, fontSize:12 }}>Match Against</label>
            <select style={{ ...S.inp, marginBottom:12 }} value={consultantId} onChange={e=>setConsultantId(e.target.value)}>
              <option value="">Best available (auto)</option>
              {consultants.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label style={{ ...S.lbl, marginBottom:6, fontSize:12 }}>Or paste resume text</label>
            <textarea style={{ ...S.ta, minHeight:80, marginBottom:14 }} value={customResume} onChange={e=>setCustomResume(e.target.value)} placeholder="Paste resume snippet..."/>
            <button style={{ ...S.btn(), width:'100%', padding:'12px', fontSize:13.5, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
              onClick={go} disabled={aiLoading||!jobText.trim()}>
              {aiLoading ? <><span className="spin">✦</span> Analyzing...</> : '✦ Run AI Match'}
            </button>
          </div>
        </div>
        <div>
          {!aiResult && !aiLoading && (
            <div style={{ ...S.card, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:360, textAlign:'center', gap:12, background:'linear-gradient(135deg,#eef6fb,#f6fafd)' }}>
              <Logo size={56}/>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:16, color:C.navy, fontWeight:600 }}>AI Match Engine</div>
              <div style={{ fontSize:13, color:C.textLt, maxWidth:240, fontWeight:300 }}>Paste a job on the left and click Run AI Match to get an instant score and email draft.</div>
            </div>
          )}
          {aiLoading && (
            <div style={{ ...S.card, display:'flex', alignItems:'center', justifyContent:'center', minHeight:360, background:'linear-gradient(135deg,#eef6fb,#f6fafd)' }}>
              <div style={{ textAlign:'center' }}>
                <div className="spin" style={{ fontSize:36, display:'block', marginBottom:14, color:C.blue }}>✦</div>
                <div style={{ fontSize:13.5, color:C.textLt }}>Claude is analyzing the match...</div>
              </div>
            </div>
          )}
          {aiResult && !aiLoading && (
            <div className="fu">
              <div style={{ ...S.card, marginBottom:14, borderTop:`3px solid ${scoreColor(aiResult.matchScore)}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:18, marginBottom:14 }}>
                  <div style={{ background:scoreBg(aiResult.matchScore), border:`2px solid ${scoreColor(aiResult.matchScore)}30`, borderRadius:12, padding:'12px 18px', textAlign:'center', flexShrink:0 }}>
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:40, fontWeight:700, color:scoreColor(aiResult.matchScore), lineHeight:1 }}>{aiResult.matchScore}</div>
                    <div style={{ fontSize:10, color:C.textXs, textTransform:'uppercase', letterSpacing:1 }}>Score</div>
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:15, color:C.navy }}>{aiResult.bestResource} Engineer</div>
                    <div style={{ fontSize:13, color:C.textLt, marginTop:4, fontWeight:300, lineHeight:1.6 }}>{aiResult.matchReason}</div>
                  </div>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:8 }}>
                  {aiResult.keySkillsMatched?.map(sk=><span key={sk} style={{ background:'#f0fff4', color:C.success, border:'1px solid #9ae6b430', fontSize:11, fontWeight:500, padding:'3px 11px', borderRadius:999 }}>✓ {sk}</span>)}
                </div>
                {aiResult.gaps?.length>0 && <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {aiResult.gaps.map(g=><span key={g} style={{ background:'#fffaf0', color:'#b7791f', border:'1px solid #f6e05e30', fontSize:11, fontWeight:500, padding:'3px 11px', borderRadius:999 }}>⚠ {g}</span>)}
                </div>}
              </div>
              <div style={S.card}>
                <div style={{ fontSize:12, color:C.blue, marginBottom:8, fontWeight:600 }}>Subject: {aiResult.emailSubject}</div>
                <textarea style={{ ...S.ta, minHeight:200, fontSize:12.5 }} defaultValue={aiResult.emailBody}/>
                <button style={{ ...S.btn(), marginTop:12, width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                  onClick={()=>{navigator.clipboard.writeText(`Subject: ${aiResult.emailSubject}\n\n${aiResult.emailBody}`);showToast('📋 Email copied!');}}>
                  📋 Copy Email to Clipboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// IMPORT HOTLIST
// ════════════════════════════════════════════════
function ImportHotlist({ jobs, setJobs, recruiters, showToast, setTab }) {
  const [text, setText]       = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);

  const parse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/claude', { method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1500, messages:[{role:'user',content:
          `Extract job openings from this recruiter hotlist. Return ONLY a JSON array (no markdown). Each item: {"title":string,"location":string,"rate":string,"duration":string,"skills":string}. Text:\n\n${text.slice(0,3000)}`}] }) });
      const data = await res.json();
      const txt = data.content?.map(c=>c.text||'').join('')||'';
      setPreview(JSON.parse(txt.replace(/```json|```/g,'').trim()));
    } catch {
      const lines = text.split('\n').filter(l=>l.trim().length>10);
      setPreview(lines.slice(0,8).map(l=>({ title:l.slice(0,80), location:'Remote', rate:'TBD', duration:'TBD', skills:'' })));
    }
    setLoading(false);
  };

  const importAll = () => {
    const newJobs = preview.map(j=>({ ...j, id:'j'+Date.now()+Math.random(), stage:'new', consultantId:'', recruiterId:'', clientId:'', notes:'', submittedDate:'', interviewDate:'', source:'hotlist' }));
    setJobs(p=>[...newJobs,...p]);
    showToast(`✅ Imported ${newJobs.length} jobs`);
    setPreview([]); setText(''); setTab('pipeline');
  };

  return (
    <div className="fu">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <div style={{ ...S.tag, marginBottom:4 }}>Smart Import</div>
          <div style={S.h1}>Import Hotlist</div>
          <div style={{ fontSize:13, color:C.textLt, marginTop:3, fontWeight:300 }}>Paste recruiter email — AI extracts all jobs automatically</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={S.card}>
          <label style={{ ...S.lbl, marginBottom:8, fontSize:12 }}>Paste Hotlist Email or Text</label>
          <textarea style={{ ...S.ta, minHeight:320 }} value={text} onChange={e=>setText(e.target.value)}
            placeholder={"Paste recruiter email here...\n\nSenior Java Developer - Remote - $85/hr C2C\nSkills: Spring Boot, Kafka, AWS\nDuration: 12 months\n\nDevOps Engineer - Dallas TX - $90/hr\nSkills: Kubernetes, Terraform\n..."}/>
          <button style={{ ...S.btn(), marginTop:14, width:'100%', padding:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
            onClick={parse} disabled={loading||!text.trim()}>
            {loading ? <><span className="spin">✦</span> Parsing...</> : '✦ Parse with AI'}
          </button>
        </div>
        <div>
          {preview.length>0 ? (
            <div className="fu">
              <div style={{ fontFamily:"'Poppins',sans-serif", fontWeight:600, fontSize:15, color:C.navy, marginBottom:14 }}>{preview.length} jobs found</div>
              <div style={{ maxHeight:380, overflowY:'auto', marginBottom:14, paddingRight:4 }}>
                {preview.map((j,i)=>(
                  <div key={i} style={{ ...S.card, marginBottom:8, padding:'13px 16px', borderLeft:`3px solid ${C.blue}` }}>
                    <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:13, fontWeight:600, color:C.navy, marginBottom:4 }}>{j.title}</div>
                    <div style={{ fontSize:11.5, color:C.textLt, fontWeight:300 }}>📍 {j.location} · 💰 {j.rate} · 🗓 {j.duration}</div>
                    {j.skills && <div style={{ fontSize:11.5, color:C.blue, marginTop:4 }}>{j.skills}</div>}
                  </div>
                ))}
              </div>
              <button style={{ ...S.btn(true, C.success), width:'100%', padding:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
                onClick={importAll}>✅ Import All {preview.length} Jobs → Pipeline</button>
            </div>
          ) : (
            <div style={{ ...S.card, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, textAlign:'center', gap:12, background:'linear-gradient(135deg,#eef6fb,#f6fafd)' }}>
              <div style={{ fontSize:40, opacity:.3 }}>↓</div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:15, color:C.navy, fontWeight:600 }}>Paste & Parse</div>
              <div style={{ fontSize:13, color:C.textLt, maxWidth:220, fontWeight:300 }}>AI extracts all jobs and shows a preview before importing to your pipeline</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════
// JOB FINDER
// ════════════════════════════════════════════════
function JobFinder({ consultants, jobs, setJobs, showToast, saveDoc }) {
  const [selConsultant, setSelConsultant] = useState('');
  const [mode, setMode]       = useState('search');
  const [query, setQuery]     = useState('');
  const [pasteText, setPasteText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [extracted, setExtracted] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());
  const [searchStep, setSearchStep] = useState('');

  const con = consultants.find(c=>c.id===selConsultant);
  const role = con ? RESOURCES.find(r=>r.id===con.role) : null;

  // Auto-build query when consultant selected
  const buildQuery = (c) => {
    if (!c) return '';
    const r = RESOURCES.find(x=>x.id===c.role);
    const skills = Array.isArray(c.skills) ? c.skills.slice(0,3).join(', ') : (c.skills||'').split(',').slice(0,3).join(', ');
    return `${r?.label||c.role} C2C contract remote ${skills}`;
  };

  const onSelectConsultant = (id) => {
    setSelConsultant(id);
    setResults([]);
    setExtracted(null);
    const c = consultants.find(x=>x.id===id);
    if (c) setQuery(buildQuery(c));
  };

  // ── AI web search via proxy
  const searchJobs = async () => {
    if (!query.trim()) { showToast('Enter a search query','err'); return; }
    setLoading(true); setResults([]); setSearchStep('Searching Dice, LinkedIn, Indeed, TechFetch...');
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{
            role: 'user',
            content: `Search for current C2C contract IT jobs matching: "${query}".
Search sites like dice.com, linkedin.com/jobs, indeed.com, techfetch.com, monster.com.
Find real, specific job postings. For each job extract: title, company, location, pay rate, duration, required skills, job board source, direct URL if available, recruiter/contact email if visible.
Return ONLY a valid JSON array, no markdown, no explanation, max 8 results:
[{"title":"","company":"","location":"","rate":"","duration":"","skills":"","source":"dice|linkedin|indeed|techfetch|other","url":"","recruiterEmail":"","postedDate":"","description":"","matchScore":0}]
Set matchScore 0-100 based on how well it matches: ${con ? `${role?.label||con.role}, skills: ${Array.isArray(con.skills)?con.skills.join(', '):con.skills}, rate: ${con.rate}` : query}`
          }]
        })
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSearchStep('Parsing results...');
      const textBlocks = (data.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('');
      const start = textBlocks.indexOf('[');
      const end   = textBlocks.lastIndexOf(']');
      if (start === -1) throw new Error('No results found');
      const parsed = JSON.parse(textBlocks.slice(start, end+1));
      setResults(parsed.sort((a,b)=>(b.matchScore||0)-(a.matchScore||0)));
      if (parsed.length === 0) showToast('No jobs found — try different keywords','err');
    } catch(e) {
      console.error('Search error:', e);
      showToast(`Search failed: ${e.message}`,'err');
    }
    setLoading(false); setSearchStep('');
  };

  // ── Extract from pasted text
  const extractJob = async () => {
    if (!pasteText.trim()) { showToast('Paste a job description first','err'); return; }
    setLoading(true); setExtracted(null); setSearchStep('Extracting job details...');
    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Extract all job details from this posting and return ONLY valid JSON, no markdown:
{"title":"","company":"","location":"","rate":"","duration":"","skills":"","source":"","url":"","recruiterEmail":"","recruiterName":"","description":"","matchScore":${con?`[0-100 match score for ${role?.label||con?.role} with skills ${Array.isArray(con?.skills)?con.skills.join(', '):con?.skills}]`:'50'}}

Job posting:
${pasteText}`
          }]
        })
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const txt = (data.content||[]).map(c=>c.text||'').join('');
      const start = txt.indexOf('{'); const end = txt.lastIndexOf('}');
      setExtracted(JSON.parse(txt.slice(start, end+1)));
    } catch(e) { showToast(`Extraction failed: ${e.message}`,'err'); }
    setLoading(false); setSearchStep('');
  };

  // ── Add to pipeline
  const addToPipeline = async (job) => {
    const id = 'j'+Date.now();
    const data = {
      id, title:job.title||'Untitled', stage:'new',
      consultantId:selConsultant||'',
      recruiterId:'', clientId:'',
      location:job.location||'Remote',
      rate:job.rate||'', duration:job.duration||'',
      skills:job.skills||'',
      notes:job.description?.slice(0,200)||'',
      source:job.source||'other',
      submittedDate:'', interviewDate:'',
      jobUrl:job.url||'', recruiterEmail:job.recruiterEmail||''
    };
    setJobs(p=>[data,...p]);
    await saveDoc('jobs', id, data);
    setAddedIds(p=>new Set([...p, job.url||job.title]));
    showToast(`✅ Added to pipeline`);
  };

  // ── Submit via Gmail
  const submitViaGmail = (job) => {
    const role = RESOURCES.find(r=>r.id===con?.role);
    const subject = `C2C ${role?.label||'Senior IT Consultant'} Available – Quantum Info Systems`;
    const body = con
      ? `Hi${job.recruiterName?' '+job.recruiterName:''},

I came across your posting for "${job.title}" and have a strong match available immediately for C2C.

👤 Consultant: ${con.name}
💼 Role: ${role?.label||con.role}
💰 Rate: ${con.rate}/hr C2C
⚡ Availability: ${con.avail||'Immediate'}
🛠 Skills: ${Array.isArray(con.skills)?con.skills.join(', '):con.skills||''}
📅 Experience: ${con.yoe||'10'}+ years

📋 Position: ${job.title}
📍 Location: ${job.location||'Remote'}

Resume and references available on request. Happy to set up a quick call.

Best regards,
Quantum Info Systems
hr@quantuminfosystems.com`
      : `Hi,

Interested in the "${job.title}" role. We have qualified C2C consultants available immediately.

Best regards,
Quantum Info Systems`;
    const url = `https://mail.google.com/mail/?view=cm${job.recruiterEmail?`&to=${encodeURIComponent(job.recruiterEmail)}`:''}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
    addToPipeline({...job, stage:'submitted', submittedDate:new Date().toISOString().split('T')[0]});
    showToast('✉ Gmail opened · added to pipeline');
  };

  const isAdded = (job) => addedIds.has(job.url||job.title);

  const JobCard = ({ job }) => {
    const score = job.matchScore||0;
    const scoreColor = score>=70?C.success:score>=40?'#b7791f':C.textLt;
    return (
      <div style={{ ...S.card, marginBottom:14, borderLeft:`4px solid ${score>=70?C.success:score>=40?'#b7791f':C.border}`, transition:'transform .2s,box-shadow .2s', opacity: isAdded(job)?0.6:1 }}
        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=C.shMd;}}
        onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=C.sh;}}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
              <div style={{ fontSize:14.5, fontWeight:700, color:C.navy }}>{job.title}</div>
              {score>0 && <span style={{ ...S.pill(scoreColor), fontSize:9.5 }}>{score}% match</span>}
              {isAdded(job) && <span style={{ ...S.pill(C.success,'#f0fff4'), fontSize:9.5 }}>✓ Added</span>}
            </div>
            <div style={{ fontSize:12.5, color:C.text, marginBottom:2 }}>
              {job.company && <span>🏢 {job.company}</span>}
              {job.location && <span>&nbsp;·&nbsp; 📍 {job.location}</span>}
            </div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:4 }}>
              {job.rate     && <span style={{ fontSize:12, color:C.success, fontWeight:600 }}>💰 {job.rate}</span>}
              {job.duration && <span style={{ fontSize:12, color:C.textLt }}>📅 {job.duration}</span>}
              {job.source   && <span style={{ ...S.pill(C.blue,C.blueTint), fontSize:9 }}>{job.source}</span>}
            </div>
          </div>
        </div>
        {job.skills && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
            {job.skills.split(',').slice(0,6).map(sk=>(
              <span key={sk} style={{ background:C.blueTint, color:C.blue, border:`1px solid ${C.blueRule}`, fontSize:10.5, padding:'2px 9px', borderRadius:999 }}>{sk.trim()}</span>
            ))}
          </div>
        )}
        {job.recruiterEmail && <div style={{ fontSize:11.5, color:C.blue, marginBottom:8 }}>📧 {job.recruiterEmail}</div>}
        {job.description && <div style={{ fontSize:11.5, color:C.textLt, marginBottom:10, lineHeight:1.6 }}>{job.description.slice(0,180)}{job.description.length>180?'...':''}</div>}
        <div style={{ display:'flex', gap:8, paddingTop:10, borderTop:`1px solid ${C.border}`, flexWrap:'wrap' }}>
          {job.url && <a href={job.url} target="_blank" rel="noreferrer" style={{ background:C.off, color:C.textLt, border:`1px solid ${C.border}`, borderRadius:999, padding:'6px 14px', fontSize:11, fontWeight:600, textDecoration:'none' }}>🔗 View Job</a>}
          <button style={{ background:C.blueTint, color:C.blue, border:`1px solid ${C.blueRule}`, borderRadius:999, padding:'6px 14px', fontSize:11, fontWeight:600, cursor:'pointer' }}
            onClick={()=>addToPipeline(job)} disabled={isAdded(job)}>
            {isAdded(job)?'✓ In Pipeline':'+ Add to Pipeline'}
          </button>
          <button style={{ background:'#fef9ec', color:'#b7791f', border:'1px solid #f6d86050', borderRadius:999, padding:'6px 14px', fontSize:11, fontWeight:600, cursor:'pointer' }}
            onClick={()=>submitViaGmail(job)}>✉ Submit via Gmail</button>
        </div>
      </div>
    );
  };

  return (
    <div className="fu">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <div style={{ ...S.tag, marginBottom:4 }}>Outbound</div>
          <div style={S.h1}>Job Finder</div>
          <div style={{ fontSize:13, color:C.textLt, marginTop:3, fontWeight:300 }}>Find jobs · match to your consultants · submit via Gmail</div>
        </div>
      </div>

      {/* Step 1: Select Consultant */}
      <div style={{ ...S.card, marginBottom:20, borderLeft:`4px solid ${selConsultant?C.success:C.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <div style={{ width:24, height:24, borderRadius:'50%', background:selConsultant?C.success:C.border, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{selConsultant?'✓':'1'}</div>
          <div style={{ fontSize:13.5, fontWeight:600, color:C.navy }}>Select Consultant</div>
          <div style={{ fontSize:12, color:C.textLt, marginLeft:4 }}>— jobs will be matched to their skills automatically</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:12, alignItems:'center' }}>
          <select style={S.inp} value={selConsultant} onChange={e=>onSelectConsultant(e.target.value)}>
            <option value="">— Pick a consultant to search jobs for —</option>
            {consultants.map(c=>{
              const r = RESOURCES.find(x=>x.id===c.role);
              return <option key={c.id} value={c.id}>{c.name} · {r?.label||c.role} · {c.rate} · {c.avail||'Immediate'}</option>;
            })}
          </select>
          {con && (
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <span style={{ ...S.pill(role?.color||C.blue, role?.bg||C.blueTint) }}>{role?.label||con.role}</span>
              <span style={{ ...S.pill(C.success,'#f0fff4') }}>{con.avail||'Immediate'}</span>
            </div>
          )}
        </div>
        {con && (
          <div style={{ marginTop:10, display:'flex', gap:5, flexWrap:'wrap' }}>
            {(Array.isArray(con.skills)?con.skills:con.skills?.split(',')||[]).map(sk=>(
              <span key={sk} style={{ background:role?.bg||C.blueTint, color:role?.color||C.blue, border:`1px solid ${role?.color||C.blue}20`, fontSize:10.5, padding:'2px 9px', borderRadius:999 }}>{sk.trim()}</span>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Find Jobs */}
      <div style={{ ...S.card, marginBottom:20, borderLeft:`4px solid ${results.length||extracted?C.success:C.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
          <div style={{ width:24, height:24, borderRadius:'50%', background:results.length||extracted?C.success:C.border, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{results.length||extracted?'✓':'2'}</div>
          <div style={{ fontSize:13.5, fontWeight:600, color:C.navy }}>Find Jobs</div>
        </div>

        {/* Mode tabs */}
        <div style={{ display:'flex', gap:0, marginBottom:16, background:C.off, border:`1px solid ${C.border}`, borderRadius:10, overflow:'hidden', width:'fit-content' }}>
          {[{id:'search',label:'🔍 AI Search'},{id:'paste',label:'📋 Paste Posting'}].map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id)}
              style={{ padding:'9px 22px', fontSize:13, fontWeight:mode===m.id?600:400, background:mode===m.id?C.navy:C.off, color:mode===m.id?'#fff':C.textLt, border:'none', cursor:'pointer', transition:'all .15s' }}>
              {m.label}
            </button>
          ))}
        </div>

        {mode==='search' && (
          <div>
            <div style={{ display:'flex', gap:10, marginBottom:12 }}>
              <input style={{ ...S.inp, flex:1 }}
                placeholder="e.g. Senior Java Developer C2C remote, DevOps Kubernetes contract..."
                value={query}
                onChange={e=>setQuery(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&searchJobs()}/>
              <button style={{ ...S.btn(), padding:'10px 28px', whiteSpace:'nowrap', flexShrink:0 }} onClick={searchJobs} disabled={loading}>
                {loading?<span className="spin">⟳</span>:'🔍 Search'}
              </button>
            </div>
            {/* Quick searches based on consultant */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:11, color:C.textXs, fontWeight:600, letterSpacing:1 }}>QUICK:</span>
              {(con ? [
                buildQuery(con),
                `${role?.label||con.role} C2C contract ${con.rate}`,
                `${role?.label||con.role} remote 6 months`,
                `${(Array.isArray(con.skills)?con.skills[0]:con.skills?.split(',')[0]||'').trim()} contract jobs`,
              ] : ['Senior Java C2C remote','DevOps Kubernetes contract','Data Engineer Snowflake','Senior .NET Azure']).map(q=>(
                <button key={q} onClick={()=>{ setQuery(q); }}
                  style={{ background:C.blueTint, color:C.blue, border:`1px solid ${C.blueRule}`, borderRadius:999, padding:'4px 12px', fontSize:11, cursor:'pointer', maxWidth:220, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode==='paste' && (
          <div>
            <label style={S.lbl}>Paste job description, email, or job posting text</label>
            <textarea style={{ ...S.ta, minHeight:140, marginBottom:12 }}
              placeholder="Paste the full job posting here — from Dice, LinkedIn, Indeed, a recruiter email, or anywhere..."
              value={pasteText} onChange={e=>setPasteText(e.target.value)}/>
            <button style={{ ...S.btn(), padding:'10px 28px' }} onClick={extractJob} disabled={loading}>
              {loading?<span className="spin">⟳</span>:'⚡ Extract & Match'}
            </button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ ...S.card, textAlign:'center', padding:'40px 20px', background:'linear-gradient(135deg,#eef6fb,#f6fafd)' }}>
          <div style={{ fontSize:32, marginBottom:12 }} className="spin">⟳</div>
          <div style={{ fontSize:14, color:C.navy, fontWeight:600, marginBottom:6 }}>{searchStep||'Working...'}</div>
          <div style={{ fontSize:12, color:C.textLt }}>This may take 10–15 seconds while AI searches the web</div>
        </div>
      )}

      {/* Extracted result */}
      {extracted && !loading && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:C.blue, marginBottom:12 }}>Extracted Job · {con?`Match for ${con.name}`:''}</div>
          <JobCard job={extracted}/>
        </div>
      )}

      {/* Search results */}
      {results.length > 0 && !loading && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:C.blue }}>{results.length} Jobs Found{con?` · Matched for ${con.name}`:''}</div>
            <span style={{ fontSize:12, color:C.textLt }}>Sorted by match score</span>
          </div>
          {results.map((job,i)=><JobCard key={i} job={job}/>)}
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length===0 && !extracted && (
        <div style={{ ...S.card, textAlign:'center', padding:'48px 24px', background:'linear-gradient(135deg,#eef6fb,#f9fbfd)' }}>
          <div style={{ fontSize:40, marginBottom:16, opacity:.4 }}>🔍</div>
          <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:15, color:C.navy, fontWeight:600, marginBottom:8 }}>
            {selConsultant ? `Ready to find jobs for ${con?.name}` : 'Start by selecting a consultant above'}
          </div>
          <div style={{ fontSize:13, color:C.textLt, maxWidth:400, margin:'0 auto', lineHeight:1.7 }}>
            {selConsultant
              ? 'Click a quick search tag or type your own query — AI will search Dice, LinkedIn, Indeed and return the best matches for their skills.'
              : 'Select a consultant first and the search will automatically be tailored to their role, skills and rate.'}
          </div>
        </div>
      )}
    </div>
  );
}


// ════════════════════════════════════════════════
// SUBMISSIONS TRACKER
// ════════════════════════════════════════════════
function Submissions({ submissions, setSubmissions, consultants, recruiters, jobs, showToast, saveDoc, deleteFireDoc }) {
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ consultantId:'', recruiterId:'', jobTitle:'', jobUrl:'', notes:'', status:'sent', sentAt: new Date().toISOString().split('T')[0] });

  const save = async () => {
    if (!form.consultantId || !form.recruiterId) { showToast('Select consultant and recruiter','err'); return; }
    const id = modal?.id || 's'+Date.now();
    const data = { ...form, id, loggedBy: 'user', loggedAt: new Date().toISOString() };
    if (modal?.id) { setSubmissions(p=>p.map(s=>s.id===id?data:s)); showToast('✅ Updated'); }
    else { setSubmissions(p=>[data,...p]); showToast('✅ Submission logged'); }
    await saveDoc('submissions', id, data);
    setModal(null);
  };

  const markReplied = async (sub) => {
    const updated = { ...sub, status:'replied', repliedAt: new Date().toISOString() };
    setSubmissions(p=>p.map(s=>s.id===sub.id?updated:s));
    await saveDoc('submissions', sub.id, updated);
    showToast('✅ Marked as replied');
  };

  const logFollowup = async (sub) => {
    const updated = { ...sub, lastFollowup: new Date().toISOString().split('T')[0], followupCount: (sub.followupCount||0)+1 };
    setSubmissions(p=>p.map(s=>s.id===sub.id?updated:s));
    await saveDoc('submissions', sub.id, updated);
    showToast('✅ Follow-up logged');
  };

  const today = new Date();
  const daysSince = (d) => d ? Math.floor((today - new Date(d)) / 86400000) : 999;

  const filtered = submissions.filter(s => {
    if (filter === 'followup') return s.status==='sent' && daysSince(s.sentAt) >= 3;
    if (filter === 'replied')  return s.status === 'replied';
    if (filter === 'sent')     return s.status === 'sent';
    return true;
  }).sort((a,b) => new Date(b.loggedAt||b.sentAt) - new Date(a.loggedAt||a.sentAt));

  const statCounts = {
    all:      submissions.length,
    sent:     submissions.filter(s=>s.status==='sent').length,
    followup: submissions.filter(s=>s.status==='sent' && daysSince(s.sentAt)>=3).length,
    replied:  submissions.filter(s=>s.status==='replied').length,
  };

  const statusColor = { sent:'#b7791f', replied:C.success, followup:C.danger };
  const statusBg    = { sent:'#fffaf0', replied:'#f0fff4', followup:'#fff5f5' };

  return (
    <div className="fu">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <div style={{ ...S.tag, marginBottom:4 }}>Outbound</div>
          <div style={S.h1}>Submission Tracker</div>
          <div style={{ fontSize:13, color:C.textLt, marginTop:3, fontWeight:300 }}>{submissions.length} total · track every email sent to recruiters</div>
        </div>
        <button style={S.btn()} onClick={()=>{ setForm({ consultantId:'', recruiterId:'', jobTitle:'', jobUrl:'', notes:'', status:'sent', sentAt: new Date().toISOString().split('T')[0] }); setModal({new:true}); }}>+ Log Submission</button>
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {[['all','All',C.navy],['sent','Pending','#b7791f'],['followup','Need Follow-up',C.danger],['replied','Replied',C.success]].map(([id,label,color])=>(
          <button key={id} onClick={()=>setFilter(id)}
            style={{ padding:'7px 16px', borderRadius:999, fontSize:12.5, fontWeight:filter===id?600:400, border:`1.5px solid ${filter===id?color:C.border}`, background:filter===id?`${color}15`:C.white, color:filter===id?color:C.textLt, cursor:'pointer', transition:'all .15s' }}>
            {label} <span style={{ fontWeight:700 }}>({statCounts[id]})</span>
          </button>
        ))}
      </div>

      {/* Follow-up alert */}
      {statCounts.followup > 0 && (
        <div style={{ background:'#fff5f5', border:`1px solid #feb2b2`, borderRadius:10, padding:'12px 18px', marginBottom:16, display:'flex', alignItems:'center', gap:12, fontSize:13 }}>
          <span>🔔</span>
          <span style={{ color:'#c53030', fontWeight:500 }}>{statCounts.followup} submission{statCounts.followup>1?'s':''} with no reply in 3+ days — follow up now!</span>
          <button onClick={()=>setFilter('followup')} style={{ marginLeft:'auto', background:'#c53030', color:'#fff', border:'none', borderRadius:999, padding:'5px 14px', fontSize:12, fontWeight:600, cursor:'pointer' }}>View</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', boxShadow:C.sh }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1.4fr 1.8fr 90px 80px 140px', padding:'10px 20px', background:C.off, borderBottom:`1.5px solid ${C.border}` }}>
          {['Consultant','Recruiter','Job / Position','Sent','Days','Actions'].map(h=>(
            <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:C.textXs }}>{h}</div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding:'48px 20px', textAlign:'center', color:C.textXs, fontSize:13 }}>
            {filter==='all' ? 'No submissions yet — log your first one above.' : 'No submissions match this filter.'}
          </div>
        )}

        {filtered.map((s,i) => {
          const con = consultants.find(c=>c.id===s.consultantId);
          const rec = recruiters.find(r=>r.id===s.recruiterId);
          const days = daysSince(s.sentAt);
          const needsFollowup = s.status==='sent' && days >= 3;
          const stColor = needsFollowup ? C.danger : (statusColor[s.status]||C.textLt);
          const stBg    = needsFollowup ? '#fff5f5' : (statusBg[s.status]||C.off);
          return (
            <div key={s.id} style={{ display:'grid', gridTemplateColumns:'1.6fr 1.4fr 1.8fr 90px 80px 140px', padding:'13px 20px', borderBottom: i<filtered.length-1?`1px solid ${C.border}`:'none', alignItems:'center', background: needsFollowup?'#fffbfb': i%2===0?C.white:'#fafcff' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.navy }}>{con?.name||s.consultantId}</div>
                <div style={{ fontSize:11, color:C.textXs }}>{RESOURCES.find(r=>r.id===con?.role)?.label||con?.role||''}</div>
              </div>
              <div>
                <div style={{ fontSize:13, color:C.text }}>{rec?.name||s.recruiterId}</div>
                <div style={{ fontSize:11, color:C.textXs }}>{rec?.company||''}</div>
              </div>
              <div>
                <div style={{ fontSize:13, color:C.text, fontWeight:500 }}>{s.jobTitle||'General submission'}</div>
                {s.jobUrl && <a href={s.jobUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, color:C.blue }}>View posting ↗</a>}
                {s.notes && <div style={{ fontSize:11, color:C.textXs, marginTop:2 }}>{s.notes.slice(0,60)}</div>}
              </div>
              <div style={{ fontSize:12, color:C.textLt }}>{s.sentAt}</div>
              <div>
                <span style={{ ...S.pill(stColor, stBg), fontSize:10 }}>{needsFollowup?`${days}d no reply`:s.status}</span>
                {s.followupCount>0 && <div style={{ fontSize:10, color:C.textXs, marginTop:3 }}>↩ {s.followupCount}x</div>}
              </div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                {s.status==='sent' && (
                  <>
                    <button style={{ background:'#f0fff4', color:C.success, border:'1px solid #9ae6b440', borderRadius:6, padding:'4px 9px', fontSize:10, fontWeight:600, cursor:'pointer' }} onClick={()=>markReplied(s)}>✓ Replied</button>
                    <button style={{ background:C.blueTint, color:C.blue, border:`1px solid ${C.blueRule}`, borderRadius:6, padding:'4px 9px', fontSize:10, fontWeight:600, cursor:'pointer' }} onClick={()=>logFollowup(s)}>↩ F/U</button>
                  </>
                )}
                <button style={{ background:'#fff5f5', color:C.danger, border:'1px solid #feb2b230', borderRadius:6, padding:'4px 7px', fontSize:10, cursor:'pointer' }} onClick={()=>{ setSubmissions(p=>p.filter(x=>x.id!==s.id)); deleteFireDoc('submissions',s.id); showToast('Removed'); }}>✕</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add submission modal */}
      {modal && (
        <Modal title="Log Submission" subtitle="Record a submission you sent to a recruiter" onClose={()=>setModal(null)} onSave={save} saveLabel="Log Submission" width={500}>
          <div style={S.grid2}>
            <div><label style={S.lbl}>Consultant *</label><select style={S.inp} value={form.consultantId} onChange={e=>setForm(p=>({...p,consultantId:e.target.value}))}><option value="">-- Select --</option>{consultants.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label style={S.lbl}>Recruiter *</label><select style={S.inp} value={form.recruiterId} onChange={e=>setForm(p=>({...p,recruiterId:e.target.value}))}><option value="">-- Select --</option>{recruiters.map(r=><option key={r.id} value={r.id}>{r.name} · {r.company}</option>)}</select></div>
            <div><label style={S.lbl}>Date Sent</label><input type="date" style={S.inp} value={form.sentAt} onChange={e=>setForm(p=>({...p,sentAt:e.target.value}))}/></div>
            <div><label style={S.lbl}>Status</label><select style={S.inp} value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}><option value="sent">Sent</option><option value="replied">Replied</option></select></div>
          </div>
          <div style={{ marginTop:14 }}><label style={S.lbl}>Job Title / Position</label><input style={S.inp} value={form.jobTitle} placeholder="Senior Java Developer – Remote" onChange={e=>setForm(p=>({...p,jobTitle:e.target.value}))}/></div>
          <div style={{ marginTop:14 }}><label style={S.lbl}>Job URL (optional)</label><input style={S.inp} value={form.jobUrl} placeholder="https://dice.com/jobs/..." onChange={e=>setForm(p=>({...p,jobUrl:e.target.value}))}/></div>
          <div style={{ marginTop:14 }}><label style={S.lbl}>Notes</label><textarea style={{ ...S.ta, minHeight:70 }} value={form.notes} placeholder="Any notes about this submission..." onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/></div>
        </Modal>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// ANALYTICS DASHBOARD
// ════════════════════════════════════════════════
function Analytics({ jobs, submissions, consultants, recruiters, interviews }) {
  const [period, setPeriod] = useState(30);

  const cutoff = new Date(Date.now() - period * 86400000);
  const recentSubs = submissions.filter(s => new Date(s.sentAt||s.loggedAt) >= cutoff);
  const recentJobs = jobs.filter(j => new Date(j.submittedDate) >= cutoff || j.stage === 'placed');

  const placed = jobs.filter(j=>j.stage==='placed');
  const subRate   = submissions.length ? Math.round((jobs.filter(j=>j.stage!=='new').length / Math.max(submissions.length,1)) * 100) : 0;
  const ivRate    = submissions.length ? Math.round((interviews.length / Math.max(submissions.length,1)) * 100) : 0;
  const placeRate = submissions.length ? Math.round((placed.length / Math.max(submissions.length,1)) * 100) : 0;

  // Per consultant stats
  const conStats = consultants.map(c => ({
    ...c,
    submissions: submissions.filter(s=>s.consultantId===c.id).length,
    interviews:  interviews.filter(i=>i.consultantId===c.id).length,
    placed:      jobs.filter(j=>j.consultantId===c.id && j.stage==='placed').length,
  })).sort((a,b)=>b.submissions-a.submissions);

  // Per recruiter stats
  const recStats = recruiters.map(r => ({
    ...r,
    submissions: submissions.filter(s=>s.recruiterId===r.id).length,
    replies:     submissions.filter(s=>s.recruiterId===r.id && s.status==='replied').length,
  })).sort((a,b)=>b.submissions-a.submissions);

  // Pipeline funnel
  const funnel = [
    { label:'Submissions', val:submissions.length,     color:C.blue,    w:100 },
    { label:'In Pipeline', val:jobs.filter(j=>j.stage!=='new').length, color:'#6b46c1', w: submissions.length ? jobs.filter(j=>j.stage!=='new').length/submissions.length*100 : 0 },
    { label:'Interviews',  val:interviews.length,      color:'#b7791f', w: submissions.length ? interviews.length/submissions.length*100 : 0 },
    { label:'Placed',      val:placed.length,          color:C.success, w: submissions.length ? placed.length/submissions.length*100 : 0 },
  ];

  const Bar = ({val, max, color}) => (
    <div style={{ flex:1, height:8, background:C.off, borderRadius:4, overflow:'hidden', border:`1px solid ${C.border}` }}>
      <div style={{ width:`${max?Math.round(val/max*100):0}%`, height:'100%', background:color, borderRadius:4, transition:'width .6s ease' }}/>
    </div>
  );

  return (
    <div className="fu">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <div style={{ ...S.tag, marginBottom:4 }}>Intelligence</div>
          <div style={S.h1}>Analytics</div>
          <div style={{ fontSize:13, color:C.textLt, marginTop:3, fontWeight:300 }}>Conversion rates · performance · pipeline health</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {[7,30,90].map(d=>(
            <button key={d} onClick={()=>setPeriod(d)}
              style={{ padding:'7px 16px', borderRadius:999, fontSize:12, fontWeight:period===d?600:400, border:`1.5px solid ${period===d?C.navy:C.border}`, background:period===d?C.navy:C.white, color:period===d?'#fff':C.textLt, cursor:'pointer' }}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Conversion KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          { label:'Total Submissions', val:submissions.length, sub:'All time', color:C.blue },
          { label:'Response Rate',     val:`${placeRate+ivRate}%`, sub:'Replied or interviewed', color:'#6b46c1' },
          { label:'Interview Rate',    val:`${ivRate}%`, sub:'Submissions → interview', color:'#b7791f' },
          { label:'Placement Rate',    val:`${placeRate}%`, sub:'Submissions → placed', color:C.success },
        ].map(k=>(
          <div key={k.label} style={{ ...S.card, borderTop:`3px solid ${k.color}` }}>
            <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:30, fontWeight:700, color:k.color, lineHeight:1 }}>{k.val}</div>
            <div style={{ fontSize:12.5, color:C.navy, fontWeight:600, marginTop:6 }}>{k.label}</div>
            <div style={{ fontSize:11, color:C.textXs, marginTop:2 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Funnel + Consultant performance */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
        {/* Funnel */}
        <div style={S.card}>
          <div style={{ ...S.tag, marginBottom:6 }}>Conversion Funnel</div>
          <div style={{ ...S.h2, marginBottom:18 }}>Submission → Placement</div>
          {funnel.map(f=>(
            <div key={f.label} style={{ marginBottom:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, color:C.text }}>{f.label}</span>
                <span style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:f.color, fontSize:14 }}>{f.val}</span>
              </div>
              <div style={{ height:10, background:C.off, borderRadius:5, overflow:'hidden', border:`1px solid ${C.border}` }}>
                <div style={{ width:`${Math.min(f.w,100)}%`, minWidth: f.val>0?'4px':'0', height:'100%', background:f.color, borderRadius:5, transition:'width .8s ease' }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Top recruiters */}
        <div style={S.card}>
          <div style={{ ...S.tag, marginBottom:6 }}>Recruiter Performance</div>
          <div style={{ ...S.h2, marginBottom:18 }}>Submissions per recruiter</div>
          {recStats.slice(0,6).map((r,i)=>(
            <div key={r.id} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:C.blueTint, border:`1px solid ${C.blueRule}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:C.blue, flexShrink:0 }}>{i+1}</div>
              <div style={{ flex:1, overflow:'hidden' }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:C.navy, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{r.name}</div>
                <div style={{ fontSize:11, color:C.textXs }}>{r.company}</div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                <span style={{ fontSize:12, color:C.textLt }}>{r.replies}/{r.submissions}</span>
                <Bar val={r.replies} max={Math.max(...recStats.map(x=>x.submissions),1)} color={C.success}/>
              </div>
            </div>
          ))}
          {recStats.length===0 && <div style={{ color:C.textXs, fontSize:13, textAlign:'center', padding:'20px 0' }}>No submissions yet</div>}
        </div>
      </div>

      {/* Consultant performance table */}
      <div style={{ ...S.card }}>
        <div style={{ ...S.tag, marginBottom:6 }}>Consultant Performance</div>
        <div style={{ ...S.h2, marginBottom:16 }}>Submissions, interviews and placements per consultant</div>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 2fr', gap:0, padding:'8px 0', borderBottom:`1.5px solid ${C.border}`, marginBottom:4 }}>
          {['Consultant','Submissions','Interviews','Placed','Interview Rate'].map(h=>(
            <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:C.textXs }}>{h}</div>
          ))}
        </div>
        {conStats.map((c,i) => {
          const role = RESOURCES.find(r=>r.id===c.role);
          const ivR = c.submissions ? Math.round(c.interviews/c.submissions*100) : 0;
          return (
            <div key={c.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 2fr', gap:0, padding:'12px 0', borderBottom: i<conStats.length-1?`1px solid ${C.border}`:'none', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:role?.bg||C.blueTint, border:`2px solid ${role?.color||C.blue}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:role?.color||C.blue }}>
                  {c.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.navy }}>{c.name}</div>
                  <div style={{ fontSize:11, color:role?.color||C.blue }}>{role?.label||c.role}</div>
                </div>
              </div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:20, fontWeight:700, color:C.navy }}>{c.submissions}</div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:20, fontWeight:700, color:'#6b46c1' }}>{c.interviews}</div>
              <div style={{ fontFamily:"'Poppins',sans-serif", fontSize:20, fontWeight:700, color:C.success }}>{c.placed}</div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:13, fontWeight:600, color: ivR>30?C.success:ivR>10?'#b7791f':C.textLt, minWidth:36 }}>{ivR}%</span>
                <div style={{ flex:1, height:8, background:C.off, borderRadius:4, overflow:'hidden', border:`1px solid ${C.border}` }}>
                  <div style={{ width:`${ivR}%`, height:'100%', background: ivR>30?C.success:ivR>10?'#b7791f':C.textLt, borderRadius:4, transition:'width .6s' }}/>
                </div>
              </div>
            </div>
          );
        })}
        {conStats.length===0 && <div style={{ color:C.textXs, fontSize:13, textAlign:'center', padding:'20px 0' }}>No data yet</div>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// USER MANAGER — Admin only
// ════════════════════════════════════════════════
function UserManager({ db, showToast, currentUser }) {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState({ name:'', email:'', role:'recruiter' });
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const saveUser = async () => {
    if (!form.email.trim()) { showToast('Email is required','err'); return; }
    setSaving(true);
    const id = form.email.toLowerCase().replace(/[^a-z0-9]/g,'-');
    const data = {
      name:   form.name.trim(),
      email:  form.email.toLowerCase().trim(),
      role:   form.role,
      status: 'active',
      addedBy: currentUser.email,
      addedAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'users', id), data);
      showToast(`✅ ${form.email} added as ${form.role}`);
      setModal(false);
      setForm({ name:'', email:'', role:'recruiter' });
    } catch(e) { showToast('Failed to add user','err'); }
    setSaving(false);
  };

  const toggleStatus = async (u) => {
    const newStatus = u.status === 'active' ? 'disabled' : 'active';
    await setDoc(doc(db, 'users', u.id), { ...u, status: newStatus });
    showToast(newStatus==='active' ? `✅ ${u.email} re-enabled` : `🚫 ${u.email} disabled`);
  };

  const changeRole = async (u, role) => {
    await setDoc(doc(db, 'users', u.id), { ...u, role });
    showToast(`✅ ${u.email} → ${role}`);
  };

  const removeUser = async (u) => {
    if (u.email === currentUser.email) { showToast('Cannot remove yourself','err'); return; }
    await deleteDoc(doc(db, 'users', u.id));
    showToast('User removed');
  };

  const roleColor = { admin:'#6b46c1', recruiter:C.blue, viewer:C.textLt };
  const roleBg    = { admin:'#faf5ff', recruiter:C.blueTint, viewer:C.off };

  return (
    <div className="fu">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24 }}>
        <div>
          <div style={{ ...S.tag, marginBottom:4 }}>Admin</div>
          <div style={S.h1}>Team Access</div>
          <div style={{ fontSize:13, color:C.textLt, marginTop:3, fontWeight:300 }}>Manage who can log in and what they can see</div>
        </div>
        <button style={S.btn()} onClick={()=>setModal(true)}>+ Invite User</button>
      </div>

      {/* Role guide */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
        {[
          { role:'admin',     icon:'👑', desc:'Full access. Manage users, all data, analytics.', color:'#6b46c1', bg:'#faf5ff' },
          { role:'recruiter', icon:'💼', desc:'Add/edit jobs, consultants, submissions. No user management.', color:C.blue, bg:C.blueTint },
          { role:'viewer',    icon:'👁', desc:'Read-only. Can view all data but cannot edit or delete.', color:C.textLt, bg:C.off },
        ].map(r=>(
          <div key={r.role} style={{ background:r.bg, border:`1px solid ${r.color}20`, borderRadius:12, padding:'14px 16px' }}>
            <div style={{ fontSize:18, marginBottom:6 }}>{r.icon}</div>
            <div style={{ fontSize:13, fontWeight:600, color:r.color, textTransform:'capitalize', marginBottom:4 }}>{r.role}</div>
            <div style={{ fontSize:12, color:C.textLt, lineHeight:1.5 }}>{r.desc}</div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', boxShadow:C.sh }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 2fr 120px 100px 130px', padding:'10px 20px', background:C.off, borderBottom:`1.5px solid ${C.border}` }}>
          {['Name','Email','Role','Status','Actions'].map(h=>(
            <div key={h} style={{ fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:C.textXs }}>{h}</div>
          ))}
        </div>

        {loading && <div style={{ padding:'32px', textAlign:'center', color:C.textXs, fontSize:13 }}>Loading...</div>}

        {!loading && users.length === 0 && (
          <div style={{ padding:'32px', textAlign:'center' }}>
            <div style={{ fontSize:13, color:C.textXs, marginBottom:12 }}>No users yet — add yourself first so you don't get locked out!</div>
            <button style={S.btn()} onClick={()=>{ setForm({ name: currentUser.displayName||'', email: currentUser.email, role:'admin' }); setModal(true); }}>
              + Add Myself as Admin
            </button>
          </div>
        )}

        {users.map((u,i) => (
          <div key={u.id} style={{ display:'grid', gridTemplateColumns:'2fr 2fr 120px 100px 130px', padding:'13px 20px', borderBottom: i<users.length-1?`1px solid ${C.border}`:'none', alignItems:'center', background: u.status==='disabled'?'#fafafa': i%2===0?C.white:'#fafcff', opacity: u.status==='disabled'?0.6:1 }}>
            <div>
              <div style={{ fontSize:13.5, fontWeight:600, color:C.navy }}>{u.name||'—'}</div>
              {u.email===currentUser.email && <span style={{ fontSize:10, color:C.success, fontWeight:600 }}>● You</span>}
            </div>
            <div style={{ fontSize:12.5, color:C.text }}>{u.email}</div>
            <div>
              <select value={u.role} onChange={e=>changeRole(u,e.target.value)}
                style={{ background:roleBg[u.role]||C.off, color:roleColor[u.role]||C.text, border:`1px solid ${roleColor[u.role]||C.border}30`, borderRadius:999, padding:'4px 10px', fontSize:11.5, fontWeight:600, cursor:'pointer', outline:'none' }}>
                <option value="admin">Admin</option>
                <option value="recruiter">Recruiter</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div>
              <span style={{ ...S.pill(u.status==='active'?C.success:C.danger, u.status==='active'?'#f0fff4':'#fff5f5'), fontSize:10 }}>
                {u.status==='active'?'● Active':'○ Disabled'}
              </span>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {u.email !== currentUser.email && (
                <button onClick={()=>toggleStatus(u)}
                  style={{ background:u.status==='active'?'#fff5f5':'#f0fff4', color:u.status==='active'?C.danger:C.success, border:`1px solid ${u.status==='active'?'#feb2b230':'#9ae6b430'}`, borderRadius:6, padding:'4px 9px', fontSize:10.5, fontWeight:600, cursor:'pointer' }}>
                  {u.status==='active'?'Disable':'Enable'}
                </button>
              )}
              {u.email !== currentUser.email && (
                <button onClick={()=>removeUser(u)}
                  style={{ background:'transparent', color:C.textXs, border:`1px solid ${C.border}`, borderRadius:6, padding:'4px 9px', fontSize:10.5, cursor:'pointer' }}>✕</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite modal */}
      {modal && (
        <Modal title="Invite Team Member" subtitle="They must sign in with this exact email" onClose={()=>setModal(false)} onSave={saveUser} saveLabel={saving?'Adding...':'Add User'} width={460}>
          <div style={{ marginBottom:14 }}>
            <label style={S.lbl}>Full Name</label>
            <input style={S.inp} value={form.name} placeholder="Alex Rivera" onChange={e=>setForm(p=>({...p,name:e.target.value}))}/>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={S.lbl}>Email Address *</label>
            <input style={S.inp} type="email" value={form.email} placeholder="alex@company.com" onChange={e=>setForm(p=>({...p,email:e.target.value}))}/>
            <div style={{ fontSize:11.5, color:C.textLt, marginTop:6 }}>They must use this exact email to sign in with Google or password.</div>
          </div>
          <div style={{ marginBottom:6 }}>
            <label style={S.lbl}>Role</label>
            <select style={S.inp} value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))}>
              <option value="admin">Admin — full access</option>
              <option value="recruiter">Recruiter — add/edit data</option>
              <option value="viewer">Viewer — read only</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}
