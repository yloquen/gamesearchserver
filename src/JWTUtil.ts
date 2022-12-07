import {createHmac, sign} from "crypto";
import {JWTSecret} from "./cred";
import {Buffer} from "buffer";
import {debug} from "util";



const header =
{
    alg : "HS256",
    typ : "JWT"
};

const HEADER_HS256 = Buffer.from(JSON.stringify(header), 'utf-8').toString('base64url');


/*
// example
const payload =
{
    sub : d[0].id,
    exp : Math.floor(new Date().getTime()/1000)
};
resp.setHeader("Authorization", `Bearer ${generateHS256Token(payload)}`);
*/
export function generateHS256Token<T>(payload: T)
{
    const payloadB64url = Buffer
        .from(JSON.stringify(payload), 'utf-8')
        .toString('base64url');

    const data = `${ HEADER_HS256 }.${ payloadB64url }`;

    return `${ data }.${ signHS256(data, JWTSecret).toString('base64url') }`;
}


export function verifyToken(token:string):any
{
    let result = false;

    const [header, payload, signature] = token.split(".");

    if (header && payload && signature)
    {
        const signedData = header + "." + payload;
        const calculatedSignature = signHS256(signedData, JWTSecret).toString('base64url');

        if (calculatedSignature === signature)
        {
            try
            {
                result = JSON.parse(Buffer.from(payload, 'base64url').toString());
            }
            catch (e)
            {
                result = false;
            }
        }
    }

    return result;
}


function signHS256(data: string, secret: string)
{
    return createHmac('sha256', secret, { encoding: 'utf-8' })
        .update(Buffer.from(data, 'utf-8'))
        .digest();
}