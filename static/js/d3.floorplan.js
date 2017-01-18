var legendStyles = "";

d3.floorplan = function () {
    function a(a) {
        var d = h.range()[1] - h.range()[0],
            n = l.range()[1] - l.range()[0];
        a.each(function (a) {
            if (a) {
                var k = d3.select(this);
                k.selectAll("defs").data([0]).enter().append("defs").each(function () {
                    var a = d3.select(this),
                        b = a.append("radialGradient").attr("id", "metal-bump").attr("cx", "50%").attr("cy", "50%").attr("r", "50%").attr("fx", "50%").attr("fy", "50%");
                    b.append("stop").attr("offset", "0%").style("stop-color", "rgb(170,170,170)").style("stop-opacity", 0.6);
                    b.append("stop").attr("offset",
                        "100%").style("stop-color", "rgb(204,204,204)").style("stop-opacity", 0.5);
                    a = a.append("pattern").attr("id", "grip-texture").attr("patternUnits", "userSpaceOnUse").attr("x", 0).attr("y", 0).attr("width", 3).attr("height", 3);
                    a.append("rect").attr("height", 3).attr("width", 3).attr("stroke", "none").attr("fill", "rgba(204,204,204,0.5)");
                    a.append("circle").attr("cx", 1.5).attr("cy", 1.5).attr("r", 1).attr("stroke", "none").attr("fill", "url(#metal-bump)")
                });
                var c = k.selectAll(".map-layers").data([0]),
                    b = c.enter().append("g").attr("class",
                        "map-layers"),
                    g = d3.transition(c);
                b.append("rect").attr("class", "canvas").attr("pointer-events", "all").style("opacity", 0);
                g.attr("width", d).attr("height", n).attr("x", h.range()[0]).attr("y", l.range()[0]);
                b = k.selectAll(".map-controls").data([0]);
                b.enter().append("g").attr("class", "map-controls");
                b.transition().duration(1E3).attr("transform", function (a, b) {
                    return "translate(0," + 20 * (e.length - (b + 1)) + ")"
                });
                c = c.selectAll(".maplayer").data(e, function (a) {
                    return a.id()
                });
                c.enter().append("g").attr("class", function (a) {
                    return "maplayer " +
                        a.title()
                }).append("g").attr("class", function (a) {
                    return a.id()
                }).datum(null);
                c.exit().remove();
                c.order();
                c.each(function (b) {
                    d3.select(this).select("g." + b.id()).datum(a[b.id()]).call(b)
                });
            }
        })
    }
    var e = [],
        f = !0,
        h = d3.scale.linear(),
        l = d3.scale.linear();
    a.xScale = function (c) {
        if (!arguments.length) return h;
        h = c;
        e.forEach(function (a) {
            a.xScale(h)
        });
        return a
    };
    a.yScale = function (c) {
        if (!arguments.length) return l;
        l = c;
        e.forEach(function (a) {
            a.yScale(l)
        });
        return a
    };
    a.panZoom = function (c) {
        if (!arguments.length) return f;
        f = c;
        return a
    };
    a.addLayer = function (c, d) {
        1 < arguments.length && 0 <= d ? e.splice(d, 0, c) : e.push(c);
        return a
    };
    return a
};
d3.floorplan.version = "0.1.0";


d3.floorplan.imagelayer = function () {
    function a(a) {
        a.each(function (a) {
            a && (a = d3.select(this).selectAll("image").data(a, function (a) {
                return a.url
            }), a.enter().append("image").attr("xlink:href", function (a) {
                return a.url
            }).style("opacity", 1E-6), a.exit().transition().style("opacity", 1E-6).remove(), a.transition().attr("x", function (a) {
                return e(a.x)
            }).attr("y", function (a) {
                return f(a.y)
            }).attr("height", function (a) {
                return f(a.y + a.height) - f(a.y)
            }).attr("width", function (a) {
                return e(a.x + a.width) - e(a.x)
            }).style("opacity",
                function (a) {
                    return a.opacity || 1
                }))
        })
    }
    var e = d3.scale.linear(),
        f = d3.scale.linear(),
        i = "fp-imagelayer-" + (new Date).valueOf(),
        h = "Floorplan";
    a.xScale = function (f) {
        if (!arguments.length) return e;
        e = f;
        return a
    };
    a.yScale = function (e) {
        if (!arguments.length) return f;
        f = e;
        return a
    };
    a.id = function () {
        return i
    };
    a.title = function (e) {
        if (!arguments.length) return h;
        h = e;
        return a
    };
    return a
};


var spaceTypes = ["Mechanical", "Escape Pod", "Cockpit", "Floor Compartments", "Cargo Bay"];
var spaceTypeAssignments = ["mechanical", "officeopen", "storage", "available", "officeclosed"];

d3.floorplan.typeOfSpace = function () {
    function a(a) {
        a.each(function (a) {
            if (a && a.map) {
                var d = d3.select(this);
                a.units ? " " != a.units.charAt(0) && (a.units = " " + a.units) : a.units = "";
                b = a.map.map(function (a) {
                        return a.value
                    }).sort(d3.ascending),
                    g, j;
                switch (f) {
                    case "quantile":
                        var g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b);
                        var j = g.quantiles();
                        break;
                    case "quantized":
                        g = d3.scale.quantize().range([1, 2, 3, 4, 5, 6]).domain([b[0], b[b.length - 1]]);
                        b = (g.domain()[1] - g.domain()[0]) / 6;
                        j = [b, 2 * b, 3 * b, 4 * b, 5 * b];
                        break;
                    case "normal":
                        var m =
                                d3.mean(b),
                            b = Math.sqrt(d3.sum(b, function (a) {
                                    return Math.pow(a - m, 2)
                                }) / b.length);
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain([m - 6 * b, m - 2 * b, m - b, m, m + b, m + 2 * b, m + 6 * b]);
                        j = g.quantiles();
                        break;
                    default:
                        var customThresholds;
                        customThresholds || (customThresholds = j), b = customThresholds, b.push(b[b.length - 1]), b.unshift(b[0]), g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b), customThresholds = j = g.quantiles()
                }
                d = d.selectAll("g.people").data([0]);
                d.enter().append("g").attr("class", "text");
                this.__colors__ && this.__colors__ != e && d.classed(this.__colors__, !1);
                d.classed(e, !0);
                this.__colors__ = e;
                b = d.selectAll("rect").data(a.map.filter(function (a) {
                    return !a.points
                }), function (a) {
                    return a.x + "," + a.y
                });

                j = b.enter().append("rect").style("opacity", 1E-6);
                b.exit().transition().style("opacity", 1E-6).remove();
                tooltip = j.append("title");
                tooltip.append('tspan').text(function (d) {
                    return d.personDeptName
                });
                b.attr("x", function (a) {
                    return i(a.x)
                }).attr("y", function (a) {
                    return h(a.y)
                }).attr("height", Math.abs(h(a.binSize) - h(0))).attr("width", Math.abs(i(a.binSize) - i(0))).attr("class", function (a) {
                    return "text"
                })
                ;
                j.transition();
                b = d.selectAll("path").data(a.map.filter(function (a) {
                    return a.points
                }), function (a) {
                    return JSON.stringify(a.points)
                });
                j = b.enter().append("path").attr("d", function (a) {
                    return l(a.points) + "Z"
                }).attr("id", function(b) {
                    return b.building + "-" + b.room;
                }).style("opacity", 1E-6)
                .on("click", function(z){
                    if(z.building + "-" + z.room in scene_group_lookup){
                        d3.select(this).attr("xlink:href", function(x) {
                            sessionStorage.setItem('scene', scene_group_lookup[x.building + "-" + x.room]);
                            sessionStorage.setItem('building', x.building);
                            sessionStorage.setItem('room', x.room);
                            window.location = "/threesixty";
                        })
                    }
                    else{
                        console.log("360 not available for " + z.building + "-" + z.room)
                    }
                });
                b.exit().transition().style("opacity", 1E-6).remove();
                var tooltip = j.append("title");
                b.attr("class", function (a) { //Color code based on type of space
                    for (z = 0; z < spaceTypes.length; z++) {
                        if (a.spaceType == spaceTypes[z]) {
                            return spaceTypeAssignments[z];
                        }
                    }
                }).select("title").append('tspan').text(function (d) {
                    return "Section: " + d.personDeptName
                });
                var html;
                tooltip.html(function (d) {
                    html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                        "<br>Allocated to Org: " + d.spaceSection;

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personOrg1 +
                            "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname +
                            "<br>Cell: " + d.people[q].cellphone + "<br>Employee Type: " + d.people[q].empType + 
                            "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }
                    return html
                });
                j.transition().style("opacity", 1);
                d = d.selectAll("text").data(a.map.filter(function (a) {
                        return a.points
                    }),
                    function (a) {
                        return JSON.stringify(a.points)
                    });
                b = d.enter().append("text").style("font-weight", "bold").attr("text-anchor", "middle").style("opacity", 1E-6);
                d.exit().transition().style("opacity", 1E-6).remove();
                z = d.attr("transform", function (a) {
                    for (var b = 0, d = 0, j = 0, g = 0; g < a.points.length; ++g) var c = a.points[g],
                        k = a.points[g + 1] || a.points[0],
                        e = c.x * k.y - k.x * c.y,
                        b = b + (c.x + k.x) * e,
                        d = d + (c.y + k.y) * e,
                        j = j + e;
                    j = j / 2;
                    d = d / (6 * j);
                    return "translate(" + i(b / (6 * j)) + "," + h(d - 1) + ")"; //changed d+1 to d-1 to move text up
                }).text(function (b) { //Text to be show in in center of rectangle
                    return b.room;
                })
                    .attr("y", 0)
                    .attr("font-size", "1.9em");
                d.append("tspan")
                    .attr("dy", "1em")
                    .attr("font-size", "0.7em")
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .text(function (b) {
                        return b.spaceType
                    })
                    .attr("font-size", "2.5pt");
                b.transition().style("opacity",
                    0.6);
                d.append("title").html(function(d){
                        html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                        "<br>Allocated to Org: " + d.spaceSection;

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personOrg1 +
                            "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname +
                            "<br>Cell: " + d.people[q].cellphone + "<br>Employee Type: " + d.people[q].empType + 
                            "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }

                    return html
                });
            }
        })
    }
    var e = "Type",
        f = "quantile",
        i = d3.scale.linear(),
        h = d3.scale.linear(),
        l = d3.svg.line().x(function (a) {
            return i(a.x)
        }).y(function (a) {
            return h(a.y)
        }),
        c = d3.format('.4n'),
        d = "fp-type",
        n = "Type";
    a.xScale = function (d) {
        if (!arguments.length) return i;
        i = d;
        return a
    };
    a.yScale = function (d) {
        if (!arguments.length) return h;
        h = d;
        return a
    };
    a.colorSet = function (d) {
        if (!arguments.length) return e;
        e = d;
        return a
    };
    a.colorMode = function (d) {
        if (!arguments.length) return f;
        f = d;
        return a
    };
    var customThresholds;
    a.customThresholds =
        function (d) {
            if (!arguments.length) return customThresholds;
            customThresholds = d;
            return a
        };
    a.id = function () {
        return d
    };
    a.title = function (d) {
        if (!arguments.length) return n;
        n = d;
        return a
    };
    return a
};

