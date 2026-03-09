from __future__ import annotations

from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import LinearSegmentedColormap


OUT_DIR = Path(__file__).resolve().parents[1] / "assets" / "img" / "dermatology-ai-labels"
OUT_DIR.mkdir(parents=True, exist_ok=True)

MATRIX = np.array(
    [
        [2461, 291, 42, 9, 4, 1],
        [2400, 1559, 491, 67, 12, 4],
        [492, 880, 1288, 394, 43, 4],
        [97, 302, 949, 968, 327, 28],
        [18, 52, 122, 470, 667, 161],
        [18, 9, 9, 32, 209, 350],
    ],
    dtype=float,
)


THEMES = {
    "light": {
        "figure_bg": "#f4f4f4",
        "panel_bg": "#f4f4f4",
        "text": "#050505",
        "secondary": "#333333",
        "border": "#050505",
        "grid": "#e6e6e6",
        "bar_primary": "#222222",
        "bar_secondary": "#9a9a9a",
        "heat_low": "#e4e4e4",
        "heat_high": "#222222",
    },
    "dark": {
        "figure_bg": "#1a1a1a",
        "panel_bg": "#1a1a1a",
        "text": "#f0f0f0",
        "secondary": "#bdbdbd",
        "border": "#f0f0f0",
        "grid": "#2f2f2f",
        "bar_primary": "#f0f0f0",
        "bar_secondary": "#9c9c9c",
        "heat_low": "#242424",
        "heat_high": "#f0f0f0",
    },
}


def _roman_labels() -> list[str]:
    return ["I", "II", "III", "IV", "V", "VI"]


def _coarse_labels() -> list[str]:
    return ["Light\n(I-II)", "Medium\n(III-IV)", "Dark\n(V-VI)"]


def _percent(values: np.ndarray) -> np.ndarray:
    return values / values.sum() * 100.0


def _setup_fonts() -> None:
    plt.rcParams.update(
        {
            "font.family": "DejaVu Sans",
            "axes.titlesize": 16,
            "axes.titleweight": "regular",
            "axes.labelsize": 11,
            "xtick.labelsize": 10,
            "ytick.labelsize": 10,
            "svg.fonttype": "path",
        }
    )


def _style_axes(ax: plt.Axes, theme: dict[str, str], y_grid: bool = True) -> None:
    ax.set_facecolor(theme["panel_bg"])
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color(theme["border"])
    ax.spines["bottom"].set_color(theme["border"])
    ax.tick_params(colors=theme["text"])
    ax.xaxis.label.set_color(theme["text"])
    ax.yaxis.label.set_color(theme["text"])
    ax.title.set_color(theme["text"])
    if y_grid:
        ax.grid(axis="y", color=theme["grid"], linewidth=0.8)
        ax.set_axisbelow(True)


def _save(fig: plt.Figure, name: str, theme_name: str) -> None:
    suffix = "" if theme_name == "light" else "-dark"
    path = OUT_DIR / f"{name}{suffix}.svg"
    fig.savefig(path, format="svg", bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)


def make_agreement_metrics(theme_name: str, theme: dict[str, str]) -> None:
    exact = np.trace(MATRIX)
    within_one = MATRIX[np.abs(np.subtract.outer(np.arange(6), np.arange(6))) <= 1].sum()
    within_two = MATRIX[np.abs(np.subtract.outer(np.arange(6), np.arange(6))) <= 2].sum()
    values = np.array([exact, within_one, within_two]) / MATRIX.sum() * 100.0
    labels = ["Exact match", "Within 1 type", "Within 2 types"]

    fig, ax = plt.subplots(figsize=(8.6, 4.8), dpi=160)
    fig.patch.set_facecolor(theme["figure_bg"])
    bars = ax.bar(
        labels,
        values,
        color=[theme["bar_primary"], theme["bar_secondary"], theme["bar_secondary"]],
        width=0.62,
    )
    ax.set_ylim(0, 110)
    ax.set_ylabel("Percent of images")
    ax.set_title("Agreement looks different depending on the rule", pad=14)
    _style_axes(ax, theme)

    for bar, value in zip(bars, values):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            value + 1.2,
            f"{value:.1f}%",
            ha="center",
            va="bottom",
            color=theme["text"],
            fontsize=11,
        )

    fig.tight_layout()
    _save(fig, "agreement-metrics", theme_name)


