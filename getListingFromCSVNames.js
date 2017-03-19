(function () {
    "use strict";

    var assert = require("assert");

    var googleplaces = require("googleplaces");
    var TextSearch = require("./node_modules/googleplaces/lib/TextSearch.js");
    var PlaceDetailsRequest = require("./node_modules/googleplaces/lib/PlaceDetailsRequest.js");
    var config = require("./config.js");

    var textSearch = new TextSearch(config.apiKey, config.outputFormat);
    var placeDetailsRequest = new PlaceDetailsRequest(config.apiKey, config.outputFormat);

    var resultsArray = [];
    var columns = ["name"];
    var count = 0;

    require("csv-to-array")({
       file: "abc_retailers.csv",
       columns: columns
    }, function (err, array) {
        var store;
        for (store in array) {
            var parameters = {
                query: array[store].name,
                types: "store"
            };

            textSearch(parameters, function (error, response) {
                if (error){
                    console.log(error);
                }
                if (response.results[0]){
                    placeDetailsRequest({reference: response.results[0].reference}, function (error, response) {
                        var result = {
                            name: response.result.name,
                            address: response.result.formatted_address,
                            phone: response.result.formatted_phone_number,
                            url: response.result.website,
                            types: response.result.types,
                            closed: response.result.permanently_closed
                        };
                        count++;
                        resultsArray.push(result);
                        console.log(JSON.stringify(resultsArray));
                        if(count == array.length-1) {
                            console.log(JSON.stringify(resultsArray));
                        }
                        if (error){
                            console.log(error);
                        } 
                        assert.equal(response.status, "OK", "Place details request response status is OK");
                    });
                }
                else {
                    count++;
                }
            });
        }        
    });
})();