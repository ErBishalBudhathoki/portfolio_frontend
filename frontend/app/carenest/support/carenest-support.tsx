"use client";

import { useState } from "react";

// ─── Inline styles ────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --teal-900: #0a2e38;
    --teal-800: #0f4c5c;
    --teal-700: #1a6378;
    --teal-600: #2980a0;
    --teal-200: #a8d8e8;
    --teal-100: #e0f4f9;
    --teal-50:  #f0fafd;
    --cream:    #faf9f6;
    --cream-dark: #f2f0eb;
    --coral:    #e06c54;
    --coral-light: #f5e8e5;
    --green:    #2e7d5e;
    --green-light: #e8f5ef;
    --text-primary: #1a2b30;
    --text-secondary: #4a6670;
    --text-muted: #7a9aa5;
    --border: #ddeaed;
    --shadow: 0 1px 3px rgba(10,46,56,0.08), 0 4px 16px rgba(10,46,56,0.05);
    --shadow-lg: 0 4px 24px rgba(10,46,56,0.12);
    --radius: 12px;
    --radius-sm: 8px;
  }

  html { scroll-behavior: smooth; }
  body {
    font-family: 'Outfit', sans-serif;
    background: var(--cream);
    color: var(--text-primary);
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }

  .sp-page {
    min-height: 100vh;
    background: var(--cream);
  }

  /* ── HERO ── */
  .sp-hero {
    background: linear-gradient(135deg, var(--teal-900) 0%, var(--teal-800) 55%, var(--teal-700) 100%);
    padding: 72px 24px 0;
    position: relative;
    overflow: hidden;
  }
  .sp-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .sp-hero-inner {
    max-width: 900px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
    text-align: center;
    padding-bottom: 48px;
  }
  .sp-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 100px;
    padding: 6px 14px;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 20px;
  }
  .sp-hero-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(36px, 6vw, 56px);
    color: #fff;
    line-height: 1.1;
    margin-bottom: 16px;
  }
  .sp-hero-sub {
    font-size: 17px;
    color: rgba(255,255,255,0.7);
    max-width: 520px;
    margin: 0 auto 36px;
    line-height: 1.6;
  }

  /* Search bar */
  .sp-search-wrap {
    max-width: 520px;
    margin: 0 auto 0;
    position: relative;
  }
  .sp-search {
    width: 100%;
    padding: 16px 20px 16px 52px;
    border-radius: 100px;
    border: none;
    font-size: 15px;
    font-family: 'Outfit', sans-serif;
    background: rgba(255,255,255,0.95);
    color: var(--text-primary);
    outline: none;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    transition: box-shadow 0.2s;
  }
  .sp-search:focus { box-shadow: 0 8px 32px rgba(0,0,0,0.3), 0 0 0 3px rgba(41,128,160,0.4); }
  .sp-search-icon {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 18px;
    pointer-events: none;
  }

  /* Wave separator */
  .sp-wave {
    display: block;
    width: 100%;
    height: 48px;
    margin-top: -1px;
  }

  /* ── QUICK CONTACT CARDS ── */
  .sp-quick {
    max-width: 900px;
    margin: 20px auto 0;
    padding: 0 24px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    position: relative;
    z-index: 1;
  }
  @media (max-width: 680px) { .sp-quick { grid-template-columns: 1fr; } }

  .sp-quick-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px 20px;
    text-align: center;
    box-shadow: var(--shadow-lg);
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, box-shadow 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }
  .sp-quick-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 32px rgba(10,46,56,0.15);
  }
  .sp-quick-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }
  .sp-quick-title {
    font-weight: 700;
    font-size: 15px;
    color: var(--text-primary);
  }
  .sp-quick-desc {
    font-size: 13px;
    color: var(--text-muted);
    line-height: 1.5;
  }

  /* ── SECTION WRAPPER ── */
  .sp-section {
    max-width: 900px;
    margin: 56px auto 0;
    padding: 0 24px;
  }
  .sp-section-heading {
    font-family: 'DM Serif Display', serif;
    font-size: 32px;
    color: var(--teal-900);
    margin-bottom: 8px;
  }
  .sp-section-sub {
    font-size: 15px;
    color: var(--text-muted);
    margin-bottom: 28px;
  }

  /* ── FAQ CATEGORIES ── */
  .sp-faq-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 24px;
  }
  .sp-faq-tab {
    padding: 8px 16px;
    border-radius: 100px;
    border: 1.5px solid var(--border);
    background: #fff;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Outfit', sans-serif;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .sp-faq-tab:hover { border-color: var(--teal-600); color: var(--teal-700); }
  .sp-faq-tab.active {
    background: var(--teal-800);
    border-color: var(--teal-800);
    color: #fff;
  }

  /* ── ACCORDION ── */
  .sp-accordion { display: flex; flex-direction: column; gap: 10px; }

  .sp-accordion-item {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: box-shadow 0.2s;
  }
  .sp-accordion-item.open { box-shadow: var(--shadow-lg); border-color: var(--teal-200); }

  .sp-accordion-trigger {
    width: 100%;
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    transition: background 0.15s;
  }
  .sp-accordion-trigger:hover { background: var(--teal-50); }
  .sp-accordion-item.open .sp-accordion-trigger { background: var(--teal-50); color: var(--teal-800); }

  .sp-accordion-chevron {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--cream-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
    transition: transform 0.3s, background 0.2s;
  }
  .sp-accordion-item.open .sp-accordion-chevron {
    transform: rotate(180deg);
    background: var(--teal-800);
    color: #fff;
  }

  .sp-accordion-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .sp-accordion-item.open .sp-accordion-body { max-height: 600px; }

  .sp-accordion-content {
    padding: 0 24px 24px;
    font-size: 14.5px;
    color: var(--text-secondary);
    line-height: 1.75;
    border-top: 1px solid var(--border);
    padding-top: 16px;
  }
  .sp-accordion-content p { margin-bottom: 12px; }
  .sp-accordion-content p:last-child { margin-bottom: 0; }
  .sp-accordion-content ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 10px 0;
  }
  .sp-accordion-content ul li {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }
  .sp-accordion-content ul li::before {
    content: '→';
    color: var(--teal-600);
    font-weight: 700;
    flex-shrink: 0;
  }
  .sp-accordion-content a { color: var(--teal-700); font-weight: 500; }
  .sp-accordion-content strong { color: var(--text-primary); }

  /* FAQ highlight tag */
  .sp-faq-tag {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 100px;
    margin-left: 6px;
    vertical-align: middle;
    flex-shrink: 0;
  }
  .sp-faq-tag.new { background: var(--green-light); color: var(--green); }
  .sp-faq-tag.important { background: var(--coral-light); color: var(--coral); }

  /* ── CONTACT SECTION ── */
  .sp-contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 600px) { .sp-contact-grid { grid-template-columns: 1fr; } }

  .sp-contact-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px 24px;
    box-shadow: var(--shadow);
  }
  .sp-contact-card-icon {
    font-size: 28px;
    margin-bottom: 12px;
    display: block;
  }
  .sp-contact-card h3 {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: var(--teal-900);
    margin-bottom: 8px;
  }
  .sp-contact-card p {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 16px;
    line-height: 1.6;
  }
  .sp-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 20px;
    border-radius: 100px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    font-family: 'Outfit', sans-serif;
    transition: all 0.2s;
    cursor: pointer;
    border: none;
  }
  .sp-btn-primary {
    background: var(--teal-800);
    color: #fff;
  }
  .sp-btn-primary:hover { background: var(--teal-700); transform: translateY(-1px); }
  .sp-btn-outline {
    background: transparent;
    color: var(--teal-800);
    border: 1.5px solid var(--teal-800);
  }
  .sp-btn-outline:hover { background: var(--teal-50); transform: translateY(-1px); }

  /* ── STATUS BANNER ── */
  .sp-status {
    background: var(--green-light);
    border: 1px solid #b2dfcc;
    border-radius: var(--radius);
    padding: 14px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--green);
    font-weight: 500;
    margin-bottom: 0;
  }

  /* ── STORE LINKS ── */
  .sp-store-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 16px;
  }
  .sp-store-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    border: 1.5px solid var(--border);
    background: #fff;
    color: var(--text-primary);
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s;
  }
  .sp-store-btn:hover {
    border-color: var(--teal-600);
    color: var(--teal-800);
    transform: translateY(-1px);
    box-shadow: var(--shadow);
  }

  /* ── FOOTER ── */
  .sp-footer {
    margin-top: 80px;
    background: var(--teal-900);
    color: rgba(255,255,255,0.5);
    text-align: center;
    padding: 28px 24px;
    font-size: 13px;
  }
  .sp-footer a { color: rgba(255,255,255,0.7); text-decoration: none; }
  .sp-footer a:hover { color: #fff; }

  /* Spacer */
  .sp-spacer { height: 56px; }

  /* No results */
  .sp-no-results {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-muted);
    font-size: 15px;
  }
  .sp-no-results strong { display: block; font-size: 32px; margin-bottom: 8px; }
