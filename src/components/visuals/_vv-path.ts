/**
 * SVG path builder for VvWire — composes straight / bezier / polyline paths
 * anchored on rectangle edge-points.
 *
 * Precedence (documented in README.md): via > curve > straight.
 *   - If `via` is a non-empty array → polyline (M → L*via → L end), curve ignored.
 *   - Else if `curve` > 0 → bezier quadratic with a control point perpendicular to the midpoint.
 *   - Else → straight line.
 *
 * Endpoints are always computed via `computeEdgePoints` — authors pass raw node coords,
 * geometry handles border math.
 */
import { type Rect, type Point, computeEdgePoints } from './_vv-geom.ts';
import type { WireRecord } from './_vv-registry.ts';

export function computeWirePath(
  from: Rect,
  to: Rect,
  opts: Pick<WireRecord, 'curve' | 'via'>,
): string {
  const { a, b } = computeEdgePoints(from, to);

  // Case 1: polyline waypoints — via dominates curve
  if (opts.via && opts.via.length > 0) {
    const segments: string[] = [`M ${a.x} ${a.y}`];
    for (const [x, y] of opts.via) {
      segments.push(`L ${x} ${y}`);
    }
    segments.push(`L ${b.x} ${b.y}`);
    return segments.join(' ');
  }

  // Case 2: bezier curve (quadratic, control point perpendicular to midpoint)
  if (opts.curve && opts.curve > 0) {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const perpX = -dy / len;
    const perpY = dx / len;
    const offset = opts.curve * len * 0.5;
    const cx = mx + perpX * offset;
    const cy = my + perpY * offset;
    return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
  }

  // Case 3: straight line (default)
  return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
}
