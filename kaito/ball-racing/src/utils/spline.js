import * as THREE from 'three';

// Catmull-Rom spline through points
export function createCatmullRomSpline(points, closed = true, segments = 100) {
  const vectors = points.map(p => new THREE.Vector3(p.x, p.y, p.z));
  const curve = new THREE.CatmullRomCurve3(vectors, closed, 'catmullrom', 0.5);
  return {
    curve,
    getPoint: (t) => curve.getPoint(t),
    getTangent: (t) => curve.getTangent(t),
    getLength: () => curve.getLength(),
    getPointAtDistance: (d) => curve.getPointAt(d / curve.getLength()),
    getSegments: (count) => {
      const pts = [];
      for (let i = 0; i <= count; i++) {
        pts.push(curve.getPoint(i / count));
      }
      return pts;
    }
  };
}

// Get closest point on spline to a given position
export function getClosestPointOnSpline(spline, position, samples = 100) {
  let minDist = Infinity;
  let closestT = 0;
  
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const pt = spline.getPoint(t);
    const dist = position.distanceTo(pt);
    if (dist < minDist) {
      minDist = dist;
      closestT = t;
    }
  }
  
  return { t: closestT, point: spline.getPoint(closestT), distance: minDist };
}

// Look-ahead point on spline
export function getLookAheadPoint(spline, currentT, distance) {
  const totalLength = spline.getLength();
  const targetDist = (currentT * totalLength + distance) % totalLength;
  const targetT = targetDist / totalLength;
  return spline.getPoint(targetT);
}