d3.floorplan.orgOwner = function () {
    function a(a) {
        a.each(function (a) {
            if (a && a.map) {
                var d = d3.select(this);
                a.units ? " " != a.units.charAt(0) && (a.units = " " + a.units) : a.units = "";
                b = a.map.map(function (a) {
                        return a.value
                    }).sort(d3.ascending),
                    g, j;
                switch (f) {
                    case "quantile":
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b);
                        j = g.quantiles();
                        break;
                    case "quantized":
                        g = d3.scale.quantize().range([1, 2, 3, 4, 5, 6]).domain([b[0], b[b.length - 1]]);
                        b = (g.domain()[1] - g.domain()[0]) / 6;
                        j = [b, 2 * b, 3 * b, 4 * b, 5 * b];
                        break;
                    case "normal":
                        var m =
                                d3.mean(b),
                            b = Math.sqrt(d3.sum(b, function (a) {
                                    return Math.pow(a - m, 2)
                                }) / b.length);
                        var g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain([m - 6 * b, m - 2 * b, m - b, m, m + b, m + 2 * b, m + 6 * b]);
                        var j = g.quantiles();
                        break;
                    default:
                        var customThresholds;
                        (customThresholds = j), b = customThresholds, b.push(b[b.length - 1]), b.unshift(b[0]), g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b), customThresholds = j = g.quantiles()
                }
                d = d.selectAll("g.people").data([0]);
                console.log(d);
                d.enter().append("g").attr("class", "text");
                this.__colors__ && this.__colors__ != e && d.classed(this.__colors__, !1);
                d.classed(e, !0);
                this.__colors__ = e;
                b = d.selectAll("rect").data(a.map.filter(function (a) {
                    return !a.points
                }), function (a) {
                    return a.x + "," + a.y
                });

                j = b.enter().append("rect").style("opacity", 1E-6);
                b.exit().transition().style("opacity", 1E-6).remove();
                tooltip = j.append("title");
                tooltip.append('tspan').text(function (d) {
                    return d.spaceSection
                });
                b.attr("x", function (a) {
                    return i(a.x)
                }).attr("y", function (a) {
                    return h(a.y)
                }).attr("height", Math.abs(h(a.binSize) - h(0))).attr("width", Math.abs(i(a.binSize) - i(0))).attr("class", function () {
                    return "text"
                })
                ;
                j.transition();
                b = d.selectAll("path").data(a.map.filter(function (a) {
                    return a.points
                }), function (a) {
                    return JSON.stringify(a.points)
                });
                j = b.enter().append("path").attr("d", function (a) {
                    return l(a.points) + "Z"
                }).attr("id", function(b) {
                    return b.building + "-" + b.room;
                }).style("opacity", 1E-6)
                .on("click", function(z){
                    if(z.building + "-" + z.room in scene_group_lookup){
                        d3.select(this).attr("xlink:href", function(x) {
                            sessionStorage.setItem('scene', scene_group_lookup[x.building + "-" + x.room]);
                            sessionStorage.setItem('building', x.building);
                            sessionStorage.setItem('room', x.room);
                            window.location = "/threesixty";
                        })
                    }
                    else{
                        console.log("360 not available for " + z.building + "-" + z.room)
                    }
                });
                b.exit().transition().style("opacity", 1E-6).remove();
                tooltip = j.append("title");
                //------------------------
                // RANDOMLY ASSIGN COLORS (borrowed styles from space type)
                //------------------------
                var stylesAvailable = ["officeopen", "officeclosed", "storage", "tech", "lab", "mechanical",
                    "publicconf", "privateconf", "circulation", "training", "warehouse", "custodial", "misc", "execopen",
                    "execclosed", "construction", "operational", "shop", "additional1", "additional2",
                    "additional3", "additional4", "additional5", "additional6", "additional7", "additional8", ""];
                var stylesUsed = 0;
                var assignedOrgs = {};
                b.attr("class", function (a) { //Color code based on type of space
                    if (assignedOrgs.hasOwnProperty(a.spaceSection) == false && stylesUsed <= stylesAvailable.length) {
                        assignedOrgs[a.spaceSection] = stylesAvailable[stylesUsed];
                        stylesUsed += 1;
                        console.log(assignedOrgs[a.spaceSection]);
                        return assignedOrgs[a.spaceSection];
                    }
                    else if (a.spaceSection == "") {
                        assignedOrgs["None"] = "nomatch";
                        return "nomatch"
                    }
                    else if (stylesUsed <= stylesAvailable.length) {
                        return assignedOrgs[a.spaceSection];
                    }
                })
                .select("title").append('tspan').text(function (d) {
                    return "Section: " + d.spaceSection
                });
                legendStyles = assignedOrgs;
                //------------------------
                var html;
                tooltip.html(function (d) {
                    html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                        "<br>Allocated to Org: " + d.spaceSection

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personDeptName +
                        "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname + "<br>Badge: " + d.people[q].badge +
                        "<br>Username: " + d.people[q].username + "<br>Email: " + d.people[q].email + "<br>Phone: " + d.people[q].phone +
                        "<br>Cell: " + d.people[q].cellphone + "<br>Start Date: " + d.people[q].empStartDate + "<br>Manager uid: " + d.people[q].manager +
                        "<br>Employee Type: " + d.people[q].empType + "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }

                    return html
                });
                j.transition().style("opacity", 1);
                d = d.selectAll("text").data(a.map.filter(function (a) {
                        return a.points
                    }),
                    function (a) {
                        return JSON.stringify(a.points)
                    });
                b = d.enter().append("text").style("font-weight", "bold").attr("text-anchor", "middle").style("opacity", 1E-6);
                d.exit().transition().style("opacity", 1E-6).remove();
                z = d.attr("transform", function (a) {
                    for (var b = 0, d = 0, j = 0, g = 0; g < a.points.length; ++g) var c = a.points[g],
                        k = a.points[g + 1] || a.points[0],
                        e = c.x * k.y - k.x * c.y,
                        b = b + (c.x + k.x) * e,
                        d = d + (c.y + k.y) * e,
                        j = j + e;
                    j = j / 2;
                    d = d / (6 * j);
                    return "translate(" + i(b / (6 * j)) + "," + 0.985 * h(d - 1) + ")" //changed d+1 to d-1 to move text up
                }).text(function (b) { //Text to be show in in center of rectangle
                    return b.room;
                })
                    .attr("y", 4)
                    .attr("font-size", "1.9em");
                d.append("tspan")
                    .attr("dy", "1em")
                    .attr("font-size", "0.7em")
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .text(function (b) {
                        return b.lastname
                    });
                d.append("tspan")
                    .attr("dy", "1em")
                    .attr("font-size", "0.65em")
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .text(function (b) {
                        return b.squareFeet + " sqft"
                    });
                b.transition().style("opacity",
                    0.6);
                d.append("title").html(function(d){
                    html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                        "<br>Allocated to Org: " + d.spaceSection

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personDeptName +
                        "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname + "<br>Badge: " + d.people[q].badge +
                        "<br>Username: " + d.people[q].username + "<br>Email: " + d.people[q].email + "<br>Phone: " + d.people[q].phone +
                        "<br>Cell: " + d.people[q].cellphone + "<br>Start Date: " + d.people[q].empStartDate + "<br>Manager uid: " + d.people[q].manager +
                        "<br>Employee Type: " + d.people[q].empType + "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }

                    return html
                });
            }
        })
    }

    var e = "Type",
        f = "quantile",
        i = d3.scale.linear(),
        h = d3.scale.linear(),
        l = d3.svg.line().x(function (a) {
            return i(a.x)
        }).y(function (a) {
            return h(a.y)
        }),
        c = d3.format(".4n"),
        d = "fp-type",
        n = "Type";
    a.xScale = function (d) {
        if (!arguments.length) return i;
        i = d;
        return a
    };
    a.yScale = function (d) {
        if (!arguments.length) return h;
        h = d;
        return a
    };
    a.colorSet = function (d) {
        if (!arguments.length) return e;
        e = d;
        return a
    };
    a.colorMode = function (d) {
        if (!arguments.length) return f;
        f = d;
        return a
    };
    a.customThresholds =
        function (d) {
            if (!arguments.length) return customThresholds;
            customThresholds = d;
            return a
        };
    a.id = function () {
        return d
    };
    //RETURN ASSIGNED LEGEND STYLES
    a.styling = function () {
        return legendStyles;
    };
    //----------------------------
    a.title = function (d) {
        if (!arguments.length) return n;
        n = d;
        return a
    };
    return a
};

