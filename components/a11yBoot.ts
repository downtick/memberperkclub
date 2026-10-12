// Shared by components/AccessibilityToggle.tsx and app/layout.tsx. Kept out of the
// "use client" file so the server layout can import the boot string directly.

export const A11Y_STORAGE_KEY = "a11y-prefs";

export type A11yPrefs = Record<string, boolean>;

export const A11Y_OPTIONS = [
  { key: "contrast", cls: "a11y-high-contrast", label: "High contrast", desc: "Black text on white, solid outlines" },
  { key: "large", cls: "a11y-large-text", label: "Larger text", desc: "Increase font size site-wide" },
  { key: "spacing", cls: "a11y-spacing", label: "More spacing", desc: "Add line and letter spacing" },
  { key: "readable", cls: "a11y-readable-font", label: "Readable font", desc: "Switch to a high-legibility font" },
  { key: "links", cls: "a11y-underline-links", label: "Underline links", desc: "Underline every link" },
  { key: "motion", cls: "a11y-reduce-motion", label: "Reduce motion", desc: "Turn off animations and transitions" },
] as const;

// Inline <script> for <head> in app/layout.tsx: applies saved prefs before first
// paint so there is no flash on reload. Also honors the old two-option toggle's keys.
export const A11Y_BOOT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(A11Y_STORAGE_KEY)}),p=s?JSON.parse(s):{};if(!s){if(localStorage.getItem('a11y-contrast')==='1')p.contrast=1;if(parseFloat(localStorage.getItem('a11y-fs')||'1')>1)p.large=1;}var m=${JSON.stringify(Object.fromEntries(A11Y_OPTIONS.map((o) => [o.key, o.cls])))};for(var k in m){if(p[k])document.documentElement.classList.add(m[k]);}}catch(e){}})();`;
