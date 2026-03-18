import { useState, useEffect, useCallback } from "react";

// ============================================================
// ABBADO CLIENT PORTAL — Founders Law
// A warm, professional client-facing experience.
// Magic link login · Invoices + Stripe · Entities · Documents
// ============================================================

const CONFIG = {
  firm: typeof window !== "undefined" && window.__ABBADO_FIRM_NAME__ || "Founders Law",
  portalTitle: "Client Portal",
  apiBase: typeof window !== "undefined" && window.__ABBADO_API_BASE__ || "/api/v1/portal",
};

// ---- Founders Law Brand Palette ----
const C = {
  darkGreen: "#213B2B",
  green: "#3F7653",
  lime: "#E1E552",
  turquoise: "#4A99A7",
  charcoal: "#3F4042",
  gray: "#7A7C80",
  lightGray: "#DFDFDF",
  cream: "#FCF8F1",
  white: "#FFFFFF",
  red: "#C0392B",
  redBg: "rgba(192,57,43,0.06)",
  orange: "#D4851F",
  orangeBg: "rgba(212,133,31,0.06)",
  greenBg: "rgba(63,118,83,0.06)",
  blueBg: "rgba(74,153,167,0.06)",
};

const T = {
  bg: C.cream,
  card: C.white,
  border: C.lightGray,
  borderSubtle: "#E8E3DA",
  text: C.darkGreen,
  textSec: C.charcoal,
  textMuted: C.gray,
  textDim: "#ABADB2",
  accent: C.green,
  accentBg: C.greenBg,
  font: "'DM Sans', 'Manrope', system-ui, sans-serif",
  fontDisplay: "'Playfair Display', Georgia, serif",
  mono: "'IBM Plex Mono', 'SF Mono', monospace",
  radius: "8px",
  radiusLg: "14px",
};

// ---- Icons ----
const ICONS = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1",
  invoice: "M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z",
  building: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  doc: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  message: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
  card: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  alert: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  download: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
  send: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8",
  mail: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  shield: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
  chevron: "M9 5l7 7-7 7",
  external: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14",
};
const Icon = ({ name, size = 18, color = T.textMuted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS[name] || ""} /></svg>
);

