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
  var current_heading=0;
  var directions_data=null;
var sv = new google.maps.StreetViewService();
var panorama = null;

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
        if(route_index>=length){
            //clearTimeout(handle);
            //handle=null;
            return ;
        }else{
        
            var position = route_data[route_index];
            /*
            for(var i=0;i<position.path.length;i++){
                console.log(i); 
                var center =new google.maps.LatLng(position.path[i].lat(),position.path[i].lng());
                sv.getPanoramaByLocation(center, 50,function(data,status){
                    if (status == google.maps.StreetViewStatus.OK) {
                        panorama.setPosition(data.location.latLng); 
                        panorama.setPov(panorama.getPov());
                    } else {
                    }

                });
            }
            */
            var center =new google.maps.LatLng(position.start_location.lat(),position.start_location.lng());
            panorama.setPosition(center); 
            panorama.setPov(panorama.getPov());
            map.setCenter(center); 
            route_index++;
            setTimeout(go,2500);        
        }
    }

    go();
    /*
       var handle=setInterval(function() {
       if(route_index>=length){
       clearInterval(handle);
       length=null;
            return ;
        }
        var position = route_data[route_index];
        console.log(position);
        //一段一段來
        for(var i=0;i<position.path.length;i++){
           console.log(i); 
            var center =new google.maps.LatLng(position.path[i].lat(),position.path[i].lng());
            sv.getPanoramaByLocation(center, 50,function(data,status){
                if (status == google.maps.StreetViewStatus.OK) {
                    panorama.setPosition(data.location.latLng); 
                } else {
                }

                map.setCenter(new google.maps.LatLng(position.start_location.lat(),position.start_location.lng())); 
            });
        }

        
        route_index++;
        console.log(route_index);
        
    },2000);
    */
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
