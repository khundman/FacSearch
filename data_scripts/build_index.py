"""
======================================================================================================== 
Copyright 2015, by the California Institute of Technology. ALL RIGHTS RESERVED. 
United States Government Sponsorship acknowledged. Any commercial use must be negotiated with 
the Office of Technology Transfer at the California Institute of Technology.
This software may be subject to U.S. export control laws. By accepting this software, 
the user agrees to comply with all applicable U.S. export laws and regulations. 
User has the responsibility to obtain export licenses, or other export authority as may be 
required before exporting such information to foreign countries or providing access to foreign persons. 
===========================================================================================================
"""


import json
import math
import re
import fnmatch
import itertools as IT
import urllib
import os
from bs4 import BeautifulSoup as Soup
from elasticsearch import Elasticsearch

es = Elasticsearch(['http://localhost:9200'])
INDEX = "facsearch"

wd = os.path.dirname(os.path.realpath('../' + __file__))
svg_dir = str(wd + "/static/svg/")
pdf_dir = str(wd + "/static/floorplans/pdf/")
jpg_dir = str(wd + "/static/floorplans/jpg/")
fire_extinguishers_data = {}
building_data = {}

json_data_full = {
    "people": {
        "binSize": 3,
        "units": "",
        "map": []
    }
}

def fetch_data():
    global fire_extinguishers_data
    global building_data
    # this code imports the building latitudes and longitudes from the given url
    # json stored in java file as incorrect format
    buildings_url = 'https://imaps.jpl.nasa.gov/inc/js/allBuildings.js'
    response = urllib.urlopen(buildings_url)
    building_data = response.read()
    # we are saving a text object to a json file again due to incorrect file format
    with open(wd + '/static/data_sources/allBuildings.json', 'w') as outfile:
        outfile.write(building_data)

    create_building_bulkfile()


def create_building_bulkfile():
    with open(wd + "/static/data_sources/allBuildings.json", 'r') as es:
        data = es.readlines()
    for x in range(1, len(data[1:])):
        data[x] = data[x].replace('\r\n', '').replace('\\r\\n', '').replace('},', '}\n')

    acc = ''
    x = 0
    formatted_data = []
    for line in data[1:-1]:
        if x % 8 == 7:
            acc = acc + line.replace('\n', '')
            formatted_data.append(acc)
            acc = ''
        else:
            acc = acc + line
        x += 1

    x = 0
    with open(wd + "/static/cleaned_data/es/building_data", 'w') as building_file:
        for line in formatted_data:
            building_file.write("{\"index\": {\"_type\": \"building_data\", \"_id\":" + str(x) + ", \"_index\": \"" + main_index + "\"}}\n")
            building_file.write(re.sub(' +', '', line).strip() + '\n')
            x += 1
    print 'Building bulk file created.'


def convert_to_pngs():
    """call shell script to convert svg to pdf, then convert pdf to png.
    Uses inkscape command line to convert svg to pdf."""
    os.system("./svg2png.sh " + svg_dir + " " + pdf_dir + " " + jpg_dir)


def get_coords(points):
    json_points = []
    for point in points:
        json_point = {"x": point[0], "y": point[1]}
        json_points.append(json_point)
    return json_points


def parse_coords(val, axis):
    if axis == "x":
        find_split = re.search("\d(\+|-)", str(val))
        split_index = find_split.end()
        return float(str(val)[1:split_index - 1])
    else:
        find_split = re.search("\d(\+|-)", str(val))
        split_index = find_split.end()
        return float(str(val)[split_index - 1:-2])


def get_points(raw, width, height, x_offset, y_offset):
    points = []
    line_starts = []
    line_ends = []
    for line in raw:
        line_starts.append(line.start)
        line_ends.append(line.end)
    if len(line_starts) != len(line_ends):
        raise ValueError("path not made up of only lines")
    else:
        for j in range(0, len(line_starts)):
            point = {}
            if j == 0:
                point['x'] = scale_coords(parse_coords(line_starts[j], "x"), width, x_offset, "x")
                point['y'] = scale_coords(parse_coords(line_starts[j], "y"), height, y_offset, "y")
                points.append(point)

            else:
                # check to make sure one of ending points in line matches one of starting points in next line
                # (contiguous shape)
                current_x_start = parse_coords(line_starts[j], "x")
                current_y_start = parse_coords(line_starts[j], "y")
                previous_x_end = parse_coords(line_ends[j - 1], "x")
                previous_y_end = parse_coords(line_ends[j - 1], "y")
                if previous_x_end == current_x_start or previous_y_end == current_y_start:
                    point['x'] = scale_coords(parse_coords(line_starts[j], "x"), width, x_offset, "x")
                    point['y'] = scale_coords(parse_coords(line_starts[j], "y"), height, y_offset, "y")
                    points.append(point)
                else:
                    raise ValueError("non-contiguous line")
        return points


