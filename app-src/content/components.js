import * as React from "react";
import { mouseEnterHandler, mouseLeaveHandler } from "./hover";
import { pageEventHandler, getItemByIdentifier } from "../util";

function ItemName(props) {
    const { item } = props;
    return (
        <div className="col mt-1">
            <p className="display-4">{item.name}</p>
            <span className="text-muted mr-1">Identifier:</span>
            <span>{item.identifier}</span>
        </div>
    )
}

// returns a list of pills with tag names
function TagList(props) {
    const { tags } = props;

    return tags.map(tag => <span className="badge badge-pill badge-primary">{tag}</span>);
}

function Card(props) {
    return (
    <div className="col mb-3">
        <div className="card">
            <div className="card-body">
                <h5 className="card-title">{props.title}</h5>
                {props.children}
            </div>
        </div>
    </div>
    )
}

// returns a span with a width and height set to optimalSize (maintaining aspect ratio with margins) using background-position to crop an image
function ImageElement(props) {
    const {item, optimalSize, type, color} = props;

    const img = item[type];
    if(!img) {
        console.warn(`${item.identifier} has no image of type ${type}`);
        return null;
    }

    try {
        const rect = img.sourcerect;
        const imageSize = img.imageSize;

        // converting the pixel dimensions to relative dimensions
        const widthpx = rect[2];
        const heightpx = rect[3];
        const longestSize = Math.max(widthpx,heightpx);
        
        let optimalWidth;
        let optimalHeight;
        if(widthpx == longestSize) {
            optimalWidth = optimalSize;
            optimalHeight = heightpx/widthpx * optimalSize;
        } else {
            optimalHeight = optimalSize;
            optimalWidth = widthpx/heightpx * optimalSize;
        }

        const imageWidthRel = imageSize[0]/widthpx * optimalWidth;
        const imageHeightRel = imageSize[1]/heightpx * optimalHeight;
        const offsetxRel = rect[0]/widthpx * optimalWidth;
        const offsetyRel = rect[1]/heightpx * optimalHeight;

        const style = {
            width: optimalWidth+"rem",
            height: optimalHeight+"rem",
            background: `url(./${img.file.replaceAll("\\","/")}) no-repeat`,
            backgroundPosition: (-offsetxRel)+"rem "+(-offsetyRel)+"rem",
            backgroundSize: imageWidthRel+"rem "+imageHeightRel+"rem",
            margin: ((optimalSize - optimalHeight)/2)+"rem "+((optimalSize - optimalWidth)/2)+"rem",
        }

        if(img.color || color) {
            const rgba = (img.color ?? color).split(",");
            rgba[3] = (rgba[3] ?? 0)/255;
            style.backgroundColor = `rgba(${rgba.join(",")})`;
            style.backgroundBlendMode = "multiply";
            style.maskImage, style.WebkitMaskImage =  `url(./${img.file.replaceAll("\\","/")})`;
            style.maskMode, style.WebkitMaskMode = "alpha";
            style.maskSize, style.WebkitMaskSize = imageWidthRel+"rem "+imageHeightRel+"rem";
            style.maskPosition, style.WebkitMaskPosition = (-offsetxRel)+"rem "+(-offsetyRel)+"rem";
        }

        return <span className="cropped-image" style={style} />;
    } catch (error) {
        console.error(`Error while calculating image dimensions for ${item.identifier}`);
        console.error(error);
        return null;
    }
}

// finds the correct CroppedImage to display for an item
function DisplayImageElement(props) {
    const { item, optimalSize, color } = props;

    if(item.inventoryIcon) return <ImageElement item={item} optimalSize={optimalSize} type="inventoryIcon" color={color} />;
    if(item.sprite) return <ImageElement item={item} optimalSize={optimalSize} type="sprite" color={color} />;
    if(item.icon) return <ImageElement item={item} optimalSize={optimalSize} type="icon" color={color} />
    if(item.variantof) {
        const variantItem = getItemByIdentifier(item.variantof);
        if(!variantItem)
            console.warn("variantof identifier does not exist");
        
        return <DisplayImageElement item={variantItem} optimalSize={optimalSize} color={item.inventoryIconColor ?? item.spriteColor} />
    }
    
    console.warn(`${item.identifier} has no displayable image`);
    return null;
}

function HoverElement(props) {
    const { item } = props;
    return <span className={`d-inline-block ${props.className}`}
        onMouseEnter={() => mouseEnterHandler(item)}
        onMouseLeave={() => mouseLeaveHandler()}
        onClick={() => pageEventHandler(item)}
        role="button">
            {props.children}
        </span>
}

