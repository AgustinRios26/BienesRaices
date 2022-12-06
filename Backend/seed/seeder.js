import {exit} from 'node:process'
import categories from './categories.js'
import prices from './prices.js'
import users from './users.js'
import db from '../config/db.js'
import { Category, Price, Users} from '../models/index.js'

const importData = async () => {
    try {
        // Autenticar
        await db.authenticate()
        //Generar las columnas
        await db.sync()
        //Insertamos los datos

        // await Category.bulkCreate(categories)
        // await Price.bulkCreate(prices)

        await Promise.all([
            Category.bulkCreate(categories),
            Price.bulkCreate(prices),
            Users.bulkCreate(users)
        ])

        exit()
    } catch (error) {
        console.log(error)
        exit(1)
    }
}

const deleteData = async () => {
    try {
    // await Promise.all([
    //     Category.destroy({where: {}, truncate: true}),
    //     Price.destroy({where: {}, truncate: true})
    //     ]) Es otra forma de hacerlo pero con mas codigo

        await db.sync({force:true})
        
        exit()
    } catch (error) {
        console.log(error)
        exit(1)
    }
}

if(process.argv[2] === "-i"){
    importData();
}

if(process.argv[2] === "-e"){
    deleteData();
}