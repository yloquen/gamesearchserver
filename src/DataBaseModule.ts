import {NetConnectOpts} from "net";
import {credentials} from "./cred";
const mysql = require('mysql');


export default class DataBaseModule
{

    constructor()
    {
        const connection = mysql.createConnection(credentials);
        connection.connect();
        connection.query('SELECT 1 + 1 AS solution', (error:string, results:any, fields:any) =>
        {
            if (error)
            {
                throw error;
            }
            console.log('The solution is: ', results[0].solution);
        });
        connection.end();
    }

}