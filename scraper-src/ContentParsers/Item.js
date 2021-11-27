const fs = require("fs");
const path = require("path");
const parser = require("xml-parser");
const { getCaseInsensetiveKey, getOrDefault } = require("./util");
const { StatusEffect, Attack, AiTarget, CroppedImage } = require("./Components");

class Holdable {
    reload;
    statuseffects = [];
    requiredskill;

    constructor(XMLelement) {
        this.reload = getCaseInsensetiveKey(XMLelement.attributes, "reload");

        for (const childNode of XMLelement.children) {
            switch(childNode.name.toLowerCase()) {
                case "statuseffect":
                    this.statuseffects.push(new StatusEffect(childNode));
                    break;
                case "requiredskill":
                    this.requiredskill = {
                        identifier: childNode.attributes.identifier,
                        level: childNode.attributes.level,
                    }
                    break;
            }
        }
    }
}

class MeleeWeapon extends Holdable {
    allowhitmultiple;
    attack;

    constructor(XMLelement) {
        super(XMLelement);

        this.allowhitmultiple = getCaseInsensetiveKey(XMLelement.attributes, this.allowhitmultiple);

        for (const childNode of XMLelement.children) {
            switch(childNode.name.toLowerCase()) {
                case "attack":
                    this.attack = new Attack(childNode);
                    break;
            }
        }
    }
}

class Item {
    //xmlObject;
    sourceFile;
    type = "item";
    
    name;
    description;
    identifier;
    category;
    tags;

    sprite;
    inventoryIcon;

    price;
    fabricate;
    deconstruct;
    
    meleeweapon;
    holdable;
    container;
    aitarget;

    // TODO: implement all these
    connectionPanel;
    rangedWeapon;
    projectile;
    wearable;


    constructor(baroPath, sourceFile, itemXML, languageXML) {
        //this.xmlObject = itemXML;
        this.sourceFile = sourceFile;
        if(!itemXML) {
            console.warn("itemXML is undefined");
            return;
        }

        const entityName = languageXML.root.children.find(child => {
            return child.name == "entityname."+itemXML.attributes.identifier
        });
        this.name = entityName ? entityName.content : "Undefined"
        
        const entityDescription = languageXML.root.children.find(child => {
            return child.name == "entitydescription."+itemXML.attributes.identifier
        });
        this.description = entityDescription ? entityDescription.content : "Undefined";
        
        this.identifier = itemXML.attributes.identifier;
        this.category = itemXML.attributes.category;
        this.variantof = itemXML.attributes.variantof;
        
        const tagAttribute = getCaseInsensetiveKey(itemXML.attributes, "tags");
        if(tagAttribute) {
            this.tags = tagAttribute.split(",");
        } else {
            this.tags = [];
        }
        
        for (const childNode of itemXML.children) {
            switch(childNode.name.toLowerCase()) {
                case "sprite":
                    this.sprite = new CroppedImage(childNode, baroPath, sourceFile);
                    break;
                case "inventoryicon":
                    this.inventoryIcon = new CroppedImage(childNode, baroPath, sourceFile);
                    break;
                case "price":
                    this.price = {
                        baseprice: childNode.attributes.baseprice,
                        soldeverywhere: getOrDefault(childNode.attributes.soldeverywhere, true),
                    }

                    for (const localPrice of childNode.children) {
                        this.price[localPrice.attributes.locationtype] = {
                            multiplier: localPrice.attributes.multiplier,
                            sold: getOrDefault(localPrice.attributes.sold, true),
                            minavailable: getOrDefault(localPrice.attributes.minavailable, 0),
                        }
                    }
                    break;
                case "deconstruct":
                    this.deconstruct = {
                        time: getOrDefault(childNode.attributes.time, 1),
                        chooserandom: childNode.attributes.chooserandom,
                        amount: childNode.attributes.amount,
                        items: [],
                    }

                    for (const itemNode of childNode.children) {
                        this.deconstruct.items.push(itemNode.attributes.identifier);
                    }
                    break;
                case "fabricate":
                case "fabricable":
                case "fabricateitem":
                    this.fabricate = {
                        time: childNode.attributes.requiredtime,
                        fabricators: childNode.attributes.suitablefabricators,
                        requiresrecipe: childNode.attributes.requiresrecipe,
                        items: [],
                    }

                    for (const fabNode of childNode.children) {
                        if(fabNode.name.toLowerCase().startsWith("requiredskill")) {
                            this.fabricate.skill = {
                                identifier: fabNode.attributes.identifier,
                                level: fabNode.attributes.level,
                            }
                        } else {
                            this.fabricate.items.push(fabNode.attributes.identifier);
                        }
                    }
                    break;
                case "itemcontainer":
                    this.container = {
                        size: childNode.attributes.capacity,
                    }

                    for (const containerNode of childNode.children) {
                        if(containerNode.name.toLowerCase() == "containable") {
                            this.container.items = undefined;
                        
                            if(containerNode.attributes.items) this.container.items = containerNode.attributes.items.split(",");
                            if(containerNode.attributes.identifiers) this.container.items = containerNode.attributes.identifiers.split(",");
                        }
                        if(containerNode.name.toLowerCase() == "requireditem") {
                            this.container.requireditem = {
                                items: containerNode.attributes.items,
                                type: containerNode.attributes.type
                            }
                        }
                    }
                    break;
                case "meleeweapon":
                    this.meleeweapon = new MeleeWeapon(childNode);
                    break;
                case "holdable":
                    this.holdable = new Holdable(childNode);
                    break;
                case "aitarget":
                    this.aitarget = new AiTarget(childNode);
            }
        }
    }
}

// returns an array of Item objects
function parseItemFile(baroPath, filePath, languageXML) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(baroPath,filePath), (err, data) => {
            if(err) {
                reject(err);
                return;
            }
            data = data.toString();
            
            console.log("Parsing",filePath);
            const itemMatches = data.match(/<item [^\/]*>/gi);
    
            const xmlObject = parser(data);
            if(xmlObject.root.name.toLowerCase() == "items") {
                let items = [];
                for (const item of xmlObject.root.children) {
                    items.push(new Item(baroPath, filePath, item, languageXML));
                }

                console.log("Added",items.length,"items");
                
                // these warnings are mostly for development purposes. they can be safely ignored. 
                // if you check the xml files, some of them use item names as the item tag instead of the default "Item", hence no item tags are found
                if(itemMatches) {
                    if(itemMatches.length != items.length) {
                        console.warn("  Found",itemMatches.length,"item tags via regex, but",items.length,"were added");
                    }
                } else {
                    console.warn("  Found no item tags via regex, but",items.length,"were added");
                }

                resolve(items);
            } else if (xmlObject.root.name.toLowerCase() == "item") {
                // for some reason ladder.xml had the item tag on the root node
                console.log("Added",1,"items");
                resolve([new Item(baroPath, filePath, xmlObject.root, languageXML)]);
            } else {
                reject("No Item tags found");
            }
        });
    });
}

module.exports = {
    Item,
    parseItemFile
};