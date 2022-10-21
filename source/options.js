// function save_options() {
//   var color = document.getElementById('color').value;
//   var likesColor = document.getElementById('like').checked;
//   chrome.storage.sync.set({
//     favoriteColor: color,
//     likesColor: likesColor
//   }, function() {
//     // Update status to let user know options were saved.
//     var status = document.getElementById('status');
//     status.textContent = 'Options saved.';
//     setTimeout(function() {
//       status.textContent = '';
//     }, 750);
//   });
// }

// // Restores select box and checkbox state using the preferences
// // stored in chrome.storage.
// function restore_options() {
//   // Use default value color = 'red' and likesColor = true.
//   chrome.storage.sync.get({
//     favoriteColor: 'red',
//     likesColor: true
//   }, function(items) {
//     document.getElementById('color').value = items.favoriteColor;
//     document.getElementById('like').checked = items.likesColor;
//   });
// }
// document.addEventListener('DOMContentLoaded', restore_options);
// document.getElementById('save').addEventListener('click',
//     save_options);
$(document).ready(function () {
  chrome.storage.local.get(['domains'], function (result) {
    result.domains.forEach(element => {
      $(".balcklist-list").append("<li class='w3-display-container'>" + element.domain + " <button class='w3-button w3-transparent w3-display-right remove-blacklist' data-url='" +element.domain +"'>&times;</button></li>");
    });
    $(".remove-blacklist").click(function (e) { 
      var url = $(this).attr("data-url");
    
      e.preventDefault();
      removeBlacklistItem(url)

      $(this).parent('li').hide();
      
    });

  });


});

function removeBlacklistItem(url) {
  chrome.runtime.sendMessage({ message: "toggleBlacklisted", domain: url }, (response) => {
    console.log("blacklisted");
  });
}