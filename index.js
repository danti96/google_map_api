let map;
let places;
let infoWindow;
let autocomplete;
let geocoder;
let markers = [];
let placeResultsSearch = [];
const SEARCH_CODE_DEFAULT = "60618";
const SEARCH_NAME = ["Credit union"];
const SEARCH_RADIUS = "10000";
const SEARCH_TYPE = ["Credit union"];
const REGION = "us";
const countryRestrict = { country: REGION };
const hostnameRegexp = new RegExp("^https?://.+?/");

let markerIcon = {};

function initMap() {
  geocoder = new google.maps.Geocoder();

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    mapTypeControl: false,
    panControl: false,
    zoomControl: false,
    streetViewControl: false,
    center: { lat: 38.8949877, lng: -77.0412077 },
  });

  infoWindow = new google.maps.InfoWindow({
    content: document.getElementById("info-content"),
  });

  places = new google.maps.places.PlacesService(map);

  markerIcon = {
    url: "star.png",
    size: new google.maps.Size(71, 71),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 25),
  };

  codeAddress();

  // get current Location
  const findMyState = () => {
    document.getElementById("found-number").style.display = "none";
    const success = (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      geocoder.geocode({ location: { lat, lng } }, function (results, status) {
        if (status == "OK") {
          let region = getCountry(results);
          if (region.toLocaleUpperCase() == REGION.toLocaleUpperCase()) {
            map.setCenter(results[0].geometry.location);
            new google.maps.Marker({
              map: map,
              position: results[0].geometry.location,
            });
            search(results[0].geometry.location);
          } else {
            document.getElementById("card-result").innerHTML = "";
            document
              .getElementById("card-result")
              .insertAdjacentHTML(
                "afterbegin",
                "<label><b>No results found. Try expanding your results" +
                  " by changing the location searched or products and benefits selected.</b></label>"
              );
          }
        } else {
          window.alert(
            "Geocode was not successful for the following reason: " + status
          );
        }
      });
    };
    const error = () => {
      document.getElementById("card-result").innerHTML = "";
      document
        .getElementById("card-result")
        .insertAdjacentHTML(
          "afterbegin",
          "<label><b>Unable to retrieve your location.</b></label>"
        );
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      document.getElementById("card-result").innerHTML = "";
      document
        .getElementById("card-result")
        .insertAdjacentHTML(
          "afterbegin",
          "<label><b>Sorry, your browser does not support HTML5 geolocation.</b></label>"
        );
    }
  };

  document
    .querySelector("#button")
    .addEventListener("click", () => findMyState());

  document.querySelector("#view-more").addEventListener("click", () => {
    if (placeResultsSearch.length > 0) {
      let idx = document.querySelector(".scroll").childElementCount + 1;
      for (let i = 0; i < placeResultsSearch[1].length; i++) {
        const res = placeResultsSearch[1][i];
        idx += 1;

        // Use marker animation to drop the icons incrementally on the map.
        markers[idx] = new google.maps.Marker({
          position: res.geometry.location,
          animation: google.maps.Animation.DROP,
          icon: markerIcon,
        });

        // If the user clicks a hotel marker, show the details of that hotel
        // in an info window.
        markers[idx].placeResult = res;
        google.maps.event.addListener(markers[idx], "click", showInfoWindow);
        setTimeout(dropMarker(idx), i * 100);
        addResult(res, idx);
      }
      placeResultsSearch = [];
    } else {
      if (getNextPage) {
        getNextPage();
      }
    }
  });
}

// Set the country restriction based on user input.
// Also center and zoom the map on the given country.

function dropMarker(i) {
  return function () {
    markers[i].setMap(map);
  };
}

