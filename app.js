import http from 'http';
import { readFile, writeFile } from 'fs/promises';
import path from "path";
import { fileURLToPath } from 'url';

// find the filename with fileURLtoPath import meta, and dirname with path module dirname (where it sits) from "__filename"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// join the directory name with config.json for configPath
const configPath = path.join(__dirname, "config.json");

// use json readFileSync to open and read the file, then parse it as JSON
const config = JSON.parse(await readFile(configPath, "utf-8"));

// simulated delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
// deconstruct the object (order of variables doesnt matter)
const {port, hostname} = config;

const postsPath = path.join(__dirname, "posts.json");

// function to load posts from posts.json
async function loadPosts() {
    const data = await readFile(postsPath, "utf-8");
    return JSON.parse(data)
}

async function savePosts(posts) {
    await writeFile(postsPath, JSON.stringify(posts, null, 2), "utf-8");
}


function getRequestBody(req) {
    return new Promise((resolve,reject) => {
        let body = "";
        req.on("data", teil => {
            body += teil.toString();
        });
        req.on("end", () => {
            resolve(body);
        });
        req.on("error", fehler => {
            reject(fehler);
        });
    });
};

// list of posts with specific keys
// let posts = 
let posts = await loadPosts();
// the next ID for post
let nextId = posts.length;

// create server with http with request/response parameters, and void function that tells you it received the request from xx
const server = http.createServer(async (req, res) => {
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
        await delay(1000);
        res.end(JSON.stringify(posts)); //make strings out of JSON
    } else if (req.method === "GET" && req.url.match(/^\/posts\/(\d+)$/)) {
        const ID = parseInt(req.url.split("/")[2]); // variable nur für ID der Eintrag
        const post = posts.find(post => post.id === ID);
        if (post) {
            res.writeHead(200, {"Content-Type": "application/json"});
            await delay(1000);
            res.end(JSON.stringify(post));
        } else {
            res.writeHead(404, {"Content-Type": "application/json"});
            res.end(JSON.stringify({message: "ID nicht gefunden"}));
        }

    } else if (req.method=== "POST" && req.url === "/posts") {
        // res.writeHead(201, {"Content-Type": "application/json"});
        // res.end(JSON.stringify({message: "Blogbeitrag Erstellung empfangen (body noch nicht erstellt)"}));
        try {
            const body = await getRequestBody(req);
            const newPost = JSON.parse(body);

            if (!newPost.title || !newPost.author || !newPost.content) {
                res.writeHead(400, {"Content-Type": "application/json"});
                res.end(JSON.stringify({message: "Bad request: Fehlende Felder (title/author/content)"}));
                return;
            }
            newPost.id = ++nextId;
            newPost.date = new Date().toISOString().split("T")[0];

            posts.push(newPost)
            await savePosts(posts);
            
            res.writeHead(201, {"Content-Type": "application/json"});
            res.end(JSON.stringify(newPost));


        } catch (fehler) {
            console.error("Fehler beim Parsen JSON", fehler);
            res.writeHead(400, {"Content-Type": "application/json"});
            res.end(JSON.stringify({message: "Bad POST request, JSON ungültig"}));
        }
    }
    else {
        res.writeHead(404, {"Content-Type": "application/json"});
        res.end(JSON.stringify({message: "Endpunkt nicht gefunden"}));
    }

});
// create a server that listens on X port, Y hostname
server.listen(port, hostname, () => {
    console.log(`Server gestartet unter http://${hostname}:${port}/`);
    console.log(`Teste den GET /posts Endpunkt unter http://${hostname}:${port}/posts`);
    console.log(`Blogbeitrag 1 Testen: http://${hostname}:${port}/posts/1`);
    console.log(`Nicht existierende Blogbeitrag: http://${hostname}:${port}/posts/99`);
    console.log(`Neue Beiträge werden in posts.json gespeichert`)
});
