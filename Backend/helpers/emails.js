import nodemailer from 'nodemailer'

const emailSignup = async (data) =>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });

      const {email, name, token} = data

      //Enviar el email
      await transport.sendMail({
        from: 'Inmobiliaria.com',
        to: email,
        subject:'Confirma tu cuenta en Inmobiliaria.com',
        text:'Confirma tu cuenta en Inmobiliaria.com',
        html:`<p>Hola ${name}, comprueba tu cuenta en inmobiliaria.com</p>
        
        <p>Tu cuenta esta lista, solo debes confirmarla en el siguiente enlace: <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 4000}/auth/confirm/${token}">Confirmar cuenta</a></p>
        
        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>`
      })
}

const emailPassword = async (data) =>{
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const {email, name, token} = data

    //Enviar el email
    await transport.sendMail({
      from: 'Inmobiliaria.com',
      to: email,
      subject:'Restablece tu Contraseña en inmobiliaria.com',
      text:'CRestablece tu Contraseña en inmobiliaria.com',
      html:`<p>Hola ${name}, has solicitado reestablecer tu contraseña en inmobiliaria.com</p>
      
      <p>Sigue el siguiente enlace para generar una nueva contraseña: <a href="${process.env.BACKEND_URL}:${process.env.PORT ?? 4000}/auth/reset-password/${token}">Reestablecer contraseña</a></p>
      
      <p>Si tu no solicitaste el cambio de contraseña, puedes ignorar el mensaje</p>`
    })
}

export {emailSignup, emailPassword}