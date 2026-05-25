import axios from "axios";

// Base URL ko badal kar sirf "/api" kar diya
const api = axios.create({
    baseURL: "/api",
    withCredentials: true
})

export async function generateInterviewReport({jobDescription, selfDescription, resumeFile}){
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription);
    formData.append("resumeFile", resumeFile);

    const response = await api.post("/interview", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })

    return response.data;
}

export async function getInterviewReportById(interviewId){
     const response = await api.get(`/interview/report/${interviewId}`);
     return response.data;
}

export async function getAllInterviewReports(){
   const response = await api.get("/interview/");
   return response.data;
}

export const generateResumePdf = async ({interviewReportId}) => {
   const response = await api.get(`/interview/resume/pdf/${interviewReportId}`, {
    responseType: "blob",
   })
   return response.data;
}