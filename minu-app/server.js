const fs = require("fs");
const http = require("http");

const port = process.env.PORT || 3000;

let tekst = "Tere Dockerist1!";
try {
  tekst = fs.readFileSync("/run/secrets/db_password", "utf8").trim();
} catch {
  // secret pole saadaval, kasuta vaikeväärtust
}

http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    return res.end("ok");
  }
  res.end(tekst + "\n");
}).listen(port);
