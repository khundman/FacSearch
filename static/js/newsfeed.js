// set an initial index
var index = 0;

function retrievePersonnelInfo(data) {
    // get the total amount of elements for the feed
    var max_index_raw = Object.keys(data['people']['map']).length;

    // retrieve information that is not empty
    non_empty_list = [];
    for (i = 0; i < max_index_raw; i++) {
        // retrieves personnel names and departments, but could be anything
        if (data['people']['map'][i]['firstname'] != '' && data['people']['map'][i]['firstname'] != 'n/a') {
            non_empty_list.push(data['people']['map'][i]['firstname'] + ' ' + data['people']['map'][i]['lastname'] +
            ': ' + data['people']['map'][i]['personDeptName'])
        }
    }

    // get the length of the sorted list
    var max_index_sorted = non_empty_list.length;

    // display the result in the news feed
    document.getElementById('news-feed').innerHTML = non_empty_list[index];

    // index the list upward for the next item in the feed
    if (index < max_index_sorted + 1) {
        index += 1;
    }
    else {
        index = 0;
    }
}

// use jQuery to run repeatedly
window.setInterval(function(){
    // call the function with data
    retrievePersonnelInfo(rawdata)
}, 4000);