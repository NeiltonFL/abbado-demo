# Abbado — Founders Law Management Platform (Demo)

Interactive demo of the Abbado law firm management platform.

## Run Locally

```bash
npm install
npm run dev
```

Opens at http://localhost:3000

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import this repo
3. Framework: Vite (auto-detected)
4. Click Deploy

That's it. No environment variables needed for the demo.

## What You're Looking At

This is a high-fidelity interactive demo running on mock data. Everything you see — the navigation, the data, the role switching — is real React components with hardcoded sample data.

**Try these things:**
- **Switch roles** — dropdown at bottom of sidebar. Sarah Chen (Partner) = admin view. Marcus Williams (Associate) = employee view. Notice how the dashboard, compensation, and nav items change.
- **Drill into a client** — Click TechVenture Inc. → explore the Entities, Conversations, and Billing tabs
- **Compensation** — See the origination split math: Sarah gets 35% pool × 100% split, Marcus gets 35% pool × 30% split
- **Compliance Dashboard** — Toggle between Calendar, List, and By State views
- **Pre-Bills** — Click a pre-bill card, then click any description text to edit it inline
- **Gavel** — Click any workflow card to see the required fields and generated documents
- **Portal Admin** — Toggle portal access per client, share/unshare documents
- **AI Panel** — Click the sparkle icon (top right). Note: AI responses require an Anthropic API key and won't work in the deployed demo.

## Tech

- React 18 + Vite
- Zero dependencies beyond React
- All styling is inline (no CSS framework)
- Founders Law brand: Dark Green #213B2B, Light Green #3F7653, Lime #E1E552, Cream #FCF8F1
