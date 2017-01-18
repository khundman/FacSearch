/* ======================================================================================================== 
Copyright 2015, by the California Institute of Technology. ALL RIGHTS RESERVED. 
United States Government Sponsorship acknowledged. Any commercial use must be negotiated with 
the Office of Technology Transfer at the California Institute of Technology.
This software may be subject to U.S. export control laws. By accepting this software, 
the user agrees to comply with all applicable U.S. export laws and regulations. 
User has the responsibility to obtain export licenses, or other export authority as may be 
required before exporting such information to foreign countries or providing access to foreign persons. 
===========================================================================================================*/

// return to blank query page
function goback (){
    window.location = '/';
}

// angular app
var app = angular.module('floorplan', ['ngCookies']);

//This function is called when menu layers are adjusted (function is in d3.floorplan.js))
function updateLegend(layer){

    var currentClasses = ["match", "nomatch"];
    var currentLabels = ["Matches query", "Does not match query"];

    if (layer == 'results'){ //if equal to 0, the layer is active
        currentClasses = ["match", "nomatch"];
        currentLabels = ["Matches query", "Does not match query"];
    }
    if (layer == 'orgOwner'){ //if equal to 0, the layer is active
        currentClasses = ["match", "nomatch"];
        currentLabels = ["Matches query", "Does not match query"];
    }
    if (layer == 'occupied'){ //if equal to 0, the layer is active
        currentClasses = ["occupied", "notpossible", "available"];
        currentLabels = ["Space Occupied", "Non-Occupiable Space", "Available"];
    }
    if (layer == 'typeOfSpace'){
        currentClasses = ["mechanical", "officeopen", "storage", "misc", "officeclosed"];
        currentLabels = ["Mechanical", "Escape Pods", "Cockpit", "Cargo Bay", "Floor Compartments"];
    }
    if (layer == 'fire'){
        currentClasses = ["CO2", "HALON", "METALX", "DC", "HALOTRON", "WATER", "NONE"];
        currentLabels = ["CO2", "HALON", "METALX", "DC", "HALOTRON", "WATER", "NONE"];
    }
    if (layer == 'fireDate'){
        currentClasses = ["Compliant", "NonCompliant", "SevereNonCompliance", "Upcoming", "NONE", "OTHER"];
        currentLabels = ["Compliant", "NonCompliant", "SevereNonCompliance", "Upcoming", "NONE", "OTHER"];
    }
    if (layer == 'imageLayer'){
        currentClasses = [];
        currentLabels = [];
    }
    return [currentClasses, currentLabels]
}

    //Call Angular controller and update scope whenever legend values are updated (via call to this function from d3.floorplan.js)
    app.controller('Legend', function($scope, $cookies, $cookieStore) {

        $scope.classes = updateLegend("results")[0];
        $scope.labels = updateLegend("results")[1]; 

        $scope.sendToDude = function(){
            console.log("button pressed")
            $cookies.put("back", "button")
        }

        $scope.updateLegend = function(layer, classes, labels, update_data) {
            var currentClasses = classes;
            var currentLabels = labels;
            // if classes aren't randomly assigned (orgOwner layer), get them from updateLegend function (which assigns them)
            if(currentClasses == null && layer != "imageLayer"){
                var legendData = updateLegend(layer);
                currentClasses = legendData[0];
                currentLabels = legendData[1]; 
            }
            $scope.classes = currentClasses;
            $scope.labels = currentLabels;
            if(update_data == true){
                update(sessionStorage.getItem('id'), layer)
            }
            $scope.$apply();
        }

    }); 

// an empty object to store the data for download
var dataForDownload = {};

