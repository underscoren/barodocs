const { fixPath, getCaseInsensetiveKey } = require("./util");
const sizeOf = require("image-size");

class AiTarget {
    sightrange;
    minsightrange;
    maxsightrange;

    soundrange;
    minsoundrange;
    maxsoundrange;

    fadeouttime;
    static;
    sonardisruption;

    constructor(XMLelement) {
        for(const potentialAttribute of Object.keys(this))
            this[potentialAttribute] = getCaseInsensetiveKey(XMLelement.attributes, potentialAttribute);
    }
}

class Attack {
    itemdamage;
    structuredamage;
    ballastfloradamage;

    onlyhumans;
    severlimbsprobability;
    targetimpulse;
    targetforce;
    
    afflictions = [];
    statuseffects = [];
    conditions = [];

    constructor(XMLelement) {
        const possibleAttributes = ["itemdamage","structuredamage","ballastfloradamage","stun","onlyhumans","severlimbsprobability","targetimpulse","targetforce"];
        for (const attributeName of possibleAttributes)
            this[attributeName] = getCaseInsensetiveKey(XMLelement.attributes, attributeName);
        
        for (const childElement of XMLelement.children) {
            switch(childElement.name.toLowerCase()) {
                case "affliction":
                    this.afflictions.push({
                        identifier: childElement.attributes.identifier,
                        strength: childElement.attributes.amount ?? childElement.attributes.strength,
                        probability: childElement.attributes.probability
                    });
                    break;
                case "statuseffect":
                    this.statuseffects.push(new StatusEffect(childElement));
                    break;
                case "conditionals":
                    for (const attributeName of Object.keys(childElement.attributes)) {
                        const attributeValue = childElement.attributes[attributeName];

                        this.conditions.push({
                            property: attributeName,
                            condition: attributeValue
                        });
                    }
                    break;
            }
        }
    }
}

class Explosion {
    range;
    itemdamage;
    structuredamage;
    ballastfloradamage;
    empstrength;
    force;
    flames;

    constructor(XMLelement) {
        for (const attributeName of Object.keys(XMLelement.attributes)) {
            const attributeValue = XMLelement.attributes[attributeName];

            switch (attributeName.toLowerCase()) {
                case "range":
                    this.range = attributeValue;
                break;
                case "itemdamage":
                    this.itemdamage = attributeValue;
                break;
                case "structuredamage":
                    this.structuredamage = attributeValue;
                break;
                case "ballastfloradamage":
                    this.ballastfloradamage = attributeValue;
                break;
                case "empstrength":
                    this.empstrength = attributeValue;
                break;
                case "force":
                    this.force = attributeValue;
                break;
                case "flames":
                    this.flames = attributeValue;
                break;
            }
        }
    }
}

class SpawnItemInfo {
    identifier;
    spawnifinventoryfull;
    speed;
    rotation;
    count;
    spread;
    aimspread;
    equip;
    spawnposition;
    rotationtype;

    constructor(XMLelement) {
        for (const key of Object.keys(this))
            this[key] = XMLelement.attributes[key];
        
        this.identifier = XMLelement.attributes.identifier ?? XMLelement.attributes.identifiers;
    }
}

class SpawnCharacterInfo {
    name;
    speciesname;
    count;
    spread;
    offset;

    constructor(XMLelement) {
        for (const key of Object.keys(this))
            this[key] = XMLelement.attributes[key];
    }
}

class StatusEffect {
    type;
    target;
    condition;
    duration;
    delay;
    requireditems = [];
    spawnitems = [];
    //spawnCharacters = [];

    afflictions = [];
    reduceafflictions = [];
    requiredafflictions = [];
    explosions = [];

    healthmultiplier;
    speedmultiplier;

    disabledeltatime;
    setvalue;
    severlimbsprobability;
    fire;
    useitem;
    removeitem;
    conditional;
    conditions = [];
    giveexperiences = [];
    giveskills = [];

    //removeCharacter;
    //breakLimb;

