  // Crear el mapa
  const map = L.map('map').setView([-33.027, -52.811], 7);

  // Capa base debajo del swipe

  const baselayer= L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'jpg'
  }).addTo(map)

  //const ideuy = L.tileLayer.wms("https://mapas.ide.uy/geoserver-raster/ortofotos/ows?", {
    //layers: "ORTOFOTOS_2019",
   // format: 'image/jpeg',
    //transparent: true,
    //version: '1.3.0',
    //attribution: "IDE-URUGUAY"
//}).addTo(map);

  // Capa superior recortada con swipe (1996)
  const topLayer = L.tileLayer.wms("https://mapas.ide.uy/geoserver-raster/ortofotos/ows?", {
    layers: "ortofoto_1966",
    format: 'image/jpeg',
    transparent: true,
    version: '1.3.0',
    attribution: "IDE-URUGUAY"
  }).addTo(map);

  topLayer.on('load', () => {
    const container = topLayer.getContainer();
    container.style.pointerEvents = 'none'; // para permitir clics debajo
    clip(); // aplicar recorte inicial
  });

  // Función que recorta la capa superior
  function clip() {
    const range = document.getElementById('slider');
    const container = topLayer.getContainer();
    const nw = map.containerPointToLayerPoint([0, 0]);
    const se = map.containerPointToLayerPoint(map.getSize());
    const clipX = nw.x + (se.x - nw.x) * range.value;
    container.style.clip = `rect(${nw.y}px, ${clipX}px, ${se.y}px, ${nw.x}px)`;
  }

  // Eventos de movimiento del deslizador
  document.getElementById('slider').addEventListener('input', clip);
  map.on('move zoom resize', clip);

  // === FUNCIONALIDAD DE AÑADIR PUNTO ===
  let modoAgregarPunto = false;

  document.getElementById("btn-agregar-punto").addEventListener("click", function () {
    modoAgregarPunto = !modoAgregarPunto;
    this.textContent = modoAgregarPunto ? "Haga clic en el mapa" : "Añadir Punto";
    this.style.backgroundColor = modoAgregarPunto ? "lightgreen" : "lightblue";
  });

  map.on("click", function (e) {
    if (modoAgregarPunto) {
      addMarker(e);
      modoAgregarPunto = false;
      const boton = document.getElementById("btn-agregar-punto");
      boton.textContent = "Añadir Punto";
      boton.style.backgroundColor = "lightblue";
    }
  });

  function addMarker(e) {
    const markerPlace = document.querySelector(".marker-position");
    markerPlace.textContent = `Coordenadas del punto: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;

    const marker = L.marker(e.latlng, { draggable: true })
      .addTo(map)
      .bindPopup('<button type="button" class="remove">🗑 Eliminar marcador</button>')
      .openPopup();

    marker.on("popupopen", function () {
      const btn = document.querySelector(".remove");
      if (btn) {
        btn.addEventListener("click", function () {
          map.removeLayer(marker);
          markerPlace.textContent = "Marcador eliminado";
        });
      }
    });

    marker.on("dragend", function () {
      const newPos = marker.getLatLng();
      markerPlace.textContent = `Nueva posición: ${newPos.lat.toFixed(5)}, ${newPos.lng.toFixed(5)}`;
    });
  }
