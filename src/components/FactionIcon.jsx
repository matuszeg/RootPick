// Original SVG icons inspired by each faction's theme.
// Not reproductions of Leder Games artwork.

const icons = {
  marquise: (
    // Cat paw print
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="26" rx="9" ry="7" />
      <ellipse cx="11" cy="17" rx="3.5" ry="4.5" />
      <ellipse cx="29" cy="17" rx="3.5" ry="4.5" />
      <ellipse cx="15" cy="13" rx="3" ry="4" />
      <ellipse cx="25" cy="13" rx="3" ry="4" />
    </svg>
  ),

  eyrie: (
    // Stylised wing / talon
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 34 C10 28, 4 18, 8 8 C12 16, 16 20, 20 22 C24 20, 28 16, 32 8 C36 18, 30 28, 20 34Z" fill="currentColor"/>
      <path d="M20 22 L20 34" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  alliance: (
    // Tree / spreading roots
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 5 L28 17 H23 L30 26 H24 L31 35 H9 L16 26 H10 L17 17 H12 Z"/>
      <rect x="18" y="33" width="4" height="5"/>
    </svg>
  ),

  vagabond1: (
    // Bindle / wanderer's pack
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="26" cy="16" r="8"/>
      <line x1="18" y1="22" x2="8" y2="35" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <line x1="8" y1="35" x2="14" y2="35" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),

  vagabond2: (
    // Same wanderer icon
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="26" cy="16" r="8"/>
      <line x1="18" y1="22" x2="8" y2="35" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      <line x1="8" y1="35" x2="14" y2="35" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),

  riverfolk: (
    // Fish / wave
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 20 C10 12, 20 10, 30 16 L34 12 L34 28 L30 24 C20 30, 10 28, 6 20Z"/>
      <circle cx="26" cy="19" r="1.5" fill="white" opacity="0.7"/>
    </svg>
  ),

  lizard: (
    // Sun / radiant symbol
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="6"/>
      {[0,45,90,135,180,225,270,315].map((deg, i) => {
        const r = Math.PI * deg / 180;
        return (
          <line
            key={i}
            x1={20 + 9 * Math.cos(r)}
            y1={20 + 9 * Math.sin(r)}
            x2={20 + 14 * Math.cos(r)}
            y2={20 + 14 * Math.sin(r)}
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  ),

  duchy: (
    // Tunnel arch / underground
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 34 L6 20 Q6 8 20 8 Q34 8 34 20 L34 34 Z"/>
      <path d="M13 34 L13 22 Q13 15 20 15 Q27 15 27 22 L27 34 Z" fill="white" opacity="0.25"/>
    </svg>
  ),

  corvid: (
    // Crow / raven silhouette
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 8 C14 8, 10 12, 10 17 C10 21, 12 24, 16 26 L14 36 L20 32 L26 36 L24 26 C28 24, 30 21, 30 17 C30 12, 26 8, 20 8Z"/>
      <path d="M20 8 L8 12 C12 13, 16 13, 18 14" fill="currentColor"/>
      <circle cx="17" cy="14" r="1.5" fill="white" opacity="0.7"/>
    </svg>
  ),

  hundreds: (
    // Crown with flames
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 32 L8 20 L14 26 L20 12 L26 26 L32 20 L32 32 Z"/>
      <rect x="8" y="30" width="24" height="4" rx="1"/>
    </svg>
  ),

  keepers: (
    // Shield with rune mark
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 5 L34 10 L34 22 C34 30, 27 36, 20 38 C13 36, 6 30, 6 22 L6 10 Z"/>
      <path d="M14 20 L26 20 M20 14 L20 26" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),

  lilypad: (
    // Lily pad / water droplet
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 8 C20 8, 34 16, 34 26 C34 32, 27.6 36, 20 36 C12.4 36, 6 32, 6 26 C6 16, 20 8, 20 8Z"/>
      <path d="M20 8 L20 36" stroke="white" strokeWidth="1.5" opacity="0.3"/>
      <path d="M10 24 Q20 18 30 24" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3"/>
    </svg>
  ),

  twilight: (
    // Crescent moon + star
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 8 C14 8, 8 14, 8 22 C8 30, 14 36, 22 36 C16 32, 13 27, 13 22 C13 14, 18 9, 25 8 C24 8, 23 8, 22 8Z"/>
      <polygon points="31,8 32.5,13 37.5,13 33.5,16 35,21 31,18 27,21 28.5,16 24.5,13 29.5,13" />
    </svg>
  ),

  knaves: (
    // Diamond / playing card shape with mask
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4 L36 20 L20 36 L4 20 Z"/>
      <path d="M13 18 Q20 14 27 18 L27 23 Q24 27 20 27 Q16 27 13 23 Z" fill="white" opacity="0.2"/>
      <circle cx="16" cy="20" r="2" fill="white" opacity="0.4"/>
      <circle cx="24" cy="20" r="2" fill="white" opacity="0.4"/>
    </svg>
  ),
};

export default function FactionIcon({ factionId, className }) {
  return (
    <span className={`faction-icon ${className ?? ''}`} aria-hidden="true">
      {icons[factionId] ?? null}
    </span>
  );
}
