(function() {
    const lat = document.querySelector('#lat').value || -31.4170954;
    const lng = document.querySelector('#lng').value || -64.1843949;
    const mapa = L.map('maps').setView([lat, lng ], 15);

    let marker;

    // Utilizar Provider y Geocoder

    const geocodeService = L.esri.Geocoding.geocodeService();


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    //Pin (se agrega y se puede mover y se mueve el mapa tambien)
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    })
    .addTo(mapa)

    //Detectar movimineto del pin
    marker.on('moveend', function(e){
        marker = e.target
        const posicion = marker.getLatLng();
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng))

        // Obtener la informacion de las calles al soltar el pin
        geocodeService.reverse().latlng(posicion, 15).run(function(error, result){
            // console.log(result)
            marker.bindPopup(result.address.LongLabel)
            // Llenar los campos
            document.querySelector('.street').textContent = result?.address?.Address ?? ''
            document.querySelector('#street').value = result?.address?.Address ?? ''
            document.querySelector('#lat').value = result?.latlng?.lat ?? ''
            document.querySelector('#lng').value = result?.latlng?.lng ?? ''
        })


    })

})()