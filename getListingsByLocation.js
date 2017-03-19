var assert = require("assert");

var googleplaces = require("googleplaces");
var TextSearch = require("./node_modules/googleplaces/lib/TextSearch.js");
var PlaceDetailsRequest = require("./node_modules/googleplaces/lib/PlaceDetailsRequest.js");
var config = require("./config.js");

var textSearch = new TextSearch(config.apiKey, config.outputFormat);
var placeDetailsRequest = new PlaceDetailsRequest(config.apiKey, config.outputFormat);
var resultsRetrieved = 0;
var keywordSearchResult = 0;
var totalCities = 0;

var listingIndex;
var cityIndex;
var resultsArray = [];

(function () {
    "use strict";

    var columns = ["name", "lat", "long"];

    var searchArray = ["toy store", "child toy store", "children's clothing store", "baby clothing store", "baby gift shop"];
    var term = searchArray[2];
    console.log("term: ", term);

    // Read data from csv
    require("csv-to-array")({
       file: "cities.csv",
       columns: columns
    }, function (err, array) {
        mainSearchLoop(array, term);
    });

    // Read data from array
    var cityArray = [{"name": "new york", "latitude": "40.7141667", "longitude": "-74.0063889"}];
    //mainSearchLoop(cityArray, term);

})();

function mainSearchLoop(array, term){
    for (cityIndex in array) {
        var parameters = {
            query: term,
            location: [array[cityIndex].lat, array[cityIndex].long],
            types: "store",
            rankby: "distance"
        };

        totalCities = array.length;

        console.log("search terms: " + term + " city: " + array[cityIndex].name);

        keywordSearch(parameters);
    }
}

function keywordSearch(parameters){
    textSearch(parameters, function (error, response) {
        if (error){
            console.log(error);
        }
        if(response){
            keywordSearchResult += response.results.length;
            for (listingIndex in response.results) {
                if (response.results[listingIndex]){
                    getDetails(response.results[listingIndex].reference, keywordSearchResult, listingIndex);
                }
            }
        }
        else {
            console.log("no response");
        }
    });
}

function getDetails(reference, keywordSearchResult) {

    placeDetailsRequest({reference: reference}, function (error, response) {
        if(response){
            if(response.result){
                resultsRetrieved++;
                var result = {
                    name: response.result.name,
                    address: response.result.formatted_address,
                    phone: response.result.formatted_phone_number,
                    url: response.result.website,
                    types: response.result.types,
                    closed: response.result.permanently_closed,
                    lat: response.result.geometry.location.lat,
                    long: response.result.geometry.location.lng
                };
                resultsArray.push(result);
                //console.log("resultsRetrieved: " + resultsRetrieved + "keywordSearchResult: " + keywordSearchResult);
                if(resultsRetrieved == keywordSearchResult) {
                    console.log(JSON.stringify(resultsArray));
                    // To get last results:
                    // sed -i '$ d' output.json
                    // IS THIS NECESSARY? // sed -n '$ p' output.json > output_new.json
                    // To convert to CSV, in BASH terminal type:
                    // json2csv -i output.json -f name,address,phone,url,types,closed,lat,long > output.csv
                }
                if (error){
                    console.log(error);
                } 
            } 
        }
        else {
            console.log("no response");
        }
    });

}