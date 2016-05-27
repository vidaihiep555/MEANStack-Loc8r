(function() {
    angular.module('loc8rApp')
        .controller('homeCtrl', homeCtrl);

    homeCtrl.$inject = ['$scope', 'loc8rData'];

    function homeCtrl($scope, loc8rData) {
        var vm = this;
        vm.pageHeader = {
            title: 'Loc8r',
            strapline: 'Find places to work with wifi near you!'
        };
        vm.sidebar = {
            content: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for."
        };
        vm.message = "Checking your location";
        loc8rData.locationAll()
            .success(function(data) {
                if (data.length < 0) {
                    vm.message = "No places found.";
                }
                vm.data = {
                    locations: data
                };
            })
            .error(function(e) {
                console.log("ERROR: " + e);
                vm.message = "Sorry, something's gone wrong!";
            });
    }
}());