// ---- Mock portal data ----
const PORTAL = {
  client: { id: "c1", name: "TechVenture Inc.", email: "legal@techventure.com", phone: "(415) 555-0100", type: "entity" },
  summary: { outstanding: 28500, overdue: 0, entityCount: 2, pendingCompliance: 3, sharedDocuments: 5, unreadMessages: 1 },
  invoices: [
    { id: "i1", invoiceNumber: "INV-2026-0001", status: "sent", issueDate: "2026-02-28", dueDate: "2026-03-30", total: 32250, amountPaid: 19750, balanceDue: 12500, matter: { matterNumber: "FL-2026-0001", name: "Series B Financing" }, lineItems: [
      { type: "time", description: "Sarah Chen — Term sheet review and markup", quantity: 2.0, rate: 450, amount: 900 },
      { type: "time", description: "Sarah Chen — Investor counsel call", quantity: 1.5, rate: 450, amount: 675 },
      { type: "time", description: "Marcus Williams — Stock Purchase Agreement drafting", quantity: 3.0, rate: 325, amount: 975 },
      { type: "time", description: "Priya Patel — Cap table and corporate records", quantity: 1.0, rate: 175, amount: 175 },
    ], payments: [{ amount: 19750, method: "wire", receivedDate: "2026-03-10" }] },
    { id: "i4", invoiceNumber: "INV-2026-0004", status: "draft", issueDate: "2026-03-10", dueDate: "2026-04-09", total: 16500, amountPaid: 0, balanceDue: 16500, matter: { matterNumber: "FL-2026-0001", name: "Series B Financing" }, lineItems: [], payments: [] },
    { id: "i5", invoiceNumber: "INV-2025-0015", status: "paid", issueDate: "2025-10-20", dueDate: "2025-11-19", total: 48000, amountPaid: 48000, balanceDue: 0, matter: { matterNumber: "FL-2025-0009", name: "Series A Financing" }, lineItems: [], payments: [{ amount: 48000, method: "wire", receivedDate: "2025-11-05" }] },
  ],
  entities: [
    { id: "e1", legalName: "TechVenture Inc.", entityType: "corporation", stateOfFormation: "DE", formationDate: "2024-03-15", status: "active", registeredAgentName: "Registered Agents Inc.", officers: [{ personName: "Jamie Park", title: "CEO" }, { personName: "Riley Chen", title: "CTO" }], jurisdictions: [{ state: "DE", registrationType: "domestic", status: "active" }, { state: "CA", registrationType: "foreign", status: "active" }], complianceTasks: [{ taskName: "CA Statement of Information", dueDate: "2026-06-01", status: "pending" }] },
    { id: "e2", legalName: "TechVenture IP Holdings LLC", entityType: "llc", stateOfFormation: "DE", formationDate: "2024-09-01", status: "active", registeredAgentName: "Registered Agents Inc.", officers: [{ personName: "Jamie Park", title: "Manager" }], jurisdictions: [{ state: "DE", registrationType: "domestic", status: "active" }], complianceTasks: [{ taskName: "Delaware LLC Annual Tax ($300)", dueDate: "2026-06-01", status: "pending" }] },
  ],
  matters: [
    { matterNumber: "FL-2026-0001", name: "Series B Financing", practiceArea: "corporate", status: "open", responsibleAttorney: { firstName: "Sarah", lastName: "Chen" }, portalVisible: true },
    { matterNumber: "FL-2026-0004", name: "Employment Agreements", practiceArea: "employment", status: "open", responsibleAttorney: { firstName: "David", lastName: "Kim" }, portalVisible: true },
    { matterNumber: "FL-2025-0009", name: "Series A Financing", practiceArea: "corporate", status: "closed", responsibleAttorney: { firstName: "Sarah", lastName: "Chen" }, portalVisible: false },
  ],
  documents: [
    { id: "d1", title: "Series B Term Sheet (Markup v3)", category: "contract", file: { fileName: "TermSheet_v3_markup.docx", fileSize: 245000, versionNumber: 3 }, matter: { matterNumber: "FL-2026-0001", name: "Series B Financing" }, sharedAt: "2026-03-10", message: "Latest markup with board composition revisions." },
    { id: "d2", title: "Stock Purchase Agreement v2", category: "contract", file: { fileName: "SPA_v2_draft.docx", fileSize: 520000, versionNumber: 2 }, matter: { matterNumber: "FL-2026-0001" }, sharedAt: "2026-03-08" },
    { id: "d4", title: "Due Diligence Memo", category: "memo", file: { fileName: "DD_Memo_TechVenture.pdf", fileSize: 890000, versionNumber: 1 }, matter: { matterNumber: "FL-2026-0001" }, sharedAt: "2026-03-05" },
    { id: "d5", title: "Cap Table (Pre/Post Series B)", category: "other", file: { fileName: "CapTable_SeriesB_v4.xlsx", fileSize: 125000, versionNumber: 4 }, matter: { matterNumber: "FL-2026-0001" }, sharedAt: "2026-03-09" },
    { id: "d10", title: "VP Engineering Employment Agreement", category: "contract", file: { fileName: "EmpAgreement_VPEng_v2.docx", fileSize: 290000, versionNumber: 2 }, matter: { matterNumber: "FL-2026-0004" }, sharedAt: "2026-03-11" },
  ],
  messages: [
    { id: "msg1", senderType: "firm", subject: "Series B — Term Sheet Update", body: "Hi Jamie, we've uploaded the latest term sheet markup with the board composition changes you requested. Please review and let us know if you have any questions. — Sarah", createdAt: "2026-03-10T14:30:00Z", readAt: null },
    { id: "msg2", senderType: "client", subject: "Re: Cap Table", body: "Thanks for the updated cap table. Can we schedule a call to walk through the option pool expansion?", createdAt: "2026-03-09T10:15:00Z", readAt: "2026-03-09T11:00:00Z" },
    { id: "msg3", senderType: "firm", subject: "Welcome to the Client Portal", body: "Welcome to the Founders Law Client Portal! You can view your invoices, entities, and shared documents here. If you need anything, just send us a message.", createdAt: "2026-03-01T09:00:00Z", readAt: "2026-03-01T09:30:00Z" },
  ],
  conversations: [
    { id: "conv1", matterId: "FL-2026-0001", matterName: "Series B Financing", category: "matter", subject: "Cap Table Discussion", status: "open", lastMessageAt: "2026-03-11T10:30:00Z", messages: [
      { id: "cm1", senderType: "client", senderName: "You", body: "Hi Sarah — we've reviewed the cap table. A few questions:\n\n1. Can you confirm the option pool is 10% post-money?\n2. What happens to the unissued shares from Series A?\n\nThanks!", createdAt: "2026-03-09T10:15:00Z" },
      { id: "cm2", senderType: "firm", senderName: "Sarah Chen · Partner", body: "Hi Jamie,\n\n1. Yes, the option pool is 10% on a fully-diluted post-money basis. That's standard for Series B.\n2. The 412,000 unissued shares from the Series A authorization remain available.\n\nI'll send an updated version with the expansion calculations today.", createdAt: "2026-03-09T11:00:00Z" },
      { id: "cm3", senderType: "client", senderName: "You", body: "Perfect, that makes sense. Can we schedule a call Tuesday to walk through the option pool expansion with Riley?", createdAt: "2026-03-09T14:30:00Z" },
      { id: "cm4", senderType: "firm", senderName: "Sarah Chen · Partner", body: "Absolutely — I'll send a calendar invite for Tuesday at 2pm. I'll have the updated cap table ready by then.", createdAt: "2026-03-09T15:00:00Z" },
      { id: "cm5", senderType: "client", senderName: "You", body: "One more thing — Riley wants to know if we can add a 409A valuation discussion to that call too.", createdAt: "2026-03-11T10:30:00Z" },
    ]},
    { id: "conv2", matterId: "FL-2026-0001", matterName: "Series B Financing", category: "matter", subject: "Board Composition — Term Sheet", status: "open", lastMessageAt: "2026-03-10T16:00:00Z", messages: [
      { id: "cm6", senderType: "firm", senderName: "Sarah Chen · Partner", body: "Jamie — I've uploaded the v3 markup of the term sheet. The key change is in Section 4.2 (Board Composition).\n\nWe're proposing a 5-seat board: 2 founders, 2 investors, 1 independent. Sequoia originally wanted 3 investor seats.", createdAt: "2026-03-10T14:30:00Z" },
      { id: "cm7", senderType: "client", senderName: "You", body: "This looks great. Riley and I are aligned on the 5-seat structure. One question — who picks the independent director?", createdAt: "2026-03-10T15:15:00Z" },
      { id: "cm8", senderType: "firm", senderName: "Marcus Williams · Associate", body: "Hi Jamie — the independent director is mutually agreed upon by the founders and Sequoia. Neither side has a unilateral pick. Happy to walk through the protective provisions on our next call.", createdAt: "2026-03-10T16:00:00Z" },
    ]},
    { id: "conv3", matterId: "FL-2026-0001", matterName: "Series B Financing", category: "matter", subject: "Due Diligence Checklist", status: "closed", lastMessageAt: "2026-03-05T09:00:00Z", messages: [
      { id: "cm9", senderType: "firm", senderName: "Priya Patel · Paralegal", body: "Hi Jamie — attached is the due diligence checklist. We'll need items 1-8 by end of week.", createdAt: "2026-03-03T09:00:00Z", attachments: [{ fileName: "DD_Checklist_TechVenture.pdf", fileSize: 245000 }] },
      { id: "cm10", senderType: "client", senderName: "You", body: "Got it, thanks Priya. I'll have our CFO pull together the financial statements.", createdAt: "2026-03-03T10:30:00Z" },
      { id: "cm11", senderType: "client", senderName: "You", body: "All items uploaded. Let me know if anything is missing.", createdAt: "2026-03-05T09:00:00Z", attachments: [{ fileName: "TechVenture_Financials_2025.pdf", fileSize: 1800000 }, { fileName: "IP_Assignment_Records.zip", fileSize: 4500000 }] },
    ]},
    { id: "conv4", matterId: "FL-2026-0004", matterName: "Employment Agreements", category: "matter", subject: "VP Eng Equity Terms", status: "open", lastMessageAt: "2026-03-11T09:00:00Z", messages: [
      { id: "cm14", senderType: "client", senderName: "You", body: "David — quick question on the VP Eng agreement. We want to offer 0.5% equity with 4-year vesting and a 1-year cliff. Is that standard?", createdAt: "2026-03-10T16:00:00Z" },
      { id: "cm15", senderType: "firm", senderName: "David Kim · Associate", body: "Jamie — 0.5% with 4/1 is very standard. I'll draft it under the existing EIP. One thing to flag: with the Series B, you'll want the 409A done before granting. I'll note that in the agreement.", createdAt: "2026-03-11T09:00:00Z" },
    ]},
    { id: "conv5", matterId: null, matterName: null, category: "general", subject: "Trademark Registration Question", status: "open", lastMessageAt: "2026-03-12T14:00:00Z", messages: [
      { id: "cm16", senderType: "client", senderName: "Riley Chen", body: "Hi — we're thinking about registering the TechVenture trademark. We've been using the name for about 2 years but never formally registered. Is this something you can help with, or do we need a separate IP firm?", createdAt: "2026-03-12T14:00:00Z" },
    ]},
    { id: "conv6", matterId: null, matterName: null, category: "billing", subject: "Question about Invoice INV-2026-0001", status: "open", lastMessageAt: "2026-03-13T10:00:00Z", messages: [
      { id: "cm17", senderType: "client", senderName: "You", body: "Hi Sarah — I see a line item on the latest invoice for 'Cap table and corporate records' at $175. Can you clarify what that covers?", createdAt: "2026-03-13T09:30:00Z" },
      { id: "cm18", senderType: "firm", senderName: "Sarah Chen · Partner", body: "Good question, Jamie. That's Priya's work updating the cap table specifically for the Series B terms — incorporating the new option pool expansion and updated investor allocations. It's distinct from the Series A cap table work.", createdAt: "2026-03-13T10:00:00Z" },
    ]},
  ],
};

