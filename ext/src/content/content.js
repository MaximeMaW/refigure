var CONTENT_BLOCK_SELECTOR = 'body';

var refigure = {
    Metapublication: null,
    figures: [],
    foundFigures: []
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    switch (request.type) {
        case _gConst.MSG_TYPE_ADD_START:
            if (!request.Metapublication && !refigure.Metapublication) {
                console.log(request);
                alert('Please select collection to add to');
            } else {
                figureAddStart(request.Metapublication);
            }
            break;
        case _gConst.MSG_TYPE_START_SEARCH:
            setTimeout(searchFigures(), 1);
            break;
        case _gConst.MSG_TYPE_POPUP_OPENED:
            window.figurePopup.hide();
            break;
        case _gConst.MSG_TYPE_ADD_FIGURE_TO_COLLECTION:
            addToSelected(request.src);
    }
});

function onClickImage(event) {
    event.stopPropagation();
    event.preventDefault();
    addToSelected(event.target.src);
    return false;
}

function figureAddStart(Metapublication) {
    refigure.Metapublication = Metapublication || refigure.Metapublication;
    window.figurePopup.show();
    Sizzle(CONTENT_BLOCK_SELECTOR + ' img').forEach(function (el) {
        el.classList.add('rf-addable-image');
        el.addEventListener('click', onClickImage);
    });
}

function figureAddStop() {
    Sizzle(CONTENT_BLOCK_SELECTOR + ' img').forEach(function (el) {
        el.classList.remove('rf-addable-image');
        el.removeEventListener('click', onClickImage);
    });
}

function dedupFigures(figures) {
    var deduped = [];
    for (var i = 0; i < figures.length; ++i) {
        var found = false;
        for (var j = 0; j < deduped.length; ++j) {
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

function parseFigures() {
    var figures = [];
    for (var i = 0; i < document.images.length; i++) {
        figures.push({URL: document.images[i].src});
    }
    return Promise.resolve(figures);
}

function parsingCompleted(figures) {
    console.log('Parsed out from the current page the following figures: ', figures);
    refigure.figures = figures;
    chrome.runtime.sendMessage({
        type: _gConst.MSG_TYPE_SEARCH_COMPLETED,
        figures: figures
    });
}

function searchCompleted(figures) {
    console.log('Found on the current page the following figures: ', figures);
    refigure.foundFigures = figures;
    chrome.runtime.sendMessage({
        type: _gConst.MSG_TYPE_CHECK_COMPLETED,
        figures: figures
    });
}

function searchFigures() {
    parseFigures().then(
        function (result) {
            var figures = dedupFigures(result);
            parsingCompleted(figures);
            if (figures.length > 0) {
                sendCheckFiguresRequest(figures);
            } else {
                searchCompleted([]);
            }
        },
        function (error) {
            console.error(error);
            searchCompleted([]);
        }
    );
}

function sendCheckFiguresRequest(figures) {
    var filteredFigures = figures.map(function (el) {
        return {
            URL: el.URL,
            DOIFigure: el.DOIFigure
        }
    });

    sendRequest({
        type: 'POST',
        url: 'check-figures',
        data: {
            figures: filteredFigures
        }
    }).then(
        function (data) {
            searchCompleted(data.figures);
        },
        function (error) {
            console.log(error);
            searchCompleted([]);
        }
    );
}

function logError() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('ReFigure:');
    console.error.apply(null, args);
}

/**
 * Strips all tags except images,
 * Transforms relative image src to absolute
 * @param {HTMLElement} node content of tag to parse
 * @return {string} transformed html text
 */
function prepareContent(node) {
    var tmpEl = document.createElement('div');
    //replace image tags to save them after "innerHTML"
    var tmpContent = node.innerHTML.replace(/<img/g, '||img||');
    //convert relative image srcs to absolute
    tmpContent = tmpContent.replace(/src="(?!http)(.*?)"/g, function (match, src) {
        tmpEl.innerHTML = '<a href="' + src + '">x</a>';
        return 'src="' + tmpEl.firstChild.href + '"';
    });
    //TODO: convert href and save "a" tags
    //TODO: replace a.ref-tip with span[title="..."] (parse fragment links)
    //strip all tags
    tmpEl.innerHTML = tmpContent;
    tmpContent = tmpEl.innerText;
    //replace images back
    return tmpContent.replace(/\|\|img\|\|/g, '<img');
}

function addToSelected(src) {
    //check current collection for current image ('edit' functionality)
    var img = refigure.Metapublication.Figures.find(function (el) {
        return el.URL === src;
    });
    if (!img) {
        // check if the selected figure exists in the site-specific figures parsed out from the current page
        img = refigure.figures.find(function (el) {
            return el.URL === src;
        });
        if (!img) {
            // if figure was not parsed out then just use image src
            img = {
                URL: src
            };
        }
    }
    window.figurePopup.show(img);
}

function sendRequest(params) {
    var requestParams = Object.assign({
        url: '',
        type: 'GET',
        data: {},
        headers: {}
    }, params);

    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var json = JSON.parse(xhr.responseText);
                    if (json.error) {
                        console.error('Failed to send search request, got response ', json);
                        reject(json);
                    } else {
                        if (json.data) {
                            resolve(json.data);
                        } else {
                            console.error('Got broken response', json);
                            reject(json);
                        }
                    }
                } else {
                    console.error('Failed to send search request, got status ' + xhr.status, xhr);
                    reject(xhr);
                }
            }
        };
        xhr.open(requestParams.type, _gApiURL + requestParams.url, true);
        xhr.setRequestHeader("Content-Type", "application/json");

        Object.keys(requestParams.headers).forEach(function (key) {
            xhr.setRequestHeader(key, requestParams.headers[key]);
        });
        xhr.send(JSON.stringify(requestParams.data));
    });
}

