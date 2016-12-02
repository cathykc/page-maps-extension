var autocomplete;

function sendOriginAddress() {
  var origin = $("#origin-address").val();

  var request_url = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
  origin +
  "&key=AIzaSyB5Fd0hKCJCOMC0Htkd0MA9zFQx0gYxeqI";

  $.get(request_url, function(data) {
    if (data["status"] == "OK") {
      chrome.storage.sync.set({
        'origin': data["results"][0]["formatted_address"],
        'origin-lat': data["results"][0]["geometry"]["location"]["lat"],
        'origin-lng': data["results"][0]["geometry"]["location"]["lng"]
      }, function() {
        // ?
      });
    }
  });
}

function initAutocomplete() {
  autocomplete = new google.maps.places.Autocomplete(
    (document.getElementById("origin-address")),
    {types: ['geocode']}
  );

  autocomplete.addListener('place_changed', sendOriginAddress);
}

function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}

$(document).ready(function() {

  initAutocomplete();

  chrome.storage.sync.get('origin', function(result) {
    var origin_address = result.origin;
    if (origin_address && origin_address.length) {
      $("#origin-address").val(origin_address);
    }
  });

  $("#origin-address").focus(function() {
    geolocate();
  });
});