var fireExtinguishers = [undefined, "CO2", "HALON", "HALOTRON", "METALX", "DC", "WATER"];
var fireExtinguisherAssignments = ["NONE", "CO2", "HALON", "HALOTRON", "METALX", "DC", "WATER"];

d3.floorplan.fire = function () {
    function a(a) {
        a.each(function (a) {
            if (a && a.map) {
                var d = d3.select(this);
                a.units ? " " != a.units.charAt(0) && (a.units = " " + a.units) : a.units = "";
                var b = a.map.map(function (a) {
                        return a.value
                    }).sort(d3.ascending),
                    g, j;
                switch (f) {
                    case "quantile":
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b);
                        j = g.quantiles();
                        break;
                    case "quantized":
                        g = d3.scale.quantize().range([1, 2, 3, 4, 5, 6]).domain([b[0], b[b.length - 1]]);
                        b = (g.domain()[1] - g.domain()[0]) / 6;
                        j = [b, 2 * b, 3 * b, 4 * b, 5 * b];
                        break;
                    case "normal":
                        var m =
                                d3.mean(b),
                            b = Math.sqrt(d3.sum(b, function (a) {
                                    return Math.pow(a - m, 2)
                                }) / b.length);
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain([m - 6 * b, m - 2 * b, m - b, m, m + b, m + 2 * b, m + 6 * b]);
                        j = g.quantiles();
                        break;
                    default:
                        var customThresholds;
                        (customThresholds = j), b = customThresholds, b.push(b[b.length - 1]), b.unshift(b[0]), g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b), customThresholds = j = g.quantiles()
                }
                d = d.selectAll("g.people").data([0]);
                d.enter().append("g").attr("class", "text");
                this.__colors__ && this.__colors__ != e && d.classed(this.__colors__, !1);
                d.classed(e, !0);
                this.__colors__ = e;
                b = d.selectAll("rect").data(a.map.filter(function (a) {
                    return !a.points
                }), function (a) {
                    return a.x + "," + a.y
                });

                j = b.enter().append("rect").style("opacity", 1E-6);
                b.exit().transition().style("opacity", 1E-6).remove();
                tooltip = j.append("title");
                tooltip.append('tspan').text(function (d) {
                    return d.fireExtinguish['itemType']
                });
                b.attr("x", function (a) {
                    return i(a.x)
                }).attr("y", function (a) {
                    return h(a.y)
                }).attr("height", Math.abs(h(a.binSize) - h(0))).attr("width", Math.abs(i(a.binSize) - i(0))).attr("class", function () {
                    return "text"
                })
                ;
                j.transition();
                b = d.selectAll("path").data(a.map.filter(function (a) {
                    return a.points
                }), function (a) {
                    return JSON.stringify(a.points)
                });
                j = b.enter().append("path").attr("d", function (a) {
                    return l(a.points) + "Z"
                }).attr("id", function(b) {
                    return b.building + "-" + b.room;
                }).style("opacity", 1E-6)
                .on("click", function(z){
                    if(z.building + "-" + z.room in scene_group_lookup){
                        d3.select(this).attr("xlink:href", function(x) {
                            sessionStorage.setItem('scene', scene_group_lookup[x.building + "-" + x.room]);
                            sessionStorage.setItem('building', x.building);
                            sessionStorage.setItem('room', x.room);
                            window.location = "/threesixty";
                        })
                    }
                    else{
                        console.log("360 not available for " + z.building + "-" + z.room)
                    }
                });
                b.exit().transition().style("opacity", 1E-6).remove();
                var tooltip = j.append("title");
                b.attr("class", function (a) { //Color code based on type of fire extinguisher
                    for (z = 0; z < fireExtinguishers.length; z++) {
                        if (a.fireExtinguish['itemType'] == fireExtinguishers[z]) {
                            return fireExtinguisherAssignments[z];
                        }
                    }
                }).select("title").append('tspan').text(function (d) {
                    return "Fire Extinguisher Type: " + d.fireExtinguish['itemType']
                });
                var html;
                tooltip.html(function (d) {
                    html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                    "<br>Allocated to Org: " + d.spaceSection + "<br>Fire Extinguisher Type: " + d.fireExtinguish['itemType'] +
                        "<br>Fire Extinsguisher Service Date: " + d.fireExtinguish['lastScanDate'];

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personDeptName +
                        "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname + "<br>Badge: " + d.people[q].badge +
                        "<br>Username: " + d.people[q].username + "<br>Email: " + d.people[q].email + "<br>Phone: " + d.people[q].phone +
                        "<br>Cell: " + d.people[q].cellphone + "<br>Start Date: " + d.people[q].empStartDate + "<br>Manager uid: " + d.people[q].manager +
                        "<br>Employee Type: " + d.people[q].empType + "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }

                    return html
                });
                j.transition().style("opacity", 1);
                d = d.selectAll("text").data(a.map.filter(function (a) {
                        return a.points
                    }),
                    function (a) {
                        return JSON.stringify(a.points)
                    });
                b = d.enter().append("text").style("font-weight", "bold").attr("text-anchor", "middle").style("opacity", 1E-6);
                d.exit().transition().style("opacity", 1E-6).remove();
                z = d.attr("transform", function (a) {
                    for (var b = 0, d = 0, j = 0, g = 0; g < a.points.length; ++g) var c = a.points[g],
                        k = a.points[g + 1] || a.points[0],
                        e = c.x * k.y - k.x * c.y,
                        b = b + (c.x + k.x) * e,
                        d = d + (c.y + k.y) * e,
                        j = j + e;
                    j = j / 2;
                    d = d / (6 * j);
                    return "translate(" + i(b / (6 * j)) + "," + h(d + 1) + ")"
                }).text(function (b) { //Text to be show in in center of rectangle
                    return b.room;
                })
                    .attr("y", 0)
                    .attr("font-size", "1.9em");
                d.append("tspan")
                    .attr("dy", "1em")
                    .attr("font-size", "0.7em")
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .text(function (b) {
                        return b.fireExtinguish.itemType
                    })
                    .attr("font-size", "3pt");
                b.transition().style("opacity",
                    0.6);
                d.append("title").html(function(d){
                    html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                    "<br>Allocated to Org: " + d.spaceSection + "<br>Fire Extinguisher Type: " + d.fireExtinguish['itemType'] +
                        "<br>Fire Extinsguisher Service Date: " + d.fireExtinguish['lastScanDate']

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personDeptName +
                        "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname + "<br>Badge: " + d.people[q].badge +
                        "<br>Username: " + d.people[q].username + "<br>Email: " + d.people[q].email + "<br>Phone: " + d.people[q].phone +
                        "<br>Cell: " + d.people[q].cellphone + "<br>Start Date: " + d.people[q].empStartDate + "<br>Manager uid: " + d.people[q].manager +
                        "<br>Employee Type: " + d.people[q].empType + "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }

                    return html
                });
            }
        })
    }
    var e = "Fire Exting.",
        f = "quantile",
        i = d3.scale.linear(),
        h = d3.scale.linear(),
        l = d3.svg.line().x(function (a) {
            return i(a.x)
        }).y(function (a) {
            return h(a.y)
        }),
        c = d3.format(".4n"),
        d = "fp-fire",
        n = "Fire Exting.";
    a.xScale = function (d) {
        if (!arguments.length) return i;
        i = d;
        return a
    };
    a.yScale = function (d) {
        if (!arguments.length) return h;
        h = d;
        return a
    };
    a.colorSet = function (d) {
        if (!arguments.length) return e;
        e = d;
        return a
    };
    a.colorMode = function (d) {
        if (!arguments.length) return f;
        f = d;
        return a
    };
    var customThresholds;
    a.customThresholds =
        function (d) {
            if (!arguments.length) return customThresholds;
            customThresholds = d;
            return a
        };
    a.id = function () {
        return d
    };
    a.title = function (d) {
        if (!arguments.length) return n;
        n = d;
        return a
    };
    return a
};


