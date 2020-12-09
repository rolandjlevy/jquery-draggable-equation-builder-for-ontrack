$(function() {

  /********************/
  /* Define constants */
  /********************/

  // Sortable items
  var MENUS = {
    logical: '<select name="logical" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="AND">AND</option><option value="OR">OR</option></select>',
    bracket: '<select name="bracket" id="bracket-clone" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="(">(</option><option value=")">)</option></select>',
    comparison: '<select name="comparison" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="==">==</option><option value="!=">!=</option><option value="<">&lt;</option><option value=">">&gt;</option><option value="<=">&lt;=</option><option value=">=">&gt;=</option></select>'
  }

  // Answer types
  var ANSWERS = [
    { type:'select', value:'<select name="boolean" class="answer ui-selectmenu-menu ui-widget ui-corner-all"><option value="yes">Yes</option><option value="no">No</option></select>' },
    { type:'select', value:'<select name="range-abc" class="answer ui-selectmenu-menu ui-widget ui-corner-all"><option value="na">N/A</option><option value="pass">Pass</option></select>' },
    { type:'select', value:'<select name="range-numeric" class="answer ui-selectmenu-menu ui-widget ui-corner-all"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select>' },
    { type:'input', value:'<input class="answer ui-widget ui-widget-content ui-corner-all" placeholder="Enter..." />' }
  ];

  // Component class contructor
  function Component(type) {
    this.type = type;
    this.menuSelector = $('select#' + type);
    this.buttonSelector = $('#add-' + type);
    this.uiElementWidth = 125;
  };

  // Initialise select menus
  Component.prototype.initSelectMenu = function() {
    var component = this;
    this.menuSelector.selectmenu({
      width: component.uiElementWidth,
      change: function(e, ui) {
        var selectedIndex = $('option:selected', this).index();
        if (!selectedIndex) return;
        component.buttonSelector.attr('disabled', !ui.item.index);
        if (component.type == 'question') {
          $('#add-answer').attr('disabled', !ui.item.index);
          component.createAnswerElement(selectedIndex);
        }
      }
    });
  }

  // Create Answer element in dependence upon Question menu selection
  Component.prototype.createAnswerElement = function(selectedIndex) {
    var component = this;
    var answerContainer = $('#answer-container');
    answerContainer.empty();
    var answer = ANSWERS[selectedIndex-1];
    if (answer.type == 'select') {
      $(answer.value).clone().appendTo(answerContainer).selectmenu({ 
        width: component.uiElementWidth,
        change: function(e, data) {
          var value = data.item.value;
          var index = data.item.index;
          console.log({ value, index });
        },
      }).selectmenu("refresh");
    } else {
      $(answer.value).clone().appendTo(answerContainer);
    }
  }

  // Event handler for adding a comparison, bracket and logical item
  Component.prototype.addItemEventHandler = function(width) {
    var component = this;
    this.buttonSelector.unbind('click').click(function(e) {
      var val = component.menuSelector.val();
      var item = component.createSortableItem(val);
      item.appendTo($('.sortable'));
      var itemContent = item.find('.item-content');
      $(MENUS[component.type]).clone().appendTo($(itemContent)).selectmenu({
        width: width,
        create: function(event, ui) {
          $(this).val(val);
          $(this).selectmenu('refresh');
        },
        change: function(event, ui) {
          $(this).parent().parent().attr('data-item', component.type + ':' + ui.item.value);
          updateData('.sortable');
        }
      });
      component.removeEventHandler();
    });
  }

  // Event handler for adding a Question item
  Component.prototype.addQuestionItemEventHandler = function() {
    var component = this;
    $('#add-question').unbind('click').click(function(){
      var selectedText = $('#question').val();
      if (!selectedText) return;
      var item = component.createSortableItem(selectedText);
      var itemContent = item.find('.item-content');
      itemContent.html('<span class="item">' + selectedText + '</span>');
      item.appendTo($('.sortable'));
      component.removeEventHandler();
    });
  }
  
  // Event handler for adding an Answer item
  Component.prototype.addAnswerItemEventHandler = function(width) {
    var component = this;
    $('#add-answer').unbind('click').click(function(){
      var val = $('#answer-container > .answer').val();
      var selectedIndex = $('#question option:selected').index();
      var item = component.createSortableItem(val);
      item.appendTo($('.sortable'));
      var itemContent = item.find('.item-content');
      var answer = ANSWERS[selectedIndex-1];
      if (answer.type == 'select') {
        $(answer.value).clone().appendTo($(itemContent)).selectmenu({ 
          width: width,
          change: function(event, ui) {
            $(this).parent().parent().attr('data-item', 'answer:' + ui.item.value);
            updateData('.sortable');
          },
          create: function(event, ui) {
            $(this).val(val);
            $(this).selectmenu('refresh');
          }
        });
      } else {
        $(answer.value).clone().appendTo($(itemContent));
        var inputField = itemContent.find('.answer');
        inputField.val(val);
        inputField.unbind('keyup').keyup(function(e){
          $(this).parent().parent().attr('data-item', 'answer:' + e.target.value);
          updateData('.sortable');
        });
      }
      $('.sortable .remove').unbind('click').click(function(e) {
        $(this).parent().remove();
        updateData('.sortable');
      });
      updateData('.sortable');
      $('.sortable').sortable('refresh');
    });
  }
  
  // Create a sortable item for sortable area
  Component.prototype.createSortableItem = function(val) {
    var cleanedValue = val.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return $("<li data-item=" + this.type + ':' + cleanedValue + "><span class='draggable'></span><span class='item-content'></span><span class='remove'></span></li>");
  }

  // Event handler for removing an item
  Component.prototype.removeEventHandler = function() {
    $(".sortable .remove").unbind('click').click(function(e){
      $(this).parent().remove();
      updateData(".sortable");
    });
    $(".sortable").sortable("refresh");
    updateData(".sortable");
  }

  // Initialise components and their select menus & event handlers

  var questionComponent = new Component('question');
  questionComponent.initSelectMenu();
  questionComponent.addQuestionItemEventHandler();

  var answerComponent = new Component('answer');
  answerComponent.addAnswerItemEventHandler(65);

  var logicalComponent = new Component('logical');
  logicalComponent.initSelectMenu();
  logicalComponent.addItemEventHandler(65);

  var bracketComponent = new Component('bracket');
  bracketComponent.initSelectMenu();
  bracketComponent.addItemEventHandler(40);

  var comparisonComponent = new Component('comparison');
  comparisonComponent.initSelectMenu();
  comparisonComponent.addItemEventHandler(50);


  // $("select").selectmenu({
  //   width: uiElementWidth,
  //   change: function(e, ui) {
  //     $('#add-' + this.id).attr('disabled', !ui.item.index);
  //   }
  // });

  /***************************/
  /* Questions menu & button */
  /***************************/

  // $("select#question").selectmenu({
  //   width: uiElementWidth,
  //   change: function(e, data) {
  //     var selectedIndex = $('option:selected', this).index();
  //     if (!selectedIndex) return;
  //     $('#add-answer').attr('disabled', !data.item.index);
  //     $('#add-question').attr('disabled', !data.item.index);
  //     createAnswerElement(selectedIndex);
  //   }
  // });

  // function addQuestionItemEventHandler() {
  //   $('#add-question').unbind('click').click(function(){
  //     var selectedText = $('#question').val();
  //     if (!selectedText) return;
  //     var item = createSortableItem('question', selectedText);
  //     var itemContent = item.find('.item-content');
  //     itemContent.html('<span class="item">' + selectedText + '</span>');
  //     item.appendTo($('.sortable'));
  //     $(".sortable .remove").unbind('click').click(function(e){
  //       var data = $(e.target.parentNode).attr('data-item');
  //       $(this).parent().remove();
  //       updateData(".sortable");
  //     });
  //     $(".sortable").sortable("refresh");
  //     updateData(".sortable");
  //   });
  // }
  /********************/
  /* Answers elements */
  /********************/

  // function createAnswerElement(selectedIndex) {
  //   var answerContainer = $('#answer-container');
  //   answerContainer.empty();
  //   var answer = answers[selectedIndex-1];
  //   if (answer.type == 'select') {
  //     $(answer.value).clone().appendTo(answerContainer).selectmenu({ 
  //       width: uiElementWidth,
  //       change: function(e, data) {
  //         var value = data.item.value;
  //         var index = data.item.index;
  //         console.log({ value, index });
  //       },
  //     }).selectmenu("refresh");
  //   } else {
  //     $(answer.value).clone().appendTo(answerContainer);
  //   }
  // }
  
  // function addAnswerItemEventHandler(width) {
  //   $('#add-answer').unbind('click').click(function(){
  //     var val = $('#answer-container > .answer').val();
  //     var selectedIndex = $('#question option:selected').index();
  //     var item = createSortableItem(val);
  //     item.appendTo($('.sortable'));
  //     var itemContent = item.find('.item-content');
  //     var answer = answers[selectedIndex-1];
  //     if (answer.type == 'select') {
  //       $(answer.value).clone().appendTo($(itemContent)).selectmenu({ 
  //         width: width,
  //         change: function(event, ui) {
  //           $(this).parent().parent().attr('data-item', 'answer:' + ui.item.value);
  //           updateData('.sortable');
  //         },
  //         create: function(event, ui) {
  //           $(this).val(val);
  //           $(this).selectmenu('refresh');
  //         }
  //       });
  //     } else {
  //       $(answer.value).clone().appendTo($(itemContent));
  //       var inputField = itemContent.find('.answer');
  //       inputField.val(val);
  //       inputField.unbind('keyup').keyup(function(e){
  //         $(this).parent().parent().attr('data-item', 'answer:' + e.target.value);
  //         updateData('.sortable');
  //       });
  //     }
  //     $('.sortable .remove').unbind('click').click(function(e) {
  //       $(this).parent().remove();
  //       updateData('.sortable');
  //     });
  //     updateData('.sortable');
  //     $('.sortable').sortable('refresh');
  //   });
  // }

  

  // function addItemEventHandler(type, width) {
  //   $('#add-' + type).unbind('click').click(function(e) {
  //     var val = $('#' + type).val();
  //     var item = createSortableItem(type, val);
  //     item.appendTo($('.sortable'));
  //     var itemContent = item.find('.item-content');
  //     $(menus[type]).clone().appendTo($(itemContent)).selectmenu({
  //       width: width,
  //       change: function(event, ui) {
  //         $(this).parent().parent().attr('data-item', type + ':' + ui.item.value);
  //         updateData('.sortable');
  //       },
  //       create: function(event, ui) {
  //         $(this).val(val);
  //         $(this).selectmenu('refresh');
  //       }
  //     });
  //     $('.sortable .remove').unbind('click').click(function(e) {
  //       $(this).parent().remove();
  //       updateData('.sortable');
  //     });
  //     updateData('.sortable');
  //     $('.sortable').sortable('refresh');
  //   });
  // }

  

  // function createSortableItem(type, val) {
  //   var cleanedValue = val.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  //   return $("<li data-item=" + type + ':' + cleanedValue + "><span class='draggable'></span><span class='item-content'></span><span class='remove'></span></li>");
  // }

  // addItemEventHandler('comparison', 50);
  // addItemEventHandler('bracket', 40);
  // addItemEventHandler('logical', 65);
  // addAnswerItemEventHandler(65);
  // addQuestionItemEventHandler();

  // Event handler for reset button
  $('#reset').unbind('click').click(function(){
    $(".sortable > li").each(function() { $(this).remove(); });
    updateData(".sortable");
  });

  /*****************/
  /* Sortable list */
  /*****************/

  $(".sortable").sortable({
    items: "> li",
    handle: ".draggable",
    tolerance: "pointer",
    placeholder: "ui-sortable-placeholder",
    forcePlaceholderSize: true,
    change: function(e, ui) { },
    start: function(e, ui){
      var helperHeight = ui.helper.outerHeight();
      var itemHeight = ui.item.height();
      ui.placeholder.height(helperHeight);
    },
    sort: function(e, ui){ ui.item.addClass("selected"); },
    stop: function(e, ui){ ui.item.removeClass("selected"); },
    update: function(e, ui) { updateData(this); }
  });

  /***************************/
  /* Update data for backend */
  /***************************/

  function updateData(elem) {
    var group = $(elem).sortable("toArray", {attribute: "data-item"});
    var json = group.map(function(item, index){
      var pair = item.split(':');
      return { component:pair[0], value:pair[1], sortOrder:index+1 };
    });
    var data = JSON.stringify(json, null, 2);
    $('#data').text(data);
    var rules = json.map(function(item){ return item.value; });
    $('#rules').text(rules.join(" "));
  }

  updateData('.sortable');

});