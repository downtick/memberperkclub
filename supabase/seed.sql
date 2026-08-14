-- ============================================================================
-- MemberPerkClub.com — seed data
-- Run AFTER schema.sql. Mirrors lib/data/resourcesSeed.ts and
-- content/articles/*.mdx — keep the three in sync when adding new perks or
-- articles.
-- ============================================================================

insert into resources (name, category, description, affiliate_url, discount_code, featured, sort) values
-- Business
('GoodCall AI Answering Service', 'Business', 'An AI receptionist that never misses a call — picks up when you can''t, answers common questions, and books appointments around the clock.', 'https://goodcall.com/?ref=clubmembers', null, true, 10),
('CallRail Call Tracking', 'Business', 'Advanced call tracking and analytics so you know exactly which ads, keywords, and campaigns are generating your calls.', 'https://partners.callrail.com/servicelocatorpro', null, false, 20),
('SimpleTexting', 'Business', 'Business texting with the highest open rates in marketing — appointment reminders, promotions, and two-way texts from a dedicated business number.', 'https://simpletexting.grsm.io/servicelocatorpro', null, false, 30),
('Local Phone Numbers', 'Business', 'Buy a local number for any area code to give your business a presence in any city or region you serve.', 'http://www.jdoqocy.com/click-8222006-11832664-1468862346000?sid=memberperkclub', null, false, 40),
('VOIP Phone System', 'Business', 'A full business phone system over the internet, with extensions, voicemail, and call routing.', 'https://www.jdoqocy.com/click-9121627-12746697', null, false, 50),
('Domain Name Registration', 'Business', 'Register your domain at a discount for your business website and email.', 'https://www.jdoqocy.com/6181shqnhp4E676B7C4658CE5C6', null, false, 60),
('Hire a Virtual Assistant', 'Business', 'Find help for your business the easy way — post a job ad and hire a virtual assistant for back-office projects, admin work, and more, without full-time overhead.', 'http://store.onlinejobs.ph/?aid=128288', null, true, 70),
('Freelance Project Marketplace', 'Business', 'Freelancers for any one-off project — design, writing, admin work starting at a few dollars.', 'https://fvrr.co/3jOTSv7', null, false, 80),
('InCorp Business Formation', 'Business', 'Form your business entity the easy way — start a corporation or LLC and get registered agent service.', 'https://www.incorp.com/default.aspx?referredbyaccountid=31890', null, false, 90),
('Create an LLC in Minutes', 'Business', 'Fast, guided LLC formation — create an LLC in minutes without a lawyer.', 'https://shareasale.com/r.cfm?b=1229325&u=1690228&m=81890&urllink=&afftrack=', null, false, 100),
('iPostal1 Virtual Mailbox', 'Business', 'A real street address for your business mail — mail forwarding and scanning, a professional address without a physical office.', 'https://ipostal1.com/?ref=4283', null, false, 110),
('SiteGround Hosting', 'Business', 'Fast, reliable WordPress and website hosting, built for speed and uptime.', 'https://www.siteground.com/recommended?referrer_id=8203857', null, true, 120),
('QuickBooks', 'Business', 'Accounting software built for small business — discounted subscription for invoicing, bookkeeping, and payroll.', 'https://quickbooks.grsm.io/servicelocator', null, false, 130),
('Envato Elements', 'Business', 'Unlimited downloads of stock photos, video, fonts, and design templates for one subscription.', 'https://1.envato.market/7mRmRy', null, false, 140),
('Freshsales CRM', 'Business', 'A CRM to track leads and customers — organize leads, deals, and follow-ups.', 'https://affiliatepartner-freshsales.freshworks.com/servicelocator', null, false, 150),
('FreshDesk', 'Business', 'Support ticketing for customer service teams — manage customer support requests in one place.', 'https://affiliatepartner.freshdesk.com/free-trial', null, false, 160),

-- Personal
('PrivateMail', 'Personal', 'A secure email option that''s better than a free email account — encrypted, ad-free, and no data mining of your messages.', 'https://privatemail.com/members/aff.php?aff=154', null, true, 10),
('NordVPN', 'Personal', 'Encrypt your connection on any network — a discounted VPN subscription to keep your browsing and data private.', 'https://go.nordvpn.net/SH3Zf', null, false, 20),

-- Health & Beauty
('Groomie Head & Body Trimmer', 'Health & Beauty', 'An at-home head and body trimmer with a member discount.', 'https://www.groomie.club/DAVID15941', '10% off with this link', false, 10),
('BulkSupplements', 'Health & Beauty', 'Discounted bulk vitamins and supplements, with a built-in checkout discount.', 'https://shareasale.com/r.cfm?b=602574&u=1690228&m=53326&urllink=&afftrack=', null, true, 20),
('PureBulk Vitamins', 'Health & Beauty', 'Member pricing on vitamins and raw supplement ingredients.', 'https://purebulk.com/?sca_ref=1318730.ijV90hfZYp&sca_source=memberperkclub', null, false, 30),
('Fire Cider (Elderberry Source)', 'Health & Beauty', 'A traditional apple cider vinegar and elderberry wellness tonic.', 'https://elderberrysource.com/clubmembers', null, false, 40),
('Hardworking Gentleman', 'Health & Beauty', 'Grooming products for hair and skin, made for people who work with their hands.', 'https://www.hardworkinggentlemen.com?sca_ref=4479815.vJzFUdcOTm&sca_source=memberperkclub', 'CLUB15 — 15% off', false, 50),
('High Level Science', 'Health & Beauty', 'Medical-grade supplement formulas: heart health, hormone/urinary tract support for women, and a testosterone formula for men. These statements have not been evaluated by the FDA; this product is not intended to diagnose, treat, cure, or prevent any disease.', 'https://livehighlevel.com/servicelocatorpro', null, false, 60),

-- Financial
('MyScoreIQ — FICO Score', 'Financial', 'Unlock your FICO score for $1 — see your score and credit report, with ongoing monitoring and alerts.', 'https://member.myscoreiq.com/get-fico-preferred.aspx?offercode=432135K3', null, true, 10),
('CreditScoreIQ — DIY Credit Repair', 'Financial', 'A do-it-yourself credit repair service to help dispute errors on your credit report.', 'https://creditscoreiq.com', null, false, 20),
('IdentityIQ — Identity Monitoring', 'Financial', 'Identity monitoring and alerts to catch identity theft early.', 'https://www.identityiq.com/sc-securemax.aspx?offercode=431283IX', null, false, 30),
('Ally Bank', 'Financial', 'Easy to open and use an Ally Bank Checking or Savings account, with modern features like Zelle transfers and a debit card.', 'https://ally.com/referral?code=9H5N9G7C3B&CP=WebAppReferFriend', null, false, 40),

-- Home & Auto
('Home Warranty', 'Home & Auto', 'A home warranty plan covering major systems and appliances, with $50 off.', 'https://www.anrdoezrs.net/click-9121627-13073571', '$50 off', true, 10),
('Pet Medications', 'Home & Auto', 'Discounted pet medications shipped to your door, up to 25% off.', 'https://www.dpbolvw.net/click-9121627-12521727', null, false, 20),
('Tire Rack', 'Home & Auto', 'Member pricing on tires, with expert reviews and ratings to help you choose.', 'https://www.kqzyfj.com/click-9121627-14310855', null, false, 30)
on conflict do nothing;

insert into articles (slug, title, summary, category, printable) values
('winterize-your-home', 'How to Winterize Your Home', 'A room-by-room checklist to get your home ready for cold weather and avoid costly winter damage.', 'Home', false),
('reduce-air-conditioning-bill', 'Tips for Reducing Your Air Conditioning Bill', 'Simple habits and small fixes that lower your cooling costs without sacrificing comfort.', 'Home', false),
('air-filter-change-schedule', 'Air Filter Change Schedule', 'A printable seasonal schedule so you never forget when to swap your HVAC filter.', 'Printable', true),
('home-maintenance-checklist', 'Home Maintenance Checklist', 'A printable checklist covering smoke detectors, CO detectors, and the small jobs that prevent big repairs.', 'Printable', true),
('maintain-your-lawn-through-the-seasons', 'How to Maintain Your Lawn Through the Seasons', 'What your lawn needs in spring, summer, fall, and winter — and what to skip.', 'Home', false),
('air-quality-voc-filter-worth-it', 'Is an Air Quality / VOC Filter Worth It?', 'What VOC filters actually do, who benefits most, and how to decide if one is worth the cost.', 'Home', false),
('low-maintenance-indoor-gardening', 'Low-Maintenance Indoor Gardening (No Yard Required)', 'Easy houseplants and a simple care routine for apartments, condos, and busy schedules.', 'Home', false),
('budget-to-save-for-a-home', 'How to Make a Budget to Save for a Home', 'A step-by-step budgeting method to build a down payment without feeling deprived.', 'Budgeting', false),
('family-budget', 'How to Make a Family Budget', 'A practical framework for budgeting as a household, including kids'' expenses and shared goals.', 'Budgeting', false),
('self-improvement-worksheet', 'Self-Improvement Worksheet', 'A printable worksheet to set and track personal goals one quarter at a time.', 'Printable', true),
('emergency-fund-builder', 'Emergency Fund Builder Worksheet', 'A printable worksheet that breaks a 3-to-6-month emergency fund into small, doable steps.', 'Printable', true)
on conflict do nothing;
