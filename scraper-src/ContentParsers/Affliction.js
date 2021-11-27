const fs = require("fs");
const path = require("path");
const parser = require("xml-parser");
const { getCaseInsensetiveKey } = require("./util");
const { StatusEffect, CroppedImage } = require("./Components");

class AfflictionEffect {
    minstrength;
    maxstrength;

    minvitalitydecrease;
    maxvitalitydecrease;

    strengthchange;
    multiplybymaxvitality;

    minbuffmultiplier;
    maxbuffmultiplier;

    minspeedmultiplier;
    maxspeedmultiplier;

    minskillmultiplier;
    maxskillmultiplier;

    resistancefor;
    minresistance;
    maxresistance;

    statuseffects = [];
    statvalues = [];

    constructor(XMLelement) {
        const possibleAttributes = Object.keys(this).filter(attrName => !(attrName == "statuseffects" || attrName == "statvalues"));
        for (const possibleAttribute of possibleAttributes)
            this[possibleAttribute] = getCaseInsensetiveKey(XMLelement.attributes, possibleAttribute);
        
        for (const childElement of XMLelement.children) {
            switch (childElement.name.toLowerCase()) {
                case "statuseffect":
                    this.statuseffects.push(new StatusEffect(childElement));
                    break;
                case "statvalue":
                    this.statvalues.push({
                        stattype: childElement.attributes.stattype,
                        value: childElement.attributes.value,
                        minvalue: childElement.attributes.minvalue,
                        maxvalue: childElement.attributes.maxvalue,
                    });
                    break;
            }
        }
    }
}

class Affliction {
    sourceFile;
    type = "affliction";
    
    name;
    description;
    identifier;
    icon;

    afflictiontype;
    isbuff;
    maxstrength;
    limbspecific;
    indicatorlimb;
    showiconthreshold;
    activationthreshold;
    karmachangeonapplied;

    effects = [];


    constructor(baroPath, sourceFile, afflictionXML, languageXML) {
        if(!afflictionXML) {
            console.warn("afflictionXML is undefined");
            return;
        }
        this.sourceFile = sourceFile;

        const entityName = languageXML.root.children.find(child => {
            return child.name == "afflictionname."+afflictionXML.attributes.identifier
        });
        this.name = entityName ? entityName.content : "Undefined";
        
        const entityDescription = languageXML.root.children.find(child => {
            return child.name == "afflictiondescription."+afflictionXML.attributes.identifier
        });
        this.description = entityDescription ? entityDescription.content : "Undefined";
        
        this.identifier = afflictionXML.attributes.identifier;
        this.afflictiontype = afflictionXML.attributes.type;
        this.maxstrength = afflictionXML.attributes.maxstrength;
        this.activationthreshold = afflictionXML.attributes.activationthreshold;
        this.limbspecific = afflictionXML.attributes.limbspecific;
        this.karmachangeonapplied = afflictionXML.attributes.karmachangeonapplied;
        this.isbuff = afflictionXML.attributes.isbuff;
        if(this.limbspecific == "false") {
            this.indicatorlimb = afflictionXML.attributes.indicatorlimb;
        }

        for (const childNode of afflictionXML.children) {
            switch(childNode.name.toLowerCase()) {
                case "icon":
                    this.icon = new CroppedImage(childNode, baroPath, sourceFile);
                break;
                case "effect":
                    this.effects.push(new AfflictionEffect(childNode));
                break;
            }
        }
    }
}

function parseAfflictionFile(baroPath, filePath, languageXML) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(baroPath,filePath), (err, data) => {
            if(err) {
                reject(err);
                return;
            }
            data = data.toString();
            console.log("Parsing",filePath);

            const xmlObject = parser(data);
            if(xmlObject.root.name.toLowerCase() == "afflictions") {
                let afflictions = [];
                for (const affliction of xmlObject.root.children) {
                    // ignore non-afflictions
                    if(affliction.name.toLowerCase() == "cprsettings") continue;
                    if(affliction.name.toLowerCase() == "damageoverlay") continue;
                    
                    afflictions.push(new Affliction(baroPath, filePath, affliction, languageXML));
                }

                console.log("Added",afflictions.length,"afflictions");
                resolve(afflictions);
            } else {
                reject("No Afflictions found");
            }
        });
    });
}

module.exports = {
    Affliction,
    parseAfflictionFile
}