import {credentials} from "./cred";
import {GameData, SearchResult} from "./types";
import {Connection, MysqlError, OkPacket} from "mysql";
import C_Config from "./C_Config";
import {E_DatabaseError, E_ErrorType, E_GenericError} from "./const/enums";
import Util from "./util/Util";

const mysql = require('mysql');


export default class DataBaseModule
{
    private connection:Connection;

    constructor()
    {
        // this.connection = mysql.createConnection(credentials);
        this.connection = this.createConnection();
        // this.connection.connect();
    }


    createConnection()
    {
        const connection = mysql.createConnection(credentials);

        connection.connect((err:any) =>
        {
            if(err)
            {
                console.log('error when connecting to db:', err);
                setTimeout(() => { this.createConnection() }, 2000);
            }
            else
            {
                console.log(`Connected to ${credentials.database} @ ${credentials.host}`);
            }
        });

        connection!.on('error', (err:any) =>
        {
            console.log('db error', err);
            debugger;
            if(err.code === 'PROTOCOL_CONNECTION_LOST')
            {
                console.log("Connection lost, trying to reconnect");
                setTimeout(() => { this.createConnection() }, 2000);
            }
            else
            {
                throw err;
            }
        });

        return connection;
    }


    getUserData(email:string):Promise<any>
    {
        const q = `SELECT passhash, salt, id, email FROM user WHERE email = ?`;
        return this.executeQuery(q, [[email]]).then((dbResponse:any[]) =>
        {
            return dbResponse;
        });
    }


    createUser(email:string, hash:string, salt:string, verifyToken:string):Promise<any>
    {
        return new Promise<any>((resolve, reject) =>
        {
            this.connection.beginTransaction(async (err:MysqlError) =>
            {
                if (err)
                {
                    reject(err);
                }
                else
                {
                    try
                    {
                        let q = "INSERT INTO user VALUES ?;";
                        let vals = [ null, email, hash, salt, 0];

                        await this.executeQuery(q, [[vals]]);

                        q = "INSERT INTO verify VALUES (LAST_INSERT_ID(), ?);";
                        vals = [email, verifyToken];

                        await this.executeQuery(q, [vals]);

                        this.connection.commit();

                        resolve(true);
                    }
                    catch (e)
                    {
                        this.connection.rollback();
                        reject(e);
                    }
                }
            });
        });
    }


    async getCachedQuery(queryString:string):Promise<SearchResult|undefined>
    {
        const responseData:SearchResult =
        {
            gameData:[],
            priceData:[],
            wikiData:{link:"", imgURL:"", textInfo:[]},
            videoId:""
        };

        let query = `SELECT id, search_date FROM searches WHERE query_string = ?`;
        let dbResponse:any[] = await this.executeQuery(query, [[queryString]]);

        if (dbResponse.length === 0)
        {
            return;
        }

        const searchId = dbResponse[0].id;
        const secondsSinceSearch = (new Date().getTime() - new Date(dbResponse[0].search_date).getTime())*.001;

        if (secondsSinceSearch > C_Config.CACHE_DURATION_SECONDS)
        {
            query = `DELETE FROM searches WHERE id = ?`;
            await this.executeQuery(query, [[searchId]]);

            return;
        }

        query = `SELECT id, img, link, price, name, provider FROM crawl_gameresults WHERE search_id = ?;`;
        responseData.gameData = await this.executeQuery(query, [[searchId]]);

        query = `SELECT link, price, name FROM priceresults WHERE search_id = ?;`;
        responseData.priceData = await this.executeQuery(query, [[searchId]]);

        query = `SELECT img, text_info, link FROM wikiresults WHERE search_id = ?;`;
        dbResponse = await this.executeQuery(query, [[[searchId]]]);

        responseData.wikiData =
        {
            link:dbResponse[0]?.link,
            imgURL:dbResponse[0]?.img,
            textInfo:JSON.parse(dbResponse[0]?.text_info || "[]")
        };

        query = `SELECT video_id FROM videoresults WHERE search_id = ?;`;
        dbResponse = await this.executeQuery(query, [[searchId]]);
        responseData.videoId = dbResponse[0]?.video_id;

        return responseData;
    }



