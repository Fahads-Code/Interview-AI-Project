import axios from "axios";

// Ab saari requests /api/auth par jayengi jo Vercel backend par bhej dega
export async function register({username, email, password}){
    const response = await axios.post("/api/auth/register", 
       { username, email, password },
       { withCredentials: true });
    return response.data;
}

export async function login({email, password}){
    const response = await axios.post("/api/auth/login", 
        { email, password },
        { withCredentials: true });
    return response.data;
}

export async function logout(){
    await axios.get("/api/auth/logout", { withCredentials: true });
}

export async function getMe(){
    const response = await axios.get("/api/auth/getMe", { withCredentials: true });
    return response.data;
}