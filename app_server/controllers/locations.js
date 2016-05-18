var request = require('request');
var apiOptions = {
    server: 'http://localhost:3000'
};
if (process.env.NODE_ENV === 'production') {
    apiOptions.server = 'http://meanstack-loc8r.herokuapp.com';
}

/* GET home page */
module.exports.homelist = function(req, res) {
    var requestOptions, path;
    path = '/api/locations/all';
    requestOptions = {
        url: apiOptions.server + path,
        method: 'GET',
        json: {}
    };
    request(requestOptions, function(err, response, body) {
        console.log('BODY:' + body);
        if (response.stausCode === 200 && data.length > 0) {
            //Do something
        }
        renderHomepage(req, res, body);
    });
};

function renderHomepage(req, res, responseBody) {
    var message;
    if (!(responseBody instanceof Array)) {
        responseBody = [];
        message = 'API error';
    } else if (!responseBody.length) {
        message = 'No places found nearby';
    }
    res.render('locations-list', {
        title: 'Loc8r - find a place to work with wifi',
        pageHeader: {
            title: 'Loc8r',
            strapline: 'Find places to work with wifi near you!'
        },
        sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
        locations: responseBody,
        message: message
    });
}

/* GET location-info page*/
module.exports.locationInfo = function(req, res) {
    //if (req.params && req.params.locationid) {
    getLocationInfo(req, res, function(req, res, responseData) {
        renderDetailsPage(req, res, responseData);
    });
    //}
    /*res.render('location-info', {
        title: 'Starcups',
        pageHeader: {
            title: 'Starcups'
        },
        sidebar: {
            context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
            callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
        },
        location: {
            name: 'Starcups',
            address: '125 High Street, Reading, RG6 1PS',
            rating: 3,
            facilities: ['Hot drinks', 'Food', 'Premium wifi'],
            coords: {
                lat: 51.455041,
                lng: -0.9690884
            },
            openingTimes: [{
                days: 'Monday - Friday',
                opening: '7:00am',
                closing: '7:00pm',
                closed: false
            }, {
                days: 'Saturday',
                opening: '8:00am',
                closing: '5:00pm',
                closed: false
            }, {
                days: 'Sunday',
                closed: true
            }],
            reviews: [{
                author: 'Simon Holmes',
                rating: 5,
                timestamp: '16 July 2013',
                reviewText: 'What a great place. I can\'t say enough good things about it.'
            }, {
                author: 'Charlie Chaplin',
                rating: 3,
                timestamp: '16 June 2013',
                reviewText: 'It was okay. Coffee wasn\'t great, but the wifi was fast.'
            }]
        }
    });*/
};

function renderDetailsPage(req, res, locDetails) {
    var message;
    res.render('location-info', {
        title: locDetails.name,
        pageHeader: {
            title: locDetails.name
        },
        sidebar: {
            context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done.',
            callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
        },
        location: locDetails,
        message: message
    });
}

function getLocationInfo(req, res, callback) {
    var requestOptions, path;
    path = '/api/locations/' + req.params.locationid;
    requestOptions = {
        url: apiOptions.server + path,
        method: 'GET',
        json: {}
    };
    request(requestOptions, function(err, response, body) {
        var responseData = body;
        var status = response.statusCode;
        if (status === 200) {
            responseData.coords = {
                lng: body.coords[0],
                lat: body.coords[1]
            };
            callback(req, res, responseData);
        } else {
            _showError(req, res, response.statusCode);
        }
    });
}

/* GET add review page */
module.exports.addReview = function(req, res) {
    getLocationInfo(req, res, function(req, res, dataResponse) {
        renderReviewForm(req, res, dataResponse);
    });
};

function renderReviewForm(req, res, locDetails) {
    res.render('location-review-form', {
        title: 'Review ' + locDetails.name + ' on Loc8r',
        pageHeader: {
            title: 'Review ' + locDetails.name
        },
        error: req.query.err
    });
}

/* POST do add review */
module.exports.doAddReview = function(req, res) {
    var requestOptions, path, locationid, postdata;
    locationid = req.params.locationid;
    postdata = {
        author: req.body.name,
        rating: parseInt(req.body.rating, 10),
        reviewText: req.body.review
    };
    requestOptions = {
        url: apiOptions.server + path,
        method: 'POST',
        json: postdata
    };
    if (!postdata.author || !postdata.rating || !postdata.reviewText) {
        res.redirect('/location/' + locationid + '/reviews/new?err=val');
    } else {
        request(requestOptions, function(err, response, body) {
            var statusCode = response.statusCode;
            if (statusCode === 201) {
                res.redirect('/location/' + locationid);
            } else if (statusCode === 400 && body.name && body.name ===
                "ValidationError") {
                res.redirect('/location/' + locationid + '/reviews/new?err=val');
            } else {
                _showError(req, res, statusCode);
            }
        });
    }

};

function _showError(req, res, status) {
    var title, content;
    if (status === 404) {
        title = "404, page not found";
        content = "Oh dear. Looks like we can't find this page. Sorry.";
    } else if (status === 500) {
        title = "500, internal server error";
        content = "How embarrassing. There's a problem with our server.";
    } else {
        title = status + ", something's gone wrong";
        content = "Something, somewhere, has gone just a little bit wrong.";
    }
    res.status(status);
    res.render('generic-text', {
        title: title,
        content: content
    });
}
