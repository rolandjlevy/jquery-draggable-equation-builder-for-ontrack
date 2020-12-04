$(function() {

  var components = ['question', 'answer', 'bracket', 'comparison', 'logical'];

  components.forEach(function(item) {
    $('#add-' + item).unbind('click').click(function(){
      var selectedText = $('#' + item).val();
      if (!selectedText) return;
      var data = item + '&colon;&nbsp;' + selectedText;
      appendItem(data, selectedText);
    });
	});

  function appendItem(data, selectedText) {
    $("<li data-item=" + data + "><span class='draggable'></span>" + selectedText + " " + "<span class='remove'></span></li>").appendTo($(".sortable"));
    $(".sortable").sortable("refresh");
    bindRemoveEvent();
    updateData(".sortable");
  };

  function bindRemoveEvent() {
    $(".sortable > li > .remove").unbind('click').click(function(e){
      var data = $(e.target.parentNode).attr('data-item');
      $(this).parent().remove();
      updateData(".sortable");
    });
  }

  function updateData(elem) {
    var group = $(elem).sortable("toArray", {attribute: "data-item"});
    var data = JSON.stringify({ group }, null, 2);
    $('.data').text(data);
  }

  $(".sortable").sortable({
      axis: "x", 
      items: "> li",
      handle: ".draggable",
      revert: true,
      revertDuration: 50,
      placeholder: "ui-sortable-placeholder",
      change: function() {
        // console.log('changed');
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