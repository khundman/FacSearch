/* ======================================================================================================== 
Copyright 2015, by the California Institute of Technology. ALL RIGHTS RESERVED. 
United States Government Sponsorship acknowledged. Any commercial use must be negotiated with 
the Office of Technology Transfer at the California Institute of Technology.
This software may be subject to U.S. export control laws. By accepting this software, 
the user agrees to comply with all applicable U.S. export laws and regulations. 
User has the responsibility to obtain export licenses, or other export authority as may be 
required before exporting such information to foreign countries or providing access to foreign persons. 
===========================================================================================================*/

// avoiding client side ES6 for now due to back compatibility concerns (i.e. .includes)
function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

var allInfo;



function prepScorecard() {
    

    // summary level attributes
    var numBuildings = [];
    var orgs = [];
    var totSqFt = [];
    var SqFtPerson = [];
    var numPeople = [];

    q = {"aggs":{"agg1":{"terms":{"field":"spaceSection","size":0},"aggs":{}}}};
    q.aggs.agg1.aggs["sf"] = {"sum":{"field":"squareFeet"}}
    q.aggs.agg1.aggs["num_people"] = {"sum":{"field":"num_people"}};
    q.aggs.agg1.aggs["num_buildings"] = {"cardinality":{"field":"building"}};
    q.aggs.agg1.aggs["labs"] = {"value_count":{"field":"building"}};

    $.ajax({
        method: "POST",
        url: "/query",
        dataType : "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(q),
        async: false,
        complete: function(response){
            org_data = response.responseJSON.aggregations.agg1.buckets;

            for (var x = 0; x < org_data.length; x++){
                if(org_data[x].key.length > 1){
                    orgs.push(org_data[x].key);
                totSqFt.push(org_data[x].sf.value)
                numPeople.push(org_data[x].num_people.value);
                numBuildings.push(org_data[x].num_buildings.value);
                }
            }
        }
    })



    var numLabs,
        numPubConferenceRooms,
        numPriConferenceRooms,
        numFireExtinguishers;

    function space_type_counts(query_value){

        q = {"query":{"bool":{"filter":[{"match":{"spaceType": query_value }}]}},"size":0,"aggs":{"agg1":{"terms":{"field":"spaceSection","size":0}}}};

        arr = new Array(orgs.length+1).join('0').split('').map(parseFloat);

        $.ajax({
            method: "POST",
            url: "/query",
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(q),
            async: false,
            complete: function(response){
                // console.log(response.responseJSON.aggregations.agg1.buckets);
                org_data = response.responseJSON.aggregations.agg1.buckets;

                for (var x = 0; x < org_data.length; x++){
                    if(org_data[x].key.length > 1){
                        arr[orgs.indexOf(org_data[x].key)] = org_data[x].doc_count;
                    }
                }                
            }
        })

        return arr;
    }

    numLabs = space_type_counts("LAB");
    numPubConferenceRooms = space_type_counts("CONFERENCE/PUBLIC");
    numPriConferenceRooms = space_type_counts("CONFERENCE/PRIVATE");

    for (var i=0; i < orgs.length; i++){
        var per_person;
        numPeople[i] == 0 ? per_person = "N/A" : per_person = Math.round(totSqFt[i]/numPeople[i]);
        SqFtPerson.push(per_person);  
    }

    // populate the table
    var table = document.getElementById('org-table-content');
    
    for (i = 0; i < orgs.length; i++) {
        // insert a row
        var row = table.insertRow(i);

        // insert cells for each attribute
        var orgCell = row.insertCell(0);
        var peopleCell = row.insertCell(1);
        var sqFtCell = row.insertCell(2);
        var sqFtPersonCell = row.insertCell(3);
        var numBuildingsCell = row.insertCell(4);
        var labCell = row.insertCell(5);
        var pubConfCell = row.insertCell(6);
        var priConfCell = row.insertCell(7);

        // create the cell text for each row
        var orgCellText = document.createTextNode(orgs[i]);
        var peopleCellText = document.createTextNode(numPeople[i]);
        var sqFtCellText = document.createTextNode(totSqFt[i]);
        var sqFtPersonCellText = document.createTextNode(SqFtPerson[i]);
        var numBuildingsCellText = document.createTextNode(numBuildings[i]);
        var labCellText = document.createTextNode(numLabs[i]);
        var pubConfCellText = document.createTextNode(numPubConferenceRooms[i]);
        var priConfCellText = document.createTextNode(numPriConferenceRooms[i]);

        // insert the data into the cells
        orgCell.appendChild(orgCellText);
        peopleCell.appendChild(peopleCellText);
        sqFtCell.appendChild(sqFtCellText);
        sqFtPersonCell.appendChild(sqFtPersonCellText);
        numBuildingsCell.appendChild(numBuildingsCellText);
        labCell.appendChild(labCellText);
        pubConfCell.appendChild(pubConfCellText);
        priConfCell.appendChild(priConfCellText);
    }
}


