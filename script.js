$(function() {

  $("select").selectmenu({
    width: 125,
    change: function(e, data) {
      var value = data.item.value || e.target.value;
      $('#add-' + this.id).attr('disabled', !data.item.index);
    },
    create: function(event, ui) {
      // console.log({event, ui});
    }
  });

  var components = ['question', 'answer', 'bracket', 'comparison'];

  components.forEach(function(item) {
    $('#add-' + item).unbind('click').click(function(){
      var selectedText = cleanHtmlTag($('#' + item).val());
      if (!selectedText) return;
      var data = item + ':' + selectedText;
      appendItem(data, selectedText);
      updateData(".sortable");
    });
	});

  $('#reset').unbind('click').click(function(){
    $(".sortable > li").each(function() { $(this).remove(); });
    updateData(".sortable");
  });

  $('#add-logical').unbind('click').click(function(){
    var key = 'logical';
    var value = 'AND';
    var data = key + ':' + value;
    const item = $("<li data-item=" + data + "><span class='draggable'></span><span class='item-content'></span><span class='remove'></span></li>");
    item.appendTo($(".sortable"));
    var menu = getLogicalMenu();
    var itemContent = item.find(".item-content");
    $(menu).clone().appendTo($(itemContent)).selectmenu({width: 90});
    $(".sortable .remove").unbind('click').click(function(e){
      $(this).parent().remove();
      updateData(".sortable");
    });
    updateData(".sortable");
    $(".sortable").sortable("refresh");
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

  function updateData(elem) {
    var group = $(elem).sortable("toArray", {attribute: "data-item"});
    var json = group.map(function(item, index){
      var pair = item.split(':');
      return { component:pair[0], value:pair[1], sortOrder:index+1 };
    });
    var data = JSON.stringify(json, null, 2);
    $('.data').text(data);
  }

  $(".sortable").sortable({
      axis: "x", 
      items: "> li",
      handle: ".draggable",
      revert: true,
      revertDuration: 50,
      placeholder: "ui-sortable-placeholder",
      change: function(event, ui) {
        // console.log(ui.item);
      },
      sort: function(event, ui){ 
        ui.item.addClass("selected"); 
      },
      stop: function(event, ui){ 
        ui.item.removeClass("selected"); 
      },
      update: function(e, ui) {
        updateData(this);
      }
    });

    function getLogicalMenu() {
      return `<select name="logical" id="logical" class="ui-selectmenu-menu ui-widget ui-corner-all">
        <option value="AND">AND</option>
        <option value="OR">OR</option>
      </select>`;
    }

    updateData('.sortable');

});