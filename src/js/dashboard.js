import 'bootstrap';
import '../scss/styles.scss';
import {
    agregarBotonDeCurrentLocation,
    agregarEventoDeClickDerecho,
    extraerEstaciones,
    generarScriptParaGMaps,
    inicializarMapa
} from './gmaps-api';
import {firebaseApp} from './index';

const Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);
const axios = require('axios');

let usertoken;

let nuevaEstacionModal = "";
let editarEstacionModal = "";

generarScriptParaGMaps(document);

fetch('/nueva-estacion-modal.html')
    .then(response => response.text())
    .then(data => {
        nuevaEstacionModal = data;
    });

fetch('/editar-estacion-modal.html')
    .then(response => response.text())
    .then(data => {
        editarEstacionModal = data;
    });

firebaseApp.app().auth().onAuthStateChanged((user) => {
    if (user) {
        user.getIdToken(true).then((token) => {
            console.log("Usuario logueado: ", user.email, " y el token es: ", token);
            usertoken = token;
        }).catch((error) => {
            usertoken = null;
        });
    } else {
        console.error("Necesita estar logueado para ver este contenido.");
        location.replace('/index.html');
        usertoken = null;
    }
});

window.initMap = function () {

    const mapa = inicializarMapa(google);

    agregarEventoDeClickDerecho(mapa, google, nuevaEstacionModal);

    agregarBotonDeCurrentLocation(mapa);

    extraerEstaciones(mapa, firebaseApp, axios, google, editarEstacionModal);
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
    series: [
        {
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
        }
    ],
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
