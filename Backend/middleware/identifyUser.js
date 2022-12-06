import jwt from 'jsonwebtoken'
import User from '../models/Users.js'

const identifyUser = async (req, res, next) => {
    // Identificar si hay un token
    const {_token} = req.cookies
    if(!_token){
        req.user= null
        return next()
    }
    // Comprobar el token
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET)
        const user = await Users.scope('deletePassword').findByPk(decoded.id)

        if (user) {
            req.user = user
        }
        return next()
    } catch (error) {
        console.log(error)
        return res.clearCookie('_token').redirect('/auth/login')
    }
}

export default identifyUser