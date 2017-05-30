/**
 * @ngdoc directive
 * @name refigureApp.directive:blog
 * @restrict E
 * @description
 * Blog grid
 * @example
 * <blog></blog>
 */
(function(angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('blog', {
            templateUrl: 'view/blog.component.html',
            controller: Controller,
            controllerAs: 'vm'
        });

    Controller.$inject = ['blog'];

    function Controller(blog) {
        var vm = this;

        vm.blog = [];
        vm.$onInit = activate;

        /////////////////////

        /**
         * @ngdoc method
         * @name refigureApp.directive:blog#activate
         * @methodOf refigureApp.directive:blog
         * @description
         * Activates controller
         */
        function activate() {
            blog.getAll().then(function (data) {
                vm.blog = data;
            });
        }
    }
})(window.angular);
