// 1.0.2
var VideoController = function(_ytplayer, _id){
    var ytplayer = _ytplayer;
    var videoControl;
    var progressGroup, progress, buffer, slider, hit, scrubbar;
    var playBtn, pauseBtn, muteBtn, unmuteBtn, hdBtn, exithdBtn;
    var btns;
    var onScrub = false;
    var togglePlayInteraction = false;
    
    var toggleAudio, toggleVideo, toggleHd;
    var group;
    
    this.init = function (){
        group = document.getElementById(_id);
        videoControl = group.children[0];
        
        if (videoControl && ytplayer) {
            toggleAudio = (toggleAudio == undefined) ? new ImageSequence(videoControl.querySelectorAll('[data-gwd-grp-id="toggleAudio"]')[0], 20, {}, "toggle") : toggleAudio;
            toggleVideo = (toggleVideo == undefined) ? new ImageSequence(videoControl.querySelectorAll('[data-gwd-grp-id="toggleVideo"]')[0], 16, {}, "toggle") : toggleVideo;
            toggleHd = (toggleHd == undefined) ? new ImageSequence(videoControl.querySelectorAll('[data-gwd-grp-id="toggleHd"]')[0], 34, {}, "toggle") : toggleHd;
            progressGroup = videoControl.querySelectorAll('[data-gwd-grp-id="progressGroup"]')[0];
            slider = videoControl.querySelectorAll('[data-gwd-grp-id="slider"]')[0];
            buffer = videoControl.querySelectorAll('[data-gwd-grp-id="buffer"]')[0];
            progress = videoControl.querySelectorAll('[data-gwd-grp-id="progress"]')[0];
            hit = videoControl.querySelectorAll('[data-gwd-grp-id="hit"]')[0];
            scrubbar = videoControl.querySelectorAll('[data-gwd-grp-id="scrubbar"]')[0];
                                    
            initProgress();
            removeEvent();
            
            ytplayer.addHandlerVc({
                    videoStarted: function(){
                        //console.log("vc videoStarted : ",group);
                        addEvent();
                        slider.dataset.progress = 0;
                        slider.dataset.buffer = 0;
                        progress.style.width = "0px";
                        scrubbar.style.left = "0px";
                        buffer.style.width = "0px";
                        group.style.display = "block";
                    },
                    videoMuted: toggleMuteBtn,
                    videoUnmuted: toggleUnmuteBtn,
                    videoPaused: toggleVideoBtn,
                    videoPlaying: toggleVideoBtn,
                    videoProgress: updateProgress,
                    videoFullscreen: videoFullscreenHandler,
                    videoEnded: function(){
                        group.style.display = "none";
                        resetProgress();
                    }
            });
    
            group.style.display = "none";
            if (videoControl.dataset.y){
                group.style.top = videoControl.dataset.y+"px";
                console.log("y",group.style.top);
            }
            if (videoControl.dataset.x){
                group.style.left = videoControl.dataset.x+"px";
                console.log("x",group.style.left);
            }
            group.style.zIndex = "0";
            group.style.marginLeft = "0";
        }
    }
    
    function initProgress(){
        progressGroup.style.overflow = "hidden";
        
        if (!hasClass(scrubbar, "scrub-trans"))scrubbar.className += " scrub-trans";
        if (!hasClass(progress, "prog-trans"))progress.className += " prog-trans";
        if (!hasClass(buffer, "prog-trans"))buffer.className += " prog-trans";
        
        if (videoControl.dataset.x == undefined)videoControl.dataset.x = group.offsetLeft;
        if (videoControl.dataset.y == undefined)videoControl.dataset.y = group.offsetTop;
        if (videoControl.dataset.oriWidth == undefined) videoControl.dataset.oriWidth = videoControl.dataset.width = videoControl.offsetWidth;
    
        toggleAudio.getContainer().dataset.x = toggleAudio.getContainer().offsetLeft;
        toggleAudio.getContainer().dataset.y = toggleAudio.getContainer().offsetTop;
    
        toggleHd.getContainer().dataset.x = toggleHd.getContainer().offsetLeft;
        toggleHd.getContainer().dataset.y = toggleHd.getContainer().offsetTop;
    
        slider.dataset.oriWidth = slider.dataset.width = slider.offsetWidth;
        
        resetProgress();
    }
    
    function resetProgress(){
        scrubbar.style.left = 0;
        progress.style.width = 0;
        buffer.style.width = 0;
        
        slider.dataset.progress = 0;
        slider.dataset.buffer = 0;
    }
    
    
    function addEvent(){
        toggleVideo.getContainer().addEventListener("click", onToggleVideo);
        toggleAudio.getContainer().addEventListener("click", onToggleAudio);
        toggleHd.getContainer().addEventListener("click", onToggleHd);
        
        hit.addEventListener("click", onSeek);
        
        scrubbar.addEventListener("mousedown", onScrubDown);
    }
    
    function removeEvent(){
        toggleVideo.getContainer().removeEventListener("click", onToggleVideo);
        toggleAudio.getContainer().removeEventListener("click", onToggleAudio);
        toggleHd.getContainer().removeEventListener("click", onToggleHd);
        
        hit.removeEventListener("click", onSeek);
        
        scrubbar.removeEventListener("mousedown", onScrubDown);
    }
    
    function videoFullscreenHandler(isFullscreen){
        //console.log("videoFullscreenHandler ",isFullscreen, screen.height);
        toggleHdBtn(isFullscreen);
        if (isFullscreen == true) {
            group.style.zIndex = "2147483647";
            group.style.top = screen.height-100+"px";
            group.style.left = "50%";
            group.style.marginLeft = -videoControl.offsetWidth/2+"px";
        }else{
            group.style.top = videoControl.dataset.y+"px";
            group.style.left = videoControl.dataset.x+"px";
            group.style.zIndex = "0";
            group.style.marginLeft = "0";
        }
    }
    
    function onRoll(e){
        for( var i=0; i<btns.length; i++){
            if (btns[i].getContainer() === e.target){
                btns[i].play();
                break;
            }
        }
    }
    function onOut(e){
        for( var i=0; i<btns.length; i++){
            if (btns[i].getContainer() === e.target){
                btns[i].rewind();
                break;
            }
        }
    }
    function onScrubDown(e){
        if (ytplayer) {
            //console.log("scrub down");
            onScrub = true;
            ytplayer.pause();
            
            removeClass(scrubbar,"scrub-trans");
            removeClass(progress,"prog-trans");
            
            document.addEventListener("mousemove", onScrubMove);
            document.addEventListener("mouseup", onScrubUp);
        }
    }
    function onScrubUp(e){
        if (ytplayer) {
            onScrub = false;
            
            var ct = e.clientX-progressGroup.offsetLeft-videoControl.offsetLeft;
            if (ct > -1 && ct < slider.offsetWidth) {
                scrubbar.style.left = (ct-(scrubbar.offsetWidth/2))+"px";
                progress.style.width = (ct-(scrubbar.offsetWidth/2))+"px";
                
                var seekto= (ct / slider.offsetWidth) * ytplayer.getTotalTime();
                slider.dataset.progress =  seekto / ytplayer.getTotalTime();
                
                //console.log("scrub up",ct, seekto);
                ytplayer.seekTo(seekto, false);
            }
            
            if (hasClass(scrubbar, "scrub-trans") == null) scrubbar.className += " scrub-trans";
            if (hasClass(progress, "prog-trans") == null) progress.className += " prog-trans";
            
            if (togglePlayInteraction == false) setTimeout( ytplayer.play, 500 );
            
            document.removeEventListener("mousemove", onScrubMove);
            document.removeEventListener("mouseup", onScrubUp);
        }
    }
    function onScrubMove(e){
        if (onScrub == true) {
            var ct = e.clientX-progressGroup.offsetLeft-videoControl.offsetLeft;
            
            if (ct > -1 && ct < slider.offsetWidth) {
                scrubbar.style.left = (ct-(scrubbar.offsetWidth/2))+"px";
                progress.style.width = (ct-(scrubbar.offsetWidth/2))+"px";
                
                var seekto = (ct / slider.offsetWidth) * ytplayer.getTotalTime();
                //slider.dataset.progress =  seekto / ytplayer.getTotalTime();
                
                //console.log("scrub move",ct, seekto, slider.dataset.progress);
                
                ytplayer.seekTo(seekto, false);
            }else{
                onScrubUp(e);   
            }
        }
    }
    
    function onSeek(e){
        if (ytplayer){
            var ct = (e.offsetX / slider.dataset.width) * ytplayer.getTotalTime();
            slider.dataset.progress =  ct;
            ytplayer.seekTo(ct, true);
        }
    }
    function updateProgress(){
        if (ytplayer) {
            if (onScrub == false) {
                slider.dataset.progress = ytplayer.getCurrentTime() / ytplayer.getTotalTime();
                progress.style.width = (slider.dataset.progress * (slider.dataset.width)) - (scrubbar.offsetWidth/2)+ "px";
                scrubbar.style.left = (slider.dataset.progress * (slider.dataset.width)) - (scrubbar.offsetWidth/2)+ "px";
            }
            slider.dataset.buffer = ytplayer.getBufferPercent();
            buffer.style.width = (slider.dataset.buffer * slider.dataset.width) + "px";
            //console.log("progress", ytplayer.getBufferPercent());
        }
    }
    function onToggleVideo(e){
        if (ytplayer.isPlaying()) {
            ytplayer.pause();
            togglePlayInteraction = true;
        }else{
            ytplayer.play();
            togglePlayInteraction = false;
        }
        //toggleVideoBtn()
    }
    function onToggleAudio(e){
        if (ytplayer.isMuted()) {
            ytplayer.unmute();
        }else{
            ytplayer.mute();
        }
        //toggleAudioBtn();
    }
    this.getToggleHd = function(){return toggleHd.getContainer()}
    function onToggleHd(e){
        //console.log("onToggleHd",ytplayer.isFullscreen());
        //if (ytplayer.isFullscreen() == true) {
            //ytplayer.exitFullscreen();
        //} else {
            //ytplayer.launchFullscreen();
        //}
    }
    function toggleMuteBtn(){
        toggleAudio.positionBottom();
    }
    function toggleUnmuteBtn(){
        toggleAudio.positionTop();
    }
    function toggleAudioBtn(){
        if (ytplayer) {
            if (ytplayer.isMuted() == true) {
                toggleMuteBtn()
            }else{
                toggleUnmuteBtn();
            }
        }
    }
    function toggleVideoBtn(){
        if (ytplayer) {
            if (ytplayer.isPlaying() == true) {
                toggleVideo.positionBottom();
            } else {
                toggleVideo.positionTop();
            }
        }
    }
    function toggleHdBtn(isFullscreen){
        if (isFullscreen == true) {
            toggleHd.positionBottom();
        } else {
            toggleHd.positionTop();
        }
    }
    //init();
    return this;
}