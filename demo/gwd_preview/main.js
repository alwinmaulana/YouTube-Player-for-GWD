var yt = new YTPlayer();
var videoControl = new VideoController(yt, "vc_normal");
var handler = {};
var handlerFullscreen = {};
var id = "fO4Vx_1BNCk";

handler.videoStarted = function() {
  console.log("Video Started");
}
handler.videoEnded = function() {
  console.log("Video Ended");
  gwd.actions.gwdPagedeck.goToPage('pagedeck', 'expanded-page_1', 'none', 1000, 'linear', 'top');
}

handlerFullscreen.videoStarted = function() {
  console.log("Video Fullscreen Started");
}
handlerFullscreen.videoEnded = function() {
  console.log("Video Fullscreen Ended");
}
function gotoVideo(){
  gwd.actions.gwdPagedeck.goToPage('pagedeck', 'expanded-page', 'none', 1000, 'linear', 'top');
}
function loadPlayer(){
  
  removeClass(document.getElementById("expanded-page"),"yt-fullscreen");
  removeClass(document.getElementById("expanded-page").children[0],"yt-fullscreen");
  
  yt.loadPlayer("video_player", id, 0, false, handler, false);
  videoControl.init();
  
  videoControl.getToggleHd().removeEventListener("click", videoToggleFullscreen);
  videoControl.getToggleHd().addEventListener("click", videoToggleFullscreen);
  
  //setTimeout(yt.loadVideoById, 15000, "nMlwer-lbow");
}
function expandRemoved() {
  yt.unloadPlayer();
}
function videoToggleFullscreen(e){
  if (yt.isFullscreen()) {
    gwd.actions.gwdPagedeck.goToPage('pagedeck', 'expanded-page_1', 'none', 1000, 'linear', 'top');
  }else{
    yt.launchFullscreen();
  }
}