def area_of_polygon(x, y):
    """Calculates the signed area of an arbitrary polygon given its vertices
    http://stackoverflow.com/a/4682656/190597 (Joe Kington)
    http://softsurfer.com/Archive/algorithm_0101/algorithm_0101.htm#2D%20Polygons
    """
    area = 0.0
    for i in xrange(-1, len(x) - 1):
        area += x[i] * (y[i + 1] - y[i - 1])
    return area / 2.0


def centroid_of_polygon(points):
    """
    http://stackoverflow.com/a/14115494/190597 (mgamba)
    """
    area = area_of_polygon(*zip(*points))
    result_x = 0
    result_y = 0
    n = len(points)
    points_cycle = IT.cycle(points)
    x1, y1 = next(points_cycle)
    for i in range(n):
        x0, y0 = x1, y1
        x1, y1 = next(points_cycle)
        cross = (x0 * y1) - (x1 * y0)
        result_x += (x0 + x1) * cross
        result_y += (y0 + y1) * cross
    result_x /= (area * 6.0)
    result_y /= (area * 6.0)
    return result_x, result_y


def scale_coords(value, scale, offset, axis):
    if axis == "x":
        adj = value - offset
        return (adj / scale) * 1200
    else:
        adj = value - offset
        return (adj / scale) * 800


def build_json():
    directory = []
    num_offices = {}

    for file in os.listdir(svg_dir):

            rooms_assigned = []
            if fnmatch.fnmatch(file, '*.svg'):

                svg = open(svg_dir + file, 'r')
                raw = svg.read()
                soup = Soup(raw, "html.parser")

                roomsAssigned = []
                polylines_processed = []

                # find all in the svg with the g tag
                for g in soup.findAll('g'):
                    add_object = True
                    # make sure the line is orange (color used for y-square ft layer with room shapes)
                    if not g.get('stroke').find("rgb(255,255,0)") > -1 and not g.get('stroke').find("rgb(0,255,255)") > -1\
                            and not g.get('stroke').find("rgb(0,255,0)") > -1:
                        
                        # make sure shape is closed (only want rooms, not hallways, lines, etc.)
                        for poly in g.findAll('polyline'):
                            points = poly.get("points").split()
                            if points in polylines_processed:
                                continue
                            else:
                                polylines_processed.append(points)
                            if points[0].split(",")[0] == points[len(points) - 1].split(",")[0]:
                                office = {
                                    "building": "",
                                    "floor": "",
                                    "room": "",
                                    "fireExtinguish": {},
                                    "spaceType": "",
                                    "spaceSection": "",
                                    "squareFeet": None,
                                    "points": [],
                                    "people": []
                                    # "firstname": "",
                                    # "lastname": "",
                                    # "username": "",
                                    # "manager": "",
                                    # "workSchedule": "",
                                    # "phone": "",
                                    # "cellphone": "",
                                    # "empType": "",
                                    # "mailstop": "",
                                    # "personDeptName": "",  # changed from personSection
                                    # "personOrg1": "",
                                    # "personOrg2": "",
                                    # "personOrg3": "",
                                    # "personOrg4": "",
                                    # "email": "",
                                    # "dateFrom": "",
                                    # "empStartDate": "",
                                    # "title": "",
                                    # "badge": "",
                                }

                                # Assign office to rectangle
                                xList = []
                                yList = []
                                points_for_centroid = []
                                for point in points:
                                    xList.append(float(point.split(",")[0]))
                                    yList.append(float(point.split(",")[1]))
                                    points_for_centroid.append((float(point.split(",")[0]), float(point.split(",")[1])))

                                # filter down room number candidates then make final decision based on text closest to
                                # centroid of polygon
                                room_num_candidates = {}
                                for text in soup.findAll('text'):
                                    text_x = float(text.get('transform').split()[4])
                                    text_y = float(text.get('transform').split()[5].replace(")", ""))
                                    if len(text.get('transform').split()) > 6:
                                        raise ValueError("matrix of length longer than 6")

                                    # check if the text is within (or close to) the polygon of interest
                                    if min(xList) < text_x < max(xList) and min(yList) < text_y < max(yList):
                                        if text.string is not None:
                                            if re.search('\W*\d+\W*', text.string) is not None:
                                                center = centroid_of_polygon(points_for_centroid)
                                                eucl_dist = math.sqrt((math.pow((text_x - center[0]), 2)) + (
                                                    math.pow((text_y - center[1]), 2)))
                                                room_num_candidates[text.string] = eucl_dist

                                min_dist = 100000000
                                assignment_made = False
                                room = ""
                                # assign spaces with only one room num candidate first (accuracy of assignment is
                                # not in question)
                                for key, value in room_num_candidates.items():
                                    if len(room_num_candidates) == 1:
                                        room = key
                                        assignment_made = True

                                if assignment_made is False:
                                    for key, value in room_num_candidates.items():
                                        if value < min_dist:
                                            min_dist = value
                                            room = key

                                new_points = []
                                for old in points:
                                    new = {}
                                    new['x'] = float(old.split(",")[0])
                                    new['y'] = float(old.split(",")[1])
                                    new_points.append(new)
                                # don't assign duplicates or blanks without flagging
                                if room not in rooms_assigned and room != "":
                                    office['room'] = room
                                    office['points'] = new_points
                                    rooms_assigned.append(room)
                                elif room in rooms_assigned:
                                    print "room number already assigned - " + str(room) + " in building " + str(file)
                                elif room == "":
                                    pass

                                # Layer in info from ldap based on who sits in a location
                                for person in directory:

                                    if office['building'].strip() + "-" + office['room'].strip() == person['Location'].strip():

                                        person_doc = {}

                                        if not person['Badge'] in num_offices:
                                            num_offices[person['Badge']] = 1
                                        else:
                                            num_offices[person['Badge']] += 1
                                        office_names = ["username", "workSchedule", "phone", "mailstop", "cellphone",
                                                        "manager", "title", "personOrg4",
                                                        "personOrg3", "personOrg2", "personOrg1", "personDeptName",
                                                        "empStartDate", "empType", "email", "badge", "firstname",
                                                        "lastname"]

                                        person_names = ['UserID', 'WorkSchedule', 'TelephoneNumber', 'MailStop',
                                                        'MobileNumber', 'Manager', 'Title', 'org4', 'org3',
                                                        'org2', 'org1', 'DeptName', 'StartDate', 'EmployeeType', 'Email',
                                                        'Badge', 'Firstname', 'Lastname']

                                        for w in range(0, len(person_names)):
                                            try:
                                                person_doc[office_names[w]] = person[person_names[w]]
                                                
                                            except Exception:
                                                person_doc[office_names[w]] = "n/a"

                                        office["people"].append(person_doc)

                                # bring in 360 video availability info
                                with open(wd + "/static/data_sources/360_scene_lookup.json") as scenes:
                                    scenes = eval(scenes.read().split(" = ")[1])
                                    for room in scenes.keys():
                                        if room == office['building'] + "-" + office['room']:
                                            office["threesixty_available"] = True

                                if office["people"]:
                                    office["num_people"] = len(office["people"])
                                else:
                                    office["num_people"] = 0

                                # create the data objects
                                json_data_full["people"]["map"].append(office)

    # convert svg files to images (calls bash script)
    print "converting svg to png"
    # convert_to_pngs()
    for key, value in num_offices.iteritems():
        if value >= 2:
            print key + ": " + str(value)


