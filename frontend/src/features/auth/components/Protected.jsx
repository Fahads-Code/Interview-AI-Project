import { Navigate } from "react-router"
import { useAuth } from "../hooks/useAuth"

const Protected = ({children}) => {
  const {loading, user} = useAuth();

  if(loading){
    return (
      <div className="min-h-screen bg-[#0f1117] flex flex-col items-center justify-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-[#23263a]"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#e91e8c] border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <div className="text-center">
          <p className="text-white font-semibold text-lg">Generating your report...</p>
          <p className="text-gray-500 text-sm mt-1">AI analysis in progress, please wait</p>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#e91e8c] animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-[#e91e8c] animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-[#e91e8c] animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </div>
    );
  }

  if(!user){
       return <Navigate to={"/"}/>
  }

  return children;
}

export default Protected