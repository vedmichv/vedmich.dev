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

export type VvTone = 'teal' | 'amber' | 'k8s' | 'architecture' | 'opinion' | 'tutorial';
export type VvNodeAnimation = 'slide-x' | 'pop' | 'drop';

export interface NodeRecord {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tone: VvTone;
  animation: VvNodeAnimation;
  delay: number;       // milliseconds
  iconHtml: string;    // rendered default-slot output; empty string if slot absent
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

export interface PacketRecord {
  id: string;
  wire?: string;
  path?: string;
  duration: string;    // SMIL time value e.g. '1.4s'
  delay: string;       // SMIL time value e.g. '1.2s'
  r: number;
  glow: boolean;
  tone: VvTone;
  loop: boolean;
  gap: string;         // SMIL time value e.g. '4s'
}

export interface Registry {
  uid: string;
  nodes: Map<string, NodeRecord>;
  wires: Map<string, WireRecord>;
  packets: Map<string, PacketRecord>;
  registerNode(n: NodeRecord): void;
  registerWire(w: WireRecord): void;
  registerPacket(p: PacketRecord): void;
  getNode(id: string): NodeRecord | undefined;
  getWire(id: string): WireRecord | undefined;
  getPacket(id: string): PacketRecord | undefined;
}

export function createStageRegistry(): Registry {
  const uid = `s${Math.random().toString(36).slice(2, 10)}`;
  const nodes = new Map<string, NodeRecord>();
  const wires = new Map<string, WireRecord>();
  const packets = new Map<string, PacketRecord>();
  return {
    uid,
    nodes,
    wires,
    packets,
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
    registerPacket(p: PacketRecord) {
      if (packets.has(p.id)) {
        console.warn(`<VvPacket id="${p.id}"> — duplicate id; overwriting previous registration.`);
      }
      packets.set(p.id, p);
    },
    getNode(id: string) {
      return nodes.get(id);
    },
    getWire(id: string) {
      return wires.get(id);
    },
    getPacket(id: string) {
      return packets.get(id);
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
