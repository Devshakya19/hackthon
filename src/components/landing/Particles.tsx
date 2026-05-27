import React, { useEffect, useRef } from "react";

export default function Particles() {
  // Lightweight CSS-driven particles: renders decorative spans
  const nodes = new Array(30).fill(0).map((_, i) => {
    const size = Math.floor(Math.random() * 8) + 3;
    const left = Math.floor(Math.random() * 100);
    const top = Math.floor(Math.random() * 100);
    const delay = Math.random() * 6;
    return (
      <span
        key={i}
        className="pointer-events-none absolute rounded-full blur-2xl"
        style={{
          width: size,
          height: size,
          left: `${left}%`,
          top: `${top}%`,
          background:
            "radial-gradient(circle at 30% 30%, rgba(0,229,255,0.9), rgba(123,47,255,0.4))",
          opacity: Math.random() * 0.6 + 0.12,
          animation: `float ${
            10 + Math.random() * 10
          }s ease-in-out ${delay}s infinite`,
        }}
      />
    );
  });
  return <div className="absolute inset-0 opacity-80">{nodes}</div>;
}
