import express from 'express'
import { category, index, notFound, search } from '../controllers/appController.js'


const router = express.Router()

//Pagina de Inicio 
router.get('/', index)

// Categorias
router.get('/categorias/:id', category)

// 404
router.get('/404', notFound)

//Buscador
router.post('/buscador', search)


export default router