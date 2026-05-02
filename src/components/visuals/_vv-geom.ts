/**
 * Rectangle closest-edge geometry utilities for VvWire.
 *
 * Given two nodes (rectangles) on the VvStage SVG user-space canvas (1800×820 default),
 * compute the points on each rect's border where a straight line between centers would exit.
 * This keeps wires visually anchored to node edges instead of dangling at centers, even for
 * unequal node sizes.
 *
 * Invariant: `computeEdgePoints(A, B).a` lies on rect A's border; `.b` lies on rect B's border.
 * Complexity: O(1). No allocations on the hot path beyond the two returned Points.
 */

export interface Rect {
  cx: number;
  cy: number;
  w: number;
  h: number;
}

export interface Point {
  x: number;
  y: number;
}

/** Intersection of ray from rect center outwards (toward (dx, dy)) with rect border. */
function rayToRectEdge(rect: Rect, dx: number, dy: number): Point {
  if (dx === 0 && dy === 0) return { x: rect.cx, y: rect.cy };
  const halfW = rect.w / 2;
  const halfH = rect.h / 2;
  const tX = Math.abs(dx) > 1e-9 ? halfW / Math.abs(dx) : Infinity;
  const tY = Math.abs(dy) > 1e-9 ? halfH / Math.abs(dy) : Infinity;
  const t = Math.min(tX, tY);
  return { x: rect.cx + t * dx, y: rect.cy + t * dy };
}

/**
 * Returns the pair of border points (a on `from`, b on `to`) where a straight line
 * between the centers crosses each rectangle boundary.
 */
export function computeEdgePoints(from: Rect, to: Rect): { a: Point; b: Point } {
  const dx = to.cx - from.cx;
  const dy = to.cy - from.cy;
  const a = rayToRectEdge(from, dx, dy);   // exit point on `from`
  const b = rayToRectEdge(to, -dx, -dy);   // entry point on `to` (reverse ray direction)
  return { a, b };
}
