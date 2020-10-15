import 'bootstrap';
import '../scss/styles.scss';
import './gmaps-api'
import {firebaseApp} from './index';

const Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);
const DomParser = require('dom-parser');
const scriptTag = document.createElement('script');
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

scriptTag.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
scriptTag.defer = true;
scriptTag.async = true;
// Se añade el script creado dinamicamente al dashboard.js
document.head.appendChild(scriptTag);

let nuevoMarcador = null, customPopup = null;

firebaseApp.app().auth().onAuthStateChanged((user) => {
    if (user) {
        user.getIdToken(true).then((token) => {
            console.log("Usuario logueado: ", user.email);
        }).catch((error) => {
            console.error("No se pudo obtener el token del usuario", error);
        });
    } else {
        console.error("Necesita estar logueado para ver este contenido.");
        location.replace('/index.html');
    }
});

window.initMap = function () {

    const nicaraguaGeoPoints = {
        lat: 12.865416,
        lng: -85.207229
    }

    const mapa = new google.maps.Map(
        document.getElementById("mapa"), {
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
    );

    google.maps.event.addListener(mapa, "rightclick", function (evento) {
        if (nuevoMarcador !== null) {
            nuevoMarcador.setMap(null);
        }
        nuevoMarcador = new google.maps.Marker({
            map: mapa,
            animation: google.maps.Animation.DROP,
            icon: "../assets/img/icons/ICN_Pin.png",
            name: "Nueva Estacion",
        });

        nuevoMarcador.setPosition(evento.latLng);

        if (customPopup !== null) {
            customPopup.setMap(null);
        }
        customPopup = new CustomPopup(evento.latLng, nuevoMarcador);
        customPopup.setMap(mapa);

        google.maps.event.addListener(nuevoMarcador, "click", function (e) {
            if (customPopup !== null) {
                customPopup.setMap(null);
                customPopup = null;
            }
            customPopup = new CustomPopup(nuevoMarcador.getPosition(), nuevoMarcador);

            customPopup.setMap(mapa);

            google.maps.event.addListener(customPopup, 'closeclick', function () {
                nuevoMarcador.setMap(null);
            });
        });

        google.maps.event.addListener(customPopup, 'closeclick', function () {
            nuevoMarcador.setMap(null);
        });
    });

    addCurrentLocationButton(mapa);

    class CustomPopup extends google.maps.OverlayView {
        constructor(position, marcador) {
            super();
            this.contenido = `<div id="content">
    <div class="modal-title d-flex align-items-center mt-3 mb-2 ml-3 mr-3">
        <img class="nube" src="../assets/img/custom-icons/rain.svg"
             alt="Nube lloviendo logo" width="40">
        <h6 class="mb-0">
            <span class="title-estacion text-dark d-block">Nueva estación </span>
            <span class="desc-estacion text-info font-weight-light d-block">Estacion Climática</span>
        </h6>
        <button class="float-right ml-auto btn btn-light equis-cerrar-modal mt-n4">
            <img src="../assets/img/custom-icons/cross.svg" alt="Equis icono" width="12">
        </button>
    </div>
    <div class="modal-body">
        <form class="d-flex mt-4">
            <div class="form-group d-flex m-0 p-0 align-items-center nombreEstacionFrmCtrl">
                <span class="text-dark mr-2">Nombre</span>
                <input class="form-control" id="staticEmail" placeholder="Nombre estación">
            </div>
            <div class="form-group d-flex m-0 p-0 align-items-center float-right ml-4 mr-3">
                <span class="text-dark mr-2">Longitud</span>
                <input type="number" readonly="readonly" class="form-control latlngInput lngInput" id="inputPassword"
                       placeholder="Longitud" value="${position.lng().toString()}">
            </div>
            <div class="form-group d-flex m-0 p-0 align-items-center float-right">
                <span class="text-dark mr-2">Latitud</span>
                <input type="number" readonly="readonly" class="form-control latlngInput latInput" id="inputUsername"
                       placeholder="Latitud" value="${position.lat().toString()}">
            </div>
        </form>
    </div>
    <div class="modal-footer">
        <div class="mx-auto">
            <button type="button" class="btn btn-danger mr-2 btn-cancelar" data-dismiss="modal" id="cancelar-btn">Cancelar</button>
            <button type="button" class="btn btn-success ml-2 btn-guardar" id="guardar-btn">Guardar</button>
        </div>
    </div>
</div>`;

            this.position = position;
            const div = document.createElement('div');
            div.appendChild(document.createRange().createContextualFragment(this.contenido));
            div.classList.add("popup-bubble");
            // This zero-height div is positioned at the bottom of the bubble.
            const bubbleAnchor = document.createElement("div");
            bubbleAnchor.classList.add("popup-bubble-anchor");
            bubbleAnchor.appendChild(div);
            // This zero-height div is positioned at the bottom of the tip.
            this.containerDiv = document.createElement("div");
            this.containerDiv.classList.add("popup-container");
            this.containerDiv.appendChild(bubbleAnchor);
            this.cancelarBtn = div.getElementsByClassName('btn-cancelar').item(0);
            this.equisCerrarModal = div.getElementsByClassName('equis-cerrar-modal').item(0);
            this.cancelarBtn.onclick = function () {
                div.style.display = 'none';
                marcador.setMap(null);
            }
            this.equisCerrarModal.onclick = function () {
                div.style.display = 'none';
                marcador.setMap(null);
            }

            // Optionally stop clicks, etc., from bubbling up to the map.
            CustomPopup.preventMapHitsAndGesturesFrom(this.containerDiv);
        }

        /** Called when the popup is added to the map. */
        onAdd() {
            this.getPanes().floatPane.appendChild(this.containerDiv);
        }

        /** Called when the popup is removed from the map. */
        onRemove() {
            if (this.containerDiv.parentElement) {
                this.containerDiv.parentElement.removeChild(this.containerDiv);
            }
        }

        /** Called each frame when the popup needs to draw itself. */
        draw() {
            const divPosition = this.getProjection().fromLatLngToDivPixel(
                this.position
            );
            // Hide the popup when it is far out of view.
            const display =
                Math.abs(divPosition.x) < 4000 && Math.abs(divPosition.y) < 4000
                    ? "block"
                    : "none";

            if (display === "block") {
                this.containerDiv.style.left = divPosition.x + "px";
                this.containerDiv.style.top = divPosition.y + "px";
            }

            if (this.containerDiv.style.display !== display) {
                this.containerDiv.style.display = display;
            }
        }
    }
}


// Metodo para agregar el boton de 'My current location'
function addCurrentLocationButton(mapa, marcador) {
    const controlDiv = document.createElement('div');

    const contenedorBoton = document.createElement('button');
    contenedorBoton.style.backgroundColor = '#12ADE6';
    contenedorBoton.style.border = 'none';
    contenedorBoton.style.outline = 'none';
    contenedorBoton.style.width = '40px';
    contenedorBoton.style.height = '40px';
    contenedorBoton.style.borderRadius = '2px';
    contenedorBoton.style.boxShadow = '0 1px 4px rgba(0,0,0,0.3)';
    contenedorBoton.style.cursor = 'pointer';
    contenedorBoton.style.marginRight = '10px';
    contenedorBoton.style.padding = '0px';
    contenedorBoton.title = 'Mi ubicación';
    controlDiv.appendChild(contenedorBoton);

    const iconoBoton = document.createElement('div');
    iconoBoton.style.margin = '5px';
    iconoBoton.style.height = '18px';
    iconoBoton.style.backgroundSize = '40px 40px';
    iconoBoton.style.backgroundPosition = 'center';
    iconoBoton.style.backgroundRepeat = 'no-repeat';
    iconoBoton.id = 'you_location_img';
    contenedorBoton.appendChild(iconoBoton);

    google.maps.event.addListener(mapa, 'dragend', function () {
        $('#you_location_img').css('background-position', 'center');
    });

    contenedorBoton.addEventListener('click', function () {
        navigator.geolocation.getCurrentPosition(function (position) {
            const latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            mapa.setCenter(latlng);
        });
    });

    controlDiv.index = 1;
    mapa.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
}


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