d3.floorplan.fireDate = function () {
    function a(a) {
        a.each(function (a) {
            if (a && a.map) {
                var d = d3.select(this);
                a.units ? " " != a.units.charAt(0) && (a.units = " " + a.units) : a.units = "";
                var b = a.map.map(function (a) {
                        return a.value
                    }).sort(d3.ascending),
                    g, j;
                switch (f) {
                    case "quantile":
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b);
                        j = g.quantiles();
                        break;
                    case "quantized":
                        g = d3.scale.quantize().range([1, 2, 3, 4, 5, 6]).domain([b[0], b[b.length - 1]]);
                        b = (g.domain()[1] - g.domain()[0]) / 6;
                        j = [b, 2 * b, 3 * b, 4 * b, 5 * b];
                        break;
                    case "normal":
                        var m =
                                d3.mean(b),
                            b = Math.sqrt(d3.sum(b, function (a) {
                                    return Math.pow(a - m, 2)
                                }) / b.length);
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain([m - 6 * b, m - 2 * b, m - b, m, m + b, m + 2 * b, m + 6 * b]);
                        j = g.quantiles();
                        break;
                    default:
                        var customThresholds;
                        (customThresholds = j), b = customThresholds, b.push(b[b.length - 1]), b.unshift(b[0]), g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b), customThresholds = j = g.quantiles()
                }
                d = d.selectAll("g.people").data([0]);
                d.enter().append("g").attr("class", "text");
                this.__colors__ && this.__colors__ != e && d.classed(this.__colors__, !1);
                d.classed(e, !0);
                this.__colors__ = e;
                b = d.selectAll("rect").data(a.map.filter(function (a) {
                    return !a.points
                }), function (a) {
                    return a.x + "," + a.y
                });
                j = b.enter().append("rect").style("opacity", 1E-6);
                b.exit().transition().style("opacity", 1E-6).remove();
                tooltip = j.append("title");
                tooltip.append('tspan').text(function (d) {
                    return d.fireExtinguish['itemType']
                });
                b.attr("x", function (a) {
                    return i(a.x)
                }).attr("y", function (a) {
                    return h(a.y)
                }).attr("height", Math.abs(h(a.binSize) - h(0))).attr("width", Math.abs(i(a.binSize) - i(0))).attr("class", function (a) {
                    return "text"
                });
                j.transition();
                b = d.selectAll("path").data(a.map.filter(function (a) {
                    return a.points
                }), function (a) {
                    return JSON.stringify(a.points)
                });
                j = b.enter().append("path").attr("d", function (a) {
                    return l(a.points) + "Z"
                }).attr("id", function(b) {
                    return b.building + "-" + b.room;
                }).style("opacity", 1E-6)
                .on("click", function(z){
                    if(z.building + "-" + z.room in scene_group_lookup){
                        d3.select(this).attr("xlink:href", function(x) {
                            sessionStorage.setItem('scene', scene_group_lookup[x.building + "-" + x.room])
                            sessionStorage.setItem('building', x.building)
                            sessionStorage.setItem('room', x.room)
                            window.location = "/threesixty";
                        })
                    }
                    else{
                        console.log("360 not available for " + z.building + "-" + z.room)
                    }
                });
                b.exit().transition().style("opacity", 1E-6).remove();
                var tooltip = j.append("title");
                b.attr("class", function (a) { // Color code based on type of fire extinguisher service date
                    if (a.fireExtinguish['lastScanDate'] == undefined || a.fireExtinguish['lastScanDate'] == null
                        || a.fireExtinguish['lastScanDate'] == "" || a.fireExtinguish['lastScanDate'] == " ") {
                        return "NONE";
                    }
                    else if (a.fireExtinguish['lastScanDate'] != undefined) {
                        var currentDate = new Date();
                        var serviceString = (a.fireExtinguish['lastScanDate']).split(' ')[0];
                        var serviceYear = parseInt(serviceString.split('/')[0]);
                        var serviceMonth = parseInt(serviceString.split('/')[1] - 1);
                        var serviceDate = parseInt(serviceString.split('/')[2]);
                        var formattedServiceDate = new Date(serviceYear, serviceMonth, serviceDate);
                        var daysSinceService = Math.abs(currentDate - formattedServiceDate) / 86400000;

                        if (daysSinceService < 20) {
                            return "Compliant";
                        }
                        else if (daysSinceService >= 20 && daysSinceService < 30) {
                            return "Upcoming";
                        }
                        else if (daysSinceService >= 30 && daysSinceService < 45) {
                            return "NonCompliant";
                        }
                        else if (daysSinceService > 45) {
                            return "SevereNonCompliance";
                        }
                    }
                }).select("title").append('tspan').text(function (d) {
                    return "Fire Extinguisher Service Date: " + d.fireExtinguish['lastScanDate']
                });
                var html;
                tooltip.html(function (d) {
                    html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                    "<br>Allocated to Org: " + d.spaceSection + "<br>Fire Extinguisher Type: " + d.fireExtinguish['itemType'] +
                        "<br>Fire Extinsguisher Service Date: " + d.fireExtinguish['lastScanDate']

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personDeptName +
                        "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname + "<br>Badge: " + d.people[q].badge +
                        "<br>Username: " + d.people[q].username + "<br>Email: " + d.people[q].email + "<br>Phone: " + d.people[q].phone +
                        "<br>Cell: " + d.people[q].cellphone + "<br>Start Date: " + d.people[q].empStartDate + "<br>Manager uid: " + d.people[q].manager +
                        "<br>Employee Type: " + d.people[q].empType + "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }

                    return html
                });
                j.transition().style("opacity", 1);
                d = d.selectAll("text").data(a.map.filter(function (a) {
                        return a.points
                    }),
                    function (a) {
                        return JSON.stringify(a.points)
                    });
                b = d.enter().append("text").style("font-weight", "bold").attr("text-anchor", "middle").style("opacity", 1E-6);
                d.exit().transition().style("opacity", 1E-6).remove();
                z = d.attr("transform", function (a) {
                    for (var b = 0, d = 0, j = 0, g = 0; g < a.points.length; ++g) var c = a.points[g],
                        k = a.points[g + 1] || a.points[0],
                        e = c.x * k.y - k.x * c.y,
                        b = b + (c.x + k.x) * e,
                        d = d + (c.y + k.y) * e,
                        j = j + e;
                    j = j / 2;
                    d = d / (6 * j);
                    return "translate(" + i(b / (6 * j)) + "," + h(d + 1) + ")"
                }).text(function (b) { //Text to be show in in center of rectangle
                    return b.room;
                })
                    .attr("y", 0)
                    .attr("font-size", "1.9em");
                d.append("tspan")
                    .attr("dy", "1em")
                    .attr("font-size", "0.7em")
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .text(function (b) {
                        return b.fireExtinguish.itemType
                    })
                    .attr("font-size", "3pt");
                b.transition().style("opacity",
                    0.6);
                d.append("title").html(function(d){
                    html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                    "<br>Allocated to Org: " + d.spaceSection + "<br>Fire Extinguisher Type: " + d.fireExtinguish['itemType'] +
                        "<br>Fire Extinsguisher Service Date: " + d.fireExtinguish['lastScanDate']

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personDeptName +
                        "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname + "<br>Badge: " + d.people[q].badge +
                        "<br>Username: " + d.people[q].username + "<br>Email: " + d.people[q].email + "<br>Phone: " + d.people[q].phone +
                        "<br>Cell: " + d.people[q].cellphone + "<br>Start Date: " + d.people[q].empStartDate + "<br>Manager uid: " + d.people[q].manager +
                        "<br>Employee Type: " + d.people[q].empType + "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }

                    return html
                });
            }
        })
    }

    var e = "Fire Exting.",
        f = "quantile",
        i = d3.scale.linear(),
        h = d3.scale.linear(),
        l = d3.svg.line().x(function (a) {
            return i(a.x)
        }).y(function (a) {
            return h(a.y)
        }),
        c = d3.format(".4n"),
        d = "fp-fire",
        n = "Fire Exting.";
    a.xScale = function (d) {
        if (!arguments.length) return i;
        i = d;
        return a
    };
    a.yScale = function (d) {
        if (!arguments.length) return h;
        h = d;
        return a
    };
    a.colorSet = function (d) {
        if (!arguments.length) return e;
        e = d;
        return a
    };
    a.colorMode = function (d) {
        if (!arguments.length) return f;
        f = d;
        return a
    };
    var customThresholds;
    a.customThresholds =
        function (d) {
            if (!arguments.length) return customThresholds;
            customThresholds = d;
            return a
        };
    a.id = function () {
        return d
    };
    a.title = function (d) {
        if (!arguments.length) return n;
        n = d;
        return a
    };
    return a
};

