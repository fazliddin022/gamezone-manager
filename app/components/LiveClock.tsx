"use client";

import { useEffect, useState } from "react";

export default function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      fontFamily: "monospace",
      fontSize: "1rem",
      fontWeight: 700,
      color: "#a78bfa",
      letterSpacing: "0.05em",
      background: "rgba(124,58,237,0.1)",
      padding: "0.375rem 0.875rem",
      borderRadius: "0.5rem",
      border: "1px solid rgba(124,58,237,0.2)",
    }}>
      {time}
    </div>
  );
}