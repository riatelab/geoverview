// ******************************************************************
// info() build a html table giving global information on the dataset
// ******************************************************************

import { figuration } from "./figuration.js";
import { topo2geo } from "./topo2geo.js";
import turfbbox  from "@turf/bbox";

export function info(geojson){
    const type = geojson.type;
    geojson = topo2geo(geojson);
  
    let result = [];
    const attr = geojson.features.map((d) => d.properties);
    attr.forEach((d) => result.push(Object.keys(d).length));
    const keys = Object.keys(attr[result.indexOf(Math.max(...result))]);
  
   let pct = [];
    keys.forEach((k) =>
      pct.push([
        k,
        geojson.features
          .map((d) => d.properties[k])
          .filter((d) => d != NaN)
          .filter((d) => d != "")
          .filter((d) => d != null)
          .filter((d) => d != undefined).length
      ])
    );
  
   pct = new Map(pct);
  
    const nbfeat = geojson.features.length;
    const fig = figuration(geojson)[1];
  
    let r = "<div class= 'leftable'>";
    r += "Geometries in brief";
    r += "<table>";
    r += "<tr><td><b>Type</b></td><td>" + type + "</td></tr>";
    r += "<tr><td><b>Features</b></td><td>" + fig + "</td></tr>";
    r +=
      "<tr><td width='100' ><b>Count</b></td><td width='140' >" +
      nbfeat +
      "</td></tr>";
    r +=
      "<tr><td><b>Bounding box</b></td><td>" +
      turfbbox(geojson)
        .map((d) => Math.round(d * 100) / 100)
        .join(", ") +
      "</td></tr>";
    r += "</table>";
    r += "Attribute data (completeness)";
    r += "<table class = 'tt'>";
    keys.forEach(
      (d) =>
        (r +=
          "<tr><td width='100'><b>" +
          d +
          "</b></td><td width='140'><div style = 'background:#F1F1F1;  white-space: nowrap; width:" +
          (130 * pct.get(d)) / geojson.features.length +
          "px'>" +
          pct.get(d) +
          "<span style='font-size:70%'> /" +
          geojson.features.length +
          "</span></div>" +
          "</td></tr>")
    );
  
    r += "</table></div> ";
  
    return r;

  }