function addResult(result, idx) {
  places.getDetails({ placeId: result.place_id }, (place, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK) {
      return;
    }

    let telephone = "";
    if (place.formatted_phone_number) {
      telephone = place.formatted_phone_number;
    }
    let rating = "";
    if (place.rating) {
      for (let i = 0; i < 5; i++) {
        if (place.rating < i + 0.5) {
          rating += "&#10025;";
        } else {
          rating += "&#10029;";
        }
      }
    }
    let website = "";
    if (place.website) {
      let fullUrl = place.website;
      website = String(hostnameRegexp.exec(place.website));

      if (!website) {
        website = "http://" + place.website + "/";
        fullUrl = website;
      }
    }
    const design = designCardLocation({
      idx,
      icon: place.icon,
      name: place.name,
      address: place.vicinity,
      telephone,
      rating,
      website,
    });
    document
      .getElementById("card-result")
      .insertAdjacentHTML("beforeend", design);

    document.querySelector(`#card${idx}`).onclick = function () {
      google.maps.event.trigger(markers[idx], "click");
    };
    assignNumberFound();
  });
}

function clearResults() {
  document.getElementById("card-result").innerHTML = "";
}

function clearMarkers() {
  for (let i = 0; i < markers.length; i++) {
    if (markers[i]) {
      markers[i].setMap(null);
    }
  }

  markers = [];
}
// Search for bank in the selected city, within the viewport of the map.
function search(centerLocation = "") {
  map.setZoom(12);
  const search = {
    location: centerLocation,
    types: SEARCH_TYPE,
    keyword: SEARCH_NAME,
    rankBy: google.maps.places.RankBy.DISTANCE,
  };

  placeResultsSearch = [];
  clearResults();
  clearMarkers();
  document.getElementById("card-result").innerHTML = "";
  document.getElementById("view-more").style.display = "none";
  document.getElementById("found-number").style.display = "block";
  places.nearbySearch(search, (results, status, pagination) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
      // Create a marker for each bank and marker icon.
      if (results.length > 10) {
        placeResultsSearch[0] = results.slice(0, 10);
        placeResultsSearch[1] = results.slice(10, 20);
        document.getElementById("view-more").style.display = "inline-block";
      } else {
        placeResultsSearch[0] = results.slice(0, 10);
        document.getElementById("view-more").style.display = "none";
      }
      let idx = document.querySelector(".scroll").childElementCount;

      for (let i = 0; i < placeResultsSearch[0].length; i++) {
        const res = placeResultsSearch[0][i];
        idx += 1;

        // Use marker animation to drop the icons incrementally on the map.
        markers[idx] = new google.maps.Marker({
          position: res.geometry.location,
          animation: google.maps.Animation.DROP,
          icon: markerIcon,
        });

        // If the user clicks a hotel marker, show the details of that hotel
        // in an info window.
        markers[idx].placeResult = res;
        google.maps.event.addListener(markers[idx], "click", showInfoWindow);
        setTimeout(dropMarker(idx), i * 100);
        addResult(res, idx);
      }

      if (!pagination || !pagination.hasNextPage) {
        document.querySelector("#view-more").disabled = true;
        document.querySelector("#view-more").style.display = "none";
      }
      if (centerLocation) {
        map.setCenter(centerLocation);
        map.setZoom(14);
      }

      if (pagination && pagination.hasNextPage) {
        getNextPage = () => {
          // Note: nextPage will call the same handler function as the initial call
          pagination.nextPage();
        };
      }
    }
  });
}

function assignNumberFound() {
  document.getElementById("found-number").innerHTML = "";
  let number = document.querySelector(".scroll").childElementCount;
  document
    .getElementById("found-number")
    .insertAdjacentHTML("afterbegin", `<b>Found ${number} results: </b>`);
}
function codeAddress() {
  let postalCode;
  placeResultsSearch = [];
  clearResults();
  clearMarkers();
  document.getElementById("found-number").style.display = "none";
  if (document.getElementById("field-search").value == "") {
    postalCode = SEARCH_CODE_DEFAULT;
  } else {
    postalCode = document.getElementById("field-search").value;
  }
  geocoder.geocode(
    {
      componentRestrictions: {
        country: REGION.toLocaleUpperCase(),
        postalCode,
      },
    },
    function (results, status) {
      if (status == "OK") {
        map.setCenter(results[0].geometry.location);
        new google.maps.Marker({
          map: map,
          position: results[0].geometry.location,
        });
        search(results[0].geometry.location);
      } else {
        document.getElementById("card-result").innerHTML = "";
        document
          .getElementById("card-result")
          .insertAdjacentHTML(
            "afterbegin",
            "<label><b>Geocode was not successful for the following reason: " +
              status +
              "</b></label>"
          );
      }
    }
  );
}

