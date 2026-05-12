type Props = {
  abbr: string;
  logoUrl?: string | null;
  size?: number; // px
};

// Renders the team logo as a small badge. Falls back to a monospace ABBR chip when no logo.
export default function TeamLogo({ abbr, logoUrl, size = 22 }: Props) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${abbr} logo`}
        width={size}
        height={size}
        className="inline-block object-contain"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-sm bg-ink/5 font-mono font-semibold tracking-tight"
      style={{ minWidth: size, height: size, fontSize: Math.max(9, size * 0.5), padding: "0 4px" }}
    >
      {abbr}
    </span>
  );
}
