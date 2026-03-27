from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

template_directory = Path(__file__).resolve().parent / "templates"
template_environment = Environment(
    loader=FileSystemLoader(str(template_directory)),
    autoescape=select_autoescape(["html", "xml"]),
)

def render_template(template: str, kwargs: dict) -> str:
    return template_environment.get_template(template).render(**kwargs)