    add(queryString:string, results:SearchResult, userId:number|undefined):Promise<any>
    {
        return new Promise<any>((resolve, reject) =>
        {
            this.connection.beginTransaction(async (err:MysqlError) =>
            {
                if (err)
                {
                    this.connection.rollback();
                    reject(err);
                }
                else
                {
                    try
                    {
                        const r = await this.saveGameData(queryString, results, userId);
                        this.connection.commit();
                        resolve(r)
                    }
                    catch(e)
                    {
                        this.connection.rollback();
                        reject(e);
                    }
                }
            });
        });
    }


    async saveGameData(queryString:string, results:SearchResult, userId:number|undefined)
    {
        const searchesQuery = "INSERT INTO searches VALUES ?;";
        const searchesResult = await this.executeQuery(searchesQuery, [[[null, queryString, null, userId]]]);

        let searchId:number = searchesResult.insertId;

        const priceQuery = "INSERT INTO priceresults VALUES ?;";
        const priceValues = results.priceData.map(d => [null, searchId, d.link, d.name, d.price || null]);
        await this.executeQuery(priceQuery, [priceValues]);

        const q4 = "INSERT INTO wikiresults VALUES ?;";
        const vals4 = [[[
            null,
            searchId,
            results.wikiData.link,
            results.wikiData.imgURL,
            JSON.stringify(results.wikiData.textInfo)
        ]]];
        await this.executeQuery(q4, vals4);

        const q5 = "INSERT INTO videoresults VALUES ?;";
        const vals = [[[null, searchId, results.videoId]]];
        await this.executeQuery(q5, vals);
    }


    executeQuery(q:string, values:any[]):Promise<any>
    {
        console.log(q + " " +  values.length);
        if (values.length === 0)
        {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) =>
        {
            try
            {
                this.connection.query(mysql.format(q, values), (error, results) =>
                {
                    if (error)
                    {
                        reject(error);
                    }
                    else
                    {
                        resolve(results);
                    }
                });
            }
            catch (e)
            {
                reject(e);
            }
        });
    }


    verifyUser(token:string)
    {

    }


    async findUserSearches(userId:any)
    {
        const q = "SELECT query_string FROM searches where user_id = ?;";

        let result;
        try
        {
            result = await this.executeQuery(q, [[userId]]);
            result = result.map((r:any) => r.query_string)
        }
        catch (e)
        {
            result = {error:{type:E_ErrorType.GENERIC, id:E_GenericError.DATABASE}};
        }

        return result;
    }


    getGames(userId:number|undefined, searchWords:string[])
    {
        // const q = "SELECT id, img, link, price, name, provider FROM crawl_gameresults where MATCH(name) AGAINST(? IN BOOLEAN MODE)";
        // const q = 'SELECT * FROM crawl_gameresults WHERE name LIKE ?';

        const q = 'SELECT cg.*, f.id AS isFavorite FROM crawl_gameresults cg LEFT JOIN favorites f ON cg.id = f.prod_id AND f.user_id = ? WHERE cg.name LIKE ?';

        return this.executeQuery(q, [userId, "%" + searchWords.join("%") + "%"]);
    }


    async addFavorite(prodId:any, userId:number)
    {
        if (isNaN(prodId))
        {
            return {error:{type:E_ErrorType.DATABASE, id:E_DatabaseError.ADD_FAVORITE_ERROR}};
        }

        let q = "SELECT name FROM crawl_gameresults WHERE id = ?;";
        const res = await this.executeQuery(q, [[prodId]]);

        q = "INSERT INTO favorites VALUES ?;";
        let vals = [ null, userId, prodId, res[0]?.name || ""];
        await this.executeQuery(q, [[vals]]);

        return {success:true};
    }


    async getFavorites(userId:number)
    {
        const q = "SELECT * from favorites f join crawl_gameresults cg on f.prod_id=cg.id where f.user_id = ?";
        return await this.executeQuery(q, [[userId]]);
    }


}