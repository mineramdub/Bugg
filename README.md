# Bugg

Le bug C du jour — une app type Duolingo où on corrige une ligne de C cassée chaque jour.

## Architecture

```
.
├── frontend/            # The React-in-the-browser UI (Babel standalone)
│   ├── index.html       # entry point — load this in a browser
│   ├── app.jsx          # screens: home / challenge / result
│   ├── bugs.jsx         # legacy hardcoded bug list (now served by the API)
│   ├── challenges.jsx   # 3 challenge variants (Composer / Inline / QCM)
│   ├── design-canvas.jsx, ios-frame.jsx, shapes.jsx, tweaks-panel.jsx
│   └── bugg-api.js      # ← drop-in client for the backend
└── backend/
    ├── functions/api/index.ts   # Supabase Edge Function (3 routes)
    └── migrations/              # SQL: schema + seed of the 5 bugs
```

## Backend — Supabase project `bugg`

| | |
|---|---|
| Project ID | `cyfzahgqjphvzltxhgbk` |
| Region     | `eu-west-3` (Paris) |
| URL        | `https://cyfzahgqjphvzltxhgbk.supabase.co` |
| Tier       | Free |

The API is a single Edge Function (`api`) with three routes:

| Method | Path                            | Body / Query                                  |
|--------|---------------------------------|-----------------------------------------------|
| GET    | `/functions/v1/api/bug-of-the-day` | `?device_id=<uuid>`                          |
| POST   | `/functions/v1/api/submit`         | `{ device_id, bug_id, draft }`               |
| GET    | `/functions/v1/api/stats`          | `?device_id=<uuid>`                          |

All endpoints require the publishable anon key in `Authorization: Bearer …`.
The `device_id` is a client-generated UUID stored in `localStorage` — no email,
no password, no friction.

### What the server does (vs. the original frontend)

| Concern              | Before (frontend only) | Now (backend)                                          |
|----------------------|-----------------------|--------------------------------------------------------|
| Bug source           | Hardcoded in `bugs.jsx` | `public.bugs` table — add new bugs without re-deploy |
| Fix validation       | Client regex (cheatable) | Server-side regex on accept patterns               |
| Streak / XP          | React `useState`, lost on reload | Persisted in `public.devices` keyed by device_id |
| History              | None                  | `public.submissions` — every attempt logged           |
| First-of-day check   | None                  | XP only awarded once per UTC day                       |

## Database schema

See `backend/migrations/001_init_schema.sql`.

- `devices(id, device_id, streak, best_streak, total_xp, bugs_solved, last_solved_date, …)`
- `bugs(id, day_label, difficulty, streak_level, title, description, code[], bug_line, answer, accept[], hint, explanation, xp)`
- `submissions(id, device_pk, bug_id, draft, correct, xp_awarded, created_at)`

RLS is enabled on all tables; only the Edge Function (using the service role key,
which is set as a function secret) can read/write.

## Frontend integration

In `frontend/index.html`, before the JSX scripts, add:

```html
<script src="bugg-api.js"></script>
```

Then in `app.jsx`, replace the hardcoded `bugForStreak(streak)` flow with calls
to the API. Here's the minimal wiring inside `BuggApp`:

```jsx
function BuggApp({ variant, palette, speed }) {
  const api = useMemo(() => BuggAPI.create(), []);
  const [screen, setScreen] = useState('home');
  const [streak, setStreak] = useState(0);
  const [bug, setBug] = useState(null);
  const [result, setResult] = useState(null);

  // Load bug of the day on mount
  useEffect(() => {
    api.getBugOfTheDay().then(({ bug, device }) => {
      setBug(bug);
      setStreak(device.streak);
    });
  }, []);

  async function submit({ draft }) {
    const r = await api.submit(bug.id, draft);
    setResult({ correct: r.correct, draft, explanation: r.explanation, answer: r.answer });
    setStreak(r.device.streak);
    setScreen('result');
  }

  function next(correct) {
    if (correct) {
      // re-fetch the next day's bug
      api.getBugOfTheDay().then(({ bug, device }) => {
        setBug(bug);
        setStreak(device.streak);
        setScreen('home');
      });
    } else {
      setScreen('home');
    }
  }

  if (!bug) return null; // or a loader
  // …rest unchanged: render HomeScattered/Hero/Journey, ChallengeScreen, ResultScreen
}
```

The shape of `bug` returned by the API matches the original frontend object
(`{ id, day, difficulty, streakLevel, title, desc, code, bugLine, hint, xp }`),
so the screens don't need to change. The fields `answer` and `explanation`
are now returned by `/submit` instead of being baked into the bundle.

## Local dev / re-deploying

Backend changes are deployed via the Supabase MCP from this conversation, but
the canonical source lives in this repo:

- **Schema changes**: add a new file `backend/migrations/00X_*.sql` and apply it.
- **Function changes**: edit `backend/functions/api/index.ts`, then redeploy.

The function reads two env vars (auto-injected by Supabase):
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## Adding a new bug

```sql
insert into public.bugs (id, day_label, difficulty, streak_level, title, description, code, bug_line, answer, accept, hint, explanation, xp)
values (6, 'Jour 6', 'Difficile', 6, '…', '…',
        array['…','…'], 2,
        'fix line', array['regex_1','regex_2'], '…', '…', 30);
```

The frontend automatically picks it up because the function streams the catalogue
from the table on every request.
