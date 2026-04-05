export default function DieIcon({ width = 15, height = 15 }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      height={height}
      aria-hidden="true"
    >
      <rect x="1.5" y="1.5" width="13" height="13" rx="2.5"/>
      <circle cx="5"  cy="4.5"  r="1.1" fill="currentColor" stroke="none"/>
      <circle cx="11" cy="4.5"  r="1.1" fill="currentColor" stroke="none"/>
      <circle cx="5"  cy="8"    r="1.1" fill="currentColor" stroke="none"/>
      <circle cx="11" cy="8"    r="1.1" fill="currentColor" stroke="none"/>
      <circle cx="5"  cy="11.5" r="1.1" fill="currentColor" stroke="none"/>
      <circle cx="11" cy="11.5" r="1.1" fill="currentColor" stroke="none"/>
    </svg>
  );
}
