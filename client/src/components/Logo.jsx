/**
 * The TrailAsia mark: three overlapping peaks (the Himalaya focus that
 * started the agency) with a small sun/waypoint dot, plus the wordmark set
 * in the brand's display serif. An inline SVG rather than an image file —
 * it scales cleanly at nav size and footer size with no asset to ship.
 */
export default function Logo({ withWordmark = true, size = 28 }) {
  return (
    <span className="logo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="logo__mark"
      >
        <circle cx="30" cy="9" r="3.2" fill="var(--gold)" />
        <path d="M2 31 L13 11 L19.5 22.5 L23.5 15.5 L36 31 Z" fill="var(--accent)" />
        <path d="M19.5 22.5 L23.5 15.5 L36 31 L24.5 31 Z" fill="var(--accent-dark)" />
      </svg>
      {withWordmark && <span className="logo__word">TrailAsia</span>}
    </span>
  );
}
