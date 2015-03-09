/*
* EPUB Quiz Widget
* 
* Author: marisa.demeglio@gmail.com
* Date created: 2012-02-22
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
Quiz = {
    QUIZ: "<div id='questions'/><button id='submit'/><div id='d1' aria-live='assertive'><p id='score'/></div>",
    // show this if there's an error
    ERROR: "<p class='error'>Error initializing</p>",
    // item template
    ITEM: "<fieldset class='item'><legend></legend><p class='results' aria-live='assertive'/></fieldset>",
    CORRECT: "<span class='correct'>Correct.</span>",
    INCORRECT: "<span class='incorrect'>Incorrect.</span><br/><span>The answer is: </span><span class='answer'></span>",
    FLASHCARD: "<div id='flashcard'><p class='results'/></div><button id='okButton'>Ok</button>",
    RESET: "<button id='reset'>Reset</button>",
    
    // call this function to start the widget and pass in the path to your xml data
    init: function(dataUri) {
        var doc = loadXml(dataUri);
        this.initFromXmlDoc(doc);
    },
    
    // if your data is already in an xml document, call this function to start the widget
    initFromXmlDoc: function(xmldoc) {
        // the host element is in the document that is embedding this quiz
        this.hostElement = $("#quiz-impl-target");
        if (this.hostElement == null || this.hostElement == 'undefined') {
            // TODO log an error
            return;
        }
        
        if (xmldoc == null) {
            this.showError();
            return;
        }
        this.createTitle($(xmldoc).find("title"));
        
        this.quiz = $(this.QUIZ);
        this.hostElement.append(this.quiz);
        
        var self = this;
        
        // UI elements
        this.questionsdiv = $(this.quiz[0]);
        this.button = $(this.quiz[1]);
        this.score = $(this.quiz[2]);
        this.reset = $(this.RESET);
        $("#d1").append(this.reset);
        this.reset.click(function() {
            self.buttonReset();
        });
        
        // 'items' are XML <item> elements
        this.items = $(xmldoc).find("item");
        this.numItems = this.items.length;
        
        this.mode = $(xmldoc).attr("format");
        // find the format attribute one way or another. the above works for ff/webkit, but not readium; hence the code below.
        if (this.mode == null || this.mode == "undefined") {
            this.mode = $(xmldoc).find("quiz").attr("format");
        }
        
        
        // format can be to show all questions at once or show one at a time
        // default is to show all at once
        if (this.mode == null || this.mode == 'undefined' || this.mode == 'show-all') {
            this.mode = 'show-all';
            this.button.text("Submit");
            this.button.click(function() {
                self.buttonSubmit();
            });    
        }
        else if (this.mode == 'show-one' || this.mode == 'flashcard') {
            this.button.text("Next");
            this.button.click(function() {
                self.buttonNext();
            });            
        }
        this.initQuestions();
    },
    
    initQuestions: function() {
        this.numCorrect = 0;
        this.itemIndex = 0;
        this.reset.css("display", "none");
        this.clearQuestions();
        
        if (this.mode == 'show-all') {
            // in 'show-all' mode, add all items at once
            this.addAllItems(this.items);
        }
        else if (this.mode == 'show-one' || this.mode == 'flashcard') {
            // create the first item
            this.createAndAppendItem(this.items[0]);
        }
    },
    
    // submit all answers
    buttonSubmit: function() {
        this.scoreAll();
        this.showTotalScore();
        this.button.css("display", "none");
        this.reset.css("display", "inline");
    },
    buttonReset: function() {
        this.reset.css("display", "none");
        $("#score").css("display", "none");
        this.button.css("display", "inline");
        this.initQuestions();
    },
    // go to the next question
    buttonNext: function() {
        var isCorrect = this.scoreItem($("fieldset")[0]);
        if (isCorrect) {
            this.numCorrect++;
        }     
        if (this.mode == 'flashcard') {        
            this.showFlashcardAnswer(isCorrect);
        }
        else {
            this.nextQuestion();
        }
    },
    
    nextQuestion: function() {
        if (this.itemIndex >= this.items.length-1) {
            this.endQuiz();            
        }
        else {
            this.itemIndex++;
            this.clearQuestions();
            this.createAndAppendItem(this.items[this.itemIndex]);            
        }
    },
    
    // show the answer and move on to the next question
    showFlashcardAnswer: function(isCorrect) {
        this.clearQuestions();
        this.button.css("visibility", "hidden");
        this.button.attr("aria-hidden", "true");
        this.questionsdiv.append($(this.FLASHCARD));
        
        var results = this.questionsdiv.find(".results");
        var data = this.items[this.itemIndex];
        this.showItemScore(results, data, isCorrect);
        
        var self = this;
        var clickedOk = false;
        
        this.questionsdiv.find("#okButton").click(function() {
            clickedOk = true;
            // go to the next question
            self.button.css("visibility", "visible");
            self.button.attr("aria-hidden", "false");
            self.nextQuestion();
            
        });
        
    },
    
    // add a simple title to the quiz
    createTitle: function(titleElm) {
        if (titleElm == undefined || titleElm == null) return;
        
        var title = $("<h1/>");
        title.text(titleElm.text());
        this.hostElement.append(title);
    },
    
    // add all quiz items
    addAllItems: function(itemXmlElms) {
        var self = this;
        itemXmlElms.each(function() {
            self.createAndAppendItem(this);
            self.itemIndex++;
        });
    },
    
    // create and add a single quiz item
    createAndAppendItem: function(itemXml) {
        var itemHtml = $(this.ITEM);
        if (this.mode == 'show-one' || this.mode == 'flashcard') {
            this.questionsdiv.attr("aria-live", "assertive");
        }
        itemHtml.data("xml", itemXml);
        
        // set the question text
        $(itemHtml).find("legend").text(this.itemIndex+1 + ". " + $(itemXml).children("question").text());
        
        var type = $(itemXml).attr("type");
        if (type == "select-one" || type == "select-many") {
            var list = this.createList($(itemXml).children("list"), type);
            // insert the list before the results placeholder
            itemHtml.find(".results").before(list);
        }
        else if (type == "text-entry") {
            var input = this.createTextEntry();
            itemHtml.find(".results").before(input);
        }
        
        this.questionsdiv.append(itemHtml);
    },
    
    createList: function(listXml, type) {
        var listtype = "radio";
        if (type == "select-many") {
            listtype = "checkbox";
        }
        
        var listHtml = $("<ol/>");
        listHtml.attr("type", listXml.attr("type"));
        
        var liCount = 0;
        var listId = "ol" + this.itemIndex;
        listHtml.attr("id", listId);
        listHtml.data(listXml);
        listXml.children("choice").each(function() {
            var choiceId = listId + "li" + liCount;
            // oddly you can't re-assign @type after input element creation
            var li = $("<li><label><input type='"+ listtype + "'/><span/></label></li>");
            li.find("label span").text($(this).text());            
            li.find("label input").attr("id", choiceId);
            li.find("label input").attr("name", listId);
            
            listHtml.append(li);
            liCount ++;
        });   
        return listHtml;     
    },
    
    createTextEntry: function() {
        return $("<input/>");
    },
    
    scoreAll: function() {
        var htmlItems = $("fieldset");
        var self = this;
        this.numCorrect = 0;
        
        htmlItems.each(function() {
            var isCorrect = self.scoreItem(this);
            if (isCorrect) self.numCorrect++;
            
            var results = $(this).find(".results");
            var data = $(this).data('xml');
            self.showItemScore(results, data, isCorrect);
        });
    },
    
    scoreItem: function(htmlItem) {
        var data = $(htmlItem).data()["xml"];
        var type = $(data).attr("type");
        var correct = false;
        if (type == "select-one" || type == "select-many") {
            correct = this.scoreListItem($(htmlItem).find("ol"), $(data).find("list"));
        }
        else if (type == "text-entry") {
            correct = this.scoreTextEntryItem($(htmlItem).find("input"), $(data).attr("answer"));
        }
        return correct;
    },
    
    // for questions with radio buttons or checkboxes
    scoreListItem: function(htmlList, dataList) {
        var filledInAnswer = false;
        var allCorrect = true;
        htmlList.find("li").each(function() {
            var isChecked = $(this).find("input").prop("checked");
            var idx = $(this).index();
            var shouldBeChecked = $(dataList.find("choice")[idx]).attr("correct") == "true" ? true : false;
                     
            allCorrect = allCorrect && (xnor(isChecked, shouldBeChecked));
                        
            if (isChecked) {
                filledInAnswer = true;
            }             
        });
        return allCorrect && filledInAnswer;
    },
    
    // for text entry fields.  case and whitespace insensitive.
    scoreTextEntryItem: function(inputBox, answer) {
        if ($.trim(answer.toLowerCase()) == $.trim(inputBox.val().toLowerCase())) {
            return true;
        }
        return false;        
    },
    
    getCorrectAnswerText: function(itemXml) {
        var correctAnswers = new Array();
        var type = $(itemXml).attr("type");
        
        if (type == "select-one" || type == "select-many") {
            $(itemXml).find("choice[correct='true']").each(function() {
                correctAnswers.push($(this).text());
            });
        }
        else if (type == "text-entry") {
            correctAnswers.push($(itemXml).attr("answer"));
        }
        return correctAnswers.join(", ");
    },
    
    showItemScore: function(resultsHtmlContainer, itemXml, isCorrect) {
        // TODO include reference to correct answer (e.g. "correct answer 'A. 23')
        // but how to get the list marker value? we could calculate it, but that seems stupid
        if (isCorrect) {
            resultsHtmlContainer.html(this.CORRECT);
        }
        else {
            resultsHtmlContainer.html(this.INCORRECT);
            var correctAnswerText = this.getCorrectAnswerText(itemXml);
            resultsHtmlContainer.find(".answer").text(correctAnswerText);
        }
    },
    
    showTotalScore: function() {
        $("#score").css("display", "block");
        $("#score").text("You scored: " + this.numCorrect + " out of " + this.numItems);
    },
    
    showError: function() {
        var errorElm = $(this.ERROR);
        this.hostElement.append(errorElm);
    },
    
    clearQuestions: function() {
        var self = this;
        this.questionsdiv.children().each(function() {
            $(this).remove();
        });
    },
    
    endQuiz: function() {  
        this.clearQuestions();      
        this.button.css("display", "none");
        this.reset.css("display", "inline");
        this.showTotalScore();
    } 
}

// utility functions

// load xml (synchronous)
function loadXml(uri) {
	var request = new XMLHttpRequest();
	request.open("GET", uri, false);
	request.send(null);  
	return request.responseXML;
}	

function xor(a, b) {
    return a ? !b : b;
}
function xnor(a, b) {
    return !xor(a, b);
}

