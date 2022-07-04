/*
* This script make for customizing theme
*/

$(function() {
    /* for search cleaner btn */
    const btnCancel = $("#search-cancel");
    const main = $("#main");
    const resultWrapper = $("#search-result-wrapper");
    const results = $("#search-results");
    const input = $("#search-input");
    const hints = $("#search-hints");
    const cleaner = $("#search-cleaner");

    const scrollBlocker = (function () {
        let offset = 0;

        return {
            block() {
            offset = window.scrollY;
            $("html,body").scrollTop(0);
            },
            release() {
            $("html,body").scrollTop(offset);
            },
            getOffset() {
            return offset;
            }
        };
    }());

    function isMobileView() {
        return btnCancel.hasClass("loaded");
    }
  
    input.on("input", () => {
      if (input.val() === "") {
        if (!isMobileView()) cleaner.removeClass("visible");
      } else {
        if (!isMobileView()) cleaner.addClass("visible");
        
        scrollBlocker.block();
        resultWrapper.removeClass("unloaded");
        main.addClass("unloaded");
      }
    });

    input.on("focus", () => {
      if (!isMobileView()) cleaner.addClass("visible");
    });

    let blur_click = false; // blur 이벤트가 불렸을 때, cleaner을 클릭한 경우를 대비한 flag

    input.on("blur", () => {
      if (!blur_click) {
        if (!isMobileView()) cleaner.removeClass("visible");
      }
    });

    cleaner.on("click", () => {
      blur_click = true;

      results.empty();
      
      if (hints.hasClass("unloaded")) {
        hints.removeClass("unloaded");
      }

      resultWrapper.addClass("unloaded");
      main.removeClass("unloaded");

      // now the release method must be called after $(#main) display
      scrollBlocker.release();

      input.val("");

      document.getElementById("search-input").value = "";
      document.getElementById("search-input").focus();
      cleaner.removeClass("visible");
    });

    /* for go-to-bottom btn */
    $(window).scroll(() => {
      if ($(this).scrollTop() > 50 &&
        $("#sidebar-trigger").css("display") === "none") {
        $("#go-to-bottom").fadeIn();
      } else {
        $("#go-to-bottom").fadeOut();
      }
    });
  
    $("#go-to-bottom").click(() => {
      $("body,html").animate({
        scrollTop: ($("footer").offset().top)
      }, 800);
      return false;
    });

    /* for mobile search trigger btn */
    const btnSearchTrigger = $("#search-trigger");
    const topbarTitleWrapper = $("#topbar-title-wrapper");
    const mbtnCancel = $("#search-cancel");

    btnSearchTrigger.click(function() {
      topbarTitleWrapper.addClass("unloaded");
    });

    mbtnCancel.click(function() {
      topbarTitleWrapper.removeClass("unloaded");
    });

    /* for pageview */
    if (matchMedia("screen and (min-width: 850px) and (max-width: 1199px)").matches) { // 850이상 1200 미만
      $(".sidebar-pageview").removeClass("flex-wrap");
      $(".sidebar-pageview").addClass("flex-column");
    }

    const body = document.getElementsByTagName("body")[0];

    window.onresize = function(event) {
      const innerWidth = window.innerWidth;

      if(innerWidth >= "1200") {
        $(".sidebar-pageview").removeClass("flex-column");
        $(".sidebar-pageview").addClass("flex-wrap");
      } else {
        if(innerWidth >= "850") {
          $(".sidebar-pageview").removeClass("flex-wrap");
          $(".sidebar-pageview").addClass("flex-column");
        } else {
          $(".sidebar-pageview").removeClass("flex-column");
          $(".sidebar-pageview").addClass("flex-wrap");
        }
      }
    }
  });
  