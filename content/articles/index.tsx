import type { ReactNode } from "react";

export interface ArticleContent {
  slug: string;
  title: string;
  summary: string;
  category: "Home" | "Budgeting" | "Printable";
  printable: boolean;
  body: ReactNode;
}

// Small presentational helpers shared by the articles below. Check marks and
// the violet callout come from CSS (.a-checks, .a-callout) so they also print
// cleanly in black and white.
function Checks({ items }: { items: string[] }) {
  return (
    <ul className="a-checks">
      {items.map((t) => (<li key={t}>{t}</li>))}
    </ul>
  );
}

function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="a-callout">
      <p className="a-callout-title">{title}</p>
      {children}
    </div>
  );
}

function Season({ label }: { label: string }) {
  return <p><span className="a-season">{label}</span></p>;
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
        <p>
          Most lawn problems come from doing the right job at the wrong time of year. Here is what
          to do and when.
        </p>

        <Season label="Spring" />
        <Checks items={[
          "Rake out the dead grass and leaves left over from winter. Air and water need to reach the soil.",
          "Wait until the grass is actively growing before the first cut. Cutting a sleepy lawn weakens it.",
          "Put down crabgrass preventer when the soil hits about 55 degrees. A cheap soil thermometer tells you.",
          "Fix bare patches now. Loosen the soil, drop seed, keep it damp for two weeks.",
        ]} />

        <Season label="Summer" />
        <Checks items={[
          "Set the mower higher. Taller grass shades the soil, holds water, and crowds out weeds.",
          "Water deeply twice a week, not a little every day. You want the roots to chase the water down.",
          "Water early in the morning. Evening water sits on the blades all night and invites disease.",
          "Leave the clippings on the lawn. They break down and feed it for free.",
        ]} />

        <Season label="Fall" />
        <Checks items={[
          "This is the best time to seed. The soil is still warm and the weeds have slowed down.",
          "Aerate if the ground feels hard or water puddles. Rent a core aerator for a few hours.",
          "Keep mowing until the grass stops growing. Long grass under snow gets matted and moldy.",
          "Feed the lawn once in the fall. Roots keep growing after the top stops.",
        ]} />

        <Season label="Winter" />
        <Checks items={[
          "Stay off a frozen lawn. Footprints on frozen blades leave dead tracks in spring.",
          "Keep heavy items off the grass. A tarp or a trailer left in one spot kills what is under it.",
          "Clean and drain the mower before storing it.",
        ]} />

        <Callout title="The three mistakes that cause most problems">
          <p>Cutting too short. Never take off more than a third of the blade at once.</p>
          <p>Watering every day for a few minutes. That grows shallow roots.</p>
          <p>Feeding at the wrong time. Heavy feeding in high summer stresses the lawn.</p>
        </Callout>
      </>
    ),
  },
  {
    slug: "air-quality-voc-filter-worth-it",
    title: "Is an Air Quality Filter Worth It?",
    summary: "What VOC filters actually do, who benefits most, and how to decide if one is worth the cost.",
    category: "Home",
    printable: false,
    body: (
      <>
        <p>
          A standard furnace filter protects your equipment. A higher grade filter cleans the air
          you breathe. They are not the same job, and the better one is not always the right pick
          for your home.
        </p>

        <h2>What the number on the package means</h2>
        <Checks items={[
          "MERV 1 to 4: catches lint and large dust. Protects the furnace, not you.",
          "MERV 5 to 8: catches mold spores and most dust. A reasonable middle.",
          "MERV 11 to 13: catches pollen, pet dander, smoke, and fine dust.",
          "HEPA: catches almost everything, but most home systems cannot pull air through one.",
        ]} />

        <h2>It is worth it if</h2>
        <Checks items={[
          "Someone in the house has allergies or asthma.",
          "You have pets that shed.",
          "You live near a busy road, a farm field, or anywhere with wildfire smoke.",
          "Anyone in the house smokes.",
        ]} />

        <h2>Think twice if</h2>
        <Checks items={[
          "Your system is older or already struggles to heat and cool the house.",
          "You tend to forget filter changes. A clogged high grade filter is worse than a clean cheap one.",
          "Your ducts leak. Filtered air that escapes into the attic helps nobody.",
        ]} />

        <Callout title="What about VOCs">
          <p>
            VOCs are fumes from paint, cleaners, new carpet, and glue. A normal filter does not
            catch them because they are gas, not dust. To cut VOCs you need a carbon filter, and
            you need fresh air. Open a window when you paint or clean.
          </p>
        </Callout>

        <h2>Before you spend the money</h2>
        <Checks items={[
          "Check what size your system takes. The size is printed on the side of your current filter.",
          "Look up the highest MERV your system allows. The manual says, or the maker's website does.",
          "Try one season at the higher grade and watch your airflow. Weak airflow from the vents means go back down.",
        ]} />
      </>
    ),
  },
  {
    slug: "low-maintenance-indoor-gardening",
    title: "Low Maintenance Indoor Gardening",
    summary: "Easy houseplants and a simple care routine for apartments, condos, and busy schedules.",
    category: "Home",
    printable: false,
    body: (
      <>
        <p>You do not need a yard, a greenhouse, or much time. You need the right plants and a sink.</p>

        <h2>Plants that forgive you</h2>
        <Checks items={[
          "Snake plant. Low light, water about once a month.",
          "Pothos. Grows in almost any light and tells you when it is thirsty by drooping.",
          "ZZ plant. Handles a dark corner and skipped watering.",
          "Spider plant. Grows fast and makes baby plants you can pot up and give away.",
          "Cast iron plant. The name is the review.",
        ]} />

        <h2>Herbs worth growing in a kitchen window</h2>
        <Checks items={[
          "Mint. Nearly impossible to kill. Keep it in its own pot because it takes over.",
          "Basil. Wants the sunniest window you have and regular water.",
          "Chives. Cut what you need and they grow back.",
          "Green onions. Stand the white root ends in a glass of water and watch them regrow.",
        ]} />

        <Callout title="The four things that kill houseplants">
          <p>Too much water. More plants die from kindness than from neglect.</p>
          <p>Pots with no drainage hole. Roots sitting in water rot.</p>
          <p>The wrong light. South facing windows are bright. North facing are dim.</p>
          <p>Cold drafts. Keep plants off windowsills that frost and away from heat vents.</p>
        </Callout>

        <h2>A simple routine</h2>
        <Checks items={[
          "Once a week: poke a finger two inches into the soil. Water only if it is dry.",
          "Once a month: turn each pot a half turn so growth stays even.",
          "Twice a year: feed with a basic houseplant food in spring and summer.",
          "Once a year: move up one pot size if roots show at the drainage hole.",
        ]} />

        <h2>Starting cheap</h2>
        <Checks items={[
          "Ask a friend with a pothos or spider plant for a cutting. Both root in a glass of water.",
          "Buy small plants instead of large ones. They adjust to your home better.",
          "Save yogurt tubs as pots. Poke holes in the bottom.",
        ]} />
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
        <p>
          Saving for a house is a different job than a normal budget. You are saving a large amount
          for one date, so the plan has to be specific.
        </p>

        <h2>Work out your real target</h2>
        <p>You need more than the down payment.</p>
        <Checks items={[
          "Down payment. Anywhere from 3 percent to 20 percent of the price depending on the loan.",
          "Closing costs. Usually 2 percent to 5 percent of the price.",
          "Moving and setup. Deposits, truck, basic furniture, tools.",
          "A cushion so you do not start homeownership with nothing in the bank.",
        ]} />

        <h2>Then do the math backward</h2>
        <Checks items={[
          "Add those four numbers. That is your target.",
          "Pick your date. Count the months between now and then.",
          "Divide the target by the months. That is your monthly savings number.",
          "If that number is impossible, move the date instead of lying to yourself.",
        ]} />

        <h2>Make the saving automatic</h2>
        <Checks items={[
          "Open a separate savings account only for the house. Mixing it with spending money never works.",
          "Set an automatic transfer for the day after payday.",
          "Put the account at a different bank so it is slightly annoying to reach.",
          "Send any windfall straight there. Tax refunds, bonuses, gift money.",
        ]} />

        <h2>Where to find the money</h2>
        <Checks items={[
          "Review every subscription. Cancel anything you did not use last month.",
          "Call your insurance and phone company and ask for a lower rate.",
          "Pause retirement contributions above the employer match only if the timeline is short.",
          "Give yourself a small fun budget. A plan with zero joy gets abandoned.",
        ]} />

        <Callout title="Things that catch people out">
          <p>Credit matters as much as savings. Pay everything on time while you save.</p>
          <p>Do not open new credit cards or finance a car in the year before you apply.</p>
          <p>Keep the money somewhere boring. Money you need within two years should not be in the stock market.</p>
        </Callout>
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
        <p>
          A family budget is only useful if everyone in the house knows about it. Here is a version
          that survives real life.
        </p>

        <h2>Step one: find your true monthly income</h2>
        <Checks items={[
          "Use take home pay, not salary.",
          "If your income changes month to month, use the lowest of the last six months.",
          "Count only money you can rely on. Bonuses and overtime are extra, not income.",
        ]} />

        <h2>Step two: list what must be paid</h2>
        <Checks items={[
          "Housing, utilities, and insurance.",
          "Food and household basics.",
          "Transport and fuel.",
          "Minimum payments on any debt.",
          "Childcare and school costs.",
        ]} />

        <h2>Step three: give the rest a job</h2>
        <p>Every remaining dollar gets assigned before the month starts.</p>
        <Checks items={[
          "Savings first. Treat it like a bill.",
          "Then the flexible things. Eating out, clothes, activities, gifts.",
          "Then extra debt payments.",
        ]} />

        <h2>Make it work with kids</h2>
        <Checks items={[
          "Hold a short family meeting once a month. Fifteen minutes is plenty.",
          "Give older kids a small budget of their own so they learn to run out of money safely.",
          "Agree on one rule for unplanned spending. For example, anything over fifty dollars waits a day.",
          "Keep a shared list on the fridge for things people want. Most wants fade in a week.",
        ]} />

        <Callout title="Plan for the months that break budgets">
          <p>
            Some costs come once a year and wreck the month they land in. Holidays and birthdays.
            Back to school. Car registration and tires. Insurance payments that are not monthly.
          </p>
          <p>
            Add up those yearly costs, divide by twelve, and save that amount every month in a
            separate spot.
          </p>
        </Callout>

        <h2>Signs your budget needs adjusting</h2>
        <Checks items={[
          "You go over in the same category three months running. The number is wrong, not you.",
          "You never have any fun money. Budgets with no slack do not last.",
          "You are paying for things nobody uses.",
        ]} />
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
        <p>
          Print this worksheet and fill it in for the next 90 days. Ninety days is long enough to
          change something and short enough that you can still picture the end.
        </p>

        <Callout title="Pick one thing">
          <p>
            People who pick one goal finish it far more often than people who pick five. Choose the
            one that would make the others easier.
          </p>
        </Callout>

        <h2>This quarter&apos;s focus</h2>
        <p>One thing I want to be different in 90 days: ____________________________________</p>
        <p>How I will know it worked: ____________________________________</p>

        <h2>Three small habits to support it</h2>
        <p>Keep each one small enough to do on your worst day, not your best one.</p>
        <p>1. ____________________________________</p>
        <p>2. ____________________________________</p>
        <p>3. ____________________________________</p>

        <h2>What usually gets in the way</h2>
        <Checks items={[
          "The thing most likely to stop me: ______________________",
          "What I will do when it happens: ______________________",
          "Who I will tell about this goal: ______________________",
        ]} />

        <h2>Weekly habit tracker</h2>
        <p>Tick a box each day you do the habit. Missing one day is normal. Missing two in a row is the warning sign.</p>
        <table className="w-full border-collapse my-4 text-sm">
          <thead>
            <tr className="text-left border-b-2" style={{ borderColor: "var(--ink)" }}>
              <th className="py-2 pr-2">Habit</th>
              {["M","T","W","T","F","S","S"].map((d, idx) => (
                <th key={idx} className="py-2 pr-2">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((n) => (
              <tr key={n} className="border-b" style={{ borderColor: "var(--rule)" }}>
                <td className="py-2 pr-2">Habit {n}</td>
                {Array.from({ length: 7 }).map((_, d) => (
                  <td key={d} className="py-2 pr-2"><span className="checkbox" /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <h2>Monthly check in</h2>
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

        <h2>At the end of 90 days</h2>
        <Checks items={[
          "What actually changed: ______________________",
          "What I would do differently next time: ______________________",
          "The one habit worth keeping: ______________________",
        ]} />
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
