const fs = require("fs");
const path = require("path");
const parser = require("xml-parser");
const { parseItemFile, parseAfflictionFile } = require("./ContentParsers");

const buildPath = path.join(__dirname,"../build/");

// TODO: allow user to specify contentPackPath and languagePath
const contentPackPath = path.join(buildPath,"Data\\ContentPackages\\Vanilla 0.9.xml");
const languagePath = path.join(buildPath, "Content\\Texts\\English\\EnglishVanilla.xml");

const contentPackXMLFile = fs.readFileSync(contentPackPath).toString();
const languageXMLFile = fs.readFileSync(languagePath).toString();

const xmlLanguageObject = parser(languageXMLFile);
const xmlObject = parser(contentPackXMLFile);

//console.log(xmlLanguageObject);

const promises = []

// TODO: create ContentParsers for the other content types
for (const childNode of xmlObject.root.children) {
    switch(childNode.name.toLowerCase()) {
        case "item":
            promises.push(parseItemFile(buildPath, childNode.attributes.file, xmlLanguageObject));
            break;
        case "afflictions":
            promises.push(parseAfflictionFile(buildPath, childNode.attributes.file, xmlLanguageObject));
            break;
    }
}

Promise.all(promises).then(itemLists => {
    let allItems = [].concat.apply([],itemLists);
    console.log("Done parsing all items. Found ",allItems.length,"total items");
    
    fs.writeFile(
        path.join(buildPath,"Content/items.json"),
        JSON.stringify(allItems, (key, value) => 
            Array.isArray(value) && value.length == 0 // replacer to remove all 0 length arrays
            ? undefined
            : value
        , 2),
        (err) => {
            if(err) throw err;
            console.log("Wrote Content/items.json file");
        }
    );
}).catch(err => {
    console.error("Error parsing content");
    console.error(err);
});

