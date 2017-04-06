/**
 * @ngdoc directive
 * @name refigureApp.directive:searchResults
 * @restrict E
 * @description
 * Search Results
 * @example
 * <search-results></search-results>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('searchResults', {
            templateUrl: 'view/searchResults.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = ['$scope', 'collections', '$stateParams'];

    function Controller($scope, collections, $stateParams) {
        var vm = this;

        vm.results = [];

        $scope.term = $stateParams.term;

        vm.total = 0;

        vm.searchParams = {
            query: $stateParams.term
        };

        vm.submit = submit;

        activate();

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureApp.directive:searchResults#activate
         * @methodOf refigureApp.directive:searchResults
         * @description
         * Activates controller
         */
        function activate() {
            $scope.$watchCollection('vm.searchParams', load);
        }

        /**
         * @ngdoc method
         * @name refigureApp.directive:searchResults#load
         * @methodOf refigureApp.directive:searchResults
         * @description
         * Loads component data
         */
        function load() {
            collections.search(vm.searchParams).then(function (res) {
                vm.results = res.results;
                vm.total = res.found;
            });
        }

        function submit(term) {
            vm.searchParams.query = term;
        }
    }
})(window.angular);
