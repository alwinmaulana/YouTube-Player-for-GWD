var gwd=gwd||{};gwd.actions=gwd.actions||{};gwd.actions.events=gwd.actions.events||{};gwd.actions.events.getElementById=function(id){var gwdId=new gwd.GwdId(id);var retElement;var target=gwd.actions.events.currentTarget;if(!gwdId.getLeadingId()&&target){retElement=gwdId.getElementInInstance(document,gwd.actions.events.currentTarget)}else{retElement=gwdId.getElement(document)}if(!retElement){switch(id){case"document.body":retElement=document.body;break;case"document":retElement=document;break;case"window":retElement=window;break}}return retElement};gwd.actions.events.addHandler=function(eventTarget,eventName,eventHandler,useCapture){var gwdId=new gwd.GwdId(eventTarget);var groupName=gwdId.getGroupName();if(groupName!==""){var instances=document.querySelectorAll("["+gwd.GwdId.GROUP_REFERENCE_ATTR+" = "+groupName+"]");Array.prototype.forEach.call(instances,function(instance){var target=gwdId.getElementInInstance(document,instance);if(target){var actualHandlerProp=gwd.actions.events.actualHandlerProp;if(!eventHandler[actualHandlerProp]){eventHandler[actualHandlerProp]=gwd.actions.events.wrapHandler_.bind(null,eventHandler)}target.addEventListener(eventName,eventHandler[actualHandlerProp],useCapture)}})}else{var targetElement=gwd.actions.events.getElementById(eventTarget);if(targetElement){targetElement.addEventListener(eventName,eventHandler,useCapture)}}};gwd.actions.events.removeHandler=function(eventTarget,eventName,eventHandler,useCapture){var gwdId=new gwd.GwdId(eventTarget);var groupName=gwdId.getGroupName();if(groupName!==""){var instances=document.querySelectorAll("["+gwd.GwdId.GROUP_REFERENCE_ATTR+" = "+groupName+"]");Array.prototype.forEach.call(instances,function(instance){var target=gwdId.getElementInInstance(document,instance);if(target){var actualHandlerProp=gwd.actions.events.actualHandlerProp;if(eventHandler[actualHandlerProp]){target.removeEventListener(eventName,eventHandler[actualHandlerProp],useCapture)}}})}else{var targetElement=gwd.actions.events.getElementById(eventTarget);if(targetElement&&eventTarget[0]!=" "){targetElement.removeEventListener(eventName,eventHandler,useCapture)}}};gwd.actions.events.setInlineStyle=function(id,styles){var element=gwd.actions.events.getElementById(id);if(!element||!styles){return}var transitionProperty=element.style.transition!==undefined?"transition":"-webkit-transition";var prevTransition=element.style[transitionProperty];var splitStyles=styles.split(/\s*;\s*/);var nameValue;splitStyles.forEach(function(splitStyle){if(splitStyle){var regex=new RegExp("[:](?![/]{2})");nameValue=splitStyle.split(regex);nameValue[1]=nameValue[1]?nameValue[1].trim():null;if(!(nameValue[0]&&nameValue[1])){return}element.style.setProperty(nameValue[0],nameValue[1])}});function restoreTransition(event){var el=event.target;el.style.transition=prevTransition;el.removeEventListener(event.type,restoreTransition,false)}element.addEventListener("transitionend",restoreTransition,false);element.addEventListener("webkitTransitionEnd",restoreTransition,false)};gwd.actions.events.currentTarget=null;gwd.actions.events.actualHandlerProp="gwd_actualHandler";gwd.actions.events.wrapHandler_=function(handler,event){gwd.actions.events.currentTarget=event.target;handler.call(null,event)};gwd.actions.gwdDoubleclick=gwd.actions.gwdDoubleclick||{};gwd.actions.gwdDoubleclick.goToPage=function(receiver,opt_pageId,opt_transition,opt_duration,opt_easing,opt_direction){gwd.actions.events.getElementById(receiver).goToPage(opt_pageId,opt_transition,opt_duration,opt_easing,opt_direction)};gwd.actions.gwdDoubleclick.reportManualClose=function(receiver){gwd.actions.events.getElementById(receiver).reportManualClose()};gwd.actions.gwdPagedeck=gwd.actions.gwdPagedeck||{};gwd.actions.gwdPagedeck.goToPage=function(receiver,pageId,opt_type,opt_duration,opt_easing,opt_direction){gwd.actions.events.getElementById("gwd-ad").goToPage(pageId,opt_type,opt_duration,opt_easing,opt_direction)}