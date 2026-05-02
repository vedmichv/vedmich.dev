/**
 * SSR-time coordinate registry for VvStage + children.
 *
 * Model: module-level `currentStage` singleton. Set by VvStage.astro frontmatter
 * before it calls Astro.slots.render('default'); each VvNode/VvWire/VvPacket child
 * reads it via currentRegistry() to register its coords; VvStage pops the stage
 * before emitting SVG so wire paths can be computed from the collected data.
 *
 * Pitfall D runtime assertion: Astro 5 SSR is single-threaded per-request. If a
 * future Astro version parallelizes SSR within a request — or if a developer nests
 * <VvStage> inside another <VvStage> — pushStage throws immediately, surfacing the
 * issue instead of producing silently-wrong wire paths.
 *
 * Migration path if Astro 6+ ever breaks this assumption: swap the module-level
 * singleton for AsyncLocalStorage-keyed per-request scopes. Contracts stay stable.
 */

export interface NodeRecord {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WireRecord {
  id: string;
  from: string;
  to: string;
  curve?: number;
  via?: Array<[number, number]>;
  dashed?: boolean;
  tone?: string;
  delay?: number;
}

export interface Registry {
  uid: string;
  nodes: Map<string, NodeRecord>;
  wires: Map<string, WireRecord>;
  registerNode(n: NodeRecord): void;
  registerWire(w: WireRecord): void;
  getNode(id: string): NodeRecord | undefined;
  getWire(id: string): WireRecord | undefined;
}

export function createStageRegistry(): Registry {
  const uid = `s${Math.random().toString(36).slice(2, 10)}`;
  const nodes = new Map<string, NodeRecord>();
  const wires = new Map<string, WireRecord>();
  return {
    uid,
    nodes,
    wires,
    registerNode(n: NodeRecord) {
      if (nodes.has(n.id)) {
        console.warn(`<VvNode id="${n.id}"> — duplicate id; overwriting previous registration.`);
      }
      nodes.set(n.id, n);
    },
    registerWire(w: WireRecord) {
      if (wires.has(w.id)) {
        console.warn(`<VvWire id="${w.id}"> — duplicate id; overwriting previous registration.`);
      }
      wires.set(w.id, w);
    },
    getNode(id: string) {
      return nodes.get(id);
    },
    getWire(id: string) {
      return wires.get(id);
    },
  };
}

let currentStage: Registry | undefined;

export function pushStage(r: Registry): void {
  if (currentStage) {
    throw new Error(
      '<VvStage> — nested or concurrent stages detected. ' +
      'VvStage cannot be nested inside another VvStage. ' +
      'If you hit this in Astro 6+, the SSR model may have changed; ' +
      'switch to AsyncLocalStorage-based scoping in _vv-registry.ts.',
    );
  }
  currentStage = r;
}

export function popStage(): void {
  currentStage = undefined;
}

export function currentRegistry(): Registry {
  if (!currentStage) {
    throw new Error(
      '<VvNode>/<VvWire>/<VvPacket> must be inside a <VvStage>. ' +
      'Wrap your diagram children in <VvStage>...</VvStage>.',
    );
  }
  return currentStage;
}
