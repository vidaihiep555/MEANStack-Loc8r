(function() {
    angular.module('loc8rApp')
        .controller('reviewModalCtrl', reviewModalCtrl);

    reviewModalCtrl.$inject = ['$uibModalInstance', 'loc8rData', 'locationData'];

    function reviewModalCtrl($uibModalInstance, loc8rData, locationData) {
        var vm = this;
        vm.locationData = locationData;
        vm.modal = {
            close: function(result) {
                $uibModalInstance.close(result);
            },
            cancel: function() {
                $uibModalInstance.dismiss('cancel');
            }
        };

        vm.onSubmit = function() {
            vm.formError = "";
            if (!vm.formData.name || !vm.formData.rating || !vm.formData.reviewText) {
                vm.formError = "All the fields are required!";
                return false;
            } else {
                console.log(vm.formData);
                vm.doAddReview(vm.locationData.locationid, vm.formData);
            }
        };

        vm.doAddReview = function(locationid, formData) {
            loc8rData.addReviewById(locationid, {
                    author: formData.name,
                    rating: formData.rating,
                    reviewText: formData.reviewText
                })
                .success(function(data) {
                    console.log("Success");
                    vm.modal.close(data);
                }).error(function(data) {
                    vm.formError = "Your review has not been saved. Please try again!";
                });
            return false;
        };
    }
}());
