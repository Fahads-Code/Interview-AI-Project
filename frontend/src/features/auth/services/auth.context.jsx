import { createContext , useState } from "react";

export const DataContext = createContext(); // yeh ek empty jagah create karta hai means ke space box jahan pr data store hota hai, or yeh global hota hai, taake sare components directly  
                                           // yahin se data le lain, alag alag props na pass karne padain
export const AuthProvider = ({ children }) =>{

   const [user, setuser] = useState(null);
   const [loading, setloading] = useState(true);

   return <DataContext.Provider value={{user, setuser, loading, setloading}}>
       {children}
   </DataContext.Provider>
}