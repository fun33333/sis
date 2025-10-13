"use client";

import { useState, useEffect } from "react";
// For navigation after login (if needed)
import { useRouter } from "next/navigation";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { 
  GraduationCap, 
  Users, 
  Crown, 
  Shield,
  User
} from "lucide-react";
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
  const [detectedRole, setDetectedRole] = useState<string>("");
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

  // Function to get role-specific icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Teacher': return <GraduationCap className="h-5 w-5" />;
      case 'Coordinator': return <Users className="h-5 w-5" />;
      case 'Principal': return <Crown className="h-5 w-5" />;
      case 'Super Admin': return <Shield className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  // Function to detect role from employee code
  const detectRoleFromCode = (code: string): string => {
    if (!code) return "";
    
    // Employee code patterns:
    // Teacher: C01-M-25-T-0000
    // Coordinator: C01-M-25-C-0000  
    // Principal: C01-M-25-P-0000
    // Superadmin: C01-M-25-S-0000
    
    const parts = code.split('-');
    if (parts.length >= 4) {
      const roleCode = parts[3].charAt(0).toUpperCase();
      switch (roleCode) {
        case 'T': return 'Teacher';
        case 'C': return 'Coordinator';
        case 'P': return 'Principal';
        case 'S': return 'Super Admin';
        default: return '';
      }
    }
    return '';
  };

  // Handle employee code input change
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim().toUpperCase();
    setId(value);
    const role = detectRoleFromCode(value);
    setDetectedRole(role);
  };

  // Login handler: all roles use backend email/password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const email = id.trim();
      
      // All roles now use employee code format
      const employeeCodeOk = /^[A-Z0-9-]+$/.test(email);
      if (!employeeCodeOk) {
        setError("Please enter a valid employee code (e.g., C01-M-25-T-0068)");
        setLoading(false);
        return;
      }
      
      const data = await loginWithEmailPassword(email, password);
      const userRole = String(data?.user?.role || "").toLowerCase();
      
      // Redirect based on role
      if (userRole.includes("coord")) {
        router.push("/admin/coordinator");
      } else if (userRole.includes("teach")) {
        router.push("/admin/students/student-list");
      } else if (userRole.includes("princ")) {
        router.push("/admin");
      } else {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err?.response || err?.message || "Login failed");
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
                {/* Role Detection Display */}
                {detectedRole && (
                  <div className="w-full mb-6">
                    <div className="w-full h-12 rounded-xl px-5 text-base text-[#274c77] font-semibold shadow border-2 border-[#6096ba] bg-[#a3cef1] flex items-center justify-center gap-2">
                      {getRoleIcon(detectedRole)}
                      <span>{detectedRole}</span>
                    </div>
                  </div>
                )}

                {/* ID/Employee Code Input */}
                <div className="w-full mb-2">
                  <label htmlFor="login-email" className="block mb-1 text-[#274c77] font-semibold">
                    Employee Code
                  </label>
                </div>
                <div className="relative w-full h-14 mb-6">
                  <input
                    type="text"
                    id="login-email"
                    required
                    value={id}
                    onChange={handleIdChange}
                    className="w-full h-full border-2 border-[#a3cef1] rounded-xl pl-14 pr-12 text-[#274c77] text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#6096ba] shadow transition-all duration-200 placeholder:font-normal placeholder:text-[#6096ba]"
                    placeholder="C01-M-25-T-0000"
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
                    placeholder="Password (12345)"
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
                  {loading ? "Logging in..." : detectedRole ? `Login as ${detectedRole}` : "Login"}
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