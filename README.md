# FacSearch

As featured at [2016 AWS Re:Invent](https://youtu.be/ICPordWs0t8?t=1551)

FacSearch is a web application that allows for easy querying and visualizing of AutoCAD floorplan drawings and related facilities and personnel data stored in elasticsearch. AutoCAD drawings are converted to SVG and attributes such as organizations, space types, people are represented visually as layers on top of a floorplan. The application provided here is a simple example, but this application is designed to integrate data from a variety of systems and connects them to floorplan visualizations. Examples of data sources include motion sensors, fire extinguishers, technical assets, people, room details (internet ports, projection capabilities), and 360 photos of lab spaces. 

Original `d3.floorplan.js` from [David Ciarletta](https://github.com/dciarletta/d3-floorplan)

Milennium Falcon Demo (link: (coming soon)): 

![home page](https://github.jpl.nasa.gov/Facilities-Allocation-Tool/facsearch/blob/open-source/blob/screenshots/home.png)
<!-- ![home page](http://github.com/khundman/master/blob/screenshots/home.png) -->

## Motivation
Space is a precious commodity at NASA's Jet Propulsion Laboratory (JPL). Limited spacial resources ensure that personnel, equipment, and material moves are considered at least on a weekly basis in order to facilitate ongoing work and research at the laboratory. The IT Data Science group has developed FacSearch to enable easy interpretation and understanding of space constraints, along with potential opportunities for moves that could improve organizational efficiency. This tool has also proven useful in providing administrative, maintenance and safety staff timely and relevant information. 

## Use Cases
FacSearch addresses three primary use cases: the ability to easily search and locate individuals, the ability to locate and visualize rooms and assets that match specific attributes, and the ability to gain deeper insights as to how physical space is being used.

### Personnel Search
Find people and visually represent their office's location on a floorplan.

![person search](https://github.jpl.nasa.gov/Facilities-Allocation-Tool/facsearch/blob/open-source/blob/screenshots/person_search.png)
<!-- ![home page](http://github.com/khundman/master/blob/screenshots/person_search.png) -->

### Advanced Search
The core functionality of the advanced search is the ability to search for rooms filtered by various 
attributes including:
* Organization
* Person
* Building
* Minimum Square Footage
* Minimum Number of Results
* Space Type (escape pod, cockpit, etc.)

Attributes are limited only by data availability. Additionally, the query results can be shown as a grid with buildings ordered by 
number and floor, or through a visual representation using a bar chart.

The query area for the advanced search:
![advanced search area](https://github.jpl.nasa.gov/Facilities-Allocation-Tool/facsearch/blob/open-source/blob/screenshots/advanced_search.png)

The default method of showing query results is through a grid. Each rectangle represents a building (or spacecraft) and floor number, with the number of results in the red circle.
![grid results](https://github.jpl.nasa.gov/Facilities-Allocation-Tool/facsearch/blob/open-source/blob/screenshots/advanced_search_grid_results.png)

Here, the query results are visualized as a bar chart, presenting the user with a data-driven method of navigation.
![chart results](https://github.jpl.nasa.gov/Facilities-Allocation-Tool/facsearch/blob/open-source/blob/screenshots/advanced_search_chart_results.png)

Once a user selects a particular result, the floorplan of that particular building and floor is displayed, along with 
the results that match the user's query. The user can then hover over a room to view additional information, such as
who that room is assigned to, square footage, the type of space, and other attributes:

![query results](https://github.jpl.nasa.gov/Facilities-Allocation-Tool/facsearch/blob/open-source/blob/screenshots/advanced_search_query_results.png)

Additional layers are available for floorplans as well:
* Organization
* Availability
* Space Type
* Extinguisher Type
* Floorplan (no data)
* CSV export of underlying data

The floorplan view with the "Space Type" layer turned on:
![space type](https://github.jpl.nasa.gov/Facilities-Allocation-Tool/facsearch/blob/open-source/blob/screenshots/advanced_search_space_type.png)

### Insights

The insights page is a place to generate reports and provide insights as to how physical space is being used within each organization, such as the amount of square footage per person, the ratio of available space to unavailable space, the number of public and private conference rooms available, etc. Whereas the personnel search satisfies the need to easily locate an individual and the advanced search satisfies the need to quickly locate types of spaces by attribute, the goal for the insights page is to showcase areas of opportunity and suggest actions that will improve how efficiently space is being used across the lab:

![space type](https://github.jpl.nasa.gov/Facilities-Allocation-Tool/facsearch/blob/open-source/blob/screenshots/org_insights.png)

## Getting Started with the Demo
Download and install [elasticsearch-2.4](https://www.elastic.co/downloads/past-releases/elasticsearch-2-4-0) </br></br>
Run elasticsearch (defaults to port 9200):
```shell
cd <path to elasticsearch>/bin | ./elasticsearch 
```
(To test that your elasticsearch instance is running, go to `http://localhost:9200` in your browser) </br></br>
Bulk upload the sample Millenium Falcon index to your local elasticsearch instance
```shell
cd <path to facsearch>/data_scripts/ | python build_index.py
```
(To test that your index was pushed successfully, go to `http://localhost:9200/facsearch/?pretty` in your browser)</br></br>
Install python requirements (python 2.7.x)
```shell
pip install -r <path to facsearch>/requirements.txt
```
Launch application
```shell
python <path to facsearch>/app.py
```
Open `http://localhost:5005` in Chrome, Safari, or Firefox

### Docker</br>
(Docker instructions coming soon)

## Advanced Usage

### Data Sources
#### Floorplan Conversion

Raw AutoCAD files (.DWG) are converted to SVG using [Benzesoft Easy CAD to SVG converter](http://www.benzsoft.com/buycad2svg.html) to convert all files (free 15-day trial, $99 purchase). This is the only solution we have found that suits our needs as it allows for specifying output dimensions (w: 800, h: 600).

#### Data Integration

Data integration should take place in `build_index.py` as this is where JSON for elasticsearch index is being constructed. This script performs the identification of rooms and room numbers based on the SVG (converted from AutoCAD), then we generally join data from other sources using room number as the key. One JSON doc in the index represents a unique room. The way in which the SVG is parsed is fairly specific given the way our drawings are done, but some groundwork has been laid to customize this and extend it to other use cases.

To build and push your own index, the `build_json()` function in `build_index.py` will need to be run and the `push_to_es()` function will beed to be uncommented. Right now the script is only pushing the sample index to elasticsearch and not construction from scratch. The Inkscape commandline tool will also need to be installed - Inkscape is used to convert the SVG to an image file for display in the application (via `svg2png.sh`).

### Customization

To customize fields being pulled from elasticsearch and classes for displaying the data, several files will need to be changed as many of the definitions are explicit at this point. For the `Advanced Search` page, the bulk of the javascript is in the `query.js` file located in `/static/js`. For the actual floorplan visualization page, the majority of javascript resides in `display.js` and `d3.floorplan.js`. In `d3.floorplan.js` the DRY principle was badly violated. Each `d3.floorplan.<name>` function represents a layer on the floorplan visualization page, and specific layer classes and behaviors are defined in each of these functions. 

## Improvements

CSS classes used in both the floorplan visualizations and barchart query results are currently defined explicitly. This could be improved by generating CSS classes dynamically based on the contents of the dataset. 

Similarly, a centralized area for defining elasticsearch fields does not yet exist. Therefore customization in this regard will require some familiarity with the application structure.

The application is also being developed with mobile use in mind. We envision the application being used primarily on desktop and laptop devices, but continue to develop the application for tablet and other mobile devices in order to expand its usability.  

Tools and frameworks:
* [Angular](https://angularjs.org/) (v1.5.7)
* [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/) (v3.2.1)
* [Bootstrap](http://getbootstrap.com/) (v3.3.2)
* [d3.js](https://d3js.org/) (v3.5.17)
* [FileSaver](https://github.com/eligrey/FileSaver.js/) (v1.3.2)
* [Flask](http://flask.pocoo.org/) (v0.11.1)
* [Flask Login](https://flask-login.readthedocs.io/en/latest/) (v0.3.2)
* [Flask Triangle](http://flask-triangle.readthedocs.io/en/latest/) (v0.5.4)
* [Font Awesome](http://fontawesome.io/) (v4.6.3)
* [jQuery](https://jquery.com/) (v1.11.1)
* [jQuery Cookie](https://github.com/carhartl/jquery-cookie) (v1.4.1)
    * [JavaScript Cookie](https://github.com/js-cookie/js-cookie) (planned)
* [jQuery Panzoom](https://github.com/timmywil/jquery.panzoom) (v2.0.5)
* [jQuery Tipsy](http://onehackoranother.com/projects/jquery/tipsy/) (v1.0.0a)
* [jQuery UI](https://jqueryui.com/) (v1.11.4)
* [wsgicors](https://github.com/may-day/wsgicors) (v0.6.0)
* [wsgiref](https://pypi.python.org/pypi/wsgiref?) (v0.1.2)

## How to Contribute
This application is currently in *beta*. Please report any bugs and issues here. If you're interested in contributing to development, please contact Kyle Hundman (<khundman@gmail.com>)
prior to forking this repository. 

### Broad Areas of Improvement
* Making heavy use of Angular where it makes sense (because we didn't)
* Further improve mobile-friendliness
* Dynamic CSS classes (based on contents in data)
* Centralized area for customization (elasticsearch fields, data sources, etc.)

## Contact
*  Kyle Hundman: <khundman@gmail.com>

## Credits

### Original Authors
* [Kyle Hundman](https://github.com/khundman)
* [Valentino Constantinou](https://github.com/vc1492a)
* [Connor Francis](https://github.jpl.nasa.gov/cfrancis)
* [Randy Moss](https://github.com/RandalMoss)
* [Simon Anuszczyk](https://github.jpl.nasa.gov/sanuszcz)
* [Lini Mestar](https://github.com/lmEshoo)

### Special thanks to these JPLers:
* Thomas Berry
* Robert Bertsch
* Sue Fawcett
* Cameron Goodale
* Pete Jones
* Sonny Koliwad
* Andrea Ollier
* Tom Soderstrom