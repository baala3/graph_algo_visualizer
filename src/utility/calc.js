/**
 * Calculates the SVG path for a curved line between two points (x1,y1) and (x2,y2).
 * Creates a quadratic bezier curve with a control point perpendicular to the middle of the line.
 */
export const calculateCurve = (x1, y1, x2, y2) => {
  var mpx = (x2 + x1) * 0.5;
  var mpy = (y2 + y1) * 0.5;
  // angle of perpendicular to line:
  var theta = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2;
  // distance of control point from mid-point of line:
  var offset = 30;
  // location of control point:
  var c1x = mpx + offset * Math.cos(theta);
  var c1y = mpy + offset * Math.sin(theta);
  let directedPath = `M${x1} ${y1} Q${c1x} ${c1y} ${x2} ${y2}`;
  return directedPath;
};

/**
 * Calculates the position of the control point for a curved line between two points.
 * This is typically used for positioning text or other elements along the curve.
 */
export const calculateTextLoc = (x1, y1, x2, y2) => {
  var mpx = (x2 + x1) * 0.5;
  var mpy = (y2 + y1) * 0.5;
  // angle of perpendicular to line:
  var theta = Math.atan2(y2 - y1, x2 - x1) - Math.PI / 2;
  // distance of control point from mid-point of line:
  var offset = 30;
  // location of control point:
  var c1x = mpx + offset * Math.cos(theta);
  var c1y = mpy + offset * Math.sin(theta);
  return { c1x, c1y };
};

/**
 * Adjusts the end coordinates of an edge to stop at the boundary of the target node.
 * Prevents the edge from extending into the node by calculating coordinates that intersect
 * with the node's boundary (assumed to be 30 units from center).
 */
export const calculateAccurateCoords = (x1, y1, x2, y2) => {
  let distance = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  let d2 = distance - 30;
  let ratio = d2 / distance;
  let dx = (x2 - x1) * ratio;
  let dy = (y2 - y1) * ratio;
  let tempX = x1 + dx;
  let tempY = y1 + dy;
  return { tempX, tempY };
};

/**
 * Finds a node that intersects with a given point (x,y) within a radius of 30 units.
 * Used for touch-based interactions to determine which node is being targeted.
 */
export const findToNodeForTouchBasedDevices = (x, y, nodes) => {
  const r = 30;
  return nodes.find((node) => doesPointLieOnCircle(x, y, r, node.x, node.y));
};

/**
 * Determines if a point (pointX, pointY) lies within or on a circle defined by
 * center point (centerX, centerY) and radius. Returns true if the point is
 * within or on the circle's boundary.
 */
export const doesPointLieOnCircle = (
  centerX,
  centerY,
  radius,
  pointX,
  pointY
) => {
  const difference = Math.sqrt(
    Math.pow(centerX - pointX, 2) + Math.pow(centerY - pointY, 2)
  );
  return difference <= radius;
};
