/*
* EPUB Figure Gallery Widget
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
	HTML: "<div id='figure-gallery'><figure><div id='contents'></div><figcaption></figcaption></figure><div id='thumbnails'></div><div id='navigation'><a id='previous' href='#'>Previous</a><span id='count'></span><a href='#' id='next'>Next</a></div></div>",
	// show this if there's an error
	ERROR: "<p class='error'>Error initializing figure gallery</p>",
	
	// call this function to start the widget and pass in the path to your xml data
	init: function(dataUri) {
		var doc = loadXml(dataUri);
		this.initFromXmlDoc(doc);
	},
	
	// if your data is already in an xml document, call this function to start the widget
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
		$("#previous").click(function() {
			self.previous();
		});
		$("#next").click(function() {
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
		$(galleryFigure).children().each(function() {
			$(this).remove();
		});
		$(galleryFigcaption).children().each(function() {
			$(this).remove();
		});
					
		$(galleryFigure).css("visibility", "hidden");
					
		var container = $("#contents");
					
		// grab all figure contents except for figcaption
		$(dataFigure).children().each(function() {
			if ($(this).is('figcaption')) return;
			var elm = $(this).clone();
			$(galleryFigure).append(elm);						
		});
					
		// append the figcaption children
		$(dataFigcaption).children().each(function() {
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

// utility functions
function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}

// load xml (synchronous)
function loadXml(uri) {
	var request = new XMLHttpRequest();
	request.open("GET", uri, false);
	request.send(null);  
	return request.responseXML;
}	
