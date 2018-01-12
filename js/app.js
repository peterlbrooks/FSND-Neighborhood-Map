// JSLINT options
/* globals ko: false            */
/* globals $: false             */
/* globals google: false        */
/*exported mapError, initMap    */


var DataModel = function(locations) {
    "use strict";

    var self = this;
    self.locations = [

        {title: "The Museum of Bad Art", street: "55 Davis Square",
        city: "Somerville", state: "MA", zip: "02144",
        website: "http://www.museumofbadart.org/",
        yelpID: "museum-of-bad-art-somerville",
        location: {lat: 42.3966979, lng: -71.1252288},
        isSelected: ko.observable(false),
        marker: []},

        {title: "Museum of Useful Things", street: "5 Brattle Street",
        city: "Cambridge", state: "MA", zip: "02138",
        website: "http://themut.com/",
        yelpID: "black-ink-cambridge-2",
        location: {lat: 42.3736038, lng: -71.121887},
        isSelected: ko.observable(false),
        marker: []},

        {title: "Warren Anatomical Museum", street: "10 Shattuck Street",
        city: "Boston", state: "MA", zip: "02115",
        website: "www.countway.harvard.edu",
        yelpID: "warren-anatomical-museum-boston",
        location: {lat: 42.3351906, lng: -71.1059887},
        isSelected: ko.observable(false),
        marker: []},

        {title: "USS Constitution Museum", street: "Building 22, Charlestown Navy Yard",
        city: "Charlestown", state: "MA", zip: "02129",
        website: "https://ussconstitutionmuseum.org/",
        yelpID: "uss-constitution-charlestown",
        location: {lat: 42.3739796, lng: -71.057618},
        isSelected: ko.observable(false),
        marker: []},

        {title: "Boston Tea Party Ships & Museum", street: "306 Congress Street",
        city: "Boston", state: "MA", zip: "02210",
        website: "http://www.museumofbadart.org/",
        yelpID: "boston-tea-party-ships-and-museum-boston",
        location: {lat: 42.3521786, lng: -71.0534738},
        isSelected: ko.observable(false),
        marker: []},

        {title: "The Boston Athenaeum", street: "15 Newton Street",
        city: "Brookline", state: "MA", zip: "02445",
        website: "http://www.bostonathenaeum.org/",
        yelpID: "boston-athenaeum-boston",
        location: {lat: 42.35794893, lng: -71.0642239},
        isSelected: ko.observable(false),
        marker: []},

        {title: "Metropolitan Waterworks Museum", street: "2450 Beacon Street",
        city: "Chestnut Hill", state: "MA", zip: "02467",
        website: "http://www.museumofbadart.org/",
        yelpID: "metropolitan-waterworks-museum-boston",
        location: {lat: 42.331743, lng: -71.1577342},
        isSelected: ko.observable(false),
        marker: []},

        {title: "The Plumbing Museum", street: "80 Rosedale Road",
        city: "Watertown", state: "MA", zip: "02471",
        website: "http://www.theplumbingmuseum.org/",
        yelpID: "the-plumbing-museum-watertown",
        location: {lat: 42.3689325, lng: -71.2009511},
        isSelected: ko.observable(false),
        marker: []},

        {title: "Museum of Modern Renaissance", street: "15 College Avenue",
        city: "Somerville", state: "MA", zip: "02144",
        website: "http://mod-ren.com/",
        yelpID: "museum-of-modern-renaissance-somerville",
        location: {lat: 42.3948253, lng: -71.1231841},
        isSelected: ko.observable(false),
        marker: []},

        {title: "Larz Anderson Auto Museum", street: "15 College Avenue",
        city: "Somerville", state: "MA", zip: "02144",
        website: "http://larzanderson.org/",
        yelpID: "larz-anderson-auto-museum-brookline",
        location: {lat: 42.3104958, lng: -71.1369986},
        isSelected: ko.observable(false),
        marker: []}
    ];

    self.Cambridge = { center: {lat: 42.3736, lng: -71.1097} };
    self.filterText = "";

};

// Global vars
var map;
var infoWindow;
var currentLocations = ko.observableArray();
var currentMarker;

