const fs = require("fs");
const path = require("path");
const parser = require("xml-parser");
const { parseItemFile } = require("./ContentParsers");

// TODO: allow user to specify paths via command line arguments
const barotraumaPath = "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Barotrauma\\";
const contentPackPath = path.join(barotraumaPath,"Data\\ContentPackages\\Vanilla 0.9.xml");
const languagePath = path.join(barotraumaPath, "Content\\Texts\\English\\EnglishVanilla.xml");

const contentPackXMLFile = fs.readFileSync(contentPackPath).toString()
const languageXMLFile = fs.readFileSync(languagePath).toString();

const xmlLanguageObject = parser(languageXMLFile);
const xmlObject = parser(contentPackXMLFile);

//console.log(xmlLanguageObject);

let promises = []

// TODO: create ContentParsers for the other content types
for (const childNode of xmlObject.root.children) {
    switch(childNode.name.toLowerCase()){
        case "item":
            promises.push(parseItemFile(barotraumaPath, childNode.attributes.file, xmlLanguageObject));
    }
}

Promise.all(promises).then(itemLists => {
    let allItems = [].concat.apply([],itemLists);
    console.log("Done parsing all items:",allItems.length);
    
    fs.writeFile("items.json",JSON.stringify(allItems,null,2), (err) => {
        if(err) throw err;
        console.log("Wrote items.json file");
    });
}).catch(err => {
    console.error("Error parsing content");
    console.error(err);
});

