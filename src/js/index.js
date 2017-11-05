$(document).ready(() => {
  L.mapbox.accessToken =
    'pk.eyJ1Ijoia2V2aW5rYXNzaW1vIiwiYSI6ImNqOWxzN2thNTRrMW8zMm1xaW01djhwenoifQ.F91u9k2AW1IEX5dOV_lRpw';
  let geoMap = L.mapbox.map('geomap', 'mapbox.streets').setView([40, -74.5], 9);
  geoMap.featureLayer.on('click', function(e) {
    geoMap.panTo(e.layer.getLatLng());
  });

  $('#refresh').click(() => {
    for (let marker of markers) {
      geoMap.removeLayer(marker);
    }
    markers = [];
    fetchJSON();
  });

  let markers = [];

  let locationSelect = $('#location-select');

  locationSelect.change(function() {
    let selectedOption = $('option[value="' + this.value + '"]', this);
    selectedOption.attr('selected', true).siblings().removeAttr('selected');
    let mag = selectedOption.attr('data-mag');

    let posStr = locationSelect.val();

    //d3.select('#location-select').append("svg").style('color', 'blue').style('background-color', 'linear-gradient(left, black 50%, white 50%)').attr('width', '50px').attr('height', '100px');
    if (mag > 0) {
      d3
        .select('#magnitude')
        .style('width', String(Number(mag) / 10 * 100) + '%');
      d3
        .select('#magnitude')
        .select('span')
        .text('Mag: ' + mag.toString())
        .style('color', 'white');
    } else {
      d3.select('#magnitude').style('width', 0);
    }
    if (posStr === '' || posStr === undefined) {
      return;
    }
    geoMap.panTo(decodePosition(posStr).reverse()); // The Lat and Lang are REVERSED...
  });

  let dataBlock = d3.select('#data-block');

  let encodePosition = coords => `${coords[0]} ${coords[1]}`;
  let decodePosition = str => str.split(' ').map(e => Number(e));

  let updateData = data => {
    let updateMap = data => {
      locationSelect.empty().prop('enabled', true);
      locationSelect.append(
        '<option value="" disabled selected data-mag="0">SELECT HERE</option>'
      );
      for (let entry of data.features) {
        let layer = L.mapbox.featureLayer(entry).addTo(geoMap);
        markers.push(layer);
        let posStr = encodePosition(entry.geometry.coordinates);
        locationSelect.append(
          `<option value="${posStr}" data-mag="${entry.properties.mag}">${entry
            .properties.place} (${new Date(entry.properties.time)})</option>`
        );
      }
    };
    updateMap(data);
  };

  let fetchJSON = () => {
    fetch(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson'
    )
      .then(res => {
        return res.json();
      })
      .then(json => {
        updateData(json);
      });
  };

  fetchJSON();
});
