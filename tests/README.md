# E2E Tests

Playwright tests cover Supabase email/password authentication flows.

## Environment Variables
Set the following variables before running tests:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL` – URL where the Next.js app is running (default `http://localhost:3000`).

## Running
Install dependencies and run:

```bash
npm install
npm run test:e2e
```

Reports are available under `playwright-report` after execution.
