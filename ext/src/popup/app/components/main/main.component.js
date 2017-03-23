(function (angular) {

    angular.module('ReFigure')
        .component('main', {
            controller: Controller,
            controllerAs: 'vm',
            templateUrl: 'view/main.component.html'
        });


    Controller.$inject = ['$scope', 'STORAGE'];

    function Controller($scope, STORAGE) {
        let vm = this;

        vm.error = '';

        vm.figureAddStart = figureAddStart;
        vm.figureRemove = figureRemove;

        vm.$onInit = activate;

        //////////////////

        function activate() {
            vm.selected = STORAGE.SELECTED;
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                    if (sender.tab && request.type === _gConst.MSG_TYPE_ADD_COMPLETED) {
                        let selectedImage = searchImage(request.src);
                        if (selectedImage) {
                            vm.selected.push(selectedImage);
                            vm.selected = dedupFigures(vm.selected);
                            chrome.storage.local.set({
                                rfSelected: angular.copy(vm.selected)   //clear $hasKey
                            });
                        }
                        $scope.$apply();
                    }
                }
            );
        }

        function figureRemove(index) {
            vm.selected.splice(index, 1);
            chrome.storage.local.set({
                rfSelected: angular.copy(vm.selected)   //clear $hasKey
            });
        }

        function figureAddStart() {
            vm.error = '';
            chrome.tabs.sendMessage(STORAGE.CURRENT_TAB, {
                type: _gConst.MSG_TYPE_ADD_START
            });
        }

        function searchImage(src) {
            let img = STORAGE.FIGURES.find(function (el) {
                return el.URL === src;
            });
            if (!img) {
                vm.error = _gConst.POPUP_ERROR_FIG_NOT_PARSED;
                return false;
            }

            let isDup = vm.selected.find(function (el) {
                return el.URL === src;
            });

            if (isDup) {
                vm.error = _gConst.POPUP_ERROR_FIG_DUPLICATE;
                return false;
            }
            return img;
        }

        function dedupFigures(figures) {
            let deduped = [];
            for (let i = 0; i < figures.length; ++i) {
                let found = false;
                for (let j = 0; j < deduped.length; ++j) {
                    if (figures[i].URL && figures[i].URL.toLowerCase() === deduped[j].URL.toLowerCase()) {
                        found = true;
                        break;
                    }
                    if (figures[i].DOIFigure && deduped[j].DOIFigure && figures[i].DOIFigure.toLowerCase() === deduped[j].DOIFigure.toLowerCase()) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    deduped.push(figures[i]);
                }
            }
            return deduped;
        }

    }

})(window.angular);
