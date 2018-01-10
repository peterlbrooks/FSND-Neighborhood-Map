"use strict";

var DataModel = function(locations) {

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

}

// Global vars
var map;
var infoWindow;
var currentLocations = ko.observableArray( new DataModel().locations );
var currentMarker;


// View Model
var ViewModel = function() {

    var self = this;
    self.currentFilter = ko.observable();   // current filter text
    self.currentSelectedLoc;                        // currently selected location

    self.filteredLocs = ko.pureComputed(function () {

        if (!self.currentFilter()) {

            setAllVisible();
            return currentLocations();

        } else {

            return ko.utils.arrayFilter(currentLocations(), function (item) {

                var filter = self.currentFilter().toLowerCase();

                if (item.title.toLowerCase().indexOf(filter) !== -1) {

                    item.marker.setVisible(true);

                } else {

                    item.marker.setVisible(false);
                };

                return item.title.toLowerCase().indexOf(filter) !== -1;
            });

        };

    });


    // Set all markers to be visible on map
    function setAllVisible() {

        for (var i = 0; i < currentLocations().length; i++) {

           if (typeof currentLocations()[i].marker.title !== 'undefined') {

                currentLocations()[i].marker.setVisible(true)

            }

        }

    }

        // A filter item on the left hand list has been selected
    self.filterButtonClick = function (item) {

        if (self.currentSelectedLoc) {  // if not the first time...

            self.currentSelectedLoc.isSelected(false);

            console.log('current selected loc = ' + item.title);

        }

        if (self.currentSelectedLoc != item) {
            console.log('current selected loc != item');
            self.currentSelectedLoc = item;
            item.isSelected(true);
            populateInfoWindow(item.marker, infoWindow);
        } else {
            infoWindow.close();
            currentMarker.setAnimation(null)
        }

    };

}


// Show map (called from html)
function initMap() {

    // Create a new map
    map = new google.maps.Map(document.getElementById('map'), {
          center: new DataModel().Cambridge.center,
          zoom: 12});

    for (var i = 0; i < currentLocations().length; i++) {

        // Note: if want to add more info to marker for info window
        // just add a parm
        var marker = new google.maps.Marker({ // Create the marker
            title: currentLocations()[i].title,
            position: currentLocations()[i].location,
            yelpID: currentLocations()[i].yelpID,
            website: currentLocations()[i].website,
            map: map});

        currentLocations()[i].marker = marker;

        currentLocations()[i].marker.addListener('click', function() {

            self = this;
            populateInfoWindow(self, infoWindow);

        });

        infoWindow = new google.maps.InfoWindow();  // Add the info window

    }

}


// Show the info window popup and all data, including Yelp
function populateInfoWindow(marker, infoWindow) {

        infoWindow.setContent('<div>Loading...</div>'); // Show loading message
        infoWindow.marker = marker;
        if (currentMarker) currentMarker.setAnimation(null);
        currentMarker = marker;

        // Clear marker property when the infowindow is closed
        infoWindow.addListener('closeclick', function() {
            currentMarker.setAnimation(null);

        });

        getYelp(marker, infoWindow);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        infoWindow.open(map, marker);


    // Get the Yelp info to populate the info window
    function getYelp(marker, infoWindow) {

        // Use cors-anywhere proxy service from herokuapp
        var token = 'qWHEGkT5IzrrcF1aeeujhoSHLB2pAhzdGeJPCJr4UIvVqR3bNChZ2cOp0Y3PKXVI5UhL9jrJ9tE5L0dFZWxNBcJW02w29CygavY9QcBbrqHjU2rs3PL7KYjFSVdEWnYx';
        var crossCorsURL = 'https://cors-anywhere.herokuapp.com/'
        var yelpURL = 'https://api.yelp.com/v3/businesses/'

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
                if (response.is_open_now == true) { isOpenNow = "Yes"; }
                infoWindow.setContent(
                    '<div>' + marker.title + '</div>' +
                    '<br>' +
                    '<div class="yelpTitle">Yelp Info</div>' +
                    '<div class="textLeft">Rating: ' +
                        response.rating + '</div>' +
                    '<div class="textLeft">Website: ' +
                        marker.website + '</div>' +
                    '<div class="textLeft">Phone: ' +
                        response.phone + '</div>' +
                    '<div class="textLeft">Open Now?: ' +
                        isOpenNow + '</div>' +
                    '<br>' +
                    '<a class="yelpLink" target="_blank" href="' +
                        response.url + '">View on Yelp</a>'
                    );

            }).fail(function(response, status){
                // TODO
        })

    }

}


// Knockout.js binding of the View Model (which includes global vars!)
ko.applyBindings(new ViewModel());