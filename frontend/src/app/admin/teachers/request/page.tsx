
"use client";


import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdSubject, MdDescription } from "react-icons/md";

const requestTypes = [
  "Leave Request",
  "Resource Request",
  "Schedule Change",
  "Other",
];


export default function TeacherRequestPage() {
	const [form, setForm] = useState({
		subject: "",
		requestType: "",
		description: "",
	});
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		setError("");
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.subject || !form.requestType || !form.description) {
			setError("All fields are required.");
			return;
		}
		setSubmitted(true);
	};

		return (
			<div className="flex items-center justify-center min-h-screen bg-[#f8fbfd] py-8 px-2">
				<div className="w-full max-w-4xl rounded-2xl shadow-lg border border-[#e3eaf2] bg-white flex overflow-hidden" style={{ minHeight: 540 }}>
					{/* Left: Form */}
					<div className="flex-1 flex flex-col justify-center px-10 py-12 gap-6">
						<h1 className="text-3xl font-bold mb-2 text-center">Teachers Request Form</h1>
						{submitted ? (
							<div className="flex flex-col items-center justify-center gap-4 py-8">
								<div className="text-green-600 text-xl font-semibold">Request submitted successfully!</div>
								<Button variant="secondary" className="mt-2" onClick={() => setSubmitted(false)}>
									Submit Another Request
								</Button>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="flex flex-col gap-8">
								<div className="flex flex-col gap-1">
									<Label htmlFor="subject" className="text-base font-medium">Teacher Name</Label>
									<div className="relative">
										<Input
											type="text"
											id="subject"
											name="subject"
											value={form.subject}
											onChange={handleChange}
											placeholder="Enter Teacher's name"
											className="rounded-md bg-[#e3eaf2] pl-5 pr-12 py-3 text-lg border-none focus:ring-2 focus:ring-[#a3c8e6]"
											required
										/>
										<MdSubject className="absolute right-4 top-1/2 -translate-y-1/2 text-[#222] text-xl pointer-events-none" />
									</div>
								</div>
								<div className="flex flex-col gap-1">
									<Label htmlFor="subject" className="text-base font-medium">Subject</Label>
									<div className="relative">
										<Input
											type="text"
											id="subject"
											name="subject"
											value={form.subject}
											onChange={handleChange}
											placeholder="Enter Subject"
											className="rounded-md bg-[#e3eaf2] pl-5 pr-12 py-3 text-lg border-none focus:ring-2 focus:ring-[#a3c8e6]"
											required
										/>
										<MdSubject className="absolute right-4 top-1/2 -translate-y-1/2 text-[#222] text-xl pointer-events-none" />
									</div>
								</div>
								
								<div className="flex flex-col gap-1">
									<Label htmlFor="description" className="text-base font-medium">Description</Label>
									<div className="relative">
										<Textarea
											id="description"
											name="description"
											value={form.description}
											onChange={handleChange}
											placeholder="Describe your request"
											rows={3}
											className="rounded-2xl bg-[#e3eaf2] pl-5 pr-12 py-3 text-lg border-none focus:ring-2 focus:ring-[#a3c8e6] resize-none"
											required
										/>
										<MdDescription className="absolute right-4 top-1/2 -translate-y-1/2 text-[#222] text-xl pointer-events-none" />
									</div>
								</div>
								{error && <div className="text-destructive text-sm text-center font-medium animate-shake">{error}</div>}
								<Button
									type="submit"
									className="w-full rounded-md bg-[#a3c8e6] text-[#222] text-lg font-bold py-5 mt-2 shadow hover:bg-[#8bb8d6] transition-colors"
									variant="default"
								>
									Submit Request
								</Button>
							</form>
						)}
					</div>
					{/* Right: Welcome Section */}
					<div className="hidden md:flex flex-col items-center justify-center flex-1 bg-gradient-to-tr from-[#a3c8e6] to-[#7bb3df] relative p-0">
						<div className="absolute inset-0 clip-diagonal bg-gradient-to-tr from-[#a3c8e6] to-[#7bb3df]" style={{clipPath:'polygon(20% 0, 100% 0, 100% 100%, 0 100%)'}}></div>
						<div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-8">
							<h2 className="text-3xl font-extrabold text-white mb-2 text-center">WELCOME</h2>
							<p className="text-white text-lg text-center font-medium">Submit your request to school admin<br/>in one place.</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
