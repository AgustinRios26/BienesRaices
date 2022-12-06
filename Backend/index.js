import express from "express"
import csrf from 'csurf'
import cookieParser from 'cookie-parser'
import usuarioRoutes from './routes/usuarioRoutes.js'
import propiedadesRoutes from './routes/propiedadesRoutes.js'
import appRoutes from './routes/appRoutes.js'
import apiRoutes from './routes/apiRoutes.js'
import db from "./config/db.js"

const app = express()

//Habilitar lectura de datos de formularios
app.use(express.urlencoded({extended:true}))

//Habilitar Cookie Parser
app.use(cookieParser())

//Habilitar CSRF (de esta forma lo habilitamos de manera global)
app.use( csrf({cookie: true}) )

//Conexion a la base de datos
try {
    await db.authenticate()
    db.sync()
    console.log('Se ha conectado correctamente a la base de datos')
} catch (error) {
    console.log(error)
}


//Habilitar Pug 
app.set('view engine', 'pug')
app.set('views', './views')

//Carpeta Publica
app.use( express.static('public'))

app.use('/', appRoutes) 
app.use('/auth', usuarioRoutes)
app.use('/', propiedadesRoutes)
app.use('/api', apiRoutes) 
//Puerto

const port = process.env.PORT || 4000;

app.listen(port, ()=>{
    console.log(`El servidor se encuentra en el puerto ${port}`)
})