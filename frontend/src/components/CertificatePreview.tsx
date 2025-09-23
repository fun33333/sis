
"use client";
import React, { useRef } from "react";
import Image from "next/image";
import html2pdf from "html2pdf.js";

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
  const certRef = useRef<HTMLDivElement>(null);

  // ✅ Download PDF
  const handleDownload = () => {
    if (certRef.current) {
      const opt = {
        margin: 0.5,
        filename: `${studentName}-certificate.pdf`,
        image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: 'portrait' as 'portrait' },
      };
      html2pdf().from(certRef.current).set(opt).save();
    }
  };

  // ✅ Print Certificate
  const handlePrint = () => {
    if (certRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(certRef.current.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Certificate Box */}
      <div
        ref={certRef}
        className="relative bg-white rounded-3xl shadow-2xl p-10 w-full max-w-3xl mx-auto border-[6px] border-[#274c77]"
        style={{
          background:
            "linear-gradient(135deg, #f9fafb 0%, #edf2f7 50%, #dbeafe 100%)",
        }}
      >
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Image src="/vercel.svg" alt="Watermark" width={300} height={300} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
            {/* <span className="font-bold text-xl text-[#274c77]">SIS School</span> */}
          </div>
          {/* <div className="text-right">
            <span className="text-[#274c77] font-extrabold text-xl tracking-wide">
              CERTIFICATE
            </span>
            <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mt-1">
              TC
            </div>
          </div> */}
        </div>

        {/* Title */}
        <h2 className="text-4xl font-extrabold text-[#274c77] mb-2 text-center tracking-wider">
          Certificate of Completion
        </h2>
        <h3 className="text-lg text-[#6096ba] font-semibold mb-4 text-center uppercase tracking-wide">
          Of Student Transfer
        </h3>

        {/* Body */}
        <p className="text-[#274c77] text-lg text-center mb-2">
          This certificate is proudly presented to
        </p>
        <h3 className="text-3xl font-bold text-[#274c77] text-center mb-4">
          {studentName}
        </h3>

        <div className="w-3/4 mx-auto border-t border-gray-300 my-4"></div>

        <div className="space-y-2 text-center text-[#274c77]">
          <p>
            Student ID: <span className="font-semibold">{studentId}</span>
          </p>
          <p>
            Campus: <span className="font-semibold">{campus}</span>
          </p>
          <p>
            Grade / Section: <span className="font-semibold">{grade}</span>
          </p>
          <p>
            Transfer Date: <span className="font-semibold">{transferDate}</span>
          </p>
          <p>
            New Student ID: {" "}
            <span className="font-semibold">{newStudentId}</span>
          </p>
        </div>

        <div className="w-3/4 mx-auto border-t border-gray-300 my-6"></div>

        <p className="text-[#274c77] text-base text-center">
          For successfully completing the{" "}
          <span className="font-semibold">{course}</span> on{" "}
          <span className="font-semibold">{transferDate}</span>.
        </p>

        {/* Signatures */}
        <div className="flex justify-between mt-10 px-10 relative z-10">
          {signatures.map((sig, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="font-signature text-3xl mb-2 text-[#2563eb]">
                ✍
              </span>
              <span className="font-bold text-[#274c77]">{sig.name}</span>
              <span className="text-xs text-gray-600">{sig.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleDownload}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition"
        >
          Download PDF
        </button>
        <button
          onClick={handlePrint}
          className="px-6 py-2 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition"
        >
          Print Certificate
        </button>
      </div>
    </div>
  );
}
