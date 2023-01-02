import {GameData} from "../types";
import {Buffer} from "buffer";

const { https } = require("follow-redirects");
const fs = require("fs");
const sharp = require("sharp");

const nodemailer = require("nodemailer");
const crypto = require('crypto');

export default class Util
{

    public static loadUrlToBuffer(url:string):Promise<Buffer>
    {
        const buffers:Buffer[] = [];

        return new Promise<Buffer>((resolve, reject) =>
        {
            https.get(url,
                (resp:any) =>
                {
                    resp.on('data', (chunk:any) =>
                    {
                        buffers.push(chunk);
                    });

                    resp.on('end', () =>
                    {
                        resolve(Buffer.concat(buffers));
                    });

                })
                .on("error", (err:Error) =>
                {
                    console.log("Error loading " + url + "\n" + err.message);
                    reject(err);
                });
        });
    }


    public static getImage(url:string, size:number = 160):Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            const shaHash = crypto.createHash("sha256").update(url).digest("hex");
            const fileName = shaHash + ".png";
            const filePath = "./cache/" + fileName;

            fs.promises.access(filePath, fs.F_OK)
                .then(()=>
                {
                    console.log("File " + fileName + " is cached");
                    resolve(fileName);
                })
                .catch(() =>
                {
                    console.log("Fetching " + fileName + " from " + url);
                    Util.loadUrlToBuffer(url)
                        .then((result:Buffer) =>
                        {
                            return sharp(result)
                                .resize(size, size, {fit:'contain', background:{r:255, g:255, b:255, alpha:1}})
                                .png()
                                .toBuffer();
                        })
                        .then((b:Buffer) =>
                        {
                            fs.writeFile(filePath, b,
                                ()=>
                                {
                                    resolve(fileName);
                                });
                        })
                        .catch((e) =>
                        {
                            console.log("Error : " + fileName);
                            resolve("");
                        });
                });
        });
    }


    public static toSearchWords(s:string):string[]
    {
        return s.toLocaleLowerCase().replace(/[^a-zа-я0-9]/g, " ").replace(/\s+/g, " ").split(" ");
    }


    // Returns true only if all words in query are contained in name
    public static filterFullyContained(name:string, query:string)
    {
        const nameWords = Util.toSearchWords(name);
        const queryWords = Util.toSearchWords(query);

        for (let wordIdx = 0; wordIdx < queryWords.length; wordIdx++)
        {
            const word = queryWords[wordIdx];
            if (nameWords.indexOf(word) === -1)
            {
                return false;
            }
        }

        return true;
    }


    public static removeWhitespaces(s:string):string
    {
        return s.replace(/\n/g,"").replace(/^ +| +$/g, "").replace(/ +/g, " ")
    }


    public static cleanPrice(rawText:string)
    {
        return rawText.replace(/[^\d,]+/g, "").replace(/,/g, ".");
    }

    public static validateEmail(email:string):boolean
    {
        return true;
    }


    public static validatePass(pass:string):boolean
    {
        return true;
    }


    public static async generatePassHash(pass:string, salt:string):Promise<string>
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


    public static async sendEmail(email:string, subject:string, text:string)
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


    public static sanitizeStringForDB(s:string, maxLength:number):string
    {
        s = s.replace(/[\u0800-\uFFFF]/g, '');
        return s.length > maxLength ? s.slice(maxLength) : s;
    }


    static async delay(number:number)
    {
        return new Promise((resolve, reject) =>
        {
            setTimeout(()=>resolve(undefined), number * 1000);
        })
    }
}