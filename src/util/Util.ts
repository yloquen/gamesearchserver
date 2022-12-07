import {Buffer} from "buffer";


const nodemailer = require("nodemailer");
const crypto = require('crypto');

export function validateEmail(email:string):boolean
{
    return true;
}


export function validatePass(pass:string):boolean
{
    return true;
}


export async function generatePassHash(pass:string, salt:string):Promise<string>
{
    return new Promise((resolve, reject) =>
    {
        crypto.pbkdf2(pass, salt, 100000, 64, 'sha512', async (error:Error|null, derivedKey:Buffer) =>
        {
            if (error)
            {
                reject(error.message);
            }
            else
            {
                resolve(derivedKey.toString('base64'));
            }
        });
    });
}


export async function sendEmail(email:string, subject:string, text:string)
{
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    /*
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.abv.bg",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: emailCred.user, // generated ethereal user
            pass: emailCred.pass, // generated ethereal password
        }
    });
    */


    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'fonb@abv.bg', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: text // plain text body
        // html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

    // main().catch(console.error);
}
