var http = require('http');
const fs = require('fs');
const mysql = require('mysql');

/*fs.writeFile("/opt/bitnami/apache2/htdocs/imgcache/test.txt", "Hey there!", function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});

// Or
fs.writeFileSync('/tmp/test-sync', 'Hey there!');*/

const a:string = "test";

const credentials = {
    host:'ls-d0cd045b9074bb77ba73b8eeb6d6a3937a8e037b.cdjeapb4osic.eu-central-1.rds.amazonaws.com',
    user:'dbmasteruser',
    password:'u*Ui6fg<sXo}u$:9a}E9{;B:>B&aFxMF',
    database:'gamesearch'
};

const connection = mysql.createConnection(credentials);

connection.connect((err:any) =>
{
    if(err)
    {
        console.log('error when connecting to db:', err);
        // setTimeout(() => { this.createConnection() }, 2000);
    }
    else
    {
        console.log(`Connected to ${credentials.database} @ ${credentials.host}`);
    }
});


/*
console.log("Server started");

//create a server object:
http.createServer(function (req, res) {
    res.write('Hello World!'); //write a response to the client
    res.end(); //e4nd the response
}).listen(8080); //the server object listens on port 8080*/
