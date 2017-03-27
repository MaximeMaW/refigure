(function (angular) {

    angular.module('ReFigure')
        .service('CollectionSvc', CollectionService);

    CollectionService.$inject = ['$location', '$http', 'AuthService'];

    function CollectionService($location, $http, AuthService) {
        let service = this;

        if (AuthService.userInfo) {
            $http.defaults.headers.common['Authentication'] = AuthService.userInfo.Token;
        } else {
            $http.defaults.headers.common['Authentication'] = undefined;
        }

        service.create = function (params) {
            return $http
                .post(_gApiURL + "metapublication", params)
                .then((resp) => {
                    // $location.path('/collections/' + resp.data.data.Metapublication.ID);
                    $location.path('/my-collections');
                });
        };

        service.read = function (id) {
            return $http
                .get(_gApiURL + "metapublication/" + id);
        };

        service.update = function (params) {
            return $http
                .put(_gApiURL + "metapublication", params)
                .then((resp) => {
                    // $location.path('/collections/' + resp.data.data.Metapublication.ID);
                    $location.path('/my-collections');
                });
        };

        service.delete = function (id) {
            return $http
                .delete(_gApiURL + "metapublication/" + id)
                .then(() => {
                    $location.path('/my-collections');
                });
        };

        service.getUserCollections = function () {
            return $http
                .get(_gApiURL + "my-metapublications");
        };

        service.toggleFlag = function (params) {
            return $http
                .put(_gApiURL + "metapublication-flag", params);
        }

    }

})(window.angular);