#########################
# Elasticsearch
#########################

def upload_index_and_mapping(index_dir, delete_old=False):
    if delete_old and es.indices.exists(index=INDEX):
        es.indices.delete(index=INDEX)
    if not es.indices.exists(index=INDEX):
        file = open(os.path.join(index_dir, 'facsearch_mapping'), 'r')
        facsearch_mapping = file.read()
        file.close()
        es.indices.create(index=INDEX, body=facsearch_mapping)
    
    bulk_data = None
    for block in os.listdir(index_dir):
        if "bulk" in block:
            file = open(os.path.join(index_dir, block), 'r')
            bulk_data = file.read()
            file.close()
            # if not "full_index" in block and block != ".DS_Store"
            es.bulk(index=INDEX, body=bulk_data)
    if bulk_data == None:
        raise ValueError("Couldn't find bulk index to upload")


def push_to_es():
    # with open(wd + "/static/cleaned_data/es/bulk_upload", 'w') as es:
    #     for idx, doc in enumerate(json_data_full["people"]["map"]):
    #         header_doc = {}
    #         header_doc["index"] = {}
    #         header_doc["index"]["_type"] = "facsearch"
    #         header_doc["index"]["_id"] = idx
    #         header_doc["index"]["_index"] = INDEX

    #         es.write(json.dumps(header_doc) + "\n")
    #         es.write(json.dumps(doc) + "\n")

    upload_index_and_mapping(wd + "/static/cleaned_data/es/", delete_old=True)


# build_json()
push_to_es()

#########################
# Elasticsearch
#########################


#########################
