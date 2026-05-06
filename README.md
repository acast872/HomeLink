## Project structure
```
src/
  app/
    page.tsx                  ← Landing page (choose customer or servicer)
    login/page.tsx            ← Unified login/signup for both roles
    customer/
      page.tsx                ← Customer dashboard
      request/new/page.tsx    ← New service request form
    servicer/
      page.tsx                ← Servicer dashboard
      accept/[id]/page.tsx    ← Accept request + book appointment
    api/
      auth/login/route.ts     ← POST login
      auth/signup/route.ts    ← POST signup
      auth/logout/route.ts    ← POST logout
      requests/route.ts       ← GET + POST requests
      appointments/route.ts   ← GET + POST appointments
      receipts/route.ts       ← GET + POST receipts
      reviews/route.ts        ← GET + POST reviews
      companies/route.ts      ← GET companies
  lib/
    db.ts                     ← MySQL connection pool
    auth.ts                   ← JWT helpers
  components/
    shared/LogoutButton.tsx
```

## Database tables used
| Table       | Used by                          |
|-------------|----------------------------------|
| customer    | Login, dashboard, requests       |
| servicer    | Login, dashboard, appointments   |
| request     | Customer creates, servicer accepts|
| appointment | Booked when servicer accepts     |
| receipt     | Linked by contract_number        |
| review      | Customer leaves after job        |
| company     | Servicer profile / browse        |
| service     | Company service types            |
| manager     | Admin oversight (future)         |
