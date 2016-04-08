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

/*GET api/locations*/
module.exports.locationsListByDistance = function(req, res) {
    var lng = parseFloat(req.query.lng);
    var lat = parseFloat(req.query.lat);
    var maxDistance = parseFloat(req.query.max);
    var point = {
        type: 'Points',
        coordinates: [lng, lat]
    };
    var geoOptions = {
        spherical: true,
        maxDistance: theEarth.getRadsFromDistance(maxDistance),
        num: 10
    };
    if (!lng || !lat || !maxDistance) {
        sendJsonResponse(res, 404, {
            "message": "Not found, lng, lat and maxDistance are both required"
        });
        return;
    }
    Loc.geoNear(point, geoOptions, function(err, results, stats) {
        var locations = [];
        if (err) {
            sendJsonResponse(res, 404, err);
        } else {
            results.forEach(function(doc) {
                locations.push({
                    distance: theEarth.getDistanceFromRads(doc.dis),
                    name: doc.obj.name,
                    address: doc.obj.address,
                    rating: doc.obj.rating,
                    facilities: doc.obj.facilities,
                    _id: doc.obj._id
                });
            });
            sendJsonResponse(res, 200, locations);
        }
    });
};

/*POST api/locations*/
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
    Loc.create(newLocation, function(err, location) {
        if (err) {
            sendJsonResponse(res, 404, err);
        } else {
            sendJsonResponse(res, 201, location);
        }
    });
};

/*GET api/locations/:locationid*/
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

/*PUT api/locations/:locationid */
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
/*DELETE api/locations/:locationid */
module.exports.locationsDeleteOne = function(req, res) {
    if (req.params && req.params.locationid) {
        Loc.findByIdAndRemove(req.params.locationid).exec(function(err, location) {
            if (err) {
                sendJSONresponse(res, 404, err);
            } else {
                console.log("Location id " + req.params.locationid + " deleted");
                sendJSONresponse(res, 204, null);
            }
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid is required"
        });
    }
};
