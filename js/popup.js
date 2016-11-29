var autocomplete;

function sendOriginAddress() {
  var origin = $("#origin-address").val()

  chrome.storage.sync.set({'origin': origin}, function() {
    // ?
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
