# WinFlow — MVP App Spec

## What This Is

The actual WinFlow product: a single-page web app that generates AI proposals.

## How It Works

1. User fills brief form (client name, services, pricing, timeline, notes)
2. App generates a professional proposal using template + AI
3. User can edit preview, then export as PDF
4. Optional: share via link (future)

## MVP Tech

- Single HTML file with embedded CSS/JS
- jsPDF for PDF generation
- OpenAI API for proposal text generation (when key provided)
- No backend — fully client-side for rapid iteration

## AI Generation Strategy

- Without API key: use structured template-based generation
- With API key: use GPT-4 via simple fetch to OpenAI API
- System prompt designed to output well-structured proposal sections

## Proposal Sections

1. Header (Your company info)
2. Client info
3. Project overview
4. Scope of work
5. Timeline
6. Pricing
7. Terms
8. Signature area

## TODO

- [x] App structure
- [ ] Form validation
- [ ] PDF generation with proper styling
- [ ] AI integration hook
- [ ] Config for API key
