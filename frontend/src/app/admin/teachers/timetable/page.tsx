
"use client";
import React, { useState } from "react";

const teacherData = {
    name: "Mr. Ahmed Khan",
    classTeacherOf: "8th A",
};

const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

const periodsByDay: Record<string, Array<{ time: string; subject: string; class: string }>> = {
    Monday: [
        { time: "08:00 - 08:40", subject: "Mathematics", class: "8th A" },
        { time: "08:40 - 09:20", subject: "Science", class: "7th B" },
        { time: "09:20 - 10:00", subject: "Mathematics", class: "8th B" },
        { time: "10:20 - 11:00", subject: "Physics", class: "9th A" },
        { time: "11:00 - 11:40", subject: "Mathematics", class: "8th A" },
        { time: "11:40 - 12:20", subject: "Free Period", class: "-" },
        { time: "12:20 - 13:30", subject: "Chemistry", class: "10th A" },
    ],
    Tuesday: [
        { time: "08:00 - 08:40", subject: "Science", class: "7th B" },
        { time: "08:40 - 09:20", subject: "Mathematics", class: "8th A" },
        { time: "09:20 - 10:00", subject: "Physics", class: "9th A" },
        { time: "10:20 - 11:00", subject: "Mathematics", class: "8th B" },
        { time: "11:00 - 11:40", subject: "Chemistry", class: "10th A" },
        { time: "11:40 - 12:20", subject: "Free Period", class: "-" },
        { time: "12:20 - 13:30", subject: "Mathematics", class: "8th A" },
    ],
    Wednesday: [
        { time: "08:00 - 08:40", subject: "Mathematics", class: "8th B" },
        { time: "08:40 - 09:20", subject: "Physics", class: "9th A" },
        { time: "09:20 - 10:00", subject: "Science", class: "7th B" },
        { time: "10:20 - 11:00", subject: "Mathematics", class: "8th A" },
        { time: "11:00 - 11:40", subject: "Chemistry", class: "10th A" },
        { time: "11:40 - 12:20", subject: "Free Period", class: "-" },
        { time: "12:20 - 13:30", subject: "Mathematics", class: "8th A" },
    ],
    Thursday: [
        { time: "08:00 - 08:40", subject: "Physics", class: "9th A" },
        { time: "08:40 - 09:20", subject: "Mathematics", class: "8th A" },
        { time: "09:20 - 10:00", subject: "Science", class: "7th B" },
        { time: "10:20 - 11:00", subject: "Mathematics", class: "8th B" },
        { time: "11:00 - 11:40", subject: "Chemistry", class: "10th A" },
        { time: "11:40 - 12:20", subject: "Free Period", class: "-" },
        { time: "12:20 - 13:30", subject: "Mathematics", class: "8th A" },
    ],
    Friday: [
        { time: "08:00 - 08:40", subject: "Mathematics", class: "8th A" },
        { time: "08:40 - 09:20", subject: "Science", class: "7th B" },
        { time: "09:20 - 10:00", subject: "Mathematics", class: "8th B" },
        { time: "10:20 - 11:00", subject: "Physics", class: "9th A" },
        { time: "11:00 - 11:40", subject: "Mathematics", class: "8th A" },
        { time: "11:40 - 12:30", subject: "Free Period", class: "-" },
    ],
    Saturday: [
        { time: "08:00 - 08:40", subject: "Mathematics", class: "8th A" },
        { time: "08:40 - 09:20", subject: "Science", class: "7th B" },
        { time: "09:20 - 10:00", subject: "Mathematics", class: "8th B" },
        { time: "10:20 - 11:00", subject: "Physics", class: "9th A" },
        { time: "11:00 - 11:40", subject: "Mathematics", class: "8th A" },
        { time: "11:40 - 12:20", subject: "Free Period", class: "-" },
        { time: "12:20 - 13:30", subject: "Chemistry", class: "10th A" },
    ],
};

const TeacherTimetablePage = () => {
    const [selectedDay, setSelectedDay] = useState<string>(weekDays[0]);
    

    return (
        <div className="max-w-5xl mx-auto mt-12 p-8 bg-[#e7ecef] rounded-2xl shadow-2xl border-2 border-[#a3cef1]">
            <h2 className="text-[#274c77] font-extrabold text-4xl mb-2 tracking-wide">Teacher Timetable</h2>
            <div className="mb-6 text-lg text-[#8b8c89]">
                <span className="font-bold text-[#274c77]">Name:</span> {teacherData.name}<br />
                <span className="font-bold text-[#274c77]">Class Teacher of:</span> {teacherData.classTeacherOf}
            </div>
            <div className="flex gap-2 mb-8 border-b-2 border-[#a3cef1] justify-center">
                {weekDays.map((day) => (
                    <button
                        key={day}
                        className={`px-6 py-2 rounded-t-lg font-semibold transition-all duration-200 focus:outline-none 
        ${selectedDay === day
                                ? 'bg-[#a3cef1] text-[#274c77] border-b-4 border-[#6096ba] shadow-md'
                                : 'bg-[#e7ecef] text-[#8b8c89] hover:bg-[#a3cef1]/60'}`}
                        onClick={() => setSelectedDay(day)}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <h3 className="text-[#6096ba] font-bold text-2xl mb-4">{selectedDay} Periods</h3>
            <div className="overflow-x-auto">
                <table className="w-full rounded-xl overflow-hidden shadow-lg bg-[#e7ecef]">
                    <thead>
                        <tr>
                            <th className="bg-[#6096ba] text-[#e7ecef] px-6 py-3 border border-[#a3cef1] font-bold text-lg">Time</th>
                            <th className="bg-[#6096ba] text-[#e7ecef] px-6 py-3 border border-[#a3cef1] font-bold text-lg">Subject</th>
                            <th className="bg-[#6096ba] text-[#e7ecef] px-6 py-3 border border-[#a3cef1] font-bold text-lg">Class</th>
                        </tr>
                    </thead>
                    <tbody>
                        {periodsByDay[selectedDay].map((period, idx) => (
                            <tr key={idx} className="hover:bg-[#a3cef1]/30 transition">
                                <td className="border border-[#a3cef1] px-6 py-3 text-[#274c77] text-base">{period.time}</td>
                                <td className="border border-[#a3cef1] px-6 py-3 text-[#274c77] text-base">{period.subject}</td>
                                <td className="border border-[#a3cef1] px-6 py-3 text-[#274c77] text-base">{period.class}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {selectedDay === "Friday" && (
                <div className="mt-5 text-[#6096ba] font-bold text-base">
                    Note: <span className="text-[#274c77]">Friday is a half day. School closes at 12:30pm.</span>
                </div>
            )}
            {selectedDay !== "Friday" && (
                <div className="mt-5 text-[#8b8c89] font-bold text-base">
                    Note: <span className="text-[#274c77]">School closes at 1:30pm.</span>
                </div>
            )}
        </div>
    );
};

export default TeacherTimetablePage;
