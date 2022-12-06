import express from 'express'
import {body} from 'express-validator'
import { addImage, admin, create, deleteProperty, edit, save, saveChanges, saveImage, showProperty } from '../controllers/propiedadesController.js'
import middlewareRoutes from '../middleware/middlewareRoutes.js'
import upload from '../middleware/uploadImage.js'
import identifyUser from '../middleware/identifyUser.js'

const router = express.Router()

router.get('/mis-propiedades', middlewareRoutes, admin)
router.get('/propiedades/crear', middlewareRoutes,  create)
router.post('/propiedades/crear', middlewareRoutes, 
    body('title').notEmpty().withMessage('El titulo del Anuncio es Obligatorio') , 
    body('description')
        .notEmpty().withMessage('La descripcion no puede ir vacia')
        .isLength({max: 300}).withMessage('La descripcion es muy extensa') , 
    body('category').isNumeric().withMessage("Seleccione una categoria"),
    body('price').isNumeric().withMessage("Seleccione un rango de precios"),
    body('rooms').isNumeric().withMessage("Seleccione la cantidad de habitaciones"),
    body('parking').isNumeric().withMessage("Seleccione la cantidad de estacionamientos"),
    body('bathroom').isNumeric().withMessage("Seleccione la cantidad de baños"),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    save)
    router.get('/propiedades/agregar-imagen/:id',    middlewareRoutes, addImage)
    router.post('/propiedades/agregar-imagen/:id',
        middlewareRoutes,
        upload.single('image'),
        saveImage
    )

router.get('/propiedades/editar/:id', middlewareRoutes, edit)

router.post('/propiedades/editar/:id', middlewareRoutes, 
    body('title').notEmpty().withMessage('El titulo del Anuncio es Obligatorio') , 
    body('description')
        .notEmpty().withMessage('La descripcion no puede ir vacia')
        .isLength({max: 300}).withMessage('La descripcion es muy extensa') , 
    body('category').isNumeric().withMessage("Seleccione una categoria"),
    body('price').isNumeric().withMessage("Seleccione un rango de precios"),
    body('rooms').isNumeric().withMessage("Seleccione la cantidad de habitaciones"),
    body('parking').isNumeric().withMessage("Seleccione la cantidad de estacionamientos"),
    body('bathroom').isNumeric().withMessage("Seleccione la cantidad de baños"),
    body('lat').notEmpty().withMessage('Ubica la propiedad en el mapa'),
    saveChanges)

router.post('/propiedades/eliminar/:id', middlewareRoutes, deleteProperty)

//Area Publica
router.get('/propiedad/:id', identifyUser , showProperty)




export default router 