// Legacy homepage sample content kept for reference. The current homepage
// loads the example documents directly from `src/content/examples-generated`.

export const heroYaml = `concepts:
  - name: "Memoization"
    id: "https://leetcode.com/concepts/cs/dsa/memoization"
    mastery: 0.68
    confidence: med
    last_seen: 2026-07-08
    trend: rising
    can:
      - "Writes a correct top-down memoized solution for standard problems"
    cannot_yet:
      - "Analyzes space tradeoffs of memoized vs tabulated solutions"
    misconceptions:
      - "Believes memoization always reduces time complexity to O(n)"
`;

export const heroPrompt = `CONCEPT: Memoization · mastery 0.68 med (2026-07-08)
MISCONCEPTION: believes memoization always reduces time complexity to O(n); probe and correct first
CAN: writes a correct top-down memoized solution for standard problems
CANNOT YET: analyzes space tradeoffs of memoized vs tabulated solutions
`;
