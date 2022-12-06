import express from "express"
import { formLogin, formResetPassword, formSignup, signup, confirm, resetPassword, checkToken, newPassword, authenticate } from "../controllers/usuarioController.js";

const router = express.Router()

//Routes  

router.get('/login', formLogin)
router.post('/login', authenticate)

router.get('/signup', formSignup)
router.post('/signup', signup)
router.get('/confirm/:token', confirm)

router.get('/reset-password', formResetPassword)
router.post('/reset-password', resetPassword)

// Almacena la nueva contraseña
router.get('/reset-password/:token', checkToken)
router.post('/reset-password/:token', newPassword)

export default router;