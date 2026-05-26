const { Groq } = require("groq-sdk"); // yeh grok ka official package hai jise ham grok-sdk jo ke LLM models ko run karne wali company hai, wahan se nikal rahe hain
const puppeteer = require("puppeteer");
const fs = require("fs"); // file system module - PDF file disk pe save karne ke liye
const path = require("path"); // path module - file ka sahi address banane ke liye

const groq = new Groq({ // yahan pr ham API keh denge taake groq ko prove kr sakain ke ham ki authorized user hain or API key ko env file main secretly store karenegee
    apiKey: process.env.GROK_GENAI_API_KEY // ✅ Fixed: GROK → GROQ (correct env variable name)
});

// Zod hataya - direct manual schema likha jo Groq strict mode support karta hai 
const actualSchema = { // Ek blueprint/template hai jo batata hai ke AI ka response kis format mein aana chahiye
    type: "object", // Yeh ek JSON object hoga
    additionalProperties: false, // AI sirf wahi fields return kare jo humne define ki hain, koi extra field nahi
    required: ["matchScore", "title", "technicalQuestions", "behavioralQuestions", "skillGaps", "preprationPlans"], // Yeh saari fields zaroor honi chahiye response mein

    properties: {  // Ab yahan pr schema ke andar ki properties ayengi
        matchScore: { //  0-100 ka number jo batata hai candidate job ke liye kitna suitable hai Jaise: 75 matlab candidate 75% match karta hai job se
            type: "number",
            description: "A score between 0 and 100 indicating how well the candidate matches the job"
        },
        title: { // Job ka naam, jaise "Frontend Developer" ya "Data Scientist"
            type: "string",
            description: "The title of the job for which the interview report is generated"
        },
        technicalQuestions: { // ab yahan pr ek list hogi means ke array jis main question, intention, or answer hoga
            type: "array",
            description: "Technical questions that can be asked in the interview",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["question", "intention", "answer"],
                properties: {
                    question: { type: "string", description: "The technical question to be asked" }, // Technical sawal (e.g., "React hooks kya hain?")
                    intention: { type: "string", description: "The intention of interviewer behind asking this question" }, // Interviewer is sawal se kya judge karna chahta hai
                    answer: { type: "string", description: "How to answer this question" } // Is sawal ka best jawab kaise dena hai
                }
            }
        },
        behavioralQuestions: {
            type: "array",
            description: "Behavioral questions that can be asked in the interview",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["question", "intention", "answer"],
                properties: {
                    question: { type: "string", description: "The behavioral question to be asked" },
                    intention: { type: "string", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "string", description: "How to answer this question" }
                }
            }
        },
        skillGaps: { // skill gap: Candidate mein kya kami hai job ke muqable mein | severity: Kami kitni serious hai
            type: "array",
            description: "List of skill gaps in the candidate's profile",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["skill", "severity"],
                properties: {
                    skill: { type: "string", description: "The skill which the candidate is lacking" },
                    severity: { type: "string", enum: ["low", "medium", "high"], description: "The severity of this skill gap" }
                    // low = Minor gap, jaldi seekh sakte ho
                    // medium = Thodi mehnat chahiye
                    // high = Badi kami, zyada kaam karna hoga
                }
            }
        },
        preprationPlans: { // Day-by-day preparation schedule
            // Day 1 → Focus: "JavaScript Basics" → Tasks: ["Array methods seekho", "Closures practice karo"]
            // Day 2 → Focus: "React" → Tasks: ["Hooks revise karo", "Project banao"]
            type: "array",
            description: "A day-wise preparation plan for the candidate",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["day", "focus", "tasks"],
                properties: {
                    day: { type: "number", description: "The day number starting from 1" },
                    focus: { type: "string", description: "The main focus of this day" },
                    tasks: {
                        type: "array",
                        description: "List of tasks to be done on this day",
                        items: { type: "string" }
                    }
                }
            }
        }
    }
};

// ✅ Resume HTML generate karne ke liye AI ka schema
const resumeHtmlSchema = {
    type: "object",
    additionalProperties: false,

    required: ["content"],

    properties: {
        content: {
            type: "string",
            description: "Resume body HTML content"
        }
    }
};