function HoverImageElement(props) {
    const {item, optimalSize, className} = props;
    return (
        <HoverElement className={className} item={item}>
            <DisplayImageElement item={item} optimalSize={optimalSize ?? 2} />
        </HoverElement>
    )
}

function HoverItemList(props) {
    const { items, optimalSize } = props;

    return items.map(item => <HoverImageElement item={item} optimalSize={optimalSize} />);
}

function Explosion(props) {
    const { explosion } = props;

    return (
        <div className="col">
            {explosion.range ? <div className="col">
                <span className="text-muted mr-1">Range:</span>
                <span>{explosion.range}m</span>
            </div> : null}
            {explosion.force ? <div className="col">
                <span className="text-muted mr-1">Force:</span>
                <span>{explosion.force}</span>
            </div> : null}
            {explosion.itemdamage ? <div className="col">
                <span className="text-muted mr-1">Item damage:</span>
                <span>{explosion.itemdamage}</span>
            </div> : null}
            {explosion.structuredamage ? <div className="col">
                <span className="text-muted mr-1">Structure damage:</span>
                <span>{explosion.structuredamage}</span>
            </div> : null}
            {explosion.ballastfloradamage ? <div className="col">
                <span className="text-muted mr-1">Ballast flora damage:</span>
                <span>{explosion.ballastfloradamage}</span>
            </div> : null}
            {explosion.empstrength ? <div className="col">
                <span className="text-muted mr-1">EMP strength:</span>
                <span>{explosion.empstrength}</span>
            </div> : null}
            {explosion.flames ? <div className="col">
                <span className="text-muted mr-1">Flames:</span>
                <span>{explosion.flames ? "True" : "False"}</span>
            </div> : null}
        </div>
    )
}

/**
 * A function that attempts to predict if a reduceAfflictionInfo afflictionInfo object will match to an affliction by identifier or type
 * @param afflictionInfo
 * @returns Object with bool isIdentifier and a result which is an affliction object if isIdentifier == true or a type string if isIdentifier == false
 */
function predictAfflictionInfo(afflictionInfo) {
    // when reducing an affliction, the game goes through every affliction and does a string comparison of both the identifier and type
    // so an identifier can be a type and a type can be an identifier (though usually they are the correct one)
    
    // assume it's an identifer if it's called an identifier
    if(afflictionInfo.identifier) {
        const afflictionObject = getItemByIdentifier(afflictionInfo.identifier);

        if (!afflictionObject) {
            // it turns out it wasn't an identifier, so instead assume the identifier is actually a type
            return {isIdentifier: false, result: afflictionInfo.identifier};
        } else {
            return {isIdentifier: true, result: afflictionObject};
        }
    }
    
    // assume all types are actually types, because it's impossible to know otherwise (a type can have the same name as an identifier, e.g. burn)
    if (afflictionInfo.type) {
        return {isIdentifier: false, result: afflictionInfo.type}
    }

    // isn't barotrauma great
}

function ReduceAfflictionInfo(props) {
    const { affliction, instant } = props;

    const { isIdentifier, result } = predictAfflictionInfo(affliction);

    return (
        <div className="col-lg-6 col-12">
            {isIdentifier == true ? <HoverImageElement className="align-middle mr-3" item={result} optimalSize={2.5} /> : null}
            {isIdentifier == false ? <span className="mr-2">
                <TagList tags={result.split(",")} />
            </span> : null}
            {affliction.strength ? <span className="mb-2 align-middle d-inline-block mr-3">
                <span className="text-muted mr-1">Strength:</span>
                <span className="text-danger">-{affliction.strength}{instant == "true" ? "" : "/s"}</span>
            </span> : null}
        </div>
    )
}

function AfflictionInfo(props) {
    const { affliction, instant } = props;

    return (
        <div className="col-lg-6 col-12">
            <HoverImageElement className="mr-2" item={getItemByIdentifier(affliction.identifier)} optimalSize={2.5} />
            <div className="d-inline-block">
                {affliction.strength ? <div className="d-block">
                    <span className="text-muted mr-1">Strength:</span>
                    <span className="text-success">{affliction.strength}{instant == "true" ? "" : "/s"}</span>
                </div> : null}
                {affliction.probability ? <div className="d-inline-block">
                    <span className="text-muted mr-1">Chance:</span>
                    <span>{(affliction.probability*100).toFixed(1)}%</span>
                </div> : null}
            </div>
        </div>
    )
}

