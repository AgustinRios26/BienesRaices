import {Sequelize} from 'sequelize'
import { Price, Category, Property } from "../models/index.js"

const index = async (req, res) => {

    const [categories, prices, casas, departamentos] = await Promise.all([
        Category.findAll({raw: true}),
        Price.findAll({raw: true}),
        Property.findAll({
            limit: 3,
            where: {
                categoryId: 1
            },
            include: [
                { 
                    model: Price, as: 'price'
                }
            ],
            order: [ 
                ['createdAt', 'DESC'] 
            ]
        }),
        Property.findAll({
            limit: 3,
            where: {
                categoryId: 2
            },
            include: [
                { 
                    model: Price, as: 'price'
                }
            ],
            order: [ 
                ['createdAt', 'DESC'] 
            ]
        })
    ])

    res.render('index', {
        csrfToken: req.csrfToken(),
        pagina: 'Inicio',
        categories,
        prices,
        casas,
        departamentos,
    })
}

const category = async (req, res) => {
    const {id} = req.params

    // Comprobar que la categoria exista
    const category = await Category.findByPk(id)
    if(!category){
        return res.redirect('/404')
    }

    // Obtener las propiedades de la categoria
    const properties = await Property.findAll({
        where: {
            categoryId:id
        },
        include: [
            { model: Price, as: 'price'}
        ]
    })

    res.render('categories', {
        csrfToken: req.csrfToken(),
        pagina: `${category.name}s en Ventas`,
        properties,
    })

}

const notFound = (req, res) => {
    res.render('404', {
        csrfToken: req.csrfToken(),
        pagina: 'No encontrada'
    })
}

const search = async (req, res) => {
    const {termino} = req.body

    // Validar que termino no este vacio
    if(!termino.trim()){
        return res.redirect('back')
    }
     // Consultar las propiedades

    const properties = await Property.findAll({
        where: {
            title: {
                [Sequelize.Op.like] : '%' + termino + '%'
            } 
        },
        include: [
            { model: Price, as: 'price'}
        ]
    })

    res.render('busqueda', {
        pagina: `Resultados de la búsqueda`,
        csrfToken: req.csrfToken(),
        properties,

    })

}

export {
    index,
    category,
    notFound,
    search
}