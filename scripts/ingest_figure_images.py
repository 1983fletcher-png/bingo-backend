#!/usr/bin/env python3
"""
Dynamic Legal Image Ingestion Script
====================================
Purpose: Automatically source legal, public-domain or CC0 images for Learn & Grow
         pages. Validate, dedupe by hash, upload to Cloudflare R2, and populate
         the page template JSON schema. Designed for scientists, inventors,
         and historical figures, scalable for any future figures.

Requirements:
  pip install -r requirements-ingest.txt
  (requests, boto3, Pillow; optional: beautifulsoup4)

Environment (align with Node .env):
  R2_ACCOUNT_ID       — Cloudflare account ID (optional if R2_ENDPOINT set)
  R2_ENDPOINT         — https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  R2_ACCESS_KEY_ID    — R2 API token access key
  R2_SECRET_ACCESS_KEY — R2 API token secret
  R2_BUCKET_NAME      — Bucket name
  R2_PUBLIC_BASE_URL  — Public CDN URL for images (e.g. https://pub-xxx.r2.dev)
  Optional: UNSPLASH_ACCESS_KEY, PEXELS_API_KEY for those sources
"""

import os
import sys
import re
import hashlib
import json
from io import BytesIO

import requests
from PIL import Image

# Optional: boto3 for R2
try:
    import boto3
except ImportError:
    boto3 = None

# ============================
# 1. CONFIGURATION
# ============================

MIN_WIDTH = 300
MIN_HEIGHT = 300
FIGURES_PREFIX = "figures"

# Env: same names as Node .env (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_BASE_URL)
R2_ACCOUNT_ID = os.environ.get("R2_ACCOUNT_ID", "").strip()
R2_ENDPOINT = (os.environ.get("R2_ENDPOINT") or "").strip() or (
    f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com" if R2_ACCOUNT_ID else ""
)
R2_ACCESS_KEY = (os.environ.get("R2_ACCESS_KEY_ID") or os.environ.get("R2_ACCESS_KEY") or "").strip()
R2_SECRET_KEY = (os.environ.get("R2_SECRET_ACCESS_KEY") or os.environ.get("R2_SECRET_KEY") or "").strip()
R2_BUCKET_NAME = (os.environ.get("R2_BUCKET_NAME") or "").strip()
R2_PUBLIC_BASE_URL = (os.environ.get("R2_PUBLIC_BASE_URL") or "").strip().rstrip("/")

IMAGE_SOURCES = [
    {
        "id": "wikimedia-commons",
        "name": "Wikimedia Commons",
        "base_url": "https://commons.wikimedia.org/w/api.php",
        "license": "Public Domain / CC0",
        "search": "api",
    },
    {
        "id": "nasa",
        "name": "NASA Image Library",
        "base_url": "https://images-api.nasa.gov/search",
        "license": "Public Domain",
        "query_param": "q",
    },
    {
        "id": "unsplash",
        "name": "Unsplash",
        "base_url": "https://api.unsplash.com/search/photos",
        "license": "CC0",
        "api_key": (os.environ.get("UNSPLASH_ACCESS_KEY") or os.environ.get("UNSPLASH_API_KEY") or "").strip(),
    },
    {
        "id": "pexels",
        "name": "Pexels",
        "base_url": "https://api.pexels.com/v1/search",
        "license": "CC0",
        "api_key": (os.environ.get("PEXELS_API_KEY") or "").strip(),
    },
]

# ============================
# 2. R2 CLIENT
# ============================

def get_s3_client():
    if not boto3:
        raise RuntimeError("Install boto3: pip install boto3")
    if not all([R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET_NAME]):
        raise RuntimeError(
            "Set R2 env: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME (and optionally R2_PUBLIC_BASE_URL)"
        )
    return boto3.client(
        "s3",
        endpoint_url=R2_ENDPOINT,
        aws_access_key_id=R2_ACCESS_KEY,
        aws_secret_access_key=R2_SECRET_KEY,
        region_name="auto",
    )

# ============================
# 3. UTILITIES
# ============================

def slugify(name):
    return re.sub(r"[^a-z0-9-]", "", re.sub(r"\s+", "-", name.lower()))

def hash_image(image_bytes):
    return hashlib.sha256(image_bytes).hexdigest()[:16]

def validate_image(image_bytes):
    try:
        img = Image.open(BytesIO(image_bytes))
        width, height = img.size
        if width < MIN_WIDTH or height < MIN_HEIGHT:
            return False, width, height
        return True, width, height
    except Exception as e:
        print(f"  Invalid image: {e}", file=sys.stderr)
        return False, 0, 0