`;

const CARENEST_EMAIL = "carenest@bishalbudhathoki.com";
const SUPPORT_MAILTO = `mailto:${CARENEST_EMAIL}?subject=${encodeURIComponent("CareNest Support Request")}`;
const PRIVACY_MAILTO = `mailto:${CARENEST_EMAIL}?subject=${encodeURIComponent("CareNest Privacy Request")}`;
const BUG_REPORT_MAILTO = `mailto:${CARENEST_EMAIL}?subject=${encodeURIComponent("[CareNest Bug Report]")}`;
const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.bishal.invoice";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const faqs = [
  // General
  {
    category: "general",
    q: "What is CareNest?",
    a: (
      <p>
        CareNest is a comprehensive mobile and web platform designed specifically for registered NDIS
        (National Disability Insurance Scheme) service providers. It helps NDIS businesses manage
        everything in one place — from onboarding clients and employees, to rostering, communications,
        invoicing, and payroll.
      </p>
    ),
  },
  {
    category: "general",
    q: "Who can use CareNest?",
    a: (
      <p>
        CareNest is built for three types of users: <strong>Business Administrators</strong> (NDIS
        registered providers), <strong>Support Workers / Employees</strong>, and <strong>NDIS
        Participants (Clients)</strong>. All users must be 18 years of age or older.
      </p>
    ),
  },
  {
    category: "general",
    q: "Which platforms is CareNest available on?",
    a: (
      <>
        <p>CareNest is available on:</p>
        <ul>
          <li>iOS (iPhone and iPad) — download from the Apple App Store</li>
          <li>Android — download from the Google Play Store</li>
          <li>Web browser — via the CareNest web portal</li>
        </ul>
      </>
    ),
  },
  {
    category: "general",
    q: "Is CareNest compliant with NDIS regulations?",
    a: (
      <p>
        Yes. CareNest is built with the NDIS Quality and Safeguards Commission requirements in mind.
        Features including incident reporting, service agreement management, audit-ready records, and
        compliant invoicing are all aligned with NDIS provider obligations.
      </p>
    ),
  },

  // Onboarding
  {
    category: "onboarding",
    q: "How do I register my NDIS business on CareNest?",
    a: (
      <>
        <p>Getting started is simple:</p>
        <ul>
          <li>Download CareNest from the App Store or Google Play</li>
          <li>Select "Register a Business" and enter your NDIS registration details</li>
          <li>Complete the business profile and upload required documents</li>
          <li>Once verified, you can begin inviting employees and adding clients</li>
        </ul>
        <p>
          Verification typically takes 1–2 business days. Need help? Contact us at{" "}
          <a href={SUPPORT_MAILTO}>{CARENEST_EMAIL}</a>.
        </p>
      </>
    ),
  },
  {
    category: "onboarding",
    q: "How do I add an employee to my organisation?",
    a: (
      <>
        <p>To add an employee:</p>
        <ul>
          <li>Navigate to <strong>Team → Add Employee</strong> in the dashboard</li>
          <li>Enter their name and email — they'll receive an invitation to download the app</li>
          <li>The employee completes their own profile, including qualifications and screening checks</li>
          <li>You approve and activate their account once documents are verified</li>
        </ul>
      </>
    ),
  },
  {
    category: "onboarding",
    q: "How do I onboard a new NDIS client (participant)?",
    a: (
      <>
        <p>To onboard a client:</p>
        <ul>
          <li>Go to <strong>Clients → Add Client</strong></li>
          <li>Enter their personal details, NDIS plan number, and support categories</li>
          <li>Upload their signed Service Agreement</li>
          <li>Assign support workers and configure their schedule</li>
        </ul>
        <p>
          Clients will receive login credentials so they can view their own schedule and communicate
          with their support team through the app.
        </p>
      </>
    ),
  },
  {
    category: "onboarding",
    q: "What documents are required for worker onboarding?",
    a: (
      <>
        <p>Standard documents required during employee onboarding include:</p>
        <ul>
          <li>Government-issued photo ID (passport or driver's licence)</li>
          <li>NDIS Worker Screening Check clearance</li>
          <li>Working With Children Check (if applicable)</li>
          <li>Relevant qualification certificates (e.g., Certificate III in Individual Support)</li>
          <li>First Aid / CPR certificate</li>
          <li>Tax File Declaration and superannuation details</li>
        </ul>
        <p>
          Your organisation may have additional requirements. All documents are securely stored and
          encrypted within CareNest.
        </p>
      </>
    ),
  },

  // Roster
  {
    category: "roster",
    q: "How do I create and manage rosters?",
    a: (
      <>
        <p>
          CareNest's roster module lets you build and manage schedules visually:
        </p>
        <ul>
          <li>Go to <strong>Roster → Week View</strong> to see all scheduled shifts</li>
          <li>Click any time slot to create a new shift and assign an available employee</li>
          <li>Employees receive an instant push notification when shifts are assigned</li>
          <li>Employees can accept, decline, or propose alternative times from their app</li>
        </ul>
      </>
    ),
  },
  {
    category: "roster",
    q: "Can employees view their own rosters?",
    a: (
      <p>
        Yes. Employees have a dedicated roster view in their app showing all upcoming and past shifts,
        including shift location, client details, and any attached notes. Employees are notified in
        real-time when their roster changes.
      </p>
    ),
  },
  {
    category: "roster",
    q: "What happens when a shift is cancelled or changed?",
    a: (
      <>
        <p>When a shift is modified or cancelled:</p>
        <ul>
          <li>The affected employee and client receive an immediate push notification</li>
          <li>The change is reflected in real-time on both the admin dashboard and employee app</li>
          <li>A reason for the change can be recorded for audit purposes</li>
          <li>Cancelled shifts are logged and can be reviewed in the shift history</li>
        </ul>
      </>
    ),
  },
  {
    category: "roster",
    q: "Does CareNest handle shift clock-in and clock-out?",
    a: (
      <p>
        Yes. Employees can clock in and out directly from the app at the start and end of each shift.
        Clock-in is location-verified to confirm the employee is at the correct service address.
        Clock-in/out times feed directly into payroll calculations.
      </p>
    ),
  },

  // Invoicing & Payroll
  {
    category: "invoicing",
    q: "How does CareNest generate NDIS invoices?",
    a: (
      <>
        <p>
          CareNest automatically generates NDIS-compliant invoices based on completed shifts:
        </p>
        <ul>
          <li>Shift data (hours, support category, NDIS price catalogue rates) feeds into invoicing automatically</li>
          <li>Invoices are generated with all required NDIS claim fields pre-filled</li>
          <li>You can review, edit, and approve invoices before sending</li>
          <li>Invoices can be submitted directly to the NDIS portal or sent to plan managers</li>
          <li>All invoices are stored and accessible for audit at any time</li>
        </ul>
      </>
    ),
  },
  {
    category: "invoicing",
    q: "How are employee payslips generated?",
    a: (
      <>
        <p>Payslips are automatically calculated from verified clock-in/out records:</p>
        <ul>
          <li>Hourly rates, allowances, and penalty rates are pre-configured by the admin</li>
          <li>Superannuation and tax withholding (PAYG) are calculated automatically</li>
          <li>Payslips are sent directly to employees via the app and email</li>
          <li>Employees can access all historical payslips from the <strong>Pay → History</strong> section</li>
        </ul>
      </>
    ),
  },
  {
    category: "invoicing",
    q: "Is payroll compliant with Australian Fair Work requirements?",
    a: (
      <p>
        CareNest's payroll engine is designed to support compliance with the{" "}
        <strong>Social, Community, Home Care and Disability Services Industry (SCHCADS) Award</strong>,
        which covers most NDIS support workers. We strongly recommend having your payroll configuration
        reviewed by a qualified payroll professional or bookkeeper to confirm it meets your specific
        obligations.
      </p>
    ),
  },
  {
    category: "invoicing",
    q: "Can I export invoices and payroll data to my accounting software?",
    a: (
      <p>
        Yes. CareNest supports data export in CSV and PDF formats compatible with major Australian
        accounting platforms. Native integrations are on our development roadmap. Contact support to
        enquire about your specific accounting software.
      </p>
    ),
    tag: "new",
  },

  // Location & Privacy
  {
    category: "privacy",
    q: "Is employee location tracking mandatory?",
    a: (
      <>
        <p>
          <strong>No — employee GPS tracking is entirely opt-in.</strong> Employees choose whether to
          enable location sharing in their own account settings. This decision has absolutely no impact
          on their employment status, access to app features, or roster.
        </p>
        <p>
          Employees can enable or disable location sharing at any time from:{" "}
          <strong>Settings → Privacy → Location Sharing</strong>.
        </p>
      </>
    ),
    tag: "important",
  },
  {
    category: "privacy",
    q: "Who can see my location when it's enabled?",
    a: (
      <ul>
        <li>Your <strong>business administrator</strong> can view your location during active, clocked-in shifts only</li>
        <li>An NDIS client can only see your location if you have <strong>explicitly granted them access</strong> and you are currently on a shift with them</li>
        <li>Location is never visible to any other party</li>
        <li>Location tracking stops automatically when you clock out of a shift</li>
      </ul>
    ),
  },
  {
    category: "privacy",
    q: "How long is my location data stored?",
    a: (
      <p>
        Location history is automatically and permanently deleted after <strong>90 days</strong>. You
        can also request immediate deletion of your location history by contacting us at{" "}
        <a href={PRIVACY_MAILTO}>our Privacy Officer</a>.
      </p>
    ),
  },
  {
    category: "privacy",
    q: "Is my personal data shared with third parties?",
    a: (
      <>
        <p>
          <strong>No. CareNest never sells or shares your personal data with third parties for commercial purposes.</strong>
        </p>
        <p>
          Data is processed only by our infrastructure sub-processors (Google Cloud, Cloudflare, MongoDB)
          under strict data processing agreements. Your data may only be disclosed if required by
          Australian law or the NDIS Quality and Safeguards Commission. See our full{" "}
          <a href="/carenest/privacy-policy">Privacy Policy</a> for details.
        </p>
      </>
    ),
  },
  {
    category: "privacy",
    q: "How do I request access to or deletion of my data?",
    a: (
      <>
        <p>Under the Australian Privacy Act 1988, you have the right to access and delete your data:</p>
        <ul>
          <li>Access most of your data directly in the app under <strong>Account → My Data</strong></li>
          <li>Submit a deletion request via email to <a href={PRIVACY_MAILTO}>our Privacy Officer</a></li>
          <li>We will acknowledge your request within 5 business days and action it within 30 days</li>
        </ul>
        <p>
          Note: Some financial records may be retained for 7 years as required by Australian taxation law.
        </p>
      </>
    ),
  },

  // Technical
  {
    category: "technical",
    q: "I forgot my password. How do I reset it?",
    a: (
      <>
        <p>To reset your password:</p>
        <ul>
          <li>On the login screen, tap <strong>Forgot Password</strong></li>
          <li>Enter your registered email address</li>
          <li>Check your inbox for a reset link (check spam if you don't see it within 2 minutes)</li>
          <li>Click the link and enter your new password</li>
        </ul>
        <p>
          If you don't receive the email or need further help, contact{" "}
          <a href={SUPPORT_MAILTO}>{CARENEST_EMAIL}</a>.
        </p>
      </>
    ),
  },
  {
    category: "technical",
    q: "I'm not receiving push notifications. What should I do?",
    a: (
      <>
        <p>Try the following steps:</p>
        <ul>
          <li>On iOS: Go to <strong>Settings → Notifications → CareNest</strong> and ensure notifications are enabled</li>
          <li>On Android: Go to <strong>Settings → Apps → CareNest → Notifications</strong></li>
          <li>In the CareNest app, check <strong>Settings → Notification Preferences</strong></li>
          <li>Ensure you have a stable internet connection</li>
          <li>Try logging out and back in to refresh your notification token</li>
        </ul>
        <p>Still not working? Contact us and include your device model and OS version.</p>
      </>
    ),
  },
  {
    category: "technical",
    q: "The app is crashing or not loading correctly. What should I do?",
    a: (
      <>
        <p>Basic troubleshooting steps:</p>
        <ul>
          <li>Force-close the app and reopen it</li>
          <li>Check you have the latest version installed (update via App Store or Google Play)</li>
          <li>Ensure your device OS is up to date</li>
          <li>Check your internet connection</li>
          <li>Clear the app cache (Android: Settings → Apps → CareNest → Storage → Clear Cache)</li>
          <li>If the issue persists, uninstall and reinstall the app (your data is saved to our servers)</li>
        </ul>
        <p>
          If none of these help, please email{" "}
          <a href={SUPPORT_MAILTO}>{CARENEST_EMAIL}</a> with a description
          of the issue and your device details.
        </p>
      </>
    ),
  },
  {
    category: "technical",
    q: "How do I delete my CareNest account?",
    a: (
      <>
        <p>
          You can request account deletion in two ways:
        </p>
        <ul>
          <li>In-app: Go to <strong>Settings → Account → Delete Account</strong></li>
          <li>By email: Send a deletion request to <a href={PRIVACY_MAILTO}>our Privacy Officer</a></li>
        </ul>
        <p>
          Please note: if you are currently employed by an NDIS business using CareNest, your account
          may need to be deactivated by your administrator. Some financial and compliance records will
          be retained as required by Australian law. Deletion is processed within 30 days of request.
        </p>
      </>
    ),
  },
];

const categories = [
  { id: "all",        label: "All Topics",          icon: "🗂️" },
  { id: "general",    label: "General",              icon: "💡" },
  { id: "onboarding", label: "Onboarding",           icon: "🚀" },
  { id: "roster",     label: "Rostering",            icon: "📅" },
  { id: "invoicing",  label: "Invoicing & Payroll",  icon: "💰" },
  { id: "privacy",    label: "Privacy & Data",       icon: "🔒" },
  { id: "technical",  label: "Technical Support",    icon: "🔧" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CareNestSupport() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const showAppStoreComingSoon = () => {
    window.alert("Coming Soon");
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    const qText = typeof faq.q === "string" ? faq.q.toLowerCase() : "";
    return matchesCategory && qText.includes(q);
  });

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="sp-page">
      <style>{css}</style>

      {/* ── HERO ── */}
      <header className="sp-hero">
        <div className="sp-hero-inner">
          <div className="sp-badge">🛟 Help & Support</div>
          <h1 className="sp-hero-title">How Can We Help?</h1>
          <p className="sp-hero-sub">
            Find answers to common questions about CareNest, or get in touch with our
            Australian support team.
          </p>
          <div className="sp-search-wrap">
            <span className="sp-search-icon">🔍</span>
            <input
              className="sp-search"
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setOpenIndex(null); }}
            />
          </div>
        </div>

        {/* Wave */}
        <svg className="sp-wave" viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 48h1440V24C1200 48 960 0 720 0S240 48 0 24V48z" fill="#faf9f6"/>
        </svg>
      </header>

      {/* ── QUICK CONTACT CARDS ── */}
      <div className="sp-quick">
        {[
          {
            icon: "📧",
            color: "#e0f4f9",
            title: "Email Support",
            desc: "Average response within 4 business hours",
            href: SUPPORT_MAILTO,
            label: "Send Email",
          },
          {
            icon: "🔒",
            color: "#f5e8e5",
            title: "Privacy Requests",
            desc: "Data access, correction, or deletion requests",
            href: PRIVACY_MAILTO,
            label: "Contact Privacy",
          },
          {
            icon: "🐛",
            color: "#e8f5ef",
            title: "Report a Bug",
            desc: "Help us improve CareNest for everyone",
            href: BUG_REPORT_MAILTO,
            label: "Report Issue",
          },
        ].map(({ icon, color, title, desc, href, label }) => (
          <a className="sp-quick-card" href={href} key={title}>
            <div className="sp-quick-icon" style={{ background: color }}>{icon}</div>
            <div className="sp-quick-title">{title}</div>
            <div className="sp-quick-desc">{desc}</div>
            <span className="sp-btn sp-btn-outline" style={{ marginTop: 4, fontSize: 13 }}>{label} →</span>
          </a>
        ))}
      </div>

      {/* ── SERVICE STATUS ── */}
      <div className="sp-section" style={{ marginTop: 40 }}>
        <div className="sp-status">
          <span>🟢</span>
          <span>All CareNest systems are fully operational — <a href="#" style={{ color: "inherit", fontWeight: 700 }}>View Status Page</a></span>
        </div>
      </div>

      {/* ── FAQs ── */}
      <div className="sp-section" style={{ marginTop: 52 }}>
        <h2 className="sp-section-heading">Frequently Asked Questions</h2>
        <p className="sp-section-sub">
          {searchQuery
            ? `Showing results for "${searchQuery}"`
            : "Browse by topic or search above"}
        </p>

        {/* Category tabs */}
        {!searchQuery && (
          <div className="sp-faq-tabs">
            {categories.map(({ id, label, icon }) => (
              <button
                key={id}
                className={`sp-faq-tab${activeCategory === id ? " active" : ""}`}
                onClick={() => { setActiveCategory(id); setOpenIndex(null); }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        )}

        {/* Accordion */}
        <div className="sp-accordion">
          {filteredFaqs.length === 0 ? (
            <div className="sp-no-results">
              <strong>🤔</strong>
              No results found for "{searchQuery}". Try different keywords or{" "}
              <a href={SUPPORT_MAILTO}>contact our team</a>.
            </div>
          ) : (
            filteredFaqs.map((faq, i) => (
              <div
                key={i}
                className={`sp-accordion-item${openIndex === i ? " open" : ""}`}
              >
                <button className="sp-accordion-trigger" onClick={() => toggle(i)}>
                  <span>
                    {faq.q}
                    {faq.tag === "new" && (
                      <span className="sp-faq-tag new">New</span>
                    )}
                    {faq.tag === "important" && (
                      <span className="sp-faq-tag important">Important</span>
                    )}
                  </span>
                  <span className="sp-accordion-chevron">▾</span>
                </button>
                <div className="sp-accordion-body">
                  <div className="sp-accordion-content">{faq.a}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── STILL NEED HELP ── */}
      <div className="sp-section" style={{ marginTop: 56 }}>
        <h2 className="sp-section-heading">Still Need Help?</h2>
        <p className="sp-section-sub">
          Our Australian support team is ready to assist you
        </p>
        <div className="sp-contact-grid">
          <div className="sp-contact-card">
            <span className="sp-contact-card-icon">📬</span>
            <h3>Email Our Team</h3>
            <p>
              Send us a detailed message and we'll get back to you within 4 business hours
              during AEST/AEDT business hours (Mon–Fri, 9am–5pm).
            </p>
            <a className="sp-btn sp-btn-primary" href={SUPPORT_MAILTO}>
              📧 {CARENEST_EMAIL}
            </a>
          </div>
          <div className="sp-contact-card">
            <span className="sp-contact-card-icon">🔐</span>
            <h3>Privacy Officer</h3>
            <p>
              For data access requests, corrections, deletions, or any privacy concern —
              contact our dedicated Privacy Officer directly.
            </p>
            <a className="sp-btn sp-btn-outline" href={PRIVACY_MAILTO}>
              🔒 Contact Privacy
            </a>
          </div>
        </div>
      </div>

      {/* ── DOWNLOAD ── */}
      <div className="sp-section" style={{ marginTop: 52 }}>
        <h2 className="sp-section-heading">Download CareNest</h2>
        <p className="sp-section-sub">Available on iOS and Android</p>
        <div className="sp-store-row">
          <button className="sp-store-btn" type="button" onClick={showAppStoreComingSoon}>
            🍎 Download on the App Store
          </button>
          <a className="sp-store-btn" href={GOOGLE_PLAY_URL} target="_blank" rel="noreferrer">
            🤖 Get it on Google Play
          </a>
        </div>
        <p style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>
          Requires iOS 14+ or Android 8.0+. Free to download — subscription required for business features.
        </p>
      </div>

      {/* ── LEGAL LINKS ── */}
      <div className="sp-section" style={{ marginTop: 48 }}>
        <div style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "24px 28px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px 32px",
          alignItems: "center",
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--teal-900)" }}>
            📋 Legal &amp; Compliance
          </span>
          <a href="/carenest/privacy-policy" style={{ fontSize: 14, color: "var(--teal-700)", fontWeight: 500 }}>
            Privacy Policy
          </a>
          <a href={PRIVACY_MAILTO} style={{ fontSize: 14, color: "var(--teal-700)", fontWeight: 500 }}>
            Request Data Deletion
          </a>
          <a href="https://www.oaic.gov.au" target="_blank" rel="noreferrer" style={{ fontSize: 14, color: "var(--teal-700)", fontWeight: 500 }}>
            OAIC (Australian Privacy Regulator) ↗
          </a>
          <a href="https://www.ndiscommission.gov.au" target="_blank" rel="noreferrer" style={{ fontSize: 14, color: "var(--teal-700)", fontWeight: 500 }}>
            NDIS Quality &amp; Safeguards Commission ↗
          </a>
        </div>
      </div>

      <div className="sp-spacer" />

      {/* ── FOOTER ── */}
      <footer className="sp-footer">
        © {new Date().getFullYear()} CareNest. All rights reserved. &nbsp;|&nbsp;{" "}
        <a href="/carenest/privacy-policy">Privacy Policy</a> &nbsp;|&nbsp;{" "}
        <a href={SUPPORT_MAILTO}>{CARENEST_EMAIL}</a> &nbsp;|&nbsp;{" "}
        Built for Australian NDIS providers 🇦🇺
      </footer>
    </div>
  );
}
