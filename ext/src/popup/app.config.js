(function (angular) {

    //debug page chrome-extension://eomljbidagegcimpgnpmmejnjbcfpdgo/popup/popup.html
    angular.module('ReFigure')
        .constant('STORAGE', {
            CURRENT_TAB: null,
            FIGURES: [],
            FOUND_FIGURES: [],
            SELECTED: []
        })
        .config(ConfigController)
        .run(RunController);

    ConfigController.$inject = ['STORAGE'];

    function ConfigController(STORAGE) {
        chrome.storage.local.get('rfFigures', function (data) {
            STORAGE.FIGURES = data.rfFigures || [];
        });

        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (res) {
            STORAGE.CURRENT_TAB = res[0].id;
        });

        chrome.storage.local.get('rfSelected', function (data) {
            STORAGE.SELECTED = data.rfSelected || [];
        });

        chrome.storage.local.get('foundFigures', function (data) {
            STORAGE.FOUND_FIGURES = data.foundFigures || [];
        });
    }

    RunController.$inject = ['$rootScope', 'FoundFiguresService'];

    function RunController($rootScope, FoundFiguresService) {
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                if (sender.tab && request.type === _gConst.MSG_TYPE_SEARCH_COMPLETED) {
                    $rootScope.$apply(function () {
                        STORAGE.FIGURES = request.figures;
                    });
                } else if (sender.tab && request.type === _gConst.MSG_TYPE_CHECK_COMPLETED){
                    $rootScope.$apply(function () {
                        STORAGE.FOUND_FIGURES = request.figures;
                    });
                }
            return true;
            }
        );

        $rootScope.figuresToggler = FoundFiguresService;
    }

})(window.angular);