const nodemailer = require('nodemailer');

const sendMail = async options => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        const mailOptions = {
            from: "ram gopal <raming@example.com>", // Correct email format
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email successfully sent to:', options.email);
    } catch (err) {
        console.error('❌ Error in sendMail:', err); // 🔥 This will show the real issue
        throw err; // So the main controller can handle it
    }
};

module.exports = sendMail;
