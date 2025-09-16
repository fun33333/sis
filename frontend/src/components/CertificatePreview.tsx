import React from "react";
import Image from "next/image";

interface CertificatePreviewProps {
  studentName: string;
  studentId: string;
  campus: string;
  grade: string;
  transferDate: string;
  newStudentId: string;
  course?: string;
  signatures?: Array<{ name: string; title: string }>;
}

export default function CertificatePreview({
  studentName,
  studentId,
  campus,
  grade,
  transferDate,
  newStudentId,
  course = "Student Transfer Module",
  signatures = [
    { name: "Daniel Gallego", title: "Chief Executive Officer" },
    { name: "Aaron Loeb", title: "Training Coordinator" },
  ],
}: CertificatePreviewProps) {
  return (
    <div
      className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl mx-auto border-4 border-[#274c77] relative"
      style={{
        background:
          "linear-gradient(135deg, #f8fafc 0%, #e7ecef 60%, #a3cef1 100%)",
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Image src="/vercel.svg" alt="Logo" width={40} height={40} />
          <span className="font-bold text-lg text-[#274c77]">SIS School</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#6096ba] font-bold text-lg">CERTIFICATE</span>
          <span className="inline-block h-8 w-8 bg-blue-400 rounded-full flex items-center justify-center text-white font-bold">TC</span>
        </div>
      </div>
      <h2 className="text-3xl font-bold text-[#274c77] mb-2 tracking-wide text-center">CERTIFICATE OF COMPLETION</h2>
      <h3 className="text-lg text-[#6096ba] font-semibold mb-2 text-center">OF STUDENT TRANSFER</h3>
      <p className="text-[#274c77] text-base mb-4 text-center">This certificate is proudly presented to</p>
      <h3 className="text-2xl font-bold text-[#274c77] mb-2 text-center">{studentName}</h3>
      <div className="w-full border-t border-gray-300 my-2"></div>
      <p className="text-[#274c77] text-base mb-2 text-center">Student ID: <span className="font-semibold">{studentId}</span></p>
      <p className="text-[#274c77] text-base mb-2 text-center">Campus: <span className="font-semibold">{campus}</span></p>
      <p className="text-[#274c77] text-base mb-2 text-center">Grade / Section: <span className="font-semibold">{grade}</span></p>
      <p className="text-[#274c77] text-base mb-2 text-center">Transfer Date: <span className="font-semibold">{transferDate}</span></p>
      <p className="text-[#274c77] text-base mb-2 text-center">New Student ID: <span className="font-semibold">{newStudentId}</span></p>
      <div className="w-full border-t border-gray-300 my-4"></div>
      <p className="text-[#274c77] text-base mb-4 text-center">
        for successfully completing the <span className="font-semibold">{course}</span> on <span className="font-semibold">{transferDate}</span>
      </p>
      <div className="flex justify-between mt-8 px-8">
        {signatures.map((sig, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <span className="font-signature text-2xl mb-2">Signature</span>
            <span className="font-bold text-[#274c77]">{sig.name}</span>
            <span className="text-xs text-gray-500">{sig.title}</span>
          </div>
        ))}
      </div>
      <div className="absolute top-6 right-6">
        <span className="inline-block h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#2563eb" /><path d="M10 20l6-8 6 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </span>
      </div>
    </div>
  );
}