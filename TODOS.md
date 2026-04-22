# TODOS

Deferred items from /plan-ceo-review (2026-04-21). Pick up in priority order.

---

## P1

### ~~Fix user.email! non-null assertion in /api/inquiry~~
**Fixed by /qa on feat/getto-daze-app, 2026-04-21** (commit c61a719)

### 시/군/구 API coverage test (prerequisite for RegionSelector item 6)
**What:** Before building the two-level RegionSelector, test the 농림축산식품부 API response distribution by 군구 code (org_cd). Check if provinces return usable sub-city shelter data consistently.
**Why:** A selector showing districts with zero animals is worse UX than no selector.
**Effort:** XS (a few API calls) | **Priority:** P1 | **Depends on:** 공데 API key access

---

## P2

### Rate limiting on /api/match
**What:** Add rate limiting (10 req/min per IP) on POST /api/match.
**Why:** Each call makes a real OpenAI embedding API call. Unprotected endpoint can burn credits.
**Context:** Check Vercel's built-in rate limiting or use a simple in-memory counter per edge request.
**Effort:** M → with CC: S | **Priority:** P2 | **Depends on:** Nothing

### SwipeCard POST /api/favorites failure feedback
**What:** When right-swipe triggers POST /api/favorites and it fails, the card is already removed from deck but the save is lost. Add error toast (e.g. "저장에 실패했어요. 다시 시도해주세요.") or re-insert card into deck.
**Why:** Silent data loss; an interviewer may not see the expected animal in /favorites.
**Effort:** S | **Priority:** P2 | **Depends on:** SwipeCard built

---

## P3

### OAuth intent persistence for SwipeCard
**What:** When user swipes right while logged out → LoginModal → Google OAuth redirect → returns to app, the deck is reset and the pending animal ID was never favorited. Fix: store pending animal ID in sessionStorage pre-redirect, POST /api/favorites in the auth callback.
**Why:** Swipe right → login → return → nothing happened is confusing UX.
**Effort:** M → with CC: 15min | **Priority:** P3 | **Depends on:** SwipeCard built, Google OAuth working

### Resend custom domain verification
**What:** Verify gettodaze.vercel.app (or a custom domain) in Resend dashboard and update from-address from `onboarding@resend.dev`.
**Why:** Current from-address looks like a test/demo sender to email clients.
**Context:** Currently works; this is a polish item.
**Effort:** XS (DNS record) | **Priority:** P3 | **Depends on:** Custom domain ownership

### Notification system for new matching animals
**What:** When new animals matching a user's previous survey profile are added to the DB, send an email or push notification.
**Why:** Turns a one-time tool into a service people return to.
**Effort:** XL → with CC: L | **Priority:** P3 | **Depends on:** User preference storage, Supabase realtime or cron extension

---

## Future (v3)

- Mobile PWA / push notifications
- Adoption tracking / success story feed
- Animal personality AI summaries
- Admin panel for data management
- Kakao OAuth

### Survey resets to step 1 after /api/match error
**What:** When the AI match call fails, the survey resets to step 1. User has to redo all 6 questions.
**Why:** Poor UX — user just answered 6 questions and gets no persistent state on failure.
**Fix:** In `src/app/match/page.tsx`, preserve `answers` state on error and show a retry button instead of resetting.
**Effort:** XS | **Priority:** P3 | **Depends on:** Nothing | **Found by:** /qa 2026-04-21
