export function GmapsApi(mapaDiv) {
    const nicaraguaGeoPoints = {
        lat: 12.865416,
        lng: -85.207229
    }

    const mapa = new google.maps.Map(
        mapaDiv, {
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

    google.maps.event.addListener(mapa, "rightclick", function (evento) {
        let marcador = new google.maps.Marker({
            map: mapa,
            animation: google.maps.Animation.DROP,
            icon: "../assets/img/icons/ICN_Pin.png",
            name: "Nueva Estacion",
        });

        marcador.setPosition(evento.latLng);

        let infoWindow = new google.maps.InfoWindow();
        infoWindow.setContent(`
        <div class="modal-title d-flex align-items-center">
            <img class="nube" src="../assets/img/custom-icons/rain.svg"
                 alt="Nube lloviendo logo" width="40">
            <h6 class="mb-0">
                <span class="title-estacion text-dark d-block">Nueva estación </span>
                <span class="desc-estacion text-info font-weight-light d-block">Estacion Climática</span>
            </h6>
        </div>
        <div class="modal-body">
            <form class="d-flex mt-4">
                <div class="form-group d-flex m-0 p-0 align-items-center nombreEstacionFrmCtrl">
                    <span class="text-dark mr-2">Nombre</span>
                    <input class="form-control" id="staticEmail" placeholder="Nombre estación">
                </div>
                <div class="form-group d-flex m-0 p-0 align-items-center float-right ml-auto mr-3">
                    <span class="text-dark mr-2">Longitud</span>
                    <input type="number" readonly="readonly" class="form-control latlngInput" id="inputPassword"
                           placeholder="Longitud">
                </div>
                <div class="form-group d-flex m-0 p-0 align-items-center float-right">
                    <span class="text-dark mr-2">Latitud</span>
                    <input type="number" readonly="readonly" class="form-control latlngInput" id="inputUsername"
                           placeholder="Latitud">
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <div class="mx-auto">
                <button type="button" class="btn btn-danger mr-2" data-dismiss="modal" onclick="infoWindow.close()">Cancelar</button>
                <button type="button" class="btn btn-success ml-2">Guardar</button>
            </div>
        </div>`);
        infoWindow.setOptions({
            minWidth: 800
        })
        infoWindow.open(mapa, marcador);

        google.maps.event.addListener(marcador, "click", function (e) {
            if (infoWindow !== null) {
                infoWindow.close();
                infoWindow = null;
            }
            infoWindow = new google.maps.InfoWindow();
            infoWindow.setContent(`
        <div class="modal-title d-flex align-items-center">
            <img class="nube" src="../assets/img/custom-icons/rain.svg"
                 alt="Nube lloviendo logo" width="40">
            <h6 class="mb-0">
                <span class="title-estacion text-dark d-block">Nueva estación </span>
                <span class="desc-estacion text-info font-weight-light d-block">Estacion Climática</span>
            </h6>
        </div>
        <div class="modal-body">
            <form class="d-flex mt-4">
                <div class="form-group d-flex m-0 p-0 align-items-center nombreEstacionFrmCtrl">
                    <span class="text-dark mr-2">Nombre</span>
                    <input class="form-control" id="staticEmail" placeholder="Nombre estación">
                </div>
                <div class="form-group d-flex m-0 p-0 align-items-center float-right ml-auto mr-3">
                    <span class="text-dark mr-2">Longitud</span>
                    <input type="number" readonly="readonly" class="form-control latlngInput" id="inputPassword"
                           placeholder="Longitud">
                </div>
                <div class="form-group d-flex m-0 p-0 align-items-center float-right">
                    <span class="text-dark mr-2">Latitud</span>
                    <input type="number" readonly="readonly" class="form-control latlngInput" id="inputUsername"
                           placeholder="Latitud">
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <div class="mx-auto">
                <button type="button" class="btn btn-danger mr-2" data-dismiss="modal" onclick="infoWindow.close()">Cancelar</button>
                <button type="button" class="btn btn-success ml-2">Guardar</button>
            </div>
        </div>`);
            infoWindow.setOptions({
                minWidth: 700
            })
            infoWindow.open(mapa, marcador);
            google.maps.event.addListener(infoWindow, 'closeclick', function () {
                marcador.setMap(null);
            });
        });

        google.maps.event.addListener(infoWindow, 'closeclick', function () {
            marcador.setMap(null);
        });
    });

    addCurrentLocationButton(mapa);

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
