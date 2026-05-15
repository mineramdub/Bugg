// Bugg API — single Edge Function with three routes:
//   GET  /api/bug-of-the-day?device_id=...
//   POST /api/submit             { device_id, bug_id, draft }
//   GET  /api/stats?device_id=...
//
// Anonymous auth: device_id is a client-generated UUID stored in localStorage.
// The frontend calls with the project's anon/publishable key in Authorization.
// Inside, we use the service role to bypass RLS.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supa = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(data: unknown, init: ResponseInit = {}) {
  const headers = {
    "content-type": "application/json",
    ...cors,
    ...((init.headers as Record<string, string>) ?? {}),
  };
  return new Response(JSON.stringify(data), { ...init, headers });
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

async function ensureDevice(device_id: string) {
  if (!device_id || typeof device_id !== "string" || device_id.length < 8) {
    throw new Error("device_id required (min 8 chars)");
  }
  const { data: existing, error } = await supa
    .from("devices")
    .select("*")
    .eq("device_id", device_id)
    .maybeSingle();
  if (error) throw error;
  if (existing) {
    await supa
      .from("devices")
      .update({ last_seen: new Date().toISOString() })
      .eq("id", existing.id);
    return existing;
  }
  const { data: created, error: insErr } = await supa
    .from("devices")
    .insert({ device_id })
    .select()
    .single();
  if (insErr) throw insErr;
  return created!;
}

async function bugForStreak(streak: number) {
  const { data: bugs, error } = await supa
    .from("bugs")
    .select("*")
    .order("id", { ascending: true });
  if (error) throw error;
  if (!bugs || bugs.length === 0) throw new Error("no bugs in catalogue");
  const idx = Math.min(Math.max(0, streak), bugs.length - 1);
  return bugs[idx];
}

// Strip server-only fields (regexes, answer, explanation) before sending the bug to the client.
function publicBug(b: any) {
  return {
    id: b.id,
    day: b.day_label,
    difficulty: b.difficulty,
    streakLevel: b.streak_level,
    title: b.title,
    desc: b.description,
    code: b.code,
    bugLine: b.bug_line,
    hint: b.hint,
    xp: b.xp,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const url = new URL(req.url);
  // Path is something like /api/bug-of-the-day — last segment is the route.
  const route = url.pathname.split("/").filter(Boolean).pop() ?? "";

  try {
    // ── GET /api/bug-of-the-day ────────────────────────────────────────────
    if (route === "bug-of-the-day" && req.method === "GET") {
      const device_id = url.searchParams.get("device_id") ?? "";
      const device = await ensureDevice(device_id);
      const bug = await bugForStreak(device.streak);
      const already = device.last_solved_date === todayUTC();
      return json({
        bug: publicBug(bug),
        device: {
          streak: device.streak,
          best_streak: device.best_streak,
          total_xp: device.total_xp,
          bugs_solved: device.bugs_solved,
          already_solved_today: already,
        },
      });
    }

    // ── POST /api/submit ───────────────────────────────────────────────────
    if (route === "submit" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      const { device_id, bug_id, draft } = body as {
        device_id?: string;
        bug_id?: number;
        draft?: string;
      };
      if (
        !device_id ||
        typeof bug_id !== "number" ||
        typeof draft !== "string"
      ) {
        return json(
          { error: "device_id (string), bug_id (number), draft (string) required" },
          { status: 400 },
        );
      }

      const device = await ensureDevice(device_id);
      const { data: bug, error: bugErr } = await supa
        .from("bugs")
        .select("*")
        .eq("id", bug_id)
        .single();
      if (bugErr || !bug) return json({ error: "bug not found" }, { status: 404 });

      // Server-side validation: any accept-pattern matches.
      const correct = (bug.accept as string[]).some((pat) => {
        try {
          return new RegExp(pat).test(draft);
        } catch {
          return false;
        }
      });

      const today = todayUTC();
      const alreadySolvedToday = device.last_solved_date === today;
      let xp_awarded = 0;
      let new_streak = device.streak;
      let new_best = device.best_streak;
      let new_total_xp = device.total_xp;
      let new_bugs_solved = device.bugs_solved;
      let new_last_solved = device.last_solved_date;

      // Award only on the first correct submission of the day.
      if (correct && !alreadySolvedToday) {
        xp_awarded = bug.xp;
        new_streak = device.streak + 1;
        new_best = Math.max(new_best, new_streak);
        new_total_xp = device.total_xp + xp_awarded;
        new_bugs_solved = device.bugs_solved + 1;
        new_last_solved = today;
        await supa
          .from("devices")
          .update({
            streak: new_streak,
            best_streak: new_best,
            total_xp: new_total_xp,
            bugs_solved: new_bugs_solved,
            last_solved_date: new_last_solved,
            last_seen: new Date().toISOString(),
          })
          .eq("id", device.id);
      }

      // Always record the attempt (helpful for stats and detecting tries)
      await supa.from("submissions").insert({
        device_pk: device.id,
        bug_id,
        draft,
        correct,
        xp_awarded,
      });

      return json({
        correct,
        xp_awarded,
        already_solved_today: alreadySolvedToday,
        explanation: bug.explanation,
        answer: bug.answer,
        device: {
          streak: new_streak,
          best_streak: new_best,
          total_xp: new_total_xp,
          bugs_solved: new_bugs_solved,
        },
      });
    }

    // ── GET /api/stats ─────────────────────────────────────────────────────
    if (route === "stats" && req.method === "GET") {
      const device_id = url.searchParams.get("device_id") ?? "";
      const device = await ensureDevice(device_id);
      const { data: history } = await supa
        .from("submissions")
        .select("bug_id, correct, xp_awarded, created_at")
        .eq("device_pk", device.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return json({
        device: {
          streak: device.streak,
          best_streak: device.best_streak,
          total_xp: device.total_xp,
          bugs_solved: device.bugs_solved,
          last_solved_date: device.last_solved_date,
        },
        history: history ?? [],
      });
    }

    return json({ error: `route '${route}' not found` }, { status: 404 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("api error:", msg);
    return json({ error: msg }, { status: 500 });
  }
});
