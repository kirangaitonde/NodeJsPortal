//jQuery to collapse the navbar on scroll
/*
$(window).scroll(function () {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
});*/

//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    $('a.page-scroll').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});


// jquery to fade in and out bottom navbar
(function ($) {
    $(document).ready(function () {
        
        // hide .navbar first
        $(".navbar-login").hide();
        
        // fade in .navbar
        $(function () {
            $(window).scroll(function () {
                
                // set distance user needs to scroll before we start fadeIn
                if ($(this).scrollTop() > 400 && $(this).scrollTop() < 1500) {
                   // $('.navbar-login').fadein();
                    $('.navbar-login').slideDown(100);    
                } else {
                   // $('.navbar-login').fadeOut();
                    $('.navbar-login').slideUp(100);
                }
            });
        });

        /* $(function () {
            $(window).scroll(function () {
                
                // set distance user needs to scroll before we start fadeIn
                if ($(this).scrollTop() > 400) {
                    $('.navbar-login').addClass("bottom-nav-collapse");
                } else {
                    $('.navbar-login').removeClass("bottom-nav-collapse");
                }
            });
        });*/


        
        //
       /* $(window).scroll(function () {
            if ($(".navbar-login").offset().top > 50) {
                $(".navbar-fixed-bottom").addClass("bottom-nav-collapse");
            } else {
                $(".navbar-fixed-bottom").removeClass("bottom-nav-collapse");
            }
        });*/

    });
}(jQuery));