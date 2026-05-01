import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  BadgeDollarSign,
  FileSearch,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp
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
Non-Solicit: Employee may not solicit employees, customers, contractors, or prospects for 24 months post-employment.
Dispute Resolution: Mandatory confidential arbitration in Delaware; employee waives right to jury trial and class/collective actions.
Relocation: Employee must relocate within 30 miles of SF HQ within 90 days at employee expense.
Benefits: Medical, dental, and vision begin on first day of month after 60 days of continuous employment.
PTO: 12 vacation days/year; unused days expire annually.

Acceptance of this offer constitutes agreement to all terms above and those in accompanying policies, as amended from time to time by the Company.`;

const PARSED_SAMPLE = {
  extracted: {
    baseSalary: 188000,
    signOn: 40000,
    bonusPercent: 12,
    ptoDays: 12,
    nonCompeteMonths: 24,
    arbitration: true
  },
  fairnessScore: 61,
  redFlags: [
    {
      id: "non-compete",
      title: "Aggressive Non-Compete",
      severity: "High",
      icon: ShieldAlert,
      reason:
        "The 24-month, North America-wide non-compete is unusually broad and can materially limit future mobility.",
      counter:
        "Counter-offer: reduce duration to 6-12 months, narrow geography, and carve out passive investing + non-overlapping product categories."
    },
    {
      id: "clawback",
      title: "Sign-On Clawback Trap",
      severity: "High",
      icon: BadgeDollarSign,
      reason:
        "100% clawback for termination 'for any reason' creates outsized downside, including involuntary separation.",
      counter:
        "Counter-offer: prorated clawback only for voluntary resignation, with a 12-month sunset and explicit layoff exemption."
    },
    {
      id: "arbitration",
      title: "Mandatory Arbitration + Class Waiver",
      severity: "Medium",
      icon: AlertTriangle,
      reason:
        "Confidential arbitration with class waiver reduces litigation leverage and can increase personal legal burden.",
      counter:
        "Counter-offer: mutual arbitration terms, employer-paid arbitration fees, and carve-outs for injunctive/statutory claims."
    }
  ]
};

export default function App() {
  const [offerText, setOfferText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState(null);
  const [openFlagId, setOpenFlagId] = useState(null);
  const [expectedSalary, setExpectedSalary] = useState(205000);
  const [meterScore, setMeterScore] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + Math.ceil(Math.random() * 9));
        return next;
      });
    }, 180);
    return () => clearInterval(id);
  }, [isAnalyzing]);

  useEffect(() => {
    if (!isAnalyzing || progress < 100) return;
    const timer = setTimeout(() => {
      setAnalysis(PARSED_SAMPLE);
      setIsAnalyzing(false);
      setOpenFlagId(PARSED_SAMPLE.redFlags[0].id);
    }, 400);
    return () => clearTimeout(timer);
  }, [progress, isAnalyzing]);

  useEffect(() => {
    const target = analysis?.fairnessScore ?? 0;
    let current = 0;
    const id = setInterval(() => {
      current += 2;
      if (current >= target) {
        setMeterScore(target);
        clearInterval(id);
      } else {
        setMeterScore(current);
      }
    }, 18);
    return () => clearInterval(id);
  }, [analysis]);

  const salaryDelta = useMemo(() => {
    if (!analysis) return 0;
    return analysis.extracted.baseSalary - expectedSalary;
  }, [analysis, expectedSalary]);

  const analyzeNow = () => {
    if (!offerText.trim()) return;
    setAnalysis(null);
    setProgress(0);
    setMeterScore(0);
    setIsAnalyzing(true);
  };

  const loadSample = () => {
    setOfferText(SAMPLE_OFFER_TEXT);
    setAnalysis(null);
    setProgress(0);
    setIsAnalyzing(false);
  };

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference - (meterScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <style>{`
        .glow-border { box-shadow: 0 0 0 1px rgba(34,211,238,.35), 0 0 24px rgba(34,211,238,.18); }
        .soft-panel { background: linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.92) 100%); }
      `}</style>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <div className="flex items-center gap-3 text-cyan-400">
            <Sparkles className="h-6 w-6" />
            <h1 className="text-4xl font-extrabold tracking-tight">OfferDecoder</h1>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Democratizing Labor Transparency through Unstructured Data Analysis - PhD Research Project
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="soft-panel glow-border rounded-2xl p-5">
            <label className="mb-2 block text-sm text-slate-300">The Entry</label>
            <textarea
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              placeholder="Drop Your Future Here..."
              className="h-80 w-full rounded-xl border border-cyan-500/30 bg-slate-950/80 p-4 text-sm leading-6 outline-none ring-cyan-400/40 placeholder:text-cyan-300/70 focus:ring"
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={analyzeNow}
                className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-900 hover:bg-cyan-400"
              >
                <FileSearch className="h-4 w-4" /> Analyze
              </button>
              <button
                onClick={loadSample}
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/50 px-4 py-2 text-cyan-300 hover:bg-cyan-500/10"
              >
                <TrendingUp className="h-4 w-4" /> Try with Sample Data
              </button>
            </div>

            {isAnalyzing && (
              <div className="mt-5 rounded-lg border border-cyan-500/40 bg-slate-950/70 p-3">
                <div className="mb-2 flex items-center justify-between text-xs text-cyan-300">
                  <span>Scanning contract clauses with NLP pipeline...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-cyan-400 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="soft-panel rounded-2xl border border-slate-700 p-5">
            <h2 className="mb-4 text-xl font-bold text-cyan-300">Interactive Dashboard</h2>

            {!analysis ? (
              <p className="rounded-lg border border-dashed border-slate-600 p-4 text-sm text-slate-400">
                Run analysis to reveal fairness metrics, clause risks, and salary benchmarking.
              </p>
            ) : (
              <>
                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                    <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Dynamic Scoreboard</p>
                    <div className="relative mx-auto h-36 w-36">
                      <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
                        <circle cx="60" cy="60" r="52" stroke="#1e293b" strokeWidth="10" fill="none" />
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          stroke="#22d3ee"
                          strokeWidth="10"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Target className="mb-1 h-4 w-4 text-cyan-300" />
                        <span className="text-3xl font-bold text-cyan-300">{meterScore}</span>
                        <span className="text-xs text-slate-400">Fairness Meter</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Salary Benchmarking</p>
                    <p className="mt-1 text-sm text-slate-300">Set your expected salary range:</p>
                    <input
                      type="range"
                      min={120000}
                      max={320000}
                      step={1000}
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(Number(e.target.value))}
                      className="mt-3 w-full accent-cyan-400"
                    />
                    <p className="mt-2 text-sm text-slate-200">Expected: ${expectedSalary.toLocaleString()}</p>
                    <p className="mt-1 text-sm text-cyan-300">Offer Base: ${analysis.extracted.baseSalary.toLocaleString()}</p>
                    <p className={`mt-2 text-sm font-semibold ${salaryDelta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {salaryDelta >= 0 ? `+$${salaryDelta.toLocaleString()} above expectation` : `-$${Math.abs(salaryDelta).toLocaleString()} below expectation`}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-rose-300">Actionable Red Flags</p>
                  <div className="space-y-3">
                    {analysis.redFlags.map((flag) => {
                      const Icon = flag.icon;
                      const isOpen = openFlagId === flag.id;
                      return (
                        <div key={flag.id} className="rounded-xl border border-rose-500/30 bg-slate-950/60">
                          <button
                            onClick={() => setOpenFlagId(isOpen ? null : flag.id)}
                            className="flex w-full items-center justify-between p-4 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5 text-rose-400" />
                              <div>
                                <p className="font-semibold text-rose-300">{flag.title}</p>
                                <p className="text-xs text-slate-400">Severity: {flag.severity}</p>
                              </div>
                            </div>
                            <ArrowRightLeft className={`h-4 w-4 text-slate-400 transition ${isOpen ? "rotate-90" : ""}`} />
                          </button>
                          {isOpen && (
                            <div className="border-t border-slate-700 px-4 pb-4 pt-3 text-sm">
                              <p className="mb-2 text-slate-200">{flag.reason}</p>
                              <p className="text-cyan-300">{flag.counter}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
