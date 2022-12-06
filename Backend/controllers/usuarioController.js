import {check, validationResult} from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/Users.js'
import {generateId, generateJWT} from '../helpers/tokens.js'
import {emailSignup, emailPassword} from '../helpers/emails.js'

const formLogin = (req, res) => {
    res.render('auth/login', {
        pagina:'Iniciar Sesion',
        csrfToken: req.csrfToken()
       })
}

const authenticate = async (req, res) => {
    //Validacion
    await check('email').isEmail().withMessage('El Email es Obligatorio').run(req)
    await check('password').notEmpty().withMessage('La Contraseña es Obligatoria').run(req)

    let result = validationResult(req)

    //Verificar que el resultado este vacio
    if(!result.isEmpty()){
        //si no hay errores
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errors: result.array()
            
        })
    }

    const {email, password} = req.body

    //Comprobar si el usuario existe
    const user = await User.findOne({where: {email}})
    if(!user){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errors: [{msg: 'El usuario no existe'}]
            
        })
    }

    //Comprobar si el usuario esta confirmado
    if (!user.confirmed){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errors: [{msg: 'Tu cuenta no ha sido confirmada'}]
        })
    }

    //Revisar la contraseña
    if(!user.verifyPassword(password)){
        return res.render('auth/login',{
            pagina: 'Iniciar Sesion',
            csrfToken: req.csrfToken(),
            errors: [{msg: 'La contraseña es incorrecta'}]
        })
    }

    //Autenticar el usuario

    const token = generateJWT({id: user.id, name: user.name}) 
    console.log(token)

    //Almacenar en una cookie

    return res.cookie('_token', token, {
        httpOnly: true
        //secure:true
    }).redirect('/mis-propiedades')

}

const formSignup = (req, res) => {
    res.render('auth/signup', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
    })
}

const signup = async (req, res) => {
    await check('name').notEmpty().withMessage('El nombre es obligatorio').run(req)
    await check('email').isEmail().withMessage('No es un email correcto').run(req)
    await check('password').isLength({min: 6}).withMessage('La contraseña debe tener mínimo 6 caracteres').run(req)
    // await check('repeat_password').equals('password').withMessage('Las contraseñas no son iguales').run(req)

    let result = validationResult(req)

    // return res.json(result.array())

    //Verificar que el resultado este vacio
    if(!result.isEmpty()){
        //si no hay errores
        return res.render('auth/signup',{
            pagina: 'Crear Cuenta',
            csrfToken: req.csrfToken(),
            errors: result.array(),
            user:{
                name: req.body.name,
                email: req.body.email
                
            }
        })
    }
    //Extraer los datos
    const {name, email, password} = req.body

        // Verificar que el usuario no este duplicado
        const userExist = await User.findOne({ where: {email} })
        if (userExist){
            return res.render('auth/signup',{
                pagina: 'Crear Cuenta',
                csrfToken: req.csrfToken(),
                errors: [{msg: 'El usuario se encuentra registrado'}],
                user:{
                    name: req.body.name,
                    email: req.body.email
                    
                }
            })
        }

        //Almacenar un usuario
        const user = await User.create({
            name,
            email,
            password,
            token: generateId()
        })

        //Envia email de confirmacion 
        emailSignup({
            name: user.name,
            email: user.email,
            token: user.token
        })

        //Mostrar mensaje de confirmacion
        res.render('templates/message',{
            pagina:'Cuenta creada Correctamente',
            message: 'Hemos enviado un Email de Confirmación, presiona en el enlace'
        })
        return;

        
    // console.log(req.body)
    // const user = await User.create(req.body)
    // res.json(user)
}

//Funcion que comprueba una cuenta

const confirm = async (req,res)=>{
    const {token} = req.params

    //Verificar si el token es valido

    const user = await User.findOne({where: {token}})
    if (!user){
        return res.render('auth/confirm-user',{
            pagina:'Error al confirmar tu cuenta',
            message: 'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error:true
        })
    }

    //Confirmar cuenta

    user.token=null;
    user.confirmed=true;
    await user.save()
    return res.render('auth/confirm-user',{
        pagina:'Cuenta confirmada',
        message: 'La cuenta se confirmo correctamente',
    })




} 

const formResetPassword = (req, res) => {
    res.render('auth/reset-password', {
        pagina: 'Recuperar Acceso',
        csrfToken: req.csrfToken()
    })
}

const resetPassword = async (req,res) => {
    await check('email').isEmail().withMessage('No es un email correcto').run(req)

    let result = validationResult(req)

    //Verificar que el resultado este vacio
    if(!result.isEmpty()){
        //si no hay errores
        return res.render('auth/reset-password',{
            pagina: 'Recuperar Acceso',
            csrfToken: req.csrfToken(),
            errors: result.array(),
        })
    }
    //Extraer los datos
    const {name, email, password} = req.body

        // Verificar que el usuario no este duplicado
        const user = await User.findOne({ where: {email} })
        if (!user){
            return res.render('auth/reset-password',{
                pagina: 'Recupera tu acceso a Inmobiliaria Cordoba',
                csrfToken: req.csrfToken(),
                errors: [{msg: 'El email no pertenece a ningun usuario'}]
            })
        }
        // Generar un token y enviar el mail
        user.token = generateId()
        await user.save()

        // Enviar un email
        emailPassword({
            email: user.email,
            name: user.name,
            token: user.token
        })

        //Renderizar un mensaje
        res.render('templates/message',{
            pagina:'Reestablece tu contraseña',
            message: 'Hemos enviado un Email con las instrucciones'
        })

}

const checkToken = async (req,res) => {
    const {token} = req.params
    const user = await User.findOne({where: {token}})
    if (!user){
        return res.render('auth/confirm-user',{
            pagina:'Reestablece tu contraseña',
            message: 'Hubo un error al validar tu informacion, intenta de nuevo',
            error:true
        })
    }

    //Mostrar formulario para identificar la contraseña
    res.render('auth/restore-password',{
        pagina: 'Reestablece tu contraseña',
        csrfToken: req.csrfToken()

    })

}
const newPassword = async (req,res) => {
    // Validar la contraseña
    await check('password').isLength({min: 6}).withMessage('La contraseña debe tener mínimo 6 caracteres').run(req)

    let result = validationResult(req)

    //Verificar que el resultado este vacio
    if(!result.isEmpty()){
        //si no hay errores
        return res.render('auth/reset-password',{
            pagina: 'Reestablece tu contraseña',
            csrfToken: req.csrfToken(),
            errors: result.array(),
        })
    }

    const {token} = req.params
    const {password} = req.body
    //Identificar quien hace el cambio
    const user = await User.findOne({where: {token}})

    //Hashear la nueva contraseña
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
    user.token = null

    await user.save()

    res.render('auth/confirm-user',{
        pagina:'Contraseña Reestablecida',
        message: 'La contraseña se ha reestablecido correctamente'
        
    })

}

export {
    formLogin,
    authenticate,
    formSignup,
    formResetPassword,
    confirm,
    signup,
    resetPassword,
    checkToken,
    newPassword
}