def upload_to_r2(s3, image_bytes, figure_slug, image_name, content_type="image/jpeg"):
    key = f"{FIGURES_PREFIX}/{figure_slug}/{image_name}"
    s3.put_object(
        Bucket=R2_BUCKET_NAME,
        Key=key,
        Body=image_bytes,
        ContentType=content_type,
    )
    if R2_PUBLIC_BASE_URL:
        return f"{R2_PUBLIC_BASE_URL}/{key}"
    return f"{R2_ENDPOINT}/{R2_BUCKET_NAME}/{key}"

# ============================
# 4. FETCH IMAGE URLS BY SOURCE
# ============================

def fetch_commons_api(keyword, limit=10):
    """Wikimedia Commons API: returns list of {url, title, license, width, height, description}."""
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": keyword,
        "gsrnamespace": "6",
        "gsrlimit": limit,
        "prop": "imageinfo",
        "iiprop": "url|size|extmetadata",
        "format": "json",
        "origin": "*",
    }
    r = requests.get(IMAGE_SOURCES[0]["base_url"], params=params, timeout=15)
    r.raise_for_status()
    data = r.json()
    pages = data.get("query", {}).get("pages", {})
    results = []
    for pid, p in pages.items():
        info = (p.get("imageinfo") or [{}])[0]
        url = info.get("url")
        if not url:
            continue
        usage = (info.get("extmetadata") or {}).get("LicenseShortName", {}) or {}
        license_str = (usage.get("value") or "Unknown").strip()
        if "NC" in license_str.upper() or "ND" in license_str.upper():
            continue
        desc = (info.get("extmetadata") or {}).get("ImageDescription", {})
        description = (desc.get("value") or "") if isinstance(desc.get("value"), str) else ""
        results.append({
            "url": url,
            "title": p.get("title", "").replace("File:", ""),
            "license": license_str,
            "width": info.get("width", 0),
            "height": info.get("height", 0),
            "description": description[:500] if description else "",
        })
    return results

def fetch_nasa_api(keyword, limit=5):
    """NASA Images API: returns list of {url, title, description}."""
    source = next((s for s in IMAGE_SOURCES if s["id"] == "nasa"), None)
    if not source:
        return []
    params = {"q": keyword, "media_type": "image"}
    r = requests.get(source["base_url"], params=params, timeout=15)
    if not r.ok:
        return []
    data = r.json()
    items = data.get("collection", {}).get("items", [])[:limit]
    results = []
    for item in items:
        links = item.get("links", [])
        data_list = item.get("data", [])
        href = next((l.get("href") for l in links if l.get("rel") == "preview"), None) or (links[0].get("href") if links else None)
        d0 = data_list[0] if data_list else {}
        if href:
            results.append({
                "url": href,
                "title": d0.get("title", ""),
                "license": "Public Domain",
                "width": 0,
                "height": 0,
                "description": d0.get("description", "")[:500],
            })
    return results

def fetch_unsplash_api(keyword, limit=5):
    """Unsplash API: returns list of {url, ...}."""
    source = next((s for s in IMAGE_SOURCES if s["id"] == "unsplash"), None)
    if not source or not source.get("api_key"):
        return []
    headers = {"Authorization": f"Client-ID {source['api_key']}"}
    params = {"query": keyword, "per_page": limit}
    r = requests.get(source["base_url"], params=params, headers=headers, timeout=15)
    if not r.ok:
        return []
    data = r.json()
    results = []
    for item in data.get("results", []):
        urls = item.get("urls", {})
        url = urls.get("regular") or urls.get("full") or urls.get("small")
        if url:
            results.append({
                "url": url,
                "title": item.get("description") or item.get("alt_description") or keyword,
                "license": "CC0",
                "width": item.get("width", 0),
                "height": item.get("height", 0),
                "description": (item.get("description") or "")[:500],
            })
    return results

def fetch_pexels_api(keyword, limit=5):
    """Pexels API: returns list of {url, ...}."""
    source = next((s for s in IMAGE_SOURCES if s["id"] == "pexels"), None)
    if not source or not source.get("api_key"):
        return []
    headers = {"Authorization": source["api_key"]}
    params = {"query": keyword, "per_page": limit}
    r = requests.get(source["base_url"], params=params, headers=headers, timeout=15)
    if not r.ok:
        return []
    data = r.json()
    results = []
    for item in data.get("photos", []):
        src = item.get("src", {})
        url = src.get("large") or src.get("medium") or src.get("original")
        if url:
            results.append({
                "url": url,
                "title": item.get("alt") or keyword,
                "license": "CC0",
                "width": item.get("width", 0),
                "height": item.get("height", 0),
                "description": (item.get("alt") or "")[:500],
            })
    return results