window.figurePopup = {
    _element: null,
    show: function (data) {
        !window.figurePopup._element && window.figurePopup.create();
        // TODO check if the figure exists in the current collection
        // if so, then use UPDATE then not CREATE
        if(data){
            var $scope = angular.element(window.figurePopup._element.getElementsByTagName('form')[0]).scope();
            $scope.$apply(function () {
                $scope.figuresToAdd.push(data);
                $scope.opts.current = $scope.figuresToAdd.length - 1;
            });
        }
        window.figurePopup._element.classList.add('rf-popup-show');
    },
    hide: function () {
        if(window.figurePopup._element){
            angular.element(window.figurePopup._element).remove();
            window.figurePopup._element = null;
        }
    },
    create: function () {
        if (window.figurePopup._element) {
            return false;
        }
        window.figurePopup._element = document.createElement('div');
        window.figurePopup._element.className = 'rf-popup';
        window.figurePopup._element.innerHTML = [
            '<form ng-controller="MainController" ng-submit="submit()" name="addFigureForm" class="panel panel-primary">',
            '   <div class="panel-heading text-center">Add figure to collection "{{refigure.Metapublication.Title}}"</div>',
            '   <div class="panel-body">',
            '       <div class="alert alert-info text-center" ng-hide="figuresToAdd.length">Select an image</div>',
            '   </div>',
            '   <div class="panel-body" ng-show="figuresToAdd.length">',
            '       <div class="form-group">',
            '           <label class="control-label" for="rf-input-url">Figure URL</label>',
            '           <input class="form-control" ng-model="figuresToAdd[opts.current].URL" id="rf-input-url" type="text" placeholder="URL" readonly>',
            '       </div>',

            '       <div class="form-group">',
            '           <label class="control-label">Caption</label>',
            '           <div contenteditable="true" class="form-control" ng-model="figuresToAdd[opts.current].Caption"></div>',
            '       </div>',

            '       <div class="form-group">',
            '           <label class="control-label" for="rf-input-legend">Legend</label>',
            '           <div contenteditable="true" class="form-control" ng-model="figuresToAdd[opts.current].Legend"></div>',
            '       </div>',

            '       <div class="form-group">',
            '           <label class="control-label">Features</label>',
            '           <div contenteditable="true" class="form-control" ng-model="figuresToAdd[opts.current].Features"></div>',
            '       </div>',

            '       <div class="form-group">',
            '           <label class="control-label" for="rf-input-article-doi">Article DOI</label>',
            '           <input class="form-control" ng-model="figuresToAdd[opts.current].DOI" id="rf-input-article-doi" type="text" placeholder="Article DOI">',
            '       </div>',

            '       <div class="form-group">',
            '           <label class="control-label">Article authors</label>',
            '           <div contenteditable="true" class="form-control"ng-model="figuresToAdd[opts.current].Authors"></div>',
            '       </div>',
            '       <div>',
            '           <div class="rf-fig-list-item" ng-repeat="fig in figuresToAdd">',
            '               <img ng-class="opts.current === $index?\'rf-fig-list-item-current\':\'\'" ng-click="opts.current = $index" ng-src="{{fig.URL}}">',
            '           </div>',
            '       </div>',
            '   </div>',


            '   <div class="panel-footer" ng-show="figuresToAdd.length">',
            '       <div class="row">',
            '           <div class="col-xs-6"><button ng-click="dismiss()" type="button" class="btn btn-block btn-info">Dismiss</button></div>',
            '           <div class="col-xs-6"><button class="btn btn-block btn-primary">Submit</button></div>',
            '       </div>',
            '   </div>',
            '</form>'
        ].join('');
        document.body.appendChild(window.figurePopup._element);
        angular.bootstrap(window.figurePopup._element, ['EditFigureDialog'], {strictDi: true});
        return true;
    }
};

