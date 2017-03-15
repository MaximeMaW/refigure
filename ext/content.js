
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === _gConst.MSG_TYPE_START_SEARCH) {
        setTimeout(searchFigures(), 1);
    }
    return true;
});

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

function searchFigures() {
    var figures = [];
    if (typeof parseFigures === 'function') {
        // figures = parseFigures();
        parseFigures().then(function (result) {
            figures = result;
            // console.log(result);
            figures = dedupFigures(figures);
            console.log(figures);
            if (figures.length > 0) {
                sendCheckFiguresRequest(figures);
            } else {
                chrome.runtime.sendMessage({type: _gConst.MSG_TYPE_SEARCH_COMPLETED, count: figures.length});
            }
        }, function (error) {
            console.log(error);
        });
    } else {
        for (var i = 0; i < document.images.length; i++) {
            figures.push({URL: document.images[i].src});
        }
    }
}

function sendCheckFiguresRequest(figures) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (e) {
        if (xhr.readyState === 4) {
            var count = 0;
            var foundFigures = [];
            if (xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                if (json.error) {
                    console.log('Failed to send search request, got response ', json);
                } else {
                    if (json.data && json.data.figures && Array.isArray(json.data.figures)) {
                        count = json.data.figures.length;
                        foundFigures = json.data.figures;
                        console.log(json);
                    } else {
                        console.log('Got broken response', json);
                        count = -1;
                    }
                }
            } else {
                console.log('Failed to send search request, got status ', xhr.status);
                count = -1;
            }
            chrome.runtime.sendMessage({
                type: _gConst.MSG_TYPE_SEARCH_COMPLETED,
                count: count,
                figures: foundFigures
            });
        }
    };
    xhr.open("POST", _gApiURL + 'check-figures', true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({figures: figures}));
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