def extract_image_urls(response, source):
    """Legacy: extract from HTML or API response. Prefer API fetchers above."""
    urls = []
    if "unsplash" in source.get("base_url", "").lower():
        try:
            for item in response.json().get("results", []):
                u = (item.get("urls") or {}).get("regular")
                if u:
                    urls.append(u)
        except Exception:
            pass
    elif "pexels" in source.get("base_url", "").lower():
        try:
            for item in response.json().get("photos", []):
                u = (item.get("src") or {}).get("large")
                if u:
                    urls.append(u)
        except Exception:
            pass
    return urls

# ============================
# 5. INGESTION PIPELINE
# ============================

def search_and_fetch_images(figure_name, keywords, max_images=8):
    """
    Fetch image candidates from Commons (and optionally NASA/Unsplash/Pexels),
    download, validate, dedupe by hash, upload to R2.
    Returns list of dicts with r2Url, sourceName, sourceUrl, license, altText, tags, hash.
    """
    figure_slug = slugify(figure_name)
    seen_hashes = set()
    fetched = []
    s3 = get_s3_client()

    def try_add(candidate, source_name):
        if len(fetched) >= max_images:
            return
        try:
            r = requests.get(candidate["url"], timeout=20)
            r.raise_for_status()
            img_bytes = r.content
        except Exception as e:
            print(f"  Skip download {candidate['url'][:60]}...: {e}", file=sys.stderr)
            return
        ok, w, h = validate_image(img_bytes)
        if not ok:
            return
        hsh = hash_image(img_bytes)
        if hsh in seen_hashes:
            return
        seen_hashes.add(hsh)
        ext = "jpg"
        ct = "image/jpeg"
        if candidate["url"].lower().endswith(".png"):
            ext = "png"
            ct = "image/png"
        elif ".webp" in candidate["url"].lower():
            ext = "webp"
            ct = "image/webp"
        img_name = f"{hsh}.{ext}"
        r2_url = upload_to_r2(s3, img_bytes, figure_slug, img_name, ct)
        alt = (candidate.get("description") or candidate.get("title") or f"{figure_name} - {keywords[0]}").strip()[:300]
        fetched.append({
            "sourceName": source_name,
            "sourceUrl": candidate["url"],
            "license": candidate.get("license", "Public Domain"),
            "r2Url": r2_url,
            "hash": hsh,
            "tags": list(keywords),
            "altText": alt,
        })
        print(f"  + {source_name}: {img_name} -> R2")
        return True

    # Commons (no API key)
    for kw in keywords:
        if len(fetched) >= max_images:
            break
        for c in fetch_commons_api(kw, limit=5):
            try_add(c, "Wikimedia Commons")

    # NASA
    for kw in keywords:
        if len(fetched) >= max_images:
            break
        for c in fetch_nasa_api(kw, limit=3):
            try_add(c, "NASA Image Library")

    # Unsplash / Pexels if keys set
    for kw in keywords:
        if len(fetched) >= max_images:
            break
        for c in fetch_unsplash_api(kw, limit=2):
            try_add(c, "Unsplash")
        for c in fetch_pexels_api(kw, limit=2):
            try_add(c, "Pexels")

    return fetched

# ============================
# 6. PAGE SCHEMA
# ============================

def build_figure_json(figure_name, keywords, hero_image=None, max_images=8):
    """Build JSON schema for Learn & Grow figure page."""
    images = search_and_fetch_images(figure_name, keywords, max_images=max_images)

    sections = [
        {"id": "early_life", "title": "Early Life", "content": "", "images": [img["r2Url"] for img in images[:2]]},
        {"id": "inventions", "title": "Major Inventions", "content": "", "images": [img["r2Url"] for img in images[2:4]]},
        {"id": "experiments", "title": "Experiments & Demonstrations", "content": "", "images": [img["r2Url"] for img in images[4:6]]},
        {"id": "legacy", "title": "Legacy & Influence", "content": "", "images": [img["r2Url"] for img in images[6:8]]},
    ]

    figure_json = {
        "figure": figure_name,
        "heroImage": hero_image or (images[0]["r2Url"] if images else None),
        "sections": sections,
        "sources": [{"title": img["sourceName"], "url": img["sourceUrl"], "license": img["license"]} for img in images],
        "triviaTags": list(keywords),
        "metadata": {f"img_{i}": img for i, img in enumerate(images)},
    }
    return figure_json

# ============================
# 7. MAIN
# ============================

if __name__ == "__main__":
    figure = "Nikola Tesla"
    keywords = ["Nikola Tesla", "Tesla coil", "Alternating Current", "AC motor", "Inventor"]
    out_file = f"{figure.replace(' ', '_')}_page.json"

    try:
        page_json = build_figure_json(figure, keywords, max_images=8)
        with open(out_file, "w") as f:
            json.dump(page_json, f, indent=2)
        print(f"✅ Page JSON for {figure} written to {out_file}")
    except Exception as e:
        print(f"❌ {e}", file=sys.stderr)
        sys.exit(1)
