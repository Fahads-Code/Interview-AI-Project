import { RouterProvider } from "react-router" // BrowserRouter ne rules banaye — theek hai Par koi unhe follow bhi kare, RouterProvider woh cheez hai jo manager ko poori app pe laga deti hai
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./features/auth/services/auth.context.jsx"
import { InterviewProvider } from "./features/Interview/interview.context.jsx"
import { ThemeProvider } from "./features/theme/theme.context.jsx"




function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InterviewProvider>
           <RouterProvider router={router}/> { /* RouterProvider ko diya router — jo rules humne banaye, Ab router active ho gaya!, Poori app mein kaam karega*/ }
        </InterviewProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
