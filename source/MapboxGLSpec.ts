var MapboxGLSpec = {

  background: {
    layout: [],
    paint: [
      'background-color',
      'background-image',
      'background-opacity'
    ]
  },

  fill: {
    layout: [],
    paint: [
      'fill-antialias',
      'fill-opacity',
      'fill-color',
      'fill-outline-color',
      'fill-translate',
      'fill-translate-anchor',
      'fill-image'
    ]
  },

  line: {
    layout: [
      'line-cap',
      'line-join',
      'line-miter-limit',
      'line-round-limit'
    ],
    paint: [
      'line-opacity',
      'line-color',
      'line-translate',
      'line-translate-anchor',
      'line-width',
      'line-gap-width',
      'line-blur',
      'line-dasharray',
      'line-image'
    ]
  },

  symbol: {
    layout: [
      'symbol-placement',
      'symbol-min-distance',
      'symbol-avoid-edges',
      'icon-allow-overlap',
      'icon-ignore-placement',
      'icon-optional',
      'icon-rotation-alignment',
      'icon-max-size',
      'icon-image',
      'icon-rotate',
      'icon-padding',
      'icon-keep-upright',
      'icon-offset',
      'text-rotation-alignment',
      'text-field',
      'text-font',
      'text-max-size',
      'text-max-width',
      'text-line-height',
      'text-letter-spacing',
      'text-justify',
      'text-anchor',
      'text-max-angle',
      'text-rotate',
      'text-padding',
      'text-keep-upright',
      'text-transform',
      'text-offset',
      'text-allow-overlap',
      'text-ignore-placement',
      'text-optional'
    ],
    paint: [
      'icon-opacity',
      'icon-size',
      'icon-color',
      'icon-halo-color',
      'icon-halo-width',
      'icon-halo-blur',
      'icon-translate',
      'icon-translate-anchor',
      'text-opacity',
      'text-size',
      'text-color',
      'text-halo-color',
      'text-halo-width',
      'text-halo-blur',
      'text-translate',
      'text-translate-anchor'
    ]
  },

  raster: {
    layout: [
      'raster-size',
      'raster-blur'
    ],
    paint: [
      'raster-opacity',
      'raster-hue-rotate',
      'raster-brightness',
      'raster-saturation',
      'raster-contrast',
      'raster-fade-duration'
    ]
  }

};

export = MapboxGLSpec;