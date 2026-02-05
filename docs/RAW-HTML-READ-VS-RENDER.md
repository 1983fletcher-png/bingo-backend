# Raw HTML: read vs render (short answer)

**Can we read it, understand it, and implement it?** Yes—for **extracting data**. We fetch their HTML, strip tags, and parse the text into structured menu data (sections, items, prices). That’s what `parse-menu-from-url` does. **Reading/parsing for data is safe and useful.**

**Is it safe to show their raw HTML in our app?** No. **Rendering** their HTML (e.g. displaying it as our page or in a frame) is **not safe** unless we strictly sanitize. Their markup could contain scripts, event handlers, or broken structure → XSS or broken UI. So we **never** display their HTML as-is.

**So:** We **extract** content and **implement** it in **our** templates and design system. If we ever “implement” their layout literally, it would be only with permission and via a sanitized subset (e.g. whitelisted tags), not raw HTML.
