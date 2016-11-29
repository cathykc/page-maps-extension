function createInformationBox(x, y, origin, destination, direction_info) {
  $("body")
  .append($("<div>").addClass("extension-box")
    .append($("<div>").addClass("extension-box-summary")
      .append($("<div>").addClass("extension-box-address extension-box-destination"))
      .append($("<div>").addClass("extension-box-direction-summary")
        .append($("<div>").addClass("extension-box-travel-time"))
        .append($("<div>").addClass("extension-box-distance"))
      )
    )
    .append($("<div>").addClass("extension-box-map"))
    .append($("<div>").addClass("extension-box-footer"))
  );

  // $(".extension-box-origin").html("<span class='bold'>F: </span>" + origin);
  $(".extension-box-destination").html(destination);
  $(".extension-box-travel-time").html(direction_info["duration"]["text"]);
  $(".extension-box-distance").html(direction_info["distance"]["text"]);

  var x_scroll = $(window).scrollLeft();
  var y_scroll = $(window).scrollTop();

  var x_pos = x_scroll + x;
  var y_pos = y_scroll + y;

  var width = window.innerWidth;
  var height= window.innerHeight;

  // four quadrants
  if (x < (width-330)) {
    if (y < (height-280)) { // UL
      $(".extension-box").addClass("extension-ul");
      y_pos += 30;
    } else { // DL
      $(".extension-box").addClass("extension-dl");
      y_pos -= 300;
    }
    x_pos = x;
  } else {
    if (y < (height-280)) { // UR
      $(".extension-box").addClass("extension-ur");
      y_pos += 30;
    } else { // DR
      $(".extension-box").addClass("extension-dr");
      y_pos -= 300
    }
    x_pos -= 300;
  }

  $(".extension-box").css("left", x_pos).css("top", y_pos)

  var map_url = "https://www.google.com/maps/embed/v1/directions?key=" + 
  gmaps_embed_api_key +
  "&origin=" + 
  origin +
  "&destination=" +
  destination

  $(".extension-box-map")
  .append($("<iframe>")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("frameborder", "0")
    .attr("style", "border: 0")
    .attr("src", map_url)
  )
}

function deleteInformationBox() {
  $(".extension-box").remove();
}

function getDirectionInformation(origin, destination, x, y) {

  var request_url = "https://maps.googleapis.com/maps/api/directions/json?origin=" + 
  origin + 
  "&destination=" +
  destination +
  "&key=" +
  gmaps_directions_api_key

  $.get(request_url, function(data) {
    if (data["status"] == "OK") {
      createInformationBox(x, y, origin, destination, data["routes"][0]["legs"][0]);
    } else {
      deleteInformationBox();
    }
    
  });
}

function isValidAddress(address, x, y) {

  var request_url = "https://maps.googleapis.com/maps/api/geocode/json?address=" +
  address +
  "&key=" +
  gmaps_geocoding_api_key;

  $.get(request_url, function(data) {
    if (data["status"] == "OK") {

      

      chrome.storage.sync.get('origin', function(result) {

        var origin_address = "1 College Hall Philadelphia PA, 19104";
        var sync_origin = result.origin;
        if (sync_origin && sync_origin.length) {
          origin_address = sync_origin;
        }

        // if multiple pick the one closest to you ? - allow user to pick from multiple?
        getDirectionInformation(
          origin_address,
          data["results"][0]["formatted_address"],
          x,
          y
        );
      });

      
    } else {
      deleteInformationBox();
    }
  });
}


$(document).ready(function() {

  $("body").mouseup(function() {

    var highlight;
    var range;

    if (window.getSelection) {
      highlight = window.getSelection().toString();
      range = window.getSelection().getRangeAt(0);
    } else if (document.selection && document.selection.type != "Control") {
      highlight = document.selection.createRange().text;
      range = document.selection.getRangeAt(0);
    }
    console.log(highlight);
    console.log(highlight.split(" ").length > 1);
    if (highlight.length && (highlight.split(" ").length > 1)) {
      var position = range.getBoundingClientRect();
      isValidAddress(highlight, position.left, position.top);
    } else {
      deleteInformationBox();
    }
  });

});