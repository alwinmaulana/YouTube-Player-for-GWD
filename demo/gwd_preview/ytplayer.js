function hasClass(ele, cls) {
      return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }
function removeClass(ele, cls) {
  if (hasClass(ele, cls)) {
    var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
    ele.className = ele.className.replace(reg, '');
  }
}
function launchFullscreenElement(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

function exitFullscreenElement(element) {
  if (element.exitFullScreen) {
    element.exitFullScreen();
  } else if (element.mozCancelFullScreen) {
    element.mozCancelFullScreen();
  } else if (element.webkitExitFullScreen) {
    element.webkitExitFullScreen();
  } else if (element.msExitFullScreen) {
    element.msExitFullScreen();
  }
}
// + fix bug on safari, when video return from fullscreen using esc
// + add function isLive set and get , set unit play in live enviroment or local to fix fullscreen issue on safari
var YTPlayer = function(){
	var player;
	var container;
	var hasPlayer = false;
	var proportion = 0;
	var videoID;
	var script,wrapper, divPlayer;
	var started = false, isPlaying = false, isMuted = false, autoPlayMuted = false;
	var handler, handlerVc;
	
	var isFullscreen = false;
	var defaultVideoControl = false;
        var isLive = false;
        var is25, is50, is75;
	
	var intv;
	this.isReady = false;
        
	function onPlayerReady(e){
		started = false;
		isMuted = false;
		isPlaying = false;
                
		console.log("Player Ready");
		player.setPlaybackQuality("hd720");
	}
	
	function onPlayerStateChange(e){
		console.log("Player State Change",e.data);
		switch (e.data) {
			case YT.PlayerState.UNSTARTED:
				console.log("unstarted");
			break;
	        	case YT.PlayerState.PLAYING:
				this.isReady = true;
				if (started == false) {
					started = true;
					console.log("started");
					
					if (autoPlayMuted == true) {
						this.mute();
					}else{
						this.unmute();
					}
					
					is25 = is50 = is75 = false;
                                        
					if (handler) if ( handler.videoStarted instanceof Function ) handler.videoStarted();
					if (handlerVc && defaultVideoControl == false) if ( handlerVc.videoStarted instanceof Function ) handlerVc.videoStarted();
					
					clearInterval(intv);
					intv = setInterval( timeUpdate.bind(this), 1000/30 );
				}
				isPlaying = true;
				
				if (handler) if ( handler.videoPlaying instanceof Function ) handler.videoPlaying();
				if (handlerVc && defaultVideoControl == false) if ( handlerVc.videoPlaying instanceof Function ) handlerVc.videoPlaying();
	        	break;
	        	case YT.PlayerState.PAUSED:
				console.log("paused");
				isPlaying = false;
				
				if (handler) if ( handler.videoPaused instanceof Function ) handler.videoPaused();
				if (handlerVc && defaultVideoControl == false) if ( handlerVc.videoPaused instanceof Function ) handlerVc.videoPaused();
	        	break;
			case YT.PlayerState.ENDED:
				console.log("ended");
				
				clearInterval(intv);
				
				started = false;
				isPlaying = false;
                                isFullscreen = false;
				
				this.exitFullscreen();
				
				if (handler) if ( handler.videoPaused instanceof Function ) handler.videoPaused();
				if (handlerVc && defaultVideoControl == false) if ( handlerVc.videoPaused instanceof Function ) handlerVc.videoPaused();
				
				if (handler) if ( handler.videoEnded instanceof Function ) handler.videoEnded();
				if (handlerVc && defaultVideoControl == false) if ( handlerVc.videoEnded instanceof Function ) handlerVc.videoEnded();
				
	        	break;
	        	case YT.PlayerState.BUFFERING:
				console.log("buffering");
	        	break;
	        	case YT.PlayerState.CUED:
				console.log("cued");
	        	break;	        
		}
	}
	
	function timeUpdate(){
		if (handler) if ( handler.videoProgress instanceof Function ) handler.videoProgress();
		if (handlerVc && defaultVideoControl == false) if ( handlerVc.videoProgress instanceof Function ) handlerVc.videoProgress();
                
                var perr = (this.getCurrentTime() / this.getTotalTime())*100;
                if(perr >= 25 && !is25){
			is25 = true;
			if (handler) if ( handler.video25 instanceof Function ) handler.video25();
		}
		if(perr >= 50 && !is50){
			is50 = true;
			if (handler) if ( handler.video50 instanceof Function ) handler.video50();
		}
		if(perr >= 75 && !is75){
			is75 = true;
			if (handler) if ( handler.video75 instanceof Function ) handler.video75();
		}
	}
	
	function onError(e){
		switch(e.data){
			case 2:
				console.log("\n ### Error : video ID does not have 11 characters or contains invalid characters, such as exclamation points or asterisks ###\n");
			break;
			case 5:
				console.log("\n ### Error : The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred ###\n");
			break;
			case 100:
				console.log("\n ### Error : The video requested was not found ###\n");
			break;
			case 150:
			case 101:
				console.log("\n ### Error : The owner of the requested video does not allow it to be played in embedded players ###\n");
			break;
		}
	}
	
	function addFullscreenListener() {
		document.addEventListener("fullscreenchange", fullscreenHandler.bind(this));
		document.addEventListener("webkitfullscreenchange", fullscreenHandler.bind(this));
		document.addEventListener("mozfullscreenchange", fullscreenHandler.bind(this));
		document.addEventListener("MSFullscreenChange", fullscreenHandler.bind(this));
	}
	    
	function removeFullscreenListener() {
		document.removeEventListener("fullscreenchange", fullscreenHandler);
		document.removeEventListener("webkitfullscreenchange", fullscreenHandler);
		document.removeEventListener("mozfullscreenchange", fullscreenHandler);
		document.removeEventListener("MSFullscreenChange", fullscreenHandler);
	}
	    
	function fullscreenHandler(e){
	    if (handler) if ( handler.videoFullscreen instanceof Function ) handler.videoFullscreen(isFullscreen);
	    if (handlerVc && defaultVideoControl == false) if ( handlerVc.videoFullscreen instanceof Function ) handlerVc.videoFullscreen(isFullscreen);
            console.log("is live :",isLive);
	    if (isFullscreen == false) {
                console.log("is fullscreen :",e.target);
                if ((e.target != document && !isLive) || navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ) {
                        isFullscreen = true;
                        if (!hasClass(container, "yt-container-fullscreen"))container.className += " yt-container-fullscreen";
                        if (!hasClass(container.parentNode, "yt-fullscreen"))container.parentNode.className += " yt-fullscreen";
                        if (!hasClass(container.parentNode.parentNode, "yt-fullscreen"))container.parentNode.parentNode.className += " yt-fullscreen";
                        
                        if (defaultVideoControl == false) {
                                wrapper.style.width = window.screen.availWidth+"px";
                                wrapper.style.height = (window.screen.availHeight+400)+"px";
                                wrapper.style.top = "-200px";
                                wrapper.style.left = "0px";
                        
                                player.getIframe().width = window.screen.availWidth;
                                player.getIframe().height = (window.screen.availHeight+400);
                                player.setSize(window.screen.availWidth, window.screen.availHeight+400);
                        }
                }
		
	    }else if (isFullscreen == true){
                isFullscreen = false;
                console.log("is normal :",e.target);
		removeClass(container,"yt-container-fullscreen");
		removeClass(container.parentNode,"yt-fullscreen");
		removeClass(container.parentNode.parentNode,"yt-fullscreen");
		
		if (defaultVideoControl == false) {
			wrapper.style.width = wrapper.dataset.oriWidth+"px";
			wrapper.style.height = wrapper.dataset.oriHeight+"px";
			wrapper.style.top = wrapper.dataset.oriY+"px";
			wrapper.style.left = wrapper.dataset.oriX+"px";
			
			player.getIframe().width = wrapper.dataset.oriWidth;
			player.getIframe().height = wrapper.dataset.oriHeight;
			player.setSize(wrapper.dataset.oriWidth, wrapper.dataset.oriHeight);
		}
	    }
	}
	
	function createPlayer(_id){

		container.dataset.oriWidth = container.offsetWidth;
		container.dataset.oriHeight = container.offsetHeight;
		container.dataset.oriX = container.offsetLeft;
		container.dataset.oriY = container.offsetTop;
		
		var blocker = document.createElement('div');
		blocker.setAttribute("class","yt-blocker");
		container.appendChild(blocker);
		
		wrapper = document.createElement('div');
		wrapper.setAttribute("id","playerWrapper");
		wrapper.style.position = "absolute";
		
		wrapper.dataset.oriWidth = (defaultVideoControl == false) ? container.offsetWidth + proportion : container.offsetWidth;
		wrapper.dataset.oriHeight = (defaultVideoControl == false) ? container.offsetHeight * 2 : container.offsetHeight;
		wrapper.dataset.oriY = (defaultVideoControl == false) ? -container.offsetHeight/2 : 0;
		wrapper.dataset.oriX = (defaultVideoControl == false) ? -proportion/2 : 0;
		
		wrapper.style.width = wrapper.dataset.oriWidth+"px";
		wrapper.style.height = wrapper.dataset.oriHeight+ "px";
		wrapper.style.top = wrapper.dataset.oriY+"px";
		wrapper.style.left = wrapper.dataset.oriX+"px";
		
		container.appendChild(wrapper);
		
		divPlayer = document.createElement('div');
		divPlayer.setAttribute("id","player");
		divPlayer.style.position = "absolute";
		
		divPlayer.style.width = (defaultVideoControl == false) ? container.offsetWidth + proportion : container.offsetWidth+"px";
		divPlayer.style.height = (defaultVideoControl == false) ? container.offsetHeight * 2 : container.offsetHeight+ "px";
		
		wrapper.appendChild(divPlayer);
		
		script = document.createElement('script');
		script.setAttribute("id","ytscript");
		script.src = "https://www.youtube.com/iframe_api";
		
		wrapper.appendChild(script);
	}
	this.isLive = function(_isLive){
            if (isLive != null || isLive != undefined){
                  isLive = _isLive;
            }
            return isLive;
        }
	this.getContainer = function(){return container}
	this.loadPlayer = function (_cont, _id, _proportion, _muted, _handler, _defaultVideoControl, _start, _end ){
		console.log("load player");
		container = document.getElementById(_cont);
		proportion = _proportion || 0;
		autoPlayMuted = _muted || false;
		handler = _handler;
		isReady = false;
		isFullscreen = false;
		defaultVideoControl = (_defaultVideoControl == null || _defaultVideoControl == undefined) ? true : _defaultVideoControl;
		
		removeClass(container,"yt-container-fullscreen");
		removeClass(container.parentNode,"yt-fullscreen");
		removeClass(container.parentNode.parentNode,"yt-fullscreen");
		
		if (hasPlayer == false && _id) {
			if (container) {
				container.style.overflow = "hidden";
				removeFullscreenListener();
				addFullscreenListener();
				hasPlayer = true;
				window.onYouTubeIframeAPIReady = (function(){
					console.log("apiloaded");
					var playerVars = {
								html5: 1,
								autoplay: 1,
								controls: (defaultVideoControl) ? 2 : 0,
								autohide: 2,
								modestbranding: 0,
								showinfo: 0,
								enablejsapi: 1,
								iv_load_policy: 3,
								cc_load_policy: 0,
								fs: 1,
								rel: 0
							}
					if (_start) {
                                          playerVars.start = _start;
                                        }
                                        if (_end){
                                          playerVars.end = _end;
                                        }
					player = new YT.Player("player", {
						videoId: _id,
						width: (defaultVideoControl == false) ? container.offsetWidth + proportion : container.offsetWidth,
						height: (defaultVideoControl == false) ? container.offsetHeight * 2 : container.offsetHeight,
						playerVars: playerVars,
						events: {
							'onReady': onPlayerReady.bind(this),
							'onStateChange': onPlayerStateChange.bind(this),
							'onError': onError.bind(this)
						}
					});
					
					if (window.location.protocol == 'file:'){
						var src = player.getIframe().src;
						var spl = src.split("&origin=");
						var spl2;
						var newsrc = spl[0];
						
						if (spl.length > 1) {
							spl2 = (spl[1].search("&") != -1 ) ? spl[1].substr(spl[1].search("&"), spl[1].length) : "";
							newsrc+=spl2;
							console.log("newsrc : ",spl2,"\n",newsrc," <<<")
						}
						
						player.getIframe().src = newsrc;
					}
					
				}).bind(this);
				
				createPlayer(_id);
			}   
		}else{
			console.log("load again destroy");
			window.onYouTubeIframeAPIReady();
		}
	}
	this.loadVideoById = function(_id, _start, _end){
            if (_id) {
                  var obj = {};
                  obj.videoId = _id;
                  obj.suggestedQuality = "hd720";
                  if (_start) obj.startSeconds = _start;
                  if (_end) obj.endSeconds = _start;
                  player.loadVideoById(obj);     
            }else{
                  console.log("missing id");
            }
      }
	this.unloadPlayer = function(){
		clearInterval(intv);
		if (player) {
			player.destroy();
		}
	}
	
	this.isMuted = function(){
		if (player) {
			isMuted = player.isMuted();
			return isMuted;
		}
		return isMuted;
	}
	this.isFullscreen = function(){return isFullscreen}
	
	this.isPlaying = function(){return isPlaying}
	this.getPlayerState = function(){
		if (player) {
			return player.getPlayerState();
		}
		return -1;
	}
	this.getCurrentTime = function(){
		if (player) {
			return player.getCurrentTime();
		}
		return 0;
	}
	this.getTotalTime = function(){
		if (player) {
			return player.getDuration();
		}
		return 0;
	}
	this.getBufferPercent = function(){
		if (player) {
			return player.getVideoLoadedFraction();
		}
		return 0;
	}
	this.addHandler = function(_handler){
		handler = _handler;
	}
	this.addHandlerVc = function(_handler){
		handlerVc = _handler;
	}
	this.replay = function(){
		this.seekTo(0,true);
		this.play();
	}
	this.play = function(){
		if (player) {
			player.playVideo();
		}
	}
	this.pause = function(){
		if (player) {
			player.pauseVideo();
		}
	}
	this.stop = function(){
		if (player) {
			player.stopVideo();
		}
	}
	this.mute = function(){
		if (player) {
			player.mute();
			if (handler) if ( handler.videoMuted instanceof Function ) handler.videoMuted();
			if (handlerVc && defaultVideoControl == false) if ( handlerVc.videoMuted instanceof Function ) handlerVc.videoMuted();
		}
	}
	this.unmute = function(){
		if (player) {
			player.unMute();
			if (handler) if ( handler.videoUnmuted instanceof Function ) handler.videoUnmuted();
			if (handlerVc && defaultVideoControl == false) if ( handlerVc.videoUnmuted instanceof Function ) handlerVc.videoUnmuted();
		}
	}
	this.seekTo = function(_sec,_seekAhead){
		var sec = _sec || 0,
			seekAhead = _seekAhead || true;
		if (player) {
			player.seekTo(sec, seekAhead);
		}
	}
	this.launchFullscreen = function(){
		launchFullscreenElement(document);
		launchFullscreenElement(container);
	}
	this.exitFullscreen = function(){
		exitFullscreenElement(document);
		exitFullscreenElement(container);
	}
}