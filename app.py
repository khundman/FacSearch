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

from flask import (
    Flask,
    request,
    Response,
    render_template,
    send_from_directory,
    url_for,
    session,
)
from flask_triangle import Triangle
import os
import gevent
from gevent.wsgi import WSGIServer
from gevent.queue import Queue
from logging import Formatter, FileHandler
from flask.ext.compress import Compress
import json
import requests
from elasticsearch import Elasticsearch

es = Elasticsearch(['http://localhost:9200/'])
INDEX = "facsearch"

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
Compress(app)
Triangle(app)


handler = FileHandler(os.path.join(basedir, 'log.txt'), encoding='utf8')
handler.setFormatter(
    Formatter("[%(asctime)s] %(levelname)-8s %(message)s", "%Y-%m-%d %H:%M:%S")
)
app.logger.addHandler(handler)


@app.route('/health', methods=['GET'])
def health_check():
    return 'healthy'


# @app.context_processor
# def override_url_for():
#     return dict(url_for=dated_url_for)


@app.route('/css/<path:filename>')
def css_static(filename):
    return send_from_directory(app.root_path + '/css/', filename)


@app.route('/static/<path:filename>')
def js_static(filename):
    return send_from_directory(app.root_path + '/static/', filename)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/floorplan')
def floorplan():
    return render_template('floorplan.html')


@app.route('/threesixty')
def threesixty():
    return render_template('three_sixty.html')


@app.route('/people')
def people():
    return render_template('people.html')


@app.route('/search')
def advanced_search():
    return render_template('search.html')


@app.route('/queryAll', methods=['POST', 'GET'])
def queryall():
    if "size" in request.data:
        number = int(request.data.split("=")[1])
        results = es.search(index=INDEX, size=number, body="{}", doc_type="facsearch")
    else:
        results = es.search(index=INDEX, body=request.data)
    print "RESULTS: " + str(results)
    return json.dumps(results)


@app.route('/query', methods=['POST', 'GET'])
def querystr():
    print "QUERY"
    results = es.search(index=INDEX, body=request.data)
    # logger.info(results["aggregations"])
    return json.dumps(results)


@app.route('/count', methods=['POST'])
def count_query():
    results = es.search(index=INDEX, body=request.data)
    return json.dumps(results)


@app.route('/s3floorplan', methods=['POST'])
def get_s3_floorplan():
    image_name = request.data
    image_key = bucket.get_key(os.path.join('jpegs', image_name))
    image_url = image_key.generate_url(600, query_auth=True, force_http=True)
    return image_url


@app.route('/insights')
def insights():
    return render_template('insights.html')


@app.route('/publish', methods=["POST", "GET"])
def publish():
    new_search = str(request.headers["Query"])

    def notify():
        for sub in subscriptions[:]:
            sub.put(new_search)

    gevent.spawn(notify)
    return


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.errorhandler(410)
def gone(e):
    return render_template('410.html'), 410


@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500


if __name__ == "__main__":
    app.debug = True
    server = WSGIServer(("", 5005), app)
    server.serve_forever()
