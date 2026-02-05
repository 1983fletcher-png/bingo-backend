# Facebook & Instagram events: legality and how we’d do it

Activity directors want to pull **upcoming events** from a venue’s **Facebook** or **Instagram** (e.g. Mills River Brewing Company’s Facebook: trivia night, food specials, Mario Kart tournament) and see them on the Activity Calendar next to observances and venue-website imports.

We are **above board** in everything we do: we only use **public information** through **legal, supported** methods. We do not access private data or violate terms of service.

---

## Can we scrape Facebook or Instagram for events?

**No.** We should **not** scrape Facebook.com or Instagram.com to extract events.

- **Terms of Service:** Meta’s ToS prohibit automated scraping/crawling of their products. Doing it would violate the ToS and can lead to IP/app blocking and legal risk.
- **Technical reality:** Both sites use strong anti-bot measures (e.g. Cloudflare, captchas, login walls). Scraping is fragile and often fails; it’s not a reliable or supportable way to get events.
- **Liability:** Recommending or building scraping of Facebook/Instagram would expose the product and users to ToS violations and potential legal issues.

So: **we do not implement “scrape this Facebook/Instagram URL”** on the Activity Calendar. The **website scrape** (your own venue site) is the supported way to import events today.

---

## Legal and supported way: Meta’s APIs

The right way to get **Facebook** events for a Page is through **Meta’s official APIs**:

- **Graph API (Page events):** You can request public **events** for a Facebook Page (e.g. “Mills River Brewing Company”) if your app has the right **permissions** and **approval** from Meta.
- **Restrictions:** Access to Page/User events is restricted. In practice:
  - **Facebook Marketing Partners** have dedicated access.
  - **Page Public Content Access** and similar features require **App Review**, often **business verification**, and only allow certain use cases. Event access is not guaranteed for every app.
  - **Official Events API** is aimed at *publishing* events to Facebook at scale, not at reading arbitrary pages’ events as a third party.

So even the “legal” path is **gated**: Meta controls who can read Page events and under what conditions. A small app cannot simply “call an API” without going through Meta’s review and possibly partnerships.

**Instagram:** Instagram’s APIs are focused on business/creator content (posts, stories, insights), not on “events” in the same way. Events are primarily a **Facebook** concept. So for “events from social,” we focus on **Facebook** in the vision below.

---

## How we could implement it (future)

If we want “import events from Facebook” on the Activity Calendar:

1. **Meta Developer App:** Create an app in Meta for Developers, request the permissions needed to read **public Page events** (and any other public Page content we need).
2. **App Review / business verification:** Complete Meta’s App Review (and any business verification they require) for those permissions. This can take time and may not be granted for all use cases.
3. **How the venue connects:**  
   - **Option A:** The venue (or activity director) **logs in with Facebook** and grants our app access to their Page; we store a token and periodically fetch that Page’s events.  
   - **Option B:** We allow entering a **Facebook Page ID** (or URL) and, if our app has been approved for public Page event access, we fetch that Page’s public events without the Page owner logging in. (Whether Meta allows this depends on the exact product and approval.)
4. **Backend:** A small service that calls the Graph API (e.g. `GET /{page-id}/events`) with the right token, normalizes the response to `{ month, day, title, … }`, and returns it to the frontend.
5. **Activity Calendar:** An “Import from Facebook” (or “Connect Facebook Page”) control that either links the venue’s Page (Option A) or looks up by Page ID/URL (Option B), and merges the returned events into the calendar like we do for website-scraped events.

We do **not** auto-detect “your Facebook from your website” and then scrape Facebook. If we add Facebook at all, it will be via **explicit connection or Page ID** and **Meta’s APIs** only.

---

## Summary for product

| Question | Answer |
|----------|--------|
| Can we scrape Facebook/Instagram for events? | **No.** Against ToS, fragile, and legally risky. We don’t do it. |
| Is there a legal way to get Facebook events? | **Yes:** Meta Graph API (and related products) with proper app, permissions, and Meta approval. |
| What do we implement today? | **Import from your venue website only.** Paste your events page URL; we pull public dates and event info from that page and add them to the calendar. Legal and respectful. |
| What’s the vision? | **Optional “Connect Facebook Page”** using Meta’s API (after we have approval and implementation), so venue events from Facebook appear alongside observances and website-scraped events. |

This keeps the experience smooth and legal: we respect Meta’s rules and use only supported, reviewable methods for any future Facebook/Instagram integration.
