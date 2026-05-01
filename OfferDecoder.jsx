import React, { useMemo, useState } from "react";

const SAMPLE_OFFER_TEXT = `EMPLOYMENT OFFER LETTER

Company: Northstar Labs, Inc.
Position: Senior Product Designer
Start Date: June 10, 2026
Base Salary: $98,000 per year, paid biweekly.
Bonus: Eligible for a discretionary annual performance bonus up to 5%.
Equity: May be granted stock options at the sole discretion of the Board.
Schedule: Full-time, exempt. Employee may be required to work evenings and weekends as needed to meet business demands without additional compensation.
Benefits: Health, dental, and vision coverage after 90 days of employment.
PTO: 10 days paid vacation per year.
Termination: Employment is at-will and may be terminated by either party at any time, with or without cause or notice.
Restrictive Covenant: Employee agrees not to work for, consult with, or advise any competing business in the United States for 24 months after separation.
IP Assignment: All inventions, designs, ideas, and related works created during employment are the sole property of the Company.
Relocation: Employee is responsible for all relocation costs.

Please sign to indicate acceptance of these terms.`;

const SYSTEM_PROMPT = `You are an employment contract analyst for job seekers. Analyze offer letters and contracts.
Return ONLY valid JSON with this exact shape:
{
  "greenFlags": ["..."],
  "redFlags": ["..."],
  "negotiationTips": ["...", "...", "..."],
  "overallVerdict": "Accept" | "Negotiate" | "Walk Away",
  "fairnessScore": 0-100,
  "summary": "1-2 sentence rationale"
}
Rules:
- Focus on compensation clarity, overtime expectations, termination terms, restrictive covenants, benefits, PTO, equity, and legal ambiguity.
- Red flags should be concrete and specific to text.
- Negotiation tips should be actionable asks.
- fairnessScore must be an integer.
- No markdown, no extra keys, no commentary outside JSON.`;

export default function OfferDecoder() {
  const [offerText, setOfferText] = useState(SAMPLE_OFFER_TEXT);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const scoreTone = useMemo(() => {
    const score = result?.fairnessScore ?? 0;
    if (score >= 75) return "text-emerald-400";
    if (score >= 45) return "text-amber-400";
    return "text-rose-400";
  }, [result]);

  const verdictTone = useMemo(() => {
    if (!result?.overallVerdict) return "text-slate-200";
    switch (result.overallVerdict) {
      case "Accept":
        return "text-emerald-400";
      case "Negotiate":
        return "text-amber-300";
      default:
        return "text-rose-400";
    }
  }, [result]);

  const analyzeOffer = async () => {
    setError("");
    setResult(null);

    if (!offerText.trim()) {
      setError("Please paste an offer letter or contract first.");
      return;
    }

    if (!apiKey.trim()) {
      setError("Enter your Anthropic API key to run analysis.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey.trim(),
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: `Analyze this offer letter/contract:\n\n${offerText}`
            }
          ]
        })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Anthropic API error (${response.status}): ${text}`);
      }

      const data = await response.json();
      const textBlock = data?.content?.find((item) => item.type === "text")?.text;
      if (!textBlock) {
        throw new Error("No analysis text returned from model.");
      }

      const parsed = JSON.parse(textBlock);
      const normalized = {
        greenFlags: Array.isArray(parsed.greenFlags) ? parsed.greenFlags : [],
        redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
        negotiationTips: Array.isArray(parsed.negotiationTips)
          ? parsed.negotiationTips.slice(0, 3)
          : [],
        overallVerdict: ["Accept", "Negotiate", "Walk Away"].includes(parsed.overallVerdict)
          ? parsed.overallVerdict
          : "Negotiate",
        fairnessScore: Number.isFinite(parsed.fairnessScore)
          ? Math.max(0, Math.min(100, Math.round(parsed.fairnessScore)))
          : 50,
        summary: typeof parsed.summary === "string" ? parsed.summary : ""
      };

      setResult(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error while analyzing offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">OfferDecoder</h1>
          <p className="mt-2 text-slate-300">
            Paste a job offer letter or employment contract and get instant AI analysis.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <label className="mb-2 block text-sm font-medium text-slate-300">Anthropic API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />

            <label className="mb-2 block text-sm font-medium text-slate-300">Offer Text</label>
            <textarea
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              className="h-[420px] w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm leading-6 focus:border-indigo-500 focus:outline-none"
            />

            <button
              onClick={analyzeOffer}
              disabled={loading}
              className="mt-4 inline-flex items-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Analyze Offer"}
            </button>

            {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <h2 className="text-xl font-semibold">Analysis Results</h2>

            {!result ? (
              <p className="rounded-lg border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-400">
                Click <span className="font-semibold text-slate-200">Analyze Offer</span> to generate an AI review.
              </p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-950 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Overall Verdict</p>
                    <p className={`mt-1 text-2xl font-bold ${verdictTone}`}>{result.overallVerdict}</p>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Fairness Score</p>
                    <p className={`mt-1 text-2xl font-bold ${scoreTone}`}>{result.fairnessScore}/100</p>
                  </div>
                </div>

                <FlagList title="Green Flags" items={result.greenFlags} tone="text-emerald-300" bullet="🟢" />
                <FlagList title="Red Flags" items={result.redFlags} tone="text-rose-300" bullet="🔴" />
                <FlagList
                  title="Negotiation Tips"
                  items={result.negotiationTips}
                  tone="text-amber-300"
                  bullet="💬"
                />

                {result.summary && (
                  <div className="rounded-lg bg-slate-950 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Summary</p>
                    <p className="mt-2 text-sm text-slate-200">{result.summary}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function FlagList({ title, items, tone, bullet }) {
  return (
    <section className="rounded-lg bg-slate-950 p-4">
      <h3 className={`mb-2 font-semibold ${tone}`}>{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No items returned.</p>
      ) : (
        <ul className="space-y-2 text-sm text-slate-200">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-2 leading-6">
              <span>{bullet}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
