// ****************************************************************
// view() is the main function. It returns the map to be displayed.
// ****************************************************************

// css

const css = "https://unpkg.com/maplibre-gl@2.1.9/dist/maplibre-gl.css";
document.head.innerHTML += `<link type="text/css" rel="stylesheet" href=${css}>`;
const style = `<style>
.mapboxgl-popup-content{overflow-y:scroll;max-height:250px;max-width:300px;padding:10px;border:black;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:gray;}
.mapboxgl-popup-contenttd{padding:3px;font-size:11px;font-family:Arial,Helvetica,sans-serif;color:#85817e;vertical-align:middle;}
.rounded-rect{background:white;border-radius:10px;box-shadow:0050px-25pxblack;}
.flex-center{position:absolute;display:flex;justify-content:center;align-items:center;}
.flex-center.left{left:0px;}.sidebar-content{position:absolute;width:95%;height:535px;font-family:Arial,Helvetica,sans-serif;font-size:17px;color:gray;}
.sidebar-contenttd{padding:3px;font-size:11px;font-family:Arial,Helvetica,sans-serif;color:#85817e;vertical-align:middle;}
.tt{height:320px;display:block;overflow-y:scroll;}
.sidebar-toggle{position:absolute;width:2em;height:2.3em;overflow:visible;display:flex;justify-content:center;align-items:center;overflow:hidden;}
.sidebar-toggle.left{right:-1.5em;}.sidebar-toggle:hover{color:#0aa1cf;cursor:pointer;}
.sidebar{transition:transform 1s;z-index:1;width:300px;height:100%;}
.left.collapsed{transform:translateX(-295px);}
</style>`;
document.head.innerHTML += style;

// imports

import turfbbox from "@turf/bbox";
import turfarea from "@turf/area";
import turflength from "@turf/length";
import maplibregl from "maplibre-gl";

// helpers

import { info } from "./info.js";
import { figuration } from "./figuration.js";
import { topo2geo } from "./topo2geo.js";

