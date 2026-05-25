const express = require("express");
const interviewRouter = express.Router();
const authMiddleware = require("../middlewares/authMiddleware")
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/fileMiddleware");


interviewRouter.post("/", authMiddleware.getUserMiddleware, upload.single("resumeFile"), interviewController.interviewReport);
interviewRouter.get("/report/:interviewId", authMiddleware.getUserMiddleware, interviewController.getInterviewReport);
interviewRouter.get("/", authMiddleware.getUserMiddleware, interviewController.getAllInterviewReports);
interviewRouter.get("/resume/pdf/:interviewReportId", authMiddleware.getUserMiddleware, interviewController.generateResumePdfController);



module.exports = interviewRouter