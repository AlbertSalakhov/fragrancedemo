define(["jquery", "jquery/ui", "js/functions"], function($, ui) {
  "use strict";
  $.widget('brandMenu.js', {
    _containers: {
      alpha: null,
      featured: null,
      list: null
    },
    _pageSize: 20,
    _formKey: null,
    _options: {

    },
    _create: function() {
      this._configureContainters()._events()._paginateLetters();
    },

    _configureContainters: function() {
      this._containers.alpha = this.element.find('.container-alpha-filter');
      this._containers.featured = this.element.find('.menu-blocks.featured-brands');
      this._containers.list = this.element.find('.menu-blocks.brands-listing');
      return this;
    },

    _events: function() {
      var self = this;

      this._containers.alpha.on('click', 'a', function() {
        if($(this).data('type') == 'featured') {
          self._showFeatured();
        } else if($(this).data('type') == 'alpha') {
          self._showList()._showListLetter($(this).data('letter'));
        }
      })

      return this;

    },

    _showFeatured: function() {
      this._containers.list.hide();
      this._containers.featured.show();

      return this;
    },

    _showList: function() {
      this._containers.list.show();
      this._containers.featured.hide();

      return this;
    },

    _showListLetter: function(letter) {
      this._containers.list.find('.brands-listing-content').hide();
      this._containers.list.find('.brands-listing-content[data-letter="'+letter+'"]').show();
      return this;
    },

    _paginateLetters: function() {
      var self = this;
      this._containers.list.find('.brands-listing-content').each(function() {
        var list = $(this);
        var size = list.find('.row > div').length;
        var pages = Math.ceil(size/self._pageSize);

        if(pages > 1) {
          list.find('.row > div:gt('+(self._pageSize-1)+')').hide();
          list.prepend('<div class="prev" style="display:none" data-page="1"><a href="javascript:void(0);" ><i class="far fa-angle-left"></i></a></div>');
          list.append('<div class="next" data-page="2"><a href="javascript:void(0);" ><i class="far fa-angle-right"></i></a></div>');

          list.on('click', '.next', function(){
            var size = list.find('.row > div').length;
            var pages = Math.ceil(size/self._pageSize);

            var page = parseInt($(this).data('page'));
            list.find('.row > div').hide();
            list.find('.row > div').slice(self._pageSize*(page-1), self._pageSize*page).show();

            $(this).data('page', page+1);
            list.find('.prev').data('page', page);
            list.find('.prev').css('display', 'flex');

            if(parseInt($(this).data('page')) > pages) {
              $(this).hide();
            } else {
              $(this).css('display', 'flex');
            }
          });

          list.on('click', '.prev', function(){
            var size = list.find('.row > div').length;
            var pages = Math.ceil(size/self._pageSize);
            var page = parseInt($(this).data('page'));
            if(page == 0){
              $(this).hide();
              return;
            }

            list.find('.row > div').hide();
            list.find('.row > div').slice(self._pageSize*(page-2), self._pageSize*(page-1)).show();

            $(this).data('page', page-1);
            list.find('.next').data('page', page);
            list.find('.next').css('display', 'flex');
            if(parseInt($(this).data('page')) > 1) {
              $(this).css('display', 'flex');
            } else {
              $(this).hide();
            }
          });


        }
      });
      return this;
    },



    _isMobileWidth:function(){
      return $(window).width() < 768;
    }
  });
  return $.brandMenu.js;
});
