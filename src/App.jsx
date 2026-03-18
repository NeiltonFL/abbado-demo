import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ============================================================
// ABBADO — Law Firm Management & AI Orchestrator
// Named for Claudio Abbado, the maestro who conducted with
// invisible precision. Every piece of your firm, in harmony.
//
// ZERO hardcoded values. All config-driven.
// ============================================================

// ---- CONFIGURATION (all runtime-configurable) ----
const CONFIG = {
  app: {
    name: "Abbado",
    tagline: "Orchestrating Legal Excellence",
    version: "0.1.0",
  },
  firm: {
    name: typeof window !== "undefined" && window.__ABBADO_FIRM_NAME__ || "Founders Law",
    matterPrefix: typeof window !== "undefined" && window.__ABBADO_MATTER_PREFIX__ || "FL",
  },
  ai: {
    provider: typeof window !== "undefined" && window.__ABBADO_AI_PROVIDER__ || "anthropic",
    model: "claude-sonnet-4-20250514",
    systemPrompt: `You are Abbado, an AI legal operations assistant embedded in a law firm management platform. You have access to the firm's client data, matter details, documents, time entries, and billing information. You answer questions about matters, clients, billing status, document locations, and firm operations. Be precise, cite matter numbers and invoice numbers when relevant. Never fabricate data — only reference what's in your context. You can also reference knowledge from connected tools like Guru (firm playbooks), Gmail, and Granola (meeting notes) when the user asks about those.`,
  },
  integrations: {
    mcp: [
      { name: "Guru", desc: "Firm playbooks & knowledge base", icon: "book", connected: true },
      { name: "Gmail", desc: "Email search & context", icon: "mail", connected: true },
      { name: "Granola", desc: "Meeting notes & transcripts", icon: "mic", connected: true },
      { name: "Google Drive", desc: "Shared document access", icon: "drive", connected: false },
    ],
  },
};

// ---- DESIGN TOKENS (Founders Law Brand Palette) ----
// Primary Dark Green: #213B2B | Primary Light Green: #3F7653
// Lime Highlight: #E1E552 | Turquoise: #4A99A7
// Charcoal: #3F4042 | Light Gray: #DFDFDF | Cream: #FCF8F1
const T = {
  bg: "#FCF8F1",           // Cream — primary background
  bgSubtle: "#F5F0E7",     // Slightly deeper cream for sidebar
  surface: "#FFFFFF",       // White — cards and surfaces
  surfaceRaised: "#F8F5EE",// Warm off-white for hover states
  surfaceHover: "#F2EDE4", // Hover on interactive surfaces
  card: "#FFFFFF",          // Cards
  border: "#DFDFDF",       // Light gray borders
  borderSubtle: "#E8E3DA", // Subtle warm borders
  borderFocus: "#3F7653",  // Light green focus ring
  text: "#213B2B",         // Dark green — primary text
  textSecondary: "#3F4042",// Charcoal — secondary text
  textTertiary: "#7A7C80", // Mid gray — tertiary text
  textDim: "#ABADB2",      // Dim labels
  gold: "#213B2B",         // Dark green as primary accent (replaces gold)
  goldLight: "#3F7653",    // Light green — active states
  goldBg: "rgba(63,118,83,0.08)",      // Light green tint bg
  goldBgHover: "rgba(63,118,83,0.14)", // Light green hover bg
  blue: "#4A99A7",         // Turquoise (brand secondary)
  blueBg: "rgba(74,153,167,0.1)",
  green: "#3F7653",        // Light green — success
  greenBg: "rgba(63,118,83,0.1)",
  red: "#C0392B",          // Refined red — errors/overdue
  redBg: "rgba(192,57,43,0.08)",
  orange: "#D4851F",       // Warm amber — warnings
  orangeBg: "rgba(212,133,31,0.08)",
  purple: "#6B5B95",       // Muted purple — practice area badges
  purpleBg: "rgba(107,91,149,0.08)",
  cyan: "#4A99A7",         // Turquoise
  cyanBg: "rgba(74,153,167,0.08)",
  lime: "#E1E552",         // Lime highlight (brand accent)
  limeBg: "rgba(225,229,82,0.15)",
  font: "'DM Sans', 'Manrope', system-ui, sans-serif",
  fontDisplay: "'Playfair Display', 'Georgia', serif",
  mono: "'IBM Plex Mono', 'SF Mono', monospace",
  radius: "6px",
  radiusMd: "10px",
  radiusLg: "14px",
};

// ---- SVG ICON SYSTEM ----
const ICON_PATHS = {
  dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1",
  clients: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
  matters: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
  documents: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  time: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  billing: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  plus: "M12 6v12m6-6H6",
  x: "M6 18L18 6M6 6l12 12",
  check: "M5 13l4 4L19 7",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  chevronRight: "M9 5l7 7-7 7",
  chevronLeft: "M15 19l-7-7 7-7",
  chevronDown: "M19 9l-7 7-7-7",
  arrowLeft: "M10 19l-7-7m0 0l7-7m-7 7h18",
  upload: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12",
  download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  play: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  stop: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
  ai: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  api: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  user: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
  building: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  comment: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
  version: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
  filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
  tag: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
  calendar: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  mic: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z",
  book: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  drive: "M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7",
  link: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  send: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
  sparkle: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  globe: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
  external: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  alert: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
};

const Icon = ({ name, size = 18, color = T.textTertiary, style: s }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={s}>
    <path d={ICON_PATHS[name] || ""} />
  </svg>
);

// ---- MOCK DATA STORE (simulates API responses) ----
const DB = {
  users: [
    { id: "u1", firstName: "Sarah", lastName: "Chen", email: "sarah.chen@founderslaw.com", role: "partner", hourlyRate: 450, barNumber: "CA-12345" },
    { id: "u2", firstName: "Marcus", lastName: "Williams", email: "marcus.williams@founderslaw.com", role: "associate", hourlyRate: 325, barNumber: "CA-67890" },
    { id: "u3", firstName: "Priya", lastName: "Patel", email: "priya.patel@founderslaw.com", role: "paralegal", hourlyRate: 175 },
    { id: "u4", firstName: "David", lastName: "Kim", email: "david.kim@founderslaw.com", role: "associate", hourlyRate: 300, barNumber: "CA-54321" },
  ],
  clients: [
    { id: "c1", type: "entity", name: "TechVenture Inc.", email: "legal@techventure.com", phone: "(415) 555-0100", status: "active", originatingAttorneyId: "u1", notes: "Series B startup. Primary contact: CEO Jamie Park.", address: { street1: "100 Innovation Way", city: "San Francisco", state: "CA", zip: "94105" }, createdAt: "2025-08-10" },
    { id: "c2", type: "individual", name: "Amir Sharma", email: "amir.sharma@gmail.com", phone: "(415) 555-0200", status: "active", originatingAttorneyId: "u1", notes: "H-1B visa holder seeking EB-2 green card.", address: { street1: "250 Market St, Apt 12B", city: "San Francisco", state: "CA", zip: "94103" }, createdAt: "2026-01-05" },
    { id: "c3", type: "entity", name: "GreenLeaf Properties LLC", email: "info@greenleafprops.com", phone: "(510) 555-0300", status: "active", originatingAttorneyId: "u1", notes: "Commercial real estate portfolio. Expanding into South Bay.", createdAt: "2025-12-01" },
    { id: "c4", type: "entity", name: "Cascade Biotech", email: "legal@cascadebio.com", phone: "(206) 555-0400", status: "prospective", originatingAttorneyId: "u2", notes: "Pre-Series A biotech. Referred by TechVenture.", createdAt: "2026-03-01" },
    { id: "c5", type: "individual", name: "Elena Rodriguez", email: "elena.r@outlook.com", phone: "(408) 555-0500", status: "archived", originatingAttorneyId: "u1", notes: "Estate planning completed.", createdAt: "2024-06-15" },
  ],
  matters: [
    { id: "m1", clientId: "c1", matterNumber: "FL-2026-0001", name: "Series B Financing", description: "Representation in $25M Series B preferred stock financing. Lead investor: Sequoia.", practiceArea: "corporate", status: "open", billingType: "hourly", responsibleAttorneyId: "u1", openDate: "2026-01-15", tags: ["financing", "preferred-stock", "series-b"] },
    { id: "m2", clientId: "c2", matterNumber: "FL-2026-0002", name: "H-1B to EB-2 Green Card", description: "Employment-based green card application via EB-2 NIW pathway.", practiceArea: "immigration", status: "open", billingType: "flat_fee", responsibleAttorneyId: "u2", openDate: "2026-02-01", tags: ["immigration", "eb2", "niw", "green-card"] },
    { id: "m3", clientId: "c3", matterNumber: "FL-2026-0003", name: "Commercial Lease — 500 Howard", description: "Negotiating 10-year commercial lease for new office at 500 Howard St.", practiceArea: "real_estate", status: "open", billingType: "hourly", responsibleAttorneyId: "u1", openDate: "2026-02-20", tags: ["lease", "commercial", "negotiation"] },
    { id: "m4", clientId: "c1", matterNumber: "FL-2026-0004", name: "Employment Agreements", description: "Drafting executive employment agreements for VP Engineering and VP Sales hires.", practiceArea: "employment", status: "open", billingType: "hourly", responsibleAttorneyId: "u4", openDate: "2026-03-01", tags: ["employment", "executive", "agreements"] },
    { id: "m5", clientId: "c1", matterNumber: "FL-2025-0009", name: "Series A Financing", description: "Completed Series A round. $8M raised.", practiceArea: "corporate", status: "closed", billingType: "hourly", responsibleAttorneyId: "u1", openDate: "2025-06-01", closeDate: "2025-10-15", tags: ["financing", "series-a", "completed"] },
    { id: "m6", clientId: "c3", matterNumber: "FL-2025-0012", name: "Property Acquisition — Palo Alto", description: "Acquisition of commercial property at 200 University Ave.", practiceArea: "real_estate", status: "closed", billingType: "hourly", responsibleAttorneyId: "u1", openDate: "2025-09-01", closeDate: "2026-01-20", tags: ["acquisition", "commercial"] },
  ],
  documents: [
    { id: "d1", matterId: "m1", title: "Series B Term Sheet (Markup v3)", category: "contract", description: "Third markup of Sequoia term sheet with board composition revisions.", tags: ["term-sheet", "markup", "sequoia"], createdById: "u1", currentVersion: { versionNumber: 3, fileName: "TermSheet_v3_markup.docx", fileSize: 245000, createdAt: "2026-03-10" }, versionCount: 3, commentCount: 5, updatedAt: "2026-03-10" },
    { id: "d2", matterId: "m1", title: "Stock Purchase Agreement", category: "contract", description: "Draft SPA covering sections 1-8.", tags: ["spa", "draft", "financing"], createdById: "u2", currentVersion: { versionNumber: 2, fileName: "SPA_v2_draft.docx", fileSize: 520000, createdAt: "2026-03-08" }, versionCount: 2, commentCount: 3, updatedAt: "2026-03-08" },
    { id: "d3", matterId: "m1", title: "Investor Rights Agreement", category: "contract", description: "IRA with registration rights and information rights.", tags: ["ira", "investor-rights"], createdById: "u1", currentVersion: { versionNumber: 1, fileName: "IRA_draft.docx", fileSize: 380000, createdAt: "2026-03-05" }, versionCount: 1, commentCount: 0, updatedAt: "2026-03-05" },
    { id: "d4", matterId: "m1", title: "Due Diligence Memo", category: "memo", description: "Summary of corporate formation and IP assignment due diligence findings.", tags: ["due-diligence", "memo", "ip"], createdById: "u3", currentVersion: { versionNumber: 1, fileName: "DD_Memo_TechVenture.pdf", fileSize: 890000, createdAt: "2026-03-04" }, versionCount: 1, commentCount: 1, updatedAt: "2026-03-04" },
    { id: "d5", matterId: "m1", title: "Cap Table (Pre/Post)", category: "other", description: "Cap table showing pre and post Series B ownership.", tags: ["cap-table", "ownership"], createdById: "u3", currentVersion: { versionNumber: 4, fileName: "CapTable_SeriesB_v4.xlsx", fileSize: 125000, createdAt: "2026-03-09" }, versionCount: 4, commentCount: 2, updatedAt: "2026-03-09" },
    { id: "d6", matterId: "m2", title: "I-140 Petition", category: "filing", description: "Immigration petition for EB-2 NIW classification.", tags: ["i-140", "petition", "niw"], createdById: "u2", currentVersion: { versionNumber: 1, fileName: "I140_Petition_Sharma.pdf", fileSize: 1200000, createdAt: "2026-03-05" }, versionCount: 1, commentCount: 0, updatedAt: "2026-03-05" },
    { id: "d7", matterId: "m2", title: "Support Letter — Dr. Wilson", category: "correspondence", description: "Expert recommendation letter from Stanford professor.", tags: ["support-letter", "recommendation"], createdById: "u2", currentVersion: { versionNumber: 2, fileName: "SupportLetter_Wilson_v2.pdf", fileSize: 340000, createdAt: "2026-03-07" }, versionCount: 2, commentCount: 1, updatedAt: "2026-03-07" },
    { id: "d8", matterId: "m3", title: "Lease Agreement (Draft)", category: "contract", description: "Initial draft of 10-year commercial lease at 500 Howard.", tags: ["lease", "draft", "commercial"], createdById: "u1", currentVersion: { versionNumber: 1, fileName: "Lease_500Howard_Draft.docx", fileSize: 450000, createdAt: "2026-03-06" }, versionCount: 1, commentCount: 0, updatedAt: "2026-03-06" },
    { id: "d9", matterId: "m3", title: "Environmental Assessment", category: "other", description: "Phase I environmental site assessment report.", tags: ["environmental", "assessment", "phase-1"], createdById: "u3", currentVersion: { versionNumber: 1, fileName: "EnvAssessment_500Howard.pdf", fileSize: 2100000, createdAt: "2026-02-28" }, versionCount: 1, commentCount: 0, updatedAt: "2026-02-28" },
    { id: "d10", matterId: "m4", title: "VP Engineering Employment Agreement", category: "contract", description: "Executive employment agreement with equity provisions.", tags: ["employment", "executive", "equity"], createdById: "u4", currentVersion: { versionNumber: 2, fileName: "EmpAgreement_VPEng_v2.docx", fileSize: 290000, createdAt: "2026-03-11" }, versionCount: 2, commentCount: 1, updatedAt: "2026-03-11" },
  ],
  timeEntries: [
    { id: "t1", matterId: "m1", userId: "u1", date: "2026-03-11", durationMinutes: 120, description: "Reviewed and revised investor rights agreement anti-dilution provisions", billable: true, status: "draft", rateAtEntry: 450 },
    { id: "t2", matterId: "m1", userId: "u1", date: "2026-03-10", durationMinutes: 90, description: "Call with Sequoia counsel re: board composition and protective provisions", billable: true, status: "submitted", rateAtEntry: 450 },
    { id: "t3", matterId: "m1", userId: "u2", date: "2026-03-09", durationMinutes: 180, description: "Drafted Stock Purchase Agreement sections 5-8 (representations & warranties)", billable: true, status: "approved", rateAtEntry: 325 },
    { id: "t4", matterId: "m1", userId: "u3", date: "2026-03-08", durationMinutes: 60, description: "Updated cap table with Series B terms and option pool expansion", billable: true, status: "approved", rateAtEntry: 175 },
    { id: "t5", matterId: "m3", userId: "u1", date: "2026-03-07", durationMinutes: 90, description: "Initial lease review and competitive term comparison with market data", billable: true, status: "approved", rateAtEntry: 450 },
    { id: "t6", matterId: "m4", userId: "u4", date: "2026-03-11", durationMinutes: 150, description: "Drafted VP Engineering employment agreement with equity cliff/vesting provisions", billable: true, status: "draft", rateAtEntry: 300 },
    { id: "t7", matterId: "m2", userId: "u2", date: "2026-03-06", durationMinutes: 180, description: "Prepared I-140 petition narrative and assembled supporting evidence", billable: true, status: "approved", rateAtEntry: 325 },
    { id: "t8", matterId: "m1", userId: "u1", date: "2026-03-06", durationMinutes: 60, description: "Due diligence coordination call with client CFO", billable: true, status: "approved", rateAtEntry: 450 },
    { id: "t9", matterId: "m3", userId: "u1", date: "2026-03-05", durationMinutes: 45, description: "Review environmental assessment report findings", billable: true, status: "approved", rateAtEntry: 450 },
    { id: "t10", matterId: "m4", userId: "u4", date: "2026-03-10", durationMinutes: 120, description: "Research California non-compete enforceability post-2024 changes", billable: true, status: "submitted", rateAtEntry: 300 },
  ],
  invoices: [
    { id: "i1", invoiceNumber: "INV-2026-0001", matterId: "m1", clientId: "c1", status: "sent", issueDate: "2026-02-28", dueDate: "2026-03-30", total: 32250, amountPaid: 19750, balanceDue: 12500 },
    { id: "i2", invoiceNumber: "INV-2026-0002", matterId: "m2", clientId: "c2", status: "paid", issueDate: "2026-02-15", dueDate: "2026-03-15", total: 8500, amountPaid: 8500, balanceDue: 0 },
    { id: "i3", invoiceNumber: "INV-2026-0003", matterId: "m3", clientId: "c3", status: "overdue", issueDate: "2026-01-31", dueDate: "2026-03-02", total: 15200, amountPaid: 10400, balanceDue: 4800 },
    { id: "i4", invoiceNumber: "INV-2026-0004", matterId: "m1", clientId: "c1", status: "draft", issueDate: "2026-03-10", dueDate: "2026-04-09", total: 16500, amountPaid: 0, balanceDue: 16500 },
    { id: "i5", invoiceNumber: "INV-2025-0015", matterId: "m5", clientId: "c1", status: "paid", issueDate: "2025-10-20", dueDate: "2025-11-19", total: 48000, amountPaid: 48000, balanceDue: 0 },
    { id: "i6", invoiceNumber: "INV-2025-0018", matterId: "m6", clientId: "c3", status: "paid", issueDate: "2026-01-25", dueDate: "2026-02-24", total: 22500, amountPaid: 22500, balanceDue: 0 },
  ],
  entities: [
    { id: "e1", clientId: "c1", matterId: "m5", legalName: "TechVenture Inc.", entityType: "corporation", stateOfFormation: "DE", formationDate: "2024-03-15", status: "active", registeredAgentName: "Registered Agents Inc.", officers: [{ name: "Jamie Park", title: "CEO" }, { name: "Riley Chen", title: "CTO" }], jurisdictions: [{ state: "DE", type: "domestic" }, { state: "CA", type: "foreign" }] },
    { id: "e2", clientId: "c1", legalName: "TechVenture IP Holdings LLC", entityType: "llc", stateOfFormation: "DE", formationDate: "2024-09-01", status: "active", registeredAgentName: "Registered Agents Inc.", officers: [{ name: "Jamie Park", title: "Manager" }], jurisdictions: [{ state: "DE", type: "domestic" }] },
    { id: "e3", clientId: "c3", legalName: "GreenLeaf Properties LLC", entityType: "llc", stateOfFormation: "CA", formationDate: "2023-07-20", status: "active", registeredAgentName: "Registered Agents Inc.", officers: [{ name: "David Greenfield", title: "Manager" }], jurisdictions: [{ state: "CA", type: "domestic" }, { state: "FL", type: "foreign" }] },
  ],
  complianceTasks: [
    { id: "ct1", entityId: "e1", taskName: "Delaware Annual Report", dueDate: "2026-03-01", status: "completed", completedDate: "2026-02-15" },
    { id: "ct2", entityId: "e1", taskName: "Delaware Franchise Tax", dueDate: "2026-03-01", status: "completed", completedDate: "2026-02-15" },
    { id: "ct3", entityId: "e1", taskName: "CA Statement of Information", dueDate: "2026-06-01", status: "pending" },
    { id: "ct4", entityId: "e2", taskName: "Delaware LLC Annual Tax ($300)", dueDate: "2026-06-01", status: "pending" },
    { id: "ct5", entityId: "e3", taskName: "CA LLC Annual Tax ($800)", dueDate: "2026-04-15", status: "in_progress", notes: "Payment being processed" },
    { id: "ct6", entityId: "e3", taskName: "FL Annual Report", dueDate: "2026-05-01", status: "pending" },
  ],
  compensationTiers: [
    { id: "tier1", name: "Partner", originationRate: 0.35, productionRate: 0.25, roles: ["partner"] },
    { id: "tier2", name: "Attorney", originationRate: 0.25, productionRate: 0.15, roles: ["senior_associate", "associate", "junior_associate", "of_counsel"] },
    { id: "tier3", name: "Non-Attorney", originationRate: 0.25, productionRate: 0.045, roles: ["paralegal", "billing_manager", "admin"] },
  ],
  originationSplits: [
    { matterId: "m1", splits: [{ userId: "u1", pct: 1.0 }] },
    { matterId: "m2", splits: [{ userId: "u1", pct: 0.7 }, { userId: "u2", pct: 0.3 }] },
    { matterId: "m3", splits: [{ userId: "u1", pct: 1.0 }] },
    { matterId: "m4", splits: [{ userId: "u4", pct: 1.0 }] },
  ],
  conversations: [
    { id: "conv1", matterId: "m1", clientId: "c1", category: "matter", subject: "Cap Table Discussion", status: "open", lastMessageAt: "2026-03-11T11:00:00Z", messages: [
      { id: "cm1", senderType: "client", senderName: "Jamie Park", body: "Hi Sarah — we've reviewed the cap table. A few questions:\n\n1. Can you confirm the option pool is 10% post-money?\n2. What happens to the unissued shares from Series A?\n\nThanks!", createdAt: "2026-03-09T10:15:00Z" },
      { id: "cm2", senderType: "firm", senderUserId: "u1", senderName: "Sarah Chen", body: "Hi Jamie,\n\n1. Yes, the option pool is 10% on a fully-diluted post-money basis. That's standard for Series B.\n2. The 412,000 unissued shares from the Series A authorization remain available. They're included in the pre-money cap table I sent over.\n\nI'll send an updated version with the expansion calculations today.", createdAt: "2026-03-09T11:00:00Z" },
      { id: "cm3", senderType: "client", senderName: "Jamie Park", body: "Perfect, that makes sense. Can we schedule a call Tuesday to walk through the option pool expansion with Riley?", createdAt: "2026-03-09T14:30:00Z" },
      { id: "cm4", senderType: "firm", senderUserId: "u1", senderName: "Sarah Chen", body: "Absolutely — I'll send a calendar invite for Tuesday at 2pm. I'll have the updated cap table ready by then.", createdAt: "2026-03-09T15:00:00Z" },
      { id: "cm5", senderType: "client", senderName: "Jamie Park", body: "One more thing — Riley wants to know if we can add a 409A valuation discussion to that call too.", createdAt: "2026-03-11T10:30:00Z" },
    ]},
    { id: "conv2", matterId: "m1", clientId: "c1", category: "matter", subject: "Term Sheet — Board Composition", status: "open", lastMessageAt: "2026-03-10T16:00:00Z", messages: [
      { id: "cm6", senderType: "firm", senderUserId: "u1", senderName: "Sarah Chen", body: "Jamie — I've uploaded the v3 markup of the term sheet. The key change is in Section 4.2 (Board Composition).\n\nWe're proposing a 5-seat board: 2 founders, 2 investors, 1 independent. Sequoia originally wanted 3 investor seats. This is a much better outcome for you.", createdAt: "2026-03-10T14:30:00Z" },
      { id: "cm7", senderType: "client", senderName: "Jamie Park", body: "This looks great. Riley and I are aligned on the 5-seat structure. One question — who picks the independent director?", createdAt: "2026-03-10T15:15:00Z" },
      { id: "cm8", senderType: "firm", senderUserId: "u2", senderName: "Marcus Williams", body: "Hi Jamie — Sarah asked me to jump in on this. Per the markup, the independent director is mutually agreed upon by the founders and Sequoia. Neither side has a unilateral pick. Happy to walk through the protective provisions around this on our next call.", createdAt: "2026-03-10T16:00:00Z" },
    ]},
    { id: "conv3", matterId: "m1", clientId: "c1", category: "matter", subject: "Due Diligence Checklist", status: "closed", lastMessageAt: "2026-03-05T09:00:00Z", messages: [
      { id: "cm9", senderType: "firm", senderUserId: "u3", senderName: "Priya Patel", body: "Hi Jamie — attached is the due diligence checklist. We'll need items 1-8 by end of week. Let me know if you have any questions finding anything.", createdAt: "2026-03-03T09:00:00Z", attachments: [{ fileName: "DD_Checklist_TechVenture.pdf", fileSize: 245000 }] },
      { id: "cm10", senderType: "client", senderName: "Jamie Park", body: "Got it, thanks Priya. I'll have our CFO pull together the financial statements. Everything else we should have on file.", createdAt: "2026-03-03T10:30:00Z" },
      { id: "cm11", senderType: "client", senderName: "Jamie Park", body: "All items uploaded to the shared drive. Let me know if anything is missing.", createdAt: "2026-03-05T09:00:00Z", attachments: [{ fileName: "TechVenture_Financials_2025.pdf", fileSize: 1800000 }, { fileName: "IP_Assignment_Records.zip", fileSize: 4500000 }] },
    ]},
    { id: "conv4", matterId: "m3", clientId: "c3", category: "matter", subject: "Lease Timeline Question", status: "open", lastMessageAt: "2026-03-07T12:00:00Z", messages: [
      { id: "cm12", senderType: "client", senderName: "David Greenfield", body: "Sarah — what's the realistic timeline for getting this lease finalized? The landlord is pushing for a March 31 signing.", createdAt: "2026-03-07T10:00:00Z" },
      { id: "cm13", senderType: "firm", senderUserId: "u1", senderName: "Sarah Chen", body: "David, March 31 is tight but doable if we get the environmental assessment results back by the 15th. I'll push our contacts at the assessment firm. Main open items:\n\n1. Environmental clearance\n2. Tenant improvement allowance (we're at $45/sf, pushing for $55)\n3. Renewal option terms\n\nI'd say 80% chance we close on time.", createdAt: "2026-03-07T12:00:00Z" },
    ]},
    { id: "conv5", matterId: "m4", clientId: "c1", category: "matter", subject: "VP Eng Equity Terms", status: "open", lastMessageAt: "2026-03-11T09:00:00Z", messages: [
      { id: "cm14", senderType: "client", senderName: "Jamie Park", body: "David — quick question on the VP Eng agreement. We want to offer 0.5% equity with 4-year vesting and a 1-year cliff. Is that standard language or do we need custom provisions given the Series B?", createdAt: "2026-03-10T16:00:00Z" },
      { id: "cm15", senderType: "firm", senderUserId: "u4", senderName: "David Kim", body: "Jamie — 0.5% with 4/1 is very standard. I'll draft it under the existing EIP so it comes from the option pool. One thing to flag: with the Series B, you'll want to get the 409A valuation done before granting. Otherwise the strike price could be challenged. I'll note that in the agreement.", createdAt: "2026-03-11T09:00:00Z" },
    ]},
    { id: "conv6", matterId: null, clientId: "c1", category: "general", subject: "Trademark Registration Question", status: "open", routedToUserId: "u1", lastMessageAt: "2026-03-12T14:00:00Z", messages: [
      { id: "cm16", senderType: "client", senderName: "Riley Chen", body: "Hi — we're thinking about registering the TechVenture trademark. We've been using the name for about 2 years but never formally registered. Is this something you can help with, or do we need a separate IP firm?", createdAt: "2026-03-12T14:00:00Z" },
    ]},
    { id: "conv7", matterId: null, clientId: "c1", category: "billing", subject: "Question about Invoice INV-2026-0001", status: "open", routedToUserId: "u1", lastMessageAt: "2026-03-13T10:00:00Z", messages: [
      { id: "cm17", senderType: "client", senderName: "Jamie Park", body: "Hi Sarah — I see a line item on the latest invoice for 'Cap table and corporate records' at $175. Can you clarify what that covers? I want to make sure it's not duplicating the work in the Series A matter.", createdAt: "2026-03-13T09:30:00Z" },
      { id: "cm18", senderType: "firm", senderUserId: "u1", senderName: "Sarah Chen", body: "Good question, Jamie. That's Priya's work updating the cap table specifically for the Series B terms — incorporating the new option pool expansion and updated investor allocations. It's distinct from the Series A cap table work. Happy to walk through the details if you'd like.", createdAt: "2026-03-13T10:00:00Z" },
    ]},
  ],
  portalUsers: [
    { id: "pu1", clientId: "c1", email: "jamie@techventure.com", firstName: "Jamie", lastName: "Park", title: "CEO", status: "active" },
    { id: "pu2", clientId: "c1", email: "riley@techventure.com", firstName: "Riley", lastName: "Chen", title: "CTO", status: "active" },
    { id: "pu3", clientId: "c2", email: "amir.sharma@gmail.com", firstName: "Amir", lastName: "Sharma", title: "", status: "active" },
    { id: "pu4", clientId: "c3", email: "david@greenleafprops.com", firstName: "David", lastName: "Greenfield", title: "Managing Partner", status: "active" },
  ],
  firmSettings: {
    name: "Founders Law", address: { street1: "1 Market St, Suite 400", city: "San Francisco", state: "CA", zip: "94105" },
    phone: "(415) 555-9000", website: "founderslaw.com", ein: "**-***1234",
    billingDefaults: { paymentTerms: 30, invoicePrefix: "INV", trustBankName: "First Republic Bank" },
    integrations: { gavel: { status: "connected", workspace: "cofounderkitllc.gavel.io" }, stripe: { status: "connected" }, qbo: { status: "not_connected" }, singlefile: { status: "connected", lastSync: "2026-03-15T08:00:00Z" } },
  },
};

