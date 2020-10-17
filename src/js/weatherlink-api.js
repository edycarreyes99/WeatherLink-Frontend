const axios = require("axios");
import {firebaseApp} from "./index";
import {extraerEstaciones} from "./gmaps-api";

export function agregarEstacion(nombre, posicion, mapa, modal) {
    const data = {
        nombre,
        latitud: posicion.lat(),
        longitud: posicion.lng(),
    }
    let config = {
        method: 'post',
        url: 'https://localhost:5001/AgregarEstacion/',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    realizarSolicitud(config, mapa, google, modal);
}

function realizarSolicitud(config, mapa, google, modal) {
    firebaseApp.app().auth().onAuthStateChanged((user) => {
        if (user !== null) {
            user.getIdToken(true).then((token) => {
                config["headers"]['Authorization'] = 'Bearer ' + token
                axios(config)
                    .then(function (response) {
                        console.log(JSON.stringify(response.data));
                        extraerEstaciones(mapa, firebaseApp, axios, google, modal);
                        alert("La estacion ", config["data"]["nombre"], " se ha guardado correctamente.");
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert("Hubo un error al guardar la estacion: ", error);
                    });
            });
        } else {
            console.error("No hay un usuario loggueado");
        }
    });
}
