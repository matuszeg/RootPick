export default function LockIcon({ locked, width = 15, height = 15 }) {
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
      <rect x="2" y="7" width="12" height="8" rx="2"/>
      {locked
        ? <path d="M5 7V5a3 3 0 0 1 6 0v2"/>   /* shackle closed */
        : <path d="M5 7V5a3 3 0 0 1 6 0"/>       /* shackle open — right side free */
      }
    </svg>
  );
}
