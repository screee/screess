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
  source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
}
```

Set the layer's type.

```
#water {
  source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
  )
  type: fill
}
```

You can add filters to the layer using a very natural syntax 

```
#water {
  source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  type: fill
  filter: is polygon && @area > 1000

}
```

Properties of the object being filtered or styled are prefixed with an `@`, as in `@area` above. Supported operators in filters are

 - comparison operators (`==`, `!=`, `>`, `<`, `>=`, `<=`)
 - typechecking operator (`is line`, `is polygon`, `is point`)
 - boolean logic operators (`&&`, `||`, `!`)

Don't worry about top-level vs layout vs paint properties -- they will be differentiated automatically by the compiler.

Style the layer with paint properties. Available paint properties depend on the layer `type` and documented in the [Mapbox GL style spec](https://www.mapbox.com/mapbox-gl-style-spec/)

```
#water {
  source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  type: fill
  filter: is polygon && @area > 1000
  fill-color: #2491dd
}
```

Operators work almost everywhere! Order of operations should work as expected.

```
#water {
  source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  type: fill
  filter: is polygon && @area > 1000
  fill-color: #2491dd
  fill-translate: ((5 + 2) / 17) 3 * 5
}
```

Function values are created using the special `funciton` value macro

```
#water {
  source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  type: fill
  filter: is polygon && @area > 1000
  fill-color: function(0:#2491dd, 10:#196499)
  fill-translate: ((5 + 2) / 17) 3 * 5
}
```

You may create `if` blocks and `for` blocks in your stylesheet to factor out structure. The below example also demonstrates using map objects. 

```
lake-types = [
  small: [area-min: 0 area-max: 1000 color: #2491dd]
  medium: [area-min: 1000 area-max: 10000 color: #1d73b0]
  large: [area-min: 10000 area-max: null color: #196499]
]

for lake-type in lake-types {
  # {
    source: source(
      type: vector
      url: "mapbox://mapbox.mapbox-streets-v5"
      layer: "water"
    )
    type: fill
    filter: @area > lake-type.area-min && (lake-type.area-max == null || @area <= area-max)
    fill-color: lake-type.color
  }
}
```

### Value Macros

Values may be reused by assigning them to value macros

```
color-water = #2491dd

#water {
  source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  type: fill
  filter: is polygon && @area > 1000
  fill-color: color-water
}
```

Value macros may take any number of arguments and invoke other value macros

```
color-water(depth) = darken(#2491dd, depth)

#water {
  source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  type: fill
  filter: is polygon && @area > 1000
  fill-color: color-water(0.5)
}
```

Arguments to value macros may be optional

```
color-water(depth = 0) = darken(#2491dd, depth)

#water {
  source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  type: fill
  filter: is polygon && @area > 1000
  fill-color: color-water
}
```

Arguments to value macros may be either named or positional, a la Python.

```
color-water(depth = 0) = darken(#2491dd, depth)

#water {
  source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  type: fill
  filter: is polygon && @area > 1000
  fill-color: color-water(depth: 0.5)
}
```

Built-in macros include

 - `source(...)`
 - `hsv(h, s, v)`
 - `hsva(h, s, v, a)`
 - `hsl(h, s, l)`
 - `hsla(h, s, l, a)`
 - `rgb(r, g, b)`
 - `rgba(r, g, b, a)`
 - `function(base, ...)`
 - `range(start, stop, step = 1)`

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
  source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  type: fill
  filter: is polygon && @area > 1000
  fill-water: 0
}
```

You may have argument-less property macros
```
fill-water {
  color = #2491dd
  fill-color: color
  fill-antialias: true
  fill-outline-color: darken(color, 0.1)
}

#water {
  source: source(
    type: vector
    url: "mapbox://mapbox.mapbox-streets-v5"
    layer: "water"
  )
  type: fill
  filter: is polygon && @area > 1000
  fill-water
}
```
