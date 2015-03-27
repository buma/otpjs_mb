
var OTP_config = {
	
	"initLatLng" : [46.562483, 15.643975],

	"osmMapKey": "conveyal.ikck6888", // temporary -- do not use in production, provide your own
	"aerialMapKey": "conveyal.map-a3mk3jug", // unset

        /*"otpApi": "http://maps.cherriots.org:8080/opentripplanner-api-webapp/ws",*/
        /*"otpApi": "http://192.168.0.100:8080/otp-rest-servlet/ws",*/
        "otpApi": "http://planner.duckdns.org/otp-rest-servlet/ws",
        /*"otpApi":"http://planner-daljinko.rhcloud.com/otp-rest-servlet/ws",*/
        /*"otpApi":"http://212.47.236.143/otp-rest-servlet/ws",*/
	"esriApi": "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/",
        "metric": false,

	"reverseGeocode": false

};
