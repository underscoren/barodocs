const fs = require("fs");
const path = require("path");
const parser = require("xml-parser");
const sizeOf = require("image-size");
const { fixPath, getCaseInsensetiveKey, getOrDefault } = require("./util");

class Affliction {
    sourceFile;
    type = "affliction";
    
    name;
    description;
    identifier;
    icon;

    afflictiontype;
    maxstrength;
    limbspecific;
    indicatorlimb;
    showiconthreshold;
    activationthreshold;
    karmachangeonapplied;

    effects;


    constructor(baroPath, sourceFile, afflictionXML, languageXML) {
        if(!afflictionXML) {
            console.warn("afflictionXML is undefined");
            return;
        }
        this.sourceFile = sourceFile;

        const entityName = languageXML.root.children.find(child => {
            return child.name == "afflictionname."+afflictionXML.attributes.identifier
        });
        this.name = entityName ? entityName.content : "Undefined"
        
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
        if(this.limbspecific == "false") {
            this.indicatorlimb = afflictionXML.attributes.indicatorlimb;
        }

        this.effects = [];

        for (const childNode of afflictionXML.children) {
            let dimension;
            let statusEffects;
            let statValues;
            let spritedims;
            let elementsize;
            let elementindex;
            switch(childNode.name.toLowerCase()) {
                case "icon":
                    spritedims = undefined;
                    if (childNode.attributes.sourcerect)
                        spritedims = childNode.attributes.sourcerect.split(",");
                    
                    if (childNode.attributes.sheetindex) {
                        elementsize = childNode.attributes.sheetelementsize.split(",");
                        elementindex = childNode.attributes.sheetindex.split(",");

                        spritedims = [`${elementsize[0] * elementindex[0]}`, `${elementsize[1] * elementindex[1]}`, `${elementsize[0]}`, `${elementsize[1]}`];
                    }

                    this.icon = {
                        file: fixPath(sourceFile, childNode.attributes.texture),
                        sourcerect: spritedims,
                        color: childNode.attributes.color,
                    }

                    dimension = sizeOf(fixPath(baroPath, sourceFile, childNode.attributes.texture));
                    this.icon.imageSize = [
                        dimension.width,
                        dimension.height,
                    ]
                break;
                case "effect":
                    statusEffects = [];
                    statValues = [];
                    for (const effectNode of childNode.children) {
                        if(effectNode.name.toLowerCase() == "statuseffect") {
                            let affliction = undefined;
                            if(effectNode.children[0]) { // this is a bit hacky, but seems to cover all cases in the vanilla game
                                if(effectNode.children[0].name.toLowerCase() == "affliction") {
                                    affliction = {
                                        identifier: effectNode.children[0].attributes.identifier,
                                        amount: effectNode.children[0].attributes.amount,
                                    }
                                }
                            }
                            
                            statusEffects.push({
                                target: effectNode.attributes.target,
                                speedMultiplier: effectNode.attributes.SpeedMultiplier,
                                setvalue: effectNode.attributes.setvalue,
                                affliction,
                            });
                        }

                        if(effectNode.name.toLowerCase() == "statvalue") {
                            let statvalue = {
                                stattype: effectNode.attributes.stattype,
                                minvalue: effectNode.attributes.minvalue,
                                maxvalue: effectNode.attributes.maxvalue,
                            }
                            
                            statValues.push(statvalue);
                        }
                    }

                    // i wish there was a better way to organise this without being overly complicated
                    this.effects.push({
                        strengthchange: childNode.attributes.strengthchange,
                        minstrength: childNode.attributes.minstrength,
                        maxstrength: childNode.attributes.maxstrength,
                        minvitalitydecrease: childNode.attributes.minvitalitydecrease,
                        maxvitalitydecrease: childNode.attributes.maxvitalitydecrease,
                        multiplybymaxvitality: childNode.attributes.multiplybymaxvitality,
                        minspeedmultiplier: childNode.attributes.minspeedmultiplier,
                        maxspeedmultiplier: childNode.attributes.maxspeedmultiplier,
                        minbuffmultiplier: childNode.attributes.minbuffmultiplier,
                        maxbuffmultiplier: childNode.attributes.maxbuffmultiplier,
                        resistancefor: childNode.attributes.resistancefor,
                        minresistance: childNode.attributes.minresistance,
                        maxresistance: childNode.attributes.maxresistance,
                        statusEffects,
                        statValues,
                    });
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