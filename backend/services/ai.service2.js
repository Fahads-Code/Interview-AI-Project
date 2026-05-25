const { Groq } = require("groq-sdk");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const groq = new Groq({
    apiKey: process.env.GROK_GENAI_API_KEY // ✅ Matches your env variable
});

// ─────────────────────────────────────────────────────────────────
// SCHEMAS (Strict JSON Templates)
// ─────────────────────────────────────────────────────────────────

const actualSchema = {
    type: "object",
    additionalProperties: false,
    required: ["matchScore", "title", "technicalQuestions", "behavioralQuestions", "skillGaps", "preprationPlans"],
    properties: {
        matchScore: { type: "number", description: "A score between 0 and 100 indicating how well the candidate matches the job" },
        title: { type: "string", description: "The title of the job for which the interview report is generated" },
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
                    tasks: { type: "array", items: { type: "string" } }
                }
            }
        }
    }
};

const resumeHtmlSchema = {
    type: "object",
    additionalProperties: false,
    required: ["content"],
    properties: {
        content: {
            type: "string",
            description: "Complete structured HTML layout containing premium resume sections."
        }
    }
};

// ─────────────────────────────────────────────────────────────────
// FUNCTION 1: GENERATE INTERVIEW REPORT
// ─────────────────────────────────────────────────────────────────

async function generateInterviewReport({ resume, jobDescription, selfDescription }) {
    try {
        const response = await groq.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "system",
                    content: `You are a world-class HR Interviewer and Industry Expert with 20+ years of experience.
                    
                    CRITICAL: Return ONLY valid JSON matching the schema provided. 
                    Every single string value in the entire JSON MUST be written in English.`
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
            temperature: 0.7
        });

        return JSON.parse(response.choices[0].message.content);
    } catch (error) {
        console.error("Groq API Error (Report):", error.message);
        throw new Error("Failed to generate interview report");
    }
}

// ─────────────────────────────────────────────────────────────────
// FUNCTION 2: GENERATE RESUME PDF
// ─────────────────────────────────────────────────────────────────

async function generateResumePdf({ resume, jobDescription, selfDescription, outputPath }) {
    const finalOutputPath = outputPath || path.join(process.cwd(), "resume.pdf");

    try {
        // STEP 1: AI Call with Pure JSON Schema Output
        const response = await groq.chat.completions.create({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages: [
                {
                    role: "system",
                    content: `You are an elite executive resume writer. Generate ONLY the internal body content for a premium, ATS-optimized, one-page resume inside the 'content' field of the schema.
                    
                    OUTPUT REQUIREMENT:
                    - Populate the 'content' key with semantic HTML tags (div, h1, h2, ul, li, span).
                    - Do NOT include html, head, style, or body tags inside the string.
                    - Do NOT include markdown blocks (\`\`\`json). Just return the raw JSON object.

                    WRITING QUALITY RULES:
                    - Start bullets with powerful action verbs (Engineered, Architected, Spearheaded).
                    - Every bullet must contain a measurable result. Max 12 words per bullet.
                    - Summary: EXACTLY 3 lines.
                    - Core Competencies: EXACTLY 12 skills.
                    - Projects: EXACTLY 4 projects with 2 bullets each.
                    - Education: EXACTLY 1 line.`
                },
                {
                    role: "user",
                    content: `Job Description: ${jobDescription}\nExisting Resume: ${resume}\nSelf Description: ${selfDescription}`
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

        // STEP 2: Safe JSON Parse (No manual replace hacks needed!)
        const parsed = JSON.parse(response.choices[0].message.content);
        const aiContent = parsed.content;

        if (!aiContent) {
            throw new Error("AI content missing from schema execution.");
        }

        // STEP 3: Fixed Premium HTML Shell Injection
        const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        html, body { width: 210mm; min-height: 297mm; margin: 0; padding: 0; background: #ffffff; }
        body { font-family: 'Inter', sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased; line-height: 1.45; }
        .page { width: 794px; min-height: 1123px; margin: auto; padding: 42px 52px; box-sizing: border-box; background: white; overflow: hidden; }
        .section { margin-top: 18px; }
        .section-title { font-size: 11px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: #0f172a; padding-bottom: 6px; margin-bottom: 10px; border-bottom: 1px solid #d1d5db; }
        ul { margin: 4px 0 0 18px; padding: 0; }
        li { font-size: 10.2px; color: #334155; margin-bottom: 4px; line-height: 1.45; page-break-inside: avoid; }
        .skills-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        a { text-decoration: none; color: inherit; }
        * { box-sizing: border-box; }
        table, tr, td, div, section { page-break-inside: avoid; }
    </style>
</head>
<body>
    <div class="page">
        ${aiContent}
    </div>
</body>
</html>`;

        // STEP 4: Puppeteer Execution
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1400, height: 2000, deviceScaleFactor: 2 });
        await page.setContent(finalHtml, { waitUntil: "networkidle0" });
        
        // Wait for Inter font asset to load fully
        await page.evaluateHandle('document.fonts.ready');
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced redundant delay to 500ms

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
            margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" }
        });

        await browser.close();

        // STEP 5: Save PDF File
        fs.writeFileSync(finalOutputPath, pdfBuffer);
        console.log("✅ Premium Resume PDF Generated at:", finalOutputPath);

        return { filePath: finalOutputPath, pdfBuffer };

    } catch (error) {
        console.error("Resume PDF Error:", error);
        throw new Error(`Failed to generate resume PDF: ${error.message}`);
    }
}

module.exports = { generateInterviewReport, generateResumePdf };