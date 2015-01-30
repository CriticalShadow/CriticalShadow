angular.module('activemap', ['ngAnimate', 'ngFx'])
  .controller('ActiveMapController', function ($scope, ActiveMap) {
    angular.extend($scope, ActiveMap);

    $scope.places = { type: 'FeatureCollection', features: [] };

    $scope.getMap = function (guid) {
      $scope.fetch(guid).then(function (mapData) {
        // This is just some basic scaffolding for all of the data that is required to render a map.
        $scope.locations = mapData.locations;
        $scope.mapName = mapData.mapName;
      });
    };

    $scope.createCoordinates = function () {
      $scope.locations.forEach(function (locationData) {
        $scope.places.features.push({ geometry: { type: "Point", coordinates: [locationData.lng, locationData.lat]},
          properties: { id: locationData.name, zoom: 14 }, type: 'Feature' });
      });
      $scope.map = L.mapbox.map('map', 'nlokare.l114oiif', { zoomControl: false });
      $scope.placesLayer = L.mapbox.featureLayer($scope.places).addTo($scope.map);
    };
  })
  .factory('ActiveMap', function ($http) {
    var activeMap = {};

    activeMap.fetch = function (guid) {
      return $http({
        method: 'GET',
        url: '/api/guid'
      }).then(function (res) {
        return res.data;
      });
    };

    return activeMap;
  });
