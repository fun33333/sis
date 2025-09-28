import React, { useState } from "react";

export default function TransferTabs() {
  const [activeTab, setActiveTab] = useState("campus");

  return (
    <div style={{ background: "#e3edf3", padding: "8px", borderRadius: "20px", display: "inline-flex" }}>
      <button
        onClick={() => setActiveTab("campus")}
        style={{
          background: activeTab === "campus" ? "#fff" : "transparent",
          color: activeTab === "campus" ? "#222" : "#7a8a99",
          fontWeight: activeTab === "campus" ? "bold" : "normal",
          border: "none",
          outline: "none",
          borderRadius: "26px",
          padding: "6px 18px",
          marginRight: "2px",
          boxShadow: activeTab === "campus" ? "0 1px 4px #d1dbe5" : "none",
          cursor: "pointer",
        }}
      >
        Campus Transfer
      </button>
      <button
        onClick={() => setActiveTab("shift")}
        style={{
          background: activeTab === "shift" ? "#fff" : "transparent",
          color: activeTab === "shift" ? "#222" : "#7a8a99",
          fontWeight: activeTab === "shift" ? "bold" : "normal",
          border: "none",
          outline: "none",
          borderRadius: "26px",
          padding: "6px 18px",
          boxShadow: activeTab === "shift" ? "0 1px 4px #d1dbe5" : "none",
          cursor: "pointer",
        }}
      >
        Shift Transfer
      </button>
    </div>
  );
}