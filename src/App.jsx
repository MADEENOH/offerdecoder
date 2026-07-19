import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Clipboard,
  FileSearch,
  Info,
  LoaderCircle,
  Mail,
  MapPin,
  MessageSquareText,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert
} from "lucide-react";

const SAMPLE_OFFER_TEXT = `CONFIDENTIAL EMPLOYMENT OFFER AGREEMENT

Company: Helios Quantum Systems, Inc.
Role: Principal ML Infrastructure Engineer
Location: Hybrid (San Francisco, CA + Remote)
Start Date: June 15, 2026
Base Salary: $188,000 annualized, paid semi-monthly.
Sign-On Bonus: $40,000, payable within first payroll cycle; subject to 100% clawback if employee resigns or is terminated for any reason within 18 months.
Performance Bonus: Target 12% annual bonus, discretionary and contingent on company and manager determination.
Equity: 42,000 stock options at strike price set on grant date; vesting 1-year cliff then monthly over 48 months. Company may repurchase vested shares upon termination under Board-approved valuation.
Schedule: Employee acknowledges role requires "professional flexibility," including nights, weekends, and travel with no additional overtime compensation.
At-Will: Employment remains at-will and may be terminated at any time with or without cause, notice, or severance.
Severance: If terminated without cause, severance may be granted at company discretion.
IP Assignment: Employee assigns all inventions, works, code, models, datasets, and ideas conceived during employment and for 12 months after separation if related to company business.
Non-Compete: Employee will not directly or indirectly work for, advise, or invest in any competitive business in North America for 24 months after termination.
Dispute Resolution: Mandatory confidential arbitration in Delaware; employee waives right to jury trial and class/collective actions.
Benefits: Medical, dental, and vision begin on first day of month after 60 days of continuous employment.
PTO: 12 vacation days/year; unused days expire annually.`;

const statusStyle = {
  clear: "border-emerald-200 bg-emerald-50 text-emerald-800",
  review: "border-amber-200 bg-amber-50 text-amber-800",
  concern: "border-rose-200 bg-rose-50 text-rose-800",
  not_stated: "border-slate-200 bg-slate-50 text-slate-600"
};

const severityStyle = {
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
  positive: "bg-emerald-100 text-emerald-700"
};

async function postJSON(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

function EmptyState() {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-8 text-center">
      <div className="mb-5 rounded-2xl bg-cyan-50 p-4 text-cyan-700"><FileSearch className="h-8 w-8" /></div>
      <h2 className="text-xl font-bold text-slate-900">Your offer, translated into plain English</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Paste an employment offer to separate guaranteed value from conditional promises, surface unclear terms, and prepare better questions.</p>
      <div className="mt-6 flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500">
        <Sparkles className="h-3.5 w-3.5 text-cyan-600" /> Analysis powered by GPT-5.6
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[430px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white px-8 text-center shadow-sm">
      <LoaderCircle className="h-10 w-10 animate-spin text-cyan-600" />
      <h2 className="mt-5 text-lg font-bold text-slate-900">Reading the details</h2>
      <p className="mt-2 text-sm text-slate-500">GPT-5.6 is extracting terms and checking each observation against the document.</p>
    </div>
  );
}

function CompensationList({ title, items, tone = "slate" }) {
  if (!items?.length) return null;
  const iconClass = tone === "green" ? "text-emerald-600" : tone === "amber" ? "text-amber-600" : "text-slate-500";
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, index) => <li key={index} className="flex gap-2 text-sm leading-5 text-slate-700"><Check className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />{item}</li>)}
      </ul>
    </div>
  );
}