export function* view(geojson, options = {}) {
  if (geojson) {
    const geojson_raw = geojson;
    geojson = topo2geo(geojson);
    const width = options.width ?? 1000;
    const col = options.col ?? "#be82c2";
    const height = options.height ?? 550;
    const radius = options.radius ?? 5;
    const fillOpacity = options.fillOpacity ?? 0.5;
    const colOver = options.colOver ?? "#ffd505";
    const lineWidth = options.lineWidth;

    geojson.features.map((d, i) => (d.id = i + 1));
    let hovereId = null;

    // bbox

    const fig = figuration(geojson);
    const turfbb = turfbbox(geojson);
    const bb = [
      [turfbb[0], turfbb[1]],
      [turfbb[2], turfbb[3]],
    ];

    // fields

    let result = [];
    const attr = geojson.features.map((d) => d.properties);
    attr.forEach((d) => result.push(Object.keys(d).length));
    const keys = Object.keys(attr[result.indexOf(Math.max(...result))]);

    // map container

    let container = document.createElement("div");
    container.setAttribute("style", `width:${width}px;height:${height}px`);
    container.innerHTML = `<div id="left" class="sidebar flex-center left collapsed">
    <div class="sidebar-content rounded-rect flex-center">
    ${info(geojson_raw)}
    <div class="sidebar-toggle rounded-rect left">&rarr;</div>
    </div></div></div>`;

    yield container;
    const map = (container.value = new maplibregl.Map({
      container,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      scrollZoom: true,
      bounds: bb,
      attributionControl: false,
    }));

    map.on("load", function () {
      map.addSource("mygeojson", {
        type: "geojson",
        data: geojson,
      });

      // If polygons

      if (fig[0] == "z") {
        map.addLayer({
          id: "mygeojson",
          type: "fill",
          source: "mygeojson",
          paint: {
            "fill-color": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              colOver,
              col,
            ],
            "fill-opacity": fillOpacity,
          },
        });

        map.addLayer({
          id: "mygeojson-stroke",
          type: "line",
          source: "mygeojson",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": col,
            "line-width": lineWidth ?? 1,
          },
        });
      }

      // If lines

      if (fig[0] == "l") {
        map.addLayer({
          id: "mygeojson",
          type: "line",
          source: "mygeojson",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              colOver,
              col,
            ],
            "line-width": lineWidth ?? 3,
          },
        });
      }

      // If points

      if (fig[0] == "p") {
        map.addLayer({
          id: "mygeojson",
          type: "circle",
          source: "mygeojson",
          paint: {
            "circle-color": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              colOver,
              col,
            ],
            "circle-stroke-color": col,
            "circle-opacity": fillOpacity,
            "circle-stroke-width": lineWidth ?? 1,
            "circle-radius": radius,
          },
        });
      }

      // Popup

      map.on("click", "mygeojson", function (e) {
        let type = e.features[0].geometry.type;
        let r = "";
        r += "Geometries";
        r += "<table>";
        r += "<tr><td><b>Type</b></td><td>" + type + "</td></tr>";

        if (type == "Point") {
          r +=
            "<tr><td><b>Latitude</b></td><td>" +
            e.features[0].geometry.coordinates[1] +
            "</td></tr>";
          r +=
            "<tr><td><b>Longitude</b></td><td>" +
            e.features[0].geometry.coordinates[0] +
            "</td></tr>";
        }

        if (type == "MultiPolygon") {
          r +=
            "<tr><td><b>Nb of polygons</b></td><td>" +
            e.features[0].geometry.coordinates.length +
            "</td></tr>";
        }

        if (type == "MultiLineString") {
          r +=
            "<tr><td><b>Nb of lines</b></td><td>" +
            e.features[0].geometry.coordinates.length +
            "</td></tr>";
        }

        if (type == "MultiPoint") {
          r +=
            "<tr><td><b>Nb of points</b></td><td>" +
            e.features[0].geometry.coordinates.length +
            "</td></tr>";
        }

        if (type != "Point") {
          const bb = turfbbox(e.features[0]);
          r +=
            "<tr><td><b>Longitude min</b></td><td>" +
            Math.round(bb[0] * 100) / 100 +
            "</td></tr>";
          r +=
            "<tr><td><b>Longitude max</b></td><td>" +
            Math.round(bb[2] * 100) / 100 +
            "</td></tr>";
          r +=
            "<tr><td><b>Latitude min</b></td><td>" +
            Math.round(bb[1] * 100) / 100 +
            "</td></tr>";
          r +=
            "<tr><td><b>Latitude max</b></td><td>" +
            Math.round(bb[3] * 100) / 100 +
            "</td></tr>";
        }

        if (type.indexOf("Polygon") != -1) {
          r +=
            "<tr><td><b>Computed area</b></td><td>" +
            Math.round(turfarea(e.features[0].geometry) / 10000) / 100 +
            " km²" +
            "</td></tr>";
        }

        if (type.indexOf("LineString") != -1) {
          r +=
            "<tr><td><b>Computed length</b></td><td>" +
            Math.round(turflength(e.features[0].geometry) * 100) / 100 +
            " km" +
            "</td></tr>";
        }

        r += "</table>";
        r += "Attribute data";
        r += "<table>";
        keys.forEach(
          (d) =>
            (r +=
              "<tr><td><b>" +
              d +
              "</b></td><td>" +
              e.features[0].properties[d] +
              "</td></tr>")
        );
        r += "</table>";
        new maplibregl.Popup({
          closeOnClick: true,
          closeOnMove: true,
        })
          .setLngLat(e.lngLat)
          .setHTML(r)
          .addTo(map);
      });

      // Pointer

      map.on("mouseenter", "mygeojson", function () {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "mygeojson", function () {
        map.getCanvas().style.cursor = "";
      });

      // fit bounds

      map.fitBounds(bb, {
        padding: { top: 15, bottom: 15, left: 15, right: 15 },
      });

      // end onload
    });

    // Over Effect

    map.on("mousemove", "mygeojson", function (e) {
      if (e.features.length > 0) {
        if (hovereId) {
          map.setFeatureState(
            { source: "mygeojson", id: hovereId },
            { hover: false }
          );
        }
        hovereId = e.features[0].id;
        map.setFeatureState(
          { source: "mygeojson", id: hovereId },
          { hover: true }
        );
      }
    });

    map.on("mouseleave", "mygeojson", function () {
      if (hovereId) {
        map.setFeatureState(
          { source: "mygeojson", id: hovereId },
          { hover: false }
        );
      }
      hovereId = null;
    });

    // Toogle Slider

    function toggleSidebar(id) {
      var elem = document.getElementById(id);
      var classes = elem.className.split(" ");
      var collapsed = classes.indexOf("collapsed") !== -1;

      var padding = {};

      if (collapsed) {
        classes.splice(classes.indexOf("collapsed"), 1);

        padding[id] = 300;
        map.easeTo({
          padding: padding,
          duration: 1000,
        });
      } else {
        padding[id] = 0;
        classes.push("collapsed");

        map.easeTo({
          padding: padding,
          duration: 1000,
        });
      }

      elem.className = classes.join(" ");
    }

    let slide = document.querySelector(".left");
    slide.addEventListener("click", function () {
      toggleSidebar("left");
    });

    // fullScreen & navigation

    map.addControl(new maplibregl.FullscreenControl());
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(
      new maplibregl.AttributionControl({
        customAttribution: `Made with <a href ="https://github.com/neocarto/geoverview" target="_blank">geoverview.js</a>`,
        compact: false,
      })
    );
  }
}