d3.floorplan.results = function (queryResults) {
    function a(a) {
        a.each(function (a) {
            if (a && a.map) {
                var d = d3.select(this);
                a.units ? " " != a.units.charAt(0) && (a.units = " " + a.units) : a.units = "";
                var b = a.map.map(function (a) {
                        return a.value
                    }).sort(d3.ascending),
                    g, j;
                switch (f) {
                    case "quantile":
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b);
                        j = g.quantiles();
                        break;
                    case "quantized":
                        g = d3.scale.quantize().range([1, 2, 3, 4, 5, 6]).domain([b[0], b[b.length - 1]]);
                        b = (g.domain()[1] - g.domain()[0]) / 6;
                        j = [b, 2 * b, 3 * b, 4 * b, 5 * b];
                        break;
                    case "normal":
                        var m =
                                d3.mean(b),
                            b = Math.sqrt(d3.sum(b, function (a) {
                                    return Math.pow(a - m, 2)
                                }) / b.length);
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain([m - 6 * b, m - 2 * b, m - b, m, m + b, m + 2 * b, m + 6 * b]);
                        j = g.quantiles();
                        break;
                    default:
                        var customThresholds;
                        (customThresholds = j), b = customThresholds, b.push(b[b.length - 1]), b.unshift(b[0]), g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b), customThresholds = j = g.quantiles()
                }
                d = d.selectAll("g.people").data([0]);
                d.enter().append("g").attr("class", "text");
                this.__colors__ && this.__colors__ != e && d.classed(this.__colors__, !1);
                d.classed(e, !0);
                this.__colors__ = e;
                b = d.selectAll("rect").data(a.map.filter(function (a) {
                    return !a.points
                }), function (a) {
                    return a.x + "," + a.y
                });

                j = b.enter().append("rect").style("opacity", 1E-6);
                b.exit().transition().style("opacity", 1E-6).remove();
                tooltip = j.append("title");
                tooltip.append('tspan').text(function (d) {
                    return d.personDeptName
                });
                b.attr("x", function (a) {
                    return i(a.x)
                }).attr("y", function (a) {
                    return h(a.y)
                }).attr("height", Math.abs(h(a.binSize) - h(0))).attr("width", Math.abs(i(a.binSize) - i(0))).attr("class", function (a) {
                    return "text"
                })
                ;
                j.transition();
                b = d.selectAll("path").data(a.map.filter(function (a) {
                    return a.points
                }), function (a) {
                    return JSON.stringify(a.points)
                });
                j = b.enter().append("path").attr("d", function (a) {
                    return l(a.points) + "Z"
                }).attr("id", function(b) {
                    return b.building + "-" + b.room;
                }).style("opacity", 1E-6)
                .on("click", function(z){
                    if(z.building + "-" + z.room in scene_group_lookup){
                        d3.select(this).attr("xlink:href", function(x) {
                            sessionStorage.setItem('scene', scene_group_lookup[x.building + "-" + x.room]);
                            sessionStorage.setItem('building', x.building);
                            sessionStorage.setItem('room', x.room);
                            window.location = "/threesixty";
                        })
                    }
                    else{
                        console.log("360 not available for " + z.building + "-" + z.room)
                    }
                });

                b.exit().transition().style("opacity", 1E-6).remove();
                var tooltip = j.append("title");
                b.attr("class", function (a) { // Color code based on empty/occupied
                    var inResults = false;
                    for (var i = 0; i < queryResults.length; i++) {
                        if (queryResults[i]) {
                            if (a.building + a.room + a.spaceType == queryResults[i]['building'] + queryResults[i]['room'] + queryResults[i]['spaceType']) {
                                inResults = true;
                            }
                        }
                    }
                    if (inResults == false) {
                        return "nomatch";
                    }
                    else {
                        return "match";
                    }
                }).select("title").append('tspan').text(function (d) {
                    return "Section: " + d.personDeptName
                });
                var html;
                tooltip.html(function (d) {
                    html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                        "<br>Allocated to Org: " + d.spaceSection;

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personOrg1 +
                            "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname +
                            "<br>Cell: " + d.people[q].cellphone + "<br>Employee Type: " + d.people[q].empType + 
                            "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }

                    return html
                });
                j.transition().style("opacity", 1);
                d = d.selectAll("text").data(a.map.filter(function (a) {
                        return a.points
                    }),
                    function (a) {
                        return JSON.stringify(a.points)
                    });
                b = d.enter().append("text").style("font-weight", "bold").attr("text-anchor", "middle").style("opacity", 1E-6);
                d.exit().transition().style("opacity", 1E-6).remove();
                z = d.attr("transform", function (a) {
                    for (var b = 0, d = 0, j = 0, g = 0; g < a.points.length; ++g) var c = a.points[g],
                        k = a.points[g + 1] || a.points[0],
                        e = c.x * k.y - k.x * c.y,
                        b = b + (c.x + k.x) * e,
                        d = d + (c.y + k.y) * e,
                        j = j + e;
                    j = j / 2;
                    d = d / (6 * j);
                    return "translate(" + i(b / (6 * j)) + "," + 0.985 * h(d + 1) + ")"
                }).text(function (b) {
                    return b.room; //This specifies text b.space is cube #
                })
                    .attr("y", 4)
                    .attr("font-size", "1.9em");
                d.append("tspan")
                    .attr("dy", "1em")
                    .attr("font-size", "0.7em")
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .text(function (b) {
                        var names = "";
                        for (w = 0; w < b.people.length; w++){
                            if(w + 1 != b.people.length){
                                names += b.people[w].lastname + " & " ;    
                            } else{
                                names += b.people[w].lastname
                            }
                            
                        }
                        return names;
                        
                    });
                d.append("tspan")
                    .attr("dy", "1em")
                    .attr("font-size", "0.65em")
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .text(function (b) {
                        return b.squareFeet + " sqft"
                    });
                b.transition().style("opacity",
                    0.6);
                d.append("title").html(function(d){
                    html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                        "<br>Allocated to Org: " + d.spaceSection;

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personOrg1 +
                            "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname +
                            "<br>Cell: " + d.people[q].cellphone + "<br>Employee Type: " + d.people[q].empType + 
                            "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }

                    return html
                });

            }
        })
    }
    var e = "Results",
        f = "quantile",
        i = d3.scale.linear(),
        h = d3.scale.linear(),
        l = d3.svg.line().x(function (a) {
            return i(a.x)
        }).y(function (a) {
            return h(a.y)
        }),
        c = d3.format(".4n"),
        d = "fp-results",
        n = "Results";
    a.xScale = function (d) {
        if (!arguments.length) return i;
        i = d;
        return a
    };
    a.yScale = function (d) {
        if (!arguments.length) return h;
        h = d;
        return a
    };
    a.colorSet = function (d) {
        if (!arguments.length) return e;
        e = d;
        return a
    };
    a.colorMode = function (d) {
        if (!arguments.length) return f;
        f = d;
        return a
    };
    a.customThresholds =
        function (d) {
            if (!arguments.length) return customThresholds;
            customThresholds = d;
            return a
        };
    a.id = function () {
        return d
    };
    a.title = function (d) {
        if (!arguments.length) return n;
        n = d;
        return a
    };
    return a
};


