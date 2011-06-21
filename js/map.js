if(typeof console === "undefined") {
    console = { log: function() { } };
}
  var start_pos;
  var start_location='台北車站';
  var end_location ='日本';
  var directionsService = new google.maps.DirectionsService();
  var streetviewService = new google.maps.StreetViewService();
  var route_data;
  var route_index=0; //現在跑到第幾個階段
  var path_index=0; //route裡面還有path 這邊用來記錄path的index
  var panorama = null;
  var is_setup_streetview=false;
  var is_running = false;  //設定是否有在跑，因為 links_changed 事件如果在沒有location的地方不會觸發
  var is_links_change=false;
  var current_aY=0; //與正北的夾角
  var interval=2000;

  var $img_url_list = $('#img_url_list');
  var end_position_lat=0; //用來記錄終點的經緯度資料，因為有時候終點不見得在路的最後一點
  var end_position_lon=0;
  var end_position = null;


  var drive_type = google.maps.DirectionsTravelMode.DRIVING;
  var is_highway = true;

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
          is_links_change = true;
          console.log('link changed');
          var links =  panorama.getLinks();
           var is_found=false;
          for(var i  in links){
              var link =links[i];
              console.log('link %s heading=%s',i,link.heading);
              console.log('current_aY=%s',current_aY);
              if (Math.abs(current_aY-link.heading)<5) {
                  console.log('go:%s',i);
                  is_found=true;
                console.log('current position=%s,%s End location=%s,%s',panorama.getPosition().lat(),panorama.getPosition().lng(),route_data[route_index].end_location.lat(),route_data[route_index].end_location.lng());
                  if (Math.abs(panorama.getPosition().lat() - end_position.lat() ) < 0.001 && 
                      Math.abs(panorama.getPosition().lng() - end_position.lat() ) < 0.001
                      ) {
                      console.log('The End');
                      return;
                  } else {

                      setTimeout(function() {

                          var pops = panorama.getPov();
                          pops.heading = link.heading;
                          panorama.setPano(link.pano);
                          map.panTo(panorama.getPosition());
                          $img_url_list.append("http://cbk0.googleapis.com/cbk?output=tile&panoid="+link.pano+"&zoom=4&x=6&y=3&cb_client=apiv3&fover=2&onerr=3&v=4\n")
                      },interval);
                      break;
                  }

              } else {
              }
              //console.log(link);
          }
          //都沒找到
          if (!is_found) {
              is_links_change = false;
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
    console.log('route_index=%s,route_length=%s,path_index=%s',route_index,route_data.length,path_index);
    if (route_index >=route_data.length) {
        console.log('End');
        is_running=false;

    } else {
        $('tr[jsinstance='+route_index+']').css('background-color','#333');
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
            if (isNaN(aY)) {
                aY=180;
            }
            current_aY=aY;

            if (panorama) {
                console.log('current position=%s,%s End location=%s,%s',panorama.getPosition().lat(),panorama.getPosition().lng(),route_data[route_index].end_location.lat(),route_data[route_index].end_location.lng());
            
            }

            if ( panorama && panorama.getPosition() == route_data[route_index].end_location) {
                console.log('The End');
                return ;
            }
            end_position = route_data[route_index].end_location;


            if (!is_setup_streetview) { 
                setupStreetView(new google.maps.LatLng(path.lat(),path.lng())); 
            }else{
                //改變位置
                console.log('set position:%s,%s',path.lat(),path.lng());
                streetviewService.getPanoramaByLocation(new google.maps.LatLng(path.lat(),path.lng()),49,function(data,status) {
                    if (status!= google.maps.StreetViewStatus.OK) {
                       path_index+=1;
                       pilot();
                    } else {
                        panorama.setPosition(new google.maps.LatLng(path.lat(),path.lng()));
                    }
                    
                });
                
            }

        }
    }
}

//開始導航
function autopilot () {
    is_running = true;
    pilot();

}

//計算路線
function calcRoute(){

    var start =  start_location;
    var end =  end_location;
    var request = {
        origin:start, 
        destination:end,
        avoidHighways: is_highway,
        travelMode:  drive_type
    };
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            route_data=response.routes[0].legs[0].steps;
//             console.log(route_data);
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
    var lat=42.345573;
    var lng= -71.098326;



}

$(document).ready(function() {
    directionsDisplay = new google.maps.DirectionsRenderer();
    var mapOptions = {
        center: start_pos,
        zoom: 19,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(
            document.getElementById("map_canvas"), mapOptions);
    var lat=42.345573;
    var lng= -71.098326;

    $('#run').click(function() {
        start_location=$('#from_pos').val();
        end_location =$('#to_pos').val();
        interval = parseInt($('#sec').val());
        var highway = $('#is_highway').val();
        if (highway=='1') {
           is_highway=true; 
        } else {
           is_highway=false; 
        }

        var drive = $('#drive_type').val();
        if (drive=='DRIVING') {
           drive_type= google.maps.DirectionsTravelMode.DRIVING; 
        }else if(drive=='BICYCLING'){
           drive_type= google.maps.DirectionsTravelMode.BICYCLING; 
        } 
        else {
           drive_type= google.maps.DirectionsTravelMode.WALKING; 
        }

//         interval=500;
        calcRoute();
        directionsDisplay.setMap(map);
        directionsDisplay.setPanel(document.getElementById("directionsPanel"));
        
    });
});