function AnalysisResults({ analysis, selected, setSelected, openId, setOpenId }) {
  const money = analysis.compensation;
  const basePay = money.basePayAmount == null
    ? "Not stated"
    : `${new Intl.NumberFormat("en-US", { style: "currency", currency: money.currency || "USD", maximumFractionDigits: 0 }).format(money.basePayAmount)}${money.basePayPeriod && money.basePayPeriod !== "not_stated" ? `/${money.basePayPeriod}` : ""}`;

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl shadow-slate-200">
        <div className="border-b border-white/10 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">Offer snapshot</p>
              <h2 className="mt-2 text-2xl font-bold">{analysis.role || "Role not stated"}</h2>
              <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1.5"><BriefcaseBusiness className="h-4 w-4" />{analysis.company || "Company not stated"}</span>
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{analysis.location || "Location not stated"}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 px-5 py-3 text-right">
              <p className="text-xs text-slate-300">Base pay</p><p className="mt-1 text-xl font-bold text-cyan-300">{basePay}</p>
            </div>
          </div>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-200">{analysis.overallAssessment}</p>
        </div>
        <div className="flex items-center justify-between gap-4 px-6 py-3 text-xs text-slate-400">
          <span>Model: {analysis.model}</span><span>Analysis confidence: {analysis.confidence}</span>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3"><div className="rounded-xl bg-emerald-50 p-2 text-emerald-700"><CircleDollarSign className="h-5 w-5" /></div><div><h3 className="font-bold text-slate-900">What the compensation actually says</h3><p className="text-xs text-slate-500">Guaranteed and conditional value are separated.</p></div></div>
        <div className="grid gap-6 md:grid-cols-2">
          <CompensationList title="Guaranteed cash" items={money.guaranteedCash} tone="green" />
          <CompensationList title="Conditional or discretionary" items={money.conditionalCash} tone="amber" />
          <CompensationList title="Equity" items={money.equity} />
          <CompensationList title="Benefits" items={money.benefits} />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-bold text-slate-900">Clarity check</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {analysis.dimensions.map((dimension, index) => (
            <div key={index} className={`rounded-2xl border p-4 ${statusStyle[dimension.status]}`}>
              <div className="flex items-center justify-between gap-3"><p className="text-sm font-bold">{dimension.name}</p><span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-bold uppercase">{dimension.status.replace("_", " ")}</span></div>
              <p className="mt-2 text-xs leading-5 opacity-90">{dimension.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-bold text-slate-900">Terms worth discussing</h3><p className="mt-1 text-xs text-slate-500">Select findings to include in your negotiation draft.</p></div><span className="text-xs font-semibold text-cyan-700">{selected.size} selected</span></div>
        <div className="mt-4 space-y-3">
          {analysis.findings.map((finding) => {
            const isOpen = openId === finding.id;
            const isSelected = selected.has(finding.id);
            return (
              <article key={finding.id} className={`overflow-hidden rounded-2xl border ${isSelected ? "border-cyan-300 ring-2 ring-cyan-100" : "border-slate-200"}`}>
                <div className="flex items-center gap-3 p-4">
                  <button onClick={() => setSelected((previous) => { const next = new Set(previous); next.has(finding.id) ? next.delete(finding.id) : next.add(finding.id); return next; })} className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${isSelected ? "border-cyan-600 bg-cyan-600 text-white" : "border-slate-300"}`} aria-label={`Select ${finding.title}`}>{isSelected && <Check className="h-3.5 w-3.5" />}</button>
                  <button onClick={() => setOpenId(isOpen ? null : finding.id)} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left">
                    <div><span className={`mr-2 inline-block rounded-full px-2 py-1 text-[10px] font-bold uppercase ${severityStyle[finding.severity]}`}>{finding.severity}</span><span className="text-sm font-bold text-slate-900">{finding.title}</span></div>
                    {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
                  </button>
                </div>
                {isOpen && <div className="border-t border-slate-100 bg-slate-50/70 p-4 text-sm"><p className="rounded-xl border-l-4 border-cyan-500 bg-white p-3 font-medium italic text-slate-700">“{finding.clause}”</p><p className="mt-3 leading-6 text-slate-700">{finding.observation}</p><p className="mt-2 leading-6 text-slate-600"><strong>Why it matters:</strong> {finding.whyItMatters}</p><p className="mt-2 leading-6 text-cyan-800"><strong>Question to ask:</strong> {finding.suggestedQuestion}</p></div>}
              </article>
            );
          })}
        </div>
      </section>

      {(analysis.missingInformation.length > 0 || analysis.nextSteps.length > 0) && <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5"><h3 className="flex items-center gap-2 font-bold text-amber-900"><Info className="h-5 w-5" />Missing or unclear</h3><ul className="mt-3 space-y-2 text-sm leading-5 text-amber-900">{analysis.missingInformation.map((item, i) => <li key={i}>• {item}</li>)}</ul></div>
        <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5"><h3 className="flex items-center gap-2 font-bold text-cyan-900"><ArrowRight className="h-5 w-5" />Suggested next steps</h3><ul className="mt-3 space-y-2 text-sm leading-5 text-cyan-900">{analysis.nextSteps.map((item, i) => <li key={i}>• {item}</li>)}</ul></div>
      </section>}
    </div>
  );
}

export default function App() {
  const [offerText, setOfferText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [openId, setOpenId] = useState(null);
  const [tone, setTone] = useState("collaborative");
  const [draft, setDraft] = useState(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedFindings = useMemo(() => analysis?.findings.filter((item) => selected.has(item.id)) || [], [analysis, selected]);

  const analyze = async () => {
    setError(""); setAnalysis(null); setDraft(null); setIsAnalyzing(true);
    try {
      const result = await postJSON("/api/analyze", { offerText });
      setAnalysis(result);
      const initial = new Set(result.findings.filter((item) => item.severity !== "positive").slice(0, 3).map((item) => item.id));
      setSelected(initial); setOpenId(result.findings[0]?.id || null);
    } catch (err) { setError(err.message); } finally { setIsAnalyzing(false); }
  };

  const generateDraft = async () => {
    setError(""); setIsDrafting(true); setDraft(null);
    try { setDraft(await postJSON("/api/negotiate", { offerText, tone, findings: selectedFindings })); }
    catch (err) { setError(err.message); } finally { setIsDrafting(false); }
  };

  const reset = () => { setOfferText(""); setAnalysis(null); setDraft(null); setError(""); setSelected(new Set()); };
  const copyDraft = async () => { if (!draft) return; await navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.email}`); setCopied(true); setTimeout(() => setCopied(false), 1800); };

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3"><div className="rounded-xl bg-slate-950 p-2 text-cyan-300"><ShieldCheck className="h-5 w-5" /></div><div><p className="font-extrabold tracking-tight">OfferDecoder</p><p className="text-[11px] text-slate-500">Know what you’re agreeing to</p></div></div>
          <div className="hidden items-center gap-2 rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 sm:flex"><Sparkles className="h-3.5 w-3.5" />Built with Codex + GPT-5.6</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8 max-w-3xl"><p className="text-sm font-bold uppercase tracking-[.18em] text-cyan-700">Employment offer clarity</p><h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">Understand the fine print before you sign.</h1><p className="mt-4 text-base leading-7 text-slate-600">OfferDecoder separates what is guaranteed from what is conditional, identifies terms worth clarifying, and helps you prepare a thoughtful response.</p></div>

        {error && <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /><div><strong>We couldn’t complete that request.</strong><p className="mt-1">{error}</p></div></div>}

        <div className="grid items-start gap-6 lg:grid-cols-[.82fr_1.18fr]">
          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-center justify-between"><div><label htmlFor="offer" className="font-bold">Paste your offer</label><p className="mt-1 text-xs text-slate-500">Remove names or sensitive identifiers first.</p></div>{offerText && <button onClick={reset} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Start over"><RotateCcw className="h-4 w-4" /></button>}</div>
            <textarea id="offer" value={offerText} onChange={(event) => setOfferText(event.target.value)} placeholder="Paste the employment offer text here..." className="mt-4 h-80 w-full resize-y rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100" />
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400"><button onClick={() => setOfferText(SAMPLE_OFFER_TEXT)} className="font-semibold text-cyan-700 hover:text-cyan-900">Use sample offer</button><span>{offerText.length.toLocaleString()} / 24,000</span></div>
            <button onClick={analyze} disabled={isAnalyzing || offerText.trim().length < 150} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40">{isAnalyzing ? <><LoaderCircle className="h-4 w-4 animate-spin" />Analyzing offer</> : <><FileSearch className="h-4 w-4" />Decode this offer</>}</button>
            <p className="mt-4 flex gap-2 text-[11px] leading-5 text-slate-500"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />Your API request is not stored by OpenAI. OfferDecoder does not provide legal advice or determine whether terms are enforceable.</p>
          </aside>

          <div>{isAnalyzing ? <LoadingState /> : analysis ? <AnalysisResults analysis={analysis} selected={selected} setSelected={setSelected} openId={openId} setOpenId={setOpenId} /> : <EmptyState />}</div>
        </div>

        {analysis && <section className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-700 to-slate-950 p-6 text-white shadow-xl sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
            <div><div className="inline-flex rounded-xl bg-white/10 p-2.5 text-cyan-200"><MessageSquareText className="h-6 w-6" /></div><h2 className="mt-4 text-2xl font-bold">Turn insight into a conversation</h2><p className="mt-2 text-sm leading-6 text-cyan-50/80">Generate a ready-to-edit email using only the findings you selected. GPT‑5.6 will not invent competing offers or market data.</p>
              <label className="mt-5 block text-xs font-bold uppercase tracking-wider text-cyan-200">Tone</label><div className="mt-2 flex flex-wrap gap-2">{["collaborative", "confident", "concise"].map((item) => <button key={item} onClick={() => setTone(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${tone === item ? "bg-white text-slate-950" : "bg-white/10 text-white hover:bg-white/20"}`}>{item}</button>)}</div>
              <button onClick={generateDraft} disabled={isDrafting || selectedFindings.length === 0} className="mt-5 flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-white disabled:opacity-40">{isDrafting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}{isDrafting ? "Drafting..." : `Draft email from ${selectedFindings.length} finding${selectedFindings.length === 1 ? "" : "s"}`}</button>
            </div>
            <div className="min-h-72 rounded-2xl bg-white p-5 text-slate-800 shadow-inner">
              {isDrafting ? <div className="flex h-full min-h-64 items-center justify-center text-sm text-slate-500"><LoaderCircle className="mr-2 h-5 w-5 animate-spin text-cyan-600" />Writing your draft...</div> : draft ? <><div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</p><p className="mt-1 font-semibold">{draft.subject}</p></div><button onClick={copyDraft} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50">{copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clipboard className="h-4 w-4" />}{copied ? "Copied" : "Copy"}</button></div><div className="mt-4 whitespace-pre-wrap text-sm leading-6">{draft.email}</div></> : <div className="flex h-full min-h-64 flex-col items-center justify-center text-center"><Mail className="h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">Your negotiation draft will appear here.</p><p className="mt-1 text-xs text-slate-400">Select at least one finding above.</p></div>}
            </div>
          </div>
        </section>}

        <footer className="mt-10 border-t border-slate-200 py-6 text-center text-xs leading-5 text-slate-500"><p><strong>OfferDecoder is an educational clarity tool, not a lawyer or financial adviser.</strong></p><p className="mt-1">Verify important terms with the employer and consult a qualified professional when appropriate.</p></footer>
      </main>
    </div>
  );
}
