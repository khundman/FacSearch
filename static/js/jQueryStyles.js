$(document).ready(function () {
    var url = document.URL;
    var trail = url.substr(url.lastIndexOf('/') + 1);

    /* applies across pages */
    $('#feedback-button').click(function () {
        $('#feedback-div').show();
        $('html, body').animate({scrollTop: 0}, 'medium');
    });
    $('#feedback-close').click(function () {
        $('#feedback-div').hide();
    });

    try {
        if (trail == 'search') {
            $('#badge').on('autocompleteclose', function () {
            }).change();
            $('#org').on('autocompleteclose', function () {
            }).change();
            $('#grid-view').click(function () {
                $('#results-barchart').hide();
                $('#search-result-container').show();
            });
            $('#chart-view').click(function () {
                $('#search-result-container').hide();
                $('#results-barchart').show();
            });
        }
        if (trail == 'insights') {
            $("#menu-leaflet").click(function () {
                $('#menu-leaflet').toggleClass('slide-leaflet');
                $('.slide-menu-container').toggleClass('slide-menu');
                $(".leaflet-close").toggleClass('visibility');
                $(".leaflet-text").toggleClass('display');
            });
            $('#bottom-button').click(function () {
                $('.org-container').hide();
                $('.fire-container').show();
            });
            $('#org-button').click(function () {
                $('.fire-container').hide();
                $('.org-container').show();
            });
            $('#fire-extinguisher-table').DataTable({
                bLengthChange: false,
                paging: false,
                order: [0, 'Days Since Service']
            });
            $('#org-table').DataTable({
                bLengthChange: false,
                paging: false
            });
            if ($.cookie('noShowWelcome')) {
                $('#content').show();
            }
            else {
                $('#loading').show();
                setTimeout(function () {
                    $('#loading').fadeOut('slow');
                }, 4000);
                setTimeout(function () {
                    $('#content').fadeIn('slow');
                }, 5000);
                $.cookie('noShowWelcome', true, {expires: 1, path: '/'});
            }
        }
        if (trail == 'floorplan') {
            $("#menu-leaflet").click(function () {
                $('#menu-leaflet').toggleClass('slide-leaflet');
                $('.slide-menu-container').toggleClass('slide-menu');
                $(".leaflet-close").toggleClass('visibility');
                $(".leaflet-text").toggleClass('display');
            });
            $("#spaceType").click(function () {
                $('.label').addClass('label-override');
            });
            $("#queryResults").click(function () {
                $('.label').removeClass('label-override');
            });
            $("#occupyingOrg").click(function () {
                $('.label').removeClass('label-override');
            });
            $("#allocatedOrg").click(function () {
                $('.label').removeClass('label-override');
            });
            $("#extinguisherType").click(function () {
                $('.label').removeClass('label-override');
            });
            $("#floorplanDrawing").click(function () {
                $('.label').removeClass('label-override');
            });

            var svgZoom = svgPanZoom("#svg");

            document.getElementById('zoom-in').addEventListener('click', function(ev){
                ev.preventDefault()

                svgZoom.zoomIn()
            });
            document.getElementById('zoom-out').addEventListener('click', function(ev){
                ev.preventDefault()

                svgZoom.zoomOut()
            });
            if ($(window).width() < 960) {
                svgZoom.zoom(0.85)
            }
            if ($(window).width() < 764) {
                svgZoom.zoom(0.8)
            }
            else {
                svgZoom.zoom(0.9)
            }
        }
        else {
            if ($.cookie('noShowWelcome')) {
                $('#content').show();
            }
            else {
                $('#loading').show();
                setTimeout(function () {
                    $('#loading').fadeOut('slow');
                }, 4000);
                setTimeout(function () {
                    $('#content').fadeIn('slow');
                }, 5000);
                $.cookie('noShowWelcome', true, {expires: 1, path: '/'});
            }
        }
    }
    catch (e) {
        console.log(e);
    }
});