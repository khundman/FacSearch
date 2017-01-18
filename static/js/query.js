/* ======================================================================================================== 
Copyright 2015, by the California Institute of Technology. ALL RIGHTS RESERVED. 
United States Government Sponsorship acknowledged. Any commercial use must be negotiated with 
the Office of Technology Transfer at the California Institute of Technology.
This software may be subject to U.S. export control laws. By accepting this software, 
the user agrees to comply with all applicable U.S. export laws and regulations. 
User has the responsibility to obtain export licenses, or other export authority as may be 
required before exporting such information to foreign countries or providing access to foreign persons. 
===========================================================================================================*/

// stay on top of page on load/refresh
window.onbeforeunload = function(){
	window.scrollTo(0,0);
};

//########################################################################
// Re-query to get results if user is returning to previous query
//########################################################################

if(sessionStorage.getItem('allPersons')){
    personlist = JSON.parse(sessionStorage.getItem('allPersons'))
    building = JSON.parse(sessionStorage.getItem('building'))
    orgList = JSON.parse(sessionStorage.getItem('orgList'))
}
else{
    $.ajax({
    method: "POST",
    url: "/queryAll",
    dataType : "json",
    contentType: "application/json; charset=utf-8",
    data: {"query": { "match_all": {} }, "size":10000},
    async: true,
    complete: function(results){
        personlist = []
        orgList = []
        occupyOrg = []
        building = {}
        results = JSON.parse(results.responseText).hits.hits
        for(i = 0; i < results.length; i++){
            if(!building.hasOwnProperty(results[i]['_source']['building'])){
                building[results[i]['_source']['building']] = []
                building[results[i]['_source']['building']].push(results[i]['_source']['floor'])
            }
            if(results[i]['_source']['people'].length > 0){
                for(k = 0; k < results[i]['_source'].people.length; k++){
                    var key = results[i]['_source'].people[k].firstname + " " + results[i]['_source'].people[k].lastname + " (" + results[i]['_source'].people[k].badge + ")"
                    personlist.push(key)
                }
            }
            if(results[i]['_source']['spaceSection']){
                if(orgList.indexOf(results[i]['_source']['spaceSection']) == -1){
                    orgList.push(results[i]['_source']['spaceSection'])
                }
            }
        }
        sessionStorage.setItem('allPersons', JSON.stringify(personlist));
        sessionStorage.setItem('building', JSON.stringify(building));
        sessionStorage.setItem('orgList', JSON.stringify(orgList));
    }
    })
}

//#######################################
// Autocompletes
//#######################################

// name search
$(function() {
    $( "#badge" ).autocomplete({
        source: function (request, response) {
            var list = []
            for(var i = 0; i < personlist.length; i++){
                if(~personlist[i].toLowerCase().indexOf(request.term.toLowerCase())){
                    list.push(personlist[i])
                }
            }
            console.log(list);
            if(list.length === 0){
                list.push("No Person Found")
            }
            response(list)
        },
        minLength: 1
    });
});

// allocated org search
$(function() {
    $( "#org" ).autocomplete({
        source: function (request, response) {
            var list = []
            for(var i = 0; i < auto_org.length; i++){
                if(~auto_org[i].toLowerCase().indexOf(request.term.toLowerCase())){
                    list.push(auto_org[i])
                }
            }
            //console.log(list);
            if(list.length === 0){
                list.push("No Organization Found")
            }
            response(list)
        },
        minLength: 1
    });
});

$(function() {
    $( "#parent_org" ).autocomplete({
        source: function (request, response) {
            var list = []
            for(var i = 0; i < orgList.length; i++){
                if(~orgList[i].toLowerCase().indexOf(request.term.toLowerCase())){
                    list.push(orgList[i])
                }
            }
            if(list.length === 0){
                list.push("No Organization Found")
            }
            response(list)
        },
        minLength: 1
    });
});

// building search
$(function() {
    $( "#building" ).autocomplete({
        source: function (request, response) {
            var list = []
            buildingList = Object.keys(building)
            for(var i = 0; i < buildingList.length; i++){
                if(~buildingList[i].toLowerCase().indexOf(request.term.toLowerCase())){
                    list.push(buildingList[i])
                }
            }
            if(list.length === 0){
                list.push("No Building Found")
            }
            response(list)
        },
        minLength: 1
    });
});

//clear button in quick search
function clearQuick(){
    document.getElementById('floor').value = "";
    document.getElementById('room').value = "";
}

//clear button for full search
function clearRegular(){
    document.getElementById('badge').value = "";
    document.getElementById('org').value = "";
    document.getElementById('minResult').value = "";
    document.getElementById('minSqft').value = "";
    document.getElementById('building').value = "";
    var checkboxes = document.getElementsByName("check");
    for (i=0; i<checkboxes.length; i++){
        checkboxes[i].checked = false;
    }
    document.getElementById('result-summary').innerHTML = 'search again for new results';
}

