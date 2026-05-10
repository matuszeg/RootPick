import { describe, it, expect } from 'vitest';
import { getHirelingConflicts, HIRELING_SETS } from '../accessories.js';

const byId = id => HIRELING_SETS.find(h => h.id === id);

describe('getHirelingConflicts', () => {
  it('blocks Marquise hireling when Marquise faction is in play', () => {
    const conflicts = getHirelingConflicts(HIRELING_SETS, ['marquise']);
    const ids = conflicts.map(c => c.hireling.id);
    const marquiseHireling = HIRELING_SETS.find(h => h.associatedFactions.includes('marquise'));
    expect(ids).toContain(marquiseHireling.id);
  });

  it('expands bot factions to their human equivalent (Mech Marquise → Marquise hireling blocked)', () => {
    const conflicts = getHirelingConflicts(HIRELING_SETS, ['mech_marquise']);
    const ids = conflicts.map(c => c.hireling.id);
    const marquiseHireling = HIRELING_SETS.find(h => h.associatedFactions.includes('marquise'));
    expect(ids).toContain(marquiseHireling.id);
  });

  it('blocks The Exile/Brigand for Vagabond, Vagabond 2nd, Vagabot, and Knaves', () => {
    const exile = byId('the_exile');
    expect(exile).toBeDefined();
    for (const factionId of ['vagabond1', 'vagabond2', 'vagabot', 'knaves']) {
      const conflicts = getHirelingConflicts([exile], [factionId]);
      expect(
        conflicts.length,
        `expected the_exile to be blocked by ${factionId}`,
      ).toBe(1);
    }
  });

  it('does not block hirelings with no faction conflict', () => {
    const pb = byId('popular_band');
    expect(pb.associatedFactions).toEqual([]);
    const conflicts = getHirelingConflicts([pb], ['marquise', 'eyrie', 'alliance', 'vagabond1']);
    expect(conflicts.length).toBe(0);
  });

  it('accepts Set or Array of selected faction ids', () => {
    const exile = byId('the_exile');
    const fromArray = getHirelingConflicts([exile], ['knaves']);
    const fromSet = getHirelingConflicts([exile], new Set(['knaves']));
    expect(fromArray.length).toBe(1);
    expect(fromSet.length).toBe(1);
  });
});
