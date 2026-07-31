function rgb(hex: string) {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ] as const;
}

function luminance(hex: string) {
  const channels = rgb(hex).map((value) => {
    const normalized = value / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(first: string, second: string) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

export function textColorOn(background: string) {
  return contrastRatio(background, "#000000") >= contrastRatio(background, "#ffffff")
    ? "#000000"
    : "#ffffff";
}

export function readableAccent(accent: string, background = "#fffaf2") {
  if (contrastRatio(accent, background) >= 4.5) return accent;
  const [red, green, blue] = rgb(accent);
  for (let factor = 0.9; factor >= 0; factor -= 0.1) {
    const candidate = `#${[red, green, blue]
      .map((value) => Math.round(value * factor).toString(16).padStart(2, "0"))
      .join("")}`;
    if (contrastRatio(candidate, background) >= 4.5) return candidate;
  }
  return "#000000";
}
