import path from 'path'

export default {
    mode: 'development',
    entry:{
        maps:'./src/js/maps.js',
        agregarImagen: './src/js/agregarImagen.js',
        mostrarMapa: './src/js/mostrarMapa.js',
        mapaInicio: './src/js/mapaInicio.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve('public/js')
    }
}