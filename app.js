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

const server = http.createServer((req, res) => {
    console.log(`Anfrage erhalten: ${req.method} ${req.url}`);

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hallo Welt vom Node.js Server.');
});

server.listen(port, hostname, () => {
    console.log(`Server gestartet unter http://${hostname}:${port}/`);
})
