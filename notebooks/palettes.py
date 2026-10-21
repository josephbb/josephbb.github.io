"""Load named plot palettes from notebooks/palettes.toml."""

from __future__ import annotations

import tomllib
from pathlib import Path
from types import SimpleNamespace

_PALETTES_PATH = Path(__file__).resolve().parent / "palettes.toml"


def _load_all() -> dict[str, dict[str, str]]:
    with _PALETTES_PATH.open("rb") as f:
        return tomllib.load(f)


def list_palettes() -> list[str]:
    """Return available palette names."""
    return sorted(_load_all())


def load_palette(name: str) -> SimpleNamespace:
    """Return a palette as attributes, e.g. ``p.ember_clay``."""
    palettes = _load_all()
    try:
        colors = palettes[name]
    except KeyError as exc:
        available = ", ".join(sorted(palettes)) or "(none)"
        raise KeyError(f"Unknown palette {name!r}. Available: {available}") from exc
    return SimpleNamespace(**colors)


def palette_cycle(name: str = "hinoki_forest") -> list[str]:
    """Ordered hex colors suitable for matplotlib prop_cycle."""
    p = load_palette(name)
    return [
        p.deep_grove,
        p.cedar_needle,
        p.ember_clay,
        p.forest_shade,
        p.moss_light,
        p.stone_path,
        p.hinoki_bark,
    ]
