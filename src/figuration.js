// ************************************************************
// figuration() check if the geometry is point, linear or zonal
// ************************************************************

export function figuration(geojson) {
  let figuration = ["z", "l", "p"];
  let types = geojson.features.map((d) => d.geometry.type);
  types = Array.from(new Set(types));
  let poly =
    types.indexOf("Polygon") !== -1 || types.indexOf("MultiPolygon") !== -1
      ? figuration[0]
      : "";
  let line =
    types.indexOf("LineString") !== -1 ||
    types.indexOf("MultiLineString") !== -1
      ? figuration[1]
      : "";
  let point =
    types.indexOf("Point") !== -1 || types.indexOf("MultiPoint") !== -1
      ? figuration[2]
      : "";
  let tmp = poly + line + point;
  let result = tmp.length == 1 ? tmp : "c";
  return [result, types.sort().join(", ")];
}
