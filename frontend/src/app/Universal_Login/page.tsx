"use client";

import { useState, useEffect } from "react";
// For navigation after login (if needed)
import { useRouter } from "next/navigation";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { loginWithEmailPassword } from "@/lib/api";


type Teacher = {
  id: string;
  name: string;
  username: string;
  password: string;
  class: string;
};

export default function LoginPage() {
  const [showForgot, setShowForgot] = useState(false);
  const [role, setRole] = useState<"coordinator" | "teacher" | "principal" | "superadmin">("teacher");
  const [animate, setAnimate] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // Store logged-in teacher info (for demo, can use context/global state)
  const [teacherInfo, setTeacherInfo] = useState<Teacher | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (role === "teacher") {
      try {
        const email = id.trim();
        const emailOk = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
        if (!emailOk) {
          setError("Please enter a valid email address");
          setLoading(false);
          return;
        }
        await loginWithEmailPassword(email, password);
        router.push("/admin");
      } catch (err: any) {
        setError(err?.response || err?.message || "Login failed");
      }
    } else if (role === "coordinator") {
      try {
        const email = id.trim();
        const emailOk = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
        if (!emailOk) {
          setError("Please enter a valid email address");
          setLoading(false);
          return;
        }
        await loginWithEmailPassword(email, password);
        router.push("/admin");
      } catch (err: any) {
        setError(err?.response || err?.message || "Login failed");
      }
    } else if (role === "principal" || role === "superadmin") {
      try {
        // Basic email format validation before API call
        const email = id.trim();
        const emailOk = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
        if (!emailOk) {
          setError("Please enter a valid email address");
          setLoading(false);
          return;
        }
        // Expect backend to use email as username for auth
        await loginWithEmailPassword(email, password);
        router.push("/admin");
      } catch (err: any) {
        setError(err?.response || err?.message || "Login failed");
      }
    } else {
      setError("Unsupported role");
    }
    setLoading(false);
  };

  // If already logged in, show info (for demo)
  if (teacherInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="bg-white border rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">Welcome, {teacherInfo.name}!</h2>
          <p className="mb-2">Role: Teacher</p>
          <p className="mb-2">Assigned Class: {teacherInfo.class}</p>
          <button className="mt-4 px-4 py-2 bg-[#a3cef1] rounded" onClick={() => { setTeacherInfo(null); window.localStorage.removeItem("sis_user"); }}>Logout</button>
        </div>
      </div>
    );
  }

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

          <form onSubmit={handleLogin}>
            {!showForgot ? (
              <>
                {/* Role Selection Dropdown */}
                <div className="w-full mb-6">
                  <div className="relative">
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as any)}
                      className="w-full h-12 rounded-xl px-5 text-base text-[#274c77] font-semibold shadow focus:outline-none focus:ring-2 focus:ring-[#6096ba] border-2 border-[#a3cef1] appearance-none transition-all duration-200"
                      style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                    >
                      <option value="teacher">Teacher</option>
                      <option value="coordinator">Coordinator</option>
                      <option value="principal">Principal</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-[#274c77] text-lg">
                      ▼
                    </span>
                  </div>
                </div>

                {/* ID/Email Input */}
                <div className="w-full mb-2">
                  <label htmlFor="login-email" className="block mb-1 text-[#274c77] font-semibold">
                    {role === "principal" || role === "superadmin" || role === "teacher" || role === "coordinator" ? "Email" : "Coordinator ID"}
                  </label>
                </div>
                <div className="relative w-full h-14 mb-6">
                  <input
                    type={role === "principal" || role === "superadmin" || role === "teacher" || role === "coordinator" ? "email" : "text"}
                    id="login-email"
                    required
                    value={id}
                    onChange={e => setId(e.target.value)}
                    className="w-full h-full border-2 border-[#a3cef1] rounded-xl pl-14 pr-12 text-[#274c77] text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6096ba] shadow transition-all duration-200 placeholder:font-normal placeholder:text-[#6096ba]"
                    placeholder={
                      role === "teacher" || role === "principal" || role === "superadmin" || role === "coordinator"
                        ? "Email"
                        : role === "coordinator"
                        ? "Coordinator ID"
                        : "ID"
                    }
                  />
                  <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#6096ba] text-xl">
                    <FaEnvelope />
                  </span>
                </div>

                {/* Password Input */}
                <div className="relative w-full h-14 mb-6">
                  <input
                    type="password"
                    id="login-password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full h-full border-2 border-[#a3cef1] rounded-xl pl-14 pr-12 text-[#274c77] text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6096ba] shadow transition-all duration-200 placeholder:font-normal placeholder:text-[#6096ba]"
                    placeholder={
                      role === "teacher"
                        ? "Teacher Password"
                        : role === "coordinator"
                        ? "Coordinator Password"
                        : role === "principal"
                        ? "Principal Password"
                        : "Super Admin Password"
                    }
                  />
                  <span className="absolute left-5 top-1/2 transform -translate-y-1/2 text-[#6096ba] text-xl">
                    <FaLock />
                  </span>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full h-11 bg-[#a3cef1] border-none rounded-full shadow-sm cursor-pointer text-base text-black font-semibold mt-3 hover:bg-[#87b9e3] transition-colors"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
                {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

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