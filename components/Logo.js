// The brand mark: a single crescent cut from a disc. Reads as a moon (the
// "night" in Night Canteen Runner) and as a ring with one piece taken out
// (the one plate, the one runner, the one trip at a time). Monochrome by
// design — it inherits color via `currentColor` so it can sit on light or
// dark backgrounds without a separate asset.
export default function Logo({ size = 22, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M20 3 a17 17 0 1 0 0 34 a13.2 13.2 0 0 1 0 -34 Z"
        fill="currentColor"
      />
    </svg>
  );
}