// ---- DATA HELPERS (simulate API queries) ----
const Q = {
  user: (id) => DB.users.find(u => u.id === id),
  client: (id) => DB.clients.find(c => c.id === id),
  mattersForClient: (clientId) => DB.matters.filter(m => m.clientId === clientId),
  docsForMatter: (matterId) => DB.documents.filter(d => d.matterId === matterId),
  docsForClient: (clientId) => {
    const matterIds = DB.matters.filter(m => m.clientId === clientId).map(m => m.id);
    return DB.documents.filter(d => matterIds.includes(d.matterId));
  },
  timeForMatter: (matterId) => DB.timeEntries.filter(t => t.matterId === matterId),
  timeForClient: (clientId) => {
    const matterIds = DB.matters.filter(m => m.clientId === clientId).map(m => m.id);
    return DB.timeEntries.filter(t => matterIds.includes(t.matterId));
  },
  invoicesForMatter: (matterId) => DB.invoices.filter(i => i.matterId === matterId),
  invoicesForClient: (clientId) => DB.invoices.filter(i => i.clientId === clientId),
  entitiesForClient: (clientId) => DB.entities.filter(e => e.clientId === clientId),
  complianceForEntity: (entityId) => DB.complianceTasks.filter(ct => ct.entityId === entityId),
  complianceForClient: (clientId) => {
    const entityIds = DB.entities.filter(e => e.clientId === clientId).map(e => e.id);
    return DB.complianceTasks.filter(ct => entityIds.includes(ct.entityId));
  },
  totalBilled: (entries) => entries.reduce((s, e) => s + (e.total || 0), 0),
  totalPaid: (entries) => entries.reduce((s, e) => s + (e.amountPaid || 0), 0),
  totalOutstanding: (entries) => entries.reduce((s, e) => s + (e.balanceDue || 0), 0),
  unbilledTime: (entries) => entries.filter(e => !["billed"].includes(e.status)),
  unbilledAmount: (entries) => entries.filter(e => e.status !== "billed").reduce((s, e) => s + (e.durationMinutes / 60) * e.rateAtEntry, 0),
  timeThisMonth: (entries) => entries.filter(e => e.date >= "2026-03-01"),
  convsForMatter: (matterId) => DB.conversations.filter(c => c.matterId === matterId),
  convsForClient: (clientId) => DB.conversations.filter(c => c.clientId === clientId),
  unreadConvs: (matterId) => DB.conversations.filter(c => c.matterId === matterId && c.status === "open").length,
  unassignedConvs: () => DB.conversations.filter(c => !c.matterId),
  portalUsersForClient: (clientId) => DB.portalUsers.filter(pu => pu.clientId === clientId),
  tierForRole: (role) => DB.compensationTiers.find(t => t.roles.includes(role)),
  originationForMatter: (matterId) => DB.originationSplits.find(o => o.matterId === matterId),
  userOriginationMatters: (userId) => DB.originationSplits.filter(o => o.splits.some(s => s.userId === userId)),
  isAdmin: (role) => ["admin", "partner", "billing_manager"].includes(role),
  // Compensation calculation
  computeUserComp: (userId) => {
    const user = DB.users.find(u => u.id === userId);
    if (!user) return null;
    const tier = DB.compensationTiers.find(t => t.roles.includes(user.role));
    if (!tier) return null;
    // Origination: matters where this user has a split
    const origMatters = DB.originationSplits.filter(o => o.splits.some(s => s.userId === userId));
    let origCredit = 0;
    const origDetails = [];
    for (const om of origMatters) {
      const split = om.splits.find(s => s.userId === userId);
      const matterInvoices = DB.invoices.filter(i => i.matterId === om.matterId);
      const collected = matterInvoices.reduce((s, i) => s + i.amountPaid, 0);
      // Primary originator's rate determines pool
      const primarySplit = om.splits.reduce((best, s) => s.pct > best.pct ? s : best, om.splits[0]);
      const primaryUser = DB.users.find(u => u.id === primarySplit.userId);
      const primaryTier = DB.compensationTiers.find(t => t.roles.includes(primaryUser?.role));
      const poolRate = primaryTier?.originationRate || tier.originationRate;
      const credit = collected * poolRate * split.pct;
      origCredit += credit;
      const matter = DB.matters.find(m => m.id === om.matterId);
      origDetails.push({ matterId: om.matterId, matterNumber: matter?.matterNumber, name: matter?.name, collected, poolRate, splitPct: split.pct, credit: Math.round(credit * 100) / 100 });
    }
    // Production: billable time by this user
    const myTime = DB.timeEntries.filter(t => t.userId === userId && t.billable);
    let prodCredit = 0;
    const prodByMatter = {};
    for (const te of myTime) {
      const billable = (te.durationMinutes / 60) * te.rateAtEntry;
      const credit = billable * tier.productionRate;
      prodCredit += credit;
      if (!prodByMatter[te.matterId]) { const m = DB.matters.find(mm => mm.id === te.matterId); prodByMatter[te.matterId] = { matterId: te.matterId, matterNumber: m?.matterNumber, name: m?.name, hours: 0, billable: 0, credit: 0 }; }
      prodByMatter[te.matterId].hours += te.durationMinutes / 60;
      prodByMatter[te.matterId].billable += billable;
      prodByMatter[te.matterId].credit += credit;
    }
    return {
      user, tier: tier.name, origination: { credit: Math.round(origCredit * 100) / 100, details: origDetails, rate: tier.originationRate },
      production: { credit: Math.round(prodCredit * 100) / 100, details: Object.values(prodByMatter).map(d => ({ ...d, hours: Math.round(d.hours * 100) / 100, billable: Math.round(d.billable * 100) / 100, credit: Math.round(d.credit * 100) / 100 })), rate: tier.productionRate },
      total: Math.round((origCredit + prodCredit) * 100) / 100,
    };
  },
};

// ---- FORMATTERS ----
const fmt = {
  currency: (n) => n == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n),
  hours: (mins) => { if (!mins) return "0:00"; const h = Math.floor(mins / 60); const m = mins % 60; return `${h}:${String(m).padStart(2, "0")}`; },
  hoursDecimal: (mins) => (mins / 60).toFixed(1),
  fileSize: (b) => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(0) + " KB" : (b / 1048576).toFixed(1) + " MB",
  date: (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
  dateShort: (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
  practiceArea: (pa) => ({ corporate: "Corporate", immigration: "Immigration", litigation: "Litigation", real_estate: "Real Estate", employment: "Employment", ip: "IP", tax: "Tax", family: "Family", criminal: "Criminal", other: "Other" })[pa] || pa,
  billingType: (bt) => ({ hourly: "Hourly", flat_fee: "Flat Fee", contingency: "Contingency", retainer: "Retainer", pro_bono: "Pro Bono" })[bt] || bt,
  initials: (name) => name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?",
  role: (r) => ({ admin: "Admin", partner: "Partner", associate: "Associate", paralegal: "Paralegal", billing_manager: "Billing" })[r] || r,
  mins: (entries) => entries.reduce((s, e) => s + e.durationMinutes, 0),
};

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

const Badge = ({ children, color = T.gold, bg = T.goldBg, style: s }) => (
  <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: "100px", fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", background: bg, color, whiteSpace: "nowrap", ...s }}>{children}</span>
);

const statusConfig = { active: [T.green, T.greenBg], open: [T.green, T.greenBg], prospective: [T.blue, T.blueBg], archived: [T.textTertiary, "rgba(107,112,137,0.1)"], closed: [T.textTertiary, "rgba(107,112,137,0.1)"], pending: [T.orange, T.orangeBg], on_hold: [T.orange, T.orangeBg], draft: [T.textTertiary, "rgba(107,112,137,0.1)"], submitted: [T.blue, T.blueBg], approved: [T.purple, T.purpleBg], billed: [T.green, T.greenBg], sent: [T.blue, T.blueBg], paid: [T.green, T.greenBg], overdue: [T.red, T.redBg], void: [T.textDim, "rgba(69,73,102,0.15)"], partial: [T.orange, T.orangeBg] };
const StatusBadge = ({ status }) => { const [c, bg] = statusConfig[status] || [T.textTertiary, "rgba(107,112,137,0.1)"]; return <Badge color={c} bg={bg}>{status.replace("_", " ")}</Badge>; };

const Btn = ({ children, variant = "gold", size = "md", onClick, disabled, style: s }) => {
  const v = { gold: { background: T.gold, color: T.bg }, ghost: { background: "transparent", color: T.textSecondary, border: `1px solid ${T.border}` }, danger: { background: T.redBg, color: T.red }, subtle: { background: T.surfaceRaised, color: T.textSecondary } };
  const sz = { sm: { padding: "5px 11px", fontSize: "11.5px" }, md: { padding: "7px 16px", fontSize: "12.5px" }, lg: { padding: "10px 22px", fontSize: "13.5px" } };
  return <button onClick={onClick} disabled={disabled} style={{ border: "none", borderRadius: T.radius, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 700, fontFamily: T.font, display: "inline-flex", alignItems: "center", gap: 5, transition: "all 0.15s", opacity: disabled ? 0.4 : 1, letterSpacing: "0.2px", ...v[variant], ...sz[size], ...s }}>{children}</button>;
};

const Card = ({ children, style: s, onClick, hover }) => (
  <div onClick={onClick} style={{ background: T.card, border: `1px solid ${T.borderSubtle}`, borderRadius: T.radiusMd, boxShadow: "0 1px 3px rgba(33,59,43,0.04)", ...s, ...(onClick ? { cursor: "pointer", transition: "all 0.2s" } : {}) }}
    onMouseEnter={e => { if (onClick || hover) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "0 2px 8px rgba(33,59,43,0.08)"; }}}
    onMouseLeave={e => { if (onClick || hover) { e.currentTarget.style.borderColor = T.borderSubtle; e.currentTarget.style.boxShadow = "0 1px 3px rgba(33,59,43,0.04)"; }}}>
    {children}
  </div>
);

const Stat = ({ label, value, sub, color = T.text }) => (
  <div>
    <div style={{ fontSize: "10.5px", color: T.textTertiary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: "22px", fontWeight: 700, color, letterSpacing: "-0.5px", fontFamily: T.mono }}>{value}</div>
    {sub && <div style={{ fontSize: "11px", color: T.textTertiary, marginTop: 2 }}>{sub}</div>}
  </div>
);

const Input = ({ value, onChange, placeholder, icon, style: s }) => (
  <div style={{ position: "relative", ...s }}>
    {icon && <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}><Icon name={icon} size={15} color={T.textDim} /></div>}
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: "100%", padding: `8px ${icon ? "8px" : "12px"} 8px ${icon ? "32px" : "12px"}`, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, color: T.text, fontSize: "13px", fontFamily: T.font, outline: "none", boxSizing: "border-box" }}
      onFocus={e => e.target.style.borderColor = T.borderFocus}
      onBlur={e => e.target.style.borderColor = T.border} />
  </div>
);

const Select = ({ value, onChange, options, style: s }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ padding: "8px 12px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, color: T.text, fontSize: "12px", fontFamily: T.font, outline: "none", ...s }}>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const Breadcrumb = ({ items, onNavigate }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, fontSize: "12.5px" }}>
    {items.map((item, i) => (
      <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {i > 0 && <Icon name="chevronRight" size={12} color={T.textDim} />}
        {item.onClick ? (
          <span onClick={item.onClick} style={{ color: T.textTertiary, cursor: "pointer", transition: "color 0.15s" }}
            onMouseEnter={e => e.target.style.color = T.gold}
            onMouseLeave={e => e.target.style.color = T.textTertiary}>{item.label}</span>
        ) : <span style={{ color: T.textSecondary, fontWeight: 600 }}>{item.label}</span>}
      </span>
    ))}
  </div>
);