async function generateInterviewReport({ resume, jobDescription, selfDescription }) { // Yeh function asynchronous hai, matlab API call hone ka wait karega, or 3 inputs le raha hai 
    // destructuring se
    try {
        const response = await groq.chat.completions.create({ // groq.chat.completions.create() = Groq API ko call karo
            model: "meta-llama/llama-4-scout-17b-16e-instruct", // Llama 4 Scout use kar rahe hain (Meta ka AI model jo Groq pe run hota hai)
            messages: [ // messages = AI ko conversation history dete hain
                {
                    role: "system", // role: "system" = AI ko batao ke tum kaun ho aur kya karna hai, Yahan AI ko bola: "Tu expert HR interviewer hai, Roman Urdu mein report banao"
                    content: `You are a world-class HR Interviewer and Industry Expert with 20+ years of experience.

CRITICAL: Return ONLY valid JSON. No explanation. No extra text outside JSON.

!!MOST IMPORTANT RULE!! — LANGUAGE:
Every single string value in the entire JSON MUST be written in English.
Professional, clear, and concise English only.
Technical terms (React, SQL, API, ERP) should be used naturally inside sentences.

FULL EXAMPLE — follow this exact style:
{
  "title": "Senior Administrative Officer",
  "matchScore": 72,
  "technicalQuestions": [
    {
      "question": "How did you manage data entry and reporting in a Government ERP system?",
      "intention": "The interviewer wants to assess whether the candidate has hands-on ERP experience or only theoretical knowledge.",
      "answer": "STAR: Situation - our department relied on manual records which were causing frequent errors. Task - I was responsible for migrating everything to the ERP system. Action - I completed a 2-week training, built standardized templates, and onboarded the team. Result - reporting time reduced by 40% and errors were eliminated."
    }
  ],
  "behavioralQuestions": [
    {
      "question": "Describe a situation where you successfully handled a conflict within your team.",
      "intention": "The interviewer wants to evaluate the candidate's conflict resolution skills and ability to maintain team harmony.",
      "answer": "STAR: Situation - two team members had a dispute over task ownership. Task - I needed to act as a mediator. Action - I listened to both sides separately, clearly divided responsibilities, and set up weekly syncs. Result - the project was delivered on time and team collaboration improved significantly."
    }
  ],
  "skillGaps": [
    { "skill": "Advanced Excel and data visualization tools", "severity": "high" }
  ],
  "preprationPlans": [
    {
      "day": 1,
      "focus": "ERP Systems and Government Software",
      "tasks": [
        "Review the core modules of Government ERP systems",
        "Practice 3 mock scenarios involving data entry and reporting",
        "Document common ERP errors and their solutions"
      ]
    }
  ]
}

YOUR RULES:
- Read the resume and job description carefully and auto-detect the relevant field
- Every question must be directly tied to the candidate's SPECIFIC resume skills — no generic questions
- Consider 2024-2025 industry trends and standards
- TECHNICAL QUESTIONS: Exactly 5
- BEHAVIORAL QUESTIONS: Exactly 5 — covering distinct dimensions: teamwork, conflict, failure, success, and pressure. Each answer must contain a real, detailed STAR story — no vague or generic examples
- SKILL GAPS: Exactly 6 — must be field-specific and actionable
- PREPARATION PLAN: Exactly 7 days — focused on weak areas with measurable daily goals
- matchScore: Resume vs job description alignment score (0-100)
- Interview questions must be the most high-probability, industry-relevant questions possible — each one should have a near 100% chance of being asked in a real interview
- Preparation plan must be world-class: structured, progressive, and results-driven

Return ONLY the JSON. No extra text.`
                },
                {
                    role: "user", // role: "user" = User ki taraf se message, yeh woh content hai jo user dega taake user ki report generate ho sake in ko dekh kr
                    content: ` 
                    Job Description: ${jobDescription}
                    Candidate Resume: ${resume}
                    Candidate Self-Description: ${selfDescription}
                    `
                }
            ],
            response_format: { // AI se kaho ke exactly is format mein jawab do
                type: "json_schema",
                json_schema: {
                    name: "interviewReport",
                    strict: true, //  Koi bhi extra ya missing field allowed nahi
                    schema: actualSchema // ussi schema ka use karna hai jo upper banaya hai report create karwane ke liye
                }
            },
            // temperature = AI ki creativity level
            // 0 = Bilkul strict, same jawab bar bar
            // 1 = Bahut creative/random
            // 0.7 = Balanced - thoda creative, thoda consistent
            temperature: 0.7,
        });

        const reportData = JSON.parse(response.choices[0].message.content); // response.choices[0] = AI ka pehla (aur akela) response lo ---- .message.content = Us response ka text nikalo
        return reportData;

    } catch (error) {
        console.error("Groq API Error:", error.message);
        throw new Error("Failed to generate interview report");
    }
}

