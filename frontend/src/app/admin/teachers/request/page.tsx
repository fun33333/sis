"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

type Request = {
  to: string;
  subject: string;
  type: string;
  content: string;
  date: string;
};

export default function TeacherRequestPage() {
  const currentUser = { name: "Ali Raza", id: "12345" };
  const [showModal, setShowModal] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [form, setForm] = useState({
    to: "",
    subject: "",
    type: "",
    content: "",
  });
  const [detailsIdx, setDetailsIdx] = useState<number | null>(null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8fbfd] py-8 px-2">
      <div
        className="w-full max-w-5xl rounded-2xl shadow-lg border border-[#e3eaf2] bg-white p-8 relative"
        style={{ minHeight: 540 }}
      >
        {/* Add New Request Button */}
        <div className="absolute right-8 top-8">
          <Button
            className="bg-[#a3c8e6] text-[#222] font-bold px-6 py-2 rounded-lg shadow hover:bg-[#8bb8d6] transition-colors"
            onClick={() => setShowModal(true)}
          >
            Add New Request
          </Button>
        </div>
        <h1 className="text-3xl font-bold mb-8 text-center">
          Teachers Requests & Complaints
        </h1>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-[#e3eaf2] rounded-lg overflow-hidden">
            <thead className="bg-[#f3f6fa]">
              <tr>
                <th className="px-6 py-4 border-b border-[#e3eaf2] text-left font-semibold">
                  ID
                </th>
                <th className="px-6 py-4 border-b border-[#e3eaf2] text-left font-semibold">
                  TO
                </th>
                <th className="px-6 py-4 border-b border-[#e3eaf2] text-left font-semibold">
                  Complain Subject
                </th>
                <th className="px-6 py-4 border-b border-[#e3eaf2] text-left font-semibold">
                  Status
                </th>
                <th className="px-6 py-4 border-b border-[#e3eaf2] text-left font-semibold">
                  Date
                </th>
                <th className="px-6 py-4 border-b border-[#e3eaf2] text-left font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-8 border-b border-[#e3eaf2] text-center text-gray-400"
                    colSpan={6}
                  >
                    No requests or complaints found.
                  </td>
                </tr>
              ) : (
                requests.map((req, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 border-b border-[#e3eaf2]">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 border-b border-[#e3eaf2]">
                      {req.to}
                    </td>
                    <td className="px-6 py-4 border-b border-[#e3eaf2]">
                      {req.subject}
                    </td>
                    <td className="px-6 py-4 border-b border-[#e3eaf2]">
                      Pending
                    </td>
                    <td className="px-6 py-4 border-b border-[#e3eaf2]">
                      {req.date}
                    </td>
                    <td className="px-6 py-4 border-b border-[#e3eaf2]">
                      <button
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        onClick={() => setDetailsIdx(idx)}
                      >
                        <Eye size={18} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Request Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl px-12 py-6 w-full max-w-3xl border-2 border-[#a3c8e6] relative animate-fade-in">
              <button
                className="absolute top-3 right-3 text-[#a3c8e6] text-2xl font-bold hover:text-[#222]"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="flex justify-between items-center mb-6">
                <div className="text-xl font-bold bg-[#e3eaf2] px-6 py-2 rounded-lg">
                  Form
                </div>
                <div className="text-base font-semibold bg-[#e3eaf2] px-6 py-2 rounded-lg">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              <form
                className="grid grid-cols-2 gap-x-8 gap-y-4 items-start"
                onSubmit={(e) => {
                  e.preventDefault();
                  setRequests((prev) => [
                    ...prev,
                    {
                      to:
                        form.to === "head"
                          ? "Subject Head"
                          : form.to === "coordinator"
                          ? "Coordinator"
                          : "",
                      subject: form.subject,
                      type: form.type,
                      content: form.content,
                      date: new Date().toLocaleDateString(),
                    },
                  ]);
                  setShowModal(false);
                  setForm({ to: "", subject: "", type: "", content: "" });
                }}
              >
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">TO</label>
                  <select
                    className="w-full rounded-lg border border-[#a3c8e6] px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#a3c8e6]"
                    value={form.to}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, to: e.target.value }))
                    }
                  >
                    <option value="">
                      Select Subject Head/Coordinator
                    </option>
                    <option value="head">Subject Head</option>
                    <option value="coordinator">Coordinator</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">From</label>
                  <input
                    type="text"
                    value={`${currentUser.name} (ID: ${currentUser.id})`}
                    disabled
                    className="w-full rounded-lg border border-[#a3c8e6] px-4 py-2 bg-gray-100 text-gray-700 cursor-not-allowed font-semibold"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Subject"
                    value={form.subject}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, subject: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[#a3c8e6] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#a3c8e6]"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    className="w-full rounded-lg border border-[#a3c8e6] px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#a3c8e6]"
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    <option value="">Select Type</option>
                    <option value="complain">Complain</option>
                    <option value="request">Request</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Main Content
                  </label>
                  <textarea
                    placeholder="Enter details here..."
                    rows={3}
                    value={form.content}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, content: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[#a3c8e6] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#a3c8e6] resize-none"
                  />
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="submit"
                    className="mt-2 bg-[#a3c8e6] text-[#222] font-bold px-6 py-2 rounded-lg shadow hover:bg-[#8bb8d6] transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {detailsIdx !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl px-10 py-6 w-full max-w-2xl border-2 border-[#a3c8e6] relative animate-fade-in">
              <button
                className="absolute top-3 right-3 text-[#a3c8e6] text-2xl font-bold hover:text-[#222]"
                onClick={() => setDetailsIdx(null)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">Request Details</h2>
              <div className="space-y-3">
                <p><span className="font-semibold">To:</span> {requests[detailsIdx].to}</p>
                <p><span className="font-semibold">From:</span> {currentUser.name} (ID: {currentUser.id})</p>
                <p><span className="font-semibold">Subject:</span> {requests[detailsIdx].subject}</p>
                <p><span className="font-semibold">Type:</span> {requests[detailsIdx].type}</p>
                <p><span className="font-semibold">Content:</span> {requests[detailsIdx].content}</p>
                <p><span className="font-semibold">Date:</span> {requests[detailsIdx].date}</p>
                <p><span className="font-semibold">Status:</span> Pending</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
