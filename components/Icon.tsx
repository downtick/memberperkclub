// Thin wrapper over the sprite in IconSprite.tsx. Icons inherit the current
// text color and are sized by their context (.ic, .btn .ic, .icbox .ic, …),
// so a single sprite covers white-on-violet buttons and violet-on-white cards
// without a second file.
export type IconName =
  | "bed" | "car" | "plane" | "anchor" | "home" | "leaf" | "case" | "user"
  | "bars" | "phone" | "shield" | "window" | "doc" | "printer" | "tag"
  | "badge" | "wallet" | "search" | "check" | "copy" | "arrow" | "right"
  | "info" | "spark";

export default function Icon({
  name,
  className = "ic",
  style,
}: {
  name: IconName;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg className={className} style={style} aria-hidden="true" focusable="false">
      <use href={`#i-${name}`} />
    </svg>
  );
}
