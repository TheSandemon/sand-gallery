# ProposalForge — Product Spec

## Vision

AI proposal generation that turns a 3-hour chore into a 5-minute task. Built for SMBs who hate paperwork but need to close deals.

## What We Build

A web app where users:
1. Input project brief (client name, services, pricing, timeline)
2. Get an AI-generated, professionally formatted proposal
3. Export as PDF or share via link
4. Track proposal status (sent, viewed, signed)

## Tech Stack

- **Frontend**: Single-page app (Vanilla JS + Tailwind or similar)
- **Backend**: Node.js API (or serverless functions)
- **AI**: OpenAI GPT-4 for proposal generation
- **Database**: SQLite (simple) or Supabase (if real-time needed)
- **Auth**: Simple email/password or magic link
- **Hosting**: Vercel / Railway / Render

## Core Features (MVP)

1. **Brief Input Form** — Client info, project scope, pricing
2. **AI Generation** — GPT-4 generates full proposal text
3. **PDF Export** — Clean, branded PDF output
4. **Waitlist Capture** — Email collection for early users
5. **Email Notification** — Alert when proposal is ready

## Features (Post-MVP)

- Proposal templates by industry
- Client portal (view, comment, sign)
- Version history
- Team collaboration
- Stripe integration for payment

## Competitive Edge

Most proposal tools are glorified form builders. ProposalForge actually writes for you using AI. The magic is in the generation, not the formatting.

## Revenue Model

- Monthly subscription (Starter $29, Pro $79, Agency $199)
- Early bird: 50% lifetime discount for waitlist signups