// show the results (hiding div initially for better UX)
function showResults() {
    var numResults = document.getElementById("results");
    var results = document.getElementsByClassName("search-result-container");
    numResults.style.display = "block";
    results[0].style.visibility = "visible";
}

// Check/uncheck all checkboxes in full search
function checkAll(bx, name) {
    var cbs = document.getElementsByName(name);
    for (var i = 0; i < cbs.length; i++) {
        cbs[i].checked = bx.checked;
    }
}

// set value to be sent to floorplan page, put in sessionStorage
function update_param(floor) {
    document.cookie = "layer=results"
    sessionStorage.setItem("id", floor);
    sessionStorage.setItem("results", JSON.stringify(results));
    window.location = '/floorplan';
}

// set value to be sent to floorplan page, put in sessionStorage
function update_param_chart(self) {
    var floor = self.id;
    sessionStorage.setItem("id", floor);
    sessionStorage.setItem("results", JSON.stringify(results));
    window.location = '/floorplan';
}

// set value for the personnel search, put in sessionStorage
function update_param_person() {
    var floorRaw = document.getElementById('location').innerHTML;
    var floorNoLocation = floorRaw.substr(floorRaw.indexOf(": ") + 1);
    var building = floorNoLocation.split('-')[0];
    var floor = floorNoLocation.split('-')[1][0];
    var location = building + '-' + floor;
    var badge_id = sessionStorage.getItem('badge_id')
    var q = {"query": {"bool": {"filter": [{"nested": {"path": "people", "query": {"bool": {"must": [{"match": {"people.badge": badge_id}}]}}}}]}}};
    sessionStorage.setItem("id", location.trim());
    sessionStorage.setItem("results", JSON.stringify(results));
    sessionStorage.setItem("query", JSON.stringify(q));
    window.location = '/floorplan';
}

