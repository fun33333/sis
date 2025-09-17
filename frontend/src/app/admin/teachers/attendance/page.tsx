"use client";
import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { mockStudents } from "@/data/mockData"

// For demo: filter first 10 students only
const students = mockStudents.slice(0, 10);

type AttendanceStatus = "present" | "absent" | "leave" | null;

export default function AttendancePage() {
	const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});

	const handleChange = (studentId: string, status: AttendanceStatus) => {
		setAttendance((prev) => ({ ...prev, [studentId]: prev[studentId] === status ? null : status }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: send attendance to backend
		alert("Attendance submitted!\n" + JSON.stringify(attendance, null, 2));
	};

	return (
		<div className="max-w-6xl mx-auto mt-12 p-10 bg-[#e7ecef] rounded-2xl shadow-2xl border-2 border-[#a3cef1]">
			<h1 className="text-3xl font-extrabold mb-8 text-[#274c77] tracking-wide">Mark Attendance</h1>
			<form onSubmit={handleSubmit}>
				<div className="overflow-x-auto">
					<Table className="w-full rounded-xl overflow-hidden shadow-lg bg-[#e7ecef]">
						<TableHeader>
							<TableRow>
								<TableHead className="bg-[#6096ba] text-[#e7ecef] px-6 py-3 border border-[#a3cef1] font-bold text-lg">Student Name</TableHead>
								<TableHead className="bg-[#6096ba] text-[#e7ecef] px-6 py-3 border border-[#a3cef1] font-bold text-lg text-center">Present</TableHead>
								<TableHead className="bg-[#6096ba] text-[#e7ecef] px-6 py-3 border border-[#a3cef1] font-bold text-lg text-center">Absent</TableHead>
								<TableHead className="bg-[#6096ba] text-[#e7ecef] px-6 py-3 border border-[#a3cef1] font-bold text-lg text-center">Leave</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{students.map((student) => (
								<TableRow key={student.studentId} className="hover:bg-[#a3cef1]/30 transition">
									<TableCell className="border border-[#a3cef1] px-6 py-3 text-[#274c77] text-base font-medium">{student.name}</TableCell>
									<TableCell className="border border-[#a3cef1] px-6 py-3 text-center">
										<div className={attendance[student.studentId] === "present"
											? "inline-flex items-center justify-center rounded-full ring-2 ring-[#6096ba] bg-[#a3cef1]/60 p-1 shadow-md border-2 border-[#6096ba]"
											: "inline-flex items-center justify-center rounded-full border-2 border-[#8b8c89] bg-white p-1 shadow-sm"}>
											<Checkbox
												checked={attendance[student.studentId] === "present"}
												onCheckedChange={() => handleChange(student.studentId, "present")}
												aria-label="Present"
												className="w-6 h-6 min-w-6 min-h-6"
											/>
										</div>
									</TableCell>
									<TableCell className="border border-[#a3cef1] px-6 py-3 text-center">
										<div className={attendance[student.studentId] === "absent"
											? "inline-flex items-center justify-center rounded-full ring-2 ring-[#6096ba] bg-[#a3cef1]/60 p-1 shadow-md border-2 border-[#6096ba]"
											: "inline-flex items-center justify-center rounded-full border-2 border-[#8b8c89] bg-white p-1 shadow-sm"}>
											<Checkbox
												checked={attendance[student.studentId] === "absent"}
												onCheckedChange={() => handleChange(student.studentId, "absent")}
												aria-label="Absent"
												className="w-6 h-6 min-w-6 min-h-6"
											/>
										</div>
									</TableCell>
									<TableCell className="border border-[#a3cef1] px-6 py-3 text-center">
										<div className={attendance[student.studentId] === "leave"
											? "inline-flex items-center justify-center rounded-full ring-2 ring-[#6096ba] bg-[#a3cef1]/60 p-1 shadow-md border-2 border-[#6096ba]"
											: "inline-flex items-center justify-center rounded-full border-2 border-[#8b8c89] bg-white p-1 shadow-sm"}>
											<Checkbox
												checked={attendance[student.studentId] === "leave"}
												onCheckedChange={() => handleChange(student.studentId, "leave")}
												aria-label="Leave"
												className="w-6 h-6 min-w-6 min-h-6"
											/>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
				<div className="mt-8 flex justify-end">
					<Button type="submit" className="bg-[#6096ba] hover:bg-[#274c77] text-[#e7ecef] font-bold px-8 py-3 rounded-lg shadow-md transition">Submit Attendance</Button>
				</div>
			</form>
		</div>
	);
}