d3.floorplan.occupied = function () {
    function a(a) {
        a.each(function (a) {
            if (a && a.map) {
                var d = d3.select(this);
                a.units ? " " != a.units.charAt(0) && (a.units = " " + a.units) : a.units = "";
                var b = a.map.map(function (a) {
                        return a.value
                    }).sort(d3.ascending),
                    g, j;
                switch (f) {
                    case "quantile":
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b);
                        j = g.quantiles();
                        break;
                    case "quantized":
                        g = d3.scale.quantize().range([1, 2, 3, 4, 5, 6]).domain([b[0], b[b.length - 1]]);
                        b = (g.domain()[1] - g.domain()[0]) / 6;
                        j = [b, 2 * b, 3 * b, 4 * b, 5 * b];
                        break;
                    case "normal":
                        var m =
                                d3.mean(b),
                            b = Math.sqrt(d3.sum(b, function (a) {
                                    return Math.pow(a - m, 2)
                                }) / b.length);
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain([m - 6 * b, m - 2 * b, m - b, m, m + b, m + 2 * b, m + 6 * b]);
                        j = g.quantiles();
                        break;
                    default:
                        var customThresholds;
                        (customThresholds = j), b = customThresholds, b.push(b[b.length - 1]), b.unshift(b[0]), g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b), customThresholds = j = g.quantiles()
                }
                d = d.selectAll("g.people").data([0]);
                d.enter().append("g").attr("class", "text");
                this.__colors__ && this.__colors__ != e && d.classed(this.__colors__, !1);
                d.classed(e, !0);
                this.__colors__ = e;
                b = d.selectAll("rect").data(a.map.filter(function (a) {
                    return !a.points
                }), function (a) {
                    return a.x + "," + a.y
                });


                j = b.enter().append("rect").style("opacity", 1E-6);
                b.exit().transition().style("opacity", 1E-6).remove();
                tooltip = j.append("title");
                tooltip.append('tspan').text(function (d) {
                    return d.personDeptName
                });
                b.attr("x", function (a) {
                    return i(a.x)
                }).attr("y", function (a) {
                    return h(a.y)
                }).attr("height", Math.abs(h(a.binSize) - h(0))).attr("width", Math.abs(i(a.binSize) - i(0))).attr("class", function (a) {
                    return "text"
                });
                j.transition();
                b = d.selectAll("path").data(a.map.filter(function (a) {
                    return a.points
                }), function (a) {
                    return JSON.stringify(a.points)
                });
                j = b.enter().append("path").attr("d", function (a) {
                    return l(a.points) + "Z"
                }).attr("id", function(b) {
                    return b.building + "-" + b.room;
                }).style("opacity", 1E-6)
                .on("click", function(z){
                    if(z.building + "-" + z.room in scene_group_lookup){
                        d3.select(this).attr("xlink:href", function(x) {
                            sessionStorage.setItem('scene', scene_group_lookup[x.building + "-" + x.room]);
                            sessionStorage.setItem('building', x.building);
                            sessionStorage.setItem('room', x.room);
                            window.location = "/threesixty";
                        })
                    }
                    else{
                        console.log("360 not available for " + z.building + "-" + z.room)
                    }
                });
                b.exit().transition().style("opacity", 1E-6).remove();
                var tooltip = j.append("title");
                b.attr("class", function (a) { //Color code based on empty/occupied
                    console.log(a.people.length)
                    if (a.people.length > 0) {
                        return "occupied";
                    }
                    else if (a.people.length == 0 && a.spaceType == "Escape Pod") {
                        return "available";
                    }
                    else if (a.spaceType != "OFFICE/OPEN" && a.spaceType != "OFFICE/CLOSED") {
                        return "notofficespace";
                    }
                    // a.person == "" &&
                }).select("title").append('tspan').text(function (d) {
                    return "Section: " + d.personDeptName
                });
                var html;
                tooltip.html(function (d) {
                    html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                        "<br>Allocated to Org: " + d.spaceSection;

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personOrg1 +
                            "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname +
                            "<br>Cell: " + d.people[q].cellphone + "<br>Employee Type: " + d.people[q].empType + 
                            "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }

                    return html
                });
                j.transition().style("opacity", 1);
                d = d.selectAll("text").data(a.map.filter(function (a) {
                        return a.points
                    }),
                    function (a) {
                        return JSON.stringify(a.points)
                    });
                b = d.enter().append("text").style("font-weight", "bold").attr("text-anchor", "middle").style("opacity", 1E-6);
                d.exit().transition().style("opacity", 1E-6).remove();
                z = d.attr("transform", function (a) {
                    for (var b = 0, d = 0, j = 0, g = 0; g < a.points.length; ++g) var c = a.points[g],
                        k = a.points[g + 1] || a.points[0],
                        e = c.x * k.y - k.x * c.y,
                        b = b + (c.x + k.x) * e,
                        d = d + (c.y + k.y) * e,
                        j = j + e;
                    j = j / 2;
                    d = d / (6 * j);
                    return "translate(" + i(b / (6 * j)) + "," + h(d + 1) + ")"
                }).html(function (b) {
                    return b.room; //This specifies text b.space is cube #
                })
                    .attr("y", -1)
                    .attr("font-size", "1.9em");
                d.append("tspan")
                    .attr("dy", "1em")
                    .attr("font-size", "0.7em")
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .text(function (b) {
                        return b.spaceType
                    })
                    .attr("font-size", "2pt");
                b.transition().style("opacity",
                    0.6);
                d.append("title").html(function(d){
                    html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                        "<br>Allocated to Org: " + d.spaceSection;

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personOrg1 +
                            "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname +
                            "<br>Cell: " + d.people[q].cellphone + "<br>Employee Type: " + d.people[q].empType + 
                            "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }

                    return html
                });
            }
        })
    }
    var e = "Occupied?",
        f = "quantile",
        i = d3.scale.linear(),
        h = d3.scale.linear(),
        l = d3.svg.line().x(function (a) {
            return i(a.x)
        }).y(function (a) {
            return h(a.y)
        }),
        c = d3.format(".4n"),
        d = "fp-occupied",
        n = "Occupied?";
    a.xScale = function (d) {
        if (!arguments.length) return i;
        i = d;
        return a
    };
    a.yScale = function (d) {
        if (!arguments.length) return h;
        h = d;
        return a
    };
    a.colorSet = function (d) {
        if (!arguments.length) return e;
        e = d;
        return a
    };
    a.colorMode = function (d) {
        if (!arguments.length) return f;
        f = d;
        return a
    };
    var customThresholds;
    a.customThresholds =
        function (d) {
            if (!arguments.length) return customThresholds;
            customThresholds = d;
            return a
        };
    a.id = function () {
        return d
    };
    a.title = function (d) {
        if (!arguments.length) return n;
        n = d;
        return a
    };
    return a
};


