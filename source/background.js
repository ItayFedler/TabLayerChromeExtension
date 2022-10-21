var dt;
var newTabid = -9;
var arraytabs;
var currentTabId;
var blacklistedUrls = [];
chrome.storage.local.get({ domains: (blacklistedUrls) }, function (result) {
    //alert('tab count is set to ' + JSON.stringify(arraytabs.length));
    blacklistedUrls = result.domains;
});

/*
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        "id": "sampleContextMenu",
        "title": "Sample Context Menu",
        "contexts": ["selection"]
    });
    //dt = new Date();
    //arraytabs = [];
});
*/

/*
chrome.runtime.onStartup.addListener(function () {
    //alert("onConnected")
});
chrome.tabs.onHighlighted.addListener(function (tab) {
    //   alert("onHighlighted")
    //chrome.windows.getCurrent(getWindows);

});
*/

chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        var blackobj = blacklistedUrls.filter(x => x.domain == extractHostname(tab.url));

        currentTabId = tab.id;
        //if (tab.id != newTabid && (newTabid != -9)) {
        chrome.tabs.captureVisibleTab(null, {}, function (dataUrl) {
            //console.log(dataUrl);
            dt = new Date();
            var tabObj = arraytabs.filter(x => x.id == tab.id);
            if (tabObj.length != 0) {
                tabObj[0].last_seen = dt.getTime()
                tabObj[0].image_2 = dataUrl || "./placeholder-image.png";
                if (blackobj.length > 0)
                    tabObj[0].image_2 = "./placeholder-image-100.png";
                arraytabs = arraytabs.filter(x => x.id != tab.id);
                arraytabs.push(tabObj[0]);
                updateStorage()
            }
        });

        // }
        // else {
        //     newTabid = null;
        // }
    });
});
////////////////////////////////////////////////////////////////
chrome.tabs.query({}, function (tabs) {
    arraytabs = [];
    dt = new Date();
    tabs.forEach(element => {

        addTabToArray(element);
    });
    updateStorage()
});
function addTabToArray(tab) {
    var image2 = "./placeholder-image.png";
    var blackobj = blacklistedUrls.filter(x => x.domain == extractHostname(tab.url));
    if (blackobj.length > 0)
        image2 = "./placeholder-image-100.png";
    arraytabs.push({ winId: tab.windowId, id: tab.id, title: tab.title, group: tab.url, image_2: image2, image_1: tab.favIconUrl, last_seen: dt.getTime(), index: -tab.index });

}
//////////////////NEED TO UPDATE THE TABLE OF OBJECTS AND NOT CHANGE IT EVERY TIME//////////////////
chrome.tabs.onRemoved.addListener(function (tabid) {
    removeItem(tabid);
});
chrome.tabs.onCreated.addListener(function (tab) {
    dt = new Date();
    newTabid = tab.id;
    var image2 = "./placeholder-image.png";
    var blackobj = blacklistedUrls.filter(x => x.domain == extractHostname(tab.url));
    if (blackobj.length > 0)
        image2 = "./placeholder-image-100.png";
    arraytabs.push({ winId: tab.windowId, id: tab.id, title: tab.title, group: tab.url, image_2: image2, image_1: tab.favIconUrl, last_seen: dt.getTime(), index: -tab.index });
    updateStorage();

});


chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    console.log(changeInfo);
    var tabObj = arraytabs.filter(x => x.id == tabId);
    if (typeof changeInfo.status === "string") {
        var blackobj = blacklistedUrls.filter(x => x.domain == extractHostname(tab.url));


        if (tabObj.length != 0) {
            tabObj[0].image_1 = tab.favIconUrl;
            tabObj[0].image_2 = "./placeholder-image.png";
            if (blackobj.length > 0)
                tabObj[0].image_2 = "./placeholder-image-100.png";
            tabObj[0].group = tab.url;
            tabObj[0].title = tab.title;


            if (blackobj.length === 0) {
                if (changeInfo.status == "complete") {
                    if (currentTabId === tabId) {
                        chrome.tabs.captureVisibleTab(null, { quality: 0 }, function (dataUrl) {
                            if (dataUrl !== undefined) {
                                tabObj[0].image_2 = dataUrl;
                                arraytabs = arraytabs.filter(x => x.id != tabId);
                                arraytabs.push(tabObj[0]);
                                updateStorage();
                            }
                        });
                    }
                }



            }
            arraytabs = arraytabs.filter(x => x.id != tabId);
            arraytabs.push(tabObj[0]);
            updateStorage();
            return;
        }


    }
    if (typeof changeInfo.title === "string") {
        tabObj[0].title = tab.title;
        var blackobj = blacklistedUrls.filter(x => x.domain == extractHostname(tab.url));
        if (blackobj.length > 0)
            tabObj[0].image_2 = "./placeholder-image-100.png";
        else {
            if (currentTabId === tabId) {
                chrome.tabs.captureVisibleTab(null, { quality: 0 }, function (dataUrl) {
                    if (dataUrl !== undefined) {
                        tabObj[0].image_2 = dataUrl;
                        arraytabs = arraytabs.filter(x => x.id != tabId);
                        arraytabs.push(tabObj[0]);
                        updateStorage();
                    }
                });
            }
        }
        arraytabs = arraytabs.filter(x => x.id != tabId);
        arraytabs.push(tabObj[0]);
        updateStorage();
        return;
    }

});

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.message === "removed") {
            //sendResponse({message: "hi to you"});
            chrome.tabs.remove(parseInt(request.tabid), function () { });

            removeItem(request.tabid);
        }
        if (request.message === "toggleBlacklisted") {
            //sendResponse({message: "hi to you"});
            var blackobj = blacklistedUrls.filter(x => x.domain == request.domain);
            if (blackobj.length === 0) {
                blacklistedUrls.push({ domain: request.domain })
                ///alert("Blacklisted: " + request.domain)
            }
            else {
                blacklistedUrls = blacklistedUrls.filter(x => x.domain != request.domain);
                ///alert("Unblacklisted: " + request.domain)
            }
            updateBlacklistStorage()
        }
        if (request.message === "capture") {
            chrome.tabs.captureVisibleTab(null, {}, function (dataUrl) {
                ///alert(dataUrl);
                var tabObj = arraytabs.filter(x => x.id == curr);
                if (tabObj.length != 0) {
                    tabObj[0].image_2 = dataUrl;
                    arraytabs = arraytabs.filter(x => x.id != tabId);
                    arraytabs.push(tabObj[0]);
                    updateStorage()
                }
                currentTabId
            });
        }
    });

function removeItem(tabid) {
    arraytabs = arraytabs.filter(x => x.id != tabid);
    updateStorage()
}
function updateStorage() {
    console.log(arraytabs);
    chrome.storage.local.set({ tabjson: (arraytabs) }, function () {
        //alert('tab count is set to ' + JSON.stringify(arraytabs.length));

    });
}
function updateBlacklistStorage() {
    ///alert(JSON.stringify(blacklistedUrls));
    chrome.storage.local.set({ domains: (blacklistedUrls) }, function () {
        //alert('tab count is set to ' + JSON.stringify(arraytabs.length));

    });
}
setInterval(function () {
    //  chrome.tabs.captureVisibleTab(null,{},function(dataUrl){
    //      alert(dataUrl);
    //     });
    // chrome.runtime.sendMessage({ message: "capture" }, (response) => {
    //     console.log(response.message);
    // });

}, 10000);
function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

/*

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    // No tabs or host permissions needed!
    console.log('Turning ' + tab.url + ' red!');
    chrome.tabs.executeScript({
      code: 'document.body.style.backgroundColor="red"'
    });
  });
*/
  