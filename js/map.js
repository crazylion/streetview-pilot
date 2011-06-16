if(typeof console === "undefined") {
    console = { log: function() { } };
}
  

var directionDisplay;
  var directionsService = new google.maps.DirectionsService();
  var map;
  var start_location='台北車站';
  //var start_pos = new google.maps.LatLng(25.08342000000000,121.5170200000000);
  var start_pos;
  var end_location='日本';

  var route_data;
  var route_index=0;
  var path_index=0; //route裡面還有path 這邊用來記錄path的index
  var current_heading=0;
  var directions_data=null;
var sv = new google.maps.StreetViewService();
var panorama = null;
var all_route_data=[];//所有的路線資料，先跑過一次記錄
    function auto_run (links) {
    }


    function setupStreetView (start) {
    var panoramaOptions = {
      position: start,
      pov: {
        heading: 34,
        pitch: 10,
        zoom: 1
      }
    };
    panorama = new  google.maps.StreetViewPanorama(document.getElementById("pano"),panoramaOptions);
    map.setStreetView(panorama);
    google.maps.event.addListener(panorama, 'links_changed', function() {        
        var links =  panorama.getLinks();
       //console.log(panorama); 
        //計算角度
        var current_position = panorama.getPosition();
        var current_route_data= route_data[0];//console.log(route_data[0]);
        var next_route_data= route_data[1];console.log(route_data[1]);

        for(var i  in links){
            var link =links[i];
            console.log(link);
        }
        //route_index++;
    });
    }

//導航
function autopilot () {
    var length = route_data.length;

    function go(){
        console.log('route_index=%s',route_index);
        console.log('path_index=%s',path_index);
        if (route_index >=length) {
            
        } else {

            var position = route_data[route_index];
            if (path_index >= position.path.length) {
               path_index=0; 
               route_index++;
                    setTimeout(go,2000);
            } else {
                var path = position.path[path_index];
                var loc = new google.maps.LatLng(path.lat(),path.lng());
                sv.getPanoramaByLocation(loc, 50,function(data,status){
                    if (status == google.maps.StreetViewStatus.OK) {
                        //console.log()
                        panorama.setPosition(loc);
                        console.log(data);
                        console.log(data.links[0].heading);
                        var pov=panorama.getPov();
                        pov.heading=data.links[0].heading;
                        panorama.setPov(pov);
                        map.setCenter(loc);
                    } else {
                    }
                    path_index++;
                    setTimeout(go,2000);
                });
            }
        }
    }

    go();
        
        
}

//計算路線
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
            route_data=response.routes[0].legs[0].steps;
        //    console.log(response);
            start_pos = response.routes[0].legs[0].start_location;
            setupStreetView(start_pos);
            setTimeout(function(){
                map.setZoom(19);
                map.setCenter(response.routes[0].legs[0].start_location);
                autopilot();
            },1000);
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
    calcRoute();
    var i=0.001;
    var lat=42.345573;
    var lng= -71.098326;

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("directionsPanel"));


}
