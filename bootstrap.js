/* jshint esnext:true, globalstrict:true */
/* global Components, APP_SHUTDOWN, window, alert */

"use strict";

const Cc = Components.classes;
const Ci = Components.interfaces;
 
var interceptListener;

function loadIntoWindow(window) {
    window.console.log("LOAD INTO WIN 15:54:07");
    if (!window) {
        window.console.log("LOAD FAIL");
        return;
    }
    var browserApp = window.BrowserApp;
    browserApp.selectedTab.browser.addEventListener("load", interceptLoad, true);
    
    function interceptLoad(evt) {
        var contentWin = browserApp.selectedTab.browser.contentWindow;
        window.console.log("INTERCEPT onload, win:"+ contentWin.location.href);
        addEvtListener(contentWin);
    } 
    interceptListener = interceptLoad;
    
}
 
function unloadFromWindow(window) {
  if (!window)
    return;
  // Remove any persistent UI elements
  // Perform any other cleanup
  window.BrowserApp.selectedTab.browser.removeEventListener("load", interceptListener, true);  
}
 
var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function x() {
      domWindow.removeEventListener("load", x, false);
      loadIntoWindow(domWindow);
    }, false);
  },
  
  onCloseWindow: function(aWindow) {},
  onWindowTitleChange: function(aWindow, aTitle) {}
};
 
function startup(aData, aReason) {
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
 
  // Load into any existing windows
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }
 
  // Load into any new windows
  wm.addListener(windowListener);
}
 
function shutdown(aData, aReason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (aReason == APP_SHUTDOWN)
    return;
 
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
 
  // Stop listening for new windows
  wm.removeListener(windowListener);
 
  // Unload from any existing windows
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    unloadFromWindow(domWindow);
  }
}
 
function install(aData, aReason) {}
function uninstall(aData, aReason) {}
    
function addEvtListener(window) {
    var myExtension = {
      myListener: function(evt) {
        window.console.log("Received from web page: " +
              evt.target.getAttribute("param1") + "," +
              evt.target.getAttribute("param2"));
      }
    };
    window.document.addEventListener("MyExtensionEvent", 
        function(e) { myExtension.myListener(e); }, false, true);
    window.console.log("Added My EVT "+window.location.href);
    // The last value is a Mozilla-specific value to indicate untrusted content is allowed to trigger the event.
}