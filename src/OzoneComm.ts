import {GameData} from "./types";
import BaseComm from "./BaseComm";
import Util from "./Util";
import {Buffer} from "buffer";

const sharp = require("sharp");
const crypto = require("crypto");
const fs = require("fs");

export default class OzoneComm extends BaseComm
{


    parseResults(data:string, query:string):Promise<GameData[]>
    {
        const rawResults:any = JSON.parse(data.substring(16, data.length -2));
        const promises:Promise<GameData>[] = rawResults.items
            .filter((item:any) =>
            {
                const name = item.l;
                return name.toLocaleLowerCase().indexOf(query.toLocaleLowerCase()) !== -1;
            })
            .map((item:any) =>
            {
                return new Promise<GameData>((resolve, reject) =>
                {
                    Util.getBase64Image(item.t)
                        .then((fileName:string) =>
                        {
                            resolve({
                                link:item.u,
                                img:"http://localhost/" + fileName,
                                price:Number(item.p),
                                name:item.l,
                                provider:"Ozone"
                            });
                        });
                });
            });

        return Promise.all(promises);
    }






    generateUrl(searchString:string)
    {
        return "https://ultimate-dot-acp-magento.appspot.com/full_text_search?q=" +
            searchString +
            "&page_num=1&store_id=1&UUID=b68c2ea0-b6bf-4258-8435-ab810810ee1b&cdn_cache_key=1634826484&"  +
            "narrow=[[\"Categories\",\"3\"]]&facets_required=1&callback=ispSearchResult&related_search=1&disable_semantics=1";
    }


}