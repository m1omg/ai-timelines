import type { Effect, FamilyId, GameState } from './types';
import { FAMILY_IDS, RESOURCE_KEYS } from './types';

/** Resources are all held on a nominal 0..100 scale; capability and understanding may exceed it. */
const SOFT_CAPS: Partial<Record<(typeof RESOURCE_KEYS)[number], number>> = {
  influence: 60,
  attention: 100,
  credibility: 100,
  deployment: 100,
  exposure: 100,
  capability: 400,
  understanding: 300,
};

function clampResource(state: GameState, key: (typeof RESOURCE_KEYS)[number]): void {
  const cap = SOFT_CAPS[key] ?? Infinity;
  state.resources[key] = Math.max(0, Math.min(cap, state.resources[key]));
}

/** Talent is a share of one pool: raising one family lowers the others proportionally. */
export function normaliseTalent(state: GameState): void {
  let total = 0;
  for (const f of FAMILY_IDS) {
    state.families[f].talent = Math.max(0.001, state.families[f].talent);
    total += state.families[f].talent;
  }
  for (const f of FAMILY_IDS) {
    state.families[f].talent /= total;
  }
}

export function applyEffect(state: GameState, e: Effect): void {
  switch (e.kind) {
    case 'flag': {
      if (e.op === 'set') {
        state.flags[e.flag] = e.value;
      } else {
        const cur = state.flags[e.flag];
        const base = typeof cur === 'number' ? cur : 0;
        const add = typeof e.value === 'number' ? e.value : 1;
        state.flags[e.flag] = base + add;
      }
      break;
    }

    case 'resource': {
      const cur = state.resources[e.key];
      state.resources[e.key] = e.op === 'add' ? cur + e.value : e.op === 'mul' ? cur * e.value : e.value;
      clampResource(state, e.key);
      break;
    }

    case 'patron': {
      const cur = state.patrons[e.patron];
      const next = e.op === 'add' ? cur + e.value : e.op === 'mul' ? cur * e.value : e.value;
      state.patrons[e.patron] = Math.max(0, Math.min(100, next));
      break;
    }

    case 'compute': {
      state.computeLog = e.op === 'add' ? state.computeLog + e.value : state.computeLog * e.value;
      break;
    }

    case 'family': {
      const f = state.families[e.family];
      const cur = f[e.field];
      const next = e.op === 'add' ? cur + e.value : cur * e.value;
      if (e.field === 'talent') {
        f.talent = Math.max(0.001, next);
        normaliseTalent(state);
      } else if (e.field === 'insight') {
        f.insight = Math.max(0, next);
      } else {
        f.momentum = Math.max(-50, Math.min(100, next));
      }
      break;
    }

    case 'paradigm': {
      const p = state.paradigms[e.id];
      if (!p) break;
      switch (e.op) {
        case 'unlock':
          if (p.status === 'locked') p.status = 'available';
          break;
        case 'progress':
          if (p.status === 'locked' || p.status === 'available') p.status = 'active';
          if (p.status !== 'mature') p.progress += e.value ?? 0;
          break;
        case 'mature':
          if (p.status !== 'mature') {
            p.status = 'mature';
            p.maturedYear = state.year;
            if (!p.driver) p.driver = 'player';
          }
          break;
        case 'emphasis':
          p.emphasis = Math.max(0, e.value ?? 1);
          if (p.status === 'available' && p.emphasis > 1) p.status = 'active';
          break;
        case 'dormant':
          if (p.status === 'active') p.status = 'dormant';
          break;
      }
      break;
    }

    case 'character': {
      const ch = state.characters[e.id];
      if (!ch) break;
      ch.affinity = Math.max(-100, Math.min(100, e.op === 'add' ? ch.affinity + e.value : e.value));
      break;
    }

    case 'characterActive': {
      const ch = state.characters[e.id];
      if (ch) ch.active = e.value;
      break;
    }

    case 'actor': {
      const a = state.actors[e.id];
      if (!a) break;
      const cur = a[e.field];
      const next = e.op === 'add' ? cur + e.value : e.value;
      a[e.field] = e.field === 'stance' ? Math.max(-1, Math.min(1, next)) : Math.max(0, Math.min(1, next));
      break;
    }

    case 'log':
      state.log.push({ year: state.year, text: e.text, kind: e.logKind ?? 'event' });
      break;

    case 'ending':
      state.ending = e.id;
      break;
  }
}

export function applyEffects(state: GameState, es: Effect[] | undefined): void {
  if (!es) return;
  for (const e of es) applyEffect(state, e);
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

export const addRes = (key: Extract<Effect, { kind: 'resource' }>['key'], value: number): Effect => ({
  kind: 'resource',
  key,
  op: 'add',
  value,
});

export const setFlag = (flag: string, value: boolean | number | string = true): Effect => ({
  kind: 'flag',
  flag,
  op: 'set',
  value,
});

export const bumpFlag = (flag: string, value = 1): Effect => ({ kind: 'flag', flag, op: 'add', value });

export const insight = (family: FamilyId, value: number): Effect => ({
  kind: 'family',
  family,
  field: 'insight',
  op: 'add',
  value,
});

export const momentum = (family: FamilyId, value: number): Effect => ({
  kind: 'family',
  family,
  field: 'momentum',
  op: 'add',
  value,
});

export const talent = (family: FamilyId, value: number): Effect => ({
  kind: 'family',
  family,
  field: 'talent',
  op: 'add',
  value,
});

export const push = (id: string, value: number): Effect => ({ kind: 'paradigm', id, op: 'progress', value });

export const like = (id: string, value: number): Effect => ({
  kind: 'character',
  id,
  field: 'affinity',
  op: 'add',
  value,
});

export const note = (text: string, logKind: Extract<Effect, { kind: 'log' }>['logKind'] = 'event'): Effect => ({
  kind: 'log',
  text,
  logKind,
});
