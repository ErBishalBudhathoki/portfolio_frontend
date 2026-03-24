"use client";

import { useState, useEffect, useRef } from "react";

// ─── Inline styles (no Tailwind dependency) ──────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --teal-900: #0a2e38;
    --teal-800: #0f4c5c;
    --teal-700: #1a6378;
    --teal-600: #2980a0;
    --teal-100: #e0f4f9;
    --teal-50:  #f0fafd;
    --cream:    #faf9f6;
    --cream-dark: #f2f0eb;
    --coral:    #e06c54;
    --coral-light: #f5e8e5;
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

  /* ── HEADER ── */
  .pp-header {
    background: linear-gradient(135deg, var(--teal-900) 0%, var(--teal-800) 60%, var(--teal-700) 100%);
    padding: 72px 24px 64px;
    position: relative;
    overflow: hidden;
  }
  .pp-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .pp-header-inner {
    max-width: 900px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }
  .pp-badge {
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
  .pp-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(36px, 6vw, 56px);
    color: #fff;
    line-height: 1.1;
    margin-bottom: 16px;
  }
  .pp-subtitle {
    font-size: 17px;
    color: rgba(255,255,255,0.7);
    max-width: 560px;
    line-height: 1.6;
    margin-bottom: 28px;
  }
  .pp-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }
  .pp-meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: rgba(255,255,255,0.65);
  }
  .pp-meta-item span { color: rgba(255,255,255,0.9); font-weight: 500; }

  /* ── LAYOUT ── */
  .pp-layout {
    max-width: 1140px;
    margin: 0 auto;
    padding: 48px 24px 80px;
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 40px;
    align-items: start;
  }
  @media (max-width: 860px) {
    .pp-layout { grid-template-columns: 1fr; }
    .pp-toc { display: none; }
  }

  /* ── TABLE OF CONTENTS ── */
  .pp-toc {
    position: sticky;
    top: 24px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    box-shadow: var(--shadow);
  }
  .pp-toc-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 16px;
  }
  .pp-toc-list { list-style: none; }
  .pp-toc-item { margin-bottom: 4px; }
  .pp-toc-link {
    display: block;
    padding: 7px 10px;
    border-radius: var(--radius-sm);
    font-size: 13px;
    font-weight: 400;
    color: var(--text-secondary);
    text-decoration: none;
    transition: all 0.2s;
    border-left: 2px solid transparent;
  }
  .pp-toc-link:hover, .pp-toc-link.active {
    background: var(--teal-50);
    color: var(--teal-800);
    border-left-color: var(--teal-600);
    font-weight: 500;
  }

  /* ── CONTENT ── */
  .pp-content { min-width: 0; }

  .pp-section {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 36px 40px;
    margin-bottom: 20px;
    box-shadow: var(--shadow);
    scroll-margin-top: 24px;
    animation: fadeUp 0.4s ease both;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @media (max-width: 600px) { .pp-section { padding: 24px 20px; } }

  .pp-section-number {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--coral);
    margin-bottom: 8px;
  }
  .pp-section-title {
    font-family: 'DM Serif Display', serif;
    font-size: 26px;
    color: var(--teal-900);
    margin-bottom: 20px;
    line-height: 1.2;
  }
  .pp-section p {
    font-size: 15px;
    color: var(--text-secondary);
    margin-bottom: 14px;
    line-height: 1.75;
  }
  .pp-section p:last-child { margin-bottom: 0; }

  .pp-subsection-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--teal-800);
    margin: 24px 0 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .pp-subsection-title::before {
    content: '';
    display: block;
    width: 4px;
    height: 16px;
    background: var(--teal-600);
    border-radius: 2px;
    flex-shrink: 0;
  }

  /* Data table */
  .pp-data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 14px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 1px solid var(--border);
  }
  .pp-data-table th {
    background: var(--teal-50);
    color: var(--teal-800);
    font-weight: 600;
    padding: 11px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .pp-data-table td {
    padding: 11px 16px;
    border-bottom: 1px solid var(--border);
    color: var(--text-secondary);
    vertical-align: top;
  }
  .pp-data-table tr:last-child td { border-bottom: none; }
  .pp-data-table tr:nth-child(even) td { background: #fafbfc; }
  @media (max-width: 600px) {
    .pp-data-table { display: block; overflow-x: auto; }
  }

  /* Alert boxes */
  .pp-alert {
    padding: 16px 20px;
    border-radius: var(--radius-sm);
    margin: 20px 0;
    font-size: 14px;
    line-height: 1.65;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }
  .pp-alert-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .pp-alert.info  { background: var(--teal-50);  border: 1px solid var(--teal-100); color: var(--teal-800); }
  .pp-alert.warn  { background: #fff8ec;          border: 1px solid #f5dfa0;        color: #7a5a10; }
  .pp-alert.coral { background: var(--coral-light); border: 1px solid #f0c8bf;     color: #7a2e1e; }

  /* Tag list */
  .pp-tag-list { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
  .pp-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
    background: var(--teal-50);
    color: var(--teal-800);
    border: 1px solid var(--teal-100);
  }

  /* UL styling */
  .pp-ul {
    list-style: none;
    margin: 12px 0 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .pp-ul li {
    display: flex;
    gap: 10px;
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.6;
  }
  .pp-ul li::before {
    content: '→';
    color: var(--teal-600);
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* OL styling */
  .pp-ol {
    list-style: none;
    counter-reset: pp-ol;
    margin: 12px 0 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .pp-ol li {
    counter-increment: pp-ol;
    display: flex;
    gap: 12px;
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.6;
  }
  .pp-ol li::before {
    content: counter(pp-ol);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--teal-800);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* Contact card */
  .pp-contact-card {
    background: linear-gradient(135deg, var(--teal-50) 0%, #e8f6fa 100%);
    border: 1px solid var(--teal-100);
    border-radius: var(--radius);
    padding: 28px 32px;
    margin-top: 20px;
  }
  .pp-contact-card h3 {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    color: var(--teal-900);
    margin-bottom: 16px;
  }
  .pp-contact-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    font-size: 14px;
    color: var(--text-secondary);
  }
  .pp-contact-row a {
    color: var(--teal-700);
    font-weight: 500;
    text-decoration: none;
  }
  .pp-contact-row a:hover { text-decoration: underline; }

  /* Last updated bar */
  .pp-footer-bar {
    background: var(--teal-900);
    color: rgba(255,255,255,0.5);
    text-align: center;
    padding: 24px;
    font-size: 13px;
  }
  .pp-footer-bar a { color: rgba(255,255,255,0.7); text-decoration: none; }
  .pp-footer-bar a:hover { color: #fff; }

  /* Platform chips */
  .pp-platforms {
    display: flex;
    gap: 10px;
    margin-top: 8px;
    flex-wrap: wrap;
  }
  .pp-platform-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .pp-platform-chip.ios  { background: #f0f0f5; color: #1c1c1e; border: 1px solid #ddd; }
  .pp-platform-chip.android { background: #e8f5e9; color: #1b5e20; border: 1px solid #c8e6c9; }

  /* Highlight box */
  .pp-highlight {
    background: linear-gradient(135deg, var(--teal-900) 0%, var(--teal-800) 100%);
    border-radius: var(--radius);
    padding: 28px 32px;
    color: #fff;
    margin: 20px 0;
  }
  .pp-highlight h3 {
    font-family: 'DM Serif Display', serif;
    font-size: 20px;
    margin-bottom: 12px;
    color: #fff;
  }
  .pp-highlight p { color: rgba(255,255,255,0.8); font-size: 14px; margin-bottom: 8px; }
  .pp-highlight ul { list-style: none; display: flex; flex-direction: column; gap: 6px; }
  .pp-highlight ul li { color: rgba(255,255,255,0.75); font-size: 14px; display: flex; gap: 8px; }
  .pp-highlight ul li::before { content: '✓'; color: #7dd3c5; font-weight: 700; flex-shrink: 0; }

  hr.pp-divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 24px 0;
  }

  .pp-effective { 
    display: inline-block;
    background: var(--teal-100);
    color: var(--teal-800);
    border-radius: 6px;
    padding: 2px 10px;
    font-size: 13px;
    font-weight: 600;
    margin-left: 8px;
  }
`;

const CARENEST_EMAIL = "carenest@bishalbudhathoki.com";
const SUPPORT_MAILTO = `mailto:${CARENEST_EMAIL}?subject=${encodeURIComponent("CareNest Support Request")}`;
const PRIVACY_MAILTO = `mailto:${CARENEST_EMAIL}?subject=${encodeURIComponent("CareNest Privacy Request")}`;

// ─── Section IDs ──────────────────────────────────────────────────────────────
const sections = [
  { id: "overview",       label: "Overview" },
  { id: "information",   label: "Information We Collect" },
  { id: "how-we-use",    label: "How We Use Your Data" },
  { id: "storage",       label: "Data Storage & Security" },
  { id: "sharing",       label: "Data Sharing" },
  { id: "location",      label: "Location Tracking" },
  { id: "your-rights",   label: "Your Rights" },
  { id: "retention",     label: "Data Retention" },
  { id: "children",      label: "Children's Privacy" },
  { id: "cross-border",  label: "Cross-Border Disclosure" },
  { id: "changes",       label: "Policy Changes" },
  { id: "contact",       label: "Contact Us" },
];

export default function CareNestPrivacyPolicy() {
  const [activeId, setActiveId] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{css}</style>

      {/* ── HEADER ── */}
      <header className="pp-header">
        <div className="pp-header-inner">
          <div className="pp-badge">🔒 Privacy Policy</div>
          <h1 className="pp-title">Your Privacy Matters to Us</h1>
          <p className="pp-subtitle">
            CareNest is built for NDIS businesses and the care workers who power them.
            This policy explains exactly what data we collect, why, and how it's protected.
          </p>
          <div className="pp-meta">
            <div className="pp-meta-item">📅 Effective: <span>1 July 2025</span></div>
            <div className="pp-meta-item">🔄 Last updated: <span>23 March 2026</span></div>
            <div className="pp-meta-item">🇦🇺 Jurisdiction: <span>Australia</span></div>
          </div>
          <div className="pp-platforms">
            <span className="pp-platform-chip ios">🍎 iOS (App Store)</span>
            <span className="pp-platform-chip android">🤖 Android (Google Play)</span>
          </div>
        </div>
      </header>

      {/* ── LAYOUT ── */}
      <div className="pp-layout">

        {/* Table of Contents */}
        <aside className="pp-toc">
          <p className="pp-toc-title">Contents</p>
          <ul className="pp-toc-list">
            {sections.map(({ id, label }) => (
              <li key={id} className="pp-toc-item">
                <a
                  href={`#${id}`}
                  className={`pp-toc-link${activeId === id ? " active" : ""}`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Content */}
        <main className="pp-content">

          {/* ── 1. OVERVIEW ── */}
          <section id="overview" className="pp-section">
            <p className="pp-section-number">Section 01</p>
            <h2 className="pp-section-title">Overview &amp; Who We Are</h2>
            <p>
              CareNest ("<strong>we</strong>", "<strong>us</strong>", "<strong>our</strong>") is a mobile
              and web platform designed exclusively for registered NDIS (National Disability Insurance
              Scheme) service providers in Australia. CareNest helps NDIS businesses manage client and
              employee onboarding, rostering, communications, invoicing, and payroll.
            </p>
            <p>
              This Privacy Policy applies to all users of the CareNest application, including business
              administrators, support workers (employees), and NDIS participants (clients). It applies to
              all platforms on which CareNest is available.
            </p>

            <div className="pp-highlight">
              <h3>Our Core Privacy Commitments</h3>
              <ul>
                <li>We never sell your personal data to third parties</li>
                <li>We never share your data with advertisers</li>
                <li>Employee location tracking is always opt-in and controlled by the employee</li>
                <li>All data is stored using enterprise-grade encrypted infrastructure</li>
                <li>You have the right to access, correct, or delete your data at any time</li>
                <li>We comply with the Australian Privacy Act 1988 and all 13 Australian Privacy Principles</li>
              </ul>
            </div>

            <p>
              By downloading, installing, or using CareNest, you agree to the collection and use of
              information in accordance with this policy. If you do not agree, please do not use the app.
            </p>

            <div className="pp-alert info">
              <span className="pp-alert-icon">ℹ️</span>
              <div>
                CareNest is not directed at individuals under 18 years of age. All users must be adults
                employed by or receiving services from a registered NDIS provider.
              </div>
            </div>
          </section>

          {/* ── 2. INFORMATION WE COLLECT ── */}
          <section id="information" className="pp-section">
            <p className="pp-section-number">Section 02</p>
            <h2 className="pp-section-title">Information We Collect</h2>
            <p>
              We collect only the information necessary to provide CareNest's core services. The categories
              below apply across different user types — not all categories apply to every user.
            </p>

            <h3 className="pp-subsection-title">Account &amp; Identity Information</h3>
            <p>Collected from all users during registration and onboarding:</p>
            <ul className="pp-ul">
              <li>Full legal name</li>
              <li>Email address and phone number</li>
              <li>Profile photo (optional)</li>
              <li>NDIS registration or worker screening number (where applicable)</li>
              <li>Date of birth and gender (for NDIS compliance purposes)</li>
              <li>Emergency contact details</li>
            </ul>

            <h3 className="pp-subsection-title">Employment &amp; Client Information</h3>
            <ul className="pp-ul">
              <li>Employment type, role, qualifications, and availability</li>
              <li>Signed service agreements and care plans</li>
              <li>Incident reports and shift notes</li>
              <li>Roster data (scheduled and completed shifts)</li>
              <li>NDIS plan details, support categories, and funding budgets (clients)</li>
            </ul>

            <h3 className="pp-subsection-title">Financial Information</h3>
            <div className="pp-alert warn">
              <span className="pp-alert-icon">⚠️</span>
              <div>
                Financial data is collected to generate invoices for clients and process payslips for
                employees. This data is treated as sensitive and is encrypted at rest and in transit.
              </div>
            </div>
            <ul className="pp-ul">
              <li>Bank account details (BSB and account number) for payroll disbursement</li>
              <li>Tax File Number (TFN) for payroll compliance — stored with elevated encryption</li>
              <li>Superannuation fund details</li>
              <li>NDIS claim references and invoice identifiers</li>
              <li>Payment history and receipt records</li>
            </ul>

            <h3 className="pp-subsection-title">Documents &amp; Media</h3>
            <ul className="pp-ul">
              <li>Identity verification documents (e.g., passport, driver's licence — front/back scans)</li>
              <li>NDIS Worker Screening Check and Working With Children Check</li>
              <li>Professional certificates and qualifications</li>
              <li>Photos used in incident reports or progress notes</li>
            </ul>

            <h3 className="pp-subsection-title">Location Data (GPS)</h3>
            <div className="pp-alert coral">
              <span className="pp-alert-icon">📍</span>
              <div>
                <strong>Employee GPS tracking is entirely opt-in.</strong> Employees must explicitly enable
                location sharing in their app settings. This can be disabled at any time. Clients may
                view an employee's location only when the employee has consented. See Section 06 for full details.
              </div>
            </div>
            <ul className="pp-ul">
              <li>Precise GPS coordinates during active shift clock-in (opt-in employees only)</li>
              <li>Location history for the duration of an active shift</li>
              <li>Approximate location for check-in verification (required for all users)</li>
            </ul>

            <h3 className="pp-subsection-title">Device &amp; Technical Information</h3>
            <ul className="pp-ul">
              <li>Push notification token (FCM/APNs) for shift reminders and alerts</li>
              <li>Device type, OS version, and app version</li>
              <li>IP address (for security logging)</li>
              <li>App usage analytics (anonymised, for performance improvement)</li>
            </ul>

            <hr className="pp-divider" />

            <table className="pp-data-table">
              <thead>
                <tr>
                  <th>Data Category</th>
                  <th>Applies To</th>
                  <th>Google Play Label</th>
                  <th>Required?</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Personal identifiers", "All users", "Personal info", "Yes"],
                  ["Financial / payment info", "Employees & Clients", "Financial info", "Yes"],
                  ["Precise location (GPS)", "Employees (opt-in)", "Location", "No — opt-in"],
                  ["Photos / documents", "All users", "Files & docs / Photos", "Yes"],
                  ["Push notification token", "All users", "Device or other IDs", "Yes"],
                  ["Health / disability info", "Clients", "Health & fitness", "Yes"],
                  ["App activity / usage", "All users", "App activity", "Anonymised"],
                ].map(([cat, who, label, req]) => (
                  <tr key={cat}>
                    <td><strong>{cat}</strong></td>
                    <td>{who}</td>
                    <td>{label}</td>
                    <td>{req}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ── 3. HOW WE USE ── */}
          <section id="how-we-use" className="pp-section">
            <p className="pp-section-number">Section 03</p>
            <h2 className="pp-section-title">How We Use Your Information</h2>
            <p>
              We use collected information exclusively to provide, maintain, and improve CareNest services.
              We operate on the principle of <strong>minimum necessary collection</strong> — we only collect
              what we actually need.
            </p>

            <h3 className="pp-subsection-title">Service Delivery</h3>
            <ul className="pp-ul">
              <li>Facilitating secure onboarding of clients and employees</li>
              <li>Managing and displaying rostered shifts and availability</li>
              <li>Enabling compliant NDIS service agreement management</li>
              <li>Processing and generating invoices for NDIS services rendered</li>
              <li>Generating employee payslips and processing payroll</li>
              <li>Enabling secure messaging between clients, employees, and businesses</li>
            </ul>

            <h3 className="pp-subsection-title">Safety &amp; Compliance</h3>
            <ul className="pp-ul">
              <li>Verifying worker screening and qualification status</li>
              <li>Recording incident reports for NDIS regulatory compliance</li>
              <li>Audit logging for NDIS Quality and Safeguards Commission requirements</li>
              <li>Detecting and preventing fraudulent or unauthorised activity</li>
            </ul>

            <h3 className="pp-subsection-title">Communications</h3>
            <ul className="pp-ul">
              <li>Sending shift reminders and schedule change notifications via push notifications</li>
              <li>Notifying employees and clients of important updates to their service</li>
              <li>Providing in-app messaging and updates from their employer/provider</li>
            </ul>

            <h3 className="pp-subsection-title">Product Improvement</h3>
            <ul className="pp-ul">
              <li>Analysing anonymised, aggregated usage patterns to improve features</li>
              <li>Diagnosing technical errors and performance issues</li>
              <li>Improving accuracy of the invoicing and payroll calculation engine</li>
            </ul>

            <div className="pp-alert info">
              <span className="pp-alert-icon">🛡️</span>
              <div>
                We do <strong>not</strong> use your data for targeted advertising, profiling for commercial
                purposes, or sale to data brokers. CareNest has no advertising model.
              </div>
            </div>
          </section>

          {/* ── 4. STORAGE & SECURITY ── */}
          <section id="storage" className="pp-section">
            <p className="pp-section-number">Section 04</p>
            <h2 className="pp-section-title">Data Storage &amp; Security</h2>
            <p>
              CareNest uses a combination of enterprise-grade cloud infrastructure to store your data.
              All data is encrypted in transit using TLS 1.3 and encrypted at rest using AES-256.
            </p>

            <table className="pp-data-table">
              <thead>
                <tr>
                  <th>Infrastructure</th>
                  <th>Data Stored</th>
                  <th>Location</th>
                  <th>Standards</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Google Cloud Platform", "Authentication, app hosting, email services", "US / Australia", "ISO 27001, SOC 2"],
                  ["Cloudflare R2 Storage", "Uploaded documents, identity scans, photos", "Global (edge)", "ISO 27001, GDPR"],
                  ["MongoDB Atlas", "Structured app data (rosters, notes, messages)", "US / Sydney region", "SOC 2, ISO 27001"],
                ].map(([infra, data, loc, std]) => (
                  <tr key={infra}>
                    <td><strong>{infra}</strong></td>
                    <td>{data}</td>
                    <td>{loc}</td>
                    <td>{std}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="pp-subsection-title">Security Measures</h3>
            <ul className="pp-ul">
              <li>End-to-end encryption for all in-app messages</li>
              <li>Role-based access control — users can only access data relevant to their role</li>
              <li>Multi-factor authentication (MFA) available for all business admin accounts</li>
              <li>Financial data (TFN, bank details) stored with additional field-level encryption</li>
              <li>Regular third-party security audits and penetration testing</li>
              <li>Automatic session timeout after periods of inactivity</li>
              <li>All API communications protected by OAuth 2.0 and signed tokens</li>
            </ul>

            <div className="pp-alert warn">
              <span className="pp-alert-icon">⚠️</span>
              <div>
                In the unlikely event of a data breach that is likely to result in serious harm, we will
                notify affected individuals and the Office of the Australian Information Commissioner (OAIC)
                within 72 hours, in accordance with the Notifiable Data Breaches (NDB) scheme.
              </div>
            </div>
          </section>

          {/* ── 5. SHARING ── */}
          <section id="sharing" className="pp-section">
            <p className="pp-section-number">Section 05</p>
            <h2 className="pp-section-title">Data Sharing</h2>

            <div className="pp-highlight">
              <h3>We Do Not Sell Your Data — Ever</h3>
              <p>
                CareNest does not sell, rent, trade, or transfer your personal information to third parties
                for commercial purposes under any circumstances.
              </p>
            </div>

            <h3 className="pp-subsection-title">Within the App</h3>
            <p>Data is shared between users within the platform only where necessary and appropriate:</p>
            <ul className="pp-ul">
              <li>Business administrators can view employee and client data for their organisation only</li>
              <li>Employees can view their own roster, payslips, and assigned client details</li>
              <li>Clients can view their support schedule and, with employee consent, employee location</li>
              <li>No cross-organisation data sharing occurs</li>
            </ul>

            <h3 className="pp-subsection-title">Infrastructure Sub-processors</h3>
            <p>
              We share data only with the following sub-processors who provide the technical infrastructure
              required to operate CareNest. All have signed Data Processing Agreements (DPAs):
            </p>

            <div className="pp-tag-list">
              <span className="pp-tag">☁️ Google Cloud Platform</span>
              <span className="pp-tag">⚡ Cloudflare</span>
              <span className="pp-tag">🍃 MongoDB Atlas</span>
            </div>

            <h3 className="pp-subsection-title">Legal Disclosure</h3>
            <p>We may disclose personal information without consent only when:</p>
            <ul className="pp-ul">
              <li>Required by Australian law, court order, or regulatory authority</li>
              <li>Required by the NDIS Quality and Safeguards Commission</li>
              <li>Necessary to prevent a serious threat to life, health, or safety</li>
            </ul>

            <h3 className="pp-subsection-title">Business Transfers</h3>
            <p>
              In the event of a merger, acquisition, or sale of CareNest assets, personal data may be
              transferred as part of that transaction. Affected users will be notified prior to any transfer,
              and the incoming party will be bound by this Privacy Policy.
            </p>
          </section>

          {/* ── 6. LOCATION ── */}
          <section id="location" className="pp-section">
            <p className="pp-section-number">Section 06</p>
            <h2 className="pp-section-title">Location Tracking</h2>

            <div className="pp-alert coral">
              <span className="pp-alert-icon">📍</span>
              <div>
                <strong>This section is important. Please read it carefully.</strong> Employee GPS tracking
                is one of CareNest's most sensitive features. We have designed it with privacy as the
                foundational principle.
              </div>
            </div>

            <h3 className="pp-subsection-title">Employee Location — Opt-In Only</h3>
            <p>
              CareNest offers a real-time location tracking feature for employees. Participation is
              <strong> entirely voluntary and controlled by the employee</strong>. Specifically:
            </p>
            <ul className="pp-ul">
              <li>
                Employees must explicitly enable location sharing in their account settings before
                any GPS data is collected
              </li>
              <li>
                Consent can be withdrawn at any time by the employee from Settings → Privacy →
                Location Sharing
              </li>
              <li>
                Disabling location sharing has <strong>no impact</strong> on employment status,
                roster access, or any other app features
              </li>
              <li>Location is only tracked during active, clock-in confirmed shifts</li>
              <li>Location data is not collected in the background when the app is closed or a shift is not active</li>
            </ul>

            <h3 className="pp-subsection-title">Who Can See Location Data</h3>
            <ul className="pp-ul">
              <li>
                <strong>Business administrators</strong> can view the real-time location of employees who
                have opted in, for the purpose of operational oversight and participant safety
              </li>
              <li>
                <strong>Clients (NDIS participants)</strong> can view an employee's location only if the
                employee has opted in <em>and</em> the client has been granted access by the employee
              </li>
              <li>No other parties have access to location data</li>
            </ul>

            <h3 className="pp-subsection-title">Location Data Retention</h3>
            <ul className="pp-ul">
              <li>Active shift location data is retained for 90 days for audit and safety review</li>
              <li>Historical location data is automatically deleted after 90 days</li>
              <li>Employees may request deletion of their location history at any time by contacting support</li>
            </ul>

            <div className="pp-alert info">
              <span className="pp-alert-icon">🍎</span>
              <div>
                On iOS, CareNest requests location permission only when required and uses the "While Using
                the App" permission level for active shift tracking. We never request "Always Allow" location
                access. On Android, foreground location permission is requested only at the point of shift
                clock-in, with clear in-app explanation of why.
              </div>
            </div>
          </section>

          {/* ── 7. YOUR RIGHTS ── */}
          <section id="your-rights" className="pp-section">
            <p className="pp-section-number">Section 07</p>
            <h2 className="pp-section-title">Your Rights Under Australian Privacy Law</h2>
            <p>
              Under the <em>Privacy Act 1988 (Cth)</em> and the Australian Privacy Principles (APPs), you
              have the following rights regarding your personal information:
            </p>

            <h3 className="pp-subsection-title">Right to Access (APP 12)</h3>
            <p>
              You may request a copy of all personal information CareNest holds about you. We will respond
              within 30 days. In most cases this information is accessible directly within the app.
            </p>

            <h3 className="pp-subsection-title">Right to Correction (APP 13)</h3>
            <p>
              If any information we hold about you is inaccurate, incomplete, or out of date, you may
              request a correction at any time, free of charge, through the app's profile settings or
              by contacting our support team.
            </p>

            <h3 className="pp-subsection-title">Right to Deletion</h3>
            <p>
              You may request deletion of your personal data. We will process deletion requests within
              30 days, subject to legal retention obligations (e.g., ATO payroll records must be retained
              for 7 years under Australian taxation law).
            </p>

            <h3 className="pp-subsection-title">Right to Withdraw Consent</h3>
            <p>
              Where processing is based on consent (e.g., location tracking, push notifications), you may
              withdraw consent at any time via in-app settings. Withdrawal does not affect processing
              conducted prior to withdrawal.
            </p>

            <h3 className="pp-subsection-title">Right to Complain</h3>
            <p>
              If you believe we have breached the APPs, you may lodge a complaint with the
              <strong> Office of the Australian Information Commissioner (OAIC)</strong>:
            </p>
            <ul className="pp-ul">
              <li>Website: <a href="https://www.oaic.gov.au" target="_blank" rel="noreferrer">www.oaic.gov.au</a></li>
              <li>Phone: 1300 363 992</li>
            </ul>
            <p>
              We ask that you contact us first to give us the opportunity to resolve any concern directly.
            </p>

            <h3 className="pp-subsection-title">How to Exercise Your Rights</h3>
            <ol className="pp-ol">
              <li>Use the in-app settings under <strong>Account → Privacy</strong> for common requests</li>
              <li>Email our Privacy Officer via <a href={PRIVACY_MAILTO}>Contact Privacy Officer</a></li>
              <li>We will acknowledge your request within 5 business days and respond fully within 30 days</li>
            </ol>
          </section>

          {/* ── 8. RETENTION ── */}
          <section id="retention" className="pp-section">
            <p className="pp-section-number">Section 08</p>
            <h2 className="pp-section-title">Data Retention</h2>
            <p>
              We retain personal data only for as long as necessary to provide our services and comply with
              legal obligations. The following retention schedules apply:
            </p>

            <table className="pp-data-table">
              <thead>
                <tr>
                  <th>Data Type</th>
                  <th>Retention Period</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Account data", "Duration of account + 2 years", "Service continuity"],
                  ["Payroll & financial records", "7 years", "ATO / Fair Work Act requirement"],
                  ["NDIS service records", "7 years", "NDIS regulatory requirement"],
                  ["Incident reports", "7 years", "NDIS compliance & potential liability"],
                  ["GPS location history", "90 days", "Safety review, then auto-deleted"],
                  ["Push notification tokens", "Until account deletion or device change", "Notification delivery"],
                  ["Identity documents", "Duration of employment/enrolment + 1 year", "Regulatory compliance"],
                  ["Anonymised analytics", "Indefinite", "Product improvement (no personal data)"],
                ].map(([type, period, reason]) => (
                  <tr key={type}>
                    <td><strong>{type}</strong></td>
                    <td>{period}</td>
                    <td>{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pp-alert info">
              <span className="pp-alert-icon">🗑️</span>
              <div>
                When you delete your account, all personal data not subject to a legal retention obligation
                is permanently deleted within 30 days. Anonymised, non-identifiable data may be retained for
                analytics purposes.
              </div>
            </div>
          </section>

          {/* ── 9. CHILDREN ── */}
          <section id="children" className="pp-section">
            <p className="pp-section-number">Section 09</p>
            <h2 className="pp-section-title">Children's Privacy</h2>
            <p>
              CareNest is intended exclusively for use by adults (18 years of age or older) in a professional
              capacity as NDIS business operators, support workers, or adult NDIS participants.
            </p>
            <p>
              We do not knowingly collect personal information from individuals under the age of 18. If we
              become aware that we have inadvertently collected information from a minor, we will promptly
              delete it. If you believe a minor has provided us with personal information, please contact
              us immediately via <a href={PRIVACY_MAILTO}>Contact Privacy Officer</a>.
            </p>
          </section>

          {/* ── 10. CROSS-BORDER ── */}
          <section id="cross-border" className="pp-section">
            <p className="pp-section-number">Section 10</p>
            <h2 className="pp-section-title">Cross-Border Disclosure (APP 8)</h2>
            <p>
              Under APP 8 of the Australian Privacy Act, we are required to disclose that some personal
              information may be transferred to and stored overseas, specifically with our infrastructure
              providers:
            </p>

            <table className="pp-data-table">
              <thead>
                <tr>
                  <th>Provider</th>
                  <th>Country</th>
                  <th>Safeguard</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Google Cloud Platform", "United States (+ Sydney region)", "GDPR compliance, DPA signed, ISO 27001"],
                  ["Cloudflare R2", "United States / Global edge", "GDPR compliance, DPA signed, ISO 27001"],
                  ["MongoDB Atlas", "United States (+ AP-Sydney region)", "SOC 2 Type II, DPA signed, ISO 27001"],
                ].map(([p, c, s]) => (
                  <tr key={p}><td><strong>{p}</strong></td><td>{c}</td><td>{s}</td></tr>
                ))}
              </tbody>
            </table>

            <p>
              Each provider has executed Data Processing Agreements that require them to handle your data
              in accordance with privacy standards substantially similar to the Australian Privacy Principles.
              Where possible, we configure our services to preferentially store data in Australian or
              Asia-Pacific regions.
            </p>
          </section>

          {/* ── 11. CHANGES ── */}
          <section id="changes" className="pp-section">
            <p className="pp-section-number">Section 11</p>
            <h2 className="pp-section-title">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices,
              legal requirements, or new features. When we make material changes, we will:
            </p>
            <ul className="pp-ul">
              <li>Post the updated policy at this URL with a revised "Last updated" date</li>
              <li>Send an in-app notification to all active users</li>
              <li>For significant changes, send an email notification and require re-acknowledgement</li>
            </ul>
            <p>
              Your continued use of CareNest after the effective date of a revised policy constitutes
              acceptance of the updated terms. We encourage you to review this page periodically.
            </p>
          </section>

          {/* ── 12. CONTACT ── */}
          <section id="contact" className="pp-section">
            <p className="pp-section-number">Section 12</p>
            <h2 className="pp-section-title">Contact Us</h2>
            <p>
              For any privacy-related inquiries, requests, or concerns, please contact our Privacy Officer.
              We take all privacy matters seriously and will respond within 5 business days.
            </p>

            <div className="pp-contact-card">
              <h3>CareNest Privacy &amp; Support</h3>
              <div className="pp-contact-row">
                📧 Privacy inquiries:&nbsp;
                <a href={PRIVACY_MAILTO}>Contact Privacy Officer</a>
              </div>
              <div className="pp-contact-row">
                🛟 General support:&nbsp;
                <a href={SUPPORT_MAILTO}>{CARENEST_EMAIL}</a>
              </div>
              <div className="pp-contact-row">
                🌐 Support portal:&nbsp;
                <a href="https://bishalbudhathoki.com/carenest/support">bishalbudhathoki.com/carenest/support</a>
              </div>
              <div className="pp-contact-row">
                🇦🇺 Jurisdiction: Australia (Privacy Act 1988)
              </div>
            </div>

            <div className="pp-alert info" style={{ marginTop: 20 }}>
              <span className="pp-alert-icon">📋</span>
              <div>
                If you are unsatisfied with our response, you may contact the{" "}
                <strong>Office of the Australian Information Commissioner (OAIC)</strong> at{" "}
                <a href="https://www.oaic.gov.au" target="_blank" rel="noreferrer">www.oaic.gov.au</a>{" "}
                or by calling <strong>1300 363 992</strong>.
              </div>
            </div>
          </section>

        </main>
      </div>

      <footer className="pp-footer-bar">
        © {new Date().getFullYear()} CareNest. All rights reserved. &nbsp;|&nbsp;{" "}
        <a href="/carenest/support">Support</a> &nbsp;|&nbsp;{" "}
        <a href={PRIVACY_MAILTO}>Contact Privacy Officer</a>
      </footer>
    </>
  );
}
