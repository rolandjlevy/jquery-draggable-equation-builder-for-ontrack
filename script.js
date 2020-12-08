$(function() {

  var uiElementWidth = 125;

  // Define sortable menu items
  var menus = {
    logical: '<select name="logical" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="AND">AND</option><option value="OR">OR</option></select>',
    bracket: '<select name="bracket" id="bracket-clone" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="(">(</option><option value=")">)</option></select>',
    comparison: '<select name="comparison" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="==">==</option><option value="!=">!=</option><option value="<">&lt;</option><option value=">">&gt;</option><option value="<=">&lt;=</option><option value=">=">&gt;=</option></select>'
  }

  // Define answer elements
  var answers = [
    { type:'select', value:'<select name="boolean" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="yes">Yes</option><option value="no">No</option></select>' },
    { type:'select', value:'<select name="range-abc" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="na">N/A</option><option value="pass">Pass</option></select>' },
    { type:'select', value:'<select name="range-numeric" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select>' },
    { type:'input', value:'<input class="ui-widget ui-widget-content ui-corner-all" />' }
  ];

  // Initialise all select menus
  $("select").selectmenu({
    width: uiElementWidth,
    change: function(e, data) {
      var value = data.item.value || e.target.value;
      $('#add-' + this.id).attr('disabled', !data.item.index);
    },
    create: function(event, ui) { }
  });

  /***************************/
  /* Questions menu & button */
  /***************************/

  // Initialise Questions select menu
  $("select#question").selectmenu({
    width: uiElementWidth,
    change: function(e, data) {
      var selectedIndex = $('option:selected', this).index();
      if (!selectedIndex) return;
      $('#add-answer').attr('disabled', !data.item.index);
      $('#add-question').attr('disabled', !data.item.index);
      createAnswerElement(selectedIndex);
    },
    create: function(event, ui) { }
  });

  // Initialise Questions add button
  $('#add-question').unbind('click').click(function(){
    var selectedText = cleanHtmlTag($('#question').val());
    if (!selectedText) return;
    var data = 'question:' + selectedText;
    appendItem(data, selectedText);
    updateData(".sortable");
  });

  /********************/
  /* Answers elements */
  /********************/

  // Create Answer element: select or input
  function createAnswerElement(selectedIndex) {
    var answerContainer = $('#answer-container');
    answerContainer.empty();
    var answer = answers[selectedIndex-1];
    if (answer.type == 'select') {
      $(answer.value).clone().appendTo(answerContainer).selectmenu({ 
        width: uiElementWidth,
        change: function(e, data) {
          var value = data.item.value;
          var index = data.item.index;
          console.log({value, index});
        },
      }).selectmenu("refresh");
    } else {
      $(answer.value).clone().appendTo(answerContainer);
    }
  }

  // Initialise all sortable menus
  function initMenu(type, width) {
    $('#add-' + type).unbind('click').click(function(e) {
      var val = $('#' + type).val();
      var item = renderListItem(type, val);
      item.appendTo($('.sortable'));
      var itemContent = item.find('.item-content');
      $(menus[type]).clone().appendTo($(itemContent)).selectmenu({
        width: width,
        change: function(event, ui) {
          $(this).parent().parent().attr('data-item', type + ':' + ui.item.value);
          updateData('.sortable');
        },
        create: function(event, ui) {
          $(this).val(val);
          $(this).selectmenu('refresh');
        }
      });
      $('.sortable .remove').unbind('click').click(function(e) {
        $(this).parent().remove();
        updateData('.sortable');
      });
      updateData('.sortable');
      $('.sortable').sortable('refresh');
    });
  }

  function renderListItem(type, val) {
    return $("<li data-item=" + type + ':' + cleanHtmlTag(val) + "><span class='draggable'></span><span class='item-content'></span><span class='remove'></span></li>");
  }

  initMenu('comparison', 50);
  initMenu('bracket', 40);
  initMenu('logical', 65);

  $('#reset').unbind('click').click(function(){
    $(".sortable > li").each(function() { $(this).remove(); });
    updateData(".sortable");
  });

  function cleanHtmlTag(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function appendItem(data, selectedText) {
    $("<li data-item=" + data + "><span class='draggable'></span><span class='item'>" + selectedText + "</span><span class='remove'></span></li>").appendTo($(".sortable"));
    $(".sortable .remove").unbind('click').click(function(e){
      var data = $(e.target.parentNode).attr('data-item');
      $(this).parent().remove();
      updateData(".sortable");
    });
    $(".sortable").sortable("refresh");
  }

  $(".sortable").sortable({
      // axis: "x", 
      // revert: true,
      // revertDuration: 50,
      items: "> li",
      handle: ".draggable",
      placeholder: "ui-sortable-placeholder",
      change: function(event, ui) { },
      sort: function(event, ui){ ui.item.addClass("selected"); },
      stop: function(event, ui){ ui.item.removeClass("selected"); },
      update: function(e, ui) {
        updateData(this);
      }
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