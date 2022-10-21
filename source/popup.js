var arrayfilters;
var getJson = function () {
  var json = null;
  $.ajax({
    async: false,
    global: false,
    url: "./items.json",
    dataType: "json",
    success: function (data) {
      json = data;
      json = json.map(function (item) {
        item = { ...item };
        item.id = parseInt(item.id);
        return item;
      });
    }
  });
  return json;
};

function dynamicSort(property) {
  var sortOrder = 1;
  if (property[0] === "-") {
    sortOrder = -1;
    property = property.substr(1);
  }
  return function (a, b) {
    /* next line works with strings and numbers,
     * and you may want to customize it to your needs
     */
    var result =
      a[property] > b[property] ? -1 : a[property] < b[property] ? 1 : 0;
    return result * sortOrder;
  };
}

function renderItems(items, view = "grid") {
  $(".result_body").attr("class", "result_body");
  var final_output = "";
  if (items.length > 0) {
    items.forEach((item, i) => {
      final_output += `<div class="item" data-id="` + item.id + `">`;
      if (view == "list") {
        final_output +=
          `
          <div class="item_img_2">
            <img src='loading.gif' class='loading'>
            <img src="` +
          item.image_1 +
          `" alt="" loading="lazy"/>
          </div>
          <div class="item_img_1">
          <div class="item_img_btns">
              <button id='item_delete' data-id="` +
          item.id +
          `" class='item_img_btn'><img src='delete-tab.png'></button>
        <button id='item_lock' data-id="` +
          item.id +
          `" class='item_img_btn'><img src='eye-blue.png'></button>
            </div>
            <img src='placeholder-image.png' class='loading'>
            <img class='main_img' id='main_img' src="` +
          item.image_2 +
          `" alt="" loading="lazy"/>
          </div>
          <div class="item_desc">
            <h2 class="item_group">
              ` +
          item.group +
          `
            </h2>
            <p class="item_title">
              ` +
          item.title +
          `
            </p>
          </div>
        `;
      } else {
        final_output +=
          `
          <div class="item_img_1">
          <div class="item_img_btns">
              <button id='item_delete' data-id="` +
          item.id +
          `" class='item_img_btn'><img src='delete-tab.png'></button>
        <button id='item_lock' data-id="` +
          item.id +
          `" class='item_img_btn'><img src='eye-blue.png'></button>
            </div>
            <img src='placeholder-image.png' class='loading' >
            <img class='main_img' id='main_img' src="` +
          item.image_2 +
          `" alt="" loading="lazy"/>
          </div>
          <div class="item_desc">
            <div class="item_img_2">
              <img src='loading.gif' class='loading'>
              <img src="` +
          item.image_1 +
          `" alt="" loading="lazy"/>
            </div>
            <div class="item_desc_container">
              <p class="item_title">
                ` +
          item.title +
          `
              </p>
              <h2 class="item_group">
                ` +
          item.group +
          `
              </h2>
            </div>
          </div>
          `;
      }
      final_output += "</div>";
    });
  } else {
    final_output += "<p style='text-align:center;'>Sorry, No data found !</p>";
  }

  $(".result_body").html(final_output);
  $(".result_body").addClass(view + "_view");
  $(".cs_list_items .filters .display_type button").removeClass("active");
  $(".cs_list_items .filters .display_type button#" + view + "_view").addClass(
    "active"
  );

  $(".cs_list_items .result_body img.loading").each(function () {
    $(this)
      .siblings()
      .on("load", () => {
        $(this).fadeOut();
      });
  });
}