angular.module('EditFigureDialog', [])
    .controller('MainController', ['$scope', function ($scope) {
        $scope.refigure = refigure;
        $scope.opts = {
            current: -1
        };
        $scope.figuresToAdd = [];

        $scope.dismiss = function () {
            figureAddStop();
            window.figurePopup.hide();
        };

        $scope.submit = function () {
            chrome.storage.local.get('userInfo', function (data) {
                if (data.userInfo) {
                    var requestNumber = $scope.figuresToAdd.length;
                    var requestCounter = 0;
                    var figure = $scope.figuresToAdd.pop();
                    while (figure) {
                        figure.MetapublicationID = $scope.refigure.Metapublication.ID;
                        sendRequest({
                            type: 'POST',
                            url: 'figure',
                            data: figure,
                            headers: {
                                Authentication: data.userInfo.Token
                            }
                        }).then(function () {
                            requestCounter++;
                            if (requestCounter === requestNumber) {
                                window.figurePopup.hide();
                                alert(_gConst.FIGURE_ADDED);
                            }
                        }, function (data) {
                            console.log(data);
                        });
                        figure = $scope.figuresToAdd.pop();
                    }
                } else {
                    alert(_gConst.ERROR_NOT_LOGGED);
                }
            });
            figureAddStop();
        }
    }])

    .directive('contenteditable', function() {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function(scope, element, attrs, ngModel) {
                if (!ngModel) return; // do nothing if no ng-model

                // Specify how UI should be updated
                ngModel.$render = function() {
                    element.html(ngModel.$viewValue || '');
                };

                // Listen for change events to enable binding
                element.on('blur keyup change', function() {
                    scope.$evalAsync(read);
                });
                read(); // initialize

                // Write data to the model
                function read() {
                    var html = element.html();
                    // When we clear the content editable the browser leaves a <br> behind
                    // If strip-br attribute is provided then we strip this out
                    if (attrs.stripBr && html === '<br>') {
                        html = '';
                    }
                    ngModel.$setViewValue(html);
                }
            }
        };
    });
