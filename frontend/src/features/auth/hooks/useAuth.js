import { useContext, useEffect } from "react";
import { DataContext } from "../services/auth.context";
import { login, register, logout, getMe } from "../services/auth.api"
import { useNavigate } from "react-router";


export const useAuth = () => {
    const context = useContext(DataContext); // yahan pr ham apna woh context banaya hua import kar ke use kr rahe hain 
    const navigate = useNavigate();
    const { user, setuser, loading, setloading } = context;

    const handleLogin = async ({ email, password }) => {
        setloading(true);

        try {
            const data = await login({ email, password });

            setuser(data.user);

            navigate("/home");
        }
        catch (err) {
            console.log(err);

            throw err; // 👈 yeh add karo
        }
        finally {
            setloading(false);
        }
    }

    const handleRegister = async ({ username, email, password }) => {
        setloading(true);

        try {
            const data = await register({ email, password, username });

            setuser(data.user);
        }
        catch (err) {
            console.log(err);

            throw err; // 👈 add karo
        }
        finally {
            setloading(false);
        }
    }

    const handleLogout = async () => {
        setloading(true);
        try {
            const data = await logout();
            setuser(null);
        }
        catch (err) {
            console.log(err)
        }
        finally {
            setloading(false);

        }
    }

    useEffect(() => {
        const getAndSetUser = async () => {
            try {
                const data = await getMe();
                setuser(data.user);
            }
            catch (err) {
                setuser(null);
                console.log(err);
            }
            finally {
                setloading(false);
            }
        }
        getAndSetUser();
    }, []);

    return { user, loading, handleLogin, handleRegister, handleLogout };
}