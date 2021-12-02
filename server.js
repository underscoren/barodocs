const parseUrl = require("parseurl");
const send = require("send");
const path = require("path");
const fs = require("fs");
const express = require("express");
const app = express();
const PORT = 8000;

app.use(express.static("build"));

// if request failed, try to do case insensitive search on the path (i love the barotrauma devs, i love the barotrauma devs, i love the barotrauma devs)
app.use((req, res, next) => {
    const url = parseUrl(req);

    let fixedPath = "build";
    for (const part of url.pathname.split("/")) {
        const oldPath = fixedPath;
        fixedPath = path.join(oldPath, part);
        
        // this is horribly slow and woefully insecure, but it works good enough for now
        try {
            fs.statSync(fixedPath);
        } catch {
            const correctCase = fs.readdirSync(oldPath).find(folderName => folderName.toLowerCase() == part.toLowerCase());
            
            if(correctCase)
                fixedPath = path.join(oldPath, correctCase);
            else 
                next();
        }
    }

    let forwardError = false;

    const stream = send(req, fixedPath);
    stream.on("file", () => {
        forwardError = true;
    });
    
    stream.on("error", (err) => {
        next(forwardError ? err : undefined);
    });

    stream.pipe(res);
});

app.listen(PORT, () => { console.log("Server started on port "+PORT) });