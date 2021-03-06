var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}

var theEarth = (function() {
    var earthRadius = 6371; // km, miles is 3959

    var getDistanceFromRads = function(rads) {
        return parseFloat(rads * earthRadius);
    };

    var getRadsFromDistance = function(distance) {
        return parseFloat(distance / earthRadius);
    };

    return {
        getDistanceFromRads: getDistanceFromRads,
        getRadsFromDistance: getRadsFromDistance
    };
})();

/* GET api/locationsall */
module.exports.locationsListAll = function(req, res) {
    Loc.find({}, function(err, results) {
        var locations;
        if (err) {
            //console.log('geoNear error:', err);
            sendJsonResponse(res, 404, err);
        } else {
            //console.log("Locations: " + results);
            locations = buildLocationList(results);
            sendJsonResponse(res, 200, locations);
        }
    });
};

/* GET api/locations */
module.exports.locationsListByDistance = function(req, res) {
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var maxDistance = parseFloat(req.query.max);
    var point = {
        type: 'Point',
        coordinates: [lng, lat]
    };
    var geoOptions = {
        spherical: true,
        maxDistance: theEarth.getRadsFromDistance(maxDistance),
        num: 10
    };
    if ((!lng && lng !== 0) || (!lat && lat !== 0) || !maxDistance) {
        sendJsonResponse(res, 404, {
            "message": "Not found, lng, lat and maxDistance are both required"
        });
        return;
    }
    Loc.geoNear(point, geoOptions, function(err, results, stats) {
        var locations;
        console.log('Geo Results', results);
        console.log('Geo stats', stats);
        if (err) {
            console.log('geoNear error:', err);
            sendJsonResponse(res, 404, err);
        } else {
            locations = buildLocationList(results);
            sendJsonResponse(res, 200, locations);
        }
    });
};

function buildLocationList(results) {
    var locations = [];
    results.forEach(function(doc) {
        locations.push({
            //distance: theEarth.getDistanceFromRads(doc.dis),
            distance: theEarth.getDistanceFromRads(0.003),
            name: doc.name,
            address: doc.address,
            rating: doc.rating,
            facilities: doc.facilities,
            _id: doc._id
        });
    });
    return locations;
}

/* POST api/locations */
module.exports.locationsCreate = function(req, res) {
    var newLocation = {
        name: req.body.name,
        address: req.body.address,
        facilities: req.body.facilities.split(","),
        coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
        openingTimes: [{
            days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1,
        }, {
            days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2,
        }]
    };
    //console.log("new location:" + newLocation.name);
    Loc.create({
        name: req.body.name,
        address: req.body.address,
        facilities: req.body.facilities.split(","),
        coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
        openingTimes: [{
            days: req.body.days1,
            opening: req.body.opening1,
            closing: req.body.closing1,
            closed: req.body.closed1,
        }, {
            days: req.body.days2,
            opening: req.body.opening2,
            closing: req.body.closing2,
            closed: req.body.closed2,
        }]
    }, function(err, location) {
        if (err) {
            sendJsonResponse(res, 404, err);
        } else {
            sendJsonResponse(res, 201, location);
        }
    });
};

/* GET api/locations/:locationid */
module.exports.locationsReadOne = function(req, res) {
    if (req.params && req.params.locationid) {
        Loc.findById(req.params.locationid).exec(function(err, location) {
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "Location not found"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 404, err);
                return;
            }
            sendJsonResponse(res, 200, location);
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid is required"
        });
    }
};

/* PUT api/locations/:locationid */
module.exports.locationsUpdateOne = function(req, res) {
    if (req.params && req.params.locationid) {
        Loc.findById(req.params.locationid).select('-rating -reviews').exec(function(err, location) {
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "Location Not found"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 404, err);
                return;
            }
            //update
            location.name = req.body.name;
            location.address = req.body.address;
            location.facilities = req.body.facilities.split(",");
            location.coords = [parseFloat(req.body.lng), parseFloat(req.body.lat)];
            location.openingTimes = [{
                days: req.body.days1,
                opening: req.body.opening1,
                closing: req.body.closing1,
                closed: req.body.closed1,
            }, {
                days: req.body.days2,
                opening: req.body.opening2,
                closing: req.body.closing2,
                closed: req.body.closed2,
            }];
            //save
            location.save(function(err, location) {
                if (err) {
                    sendJsonResponse(res, 404, err);
                } else {
                    sendJsonResponse(res, 200, location);
                }
            });
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid is required"
        });
    }
};
/* DELETE api/locations/:locationid */
module.exports.locationsDeleteOne = function(req, res) {
    if (req.params && req.params.locationid) {
        Loc.findByIdAndRemove(req.params.locationid).exec(function(err, location) {
            if (err) {
                sendJSONresponse(res, 404, err);
            } else {
                //console.log("Location id " + req.params.locationid + " deleted");
                sendJSONresponse(res, 204, null);
            }
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid is required"
        });
    }
};