d3.floorplan.threesixty = function () {
    function a(a) {
        a.each(function (a) {
            if (a && a.map) {
                var d = d3.select(this);
                a.units ? " " != a.units.charAt(0) && (a.units = " " + a.units) : a.units = "";
                var b = a.map.map(function (a) {
                        return a.value
                    }).sort(d3.ascending),
                    g, j;
                switch (f) {
                    case "quantile":
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b);
                        j = g.quantiles();
                        break;
                    case "quantized":
                        g = d3.scale.quantize().range([1, 2, 3, 4, 5, 6]).domain([b[0], b[b.length - 1]]);
                        b = (g.domain()[1] - g.domain()[0]) / 6;
                        j = [b, 2 * b, 3 * b, 4 * b, 5 * b];
                        break;
                    case "normal":
                        var m =
                                d3.mean(b),
                            b = Math.sqrt(d3.sum(b, function (a) {
                                    return Math.pow(a - m, 2)
                                }) / b.length);
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain([m - 6 * b, m - 2 * b, m - b, m, m + b, m + 2 * b, m + 6 * b]);
                        j = g.quantiles();
                        break;
                    default:
                        var customThresholds;
                        (customThresholds = j), b = customThresholds, b.push(b[b.length - 1]), b.unshift(b[0]), g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b), customThresholds = j = g.quantiles()
                }
                d = d.selectAll("g.people").data([0]);
                d.enter().append("g").attr("class", "text");
                this.__colors__ && this.__colors__ != e && d.classed(this.__colors__, !1);
                d.classed(e, !0);
                this.__colors__ = e;
                b = d.selectAll("rect").data(a.map.filter(function (a) {
                    return !a.points
                }), function (a) {
                    return a.x + "," + a.y
                });


                j = b.enter().append("rect").style("opacity", 1E-6);
                b.exit().transition().style("opacity", 1E-6).remove();
                tooltip = j.append("title");
                tooltip.append('tspan').text(function (d) {
                    return d.personDeptName
                });
                b.attr("x", function (a) {
                    return i(a.x)
                }).attr("y", function (a) {
                    return h(a.y)
                }).attr("height", Math.abs(h(a.binSize) - h(0))).attr("width", Math.abs(i(a.binSize) - i(0))).attr("class", function (a) {
                    return "text"
                });
                j.transition();
                b = d.selectAll("path").data(a.map.filter(function (a) {
                    return a.points
                }), function (a) {
                    return JSON.stringify(a.points)
                });
                j = b.enter().append("path").attr("d", function (a) {
                    return l(a.points) + "Z"
                }).attr("id", function(b) {
                    return b.building + "-" + b.room;
                }).style("opacity", 1E-6)
                .on("click", function(z){
                    if(z.building + "-" + z.room in scene_group_lookup){
                        d3.select(this).attr("xlink:href", function(x) {
                            sessionStorage.setItem('scene', scene_group_lookup[x.building + "-" + x.room]);
                            sessionStorage.setItem('building', x.building);
                            sessionStorage.setItem('room', x.room);
                            window.location = "/threesixty";
                        })
                    }
                    else{
                        console.log("360 not available for " + z.building + "-" + z.room)
                    }
                });
                b.exit().transition().style("opacity", 1E-6).remove();
                var tooltip = j.append("title");
                b.attr("class", function (a) { //Color code based on empty/occupied
                    if (a.threesixty_available == true) {
                        return "available";
                    }
                    else {
                        return "notofficespace";
                    }
                    // a.person == "" &&
                }).select("title").append('tspan').text(function (d) {
                    return "Section: " + d.personDeptName
                });
                var html;
                tooltip.html(function (d) {
                    html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                        "<br>Allocated to Org: " + d.spaceSection;

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personDeptName +
                        "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname + "<br>Badge: " + d.people[q].badge +
                        "<br>Username: " + d.people[q].username + "<br>Email: " + d.people[q].email + "<br>Phone: " + d.people[q].phone +
                        "<br>Cell: " + d.people[q].cellphone + "<br>Start Date: " + d.people[q].empStartDate + "<br>Manager uid: " + d.people[q].manager +
                        "<br>Employee Type: " + d.people[q].empType + "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }

                    return html
                });
                j.transition().style("opacity", 1);
                d = d.selectAll("text").data(a.map.filter(function (a) {
                        return a.points
                    }),
                    function (a) {
                        return JSON.stringify(a.points)
                    });
                b = d.enter().append("text").style("font-weight", "bold").attr("text-anchor", "middle").style("opacity", 1E-6);
                d.exit().transition().style("opacity", 1E-6).remove();
                z = d.attr("transform", function (a) {
                    for (var b = 0, d = 0, j = 0, g = 0; g < a.points.length; ++g) var c = a.points[g],
                        k = a.points[g + 1] || a.points[0],
                        e = c.x * k.y - k.x * c.y,
                        b = b + (c.x + k.x) * e,
                        d = d + (c.y + k.y) * e,
                        j = j + e;
                    j = j / 2;
                    d = d / (6 * j);
                    return "translate(" + i(b / (6 * j)) + "," + h(d + 1) + ")"
                }).html(function (b) {
                    return b.room; //This specifies text b.space is cube #
                })
                    .attr("y", -1)
                    .attr("font-size", "1.9em");
                d.append("tspan")
                    .attr("dy", "1em")
                    .attr("font-size", "0.7em")
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .text(function (b) {
                        return b.spaceType
                    })
                    .attr("font-size", "2pt");
                b.transition().style("opacity",
                    0.6);
                d.append("title").html(function(d){
                    html = "Room: " + d.room + "<br>Space Type: " + d.spaceType + "<br>Square Feet: " + d.squareFeet +
                        "<br>Allocated to Org: " + d.spaceSection;

                    for (q = 0; q < d.people.length; q ++){
                        html += "<br><br>Employee Section: " + d.people[q].personDeptName +
                        "<br>First Name: " + d.people[q].firstname + "<br>Last Name: " + d.people[q].lastname + "<br>Badge: " + d.people[q].badge +
                        "<br>Username: " + d.people[q].username + "<br>Email: " + d.people[q].email + "<br>Phone: " + d.people[q].phone +
                        "<br>Cell: " + d.people[q].cellphone + "<br>Start Date: " + d.people[q].empStartDate + "<br>Manager uid: " + d.people[q].manager +
                        "<br>Employee Type: " + d.people[q].empType + "<br>Title: " + d.people[q].title + "<br>Schedule: " + d.people[q].workSchedule
                    }

                    return html
                });
            }
        })
    }
    var e = "Occupied?",
        f = "quantile",
        i = d3.scale.linear(),
        h = d3.scale.linear(),
        l = d3.svg.line().x(function (a) {
            return i(a.x)
        }).y(function (a) {
            return h(a.y)
        }),
        c = d3.format(".4n"),
        d = "fp-occupied",
        n = "Occupied?";
    a.xScale = function (d) {
        if (!arguments.length) return i;
        i = d;
        return a
    };
    a.yScale = function (d) {
        if (!arguments.length) return h;
        h = d;
        return a
    };
    a.colorSet = function (d) {
        if (!arguments.length) return e;
        e = d;
        return a
    };
    a.colorMode = function (d) {
        if (!arguments.length) return f;
        f = d;
        return a
    };
    var customThresholds;
    a.customThresholds =
        function (d) {
            if (!arguments.length) return customThresholds;
            customThresholds = d;
            return a
        };
    a.id = function () {
        return d
    };
    a.title = function (d) {
        if (!arguments.length) return n;
        n = d;
        return a
    };
    return a
};


