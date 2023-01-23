define([
  "jquery",
  "jquery/ui",
  "mage/translate"
], function($, ui, $t) {
  "use strict";
  $.widget('megamenu.js', {
    _create: function() {
      var self = this;

      this.clicks = 0;
      this.timer = null;

      this.menu = this.element;
      this.parent = this.menu.parent().parent().parent();
      this.topItems = this.menu.find('li.level-top');

      this.megamenu = $('#megamenu');
      this.itemContent = $('.section-item-content');
      this.level1Size = parseInt(self.megamenu.width());

      this._addNameLinkDom();
      this._menuSlide();

      this._init();

      this._mobileButtonEvent();

      $(window).on('resize', function() {
        self.level1Size = parseInt(self.megamenu.width());
        self.level2Size = self.level1Size*2;
      });
    },
    _init: function() {
      if (!this._isMobile()) {
        this.parent.css('overflow', 'visible');
        this.itemContent.css('transform', 'translate3d(0px, 0px, 0px)');
        if (this.parent.is('.responsive-menu')) this._unmakeMobile();
      } else {
        this._makeMobile();
        this.parent.css('overflow', 'auto');
      }

      $('.nav-sections').find('li.active').removeClass('active');
      this.itemContent.css('transform', 'translate3d(0px, 0px, 0px)');
    },
    _isMobile: function() {
      return $(document).width() <= 768;
    },
    _makeMobile: function() {
      var app = this;
      if (this.parent.is('.responsive-menu')) return false;

      this.parent.addClass('responsive-menu');
      $('body').addClass('responsive-menu');
      //$('.nav-sections-items').mCustomScrollbar({theme:"dark"});

      this._makeMobileShadow();
    },
    _makeMobileShadow: function() {
      if ($('.menu-shadow').size() == 0) {
        $('.page-wrapper').append('<div class="menu-shadow"></div>');
      }

    },
    _mobileButtonEvent: function() {
      var app = this;
      //attached to the document because some elements might be added dynamically to the page, like the close-mobile-menu item
      $(document).on('click', '[data-action=toggle-nav], .close-mobile-menu, .menu-shadow', function() {
        app.parent.toggleClass('open');
        $('.menu-shadow').toggleClass('open');
      });
    },
    _unmakeMobile: function() {
      this.alreadyMobile = false;

      this.parent.removeClass('responsive-menu');
      $('body').removeClass('responsive-menu');
      //$('.nav-sections-items').mCustomScrollbar("disable");
    },
    _addNameLinkDom: function(){
      var closeBtn = '<div class="close-mobile-menu"><i class="fa fa-times close-mobile-button"></i></div>',
          viewAll = $.mage.__('View All');

      this.megamenu.find('.level0.submenu, .container-alpha-filter').prepend('<span class="menu-back-arrow level-0"></span>');
      this.megamenu.find('.level1.submenu').prepend('<span class="menu-back-arrow level-1"></span>');

      this.megamenu.find('.menu-back-arrow.level-0, .menu-back-arrow.level-1').after('<span class="submenu-title"></span>'+closeBtn);
      this.megamenu.find('.level-top').each(function(){
        $(this).find('.first.parent, .first').before('<li class="view-all-span"><a class="view-all" href="">'+ viewAll +'</a></li>');
      });
    },
    _menuSlide: function(){
      var este = $(this),
          self = this;

      $('#megamenu').on('click', 'li.parent a', function(e){
        if( $(window).width() > 768 ) return;

        if( $(this).parent().hasClass('parent') ){
          e.preventDefault();
        }

        if( $(this).parents('#megamenu-wrapper-brands').is('*') ) return;
        if( $(this).hasClass('view-all') ) return;

        var este = $(this),
            categoryName = este.find('span').text(),
            viewAll = este.attr('href'),
            isFirstLevel = este.parent().hasClass('level0');

        self._linkAndName(este, categoryName, viewAll);

        este.parent().addClass('active');

        self.itemContent.css('transform', 'translate3d( '+ - ( isFirstLevel ? self.level1Size : (self.level1Size*2) ) +'px, 0, 0 )' );
      })

      this.megamenu.on('click', '.menu-back-arrow', function(){
        var este = $(this),
            isFirstLevel = este.hasClass('level-0');

        $(this).parents('li').eq(0).removeClass('active');
        self.itemContent.css('transform', 'translate3d( '+ (isFirstLevel ? '0' : -(self.level1Size)) +'px, 0, 0)');
      });
    },
    _linkAndName: function( dom, name, link ){
      dom.parent().find('.submenu-title').text(name);
      dom.parent().find('.view-all').attr('href', link);
    }

  });

  return $.megamenu.js;
});
