import jwt from "jsonwebtoken";
import { Users } from "../models/index.js";


const middlewareRoutes = async ( req, res, next) => {

    // Verificar si hay un token

    const {_token} = req.cookies

    if (!_token){
        return res.redirect('/auth/login')
    }

    // Comprobar el token

    try {
        
        const decoded = jwt.verify(_token, process.env.JWT_SECRET)
        const user = await Users.scope('deletePassword').findByPk(decoded.id)

      // Almacenar el usuario al request

        if (user) {
            req.user = user
        } else {
            return res.redirect('auth/login')
        }
        return next()

    } catch (error) {
        return res.clearCookie('_token').redirect('auth/login')
    }


    next();
}

export default middlewareRoutes