function gather_data(){
    var all_data = [];
    // var selectedOrg = document.getElementById('parent_org').value;
    var raw_own = document.getElementById("parent_org").value;
    // var regex;

    // // Handle double-digit directory numbers
    // if(raw_own.substring(0,2).indexOf("17") > -1 || raw_own.substring(0,2).indexOf("10") > -1 ||
    //     raw_own.substring(0,2).indexOf("11") > -1 || raw_own.substring(0,2).indexOf("18") > -1 ||
    //         raw_own.substring(0,2).indexOf("15") > -1 ){
    //     if(raw_own.indexOf("0") > -1){
    //         regex = raw_own.substring(0, raw_own.indexOf("0") + 1) + ".*";
    //     } else{
    //         regex = raw_own.substring(0, raw_own.indexOf(" ")) + ".*";
    //     }
    // } else{
    //     if(raw_own.indexOf("0") > -1){
    //         regex = raw_own.substring(0, raw_own.indexOf("0")) + ".*";
    //     } else{
    //         regex = raw_own.substring(0, raw_own.indexOf(" ")) + ".*";
    //     }
    // }
    var selectedOrg = raw_own;
    console.log(selectedOrg)

    var queries = [
        {"query": {"bool": {"filter": [{"match": {"spaceSection": selectedOrg}}, {"match": {"spaceType": "Escape Pod"}}]}}},
        {"query": {"bool": {"filter": [{"match": {"spaceSection": selectedOrg}}, {"match": {"spaceType": "Cockpit"}}]}}},
        {"query": {"bool": {"filter": [{"match": {"spaceSection": selectedOrg}}, {"nested": {"path": "people", "query": {"bool": {"must": [{"match": {"people.empType": "Human"}}]}}}}]}}},
        {"query": {"bool": {"filter": [{"match": {"spaceSection": selectedOrg}}, {"nested": {"path": "people", "query": {"bool": {"must": [{"match": {"people.empType": "Wookiee"}}]}}}}]}}}
    ];

    for(var i = 0; i < queries.length; i++){
        $.ajax({
            method: "POST",
            url: "/count",
            dataType : "json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(queries[i]),
            async: false,
            complete: function(response){
                all_data.push(JSON.parse(response.responseText).hits.total);
            }
        })
    }
    return all_data;

}

// draw the donuts for the selected organization
function displayDonuts(data) {
    var all_data = gather_data();
    var isZero = true;
    for(var i =0; i < all_data.length; i++){
        if(all_data[i] != 0){
            isZero = false;
            break;
        }
    }
    if(!isZero){
        var selectedOrg = document.getElementById('parent_org').value;

        // the basic construction of the donut
        var width = 300,
            height = 350,
            radius = Math.min(width, height) / 2;

        var color = d3.scale.ordinal()
            .range(["#0F6698", "#6AACD6"]);

        var arc = d3.svg.arc()
            .outerRadius(radius - 5)
            .innerRadius(radius - 85);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) { return d; });

        var titles = [
            ["Types of Space (num)"],
            ["Emp. Type"]
        ];

        var names = [
            ["Escape Pods", "Cockpits"],
            ["Human", "Wookiee"]
        ];

        var d = [
            [all_data[0], all_data[1]],
            [all_data[2], all_data[3]]
        ];


        try {
            $("#donut2-area").html("");
            $("#donut3-area").html("");
        }
        catch(e) {
            console.log(e);
            console.log('no previous chart');
        }
        for (var chart = 0; chart < 2; chart++) {
            var svg = d3.select("body").select("#donut" + String(chart + 1) + "-area").append("svg")
                .attr("id", "donut1")
                .style("display", "block")
                .style("margin", "auto")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", "translate(" + width / 2 + "," + ((height / 2) + 30 ) + ")");

            svg.append("text")
                .attr("x", 0)
                .attr("y", -160)
                .attr("text-anchor", "middle")
                .style("font-size", "1.2em")
                .style("font-family", "'Lato', sans-serif")
                .attr("fill", "#777")
                .text(titles[chart]);

            // load the data ad add the arc
            var g = svg.selectAll(".arc")
                .data(pie(d[chart]))
                .enter().append("g")
                .attr("class", "arc");

            g.append("path")
                .attr("d", arc)
                .style("fill", function (d, i) {
                    return color(i);
                });

            g.append("text")
                .attr("transform", function (d) {
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("dy", ".35em")
                .text(function (d, i) {
                    return names[chart][i];
                });

            g.append("text")
                .attr("transform", function (d) {
                    return "translate(" + arc.centroid(d) + ")";
                })
                .attr("dy", "1.35em")
                .text(function (d, i) {
                    return d.value;
                });
        }
    }
    else{
        try {
            $("#donut1-area").html("");
            $("#donut2-area").html("");
            $("#donut3-area").html("");
        }
        catch(e) {
            console.log(e);
            console.log('no previous chart');
        }
    }
    document.getElementById('entire-org-table').style.display="block";
}