d3.floorplan.parking = function () {
    function a(a) {
        a.each(function (a) {
            if (a && a.map) {
                var d = d3.select(this);
                a.units ? " " != a.units.charAt(0) && (a.units = " " + a.units) : a.units = "";
                var b = a.map.map(function (a) {
                        return a.value
                    }).sort(d3.ascending),
                    g, j;
                switch (f) {
                    case "quantile":
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b);
                        j = g.quantiles();
                        break;
                    case "quantized":
                        g = d3.scale.quantize().range([1, 2, 3, 4, 5, 6]).domain([b[0], b[b.length - 1]]);
                        b = (g.domain()[1] - g.domain()[0]) / 6;
                        j = [b, 2 * b, 3 * b, 4 * b, 5 * b];
                        break;
                    case "normal":
                        var m =
                                d3.mean(b),
                            b = Math.sqrt(d3.sum(b, function (a) {
                                    return Math.pow(a - m, 2)
                                }) / b.length);
                        g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain([m - 6 * b, m - 2 * b, m - b, m, m + b, m + 2 * b, m + 6 * b]);
                        j = g.quantiles();
                        break;
                    default:
                        var customThresholds;
                        (customThresholds = j), b = customThresholds, b.push(b[b.length - 1]), b.unshift(b[0]), g = d3.scale.quantile().range([1, 2, 3, 4, 5, 6]).domain(b), customThresholds = j = g.quantiles()
                }
                d = d.selectAll("g.areas").data([0]);
                d.enter().append("g").attr("class", "text");
                this.__colors__ && this.__colors__ != e && d.classed(this.__colors__, !1);
                d.classed(e, !0);
                this.__colors__ = e;
                b = d.selectAll("rect").data(a.map.filter(function (a) {
                    return !a.points
                }), function (a) {
                    return a.x + "," + a.y
                });
                j = b.enter().append("rect").style("opacity", 1E-6);
                b.exit().transition().style("opacity", 1E-6).remove();
                tooltip = j.append("title");
                tooltip.append('tspan').text(function (d) {
                    return d.personDeptName
                });
                b.attr("x", function (a) {
                    return i(a.x)
                }).attr("y", function (a) {
                    return h(a.y)
                }).attr("height", Math.abs(h(a.binSize) - h(0))).attr("width", Math.abs(i(a.binSize) - i(0))).attr("class", function (a) {
                    return "text"
                });
                j.transition();
                b = d.selectAll("path").data(a.map.filter(function (a) {
                    return a.points
                }), function (a) {
                    return JSON.stringify(a.points)
                });
                j = b.enter().append("path").attr("d", function (a) {
                    return l(a.points) + "Z"
                }).attr("id", function(b) {
                    return b.building + "-" + b.room;
                }).style("opacity", 1E-6)
                .on("click", function(z){
                    if(z.building + "-" + z.room in scene_group_lookup){
                        d3.select(this).attr("xlink:href", function(x) {
                            sessionStorage.setItem('scene', scene_group_lookup[x.building + "-" + x.room]);
                            sessionStorage.setItem('building', x.building);
                            sessionStorage.setItem('room', x.room);
                            window.location = "/threesixty";
                        })
                    }
                    else{
                        console.log("360 not available for " + z.building + "-" + z.room)
                    }
                });
                b.exit().transition().style("opacity", 1E-6).remove();
                var tooltip = j.append("title");
                b.attr("class", function (a) { //Color code based on type of space
                    var percent_full;
                    try {
                        percent_full = a["tues_morn"]["total"] / a["capacity"]["total"];
                    } catch (e) {
                        console.log(e);
                        percent_full = .5;
                    }

                    if (percent_full > 0.9 && percent_full < 1) {
                        return "parking_orange"
                    }
                    else if (percent_full > 0.8 && percent_full <= .9) {
                        return "parking_yellow"
                    }
                    else if (percent_full <= 0.8) {
                        return "parking_green"
                    }
                    else if (percent_full == 1) {
                        return "parking_red"
                    }
                    else {
                        return "parking_yellow"
                    }
                }).select("title").append('tspan').text(function (d) {
                    return "Section: " + d.personDeptName
                });
                tooltip.html(function (d) {
                    var spaces_left;
                    try {
                        spaces_left = d["capacity"]["total"] - d["tues_morn"]["total"];
                    } catch (e) {
                        spaces_left = "unknown";
                    }
                    return "Name: " + d.name + " \n\nSpaces Available: " + spaces_left;
                });
                j.transition().style("opacity", 1);
                d = d.selectAll("text").data(a.map.filter(function (a) {
                        return a.points
                    }),
                    function (a) {
                        return JSON.stringify(a.points)
                    });
                b = d.enter().append("text").style("font-weight", "bold").attr("text-anchor", "middle").style("opacity", 1E-6);
                d.exit().transition().style("opacity", 1E-6).remove();
                z = d.attr("transform", function (a) {
                    for (var b = 0, d = 0, j = 0, g = 0; g < a.points.length; ++g) var c = a.points[g],
                        k = a.points[g + 1] || a.points[0],
                        e = c.x * k.y - k.x * c.y,
                        b = b + (c.x + k.x) * e,
                        d = d + (c.y + k.y) * e,
                        j = j + e;
                    j = j / 2;
                    d = d / (6 * j);
                    return "translate(" + i(b / (6 * j)) + "," + h(d - 1) + ")"; //changed d+1 to d-1 to move text up
                }).text(function (b) { //Text to be show in in center of rectangle
                    return b.room;
                })
                    .attr("y", 4)
                    .attr("font-size", "1.9em");
                d.append("tspan")
                    .attr("dy", "1em")
                    .attr("font-size", "0.7em")
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .text(function (b) {
                        return b.spaceType
                    })
                    .attr("font-size", "6pt");
                b.transition().style("opacity",
                    0.6);
            }
        })
    }
    var e = "Type",
        f = "quantile",
        i = d3.scale.linear(),
        h = d3.scale.linear(),
        l = d3.svg.line().x(function (a) {
            return i(a.x)
        }).y(function (a) {
            return h(a.y)
        }),
        c = d3.format(".4n"),
        d = "fp-type",
        n = "Type";
    a.xScale = function (d) {
        if (!arguments.length) return i;
        i = d;
        return a
    };
    a.yScale = function (d) {
        if (!arguments.length) return h;
        h = d;
        return a
    };
    a.colorSet = function (d) {
        if (!arguments.length) return e;
        e = d;
        return a
    };
    a.colorMode = function (d) {
        if (!arguments.length) return f;
        f = d;
        return a
    };
    var customThresholds;
    a.customThresholds =
        function (d) {
            if (!arguments.length) return customThresholds;
            customThresholds = d;
            return a
        };
    a.id = function () {
        return d
    };
    a.title = function (d) {
        if (!arguments.length) return n;
        n = d;
        return a
    };
    return a
};
