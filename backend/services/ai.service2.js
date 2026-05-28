const { Groq } = require("groq-sdk");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs");
const path = require("path");

const groq = new Groq({
    apiKey: process.env.GROK_GENAI_API_KEY
});

const actualSchema = {
    type: "object",
    additionalProperties: false,
    required: ["matchScore", "title", "technicalQuestions", "behavioralQuestions", "skillGaps", "preprationPlans"],
    properties: {
        matchScore: {
            type: "number",
            description: "A score between 0 and 100 indicating how well the candidate matches the job"
        },
        title: {
            type: "string",
            description: "The title of the job for which the interview report is generated"
        },
        technicalQuestions: {
            type: "array",
            description: "Technical questions that can be asked in the interview",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["question", "intention", "answer"],
                properties: {
                    question: { type: "string", description: "The technical question to be asked" },
                    intention: { type: "string", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "string", description: "How to answer this question" }
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
        skillGaps: {
            type: "array",
            description: "List of skill gaps in the candidate's profile",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["skill", "severity"],
                properties: {
                    skill: { type: "string", description: "The skill which the candidate is lacking" },
                    severity: { type: "string", enum: ["low", "medium", "high"], description: "The severity of this skill gap" }
                }
            }
        },
        preprationPlans: {
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

const resumeSchema = {
    type: "object",
    additionalProperties: false,
    required: ["name", "title", "phone", "email", "location", "github", "summary", "competencies", "experience", "projects", "education", "skills"],
    properties: {
        name:         { type: "string" },
        title:        { type: "string" },
        phone:        { type: "string" },
        email:        { type: "string" },
        location:     { type: "string" },
        github:       { type: "string" },
        summary:      { type: "array", items: { type: "string" }, description: "Exactly 3 lines" },
        competencies: { type: "array", items: { type: "string" }, description: "Exactly 12 skills" },
        experience: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["role", "company", "dates", "bullets"],
                properties: {
                    role:    { type: "string" },
                    company: { type: "string" },
                    dates:   { type: "string" },
                    bullets: { type: "array", items: { type: "string" } }
                }
            }
        },
        projects: {
            type: "array",
            items: {
                type: "object",
                additionalProperties: false,
                required: ["name", "stack", "link", "bullets"],
                properties: {
                    name:    { type: "string" },
                    stack:   { type: "string" },
                    link:    { type: "string" },
                    bullets: { type: "array", items: { type: "string" } }
                }
            }
        },
        education: { type: "string", description: "Single line: Degree | Institution | Year" },
        skills: {
            type: "object",
            additionalProperties: false,
            required: ["frontend", "backend", "database", "tools", "deployment"],
            properties: {
                frontend:   { type: "string" },
                backend:    { type: "string" },
                database:   { type: "string" },
                tools:      { type: "string" },
                deployment: { type: "string" }
            }
        }
    }
};

async function generateInterviewReport({ resume, jobDescription, selfDescription }) {
    try {
        const response = await groq.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "system",
                    content: `You are a world-class HR Interviewer and Industry Expert with 20+ years of experience.

CRITICAL: Return ONLY valid JSON. No explanation. No extra text outside JSON.

!!MOST IMPORTANT RULE!! — LANGUAGE:
Every single string value in the entire JSON MUST be written in English.
Professional, clear, and concise English only.
Technical terms (React, SQL, API, ERP) should be used naturally inside sentences.

YOUR RULES:
- Read the resume and job description carefully and auto-detect the relevant field
- Every question must be directly tied to the candidate's SPECIFIC resume skills — no generic questions
- Consider 2024-2025 industry trends and standards
- TECHNICAL QUESTIONS: Exactly 5
- BEHAVIORAL QUESTIONS: Exactly 5 — covering distinct dimensions: teamwork, conflict, failure, success, and pressure. Each answer must contain a real, detailed STAR story
- SKILL GAPS: Exactly 6 — must be field-specific and actionable
- PREPARATION PLAN: Exactly 7 days — focused on weak areas with measurable daily goals
- matchScore: Resume vs job description alignment score (0-100)

Return ONLY the JSON. No extra text.`
                },
                {
                    role: "user",
                    content: `Job Description: ${jobDescription}\nCandidate Resume: ${resume}\nCandidate Self-Description: ${selfDescription}`
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "interviewReport",
                    strict: true,
                    schema: actualSchema
                }
            },
            temperature: 0.7,
        });

        const reportData = JSON.parse(response.choices[0].message.content);
        return reportData;

    } catch (error) {
        console.error("Groq API Error:", error.message);
        throw new Error("Failed to generate interview report");
    }
}

