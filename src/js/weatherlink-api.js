const axios = require("axios");
import {firebaseApp} from "./index";

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

    realizarSolicitud(config, "agregado");
}

export function actualizarEstacion(id, nuevoNombre) {
    const data = {
        id,
        nombre: nuevoNombre
    }
    let config = {
        method: 'put',
        url: 'https://localhost:5001/ActualizarEstacion/',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    realizarSolicitud(config, "actualizado");
}

export function eliminarEstacion(id, nombre) {
    const data = {
        id,
    };

    let config = {
        method: 'delete',
        url: 'https://localhost:5001/EliminarEstacion/',
        headers: {
            'Content-Type': 'application/json'
        },
        data : data
    };

    realizarSolicitud(config, "eliminado");
}

function realizarSolicitud(config, tipoSolicitud) {
    firebaseApp.app().auth().onAuthStateChanged((user) => {
        if (user !== null) {
            user.getIdToken(true).then((token) => {
                config["headers"]['Authorization'] = 'Bearer ' + token
                axios(config)
                    .then(function (response) {
                        console.log(JSON.stringify(response.data));
                        alert("La estacion " + config["data"]["nombre"] + " se ha " + tipoSolicitud + " correctamente.");
                        location.reload();
                    })
                    .catch(function (error) {
                        console.log(error);
                        alert("Hubo un error al " + tipoSolicitud + " la estacion: ", error);
                    });
            });
        } else {
            console.error("No hay un usuario loggueado.");
        }
    });
}
