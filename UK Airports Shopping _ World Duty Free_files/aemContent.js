var displayNoneClass = "d-none";

function makeAjaxCallForCss(aemCssLink, $jqu) {
    if (!aemCssLink || window.isCssRequestStarted) {
        return;
    }

    try {
        $jqu.ajax({
            beforeSend: function () {
                window.isCssRequestStarted = true;
            },
            url: aemCssLink,
            crossDomain: true,
            type: 'GET',
            error: function (e) {
                console.error('No css is loaded');
                console.error(e);
            },
            success: function (data) {
                try {
                    var aemCssLinks = Array.from(data.matchAll(/href="([^"]*)"/gm)).map(function (hrefArr) {
                        return hrefArr[1];
                    });

                    var howManyAemCssStyleSheetsShouldBeloaded = aemCssLinks.length;

                    window.howManyAemCssStyleSheetsCurrentlyloaded = 0;

                    aemCssLinks.forEach(function (cssUrl) {
                        var link = document.createElement('link');
                        link.type = 'text/css';
                        link.rel = 'stylesheet';
                        link.onload = function () {
                            ++window.howManyAemCssStyleSheetsCurrentlyloaded;

                            if (window.howManyAemCssStyleSheetsCurrentlyloaded === howManyAemCssStyleSheetsShouldBeloaded) {
                                window.aemCssLoadingIsFinished = true;

                                $jqu("body").trigger("cssIsLoadedEvent");
                            }
                        };
                        link.href = cssUrl;

                        $jqu(document.head).append(link);
                    })
                } catch (e) {
                    console.error('No css is loaded');
                    console.error(e);
                }
            }
        })
    } catch (e) {
        console.error('No css is loaded');
        console.error(e);
    }
}

function makeAjaxCall(aemContentUrl, contentContainerSelector, $jqu) {
    if (!aemContentUrl) {
        _hideContentContainer(contentContainerSelector, $jqu);

        return false;
    }

    try {
        $jqu.ajax({
            beforeSend: function () {
                _startLoading(contentContainerSelector, $jqu);
            },
            url: aemContentUrl,
            crossDomain: true,
            type: 'GET',
            timeout: 30000,
            error: function () {
                _stopLoading(contentContainerSelector, $jqu);
                _hideContentContainer(contentContainerSelector, $jqu);
            },
            success: function (data) {
                try {
                    var $jqudivWrapperDomEl = $jqu('<div>');

                    $jqudivWrapperDomEl.html(data);

                    if (window.aemCssLoadingIsFinished) {
                        appendAemElemToDom($jqudivWrapperDomEl, contentContainerSelector, $jqu)
                    } else {
                        $jqu('body').on('cssIsLoadedEvent', function () {
                            appendAemElemToDom($jqudivWrapperDomEl, contentContainerSelector, $jqu)
                        })
                    }
                } catch (e) {
                    console.error(e);
                    _hideContentContainer(contentContainerSelector, $jqu);
                }
            }
        })
    } catch (e) {
        _stopLoading(contentContainerSelector, $jqu);
        _hideContentContainer(contentContainerSelector, $jqu);
    }
}

function _hideContentContainer(contentContainerSelector, $jqu) {
    $jqu(contentContainerSelector).addClass(displayNoneClass);
}

function _startLoading(contentContainerSelector, $jqu) {
    $jqu(contentContainerSelector).addClass('-loading');
}

function _stopLoading(contentContainerSelector, $jqu) {
    $jqu(contentContainerSelector).removeClass('-loading');
    $jqu(contentContainerSelector).addClass('-loaded');
}

function appendAemElemToDom($jqudivWrapperDomEl, contentContainerSelector, $jqu) {
    _stopLoading(contentContainerSelector, $jqu);

    $jqu(contentContainerSelector).append($jqudivWrapperDomEl);

    if ($jqu('#hero-rail-carousel').length > 0) {
        $jqu('body').trigger('initHeroRailCarousel');
    }

    if ($jqu("#sub-category-slider").length > 0) {
        $jqu('body').trigger('initSubCategoryCarousel');
    }
}

function AEMadditionalEvents($jqu, Swiper) {
    window.AEMadditionalEventsInited = true;

    $jqu('body').on('click', '.cmp-accordion__button', function () {
        $jqu(this).closest('.cmp-accordion__item').find('.cmp-accordion__panel').toggleClass('cmp-accordion__panel--hidden');

        $jqu(this).toggleClass('cmp-accordion__button--expanded');
    });

    $jqu('body').one('initHeroRailCarousel', function () {
        try {
            $jqu('.js-slider-embedded').removeClass('d-none');

            $jqu( $jqu('.js-slider-embedded').detach()).appendTo( $jqu('#hero-rail-carousel'));

            new Swiper(".js-slider-embedded.products-swiper", {
                autoplay: false,
                navigation: {
                    nextEl: ".js-slider-embedded .swiper-button-next",
                    prevEl: ".js-slider-embedded .swiper-button-prev",
                },
                slidesPerView: 2,
                slidesPerGroup: 1,
                spaceBetween: 25,
                breakpoints: {
                    768: {
                        slidesPerView: 1.5,
                        longSwipesMs: 100,
                    },
                },
            });
        } catch (e) {
            console.error('hero carousel error');
            console.error(e);
        }
    });

    $jqu('body').one('initSubCategoryCarousel', function () {
        try {
            var subCategoryCarouselWrapper =  $jqu('#sub-category-slider').addClass('swiper js-subcategory-swiper swiper-container').children('.aem-Grid').get(0);

            $jqu('.js-subcategory-swiper').append('<div class="swiper-pagination"></div>');

            $jqu(subCategoryCarouselWrapper).addClass('swiper-wrapper');

            var sliderItemsQty =  $jqu(subCategoryCarouselWrapper).find('.container-sub-category-entry').length;

            $jqu('.js-subcategory-swiper').addClass('js-slides-qty-' + sliderItemsQty);

            $jqu(subCategoryCarouselWrapper).find('.container-sub-category-entry').addClass('swiper-slide');

            new Swiper(".js-subcategory-swiper", {
                autoplay: false,
                slidesPerView: 4,
                slidesPerGroup: 1,
                pagination: {
                    el: ".js-subcategory-swiper .swiper-pagination",
                    bullets: true,
                    clickable: true,
                    draggable: true,
                },
                spaceBetween: 30,
                breakpoints: {
                    768: {
                        slidesPerView: 1.5,
                        longSwipesMs: 100,
                    },
                },
            });
        } catch (e) {
            console.error("subCategory Carousel error");
            console.error(e)
        }
    });

    if($jqu(".cms-privacy-policy").length>0){
        $jqu(".cms-privacy-policy").addClass('-withAemContent');
    }
}

window.makeAjaxCallForCss = makeAjaxCallForCss;
window.makeAjaxCall = makeAjaxCall;
window.AEMadditionalEvents = AEMadditionalEvents;
