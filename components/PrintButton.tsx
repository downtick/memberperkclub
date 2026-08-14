"use client";

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="btn-outline no-print">
      Print this
    </button>
  );
}
