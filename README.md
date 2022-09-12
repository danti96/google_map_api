### Api De Google Map Con Javascript

Proyecto desarrollado con javascript, html y css utilizando el sevicio de la api de Google Maps. Se desarrollo un buscador de "Credit Union" restringido a la región de Estados Unidos utilizando los codigos postales.
### Lectura

* [Cloud setup](https://developers.google.com/maps/documentation/javascript/cloud-setup?hl=en)
* [Adding a Google Map with a Marker to Your Website](https://developers.google.com/maps/documentation/javascript/adding-a-google-map?hl=en)
* [Places Library](https://developers.google.com/maps/documentation/javascript/places?hl=en)
* [Place Search](https://developers.google.com/maps/documentation/javascript/examples/place-search?hl=en)
* [Geocoding Service](https://developers.google.com/maps/documentation/javascript/geocoding?hl=en)
* [Code Samples](https://developers.google.com/maps/documentation/javascript/examples)


### Variables de configuración

        SEARCH_CODE_DEFAULT = "60618"  // Código Postal que estará por defecto.
        SEARCH_NAME = ["Credit union"];  // Lo que se está buscando
        SEARCH_RADIUS = "10000";          // Búsqueda en un radio de 50000 metros
        SEARCH_TYPE = ["Credit union"];        // Tipo de búsqueda
        REGION = "us";                 // Región de la búsqueda

### Nota:
> Agregar su clave de API de google map en el archivo de html reemplazando `<APIKEY>`

    <script
      src="https://maps.googleapis.com/maps/api/js?key=<APIKEY>&callback=initMap&region=US&libraries=places,geometry&v=weekly"
      defer
    ></script>