// ---- Formatters ----
const fmt = {
  currency: (n) => n == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n),
  currencyFull: (n) => n == null ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n),
  date: (d) => d ? new Date(d.includes("T") ? d : d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—",
  dateShort: (d) => d ? new Date(d.includes("T") ? d : d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—",
  fileSize: (b) => b < 1024 ? b + " B" : b < 1048576 ? (b / 1024).toFixed(0) + " KB" : (b / 1048576).toFixed(1) + " MB",
  relative: (d) => { const diff = (new Date() - new Date(d)) / 86400000; if (diff < 1) return "Today"; if (diff < 2) return "Yesterday"; if (diff < 7) return `${Math.floor(diff)} days ago`; return fmt.dateShort(d); },
};

// ---- Components ----
const Badge = ({ children, color = C.green, bg = C.greenBg }) => (
  <span style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 100, fontSize: "11px", fontWeight: 700, letterSpacing: "0.3px", textTransform: "uppercase", background: bg, color, whiteSpace: "nowrap" }}>{children}</span>
);
const statusMap = { open: [C.green, C.greenBg], active: [C.green, C.greenBg], sent: [C.turquoise, C.blueBg], paid: [C.green, C.greenBg], draft: [C.gray, "rgba(122,124,128,0.08)"], overdue: [C.red, C.redBg], partial: [C.orange, C.orangeBg], closed: [C.gray, "rgba(122,124,128,0.08)"], pending: [C.orange, C.orangeBg], in_progress: [C.turquoise, C.blueBg], completed: [C.green, C.greenBg], void: [C.gray, "rgba(122,124,128,0.08)"] };
const StatusBadge = ({ status }) => { const [c, bg] = statusMap[status] || [C.gray, "rgba(122,124,128,0.08)"]; return <Badge color={c} bg={bg}>{(status || "").replace("_", " ")}</Badge>; };

const Card = ({ children, style: s, onClick }) => (
  <div onClick={onClick} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, boxShadow: "0 1px 4px rgba(33,59,43,0.04)", ...(onClick ? { cursor: "pointer", transition: "box-shadow 0.2s" } : {}), ...s }}
    onMouseEnter={e => onClick && (e.currentTarget.style.boxShadow = "0 3px 12px rgba(33,59,43,0.08)")}
    onMouseLeave={e => onClick && (e.currentTarget.style.boxShadow = "0 1px 4px rgba(33,59,43,0.04)")}>
    {children}
  </div>
);

const Btn = ({ children, variant = "primary", onClick, disabled, style: s }) => {
  const v = {
    primary: { background: C.darkGreen, color: C.cream },
    outline: { background: "transparent", color: C.darkGreen, border: `1.5px solid ${C.darkGreen}` },
    ghost: { background: "transparent", color: T.textMuted },
    pay: { background: C.green, color: C.white },
  };
  return <button onClick={onClick} disabled={disabled} style={{ border: "none", borderRadius: T.radius, padding: "10px 20px", fontSize: "13px", fontWeight: 700, fontFamily: T.font, cursor: disabled ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: 7, transition: "all 0.2s", opacity: disabled ? 0.5 : 1, letterSpacing: "0.2px", ...v[variant], ...s }}>{children}</button>;
};

const StatCard = ({ icon, label, value, sub, color = T.text }) => (
  <Card style={{ padding: "20px 22px", flex: 1, minWidth: 150 }}>
    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: T.radius, background: C.greenBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={20} color={C.green} />
      </div>
      <div>
        <div style={{ fontSize: "11px", color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: "24px", fontWeight: 700, color, letterSpacing: "-0.5px", fontFamily: T.mono }}>{value}</div>
        {sub && <div style={{ fontSize: "12px", color: T.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  </Card>
);

// ============================================================
// PAGES
// ============================================================

// ---- LOGIN ----
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: C.darkGreen, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.font }}>
      <div style={{ width: 420, padding: 40, background: C.white, borderRadius: T.radiusLg, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", textAlign: "center" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: `linear-gradient(135deg, ${C.green}, ${C.lime})`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <span style={{ fontFamily: T.fontDisplay, fontSize: "26px", fontWeight: 700, color: C.darkGreen }}>F</span>
          </div>
          <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: C.darkGreen, fontFamily: T.fontDisplay }}>{CONFIG.firm}</h1>
          <p style={{ margin: 0, fontSize: "13px", color: T.textMuted }}>{CONFIG.portalTitle}</p>
        </div>
        {!sent ? (
          <>
            <p style={{ fontSize: "14px", color: T.textSec, lineHeight: 1.6, marginBottom: 20 }}>Enter your email to receive a secure login link. No password needed.</p>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email"
              style={{ width: "100%", padding: "12px 16px", border: `1.5px solid ${T.border}`, borderRadius: T.radius, fontSize: "15px", fontFamily: T.font, outline: "none", boxSizing: "border-box", marginBottom: 14 }}
              onFocus={e => e.target.style.borderColor = C.green}
              onBlur={e => e.target.style.borderColor = T.border}
              onKeyDown={e => e.key === "Enter" && email && setSent(true)} />
            <Btn onClick={() => email && setSent(true)} disabled={!email} style={{ width: "100%" }}>
              <Icon name="mail" size={16} color={C.cream} /> Send Login Link
            </Btn>
          </>
        ) : (
          <>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.greenBg, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Icon name="check" size={28} color={C.green} />
            </div>
            <h2 style={{ margin: "0 0 8px", fontSize: "18px", color: C.darkGreen }}>Check your inbox</h2>
            <p style={{ fontSize: "14px", color: T.textSec, lineHeight: 1.6, marginBottom: 20 }}>We sent a login link to <strong>{email}</strong>. It expires in 15 minutes.</p>
            <Btn variant="outline" onClick={() => onLogin()} style={{ width: "100%" }}>
              <Icon name="shield" size={16} color={C.darkGreen} /> Continue (Demo)
            </Btn>
            <p style={{ fontSize: "11px", color: T.textMuted, marginTop: 12 }}>Didn't receive it? <span onClick={() => setSent(false)} style={{ color: C.green, cursor: "pointer", fontWeight: 600 }}>Try again</span></p>
          </>
        )}
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontSize: "11px", color: T.textDim, lineHeight: 1.5 }}>
            <Icon name="shield" size={12} color={T.textDim} style={{ verticalAlign: "middle", marginRight: 4 }} />
            Secured by Abbado. Your data is encrypted and protected.
          </p>
        </div>
      </div>
    </div>
  );
};

