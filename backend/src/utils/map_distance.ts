function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters

  const a = lat1 * Math.PI / 180;
  const b = lat2 * Math.PI / 180;
  const c = (lat2 - lat1) * Math.PI / 180;
  const d = (lon2 - lon1) * Math.PI / 180;

  const r =
    Math.sin(c / 2) ** 2 +
    Math.cos(a) * Math.cos(b) *
    Math.sin(d / 2) ** 2;

  const e = 2 * Math.atan2(Math.sqrt(r), Math.sqrt(1 - r));

  return R * e;
}
