const nodemailer = require('nodemailer');
const twilio = require('twilio');

const otpStore = new Map(); // In-memory store (use Redis in production for persistence and scalability)

exports.generateOtp = async (email, phone, method) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(`${email || phone}`, otp);

    if (method === 'email') {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP is ${otp}. It is valid for 10 minutes.`
        });

        console.log(`OTP ${otp} sent via EMAIL to: ${email}`);
    } else if (method === 'sms' || method === 'whatsapp') {
        const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

        const fromNumber =
            method === 'sms'
                ? process.env.TWILIO_SMS_FROM
                : process.env.TWILIO_WHATSAPP_FROM;

        const toNumber = method === 'sms' ? phone : `whatsapp:${phone}`;

        await client.messages.create({
            body: `Your OTP is ${otp}. It is valid for 10 minutes.`,
            from: fromNumber,
            to: toNumber
        });

        console.log(`OTP ${otp} sent via ${method.toUpperCase()} to: ${phone}`);
    } else {
        throw new Error('Invalid OTP method');
    }

    return otp;
};

exports.verifyOtp = (email, phone, method, otp) => {
    const key = `${email || phone}`;
    const storedOtp = otpStore.get(key);

    if (storedOtp && storedOtp === otp) {
        otpStore.delete(key);
        return true;
    }

    return false;
};