// View Model
var ViewModel = function() {
    "use strict";

    var self = this;

    self.currentFilter = ko.observable();   // current filter text
    self.currentSelectedLoc = null;                // currently selected location
    self.showFilterColumn = ko.observable(true);

   // check if system is online
   if (isOnline()) {

       // only show locations for filtering if online
       currentLocations = ko.observableArray(new DataModel().locations);

    } else {

        // if offline show alert
        window.alert("Sorry - you are not connected to the internet." +
            " Please retry later.");

    }

    // calculate filtered locations
    self.filteredLocs = ko.pureComputed(function () {

        if (!self.currentFilter()) {    // if not exist, first time in app

            setAllVisible();
            return currentLocations();

        } else {    // all this is to change color of the selected list item

            return ko.utils.arrayFilter(currentLocations(), function (item) {

                var filter = self.currentFilter().toLowerCase();

                // show item's marker if it is in filtered list else hide it
                if (item.title.toLowerCase().indexOf(filter) !== -1) {

                    item.marker.setVisible(true);   // show the marker

                } else {

                    item.marker.setVisible(false);  // hide the marker
                }

                // return item title if item title contains the filter text
                return item.title.toLowerCase().indexOf(filter) !== -1;
            });

        }

    });


    // set all markers to be visible on map
    function setAllVisible() {


        for (var i = 0; i < currentLocations().length; i++) {

            // make each location's marker visible
           if (typeof currentLocations()[i].marker.title !== "undefined") {

                currentLocations()[i].marker.setVisible(true);

            }

        }

    }


    // a filter item (location name) on the left hand list has been selected
    self.filterItemClick = function (item) {

        if (self.currentSelectedLoc) {  // if there is a prior selected item

            self.currentSelectedLoc.isSelected(false);  // unselect it

        }

        if (self.currentSelectedLoc != item) {  // if a new item is clicked

            self.currentSelectedLoc = item; // make it the current item
            item.isSelected(true);          // mark it as selected
            populateInfoWindow(item.marker, infoWindow);    // show the infoW

        } else {    // prior selected item was re-selected so clear it up

            self.currentSelectedLoc = null;     // force all items to be unselected
            infoWindow.close();                 // close the open window
            currentMarker.setAnimation(null);   // stop the animation

        }

    };  // end of filterButtonClick


    self.burgerButtonClick = function () {

        self.showFilterColumn(!self.showFilterColumn());    // change DOMs

    };

};

function isOnline() {   // check if system is online or offline
    "use strict";

        var isOnline = window.navigator.onLine;
        return isOnline ? true : false;

    }


function mapError(){
    "use strict";

    alert("Error loading Google map - please try again later");
}

// Show map (called from html)
function initMap() {

    // Create a new map
    var center = new DataModel().Cambridge.center;
    map = new google.maps.Map(document.getElementById("map"), {
          center: center,
          zoom: 12});

    google.maps.event.addDomListener(window, "resize", function(){
        map.setCenter(center);
    });

    for (var i = 0; i < currentLocations().length; i++) {

        // Note: if want to add more info to marker for info window
        // just add a parm. Content is set in getYelp AJAX return.
        var marker = new google.maps.Marker({ // Create the marker
            title: currentLocations()[i].title,
            position: currentLocations()[i].location,
            yelpID: currentLocations()[i].yelpID,
            website: currentLocations()[i].website,
            map: map});

        currentLocations()[i].marker = marker;
        infoWindow = new google.maps.InfoWindow();  // Add the info window
        addListener(currentLocations()[i].marker, infoWindow);

    }

    // add the listener to show the infowindow
    function addListener(marker,infoWindow) {
        marker.addListener("click", function() {

            var self = this;
            populateInfoWindow(self, infoWindow);

        });

    }

}


// Show the info window popup and all data, including Yelp
function populateInfoWindow(marker, infoWindow) {
    "use strict";

        infoWindow.setContent("<div>Loading...</div>"); // Show loading message
        infoWindow.marker = marker;
        if (currentMarker) currentMarker.setAnimation(null);
        currentMarker = marker;

        // Clear marker property when the infowindow is closed
        infoWindow.addListener("closeclick", function() {
            currentMarker.setAnimation(null);

        });

        getYelp(marker, infoWindow);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        infoWindow.open(map, marker);


    // Get the Yelp info to populate the info window
    function getYelp(marker, infoWindow) {


        // Use cors-anywhere proxy service from herokuapp
        var token = "qWHEGkT5IzrrcF1aeeujhoSHLB2pAhzdGeJPCJr4UIvVqR3bNChZ2cOp0Y3PKXVI5UhL9jrJ9tE5L0dFZWxNBcJW02w29CygavY9QcBbrqHjU2rs3PL7KYjFSVdEWnYx";
        var crossCorsURL = "https://cors-anywhere.herokuapp.com/";
        var yelpURL = "https://api.yelp.com/v3/businesses/";

        var url = crossCorsURL + yelpURL + marker.yelpID;

        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": url,
            "method": "GET",
            "headers": {
                "authorization": "Bearer " + token,
                "cache-control": "public"}
            }).done(function(response){
                var isOpenNow = "No";
                if (response.is_open_now === true) { isOpenNow = "Yes"; }

                infoWindow.setContent(
                    "<div class='yelpTitle'>" + marker.title + "</div>" +
                    "<br>" +
                    "<a class='yelpLink' target='_blank' href='" +
                        response.url + "'>Yelp Info (Click to View)</a>'" +
                    "<br>" +
                    "<div class='textLeft'>Rating: " +
                        response.rating + "</div>" +
                    "<div class='textLeft'>Website: " +
                        marker.website + "</div>" +
                    "<div class='textLeft'>Phone: " +
                        response.phone + "</div>" +
                    "<div class='textLeft'>Open Now?: " +
                        isOpenNow + "</div>"
                    );

            }).fail(function(response, status){

                infoWindow.setContent(  // if Yelp error
                    "Sorry - Yelp information detail is not available." +
                    "Please try again later"

                    );

        });

    }


}


// Knockout.js binding of the View Model (which includes global vars!)
ko.applyBindings(new ViewModel());