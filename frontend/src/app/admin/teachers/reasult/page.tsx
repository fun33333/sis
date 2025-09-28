"use client";
import React, { useState } from "react";

const initialResults = [
	{
		id: "S101",
		name: "Ali Raza",
		midTerm: 38,
		finalTerm: 45,
	},
	{
		id: "S102",
		name: "Sara Khan",
		midTerm: 41,
		finalTerm: 47,
	},
	{
		id: "S103",
		name: "Bilal Ahmed",
		midTerm: 35,
		finalTerm: 40,
	},
];

function getGrade(total: number) {
	if (total >= 80 && total <= 90) return "A+";
	if (total >= 70 && total <= 80) return "A";
	if (total >= 60 && total <= 70) return "B";
	if (total >= 50 && total <= 60) return "DC";
	return "F";
}

export default function ResultPage() {
		const [results, setResults] = useState(initialResults);
		const [editable, setEditable] = useState(false);

		const handleEditClick = () => setEditable(true);
		const handleSaveClick = () => setEditable(false);
		const handleChange = (idx: number, field: string, value: string) => {
			setResults((prev) =>
				prev.map((row, i) =>
					i === idx ? { ...row, [field]: field === "midTerm" || field === "finalTerm" ? Number(value) : value } : row
				)
			);
		};

	return (
			<div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg border-4 border-[#274c77]">
				<h2 className="text-2xl font-bold text-[#274c77] mb-6 text-center">Student Results</h2>
				<table className="w-full text-center border-collapse mb-4">
					<thead>
						<tr className="bg-[#a3cef1] text-[#274c77]">
							<th className="py-2 px-3 border">Student ID</th>
							<th className="py-2 px-3 border">Name</th>
							<th className="py-2 px-3 border">Mid Term</th>
							<th className="py-2 px-3 border">Final Term</th>
							<th className="py-2 px-3 border">Total</th>
							<th className="py-2 px-3 border">Grade</th>
						</tr>
					</thead>
					<tbody>
						{results.map((row, idx) => {
							const total = row.midTerm + row.finalTerm;
							const grade = getGrade(total);
							return (
								<tr key={row.id} className="hover:bg-[#e7ecef]">
									<td className="border py-2 px-3">
										{editable ? (
											<input
												type="text"
												value={row.id}
												className="w-20 px-2 py-1 border rounded"
												onChange={(e) => handleChange(idx, "id", e.target.value)}
											/>
										) : (
											row.id
										)}
									</td>
									<td className="border py-2 px-3">
										{editable ? (
											<input
												type="text"
												value={row.name}
												className="w-32 px-2 py-1 border rounded"
												onChange={(e) => handleChange(idx, "name", e.target.value)}
											/>
										) : (
											row.name
										)}
									</td>
									<td className="border py-2 px-3">
										{editable ? (
											<input
												type="number"
												value={row.midTerm}
												className="w-16 px-2 py-1 border rounded"
												onChange={(e) => handleChange(idx, "midTerm", e.target.value)}
											/>
										) : (
											row.midTerm
										)}
									</td>
									<td className="border py-2 px-3">
										{editable ? (
											<input
												type="number"
												value={row.finalTerm}
												className="w-16 px-2 py-1 border rounded"
												onChange={(e) => handleChange(idx, "finalTerm", e.target.value)}
											/>
										) : (
											row.finalTerm
										)}
									</td>
									<td className="border py-2 px-3 font-semibold text-[#6096ba]">{total}</td>
									<td className="border py-2 px-3 font-bold text-[#2563eb]">{grade}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<div className="flex justify-end gap-4">
					{!editable && (
						<button
							onClick={handleEditClick}
							className="px-6 py-2 bg-[#2563eb] text-white font-semibold rounded-xl shadow hover:bg-[#274c77] transition"
						>
							Edit
						</button>
					)}
					{editable && (
						<button
							onClick={handleSaveClick}
							className="px-6 py-2 bg-green-600 text-white font-semibold rounded-xl shadow hover:bg-green-700 transition"
						>
							Save
						</button>
					)}
				</div>
			</div>
	);
}
