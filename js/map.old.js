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
var current_aY=0; //與正北的夾角


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
        var next_route_data= route_data[1];//console.log(route_data[1]);

        for(var i  in links){
            var link =links[i];
            console.log('link %s heading=%s',i,link.heading);
            console.log('current_aY=%s',current_aY);
            if (Math.abs(current_aY-link.heading)<5) {
                console.log('go:%s',i);
                var pops = panorama.getPov();
                pops.heading = link.heading;
                panorama.setPano(link.pano);
                map.panTo(link.location);
                break;
                
            } else {
            }
            //console.log(link);
        }
        //route_index++;
    });
    }

//導航
var next_point_lat=0;
var next_point_lon=0;
function autopilot () {
    var length = route_data.length;

    $('#map_canvas').bind('start.step',function(event,data) {
      console.log(data);  
      var x=data.start_lon;
      function start_step() {
          if (x>=data.end_lon) {
              return;
              
          } else {
                var y =data.m*(x-data.start_lon)+data.start_lat;
                console.log(x,y);
                x+=data.step;
                var loc = new google.maps.LatLng(y,x);
                var xL = Math.abs(data.start_lon-data.end_lon);
                var yL = Math.abs(data.start_lat-data.end_lat);
                var aX = Math.atan(yL/xL)* 180/Math.PI;
                var aY=aX+90;
                console.log('aY=%s',aY);
                sv.getPanoramaByLocation(loc, 2,function(data,status){
                    if (status == google.maps.StreetViewStatus.OK) {
                        //console.log()
                    //    console.log(data);
                        
                        var pov=panorama.getPov();
                        for(var i=0;i<data.links.length;i++){
                            if (Math.abs(data.links[i].heading -  aY)<5) {
                                current_aY=aY;
                                console.log('current_aY=%s,aY=%s',current_aY,aY);
                                //panorama.setPosition(loc);
                                var pov = panorama.getPov();
                                pov.heading = data.links[i].heading;
                                panorama.setPano(data.links[i].pano);
                                panorama.setPov(pov);
                                
                                break;
                            
                            }
                            
                        }
                    } else {
                    }
                    map.panTo(loc);
      //              setTimeout(start_step,2000);
                });
          }
      };

     start_step();

      //for(;x<=data.end_lon;x+=data.step){
          //console.log('m=%s,x=%s,y=%s',m,start_x,y);

      //}
    });


    function go(){
//         console.log('route_index=%s',route_index);
//         console.log('path_index=%s',path_index);
        if (route_index >=length) {
            
        } else {

            var position = route_data[route_index];
            if (path_index >= position.path.length) {
               path_index=0; 
               route_index++;
                    setTimeout(go,2000);
            } else {
                var path = position.path[path_index];
                var next_path=null;
                if (path_index<position.path.length-1) {
                    
                    next_path= position.path[path_index+1];
                } else {
                    next_path = route_data[route_index+1].path[0];
                }
                //算出方程式
                var m = (next_path.lat()-path.lat())/(next_path.lng()-path.lng());
                console.log('current x=%s,y=%s',path.lng(),path.lat());
                var step = 0.0001;
                 if (path.lng()-next_path.lng()>0) {
                     step = -1 * step; 
                     
                 } 
                 $('#map_canvas').trigger('start.step',{
                    start_lon:path.lng(),
                     end_lon: next_path.lng(),
                     m: m,
                     start_lat: path.lat(),
                     end_lat: next_path.lat(),
                     step:step
                 });
/*
                */

/*
                var loc = new google.maps.LatLng(path.lat(),path.lng());
                sv.getPanoramaByLocation(loc, 50,function(data,status){
                    if (status == google.maps.StreetViewStatus.OK) {
                        //console.log()
                        panorama.setPosition(loc);
                    //    console.log(data);
                     //   console.log(data.links[0].heading);
                        var pov=panorama.getPov();
                        pov.heading=data.links[0].heading;
                        panorama.setPov(pov);
                        map.setCenter(loc);
                    } else {
                    }
                    map.setCenter(loc);
                    last_point_lat=path.lat();
                    last_point_lon=path.lon();
                    path_index++;
                    setTimeout(go,2000);
                });
                */
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
