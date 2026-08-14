// Perks/affiliate directory seed data — sourced from
// websites/_reference/non-insurance-affiliate-links.md. FitAminos is
// deliberately excluded per that file's note (dropped, GLP-1/weight-loss
// drug affiliate — different regulatory exposure than vitamins/grooming).
//
// This is the source of truth for the /supabase/seed.sql INSERT statements
// below — if you add/remove a perk, update both files together.
export interface ResourceSeed {
  name: string;
  category: "Business" | "Personal" | "Health & Beauty" | "Financial" | "Home & Auto";
  description: string;
  affiliate_url: string;
  discount_code?: string;
  featured?: boolean;
  sort: number;
}

export const RESOURCES_SEED: ResourceSeed[] = [
  // ── Business ──
  { name: "GoodCall AI Answering Service", category: "Business", description: "An AI receptionist that never misses a call — picks up when you can't, answers common questions, and books appointments around the clock.", affiliate_url: "https://goodcall.com/?ref=clubmembers", featured: true, sort: 10 },
  { name: "CallRail Call Tracking", category: "Business", description: "Advanced call tracking and analytics so you know exactly which ads, keywords, and campaigns are generating your calls.", affiliate_url: "https://partners.callrail.com/servicelocatorpro", sort: 20 },
  { name: "SimpleTexting", category: "Business", description: "Business texting with the highest open rates in marketing — appointment reminders, promotions, and two-way texts from a dedicated business number.", affiliate_url: "https://simpletexting.grsm.io/servicelocatorpro", sort: 30 },
  { name: "Local Phone Numbers", category: "Business", description: "Buy a local number for any area code to give your business a presence in any city or region you serve.", affiliate_url: "http://www.jdoqocy.com/click-8222006-11832664-1468862346000?sid=memberperkclub", sort: 40 },
  { name: "VOIP Phone System", category: "Business", description: "A full business phone system over the internet, with extensions, voicemail, and call routing.", affiliate_url: "https://www.jdoqocy.com/click-9121627-12746697", sort: 50 },
  { name: "Domain Name Registration", category: "Business", description: "Register your domain at a discount for your business website and email.", affiliate_url: "https://www.jdoqocy.com/6181shqnhp4E676B7C4658CE5C6", sort: 60 },
  { name: "Hire a Virtual Assistant", category: "Business", description: "Find help for your business the easy way — post a job ad and hire a virtual assistant for back-office projects, admin work, and more, without full-time overhead.", affiliate_url: "http://store.onlinejobs.ph/?aid=128288", featured: true, sort: 70 },
  { name: "Freelance Project Marketplace", category: "Business", description: "Freelancers for any one-off project — design, writing, admin work starting at a few dollars.", affiliate_url: "https://fvrr.co/3jOTSv7", sort: 80 },
  { name: "InCorp Business Formation", category: "Business", description: "Form your business entity the easy way — start a corporation or LLC and get registered agent service.", affiliate_url: "https://www.incorp.com/default.aspx?referredbyaccountid=31890", sort: 90 },
  { name: "Create an LLC in Minutes", category: "Business", description: "Fast, guided LLC formation — create an LLC in minutes without a lawyer.", affiliate_url: "https://shareasale.com/r.cfm?b=1229325&u=1690228&m=81890&urllink=&afftrack=", sort: 100 },
  { name: "iPostal1 Virtual Mailbox", category: "Business", description: "A real street address for your business mail — mail forwarding and scanning, a professional address without a physical office.", affiliate_url: "https://ipostal1.com/?ref=4283", sort: 110 },
  { name: "SiteGround Hosting", category: "Business", description: "Fast, reliable WordPress and website hosting, built for speed and uptime.", affiliate_url: "https://www.siteground.com/recommended?referrer_id=8203857", featured: true, sort: 120 },
  { name: "QuickBooks", category: "Business", description: "Accounting software built for small business — discounted subscription for invoicing, bookkeeping, and payroll.", affiliate_url: "https://quickbooks.grsm.io/servicelocator", sort: 130 },
  { name: "Envato Elements", category: "Business", description: "Unlimited downloads of stock photos, video, fonts, and design templates for one subscription.", affiliate_url: "https://1.envato.market/7mRmRy", sort: 140 },
  { name: "Freshsales CRM", category: "Business", description: "A CRM to track leads and customers — organize leads, deals, and follow-ups.", affiliate_url: "https://affiliatepartner-freshsales.freshworks.com/servicelocator", sort: 150 },
  { name: "FreshDesk", category: "Business", description: "Support ticketing for customer service teams — manage customer support requests in one place.", affiliate_url: "https://affiliatepartner.freshdesk.com/free-trial", sort: 160 },

  // ── Personal ──
  { name: "PrivateMail", category: "Personal", description: "A secure email option that's better than a free email account — encrypted, ad-free, and no data mining of your messages.", affiliate_url: "https://privatemail.com/members/aff.php?aff=154", featured: true, sort: 10 },
  { name: "NordVPN", category: "Personal", description: "Encrypt your connection on any network — a discounted VPN subscription to keep your browsing and data private.", affiliate_url: "https://go.nordvpn.net/SH3Zf", sort: 20 },

  // ── Health & Beauty ──
  { name: "Groomie Head & Body Trimmer", category: "Health & Beauty", description: "An at-home head and body trimmer with a member discount.", affiliate_url: "https://www.groomie.club/DAVID15941", discount_code: "10% off with this link", sort: 10 },
  { name: "BulkSupplements", category: "Health & Beauty", description: "Discounted bulk vitamins and supplements, with a built-in checkout discount.", affiliate_url: "https://shareasale.com/r.cfm?b=602574&u=1690228&m=53326&urllink=&afftrack=", featured: true, sort: 20 },
  { name: "PureBulk Vitamins", category: "Health & Beauty", description: "Member pricing on vitamins and raw supplement ingredients.", affiliate_url: "https://purebulk.com/?sca_ref=1318730.ijV90hfZYp&sca_source=memberperkclub", sort: 30 },
  { name: "Fire Cider (Elderberry Source)", category: "Health & Beauty", description: "A traditional apple cider vinegar and elderberry wellness tonic.", affiliate_url: "https://elderberrysource.com/clubmembers", sort: 40 },
  { name: "Hardworking Gentleman", category: "Health & Beauty", description: "Grooming products for hair and skin, made for people who work with their hands.", affiliate_url: "https://www.hardworkinggentlemen.com?sca_ref=4479815.vJzFUdcOTm&sca_source=memberperkclub", discount_code: "CLUB15 — 15% off", sort: 50 },
  { name: "High Level Science", category: "Health & Beauty", description: "Medical-grade supplement formulas: heart health, hormone/urinary tract support for women, and a testosterone formula for men. These statements have not been evaluated by the FDA; this product is not intended to diagnose, treat, cure, or prevent any disease.", affiliate_url: "https://livehighlevel.com/servicelocatorpro", sort: 60 },

  // ── Financial ──
  { name: "MyScoreIQ — FICO Score", category: "Financial", description: "Unlock your FICO score for $1 — see your score and credit report, with ongoing monitoring and alerts.", affiliate_url: "https://member.myscoreiq.com/get-fico-preferred.aspx?offercode=432135K3", featured: true, sort: 10 },
  { name: "CreditScoreIQ — DIY Credit Repair", category: "Financial", description: "A do-it-yourself credit repair service to help dispute errors on your credit report.", affiliate_url: "https://creditscoreiq.com", sort: 20 },
  { name: "IdentityIQ — Identity Monitoring", category: "Financial", description: "Identity monitoring and alerts to catch identity theft early.", affiliate_url: "https://www.identityiq.com/sc-securemax.aspx?offercode=431283IX", sort: 30 },
  { name: "Ally Bank", category: "Financial", description: "Easy to open and use an Ally Bank Checking or Savings account, with modern features like Zelle transfers and a debit card.", affiliate_url: "https://ally.com/referral?code=9H5N9G7C3B&CP=WebAppReferFriend", sort: 40 },

  // ── Home & Auto ──
  { name: "Home Warranty", category: "Home & Auto", description: "A home warranty plan covering major systems and appliances, with $50 off.", affiliate_url: "https://www.anrdoezrs.net/click-9121627-13073571", discount_code: "$50 off", featured: true, sort: 10 },
  { name: "Pet Medications", category: "Home & Auto", description: "Discounted pet medications shipped to your door, up to 25% off.", affiliate_url: "https://www.dpbolvw.net/click-9121627-12521727", sort: 20 },
  { name: "Tire Rack", category: "Home & Auto", description: "Member pricing on tires, with expert reviews and ratings to help you choose.", affiliate_url: "https://www.kqzyfj.com/click-9121627-14310855", sort: 30 },
];

export const RESOURCE_CATEGORIES = ["Business", "Personal", "Health & Beauty", "Financial", "Home & Auto"] as const;
