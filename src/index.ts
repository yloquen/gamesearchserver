import BaseComm from "./BaseComm";
import { GameData } from "./types";
import OzoneComm from "./OzoneComm";
import TechnopolisComm from "./TechnopolisComm";

const http = require('http');

http.createServer(onRequest).listen(8080);

function onRequest(request:any, response:any)
{
    const c:BaseComm[] =
    [
        new TechnopolisComm(),
        new OzoneComm()
    ];

    const promises:Promise<GameData[]>[] = c.map(comm =>
    {
        return comm.getData("resident evil");
    });

    Promise.all(promises).then((values)=>
    {
        response.write(JSON.stringify(values.flat()));
        response.end();
    });


}
