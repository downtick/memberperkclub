import type { ReactNode } from "react";

export interface ArticleContent {
  slug: string;
  title: string;
  summary: string;
  category: "Home" | "Budgeting" | "Printable";
  printable: boolean;
  body: ReactNode;
}

// v1 article library. Written at a 12th-grade-or-lower reading level,
// bullet-point-heavy. Printable articles use the `.print-sheet` styling +
// the PrintButton component rather than generating a literal PDF (see
// components/PrintButton.tsx) — "actually printable" via print CSS.
export const ARTICLES: ArticleContent[] = [
  {
    slug: "winterize-your-home",
    title: "How to Winterize Your Home",
    summary: "A room-by-room checklist to get your home ready for cold weather and avoid costly winter damage.",
    category: "Home",
    printable: false,
    body: (
      <>
        <p>
          A little prep in the fall can save you thousands of dollars in winter repairs. Here's a
          simple, room-by-room way to get your home ready before the first freeze.
        </p>
        <h2>Outside the house</h2>
        <ul>
          <li>Disconnect and drain garden hoses. A hose left attached can freeze and crack an outdoor faucet.</li>
          <li>Cover outdoor faucets with foam insulating covers (a few dollars at any hardware store).</li>
          <li>Clean out gutters and downspouts so melting snow and ice have somewhere to go.</li>
          <li>Trim tree branches that hang near your roof or power lines — ice buildup makes them heavier and more likely to break.</li>
          <li>Seal cracks in your driveway or walkway before water gets in and freezes, which makes cracks worse.</li>
        </ul>
        <h2>Windows and doors</h2>
        <ul>
          <li>Check weatherstripping around doors and windows. If you feel a draft, replace it — it's an inexpensive fix.</li>
          <li>Add clear plastic window film to older or single-pane windows for extra insulation.</li>
          <li>Close storm windows and storm doors if you have them.</li>
        </ul>
        <h2>Heating system</h2>
        <ul>
          <li>Have your furnace or heat pump serviced once a year, ideally before it gets cold.</li>
          <li>Replace the air filter (see our printable filter schedule).</li>
          <li>Test your thermostat, and consider a programmable or smart thermostat to save on heating costs.</li>
          <li>Open curtains on sunny days to let in free heat, and close them at night to hold heat in.</li>
        </ul>
        <h2>Pipes</h2>
        <ul>
          <li>Insulate exposed pipes in unheated spaces like a garage, attic, or crawl space — foam pipe sleeves are cheap and easy to install.</li>
          <li>Know where your main water shutoff valve is, in case a pipe does freeze and burst.</li>
          <li>On the coldest nights, let faucets drip slightly and open cabinet doors under sinks on exterior walls to let warm air reach the pipes.</li>
        </ul>
        <h2>Safety</h2>
        <ul>
          <li>Test smoke and carbon monoxide detectors and replace batteries.</li>
          <li>Have your chimney inspected and cleaned if you use a fireplace.</li>
          <li>Keep a basic winter emergency kit — flashlight, batteries, blankets, and a few days of water — in case of a power outage.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "reduce-air-conditioning-bill",
    title: "Tips for Reducing Your Air Conditioning Bill",
    summary: "Simple habits and small fixes that lower your cooling costs without sacrificing comfort.",
    category: "Home",
    printable: false,
    body: (
      <>
        <p>
          Cooling can be one of the biggest line items on a summer electric bill. Most of the
          easiest savings don't require a new AC unit — just a few habit and maintenance changes.
        </p>
        <h2>Free or nearly free</h2>
        <ul>
          <li>Set your thermostat a few degrees higher when you're away or asleep — every degree adds up.</li>
          <li>Close blinds and curtains on the sunniest side of the house during the day.</li>
          <li>Use ceiling fans to feel cooler at a higher thermostat setting. Turn fans off when you leave the room — they cool people, not rooms.</li>
          <li>Avoid running the oven, dryer, or dishwasher during the hottest part of the day.</li>
          <li>Keep interior doors open so air can circulate evenly through the house.</li>
        </ul>
        <h2>Low-cost fixes</h2>
        <ul>
          <li>Replace your air filter regularly — a clogged filter makes your system work harder (see our printable filter schedule).</li>
          <li>Seal gaps around windows and doors with weatherstripping or caulk.</li>
          <li>Add or top up attic insulation — heat rises, and a poorly insulated attic can undo a lot of your AC's work.</li>
          <li>Install a programmable or smart thermostat so the system automatically eases off when no one's home.</li>
        </ul>
        <h2>Bigger investments (if you're ready)</h2>
        <ul>
          <li>Have a technician do an annual tune-up — a well-maintained system runs more efficiently.</li>
          <li>Consider reflective window film or awnings on especially sunny windows.</li>
          <li>If your unit is more than 10–15 years old, ask about the energy savings of a newer, higher-efficiency model.</li>
        </ul>
        <p>
          Small changes stack up. Combining a few of these — especially thermostat habits and a
          clean filter — is often enough to notice a real difference on your bill.
        </p>
      </>
    ),
  },
  {
    slug: "air-filter-change-schedule",
    title: "Air Filter Change Schedule",
    summary: "A printable seasonal schedule so you never forget when to swap your HVAC filter.",
    category: "Printable",
    printable: true,
    body: (
      <>
        <p>
          Print this out and stick it to your furnace, filter cabinet, or refrigerator. Check the
          box each time you change your filter.
        </p>
        <table className="w-full border-collapse my-4 text-sm">
          <thead>
            <tr className="text-left border-b-2" style={{ borderColor: "var(--ink)" }}>
              <th className="py-2 pr-2">Month</th>
              <th className="py-2 pr-2">Filter type</th>
              <th className="py-2">Done</th>
            </tr>
          </thead>
          <tbody>
            {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
              <tr key={m} className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="py-2 pr-2">{m}</td>
                <td className="py-2 pr-2">1&quot; / 2&quot; / 4&quot; (circle one)</td>
                <td className="py-2"><span className="checkbox" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>General rule of thumb</h2>
        <ul>
          <li><strong>1-inch filters:</strong> every 1–2 months, more often with pets or allergies.</li>
          <li><strong>2-inch filters:</strong> every 3 months.</li>
          <li><strong>4-inch (media) filters:</strong> every 6–12 months.</li>
          <li>Homes with pets, smokers, or allergy sufferers should change filters more often than the general guideline.</li>
        </ul>
        <p>Write your filter size here so you always have it on hand when shopping: ____________________</p>
      </>
    ),
  },
  {
    slug: "home-maintenance-checklist",
    title: "Home Maintenance Checklist",
    summary: "A printable checklist covering smoke detectors, CO detectors, and the small jobs that prevent big repairs.",
    category: "Printable",
    printable: true,
    body: (
      <>
        <p>Print this checklist and work through it once each season.</p>
        <h2>Every month</h2>
        <ul>
          <li><span className="checkbox" />Test smoke detectors and carbon monoxide detectors (press the test button)</li>
          <li><span className="checkbox" />Check HVAC filter, replace if dirty</li>
          <li><span className="checkbox" />Run water in unused sinks/drains to keep the trap seal from drying out</li>
        </ul>
        <h2>Every season</h2>
        <ul>
          <li><span className="checkbox" />Test garage door auto-reverse safety feature</li>
          <li><span className="checkbox" />Check fire extinguisher gauge/pressure</li>
          <li><span className="checkbox" />Inspect visible plumbing under sinks for leaks</li>
          <li><span className="checkbox" />Clean range hood/exhaust fan filter</li>
          <li><span className="checkbox" />Check for pests or signs of rodents</li>
        </ul>
        <h2>Twice a year (spring &amp; fall)</h2>
        <ul>
          <li><span className="checkbox" />Replace smoke &amp; CO detector batteries (even if not low)</li>
          <li><span className="checkbox" />Clean gutters</li>
          <li><span className="checkbox" />Inspect roof for damaged or missing shingles</li>
          <li><span className="checkbox" />Service HVAC system</li>
          <li><span className="checkbox" />Flush water heater to remove sediment</li>
          <li><span className="checkbox" />Check caulking around tubs, showers, and windows</li>
          <li><span className="checkbox" />Test sump pump, if you have one</li>
        </ul>
        <h2>Once a year</h2>
        <ul>
          <li><span className="checkbox" />Replace smoke &amp; CO detector units themselves every 10 years (check the manufacture date on the back)</li>
          <li><span className="checkbox" />Have chimney inspected/cleaned if used</li>
          <li><span className="checkbox" />Inspect attic/crawl space insulation</li>
          <li><span className="checkbox" />Reseal exterior wood decks/fences</li>
          <li><span className="checkbox" />Check exterior paint/siding for wear</li>
        </ul>
      </>
    ),
  },
  {
    slug: "maintain-your-lawn-through-the-seasons",
    title: "How to Maintain Your Lawn Through the Seasons",
    summary: "What your lawn needs in spring, summer, fall, and winter — and what to skip.",
    category: "Home",
    printable: false,
    body: (
      <>
        <p>A full guide to seasonal lawn care is coming soon.</p>
        <ul>
          <li><strong>Spring:</strong> aerate, overseed bare patches, apply pre-emergent weed control.</li>
          <li><strong>Summer:</strong> water deeply and less often, mow high to shade roots, watch for pests.</li>
          <li><strong>Fall:</strong> fertilize for root growth, keep mowing until growth stops, clear leaves.</li>
          <li><strong>Winter:</strong> stay off frozen or frosty grass, keep an eye on drainage and ice buildup.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "air-quality-voc-filter-worth-it",
    title: "Is an Air Quality / VOC Filter Worth It?",
    summary: "What VOC filters actually do, who benefits most, and how to decide if one is worth the cost.",
    category: "Home",
    printable: false,
    body: (
      <>
        <p>A full guide to indoor air quality and VOC filtration is coming soon.</p>
        <ul>
          <li>VOC (volatile organic compound) filters use activated carbon to reduce odors and certain chemical fumes that standard filters don't catch.</li>
          <li>They tend to help most with new furniture/flooring off-gassing, smoke, or strong household chemical use.</li>
          <li>They generally do not replace a HEPA-style filter for dust, pollen, and allergens — many households want both.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "low-maintenance-indoor-gardening",
    title: "Low-Maintenance Indoor Gardening (No Yard Required)",
    summary: "Easy houseplants and a simple care routine for apartments, condos, and busy schedules.",
    category: "Home",
    printable: false,
    body: (
      <>
        <p>A full guide to low-maintenance indoor gardening is coming soon.</p>
        <ul>
          <li>Easiest starter plants: pothos, snake plant, ZZ plant, spider plant.</li>
          <li>Most low-light apartments can still support one or two of the plants above.</li>
          <li>A simple weekly check (soil dryness + a rotation toward the light) is usually all these need.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "budget-to-save-for-a-home",
    title: "How to Make a Budget to Save for a Home",
    summary: "A step-by-step budgeting method to build a down payment without feeling deprived.",
    category: "Budgeting",
    printable: false,
    body: (
      <>
        <p>A full down-payment savings guide is coming soon.</p>
        <ul>
          <li>Start with your target down payment (often 3%–20% of the home price).</li>
          <li>Open a separate, dedicated savings account so the money is "out of sight."</li>
          <li>Automate a transfer on payday, even a small one — consistency beats intensity.</li>
          <li>Redirect windfalls (tax refunds, bonuses) straight into the fund.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "family-budget",
    title: "How to Make a Family Budget",
    summary: "A practical framework for budgeting as a household, including kids' expenses and shared goals.",
    category: "Budgeting",
    printable: false,
    body: (
      <>
        <p>A full family budgeting guide is coming soon.</p>
        <ul>
          <li>List every income source and every fixed bill first — what's left is what you actually get to plan with.</li>
          <li>Use a simple split like 50% needs / 30% wants / 20% savings &amp; debt as a starting point, then adjust.</li>
          <li>Review the budget together as a household once a month — five minutes, same day every month.</li>
        </ul>
      </>
    ),
  },
  {
    slug: "self-improvement-worksheet",
    title: "Self-Improvement Worksheet",
    summary: "A printable worksheet to set and track personal goals one quarter at a time.",
    category: "Printable",
    printable: true,
    body: (
      <>
        <p>Print this worksheet and fill it in for the next 90 days.</p>
        <h2>This quarter's focus</h2>
        <p>One thing I want to be different in 90 days: ____________________________________</p>
        <h2>Three small habits to support it</h2>
        <p>1. ____________________________________</p>
        <p>2. ____________________________________</p>
        <p>3. ____________________________________</p>
        <h2>Monthly check-in</h2>
        <table className="w-full border-collapse my-4 text-sm">
          <thead>
            <tr className="text-left border-b-2" style={{ borderColor: "var(--ink)" }}>
              <th className="py-2 pr-2">Month</th>
              <th className="py-2 pr-2">What worked</th>
              <th className="py-2">What to adjust</th>
            </tr>
          </thead>
          <tbody>
            {["Month 1","Month 2","Month 3"].map((m) => (
              <tr key={m} className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="py-2 pr-2">{m}</td>
                <td className="py-2 pr-2">&nbsp;</td>
                <td className="py-2">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ),
  },
  {
    slug: "emergency-fund-builder",
    title: "Emergency Fund Builder Worksheet",
    summary: "A printable worksheet that breaks a 3-to-6-month emergency fund into small, doable steps.",
    category: "Printable",
    printable: true,
    body: (
      <>
        <p>Print this worksheet and fill it out to build your emergency fund step by step.</p>
        <h2>Step 1 — find your target</h2>
        <p>My essential monthly expenses (rent/mortgage, utilities, food, insurance, minimum debt payments): $____________</p>
        <p>3-month emergency fund target (x3): $____________</p>
        <p>6-month emergency fund target (x6): $____________</p>
        <h2>Step 2 — pick a monthly savings amount</h2>
        <p>Amount I can set aside each month: $____________</p>
        <p>Months to reach a 3-month fund at that pace: ____________</p>
        <h2>Step 3 — track your progress</h2>
        <table className="w-full border-collapse my-4 text-sm">
          <thead>
            <tr className="text-left border-b-2" style={{ borderColor: "var(--ink)" }}>
              <th className="py-2 pr-2">Month</th>
              <th className="py-2 pr-2">Amount added</th>
              <th className="py-2">Running total</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <tr key={n} className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="py-2 pr-2">Month {n}</td>
                <td className="py-2 pr-2">&nbsp;</td>
                <td className="py-2">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Tip: keep this fund in a separate savings account you don't touch for everyday spending.</p>
      </>
    ),
  },
];

export function getArticleBySlug(slug: string) {
  return ARTICLES.find((a) => a.slug === slug);
}
