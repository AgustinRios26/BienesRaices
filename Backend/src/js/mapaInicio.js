(function () {

    const lat = -31.4170954;
    const lng = -64.1843949;
    const mapa = L.map('mapa-inicio').setView([lat, lng ], 15);

    let markers = new L.FeatureGroup().addTo(mapa)

    let properties = []

    const categoriesSelect = document.querySelector('#categories')
    const pricesSelect = document.querySelector('#prices')

    // Filtros

    const filters = {
        category: '',
        price: ''
    }


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // Filtrado de categorias y precio

    categoriesSelect.addEventListener('change', e => {
        // Con el + lo transformamos en un numero y no es un string
        filters.category = +e.target.value
        filterProperties()
    })
    pricesSelect.addEventListener('change', e => {
        // Con el + lo transformamos en un numero y no es un string
        filters.price = +e.target.value
        filterProperties()
    })

    const getProperties = async() => {
        try {
            const url = '/api/propiedades'
            const response = await fetch(url)
            properties = await response.json()
            showProperties(properties)

        } catch (error) {
            console.log(error)
        }
    }

    const showProperties = properties => {
        // Limpiar los markers previos para hacer el filtrado 
        markers.clearLayers()

        properties.forEach(property => {
            //Agregar los pines
            const marker = new L.marker([property?.lat, property?.lng], {
                autoPan: true
            })
            .addTo(mapa)
            .bindPopup(`
            <p class="text-indigo-600 font-bold" >${property?.category?.name}</p> 
            <h1 class="text-xl font-extrabold uppercase my-3">${property?.title}</h1>
            <img src="uploads/${property?.image}" alt="imagen de la propiedad ${property?.title}" > 
            <p class="text-gray-600 font-bold" >${property?.price?.name}</p> 
            <a href="/propiedad/${property?.id}" class="bg-indigo-600 p-2 text-center font-bold uppercase" >Ver Propiedad</a>
            
            `)


            markers.addLayer(marker)
        })
    }

    const filterProperties = () => {
        const result = properties.filter(filterCategory).filter(filterPrice)
        console.log(result)
    }

    const filterCategory = property => filters.category ? property.categoryId === filters.category : property

    const filterPrice = property => filters.price ? property.priceId === filters.price : property

    

    getProperties()

})()