const TabBar = ({ tabs, active, onSelect }) => (
  <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.border}`, marginBottom: 20 }}>
    {tabs.map(t => (
      <button key={t.id} onClick={() => onSelect(t.id)}
        style={{ padding: "10px 18px", fontSize: "12.5px", fontWeight: 600, fontFamily: T.font, background: "none", border: "none", borderBottom: `2px solid ${active === t.id ? T.gold : "transparent"}`, color: active === t.id ? T.gold : T.textTertiary, cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.2px" }}>
        {t.label}{t.count != null && <span style={{ marginLeft: 6, fontSize: "10px", background: active === t.id ? T.goldBg : T.surfaceRaised, padding: "1px 6px", borderRadius: 100, color: active === t.id ? T.gold : T.textTertiary }}>{t.count}</span>}
      </button>
    ))}
  </div>
);

const Table = ({ columns, data, onRowClick }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead><tr>{columns.map((c, i) => (
        <th key={i} style={{ textAlign: c.align || "left", padding: "9px 14px", borderBottom: `1px solid ${T.border}`, color: T.textDim, fontWeight: 600, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.7px", whiteSpace: "nowrap" }}>{c.header}</th>
      ))}</tr></thead>
      <tbody>{data.map((row, ri) => (
        <tr key={ri} onClick={() => onRowClick?.(row)} style={{ cursor: onRowClick ? "pointer" : "default", transition: "background 0.1s" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(63,118,83,0.03)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          {columns.map((c, ci) => (
            <td key={ci} style={{ padding: "11px 14px", borderBottom: `1px solid ${T.borderSubtle}`, color: T.text, fontSize: "13px", textAlign: c.align || "left", whiteSpace: c.nowrap ? "nowrap" : "normal" }}>
              {c.render ? c.render(row) : row[c.key]}
            </td>
          ))}
        </tr>
      ))}</tbody>
    </table>
    {data.length === 0 && <div style={{ padding: 40, textAlign: "center", color: T.textDim, fontSize: "13px" }}>No results found</div>}
  </div>
);

const Modal = ({ open, onClose, title, width = 520, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(33,59,43,0.4)", backdropFilter: "blur(6px)" }} />
      <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, width, maxWidth: "92vw", maxHeight: "88vh", overflow: "auto", padding: 24, boxShadow: "0 12px 40px rgba(33,59,43,0.12)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: T.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}><Icon name="x" color={T.textTertiary} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, mono }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.borderSubtle}` }}>
    <span style={{ fontSize: "12px", color: T.textTertiary }}>{label}</span>
    <span style={{ fontSize: "12.5px", color: T.text, fontWeight: 500, fontFamily: mono ? T.mono : T.font }}>{value}</span>
  </div>
);