// ─────────────────────────────────────────────────────────────
// PDF HELPER: Text ko wrap karke lines mein todna
// ─────────────────────────────────────────────────────────────
function wrapText(text, font, fontSize, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let current = "";

    for (const word of words) {
        const test = current ? current + " " + word : word;
        const width = font.widthOfTextAtSize(test, fontSize);
        if (width > maxWidth && current) {
            lines.push(current);
            current = word;
        } else {
            current = test;
        }
    }
    if (current) lines.push(current);
    return lines;
}

// ─────────────────────────────────────────────────────────────
// PDF HELPER: Text draw karo, y position return karo
// ─────────────────────────────────────────────────────────────
function drawText(page, text, x, y, font, size, color = rgb(0.06, 0.09, 0.16)) {
    page.drawText(text, { x, y, font, size, color });
    return y;
}

// ─────────────────────────────────────────────────────────────
// PDF HELPER: Section heading draw karo
// ─────────────────────────────────────────────────────────────
function drawSection(page, title, y, boldFont, pageWidth, margin) {
    y -= 14;
    page.drawText(title.toUpperCase(), {
        x: margin, y,
        font: boldFont, size: 8,
        color: rgb(0.06, 0.09, 0.16),
        characterSpacing: 1.5
    });
    y -= 5;
    page.drawLine({
        start: { x: margin, y },
        end:   { x: pageWidth - margin, y },
        thickness: 0.5,
        color: rgb(0.82, 0.84, 0.87)
    });
    y -= 8;
    return y;
}