// ---- DASHBOARD ----
const DashboardPage = ({ nav }) => {
  const S = PORTAL.summary;
  const openInvoices = PORTAL.invoices.filter(i => i.balanceDue > 0 && i.status !== "draft");
  const nextCompliance = PORTAL.entities.flatMap(e => e.complianceTasks).filter(t => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: "26px", fontWeight: 700, color: T.text, fontFamily: T.fontDisplay }}>Welcome back, Jamie</h1>
        <p style={{ margin: "4px 0 0", fontSize: "14px", color: T.textMuted }}>Here's an overview of your account with {CONFIG.firm}.</p>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard icon="invoice" label="Outstanding" value={fmt.currency(S.outstanding)} />
        <StatCard icon="building" label="Entities" value={S.entityCount} sub={`${S.pendingCompliance} pending tasks`} />
        <StatCard icon="doc" label="Documents" value={S.sharedDocuments} sub="Shared with you" />
        <StatCard icon="message" label="Conversations" value={S.unreadMessages} sub={S.unreadMessages > 0 ? "unread" : "all read"} color={S.unreadMessages > 0 ? C.turquoise : T.text} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Outstanding invoices */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: T.text }}>Outstanding Invoices</span>
            <span onClick={() => nav("invoices")} style={{ fontSize: "12px", color: C.green, cursor: "pointer", fontWeight: 600 }}>View all</span>
          </div>
          {openInvoices.length > 0 ? openInvoices.map(inv => (
            <div key={inv.id} onClick={() => nav("invoice", inv.id)} style={{ padding: "14px 20px", borderBottom: `1px solid ${T.borderSubtle}`, cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(63,118,83,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, fontFamily: T.mono, color: T.text }}>{inv.invoiceNumber}</div>
                  <div style={{ fontSize: "12px", color: T.textMuted, marginTop: 2 }}>{inv.matter.name} · Due {fmt.dateShort(inv.dueDate)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, fontFamily: T.mono, color: C.darkGreen }}>{fmt.currency(inv.balanceDue)}</div>
                  <StatusBadge status={inv.status} />
                </div>
              </div>
            </div>
          )) : (
            <div style={{ padding: "30px 20px", textAlign: "center", color: T.textMuted }}>
              <Icon name="check" size={24} color={C.green} /><div style={{ marginTop: 8 }}>All invoices are paid!</div>
            </div>
          )}
        </Card>

        {/* Entities & compliance */}
        <Card style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: T.text }}>Your Entities</span>
            <span onClick={() => nav("entities")} style={{ fontSize: "12px", color: C.green, cursor: "pointer", fontWeight: 600 }}>View all</span>
          </div>
          {PORTAL.entities.map(ent => (
            <div key={ent.id} onClick={() => nav("entities")} style={{ padding: "14px 20px", borderBottom: `1px solid ${T.borderSubtle}`, cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(63,118,83,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: T.text }}>{ent.legalName}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <Badge color={T.textMuted} bg="rgba(122,124,128,0.08)">{ent.entityType}</Badge>
                    <Badge color={C.turquoise} bg={C.blueBg}>{ent.stateOfFormation}</Badge>
                  </div>
                </div>
                {ent.complianceTasks.length > 0 && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: T.textMuted }}>Next filing</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: C.orange }}>{fmt.dateShort(ent.complianceTasks[0].dueDate)}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Recent documents */}
      {PORTAL.documents.length > 0 && (
        <Card style={{ marginTop: 20, padding: 0 }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.borderSubtle}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "15px", fontWeight: 700, color: T.text }}>Recently Shared Documents</span>
            <span onClick={() => nav("documents")} style={{ fontSize: "12px", color: C.green, cursor: "pointer", fontWeight: 600 }}>View all</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
            {PORTAL.documents.slice(0, 3).map(doc => (
              <div key={doc.id} style={{ padding: "16px 20px", borderRight: `1px solid ${T.borderSubtle}` }}>
                <Icon name="doc" size={16} color={C.green} />
                <div style={{ fontSize: "13px", fontWeight: 600, color: T.text, marginTop: 6 }}>{doc.title}</div>
                <div style={{ fontSize: "11px", color: T.textMuted, marginTop: 3 }}>{doc.file.fileName} · v{doc.file.versionNumber}</div>
                <div style={{ fontSize: "11px", color: T.textDim, marginTop: 2 }}>Shared {fmt.relative(doc.sharedAt)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// ---- INVOICES ----
const InvoicesPage = ({ nav }) => (
  <div>
    <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: T.text }}>Invoices</h1>
    <p style={{ margin: "0 0 24px", fontSize: "13px", color: T.textMuted }}>{PORTAL.invoices.length} invoices</p>
    {PORTAL.invoices.map(inv => (
      <Card key={inv.id} onClick={() => nav("invoice", inv.id)} style={{ padding: "18px 22px", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: T.mono, color: T.text }}>{inv.invoiceNumber}</span>
              <StatusBadge status={inv.status} />
            </div>
            <div style={{ fontSize: "13px", color: T.textMuted, marginTop: 4 }}>{inv.matter.name} · {inv.matter.matterNumber}</div>
            <div style={{ fontSize: "12px", color: T.textDim, marginTop: 2 }}>Issued {fmt.dateShort(inv.issueDate)} · Due {fmt.dateShort(inv.dueDate)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "20px", fontWeight: 700, fontFamily: T.mono, color: T.text }}>{fmt.currency(inv.total)}</div>
            {inv.balanceDue > 0 && inv.balanceDue !== inv.total && (
              <div style={{ fontSize: "12px", color: C.orange, fontWeight: 600, marginTop: 2 }}>{fmt.currency(inv.balanceDue)} remaining</div>
            )}
            {inv.balanceDue === 0 && <div style={{ fontSize: "12px", color: C.green, fontWeight: 600, marginTop: 2 }}>Paid in full</div>}
          </div>
        </div>
      </Card>
    ))}
  </div>
);

// ---- INVOICE DETAIL ----
const InvoiceDetailPage = ({ invoiceId, nav }) => {
  const inv = PORTAL.invoices.find(i => i.id === invoiceId);
  if (!inv) return <div style={{ padding: 40, color: T.textMuted }}>Invoice not found</div>;
  return (
    <div>
      <div onClick={() => nav("invoices")} style={{ fontSize: "12px", color: C.green, cursor: "pointer", fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 4 }}>← Back to Invoices</div>
      <Card style={{ padding: "28px 32px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>Invoice</div>
            <div style={{ fontSize: "28px", fontWeight: 700, fontFamily: T.mono, color: T.text, marginTop: 2 }}>{inv.invoiceNumber}</div>
            <div style={{ fontSize: "14px", color: T.textMuted, marginTop: 4 }}>{inv.matter.matterNumber} — {inv.matter.name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <StatusBadge status={inv.status} />
            <div style={{ fontSize: "11px", color: T.textDim, marginTop: 8 }}>Issued {fmt.date(inv.issueDate)}</div>
            <div style={{ fontSize: "11px", color: T.textDim }}>Due {fmt.date(inv.dueDate)}</div>
          </div>
        </div>

        {/* Line items */}
        {inv.lineItems.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: "10px", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <div style={{ flex: 1 }}>Description</div>
              <div style={{ width: 70, textAlign: "right" }}>Hours</div>
              <div style={{ width: 80, textAlign: "right" }}>Rate</div>
              <div style={{ width: 90, textAlign: "right" }}>Amount</div>
            </div>
            {inv.lineItems.map((li, i) => (
              <div key={i} style={{ display: "flex", padding: "10px 0", borderBottom: `1px solid ${T.borderSubtle}`, fontSize: "13px" }}>
                <div style={{ flex: 1, color: T.textSec }}>{li.description}</div>
                <div style={{ width: 70, textAlign: "right", fontFamily: T.mono, color: T.textMuted }}>{li.quantity.toFixed(1)}</div>
                <div style={{ width: 80, textAlign: "right", fontFamily: T.mono, color: T.textMuted }}>{fmt.currencyFull(li.rate)}</div>
                <div style={{ width: 90, textAlign: "right", fontFamily: T.mono, fontWeight: 600, color: T.text }}>{fmt.currencyFull(li.amount)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "13px" }}>
              <span style={{ color: T.textMuted }}>Subtotal</span><span style={{ fontFamily: T.mono, color: T.text }}>{fmt.currency(inv.total)}</span>
            </div>
            {inv.amountPaid > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "13px" }}>
                <span style={{ color: T.textMuted }}>Paid</span><span style={{ fontFamily: T.mono, color: C.green }}>-{fmt.currency(inv.amountPaid)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "16px", fontWeight: 700, borderTop: `2px solid ${T.border}`, marginTop: 4 }}>
              <span style={{ color: T.text }}>Balance Due</span><span style={{ fontFamily: T.mono, color: inv.balanceDue > 0 ? C.darkGreen : C.green }}>{fmt.currency(inv.balanceDue)}</span>
            </div>
          </div>
        </div>

        {/* Payments */}
        {inv.payments.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.borderSubtle}` }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: T.text, marginBottom: 8 }}>Payment History</div>
            {inv.payments.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: "13px" }}>
                <span style={{ color: T.textMuted }}>{fmt.dateShort(p.receivedDate)} · {p.method}</span>
                <span style={{ fontFamily: T.mono, color: C.green, fontWeight: 600 }}>{fmt.currency(p.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pay button */}
      {inv.balanceDue > 0 && inv.status !== "draft" && (
        <Card style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", background: C.greenBg, border: `1px solid rgba(63,118,83,0.15)` }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: T.text }}>Pay {fmt.currency(inv.balanceDue)}</div>
            <div style={{ fontSize: "12px", color: T.textMuted, marginTop: 2 }}>Secure payment powered by Stripe</div>
          </div>
          <Btn variant="pay" onClick={() => alert("This would redirect to Stripe Checkout")}>
            <Icon name="card" size={16} color={C.white} /> Pay Now
          </Btn>
        </Card>
      )}
    </div>
  );
};

// ---- ENTITIES ----
const EntitiesPage = () => (
  <div>
    <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: T.text }}>Your Entities</h1>
    <p style={{ margin: "0 0 24px", fontSize: "13px", color: T.textMuted }}>{PORTAL.entities.length} entities registered</p>
    {PORTAL.entities.map(ent => (
      <Card key={ent.id} style={{ padding: "22px 26px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: T.text }}>{ent.legalName}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
              <Badge color={T.textMuted} bg="rgba(122,124,128,0.08)">{ent.entityType}</Badge>
              <Badge color={C.turquoise} bg={C.blueBg}>{ent.stateOfFormation}</Badge>
              <StatusBadge status={ent.status} />
            </div>
          </div>
          <div style={{ fontSize: "12px", color: T.textMuted, textAlign: "right" }}>Formed {fmt.dateShort(ent.formationDate)}<br />RA: {ent.registeredAgentName}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {/* Officers */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Officers</div>
            {ent.officers.map((o, i) => (
              <div key={i} style={{ fontSize: "13px", color: T.textSec, marginBottom: 4 }}>{o.personName} <span style={{ color: T.textMuted }}>({o.title})</span></div>
            ))}
          </div>

          {/* Jurisdictions */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Jurisdictions</div>
            {ent.jurisdictions.map((j, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                <Badge color={C.turquoise} bg={C.blueBg}>{j.state}</Badge>
                <span style={{ fontSize: "12px", color: T.textMuted }}>{j.registrationType}</span>
              </div>
            ))}
          </div>

          {/* Compliance */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>Upcoming Filings</div>
            {ent.complianceTasks.filter(t => t.status !== "completed").map((ct, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: "12px", color: T.textSec }}>{ct.taskName}</span>
                <span style={{ fontSize: "11px", fontWeight: 600, color: C.orange }}>{fmt.dateShort(ct.dueDate)}</span>
              </div>
            ))}
            {ent.complianceTasks.filter(t => t.status !== "completed").length === 0 && (
              <div style={{ fontSize: "12px", color: C.green }}><Icon name="check" size={14} color={C.green} style={{ verticalAlign: "middle", marginRight: 4 }} />All filings up to date</div>
            )}
          </div>
        </div>
      </Card>
    ))}
  </div>
);

// ---- DOCUMENTS ----
const DocumentsPage = () => (
  <div>
    <h1 style={{ margin: "0 0 4px", fontSize: "22px", fontWeight: 700, color: T.text }}>Shared Documents</h1>
    <p style={{ margin: "0 0 24px", fontSize: "13px", color: T.textMuted }}>{PORTAL.documents.length} documents shared with you</p>
    {PORTAL.documents.map(doc => (
      <Card key={doc.id} style={{ padding: "16px 22px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: T.radius, background: C.greenBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="doc" size={18} color={C.green} />
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: T.text }}>{doc.title}</div>
              <div style={{ fontSize: "12px", color: T.textMuted, marginTop: 2 }}>{doc.file.fileName} · {fmt.fileSize(doc.file.fileSize)} · v{doc.file.versionNumber}</div>
              <div style={{ fontSize: "11px", color: T.textDim, marginTop: 1 }}>{doc.matter.matterNumber} · Shared {fmt.relative(doc.sharedAt)}</div>
              {doc.message && <div style={{ fontSize: "12px", color: T.textSec, marginTop: 4, fontStyle: "italic", background: C.greenBg, padding: "4px 8px", borderRadius: 4, display: "inline-block" }}>"{doc.message}"</div>}
            </div>
          </div>
          <Btn variant="outline" style={{ padding: "8px 14px", fontSize: "12px" }}>
            <Icon name="download" size={14} color={C.darkGreen} /> Download
          </Btn>
        </div>
      </Card>
    ))}
  </div>
);

// ---- MESSAGES ----
const MessagesPage = () => {
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [newThreadMatter, setNewThreadMatter] = useState("");
  const [newThreadSubject, setNewThreadSubject] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);

  const convsByMatter = {};
  const generalConvs = [];
  const billingConvs = [];
  PORTAL.conversations.forEach(c => {
    if (c.category === "general") { generalConvs.push(c); return; }
    if (c.category === "billing") { billingConvs.push(c); return; }
    if (!convsByMatter[c.matterId]) convsByMatter[c.matterId] = { matterNumber: c.matterId, matterName: c.matterName, convs: [] };
    convsByMatter[c.matterId].convs.push(c);
  });

  const selectedConv = PORTAL.conversations.find(c => c.id === selectedConvId);
  const totalUnread = PORTAL.conversations.filter(c => c.status === "open" && c.messages[c.messages.length - 1]?.senderType === "firm").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: T.text }}>Conversations</h1>
          <p style={{ margin: "2px 0 0", fontSize: "13px", color: T.textMuted }}>{PORTAL.conversations.length} threads across {Object.keys(convsByMatter).length} matters{totalUnread > 0 ? ` · ${totalUnread} unread` : ""}</p>
        </div>
        <Btn onClick={() => setShowNewThread(true)}>
          <Icon name="message" size={14} color={C.cream} /> New Conversation
        </Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, minHeight: 500 }}>
        {/* Thread list grouped by category then matter */}
        <div style={{ overflow: "auto", maxHeight: "75vh" }}>
          {/* General inquiries */}
          {generalConvs.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: C.turquoise, textTransform: "uppercase", letterSpacing: "0.6px", padding: "0 12px 6px", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="message" size={12} color={C.turquoise} />
                New Questions
              </div>
              {generalConvs.map(conv => {
                const isSelected = selectedConvId === conv.id;
                const lastMsg = conv.messages[conv.messages.length - 1];
                const unread = conv.status === "open" && lastMsg?.senderType === "firm";
                return (
                  <div key={conv.id} onClick={() => { setSelectedConvId(conv.id); setReplyText(""); }}
                    style={{ padding: "12px 14px", borderRadius: T.radius, marginBottom: 3, cursor: "pointer", background: isSelected ? C.blueBg : "transparent", border: `1px solid ${isSelected ? "rgba(74,153,167,0.2)" : "transparent"}`, transition: "all 0.15s" }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(74,153,167,0.04)"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? C.blueBg : "transparent"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                      {unread && <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.turquoise, flexShrink: 0 }} />}
                      <span style={{ fontSize: "13px", fontWeight: unread ? 700 : 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.subject}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: T.textMuted }}>{conv.messages.length} message{conv.messages.length !== 1 ? "s" : ""} · {fmt.relative(conv.lastMessageAt)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Billing inquiries */}
          {billingConvs.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: "0.6px", padding: "0 12px 6px", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="invoice" size={12} color={C.orange} />
                Billing
              </div>
              {billingConvs.map(conv => {
                const isSelected = selectedConvId === conv.id;
                const lastMsg = conv.messages[conv.messages.length - 1];
                const unread = conv.status === "open" && lastMsg?.senderType === "firm";
                return (
                  <div key={conv.id} onClick={() => { setSelectedConvId(conv.id); setReplyText(""); }}
                    style={{ padding: "12px 14px", borderRadius: T.radius, marginBottom: 3, cursor: "pointer", background: isSelected ? C.orangeBg : "transparent", border: `1px solid ${isSelected ? "rgba(212,133,31,0.2)" : "transparent"}`, transition: "all 0.15s" }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(212,133,31,0.04)"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? C.orangeBg : "transparent"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                      {unread && <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.orange, flexShrink: 0 }} />}
                      <span style={{ fontSize: "13px", fontWeight: unread ? 700 : 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.subject}</span>
                    </div>
                    <div style={{ fontSize: "11px", color: T.textMuted }}>{conv.messages.length} message{conv.messages.length !== 1 ? "s" : ""} · {fmt.relative(conv.lastMessageAt)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Matter-scoped conversations */}
          {Object.values(convsByMatter).map(group => (
            <div key={group.matterNumber} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.6px", padding: "0 12px 6px", display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="building" size={12} color={T.textMuted} />
                {group.matterName}
              </div>
              {group.convs.map(conv => {
                const isSelected = selectedConvId === conv.id;
                const lastMsg = conv.messages[conv.messages.length - 1];
                const unread = conv.status === "open" && lastMsg?.senderType === "firm";
                return (
                  <div key={conv.id} onClick={() => { setSelectedConvId(conv.id); setReplyText(""); }}
                    style={{ padding: "12px 14px", borderRadius: T.radius, marginBottom: 3, cursor: "pointer", background: isSelected ? C.greenBg : "transparent", border: `1px solid ${isSelected ? "rgba(63,118,83,0.15)" : "transparent"}`, transition: "all 0.15s" }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(63,118,83,0.03)"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = isSelected ? C.greenBg : "transparent"; }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                      {unread && <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, flexShrink: 0 }} />}
                      <span style={{ fontSize: "13px", fontWeight: unread ? 700 : 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.subject}</span>
                      {conv.status === "closed" && <Badge color={T.textMuted} bg="rgba(122,124,128,0.08)">Closed</Badge>}
                    </div>
                    <div style={{ fontSize: "11px", color: T.textMuted }}>{conv.messages.length} messages · {fmt.relative(conv.lastMessageAt)}</div>
                    <div style={{ fontSize: "11.5px", color: T.textDim, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lastMsg?.senderName}: {lastMsg?.body.slice(0, 50)}...</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Selected conversation */}
        {selectedConv ? (
          <Card style={{ padding: 0, display: "flex", flexDirection: "column", maxHeight: "75vh" }}>
            {/* Header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: T.text }}>{selectedConv.subject}</div>
              <div style={{ fontSize: "12px", color: T.textMuted, marginTop: 3 }}>
                {selectedConv.matterName} · {selectedConv.matterId} · {selectedConv.messages.length} messages
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflow: "auto", padding: "18px 20px" }}>
              {selectedConv.messages.map(msg => (
                <div key={msg.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: msg.senderType === "client" ? C.blueBg : C.greenBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 800, color: msg.senderType === "client" ? C.turquoise : C.green, flexShrink: 0 }}>
                      {msg.senderType === "client" ? "You" : msg.senderName.split(" ").map(w => w[0]).join("").slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: T.text }}>{msg.senderName}</span>
                    </div>
                    <span style={{ fontSize: "11px", color: T.textDim }}>{new Date(msg.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                  </div>
                  <div style={{ marginLeft: 40, fontSize: "14px", color: T.textSec, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{msg.body}</div>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div style={{ marginLeft: 40, marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {msg.attachments.map((a, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", background: C.greenBg, borderRadius: T.radius, border: `1px solid rgba(63,118,83,0.12)`, cursor: "pointer" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = C.green}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(63,118,83,0.12)"}>
                          <Icon name="doc" size={14} color={C.green} />
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: 600, color: T.text }}>{a.fileName}</div>
                            <div style={{ fontSize: "10px", color: T.textMuted }}>{fmt.fileSize(a.fileSize)}</div>
                          </div>
                          <Icon name="download" size={13} color={T.textMuted} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Reply */}
            {selectedConv.status === "open" ? (
              <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}`, flexShrink: 0, background: "rgba(252,248,241,0.5)" }}>
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Type your reply..." rows={3}
                  style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${T.border}`, borderRadius: T.radius, fontSize: "14px", fontFamily: T.font, color: T.text, resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: 10 }}
                  onFocus={e => e.target.style.borderColor = C.green}
                  onBlur={e => e.target.style.borderColor = T.border} />
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Btn variant="outline" style={{ fontSize: "12px", padding: "7px 14px" }}>
                    <Icon name="external" size={13} color={C.darkGreen} /> Attach File
                  </Btn>
                  <Btn disabled={!replyText.trim()}>
                    <Icon name="send" size={14} color={C.cream} /> Send Reply
                  </Btn>
                </div>
              </div>
            ) : (
              <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.border}`, textAlign: "center", fontSize: "13px", color: T.textMuted, background: "rgba(252,248,241,0.5)" }}>
                This conversation is closed. Your attorneys can reopen it if needed.
              </div>
            )}
          </Card>
        ) : (
          <Card style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
            <div style={{ textAlign: "center" }}>
              <Icon name="message" size={32} color={T.textDim} />
              <div style={{ fontSize: "15px", fontWeight: 600, color: T.textMuted, marginTop: 12 }}>Select a conversation</div>
              <div style={{ fontSize: "13px", color: T.textDim, marginTop: 4 }}>Or start a new one about a specific matter</div>
            </div>
          </Card>
        )}
      </div>

      {/* New Thread Modal — Three Category Picker */}
      {showNewThread && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowNewThread(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(33,59,43,0.4)", backdropFilter: "blur(6px)" }} />
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: T.card, border: `1px solid ${T.border}`, borderRadius: T.radiusLg, width: 520, padding: 28, boxShadow: "0 12px 40px rgba(33,59,43,0.12)" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: 700, color: T.text }}>New Conversation</h3>
            <p style={{ margin: "0 0 20px", fontSize: "13px", color: T.textMuted }}>What would you like to discuss?</p>

            {/* Category picker */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
              {[
                { id: "general", label: "New Question", desc: "Ask about a new topic or service", icon: "message", color: C.turquoise, bg: C.blueBg },
                { id: "billing", label: "Billing Inquiry", desc: "Questions about invoices or payments", icon: "invoice", color: C.orange, bg: C.orangeBg },
                { id: "matter", label: "Existing Matter", desc: "About a specific active matter", icon: "building", color: C.green, bg: C.greenBg },
              ].map(cat => (
                <div key={cat.id} onClick={() => setNewThreadMatter(cat.id === "matter" ? "__pick__" : cat.id)}
                  style={{ padding: "16px 14px", borderRadius: T.radiusLg, border: `2px solid ${(newThreadMatter === cat.id || (cat.id === "matter" && newThreadMatter && newThreadMatter !== "general" && newThreadMatter !== "billing")) ? cat.color : T.border}`, cursor: "pointer", textAlign: "center", transition: "all 0.15s", background: (newThreadMatter === cat.id || (cat.id === "matter" && newThreadMatter && newThreadMatter !== "general" && newThreadMatter !== "billing" && newThreadMatter !== "__pick__")) ? cat.bg : "transparent" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = cat.color}
                  onMouseLeave={e => { const sel = newThreadMatter === cat.id || (cat.id === "matter" && newThreadMatter && !["general","billing"].includes(newThreadMatter)); if (!sel) e.currentTarget.style.borderColor = T.border; }}>
                  <Icon name={cat.icon} size={22} color={cat.color} />
                  <div style={{ fontSize: "13px", fontWeight: 700, color: T.text, marginTop: 8 }}>{cat.label}</div>
                  <div style={{ fontSize: "11px", color: T.textMuted, marginTop: 3 }}>{cat.desc}</div>
                </div>
              ))}
            </div>

            {/* Matter picker (only for Existing Matter) */}
            {newThreadMatter === "__pick__" && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Select Matter</div>
                <select onChange={e => setNewThreadMatter(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${T.border}`, borderRadius: T.radius, fontSize: "14px", fontFamily: T.font, color: T.text, background: T.card }}>
                  <option value="__pick__">Choose a matter...</option>
                  {PORTAL.matters.filter(m => m.portalVisible && m.status === "open").map(m => (
                    <option key={m.matterNumber} value={m.matterNumber}>{m.matterNumber} — {m.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Subject + Message (shown once category is picked) */}
            {newThreadMatter && newThreadMatter !== "__pick__" && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Subject</div>
                  <input value={newThreadSubject} onChange={e => setNewThreadSubject(e.target.value)}
                    placeholder={newThreadMatter === "billing" ? "e.g., Question about latest invoice" : newThreadMatter === "general" ? "e.g., Interested in trademark registration" : "e.g., Question about vesting schedule"}
                    style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${T.border}`, borderRadius: T.radius, fontSize: "14px", fontFamily: T.font, color: T.text, outline: "none", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e => e.target.style.borderColor = T.border} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Message</div>
                  <textarea placeholder="Type your message..." rows={4}
                    style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${T.border}`, borderRadius: T.radius, fontSize: "14px", fontFamily: T.font, color: T.text, resize: "vertical", outline: "none", boxSizing: "border-box" }}
                    onFocus={e => e.target.style.borderColor = C.green}
                    onBlur={e => e.target.style.borderColor = T.border} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <Btn variant="outline" style={{ fontSize: "12px", padding: "8px 14px" }}>
                    <Icon name="external" size={13} color={C.darkGreen} /> Attach File
                  </Btn>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Btn variant="ghost" onClick={() => { setShowNewThread(false); setNewThreadMatter(""); setNewThreadSubject(""); }}>Cancel</Btn>
                    <Btn disabled={!newThreadSubject.trim()} onClick={() => { setShowNewThread(false); setNewThreadMatter(""); setNewThreadSubject(""); }}>
                      <Icon name="send" size={14} color={C.cream} /> Start Conversation
                    </Btn>
                  </div>
                </div>
              </>
            )}

            {!newThreadMatter && (
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Btn variant="ghost" onClick={() => setShowNewThread(false)}>Cancel</Btn>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PORTAL SHELL
// ============================================================
const NAV = [
  { id: "home", label: "Home", icon: "home" },
  { id: "invoices", label: "Invoices", icon: "invoice" },
  { id: "entities", label: "Entities", icon: "building" },
  { id: "documents", label: "Documents", icon: "doc" },
  { id: "messages", label: "Conversations", icon: "message" },
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [route, setRoute] = useState({ page: "home", id: null });
  const nav = useCallback((page, id = null) => setRoute({ page, id }), []);
  const page = route.page;

  if (!loggedIn) return <LoginPage onLogin={() => setLoggedIn(true)} />;

  const renderPage = () => {
    switch (page) {
      case "invoices": return <InvoicesPage nav={nav} />;
      case "invoice": return <InvoiceDetailPage invoiceId={route.id} nav={nav} />;
      case "entities": return <EntitiesPage />;
      case "documents": return <DocumentsPage />;
      case "messages": return <MessagesPage />;
      default: return <DashboardPage nav={nav} />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: T.font, color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=IBM+Plex+Mono:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
        input::placeholder, textarea::placeholder { color: ${T.textDim}; }
        select { color-scheme: light; }
      `}</style>

      {/* Sidebar */}
      <aside style={{ width: 240, background: C.white, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Firm brand */}
        <div style={{ padding: "22px 20px 18px", borderBottom: `1px solid ${T.borderSubtle}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.green}, ${C.lime})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: T.fontDisplay, fontSize: "18px", fontWeight: 700, color: C.darkGreen }}>F</span>
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: C.darkGreen, fontFamily: T.fontDisplay }}>{CONFIG.firm}</div>
              <div style={{ fontSize: "10.5px", color: T.textMuted, letterSpacing: "0.5px" }}>{CONFIG.portalTitle}</div>
            </div>
          </div>
        </div>

        {/* Client info */}
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.borderSubtle}`, background: C.greenBg }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: C.darkGreen }}>{PORTAL.client.name}</div>
          <div style={{ fontSize: "11px", color: T.textMuted, marginTop: 2 }}>{PORTAL.client.email}</div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 12px" }}>
          {NAV.map(item => {
            const active = page === item.id || (item.id === "invoices" && page === "invoice");
            return (
              <button key={item.id} onClick={() => nav(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", border: "none", borderRadius: T.radius, cursor: "pointer", fontSize: "13px", fontWeight: active ? 700 : 500, fontFamily: T.font, background: active ? C.greenBg : "transparent", color: active ? C.darkGreen : T.textMuted, transition: "all 0.15s", marginBottom: 2 }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(63,118,83,0.03)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                <Icon name={item.icon} size={17} color={active ? C.green : T.textMuted} />{item.label}
                {item.id === "messages" && PORTAL.summary.unreadMessages > 0 && (
                  <span style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", background: C.green, color: C.white, fontSize: "10px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{PORTAL.summary.unreadMessages}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${T.borderSubtle}` }}>
          <button onClick={() => setLoggedIn(false)} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: T.textMuted, fontFamily: T.font, padding: 0 }}>
            <Icon name="logout" size={15} color={T.textMuted} /> Sign Out
          </button>
          <div style={{ fontSize: "10px", color: T.textDim, marginTop: 10 }}>Powered by Abbado · Encrypted & Secure</div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", padding: "28px 36px", maxWidth: 960 }}>
        {renderPage()}
      </main>
    </div>
  );
}
