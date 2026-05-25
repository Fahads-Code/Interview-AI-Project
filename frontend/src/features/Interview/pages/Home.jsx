import { useState, useRef, useEffect } from "react";
import { useInterview } from "../hooks/useInterview";
import { useNavigate } from "react-router";
import useTheme from "../hooks/useInterview";

const Home = () => {
  const { generateReport, reports, getReports } = useInterview();
  useEffect(() => { getReports(); }, []);

const [isDark, setIsDark] = useTheme();
  const [jobDescription, setJobDescription]   = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating]       = useState(false);
  const [selfDescription, setSelfDescription] = useState("");
  const [sidebarOpen, setSidebarOpen]         = useState(true);
  const fileInputRef = useRef(null);
  const [resumeFile, setResumeFile]   = useState(null);
  const [isDragging, setIsDragging]   = useState(false);
  const navigate = useNavigate();

  const dk = isDark;
  const T = {
    pageBg:       dk ? "#212121" : "#f9f9f9",
    sidebarBg:    dk ? "#171717" : "#f0f0f0",
    sidebarBorder:dk ? "#2a2a2a" : "#e0e0e0",
    cardBg:       dk ? "#2f2f2f" : "#ffffff",
    cardBorder:   dk ? "#3d3d3d" : "#e0e0e0",
    inputBg:      dk ? "#2f2f2f" : "#ffffff",
    inputBorder:  dk ? "#3d3d3d" : "#d4d4d4",
    headText:     dk ? "#ececec" : "#0d0d0d",
    bodyText:     dk ? "#c2c2c2" : "#343434",
    mutedText:    dk ? "#8e8ea0" : "#6e6e80",
    accent:       "#10a37f",
    accentHover:  "#0d8c6b",
    accentSoft:   dk ? "#10a37f18" : "#10a37f10",
    divider:      dk ? "#2f2f2f" : "#e5e5e5",
    topbarBg:     dk ? "#171717" : "#f0f0f0",
    topbarBorder: dk ? "#2a2a2a" : "#e0e0e0",
    hoverBg:      dk ? "#2a2a2a" : "#e8e8e8",
    activeItem:   dk ? "#2f2f2f" : "#ffffff",
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setResumeFile(file);
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setResumeFile(file);
  };
  const handleGenerateReport = async () => {

  setError("");

  // Job Description required
  if (!jobDescription.trim()) {
    setError("Job description is required");
    return;
  }

  // Resume ya self description me se ek required
  if (!resumeFile && !selfDescription.trim()) {
    setError("Please upload resume or describe yourself");
    return;
  }

  const rf = fileInputRef.current?.files[0];

  setIsGenerating(true);

  const data = await generateReport({
    jobDescription,
    selfDescription,
    resumeFile: rf
  });

  if (!data?._id) return;

  navigate(`/interview/${data._id}`);
};

  // Group reports by date
  const groupReports = (reports) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate()-1);
    const week = new Date(today); week.setDate(week.getDate()-7);
    const month = new Date(today); month.setDate(month.getDate()-30);
    const groups = { Today:[], Yesterday:[], "Previous 7 Days":[], "Previous 30 Days":[], Older:[] };
    reports.forEach(r => {
      const d = new Date(r.createdAt); d.setHours(0,0,0,0);
      if (d >= today) groups["Today"].push(r);
      else if (d >= yesterday) groups["Yesterday"].push(r);
      else if (d >= week) groups["Previous 7 Days"].push(r);
      else if (d >= month) groups["Previous 30 Days"].push(r);
      else groups["Older"].push(r);
    });
    return groups;
  };
  const grouped = groupReports(reports);

  // Loading
  if (isGenerating) return (
    <div style={{ minHeight:"100vh", background:T.pageBg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"20px", fontFamily:"ui-sans-serif,system-ui,-apple-system,sans-serif" }}>
      <div style={{ position:"relative", width:"44px", height:"44px" }}>
        <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:`3px solid ${T.divider}` }}/>
        <div className="animate-spin" style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid transparent", borderTopColor:T.accent }}/>
      </div>
      <div style={{ textAlign:"center" }}>
        <p style={{ color:T.headText, fontWeight:600, fontSize:"15px", margin:0 }}>Analyzing your profile...</p>
        <p style={{ color:T.mutedText, fontSize:"13px", marginTop:"4px", margin:"4px 0 0" }}>Building your personalized strategy</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:T.pageBg, display:"flex", fontFamily:"ui-sans-serif,system-ui,-apple-system,sans-serif", color:T.headText }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside style={{
        width: sidebarOpen ? "260px" : "0px",
        minWidth: sidebarOpen ? "260px" : "0px",
        background: T.sidebarBg,
        borderRight: `1px solid ${T.sidebarBorder}`,
        display: "flex", flexDirection: "column",
        transition: "width 0.2s ease, min-width 0.2s ease",
        overflow: "hidden",
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Sidebar Header */}
        <div style={{ padding:"16px 12px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${T.sidebarBorder}` }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"28px", height:"28px", borderRadius:"7px", background:T.accent, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{ fontSize:"14px", fontWeight:600, color:T.headText, whiteSpace:"nowrap" }}>Job Pilot</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", borderRadius:"6px", display:"flex", color:T.mutedText }}
            onMouseOver={e=>e.currentTarget.style.background=T.hoverBg} onMouseOut={e=>e.currentTarget.style.background="none"}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* New Plan Button */}
        <div style={{ padding:"10px 10px 6px" }}>
          <button
            onClick={() => { setJobDescription(""); setSelfDescription(""); setResumeFile(null); }}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"8px 10px", borderRadius:"8px", border:`1px solid ${T.sidebarBorder}`, background:"none", color:T.headText, cursor:"pointer", fontSize:"13px", fontWeight:500, transition:"background 0.15s" }}
            onMouseOver={e=>e.currentTarget.style.background=T.hoverBg} onMouseOut={e=>e.currentTarget.style.background="none"}
          >
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
            </svg>
            New Plan
          </button>
        </div>

        {/* Reports List */}
        <div style={{ flex:1, overflowY:"auto", padding:"4px 8px 16px" }}>
          {reports.length === 0 ? (
            <div style={{ padding:"24px 12px", textAlign:"center" }}>
              <p style={{ color:T.mutedText, fontSize:"12px", lineHeight:1.6, margin:0 }}>No plans yet.<br/>Generate your first interview strategy!</p>
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) =>
              items.length > 0 && (
                <div key={group} style={{ marginTop:"16px" }}>
                  <p style={{ color:T.mutedText, fontSize:"11px", fontWeight:600, letterSpacing:"0.5px", textTransform:"uppercase", padding:"0 8px 6px", margin:0 }}>{group}</p>
                  {items.map(report => (
                    <div
                      key={report._id}
                      onClick={() => navigate(`/interview/${report._id}`)}
                      style={{ padding:"8px 10px", borderRadius:"8px", cursor:"pointer", transition:"background 0.1s", marginBottom:"1px" }}
                      onMouseOver={e=>e.currentTarget.style.background=T.hoverBg}
                      onMouseOut={e=>e.currentTarget.style.background="none"}
                    >
                      <p style={{ color:T.bodyText, fontSize:"13px", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", fontWeight:400 }}>
                        {report.title || "Untitled Position"}
                      </p>
                    </div>
                  ))}
                </div>
              )
            )
          )}
        </div>

        {/* Sidebar Footer — Theme Toggle */}
        <div style={{ padding:"10px 10px 14px", borderTop:`1px solid ${T.sidebarBorder}` }}>
          <button
            onClick={() => setIsDark(p => !p)}
            style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"8px 10px", borderRadius:"8px", border:"none", background:"none", color:T.bodyText, cursor:"pointer", fontSize:"13px", transition:"background 0.15s" }}
            onMouseOver={e=>e.currentTarget.style.background=T.hoverBg} onMouseOut={e=>e.currentTarget.style.background="none"}
          >
            {dk ? (
              <>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" stroke={T.mutedText} strokeWidth="2" fill="none"/>
                  <line x1="12" y1="2"  x2="12" y2="4"  stroke={T.mutedText} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="20" x2="12" y2="22" stroke={T.mutedText} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="2"  y1="12" x2="4"  y2="12" stroke={T.mutedText} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="20" y1="12" x2="22" y2="12" stroke={T.mutedText} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"   stroke={T.mutedText} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={T.mutedText} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"  stroke={T.mutedText} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  stroke={T.mutedText} strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ color:T.bodyText }}>Light mode</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke={T.mutedText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ color:T.bodyText }}>Dark mode</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main Area ───────────────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

        {/* Topbar */}
        <header style={{ display:"flex", alignItems:"center", padding:"12px 20px", borderBottom:`1px solid ${T.topbarBorder}`, background:T.topbarBg, gap:"12px", position:"sticky", top:0, zIndex:50 }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:"6px", borderRadius:"6px", display:"flex", color:T.mutedText, flexShrink:0 }}
              onMouseOver={e=>e.currentTarget.style.background=T.hoverBg} onMouseOut={e=>e.currentTarget.style.background="none"}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          {!sidebarOpen && (
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <div style={{ width:"26px", height:"26px", borderRadius:"6px", background:T.accent, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontSize:"14px", fontWeight:600, color:T.headText }}>Job Pilot</span>
            </div>
          )}
          <div style={{ flex:1 }}/>
          <span style={{ color:T.mutedText, fontSize:"12px" }}>AI Interview Prep</span>
        </header>

        {/* Content */}
        <main style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px 60px", overflowY:"auto" }}>

          <h1 style={{ fontSize:"clamp(22px,3.5vw,36px)", fontWeight:700, color:T.headText, textAlign:"center", letterSpacing:"-0.5px", marginBottom:"8px", lineHeight:1.25 }}>
            Prepare smarter for your{" "}
            <span style={{ color:T.accent }}>next interview</span>
          </h1>
          <p style={{ fontSize:"14px", color:T.mutedText, textAlign:"center", maxWidth:"400px", lineHeight:1.7, marginBottom:"36px" }}>
            Paste a job description and share your background — we'll build a tailored strategy in seconds.
          </p>

          {/* Cards */}
          <div style={{ width:"100%", maxWidth:"860px", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"14px" }}>

            {/* Left */}
            <div style={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:"12px", padding:"20px", display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"13px", fontWeight:600, color:T.bodyText }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke={T.accent} strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <path d="M8 8h8M8 12h8M8 16h4" strokeLinecap="round"/>
                  </svg>
                  Job Description
                </div>
                <span style={{ fontSize:"10px", fontWeight:700, letterSpacing:"0.4px", padding:"2px 8px", borderRadius:"5px", background:T.accentSoft, color:T.accent, border:`1px solid ${T.accent}33` }}>
                  Required
                </span>
              </div>
              <textarea
                style={{ flex:1, minHeight:"260px", background:T.inputBg, color:T.bodyText, border:`1px solid ${jobDescription?T.accent:T.inputBorder}`, borderRadius:"8px", padding:"11px 13px", fontSize:"13px", resize:"none", outline:"none", lineHeight:1.65, fontFamily:"inherit", transition:"border-color 0.15s" }}
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                maxLength={5000}
                onFocus={e => e.target.style.borderColor=T.accent}
                onBlur={e => e.target.style.borderColor=jobDescription?T.accent:T.inputBorder}
              />
              <div style={{ textAlign:"right", color:T.mutedText, fontSize:"11px", marginTop:"6px" }}>{jobDescription.length} / 5000</div>
            </div>

            {/* Right */}
            <div style={{ background:T.cardBg, border:`1px solid ${T.cardBorder}`, borderRadius:"12px", padding:"20px", display:"flex", flexDirection:"column", gap:"14px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"13px", fontWeight:600, color:T.bodyText }}>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke={T.accent} strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round"/>
                </svg>
                Your Profile
              </div>

              <div>
                <div style={{ display:"flex", alignItems:"center", gap:"7px", marginBottom:"8px" }}>
                  <span style={{ fontSize:"12px", fontWeight:600, color:T.bodyText }}>Resume</span>
                  <span style={{ fontSize:"10px", fontWeight:600, padding:"2px 7px", borderRadius:"5px", background:T.accentSoft, color:T.accent, border:`1px solid ${T.accent}33` }}>Best results</span>
                </div>
                <div
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  style={{ border:`1.5px dashed ${isDragging?T.accent:T.inputBorder}`, borderRadius:"8px", padding:"24px 16px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", background:isDragging?T.accentSoft:"transparent", transition:"all 0.15s" }}
                  onMouseOver={e=>{e.currentTarget.style.borderColor=T.accent; e.currentTarget.style.background=T.accentSoft;}}
                  onMouseOut={e=>{if(!isDragging){e.currentTarget.style.borderColor=T.inputBorder; e.currentTarget.style.background="transparent";}}}
                >
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke={T.mutedText} strokeWidth="1.5" style={{ marginBottom:"7px" }}>
                    <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 20h16" strokeLinecap="round"/>
                  </svg>
                  {resumeFile ? (
                    <span style={{ color:T.accent, fontSize:"12px", fontWeight:500 }}>{resumeFile.name}</span>
                  ) : (
                    <>
                      <span style={{ color:T.bodyText, fontSize:"12px", fontWeight:500 }}>Click to upload or drag & drop</span>
                      <span style={{ color:T.mutedText, fontSize:"11px", marginTop:"3px" }}>PDF or DOCX · max 5MB</span>
                    </>
                  )}
                  <input ref={fileInputRef} type="file" accept=".pdf,.docx" style={{ display:"none" }} onChange={handleFileChange}/>
                </div>
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <div style={{ flex:1, height:"1px", background:T.divider }}/>
                <span style={{ color:T.mutedText, fontSize:"11px" }}>or</span>
                <div style={{ flex:1, height:"1px", background:T.divider }}/>
              </div>

              <div>
                <span style={{ fontSize:"12px", fontWeight:600, color:T.bodyText, display:"block", marginBottom:"8px" }}>Describe yourself</span>
                <textarea
                  style={{ width:"100%", background:T.inputBg, color:T.bodyText, border:`1px solid ${selfDescription?T.accent:T.inputBorder}`, borderRadius:"8px", padding:"11px 13px", fontSize:"13px", resize:"none", outline:"none", minHeight:"88px", lineHeight:1.65, fontFamily:"inherit", boxSizing:"border-box", transition:"border-color 0.15s" }}
                  placeholder="Your experience, skills, and background in a few sentences..."
                  value={selfDescription}
                  onChange={e => setSelfDescription(e.target.value)}
                  onFocus={e => e.target.style.borderColor=T.accent}
                  onBlur={e => e.target.style.borderColor=selfDescription?T.accent:T.inputBorder}
                />
              </div>

              <div style={{ background:T.accentSoft, border:`1px solid ${T.accent}22`, borderRadius:"8px", padding:"10px 13px", display:"flex", alignItems:"flex-start", gap:"8px" }}>
                <svg width="14" height="14" viewBox="0 0 20 20" style={{ marginTop:"1px", flexShrink:0 }}>
                  <circle cx="10" cy="10" r="9" stroke={T.accent} strokeWidth="2" fill="none"/>
                  <path d="M10 9v5M10 7h.01" stroke={T.accent} strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <p style={{ color:T.bodyText, fontSize:"12px", lineHeight:1.55, margin:0 }}>
                  A <strong>resume</strong> or <strong>description</strong> is required to generate your plan.
                </p>
              </div>
            </div>
          </div>

{
  error && (
    <div
      style={{
        width: "100%",
        maxWidth: "860px",
        background: "#ff000015",
        border: "1px solid #ff4d4f",
        color: "#ff4d4f",
        padding: "12px 14px",
        borderRadius: "8px",
        marginTop: "18px",
        fontSize: "13px",
        fontWeight: 500
      }}
    >
      {error}
    </div>
  )
}

          {/* Bottom Bar */}
          <div style={{ width:"100%", maxWidth:"860px", display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"18px" }}>
            <span style={{ color:T.mutedText, fontSize:"12px" }}>Powered by AI · ~30 seconds</span>
            <button
              onClick={handleGenerateReport}
              style={{ background:T.accent, color:"#fff", fontWeight:600, padding:"9px 20px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"13px", display:"flex", alignItems:"center", gap:"7px", transition:"background 0.15s", letterSpacing:"-0.1px" }}
              onMouseOver={e=>e.currentTarget.style.background=T.accentHover}
              onMouseOut={e=>e.currentTarget.style.background=T.accent}
            >
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"/>
              </svg>
              Generate Strategy
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;