function update(value, layer){

    var results = [];

    var q;
    try{
        q = JSON.parse(sessionStorage.getItem("query"));
        q.size = 10000
        delete q.aggs

        $.ajax({
            method: "POST",
            url: "/query",
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(q),
            async: false,
            complete: function(response){
                console.log(response.responseJSON)

                result_data = JSON.parse(response.responseText).hits.hits;
                // results = [];
                for(var z=0; z < result_data.length; z++){
                    results.push(result_data[z]["_source"])
                }
                
            }
        })
    } catch(e){
        console.log("No query in sessionStorage")
    }

    app.controller('ResultText', function($scope) {
        $scope.resultText = value;
    });

    

    d3.select('#floorplan').select('svg').remove();

    var xscale = d3.scale.linear()
            .domain([0,1200.0])
            .range([0,1200.0]),
        yscale = d3.scale.linear()
            .domain([0,800.0])
            .range([0,800.0]),
        map = d3.floorplan().xScale(xscale).yScale(yscale),
        imagelayer = d3.floorplan.imagelayer(),
        mapdata = {};

    updateLegend(layer)


    if(layer == 'results'){
      layer = d3.floorplan.results(results);
    }
    if(layer == 'orgOwner'){
      layer = d3.floorplan.orgOwner();
    }
    if(layer == 'occupyingOrg'){
      layer = d3.floorplan.occupyingOrg();
    }
    if(layer == 'occupied'){
      layer = d3.floorplan.occupied();
    }
    if(layer == 'fire'){
      layer = d3.floorplan.fire();
    }
    if(layer == 'fireDate'){
      layer = d3.floorplan.fireDate();
    }
    if(layer == 'typeOfSpace'){
      layer = d3.floorplan.typeOfSpace();
    }
    if(layer == 'imageLayer'){
      layer = 'imagelayer';
    }

    mapdata[imagelayer.id()] = [{
        url: "../static/floorplans/jpg/MilFalcon-Model.jpeg",
        x: 0,
        y: 0,
        height: 800.0,
        width: 1200
    }];

    if(layer == 'imagelayer'){
        map.addLayer(imagelayer)
    }
    else{
        map.addLayer(imagelayer)
            .addLayer(layer)
    }

    // var JSONdata = "static/cleaned_data/" + partial_file_value + ".json";

    var JSONdata;

    // var q = JSON.parse(sessionStorage.getItem("query"));
    // q.size = 10000;
    // delete q.aggs;
    // //q.query.bool.must = []; // Remove all query filters so d3.floorplan receives full dataset for floor
    //
    // // Add back building and floor filters
    var q = {"query":{"bool":{"filter":[]}},"size":10000}
    q.query.bool.filter.push( { "match" : { "building": value.split("-")[0] } })
    q.query.bool.filter.push( { "match" : { "floor": value.split("-")[1] } })

    $.ajax({
        method: "POST",
        url: "/query",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(q),
        async: false,
        complete: function(response){

            result_data = JSON.parse(response.responseText).hits.hits;
            console.log(result_data)
            data = []
            for(var z=0; z < result_data.length; z++){
                data.push(result_data[z]["_source"])
            }

            data = { "people" : { "map": data } } // Matching original d3.floorplan.js data structure

            // show current view in div
            document.getElementById('view-indicator').innerHTML =
                "Legend for " +
                value.split("-")[0] +
                '-' +
                value.split("-")[1] +
                ":";
            var currentClasses = [];
            var currentLabels = [];
            if(layer != 'imagelayer'){
                dataForDownload = data.people;
                mapdata[layer.id()] = data.people;
            }
            d3.select("#floorplan").append("svg")
                .attr("height", "900").attr("width", "100%").attr("id", "svg")
                .datum(mapdata).call(map);
            var svgZoom = svgPanZoom("#svg");

            document.getElementById('zoom-in').addEventListener('click', function(ev){
                ev.preventDefault()

                svgZoom.zoomIn()
            });
            document.getElementById('zoom-out').addEventListener('click', function(ev){
                ev.preventDefault()

                svgZoom.zoomOut()
            });
            if ($(window).width() < 960) {
                svgZoom.zoom(0.5)
            }
            if ($(window).width() < 764) {
                svgZoom.zoom(0.4)
            }
            else {
                svgZoom.zoom(0.7)
            }
            //if legend classes are being randomly assigned, grab classes & labels from d3.floorplan.js
            try{
                var keys = Object.keys(layer.styling());
                for(i=0; i < keys.length; i++){
                    currentLabels.push(keys[i]);
                    currentClasses.push(layer.styling()[keys[i]]);
                }
                //call angular function to update legend but not data

                angular.element(document.getElementById('Legend')).scope().updateLegend(layer, currentClasses, currentLabels, false)
            }
            catch (e){
                // console.log(e)
            }

        }
    });
}

updateLegend("results");
update(sessionStorage.getItem("id"), "results");


function download_file(json_input) {

    /* thanks simon! */
    var json = json_input['map'];
    var fields = Object.keys(json[0]);
    console.log(json)

    // find and remove "points", "fireExtinguisher", "mapx", "mapy", "dateFrom", "value" from var "fields"
    var removeFields = ["points", "fireExtinguish", "mapx", "mapy", "dateFrom", "value"];
    for (i = 0; i < removeFields.length; i++) {
        var toRemove = fields.indexOf(removeFields[i]);
        if (toRemove != -1) {
            fields.splice(toRemove, 1);
        }
    }
    //var toCSV = []
    var currentString = ""
    for(i = 0; i < fields.length; i++){
        if(i == 0){
            currentString = fields[i]
        }
        else{
            currentString = currentString + ', ' + fields[i]
        }
    }
    currentString = currentString + '\r\n';
    for(i = 0; i < json.length; i++){
        for(j = 0; j < fields.length; j++){
            if(fields[j] == 'people'){
                peopleString = "None"
                for(k = 0; k < json[i][fields[j]].length; k++){
                    if(k == 0){
                        peopleString = json[i][fields[j]][k].firstname + " " + json[i][fields[j]][k].lastname
                    }
                    else{
                        peopleString = " & " + json[i][fields[j]][k].firstname + " " + json[i][fields[j]][k].lastname
                    }
                }
                currentString = currentString+ ", " + peopleString
            }
            else{
                if(j == 0)
                    currentString = currentString + json[i][fields[j]]
                else{
                    currentString = currentString + ", " + json[i][fields[j]]
                }
            }
        }
        currentString = currentString + '\r\n';
    }
    
    //console.log(toCSV)
    // back to mapping data over
    // var csv = json.map(function(row){
    //     return fields.map(function(fieldName) {
    //         return JSON.stringify(row[fieldName] || '');
    //     });
    // });
    // //console.log(csv)
    // // remove any entries that do not have room numbers
    // for (i = 0; i < csv.length; i++) {
    //     //console.log(csv[i][17]);
    //     var room = csv[i][4].replace(/[""]+/g, '');
    //     if (room == '' || room == undefined || room == null) {
    //         csv.splice(i, 1);
    //     }
    // }
    // console.log(csv)
    // // add header columns
    // //console.log(csv)
    // //csv.unshift(fields);

    // //var formatted_csv = csv.join('\r\n');
    // download the file
    var blob = new Blob([currentString], {type: "text/plain;charset=utf-8"});
    //console.log(currentString)
    saveAs(blob, json[0]['building'] + "-" + json[0]['floor'] + "-FacSearch" + ".csv");
}
