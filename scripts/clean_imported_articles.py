#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def strip_in_text_links(html: str) -> str:
    preserved = []

    def save_home(m):
        preserved.append(m.group(0))
        return f"__PRESERVED_{len(preserved) - 1}__"

    html = re.sub(
        r'<a\s+class="home-button"[^>]*>.*?</a>',
        save_home,
        html,
        flags=re.I | re.S,
    )
    prev = None
    while prev != html:
        prev = html
        html = re.sub(r"<a\b[^>]*>(.*?)</a>", r"\1", html, flags=re.I | re.S)
    for i, block in enumerate(preserved):
        html = html.replace(f"__PRESERVED_{i}__", block)
    return html


def strip_mia_chrome(html: str) -> str:
    html = re.sub(r'<p\s+class="next"[^>]*>.*?</p>', "", html, flags=re.I | re.S)
    html = re.sub(r'<p\s+class="footer"[^>]*>.*?</p>', "", html, flags=re.I | re.S)
    return html


def strip_midtext_junk(html: str) -> str:
    """Remove MIA artifacts that land in the middle of merged article bodies."""
    html = re.sub(
        r'(<hr[^>]*class="end"[^>]*/>\s*){2,}',
        '<hr class="end"/>\n',
        html,
        flags=re.I,
    )
    html = re.sub(r'<hr[^>]*class="base"[^>]*/?>\s*', "", html, flags=re.I)
    html = re.sub(r'<p\s+class="skip"[^>]*>.*?</p>', "", html, flags=re.I | re.S)
    html = re.sub(r'<p>\s*(?:&#160;|&nbsp;|\u00a0)?\s*</p>', "", html, flags=re.I)
    html = re.sub(r"P\s*\n\s*lease credit", "Please credit", html, flags=re.I)
    html = re.sub(
        r'<hr[^>]*class="end"[^>]*/>\s*'
        r'(?:<p\s+class="information"[^>]*>\s*<span\s+class="note">.*?</p>\s*)+'
        r'<hr[^>]*class="end"[^>]*/>\s*'
        r"(?=<h[234])",
        "",
        html,
        flags=re.I | re.S,
    )
    seen_source = False

    def drop_dup_source(m):
        nonlocal seen_source
        block = m.group(0)
        if not seen_source:
            seen_source = True
            return block
        if re.search(
            r"Public Domain|Online Version|Transcription/HTML|Transcription:",
            block,
            flags=re.I,
        ):
            return ""
        return block

    html = re.sub(
        r'<p\s+class="information"[^>]*>.*?</p>',
        drop_dup_source,
        html,
        flags=re.I | re.S,
    )
    html = re.sub(
        r'(<hr[^>]*class="end"[^>]*/>\s*){2,}',
        '<hr class="end"/>\n',
        html,
        flags=re.I,
    )
    return html


def clean_article_html(html: str) -> str:
    return strip_midtext_junk(strip_mia_chrome(strip_in_text_links(html)))


def main():
    count = 0
    for path in ROOT.rglob("*.htm"):
        original = path.read_text(encoding="utf-8")
        updated = clean_article_html(original)
        if updated != original:
            path.write_text(updated, encoding="utf-8")
            count += 1
            print(path.relative_to(ROOT))
    print(f"Updated {count} files.")


if __name__ == "__main__":
    main()
