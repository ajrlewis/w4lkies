#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path
from types import SimpleNamespace
import sys


def _bootstrap_src_path() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    src_dir = backend_dir / "src"
    if str(src_dir) not in sys.path:
        sys.path.insert(0, str(src_dir))


def _sample_contexts() -> dict[str, dict]:
    request = SimpleNamespace(
        headers={
            "date": "Mon, 30 Mar 2026 12:34:56 GMT",
            "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        },
        client=SimpleNamespace(host="203.0.113.10"),
    )

    user = SimpleNamespace(
        name="Jane Walker",
        email="jane.walker@example.com",
    )

    customer = SimpleNamespace(
        name="Alex Carter",
        phone="+44 7700 900123",
        email="alex.carter@example.com",
        emergency_contact_name="Morgan Carter",
        emergency_contact_phone="+44 7700 900456",
    )

    dogs = [
        SimpleNamespace(
            name="Milo",
            breed="Cockapoo",
            date_of_birth="2020-09-14",
            vet_name="Green Lane Vets",
            vet_address="48 Green Lane, London",
            is_allowed_treats=True,
            is_allowed_off_the_lead=False,
            is_allowed_on_social_media=True,
            is_neutered_or_spayed=True,
            behavioral_issues="Mild separation anxiety",
            medical_needs="Daily skin medication",
        ),
        SimpleNamespace(
            name="Ruby",
            breed="Labrador Retriever",
            date_of_birth="2019-03-02",
            vet_name="Westwood Veterinary Clinic",
            vet_address="12 Westwood Road, London",
            is_allowed_treats=True,
            is_allowed_off_the_lead=True,
            is_allowed_on_social_media=True,
            is_neutered_or_spayed=True,
            behavioral_issues="None",
            medical_needs="None",
        ),
    ]

    return {
        "emails/user_sign_in.html": {"user": user, "request": request},
        "emails/contact_us.html": {
            "name": "Sam Harper",
            "email": "sam.harper@example.com",
            "message": (
                "Hi W4lkies team,\n\n"
                "I would like to book regular weekday lunch walks for my dog from next month.\n"
                "Please let me know availability and next steps.\n\n"
                "Thanks!"
            ),
            "request": request,
        },
        "emails/customer_sign_up.html": {
            "customer": customer,
            "dogs": dogs,
            "request": request,
        },
        "emails/admin_customer_sign_up.html": {
            "customer": customer,
            "dogs": dogs,
            "request": request,
        },
    }


def render_previews(output_dir: Path, selected_template: str | None = None) -> list[Path]:
    _bootstrap_src_path()
    from templates import render_template  # pylint: disable=import-error

    contexts = _sample_contexts()
    output_dir.mkdir(parents=True, exist_ok=True)

    rendered_files: list[Path] = []
    for template_name, context in contexts.items():
        if selected_template and template_name != selected_template:
            continue

        html = render_template(template_name, context)
        output_name = template_name.replace("emails/", "").replace(".html", "") + ".preview.html"
        destination = output_dir / output_name
        destination.write_text(html, encoding="utf-8")
        rendered_files.append(destination)

    if selected_template and not rendered_files:
        available = "\n".join(sorted(contexts.keys()))
        raise ValueError(
            f"Unknown template '{selected_template}'. Available templates:\n{available}"
        )

    return rendered_files


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Render email templates with sample data for local preview."
    )
    parser.add_argument(
        "--outdir",
        default="data/email_previews",
        help="Output directory, relative to backend directory (default: data/email_previews)",
    )
    parser.add_argument(
        "--template",
        default=None,
        help="Render only one template, e.g. emails/contact_us.html",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    backend_dir = Path(__file__).resolve().parents[1]
    output_dir = (backend_dir / args.outdir).resolve()

    try:
        files = render_previews(output_dir=output_dir, selected_template=args.template)
    except ValueError as exc:
        print(str(exc))
        return 2

    print("Rendered previews:")
    for file in files:
        print(f"- {file}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
