var $ = require("jquery");

var root = module.exports = function(queryResponse) {
	var parsers = {
		xml: require("./xml.js"),
		json: require("./json.js"),
		tsv: require("./tsv.js"),
		csv: require("./csv.js")
	};
	var contentType;
	var origResponse;
	var json = null;
	var type = null;//json, xml, csv, or tsv
		
		
	contentType = (typeof queryResponse == "object" && queryResponse.contentType? queryResponse.contentType.toLowerCase(): null);
	origResponse = (typeof queryResponse == "object" && queryResponse.response? queryResponse.response: queryResponse);
	
	

	var getAsJson = function() {
		if (json) return json;
		if (json === false) return false;//already tried parsing this, and failed. do not try again... 
		var getParserFromContentType = function() {
			if (contentType) {
				if (contentType.indexOf("json") > -1) {
					json = parsers.json(origResponse);
					type = "json";
				} else if (contentType.indexOf("xml") > -1) {
					json = parsers.xml(origResponse);
					type = "xml";
				} else if (contentType.indexOf("csv") > -1) {
					json = parsers.csv(origResponse);
					type = "csv";
				} else if (contentType.indexOf("tab-separated") > -1) {
					json = parsers.tsv(origResponse);
					type = "tsv";
				}
			}
		};
		

		var doLuckyGuess = function() {
			json = parsers.json(origResponse);
			if (json)  {
				type = "json";
			} else {
				json = parsers.xml(origResponse);
				if (json) type="xml";
			}
		};

		
		getParserFromContentType();
		if (!json) {
			doLuckyGuess();
		}
		if (!json) json = false;//explicitly set to false, so we don't try to parse this thing again..
		return json;
	};


	var getVariables = function() {
		var json = getAsJson();
		if ("head" in json) {
			return json.head.vars;
		} else {
			return null;
		}
	};

	var getBindings = function() {
		var json = getAsJson();
		if ("results" in json) {
			return json.results.bindings;
		} else {
			return null;
		}
	};

	var getBoolean = function() {
		var json = getAsJson();
		if ("boolean" in json) {
			return json.boolean;
		} else {
			return null;
		}
	};
	var getOriginalResponse = function() {
		return origResponse;
	};
	
	var getType = function() {
		if (type == null) getAsJson();//detects type as well
		return type;
	};
	
	return {
		getAsJson: getAsJson,
		getOriginalResponse: getOriginalResponse,
		getVariables: getVariables,
		getBindings: getBindings,
		getBoolean: getBoolean,
		getType: getType
	};
};


