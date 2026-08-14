"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

// "Copy code" action. On success it swaps to the green --good palette with a
// checkmark and the word "Copied" for 1.8s, matching the design sample.
// Deliberately violet-family, never ember — nothing clickable is ember.
export default function CopyCodeButton({ code }: { code: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Clipboard can be blocked (permissions, insecure origin). Still give
      // feedback — the code is visible beside the button either way.
    }
    setDone(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`btn btn-code${done ? " done" : ""}`}
      aria-live="polite"
    >
      <Icon name={done ? "check" : "copy"} />
      {done ? "Copied" : "Copy code"}
    </button>
  );
}
