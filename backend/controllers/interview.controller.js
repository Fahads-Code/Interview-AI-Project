const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse/lib/pdf-parse.js");
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service2");
const interviewReportModel = require("../models/interviewReport");

async function interviewReport(req, res) {
    try {
        const { jobDescription, selfDescription } = req.body;

        if (!req.file && !selfDescription) {
            return res.status(400).json({ message: "Resume ya self description required hai" });
        }

        const resumeContent = req.file ? await pdfParse(req.file.buffer) : null;

        const interviewReportByAI = await generateInterviewReport({
            resume: resumeContent?.text || "",
            selfDescription,
            jobDescription
        });

        const report = await interviewReportModel.create({
            user: req.user._id || req.user.id,
            resume: resumeContent?.text || "",
            jobDescription,
            selfDescription,
            matchScore: interviewReportByAI.matchScore,
            title: interviewReportByAI.title,
            technicalQuestions: interviewReportByAI.technicalQuestions,
            behavioralQuestions: interviewReportByAI.behavioralQuestions,
            skillGaps: interviewReportByAI.skillGaps,
            preprationPlans: interviewReportByAI.preprationPlans,
        });

        return res.status(201).json({
            message: "Interview Report generated successfully",
            interviewReport: report
        });

    } catch (error) {
        console.error("Interview Report Error:", error.message);
        res.status(500).json({ message: "Failed to generate interview report" });
    }
}

async function getAllInterviewReports(req, res) {
    const interviewReports = await interviewReportModel
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps");

    res.status(200).json({
        message: "Interview reports fetched successfully",
        interviewReports
    });
}

async function getInterviewReport(req, res) {
    const { interviewId } = req.params;
    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id });

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found",
        });
    }

    res.status(200).json({
        message: "Interview report fetched successfully",
        interviewReport
    });
}

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;
        const interviewReport = await interviewReportModel.findById(interviewReportId);

        if (!interviewReport) {
            return res.status(404).json({ // 404 standard hai Not Found ke liye
                message: "Interview report not found",
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;
        
        // PDF Generate karne wale function ko call kiya
        const { pdfBuffer } = await generateResumePdf({ resume, jobDescription, selfDescription });

        // Response headers set kiye taake browser file ko sahi se download kare
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="resume_${interviewReportId}.pdf"`, // ✅ Fixed: Added .pdf extension
            "Content-Length": pdfBuffer.length
        });

        // Seedha buffer frontend ko bhej diya
        return res.send(pdfBuffer);

    } catch (error) {
        console.error("Controller Error in PDF Generation:", error);
        return res.status(500).json({
            message: "Internal Server Error while generating resume PDF",
            error: error.message
        });
    }
}

module.exports = { interviewReport, getInterviewReport, getAllInterviewReports ,generateResumePdfController};