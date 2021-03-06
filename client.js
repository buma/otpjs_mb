var $ = require('jquery');
var _ = require('underscore');

var Backbone = require('backbone');

var OTP = require('otpjs');
OTP.config = OTP_config;

$(document).ready(function() {

    // set up the leafet map object
	var map = L.map('map').setView(OTP.config.initLatLng, (OTP.config.initZoom || 13));
    map.attributionControl.setPrefix('');

    var aerialLayer = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg', {
        subdomains: ['1', '2', '3', '4'],
        maxZoom: 11,
        attribution : 'Satellite Map: <a href="http://mapbox.com/about/maps">Terms & Feedback</a>'
    });

    var osmLayer = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png', {
        subdomains: ['1', '2', '3', '4'],
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>. Tiles courtesy of <a href="http://www.mapquest.com/">MapQuest</a>'
    });

    var cycleLayer = L.tileLayer('http://a.tile.thunderforest.com/cycle/{z}/{x}/{y}.png', {
        subdomains: ['a', 'b', 'c'],
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>. Tiles courtesy of <a href="http://www.thunderforest.com/">Andy Allan</a>'
    });
    
    var transportLayer = L.tileLayer('http://a.tile.thunderforest.com/transport/{z}/{x}/{y}.png', {
        subdomains: ['a', 'b', 'c'],
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>. Tiles courtesy of <a href="http://www.thunderforest.com/">Andy Allan</a>'
    });

    // create a leaflet layer control and add it to the map
    var baseLayers = {
        "Street Map" : osmLayer,
        "Bicycle Map": cycleLayer,
        "Public transport Map": transportLayer,
        "Satellite Map" : aerialLayer
    };
    L.control.layers(baseLayers).addTo(map);

    // display the OSM street layer by default
    osmLayer.addTo(map);

    // create the trip topography widget and add it to the map
    var topoControl = new OTP.topo_views.LeafletTopoGraphControl();
    topoControl.addTo(map);
    
    // create a data model for the currently visible stops, and point it
    // to the corresponding API method
    var stopsRequestModel = new OTP.models.OtpStopsInRectangleRequest();
    stopsRequestModel.urlRoot = OTP.config.otpApi + '/transit/stopsInRectangle';

    // create the stops request view, which monitors the map and updates the
    // bounds of the visible stops request as the viewable area changes
    var stopsRequestMapView = new OTP.map_views.OtpStopsRequestMapView({
        model: stopsRequestModel,
        map: map
    });

    // create the stops response view, which refreshes the stop markers on the
    // map whenever the underlying visible stops model changes
    var stopsResponseMapView = new OTP.map_views.OtpStopsResponseMapView({
        map: map
    });
    stopsRequestModel.on('success', function(response) {
        stopsResponseMapView.newResponse(response);
    });

    // create the main OTP trip plan request model and point it to the API
    var requestModel = new OTP.models.OtpPlanRequest();
    requestModel.urlRoot = OTP.config.otpApi + '/plan';

    // create and render the main request view, which displays the trip
    // preference form
    var requestView = new OTP.request_views.OtpRequestFormView({
        model: requestModel,
        el: $('#request')
    });
    requestView.render();

    // create and render the request map view, which handles the map-specific
    // trip request elements( e.g. the start and end markers)
    var requestMapView = new OTP.map_views.OtpRequestMapView({
    	model: requestModel,
    	map: map
    });
    requestMapView.render();

    // create the main response view, which refreshes the trip narrative display
    // and map elements as the underlying OTP response changes
    var responseView = new OTP.views.OtpPlanResponseView({
        narrative: $('#narrative'),
        map: map,
        topo: topoControl.getGraphElement()
    });

    // instruct the response view to listen to relevant request model events
    requestModel.on('success', function(response) {
        responseView.newResponse(response); 
    });
    requestModel.on('failure', function(response) {
        responseView.newResponse(false); 
    });

    requestModel.request();



    var Router = Backbone.Router.extend({
      routes: {
        'plan(?*querystring)': 'plan'
      },
      plan: function (querystring) {
        requestModel.fromQueryString(querystring);
      }
    });

    router = new Router();
    Backbone.history.start();

    requestModel.on('change', function() {
        router.navigate('plan' + requestModel.toQueryString());
    });

    // make the UI responsive to resizing of the containing window
    var resize = function() {
        var height = $(window).height() - 30;
        $('#map').height(height);
        $('#sidebar').height(height);
        map.invalidateSize();
    };
    $(window).resize(resize);
    resize.call();
});

