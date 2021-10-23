import {GameData} from "./types";
import BaseComm from "./BaseComm";
const http = require("http");
const https = require("https");

export default class OzoneComm extends BaseComm
{

    parseResults(data:string)
    {
        const rawResults:any = JSON.parse(data.substring(16, data.length -2));
        return rawResults.items.map((item:any) => {return { price:item.p, name:item.l, provider:"Ozone"}});
    }


    generateUrl(searchString:string)
    {
        return "https://ultimate-dot-acp-magento.appspot.com/full_text_search?q=" +
            searchString +
            "&page_num=1&store_id=1&UUID=b68c2ea0-b6bf-4258-8435-ab810810ee1b&cdn_cache_key=1634826484&"  +
            "narrow=[[\"Categories\",\"3\"]]&facets_required=1&callback=ispSearchResult&related_search=1&disable_semantics=1";
    }

}