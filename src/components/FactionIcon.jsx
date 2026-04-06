// Original SVG icons inspired by each faction's animal.
// Not reproductions of Leder Games artwork.
//
// Eye holes and identifying cutouts use compound SVG <path> elements.
// Multiple subpaths within a single <path d="..."> with fillRule="evenodd"
// punch transparent holes wherever subpaths overlap, revealing the DOM
// background regardless of what currentColor resolves to in each context.
// fillRule="evenodd" on a <g> does NOT do this — it must be on the <path>.

const icons = {
  marquise: (
    // Cat — pointed ears, face with punched eye holes
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <polygon points="7,14 5,4 15,11"/>
      <polygon points="33,14 35,4 25,11"/>
      <path fillRule="evenodd" d="
        M6,22 a14,13 0 1,0 28,0 a14,13 0 1,0 -28,0Z
        M11,20 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0Z
        M23,20 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0Z
      "/>
    </svg>
  ),

  eyrie: (
    // Blue Jay — two swept crest feathers, face with eye holes, downward beak
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17,13 C16,8 14,4 17,1 C19,4 20,9 19,13Z"/>
      <path d="M21,13 C21,7 23,3 27,4 C25,8 23,11 21,13Z"/>
      <path fillRule="evenodd" d="
        M7,24 a13,13 0 1,0 26,0 a13,13 0 1,0 -26,0Z
        M10,22 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0Z
        M24,22 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0Z
      "/>
      <polygon points="16,33 20,39 24,33"/>
    </svg>
  ),

  alliance: (
    // Rabbit — long ears, face with eye holes and nose hole
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="14" cy="10" rx="4.5" ry="10"/>
      <ellipse cx="26" cy="10" rx="4.5" ry="10"/>
      <path fillRule="evenodd" d="
        M7,27 a13,11 0 1,0 26,0 a13,11 0 1,0 -26,0Z
        M11.5,23 a2.5,2.5 0 1,0 5,0 a2.5,2.5 0 1,0 -5,0Z
        M23.5,23 a2.5,2.5 0 1,0 5,0 a2.5,2.5 0 1,0 -5,0Z
        M18.5,29 a1.5,1.5 0 1,0 3,0 a1.5,1.5 0 1,0 -3,0Z
      "/>
    </svg>
  ),

  vagabond1: (
    // Raccoon — ears, face with mask hole, eyes refilled inside mask (3 levels of evenodd)
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="10" r="5"/>
      <circle cx="29" cy="10" r="5"/>
      <path fillRule="evenodd" d="
        M7,22 a13,11 0 1,0 26,0 a13,11 0 1,0 -26,0Z
        M11,16 L29,16 A4,4 0 0,1 33,20 A4,4 0 0,1 29,24 L11,24 A4,4 0 0,1 7,20 A4,4 0 0,1 11,16Z
        M11,20 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0Z
        M23,20 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0Z
      "/>
    </svg>
  ),

  vagabond2: (
    // Raccoon — same as vagabond1
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="10" r="5"/>
      <circle cx="29" cy="10" r="5"/>
      <path fillRule="evenodd" d="
        M7,22 a13,11 0 1,0 26,0 a13,11 0 1,0 -26,0Z
        M11,16 L29,16 A4,4 0 0,1 33,20 A4,4 0 0,1 29,24 L11,24 A4,4 0 0,1 7,20 A4,4 0 0,1 11,16Z
        M11,20 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0Z
        M23,20 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0Z
      "/>
    </svg>
  ),

  riverfolk: (
    // Otter — ears, face with eye holes, wide muzzle with nose hole (separate path)
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="4.5"/>
      <circle cx="29" cy="11" r="4.5"/>
      <path fillRule="evenodd" d="
        M7,22 a13,11 0 1,0 26,0 a13,11 0 1,0 -26,0Z
        M11.5,19 a2.5,2.5 0 1,0 5,0 a2.5,2.5 0 1,0 -5,0Z
        M23.5,19 a2.5,2.5 0 1,0 5,0 a2.5,2.5 0 1,0 -5,0Z
      "/>
      <path fillRule="evenodd" d="
        M13,28 a7,5 0 1,0 14,0 a7,5 0 1,0 -14,0Z
        M17.5,26 a2.5,1.5 0 1,0 5,0 a2.5,1.5 0 1,0 -5,0Z
      "/>
    </svg>
  ),

  lizard: (
    // Lizard — top-down: head with eye holes, oval body, four legs, tail
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="
        M14,12 a6,5.5 0 1,0 12,0 a6,5.5 0 1,0 -12,0Z
        M14,11 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0Z
        M22,11 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0Z
      "/>
      <ellipse cx="20" cy="23" rx="7" ry="9"/>
      <path d="M13,18 L4,13 M27,18 L36,13 M13,28 L4,33 M27,28 L36,33"
            stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
      <path d="M20,32 C22,36 21,39 19,40"
            stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),

  duchy: (
    // Mole — small ears, round face with tiny eye holes, wide snout with nostril holes
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="11" r="5"/>
      <circle cx="28" cy="11" r="5"/>
      <path fillRule="evenodd" d="
        M6,23 a14,14 0 1,0 28,0 a14,14 0 1,0 -28,0Z
        M11,20 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0Z
        M25,20 a2,2 0 1,0 4,0 a2,2 0 1,0 -4,0Z
      "/>
      <path fillRule="evenodd" d="
        M11,32 a9,6 0 1,0 18,0 a9,6 0 1,0 -18,0Z
        M15.5,31 a1.5,1.5 0 1,0 3,0 a1.5,1.5 0 1,0 -3,0Z
        M21.5,31 a1.5,1.5 0 1,0 3,0 a1.5,1.5 0 1,0 -3,0Z
      "/>
    </svg>
  ),

  corvid: (
    // Crow — round head with large eye holes, thick downward beak
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="
        M9,17 a11,11 0 1,0 22,0 a11,11 0 1,0 -22,0Z
        M10.5,15 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0Z
        M22.5,15 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0Z
      "/>
      <path d="M12,27 L20,39 L28,27Z"/>
    </svg>
  ),

  hundreds: (
    // Mouse — large ears with inner holes, face with eye holes, pointed snout
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="
        M3,10 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0Z
        M6,10 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0Z
      "/>
      <path fillRule="evenodd" d="
        M23,10 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0Z
        M26,10 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0Z
      "/>
      <path fillRule="evenodd" d="
        M7,24 a13,11 0 1,0 26,0 a13,11 0 1,0 -26,0Z
        M11.5,21 a2.5,2.5 0 1,0 5,0 a2.5,2.5 0 1,0 -5,0Z
        M23.5,21 a2.5,2.5 0 1,0 5,0 a2.5,2.5 0 1,0 -5,0Z
      "/>
      <ellipse cx="20" cy="32" rx="4" ry="3"/>
    </svg>
  ),

  keepers: (
    // Badger — ears, wide head with centre stripe hole and eye holes outside stripe, snout
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="9" r="5"/>
      <circle cx="30" cy="9" r="5"/>
      <path fillRule="evenodd" d="
        M5,23 a15,12 0 1,0 30,0 a15,12 0 1,0 -30,0Z
        M16,21 a4,12 0 1,0 8,0 a4,12 0 1,0 -8,0Z
        M10,20 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0Z
        M24,20 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0Z
      "/>
      <ellipse cx="20" cy="30" rx="5" ry="4"/>
    </svg>
  ),

  lilypad: (
    // Frog — bulging top-mounted eyes as rings (outer filled, inner hole), wide flat head
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="
        M5,14 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0Z
        M8,14 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0Z
      "/>
      <path fillRule="evenodd" d="
        M23,14 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0Z
        M26,14 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0Z
      "/>
      <ellipse cx="20" cy="24" rx="15" ry="10"/>
      <path d="M10,28 Q20,34 30,28" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.4"/>
    </svg>
  ),

  twilight: (
    // Bat — W-shaped wings, pointed ears, head with small eye holes
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20,22 C16,20 8,14 2,16 C4,20 8,22 12,21 C10,24 8,28 10,30 C13,27 16,24 20,25Z"/>
      <path d="M20,22 C24,20 32,14 38,16 C36,20 32,22 28,21 C30,24 32,28 30,30 C27,27 24,24 20,25Z"/>
      <polygon points="16,16 14,8 19,14"/>
      <polygon points="24,16 26,8 21,14"/>
      <path fillRule="evenodd" d="
        M15,20 a5,6 0 1,0 10,0 a5,6 0 1,0 -10,0Z
        M16.5,18 a1.5,1.5 0 1,0 3,0 a1.5,1.5 0 1,0 -3,0Z
        M20.5,18 a1.5,1.5 0 1,0 3,0 a1.5,1.5 0 1,0 -3,0Z
      "/>
    </svg>
  ),

  knaves: (
    // Skunk — ears, bushy tail arc, face with centre stripe hole and eye holes outside stripe
    <svg viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="9" r="4.5"/>
      <circle cx="28" cy="9" r="4.5"/>
      <path d="M7,14 C2,8 2,2 8,2 C12,2 14,6 12,10"
            stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path fillRule="evenodd" d="
        M7,22 a13,11 0 1,0 26,0 a13,11 0 1,0 -26,0Z
        M16.5,20 a3.5,11 0 1,0 7,0 a3.5,11 0 1,0 -7,0Z
        M11,19 a2.5,2.5 0 1,0 5,0 a2.5,2.5 0 1,0 -5,0Z
        M24,19 a2.5,2.5 0 1,0 5,0 a2.5,2.5 0 1,0 -5,0Z
      "/>
    </svg>
  ),
};

export default function FactionIcon({ factionId, className }) {
  return (
    <span className={`faction-icon ${className ?? ''}`} aria-hidden="true">
      {icons[factionId] ?? <span className="faction-icon-fallback">?</span>}
    </span>
  );
}