function renderInitial(items, view = "grid") {
  var final_output =
    `<div class="boxed">
    <div class="filters">
      <div class="search-bar">
        <i class="ion ion-ios-search-strong"></i>
        <input type="text" name="search" placeholder="Filter" value="" />
      </div>
      <div class="sort_by">
        <label for="sort_by">Sort</label>
        <select class="" name="sort_by">
          <option value="3">Chrome</option>
          <option value="1">Sites</option>
          <option value="2">Recent</option>
          
        </select>
      </div>
      <div class="display_type">
        <button type="button" name="button" id="grid_view">
          <i class="ion-ios-grid-view-outline"></i>
        </button>
        <button type="button" name="button" id="list_view">
          <i class="ion-ios-list-outline"></i>
        </button>
      </div>
    </div>
    <div class="settings_icon"><i class="ion ion-android-settings"></i></div>
    <div class="result_body ` +
    view +
    `_view">
  `;

  final_output += `</div></div>`;
  $(".cs_list_items").html(final_output);
  renderItems(items, view);
}

$(document).ready(function () {
  chrome.windows.getCurrent(function (w) {
    arrayfilters = [];
    chrome.storage.local.get(['tabjson', 'filtersjson'], function (result) {
      var json = result.tabjson.filter(x => x.winId ==w.id);
      arrayfilters = result.filtersjson;
      if (arrayfilters === undefined) {
        arrayfilters = { view: "grid", sort: "3", filter: "" }
      }
      // alert(arrayfilters)
      console.log(json);
      var current_arr = json;
      var current_view = arrayfilters.view;
      renderInitial(json);
      current_arr = json.filter(function (item) {
        return item.group.includes(arrayfilters.filter) || item.title.includes(arrayfilters.filter);

      });
      if (arrayfilters.sort == "0") {
        current_arr = current_arr.sort(dynamicSort("id"));
      } else if (arrayfilters.sort == "1") {
        current_arr = current_arr.sort(dynamicSort("group"));
      } else if (arrayfilters.sort == "2") {
        current_arr = current_arr.sort(dynamicSort("last_seen"));
      } else if (arrayfilters.sort == "3") {
        current_arr = current_arr.sort(dynamicSort("index"));
      }
      renderItems(current_arr, current_view);

      $(".cs_list_items .filters .display_type button#grid_view").bind(
        "click",
        function () {
          renderItems(current_arr, "grid");
          current_view = "grid";
          arrayfilters.view = "grid";
          updateStorage()
        }
      );
      $(".cs_list_items .filters .display_type button#list_view").bind(
        "click",
        function () {
          renderItems(current_arr, "list");
          current_view = "list";
          arrayfilters.view = "list";
          arrayfilters.view = "list";
          updateStorage()
        }
      );
      $(".cs_list_items .filters .sort_by select").val(arrayfilters.sort)
      $(".cs_list_items .filters .sort_by select").on("change", function () {
        var val = $(this).val();
        if (val == "0") {
          current_arr = current_arr.sort(dynamicSort("id"));
          renderItems(current_arr, current_view);
          arrayfilters.sort = "0";
        } else if (val == "1") {
          current_arr = current_arr.sort(dynamicSort("group"));
          renderItems(current_arr, current_view);
          arrayfilters.sort = "1";
        } else if (val == "2") {
          current_arr = current_arr.sort(dynamicSort("last_seen"));
          renderItems(current_arr, current_view);
          arrayfilters.sort = "2";
        } else if (val == "3") {
          current_arr = current_arr.sort(dynamicSort("index"));
          renderItems(current_arr, current_view);
          arrayfilters.sort = "3";
        }
        updateStorage();
      });
      $(".cs_list_items .filters .search-bar input").val(arrayfilters.filter);
      $(".cs_list_items .filters .search-bar input").on("keyup", function () {
        var val = $(this).val();
        current_arr = json.filter(function (item) {
          return item.group.includes(val) || item.title.includes(val);

        });
        renderItems(current_arr, current_view);
        arrayfilters.filter = val;
        updateStorage()
      });

      $(document).on("click", ".cs_list_items .item", function () {
        var id = $(this).attr("data-id");
        chrome.tabs.query({ currentWindow: true }, function (tabsArray) {
          // If only 1 tab is present, do nothing.
          if (tabsArray.length === 1) return;
          else {
            chrome.tabs.get(parseInt(id), function (tab) {
              chrome.tabs.highlight({ 'tabs': tab.index }, function () { });
            });
          }
          // Otherwise switch to the next available tab.
          // Find index of the currently active tab.
          let activeTabIndex = null;
          tabsArray.forEach(function (tab, index) {
            if (tab.active === true)
              activeTabIndex = index;
          });

          // Switch to the next tab.
          chrome.tabs.update(tabsArray[(activeTabIndex + 1) % tabsArray.length].id, {
            active: true
          });
        });
      });


      $(document).on("click", ".cs_list_items .settings_icon", function () {
        if (chrome.runtime.openOptionsPage) {
          chrome.runtime.openOptionsPage();
        } else {
          window.open(chrome.runtime.getURL('options2.html#settings'));
        }
      });
      $(document).on(
        "click",
        ".cs_list_items .item .item_img_btns #item_delete",
        function (e) {
          e.stopPropagation();
          var id = $(this).attr("data-id");
          current_arr = current_arr.filter(function (item) {
            return item.id != parseInt(id);
          });
          json = json.filter(function (item) {
            return item.id != parseInt(id);
          });
          renderItems(current_arr, current_view);
          chrome.runtime.sendMessage({ message: "removed", tabid: id }, (response) => {
            console.log("removed");
            
          });
        }
      );
      $(document).on(
        "click",
        ".cs_list_items .item .item_img_btns #item_lock",
        function (e) {
          e.stopPropagation();
          var id = $(this).attr("data-id");
          var item = current_arr.filter(function (item) {
            return item.id == parseInt(id);
          });
          if (item.length > 0) {

            

            /*
            var src = ($('#main_img').attr('src') === 'eye-blue.png')
                    ? 'delete-tab.png'
                    : 'eye-blue.png';
                    $('#main_img').attr('src', src);
                    */


           
            

            chrome.runtime.sendMessage({ message: "toggleBlacklisted", domain: extractHostname(item[0].group) }, (response) => {
              console.log("blacklisted");
              alert("Added to Thumbnail exclude list");

              ///alert("blacklisted");
            try {
        
                //$(this).remove();
                //$(this).parent('div').hide();

                //alert("010");
                try {
                  
                    //$(this).remove();
                    //$(this).parent('li').hide();

                    //$(this).parent('main_img').hide();
                    //$('#main_img').attr('src','eye-blue.png');
                    
                    /*
                    var src = ($('#main_img').attr('src') === 'eye-blue.png')
                    ? 'delete-tab.png'
                    : 'eye-blue.png';
                    $('#main_img').attr('src', src);
                    */


                    /*

                    alert("020");
                    var src = ($(this).siblings('.main_img').attr('src') === 'eye-blue.png')
                            ? 'delete-tab.png'
                            : 'eye-blue.png';
                    
                  

                    //$(this).parent('#main_img').attr('src', src);
                    //$( "p" ).siblings( ".selected" );
                    $(this).siblings('.main_img').attr('src', src);
                    */

                   //$("#button").prev("a.ui-btn").unbind().click( function() {alert('button clicked');} )
                   
                   //alert("021");
                   
                   


                    //$(".first:has(input[name='inp'])").hide()

                    /*
                    var src = ($('.closest.main_img').attr('src') === 'eye-blue.png')
                    ? 'delete-tab.png'
                    : 'eye-blue.png';
                    $('.closest.main_img').attr('src', src);
                    */

                   // $("#main_img").attr('src', 'eye-blue.png');
                   //$(this).siblings('#main_img').attr('src', 'eye-blue.png');
                   //$(this).parent('.main_img').attr('src', 'eye-blue.png');


                } catch (error) {
                  console.error(error);
                  
                }

            } catch (error) {
              console.error(error);
              
            }

            });
            //alert("Group : " + item[0].group);
          }
        }
      );
    });
  });

});
function updateStorage() {
  console.log(arrayfilters);
  chrome.storage.local.set({ filtersjson: (arrayfilters) }, function () {
    //alert('tab count is set to ' + JSON.stringify(arraytabs.length));

  });
}
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
