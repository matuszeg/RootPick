export const MAPS = [
  {
    id: "autumn",
    name: "Autumn",
    board: "Autumn / Winter",
    expansion: "base",
    difficulty: 1,
    img: '/icons/maps/autumn.webp',
    description: "The classic woodland. Fixed clearing suits, balanced connectivity. The ideal starting point.",
    specialRules: null,
    factionNotes: {},
    hasPrintedSuits: true,
    requiresSuitRandomization: false,
    nativeLandmarks: [],
    hasFloodMarkers: false,
    floodMarkers: [],
    clearingCount: 12,
    clearings: [
      { id: 1, x: 14, y: 16.7, isCorner: true },
      { id: 2, x: 83.9, y: 27.2, isCorner: true },
      { id: 3, x: 87.3, y: 84.8, isCorner: true },
      { id: 4, x: 11.6, y: 85.7, onRiver: true, isCorner: true },
      { id: 5, x: 54.9, y: 13.4 },
      { id: 6, x: 93.6, y: 55.4 },
      { id: 7, x: 58.1, y: 82.6, onRiver: true },
      { id: 8, x: 33.3, y: 84.7 },
      { id: 9, x: 17.3, y: 38.5 },
      { id: 10, x: 37.9, y: 32.5, onRiver: true },
      { id: 11, x: 68.1, y: 52.6, onRiver: true },
      { id: 12, x: 28.5, y: 53 },
    ],
    ruins: [
      { x: 44, y: 33.9 }, // -> clearing 10
      { x: 34.9, y: 54.6 }, // -> clearing 12
      { x: 60.8, y: 51.7 }, // -> clearing 11
      { x: 91.1, y: 48.4 }, // -> clearing 6
    ],
    buildingSlots: [
      { x: 8.9, y: 12.9 }, // -> clearing 1
      { x: 51.5, y: 7.6 }, // -> clearing 5
      { x: 56.8, y: 6.8 }, // -> clearing 5
      { x: 87.2, y: 21.6 }, // -> clearing 2
      { x: 89.4, y: 26.6 }, // -> clearing 2
      { x: 91.2, y: 48.2 }, // -> clearing 6
      { x: 86.7, y: 53.7 }, // -> clearing 6
      { x: 65.4, y: 48.2 }, // -> clearing 11
      { x: 61.5, y: 45 }, // -> clearing 11
      { x: 61.3, y: 51.6 }, // -> clearing 11
      { x: 43.9, y: 34.1 }, // -> clearing 10
      { x: 38.4, y: 26.3 }, // -> clearing 10
      { x: 12.7, y: 36.8 }, // -> clearing 9
      { x: 8.4, y: 45.7 }, // -> clearing 9
      { x: 30.9, y: 59.3 }, // -> clearing 12
      { x: 35.4, y: 54.2 }, // -> clearing 12
      { x: 15.1, y: 81.3 }, // -> clearing 4
      { x: 38, y: 90.2 }, // -> clearing 8
      { x: 39.6, y: 84.4 }, // -> clearing 8
      { x: 54.6, y: 78.7 }, // -> clearing 7
      { x: 57.9, y: 72.8 }, // -> clearing 7
      { x: 80.8, y: 86 }, // -> clearing 3
    ],
    landmarkSlots: [
      { x: 13.9, y: 8.2 }, // -> clearing 1
      { x: 61.1, y: 7.6 }, // -> clearing 5
      { x: 91.5, y: 22.5 }, // -> clearing 2
      { x: 96.2, y: 51 }, // -> clearing 6
      { x: 70.1, y: 43.9 }, // -> clearing 11
      { x: 45.3, y: 25 }, // -> clearing 10
      { x: 5.6, y: 38.4 }, // -> clearing 9
      { x: 25.2, y: 59 }, // -> clearing 12
      { x: 7.2, y: 78.4 }, // -> clearing 4
      { x: 43.3, y: 91.8 }, // -> clearing 8
      { x: 63.7, y: 75.2 }, // -> clearing 7
      { x: 77.3, y: 92.1 }, // -> clearing 3
    ],
    adjacency: [
      [1, 5],
      [1, 9],
      [1, 10],
      [2, 5],
      [2, 6],
      [2, 10],
      [3, 6],
      [3, 7],
      [3, 11],
      [4, 8],
      [4, 9],
      [4, 12],
      [6, 11],
      [7, 8],
      [7, 12],
      [9, 12],
      [10, 12],
      [11, 12],
    ],
    floodEligibleClearings: [],
    printedSuits: {
      1: 'fox',    2: 'mouse',  3: 'rabbit', 4: 'rabbit',
      5: 'rabbit', 6: 'fox',    7: 'mouse',  8: 'fox',
      9: 'mouse', 10: 'rabbit', 11: 'mouse', 12: 'fox',
    },
  },
  {
    id: "winter",
    name: "Winter",
    board: "Autumn / Winter",
    expansion: "base",
    difficulty: 2,
    img: '/icons/maps/winter.webp',
    description: "Same layout as Autumn but clearing suits are randomized at setup — no two games play alike.",
    specialRules: "Shuffle 12 suit markers face-down, place one per clearing, then reveal.",
    factionNotes: {
      lizard: "Suit randomization can strongly affect which clearings the Cult can spread into.",
      alliance: "Random suits affect where sympathy tokens can be placed — plan accordingly.",
    },
    hasPrintedSuits: false,
    requiresSuitRandomization: true,
    nativeLandmarks: [],
    hasFloodMarkers: false,
    floodMarkers: [],
    clearingCount: 12,
    clearings: [
      { id: 1, x: 7.4, y: 8.1, isCorner: true },
      { id: 2, x: 91.3, y: 18.7, isCorner: true },
      { id: 3, x: 90.7, y: 88.5, isCorner: true },
      { id: 4, x: 14.6, y: 88.4, isCorner: true },
      { id: 5, x: 38.5, y: 10.4 },
      { id: 6, x: 61.4, y: 16.4 },
      { id: 7, x: 97.4, y: 59.8, onRiver: true },
      { id: 8, x: 59.4, y: 79.4 },
      { id: 9, x: 36.5, y: 91 },
      { id: 10, x: 7.5, y: 42.6, onRiver: true },
      { id: 11, x: 41.6, y: 44.7, onRiver: true },
      { id: 12, x: 55.8, y: 48.5, onRiver: true },
    ],
    ruins: [
      { x: 59.6, y: 43 }, // -> clearing 12
      { x: 34.8, y: 46.9 }, // -> clearing 11
      { x: 57.1, y: 70.9 }, // -> clearing 8
      { x: 36.4, y: 87.9 }, // -> clearing 9
    ],
    buildingSlots: [
      { x: 12.4, y: 12.9 }, // -> clearing 1
      { x: 38.7, y: 14.9 }, // -> clearing 5
      { x: 37.8, y: 19.8 }, // -> clearing 5
      { x: 57.4, y: 26.1 }, // -> clearing 6
      { x: 60.5, y: 22.3 }, // -> clearing 6
      { x: 87.9, y: 24.3 }, // -> clearing 2
      { x: 13.3, y: 42.8 }, // -> clearing 10
      { x: 35.7, y: 54.1 }, // -> clearing 11
      { x: 40.2, y: 53.6 }, // -> clearing 11
      { x: 34.9, y: 46.9 }, // -> clearing 11
      { x: 59.6, y: 43.2 }, // -> clearing 12
      { x: 64.6, y: 45.1 }, // -> clearing 12
      { x: 61.4, y: 50.9 }, // -> clearing 12
      { x: 92.1, y: 60.8 }, // -> clearing 7
      { x: 83.8, y: 84.1 }, // -> clearing 3
      { x: 83.3, y: 89.2 }, // -> clearing 3
      { x: 60.3, y: 74.8 }, // -> clearing 8
      { x: 57.1, y: 70.9 }, // -> clearing 8
      { x: 38.5, y: 83.5 }, // -> clearing 9
      { x: 36.5, y: 88.1 }, // -> clearing 9
      { x: 17.4, y: 80.3 }, // -> clearing 4
      { x: 11.7, y: 78.8 }, // -> clearing 4
    ],
    landmarkSlots: [
      { x: 16.8, y: 9.6 }, // -> clearing 1
      { x: 33.3, y: 13.4 }, // -> clearing 5
      { x: 56.1, y: 19.1 }, // -> clearing 6
      { x: 83.4, y: 20 }, // -> clearing 2
      { x: 8, y: 37.9 }, // -> clearing 10
      { x: 30.3, y: 52.5 }, // -> clearing 11
      { x: 68.6, y: 51 }, // -> clearing 12
      { x: 86.7, y: 59.9 }, // -> clearing 7
      { x: 91.7, y: 83.4 }, // -> clearing 3
      { x: 64.3, y: 72 }, // -> clearing 8
      { x: 41.8, y: 80 }, // -> clearing 9
      { x: 7.4, y: 84.2 }, // -> clearing 4
    ],
    adjacency: [
      [1, 5],
      [1, 10],
      [1, 11],
      [2, 6],
      [2, 7],
      [2, 12],
      [3, 7],
      [3, 8],
      [3, 12],
      [4, 9],
      [4, 10],
      [4, 11],
      [5, 6],
      [8, 9],
      [8, 12],
      [9, 11],
    ],
    floodEligibleClearings: [],
  },
  {
    id: "mountain",
    name: "Mountain",
    board: "Mountain / Lake",
    expansion: "underworld",
    difficulty: 2,
    img: '/icons/maps/mountain.webp',
    description: "Tunnels and a central Pass. Whoever rules the Pass scores 1 VP per round — expect a fight.",
    specialRules: "The Pass scores 1 VP per round for its ruler. Blocked tunnels can be dug open for 1 VP.",
    factionNotes: {
      duchy: "The Duchy's tunnel network synergizes powerfully with the Mountain's existing tunnels.",
      corvid: "Chokepoints make movement predictable — great for placing plots.",
      marquise: "Industrial expansion is constrained by mountain passes. Plan your roads carefully.",
    },
    hasPrintedSuits: false,
    requiresSuitRandomization: true,
    nativeLandmarks: [{ id: 'tower', placement: 'ruin' }],
    hasFloodMarkers: false,
    floodMarkers: [],
    clearingCount: 12,
    clearings: [
      { id: 1, x: 14.8, y: 12, isCorner: true },
      { id: 2, x: 80.5, y: 16.2, onRiver: true, isCorner: true },
      { id: 3, x: 91.6, y: 76.7, isCorner: true },
      { id: 4, x: 16.3, y: 78.2, onRiver: true, isCorner: true },
      { id: 5, x: 52.4, y: 10.5 },
      { id: 6, x: 96, y: 48.6 },
      { id: 7, x: 56.6, y: 90.3 },
      { id: 8, x: 3.3, y: 58 },
      { id: 9, x: 28.7, y: 26.3 },
      { id: 10, x: 54, y: 35, onRiver: true },
      { id: 11, x: 62, y: 67.9 },
      { id: 12, x: 26.8, y: 64.7 },
    ],
    ruins: [
      { x: 31.9, y: 30.8 }, // -> clearing 9
      { x: 46.8, y: 36.4 }, // -> clearing 10
      { x: 62.5, y: 57.3 }, // -> clearing 11
      { x: 32.1, y: 69.7 }, // -> clearing 12
    ],
    buildingSlots: [
      { x: 9.9, y: 13.7 }, // -> clearing 1
      { x: 13.5, y: 18.2 }, // -> clearing 1
      { x: 53.8, y: 16.3 }, // -> clearing 5
      { x: 82.9, y: 25.5 }, // -> clearing 2
      { x: 86.1, y: 20.8 }, // -> clearing 2
      { x: 26.6, y: 32.7 }, // -> clearing 9
      { x: 32.1, y: 31.1 }, // -> clearing 9
      { x: 30.8, y: 36.4 }, // -> clearing 9
      { x: 46.6, y: 36.1 }, // -> clearing 10
      { x: 50.8, y: 43.4 }, // -> clearing 10
      { x: 91.2, y: 49.3 }, // -> clearing 6
      { x: 62.6, y: 57.4 }, // -> clearing 11
      { x: 67.2, y: 59.3 }, // -> clearing 11
      { x: 61.6, y: 63.2 }, // -> clearing 11
      { x: 84.2, y: 76.4 }, // -> clearing 3
      { x: 87.6, y: 79.2 }, // -> clearing 3
      { x: 57.4, y: 85 }, // -> clearing 7
      { x: 32.1, y: 69.6 }, // -> clearing 12
      { x: 37.1, y: 68.8 }, // -> clearing 12
      { x: 35.3, y: 64.8 }, // -> clearing 12
      { x: 17.9, y: 83.9 }, // -> clearing 4
      { x: 11.8, y: 81.2 }, // -> clearing 4
      { x: 9.4, y: 56.9 }, // -> clearing 8
    ],
    landmarkSlots: [
      { x: 6.7, y: 20.1 }, // -> clearing 1
      { x: 58.2, y: 13.9 }, // -> clearing 5
      { x: 89.4, y: 24 }, // -> clearing 2
      { x: 86.4, y: 48.2 }, // -> clearing 6
      { x: 45.4, y: 46.1 }, // -> clearing 10
      { x: 27.1, y: 40.6 }, // -> clearing 9
      { x: 14.3, y: 59.8 }, // -> clearing 8
      { x: 40.2, y: 68.8 }, // -> clearing 12
      { x: 66.5, y: 66.8 }, // -> clearing 11
      { x: 84, y: 84.2 }, // -> clearing 3
      { x: 52.9, y: 86.9 }, // -> clearing 7
      { x: 12.8, y: 89.5 }, // -> clearing 4
    ],
    adjacency: [
      [1, 8],
      [1, 9],
      [2, 5],
      [2, 6],
      [2, 11],
      [3, 6],
      [3, 7],
      [3, 11],
      [4, 8],
      [4, 12],
      [5, 9],
      [5, 10],
      [5, 11],
      [6, 11],
      [7, 12],
      [8, 9],
      [9, 10],
      [9, 12],
      [10, 11],
      [10, 12],
      [11, 12],
    ],
    floodEligibleClearings: [],
  },
  {
    id: "lake",
    name: "Lake",
    board: "Mountain / Lake",
    expansion: "underworld",
    difficulty: 3,
    img: '/icons/maps/lake.webp',
    description: "A central lake divides the map. The Ferry lets pieces teleport between coastal clearings — completely changes movement.",
    specialRules: "Ferry moves between any two coastal clearings once per turn. Coastal forests are adjacent to each other.",
    factionNotes: {
      riverfolk: "Thrives on the Lake — the Ferry mirrors their river-based trade routes.",
      vagabond1: "Ferry enables rapid quest completion and trading across the map.",
      vagabond2: "Ferry enables rapid quest completion and trading across the map.",
      marquise: "Standard road-based expansion is disrupted by the lake's geography.",
      eyrie: "Decree-driven movement can be hard to maintain with unusual adjacency rules.",
    },
    hasPrintedSuits: false,
    requiresSuitRandomization: true,
    nativeLandmarks: [{ id: 'ferry', placement: 'coastal' }],
    hasFloodMarkers: false,
    floodMarkers: [],
    clearingCount: 12,
    clearings: [
      { id: 1, x: 92.7, y: 84.1, isCoastal: true, isCorner: true },
      { id: 2, x: 8.1, y: 14.7, isCorner: true },
      { id: 3, x: 5.6, y: 84.4, isCorner: true },
      { id: 4, x: 94.4, y: 27.6, isCorner: true },
      { id: 5, x: 95.2, y: 59.3 },
      { id: 6, x: 69.8, y: 16.5 },
      { id: 7, x: 42.8, y: 7.7 },
      { id: 8, x: 4.3, y: 47.8 },
      { id: 9, x: 38, y: 85.6 },
      { id: 10, x: 33.8, y: 41.5, isCoastal: true },
      { id: 11, x: 58.9, y: 53.3, isCoastal: true },
      { id: 12, x: 41.2, y: 62.1, isCoastal: true },
    ],
    ruins: [
      { x: 34.8, y: 36 }, // -> clearing 10
      { x: 67.5, y: 44 }, // -> clearing 11
      { x: 32.7, y: 70.5 }, // -> clearing 12
      { x: 89.4, y: 62.1 }, // -> clearing 5
    ],
    buildingSlots: [
      { x: 14, y: 20.5 }, // -> clearing 2
      { x: 46.5, y: 12.4 }, // -> clearing 7
      { x: 66.1, y: 25 }, // -> clearing 6
      { x: 71.4, y: 22.6 }, // -> clearing 6
      { x: 93.1, y: 36 }, // -> clearing 4
      { x: 90.2, y: 57.4 }, // -> clearing 5
      { x: 85.4, y: 55.8 }, // -> clearing 5
      { x: 89.7, y: 61.9 }, // -> clearing 5
      { x: 67.8, y: 44.1 }, // -> clearing 11
      { x: 61.4, y: 46.1 }, // -> clearing 11
      { x: 65.8, y: 52.4 }, // -> clearing 11
      { x: 81.7, y: 80.6 }, // -> clearing 1
      { x: 86.4, y: 86.5 }, // -> clearing 1
      { x: 46.4, y: 87.3 }, // -> clearing 9
      { x: 33.4, y: 70.5 }, // -> clearing 12
      { x: 37.9, y: 69.4 }, // -> clearing 12
      { x: 34.3, y: 64.9 }, // -> clearing 12
      { x: 11.7, y: 81.4 }, // -> clearing 3
      { x: 12.1, y: 48.8 }, // -> clearing 8
      { x: 30.2, y: 37.7 }, // -> clearing 10
      { x: 31.8, y: 32.2 }, // -> clearing 10
      { x: 35.1, y: 36.1 }, // -> clearing 10
    ],
    landmarkSlots: [
      { x: 19.3, y: 19.4 }, // -> clearing 2
      { x: 41.8, y: 16.2 }, // -> clearing 7
      { x: 66.2, y: 20.5 }, // -> clearing 6
      { x: 86.9, y: 36.1 }, // -> clearing 4
      { x: 93.3, y: 53.2 }, // -> clearing 5
      { x: 70.9, y: 53.1 }, // -> clearing 11
      { x: 25.7, y: 36 }, // -> clearing 10
      { x: 16.6, y: 53.3 }, // -> clearing 8
      { x: 29.4, y: 67.7 }, // -> clearing 12
      { x: 15.5, y: 80.4 }, // -> clearing 3
      { x: 41.9, y: 92 }, // -> clearing 9
      { x: 82, y: 90.6 }, // -> clearing 1
    ],
    adjacency: [
      [1, 5],
      [1, 9],
      [2, 7],
      [2, 8],
      [2, 10],
      [3, 8],
      [3, 9],
      [3, 12],
      [4, 5],
      [4, 6],
      [5, 11],
      [6, 7],
      [6, 11],
      [7, 10],
      [7, 11],
      [8, 10],
      [9, 12],
    ],
    floodEligibleClearings: [],
  },
  {
    id: "marsh",
    name: "Marsh",
    board: "Marsh / Gorge",
    expansion: "homeland",
    difficulty: 2,
    img: '/icons/maps/marsh.webp',
    description: "A larger, scalable map (12–15 clearings) with a landmark system. Built for bigger player counts.",
    specialRules: "Modular setup: 12 or 15 clearings depending on player count. Landmarks add building slots and special effects.",
    factionNotes: {
      lilypad: "Designed with the Lilypad Diaspora in mind — water features suit their playstyle.",
      twilight: "More clearings mean more deal-making opportunities for the Council.",
    },
    hasPrintedSuits: false,
    requiresSuitRandomization: true,
    nativeLandmarks: [
      { id: 'mousehold', minPlayers: 5 },
      { id: 'foxburrow', minPlayers: 5 },
      { id: 'rabbittown', minPlayers: 5 },
    ],
    hasFloodMarkers: true,
    // Each flood color can land on one of two specific printed clearings.
    // At 1-4p, exactly one marker per color is placed.
    floodMarkers: [
      { id: 'flood_light_green', name: 'Light Green', color: '#7FB069', clearingPair: [13, 14] },
      { id: 'flood_dark_green',  name: 'Dark Green',  color: '#3D5A3D', clearingPair: [6, 8]   },
      { id: 'flood_brown',       name: 'Brown',       color: '#6B4E3D', clearingPair: [10, 11] },
    ],
    // Per-clearing flood marker images and their custom positions on the map
    // (different from the clearing centers because each marker covers paths).
    floodMarkerPlacements: [
      { clearingId: 6,  img: '/icons/floods/marsh_06.png', x: 64.3, y: 14.2 },
      { clearingId: 8,  img: '/icons/floods/marsh_08.png', x: 51.3, y: 85.6 },
      { clearingId: 10, img: '/icons/floods/marsh_10.png', x: 9.5,  y: 55.8 },
      { clearingId: 11, img: '/icons/floods/marsh_11.png', x: 28,   y: 34.5 },
      { clearingId: 13, img: '/icons/floods/marsh_13.png', x: 80.5, y: 42.1 },
      { clearingId: 14, img: '/icons/floods/marsh_14.png', x: 63.7, y: 65.3 },
    ],
    floodMarkerScale: 15,
    // Marsh has 15 clearings. At 1-4p, 3 of the 6 flood-eligible clearings are
    // covered by flood markers (one per color). At 5+p, 3 of those same 6 host
    // the Mousehold/Foxburrow/Rabbittown native landmarks. The remaining 12
    // clearings receive the 12 base-game suit tokens.
    clearingCount: 15,
    clearings: [
      { id: 1, x: 8.1, y: 8.6, isCorner: true },
      { id: 2, x: 87.4, y: 24.6, isCorner: true },
      { id: 3, x: 79.4, y: 83.1, isCorner: true },
      { id: 4, x: 14.4, y: 77.3, onRiver: true, isCorner: true },
      { id: 5, x: 38.7, y: 14.8 },
      { id: 6, x: 60.3, y: 19, onRiver: true },
      { id: 7, x: 86, y: 63.1 },
      { id: 8, x: 53.8, y: 81.7, onRiver: true },
      { id: 9, x: 39.1, y: 72.2 },
      { id: 10, x: 3.5, y: 55.4 },
      { id: 11, x: 25.7, y: 37.3 },
      { id: 12, x: 54.7, y: 29, onRiver: true },
      { id: 13, x: 82.5, y: 46.8 },
      { id: 14, x: 62.5, y: 57.7 },
      { id: 15, x: 33.4, y: 56.2, onRiver: true },
    ],
    ruins: [
      { x: 42, y: 55.1 }, // -> clearing 15
      { x: 58.3, y: 34.9 }, // -> clearing 12
      { x: 77.5, y: 41.8, label: 'R1' }, // -> clearing 13
      { x: 61.6, y: 63.9, label: 'R2' }, // -> clearing 14
      { x: 65.4, y: 17.4, label: 'R3' }, // -> clearing 6
      { x: 50.8, y: 90.5, label: 'R4' }, // -> clearing 8
    ],
    buildingSlots: [
      { x: 13, y: 13.2 }, // -> clearing 1
      { x: 42.9, y: 10.2 }, // -> clearing 5
      { x: 62.7, y: 14 }, // -> clearing 6
      { x: 65.5, y: 17.3 }, // -> clearing 6
      { x: 88.4, y: 17.8 }, // -> clearing 2
      { x: 92.4, y: 20.2 }, // -> clearing 2
      { x: 77.7, y: 41.8 }, // -> clearing 13
      { x: 83.1, y: 39.6 }, // -> clearing 13
      { x: 58.4, y: 34.9 }, // -> clearing 12
      { x: 57.2, y: 40.7 }, // -> clearing 12
      { x: 50.1, y: 36.1 }, // -> clearing 12
      { x: 28.5, y: 32 }, // -> clearing 11
      { x: 36, y: 48.5 }, // -> clearing 15
      { x: 40.7, y: 50.8 }, // -> clearing 15
      { x: 42.2, y: 55.1 }, // -> clearing 15
      { x: 8.2, y: 55.7 }, // -> clearing 10
      { x: 11.6, y: 83.5 }, // -> clearing 4
      { x: 6.2, y: 86.8 }, // -> clearing 4
      { x: 35.9, y: 81.4 }, // -> clearing 9
      { x: 34.4, y: 76.1 }, // -> clearing 9
      { x: 50.6, y: 90.7 }, // -> clearing 8
      { x: 49.9, y: 86.7 }, // -> clearing 8
      { x: 83.3, y: 89.2 }, // -> clearing 3
      { x: 65.6, y: 66.4 }, // -> clearing 14
      { x: 61.6, y: 64.1 }, // -> clearing 14
      { x: 92.8, y: 63.8 }, // -> clearing 7
    ],
    landmarkSlots: [
      { x: 13.3, y: 8.1 }, // -> clearing 1
      { x: 46.6, y: 8.4 }, // -> clearing 5
      { x: 68.2, y: 12.6 }, // -> clearing 6
      { x: 94.1, y: 15.1 }, // -> clearing 2
      { x: 96.5, y: 67.1 }, // -> clearing 7
      { x: 78.9, y: 37.5 }, // -> clearing 13
      { x: 59.8, y: 31 }, // -> clearing 12
      { x: 33, y: 30.8 }, // -> clearing 11
      { x: 4.8, y: 50.3 }, // -> clearing 10
      { x: 5.8, y: 81.9 }, // -> clearing 4
      { x: 29.4, y: 73.1 }, // -> clearing 9
      { x: 42.6, y: 46.3 }, // -> clearing 15
      { x: 49.1, y: 81.4 }, // -> clearing 8
      { x: 70.9, y: 66.9 }, // -> clearing 14
      { x: 88.8, y: 89.2 }, // -> clearing 3
    ],
    adjacency: [
      [1, 5],
      [1, 10],
      [1, 11],
      [2, 6],
      [2, 7],
      [2, 13],
      [3, 7],
      [3, 8],
      [3, 14],
      [4, 9],
      [4, 10],
      [5, 6],
      [5, 12],
      [8, 9],
      [9, 15],
      [10, 15],
      [11, 12],
      [11, 15],
      [12, 13],
      [13, 14],
      [14, 15],
    ],
    // Per flood-eligible clearing: when a flood marker lands on this clearing,
    // the clearing is removed from the playable map. Original edges incident
    // to it are deleted, and the listed `through` pairs become new adjacencies.
    // Any original neighbor not appearing in a through-pair becomes a
    // "flooded path" — drawn for forest-separation purposes but grants no
    // adjacency (irrelevant to landmark placement).
    floodReshape: {
      6: { through: [[2, 5]] },
      8: { through: [[3, 9]] },
      10: { through: [[1, 4]] },
      11: { through: [[1, 15]] },
      13: { through: [[2, 14], [2, 12], [12, 14]] },
      14: { through: [[3, 15], [3, 13], [13, 15]] },
    },
    // Native landmarks at 5+p: per Law M.5.1, randomly pick 12 of 15 clearings
    // to be suited; the 3 leftover host Mousehold/Foxburrow/Rabbittown.
    // No `nativeLandmarkSlotCandidates` here — natives can land on any of the 15.
  },
  {
    id: "gorge",
    name: "Gorge",
    board: "Marsh / Gorge",
    expansion: "homeland",
    difficulty: 2,
    img: '/icons/maps/gorge.webp',
    description: "No new rules, but deep geographic chokepoints funnel all conflict into a few critical passages.",
    specialRules: null,
    factionNotes: {
      alliance: "Controlling chokepoints with sympathy tokens is highly effective here.",
      marquise: "Road networks through narrow passes give the Marquise strong positional control.",
      knaves: "Ambushing through chokepoints suits the Knaves' opportunistic style.",
    },
    hasPrintedSuits: false,
    requiresSuitRandomization: true,
    nativeLandmarks: [],
    hasFloodMarkers: false,
    floodMarkers: [],
    clearingCount: 12,
    clearings: [
      { id: 1, x: 8.7, y: 10.4, isCorner: true },
      { id: 2, x: 87.8, y: 22.3, onRiver: true, isCorner: true },
      { id: 3, x: 79.1, y: 89, isCorner: true },
      { id: 4, x: 20.3, y: 83.3, isCorner: true },
      { id: 5, x: 60.4, y: 7.6 },
      { id: 6, x: 87.3, y: 34.5 },
      { id: 7, x: 94.2, y: 58.9 },
      { id: 8, x: 52.6, y: 79.7, onRiver: true },
      { id: 9, x: 5.5, y: 61.8 },
      { id: 10, x: 16.6, y: 30.8, onRiver: true },
      { id: 11, x: 39.5, y: 32.6, onRiver: true },
      { id: 12, x: 45.1, y: 56.3 },
    ],
    ruins: [
      { x: 51.3, y: 37.9 }, // -> clearing 11
      { x: 75.4, y: 41.1 }, // -> clearing 6
      { x: 53.4, y: 64.2 }, // -> clearing 12
      { x: 17.9, y: 58.7 }, // -> clearing 9
    ],
    buildingSlots: [
      { x: 12.6, y: 15.6 }, // -> clearing 1
      { x: 60.8, y: 14.7 }, // -> clearing 5
      { x: 88.5, y: 16.4 }, // -> clearing 2
      { x: 83.4, y: 16.9 }, // -> clearing 2
      { x: 46.7, y: 31.5 }, // -> clearing 11
      { x: 51, y: 30 }, // -> clearing 11
      { x: 51.4, y: 37.8 }, // -> clearing 11
      { x: 75.3, y: 41.2 }, // -> clearing 6
      { x: 80.3, y: 37.5 }, // -> clearing 6
      { x: 21.5, y: 36.9 }, // -> clearing 10
      { x: 18.1, y: 41.9 }, // -> clearing 10
      { x: 17.8, y: 58.5 }, // -> clearing 9
      { x: 12.1, y: 61.8 }, // -> clearing 9
      { x: 16.3, y: 88.3 }, // -> clearing 4
      { x: 47.6, y: 86.4 }, // -> clearing 8
      { x: 46.9, y: 79.7 }, // -> clearing 8
      { x: 49.4, y: 61.6 }, // -> clearing 12
      { x: 52.7, y: 58.6 }, // -> clearing 12
      { x: 53.5, y: 64.1 }, // -> clearing 12
      { x: 71.4, y: 89.1 }, // -> clearing 3
      { x: 84.7, y: 60.8 }, // -> clearing 7
      { x: 88.3, y: 56.9 }, // -> clearing 7
    ],
    landmarkSlots: [
      { x: 16.9, y: 14.3 }, // -> clearing 1
      { x: 55.9, y: 16 }, // -> clearing 5
      { x: 93.7, y: 18.5 }, // -> clearing 2
      { x: 73.4, y: 35.3 }, // -> clearing 6
      { x: 44.5, y: 38.8 }, // -> clearing 11
      { x: 13.2, y: 40.6 }, // -> clearing 10
      { x: 11.8, y: 56.3 }, // -> clearing 9
      { x: 45.7, y: 65.1 }, // -> clearing 12
      { x: 90.1, y: 63.8 }, // -> clearing 7
      { x: 72, y: 84.5 }, // -> clearing 3
      { x: 41.6, y: 83.2 }, // -> clearing 8
      { x: 11, y: 87 }, // -> clearing 4
    ],
    adjacency: [
      [1, 5],
      [1, 10],
      [1, 11],
      [2, 5],
      [2, 6],
      [3, 7],
      [3, 8],
      [3, 12],
      [4, 8],
      [4, 9],
      [5, 6],
      [5, 11],
      [6, 7],
      [6, 10],
      [7, 9],
      [8, 9],
      [8, 12],
      [9, 10],
      [11, 12],
    ],
    floodEligibleClearings: [],
  },
];

export const MAP_MAP = Object.fromEntries(MAPS.map(m => [m.id, m]));

export const MAP_COLORS = {
  autumn:   { primary: '#C4621A', secondary: '#8B3A0A' },
  winter:   { primary: '#6AAFD4', secondary: '#2A6A9A' },
  mountain: { primary: '#7A7060', secondary: '#3A3028' },
  lake:     { primary: '#1A8FA0', secondary: '#0A4A60' },
  marsh:    { primary: '#6A9A30', secondary: '#2A5A18' },
  gorge:    { primary: '#B05A20', secondary: '#602010' },
};

// 12 clearing markers from the Root base game (4 each of fox/rabbit/mouse).
// Drawn without replacement to assign suits to a map's 12 clearings.
export const CLEARING_SUIT_POOL = Object.freeze([
  'fox', 'fox', 'fox', 'fox',
  'rabbit', 'rabbit', 'rabbit', 'rabbit',
  'mouse', 'mouse', 'mouse', 'mouse',
]);