async function generateResumePdf({ resume, jobDescription, selfDescription, outputPath }) {
    const finalOutputPath = outputPath || path.join(process.cwd(), "resume.pdf");

    try {
        // ─────────────────────────────────────────────
        // STEP 1: AI SE STRUCTURED JSON RESUME GENERATE KARO
        // ─────────────────────────────────────────────
        const response = await groq.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "system",
                    content: `You are an elite executive resume writer. Generate a structured JSON resume.

RULES:
- name: Full name from resume or infer from context
- title: Job title tailored to the role
- summary: EXACTLY 3 strings — professional identity, strongest skill with proof, unique value
- competencies: EXACTLY 12 ATS keywords as short strings
- experience: ONLY if real work experience exists, else empty array. MAX 2 roles, 3 bullets each
- projects: EXACTLY 4 projects, EXACTLY 2 bullets each. Bullet: Action Verb + what built + result
- education: Single string "Degree | Institution | Year"
- skills: categorized, no repetition from competencies
- All bullets MAX 12 words
- github/phone/location: extract from resume or use empty string ""
- Return ONLY valid JSON, no extra text`
                },
                {
                    role: "user",
                    content: `Job Description:\n${jobDescription}\n\nResume:\n${resume}\n\nSelf Description:\n${selfDescription}`
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "resumeData",
                    strict: true,
                    schema: resumeSchema
                }
            },
            temperature: 0.3,
            max_tokens: 3000
        });

        // ─────────────────────────────────────────────
        // STEP 2: JSON PARSE
        // ─────────────────────────────────────────────
        const raw = response.choices[0].message.content;
        let data;
        try {
            data = JSON.parse(raw);
        } catch (err) {
            console.error("AI JSON parse error:", raw);
            throw new Error("Invalid AI JSON response");
        }

        // ─────────────────────────────────────────────
        // STEP 3: PDF-LIB SE PROFESSIONAL PDF BANAO
        // ─────────────────────────────────────────────
        const pdfDoc = await PDFDocument.create();
        const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont    = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const pageWidth  = 595;  // A4
        const pageHeight = 842;
        const margin     = 40;
        const contentWidth = pageWidth - margin * 2;

        const pdfPage = pdfDoc.addPage([pageWidth, pageHeight]);
        let y = pageHeight - margin;

        const dark  = rgb(0.06, 0.09, 0.16);
        const gray  = rgb(0.28, 0.34, 0.42);
        const light = rgb(0.39, 0.45, 0.55);

        // ── HEADER ──
        pdfPage.drawText(data.name || "Your Name", {
            x: margin, y,
            font: boldFont, size: 22,
            color: dark
        });
        y -= 18;

        pdfPage.drawText(data.title || "", {
            x: margin, y,
            font: regularFont, size: 11,
            color: gray
        });
        y -= 14;

        const contact = [data.phone, data.email, data.location, data.github]
            .filter(Boolean).join("  |  ");
        pdfPage.drawText(contact, {
            x: margin, y,
            font: regularFont, size: 9,
            color: light
        });
        y -= 6;

        // ── SUMMARY ──
        y = drawSection(pdfPage, "Summary", y, boldFont, pageWidth, margin);
        for (const line of (data.summary || [])) {
            const wrapped = wrapText(line, regularFont, 9.5, contentWidth);
            for (const wl of wrapped) {
                pdfPage.drawText(wl, { x: margin, y, font: regularFont, size: 9.5, color: dark });
                y -= 13;
            }
        }

        // ── CORE COMPETENCIES ──
        y = drawSection(pdfPage, "Core Competencies", y, boldFont, pageWidth, margin);
        const colW = contentWidth / 3;
        const comps = data.competencies || [];
        for (let i = 0; i < comps.length; i += 3) {
            const row = comps.slice(i, i + 3);
            row.forEach((skill, idx) => {
                pdfPage.drawText("▪ " + skill, {
                    x: margin + idx * colW, y,
                    font: regularFont, size: 9,
                    color: dark
                });
            });
            y -= 13;
        }

        // ── EXPERIENCE ──
        if (data.experience && data.experience.length > 0) {
            y = drawSection(pdfPage, "Experience", y, boldFont, pageWidth, margin);
            for (const exp of data.experience) {
                pdfPage.drawText(exp.role || "", {
                    x: margin, y, font: boldFont, size: 10, color: dark
                });
                pdfPage.drawText(exp.dates || "", {
                    x: pageWidth - margin - 80, y, font: regularFont, size: 9, color: light
                });
                y -= 13;
                pdfPage.drawText(exp.company || "", {
                    x: margin, y, font: regularFont, size: 9, color: gray
                });
                y -= 12;
                for (const bullet of (exp.bullets || [])) {
                    const wrapped = wrapText("• " + bullet, regularFont, 9, contentWidth - 10);
                    for (const wl of wrapped) {
                        pdfPage.drawText(wl, { x: margin + 8, y, font: regularFont, size: 9, color: dark });
                        y -= 12;
                    }
                }
                y -= 4;
            }
        }

        // ── PROJECTS ──
        y = drawSection(pdfPage, "Projects", y, boldFont, pageWidth, margin);
        for (const proj of (data.projects || [])) {
            const projHeader = [proj.name, proj.stack, proj.link].filter(Boolean).join("  |  ");
            pdfPage.drawText(projHeader, {
                x: margin, y, font: boldFont, size: 9.5, color: dark
            });
            y -= 12;
            for (const bullet of (proj.bullets || [])) {
                const wrapped = wrapText("• " + bullet, regularFont, 9, contentWidth - 10);
                for (const wl of wrapped) {
                    pdfPage.drawText(wl, { x: margin + 8, y, font: regularFont, size: 9, color: dark });
                    y -= 12;
                }
            }
            y -= 4;
        }

        // ── EDUCATION ──
        y = drawSection(pdfPage, "Education", y, boldFont, pageWidth, margin);
        pdfPage.drawText(data.education || "", {
            x: margin, y, font: regularFont, size: 9.5, color: dark
        });
        y -= 16;

        // ── SKILLS ──
        y = drawSection(pdfPage, "Skills", y, boldFont, pageWidth, margin);
        const skillLines = [
            data.skills?.frontend   ? `Frontend:   ${data.skills.frontend}`   : null,
            data.skills?.backend    ? `Backend:    ${data.skills.backend}`    : null,
            data.skills?.database   ? `Database:   ${data.skills.database}`   : null,
            data.skills?.tools      ? `Tools:      ${data.skills.tools}`      : null,
            data.skills?.deployment ? `Deployment: ${data.skills.deployment}` : null,
        ].filter(Boolean);

        for (const line of skillLines) {
            const wrapped = wrapText(line, regularFont, 9, contentWidth);
            for (const wl of wrapped) {
                pdfPage.drawText(wl, { x: margin, y, font: regularFont, size: 9, color: dark });
                y -= 12;
            }
        }

        // ─────────────────────────────────────────────
        // STEP 4: BUFFER RETURN KARO
        // ─────────────────────────────────────────────
        const pdfBuffer = Buffer.from(await pdfDoc.save());

        // Disk pe save karne ki koshish (Vercel pe skip hoga)
        try {
            fs.writeFileSync(finalOutputPath, pdfBuffer);
            console.log("✅ Resume PDF saved to disk");
        } catch (fsErr) {
            console.log("⚠️ Disk write skipped (serverless environment)");
        }

        return { filePath: finalOutputPath, pdfBuffer };

    } catch (error) {
        console.error("Resume PDF Error:", error);
        throw new Error(`Failed to generate resume PDF: ${error.message}`);
    }
}

module.exports = { generateInterviewReport, generateResumePdf };