$(function() {


  var menus = {
    logical: '<select name="logical" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="AND">AND</option><option value="OR">OR</option></select>',
    bracket: '<select name="bracket" id="bracket-clone" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="(">(</option><option value=")">)</option></select>',
    comparison: '<select name="comparison" class="ui-selectmenu-menu ui-widget ui-corner-all"><option value="==">==</option><option value="!=">!=</option><option value="<">&lt;</option><option value=">">&gt;</option><option value="<=">&lt;=</option><option value=">=">&gt;=</option></select>'
  }

  $("select").selectmenu({
    width: 125,
    change: function(e, data) {
      var value = data.item.value || e.target.value;
      $('#add-' + this.id).attr('disabled', !data.item.index);
    },
    create: function(event, ui) { }
  });

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

  var components = ['question', 'answer'];

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
      // axis: "x", 
      items: "> li",
      handle: ".draggable",
      revert: true,
      revertDuration: 50,
      placeholder: "ui-sortable-placeholder",
      change: function(event, ui) { },
      sort: function(event, ui){ ui.item.addClass("selected"); },
      stop: function(event, ui){ ui.item.removeClass("selected"); },
      update: function(e, ui) {
        updateData(this);
      }
    });

    updateData('.sortable');

});