//ANGULAR CONTROLLERS
var app = angular.module('query', ['ngCookies']);
app.controller('QueryController', function($scope, $rootScope, $cookies, $cookieStore) {

    space_types = {
        "check_mechanical" : 'Mechanical',
        "check_floor" : 'Floor Compartments',
        "check_escape" : 'Escape Pod',
        "check_cockpit" : 'Cockpit',
        "check_cargo": 'Cargo Bay'
    }

    //show zeroes initially
    $scope.master = [];
    $scope.totalResults = 0;
    $scope.totalFloors = 0;
    $scope.displayText = "";  
    results = [];
    if($cookies.get('back')){
        $cookies.remove('back')
        back()
        showResults()
    }
    function back()
    {
        refillParams = JSON.parse(sessionStorage.getItem('autorefill'));
        tableValues = JSON.parse(sessionStorage.getItem('tableValues'));
        SpaceType = Object.keys(space_types)
        $( document ).ready(function() {
            for(i = 0; i < SpaceType.length; i++){
                document.getElementById(SpaceType[i]).checked = false
            }
            if(refillParams['checked'].length > 0){
                for(i = 0; i < refillParams['checked'].length; i++){
                    document.getElementById(refillParams['checked'][i]).checked = true
                }
            }
            delete refillParams['checked'];
            console.log(refillParams)
            enteredVal = Object.keys(refillParams);
            for(i = 0; i < enteredVal.length; i++){
                document.getElementById(enteredVal[i]).value = refillParams[enteredVal[i]];
            }
            console.log( "ready!" );
        });
        sessionStorage.removeItem('autorefill')
        var keys = Object.keys(tableValues);
        var i, len = keys.length;

        keys.sort();

        for (var i in keys){
            var result = {};
            result.floor = keys[i];
            result.count = tableValues[keys[i]];
            $scope.master.push(result);
        }
          
        for (var i=0; i<$scope.master.length; i++){
            $scope.totalResults += $scope.master[i].count;
            $scope.totalFloors += 1;
        }
        if($scope.totalResults == 0){
            $scope.displayText = "No results found."
        }
    }

    $scope.update = function(user, room, queryType, self) {
        var barchart = [];
        var chartValues = [];
        $scope.totalResults = 0;
        $scope.totalFloors = 0;
        $scope.master = [];
        $scope.displayText = "";
        self = self || 0; // optional argument for fire extinguisher insight page
        
        var tableValues = {};
        results = []; //holds spaces on lab that match Type of Space selections
        var foundRoom = false;
        var foundFloor = false;
        
        //################################
        // Elastic querystring building
        //################################

        // Elastic 2.0
        var q = {"query": {"bool": {"filter": [], "should": [], "minimum_should_match": 1}}, "size":0, "aggs":{"agg1":{"terms":{"field":"building","size":0}, "aggs":{"agg2":{"terms":{"field":"floor"}}}}}}

        var refillItems = {}
        refillItems['checked'] = []
        function querify_checkboxes(field, checklist){
            var first_fire = true;
            for (var x = 0; x < Object.keys(checklist).length; x++){
                
                var div = Object.keys(checklist)[x]
                if (document.getElementById(div).checked){
                    refillItems['checked'].push(div)
                    if (field.indexOf("space") > -1){
                        //console.log(div)
                        q.query.bool.should.push({ "match" : { [field] : checklist[div] } })    
                    }                  
                }
            }
        }
        // Space types 
        querify_checkboxes("spaceType", space_types)  

        // Multiple people assigned to space
        if(document.getElementById("check_multiple").checked){
            refillItems['checked'].push("check_multiple")
            q.query.bool.filter.push({ "range" : { "num_people" : { "gte": 2 } } });
        }

        // Minimum square footage
        if(parseInt(document.getElementById("minSqft").value)){
            refillItems['minSqft'] = document.getElementById("minSqft").value
            q.query.bool.filter.push( { "range" : { "squareFeet" : { "gte" : parseInt(document.getElementById("minSqft").value) } } } )
            // q.query.bool.minimum_should_match += 1
        }

        //Allocated org
        if(document.getElementById("org").value != ""){
            query_terms = [];
            var raw_own = document.getElementById("org").value;
            refillItems['org'] = raw_own

            q.query.bool.filter.push( { "regexp" : { "spaceSection" : raw_own} } );
        }

        //People
        if (document.getElementById("badge").value != ""){
            var person = document.getElementById("badge").value;
            refillItems['badge'] = person
            var badge = person.substring(person.indexOf('(')+1,person.indexOf(')'));
            q.query.bool.filter.push( { "nested" : { "path" : "people", "filter" : { "bool": { "must": [ { "match": { "people.badge" : badge } } ] } } } });
        }

        //Building
        if (document.getElementById("building").value != ""){
            var buildy = document.getElementById("building").value;
            refillItems['building'] = buildy
            q.query.bool.filter.push( { "bool": { "must": [ { "match": { "building" : buildy } } ] } });
        }
        sessionStorage.setItem('autorefill', JSON.stringify(refillItems))
        sessionStorage.setItem("query", JSON.stringify(q));


        //#########################
        // Elastic query
        //#########################
        $.ajax({
            method: "POST",
            url: "/query",
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(q),
            async: false,
            complete: function(results){

                results = JSON.parse(results.responseText)

                console.log(results)

                var buildings = results.aggregations.agg1.buckets;
                
                for(var x=0; x < buildings.length; x++){
                    for(var y=0; y < buildings[x].agg2.buckets.length; y++){

                        // If minimum results field is set, only grab aggregations that satisfy
                        if(parseInt(document.getElementById("minResult").value) && 
                            buildings[x].agg2.buckets[y].doc_count > parseInt(document.getElementById("minResult").value)){
                            
                            if(tableValues[buildings[x].key + "-" + buildings[x].agg2.buckets[y].key] == undefined){
                                
                                tableValues[buildings[x].key + "-" + buildings[x].agg2.buckets[y].key] = buildings[x].agg2.buckets[y].doc_count;
                            
                            } 
                        } else if (!(parseInt(document.getElementById("minResult").value))){
                            if(tableValues[buildings[x].key + "-" + buildings[x].agg2.buckets[y].key] == undefined){
                                
                                tableValues[buildings[x].key + "-" + buildings[x].agg2.buckets[y].key] = buildings[x].agg2.buckets[y].doc_count;
                            
                            }
                        }
                    }
                }
            }
        })

        sessionStorage.setItem("tableValues", JSON.stringify(tableValues));

        console.log(tableValues)

        var keys = Object.keys(tableValues);
        var i, len = keys.length;

        keys.sort();

        for (var i in keys){
            if(user){
                if ((user.spaces != undefined && user.spaces != "") && tableValues[i] < user.spaces){}
                else {
                    var result = {};
                    result.floor = keys[i];
                    result.count = tableValues[keys[i]];
                    $scope.master.push(result);
                }
            }
            else{
                var result = {};
                result.floor = keys[i];
                result.count = tableValues[keys[i]];
                $scope.master.push(result);

            }
        }
          
        for (var i=0; i<$scope.master.length; i++){
            $scope.totalResults += $scope.master[i].count;
            $scope.totalFloors += 1;
        }
        if($scope.totalResults == 0){
            $scope.displayText = "No results found."
        }
    }; 

    // draw the barchart
        $("#chart-view").on("click", function(){
            document.getElementById("search-result-container").style.display = "none";
            document.getElementById("results-barchart").style.display= "block";
            drawBar();
        })

        $("#grid-view").on("click", function(){
            document.getElementById("search-result-container").style.display = "flex";
            document.getElementById("results-barchart").style.display= "none";
            drawBar();
        })
});



