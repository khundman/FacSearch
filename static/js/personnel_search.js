/* ======================================================================================================== 
Copyright 2015, by the California Institute of Technology. ALL RIGHTS RESERVED. 
United States Government Sponsorship acknowledged. Any commercial use must be negotiated with 
the Office of Technology Transfer at the California Institute of Technology.
This software may be subject to U.S. export control laws. By accepting this software, 
the user agrees to comply with all applicable U.S. export laws and regulations. 
User has the responsibility to obtain export licenses, or other export authority as may be 
required before exporting such information to foreign countries or providing access to foreign persons. 
===========================================================================================================*/

// create a json object to store all the data
var badge_info = {};
// create a json object to store the building data
var building_info = {};

// name search autocomplete
$(function() {
    $( "#badge" ).autocomplete({
        source: function (request, response) {
            var list = []
            for(var i = 0; i < personlist.length; i++){
                if(~personlist[i].toLowerCase().indexOf(request.term.toLowerCase())){
                    list.push(personlist[i])
                }
            }
            console.log(personlist);
            if(list.length === 0){
                list.push("No Person Found")
            }
            response(list)
        },
        minLength: 1
    });
});


function filter_badge_id(dataSource1, dataSource2) {

    // get the total amount of buildings
    var max_index_buildings = Object.keys(dataSource2).length;
    // loop through and process the data
    for (i = 0; i < max_index_buildings; i++) {
        // if the buildings id is not empty
        if (dataSource2[i]['locID'] != '') {
            // get the building id
            var building_id = dataSource2[i]['locID'];
            // get the associated attributes
            var building_name = dataSource2[i]['locName'];
            var centerLat = dataSource2[i]['centerLat'];
            var centerLng = dataSource2[i]['centerLng'];
            // create the json object
            building_info[building_id] = {
                'buildingName': building_name,
                'lat': centerLat,
                'lng': centerLng
            };
        }
    }
    // get the total amount of elements for the feed
    var max_index_rawdata = Object.keys(dataSource1['people']['map']).length;
    // loop through and process the data
    for (i = 0; i < max_index_rawdata; i++) {
        for (var z = 0; z < dataSource1['people']['map'][i]['people'].length; z++){
             // if the badge ids are not empty or na
            if (dataSource1['people']['map'][i]['people'][z]['badge'] != ''
                && dataSource1['people']['map'][i]['people'][z]['badge'] != 'n/a') {
                // push the badge id to the badge array
                var badge_id = dataSource1['people']['map'][i]['people'][z]['badge'];
                // push information associated with each badge as a json object
                var firstname = dataSource1['people']['map'][i]['people'][z]['firstname'];
                var lastname = dataSource1['people']['map'][i]['people'][z]['lastname'];
                var title = dataSource1['people']['map'][i]['people'][z]['title'];
                var personDeptName = dataSource1['people']['map'][i]['people'][z]['personDeptName'];
                var building = dataSource1['people']['map'][i]['building'];
                if (building_info[building] != undefined) {
                    var buildingName = building_info[building]['buildingName'];
                    var lat = building_info[building]['lat'];
                    var lng = building_info[building]['lng'];
                }
                else {
                    buildingName = 'not available';
                    lat = 'not available';
                    lng = 'not available';
                }
                var floor = dataSource1['people']['map'][i]['floor'];
                var room = dataSource1['people']['map'][i]['room'];
                var email = dataSource1['people']['map'][i]['people'][z]['email'];
                var phone = dataSource1['people']['map'][i]['people'][z]['phone'];
                // replace '' and 'n/a' with not available
                if (firstname == 'n/a' || firstname == '') { firstname = 'not available' }
                if (lastname == 'n/a' || lastname == '') { lastname = 'not available' }
                if (title == 'n/a' || title == '') { title = 'not available' }
                if (personDeptName == 'n/a' || personDeptName == '') { personDeptName = 'not available' }
                if (building == 'n/a' || building == '') { building = 'not available' }
                if (floor == 'n/a' || floor == '') { floor = 'not available' }
                if (room == 'n/a' || room == '') { room = 'not available' }
                if (email == 'n/a' || email == '') { email = 'not available' }
                if (phone == 'n/a' || firstname == '') { phone = 'not available' }
                // create the json object
                badge_info = {
                    'firstName': firstname,
                    'lastName': lastname,
                    'title': title,
                    'personDeptName': personDeptName,
                    'buildingID': building,
                    'buildingName': buildingName,
                    'floor': floor,
                    'room': room,
                    'lat': lat,
                    'lng': lng,
                    'email': email,
                    'phone': phone
                };
            }
        }    
    }
}



