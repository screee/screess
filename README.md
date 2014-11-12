# ScreeSS

ScreeSS is a high level stylesheet language that compiles down to a [Mapbox GL style object](https://www.mapbox.com/mapbox-gl-style-spec/). It features a clean CSS-like syntax and powerful macro system.

## Writing a ScreeSS Stylesheet

Create a layer called "water"
```
#water { }
```

Set the layer's source.

```
#water {
  $source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
}
```

Properties beginning with a `$`, called "meta-properties", configure the layer itself. Use the `$type` meta-property to set the layer's rendering type to one of `fill`, `line`, `symbol`, `raster`, `fill`.

```
#water {
  $source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  $type: fill

}
```

Add filters to the layer.

```
#water {
  $source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  $type: fill
  $filter: is polygon && @area > 1000

}
```

Properties of the object being filtered or styled are prefixed with an `@`, as in `@area` above. Supported operators in filters are

 - comparison operators (`==`, `!=`, `>`, `<`, `>=`, `<=`)
 - typechecking operator (`is line`, `is polygon`, `is point`)
 - boolean logic operators (`&&`, `||`, `!`)

Supported meta-properties, as documented in the [Mapbox GL style spec](https://www.mapbox.com/mapbox-gl-style-spec/), are

 - `$source`
 - `$minzoom`
 - `$maxzoom`
 - `$interactive`
 - `$filter`

Style the layer with paint properties. Available paint properties depend on the layer `$type` and documented in the [Mapbox GL style spec](https://www.mapbox.com/mapbox-gl-style-spec/)

```
#water {
  $source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  $type: fill
  $filter: is polygon && @area > 1000

  fill-color: #2491dd
}
```

### Value Macros

Values may be reused by assigning them to value macros

```
water = #2491dd

#water {
  $source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  $type: fill
  $filter: is polygon && @area > 1000

  fill-color: water
}
```

Value macros may take any number of arguments and invoke other value macros

```
water(depth) = darken(#2491dd, depth)

#water {
  $source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  $type: fill
  $filter: is polygon && @area > 1000

  fill-color: water(0.5)
}
```

Arguments to value macros may be optional

```
water(depth=0) = darken(#2491dd, depth)

#water {
  $source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  $type: fill
  $filter: is polygon && @area > 1000

  fill-color: water
}
```

Arguments to value macros may be referred to by their name

```
water(depth=0) = darken(#2491dd, depth)

#water {
  $source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  $type: fill
  $filter: is polygon && @area > 1000

  fill-color: water(depth: 0.5)
}
```

### Property Macros

Sets of properties may be reused by assigning them to a property macro
```
fill-water(depth) {
  color = darken(#2491dd, depth)

  fill-color: color
  fill-antialias: true
  fill-outline-color: darken(color, 0.1)
}

#water {
  $source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  $type: fill
  $filter: is polygon && @area > 1000

  fill-water: 0
}
```