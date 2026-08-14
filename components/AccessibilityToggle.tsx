"use client";
import { useEffect, useState } from "react";

const SCALES = [
  { label: "A", value: "1", title: "Default text size" },
  { label: "A+", value: "1.15", title: "Larger text" },
  { label: "A++", value: "1.3", title: "Largest text" },
];

export default function AccessibilityToggle() {
  const [open, setOpen] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [fs, setFs] = useState("1");

  // Saved preferences are read AND applied here rather than in a pre-paint
  // inline script. Applying them post-hydration keeps the server and client
  // markup identical, so no suppressHydrationWarning is needed anywhere.
  useEffect(() => {
    try {
      const savedContrast = localStorage.getItem("a11y-contrast") === "1";
      const savedFs = localStorage.getItem("a11y-fs") || "1";
      setContrast(savedContrast);
      setFs(savedFs);
      document.documentElement.classList.toggle("a11y-contrast", savedContrast);
      document.documentElement.style.setProperty("--fs", savedFs);
    } catch {}
  }, []);

  function applyContrast(next: boolean) {
    setContrast(next);
    document.documentElement.classList.toggle("a11y-contrast", next);
    try {
      localStorage.setItem("a11y-contrast", next ? "1" : "0");
    } catch {}
  }

  function applyScale(value: string) {
    setFs(value);
    document.documentElement.style.setProperty("--fs", value);
    try {
      localStorage.setItem("a11y-fs", value);
    } catch {}
  }

  const pickerBtn = (selected: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "7px 0",
    borderRadius: 9,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    fontFamily: "inherit",
    border: `1px solid ${selected ? "var(--violet)" : "var(--rule)"}`,
    background: selected ? "var(--violet-wash)" : "var(--ground-2)",
    color: selected ? "var(--violet)" : "var(--ink-2)",
  });

  return (
    <div style={{ position: "fixed", right: "1rem", bottom: "1rem", zIndex: 60 }}>
      {open && (
        <div
          role="dialog"
          aria-label="Accessibility options"
          style={{
            position: "absolute",
            bottom: "3.75rem",
            right: 0,
            width: 250,
            background: "var(--ground-2)",
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: "var(--shadow-lg)",
            border: "1px solid var(--rule)",
          }}
        >
          <p className="eyebrow" style={{ margin: "0 0 10px" }}>Accessibility</p>

          <p style={{ fontSize: 12, color: "var(--ink-3)", margin: "0 0 6px" }}>Text size</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {SCALES.map((s) => (
              <button key={s.value} onClick={() => applyScale(s.value)} title={s.title} aria-pressed={fs === s.value} style={pickerBtn(fs === s.value)}>
                {s.label}
              </button>
            ))}
          </div>

          <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
            <span style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 600 }}>High contrast</span>
            <button
              type="button"
              role="switch"
              aria-checked={contrast}
              aria-label="High contrast mode"
              className="toggle-track"
              data-on={contrast}
              onClick={() => applyContrast(!contrast)}
            />
          </label>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Accessibility options"
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(145deg, var(--violet-3), var(--violet))",
          color: "#fff",
          fontSize: "1.35rem",
          fontWeight: 700,
          boxShadow: "var(--lift)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: 1,
        }}
      >
        <span aria-hidden="true">A</span>
      </button>
    </div>
  );
}
