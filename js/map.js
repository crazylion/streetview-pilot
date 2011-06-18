if(typeof console === "undefined") {
    console = { log: function() { } };
}
  var start_pos;
  var start_location='台北車站';
  var end_location ='日本';
  var directionsService = new google.maps.DirectionsService();
  var route_data;
  var route_index=0; //現在跑到第幾個階段
  var path_index=0; //route裡面還有path 這邊用來記錄path的index
  var panorama = null;
  var is_setup_streetview=false;
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
           var is_found=false;
          for(var i  in links){
              var link =links[i];
              console.log('link %s heading=%s',i,link.heading);
              console.log('current_aY=%s',current_aY);
              if (Math.abs(current_aY-link.heading)<5) {
                  console.log('go:%s',i);
                  is_found=true;
                  setTimeout(function() {
                      
                      var pops = panorama.getPov();
                      pops.heading = link.heading;
                      panorama.setPano(link.pano);
                      map.panTo(panorama.getPosition());
                  },2000);
                  break;

              } else {
              }
              //console.log(link);
          }
          //都沒找到
          if (!is_found) {
              console.log('not found');
              //下一條 path
              path_index+=1;
              pilot();
              
          
          }

      });
      is_setup_streetview=true;
  }

//用來一直跑的主函式
function pilot(){
    console.log('route_index=%s,path_index=%s',route_index,path_index);
    if (route_index >=route_data.length) {

    } else {

        var position = route_data[route_index];
        if (path_index >= position.path.length) {
            path_index=0; 
            route_index++;
            setTimeout(pilot,2000);
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
            //算出夾角
            var m = (next_path.lat()-path.lat())/(next_path.lng()-path.lng());
            var xL = Math.abs(path.lng()-next_path.lng());
            var yL = Math.abs(path.lat()-next_path.lat());
            var aX = Math.atan(yL/xL)* 180/Math.PI;
            var aY=aX+90;
            current_aY=aY;

            if (!is_setup_streetview) { 
                setupStreetView(new google.maps.LatLng(path.lat(),path.lng())); 
            }else{
                //改變位置
                panorama.setPosition(new google.maps.LatLng(path.lat(),path.lng()));
            }

        }
    }
}

//開始導航
function autopilot () {

    pilot();

}

//計算路線
function calcRoute(){

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
    var lat=42.345573;
    var lng= -71.098326;

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("directionsPanel"));


}
