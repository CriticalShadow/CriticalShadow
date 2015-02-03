$(document).ready(function () {

  var global_lat, global_lon;
  var geocoder = new google.maps.Geocoder();
  var infowindow = new google.maps.InfoWindow({
    maxWidth: 100
  });
  var map;
  var pointCounter = 0;

  // GLOBAL DATA OBJECT TO BE SENT TO SERVER
  var data = {
    mapName: null,
    locations: [] // array of objects contains points. 
  };
  var markersObj = {};
  
  // function also in index.html. It exist here just incase we didn't grab latt&long there.
  function geoFindMe () {
    if (!navigator.geolocation){
      alert("Geolocation is not supported by your browser");
      return;
    }
    function success (position) {
      var latitude  = position.coords.latitude;
      var longitude = position.coords.longitude;
      //SET GLOBAL
      global_lat = latitude;
      global_lon = longitude;

      initialize();
    };
    function error () {
      alert("Can't find your location. Please adjust settings");
    };

    navigator.geolocation.getCurrentPosition(success, error);
  }

  // grab cookie, latt and long, from index.html
  function getCookie (cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
  }

  // resizing the entire map to fit all data points
  function setBounds () {
    var bounds = new google.maps.LatLngBounds();
    for( var key in markersObj ){
      bounds.extend(markersObj[key].getPosition());
    }
    map.fitBounds(bounds);
  }

  // used for grabbing title of address
  var nameParse = function (address) {
    console.log(address);
    var temp = address.split(',');
    return temp[0];
  }

  // renders google map
  function initialize () {
    var map_canvas = document.getElementById('map-canvas');
    var myLatlng = new google.maps.LatLng(global_lat, global_lon);
    var map_options = {
      center: myLatlng,
      zoom: 13, 
      mapTypeId: google.maps.MapTypeId.ROADMAP, 
      panControl: true,
        panControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP
      },
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE,
        position: google.maps.ControlPosition.RIGHT_TOP
      }
    }
    map = new google.maps.Map(map_canvas, map_options)
    
    //************** CLICK LISTENER ****************//
    google.maps.event.addListener(map, 'click', function (event) {
        var latitude = event.latLng.lat();
        var longitude = event.latLng.lng();
        codeLatLng(latitude, longitude, function (address_data) {
        // note: marker is added in codeLatLng()
          $('<div class="onePoint"><input class="form-control inputSize in_name' + pointCounter +'" value=\"'+ nameParse(address_data) +'\"+></input><a href="#"><img class="xButton" src="css/painted-x.png"></a>'+
            '<textarea placeholder="Enter location description here" class="form-control inputSize2 in_text' + pointCounter +'"></textarea><br><input type=hidden class="pointAddr' + pointCounter +'"value=\"'+address_data+'\"+></input><input type=hidden class="hiddenLat pointLat' + pointCounter +'"value='+latitude+'></input><input type=hidden class="hiddenLng pointLng' + pointCounter++ +'"value='+longitude+'></input></div>'
          ).hide().appendTo('.div_container').fadeIn();
        });
    });

  //************** SEARCH BAR FUNCTIONALITY ****************//
    var input = (document.getElementById('pac-input'));
    var searchBox = new google.maps.places.SearchBox(
      /** @type {HTMLInputElement} */(input));

    // [START region_getplaces]
    // Listen for the event fired when the user selects an item from the
    // pick list. Retrieve the matching places for that item.
    google.maps.event.addListener(searchBox, 'places_changed', function() {
      var places = searchBox.getPlaces();
      //grab input value inside function once address is submit.
      console.log("PLACES: "+ input.value);
      if (places.length == 0) {
        return;
      }

      for (var i = 0, place; place = places[i]; i++) {
        // Create a marker for each place.
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });
        infowindow.setContent(input.value);
        infowindow.open(map, marker);
        var lattLng = place.geometry.location.lat()+', '+place.geometry.location.lng();// d & k 
        //markersArray.push(marker);
        markersObj[lattLng] = marker;
        console.log(lattLng);
        setBounds();

      $('<div class="onePoint"><input class="form-control inputSize in_name' + pointCounter +'" value=\"'+ nameParse(input.value)+'\"+></input><a href="#"><img class="xButton" src="css/painted-x.png"></a>'+
        '<textarea placeholder="Enter location description here" class="inputSize2 form-control in_text' + pointCounter +'"></textarea><br><input type=hidden class="pointAddr' + pointCounter +'"value=\"'+input.value+'\"+></input><input type=hidden class="hiddenLat pointLat' + pointCounter +'"value='+place.geometry.location.lat()+'></input><input type=hidden class="hiddenLng pointLng' + pointCounter++ +'"value='+place.geometry.location.lng()+'></input></div>'
        ).hide().appendTo('.div_container').fadeIn();//note: pointCounter++ is so the next one with have +1 index.

        $('#pac-input').val(''); 
        input.value = '';
      }
    });

    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(map, 'bounds_changed', function() {
      var bounds = map.getBounds();
      searchBox.setBounds(bounds);
    });

  }

  // Google GeoCoder. Returns a physical address from latt and lng. 
  // Quotas: 5 per second and 2500 per day 
  function codeLatLng (latt, Lon, cb) {
    var lat = latt;
    var lng = Lon;
    var latlng = new google.maps.LatLng(lat, lng);

    geocoder.geocode({'latLng': latlng}, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          marker = new google.maps.Marker({
            position: latlng,
            map: map
          });
          markersObj[lat+', '+lng] = marker;
          infowindow.setContent(results[1].formatted_address);
          infowindow.open(map, marker);
          setBounds();  

          cb(results[1].formatted_address);
        } else {
          alert('No results found');
        }
      } else {
        alert('Geocoder failed due to: ' + status);
      }
    });
  }

    if(getCookie('latitude') && getCookie('longitude')){
      global_lat = parseFloat(getCookie('latitude'));
      global_lon = parseFloat(getCookie('longitude'));
      google.maps.event.addDomListener(window, 'load', initialize);
    } else{
      google.maps.event.addDomListener(window, 'load', geoFindMe);
    }

  // map title validity checker. 
  function submitform () {
    var f = document.getElementsByTagName('form')[0];
    if(f.checkValidity()) {
      return true;
    } else {
      return false;
    }
  }
  //*****************SUBMIT BUTTON*********************//
  $('.pushToServer').click(function () {
    if(submitform()){
    var points_length = $('.onePoint').length;
    for( var i = 0; i < points_length; i++ ){
      var pointObj = {};
      pointObj['name'] = $('.in_name'+i).val();
      pointObj['lat'] = $('.pointLat'+i).val();
      pointObj['lng'] = $('.pointLng'+i).val();
      pointObj['address'] = $('.pointAddr'+i).val();
      pointObj['desc'] = $('.in_text'+i).val();

      data.locations.push(pointObj);
    }
    data.mapName = $('#mapTit').val();

    $.ajax({
        type: "POST",
        url: '/createMaps',
        data: data,
        success: function (res) {
          swal({
            title: "Your map has been created!",   
            text: "You can now view your map",   
            type: "success",   
            showCancelButton: true,   
            confirmButtonColor: "#DD6B55",   
            confirmButtonText: "Yes, show me!",   
            cancelButtonText: "No, create a new map",   
            closeOnConfirm: false,   
            closeOnCancel: false }, 
            function (isConfirm) {   
              if (isConfirm) {     
                window.location = '/maps/' + res;  
              } else {     
                window.location = '/createMaps';  
              } 
            });
        },
        error: function () {
          swal("Whoops!", "Please submit again" , "error");
        }
    });
  } else {
    swal("Please Enter a Map Title", "Whoops", "warning");
  }
  });

  $(document).ready(function(){
 
 //*****************RESET BUTTON*********************//

 $('.resetMap').click(function () {
      var data = {
        mapName: null,
        locations: []
      };
      $('.onePoint').fadeOut(500, function() { $('.onePoint').remove(); });
      for( var key in markersObj ){
        markersObj[key].setMap(null);
      }
      markersObj = {};
      initialize();
    });

 //*****************X BUTTON*********************//

    $(document).on('click', 'img.xButton', function () {
      $(this).closest('.onePoint').fadeOut(500, function() { $(this).closest('.onePoint').remove(); });
      var lattLng = $(this).closest('.onePoint').find('input.hiddenLat').val() + ', '+ $(this).closest('.onePoint').find('input.hiddenLng').val();
      markersObj[lattLng].setMap(null);
    });
 });



});