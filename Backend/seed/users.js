import bcrypt from 'bcrypt'

const users = [
    {
        name: "Agustin",
        email: "agustin@correo.com",
        confirmed: 1,
        password: bcrypt.hashSync('password', 10)
    }
]

export default users