function AfflictionInfos(props) {
    const { afflictions, reduceafflictions } = props;

    return [].concat(
        afflictions?.length ? afflictions.map(affliction => <AfflictionInfo affliction={affliction} />) : [], 
        reduceafflictions?.length ? reduceafflictions.map(affliction => <ReduceAfflictionInfo affliction={affliction} />) : []
    );
}

function Conditional(props) {
    const { condition } = props;

    return (
        <div className="col">
            <span className="text-muted mr-1">{condition.property}:</span>
            <span>{condition.condition}</span>
        </div>
    )
}

function Conditionals(props) {
    const { conditionals } = props;

    return conditionals.map(condition => <Conditional condition={condition} />);
}

function StatusEffect(props) {
    const { statuseffect } = props;

    const possibleStatValues = ["healthmultiplier","speedmultiplier"];
    
    return (
        <div className="col">
            <div className="col">
                {statuseffect.type ? <span className="badge badge-pill badge-primary mr-1">{statuseffect.type}</span> : null}
                {statuseffect.target ? <span className="badge badge-pill badge-primary mr-1">{statuseffect.target}</span> : null}
                {statuseffect.removeitem ? <span className="badge badge-pill badge-secondary mr-1">Remove Item</span> : null}
                {statuseffect.duration ? <span className="badge badge-pill badge-secondary mr-1">{statuseffect.duration}s</span> : null}
                {statuseffect.delay ? <span className="badge badge-pill badge-secondary mr-1">Delay: {statuseffect.delay}s</span> : null}
                {statuseffect.range ? <span className="badge badge-pill badge-secondary mr-1">Range: {statuseffect.range/100}m</span> : null}
                {statuseffect.disabledeltatime ? <span className="badge badge-pill badge-secondary mr-1">Instant</span> : null}
                {statuseffect.setvalue ? <span className="badge badge-pill badge-secondary mr-1">Set Value</span> : null}
            </div>
            {statuseffect.requireditems?.length ? <div className="col text-center">
                <span>
                    <span className="mr-1 mb-1 d-inline-block align-middle">Required item{statuseffect.requireditems.length > 1 ? "s" : ""}:</span>
                    {statuseffect.requireditems.map(requireditem =>
                        <HoverImageElement className="align-middle mr-2" item={getItemByIdentifier(requireditem)} />
                    )}
                </span>
            </div> : null}
            {statuseffect.condition ? <div className="col mb-1">
                <span className="text-muted mr-1">Condition:</span>
                <span>{statuseffect.condition}</span>
            </div> : null}
            {possibleStatValues.map(statValue => statuseffect[statValue] ? <div className="col mb-1">
                <span className="text-muted mr-1">{statValue}:</span>
                <span>{statuseffect[statValue]}</span>
            </div> : null)}
            {statuseffect.afflictions?.length || statuseffect.reduceafflictions?.length  ? <div className="col">
                <h5 className="mt-2">Afflictions:</h5>
                <div className="col row">
                    <AfflictionInfos afflictions={statuseffect.afflictions} reduceafflictions={statuseffect.reduceafflictions} instant={statuseffect.disabledeltatime} />
                </div>
            </div> : null}
            {statuseffect.explosions?.length ? <div className="col">
                <h5 className="mt-2">Explosion:</h5>
                {statuseffect.explosions.flatMap(explosion => [<Explosion explosion={explosion} />, <hr className="my-2" />]).slice(0, -1)}
            </div> : null}
            {statuseffect.conditions?.length ? <div className="col">
                <h5 className="mt-2">Conditions:</h5>
                {statuseffect.conditional ? <div className="col mb-1">
                    <span className="text-muted mr-1">Condition:</span>
                    <span>{statuseffect.conditional}</span>
                </div> : null}
                <Conditionals conditionals={statuseffect.conditions} />
            </div> : null}
        </div>
    )
}

function StatusEffects(props) {
    const { statuseffects } = props;

    return statuseffects
        .flatMap(statuseffect => [<StatusEffect statuseffect={statuseffect} />, <hr className="my-2" />])
        .slice(0, -1);
}

export {
    ItemName,
    TagList,
    Card,
    ImageElement,
    DisplayImageElement,
    HoverElement,
    HoverImageElement,
    HoverItemList,
    StatusEffect,
    StatusEffects,
    Explosion,
    AfflictionInfo,
    predictAfflictionInfo,
    ReduceAfflictionInfo,
    AfflictionInfos,
    Conditional,
    Conditionals,
}