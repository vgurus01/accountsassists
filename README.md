Account Assists — professional tax preparation and accounting services website (Next.js + Tailwind), with an optional FastAPI backend.

## Getting Started

### Frontend (Next.js)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To point the frontend at the FastAPI server:

```bash
export NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend (FastAPI)

See `backend/README.md` for setup and MongoDB configuration.

## Notes

- The design uses sharp corners (no rounding), borders instead of shadows, and grayscale imagery.
- Font stacks prefer `Manrope` (body) and `Playfair Display` (headings). Add local font files or a font loader in production if you want guaranteed typography.

## Deploy (Vercel)

This app deploys cleanly on Vercel without extra build steps.

1. Import the repo into Vercel.
2. Ensure the root directory is the repo root.
3. Add the env vars from `.env.example` in the Vercel project settings.
4. Deploy.

### Email (Resend)

Contact and booking forms use Resend via Next.js API routes. Configure:

- `RESEND_API_KEY`
- `RESEND_FROM`
- `RESEND_TO`
