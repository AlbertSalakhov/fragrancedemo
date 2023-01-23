window.lazyLoad = function() {
  // start as not running
  this.active = false;
  //Gather elements that should be lazyloaded
  this.getLazyElements = function(){
    return [].slice.call(document.querySelectorAll(".lazy"));
  }
  //GET DEVICE TYPE (mobule/desktop/tablet)
  this.getDeviceType = function() {
    let type = 'desktop';

    if(window.outerWidth <= 1024){
      type = 'tablet';
    }

    if(window.outerWidth < 767){
      type = 'mobile';
    }

    return type;
  }
  //Lazy load the element
  this.lazyLoadImage = function(lazyImage) {
    let src = lazyImage.dataset.src;
    let srcset = lazyImage.dataset.srcset;

    if(typeof lazyImage.dataset[this.getDeviceType()+'src'] != 'undefined') {
      src = lazyImage.dataset[this.getDeviceType()+'src'];
    }

    if(typeof lazyImage.dataset[this.getDeviceType()+'src'] != 'undefined') {
      srcset = lazyImage.dataset[this.getDeviceType()+'srcset'];
    }

    if(lazyImage.nodeName == 'IMG'){
      lazyImage.src = src;
      lazyImage.srcset = srcset;
    } else {
      lazyImage.style.backgroundImage = 'url('+src+')';
    }

    lazyImage.classList.remove("lazy");
  }
  //check element visibility
  this.isElementVisible = function(element) {
    return (
        (
          element.getBoundingClientRect().top <= window.innerHeight
          && element.getBoundingClientRect().bottom >= 0
        )
        && getComputedStyle(element).display !== "none");
  }

  //Execute lazyload
  if (this.active === false) {
    this.active = true;
    this.getLazyElements().forEach(function(lazyImage) {
      if (this.isElementVisible(lazyImage)) {

        this.lazyLoadImage(lazyImage);

        //for performance remove events when all elements have been lazyloaded
        if (this.getLazyElements().length === 0) {
          document.removeEventListener("scroll", lazyLoad);
          window.removeEventListener("resize", lazyLoad);
          window.removeEventListener("orientationchange", lazyLoad);
        }
      }
    });

    // at the end mark as not running
    this.active = false;
  }
};
//generate events
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function(){
        window.lazyLoad();
        document.addEventListener("scroll", window.lazyLoad);
        window.addEventListener("resize", window.lazyLoad);
        window.addEventListener("orientationchange", window.lazyLoad);
    }, 500);

    var lazyVideos = [].slice.call(document.querySelectorAll("video.lazy-video"));

    if ("IntersectionObserver" in window && lazyVideos.length > 0) {
        var lazyVideoObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(video) {
                if (video.isIntersecting) {
                    for (var source in video.target.children) {
                        var videoSource = video.target.children[source];
                        if (typeof videoSource.tagName === "string" && videoSource.tagName === "SOURCE") {
                            videoSource.src = videoSource.dataset.src;
                        }
                    }

                    video.target.addEventListener('loadeddata', function () {
                        video.target.classList.remove('mobile-aspect-ratio','desktop-aspect-ratio');
                    })

                    video.target.load();

                    video.target.classList.remove("lazy-video");
                    lazyVideoObserver.unobserve(video.target);
                }
            });
        });

        lazyVideos.forEach(function(lazyVideo) {
            lazyVideoObserver.observe(lazyVideo);
        });
    } else {
        lazyVideos.forEach(function (videoEl) {
            var sourceCollection = videoEl.querySelectorAll('source');

            for (var i = 0; i < sourceCollection.length; i++) {
                if (typeof sourceCollection[i].tagName === "string" && sourceCollection[i].tagName === "SOURCE") {
                    sourceCollection[i].src = sourceCollection[i].dataset.src;
                }
            }

            videoEl.load();

            videoEl.classList.remove("lazy-video");
        })
    }
});
