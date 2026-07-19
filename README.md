# OfferDecoder

**Know what you are agreeing to before you sign.**

OfferDecoder is a consumer-facing employment-offer clarity tool. It uses GPT-5.6 to separate guaranteed compensation from conditional promises, identify terms worth clarifying, quote the exact supporting language, and help a candidate prepare a professional negotiation email.

Live application: [offerdecoder.vercel.app](https://offerdecoder.vercel.app/)

## OpenAI Build Week extension

OfferDecoder existed before OpenAI Build Week as a React interface demonstration. Its analysis was a predetermined sample object; it did not call Claude, OpenAI, or another AI service. During the Build Week submission period, Codex was used to turn that prototype into a functional GPT-5.6 product.

New work completed for Build Week:

- Added a secure server-side GPT-5.6 integration through the Responses API.
- Replaced the simulated analysis with analysis of the user's actual offer text.
- Added Structured Outputs so every result follows a dependable schema.
- Added quote-grounded findings, compensation classification, missing-information checks, and transparent clarity dimensions.
- Added selectable findings and a GPT-5.6 negotiation-email generator with three tone options.
- Redesigned the interface into a responsive, complete product experience.
- Added privacy guidance, bounded claims, and prominent educational/not-legal-advice notices.

The Git commit history and Codex session record distinguish this work from the earlier prototype.

## How it works

1. A user removes personal identifiers and pastes an employment offer.
2. The browser sends the text to the server-side `/api/analyze` function.
3. GPT-5.6 returns schema-constrained analysis grounded in short excerpts from the supplied document.
4. The user reviews the compensation breakdown, clarity dimensions, findings, and missing information.
5. The user selects findings and asks `/api/negotiate` to create an editable response.

OfferDecoder does not determine whether a provision is legal or enforceable and does not provide legal or financial advice.

## Technical design

- React 18
- Vite 5
- Tailwind CSS
- Vercel Functions
- OpenAI Responses API
- GPT-5.6
- Structured Outputs with strict JSON Schema

The OpenAI API key is used only in server-side Vercel Functions and is never included in the browser bundle. API calls set `store: false`.

## Run locally

Requirements: Node.js 18 or newer and an OpenAI API key with GPT-5.6 access.

```bash
npm install
npm install -g vercel
cp .env.example .env.local
```

Add your API key to `.env.local`, then run:

```bash
vercel dev
```

Open the local URL displayed by Vercel. `npm run dev` can preview the interface, but `vercel dev` is needed to run the API functions locally.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes | Server-side authentication for GPT-5.6 requests |

Never commit `.env.local` or an API key.

## Responsible-use choices

- Document text is treated as untrusted content, not as model instructions.
- Findings require a short supporting excerpt from the supplied offer.
- The model is instructed not to invent market benchmarks, legal conclusions, competing offers, or candidate circumstances.
- Missing terms are labeled as missing instead of being filled with assumptions.
- Hourly, weekly, monthly, and annual pay periods are preserved rather than silently converted.
- Users are advised to remove names and sensitive identifiers before analysis.
- Results are educational and should be verified with the employer or a qualified professional.

## Build and verification

```bash
npm run build
node --check api/_openai.js
node --check api/analyze.js
node --check api/negotiate.js
```

## License

See [LICENSE](LICENSE).
