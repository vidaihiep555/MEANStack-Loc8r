(function() {
    angular.module('loc8rApp')
        .service('loc8rData', loc8rData);

    loc8rData.$inject = ['$http'];
    function loc8rData($http) {
        return $http.get('/api/locations/all');
    }
}());
