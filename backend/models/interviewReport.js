const mongoose = require("mongoose");

const technicalQuestionSchema = mongoose.Schema({
    question: {
        type: String,
        required: [true, "Question is required"],
    },
    intention: {
        type: String,
        required: [true, "intention is required"],
    },
    answer: {
        type: String,
        required: [true, "answer is required"],
    },
}, { _id: false })

const preprationPlanSchema = mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day is required"],
    },
    focus: {
        type: String,
        required: [true, "Focus is required"],
    },
    tasks: [{ type: String }]
})

const skillGapSchema = mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill is required"],
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"] // Enum ek dropdown list ki tarah hai — sirf wahi options select ho sakte hain jo aapne define kiye hain
                                        // Yeh useful hai jab aap chahte hain ke database mein consistent values jayein, koi bhi random string nahi.
    },
})

const behavioralQuestionSchema = mongoose.Schema({
    
    question: {
        type: String,
        required: [true, "Question is required"],
    },
    intention: {
        type: String,
        required: [true, "intention is required"],
    },
    answer: {
        type: String,
        required: [true, "answer is required"],
    },
}, { _id: false })

const interviewReportSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user", // Aapka user model ka naam
        required: true
    },
    title: {
        type: String,
    },
    jobDescription: {
        type: String,
        required: [true, "Job description is required"],
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100
    },
    technicalQuestions: [technicalQuestionSchema], // "yeh ek array hai jisme sirf technicalQuestions wali shape ke objects jayenge"
    preprationPlans: [preprationPlanSchema],
    skillGaps: [skillGapSchema],
    behavioralQuestions: [behavioralQuestionSchema],
}, {timestamps: true}); // yeh time khudi si manage karta hai ke kab create hua hai or kab update hua hau

module.exports = mongoose.model("interview", interviewReportSchema);