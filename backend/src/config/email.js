const nodemailer = require('nodemailer');
require('dotenv').config();

// Configuración para Gmail
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true para 465, false para 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificar conexión
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Error de configuración de correo:', error.message);
    } else {
        console.log('✅ Servidor de correo configurado correctamente');
    }
});

const sendEmail = async (to, subject, html, from = process.env.EMAIL_USER) => {
    try {
        const mailOptions = {
            from: from,
            to: to,
            subject: subject,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Correo enviado a:', to);
        return info;
    } catch (error) {
        console.error('❌ Error al enviar correo a', to, ':', error.message);
        throw error;
    }
};

const sendMassiveEmail = async (recipients, subject, html, from = process.env.EMAIL_USER) => {
    try {
        const results = [];
        for (const recipient of recipients) {
            const result = await sendEmail(recipient, subject, html, from);
            results.push(result);
        }
        return results;
    } catch (error) {
        console.error('❌ Error al enviar correos masivos:', error);
        throw error;
    }
};

module.exports = {
    transporter,
    sendEmail,
    sendMassiveEmail
};