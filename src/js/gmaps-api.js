// Se imoprtan los metodos y dependencias a utilizarse
import {actualizarEstacion, agregarEstacion, eliminarEstacion} from "./weatherlink-api";

// Variables globales
let marcadores = [];
let popup = null;
let nuevoMarcador = null;

// Metodo que genera el script para google maps
export function generarScriptParaGMaps(document) {
    const scriptTag = document.createElement('script');
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    scriptTag.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    scriptTag.defer = true;
    scriptTag.async = true;
    document.head.appendChild(scriptTag);
}

// Metodo que inicializa el mapa en la vista
export function inicializarMapa(google) {

    // GeoPoints fijos para el pais de Nicaragua
    const nicaraguaGeoPoints = {
        lat: 12.865416,
        lng: -85.207229
    }

    // Se ratorna una nueva instancia de mapas
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

// Metodo que inserta el listener para el 'rightclick' en el mapa
export function agregarEventoDeClickDerecho(mapa, google, nuevaEstacionModal, axios) {
    google.maps.event.addListener(mapa, "rightclick", function (evento) {

        // Se determina si hay un marcador existente y se elimina del mapa
        if (nuevoMarcador !== null) {
            nuevoMarcador.setMap(null);
        }

        // Se genera un nuevo marcador
        nuevoMarcador = generarMarcador(mapa, "Nueva estación", google, 1);

        // Se establece la posicion del marcador con las cordenadas del evento 'rightclick'
        nuevoMarcador.setPosition(evento.latLng);

        // Se valida si hay algun otro popup sobre la vista del mapa y se elimina
        if (popup !== null) {
            popup.setMap(null);
        }

        // Se genera un nuevo popup y se muestra en la vista del mapa
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

    // Se implementa el evento 'click' para mostrar la ubicacion actual del usuario en el mapa
    contenedorBoton.addEventListener('click', function () {
        navigator.geolocation.getCurrentPosition(function (position) {
            const latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            mapa.setCenter(latlng);
        });
    });

    // Se establece la vista del boton sobre el mapa
    controlDiv.index = 1;

    // Se establece la posicion del boton a la derecha del mapa
    mapa.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlDiv);
}

// Metodo para generar un nuevo marcador
export function generarMarcador(mapa, nombre, google, animacion) {
    // Se retorna la instancia de un nuevo marcador
    return new google.maps.Marker({
        map: mapa,
        animation: animacion !== null ? google.maps.Animation.DROP : 0,
        icon: "../assets/img/icons/ICN_Pin.png",
        name: nombre,
    });
}

// Metodo que contiene la clase para generar un nuevo Popup
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
            const bubbleAnchor = document.createElement("div");
            bubbleAnchor.classList.add("popup-bubble-anchor");
            bubbleAnchor.appendChild(div);
            this.containerDiv = document.createElement("div");
            this.containerDiv.classList.add("popup-container");
            this.containerDiv.appendChild(bubbleAnchor);
            this.equisCerrarModal = div.getElementsByClassName('equis-cerrar-modal').item(0);

            // Evento para cerrar el popup
            this.equisCerrarModal.onclick = function () {
                div.style.display = 'none';
                bubbleAnchor.style.display = 'none';
                if (estacion === "nueva-estacion") {
                    marcador.setMap(null);
                }
            }

            // Se determina que tipo de llamado se le hizo al popup
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

                // Metodo que se ejecuta cuando se desea guardar una nueva estacion
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

                // Metodo que se ejecuta cuando se selecciona el boton de cancelar la edicion de una estacion
                cancelarEdicionBtn.onclick = function () {
                    actualizarNombreBtn.style.display = 'none';
                    editarEstacionBtn.style.display = 'block';
                    nombreEstacionLabel.style.display = 'block';
                    editarNombreEstacionInput.style.display = 'none';
                    cancelarEdicionBtn.style.display = 'none';
                }

                // Metodo que se ejecuta cuando se desea actualizar el contenido de una estacion
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

                // Metodo que se ejecuta cuando se selecciona el boton para editar una estacion
                editarEstacionBtn.onclick = function () {
                    cancelarEdicionBtn.style.display = 'block';
                    actualizarNombreBtn.style.display = 'block';
                    editarNombreEstacionInput.value = estacion["name"];
                    editarNombreEstacionInput.style.display = 'block';
                    nombreEstacionLabel.style.display = 'none';
                    editarEstacionBtn.style.display = 'none';
                }

                // Metodo que sejecuta cuando se desea inactivar una estacion
                inactivarEstacionBtn.onclick = function () {
                    if (confirm(`¿Esta seguro que desea inactivar la estacion "${estacion['name']}"?. ¡Este cambio no puede deshacerse!`)) {
                        eliminarEstacion(estacion["id"]);
                    }
                }
            }

            CustomPopup.preventMapHitsAndGesturesFrom(this.containerDiv);
        }

        // Este metodo se ejecuta cuando el popup se añade al mapa
        onAdd() {
            this.getPanes().floatPane.appendChild(this.containerDiv);
        }

        // Este metodo se ejecuta cuando el popup es removido del mapa
        onRemove() {
            if (this.containerDiv.parentElement) {
                this.containerDiv.parentElement.removeChild(this.containerDiv);
            }
        }

        // Este metodo se ejecuta cuando el popup actualiza su informacion
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

        // Metodo para generar la fecha con el formato correcto a peticion del cliente
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

    // Se retorna una nueva instancia de la clase CustomPopup
    return new CustomPopup(latLng, nuevoMarcador, estacion, modal, google, modal)
}


