/**
 * @ngdoc directive
 * @name refigureApp.directive:mostVisited
 * @restrict E
 * @description
 * Search Results
 * @example
 * <collection-row item="refigureObject"></collection-row>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureShared')
        .component('collectionRow', {
            templateUrl: 'view/collectionRow.component.html',
            controllerAs: 'vm',
            bindings:{
                item: '<'
            }
        });

})(window.angular);
