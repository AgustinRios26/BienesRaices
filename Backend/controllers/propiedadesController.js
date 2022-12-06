import {unlink} from 'node:fs/promises'
import { validationResult } from 'express-validator'
import {Price, Category, Property} from '../models/index.js'

const admin = async (req, res) => {

    // Leer QueryString

    const {pagina: paginaActual} = req.query

    const exp = /^[1-9]$/

    if(!exp.test(paginaActual)){
        return res.redirect('/mis-propiedades?pagina=1')
    }
    
    try {
        const { id } = req.user

    // Limites y Offset para el paginador

    const limit = 2
    const offset = ((paginaActual * limit) - limit)


    const [properties, total] = await Promise.all([
        Property.findAll({
            limit,
            offset,
            where: {
                userId: id
            },
            include: [
                {model: Category, as:'category'},
                {model: Price, as:'price'}
            ]
        }),
        Property.count({
            where: {
                userId: id
            }
        })
    ])

    res.render('propiedades/admin',{
        pagina: 'Mis Propiedades',
        csrfToken: req.csrfToken(),
        properties,
        paginas: Math.ceil(total / limit),
        paginaActual: Number(paginaActual),
        total,
        offset,
        limit
    })

    } catch (error) {
        console.log(error)
    }

    
}

const create = async (req,res) => {
    //Consultar Modelo de Precio y Categorias

    const [categories, prices] = await Promise.all([
        Category.findAll(),
        Price.findAll()
    ])

    res.render('propiedades/crear',{
        pagina: 'Crear Propiedad',
        csrfToken: req.csrfToken(),
        categories,
        prices,
        data: {}
    })
}

const save = async (req, res)=> {
    // Validacion
    let result = validationResult(req)
    if(!result.isEmpty()){
        // Consultar modelo de precio y categoria
        const [categories, prices] = await Promise.all([
            Category.findAll(),
            Price.findAll()
        ])

        return res.render('propiedades/crear',{
            pagina: 'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categories,
            prices,
            errors: result.array(),
            data: req.body
        })
    }

    const {title, description, rooms, parking, bathroom, street, lat, lng, price: priceId, category: categoryId } = req.body
    
    const {id: userId} = req.user

    //Crear un registro 
    try {
        const propertySaved = await Property.create({
            title,
            description,
            rooms,
            parking,
            bathroom,
            street,
            lat,
            lng,
            priceId,
            categoryId,
            userId,
            image: ''

        })

        const {id} = propertySaved

        res.redirect(`propiedades/agregar-imagen/${id}`)


    } catch (error) {
        console.log(error)
    }


}

const addImage = async (req, res) => {

    const {id} = req.params

    // Validar que la propiedad exista 
    const property = await Property.findByPk(id)

    if(!property) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad no este publicada
    if (property.published){
        return res.redirect('/mis-propiedades')
    }
    
    // Validar que la propiedad pertenece a quien visita esta pagina
    
    if (req.user.id.toString() !== property.userId.toString() ){
        return res.redirect('/mis-propiedades')
    }

    res.render('propiedades/agregar-imagen' , {
        pagina: `Agregar Imagen ${property.title}`,
        csrfToken: req.csrfToken(),
        property

    })
}

const saveImage = async (req, res, next) => {
    const {id} = req.params

    // Validar que la propiedad exista 
    const property = await Property.findByPk(id)

    if(!property) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad no este publicada
    if (property.published){
        return res.redirect('/mis-propiedades')
    }
    
    // Validar que la propiedad pertenece a quien visita esta pagina
    
    if (req.user.id.toString() !== property.userId.toString() ){
        return res.redirect('/mis-propiedades')
    }

    try {
        // console.log(req.file)

        // Almacenar la imagen y publicar propiedad
        property.image = req.file.filename
        property.published = 1

        await property.save()

        next()

    } catch (error) {
        console.log(error)
    }


}

const edit = async (req, res) => {

    const {id} = req.params

    //Validar que la propiedad exista

    const property = await Property.findByPk(id)

    if(!property){
        return res.redirect('/mis-propiedades')
    }

    //Revisar que quien visita la URL, es el que creo la propiedad

    if(property.userId.toString() !== req.user.id.toString()){
        return res.redirect('/mis-propiedades')
    }


    //Consultar modelo de precios y categorias
    const [categories, prices] = await Promise.all([
        Category.findAll(),
        Price.findAll()
    ])

    res.render('propiedades/editar',{
        pagina: `Editar Propiedad: ${property.title}`,
        csrfToken: req.csrfToken(),
        categories,
        prices,
        data: property
    })
}

const saveChanges = async (req, res) => {

    let result = validationResult(req)
    if(!result.isEmpty()){
        // Consultar modelo de precio y categoria
        const [categories, prices] = await Promise.all([
            Category.findAll(),
            Price.findAll()
        ])

        res.render('propiedades/editar',{
            pagina: 'Editar Propiedad',
            csrfToken: req.csrfToken(),
            categories,
            prices,
            errors: result.array(),
            data: req.body
        })
    }

    const {id} = req.params

    //Validar que la propiedad exista

    const property = await Property.findByPk(id)

    if(!property){
        return res.redirect('/mis-propiedades')
    }

    //Revisar que quien visita la URL, es el que creo la propiedad

    if(property.userId.toString() !== req.user.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //Reescribir el objeto y actualizarlo

    try {
        const {title, description, rooms, parking, bathroom, street, lat, lng, price: priceId, category: categoryId } = req.body

        //metodo de sequelize
        property.set({
            title,
            description,
            rooms,
            parking,
            bathroom,
            street,
            lat,
            lng,
            priceId,
            categoryId
        })

        await property.save()

        res.redirect('/mis-propiedades')

    } catch (error) {
        console.log(error)
    }


}

const deleteProperty = async (req, res) => {

    const {id} = req.params

    //Validar que la propiedad exista

    const property = await Property.findByPk(id)

    if(!property){
        return res.redirect('/mis-propiedades')
    }

    //Revisar que quien visita la URL, es el que creo la propiedad

    if(property.userId.toString() !== req.user.id.toString()){
        return res.redirect('/mis-propiedades')
    }

    //Eliminar imagen de la propiedad
    await unlink(`public/uploads/${property.image}`)

    //Eliminar la propiedad
    await property.destroy()
    res.redirect('/mis-propiedades')



}

// Mostrar la propiedad

const showProperty = async (req, res) => {

    const {id} = req.params

    //Comprobar que la propiedad exista

    const property = await Property.findByPk(id,{
        include : [
            { model: Price, as: 'price' },
            { model: Category, as: 'category' },
        ]
    })

    if(!property){
        return res.redirect('/404')
    }


    res.render('propiedades/mostrar', {
        csrfToken: req.csrfToken(),
        user: req.user,
        property,
        pagina: property.title
    })
}



export {
    admin,
    create,
    save,
    addImage,
    saveImage,
    edit,
    saveChanges,
    deleteProperty,
    showProperty
}