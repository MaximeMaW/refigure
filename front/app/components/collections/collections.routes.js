/**
 * Module routing
 */
(function (angular) {
    'use strict';

    angular
        .module('refigureApp')
        .run(appRun);

    var states = [{
        state: 'collections.item',
        config: {
            url: '/collections/:id',
            template: '<collections-item></collections-item>',
            data: {}
        }
    }, {
        state: 'collections.user',
        config: {
            url: '/collections/user/:id',
            template: '<collections-user></collections-user>',
            data: {}
        }
    }];

    appRun.$inject = [
        'routerHelper'
    ];

    function appRun(routerHelper) {

        routerHelper.trailingSlash();
        routerHelper.configureStates(getStates(), '/');

        //////////////////////

        function getStates() {
            return [{
                state: 'collections',
                config: {
                    abstract: true,
                    templateUrl: 'view/collections.html'
                }
            }]
                .concat(states);
        }
    }
})(window.angular);
