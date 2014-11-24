var $ = require('jquery');
var _ = require('underscore');

var Backbone = require('backbone');

var OTP = require('otpjs');
OTP.config = OTP_config;
//full: http://stackoverflow.com/questions/13029904/twitter-bootstrap-add-class-to-body-referring-to-its-mode
function assign_bootstrap_mode() {
        var width = $( window ).width();
        var mode = '';
        var nar = $('#narrative').detach();
        if (width<768) {
                mode = 'mode-xs';
                nar.appendTo('#plan');
                console.log("Attached to plan");
        }
        else {
                mode = 'mode-other';
                nar.appendTo('#sidebar');
                console.log("Attached to sidebar");
        }
        $('body').removeClass('mode-other').removeClass('mode-xs').addClass(mode);
}

/* ========================================================================
 * Bootstrap: tab.js v3.0.0
 * http://twbs.github.com/bootstrap/javascript.html#tabs
 * ========================================================================
 * Copyright 2012 Twitter, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ======================================================================== */


+function ($) { "use strict";

  // TAB CLASS DEFINITION
  // ====================

  var Tab = function (element) {
    this.element = $(element)
  }

  Tab.prototype.show = function () {
    var $this    = this.element
    var $ul      = $this.closest('ul:not(.dropdown-menu)')
    var selector = $this.attr('data-target')

    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
    }

    if ($this.parent('li').hasClass('active')) return

    var previous = $ul.find('.active:last a')[0]
    var e        = $.Event('show.bs.tab', {
      relatedTarget: previous
    })

    $this.trigger(e)

    if (e.isDefaultPrevented()) return

    var $target = $(selector)

    this.activate($this.parent('li'), $ul)
    this.activate($target, $target.parent(), function () {
      $this.trigger({
        type: 'shown.bs.tab'
      , relatedTarget: previous
      })
    })
  }

  Tab.prototype.activate = function (element, container, callback) {
    var $active    = container.find('> .active')
    var transition = callback
      && $.support.transition
      && $active.hasClass('fade')

    function next() {
      $active
        .removeClass('active')
        .find('> .dropdown-menu > .active')
        .removeClass('active')

      element.addClass('active')

      if (transition) {
        element[0].offsetWidth // reflow for transition
        element.addClass('in')
      } else {
        element.removeClass('fade')
      }

      if (element.parent('.dropdown-menu')) {
        element.closest('li.dropdown').addClass('active')
      }

      callback && callback()
    }

    transition ?
      $active
        .one($.support.transition.end, next)
        .emulateTransitionEnd(150) :
      next()

    $active.removeClass('in')
  }


  // TAB PLUGIN DEFINITION
  // =====================

  var old = $.fn.tab

  $.fn.tab = function ( option ) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.tab')

      if (!data) $this.data('bs.tab', (data = new Tab(this)))
      if (typeof option == 'string') data[option]()
    })
  }

  $.fn.tab.Constructor = Tab


  // TAB NO CONFLICT
  // ===============

  $.fn.tab.noConflict = function () {
    $.fn.tab = old
    return this
  }


  // TAB DATA-API
  // ============

  $(document).on('click.bs.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

}(window.jQuery);

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

    var marpromTransport = L.tileLayer('http://mysentry.duckdns.org:8080/marprom/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>. Tiles courtesy of <a href="https://github.com/codeforamerica/Transit-Map-in-TileMill">Transit Map in TileMill</a> & MaBu'
    });

    var marpromTransportOverlay = L.tileLayer('http://mysentry.duckdns.org:8080/marprom_overlay/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>. Tiles courtesy of <a href="https://github.com/codeforamerica/Transit-Map-in-TileMill">Transit Map in TileMill</a> & MaBu'
    });

    // create a leaflet layer control and add it to the map
    var baseLayers = {
        "Street Map" : osmLayer,
        "Marprom transport": marpromTransport,
        "Bicycle Map": cycleLayer,
        "Public transport Map": transportLayer,
        "Satellite Map" : aerialLayer
    };
    L.control.layers(baseLayers, {"Marprom transport": marpromTransportOverlay}).addTo(map);

    // display the OSM street layer by default
    osmLayer.addTo(map);

    // displays marprom overlay by default
    marpromTransportOverlay.addTo(map);

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
        assign_bootstrap_mode();
    };
    $(document).on('shown.bs.tab', 'a.formap', function() {
            map.invalidateSize();
    });
    $(window).resize(resize);
    resize.call();
    $('#tabs').tab();
    map.invalidateSize();
    assign_bootstrap_mode();
});

