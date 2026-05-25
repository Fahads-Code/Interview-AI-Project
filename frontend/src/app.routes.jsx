import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/protected";
import { logout } from "./features/auth/services/auth.api";
import Home from "./features/Interview/pages/Home";
import InterviewReport from "./features/Interview/pages/InterviewReport";
import { InterviewProvider } from "./features/Interview/interview.context";



export const router = createBrowserRouter([ // Iska kaam hai rules banana "Agar /login aaye toh Login dikhao" "Agar /register aaye toh Register dikhao" Bas rules banata hai — khud kuch nahi
                                            // karta
    {
        path: "/",
        element: <Login/>
    },
    {
        path: "/register",
        element: <Register/>
    },
    {
        path: "/home",
        // yahan pr ham ne apna jo protected component banaya tha jis ka kaam yeh tha ke yeh check karta hai ke user logged in hai yah phir nahi
        // usse yahan pr use kiya hai means ke "/home" route pr agar request jati hai toh pehle yeh component render hoga <Protected> wala or phir
        // agar conditions true hongi toh yeh component home dikha dega
        element: (
    <Protected>
      <InterviewProvider>
        <Home />
      </InterviewProvider>
    </Protected>
  )
    },
    {
       path: "/interview/:interviewId",
       element: <Protected>
        <InterviewProvider>
                   <InterviewReport/>
                </InterviewProvider>
       </Protected>
    }                                                
])