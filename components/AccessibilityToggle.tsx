"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { A11Y_OPTIONS, A11Y_STORAGE_KEY, type A11yPrefs } from "./a11yBoot";

// Floating accessibility toolbar (reference: websites/_reference/accessibility-widget).
// Each option toggles a class on <html>; every visual change lives in the
// "Accessibility reading modes" block of app/globals.css, so page structure and
// content never change. Prefs persist in localStorage and are re-applied before
// paint by the A11Y_BOOT script in app/layout.tsx. Styling uses plain .a11y-w-*
// classes (also in globals.css) so it works with or without Tailwind.

function readPrefs(): A11yPrefs {
  try {
    const saved = localStorage.getItem(A11Y_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    // One-time migration from the old two-option toggle.
    const legacy: A11yPrefs = {};
    if (localStorage.getItem("a11y-contrast") === "1") legacy.contrast = true;
    if (parseFloat(localStorage.getItem("a11y-fs") || "1") > 1) legacy.large = true;
    return legacy;
  } catch {
    return {};
  }
}

function applyPrefs(prefs: A11yPrefs) {
  const root = document.documentElement;
  for (const o of A11Y_OPTIONS) root.classList.toggle(o.cls, !!prefs[o.key]);
}

export function AccessibilityToggle() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>({});
  const launcher = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const p = readPrefs();
    applyPrefs(p);
    // localStorage is only readable after mount; reading during render would
    // cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefs(p);
  }, []);

  // Functional updates so rapid toggles never read stale state.
  const commit = useCallback((compute: (prev: A11yPrefs) => A11yPrefs) => {
    setPrefs((prev) => {
      const next = compute(prev);
      applyPrefs(next);
      try {
        localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(next));
        localStorage.removeItem("a11y-contrast");
        localStorage.removeItem("a11y-fs");
      } catch {}
      return next;
    });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    launcher.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const activeCount = Object.values(prefs).filter(Boolean).length;

  return (
    <div className="a11y-w">
      {open && (
        <div role="dialog" aria-label="Accessibility options" className="a11y-w-panel">
          <div className="a11y-w-head">
            <h2 className="a11y-w-title">Accessibility</h2>
            <button type="button" onClick={close} aria-label="Close accessibility options" className="a11y-w-close">
              ×
            </button>
          </div>
          <div className="a11y-w-list">
            {A11Y_OPTIONS.map((o) => {
              const on = !!prefs[o.key];
              return (
                <button
                  key={o.key}
                  type="button"
                  role="switch"
                  aria-checked={on}
                  onClick={() => commit((prev) => ({ ...prev, [o.key]: !prev[o.key] }))}
                  className="a11y-w-opt"
                >
                  <span>
                    <span className="a11y-w-label">{o.label}</span>
                    <span className="a11y-w-desc">{o.desc}</span>
                  </span>
                  <span aria-hidden="true" className="a11y-w-track">
                    <span className="a11y-w-knob" />
                  </span>
                </button>
              );
            })}
          </div>
          <div className="a11y-w-foot">
            <span>Saved on this device</span>
            <button type="button" onClick={() => commit(() => ({}))} disabled={activeCount === 0} className="a11y-w-reset">
              Reset all
            </button>
          </div>
        </div>
      )}
      <button
        ref={launcher}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Accessibility options"
        className="a11y-w-launcher"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="6.4" r="1.5" fill="currentColor" />
          <path
            d="M5.5 9.2c2 .9 4.2 1.3 6.5 1.3s4.5-.4 6.5-1.3M12 10.5v4m0 0l-2.4 4.6M12 14.5l2.4 4.6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {activeCount > 0 && (
          <span className="a11y-w-count" aria-hidden="true">
            {activeCount}
          </span>
        )}
      </button>
    </div>
  );
}

export const AccessibilityWidget = AccessibilityToggle;
export default AccessibilityToggle;
