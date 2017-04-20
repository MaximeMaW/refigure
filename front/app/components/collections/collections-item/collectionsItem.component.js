/**
 * @ngdoc directive
 * @name refigureApp.directive:collectionsItem
 * @restrict E
 * @description
 * Single collection page
 * @example
 * <collections-item></collections-item>
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .component('collectionsItem', {
            templateUrl: 'view/collectionsItem.component.html',
            controllerAs: 'vm',
            controller: ItemController
        });

    ItemController.$inject = [
        '$state',
        '$stateParams',
        'collections',
        'auth',
        'authUserInfo'
    ];

    function ItemController($state, $stateParams, collections, auth, authUserInfo) {
        var vm = this;
        var currentLastInRow = -1;

        vm.$onInit = activate;
        vm.refigure = null;
        vm.imageDetails = imageDetails;
        vm.toggleFlag = toggleFlag;
        vm.details = null;
        vm.isAdmin = isAdmin;

        ///////////////////////

        function activate() {
            //vm.elementsInRow = Math.floor(window.innerWidth / blockWidth);
            collections
                .get($stateParams.id)
                .then(function (resp) {
                    $state.current.data.headerTitle = '"' + resp.Title + '"';
                    vm.refigure = resp;
                    auth.setUsrNames(vm.refigure.User);
                    vm.refigure.KeywordsChips = vm.refigure.Keywords.split(/(?:(?:&[^;]+;)|\s|\||,|;)+/);
                });
        }

        function imageDetails(e, index) {
            var el = e.originalTarget,
                nextElement;
            if (el.tagName === 'IMG') {
                el = el.parentNode;
            }
            if (vm.details && vm.details.ID === vm.refigure.Figures[index].ID) {
                //close current
                currentLastInRow = -1;
                vm.refigure.Figures[index].lastInRow = false;
                vm.details = null;
            } else {
                if (currentLastInRow !== -1) {
                    //close previously opened
                    vm.refigure.Figures[currentLastInRow].lastInRow = false;
                }
                //search for last in row
                currentLastInRow = index;
                while (el) {
                    nextElement = getNextImage(el);
                    if (
                        currentLastInRow === vm.refigure.Figures.length - 1 || //is last element
                        el.getBoundingClientRect().right > nextElement.getBoundingClientRect().right //last in row
                    ) {
                        vm.refigure.Figures[currentLastInRow].lastInRow = true;
                        break;
                    }
                    currentLastInRow++;
                    el = el.nextElementSibling;
                }
                vm.details = vm.refigure.Figures[index];
            }

            function getNextImage(el) {
                var ret = el.nextElementSibling;
                if (ret && ret.tagName === 'MD-CARD') {
                    ret = ret.nextElementSibling;
                }
                return ret || el;
            }
        }

        function toggleFlag() {
            collections.toggleFlag(vm.refigure.ID)
                .then(function () {
                    vm.refigure.Flagged = !vm.refigure.Flagged * 1;
                });
        }

        function isAdmin() {
            return authUserInfo.Type === 2;
        }

    }
})(window.angular);
