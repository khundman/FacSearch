/* ======================================================================================================== 
Copyright 2015, by the California Institute of Technology. ALL RIGHTS RESERVED. 
United States Government Sponsorship acknowledged. Any commercial use must be negotiated with 
the Office of Technology Transfer at the California Institute of Technology.
This software may be subject to U.S. export control laws. By accepting this software, 
the user agrees to comply with all applicable U.S. export laws and regulations. 
User has the responsibility to obtain export licenses, or other export authority as may be 
required before exporting such information to foreign countries or providing access to foreign persons. 
===========================================================================================================*/

function barFloor() {
    // console.log(tableValues)
    // console.log(results)

    var results = JSON.parse(sessionStorage.getItem("tableValues"));

    try {
        //build array for stacked bar chart
        document.getElementById("chart-error").innerHTML = "";
        document.getElementById("chart-title").innerHTML = "Number of Query Results per Building";
        document.getElementById("barchart-legend").style.visibility = "visible";

        var chartValues = [];
        var a = 0; //index assigned to object in chart values where buildings match 
        for (var i = 0; i < Object.keys(results).length; i++) {
            var bldg = Object.keys(results)[i].split("-")[0];
            var flr = Object.keys(results)[i].split("-")[1];
            var cnt = results[bldg + "-" + flr];

            var buildingCreated = false;
            var newObj = {};
            for (var j = 0; j < chartValues.length; j++) {
                if (chartValues[j].building == bldg) {
                    buildingCreated = true;
                    a = j
                }
            }
            if (buildingCreated == true) {
                if (chartValues[a][flr] != undefined) {
                    chartValues[a][flr] += cnt ;
                }
                else {
                    chartValues[a][flr] = cnt;
                }
            }
            else {
                newObj['building'] = bldg;
                newObj[flr] = cnt;
                chartValues.push(newObj)
            }
        }
        var barChartList = ["B", "1", "2", "3", "4", "5", "6", "7", "8"];
        for (i = 0; i < chartValues.length; i++) {
            for (j = 0; j < barChartList.length; j++) {
                if (chartValues[i][barChartList[j]] == undefined) {
                    chartValues[i][barChartList[j]] = 0;
                }
            }

        }
    }
    catch (err) {
        document.getElementById("chart-error").innerHTML = "Error: Not enough data to draw chart. Use grid view.";
        document.getElementById("chart-title").innerHTML = "";
        document.getElementById("barchart-legend").style.visibility = "hidden";
    }
    return chartValues;
}

function drawBar() {

    var chartValues = barFloor();
    var barChartList = ["1", "2", "3", "4", "5", "6", "7", "8", "B"];

    var w = 1200,
        h = 520,
        p = [20, 65, 55, 20],
        x = d3.scale.ordinal().rangeRoundBands([0, w - p[1] - p[3]]),
        x = d3.scale.ordinal()
            .domain(chartValues)
            .rangeRoundBands([0, w - p[1] - p[3]]),
        y = d3.scale.linear().range([0, h - p[0] - p[2]]),
        z = d3.scale.category20(),
        format = d3.format("r");

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")

    d3.select('#results-barchart').selectAll('svg').remove(); 

    var svg2 = d3.select("#results-barchart").append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .append("g")
        .attr("transform", "translate(" + p[3] + "," + (h - p[2]) + ")");

    if (chartValues.length > 0) {
        var data = chartValues;
        var spaces = d3.layout.stack()(barChartList.map(function (space) {
            return data.map(function (d) {
                return {x: d.building, y: d[space], z: space};
            });
        }));

        x.domain(spaces[0].map(function (d) {
            return d.x;
        }));
        y.domain([0, d3.max(spaces[spaces.length - 1], function (d) {
            return d.y0 + d.y;
        })]);

        // Add y-axis rules first to avoid drawing over the bars.
        var rule = svg2.selectAll("g.rule")
            .data(y.ticks(5))
            .enter().append("svg:g")
            .attr("class", "rule")
            .attr("transform", function (d) {
                return "translate(0," + -y(d) + ")";
            });

        rule.append("svg:line")
            .attr("x2", w - p[1] - p[3])
            .style("stroke", function (d) {
                return d ? "#E0E0E0" : "#000";
            })
            .style("stroke-opacity", function (d) {
                return d ? .7 : null;
            });

        rule.append("svg:text")
            .attr("x", w - p[1] - p[3] + 6)
            .attr("dy", ".35em")
            .attr("fill", "#777")
            .text(d3.format("r"));

        svg2.append("g")
            .attr("text-anchor", "start")
            .attr("font-family", "'Lato', sans-serif")
            .attr("font-size", "0.8em")
            .attr("dy", ".75em")
            .attr("fill", "#777")
            .call(xAxis)
            .selectAll("text")  
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d) {
                    return "rotate(-65)" 
                    });

        var space = svg2.selectAll("g.space")
            .data(spaces)
            .enter().append("svg:g")
            .attr("class", "space")
            .attr("class", "space")
            .style("fill", function (d, i) {
                return z(i);
            })
            .style("stroke", function (d, i) {
                return d3.rgb(z(i)).darker();
            });

        // Add rects.
        var rect = space.selectAll(".rect")
            .data(Object)
            .enter().append("svg:rect")
            .attr("x", function (d) {
                return x(d.x);
            })
            .attr("class", "bar")
            .attr("y", function (d) {
                return -y(d.y0) - y(d.y);
            })
            .attr("height", function (d) {
                return y(d.y);
            })
            .attr("width", x.rangeBand())
            .attr("id", function (d) {
                return d.x + '-' + d.z
            })
            .attr("onclick", "update_param_chart(this)");

    }
}