// ============================================================
// AI ASSISTANT PANEL (Abbado)
// ============================================================
const AiPanel = ({ open, onClose, nav }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const contextSummary = useMemo(() => JSON.stringify({
    clients: DB.clients.map(c => ({ id: c.id, name: c.name, status: c.status, type: c.type })),
    matters: DB.matters.map(m => ({ id: m.id, number: m.matterNumber, name: m.name, client: Q.client(m.clientId)?.name, status: m.status, area: m.practiceArea, billing: m.billingType })),
    documents: DB.documents.map(d => ({ id: d.id, title: d.title, matter: DB.matters.find(m => m.id === d.matterId)?.matterNumber, category: d.category, tags: d.tags, version: d.currentVersion.versionNumber })),
    invoices: DB.invoices.map(i => ({ number: i.invoiceNumber, matter: DB.matters.find(m => m.id === i.matterId)?.matterNumber, client: Q.client(i.clientId)?.name, status: i.status, total: i.total, paid: i.amountPaid, due: i.balanceDue })),
    recentTime: DB.timeEntries.slice(0, 6).map(t => ({ matter: DB.matters.find(m => m.id === t.matterId)?.matterNumber, user: Q.user(t.userId)?.firstName, date: t.date, hours: fmt.hoursDecimal(t.durationMinutes), desc: t.description, status: t.status })),
    connectedTools: CONFIG.integrations.mcp.filter(m => m.connected).map(m => m.name),
  }), []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: CONFIG.ai.model,
          max_tokens: 1000,
          system: `${CONFIG.ai.systemPrompt}\n\nCurrent firm data:\n${contextSummary}\n\nToday is March 12, 2026. The firm is ${CONFIG.firm.name}. Connected external tools: ${CONFIG.integrations.mcp.filter(m=>m.connected).map(m=>m.name).join(", ")}. If the user asks about Guru playbooks, meeting notes (Granola), or emails, acknowledge you have access through integrations and provide helpful guidance based on available context.`,
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "I couldn't process that request.";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Check that the AI service is available." }]);
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 420, zIndex: 900, background: "#F5F0E7", borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(33,59,43,0.08)" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#FFFFFF" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, #213B2B, #3F7653)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="sparkle" size={16} color="#FCF8F1" />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>{CONFIG.app.name} AI</div>
            <div style={{ fontSize: "10.5px", color: T.textTertiary }}>
              {CONFIG.integrations.mcp.filter(m => m.connected).length} tools connected
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><Icon name="x" color={T.textTertiary} /></button>
      </div>

      {/* Connected tools */}
      <div style={{ padding: "10px 20px", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {CONFIG.integrations.mcp.map(tool => (
          <span key={tool.name} style={{ fontSize: "10px", padding: "3px 8px", borderRadius: 100, background: tool.connected ? T.goldBg : T.surfaceRaised, color: tool.connected ? T.gold : T.textDim, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
            <Icon name={tool.icon} size={10} color={tool.connected ? T.gold : T.textDim} />{tool.name}
          </span>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "28px", marginBottom: 12 }}>🎼</div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: T.text, marginBottom: 6 }}>How can I help?</div>
            <div style={{ fontSize: "12px", color: T.textTertiary, lineHeight: 1.5 }}>
              Ask me about matter status, billing, documents, or anything in your connected tools.
            </div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
              {["What's the status of the Series B matter?", "Which invoices are overdue?", "Find documents tagged 'term-sheet'", "What's our unbilled time this month?"].map(q => (
                <button key={q} onClick={() => { setInput(q); }} style={{ padding: "8px 14px", background: T.surface, border: `1px solid ${T.borderSubtle}`, borderRadius: T.radius, color: T.textSecondary, fontSize: "12px", fontFamily: T.font, cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#3F7653"; e.currentTarget.style.color = "#213B2B"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderSubtle; e.currentTarget.style.color = T.textSecondary; }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 14, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ fontSize: "10px", color: T.textDim, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {msg.role === "user" ? "You" : CONFIG.app.name}
            </div>
            <div style={{ maxWidth: "92%", padding: "10px 14px", borderRadius: T.radiusMd, fontSize: "13px", lineHeight: 1.55, whiteSpace: "pre-wrap", background: msg.role === "user" ? "rgba(33,59,43,0.08)" : T.surface, color: msg.role === "user" ? T.text : T.textSecondary, border: `1px solid ${msg.role === "user" ? "rgba(63,118,83,0.2)" : T.border}` }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: T.surface, borderRadius: T.radiusMd, border: `1px solid ${T.borderSubtle}`, width: "fit-content" }}>
            <div style={{ display: "flex", gap: 4 }}>{[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#3F7653", opacity: 0.5, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}</div>
            <span style={{ fontSize: "12px", color: T.textTertiary }}>Thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder={`Ask ${CONFIG.app.name} anything...`}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            style={{ flex: 1, padding: "10px 14px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, color: T.text, fontSize: "13px", fontFamily: T.font, outline: "none" }}
            onFocus={e => e.target.style.borderColor = "#3F7653"}
            onBlur={e => e.target.style.borderColor = T.border} />
          <Btn onClick={sendMessage} disabled={!input.trim() || loading} style={{ padding: "10px 14px" }}>
            <Icon name="send" size={14} color="#FCF8F1" />
          </Btn>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity:0.3; transform:scale(0.8); } 50% { opacity:1; transform:scale(1); }}`}</style>
    </div>
  );
};

// ============================================================
// PAGE: CLIENT DETAIL (deeply linked)
// ============================================================
const ClientDetailPage = ({ clientId, nav }) => {
  const [tab, setTab] = useState("overview");
  const client = Q.client(clientId);
  if (!client) return <div style={{ padding: 40, color: T.textTertiary }}>Client not found</div>;

  const attorney = Q.user(client.originatingAttorneyId);
  const matters = Q.mattersForClient(clientId);
  const docs = Q.docsForClient(clientId);
  const timeEntries = Q.timeForClient(clientId);
  const invoices = Q.invoicesForClient(clientId);
  const timeThisMonth = Q.timeThisMonth(timeEntries);

  return (
    <div>
      <Breadcrumb items={[{ label: "Clients", onClick: () => nav("clients") }, { label: client.name }]} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: T.radiusMd, background: T.goldBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 800, color: T.gold, fontFamily: T.fontDisplay }}>
            {client.type === "entity" ? <Icon name="building" size={22} color={T.gold} /> : fmt.initials(client.name)}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text, letterSpacing: "-0.3px" }}>{client.name}</h1>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
              <StatusBadge status={client.status} />
              <Badge color={T.textTertiary} bg={T.surfaceRaised}>{client.type}</Badge>
              {attorney && <span style={{ fontSize: "12px", color: T.textTertiary }}>Atty: {attorney.firstName} {attorney.lastName}</span>}
            </div>
          </div>
        </div>
        <Btn variant="ghost" size="sm"><Icon name="edit" size={13} color={T.textSecondary} /> Edit</Btn>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        <Card style={{ padding: "14px 16px" }}><Stat label="Total Billed" value={fmt.currency(Q.totalBilled(invoices))} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Paid" value={fmt.currency(Q.totalPaid(invoices))} color={T.green} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Outstanding" value={fmt.currency(Q.totalOutstanding(invoices))} color={Q.totalOutstanding(invoices) > 0 ? T.orange : T.green} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Unbilled" value={fmt.currency(Q.unbilledAmount(timeEntries))} color={T.blue} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="This Month" value={`${fmt.hoursDecimal(fmt.mins(timeThisMonth))}h`} sub={`${timeThisMonth.length} entries`} /></Card>
      </div>

      <TabBar tabs={[
        { id: "overview", label: "Overview" },
        { id: "matters", label: "Matters", count: matters.length },
        { id: "entities", label: "Entities", count: Q.entitiesForClient(clientId).length },
        { id: "documents", label: "Documents", count: docs.length },
        { id: "billing", label: "Billing", count: invoices.length },
        { id: "time", label: "Time", count: timeEntries.length },
      ]} active={tab} onSelect={setTab} />

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: T.text, marginBottom: 12 }}>Contact Information</div>
            <InfoRow label="Email" value={client.email || "—"} />
            <InfoRow label="Phone" value={client.phone || "—"} />
            {client.address && <InfoRow label="Address" value={`${client.address.street1}, ${client.address.city}, ${client.address.state}`} />}
            <InfoRow label="Client Since" value={fmt.date(client.createdAt)} />
            {client.notes && <div style={{ marginTop: 12, padding: "10px 12px", background: T.surface, borderRadius: T.radius, fontSize: "12px", color: T.textSecondary, lineHeight: 1.5 }}>{client.notes}</div>}
          </Card>
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: T.text, marginBottom: 12 }}>Active Matters</div>
            {matters.filter(m => m.status === "open").map(m => (
              <div key={m.id} onClick={() => nav("matter", m.id)} style={{ padding: "10px 12px", borderRadius: T.radius, marginBottom: 6, cursor: "pointer", transition: "background 0.15s", background: T.surface }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = T.surface}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: T.text }}>{m.name}</div>
                  <Badge color={T.purple} bg={T.purpleBg}>{fmt.practiceArea(m.practiceArea)}</Badge>
                </div>
                <div style={{ fontSize: "11px", color: T.textTertiary, marginTop: 3, fontFamily: T.mono }}>{m.matterNumber}</div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab === "matters" && (
        <Table data={matters} onRowClick={m => nav("matter", m.id)} columns={[
          { header: "Matter", render: r => (<div><div style={{ fontWeight: 600, fontSize: "13px" }}>{r.name}</div><div style={{ fontSize: "11px", color: T.textTertiary, fontFamily: T.mono }}>{r.matterNumber}</div></div>) },
          { header: "Area", render: r => <Badge color={T.purple} bg={T.purpleBg}>{fmt.practiceArea(r.practiceArea)}</Badge>, nowrap: true },
          { header: "Status", render: r => <StatusBadge status={r.status} />, nowrap: true },
          { header: "Billing", render: r => fmt.billingType(r.billingType) },
          { header: "Docs", render: r => Q.docsForMatter(r.id).length, align: "center" },
          { header: "Opened", render: r => fmt.dateShort(r.openDate), nowrap: true },
        ]} />
      )}

      {tab === "documents" && (
        <Table data={docs} columns={[
          { header: "Document", render: r => (<div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="documents" size={15} color={T.gold} /><div><div style={{ fontWeight: 600, fontSize: "13px" }}>{r.title}</div><div style={{ fontSize: "11px", color: T.textTertiary }}>{r.currentVersion.fileName}</div></div></div>) },
          { header: "Matter", render: r => <span style={{ fontFamily: T.mono, fontSize: "11px", color: T.textTertiary }}>{DB.matters.find(m => m.id === r.matterId)?.matterNumber}</span> },
          { header: "Category", render: r => <Badge color={T.textTertiary} bg={T.surfaceRaised}>{r.category}</Badge>, nowrap: true },
          { header: "Version", render: r => <span style={{ fontFamily: T.mono }}>v{r.currentVersion.versionNumber}</span>, align: "center" },
          { header: "Modified", render: r => fmt.dateShort(r.updatedAt), nowrap: true },
        ]} />
      )}

      {tab === "billing" && (
        <Table data={invoices} columns={[
          { header: "Invoice", render: r => <span style={{ fontFamily: T.mono, fontWeight: 600 }}>{r.invoiceNumber}</span>, nowrap: true },
          { header: "Matter", render: r => DB.matters.find(m => m.id === r.matterId)?.name },
          { header: "Status", render: r => <StatusBadge status={r.status} />, nowrap: true },
          { header: "Issued", render: r => fmt.dateShort(r.issueDate), nowrap: true },
          { header: "Total", render: r => <span style={{ fontFamily: T.mono, fontWeight: 600 }}>{fmt.currency(r.total)}</span>, align: "right", nowrap: true },
          { header: "Paid", render: r => <span style={{ fontFamily: T.mono, color: T.green }}>{fmt.currency(r.amountPaid)}</span>, align: "right", nowrap: true },
          { header: "Balance", render: r => <span style={{ fontFamily: T.mono, color: r.balanceDue > 0 ? T.orange : T.green, fontWeight: 600 }}>{fmt.currency(r.balanceDue)}</span>, align: "right", nowrap: true },
        ]} />
      )}

      {tab === "time" && (
        <Table data={timeEntries} columns={[
          { header: "Date", render: r => fmt.dateShort(r.date), nowrap: true },
          { header: "Matter", render: r => <span style={{ fontFamily: T.mono, fontSize: "11px" }}>{DB.matters.find(m => m.id === r.matterId)?.matterNumber}</span> },
          { header: "Attorney", render: r => { const u = Q.user(r.userId); return u ? `${u.firstName} ${u.lastName}` : "—"; } },
          { header: "Description", render: r => <div style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</div> },
          { header: "Hours", render: r => <span style={{ fontFamily: T.mono, fontWeight: 600 }}>{fmt.hoursDecimal(r.durationMinutes)}</span>, align: "right", nowrap: true },
          { header: "Amount", render: r => <span style={{ fontFamily: T.mono }}>{fmt.currency((r.durationMinutes / 60) * r.rateAtEntry)}</span>, align: "right", nowrap: true },
          { header: "Status", render: r => <StatusBadge status={r.status} />, nowrap: true },
        ]} />
      )}

      {tab === "entities" && (
        <div>
          {Q.entitiesForClient(clientId).map(ent => (
            <Card key={ent.id} style={{ padding: 18, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: T.text }}>{ent.legalName}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <Badge color={T.purple} bg={T.purpleBg}>{ent.entityType}</Badge>
                    <Badge color={T.blue} bg={T.blueBg}>{ent.stateOfFormation}</Badge>
                    <StatusBadge status={ent.status} />
                  </div>
                </div>
                <div style={{ fontSize: "11px", color: T.textTertiary }}>Formed {fmt.date(ent.formationDate)}</div>
              </div>
              {ent.officers && ent.officers.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: "11px", color: T.textTertiary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Officers</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {ent.officers.map((o, i) => <span key={i} style={{ fontSize: "12px", color: T.textSecondary }}>{o.name} <span style={{ color: T.textTertiary }}>({o.title})</span></span>)}
                  </div>
                </div>
              )}
              {ent.jurisdictions && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: "11px", color: T.textTertiary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Jurisdictions</div>
                  <div style={{ display: "flex", gap: 6 }}>{ent.jurisdictions.map((j, i) => <Badge key={i} color={T.textTertiary} bg={T.surfaceRaised}>{j.state} ({j.type})</Badge>)}</div>
                </div>
              )}
              {Q.complianceForEntity(ent.id).length > 0 && (
                <div>
                  <div style={{ fontSize: "11px", color: T.textTertiary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Compliance</div>
                  {Q.complianceForEntity(ent.id).map(ct => (
                    <div key={ct.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.borderSubtle}` }}>
                      <div style={{ fontSize: "12.5px", color: T.text }}>{ct.taskName}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "11px", color: T.textTertiary }}>{fmt.dateShort(ct.dueDate)}</span>
                        <StatusBadge status={ct.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
          {Q.entitiesForClient(clientId).length === 0 && <div style={{ padding: 40, textAlign: "center", color: T.textDim }}>No entities for this client</div>}
        </div>
      )}
    </div>
  );
};
// ============================================================
// COMPONENT: MATTER CONVERSATIONS (used in MatterDetail tab)
// ============================================================
const MatterConversations = ({ matterId, client }) => {
  const convs = Q.convsForMatter(matterId);
  const [selectedConvId, setSelectedConvId] = useState(convs[0]?.id || null);
  const [replyText, setReplyText] = useState("");
  const selectedConv = convs.find(c => c.id === selectedConvId);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, minHeight: 420 }}>
      {/* Thread list */}
      <div>
        <Btn size="sm" style={{ width: "100%", marginBottom: 10, justifyContent: "center" }}>
          <Icon name="plus" size={13} color={T.bg} /> New Thread
        </Btn>
        {convs.map(conv => {
          const isSelected = selectedConvId === conv.id;
          const lastMsg = conv.messages[conv.messages.length - 1];
          const unread = conv.status === "open" && lastMsg?.senderType === "client";
          return (
            <div key={conv.id} onClick={() => setSelectedConvId(conv.id)}
              style={{ padding: "12px 14px", borderRadius: T.radius, marginBottom: 4, cursor: "pointer", background: isSelected ? T.accentBg : "transparent", border: `1px solid ${isSelected ? "rgba(63,118,83,0.15)" : "transparent"}`, transition: "all 0.15s" }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.surfaceRaised; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? T.accentBg : "transparent"; }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                {unread && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3F7653", flexShrink: 0 }} />}
                <span style={{ fontSize: "13px", fontWeight: unread ? 700 : 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.subject}</span>
              </div>
              <div style={{ fontSize: "11px", color: T.textTertiary }}>{conv.messages.length} messages · {conv.status === "closed" ? "Closed" : fmt.dateShort(conv.lastMessageAt.split("T")[0])}</div>
              <div style={{ fontSize: "11.5px", color: T.textDim, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lastMsg?.senderName}: {lastMsg?.body.slice(0, 45)}...</div>
            </div>
          );
        })}
        {convs.length === 0 && <div style={{ padding: "30px 10px", textAlign: "center", color: T.textDim, fontSize: "12px" }}>No conversations yet</div>}
      </div>

      {/* Selected thread */}
      {selectedConv ? (
        <Card style={{ padding: 0, display: "flex", flexDirection: "column" }}>
          {/* Thread header */}
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>{selectedConv.subject}</div>
              <div style={{ fontSize: "11px", color: T.textTertiary }}>{selectedConv.messages.length} messages · {client?.name} · <StatusBadge status={selectedConv.status === "open" ? "active" : "closed"} /></div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Btn variant="ghost" size="sm">Reassign</Btn>
              <Btn variant="ghost" size="sm">Split</Btn>
              <Btn variant="ghost" size="sm">{selectedConv.status === "open" ? "Close" : "Reopen"}</Btn>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: "auto", padding: "16px 18px", maxHeight: 450 }}>
            {selectedConv.messages.map(msg => (
              <div key={msg.id} style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: msg.senderType === "client" ? "rgba(74,153,167,0.12)" : T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9.5px", fontWeight: 800, color: msg.senderType === "client" ? "#4A99A7" : "#3F7653", flexShrink: 0 }}>
                    {msg.senderName.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: T.text }}>{msg.senderName}</span>
                    <span style={{ fontSize: "11px", color: T.textDim, marginLeft: 6 }}>{msg.senderType === "client" ? "Client" : fmt.role(Q.user(msg.senderUserId)?.role)}</span>
                  </div>
                  <span style={{ fontSize: "10.5px", color: T.textDim, marginLeft: "auto" }}>{new Date(msg.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                </div>
                <div style={{ marginLeft: 36, fontSize: "13px", color: T.textSecondary, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{msg.body}</div>
                {msg.attachments && msg.attachments.length > 0 && (
                  <div style={{ marginLeft: 36, marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {msg.attachments.map((a, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: T.surfaceRaised, borderRadius: T.radius, border: `1px solid ${T.borderSubtle}`, cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = "#3F7653"}
                        onMouseLeave={e => e.currentTarget.style.borderColor = T.borderSubtle}>
                        <Icon name="documents" size={13} color="#3F7653" />
                        <span style={{ fontSize: "11.5px", color: T.text, fontWeight: 500 }}>{a.fileName}</span>
                        <span style={{ fontSize: "10px", color: T.textDim }}>{fmt.fileSize(a.fileSize)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reply box */}
          {selectedConv.status === "open" ? (
            <div style={{ padding: "12px 18px", borderTop: `1px solid ${T.border}`, background: T.surfaceRaised }}>
              <div style={{ display: "flex", gap: 8 }}>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type a reply..." rows={2}
                  style={{ flex: 1, padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font, color: T.text, resize: "none", outline: "none", background: T.card }}
                  onFocus={e => e.target.style.borderColor = "#3F7653"}
                  onBlur={e => e.target.style.borderColor = T.border} />
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <Btn variant="ghost" size="sm" style={{ padding: "6px 8px" }} title="Attach file"><Icon name="upload" size={14} color={T.textSecondary} /></Btn>
                  <Btn size="sm" disabled={!replyText.trim()} style={{ padding: "6px 10px" }} title="Send"><Icon name="send" size={14} color={T.bg} /></Btn>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding: "12px 18px", borderTop: `1px solid ${T.border}`, background: T.surfaceRaised, textAlign: "center", fontSize: "12px", color: T.textDim }}>
              This conversation is closed. <span style={{ color: "#3F7653", cursor: "pointer", fontWeight: 600 }}>Reopen</span> to reply.
            </div>
          )}
        </Card>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ textAlign: "center", color: T.textDim }}>
            <Icon name="comment" size={28} color={T.textDim} />
            <div style={{ marginTop: 8, fontSize: "13px" }}>Select a conversation or start a new one</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PAGE: MATTER DETAIL (deeply linked)
// ============================================================
const MatterDetailPage = ({ matterId, nav }) => {
  const [tab, setTab] = useState("overview");
  const matter = DB.matters.find(m => m.id === matterId);
  if (!matter) return <div style={{ padding: 40, color: T.textTertiary }}>Matter not found</div>;

  const client = Q.client(matter.clientId);
  const attorney = Q.user(matter.responsibleAttorneyId);
  const docs = Q.docsForMatter(matterId);
  const timeEntries = Q.timeForMatter(matterId);
  const invoices = Q.invoicesForMatter(matterId);
  const timeThisMonth = Q.timeThisMonth(timeEntries);

  return (
    <div>
      <Breadcrumb items={[
        { label: "Clients", onClick: () => nav("clients") },
        { label: client?.name || "—", onClick: () => nav("client", matter.clientId) },
        { label: matter.matterNumber },
      ]} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: "12px", fontFamily: T.mono, color: T.gold, fontWeight: 600, marginBottom: 4 }}>{matter.matterNumber}</div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text, letterSpacing: "-0.3px" }}>{matter.name}</h1>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
            <StatusBadge status={matter.status} />
            <Badge color={T.purple} bg={T.purpleBg}>{fmt.practiceArea(matter.practiceArea)}</Badge>
            <Badge color={T.cyan} bg={T.cyanBg}>{fmt.billingType(matter.billingType)}</Badge>
            {attorney && <span style={{ fontSize: "12px", color: T.textTertiary }}>Lead: {attorney.firstName} {attorney.lastName}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        <Card style={{ padding: "14px 16px" }}><Stat label="Total Billed" value={fmt.currency(Q.totalBilled(invoices))} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Outstanding" value={fmt.currency(Q.totalOutstanding(invoices))} color={Q.totalOutstanding(invoices) > 0 ? T.orange : T.green} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Unbilled Time" value={`${fmt.hoursDecimal(fmt.mins(Q.unbilledTime(timeEntries)))}h`} color={T.blue} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Unbilled $" value={fmt.currency(Q.unbilledAmount(timeEntries))} color={T.blue} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="This Month" value={`${fmt.hoursDecimal(fmt.mins(timeThisMonth))}h`} sub={`${timeThisMonth.length} entries`} /></Card>
      </div>

      <TabBar tabs={[
        { id: "overview", label: "Overview" },
        { id: "conversations", label: "Conversations", count: Q.convsForMatter(matterId).length },
        { id: "documents", label: "Documents", count: docs.length },
        { id: "time", label: "Time", count: timeEntries.length },
        { id: "billing", label: "Billing", count: invoices.length },
      ]} active={tab} onSelect={setTab} />

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <div>
            <Card style={{ padding: 18, marginBottom: 16 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: T.text, marginBottom: 10 }}>Description</div>
              <p style={{ margin: 0, fontSize: "13px", color: T.textSecondary, lineHeight: 1.6 }}>{matter.description}</p>
            </Card>
            <Card style={{ padding: 18 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: T.text, marginBottom: 10 }}>Recent Documents</div>
              {docs.slice(0, 4).map(d => (
                <div key={d.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${T.borderSubtle}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name="documents" size={14} color={T.gold} />
                    <div><div style={{ fontSize: "13px", fontWeight: 500, color: T.text }}>{d.title}</div><div style={{ fontSize: "11px", color: T.textTertiary }}>{d.currentVersion.fileName} · v{d.currentVersion.versionNumber}</div></div>
                  </div>
                  <span style={{ fontSize: "11px", color: T.textDim }}>{fmt.dateShort(d.updatedAt)}</span>
                </div>
              ))}
            </Card>
          </div>
          <div>
            <Card style={{ padding: 18, marginBottom: 16 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: T.text, marginBottom: 10 }}>Details</div>
              <InfoRow label="Client" value={client?.name || "—"} />
              <InfoRow label="Lead Attorney" value={attorney ? `${attorney.firstName} ${attorney.lastName}` : "—"} />
              <InfoRow label="Practice Area" value={fmt.practiceArea(matter.practiceArea)} />
              <InfoRow label="Billing" value={fmt.billingType(matter.billingType)} />
              <InfoRow label="Opened" value={fmt.date(matter.openDate)} />
              {matter.closeDate && <InfoRow label="Closed" value={fmt.date(matter.closeDate)} />}
            </Card>
            <Card style={{ padding: 18 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: T.text, marginBottom: 10 }}>Tags</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {(matter.tags || []).map(t => <Badge key={t} color={T.textSecondary} bg={T.surfaceRaised} style={{ fontSize: "10px" }}>{t}</Badge>)}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "conversations" && <MatterConversations matterId={matterId} client={client} />}

      {tab === "documents" && (
        <div>
          <div style={{ marginBottom: 14, display: "flex", justifyContent: "flex-end" }}>
            <Btn size="sm"><Icon name="upload" size={13} color={T.bg} /> Upload</Btn>
          </div>
          <Table data={docs} columns={[
            { header: "Document", render: r => (<div style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name="documents" size={15} color={T.gold} /><div><div style={{ fontWeight: 600, fontSize: "13px" }}>{r.title}</div><div style={{ fontSize: "11px", color: T.textTertiary }}>{r.description?.slice(0, 60)}</div></div></div>) },
            { header: "Type", render: r => <Badge color={T.textTertiary} bg={T.surfaceRaised}>{r.category}</Badge>, nowrap: true },
            { header: "Tags", render: r => <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{(r.tags || []).slice(0, 2).map(t => <Badge key={t} color={T.textDim} bg={T.surface} style={{ fontSize: "9px" }}>{t}</Badge>)}</div> },
            { header: "Ver", render: r => <span style={{ fontFamily: T.mono, fontSize: "12px" }}>v{r.currentVersion.versionNumber}</span>, align: "center", nowrap: true },
            { header: "Size", render: r => fmt.fileSize(r.currentVersion.fileSize), nowrap: true },
            { header: "Author", render: r => { const u = Q.user(r.createdById); return u ? `${u.firstName} ${u.lastName[0]}.` : "—"; } },
            { header: "Modified", render: r => fmt.dateShort(r.updatedAt), nowrap: true },
          ]} />
        </div>
      )}

      {tab === "time" && (
        <Table data={timeEntries} columns={[
          { header: "Date", render: r => fmt.dateShort(r.date), nowrap: true },
          { header: "Attorney", render: r => { const u = Q.user(r.userId); return u ? `${u.firstName} ${u.lastName}` : "—"; } },
          { header: "Description", render: r => <div style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</div> },
          { header: "Hours", render: r => <span style={{ fontFamily: T.mono, fontWeight: 600 }}>{fmt.hoursDecimal(r.durationMinutes)}</span>, align: "right", nowrap: true },
          { header: "Rate", render: r => <span style={{ fontFamily: T.mono }}>{fmt.currency(r.rateAtEntry)}/hr</span>, align: "right", nowrap: true },
          { header: "Amount", render: r => <span style={{ fontFamily: T.mono }}>{fmt.currency((r.durationMinutes / 60) * r.rateAtEntry)}</span>, align: "right", nowrap: true },
          { header: "Status", render: r => <StatusBadge status={r.status} />, nowrap: true },
        ]} />
      )}

      {tab === "billing" && (
        <Table data={invoices} columns={[
          { header: "Invoice", render: r => <span style={{ fontFamily: T.mono, fontWeight: 600, color: T.gold }}>{r.invoiceNumber}</span>, nowrap: true },
          { header: "Status", render: r => <StatusBadge status={r.status} />, nowrap: true },
          { header: "Issued", render: r => fmt.dateShort(r.issueDate), nowrap: true },
          { header: "Due", render: r => fmt.dateShort(r.dueDate), nowrap: true },
          { header: "Total", render: r => <span style={{ fontFamily: T.mono, fontWeight: 600 }}>{fmt.currency(r.total)}</span>, align: "right", nowrap: true },
          { header: "Paid", render: r => <span style={{ fontFamily: T.mono, color: T.green }}>{fmt.currency(r.amountPaid)}</span>, align: "right", nowrap: true },
          { header: "Balance", render: r => <span style={{ fontFamily: T.mono, fontWeight: 600, color: r.balanceDue > 0 ? T.orange : T.green }}>{fmt.currency(r.balanceDue)}</span>, align: "right", nowrap: true },
        ]} />
      )}
    </div>
  );
};

// ============================================================
// PAGE: DOCUMENTS (advanced search + filters)
// ============================================================
const DocumentsPage = ({ nav }) => {
  const [search, setSearch] = useState("");
  const [filterMatter, setFilterMatter] = useState("all");
  const [filterClient, setFilterClient] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterAttorney, setFilterAttorney] = useState("all");
  const [filterTag, setFilterTag] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const allTags = [...new Set(DB.documents.flatMap(d => d.tags || []))].sort();
  const clientMatters = filterClient !== "all" ? DB.matters.filter(m => m.clientId === filterClient) : DB.matters;

  const filtered = DB.documents.filter(d => {
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !(d.tags || []).some(t => t.includes(search.toLowerCase())) && !(d.description || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (filterMatter !== "all" && d.matterId !== filterMatter) return false;
    if (filterClient !== "all") { const mIds = DB.matters.filter(m => m.clientId === filterClient).map(m => m.id); if (!mIds.includes(d.matterId)) return false; }
    if (filterCategory !== "all" && d.category !== filterCategory) return false;
    if (filterAttorney !== "all" && d.createdById !== filterAttorney) return false;
    if (filterTag !== "all" && !(d.tags || []).includes(filterTag)) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>Documents</h1><p style={{ margin: "2px 0 0", fontSize: "13px", color: T.textTertiary }}>{DB.documents.length} documents · {filtered.length} shown</p></div>
        <Btn size="sm"><Icon name="upload" size={13} color={T.bg} /> Upload</Btn>
      </div>

      {/* Search + Filter toggle */}
      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <Input value={search} onChange={setSearch} placeholder="Search by title, description, or tag..." icon="search" style={{ flex: 1 }} />
        <Btn variant={showFilters ? "gold" : "ghost"} size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Icon name="filter" size={13} color={showFilters ? T.bg : T.textSecondary} /> Filters {(filterMatter !== "all" || filterClient !== "all" || filterCategory !== "all" || filterAttorney !== "all" || filterTag !== "all") && <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.gold }} />}
        </Btn>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card style={{ padding: "14px 16px", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Select value={filterClient} onChange={v => { setFilterClient(v); setFilterMatter("all"); }} options={[{ value: "all", label: "All Clients" }, ...DB.clients.map(c => ({ value: c.id, label: c.name }))]} />
            <Select value={filterMatter} onChange={setFilterMatter} options={[{ value: "all", label: "All Matters" }, ...clientMatters.map(m => ({ value: m.id, label: `${m.matterNumber} — ${m.name}` }))]} />
            <Select value={filterCategory} onChange={setFilterCategory} options={[{ value: "all", label: "All Categories" }, ...["contract","memo","filing","correspondence","other"].map(c => ({ value: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))]} />
            <Select value={filterAttorney} onChange={setFilterAttorney} options={[{ value: "all", label: "All Authors" }, ...DB.users.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName}` }))]} />
            <Select value={filterTag} onChange={setFilterTag} options={[{ value: "all", label: "All Tags" }, ...allTags.map(t => ({ value: t, label: t }))]} />
            {(filterMatter !== "all" || filterClient !== "all" || filterCategory !== "all" || filterAttorney !== "all" || filterTag !== "all") && (
              <Btn variant="subtle" size="sm" onClick={() => { setFilterMatter("all"); setFilterClient("all"); setFilterCategory("all"); setFilterAttorney("all"); setFilterTag("all"); }}>Clear all</Btn>
            )}
          </div>
        </Card>
      )}

      <Card style={{ padding: 0 }}>
        <Table data={filtered} columns={[
          { header: "Document", render: r => (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="documents" size={15} color={T.gold} />
              <div><div style={{ fontWeight: 600, fontSize: "13px" }}>{r.title}</div><div style={{ fontSize: "11px", color: T.textTertiary }}>{r.currentVersion.fileName} · {fmt.fileSize(r.currentVersion.fileSize)}</div></div>
            </div>
          )},
          { header: "Client / Matter", render: r => { const m = DB.matters.find(mm => mm.id === r.matterId); const c = m ? Q.client(m.clientId) : null; return (<div><div style={{ fontSize: "12px", color: T.textSecondary, cursor: "pointer" }} onClick={e => { e.stopPropagation(); if (c) nav("client", c.id); }}>{c?.name}</div><div style={{ fontSize: "11px", color: T.textTertiary, fontFamily: T.mono, cursor: "pointer" }} onClick={e => { e.stopPropagation(); if (m) nav("matter", m.id); }}>{m?.matterNumber}</div></div>); }},
          { header: "Type", render: r => <Badge color={T.textTertiary} bg={T.surfaceRaised}>{r.category}</Badge>, nowrap: true },
          { header: "Tags", render: r => <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>{(r.tags || []).slice(0, 3).map(t => <Badge key={t} color={T.textDim} bg={T.surface} style={{ fontSize: "9px" }}>{t}</Badge>)}</div> },
          { header: "Ver", render: r => (<div style={{ display: "flex", alignItems: "center", gap: 3 }}><Icon name="version" size={12} color={T.textDim} /><span style={{ fontFamily: T.mono, fontSize: "12px" }}>v{r.currentVersion.versionNumber}</span></div>), align: "center", nowrap: true },
          { header: "Author", render: r => { const u = Q.user(r.createdById); return u ? `${u.firstName} ${u.lastName[0]}.` : "—"; } },
          { header: "Modified", render: r => fmt.dateShort(r.updatedAt), nowrap: true },
        ]} />
      </Card>
    </div>
  );
};

// ============================================================
// LIST PAGES (Clients, Matters, Time, Billing)
// ============================================================

const ClientsListPage = ({ nav }) => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = DB.clients.filter(c => {
    if (status !== "all" && c.status !== status) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>Clients</h1></div>
        <Btn size="sm"><Icon name="plus" size={13} color={T.bg} /> New Client</Btn>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Input value={search} onChange={setSearch} placeholder="Search clients..." icon="search" style={{ flex: 1 }} />
        <Select value={status} onChange={setStatus} options={[{ value: "all", label: "All" }, { value: "active", label: "Active" }, { value: "prospective", label: "Prospective" }, { value: "archived", label: "Archived" }]} />
      </div>
      <Card style={{ padding: 0 }}>
        <Table data={filtered} onRowClick={c => nav("client", c.id)} columns={[
          { header: "Client", render: r => (<div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 32, height: 32, borderRadius: T.radius, background: T.goldBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: T.gold }}>{r.type === "entity" ? <Icon name="building" size={15} color={T.gold} /> : fmt.initials(r.name)}</div><div><div style={{ fontWeight: 600, fontSize: "13px" }}>{r.name}</div><div style={{ fontSize: "11px", color: T.textTertiary }}>{r.email}</div></div></div>) },
          { header: "Status", render: r => <StatusBadge status={r.status} />, nowrap: true },
          { header: "Matters", render: r => Q.mattersForClient(r.id).length, align: "center" },
          { header: "Billed", render: r => <span style={{ fontFamily: T.mono }}>{fmt.currency(Q.totalBilled(Q.invoicesForClient(r.id)))}</span>, align: "right", nowrap: true },
          { header: "Outstanding", render: r => { const o = Q.totalOutstanding(Q.invoicesForClient(r.id)); return <span style={{ fontFamily: T.mono, color: o > 0 ? T.orange : T.textTertiary }}>{fmt.currency(o)}</span>; }, align: "right", nowrap: true },
          { header: "Attorney", render: r => { const u = Q.user(r.originatingAttorneyId); return u ? `${u.firstName} ${u.lastName[0]}.` : "—"; } },
        ]} />
      </Card>
    </div>
  );
};

const MattersListPage = ({ nav }) => {
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("all");
  const [status, setStatus] = useState("all");
  const filtered = DB.matters.filter(m => {
    if (area !== "all" && m.practiceArea !== area) return false;
    if (status !== "all" && m.status !== status) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.matterNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>Matters</h1></div>
        <Btn size="sm"><Icon name="plus" size={13} color={T.bg} /> New Matter</Btn>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Input value={search} onChange={setSearch} placeholder="Search by name or number..." icon="search" style={{ flex: 1 }} />
        <Select value={area} onChange={setArea} options={[{ value: "all", label: "All Areas" }, ...["corporate","immigration","real_estate","employment"].map(a => ({ value: a, label: fmt.practiceArea(a) }))]} />
        <Select value={status} onChange={setStatus} options={[{ value: "all", label: "All" }, { value: "open", label: "Open" }, { value: "closed", label: "Closed" }]} />
      </div>
      <Card style={{ padding: 0 }}>
        <Table data={filtered} onRowClick={m => nav("matter", m.id)} columns={[
          { header: "Matter", render: r => (<div><div style={{ fontWeight: 600, fontSize: "13px" }}>{r.name}</div><div style={{ fontSize: "11px", fontFamily: T.mono, color: T.textTertiary }}>{r.matterNumber}</div></div>) },
          { header: "Client", render: r => <span style={{ cursor: "pointer" }} onClick={e => { e.stopPropagation(); nav("client", r.clientId); }}>{Q.client(r.clientId)?.name}</span> },
          { header: "Area", render: r => <Badge color={T.purple} bg={T.purpleBg}>{fmt.practiceArea(r.practiceArea)}</Badge>, nowrap: true },
          { header: "Status", render: r => <StatusBadge status={r.status} />, nowrap: true },
          { header: "Billing", render: r => fmt.billingType(r.billingType) },
          { header: "Docs", render: r => Q.docsForMatter(r.id).length, align: "center" },
          { header: "Unbilled", render: r => <span style={{ fontFamily: T.mono }}>{fmt.hoursDecimal(fmt.mins(Q.unbilledTime(Q.timeForMatter(r.id))))}h</span>, align: "right", nowrap: true },
        ]} />
      </Card>
    </div>
  );
};

const TimeKeepingPage = () => {
  const [timerActive, setTimerActive] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => { if (!timerActive) return; const iv = setInterval(() => setElapsed(e => e + 1), 1000); return () => clearInterval(iv); }, [timerActive]);
  const elapsedStr = `${Math.floor(elapsed / 3600)}:${String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>Timekeeping</h1>
        <Btn size="sm"><Icon name="plus" size={13} color={T.bg} /> New Entry</Btn>
      </div>
      <Card style={{ padding: "14px 20px", marginBottom: 20, border: `1px solid rgba(63,118,83,0.3)`, background: "rgba(63,118,83,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "10.5px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.6px", color: T.gold, marginBottom: 2 }}>Timer Running</div>
            <div style={{ fontSize: "13px", color: T.text, fontWeight: 500 }}>Drafting VP Engineering employment agreement</div>
            <div style={{ fontSize: "11px", color: T.textTertiary, marginTop: 2 }}>FL-2026-0004 — Employment Agreements · Marcus Williams</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: "28px", fontWeight: 700, fontFamily: T.mono, color: T.gold }}>{elapsedStr}</span>
            <Btn variant="danger" size="sm" onClick={() => setTimerActive(false)}><Icon name="stop" size={13} color={T.red} /> Stop</Btn>
          </div>
        </div>
      </Card>
      <Card style={{ padding: 0 }}>
        <Table data={DB.timeEntries} columns={[
          { header: "Date", render: r => fmt.dateShort(r.date), nowrap: true },
          { header: "Matter", render: r => <span style={{ fontFamily: T.mono, fontSize: "11px" }}>{DB.matters.find(m => m.id === r.matterId)?.matterNumber}</span> },
          { header: "Attorney", render: r => { const u = Q.user(r.userId); return u ? `${u.firstName} ${u.lastName[0]}.` : "—"; } },
          { header: "Description", render: r => <div style={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</div> },
          { header: "Hours", render: r => <span style={{ fontFamily: T.mono, fontWeight: 600 }}>{fmt.hoursDecimal(r.durationMinutes)}</span>, align: "right", nowrap: true },
          { header: "Amount", render: r => <span style={{ fontFamily: T.mono }}>{fmt.currency((r.durationMinutes / 60) * r.rateAtEntry)}</span>, align: "right", nowrap: true },
          { header: "Status", render: r => <StatusBadge status={r.status} />, nowrap: true },
        ]} />
      </Card>
    </div>
  );
};

const BillingPage = () => {
  const totalCollected = DB.invoices.reduce((s, i) => s + i.amountPaid, 0);
  const totalOutstanding = DB.invoices.reduce((s, i) => s + i.balanceDue, 0);
  const overdueAmt = DB.invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.balanceDue, 0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>Billing & Invoices</h1>
        <Btn size="sm"><Icon name="plus" size={13} color={T.bg} /> Generate Invoice</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <Card style={{ padding: "14px 16px" }}><Stat label="Collected" value={fmt.currency(totalCollected)} color={T.green} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Outstanding" value={fmt.currency(totalOutstanding)} color={T.orange} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Overdue" value={fmt.currency(overdueAmt)} color={T.red} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Unbilled Time" value={fmt.currency(Q.unbilledAmount(DB.timeEntries))} color={T.blue} /></Card>
      </div>
      <Card style={{ padding: 0 }}>
        <Table data={DB.invoices} columns={[
          { header: "Invoice", render: r => <span style={{ fontFamily: T.mono, fontWeight: 600, color: T.gold }}>{r.invoiceNumber}</span>, nowrap: true },
          { header: "Client", render: r => Q.client(r.clientId)?.name },
          { header: "Matter", render: r => DB.matters.find(m => m.id === r.matterId)?.name },
          { header: "Status", render: r => <StatusBadge status={r.status} />, nowrap: true },
          { header: "Issued", render: r => fmt.dateShort(r.issueDate), nowrap: true },
          { header: "Due", render: r => fmt.dateShort(r.dueDate), nowrap: true },
          { header: "Total", render: r => <span style={{ fontFamily: T.mono, fontWeight: 600 }}>{fmt.currency(r.total)}</span>, align: "right", nowrap: true },
          { header: "Paid", render: r => <span style={{ fontFamily: T.mono, color: T.green }}>{fmt.currency(r.amountPaid)}</span>, align: "right", nowrap: true },
          { header: "Balance", render: r => <span style={{ fontFamily: T.mono, fontWeight: 600, color: r.balanceDue > 0 ? T.orange : T.green }}>{fmt.currency(r.balanceDue)}</span>, align: "right", nowrap: true },
        ]} />
      </Card>
    </div>
  );
};

const DashboardPage = ({ nav, currentUser }) => {
  const isAdmin = Q.isAdmin(currentUser.role);
  const myComp = Q.computeUserComp(currentUser.id);
  const totalRevenue = DB.invoices.reduce((s, i) => s + i.amountPaid, 0);
  const outstanding = DB.invoices.reduce((s, i) => s + i.balanceDue, 0);
  const unbilledHrs = DB.timeEntries.filter(e => e.status !== "billed").reduce((s, e) => s + e.durationMinutes, 0) / 60;
  const openMatters = DB.matters.filter(m => m.status === "open").length;
  const myTime = DB.timeEntries.filter(e => e.userId === currentUser.id);
  const myTimeThisMonth = myTime.filter(e => e.date >= "2026-03-01");
  const myHoursMonth = myTimeThisMonth.reduce((s, e) => s + e.durationMinutes, 0) / 60;
  const myMatters = DB.matters.filter(m => m.responsibleAttorneyId === currentUser.id && m.status === "open");
  const overdueTasks = DB.complianceTasks.filter(ct => ct.status === "pending" && ct.dueDate < "2026-03-17");
  const upcomingTasks = DB.complianceTasks.filter(ct => ct.status !== "completed" && ct.dueDate >= "2026-03-17").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>{isAdmin ? "Firm Dashboard" : "My Dashboard"}</h1>
        <p style={{ margin: "2px 0 0", fontSize: "13px", color: T.textTertiary }}>March 12, 2026 · {CONFIG.firm.name}</p>
      </div>

      {/* ── ADMIN: Firm-wide stats ── */}
      {isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
          <Card style={{ padding: "14px 16px" }}><Stat label="Revenue YTD" value={fmt.currency(totalRevenue)} /></Card>
          <Card style={{ padding: "14px 16px" }}><Stat label="Outstanding" value={fmt.currency(outstanding)} color={T.orange} /></Card>
          <Card style={{ padding: "14px 16px" }}><Stat label="Unbilled" value={`${unbilledHrs.toFixed(1)}h`} color={T.blue} /></Card>
          <Card style={{ padding: "14px 16px" }}><Stat label="Open Matters" value={openMatters} /></Card>
          <Card style={{ padding: "14px 16px" }}><Stat label="Overdue Tasks" value={overdueTasks.length} color={overdueTasks.length > 0 ? T.red : T.green} /></Card>
        </div>
      )}

      {/* ── EMPLOYEE: Personal stats ── */}
      {!isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          <Card style={{ padding: "14px 16px" }}><Stat label="My Hours (Mar)" value={`${myHoursMonth.toFixed(1)}h`} sub={`${myTimeThisMonth.length} entries`} /></Card>
          <Card style={{ padding: "14px 16px" }}><Stat label="My Matters" value={myMatters.length} sub="Active" /></Card>
          <Card style={{ padding: "14px 16px" }}><Stat label="Production $" value={fmt.currency(myComp?.production.credit || 0)} color={T.green} /></Card>
          <Card style={{ padding: "14px 16px" }}><Stat label="Total Comp" value={fmt.currency(myComp?.total || 0)} sub={myComp?.tier + " tier"} /></Card>
        </div>
      )}

      {/* ── MY COMPENSATION SUMMARY (all users) ── */}
      {myComp && (
        <Card style={{ padding: 18, marginBottom: 20, border: `1px solid rgba(63,118,83,0.2)`, background: "rgba(63,118,83,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>My Compensation — March 2026</div>
            <Btn variant="ghost" size="sm" onClick={() => nav("compensation")}>View Details</Btn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: "10.5px", color: T.textTertiary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Origination ({(myComp.origination.rate * 100).toFixed(0)}%)</div>
              <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: T.mono, color: T.text, marginTop: 2 }}>{fmt.currency(myComp.origination.credit)}</div>
              <div style={{ fontSize: "11px", color: T.textTertiary }}>{myComp.origination.details.length} matter{myComp.origination.details.length !== 1 ? "s" : ""}</div>
            </div>
            <div>
              <div style={{ fontSize: "10.5px", color: T.textTertiary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Production ({(myComp.production.rate * 100).toFixed(1)}%)</div>
              <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: T.mono, color: T.text, marginTop: 2 }}>{fmt.currency(myComp.production.credit)}</div>
              <div style={{ fontSize: "11px", color: T.textTertiary }}>{myComp.production.details.reduce((s, d) => s + d.hours, 0).toFixed(1)}h billed</div>
            </div>
            <div>
              <div style={{ fontSize: "10.5px", color: T.textTertiary, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Total</div>
              <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: T.mono, color: "#3F7653", marginTop: 2 }}>{fmt.currency(myComp.total)}</div>
              <div style={{ fontSize: "11px", color: T.textTertiary }}>{myComp.tier} tier</div>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "1fr 1fr 1fr" : "1fr 1fr", gap: 16 }}>
        {/* ── ADMIN: Attorney performance ── */}
        {isAdmin && (
          <Card style={{ padding: 18 }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: T.text, marginBottom: 14 }}>Attorney Performance</div>
            {DB.users.filter(u => u.role !== "admin").map(u => {
              const comp = Q.computeUserComp(u.id);
              const hours = DB.timeEntries.filter(t => t.userId === u.id).reduce((s, t) => s + t.durationMinutes, 0) / 60;
              return (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.borderSubtle}` }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: T.text }}>{u.firstName} {u.lastName}</div>
                    <div style={{ fontSize: "11px", color: T.textTertiary }}>{fmt.role(u.role)} · {hours.toFixed(1)}h</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "13px", fontFamily: T.mono, fontWeight: 600, color: T.text }}>{fmt.currency(comp?.total || 0)}</div>
                    <div style={{ fontSize: "10px", color: T.textTertiary }}>comp</div>
                  </div>
                </div>
              );
            })}
          </Card>
        )}

        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: T.text, marginBottom: 14 }}>{isAdmin ? "Active Matters" : "My Matters"}</div>
          {(isAdmin ? DB.matters.filter(m => m.status === "open") : myMatters).map(m => (
            <div key={m.id} onClick={() => nav("matter", m.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", borderRadius: T.radius, cursor: "pointer", marginBottom: 3 }}
              onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: T.text }}>{m.name}</div>
                <div style={{ fontSize: "11px", color: T.textTertiary }}>{m.matterNumber} · {Q.client(m.clientId)?.name}</div>
              </div>
              <Badge color={T.purple} bg={T.purpleBg}>{fmt.practiceArea(m.practiceArea)}</Badge>
            </div>
          ))}
        </Card>

        <Card style={{ padding: 18 }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: T.text, marginBottom: 14 }}>Upcoming Compliance</div>
          {upcomingTasks.map(ct => {
            const entity = DB.entities.find(e => e.id === ct.entityId);
            return (
              <div key={ct.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.borderSubtle}` }}>
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 500, color: T.text }}>{ct.taskName}</div>
                  <div style={{ fontSize: "11px", color: T.textTertiary }}>{entity?.legalName}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "11px", color: T.textTertiary }}>{fmt.dateShort(ct.dueDate)}</div>
                  <StatusBadge status={ct.status} />
                </div>
              </div>
            );
          })}
          {upcomingTasks.length === 0 && <div style={{ fontSize: "12px", color: T.textDim, padding: "10px 0" }}>All compliance tasks up to date</div>}
        </Card>
      </div>
    </div>
  );
};

// ============================================================
// PAGE: COMPENSATION (role-aware)
// ============================================================
const CompensationPage = ({ currentUser }) => {
  const isAdmin = Q.isAdmin(currentUser.role);
  const myComp = Q.computeUserComp(currentUser.id);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>{isAdmin ? "Firm Compensation" : "My Compensation"}</h1>
        <p style={{ margin: "2px 0 0", fontSize: "13px", color: T.textTertiary }}>March 2026 · Collected revenue basis</p>
      </div>

      {/* ── ADMIN: Firm-wide table ── */}
      {isAdmin && (
        <Card style={{ padding: 0, marginBottom: 24 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>All Personnel</div>
          </div>
          <Table
            data={DB.users.filter(u => u.role !== "admin").map(u => ({ ...u, comp: Q.computeUserComp(u.id) })).filter(u => u.comp)}
            columns={[
              { header: "Name", render: r => (<div><div style={{ fontWeight: 600, fontSize: "13px" }}>{r.firstName} {r.lastName}</div><div style={{ fontSize: "11px", color: T.textTertiary }}>{fmt.role(r.role)}</div></div>) },
              { header: "Tier", render: r => <Badge color={T.textTertiary} bg={T.surfaceRaised}>{r.comp.tier}</Badge>, nowrap: true },
              { header: "Orig Rate", render: r => <span style={{ fontFamily: T.mono }}>{(r.comp.origination.rate * 100).toFixed(0)}%</span>, align: "center", nowrap: true },
              { header: "Orig $", render: r => <span style={{ fontFamily: T.mono }}>{fmt.currency(r.comp.origination.credit)}</span>, align: "right", nowrap: true },
              { header: "Prod Rate", render: r => <span style={{ fontFamily: T.mono }}>{(r.comp.production.rate * 100).toFixed(1)}%</span>, align: "center", nowrap: true },
              { header: "Hours", render: r => <span style={{ fontFamily: T.mono }}>{r.comp.production.details.reduce((s, d) => s + d.hours, 0).toFixed(1)}</span>, align: "right", nowrap: true },
              { header: "Prod $", render: r => <span style={{ fontFamily: T.mono }}>{fmt.currency(r.comp.production.credit)}</span>, align: "right", nowrap: true },
              { header: "Total", render: r => <span style={{ fontFamily: T.mono, fontWeight: 700, color: "#3F7653" }}>{fmt.currency(r.comp.total)}</span>, align: "right", nowrap: true },
            ]}
          />
        </Card>
      )}

      {/* ── Personal detail (shown to all users) ── */}
      {myComp && (
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: T.text, marginBottom: 14 }}>{isAdmin ? `My Detail — ${currentUser.firstName} ${currentUser.lastName}` : ""}</div>

          {/* Origination */}
          <Card style={{ padding: 18, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>Origination Credit</div>
              <div style={{ fontSize: "11px", color: T.textTertiary }}>{myComp.tier} tier · {(myComp.origination.rate * 100).toFixed(0)}% rate</div>
            </div>
            {myComp.origination.details.length > 0 ? (
              <Table data={myComp.origination.details} columns={[
                { header: "Matter", render: r => (<div><div style={{ fontWeight: 600, fontSize: "13px" }}>{r.name}</div><div style={{ fontSize: "11px", fontFamily: T.mono, color: T.textTertiary }}>{r.matterNumber}</div></div>) },
                { header: "Collected", render: r => <span style={{ fontFamily: T.mono }}>{fmt.currency(r.collected)}</span>, align: "right", nowrap: true },
                { header: "Pool Rate", render: r => <span style={{ fontFamily: T.mono }}>{(r.poolRate * 100).toFixed(0)}%</span>, align: "center", nowrap: true },
                { header: "My Split", render: r => <span style={{ fontFamily: T.mono }}>{(r.splitPct * 100).toFixed(0)}%</span>, align: "center", nowrap: true },
                { header: "Credit", render: r => <span style={{ fontFamily: T.mono, fontWeight: 700, color: "#3F7653" }}>{fmt.currency(r.credit)}</span>, align: "right", nowrap: true },
              ]} />
            ) : (
              <div style={{ padding: "16px 0", color: T.textDim, fontSize: "12.5px" }}>No origination credits this period</div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 14px 0", borderTop: `1px solid ${T.borderSubtle}`, marginTop: 8 }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>Total Origination: <span style={{ fontFamily: T.mono, color: "#3F7653" }}>{fmt.currency(myComp.origination.credit)}</span></span>
            </div>
          </Card>

          {/* Production */}
          <Card style={{ padding: 18, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>Production Credit</div>
              <div style={{ fontSize: "11px", color: T.textTertiary }}>{myComp.tier} tier · {(myComp.production.rate * 100).toFixed(1)}% rate</div>
            </div>
            {myComp.production.details.length > 0 ? (
              <Table data={myComp.production.details} columns={[
                { header: "Matter", render: r => (<div><div style={{ fontWeight: 600, fontSize: "13px" }}>{r.name}</div><div style={{ fontSize: "11px", fontFamily: T.mono, color: T.textTertiary }}>{r.matterNumber}</div></div>) },
                { header: "Hours", render: r => <span style={{ fontFamily: T.mono }}>{r.hours.toFixed(1)}</span>, align: "right", nowrap: true },
                { header: "Billable", render: r => <span style={{ fontFamily: T.mono }}>{fmt.currency(r.billable)}</span>, align: "right", nowrap: true },
                { header: "Credit", render: r => <span style={{ fontFamily: T.mono, fontWeight: 700, color: "#3F7653" }}>{fmt.currency(r.credit)}</span>, align: "right", nowrap: true },
              ]} />
            ) : (
              <div style={{ padding: "16px 0", color: T.textDim, fontSize: "12.5px" }}>No production credits this period</div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px 14px 0", borderTop: `1px solid ${T.borderSubtle}`, marginTop: 8 }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>Total Production: <span style={{ fontFamily: T.mono, color: "#3F7653" }}>{fmt.currency(myComp.production.credit)}</span></span>
            </div>
          </Card>

          {/* Grand Total */}
          <Card style={{ padding: "16px 18px", background: "rgba(63,118,83,0.04)", border: `1px solid rgba(63,118,83,0.15)` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>Total Compensation — March 2026</div>
              <div style={{ fontSize: "24px", fontWeight: 800, fontFamily: T.mono, color: "#3F7653" }}>{fmt.currency(myComp.total)}</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PAGE: ENTITIES (firm-wide view)
// ============================================================
const EntitiesPage = ({ nav }) => {
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("all");
  const allStates = [...new Set(DB.entities.map(e => e.stateOfFormation))].sort();
  const filtered = DB.entities.filter(e => {
    if (filterState !== "all" && e.stateOfFormation !== filterState) return false;
    if (search && !e.legalName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>Entities</h1><p style={{ margin: "2px 0 0", fontSize: "13px", color: T.textTertiary }}>{DB.entities.length} entities · {DB.complianceTasks.filter(ct => ct.status !== "completed").length} pending tasks</p></div>
        <Btn size="sm"><Icon name="plus" size={13} color={T.bg} /> New Entity</Btn>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <Input value={search} onChange={setSearch} placeholder="Search entities..." icon="search" style={{ flex: 1 }} />
        <Select value={filterState} onChange={setFilterState} options={[{ value: "all", label: "All States" }, ...allStates.map(s => ({ value: s, label: s }))]} />
      </div>

      {/* Compliance summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <Card style={{ padding: "12px 14px" }}><Stat label="Completed" value={DB.complianceTasks.filter(ct => ct.status === "completed").length} color={T.green} /></Card>
        <Card style={{ padding: "12px 14px" }}><Stat label="Pending" value={DB.complianceTasks.filter(ct => ct.status === "pending").length} color={T.orange} /></Card>
        <Card style={{ padding: "12px 14px" }}><Stat label="In Progress" value={DB.complianceTasks.filter(ct => ct.status === "in_progress").length} color={T.blue} /></Card>
        <Card style={{ padding: "12px 14px" }}><Stat label="Overdue" value={DB.complianceTasks.filter(ct => ct.status === "pending" && ct.dueDate < "2026-03-17").length} color={T.red} /></Card>
      </div>

      <Card style={{ padding: 0 }}>
        <Table data={filtered} onRowClick={e => nav("client", e.clientId)} columns={[
          { header: "Entity", render: r => (<div><div style={{ fontWeight: 600, fontSize: "13px" }}>{r.legalName}</div><div style={{ fontSize: "11px", color: T.textTertiary }}>{Q.client(r.clientId)?.name}</div></div>) },
          { header: "Type", render: r => <Badge color={T.purple} bg={T.purpleBg}>{r.entityType}</Badge>, nowrap: true },
          { header: "State", render: r => <Badge color={T.blue} bg={T.blueBg}>{r.stateOfFormation}</Badge>, nowrap: true },
          { header: "Status", render: r => <StatusBadge status={r.status} />, nowrap: true },
          { header: "Formed", render: r => fmt.dateShort(r.formationDate), nowrap: true },
          { header: "Tasks", render: r => { const tasks = Q.complianceForEntity(r.id); const pending = tasks.filter(t => t.status !== "completed").length; return <span style={{ fontFamily: T.mono, color: pending > 0 ? T.orange : T.green }}>{pending}/{tasks.length}</span>; }, align: "center", nowrap: true },
          { header: "RA", render: r => r.registeredAgentName ? <span style={{ fontSize: "11px", color: T.textTertiary }}>{r.registeredAgentName}</span> : "—" },
        ]} />
      </Card>
    </div>
  );
};

// ============================================================
// PAGE: ADMIN PORTAL CONTROLS
// ============================================================
const PortalControlsPage = ({ nav }) => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [shareDocModal, setShareDocModal] = useState(null);

  // Mock portal state per client
  const [portalState, setPortalState] = useState({
    c1: { enabled: true, email: "jamie@techventure.com", sharedDocs: ["d1", "d2", "d4", "d5", "d10"], visibleMatters: ["m1", "m4", "m5"] },
    c2: { enabled: false, email: "", sharedDocs: [], visibleMatters: [] },
    c3: { enabled: true, email: "info@greenleafprops.com", sharedDocs: ["d8"], visibleMatters: ["m3", "m6"] },
    c4: { enabled: false, email: "", sharedDocs: [], visibleMatters: [] },
    c5: { enabled: false, email: "", sharedDocs: [], visibleMatters: [] },
  });

  const togglePortal = (clientId) => {
    setPortalState(prev => ({ ...prev, [clientId]: { ...prev[clientId], enabled: !prev[clientId]?.enabled } }));
  };

  const clientForDetail = selectedClient ? DB.clients.find(c => c.id === selectedClient) : null;
  const ps = selectedClient ? portalState[selectedClient] || { enabled: false, email: "", sharedDocs: [], visibleMatters: [] } : null;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>Portal Administration</h1>
        <p style={{ margin: "2px 0 0", fontSize: "13px", color: T.textTertiary }}>Manage client portal access, shared documents, and visibility settings</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
        {/* Client list */}
        <Card style={{ padding: 0, alignSelf: "start" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, fontSize: "12px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px" }}>Clients</div>
          {DB.clients.map(c => {
            const cp = portalState[c.id] || {};
            const isSelected = selectedClient === c.id;
            return (
              <div key={c.id} onClick={() => setSelectedClient(c.id)}
                style={{ padding: "12px 16px", borderBottom: `1px solid ${T.borderSubtle}`, cursor: "pointer", background: isSelected ? T.surfaceRaised : "transparent", transition: "background 0.1s" }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(63,118,83,0.02)"; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: T.text }}>{c.name}</div>
                    <div style={{ fontSize: "11px", color: T.textTertiary }}>{c.email}</div>
                  </div>
                  <div style={{ width: 36, height: 20, borderRadius: 10, background: cp.enabled ? "#3F7653" : T.border, position: "relative", transition: "background 0.2s", cursor: "pointer" }}
                    onClick={(e) => { e.stopPropagation(); togglePortal(c.id); }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: cp.enabled ? 18 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </Card>

        {/* Detail panel */}
        {clientForDetail && ps ? (
          <div>
            {/* Portal settings */}
            <Card style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: T.text }}>{clientForDetail.name}</div>
                  <div style={{ fontSize: "12px", color: T.textTertiary }}>Portal Access Settings</div>
                </div>
                <Badge color={ps.enabled ? "#3F7653" : T.textTertiary} bg={ps.enabled ? "rgba(63,118,83,0.1)" : T.surfaceRaised}>{ps.enabled ? "Portal Active" : "Portal Disabled"}</Badge>
              </div>

              {/* Portal Users */}
              <div style={{ fontSize: "12px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Portal Users</div>
              {Q.portalUsersForClient(selectedClient).length > 0 ? (
                <div style={{ marginBottom: 12 }}>
                  {Q.portalUsersForClient(selectedClient).map(pu => (
                    <div key={pu.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.borderSubtle}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800, color: "#3F7653" }}>
                          {pu.firstName[0]}{pu.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: T.text }}>{pu.firstName} {pu.lastName} {pu.title && <span style={{ color: T.textTertiary }}>· {pu.title}</span>}</div>
                          <div style={{ fontSize: "11px", color: T.textTertiary }}>{pu.email}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Btn variant="ghost" size="sm" disabled={!ps.enabled}><Icon name="mail" size={12} color={T.textSecondary} /> Send Link</Btn>
                        <StatusBadge status={pu.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: "12px 0", fontSize: "12px", color: T.textDim }}>No portal users configured</div>
              )}
              <Btn size="sm" variant="ghost" disabled={!ps.enabled}><Icon name="plus" size={12} color={T.textSecondary} /> Add Portal User</Btn>
            </Card>

            {/* Shared Documents */}
            <Card style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>Shared Documents ({ps.sharedDocs.length})</div>
                <Btn size="sm" onClick={() => setShareDocModal(selectedClient)}><Icon name="plus" size={13} color={T.bg} /> Share Document</Btn>
              </div>
              {ps.sharedDocs.length > 0 ? (
                <div>
                  {ps.sharedDocs.map(docId => {
                    const doc = DB.documents.find(d => d.id === docId);
                    if (!doc) return null;
                    return (
                      <div key={docId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.borderSubtle}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Icon name="documents" size={14} color="#3F7653" />
                          <div>
                            <div style={{ fontSize: "13px", fontWeight: 500, color: T.text }}>{doc.title}</div>
                            <div style={{ fontSize: "11px", color: T.textTertiary }}>{doc.currentVersion.fileName} · v{doc.currentVersion.versionNumber}</div>
                          </div>
                        </div>
                        <Btn variant="ghost" size="sm" style={{ color: T.red, fontSize: "11px" }}>Unshare</Btn>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: "20px 0", textAlign: "center", color: T.textDim, fontSize: "12.5px" }}>No documents shared with this client yet</div>
              )}
            </Card>

            {/* Visible Matters */}
            <Card style={{ padding: 20 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: T.text, marginBottom: 14 }}>Matter Visibility</div>
              <div style={{ fontSize: "12px", color: T.textTertiary, marginBottom: 12 }}>Control which matters the client can see in their portal. Matter names and status are visible; descriptions and internal notes are always hidden.</div>
              {Q.mattersForClient(selectedClient).map(m => {
                const visible = ps.visibleMatters.includes(m.id);
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.borderSubtle}` }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: T.text }}>{m.name}</div>
                      <div style={{ fontSize: "11px", fontFamily: T.mono, color: T.textTertiary }}>{m.matterNumber} · <StatusBadge status={m.status} /></div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "11px", color: visible ? "#3F7653" : T.textDim }}>{visible ? "Visible" : "Hidden"}</span>
                      <div style={{ width: 36, height: 20, borderRadius: 10, background: visible ? "#3F7653" : T.border, position: "relative", cursor: "pointer", transition: "background 0.2s" }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: visible ? 18 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
            <div style={{ textAlign: "center" }}>
              <Icon name="clients" size={32} color={T.textDim} />
              <div style={{ fontSize: "14px", color: T.textDim, marginTop: 10 }}>Select a client to manage their portal settings</div>
            </div>
          </div>
        )}
      </div>

      {/* Share Document Modal */}
      <Modal open={!!shareDocModal} onClose={() => setShareDocModal(null)} title="Share Document with Client" width={550}>
        <div style={{ fontSize: "12px", color: T.textTertiary, marginBottom: 14 }}>Select documents to share with {clientForDetail?.name}. Shared documents will appear in their portal.</div>
        {(() => {
          const clientDocs = Q.docsForClient(shareDocModal || "");
          const alreadyShared = portalState[shareDocModal]?.sharedDocs || [];
          const unshared = clientDocs.filter(d => !alreadyShared.includes(d.id));
          return unshared.length > 0 ? unshared.map(doc => (
            <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: T.radius, marginBottom: 4, background: T.surfaceRaised }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Icon name="documents" size={14} color="#3F7653" />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: T.text }}>{doc.title}</div>
                  <div style={{ fontSize: "11px", color: T.textTertiary }}>{DB.matters.find(m => m.id === doc.matterId)?.matterNumber} · v{doc.currentVersion.versionNumber}</div>
                </div>
              </div>
              <Btn size="sm" onClick={() => setShareDocModal(null)}>Share</Btn>
            </div>
          )) : <div style={{ padding: 20, textAlign: "center", color: T.textDim }}>All documents already shared</div>;
        })()}
      </Modal>
    </div>
  );
};

// ============================================================
// PAGE: COMPLIANCE DASHBOARD
// ============================================================
const ComplianceDashboardPage = ({ nav }) => {
  const [viewMode, setViewMode] = useState("calendar"); // calendar | list | byState
  const allTasks = DB.complianceTasks;
  const now = "2026-03-17";

  const overdue = allTasks.filter(t => t.status !== "completed" && t.dueDate < now);
  const pending = allTasks.filter(t => t.status === "pending");
  const inProgress = allTasks.filter(t => t.status === "in_progress");
  const completed = allTasks.filter(t => t.status === "completed");

  // Group tasks by month for calendar view
  const tasksByMonth = {};
  allTasks.forEach(t => {
    const month = t.dueDate.slice(0, 7); // "2026-03"
    if (!tasksByMonth[month]) tasksByMonth[month] = [];
    tasksByMonth[month].push(t);
  });
  const months = Object.keys(tasksByMonth).sort();

  // Group by state
  const tasksByState = {};
  allTasks.forEach(t => {
    const entity = DB.entities.find(e => e.id === t.entityId);
    const state = entity?.stateOfFormation || "Unknown";
    if (!tasksByState[state]) tasksByState[state] = [];
    tasksByState[state].push(t);
  });

  const monthNames = { "01": "January", "02": "February", "03": "March", "04": "April", "05": "May", "06": "June", "07": "July", "08": "August", "09": "September", "10": "October", "11": "November", "12": "December" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>Compliance Dashboard</h1>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: T.textTertiary }}>{DB.entities.length} entities · {allTasks.length} tasks tracked</p>
        </div>
        <div style={{ display: "flex", gap: 4, background: T.surfaceRaised, borderRadius: T.radius, padding: 3 }}>
          {[{ id: "calendar", label: "Calendar" }, { id: "list", label: "List" }, { id: "byState", label: "By State" }].map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id)}
              style={{ padding: "6px 14px", fontSize: "11.5px", fontWeight: 600, fontFamily: T.font, border: "none", borderRadius: "5px", cursor: "pointer", background: viewMode === v.id ? T.card : "transparent", color: viewMode === v.id ? T.text : T.textTertiary, boxShadow: viewMode === v.id ? "0 1px 3px rgba(33,59,43,0.08)" : "none" }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <Card style={{ padding: "14px 16px", border: overdue.length > 0 ? `1px solid rgba(192,57,43,0.2)` : undefined, background: overdue.length > 0 ? "rgba(192,57,43,0.03)" : undefined }}>
          <Stat label="Overdue" value={overdue.length} color={overdue.length > 0 ? T.red : T.green} sub={overdue.length > 0 ? "Needs immediate attention" : "All clear"} />
        </Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Pending" value={pending.length} color={T.orange} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="In Progress" value={inProgress.length} color={T.blue} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Completed" value={completed.length} color={T.green} /></Card>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <Card style={{ padding: "14px 18px", marginBottom: 20, background: "rgba(192,57,43,0.04)", border: `1px solid rgba(192,57,43,0.15)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <Icon name="alert" size={18} color={T.red} />
            <span style={{ fontSize: "13px", fontWeight: 700, color: T.red }}>Overdue Tasks ({overdue.length})</span>
          </div>
          {overdue.map(t => {
            const entity = DB.entities.find(e => e.id === t.entityId);
            return (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid rgba(192,57,43,0.08)` }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: T.text }}>{t.taskName}</span>
                  <span style={{ fontSize: "12px", color: T.textTertiary, marginLeft: 8 }}>{entity?.legalName}</span>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 600, color: T.red }}>Due {fmt.dateShort(t.dueDate)}</span>
              </div>
            );
          })}
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div>
          {months.map(month => {
            const [year, mon] = month.split("-");
            const tasks = tasksByMonth[month];
            const isPast = month < now.slice(0, 7);
            return (
              <Card key={month} style={{ padding: 0, marginBottom: 14 }}>
                <div style={{ padding: "12px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: isPast ? T.surfaceRaised : "transparent" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>{monthNames[mon]} {year}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Badge color={T.green} bg={T.accentBg}>{tasks.filter(t => t.status === "completed").length} done</Badge>
                    {tasks.filter(t => t.status !== "completed").length > 0 && (
                      <Badge color={T.orange} bg={T.orangeBg}>{tasks.filter(t => t.status !== "completed").length} pending</Badge>
                    )}
                  </div>
                </div>
                <Table data={tasks} columns={[
                  { header: "Task", render: r => <span style={{ fontWeight: 600, fontSize: "13px" }}>{r.taskName}</span> },
                  { header: "Entity", render: r => { const e = DB.entities.find(en => en.id === r.entityId); return e ? <span style={{ cursor: "pointer" }} onClick={() => nav("client", e.clientId)}>{e.legalName}</span> : "—"; } },
                  { header: "Client", render: r => { const e = DB.entities.find(en => en.id === r.entityId); return e ? Q.client(e.clientId)?.name : "—"; } },
                  { header: "Due", render: r => <span style={{ fontFamily: T.mono, fontSize: "12px" }}>{fmt.dateShort(r.dueDate)}</span>, nowrap: true },
                  { header: "Status", render: r => <StatusBadge status={r.status} />, nowrap: true },
                  { header: "", render: r => r.notes ? <span style={{ fontSize: "11px", color: T.textTertiary, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{r.notes}</span> : null },
                ]} />
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card style={{ padding: 0 }}>
          <Table data={allTasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate))} columns={[
            { header: "Task", render: r => <span style={{ fontWeight: 600, fontSize: "13px" }}>{r.taskName}</span> },
            { header: "Entity", render: r => { const e = DB.entities.find(en => en.id === r.entityId); return e?.legalName || "—"; } },
            { header: "Client", render: r => { const e = DB.entities.find(en => en.id === r.entityId); return e ? Q.client(e.clientId)?.name : "—"; } },
            { header: "State", render: r => { const e = DB.entities.find(en => en.id === r.entityId); return e ? <Badge color={T.blue} bg={T.blueBg}>{e.stateOfFormation}</Badge> : "—"; }, nowrap: true },
            { header: "Due", render: r => <span style={{ fontFamily: T.mono, fontSize: "12px", color: r.dueDate < now && r.status !== "completed" ? T.red : T.text }}>{fmt.dateShort(r.dueDate)}</span>, nowrap: true },
            { header: "Status", render: r => <StatusBadge status={r.status} />, nowrap: true },
          ]} />
        </Card>
      )}

      {/* By State View */}
      {viewMode === "byState" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {Object.entries(tasksByState).sort(([a], [b]) => a.localeCompare(b)).map(([state, tasks]) => {
            const pendingCount = tasks.filter(t => t.status !== "completed").length;
            const completedCount = tasks.filter(t => t.status === "completed").length;
            return (
              <Card key={state} style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Badge color={T.blue} bg={T.blueBg}>{state}</Badge>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {completedCount > 0 && <Badge color={T.green} bg={T.accentBg}>{completedCount} done</Badge>}
                    {pendingCount > 0 && <Badge color={T.orange} bg={T.orangeBg}>{pendingCount} pending</Badge>}
                  </div>
                </div>
                {tasks.map(t => {
                  const entity = DB.entities.find(e => e.id === t.entityId);
                  return (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${T.borderSubtle}` }}>
                      <div>
                        <div style={{ fontSize: "12.5px", fontWeight: 500, color: T.text }}>{t.taskName}</div>
                        <div style={{ fontSize: "11px", color: T.textTertiary }}>{entity?.legalName}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: "11px", fontFamily: T.mono, color: T.textTertiary }}>{fmt.dateShort(t.dueDate)}</span>
                        <StatusBadge status={t.status} />
                      </div>
                    </div>
                  );
                })}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ============================================================
// PAGE: GAVEL INTEGRATION
// ============================================================
const GavelPage = ({ nav }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchClient, setLaunchClient] = useState("");
  const [syncLogView, setSyncLogView] = useState(false);

  const workflows = [
    { id: "gv1", name: "Delaware Incorporation", category: "Corporate", status: "ready", docsGenerated: ["Certificate of Incorporation", "Bylaws", "Board Consent", "Founder RSPAs", "Founder EAICAs", "Form SS-4", "Action of Incorporator"], fields: ["Company Name", "Legal Address + County", "Founder Names", "Founder Addresses", "Founder Emails", "Board Configuration", "Officer Slate (CEO, Secretary, etc.)", "Ownership Split (%)", "Vesting Schedule", "Incorporator"], autoCreates: { matter: true, entity: true, compliance: true, practiceArea: "corporate" }, usageCount: 14 },
    { id: "gv2", name: "Unilateral NDA", category: "Corporate", status: "ready", docsGenerated: ["Non-Disclosure Agreement (One-Way)"], fields: ["Disclosing Party", "Receiving Party", "Purpose", "Duration"], autoCreates: { matter: false }, usageCount: 22 },
    { id: "gv3", name: "Mutual NDA", category: "Corporate", status: "ready", docsGenerated: ["Mutual Non-Disclosure Agreement"], fields: ["Party A", "Party B", "Purpose", "Duration"], autoCreates: { matter: false }, usageCount: 18 },
    { id: "gv4", name: "Founders Agreement", category: "Corporate", status: "ready", docsGenerated: ["Founders Agreement"], fields: ["Company Name", "Founder Names", "Roles", "Equity Split", "Vesting", "IP Assignment"], autoCreates: { matter: false }, usageCount: 8 },
    { id: "gv5", name: "New Hire Documents", category: "Employment", status: "ready", docsGenerated: ["Employee Offer Letter", "EIACA"], fields: ["Company", "Employee Name", "Title", "Start Date", "Salary", "Equity Grant"], autoCreates: { matter: false }, usageCount: 31 },
    { id: "gv6", name: "Advisor Agreement (DE)", category: "Employment", status: "ready", docsGenerated: ["Advisor Agreement (Entity or Individual)"], fields: ["Company", "Advisor Name", "Advisor Type", "Equity Grant", "Term"], autoCreates: { matter: false }, usageCount: 12 },
    { id: "gv7", name: "Consulting Agreement (DE)", category: "Employment", status: "ready", docsGenerated: ["Consulting Agreement (Entity or Individual)"], fields: ["Company", "Consultant", "Scope", "Compensation", "Term"], autoCreates: { matter: false }, usageCount: 15 },
    { id: "gv8", name: "EIP Adoption", category: "Employment", status: "ready", docsGenerated: ["Board Consent Adopting EIP", "EIP RSGA Exhibit", "RSPA under EIP", "Stockholder Consent", "Equity Incentive Plan", "Stock Option Grant"], fields: ["Company", "Plan Size", "Board Members", "Stockholders"], autoCreates: { matter: false }, usageCount: 9 },
    { id: "gv9", name: "SM Delaware LLC Formation", category: "Corporate", status: "ready", docsGenerated: ["Certificate of Formation", "LLC Agreement", "Member Consent", "SS-4 + Authorization"], fields: ["LLC Name", "Member Name", "Member Address", "Registered Agent", "Business Purpose"], autoCreates: { matter: true, entity: true, compliance: true, practiceArea: "corporate" }, usageCount: 6 },
    { id: "gv10", name: "Form 83(b)", category: "Corporate/Employment", status: "ready", docsGenerated: ["Form 83(b) Election"], fields: ["Taxpayer Name", "SSN (last 4)", "Property Description", "FMV", "Amount Paid"], autoCreates: { matter: false }, usageCount: 19 },
    { id: "gv11", name: "SM Illinois LLC Formation", category: "Corporate", status: "dev", docsGenerated: ["Articles of Organization", "LLC Agreement", "Member Consent", "SS-4"], fields: ["LLC Name", "Member Info", "Registered Agent", "Business Purpose"], autoCreates: { matter: true, entity: true, compliance: true, practiceArea: "corporate" }, usageCount: 0 },
  ];

  const syncLog = [
    { id: "sl1", workflow: "Delaware Incorporation", client: "TechVenture Inc.", matter: "FL-2025-0009", status: "success", docsCreated: 7, entityCreated: true, timestamp: "2025-06-15T14:30:00Z" },
    { id: "sl2", workflow: "New Hire Documents", client: "TechVenture Inc.", matter: "FL-2026-0004", status: "success", docsCreated: 2, entityCreated: false, timestamp: "2026-03-01T10:15:00Z" },
    { id: "sl3", workflow: "Mutual NDA", client: "Cascade Biotech", matter: null, status: "success", docsCreated: 1, entityCreated: false, timestamp: "2026-03-05T16:00:00Z" },
    { id: "sl4", workflow: "SM Delaware LLC Formation", client: "TechVenture Inc.", matter: "FL-2024-0022", status: "success", docsCreated: 4, entityCreated: true, timestamp: "2024-08-20T09:45:00Z" },
    { id: "sl5", workflow: "EIP Adoption", client: "TechVenture Inc.", matter: "FL-2025-0011", status: "success", docsCreated: 6, entityCreated: false, timestamp: "2025-11-10T11:30:00Z" },
  ];

  const wf = selectedWorkflow ? workflows.find(w => w.id === selectedWorkflow) : null;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>Gavel Integration</h1>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: T.textTertiary }}>CoFounderKit document automation · {workflows.filter(w => w.status === "ready").length} workflows active</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant={syncLogView ? "gold" : "ghost"} size="sm" onClick={() => setSyncLogView(!syncLogView)}>
            <Icon name="version" size={13} color={syncLogView ? T.bg : T.textSecondary} /> Sync Log
          </Btn>
          <Btn size="sm" onClick={() => setShowLaunchModal(true)}>
            <Icon name="external" size={13} color={T.bg} /> Launch Workflow
          </Btn>
        </div>
      </div>

      {/* Sync Log View */}
      {syncLogView && (
        <Card style={{ padding: 0, marginBottom: 20 }}>
          <div style={{ padding: "12px 18px", borderBottom: `1px solid ${T.border}`, fontSize: "13px", fontWeight: 700, color: T.text }}>Recent Webhook Activity</div>
          <Table data={syncLog} columns={[
            { header: "Workflow", render: r => <span style={{ fontWeight: 600, fontSize: "13px" }}>{r.workflow}</span> },
            { header: "Client", render: r => r.client },
            { header: "Matter", render: r => r.matter ? <span style={{ fontFamily: T.mono, fontSize: "11px" }}>{r.matter}</span> : <span style={{ color: T.textDim }}>—</span> },
            { header: "Docs", render: r => <span style={{ fontFamily: T.mono }}>{r.docsCreated}</span>, align: "center", nowrap: true },
            { header: "Entity", render: r => r.entityCreated ? <Badge color={T.green} bg={T.accentBg}>Created</Badge> : <span style={{ color: T.textDim }}>—</span>, nowrap: true },
            { header: "Status", render: r => <Badge color={T.green} bg={T.accentBg}>{r.status}</Badge>, nowrap: true },
            { header: "When", render: r => fmt.dateShort(r.timestamp.split("T")[0]), nowrap: true },
          ]} />
        </Card>
      )}

      {/* Workflow Grid + Detail */}
      <div style={{ display: "grid", gridTemplateColumns: wf ? "1fr 1fr" : "1fr", gap: 16 }}>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {workflows.map(w => (
              <Card key={w.id} onClick={() => setSelectedWorkflow(w.id)}
                style={{ padding: "16px 18px", cursor: "pointer", border: selectedWorkflow === w.id ? `2px solid #3F7653` : `1px solid ${T.borderSubtle}`, transition: "all 0.15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>{w.name}</div>
                  {w.status === "dev" ? <Badge color={T.orange} bg={T.orangeBg}>Dev</Badge> : <Badge color={T.green} bg={T.accentBg}>Ready</Badge>}
                </div>
                <div style={{ fontSize: "11px", color: T.textTertiary, marginBottom: 6 }}>{w.category}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: T.textTertiary }}>{w.docsGenerated.length} docs</span>
                  <span style={{ fontSize: "11px", fontFamily: T.mono, color: T.textDim }}>{w.usageCount} uses</span>
                </div>
                {w.autoCreates?.entity && (
                  <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                    <Badge color={T.purple} bg={T.purpleBg} style={{ fontSize: "9px" }}>Auto-Entity</Badge>
                    <Badge color={T.blue} bg={T.blueBg} style={{ fontSize: "9px" }}>Auto-Compliance</Badge>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Workflow Detail */}
        {wf && (
          <Card style={{ padding: 20, alignSelf: "start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: T.text }}>{wf.name}</div>
                <div style={{ fontSize: "12px", color: T.textTertiary }}>{wf.category} · {wf.usageCount} uses</div>
              </div>
              <Btn size="sm" disabled={wf.status === "dev"} onClick={() => { setLaunchClient(""); setShowLaunchModal(true); }}>
                <Icon name="external" size={13} color={T.bg} /> Launch
              </Btn>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Required Information</div>
              {wf.fields.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", fontSize: "12.5px", color: T.textSecondary }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: T.textDim, flexShrink: 0 }} />{f}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Documents Generated</div>
              {wf.docsGenerated.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", fontSize: "12.5px", color: T.text }}>
                  <Icon name="documents" size={12} color="#3F7653" />{d}
                </div>
              ))}
            </div>

            {wf.autoCreates?.entity && (
              <div style={{ padding: "12px 14px", background: T.accentBg, borderRadius: T.radius, border: `1px solid rgba(63,118,83,0.12)` }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#3F7653", marginBottom: 6 }}>Auto-Creates in Abbado</div>
                <div style={{ fontSize: "12px", color: T.textSecondary, lineHeight: 1.5 }}>
                  When this form is submitted, Abbado automatically creates a new <strong>matter</strong> ({fmt.practiceArea(wf.autoCreates.practiceArea)}), a new <strong>entity</strong> record, and generates the standard <strong>compliance calendar</strong> for the formation state. All generated documents are uploaded and linked.
                </div>
              </div>
            )}

            {!wf.autoCreates?.entity && (
              <div style={{ padding: "12px 14px", background: T.surfaceRaised, borderRadius: T.radius }}>
                <div style={{ fontSize: "12px", color: T.textTertiary, lineHeight: 1.5 }}>
                  Documents from this workflow are uploaded to the selected matter. No entity or compliance tasks are auto-created.
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Launch Modal */}
      <Modal open={showLaunchModal} onClose={() => setShowLaunchModal(false)} title="Launch Gavel Workflow" width={500}>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Select Client</div>
          <select value={launchClient} onChange={e => setLaunchClient(e.target.value)}
            style={{ width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font, color: T.text, background: T.surface }}>
            <option value="">Choose a client...</option>
            {DB.clients.filter(c => c.status === "active").map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="__new__">+ New Client</option>
          </select>
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Select Workflow</div>
          <select style={{ width: "100%", padding: "9px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font, color: T.text, background: T.surface }}>
            {workflows.filter(w => w.status === "ready").map(w => <option key={w.id} value={w.id}>{w.name} ({w.docsGenerated.length} docs)</option>)}
          </select>
        </div>
        {launchClient && launchClient !== "__new__" && (
          <div style={{ padding: "12px 14px", background: T.accentBg, borderRadius: T.radius, marginBottom: 14 }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#3F7653", marginBottom: 4 }}>Prefill from Abbado</div>
            <div style={{ fontSize: "12px", color: T.textSecondary }}>Client name, address, email, and phone will be pre-populated in the Gavel form. The attorney completes the remaining fields.</div>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <Btn variant="ghost" onClick={() => setShowLaunchModal(false)}>Cancel</Btn>
          <Btn disabled={!launchClient} onClick={() => { setShowLaunchModal(false); alert("This would open the Gavel form in a new tab with prefilled data"); }}>
            <Icon name="external" size={13} color={T.bg} /> Open in Gavel
          </Btn>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================
// PAGE: PRE-BILL WORKFLOW
// ============================================================
const PreBillPage = ({ currentUser }) => {
  const isAdmin = Q.isAdmin(currentUser.role);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedBill, setSelectedBill] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  // Mock pre-bills
  const preBills = [
    { id: "pb1", matterId: "m1", matterNumber: "FL-2026-0001", matterName: "Series B Financing", clientName: "TechVenture Inc.", responsibleAttyId: "u1", status: "pending_review", generatedAt: "2026-03-11", entries: [
      { id: "pbe1", userId: "u1", userName: "Sarah Chen", date: "2026-03-10", description: "Reviewed and revised investor rights agreement anti-dilution provisions", hours: 2.0, rate: 450, amount: 900, included: true },
      { id: "pbe2", userId: "u1", userName: "Sarah Chen", date: "2026-03-09", description: "Call with Sequoia counsel re: board composition and protective provisions", hours: 1.5, rate: 450, amount: 675, included: true },
      { id: "pbe3", userId: "u2", userName: "Marcus Williams", date: "2026-03-08", description: "Drafted Stock Purchase Agreement sections 5-8 (reps & warranties)", hours: 3.0, rate: 325, amount: 975, included: true },
      { id: "pbe4", userId: "u3", userName: "Priya Patel", date: "2026-03-07", description: "Updated cap table with Series B terms and option pool expansion", hours: 1.0, rate: 175, amount: 175, included: true },
    ]},
    { id: "pb2", matterId: "m3", matterNumber: "FL-2026-0003", matterName: "Commercial Lease — 500 Howard", clientName: "GreenLeaf Properties LLC", responsibleAttyId: "u1", status: "pending_review", generatedAt: "2026-03-11", entries: [
      { id: "pbe5", userId: "u1", userName: "Sarah Chen", date: "2026-03-07", description: "Initial lease review and competitive term comparison with market data", hours: 1.5, rate: 450, amount: 675, included: true },
      { id: "pbe6", userId: "u1", userName: "Sarah Chen", date: "2026-03-05", description: "Review environmental assessment report findings", hours: 0.75, rate: 450, amount: 337.50, included: true },
    ]},
    { id: "pb3", matterId: "m4", matterNumber: "FL-2026-0004", matterName: "Employment Agreements", clientName: "TechVenture Inc.", responsibleAttyId: "u4", status: "pending_review", generatedAt: "2026-03-11", entries: [
      { id: "pbe7", userId: "u4", userName: "David Kim", date: "2026-03-11", description: "Drafted VP Engineering employment agreement with equity cliff/vesting provisions", hours: 2.5, rate: 300, amount: 750, included: true },
      { id: "pbe8", userId: "u4", userName: "David Kim", date: "2026-03-10", description: "Research California non-compete enforceability post-2024 changes", hours: 2.0, rate: 300, amount: 600, included: true },
    ]},
  ];

  const approvedBills = [
    { id: "pb0", matterNumber: "FL-2026-0002", matterName: "H-1B to EB-2 Green Card", clientName: "Amir Sharma", status: "approved", total: 8500, approvedAt: "2026-02-12", approvedBy: "Sarah Chen" },
  ];

  const finalizedBills = [
    { id: "pbf1", matterNumber: "FL-2026-0001", matterName: "Series B Financing", clientName: "TechVenture Inc.", status: "finalized", invoiceNumber: "INV-2026-0001", total: 32250, sentAt: "2026-02-28" },
  ];

  // Filter pre-bills by role
  const visibleBills = isAdmin ? preBills : preBills.filter(pb => pb.responsibleAttyId === currentUser.id);

  const pb = selectedBill ? preBills.find(b => b.id === selectedBill) : null;
  const pbTotal = pb ? pb.entries.filter(e => e.included).reduce((s, e) => s + e.amount, 0) : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>Pre-Bill Review</h1>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: T.textTertiary }}>Monthly billing cycle · {visibleBills.length} pre-bills awaiting review</p>
        </div>
        {isAdmin && <Btn size="sm"><Icon name="plus" size={13} color={T.bg} /> Generate Pre-Bills</Btn>}
      </div>

      <TabBar tabs={[
        { id: "pending", label: "Pending Review", count: visibleBills.length },
        { id: "approved", label: "Approved", count: approvedBills.length },
        { id: "finalized", label: "Finalized & Sent", count: finalizedBills.length },
      ]} active={activeTab} onSelect={setActiveTab} />

      {activeTab === "pending" && (
        <div style={{ display: "grid", gridTemplateColumns: pb ? "340px 1fr" : "1fr", gap: 16 }}>
          {/* Pre-bill list */}
          <div>
            {visibleBills.map(bill => {
              const total = bill.entries.reduce((s, e) => s + e.amount, 0);
              const isSelected = selectedBill === bill.id;
              return (
                <Card key={bill.id} onClick={() => setSelectedBill(bill.id)}
                  style={{ padding: "16px 18px", marginBottom: 8, cursor: "pointer", border: isSelected ? `2px solid #3F7653` : `1px solid ${T.borderSubtle}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>{bill.clientName}</div>
                      <div style={{ fontSize: "12px", color: T.textTertiary, marginTop: 2 }}>{bill.matterNumber} · {bill.matterName}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: T.mono, color: T.text }}>{fmt.currency(total)}</div>
                      <div style={{ fontSize: "11px", color: T.textTertiary }}>{bill.entries.length} entries</div>
                    </div>
                  </div>
                </Card>
              );
            })}
            {visibleBills.length === 0 && <div style={{ padding: 30, textAlign: "center", color: T.textDim }}>No pre-bills pending your review</div>}
          </div>

          {/* Pre-bill detail / editor */}
          {pb && (
            <Card style={{ padding: 20, alignSelf: "start" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: "12px", fontFamily: T.mono, color: "#3F7653", fontWeight: 600 }}>{pb.matterNumber}</div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: T.text }}>{pb.matterName}</div>
                  <div style={{ fontSize: "12px", color: T.textTertiary, marginTop: 2 }}>{pb.clientName} · Generated {fmt.dateShort(pb.generatedAt)}</div>
                </div>
                <Badge color={T.orange} bg={T.orangeBg}>Pending Review</Badge>
              </div>

              {/* Line items with inline editing */}
              <div style={{ borderTop: `1px solid ${T.border}` }}>
                {pb.entries.map(entry => (
                  <div key={entry.id} style={{ padding: "12px 0", borderBottom: `1px solid ${T.borderSubtle}`, opacity: entry.included ? 1 : 0.4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <input type="checkbox" checked={entry.included} readOnly style={{ accentColor: "#3F7653" }} />
                          <span style={{ fontSize: "12px", fontWeight: 600, color: T.textSecondary }}>{entry.userName}</span>
                          <span style={{ fontSize: "11px", color: T.textDim }}>{fmt.dateShort(entry.date)}</span>
                        </div>
                        {editingEntry === entry.id ? (
                          <textarea defaultValue={entry.description} rows={2}
                            style={{ width: "100%", padding: "6px 10px", border: `1px solid #3F7653`, borderRadius: T.radius, fontSize: "12.5px", fontFamily: T.font, color: T.text, resize: "vertical", outline: "none", boxSizing: "border-box" }}
                            onBlur={() => setEditingEntry(null)} autoFocus />
                        ) : (
                          <div onClick={() => setEditingEntry(entry.id)} style={{ fontSize: "12.5px", color: T.textSecondary, cursor: "text", lineHeight: 1.5, padding: "2px 0" }}>{entry.description}</div>
                        )}
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "12px", fontFamily: T.mono, color: T.textTertiary }}>{entry.hours.toFixed(1)}h × {fmt.currency(entry.rate)}</div>
                        <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: T.mono, color: T.text, marginTop: 2 }}>{fmt.currency(entry.amount)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: `2px solid ${T.border}`, marginTop: 4 }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>Pre-Bill Total</span>
                <span style={{ fontSize: "20px", fontWeight: 800, fontFamily: T.mono, color: "#213B2B" }}>{fmt.currency(pbTotal)}</span>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="ghost" size="sm" style={{ color: T.red }}>Write Off All</Btn>
                  <Btn variant="ghost" size="sm">Defer to Next Month</Btn>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="ghost" size="sm" onClick={() => setSelectedBill(null)}>Cancel</Btn>
                  <Btn size="sm" onClick={() => { setSelectedBill(null); alert("Pre-bill approved! Moves to billing manager for finalization."); }}>
                    <Icon name="check" size={13} color={T.bg} /> Approve
                  </Btn>
                </div>
              </div>

              <div style={{ marginTop: 12, padding: "10px 12px", background: T.surfaceRaised, borderRadius: T.radius, fontSize: "11px", color: T.textTertiary, lineHeight: 1.5 }}>
                Click any description to edit it before approving. Uncheck entries to exclude them from this invoice. Write-offs and deferrals are tracked in the audit log.
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "approved" && (
        <Card style={{ padding: 0 }}>
          <Table data={approvedBills} columns={[
            { header: "Matter", render: r => (<div><div style={{ fontWeight: 600 }}>{r.matterName}</div><div style={{ fontSize: "11px", fontFamily: T.mono, color: T.textTertiary }}>{r.matterNumber}</div></div>) },
            { header: "Client", render: r => r.clientName },
            { header: "Total", render: r => <span style={{ fontFamily: T.mono, fontWeight: 700 }}>{fmt.currency(r.total)}</span>, align: "right", nowrap: true },
            { header: "Approved", render: r => <span style={{ fontSize: "12px" }}>{fmt.dateShort(r.approvedAt)} by {r.approvedBy}</span>, nowrap: true },
            { header: "", render: () => isAdmin ? (
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" variant="ghost">Edit</Btn>
                <Btn size="sm">Finalize & Send</Btn>
              </div>
            ) : null, align: "right" },
          ]} />
        </Card>
      )}

      {activeTab === "finalized" && (
        <Card style={{ padding: 0 }}>
          <Table data={finalizedBills} columns={[
            { header: "Invoice", render: r => <span style={{ fontFamily: T.mono, fontWeight: 600, color: "#3F7653" }}>{r.invoiceNumber}</span>, nowrap: true },
            { header: "Matter", render: r => (<div><div style={{ fontWeight: 600 }}>{r.matterName}</div><div style={{ fontSize: "11px", fontFamily: T.mono, color: T.textTertiary }}>{r.matterNumber}</div></div>) },
            { header: "Client", render: r => r.clientName },
            { header: "Total", render: r => <span style={{ fontFamily: T.mono, fontWeight: 700 }}>{fmt.currency(r.total)}</span>, align: "right", nowrap: true },
            { header: "Sent", render: r => fmt.dateShort(r.sentAt), nowrap: true },
            { header: "Status", render: () => <StatusBadge status="sent" />, nowrap: true },
          ]} />
        </Card>
      )}
    </div>
  );
};

// ============================================================
// PAGE: USER MANAGEMENT (Admin only)
// ============================================================
const UsersPage = () => {
  const [editingUser, setEditingUser] = useState(null);
  const roles = [{ value: "partner", label: "Partner" }, { value: "senior_associate", label: "Senior Associate" }, { value: "associate", label: "Associate" }, { value: "junior_associate", label: "Junior Associate" }, { value: "of_counsel", label: "Of Counsel" }, { value: "paralegal", label: "Paralegal" }, { value: "billing_manager", label: "Billing Manager" }, { value: "admin", label: "Admin" }];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div><h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>User Management</h1><p style={{ margin: "2px 0 0", fontSize: "13px", color: T.textTertiary }}>{DB.users.length} firm users</p></div>
        <Btn size="sm"><Icon name="plus" size={13} color={T.bg} /> Add User</Btn>
      </div>
      <Card style={{ padding: 0 }}>
        <Table data={DB.users} columns={[
          { header: "Name", render: r => (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.accentBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "#3F7653" }}>{r.firstName[0]}{r.lastName[0]}</div>
              <div><div style={{ fontWeight: 600, fontSize: "13px" }}>{r.firstName} {r.lastName}</div><div style={{ fontSize: "11px", color: T.textTertiary }}>{r.email}</div></div>
            </div>
          )},
          { header: "Role", render: r => <Badge color={Q.isAdmin(r.role) ? "#3F7653" : T.textTertiary} bg={Q.isAdmin(r.role) ? T.accentBg : T.surfaceRaised}>{fmt.role(r.role)}</Badge>, nowrap: true },
          { header: "Hourly Rate", render: r => r.hourlyRate ? <span style={{ fontFamily: T.mono }}>{fmt.currency(r.hourlyRate)}/hr</span> : <span style={{ color: T.textDim }}>—</span>, nowrap: true },
          { header: "Bar #", render: r => r.barNumber ? <span style={{ fontFamily: T.mono, fontSize: "11px" }}>{r.barNumber}</span> : <span style={{ color: T.textDim }}>—</span>, nowrap: true },
          { header: "Tier", render: r => { const t = Q.tierForRole(r.role); return t ? <span style={{ fontSize: "12px" }}>{t.name} ({(t.originationRate * 100).toFixed(0)}% / {(t.productionRate * 100).toFixed(1)}%)</span> : "—"; } },
          { header: "Matters", render: r => { const count = DB.matters.filter(m => m.responsibleAttorneyId === r.id && m.status === "open").length; return <span style={{ fontFamily: T.mono }}>{count}</span>; }, align: "center", nowrap: true },
          { header: "", render: r => <Btn variant="ghost" size="sm" onClick={() => setEditingUser(r.id)}>Edit</Btn>, align: "right" },
        ]} />
      </Card>

      <Modal open={!!editingUser} onClose={() => setEditingUser(null)} title="Edit User" width={480}>
        {(() => {
          const u = DB.users.find(x => x.id === editingUser);
          if (!u) return null;
          return (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>First Name</div><input defaultValue={u.firstName} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font }} /></div>
                <div><div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Last Name</div><input defaultValue={u.lastName} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font }} /></div>
              </div>
              <div style={{ marginBottom: 12 }}><div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Email</div><input defaultValue={u.email} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font }} /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div><div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Role</div><select defaultValue={u.role} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font }}>{roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
                <div><div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Hourly Rate</div><input defaultValue={u.hourlyRate} type="number" style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font }} /></div>
              </div>
              <div style={{ marginBottom: 18 }}><div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Bar Number</div><input defaultValue={u.barNumber || ""} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Btn variant="ghost" size="sm" style={{ color: T.red }}>Deactivate User</Btn>
                <div style={{ display: "flex", gap: 8 }}><Btn variant="ghost" onClick={() => setEditingUser(null)}>Cancel</Btn><Btn onClick={() => setEditingUser(null)}>Save Changes</Btn></div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

// ============================================================
// PAGE: FIRM SETTINGS (Admin only)
// ============================================================
const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("firm");
  const fs = DB.firmSettings;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>Settings</h1>
        <p style={{ margin: "2px 0 0", fontSize: "13px", color: T.textTertiary }}>Firm configuration, billing defaults, and integrations</p>
      </div>

      <TabBar tabs={[
        { id: "firm", label: "Firm Info" },
        { id: "billing", label: "Billing Defaults" },
        { id: "integrations", label: "Integrations" },
        { id: "comp", label: "Compensation Tiers" },
      ]} active={activeTab} onSelect={setActiveTab} />

      {activeTab === "firm" && (
        <Card style={{ padding: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div><div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Firm Name</div><input defaultValue={fs.name} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font }} /></div>
            <div><div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Phone</div><input defaultValue={fs.phone} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font }} /></div>
            <div><div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Address</div><input defaultValue={fs.address.street1} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font }} /></div>
            <div><div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Website</div><input defaultValue={fs.website} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font }} /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}><Btn>Save Changes</Btn></div>
        </Card>
      )}

      {activeTab === "billing" && (
        <Card style={{ padding: 22 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div><div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Payment Terms (days)</div><input defaultValue={fs.billingDefaults.paymentTerms} type="number" style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font }} /></div>
            <div><div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Invoice Prefix</div><input defaultValue={fs.billingDefaults.invoicePrefix} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font }} /></div>
            <div><div style={{ fontSize: "11px", fontWeight: 600, color: T.textTertiary, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Trust Bank</div><input defaultValue={fs.billingDefaults.trustBankName} style={{ width: "100%", padding: "8px 12px", border: `1px solid ${T.border}`, borderRadius: T.radius, fontSize: "13px", fontFamily: T.font }} /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}><Btn>Save Changes</Btn></div>
        </Card>
      )}

      {activeTab === "integrations" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {Object.entries(fs.integrations).map(([key, int]) => (
            <Card key={key} style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: T.text, textTransform: "capitalize" }}>{key === "qbo" ? "QuickBooks Online" : key}</div>
                <Badge color={int.status === "connected" ? "#3F7653" : T.orange} bg={int.status === "connected" ? T.accentBg : T.orangeBg}>{int.status === "connected" ? "Connected" : "Not Connected"}</Badge>
              </div>
              {int.workspace && <div style={{ fontSize: "12px", color: T.textTertiary, marginBottom: 8 }}>{int.workspace}</div>}
              {int.lastSync && <div style={{ fontSize: "11px", color: T.textDim }}>Last synced: {fmt.dateShort(int.lastSync.split("T")[0])}</div>}
              <div style={{ marginTop: 12 }}>
                <Btn variant={int.status === "connected" ? "ghost" : "gold"} size="sm">
                  {int.status === "connected" ? "Configure" : "Connect"}
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "comp" && (
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: T.text }}>Compensation Tiers</div>
            <Btn size="sm"><Icon name="plus" size={13} color={T.bg} /> Add Tier</Btn>
          </div>
          <Table data={DB.compensationTiers} columns={[
            { header: "Tier", render: r => <span style={{ fontWeight: 700, fontSize: "14px" }}>{r.name}</span> },
            { header: "Origination Rate", render: r => <span style={{ fontFamily: T.mono, fontSize: "16px", fontWeight: 700, color: "#3F7653" }}>{(r.originationRate * 100).toFixed(0)}%</span>, align: "center" },
            { header: "Production Rate", render: r => <span style={{ fontFamily: T.mono, fontSize: "16px", fontWeight: 700, color: "#3F7653" }}>{(r.productionRate * 100).toFixed(1)}%</span>, align: "center" },
            { header: "Applies To", render: r => <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{r.roles.map(role => <Badge key={role} color={T.textTertiary} bg={T.surfaceRaised}>{fmt.role(role)}</Badge>)}</div> },
            { header: "", render: () => <Btn variant="ghost" size="sm">Edit</Btn>, align: "right" },
          ]} />
          <div style={{ padding: "12px 18px", background: T.surfaceRaised, fontSize: "12px", color: T.textTertiary, lineHeight: 1.5 }}>
            Changes to compensation tiers take effect from the date specified. Historical calculations are not affected. Rates are applied to collected revenue only.
          </div>
        </Card>
      )}
    </div>
  );
};

// ============================================================
// PAGE: FIRM REPORTS (Admin only)
// ============================================================
const ReportsPage = () => {
  const totalRevenue = DB.invoices.reduce((s, i) => s + i.amountPaid, 0);
  const totalBilled = DB.invoices.reduce((s, i) => s + i.total, 0);
  const outstanding = DB.invoices.reduce((s, i) => s + i.balanceDue, 0);
  const realization = totalBilled > 0 ? (totalRevenue / totalBilled * 100).toFixed(1) : 0;
  const totalHours = DB.timeEntries.filter(e => e.billable).reduce((s, e) => s + e.durationMinutes, 0) / 60;
  const billedHours = DB.timeEntries.filter(e => e.status === "billed").reduce((s, e) => s + e.durationMinutes, 0) / 60;
  const utilization = totalHours > 0 ? (billedHours / totalHours * 100).toFixed(1) : 0;

  const overdue = DB.invoices.filter(i => i.status === "overdue");
  const aging = [
    { range: "0-30 days", amount: outstanding * 0.55 },
    { range: "31-60 days", amount: outstanding * 0.25 },
    { range: "61-90 days", amount: outstanding * 0.15 },
    { range: "90+ days", amount: outstanding * 0.05 },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>Firm Reports</h1>
        <p style={{ margin: "2px 0 0", fontSize: "13px", color: T.textTertiary }}>Financial overview · YTD 2026</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
        <Card style={{ padding: "14px 16px" }}><Stat label="Revenue YTD" value={fmt.currency(totalRevenue)} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Billed YTD" value={fmt.currency(totalBilled)} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Outstanding" value={fmt.currency(outstanding)} color={T.orange} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Realization" value={`${realization}%`} color={parseFloat(realization) > 80 ? T.green : T.orange} /></Card>
        <Card style={{ padding: "14px 16px" }}><Stat label="Utilization" value={`${utilization}%`} /></Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* AR Aging */}
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: T.text, marginBottom: 14 }}>Accounts Receivable Aging</div>
          {aging.map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.borderSubtle}` }}>
              <span style={{ fontSize: "13px", color: T.textSecondary }}>{a.range}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 120, height: 8, background: T.surfaceRaised, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${(a.amount / outstanding * 100).toFixed(0)}%`, height: "100%", background: i === 3 ? T.red : i === 2 ? T.orange : "#3F7653", borderRadius: 4 }} />
                </div>
                <span style={{ fontFamily: T.mono, fontSize: "13px", fontWeight: 600, color: T.text, width: 80, textAlign: "right" }}>{fmt.currency(a.amount)}</span>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", borderTop: `2px solid ${T.border}`, marginTop: 4 }}>
            <span style={{ fontWeight: 700, color: T.text }}>Total Outstanding</span>
            <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.text }}>{fmt.currency(outstanding)}</span>
          </div>
        </Card>

        {/* Revenue by attorney */}
        <Card style={{ padding: 20 }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: T.text, marginBottom: 14 }}>Production by Attorney</div>
          {DB.users.filter(u => u.role !== "admin").map(u => {
            const hours = DB.timeEntries.filter(t => t.userId === u.id && t.billable).reduce((s, t) => s + t.durationMinutes, 0) / 60;
            const revenue = DB.timeEntries.filter(t => t.userId === u.id && t.billable).reduce((s, t) => s + (t.durationMinutes / 60) * t.rateAtEntry, 0);
            return (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.borderSubtle}` }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: T.text }}>{u.firstName} {u.lastName}</div>
                  <div style={{ fontSize: "11px", color: T.textTertiary }}>{fmt.role(u.role)} · {hours.toFixed(1)}h</div>
                </div>
                <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.text }}>{fmt.currency(revenue)}</span>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Origination Leaderboard */}
      <Card style={{ padding: 20 }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: T.text, marginBottom: 14 }}>Origination Leaderboard</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {DB.users.map(u => {
            const comp = Q.computeUserComp(u.id);
            if (!comp || comp.origination.credit === 0) return null;
            return (
              <Card key={u.id} style={{ padding: 16, background: T.surfaceRaised }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>{u.firstName} {u.lastName}</div>
                <div style={{ fontSize: "11px", color: T.textTertiary, marginBottom: 8 }}>{fmt.role(u.role)}</div>
                <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: T.mono, color: "#3F7653" }}>{fmt.currency(comp.origination.credit)}</div>
                <div style={{ fontSize: "11px", color: T.textTertiary }}>{comp.origination.details.length} matter{comp.origination.details.length !== 1 ? "s" : ""}</div>
              </Card>
            );
          }).filter(Boolean)}
        </div>
      </Card>
    </div>
  );
};

// ============================================================
// MAIN APP
// ============================================================
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard" },
  { id: "clients", label: "Clients", icon: "clients" },
  { id: "matters", label: "Matters", icon: "matters" },
  { id: "entities", label: "Entities", icon: "building" },
  { id: "compliance", label: "Compliance", icon: "shield" },
  { id: "documents", label: "Documents", icon: "documents" },
  { id: "time", label: "Timekeeping", icon: "time" },
  { id: "billing", label: "Billing", icon: "billing" },
  { id: "prebill", label: "Pre-Bills", icon: "edit" },
  { id: "compensation", label: "Compensation", icon: "sparkle" },
  { id: "gavel", label: "Gavel", icon: "api", adminOnly: true },
  { id: "portal-admin", label: "Portal Admin", icon: "globe", adminOnly: true },
  { id: "users", label: "Users", icon: "clients", adminOnly: true },
  { id: "settings", label: "Settings", icon: "tag", adminOnly: true },
  { id: "reports", label: "Reports", icon: "drive", adminOnly: true },
];

export default function App() {
  const [route, setRoute] = useState({ page: "dashboard", id: null });
  const [aiOpen, setAiOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [currentUserId, setCurrentUserId] = useState("u1"); // Default: Sarah Chen (partner/admin)

  const currentUser = DB.users.find(u => u.id === currentUserId) || DB.users[0];
  const isAdmin = Q.isAdmin(currentUser.role);
  const nav = useCallback((page, id = null) => setRoute({ page, id }), []);
  const currentPage = route.page;

  const searchResults = useMemo(() => {
    if (!searchQ.trim()) return { clients: [], matters: [], documents: [] };
    const q = searchQ.toLowerCase();
    return {
      clients: DB.clients.filter(c => c.name.toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q)).slice(0, 4),
      matters: DB.matters.filter(m => m.name.toLowerCase().includes(q) || m.matterNumber.toLowerCase().includes(q)).slice(0, 4),
      documents: DB.documents.filter(d => d.title.toLowerCase().includes(q) || (d.tags || []).some(t => t.includes(q))).slice(0, 4),
    };
  }, [searchQ]);
  const hasResults = searchResults.clients.length + searchResults.matters.length + searchResults.documents.length > 0;

  const renderPage = () => {
    switch (currentPage) {
      case "client": return <ClientDetailPage clientId={route.id} nav={nav} />;
      case "matter": return <MatterDetailPage matterId={route.id} nav={nav} />;
      case "clients": return <ClientsListPage nav={nav} />;
      case "matters": return <MattersListPage nav={nav} />;
      case "entities": return <EntitiesPage nav={nav} />;
      case "compliance": return <ComplianceDashboardPage nav={nav} />;
      case "documents": return <DocumentsPage nav={nav} />;
      case "time": return <TimeKeepingPage />;
      case "billing": return <BillingPage />;
      case "prebill": return <PreBillPage currentUser={currentUser} />;
      case "compensation": return <CompensationPage currentUser={currentUser} />;
      case "gavel": return isAdmin ? <GavelPage nav={nav} /> : <DashboardPage nav={nav} currentUser={currentUser} />;
      case "portal-admin": return isAdmin ? <PortalControlsPage nav={nav} /> : <DashboardPage nav={nav} currentUser={currentUser} />;
      case "users": return isAdmin ? <UsersPage /> : <DashboardPage nav={nav} currentUser={currentUser} />;
      case "settings": return isAdmin ? <SettingsPage /> : <DashboardPage nav={nav} currentUser={currentUser} />;
      case "reports": return isAdmin ? <ReportsPage /> : <DashboardPage nav={nav} currentUser={currentUser} />;
      default: return <DashboardPage nav={nav} currentUser={currentUser} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg, fontFamily: T.font, color: T.text, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=IBM+Plex+Mono:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.textDim}; }
        ::selection { background: rgba(63,118,83,0.15); color: ${T.text}; }
        input::placeholder, textarea::placeholder { color: ${T.textDim}; }
        select { color-scheme: light; }
      `}</style>

      {/* ---- SIDEBAR ---- */}
      <aside style={{ width: 220, background: "#213B2B", borderRight: `1px solid rgba(255,255,255,0.08)`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: T.radius, background: `linear-gradient(135deg, #3F7653, #E1E552)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: T.fontDisplay, fontSize: "15px", fontWeight: 700, color: "#213B2B" }}>A</span>
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#FCF8F1", letterSpacing: "-0.3px", fontFamily: T.fontDisplay }}>{CONFIG.app.name}</div>
              <div style={{ fontSize: "9.5px", color: "rgba(252,248,241,0.45)", letterSpacing: "1px", textTransform: "uppercase" }}>{CONFIG.firm.name}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "10px 12px 6px" }}>
          <div onClick={() => setSearchOpen(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 10px", background: "rgba(255,255,255,0.06)", borderRadius: T.radius, cursor: "pointer", border: `1px solid rgba(255,255,255,0.08)`, transition: "border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"}>
            <Icon name="search" size={13} color="rgba(252,248,241,0.4)" />
            <span style={{ fontSize: "11.5px", color: "rgba(252,248,241,0.4)", flex: 1 }}>Search...</span>
            <span style={{ fontSize: "9px", color: "rgba(252,248,241,0.3)", background: "rgba(0,0,0,0.15)", padding: "2px 5px", borderRadius: 3, fontFamily: T.mono }}>⌘K</span>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "4px 10px", overflow: "auto" }}>
          {NAV_ITEMS.filter(item => !item.adminOnly || isAdmin).map(item => {
            const isActive = currentPage === item.id || (item.id === "clients" && currentPage === "client") || (item.id === "matters" && currentPage === "matter");
            return (
              <button key={item.id} onClick={() => nav(item.id)} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "8px 10px", border: "none", borderRadius: T.radius, cursor: "pointer", fontSize: "12.5px", fontWeight: isActive ? 700 : 500, fontFamily: T.font, background: isActive ? "rgba(225,229,82,0.12)" : "transparent", color: isActive ? "#E1E552" : "rgba(252,248,241,0.55)", transition: "all 0.15s", marginBottom: 1 }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                <Icon name={item.icon} size={15} color={isActive ? "#E1E552" : "rgba(252,248,241,0.45)"} />{item.label}
              </button>
            );
          })}
        </nav>

        {/* AI Button */}
        <div style={{ padding: "10px 12px", borderTop: `1px solid rgba(255,255,255,0.08)` }}>
          <button onClick={() => setAiOpen(!aiOpen)} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "9px 10px", border: `1px solid ${aiOpen ? "rgba(225,229,82,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: T.radius, cursor: "pointer", fontSize: "12.5px", fontWeight: 700, fontFamily: T.font, background: aiOpen ? "rgba(225,229,82,0.1)" : "rgba(255,255,255,0.04)", color: aiOpen ? "#E1E552" : "rgba(252,248,241,0.6)", transition: "all 0.15s" }}
            onMouseEnter={e => { if (!aiOpen) e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { if (!aiOpen) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
            <Icon name="sparkle" size={15} color={aiOpen ? "#E1E552" : "rgba(252,248,241,0.5)"} />
            {CONFIG.app.name} AI
          </button>
        </div>

        <div style={{ padding: "12px 14px", borderTop: `1px solid rgba(255,255,255,0.08)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(63,118,83,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800, color: "#FCF8F1" }}>{fmt.initials(`${currentUser.firstName} ${currentUser.lastName}`)}</div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#FCF8F1" }}>{currentUser.firstName} {currentUser.lastName}</div>
              <div style={{ fontSize: "10px", color: "rgba(252,248,241,0.4)" }}>{fmt.role(currentUser.role)}{isAdmin ? " · Admin" : ""}</div>
            </div>
          </div>
          {/* Role switcher (demo mode) */}
          <select value={currentUserId} onChange={e => { setCurrentUserId(e.target.value); nav("dashboard"); }}
            style={{ width: "100%", padding: "5px 8px", background: "rgba(255,255,255,0.06)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: T.radius, color: "rgba(252,248,241,0.6)", fontSize: "10px", fontFamily: T.font }}>
            {DB.users.map(u => <option key={u.id} value={u.id} style={{ background: "#213B2B", color: "#FCF8F1" }}>{u.firstName} {u.lastName} ({fmt.role(u.role)})</option>)}
          </select>
        </div>
      </aside>

      {/* ---- MAIN CONTENT ---- */}
      <main style={{ flex: 1, overflow: "auto", padding: "24px 28px", marginRight: aiOpen ? 420 : 0, transition: "margin-right 0.25s ease" }}>
        {renderPage()}
      </main>

      {/* ---- AI PANEL ---- */}
      <AiPanel open={aiOpen} onClose={() => setAiOpen(false)} nav={nav} />

      {/* ---- SEARCH MODAL ---- */}
      <Modal open={searchOpen} onClose={() => { setSearchOpen(false); setSearchQ(""); }} title="" width={540}>
        <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search clients, matters, documents..."
          style={{ width: "100%", padding: "12px 14px", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radius, color: T.text, fontSize: "14px", fontFamily: T.font, outline: "none", boxSizing: "border-box", marginBottom: 14 }}
          onFocus={e => e.target.style.borderColor = "#3F7653"}
          onBlur={e => e.target.style.borderColor = T.border} />
        {searchQ && hasResults && (
          <div>
            {searchResults.clients.length > 0 && <div style={{ fontSize: "10px", color: T.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", padding: "6px 0 4px" }}>Clients</div>}
            {searchResults.clients.map(c => (
              <div key={c.id} onClick={() => { nav("client", c.id); setSearchOpen(false); setSearchQ(""); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: T.radius, cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Icon name="user" size={14} color={T.gold} />
                <div><div style={{ fontSize: "13px", fontWeight: 500, color: T.text }}>{c.name}</div><div style={{ fontSize: "10.5px", color: T.textDim }}>Client · {c.status}</div></div>
              </div>
            ))}
            {searchResults.matters.length > 0 && <div style={{ fontSize: "10px", color: T.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", padding: "10px 0 4px" }}>Matters</div>}
            {searchResults.matters.map(m => (
              <div key={m.id} onClick={() => { nav("matter", m.id); setSearchOpen(false); setSearchQ(""); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: T.radius, cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Icon name="matters" size={14} color={T.gold} />
                <div><div style={{ fontSize: "13px", fontWeight: 500, color: T.text }}>{m.name}</div><div style={{ fontSize: "10.5px", color: T.textDim, fontFamily: T.mono }}>{m.matterNumber}</div></div>
              </div>
            ))}
            {searchResults.documents.length > 0 && <div style={{ fontSize: "10px", color: T.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.7px", padding: "10px 0 4px" }}>Documents</div>}
            {searchResults.documents.map(d => (
              <div key={d.id} onClick={() => { nav("documents"); setSearchOpen(false); setSearchQ(""); }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: T.radius, cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => e.currentTarget.style.background = T.surfaceHover}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Icon name="documents" size={14} color={T.gold} />
                <div><div style={{ fontSize: "13px", fontWeight: 500, color: T.text }}>{d.title}</div><div style={{ fontSize: "10.5px", color: T.textDim }}>{DB.matters.find(m => m.id === d.matterId)?.matterNumber} · {(d.tags||[]).slice(0,2).join(", ")}</div></div>
              </div>
            ))}
          </div>
        )}
        {searchQ && !hasResults && <div style={{ padding: "30px 0", textAlign: "center", color: T.textDim, fontSize: "13px" }}>No results for "{searchQ}"</div>}
        {!searchQ && <div style={{ padding: "20px 0", textAlign: "center", color: T.textDim, fontSize: "13px" }}>Search across all clients, matters, and documents</div>}
      </Modal>
    </div>
  );
}