    constructor(XMLelement) {
        for (const attributeName of Object.keys(XMLelement.attributes)) {
            const attributeValue = XMLelement.attributes[attributeName];

            switch (attributeName.toLowerCase()) {
                case "type":
                    this.type = attributeValue;
                    break;
                case "target":
                    this.target = attributeValue;
                    break;
                case "condition":
                    this.condition = attributeValue;
                    break;
                case "duration":
                    this.duration = attributeValue;
                    break;
                case "delay":
                    this.delay = attributeValue;
                    break;
                case "disabledeltatime":
                    this.disabledeltatime = attributeValue;
                    break;
                case "setvalue":
                    this.setvalue = attributeValue;
                    break;
                case "conditional":
                    this.conditional = attributeValue;
                    break;
                case "healthmultiplier":
                    this.healthmultiplier = attributeValue;
                    break;
                case "speedmultiplier":
                    this.speedmultiplier = attributeValue;
                    break;
                case "severlimbs":
                case "severlimbsprobability":
                    this.severlimbsprobability = attributeValue;
                    break;
                case "allowedafflictions":
                case "requiredafflictions":
                    const types = value.split(",");
                    for(const type of types)
                        this.requiredafflictions.push(type.trim().toLowerCase());
                    break;
            }
        }

        for (const childElement of XMLelement.children) {

            switch (childElement.name.toLowerCase()) {
                case "explosion":
                    this.explosions.push(new Explosion(childElement));
                    break;
                case "fire":
                    this.fire = childElement.attributes.size;
                    break;
                case "use":
                case "useitem":
                    if(!this.useitem)
                        this.useitem = 1;
                    else
                        this.useitem++;
                    break;
                case "remove":
                case "removeitem":
                    this.removeitem = true;
                    break;
                case "removecharacter":
                    //this.removeCharacter = true;
                    break;
                case "breaklimb":
                    //this.breakLimb = true;
                    break;
                case "requireditem":
                case "requireditems":
                    for (const attributeName of Object.keys(childElement.attributes)) {
                        const attributeValue = childElement.attributes[attributeName]
                        switch (attributeName.toLowerCase()) {
                            case "identifiers":
                            case "identifier":
                            case "items":
                            case "item":
                            case "tags":
                            case "tag":
                                this.requireditems = this.requireditems.concat(attributeValue.split(",").map(e => e.trim().toLowerCase()));
                                break;
                            }
                        }
                    break;
                case "requiredaffliction":
                    for (const attributeName of Object.keys(childElement.attributes)) {
                        const attributeValue = childElement.attributes[attributeName]
                        switch (attributeName.toLowerCase()) {
                            case "identifier":
                            case "type":
                                this.requiredafflictions = this.requiredafflictions.concat(
                                    attributeValue.split(",")
                                        .map(e => ({identifier: e.trim().toLowerCase(), minstrength: childElement.attributes.minstrength}))
                                );
                            break;
                        }
                    }
                    break;
                case "conditional":
                    for (const attributeName of Object.keys(childElement.attributes)) {
                        const attributeValue = childElement.attributes[attributeName]
                        this.conditions.push({
                            property: attributeName,
                            condition: attributeValue
                        })
                    }
                    break;
                case "affliction":
                    this.afflictions.push({
                        identifier: childElement.attributes.identifier,
                        strength: childElement.attributes.amount ?? childElement.attributes.strength,
                        probability: childElement.attributes.probability
                    });
                    break;
                case "reduceaffliction":
                    this.reduceafflictions.push({
                        identifier: childElement.attributes.identifier,
                        type: childElement.attributes.type,
                        strength: childElement.attributes.amount ?? childElement.attributes.strength ?? childElement.attributes.reduceamount,
                    });
                    break;
                case "spawnitem":
                    this.spawnitems.push(new SpawnItemInfo(childElement));
                    break;
                case "spawncharacter":
                    //this.spawncharacters.push(new SpawnCharacterInfo(childElement));
                    break;
                case "givetalentinfo":
                    //this.givetalents.push(new GiveTalentInfo(childElement));
                    break;
                case "giveexperience":
                    this.giveexperiences.push(childElement.attributes.amount);
                    break;
                case "giveskill":
                    this.giveskills.push({
                        identifier: childElement.attributes.skillidentifier, 
                        amount: childElement.attributes.amount,
                    });
                    break;
            }
        }
    }
}

class CroppedImage {
    file;
    sourcerect;
    color;
    imageSize;

    constructor(XMLelement, baroPath, sourceFile) {
        if (XMLelement.attributes.sourcerect)
            this.sourcerect = XMLelement.attributes.sourcerect.split(",");
        
        if (XMLelement.attributes.sheetindex) {
            const elementsize = XMLelement.attributes.sheetelementsize.split(",");
            const elementindex = XMLelement.attributes.sheetindex.split(",");

            this.sourcerect = [`${elementsize[0] * elementindex[0]}`, `${elementsize[1] * elementindex[1]}`, `${elementsize[0]}`, `${elementsize[1]}`];
        }
        
        this.file = fixPath(sourceFile, XMLelement.attributes.texture);

        const dimension = sizeOf(fixPath(baroPath, sourceFile, XMLelement.attributes.texture));
        this.imageSize = [
            dimension.width,
            dimension.height,
        ]
    }
}

module.exports = {
    AiTarget,
    Attack,
    Explosion,
    SpawnItemInfo,
    StatusEffect,
    CroppedImage,
}