async function generateResumePdf({
    resume,
    jobDescription,
    selfDescription,
    outputPath
}) {

    const finalOutputPath =
        outputPath || path.join(process.cwd(), "resume.pdf");

    try {

        // ─────────────────────────────────────────────
        // STEP 1: AI SE SIRF CONTENT GENERATE KARO
        // ─────────────────────────────────────────────

        const response = await groq.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",

            messages: [
                {
                    role: "system",
                   content: `
You are an elite executive resume writer with 20+ years of experience crafting resumes for Fortune 500 executives, FAANG engineers, and C-suite professionals.

Your task is to generate ONLY the body content for a premium, ATS-optimized, one-page resume.

DO NOT generate:
- html, head, style, body tags
- markdown or code blocks
- explanations or commentary

ONLY output clean semantic HTML sections.

═══════════════════════════════════════
WRITING QUALITY RULES (NON-NEGOTIABLE):
═══════════════════════════════════════
- Wall Street + FAANG executive tone — every word must earn its place
- Start every bullet with a powerful action verb: Engineered, Architected, Spearheaded, Delivered, Optimized, Scaled, Drove
- Every bullet must contain a measurable RESULT — numbers, percentages, users, performance gains
- BANNED phrases: "Responsible for", "Helped with", "Worked on", "Assisted in"
- No passive voice, no filler words
- Every bullet: MAX 12 words — count and cut ruthlessly
- No bullet should wrap to a second line at 10px font size
- Think of every line as premium real estate — justify its existence or cut it

═══════════════════════════════════════
ATS OPTIMIZATION RULES:
═══════════════════════════════════════
- Extract exact keywords from the job description and place them naturally in bullets and summary
- No graphics, icons, images, or multi-column layouts
- Section headings must be plain text in semantic HTML tags
- Skills listed as plain comma-separated text only
- No special characters except standard punctuation ( . , | — )

═══════════════════════════════════════
ONE PAGE — HARD LIMIT:
═══════════════════════════════════════
- ALL content must fit one printed Letter page (8.5x11) at 10-11px font
- Summary: EXACTLY 3 lines
- Core Competencies: EXACTLY 12 skills, 3-column grid, no wrapping
- Experience: SKIP entirely if candidate has no real work experience — DO NOT fake it, DO NOT render empty heading
- Projects: EXACTLY 4 projects, EXACTLY 2 bullets each, MAX 12 words per bullet
- Education: EXACTLY 1 line — Degree | Institution | Year/Status
- Skills: MAX 5 lines total, categorized, no repetition of Core Competencies keywords
- Before returning: mentally simulate rendering at 10px — if it overflows one page, cut more

═══════════════════════════════════════
SECTION ORDER & INSTRUCTIONS:
═══════════════════════════════════════

1. HEADER
- Full name (large, bold)
- Job title (tailored to the role being applied for)
- Phone | Email | Location | GitHub (if available)

2. SUMMARY
- Line 1: Professional identity + core stack + years of experience
- Line 2: Strongest technical skill with proof or impact
- Line 3: Unique value for this specific role

3. CORE COMPETENCIES
- Exactly 12 role-specific ATS keywords
- Rendered as a 3-column flex or table grid
- Each skill in its own cell — no commas, no wrapping

4. EXPERIENCE
- ONLY include if candidate has real professional work experience
- If no work experience exists: SKIP THIS SECTION COMPLETELY — remove heading too
- If included: MAX 2 roles, EXACTLY 3 bullets each, metric in every bullet

5. PROJECTS
- EXACTLY 4 projects listed — do not skip, do not duplicate
- Each project: Project Name | Tech Stack (on same line)
- EXACTLY 2 bullets per project
- Bullet format: [Action Verb] + [what was built] + [result or scale]
- Include GitHub / Live link as plain text if available
- Projects must appear ONLY in this section — never repeated elsewhere

6. EDUCATION
- EXACTLY 1 line: Degree | Institution | Year or "In Progress"
- No extra lines, no GPA unless explicitly strong

7. SKILLS
- Must be last section, must stay on page 1
- Categorized format: Frontend: ... | Backend: ... | Database: ... | Tools: ... | Deployment: ...
- MAX 5 lines, no skill repeated from Core Competencies

═══════════════════════════════════════
JSON OUTPUT — CRITICAL:
═══════════════════════════════════════
- Return STRICTLY: { "content": "<div>...</div>" }
- Escape ALL double quotes inside HTML attributes with \\"
- No markdown, no code blocks, no text outside the JSON object
- All HTML tags must be properly closed
- No inline styles except minimal margin/padding where necessary

Return ONLY this — nothing else:
{ "content": "<div>...</div>" }
`
                },

                {
                    role: "user",
                    content: `
Job Description:
${jobDescription}

Existing Resume:
${resume}

Self Description:
${selfDescription}
`
                }
            ],

            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "resumeContent",
                    strict: true,
                    schema: resumeHtmlSchema
                }
            },
            temperature: 0.4,
            max_tokens: 5000
        });

        // ─────────────────────────────────────────────
        // STEP 2: JSON PARSE
        // ─────────────────────────────────────────────

        const raw = response.choices[0].message.content;

        const cleaned = raw
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let parsed;

        try {
            parsed = JSON.parse(cleaned);
        } catch (err) {
            console.error("RAW AI RESPONSE:");
            console.log(cleaned);

            throw new Error("Invalid AI JSON response");
        }

        const aiContent = parsed.content;

        if (!aiContent) {
            throw new Error("AI content missing");
        }

        // ─────────────────────────────────────────────
        // STEP 3: FIXED PREMIUM TEMPLATE
        // ─────────────────────────────────────────────

        const finalHtml = `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8" />

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<style>

html, body {
    width: 210mm;
    min-height: 297mm;
    margin: 0;
    padding: 0;
    background: #ffffff;
}

body {
    font-family: 'Inter', sans-serif;
    color: #0f172a;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    line-height: 1.45;
}

.page {
    width: 794px;
    min-height: 1123px;
    margin: auto;
    padding: 42px 52px;
    box-sizing: border-box;
    background: white;
}

/* HEADER */

.header {
    margin-bottom: 22px;
}

.name {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -1px;
    color: #0f172a;
    margin-bottom: 4px;
}

.job-title {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 10px;
}

.contact {
    font-size: 10.5px;
    color: #64748b;
    line-height: 1.7;
}

/* SECTION */

.section {
    margin-top: 18px;
}

.section-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    color: #0f172a;
    padding-bottom: 6px;
    margin-bottom: 10px;
    border-bottom: 1px solid #d1d5db;
}

/* SUMMARY */

.summary {
    font-size: 11px;
    color: #334155;
    line-height: 1.7;
}

/* EXPERIENCE */

.entry {
    margin-bottom: 14px;
}

.entry-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2px;
}

.entry-title {
    font-size: 11.5px;
    font-weight: 700;
    color: #111827;
}

.entry-date {
    font-size: 10px;
    color: #64748b;
    white-space: nowrap;
}

.entry-sub {
    font-size: 10.3px;
    color: #475569;
    margin-bottom: 6px;
}

/* LIST */

ul {
    margin: 4px 0 0 18px;
    padding: 0;
}

li {
    font-size: 10.2px;
    color: #334155;
    margin-bottom: 4px;
    line-height: 1.45;
}

/* SKILLS */

.skills-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.skill-category {
    font-size: 10.2px;
    line-height: 1.7;
    color: #334155;
}

.skill-category strong {
    display: block;
    margin-bottom: 3px;
    color: #111827;
}

/* UTILITIES */

a {
    text-decoration: none;
    color: inherit;
}

* {
    box-sizing: border-box;
}

table, tr, td, div, section {
    page-break-inside: avoid;
}

/* OVERFLOW CONTROL */

.page {
    overflow: hidden;
}

li {
    page-break-inside: avoid;
}

</style>

</head>

<body>

<div class="page">

${aiContent}

</div>

</body>
</html>
`;



        // ─────────────────────────────────────────────
        // STEP 4: PUPPETEER PDF
        // ─────────────────────────────────────────────

        const browser = await puppeteer.launch({
            headless: "new",
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox"
            ]
        });

        const page = await browser.newPage();

        await page.setViewport({
            width: 1400,
            height: 2000,
            deviceScaleFactor: 2
        });

        await page.setContent(finalHtml, {
            waitUntil: "networkidle0"
        });

        // FONT LOAD WAIT
        await page.evaluateHandle('document.fonts.ready');

        await new Promise(resolve => setTimeout(resolve, 1200));

        // PDF GENERATE
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
            margin: {
                top: "10mm",
                bottom: "10mm",
                left: "10mm",
                right: "10mm"
            }
        });

        await browser.close();

        // ─────────────────────────────────────────────
        // STEP 5: SAVE PDF
        // ─────────────────────────────────────────────

        fs.writeFileSync(finalOutputPath, pdfBuffer);

        console.log("✅ Premium Resume PDF Generated");

        return {
            filePath: finalOutputPath,
            pdfBuffer
        };

    } catch (error) {

        console.error("Resume PDF Error:", error);

        throw new Error(
            `Failed to generate resume PDF: ${error.message}`
        );
    }
}

module.exports = { generateInterviewReport, generateResumePdf }; // ✅ Dono functions export ho rahe hain