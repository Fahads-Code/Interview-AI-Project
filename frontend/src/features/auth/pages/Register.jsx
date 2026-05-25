import { useState } from "react";
import { useNavigate, Link } from "react-router"
import { useAuth } from "../hooks/useAuth";


const Register = () => {

  const navigate = useNavigate(); // useNavigate ek tool hai jo aapka React app code ko batata hai — "ab is route par chale jao" — bina user ke manually click kiye.
  // "Khud jaana" matlab user ne kuch action liya (click, submit, type) → uski wajah se condition poori hui → tab code ne navigate kiya.

  const [username, setusername] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [error, setError] = useState("");

  const { loading, handleRegister } = useAuth();
  const handleSubmit = async (details) => {
    details.preventDefault();
    setError("")
    try {
      await handleRegister({ username, email, password });
      navigate("/");
    }
    catch (err) {
      setError(
        err.response?.data?.message || "Registration failed"
      );
    }
  }

  return (
    <>
      <main className="w-full h-screen flex items-center justify-center bg-gray-950">
        <div className="bg-gray-900 p-10 rounded-2xl shadow-2xl w-full max-w-md">

          <h1 className="text-4xl font-bold text-blue-400 mb-8">Register Account</h1>

          {
            error && (
              <div className="bg-red-500/20 border mb-4 border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )
          }

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm font-medium">Username</label>
              <input
                type="text"
                name="username"
                onChange={(details) => { setusername(details.target.value) }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                placeholder="Enter your Username"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                onChange={(details) => { setemail(details.target.value) }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                placeholder="Enter your email"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm font-medium">Password</label>
              <input
                type="password"
                name="password"
                onChange={(details) => { setpassword(details.target.value) }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                placeholder="Enter your password"
              />
            </div>

            <input
              type="submit"
              value="Register"
              className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white font-semibold py-3 rounded-lg transition-all duration-200 mt-2"
            />

          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            If you have account?
            <span className="text-blue-400 cursor-pointer hover:underline ml-1"><Link to={"/"}>Login</Link></span>
          </p>

        </div>
      </main>
    </>
  )
}

export default Register
