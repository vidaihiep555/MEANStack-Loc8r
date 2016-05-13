var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}

/* GET api/locations/:locationid/reviews */
module.exports.reviewsList = function(req, res) {
    if (req.params.locationid) {
        Loc.findById(req.params.locationid).select('reviews').exec(function(err, location) {
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "Location not found"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 404, err);
                return;
            }
            sendJsonResponse(res, 200, location.reviews);
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "locationid is required"
        });
    }
};

/*POST api/locations/:locationid/reviews */
module.exports.reviewsCreate = function(req, res) {
    if (req.params.locationid) {
        Loc.findById(req.params.locationid).select('name reviews').exec(function(err, location) {
            if (err) {
                sendJsonResponse(res, 404, err);
            } else {
                doAddReview(req, res, location);
            }
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "locationid is required"
        });
    }
};

function doAddReview(req, res, location) {
    if (!location) {
        sendJsonResponse(res, 404, {
            "message": "Location not found"
        });
    } else {
        var newReview = {
            author: req.body.author,
            rating: req.body.rating,
            reviewText: req.body.reviewText
        };
        location.reviews.push(newReview);
        location.save(function(err, location) {
            var thisReview;
            if (err) {
                sendJsonResponse(res, 404, err);
            } else {
                updateAverageRating(location._id);
                //get the latest review
                thisReview = location.reviews[location.reviews.length - 1];
                sendJsonResponse(res, 201, thisReview);
            }
        });
    }
}

function updateAverageRating(locationid) {
    Loc.findById(locationid).select('reviews').exec(function(err, location) {
        if (!err) {
            doSetAverageRating(location);
        }
    });
}

function doSetAverageRating(location) {
    var reviewCount, ratingAverage;
    var ratingTotal = 0;
    if (location.reviews && location.reviews.length > 0) {
        reviewCount = location.reviews.length;
        location.reviews.forEach(function(review) {
            ratingTotal += review.rating;
        });
        ratingAverage = parseInt(ratingTotal / reviewCount, 10);
        location.rating = ratingAverage;
        location.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Average rating updated to", ratingAverage);
            }
        });
    }
}

/* GET api/locations/:locationid/reviews/:reviewid */
module.exports.reviewsReadOne = function(req, res) {
    if (req.params && req.params.locationid && req.params.reviewid) {
        Loc.findById(req.params.locationid).select('name reviews').exec(function(err, location) {
            var response, review;
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "Location not found"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 404, err);
                return;
            }
            if (location.reviews && location.reviews.length > 0) {
                review = location.reviews.id(req.params.reviewid);
                if (!review) {
                    sendJsonResponse(res, 404, {
                        "message": "Reviewid not found"
                    });
                } else {
                    response = {
                        location: {
                            name: location.name,
                            id: req.params.locationid
                        },
                        review: review
                    };
                    sendJsonResponse(res, 200, response);
                }
            } else {
                sendJsonResponse(res, 404, {
                    "message": "No Review not found"
                });
            }
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid and reviewid are both required"
        });
    }
};

/* PUT api/locations/:locationid/reviews/:reviewid */
module.exports.reviewsUpdateOne = function(req, res) {
    if (req.params && req.params.locationid && req.params.reviewid) {
        Loc.findById(req.params.locationid).select('reviews').exec(function(err, location) {
            var thisReview;
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "Location not found"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 404, err);
                return;
            }
            if (location.reviews && location.reviews.length > 0) {
                thisReview = location.reviews.id(req.params.reviewid);
                if (!thisReview) {
                    sendJsonResponse(res, 404, {
                        "message": "No review to update"
                    });
                } else {
                    thisReview.author = req.body.author;
                    thisReview.rating = req.body.rating;
                    thisReview.reviewText = req.body.reviewText;
                    location.save(function(err, location) {
                        if (err) {
                            sendJsonResponse(res, 404, err);
                        } else {
                            updateAverageRating(location._id);
                            sendJsonResponse(res, 200, thisReview);
                        }
                    });
                }
            } else {
                sendJsonResponse(res, 404, {
                    "message": "No review to update"
                });
            }
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid and reviewid are both required"
        });
    }
};

/* DELETE api/locations/:locationid/reviews/:reviewid */
module.exports.reviewsDeleteOne = function(req, res) {
    if (req.params && req.params.locationid && req.params.reviewid) {
        Loc.findById(req.params.locationid).select('reviews').exec(function(err, location) {
            var thisReview;
            if (!location) {
                sendJsonResponse(res, 404, {
                    "message": "Location not found"
                });
                return;
            } else if (err) {
                sendJsonResponse(res, 404, err);
                return;
            }
            if (location.reviews && location.reviews.length > 0) {
                thisReview = location.reviews.id(req.params.reviewid);
                if (!thisReview) {
                    sendJsonResponse(res, 404, {
                        "message": "reviewid not found"
                    });
                } else {
                    location.reviews.id(req.params.reviewid).remove();
                    location.save(function(err, location) {
                        if (err) {
                            sendJsonResponse(res, 404, err);
                        } else {
                            updateAverageRating(location._id);
                            sendJsonResponse(res, 204, null);
                        }
                    });
                }
            } else {
                sendJsonResponse(res, 404, {
                    "message": "No review to update"
                });
            }
        });
    } else {
        sendJsonResponse(res, 404, {
            "message": "Not found, locationid and reviewid are both required"
        });
    }
};
