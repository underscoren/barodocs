const path = require("path");

// this is actually how they do it in the game's source code
function fixPathLocal(itemPath, filePath) {
    if(filePath.includes("/")) {
        return filePath
    } else {
        return path.join(path.dirname(itemPath), filePath);
    }
}

function fixPath(baroPath, itemPath, filePath) {
    if(!filePath) return fixPathLocal(baroPath, itemPath);
    if(filePath.includes("/")) {
        return path.join(baroPath, filePath);
    } else {
        const itemDir = path.dirname(path.join(baroPath, itemPath));
        return path.join(itemDir, filePath);
    }
}

// even the attributes are case-insensetive
function getCaseInsensetiveKey(object, keyName) {
    let key = Object.keys(object).find(key => key.toLowerCase() === keyName);
    
    return key ? object[key] : undefined;
}


function getOrDefault(value, defaultValue) {
    return (typeof value === "undefined") ? defaultValue : value;
}

module.exports = {
    fixPathLocal,
    fixPath,
    getCaseInsensetiveKey,
    getOrDefault,
}