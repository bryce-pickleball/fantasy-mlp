type Props = {
  name: string;
  imageUrl?: string | null;
  size?: number; // px
  gender?: "M" | "W";
};

// Hash the name to a stable hue so each player has a consistent color even without an image.
function hue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts.at(-1)?.[0] ?? "");
}

export default function Avatar({ name, imageUrl, size = 36, gender }: Props) {
  const h = hue(name);
  const bg = `hsl(${h} 55% 90%)`;
  const fg = `hsl(${h} 60% 28%)`;
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover border border-line"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-label={name}
      title={gender ? `${name} (${gender})` : name}
      className="inline-flex items-center justify-center rounded-full font-display font-semibold uppercase border border-line"
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        fontSize: Math.max(10, size * 0.38),
        letterSpacing: "0.02em",
      }}
    >
      {initials(name)}
    </span>
  );
}
