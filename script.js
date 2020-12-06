$(function() {

  $("select").selectmenu({
    width: 125,
    change: function(e, data) {
      var value = data.item.value || e.target.value;
      $('#add-' + this.id).attr('disabled', !data.item.index);
    },
    create: function(event, ui) {}
  });

  var components = ['question', 'answer', 'bracket', 'comparison', 'logical'];

  components.forEach(function(item) {
    $('#add-' + item).unbind('click').click(function(){
      var selectedText = cleanHtmlTag($('#' + item).val());
      if (!selectedText) return;
      var data = item + ':' + selectedText;
      appendItem(data, selectedText);
      updateData(".sortable");
    });
	});

  function cleanHtmlTag(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function appendItem(data, selectedText) {
    $("<li data-item=" + data + "><span class='draggable'>" + selectedText + "</span><span class='remove'></span></li>").appendTo($(".sortable"));
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

    updateData('.sortable');

});