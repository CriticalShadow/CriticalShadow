var narrative = document.getElementById('narrative');
var sections = narrative.getElementsByTagName('section');
var currentId = '';

var setId = function (newId) {
  // If the ID hasn't actually changed, don't do anything
  if (newId === currentId) {
    return;
  }
  // Otherwise, iterate through layers, setting the current
  // marker to a different color and zooming to it.
  placesLayer.eachLayer(function (layer) {
    if (layer.feature.properties.id === newId) {
      map.setView(layer.getLatLng(), layer.feature.properties.zoom || 16);
      layer.setIcon(L.mapbox.marker.icon({
        'marker-color': '#FF2249',
        'marker-size': 'large',
        'marker-symbol': 'college'
      }));
    } else {
      layer.setIcon(L.mapbox.marker.icon({
        'marker-color': '#404040',
        'marker-size': 'large',
        'marker-symbol': 'college'
      }));
    }
  });
  // highlight the current section
  for (var i = 0; i < sections.length; i++) {
    if (sections[i].id === newId) {
      sections[i].className = 'active'
    } else {
      sections[i].className = '';
    }
  }
  currentId = newId;
};

setId('cover');

var onScroll = _.debounce(function (e) {
  var narrativeHeight = narrative.offsetHeight;
  var newId = currentId;
  // Find the section that's currently scrolled-to.
  // We iterate backwards here so that we find the topmost one.
  for (var i = sections.length - 1; i >= 0; i--) {
    var rect = sections[i].getBoundingClientRect();
    if (rect.top >= 0 && rect.top <= narrativeHeight) {
      newId = sections[i].id;
    }
  };
  setId(newId);
}, 50);

narrative.onscroll = onScroll;