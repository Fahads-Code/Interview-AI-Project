import { useEffect, useState } from "react";
import { useInterview } from "../hooks/useInterview";
import { useParams, useNavigate } from "react-router";
import useTheme from "../hooks/useInterview"; 
import html2pdf from "html2pdf.js"; // 1. html2pdf import kiya

// ── Severity Badge ────────────────────────────────────────────────
const SEV = {
  high:   { color: "#ef4444", bg: "#ef444418", border: "#ef444433" },
  medium: { color: "#f59e0b", bg: "#f59e0b18", border: "#f59e0b33" },
  low:    { color: "#10a37f", bg: "#10a37f18", border: "#10a37f33" },
};

const SeverityBadge = ({ severity }) => {
  const s = SEV[severity] || SEV.low;
  return (
    <span style={{ fontSize:"10px", fontWeight:700, padding:"2px 8px", borderRadius:"5px", background:s.bg, color:s.color, border:`1px solid ${s.border}`, letterSpacing:"0.4px" }}>
      {severity?.toUpperCase()}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────
const InterviewReport = () => {
  const { report, loading, getReportById } = useInterview(); // getResumePdf remove kiya kyunke ab frontend sambhalega
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("technical");
  const [activeQ, setActiveQ]         = useState(null);

  useEffect(() => {
    if (interviewId) getReportById(interviewId);
  }, [interviewId]);

  const dk = isDark;
  
  const T = {
    pageBg:         dk ? "#212121" : "#f9f9f9",
    sidebarBg:      dk ? "#171717" : "#f0f0f0",
    sidebarBorder:  dk ? "#2a2a2a" : "#e0e0e0",
    cardBg:         dk ? "#2f2f2f" : "#ffffff",
    cardBorder:     dk ? "#3d3d3d" : "#e0e0e0",
    inputBg:        dk ? "#2f2f2f" : "#ffffff",
    inputBorder:    dk ? "#3d3d3d" : "#d4d4d4",
    headText:       dk ? "#ececec" : "#0d0d0d",
    bodyText:       dk ? "#c2c2c2" : "#343434",
    mutedText:      dk ? "#8e8ea0" : "#6e6e80",
    accent:         "#10a37f", 
    accentHover:    "#0d8c6b",
    accentSoft:     dk ? "#10a37f18" : "#10a37f10",
    divider:        dk ? "#2f2f2f" : "#e5e5e5",
    topbarBg:       dk ? "#171717" : "#f0f0f0",
    topbarBorder:   dk ? "#2a2a2a" : "#e0e0e0",
    hoverBg:        dk ? "#2a2a2a" : "#e8e8e8",
    activeItem:     dk ? "#2f2f2f" : "#ffffff",
    primary:        "#10a37f", 
    primarySoft:    dk ? "#10a37f18" : "#10a37f10",
    primaryBorder:  "#10a37f33",
    secondary:      "#2ea043", 
    secondarySoft:  dk ? "#2ea04320" : "#2ea04310",
  };

  // 2. Frontend PDF Generation Logic
  const handleDownloadPDF = () => {
    if (!report) return;

    const element = document.createElement("div");
    element.innerHTML = `
      <div style="padding: 40px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; background: #fff;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #10a37f; padding-bottom: 20px;">
          <h1 style="color: #10a37f; margin: 0 0 10px 0; font-size: 28px;">Job Pilot - Interview Preparation Report</h1>
          <p style="font-size: 16px; color: #555; margin: 0; font-weight: 600;">${report.title || "AI Analysis Report"}</p>
          <div style="margin-top: 15px; font-size: 18px; color: #333;">
            <strong>Match Score: <span style="color: #10a37f;">${report.matchScore}/100</span></strong>
          </div>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="color: #10a37f; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-size: 18px;">Technical Questions & Reference Answers</h2>
          ${report.technicalQuestions?.map((q, i) => `
            <div style="margin-bottom: 15px; page-break-inside: avoid;">
              <p style="font-weight: bold; margin: 0 0 5px 0; color: #0d0d0d; font-size: 13px;">Q${i+1}: ${q.question}</p>
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #555;"><strong>Intention:</strong> ${q.intention}</p>
              <p style="margin: 0; font-size: 12px; color: #2b2b2b; background: #f4fbf9; padding: 8px; border-left: 3px solid #10a37f; border-radius: 4px;"><strong>Best Answer:</strong> ${q.answer}</p>
            </div>
          `).join('') || '<p style="font-size:12px; color:#777;">No technical questions generated.</p>'}
        </div>

        <div style="margin-bottom: 25px; page-break-before: auto;">
          <h2 style="color: #2ea043; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-size: 18px;">Behavioral Questions & Reference Answers</h2>
          ${report.behavioralQuestions?.map((q, i) => `
            <div style="margin-bottom: 15px; page-break-inside: avoid;">
              <p style="font-weight: bold; margin: 0 0 5px 0; color: #0d0d0d; font-size: 13px;">Q${i+1}: ${q.question}</p>
              <p style="margin: 0 0 5px 0; font-size: 12px; color: #555;"><strong>Intention:</strong> ${q.intention}</p>
              <p style="margin: 0; font-size: 12px; color: #2b2b2b; background: #f5fbf6; padding: 8px; border-left: 3px solid #2ea043; border-radius: 4px;"><strong>Best Answer:</strong> ${q.answer}</p>
            </div>
          `).join('') || '<p style="font-size:12px; color:#777;">No behavioral questions generated.</p>'}
        </div>

        <div style="margin-bottom: 25px; page-break-before: auto;">
          <h2 style="color: #10a37f; border-bottom: 1px solid #ddd; padding-bottom: 5px; font-size: 18px;">Preparation Roadmap</h2>
          ${report.preprationPlans?.map((plan) => `
            <div style="margin-bottom: 15px; background: #fafafa; padding: 12px; border-radius: 6px; page-break-inside: avoid;">
              <span style="background: #10a37f; color: #fff; font-size: 11px; font-weight: bold; padding: 2px 8px; border-radius: 10px;">Day ${plan.day}</span>
              <strong style="font-size: 13px; marginLeft: 10px; color: #0d0d0d;"> - Focus: ${plan.focus}</strong>
              <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 12px; color: #343434;">
                ${plan.tasks?.map(task => `<li style="margin-bottom: 4px;">${task}</li>`).join('')}
              </ul>
            </div>
          `).join('') || '<p style="font-size:12px; color:#777;">No roadmap available.</p>'}
        </div>
      </div>
    `;

    const opt = {
      margin:       0.5,
      filename:     `Interview_Report_${interviewId}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const navItems = [
    {
      key: "technical", label: "Technical", count: report?.technicalQuestions?.length ?? 0,
      icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
    },
    {
      key: "behavioral", label: "Behavioral", count: report?.behavioralQuestions?.length ?? 0,
      icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round"/></svg>,
    },
    {
      key: "roadmap", label: "Road Map", count: report?.preprationPlans?.length ?? 0,
      icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    },
  ];

  const scoreColor = report?.matchScore >= 70 ? "#10a37f" : report?.matchScore >= 50 ? "#f59e0b" : "#ef4444";

  if (loading) return (
    <div style={{ minHeight:"100vh", background:T.pageBg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"20px", fontFamily:"ui-sans-serif,system-ui,-apple-system,sans-serif" }}>
      <div style={{ position:"relative", width:"44px", height:"44px" }}>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:`3px solid ${T.divider}` }}/>
        <div className="animate-spin" style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid transparent", borderTopColor:T.accent }}/>
      </div>
      <div style={{ textAlign:"center" }}>
        <p style={{ color:T.headText, fontWeight:600, fontSize:"15px", margin:0 }}>Loading report...</p>
        <p style={{ color:T.mutedText, fontSize:"13px", margin:"4px 0 0" }}>Fetching data from database</p>
      </div>
    </div>
  );

  if (!report) return (
    <div style={{ minHeight:"100vh", background:T.pageBg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"ui-sans-serif,system-ui,-apple-system,sans-serif" }}>
      <p style={{ color:T.mutedText, fontSize:"14px" }}>Report not found.</p>
    </div>
  );

  const QuestionCard = ({ q, idx, prefix, accentColor }) => {
    const key = `${prefix}${idx}`;
    const open = activeQ === key;
    return (
      <div
        onClick={() => setActiveQ(open ? null : key)}
        style={{ background:T.cardBg, border:`1px solid ${open ? accentColor : T.cardBorder}`, borderRadius:"12px", overflow:"hidden", cursor:"pointer", transition:"all 0.15s ease" }}
      >
        <div style={{ display:"flex", alignItems:"flex-start", gap:"12px", padding:"14px 16px" }}>
          <span style={{ width:"22px", height:"22px", borderRadius:"6px", background:accentColor+"20", color:accentColor, fontSize:"11px", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, border:`1px solid ${accentColor}33` }}>
            {String(idx+1).padStart(2,"0")}
          </span>
          <p style={{ flex:1, margin:0, fontSize:"13px", fontWeight:500, color:T.headText, lineHeight:1.55 }}>{q.question}</p>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={T.mutedText} strokeWidth="2" style={{ flexShrink:0, marginTop:"2px", transform:open?"rotate(180deg)":"rotate(0deg)", transition:"transform 0.2s" }}>
            <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        {open && (
          <div style={{ borderTop:`1px solid ${T.divider}`, padding:"14px 16px", display:"flex", flexDirection:"column", gap:"12px", background: dk ? "#11182750" : "#f8fafc" }}>
            <div style={{ background:T.pageBg, borderRadius:"8px", padding:"10px 13px", border:`1px solid ${T.cardBorder}` }}>
              <p style={{ margin:"0 0 5px", fontSize:"10px", fontWeight:700, color:accentColor, letterSpacing:"0.6px" }}>INTENTION</p>
              <p style={{ margin:0, fontSize:"12px", color:T.bodyText, lineHeight:1.6 }}>{q.intention}</p>
            </div>
            <div style={{ background:T.accentSoft, borderRadius:"8px", padding:"10px 13px", border:`1px solid ${T.accent}22` }}>
              <p style={{ margin:"0 0 5px", fontSize:"10px", fontWeight:700, color:T.accent, letterSpacing:"0.6px" }}>BEST ANSWER</p>
              <p style={{ margin:0, fontSize:"12px", color:T.bodyText, lineHeight:1.6 }}>{q.answer}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMain = () => {
    if (activeSection === "technical") return (
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px" }}>
          <h2 style={{ margin:0, fontSize:"15px", fontWeight:700, color:T.headText }}>Technical Questions</h2>
          <span style={{ fontSize:"12px", color:T.mutedText }}>{report.technicalQuestions?.length} questions</span>
        </div>
        {report.technicalQuestions?.map((q, i) => (
          <QuestionCard key={i} q={q} idx={i} prefix="t" accentColor={T.primary} />
        ))}
      </div>
    );

    if (activeSection === "behavioral") return (
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px" }}>
          <h2 style={{ margin:0, fontSize:"15px", fontWeight:700, color:T.headText }}>Behavioral Questions</h2>
          <span style={{ fontSize:"12px", color:T.mutedText }}>{report.behavioralQuestions?.length} questions</span>
        </div>
        {report.behavioralQuestions?.map((q, i) => (
          <QuestionCard key={i} q={q} idx={i} prefix="b" accentColor={T.secondary} />
        ))}
      </div>
    );

    if (activeSection === "roadmap") return (
      <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"6px" }}>
          <h2 style={{ margin:0, fontSize:"15px", fontWeight:700, color:T.headText }}>Preparation Road Map</h2>
          <span style={{ fontSize:"12px", color:T.mutedText }}>{report.preprationPlans?.length} days</span>
        </div>
        {report.preprationPlans?.map((plan, i) => (
          <div key={i} style={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:"12px", padding:"16px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
              <span style={{ background:T.primary, color:"#fff", fontSize:"11px", fontWeight:700, padding:"3px 10px", borderRadius:"20px" }}>Day {plan.day}</span>
              <span style={{ fontSize:"13px", fontWeight:600, color:T.headText }}>{plan.focus}</span>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
              {plan.tasks?.map((task, j) => (
                <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:"8px" }}>
                  <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:T.secondary, marginTop:"6px", flexShrink:0 }}/>
                  <p style={{ margin:0, fontSize:"12px", color:T.bodyText, lineHeight:1.6 }}>{task}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:T.pageBg, display:"flex", fontFamily:"ui-sans-serif,system-ui,-apple-system,sans-serif", color:T.headText, transition: "background 0.2s ease" }}>

      {/* ── Left Sidebar ────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? "220px" : "0px",
        minWidth: sidebarOpen ? "220px" : "0px",
        background: T.sidebarBg,
        borderRight: `1px solid ${T.sidebarBorder}`,
        display: "flex", flexDirection: "column",
        transition: "width 0.2s ease, min-width 0.2s ease, background 0.2s ease, border-color 0.2s ease",
        overflow: "hidden",
        position: "sticky", top:0, height:"100vh",
      }}>
        {/* Logo */}
        <div style={{ padding:"16px 12px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${T.sidebarBorder}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"28px", height:"28px", borderRadius:"7px", background:T.accent, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize:"14px", fontWeight:600, color:T.headText, whiteSpace:"nowrap" }}>Job Pilot</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", borderRadius:"6px", color:T.mutedText }}
            onMouseOver={e=>e.currentTarget.style.background=T.hoverBg} onMouseOut={e=>e.currentTarget.style.background="none"}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* New Plan Button */}
        <div style={{ padding:"10px 10px 6px" }}>
          <button
            onClick={() => navigate("/home")}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"8px 10px", borderRadius:"8px", border:`1px solid ${T.sidebarBorder}`, background:"none", color:T.headText, cursor:"pointer", fontSize:"13px", fontWeight:500, transition:"all 0.15s" }}
            onMouseOver={e=>e.currentTarget.style.background=T.hoverBg} onMouseOut={e=>e.currentTarget.style.background="none"}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
            New Plan
          </button>
        </div>

        {/* Nav Items */}
        <div style={{ flex:1, overflowY:"auto", padding:"8px 10px" }}>
          <p style={{ color:T.mutedText, fontSize:"10px", fontWeight:700, letterSpacing:"0.6px", textTransform:"uppercase", padding:"0 4px 8px", margin:0 }}>Sections</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
            {navItems.map(item => {
              const active = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { setActiveSection(item.key); setActiveQ(null); }}
                  style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px", padding:"8px 10px", borderRadius:"8px", border:`1px solid ${active ? T.primaryBorder : "transparent"}`,
                  background: active ? T.primarySoft : "none",
                  color: active ? T.primary : T.bodyText, cursor:"pointer", fontSize:"13px", fontWeight: active ? 600 : 400, transition:"all 0.15s", textAlign:"left" }}
                  onMouseOver={e=>{ if(!active) e.currentTarget.style.background=T.hoverBg; }}
                  onMouseOut={e=>{ if(!active) e.currentTarget.style.background="none"; }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <span style={{ color: active ? T.primary : T.mutedText }}>{item.icon}</span>
                    {item.label}
                  </div>
                  <span style={{ fontSize:"10px", fontWeight:700, padding:"2px 6px", borderRadius:"5px", background: active ? T.primaryBorder : T.cardBg,
                  color: active ? T.primary : T.mutedText }}>{item.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Download PDF + Theme toggle */}
        <div style={{ padding:"10px 10px 14px", borderTop:`1px solid ${T.sidebarBorder}`, display:"flex", flexDirection:"column", gap:"6px" }}>
          {/* 3. Button Click par handleDownloadPDF call kiya */}
          <button
            onClick={handleDownloadPDF} 
            style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"9px 10px", borderRadius:"8px", border:"none", background:T.primary, color:"#fff", cursor:"pointer", fontSize:"13px", fontWeight:600, transition:"opacity 0.15s" }}
            onMouseOver={e=>e.currentTarget.style.opacity="0.85"} onMouseOut={e=>e.currentTarget.style.opacity="1"}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            Download Report PDF
          </button>
          <button
            onClick={() => setIsDark(p => !p)}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"8px 10px", borderRadius:"8px", border:"none", background:"none", color:T.bodyText, cursor:"pointer", fontSize:"13px" }}
            onMouseOver={e=>e.currentTarget.style.background=T.hoverBg} onMouseOut={e=>e.currentTarget.style.background="none"}
          >
            {dk ? (
              <><svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" stroke={T.mutedText} strokeWidth="2"/><line x1="12" y1="2" x2="12" y2="4" stroke={T.mutedText} strokeWidth="2" strokeLinecap="round"/><line x1="12" y1="20" x2="12" y2="22" stroke={T.mutedText} strokeWidth="2" strokeLinecap="round"/><line x1="2" y1="12" x2="4" y2="12" stroke={T.mutedText} strokeWidth="2" strokeLinecap="round"/><line x1="20" y1="12" x2="22" y2="12" stroke={T.mutedText} strokeWidth="2" strokeLinecap="round"/></svg><span>Light mode</span></>
            ) : (
              <><svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={T.mutedText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg><span>Dark mode</span></>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main Column ──────────────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

        {/* Topbar */}
        <header style={{ display:"flex", alignItems:"center", padding:"12px 20px", borderBottom:`1px solid ${T.topbarBorder}`, background:T.topbarBg, gap:"12px", position:"sticky", top:0, zIndex:50, transition: "background 0.2s ease, border-color 0.2s ease" }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", borderRadius:"6px", color:T.mutedText }}
              onMouseOver={e=>e.currentTarget.style.background=T.hoverBg} onMouseOut={e=>e.currentTarget.style.background="none"}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/></svg>
            </button>
          )}
          {!sidebarOpen && (
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <div style={{ width:"26px", height:"26px", borderRadius:"6px", background:T.accent, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span style={{ fontSize:"14px", fontWeight:600, color:T.headText }}>Job Pilot</span>
            </div>
          )}

          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ margin:0, fontSize:"14px", fontWeight:600, color:T.headText, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{report.title}</p>
            <p style={{ margin:0, fontSize:"11px", color:T.mutedText }}>Interview Report</p>
          </div>

          {/* Match Score */}
          <div style={{ display:"flex", alignItems:"center", gap:"8px", background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:"10px", padding:"6px 14px", flexShrink:0 }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end" }}>
              <span style={{ fontSize:"10px", color:T.mutedText, letterSpacing:"0.4px" }}>MATCH SCORE</span>
              <span style={{ fontSize:"20px", fontWeight:700, color:scoreColor, lineHeight:1.1 }}>{report.matchScore}<span style={{ fontSize:"12px", color:T.mutedText, fontWeight:400 }}>/100</span></span>
            </div>
            <svg width="28" height="28" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke={T.divider} strokeWidth="3"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke={scoreColor} strokeWidth="3"
                strokeDasharray={`${(report.matchScore/100)*88} 88`}
                strokeDashoffset="22" strokeLinecap="round" transform="rotate(-90 18 18)"
              />
            </svg>
          </div>

          <span style={{ color:T.mutedText, fontSize:"12px", flexShrink:0 }}>AI Interview Prep</span>
        </header>

        {/* Body — center + right */}
        <div style={{ flex:1, display:"flex", overflow:"hidden", height:"calc(100vh - 61px)" }}>

          {/* Center — Questions / Roadmap */}
          <div style={{ flex:1, overflowY:"auto", padding:"24px 24px 60px" }}>
            {renderMain()}
          </div>

          {/* Right Sidebar — Skill Gaps + Overview */}
          <aside style={{ width:"220px", flexShrink:0, borderLeft:`1px solid ${T.sidebarBorder}`, background:T.sidebarBg, overflowY:"auto", padding:"20px 14px", transition: "all 0.2s ease" }}>

            {/* Skill Gaps */}
            <p style={{ margin:"0 0 12px", fontSize:"10px", fontWeight:700, letterSpacing:"0.6px", textTransform:"uppercase", color:T.mutedText }}>Skill Gaps</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"6px", marginBottom:"24px" }}>
              {report.skillGaps?.map((gap, i) => (
                <div key={i} style={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:"8px", padding:"8px 10px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 500, color: T.bodyText, flex: 1, lineHeight: 1.5, wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal" }}>
                    {gap.skill}
                  </span>
                  <SeverityBadge severity={gap.severity} />
                </div>
              ))}
            </div>

            {/* Overview */}
            <p style={{ margin:"0 0 12px", fontSize:"10px", fontWeight:700, letterSpacing:"0.6px", textTransform:"uppercase", color:T.mutedText }}>Overview</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
              {[
                { label:"Technical Qs",  val:report.technicalQuestions?.length,  color:T.primary   },
                { label:"Behavioral Qs", val:report.behavioralQuestions?.length, color:T.secondary },
                { label:"Skill Gaps",    val:report.skillGaps?.length,           color:"#eab308"   },
                { label:"Plan Days",     val:report.preprationPlans?.length,     color:T.primary   }, 
              ].map((item, i) => (
                <div key={i} style={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:"8px", padding:"8px 10px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                    <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:item.color, flexShrink:0 }}/>
                    <span style={{ fontSize:"12px", color:T.mutedText }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize:"14px", fontWeight:700, color:T.headText }}>{item.val}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default InterviewReport;