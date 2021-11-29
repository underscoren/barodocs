const fs = require("fs");
const path = require("path");
const parser = require("xml-parser");
const { getCaseInsensetiveKey } = require("./util");
const { Prefab, StatusEffect, CroppedImage } = require("./Components");

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

class Affliction extends Prefab {
    type = "affliction";
    icon;

    afflictiontype;
    isbuff;
    maxstrength;
    limbspecific;
    indicatorlimb;
    showiconthreshold;
    showinhealthscannerthreshold;
    activationthreshold;
    karmachangeonapplied;

    effects = [];


    constructor(baroPath, sourceFile, afflictionXML, languageXML) {
        super("affliction", sourceFile, afflictionXML, languageXML);
        
        this.afflictiontype = getCaseInsensetiveKey(afflictionXML.attributes, "type");
        
        const possibleAttributes = ["isbuff","maxstrength","limbspecific","indicatorlimb","showiconthreshold","showinhealthscannerthreshold","activationthreshold","karmachangeonapplied"]
        for (const possibleAttribute of possibleAttributes)
            this[possibleAttribute] = getCaseInsensetiveKey(afflictionXML.attributes, possibleAttribute);
        

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