let marcadores = [];
let popup = null;
let nuevoMarcador = null;

import {actualizarEstacion, agregarEstacion, eliminarEstacion} from "./weatherlink-api";

export function generarScriptParaGMaps(document) {
    const scriptTag = document.createElement('script');
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    scriptTag.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    scriptTag.defer = true;
    scriptTag.async = true;
    document.head.appendChild(scriptTag);
}

export function inicializarMapa(google) {

    const nicaraguaGeoPoints = {
        lat: 12.865416,
        lng: -85.207229
    }

    return new google.maps.Map(
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
}

export function agregarEventoDeClickDerecho(mapa, google, nuevaEstacionModal, axios) {
    google.maps.event.addListener(mapa, "rightclick", function (evento) {
        if (nuevoMarcador !== null) {
            nuevoMarcador.setMap(null);
        }
        nuevoMarcador = generarMarcador(mapa, "Nueva estación", google, 1);

        nuevoMarcador.setPosition(evento.latLng);

        if (popup !== null) {
            popup.setMap(null);
        }

        popup = generarPopup(evento.latLng, nuevoMarcador, "nueva-estacion", nuevaEstacionModal, google, mapa);
        popup.setMap(mapa);
    });
}

// Metodo para agregar el boton de 'My current location'
export function agregarBotonDeCurrentLocation(mapa) {
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

export function generarMarcador(mapa, nombre, google, animacion) {
    return new google.maps.Marker({
        map: mapa,
        animation: animacion !== null ? google.maps.Animation.DROP : 0,
        icon: "../assets/img/icons/ICN_Pin.png",
        name: nombre,
    });
}

export function generarPopup(latLng, nuevoMarcador, estacion, modal, google, mapa) {
    class CustomPopup extends google.maps.OverlayView {
        constructor(position, marcador, estacion, contenido, google, modal) {
            super();
            this.estacion = estacion;
            this.contenido = contenido;
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
            this.equisCerrarModal = div.getElementsByClassName('equis-cerrar-modal').item(0);
            this.equisCerrarModal.onclick = function () {
                div.style.display = 'none';
                bubbleAnchor.style.display = 'none';
                if (estacion === "nueva-estacion") {
                    marcador.setMap(null);
                }
            }
            if (estacion === "nueva-estacion") {
                this.cancelarBtn = div.getElementsByClassName('btn-cancelar').item(0);
                this.cancelarBtn.onclick = function () {
                    div.style.display = 'none';
                    bubbleAnchor.style.display = 'none';
                    marcador.setMap(null);
                }
                let nombreEstacionInput = div.getElementsByClassName('nombreEstacion').item(0);
                console.log(nombreEstacionInput);
                nombreEstacionInput.value = "";
                this.latitudInput = div.getElementsByClassName('latInput').item(0);
                this.latitudInput.value = position.lat().toString();
                this.longitudInput = div.getElementsByClassName('lngInput').item(0);
                this.longitudInput.value = position.lng().toString();
                this.guardarBtn = div.getElementsByClassName('btn-guardar').item(0);
                this.guardarBtn.onclick = function () {
                    const nombre = nombreEstacionInput.value;
                    if (nombre.trim() === "") {
                        alert("El nombre de la estacion no puede estar en blanco.")
                    } else {
                        agregarEstacion(nombreEstacionInput.value, position, mapa, google, modal);
                    }
                }
            } else {
                let nombreEstacionLabel = div.getElementsByClassName('title-estacion').item(0);
                nombreEstacionLabel.innerHTML = estacion["name"];
                this.humedadLabel = div.getElementsByClassName('title-humedad').item(0);
                this.humedadLabel.innerHTML = estacion['humedad'] + "% de humedad.";
                this.temperaturaLabel = div.getElementsByClassName('title-temperatura').item(0);
                this.temperaturaLabel.innerHTML = estacion["temperatura"] + "°C de temperatura.";
                this.fechaActualizacionLabel = div.getElementsByClassName('title-fecha-modificacion').item(0);
                const date = new Date(estacion["updatedAt"]);
                this.fechaActualizacionLabel.innerHTML = "Actualizado el " + this.generarFecha(date);
                let editarNombreEstacionInput = div.getElementsByClassName('editarNombreEstacionInput').item(0);
                let editarEstacionBtn = div.getElementsByClassName('editar-nombre-estacion-button').item(0);
                let cancelarEdicionBtn = div.getElementsByClassName('cancelar-editar-nombre-estacion-button').item(0);
                let actualizarNombreBtn = div.getElementsByClassName('actualizar-nombre-estacion-button').item(0);
                let inactivarEstacionBtn = div.getElementsByClassName('inactivar-estacion-btn').item(0);
                cancelarEdicionBtn.onclick = function () {
                    actualizarNombreBtn.style.display = 'none';
                    editarEstacionBtn.style.display = 'block';
                    nombreEstacionLabel.style.display = 'block';
                    editarNombreEstacionInput.style.display = 'none';
                    cancelarEdicionBtn.style.display = 'none';
                }
                actualizarNombreBtn.onclick = function () {
                    if (editarNombreEstacionInput.value.trim() === "") {
                        alert("El nombre no puede estar vacio.")
                    } else {
                        if (confirm(`¿Esta seguro que desea editar el nombre de la estacion "${estacion['name']}"?`)) {
                            actualizarEstacion(estacion["id"], editarNombreEstacionInput.value.toString());
                        } else {
                            cancelarEdicionBtn.style.display = 'none';
                            editarEstacionBtn.style.display = 'block';
                            editarNombreEstacionInput.style.display = 'none';
                            nombreEstacionLabel.style.display = 'block';
                            actualizarNombreBtn.style.display = 'none';
                        }
                    }
                }
                cancelarEdicionBtn.style.display = 'none';
                actualizarNombreBtn.style.display = 'none';
                editarNombreEstacionInput.style.display = 'none';
                editarEstacionBtn.onclick = function () {
                    cancelarEdicionBtn.style.display = 'block';
                    actualizarNombreBtn.style.display = 'block';
                    editarNombreEstacionInput.value = estacion["name"];
                    editarNombreEstacionInput.style.display = 'block';
                    nombreEstacionLabel.style.display = 'none';
                    editarEstacionBtn.style.display = 'none';
                }

                inactivarEstacionBtn.onclick = function () {
                    if (confirm(`¿Esta seguro que desea inactivar la estacion "${estacion['name']}"?. ¡Este cambio no puede deshacerse!`)) {
                        eliminarEstacion(estacion["id"]);
                    }
                }
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

        generarFecha(date) {
            const meses = [
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre",
            ];
            let fecha = ""
            let time = "";
            fecha += date.getDate() + " de " + meses[date.getMonth()].substr(0, 3) + " ";
            fecha += "a las "
            if (date.getHours() > 12) {
                time = "pm"
                fecha += date.getHours() - 12;
            } else {
                time = "am"
                fecha += date.getHours();
            }
            if (date.getMinutes() < 10) {
                fecha += ":0" + date.getMinutes()
            } else {
                fecha += ":" + date.getMinutes()
            }
            fecha += " " + time;

            return fecha;
        }
    }

    return new CustomPopup(latLng, nuevoMarcador, estacion, modal, google, modal)
}

export function extraerEstaciones(mapa, firebaseApp, axios, google, editarEstacionModal, animacion) {
    let usertoken;
    firebaseApp.app().auth().onAuthStateChanged((user) => {
        if (user) {
            user.getIdToken(true).then((token) => {
                const config = {
                    method: 'get',
                    url: 'https://localhost:5001/Estaciones',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                axios(config)
                    .then(function (response) {
                        if (response.data["data"].length === 0) {
                            $("#lista-KPI")
                                .empty()
                                .addClass("d-flex justify-content-center align-items-center")
                                .append(
                                    `
                                <span class="text-dark text-center">
                                    Sin estaciones.
                                </span>
                                `
                                )
                        } else {
                            $(marcadores).each((index, marcador) => {
                                marcador.setMap(null);
                            });
                            $("#lista-KPI").removeClass("d-flex justify-content-center align-items-center").empty();
                            $(response.data["data"]).each((index, estacion) => {
                                $("#lista-KPI").removeClass("d-flex justify-content-center align-items-center").append(
                                    generarEstacionCard(estacion)
                                )

                                let marcador = generarMarcador(mapa, estacion["name"], google, animacion)

                                marcador.setPosition(new google.maps.LatLng({
                                    lat: estacion["latitude"],
                                    lng: estacion["longitude"]
                                }));

                                marcador.setMap(mapa);

                                google.maps.event.addListener(marcador, "click", function (e) {
                                    if (popup !== null) {
                                        popup.setMap(null);
                                        popup = null;
                                    }
                                    if (nuevoMarcador !== null) {
                                        nuevoMarcador.setMap(null);
                                    }
                                    popup = generarPopup(marcador.getPosition(), marcador, estacion, editarEstacionModal, google, mapa);

                                    popup.setMap(mapa);
                                });

                                $(`#${estacion["id"]}`).click((e) => {
                                    const estacionGeoPoints = {
                                        lat: parseFloat(e.currentTarget.attributes[2].value),
                                        lng: parseFloat(e.currentTarget.attributes[1].value)
                                    }


                                    mapa.panTo(estacionGeoPoints);

                                    if (popup !== null) {
                                        popup.setMap(null);
                                        popup = null;
                                    }

                                    if (nuevoMarcador !== null) {
                                        nuevoMarcador.setMap(null);
                                    }

                                    popup = generarPopup(mapa.getCenter(), marcador, estacion, editarEstacionModal, google, mapa);

                                    popup.setMap(mapa);
                                });

                                marcadores.push(marcador);
                            });
                        }
                    })
                    .catch(function (error) {
                        alert(error);
                    });
            }).catch((error) => {
                alert("Hubo un error al extraer el token del usuario", error);
                usertoken = null;
            });
        } else {
            console.error("Necesita estar logueado para ver este contenido.");
            location.replace('/index.html');
            usertoken = null;
        }
    });
}

function generarEstacionCard(estacion) {
    return `
    <li id="${estacion['id']}" longitud="${estacion['longitude']}" latitud="${estacion['latitude']}">
                                <div class="shadow bg-light rounded KPI-Card p-2 mt-3">
                                    <div class="titulo-dashboard mb-3"><h5 class="ml-3 text-dark">Estacion: ${estacion['name']}</h5></div>
                                    <div class="row">
                                        <div class="col-6 p-0 m-0 d-flex">
                                            <div class="ml-3 d-flex justify-content-center align-items-center"><img
                                                    src="../assets/img/custom-icons/rain.svg" alt="Rain Icon"
                                                    class="card-rain-icon"></div>
                                            <div class="d-block"><h5 class="text-dark d-block font-weight-bold ml-2 mb-0">
                                                ${estacion['humedad']}%</h5>
                                                <span class="text-dark d-block ml-2">Humedad</span></div>
                                        </div>
                                        <div class="col-6 p-0 m-0 d-flex">
                                            <div class="d-flex justify-content-center align-items-center"><img
                                                    src="../assets/img/custom-icons/temperature.svg" alt="Temperature Icon"
                                                    class="card-temperature-icon"></div>
                                            <div class="d-block"><h5 class="text-dark d-block font-weight-bold ml-2 mb-0">${estacion['temperatura']}
                                                C°</h5>
                                                <span class="text-dark d-block ml-2 text-break">Temperatura</span></div>
                                        </div>
                                    </div>
                                </div>
    </li>
    `;
}