// load the mapbox webGL API for use in result mapping
if (!mapboxgl.supported()) {
    alert('Your browser does not support Mapbox GL');
} else {
    mapboxgl.accessToken = 'pk.eyJ1IjoidmNvbnN0YW4iLCJhIjoiY2lweTZpMW8xMHg4OWZ1bTJ2dnlmYzgzOCJ9.diXKj0iv-U-pJ1Pb-BvWrA';
    var map = new mapboxgl.Map({
        container: 'map', // container id
        style: 'mapbox://styles/mapbox/satellite-v9', // stylesheet location
        center: [-118.1713293, 34.200218], // starting position
        zoom: 14 // starting zoom
    });
    map.addControl(new mapboxgl.Navigation()); // add zoom and orientation controls
}

// enter activation for search bar entry
function personnel_search_enter(event) {
    if (event.which == 13 || event.keyCode == 13) {
        personnel_search();
    }
}

function get_badge_info() {
    // grab the name and badge id clicked in the search bar
    var search_query = document.getElementById('badge').value;
    // retrieve the badge id from the search bar entry using regular expressions
    var regExp = /\(([^)]+)\)/;
    var matches = regExp.exec(search_query);
    var badge_id = matches[1];
    sessionStorage.setItem("badge_id", badge_id);
    var q = {"query": {"bool": {"filter": [{"nested": {"path": "people", "query": {"bool": {"must": [{"match": {"people.badge": badge_id}}]}}}}]}}}
    var people = [];
    var person = {};
    var floor = "";
    var room = "";
    var building = "";
    $.ajax({
        method: "POST",
        url: "/query",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(q),
        async: false,
        complete: function(response){
            var data = JSON.parse(response.responseText)["hits"]["hits"][0]["_source"]
            people = data["people"];
            for(var i = 0; i < people.length; i++){
                if(people[i].badge == badge_id){
                    person = people[i];
                    break;
                }
            }
            floor = data["floor"];
            room = data["room"];
            building = data["building"]
        }
    });
    q = {"query": {"match": {"locID": building}}}
    var lat = "";
    var long = "";
    badge_info = {
        'firstName': person.firstname,
        'lastName': person.lastname,
        'title': person.title,
        'personDeptName': person.personDeptName,
        'buildingID': "Millenium Falcon",
        'buildingName': "Millenium Falcon",
        'floor': floor,
        'room': room,
        'lat': lat,
        'lng': long,
        'email': person.email,
        'phone': person.cellphone
    };
    return badge_info;
}

// result population for personnel search
var map_tooltip;
function personnel_search() {
    //ajax call to elastic to get person data
    //map person data to "badge_info"
    badge_info = get_badge_info();

    // grab the name and badge id clicked in the search bar
    // var search_query = document.getElementById('badge').value;
    // // retrieve the badge id from the search bar entry using regular expressions
    // var regExp = /\(([^)]+)\)/;
    // var matches = regExp.exec(search_query);
    // var badge_id = matches[1];
    // retrieve and return the requested info from the badges array
    // populate the results in the DOM
    document.getElementById('fullname').innerHTML = String(
        badge_info['firstName'] +
        ' ' +
        badge_info['lastName']);
    document.getElementById('title').innerHTML = String(
        'Title: ' +
        badge_info['title']
    );
    document.getElementById('location').innerHTML = String( //document.getElementById('css-typing').href
        'Location: ' +
        badge_info['buildingID'] +
        '-' +
        badge_info['room']
    );
    document.getElementById('email_link').innerHTML = String(
        badge_info['email']
    ).toLowerCase();
    document.getElementById('email_link').href = "mailto:" + String(
        badge_info['email']
    ).toLowerCase();
    document.getElementById('phone_link').innerHTML = String(
        badge_info['phone']
    );
    document.getElementById('phone_link').href = "tel:" + String(
        badge_info['phone']
    );
    document.getElementById('where').innerHTML = String(
        badge_info['firstName'] +
        ' is in building ' +
        badge_info['buildingID'] +
        ' room ' +
        badge_info['room']
    );
    // show the location title and map of where the person is, and other information
    document.getElementById('personnel-search-results').style.visibility="visible";
    document.getElementById('where').style.visibility="visible";
    document.getElementById('personnel-map').style.visibility="visible";
    document.getElementById('location-menu').style.display="block";
    //document.getElementById('personnel-image').style.visibility="visible";
    // fly to a map location and show relevant information to the user
    map.flyTo({
        center: [-118.169965, 34.202397], // personnel latitude and longitude
        zoom: 16, // zoom level
        speed: 0.3 // speed of map panning
    });
    try {
        map_tooltip.remove();
    }
    catch(e) {
        console.log(e);
    }
    map_tooltip = new mapboxgl.Popup({closeOnClick: false})
        .setLngLat([badge_info['lng'], badge_info['lat']])
        .setHTML(badge_info['firstName'] + ' ' + badge_info['lastName'] + ': ' +
            badge_info['buildingID'] + '-' + badge_info['room'])
        .addTo(map);
    map.resize()
}