def make_confusion_matrix(theme_name: str, theme: dict[str, str]) -> None:
    labels = _roman_labels()
    cmap = LinearSegmentedColormap.from_list("mono_heat", [theme["heat_low"], theme["heat_high"]])

    fig, ax = plt.subplots(figsize=(8.3, 7.4), dpi=160)
    fig.patch.set_facecolor(theme["figure_bg"])
    ax.set_facecolor(theme["panel_bg"])

    im = ax.imshow(MATRIX, cmap=cmap, aspect="equal")
    ax.set_xticks(np.arange(6), labels)
    ax.set_yticks(np.arange(6), labels)
    ax.set_xlabel("Centaur Labs consensus type")
    ax.set_ylabel("Scale AI consensus type")
    ax.set_title("Most disagreements stay close to the diagonal", pad=10)
    ax.tick_params(colors=theme["text"])
    ax.xaxis.label.set_color(theme["text"])
    ax.yaxis.label.set_color(theme["text"])
    ax.title.set_color(theme["text"])

    ax.set_xticks(np.arange(-0.5, 6, 1), minor=True)
    ax.set_yticks(np.arange(-0.5, 6, 1), minor=True)
    ax.grid(which="minor", color=theme["grid"], linewidth=0.8)
    ax.tick_params(which="minor", bottom=False, left=False)
    for spine in ax.spines.values():
        spine.set_visible(False)

    threshold = MATRIX.max() * 0.45
    for row in range(MATRIX.shape[0]):
        for col in range(MATRIX.shape[1]):
            color = theme["figure_bg"] if MATRIX[row, col] > threshold else theme["text"]
            ax.text(col, row, f"{int(MATRIX[row, col])}", ha="center", va="center", color=color, fontsize=10)

    fig.tight_layout()
    _save(fig, "consensus-confusion-matrix", theme_name)


def make_bucket_consistency(theme_name: str, theme: dict[str, str]) -> None:
    row_groups = np.array([0, 0, 1, 1, 2, 2])
    col_groups = np.array([0, 0, 1, 1, 2, 2])
    same = 0.0
    for row in range(6):
        for col in range(6):
            if row_groups[row] == col_groups[col]:
                same += MATRIX[row, col]
    different = MATRIX.sum() - same
    values = np.array([same, different]) / MATRIX.sum() * 100.0
    labels = ["Same fairness bucket", "Different fairness bucket"]

    fig, ax = plt.subplots(figsize=(8.6, 4.8), dpi=160)
    fig.patch.set_facecolor(theme["figure_bg"])
    bars = ax.bar(labels, values, color=[theme["bar_primary"], theme["bar_secondary"]], width=0.58)
    ax.set_ylim(0, 100)
    ax.set_ylabel("Percent of comparable images")
    ax.set_title("Bucket changes are common enough to matter", pad=10)
    _style_axes(ax, theme)

    for bar, value in zip(bars, values):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            value + 1.8,
            f"{value:.1f}%",
            ha="center",
            va="bottom",
            color=theme["text"],
            fontsize=11,
        )

    fig.tight_layout()
    _save(fig, "bucket-consistency", theme_name)


def make_representation_shift(theme_name: str, theme: dict[str, str]) -> None:
    scale_counts = np.array([MATRIX[:2].sum(), MATRIX[2:4].sum(), MATRIX[4:].sum()])
    centaur_counts = np.array([MATRIX[:, :2].sum(), MATRIX[:, 2:4].sum(), MATRIX[:, 4:].sum()])
    scale_pct = _percent(scale_counts)
    centaur_pct = _percent(centaur_counts)

    x = np.arange(3)
    width = 0.34

    fig, ax = plt.subplots(figsize=(8.8, 5.0), dpi=160)
    fig.patch.set_facecolor(theme["figure_bg"])
    ax.bar(x - width / 2, scale_pct, width, label="Scale AI consensus", color=theme["bar_primary"])
    ax.bar(x + width / 2, centaur_pct, width, label="Centaur Labs consensus", color=theme["bar_secondary"])
    ax.set_xticks(x, _coarse_labels())
    ax.set_ylabel("Percent of labeled images")
    ax.set_ylim(0, max(scale_pct.max(), centaur_pct.max()) + 8)
    ax.set_title("Pipeline choice shifts the subgroup mix", pad=10)
    _style_axes(ax, theme)

    legend = ax.legend(frameon=False, loc="upper right")
    for text in legend.get_texts():
        text.set_color(theme["text"])

    fig.tight_layout()
    _save(fig, "representation-shift", theme_name)


def main() -> None:
    _setup_fonts()
    for theme_name, theme in THEMES.items():
        make_agreement_metrics(theme_name, theme)
        make_confusion_matrix(theme_name, theme)
        make_bucket_consistency(theme_name, theme)
        make_representation_shift(theme_name, theme)


if __name__ == "__main__":
    main()
