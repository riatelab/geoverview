# geoverview.js

![npm](https://img.shields.io/npm/v/geoverview)
![license](https://img.shields.io/badge/license-MIT-success)

Based on [maplibre-gl](https://maplibre.org/), **geoverview** is a tool for giving a quick and easy geographic **overview** of any **geo**json (and the information it contains). Geoverview is particularly suitable for working within [Observable](https://observablehq.com/@neocartocnrs/geoverview).

![](./img/geoverview.png)

## How to use?

It is very simple, geoverview contains only one function. In Observable, it is used in the following way. You need 3 cells:

```js
// Loading geoverview
view = require("geoverview@latest").then((f) => f.view)
```

```js
// add a geojson (or topojson) file
data = FileAttachment("something.geojson").json()
```

```js
// add a geojson (or topojson) file
view(data)
```

Automatically, the map and your geojson will be displayed. So simple...

## Options

