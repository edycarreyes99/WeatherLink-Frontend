import './index'

var Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);
const scriptTag = document.createElement('script');
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

scriptTag.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
scriptTag.defer = true;

// Se añade la funcion callback para inicializar el GMap
window.initMap = function () {
    const nicaraguaGeoPoints = {
        lat: 12.865416,
        lng: -85.207229
    }

    let map = new google.maps.Map(
        document.getElementById('mapa'),
        {
            center: nicaraguaGeoPoints,
            zoom: 8,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            mapTypeControl: true,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                position: google.maps.ControlPosition.TOP_RIGHT,
            },
            motionTrackingControl: true,
            scaleControl: true,
        }
    )

    let marker = new google.maps.Marker({
        map: map,
        animation: google.maps.Animation.DROP,
        icon: "../assets/img/customPin.png",
        name: "Nueva Estacion"
    });

    addCurrentLocationButton(map, marker);

    let rightClickEvent = google.maps.event.addListener(map, "rightclick", function (event) {
        map.setCenter(event.latLng);
        marker.setPosition(event.latLng);
        infowindow.setContent("Latitude: " + event.latLng.lat() +
            "<br>" + "Longitude: " + event.latLng.lng());
        infowindow.open(map, marker);
    });

};


// Se inicializa el grafico para la temperatura
Highcharts.chart('grafico-temperatura', {
    chart: {
        type: 'column',
    },
    exporting: {
        enabled: false
    },
    title: {
        text: 'Pronóstico de Temperatura °C',
        align: 'left',
        style: {
            color: '#40B8F0'
        }
    },
    yAxis: {
        min: 0,
        max: 40,
        title: ""
    },
    xAxis: {
        categories: [
            '8 Oct',
            '9 Oct',
            '10 Oct',
            '11 Oct',
            '12 Oct'
        ],
        crosshair: true
    },
    legend: {
        layout: "horizontal",
        align: "right",
        verticalAlign: "top",
        squareSymbol: true,
        symbolRadius: 0,
    },
    tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
    },
    series: [{
        name: 'Estacion 1',
        data: [49.9, 71.5, 106.4, 129.2, 144.0],
        marker: {symbol: 'square', radius: 12}
    }, {
        name: 'Estacion 2',
        data: [83.6, 78.8, 98.5, 93.4, 106.0],
        marker: {symbol: 'square', radius: 12}
    }, {
        name: 'Estacion 3',
        data: [48.9, 38.8, 39.3, 41.4, 47.0],
        marker: {symbol: 'square', radius: 12}
    }, {
        name: 'Estacion 4',
        data: [42.4, 33.2, 34.5, 39.7, 52.6],
        marker: {symbol: 'square', radius: 12}
    }, {
        name: 'Estacion 5',
        data: [42.4, 33.2, 34.5, 39.7, 52.6],
        marker: {symbol: 'square', radius: 12}
    }],
    credits: {
        enabled: false
    }
});

// Se inicializa el grafico para la humedad
Highcharts.chart('grafico-humedad', {

    title: {
        text: 'Pronóstico de Humedad %',
        align: 'left',
        style: {
            color: '#40B8F0'
        }
    },
    exporting: {
        enabled: false
    },
    chart: {
        events: {
            load: function () {
                $(".highcharts-legend-item path").attr('stroke-width', 10);
            },
            redraw: function () {
                $(".highcharts-legend-item path").attr('stroke-width', 10);
            }
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: ''
        },
        alternateGridColor: '#EAF6FA'
    },
    xAxis: {
        categories: [
            '8 Oct',
            '9 Oct',
            '10 Oct',
            '11 Oct',
            '12 Oct'
        ],
        crosshair: true
    },
    legend: {
        layout: "horizontal",
        align: "right",
        verticalAlign: "top",
        squareSymbol: true,
    },
    plotOptions: {
        series: {
            marker: {
                enabled: false
            }
        }
    },
    series: [
        {
            name: 'Estacion 1',
            data: [20, 30, 70, 80, 97031]
        },
        {
            name: 'Estacion 2',
            data: [24916, 24064, 29742, 29851, 32490]
        },
        {
            name: 'Estacion 3',
            data: [11744, 17722, 16005, 19771, 20185]
        },
        {
            name: 'Estacion 4',
            data: [null, null, 7988, 12169, 15112]
        },
        {
            name: 'Estacion 5',
            data: [12908, 5948, 8105, 11248, 8989]
        },
    ],
    credits: {
        enabled: false
    }

});

// Se añade el script creado dinamicamente al dashboard.js
document.head.appendChild(scriptTag);

// Metodo para agregar el boton de 'My current location'
function addCurrentLocationButton(map, marker) {
    var controlDiv = document.createElement('div');

    var firstChild = document.createElement('button');
    firstChild.style.backgroundColor = '#009DEB';
    firstChild.style.border = 'none';
    firstChild.style.outline = 'none';
    firstChild.style.width = '40px';
    firstChild.style.height = '40px';
    firstChild.style.borderRadius = '2px';
    firstChild.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    firstChild.style.cursor = 'pointer';
    firstChild.style.marginRight = '10px';
    firstChild.style.padding = '0px';
    firstChild.title = 'Mi ubicación';
    controlDiv.appendChild(firstChild);

    var secondChild = document.createElement('div');
    secondChild.style.margin = '5px';
    secondChild.style.height = '18px';
    secondChild.style.backgroundSize = '18px 18px';
    secondChild.style.backgroundPosition = 'center';
    secondChild.style.backgroundRepeat = 'no-repeat';
    secondChild.id = 'you_location_img';
    firstChild.appendChild(secondChild);

    google.maps.event.addListener(map, 'dragend', function () {
        $('#you_location_img').css('background-position', 'center');
    });

    firstChild.addEventListener('click', function () {
        var imgX = '0';
        var animationInterval = setInterval(function () {
            if (imgX === '-18') imgX = '0';
            else imgX = '-18';
            $('#you_location_img').css('background-position', imgX + 'center');
        }, 500);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                marker.setPosition(latlng);
                map.setCenter(latlng);
                clearInterval(animationInterval);
                $('#you_location_img').css('background-position', '-144px 0px');
            });
        } else {
            clearInterval(animationInterval);
            $('#you_location_img').css('background-position', '0px 0px');
        }
    });

    controlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
}