// Metodo para extraer las estaciones y actualizar los datos en la vista
export function extraerEstaciones(mapa, firebaseApp, axios, google, editarEstacionModal, animacion) {
    let usertoken;

    // Se verifica si hay un usuario activo
    firebaseApp.app().auth().onAuthStateChanged((user) => {
        if (user) {

            // Se extrae el token del usuario actual para realizar las peticiones al backend
            user.getIdToken(true).then((token) => {

                // Variable que almacena la configuracion de la peticion al servidor backend
                const config = {
                    method: 'get',
                    url: 'https://localhost:5001/Estaciones',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                // Se realiza la peticion al servidor backend
                axios(config)
                    .then(function (response) {

                        // Se determina si la informacion con la que resopndio el servidor posee KPI o no
                        if (response.data["data"].length === 0) {

                            // En caso de que no haya ninguna KPI ingresada en el sistema aun
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

                            // Se recorre la lista antigua de marcadores y se eliminan del mapa
                            $(marcadores).each((index, marcador) => {
                                marcador.setMap(null);
                            });

                            // Se elimina el contenido actual de la vista de la lista de KPI
                            $("#lista-KPI").removeClass("d-flex justify-content-center align-items-center").empty();

                            // Se recorre la lista de KPI devuelta por la peticion al servidor backend
                            $(response.data["data"]).each((index, estacion) => {

                                // Se genera un car por cada KPI
                                $("#lista-KPI").removeClass("d-flex justify-content-center align-items-center").append(
                                    generarEstacionCard(estacion)
                                )

                                // Se genera un marcador por cada KPI y se establece la posicion
                                let marcador = generarMarcador(mapa, estacion["name"], google, animacion)
                                marcador.setPosition(new google.maps.LatLng({
                                    lat: estacion["latitude"],
                                    lng: estacion["longitude"]
                                }));

                                // Se añade cada marcador al mapa
                                marcador.setMap(mapa);

                                // Se agrega un listener a cada marcador para el evento 'click'
                                google.maps.event.addListener(marcador, "click", function (e) {

                                    // Se determina si hay algun popup abierto y se cierra
                                    if (popup !== null) {
                                        popup.setMap(null);
                                        popup = null;
                                    }

                                    // Se determina si hay algun marcador sin objetivo y se elimina del mapa
                                    if (nuevoMarcador !== null) {
                                        nuevoMarcador.setMap(null);
                                    }

                                    // Se genera un nuevo popup y se muestra en la vista del mapa
                                    popup = generarPopup(marcador.getPosition(), marcador, estacion, editarEstacionModal, google, mapa);
                                    popup.setMap(mapa);
                                });

                                // Se agrega un listener al evento 'click' para cada card de KPI
                                $(`#${estacion["id"]}`).click((e) => {

                                    // Se genera una variable con la ubicacion del KPI seleccionado en el mapa
                                    const estacionGeoPoints = {
                                        lat: parseFloat(e.currentTarget.attributes[2].value),
                                        lng: parseFloat(e.currentTarget.attributes[1].value)
                                    }

                                    // Se navega en el mapa hacia el KPI seleccioado
                                    mapa.panTo(estacionGeoPoints);

                                    // Se determina si hay algun popup abierto y se cierra
                                    if (popup !== null) {
                                        popup.setMap(null);
                                        popup = null;
                                    }

                                    // Se determina si hay algun marcador sin objetivo y se elimina del mapa
                                    if (nuevoMarcador !== null) {
                                        nuevoMarcador.setMap(null);
                                    }

                                    // Se genera un nuevo popup y se muestra en la vista
                                    popup = generarPopup(mapa.getCenter(), marcador, estacion, editarEstacionModal, google, mapa);
                                    popup.setMap(mapa);
                                });

                                // Se añade cada marcador al arreglo global de marcadores
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
            // En caso de que no exista un usuario logueado
            console.error("Necesita estar logueado para ver este contenido.");
            location.replace('/index.html');
            usertoken = null;
        }
    });
}

// Metodo que retorna el template para los cards de los KPI
function generarEstacionCard(estacion) {
    return `
<li id="${estacion['id']}" longitud="${estacion['longitude']}" latitud="${estacion['latitude']}">
    <div class="shadow bg-light rounded KPI-Card p-2 mt-3">
        <div class="titulo-dashboard mb-3">
            <h5 class="ml-3 text-dark">Estacion: ${estacion['name']}</h5>
        </div>
        <div class="row">
            <div class="col-6 p-0 m-0 d-flex">
                <div class="ml-3 d-flex justify-content-center align-items-center">
                    <img src="../assets/img/custom-icons/rain.svg" alt="Rain Icon" class="card-rain-icon">
                </div>
                <div class="d-block">
                    <h5 class="text-dark d-block font-weight-bold ml-2 mb-0">${estacion['humedad']}%</h5>
                    <span class="text-dark d-block ml-2">Humedad</span>
                </div>
            </div>
            <div class="col-6 p-0 m-0 d-flex">
                <div class="d-flex justify-content-center align-items-center">
                    <img src="../assets/img/custom-icons/temperature.svg" alt="Temperature Icon" class="card-temperature-icon">
                </div>
                <div class="d-block">
                    <h5 class="text-dark d-block font-weight-bold ml-2 mb-0">${estacion['temperatura']}C°</h5>
                    <span class="text-dark d-block ml-2 text-break">Temperatura</span>
                </div>
            </div>
        </div>
    </div>
</li>
    `;
}
