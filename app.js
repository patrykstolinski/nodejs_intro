import http from 'http';
import { readFileSync } from 'fs';
import path from "path";
import { fileURLToPath } from 'url';

// find the filename with fileURLtoPath import meta, and dirname with path module dirname (where it sits) from "__filename"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// join the directory name with config.json for configPath
const configPath = path.join(__dirname, "config.json");

// use json readFileSync to open and read the file, then parse it as JSON
const config = JSON.parse(readFileSync(configPath, "utf-8"));

// read what is under the json keys
// const hostname = config.hostname;
// const port = config.port;

// deconstruct the object (order of variables doesnt matter)
const {port, hostname} = config;

// list of posts with specific keys
let posts = [
    {
        id: 1, 
        title: "Mein erster Blogbeitrag",
        content: "Das sind die Inhalte von meinem ERSTEN Blogbeitrag. ",
        author: "Patryk A.",
        date: "25-07-29"
    },
    {
        id: 2, 
        title: "Mein zweiter Blogbeitrag",
        content: "Das sind die Inhalte von meinem ZWEITEN Blogbeitrag. ",
        author: "Patryk B.",
        date: "25-07-30"
    },
    {
        id: 3, 
        title: "Mein zweiter Blogbeitrag",
        content: "Das sind die Inhalte von meinem DRITTEN Blogbeitrag. ",
        author: "Patryk C.",
        date: "25-07-31"
    }
]
// the next ID for post
let nextId = 3;

// create server with http with request/response parameters, and void function that tells you it received the request from xx
const server = http.createServer((req, res) => {
    console.log(`Anfrage erhalten: ${req.method} ${req.url}`);

    // enables Cross-Origin Resource Sharing (CORS) by setting an HTTP response header that tells the browser "I (this server) allow requests from any origin."
    res.setHeader("Access-Control-Allow-Origin", "*");
    //“I will accept incoming cross-origin requests that use the GET, POST, or OPTIONS HTTP methods.”
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    //“It's okay if the cross-origin request includes a Content-Type header.”
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.writeHead(204); // 204 HTTP - no content, but working
        res.end();
        return;
    }
    if (req.method === "GET" && req.url === "/posts") {
        res.writeHead(200, {"Content-Type": "application/json"}); // status OK
        res.end(JSON.stringify(posts)); //make strings out of JSON
    } else {
        res.writeHead(404, {"Content-Type": "application/json"});
        res.end(JSON.stringify({message: "Endpunkt nicht gefunden"}));
    }

});
// create a server that listens on X port, Y hostname
server.listen(port, hostname, () => {
    console.log(`Server gestartet unter http://${hostname}:${port}/`);
    console.log(`Teste den GET /posts Endpunkt unter http://${hostname}:${port}/posts`);
});
