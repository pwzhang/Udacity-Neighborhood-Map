var map;
var streetViewImage;
var streetViewUrl = "https://maps.googleapis.com/maps/api/streetview?size=180x90&location=";
var infowindow;
// Model
var markers = ko.observableArray([
  {
    title: "Boston Common",
    lat: 42.3540563,
    lng: -71.0667111,
    streetAddress: "139 Tremont St",
    cityAddress: "Boston, MA 02111",
    visible: ko.observable(true),
    boolTest: true
  },
  {
    title: "Fenway Park",
    lat: 42.3466764,
    lng: -71.0994065,
    streetAddress: "4 Yawkey Way",
    cityAddress: "Boston, MA 02215",
    visible: ko.observable(true),
    boolTest: true
  },
  {
    title: "Whole Food Market",
    lat: 42.347033,
    lng: -71.1190714,
    streetAddress: "1028 Beacon St",
    cityAddress: "Brookline, MA 02446",
    visible: ko.observable(true),
    boolTest: true
  },
  {
    title: "Star Market",
    lat: 42.3470938,
    lng: -71.1191573,
    streetAddress: "33 Kilmarnock St",
    cityAddress: "Boston, MA 02215",
    visible: ko.observable(true),
    boolTest: true
  },
  {
    title: "The Wilbur",
    lat: 42.3508002,
    lng: -71.066986,
    streetAddress: "246 Tremont St",
    cityAddress: "Boston, MA 02116",
    visible: ko.observable(true),
    boolTest: true
    },

]);
// View
// google callback function
function initMap(){
    map = new google.maps.Map(document.getElementById("map"), {
    zoom: 13,
    center: {lat: 42.3586626, lng: -71.1020217}
  });
    setAllMap();
}
function mapError(){
  window.alart('google map cannot be loaded!');
}
//set markers with the data in Model
function setAllMap() {
  //create new google marker object
  for (var i = 0; i < markers().length; i++) {
      markers()[i].holdMarker = new google.maps.Marker({
      position: new google.maps.LatLng(markers()[i].lat, markers()[i].lng),
      map: map,
      animation: google.maps.Animation.DROP,
      title: markers()[i].title
      });
      // set conten string
      markers()[i].contentString = "<img src = '"+ getStreetView(i) +
                                "' + alt = 'Street view'><p><strong>" +
                                markers()[i].title + "</strong></p><br><p>" +
                                markers()[i].streetAddress + "<br>" +
                                markers()[i].cityAddress + "<br></p>";
      // set the info window with each marker's content
      infowindow = new google.maps.InfoWindow();
      // add event listener to the markers to open the info window
      new google.maps.event.addListener(markers()[i].holdMarker, "click",
      (function(marker, i) {
          return function() {
            infowindow.setContent(marker.contentString);
            infowindow.open(map,this);
            marker.holdMarker.setAnimation(google.maps.Animation.BOUNCE);
          setTimeout(function(){
            marker.holdMarker.setAnimation(null);
          }, 1450)
      };
    })(markers()[i], i));
  };
};
// get the google street view source
function getStreetView(i){
  return streetViewImage = streetViewUrl +
                markers()[i].streetAddress + "," + markers()[i].cityAddress +
                "&fov=75&heading='5'&pitch=10";
};






// View Model

var viewModel = function(){
  var self = this;

  // copy markers to view Model
  this.markers = ko.observableArray();
  this.markers(markers());
  // add click event to place list
  this.openInfoWindow = function(data){
    infowindow.setContent(data.contentString);
    infowindow.open(map, data.holdMarker);
    data.holdMarker.setAnimation(google.maps.Animation.BOUNCE);
    var windowWidth = $(window).width();
            if(windowWidth <= 1080) {
                map.setZoom(14);
            } else if(windowWidth > 1080) {
                map.setZoom(16)};
    map.setCenter({lat: data.lat, lng: data.lng})
    setTimeout(function(){
      data.holdMarker.setAnimation(null);
    }, 1450)
  };

  // filter the name of place
  this.query = ko.observable("");
  this.filterName = ko.dependentObservable(function(){
    var search = self.query().toLowerCase();
    return ko.utils.arrayForEach(self.markers(), function(marker) {
      if (marker.title.toLowerCase().indexOf(search) >= 0) {
        marker.holdMarker.setVisible(true);
              return marker.visible(true);
      } else {
        marker.holdMarker.setVisible(false);
              return marker.visible(false);
      }
    });
  });
  // reset the map
  this.resetMap = function() {
      var windowWidth = $(window).width();
      map.setCenter({lat: 42.3586626, lng: -71.1020217})
      if(windowWidth <= 1080) {
          map.setZoom(13);
       } else if(windowWidth > 1080) {
          map.setZoom(14);
       }
  };
  this.closeInfoWindow = function(){
    for(var i =0; i < self.markers().length; i++){
      infowindow.close();
    };
  };
  this.totalReset = function() {
    self.closeInfoWindow();
    self.resetMap();
  }
  $(window).resize(function() {
        self.resetMap();
    });

  // show or hide the search nav
  this.showOfBar = ko.observable(true);
  this.toggleBar = function(){
    return this.showOfBar(!this.showOfBar());
  }

  // get weather api
  var weatherUrl = "http://api.openweathermap.org/data/2.5/weather?q=Boston,MA"+
  "&APPID=9f4e38bd4ae0460219226b9be45eae99";
  $.getJSON(weatherUrl, function(data){
    var temp = Math.round(data.main.temp-273.15);
    var iconId = data.weather[0].icon;
    $(".forecast-detail table").append("<tr><td></td>"+
                               "<td><strong> Boston weather </strong></td>"+
                               "<td></td></tr>");
    $(".forecast-detail table").append("<tr><td>" +
                                   "<img src = 'http://openweathermap.org/img/w/"+
                                   iconId+".png' alt = 'weather icon'></td>"+
                                   "<td>" + data.weather[0].description +"</td>"+
                                   "<td>"+ temp +"˚C</td></tr>");
  })
  .fail(function(){
        $(".forecast-detail").append('<p style="text-align: center;">Sorry! Weather'+
         '</p><p style="text-align: center;">Could Not Be Loaded</p>');
    });

  this.showForecast = ko.observable(false);
  this.toggleForecast = function(){
    return this.showForecast(!this.showForecast());
  }


};

ko.applyBindings(new viewModel);
