var Express = require('express');

function exported(file:string) {

  var server = Express();

  server.get('/style.json', function(req, res) {
    res.sendFile(file);
  });

  server.get('/', function(req, res) {

    res.send(`
        <!doctype html>

        <html>

          <head>
            <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.10.0/mapbox-gl.js'></script>
            <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.10.0/mapbox-gl.css' rel='stylesheet' />
            <style>
                body { margin:0; padding:0; }
                #map { position:absolute; top:0; bottom:0; width:100%; }
            </style>
          </head>

          <body>
            <div id='map'></div>
            <script>
              mapboxgl.accessToken = 'pk.eyJ1IjoibHVjYXN3b2oiLCJhIjoiNWtUX3JhdyJ9.WtCTtw6n20XV2DwwJHkGqQ';
              var map = new mapboxgl.Map({
                container: 'map',
                style: 'style.json',
                center: [-74.50, 40],
                zoom: 9
              });
            </script>
          </body>

        </html>
    `);

  });

  return server;

}

export = exported;
