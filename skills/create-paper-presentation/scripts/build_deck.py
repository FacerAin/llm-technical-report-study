#!/usr/bin/env python3
"""Render reviewed slide HTML fragments into the bundled standalone shell."""
import argparse
import html
import json
import re
from pathlib import Path


def render(spec, shell):
    slides = spec.get("slides", [])
    if not slides:
        raise ValueError("slides must contain at least one reviewed slide")
    sections = []
    for index, slide in enumerate(slides, 1):
        for field in ("title", "body", "visual", "sources"):
            if not slide.get(field):
                raise ValueError(f"slide {index}: missing {field}")
        sources = []
        for source in slide["sources"]:
            sources.append('<a href="{}">{}</a>'.format(
                html.escape(source["url"], quote=True), html.escape(source["label"])))
        layout = slide.get("layout", "split")
        if not re.fullmatch(r"[a-z][a-z0-9-]*", layout):
            raise ValueError(f"slide {index}: layout must be a CSS class name")
        section = html.escape(str(slide.get("section", "1")), quote=True)
        label = html.escape(slide.get("section_label", section), quote=True)
        nav = html.escape(re.sub(r"<[^>]*>", " ", slide["title"]), quote=True)
        classes = "inner wide" if layout == "wide" else "inner"
        sections.append(f'''<section class="slide layout-{layout}" data-sec="{section}" data-section-label="{label}" data-nav="{nav}">
<div class="card"><div class="{classes}">
<div class="txt"><div class="ey"></div><h2>{slide['title']}</h2>{slide['body']}</div>
<div class="vis">{slide['visual']}</div></div>
<footer class="src"><span>근거: {' · '.join(sources)}</span><span>{html.escape(slide.get('ids', ''))}</span></footer></div>
<aside class="speaker-notes">{html.escape(slide.get('note', ''))}</aside></section>''')
    if "<!-- SLIDES -->" not in shell:
        raise ValueError("shell is missing its slide insertion point")
    return (shell.replace("{{TITLE}}", html.escape(spec.get("title", "논문 발표")))
            .replace("{{SUBTITLE}}", html.escape(spec.get("subtitle", "검토용 초안")))
            .replace("<!-- SLIDES -->", "\n".join(sections)))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Reviewed slide JSON")
    parser.add_argument("output", type=Path, help="Standalone HTML output")
    args = parser.parse_args()
    shell = Path(__file__).resolve().parents[1] / "assets" / "deck-shell.html"
    spec = json.loads(args.input.read_text(encoding="utf-8"))
    result = render(spec, shell.read_text(encoding="utf-8"))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(result, encoding="utf-8")
    print(f"{args.output}: {len(spec['slides'])} slides")


if __name__ == "__main__":
    main()
