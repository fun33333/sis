"use client";

import { useState, useEffect } from "react";
import { FaLock, FaEnvelope } from "react-icons/fa";

export default function LoginPage() {
  const [showForgot, setShowForgot] = useState(false);
  const [role, setRole] = useState<"coordinator" | "teacher">("teacher");
  const [animate, setAnimate] = useState(false);

  // Trigger animation on page load
  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div
        className={`relative w-[800px] h-[500px] bg-transparent border-2 border-gray-200 rounded-xl shadow-md overflow-hidden`}
      >
        {/* Background Animations */}
        <span className="absolute top-[-4px] right-0 w-[850px] h-[600px] bg-gradient-to-br from-[#6096ba] to-[#a3cef1] transform rotate-[10deg] skew-y-[40deg] origin-bottom-right transition-all duration-700 ease-in-out"></span>
        <span className="absolute top-full left-[250px] w-[850px] h-[700px] bg-[#6096ba] transform rotate-0 skew-y-0 origin-bottom-left transition-all duration-700 ease-in-out delay-1000"></span>

        {/* Login Form (Left Side) */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center px-16 py-0 transition-all duration-1000 ${
            animate ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"
          }`}
        >
          <h2 className="text-3xl text-black text-center mb-8 transition-all duration-700">
            {showForgot ? "Reset Password" : "Login"}
          </h2>

          <form action="#">
            {!showForgot ? (
              <>
                {/* Role Selection Tabs */}
                <div className="w-full bg-[#e3edf3] rounded-lg inline-flex p-1 mb-4 transition-all duration-700">
                  <button
                    type="button"
                    onClick={() => setRole("coordinator")}
                    className={`px-6 py-2 rounded-lg text-sm mr-1 cursor-pointer transition-all ${
                      role === "coordinator"
                        ? "bg-white text-black font-bold shadow-sm"
                        : "bg-transparent text-gray-700 font-normal"
                    }`}
                  >
                    Coordinator
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("teacher")}
                    className={`px-6 py-2 rounded-lg text-sm cursor-pointer transition-all ${
                      role === "teacher"
                        ? "bg-white text-black font-bold shadow-sm"
                        : "bg-transparent text-gray-700 font-normal"
                    }`}
                  >
                    Teacher
                  </button>
                </div>

                {/* ID Input */}
                <div className="relative w-full h-12 my-6">
                  <input
                    type="text"
                    id="login-email"
                    required
                    className="w-full h-full bg-transparent border-2 border-gray-300 rounded-full pl-5 pr-12 text-black text-base focus:outline-none focus:border-gray-400 peer"
                    placeholder=" "
                  />
                  <label className="absolute left-5 top-1/2 -translate-y-1/2 text-black text-base pointer-events-none transition-all duration-200 bg-transparent px-1 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#6096ba] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#6096ba]">
                    {role === "teacher" ? "Teacher ID" : "Coordinator ID"}
                  </label>
                  <span className="absolute right-5 top-1/2 transform -translate-y-1/2">
                    <FaEnvelope className="text-lg text-black" />
                  </span>
                </div>

                {/* Password Input */}
                <div className="relative w-full h-12 my-6">
                  <input
                    type="password"
                    id="login-password"
                    required
                    className="w-full h-full bg-transparent border-2 border-gray-300 rounded-full pl-5 pr-12 text-black text-base focus:outline-none focus:border-gray-400 peer"
                    placeholder=" "
                  />
                  <label className="absolute left-5 top-1/2 -translate-y-1/2 text-black text-base pointer-events-none transition-all duration-200 bg-transparent px-1 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[#6096ba] peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-[#6096ba]">
                    {role === "teacher"
                      ? "Teacher Password"
                      : "Coordinator Password"}
                  </label>
                  <span className="absolute right-5 top-1/2 transform -translate-y-1/2">
                    <FaLock className="text-lg text-black" />
                  </span>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full h-11 bg-[#a3cef1] border-none rounded-full shadow-sm cursor-pointer text-base text-black font-semibold mt-3 hover:bg-[#87b9e3] transition-colors"
                >
                  Login
                </button>

                {/* Forgot Password Link */}
                <div className="text-sm text-center my-5">
                  <p className="text-black m-1">
                    <a
                      href="#"
                      className="text-[#6096ba] font-semibold no-underline hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowForgot(true);
                      }}
                    >
                      Forgot Password?
                    </a>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Forgot Password Email Input */}
                <div className="relative w-full h-12 my-6">
                  <input
                    type="email"
                    id="forgot-email"
                    required
                    className="w-full h-full bg-transparent border-2 border-gray-300 rounded-full pl-5 pr-12 text-black text-base focus:outline-none focus:border-gray-400"
                  />
                  <label className="absolute top-1/2 left-5 transform -translate-y-1/2 text-black text-base pointer-events-none transition-all">
                    Enter your Email
                  </label>
                  <span className="absolute right-5 top-1/2 transform -translate-y-1/2">
                    <FaEnvelope className="text-lg text-black" />
                  </span>
                </div>

                {/* Send Reset Link Button */}
                <button
                  type="submit"
                  className="w-full h-11 bg-[#a3cef1] border-none rounded-full shadow-sm cursor-pointer text-base text-black font-semibold mt-3 hover:bg-[#87b9e3] transition-colors"
                >
                  Send Reset Link
                </button>

                {/* Back to Login Link */}
                <div className="text-sm text-center my-5">
                  <p className="text-black m-1">
                    <a
                      href="#"
                      className="text-[#6096ba] font-semibold no-underline hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowForgot(false);
                      }}
                    >
                      Back to Login
                    </a>
                  </p>
                </div>
              </>
            )}
          </form>
        </div>

        <div
          className={`absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center items-end pr-12 pl-24 text-right z-10 transition-all duration-1000 ${
            animate ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <h2 className="text-3xl text-white uppercase font-extrabold mb-4 max-w-[370px] break-words">
            WELCOME BACK
          </h2>
          <p className="text-sm text-white leading-relaxed font-medium mt-2 max-w-[370px] break-words">
            Access your school portal <br />
            <span>to manage classes,</span> <br />
            in one place.
          </p>
        </div>
      </div>
    </div>
  );
}