$(document).ready(function() {

    /* one question is whether changing the value of @class 
        qualifies as "structural changes" ("dom-manipulation") */
        
    var neededFeatures =["layout-changes", "spine-scripting", "dom-manipulation"];    
    var support = typeof navigator.epubReadingSystem != 'undefined';
    if (support) {    
        for (var i = 0; i < neededFeatures.length; i++) {
            if (!navigator.epubReadingSystem.hasFeature(neededFeatures[i])) {
                return;
            }
        }             
        if (!navigator.epubReadingSystem.hasFeature("touch-events") 
                && !navigator.epubReadingSystem.hasFeature("mouse-events")) {
            return;
        }        
    }
    
    $("figure.unscripted").removeClass("unscripted");
    $("figure").addClass("scripted");        
    
    $("img.full").css("opacity", 1);
    $("figure.scripted").css("opacity", 0);        
    
    var $backgroundOpacityLow = '0.6'
    var $figureOpacityLow = '0'
    
    $("body").click(function (event) {                    
        if($("img.full:animated").length == 0 && $("figure.scripted:animated").length == 0) {        
            var $backgroundTargetOpacity = $("img.full").css("opacity") == '1' ? $backgroundOpacityLow: '1';
            var $figureTargetOpacity = $("figure.scripted").css("opacity") == '1' ? $figureOpacityLow: '1';                           
            $("img.full").animate({opacity: + $backgroundTargetOpacity},{duration: 1000, queue: false});
            $("figure.scripted").animate({opacity: + $figureTargetOpacity},{duration: 1000, queue: false});        
        }
    });
});