// Get the place details for a hotel. Show the information in an info window,
// anchored on the marker for the hotel that the user selected.
function showInfoWindow() {
  const marker = this;

  places.getDetails(
    { placeId: marker.placeResult.place_id },
    (place, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
      }

      infoWindow.open(map, marker);
      buildIWContent(place);
    }
  );
}

// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
  document.getElementById("iw-icon").innerHTML =
    '<img class="hotelIcon" ' + 'src="' + place.icon + '"/>';
  document.getElementById("iw-url").innerHTML =
    '<b><a href="' + place.url + '">' + place.name + "</a></b>";
  document.getElementById("iw-address").textContent = place.vicinity;

  if (place.formatted_phone_number) {
    document.getElementById("iw-phone-row").style.display = "";
    document.getElementById("iw-phone").textContent =
      place.formatted_phone_number;
  } else {
    document.getElementById("iw-phone-row").style.display = "none";
  }

  // Assign a five-star rating to the hotel, using a black star ('&#10029;')
  // to indicate the rating the hotel has earned, and a white star ('&#10025;')
  // for the rating points not achieved.
  if (place.rating) {
    let ratingHtml = "";

    for (let i = 0; i < 5; i++) {
      if (place.rating < i + 0.5) {
        ratingHtml += "&#10025;";
      } else {
        ratingHtml += "&#10029;";
      }

      document.getElementById("iw-rating-row").style.display = "";
      document.getElementById("iw-rating").innerHTML = ratingHtml;
    }
  } else {
    document.getElementById("iw-rating-row").style.display = "none";
  }

  // The regexp isolates the first part of the URL (domain plus subdomain)
  // to give a short URL for displaying in the info window.
  if (place.website) {
    let fullUrl = place.website;
    let website = String(hostnameRegexp.exec(place.website));

    if (!website) {
      website = "http://" + place.website + "/";
      fullUrl = website;
    }

    document.getElementById("iw-website-row").style.display = "";
    document.getElementById("iw-website").textContent = website;
  } else {
    document.getElementById("iw-website-row").style.display = "none";
  }
}

function designCardLocation(data) {
  let { name, idx, address, telephone, rating, website } = data;

  const markerIcon = "star.png";
  return `<div class="card" id="card${idx}">
    <div class="card-header">
      <span><img src="${markerIcon}"
      class="icon-card-header"
      classname="placeIcon"> </span>
    </div>
    <div class="card-body">
      <div class="card-body-title">${name}</div>
      <div class="card-body-details">
        <table>
          <tr>
            <td><i class="fa-solid fa-map-location"></i></td>
            <td><small>${address}</small></td>
          </tr>
          <tr>
            <td><i class="fa-solid fa-phone"></i></td>
            <td><small>${telephone}</small></td>
          </tr>
          <tr>
            <td><i class="fa-solid fa-star"></i></td>
            <td><small>${rating}</small></td>
          </tr>
          <tr>
            <td><i class="fa-solid fa-globe"></i></td>
            <td><small><a target="_blank" href="${website}">${website}</a></small></td>
          </tr>
        </table>
      </div>
      <div class="card-body-footer">
      </div>
    </div>
  </div>`;
}

/* validate region current location */

function getCountry(results) {
  for (var i = 0; i < results[0].address_components.length; i++) {
    var shortname = results[0].address_components[i].short_name;
    var longname = results[0].address_components[i].long_name;
    var type = results[0].address_components[i].types;
    if (type.indexOf("country") != -1) {
      if (!isNullOrWhitespace(shortname)) {
        return shortname;
      } else {
        return longname;
      }
    }
  }
}

function isNullOrWhitespace(text) {
  if (text == null) {
    return true;
  }
  return text.replace(/\s/gi, "").length < 1;
}
window.initMap = initMap;
