angular.module('loc8rApp', []);

var _isNumeric = function(n) {
    return !isNaN(n) && isFinite(n);
};

var formatDistance = function() {
    return function(distance) {
        var numDistance, unit;
        if (distance && _isNumeric(distance)) {
            if (distance < 1) {
                numDistance = parseInt(distance * 1000, 10);
                unit = "m";
            } else {
                numDistance = parseFloat().toFixed(1);
                unit = "km";
            }
            return numDistance + unit;
        } else {
            return "?";
        }
    };
};

var ratingStars = function() {
    return {
        scope: {
            thisRating: '=rating'
        },
        templateUrl: '/angular/rating-stars.html'
    };
};

var loc8rData = function($http) {
    return $http.get('/api/locations/all');
};

var locationListCtrl = function($scope, loc8rData) {
    $scope.message = "Searching for nearby places";
    loc8rData
        .success(function(data){
            if(data.length < 0){
                $scope.message = "No places found.";
            }
            $scope.data = {
                locations: data
            };
        })
        .error(function(e){
            console.log("ERROR: " + e);
            $scope.message = "Sorry, something's gone wrong!";
        });
};

angular.module('loc8rApp')
    .controller('locationListCtrl', locationListCtrl)
    .filter('formatDistance', formatDistance)
    .directive('ratingStars', ratingStars)
    .service('loc8rData', loc8rData);
