/*
* EPUB Figure Gallery
* 
* Author: marisa.demeglio@gmail.com
* Date created: 2012-02-02
*/
		
// Make sure Object.create is available in the browser (for our prototypal inheritance)
// Courtesy of Douglas Crockford
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}
			
// main object
FigureGallery = {
	// this string represents our gallery viewport.  we'll load the figure data into it as we go.
	HTML: "<div id='figure-gallery'><figure aria-live='assertive' aria-relevant='all'><div id='contents' aria-describedBy='caption'></div><figcaption id='caption'></figcaption></figure><nav id='thumbnails'></nav><div id='navigation'><a id='previous' href='#' aria-controls='contents caption'>Previous</a><span id='count'></span><a href='#' id='next' aria-controls='contents caption'>Next</a></div></div>",
	// show this if there's an error
	ERROR: "<p class='error'>Error initializing figure gallery</p>",
	
	// call this function to start and pass in the path to your xml data
	init: function(dataUri) {
		var doc = loadXml(dataUri);
		this.initFromXmlDoc(doc);
	},
	
	// if your data is already in an xml document, call this function to start
	initFromXmlDoc: function(xmldoc) {
		if (xmldoc == null) {
			this.showError();
			return;
		}
			
		this.figures = $(xmldoc).find("figure");
		this.thumbnails = $(xmldoc).find("thumbnail");
			
		if (this.figures == null) {
			this.showError();
			return;
		}
		
		this.figureIndex = 0;
		this.createGallery();
		
		var self = this;			
		// bind navigation actions
		$("#previous").click(function(e) {
			e.preventDefault(); // added prevent default or else the iframe navigates away
			self.previous();
		});
		$("#next").click(function(e) {
			e.preventDefault(); // added prevent default or else the iframe navigates away
			self.next();
		});
					
		if (this.thumbnails != null && this.thumbnails.length > 0) {
			this.loadThumbnails();	
		}
					
		// load the first figure
		this.refreshNavigationBar();
		this.loadFigure();
	},
	showError: function() {
		var errorElm = $(this.ERROR);
		$("#figure-gallery-impl-target").append(errorElm);
	},
	// construct the visual components of the gallery
	createGallery: function() {
		// create the gallery container from an HTML string
		this.galleryContainer = $(this.HTML);
					
		this.galleryContainer.css("visibility", "hidden");
		
		// append the gallery to the document element with ID "impl-target"
		$("#figure-gallery-impl-target").append(this.galleryContainer);
					
		// set the heights
		var figureGalleryHeight = $("#figure-gallery").height();
		$("#navigation").css("height", .03 * figureGalleryHeight);
		$("#thumbnails").css("height", .12 * figureGalleryHeight);
		$("#contents").css("height", .64 * figureGalleryHeight);
		$("#figure-gallery figcaption").css("height", .15 * figureGalleryHeight);
					
		this.galleryContainer.css("visibility", "visible");
	},
	
	loadThumbnails: function() {
		var self = this;
		var imgs =[ ];
		var ol = $("<ol></ol>");
		$("#thumbnails").append(ol);
			
		$(this.thumbnails).each(function() {
			var img = $("<img/>")
			$(img).attr("src", $(this).attr("src"));
			$(img).attr("alt", $(this).attr("title"));	
			$(img).data("idref", $(this).attr("ref"));
			
			var li = $("<li/>");
			li.append(img);
			ol.append(li);
			
			$(img).click(function(e) {
				if (!e) var e = window.event;
	
				// use e.srcElement for IE8...
				var target = (e.currentTarget) ? e.currentTarget : e.srcElement;	
				var li = target.parentNode;
				// for IE8...
				if (li.nodeName != "li" && li.nodeName != "LI") {
					li = li.parentNode;
				}
					
				var idref = $(target).data()['idref'];
				if (idref != null) {
					self.goToFigureId(idref);
				}
				// if there's no idref, just go to the figure that appears in the same order as this one
				else {
					self.goToFigure($(li).index());
				}
			});	
		});	
	},
				
	loadFigure: function() {
		if (this.figureIndex < 0 || this.figureIndex >= this.figures.length) return;
					
		var dataFigure = this.figures[this.figureIndex];
		var dataFigcaption = $(dataFigure).children("figcaption");
		var galleryFigure = $("#contents");
		var galleryFigcaption = $("#figure-gallery figcaption");
					
		// clear the contents of the current display
        $(galleryFigure).contents().each(function() {
			$(this).remove();
		});
        
        // clear the contents of the current figure caption
		$(galleryFigcaption).contents().each(function() {
			$(this).remove();
		});
					
		$(galleryFigure).css("visibility", "hidden");
					
		
		$(dataFigure).contents().each(function() {
			if ($(this).is('figcaption')) return;
            
            // images and videos need special treatment: create a new element instead of cloning the existing one
            // this is not apparent with the standalone example but it is with a webkit app, e.g. Readium
            if ($(this).is('img') || $(this).is('video')) {
    			var elm = $("<" + this.tagName + "/>");
                
                // copy all the attributes
                $.each(this.attributes, function(i, attr) {
                    elm.attr(attr.name, attr.value);
                });
                
                // copy the children of video elements. note that video cannot contain media element descendants, so no special copying is required
                if ($(this).is("video")) {
                    $(this).contents().each(function() {
                        elm.append($(this).clone());
                    });
                }
                
                $(galleryFigure).append(elm);	
            }
            else {
                $(galleryFigure).append($(this).clone());
            }
		});
		
        // append the figcaption children
		$(dataFigcaption).contents().each(function() {
			$(galleryFigcaption).append($(this).clone());						
		});
					
		$(galleryFigure).css("visibility", "visible");
	},
				
	/* navigation functions */
	next: function() {
		if (!this.canGoNext()) return;
					
		this.figureIndex++;
		this.loadFigure();
		this.refreshNavigationBar();
	},
				
	previous: function() {
		if (!this.canGoPrevious()) return;
					
		this.figureIndex--;
		this.loadFigure();
		this.refreshNavigationBar();
	},
	goToFigure: function(i) {
		if (i < 0 || i >= this.figures.length) return;
					
		this.figureIndex = i;
		this.loadFigure();
		this.refreshNavigationBar();
	},
	goToFigureId: function(id) {
		var index = -1;
		$(this.figures).each(function() {
			if ($(this).attr("id") == id) {
				index = $(this).index();
				return;
			}
		});
		this.goToFigure(index);
	},			
	refreshNavigationBar: function() {
		// set 'previous' command style
		if (this.canGoPrevious()) {
			$("#previous").removeClass("navigation-disabled");
		}
		else {
			$("#previous").addClass("navigation-disabled");						
		}
					
		// set 'next' command style
		if (this.canGoNext()) {
			$("#next").removeClass("navigation-disabled");
		}
		else {
			$("#next").addClass("navigation-disabled");
		}
					
		// set the count
		var message = (this.figureIndex+1) + " of " + this.figures.length;
		$("#count").text(message);
					
		// highlight current thumbnail
		$("#thumbnails img").removeClass("selected");
		var selector = "#thumbnails li:eq(" + this.figureIndex + ") img";
		$(selector).addClass("selected");
					
	},
				
	canGoPrevious: function() {
		return this.figureIndex > 0 ? true : false;
	},
				
	canGoNext: function() {
		return this.figureIndex < this.figures.length-1 ? true : false;
	},
				
};
// load xml (synchronous)
function loadXml(uri) {
	var request = new XMLHttpRequest();
	request.open("GET", uri, false);
	request.send(null);  
	return request.responseXML;
}		

		