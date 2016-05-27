(function() {
    angular.module('loc8rApp')
        .service('loc8rData', loc8rData);

    loc8rData.$inject = ['$http'];

    function loc8rData($http) {
        var locationAll = function() {
            return $http.get('/api/locations/all');
        };

        var locationById = function(locationid) {
            return $http.get('/api/locations/' + locationid);
        };

        var addReviewById = function(locationid, data) {
            return $http.post('/api/locations/' + locationid + '/reviews', data);
        };

        return {
            locationAll: locationAll,
            locationById: locationById,
            addReviewById: addReviewById
        };
    }
}());
