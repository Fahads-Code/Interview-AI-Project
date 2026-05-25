import { useState } from "react"
import { Link } from "react-router"
import { useAuth } from "../hooks/useAuth"

const Login = () => {

  const { loading, handleLogin } = useAuth();

  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [error, setError] = useState(""); // Error state

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(""); // Purana error remove

    try {
      await handleLogin({ email, password });
    } catch (err) {
      setError("Invalid email or password");
    }
  }

  return (
    <>
      <main className="w-full h-screen flex items-center justify-center bg-gray-950">
        <div className="bg-gray-900 p-10 rounded-2xl shadow-2xl w-full max-w-md">

          <h1 className="text-4xl font-bold text-blue-400 mb-8">
            Login Account
          </h1>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>

            {/* Error Message */}
            {
              error && (
                <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )
            }

            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                onChange={(details) => {
                  setemail(details.target.value);
                }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                placeholder="Enter your email"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-300 text-sm font-medium">
                Password
              </label>

              <input
                type="password"
                name="password"
                onChange={(details) => {
                  setpassword(details.target.value)
                }}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
                placeholder="Enter your password"
              />
            </div>

            <input
              type="submit"
              value={loading ? "Loading..." : "Login"}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white font-semibold py-3 rounded-lg transition-all duration-200 mt-2 disabled:opacity-50"
            />

          </form>

          <p className="text-gray-500 text-sm text-center mt-6">
            Don't have an account?
            <span className="text-blue-400 cursor-pointer hover:underline ml-1">
              <Link to={"/register"}>Register</Link>
            </span>
          </p>

        </div>
      </main>
    </>
  )
}

export default Login