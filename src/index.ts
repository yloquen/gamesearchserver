import BaseComm from "./BaseComm";
import {GameData} from "./types";
import OzoneComm from "./OzoneComm";
import TechnopolisComm from "./TechnopolisComm";

const http = require('http');
const url = require('url');

http.createServer(onRequest).listen(8080);

function onRequest(request:any, response:any)
{
    const c:BaseComm[] =
    [
        new TechnopolisComm(),
        new OzoneComm()
    ];

    const queryObject = url.parse(request.url, true).query;
    const queryString = queryObject.q.toLowerCase();

    const promises:Promise<GameData[]>[] = c.map(comm =>
    {
        return comm.getData(queryString);
    });

    Promise.all(promises).then((values)=>
    {
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Access-Control-Allow-Origin', '*');

        const searchResults:GameData[] = values.flat();

        response.write(JSON.stringify(searchResults));
        response.end();
    });

}
