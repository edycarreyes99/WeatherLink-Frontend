// Se importan las dependencias y archivos a utilizarse
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

// Variables globales
let usertoken;
let nuevaEstacionModal = "";
let editarEstacionModal = "";

// Se llama al metodo que genera el script de google maps y lo inserta en <head/> del documento
generarScriptParaGMaps(document);

// Se carga el archivo modal para agregar una nueva estacion
fetch('/nueva-estacion-modal.html')
    .then(response => response.text())
    .then(data => {
        nuevaEstacionModal = data;
    });

// Se carga el archivo modal para editar o ver la informacion de una estacion
fetch('/editar-estacion-modal.html')
    .then(response => response.text())
    .then(data => {
        editarEstacionModal = data;
    });

// Se determina si hay algun usuario logueado y se inicializa la variable token con el valor del UToken del usuario actual si lo hay
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

// Se inserta la funcion initMap() que es la que toma como parametro el script de google maps para inicializar los mapas
window.initMap = function () {

    // Se invoca al metodo para inicializar el mapa en la vista y se guarda en una variable local
    const mapa = inicializarMapa(google);

    // Se invoca al metodo que agrega el listener de 'rightclick' en el mapa para añadir una nueva estacion
    agregarEventoDeClickDerecho(mapa, google, nuevaEstacionModal, axios);

    // Se invoca al metodo para agregar el boton sobre el mapa que otorga la ubicacion actual del usuario
    agregarBotonDeCurrentLocation(mapa);

    // Por primera instancia se invoca al metodo que extrae y cara las estaciones en la vista
    extraerEstaciones(mapa, firebaseApp, axios, google, editarEstacionModal, 1);

    localStorage.setItem("ultima-actualizacion-kpi", new Date())

    generarGraficos(usertoken);

    // Verificador para determinar si de sebe consumir la API para actualizar los KPI o no cada 5 minutos
    setInterval(() => {
        let lastDate = new Date(localStorage.getItem("ultima-actualizacion-kpi"))
        if (lastDate.getMinutes() + 5 < new Date().getMinutes()) {
            console.log("Extrayendo estaciones");
            extraerEstaciones(mapa, firebaseApp, axios, google, editarEstacionModal, null);
            localStorage.setItem("ultima-actualizacion-kpi", new Date())
            console.log(localStorage.getItem("ultima-actualizacion"))
        }
    }, 5000);
}

// Metodo para generar los graficos de temperatura y humedad
function generarGraficos(usertoken) {
    firebaseApp.app().auth().onAuthStateChanged((user) => {
        if (user) {
            user.getIdToken(true).then((token) => {
                const config = {
                    method: 'get',
                    url: 'https://localhost:5001/GenerarDatosParaGraficos/',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                };
                axios(config)
                    .then(function (response) {
                        const seriesHumedad = response.data['data']['seriesHumedad'];
                        const seriesTemperatura = response.data['data']['seriesTemperatura'];
                        const categories = response.data['data']['categories']
                        generarGraficoTemperatura(categories, seriesTemperatura);
                        generarGraficoHumedad(categories, seriesHumedad)
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }).catch((error) => {
                usertoken = null;
            });
        } else {
            console.error("Necesita estar logueado para ver este contenido.");
            location.replace('/index.html');
            usertoken = null;
        }
    });
}

// Metodo para generar el grafico de la temperatura
function generarGraficoTemperatura(categories, series) {
    // Se inicializa el grafico para la temperatura
    Highcharts.chart('grafico-temperatura', {
        loading: {
            hideDuration: 100,
            showDuration: 100
        },
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
            categories,
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
                '<td style="padding:0"><b>{point.y:.1f}°C de temperatura.</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        series,
        credits: {
            enabled: false
        }
    });
}

// Metodo para generar el grafico de la humedad
function generarGraficoHumedad(categories, series) {
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
            categories,
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
        tooltip: {
            headerFormat: `<span style="font-size:10px">{point.key}</span><table>`,
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y:.1f}% de humedad.</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true
        },
        series,
        credits: {
            enabled: false
        }

    });
}
