"use client";
import { useState } from "react";
import Icon from "./Icon";

const WHOLESALE = 12;
const DEFAULT_RETAIL = 49;

// Wholesale-to-retail explainer. Mirrors the sync() logic from the approved
// design sample exactly (verified at 0 / 12 / 49 / 149).
//
// Progressive enhancement: the server renders the default $49 state as real
// markup, so the panel is fully readable and correct with JavaScript disabled
// — only the drag interaction needs JS.
function marginNote(margin: number): string {
  if (margin > 0) {
    return "Per membership, after the $12 wholesale cost. We pay no commissions — there's nothing to pay, because the margin is already yours.";
  }
  if (margin === 0) {
    return "You pass it through at cost. Nothing earned, nothing lost — a clean value-add for the client.";
  }
  return `You absorb $${Math.abs(margin)} per membership and give it as a gift. Many producers do exactly this to win or keep a policy.`;
}

export default function MarginCalculator() {
  const [retail, setRetail] = useState(DEFAULT_RETAIL);
  const margin = retail - WHOLESALE;

  return (
    <div className="margin">
      <div>
        <div className="flow">
          <div className="flowstep">
            <span className="lbl">We bill you</span>
            <span className="amt">${WHOLESALE}</span>
            <span className="sub">
              Wholesale rate,
              <br />
              charged once
            </span>
          </div>
          <span className="flowarrow"><Icon name="right" /></span>
          <div className="flowstep you">
            <span className="lbl">You charge</span>
            <span className="amt" id="retail">{retail === 0 ? "Free" : `$${retail}`}</span>
            <span className="sub">
              Your price,
              <br />
              your call
            </span>
          </div>
        </div>

        <label htmlFor="retailslider" className="fineprint" style={{ display: "block", marginTop: 18 }}>
          Drag to set your retail price
        </label>
        <input
          id="retailslider"
          className="slider"
          type="range"
          min={0}
          max={149}
          step={1}
          value={retail}
          onChange={(e) => setRetail(parseInt(e.target.value, 10))}
          aria-describedby="marginout"
          aria-label="Your retail price per membership"
        />
        <div className="sliderrow">
          <span>Free to your client</span>
          <span>$149 public price</span>
        </div>
      </div>

      <div>
        <span className="eyebrow">You keep</span>
        <div className="keep" id="keep">
          {margin >= 0 ? "$" : "−$"}
          {Math.abs(margin)}
        </div>
        <p className="keepnote" id="marginout">{marginNote(margin)}</p>
      </div>
    </div>
  );
}
