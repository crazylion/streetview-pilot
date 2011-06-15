  var directionDisplay;
  var directionsService = new google.maps.DirectionsService();
  var map;
  var start_location='士林,台北';
  var start_pos = new google.maps.LatLng(25.08342000000000,121.5170200000000);
  var end_location='台北車站,台北';

  var route_data;
  var route_index=0;
  var current_heading=0;
  var directions_data=null;


    function auto_run (links) {
    }

//導航
  function calcRoute() {
    var start =  start_location;
    var end =  end_location;
    var request = {
        origin:start, 
        destination:end,
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
        route_data=response;
        console.log(response);
        setTimeout(function(){
            map.setZoom(19);
            map.setCenter(response.routes[0].legs[0].start_location);
        },2000);
      }
    });
  }


  function initialize() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var mapOptions = {
      center: start_pos,
      zoom: 19,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(
        document.getElementById("map_canvas"), mapOptions);
    var panoramaOptions = {
      position: start_pos,
      pov: {
        heading: 34,
        pitch: 10,
        zoom: 1
      }
    };
    calcRoute();
    //var panorama = new  google.maps.StreetViewPanorama(document.getElementById("pano"),panoramaOptions);
    //map.setStreetView(panorama);
    var i=0.001;
   var lat=42.345573;
   var lng= -71.098326;

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("directionsPanel"));


//  google.maps.event.addListener(panorama, 'links_changed', function() {        
//       var links =  panorama.getLinks();
// console.log(links);
//   });
  }
