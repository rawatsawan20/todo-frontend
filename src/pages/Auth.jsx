import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../components/Loader";
import {
  registerUserAPI,
  loginUserAPI,
  googleLoginRedirect,
} from "../utils/api";

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("register"); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const data = await registerUserAPI(email, password);
      toast.success(data.message || "Registered successfully!");
      setMode("login");
      setEmail("");
      setPassword("");
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginUserAPI(email, password);
      localStorage.setItem("token", data.token);
      toast.success("Login successful");
      navigate("/todos");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    googleLoginRedirect();
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-[#6EE7B7] via-[#3B82F6] to-[#9333EA] flex items-center justify-center p-6">
    {loading && <Loader />}
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8 animate-fadeIn">
      <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
        {mode === "register" ? "Create an Account" : "Welcome Back"}
      </h2>

      <form
        onSubmit={mode === "register" ? handleRegister : handleLogin}
        className="space-y-4"
      >
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
        >
          {mode === "register" ? "Register" : "Login"}
        </button>
      </form>

      <div className="flex items-center my-6">
        <hr className="flex-grow border-gray-300" />
        <span className="px-3 text-gray-500">OR</span>
        <hr className="flex-grow border-gray-300" />
      </div>

      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          className="w-5 h-5"
        />
        Sign in with Google
      </button>

      <p className="mt-6 text-center text-gray-500">
        {mode === "register" ? (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setMode("login")}
              className="text-blue-600 hover:underline"
            >
              Login
            </button>
          </>
        ) : (
          <>
            Don’t have an account?{" "}
            <button
              onClick={() => setMode("register")}
              className="text-blue-600 hover:underline"
            >
              Register
            </button>
          </>
        )}
      </p>
    </div>
  </div>
);
}
