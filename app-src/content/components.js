import * as React from "react";
import { mouseEnterHandler, mouseLeaveHandler } from "./hover";
import { pageEventHandler, getItemByIdentifier } from "../util";

function ItemName(props) {
    const item = props.item;
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
    const tags = props.tags;

    return tags.map(tag => <span className="badge badge-pill badge-primary">{tag}</span>);
}

function Card(props) {
    return (
    <div className='col mb-3'>
        <div className='card'>
            <div className='card-body'>
                <h5 className='card-title'>{props.title}</h5>
                {props.children}
            </div>
        </div>
    </div>
    )
}

// returns a span with a width and height set to optimalSize (maintaining aspect ratio with margins) using background-position to crop an image
function ImageElement(props) {
    const {item, optimalSize, type} = props;

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

        if(img.color) {
            const rgba = img.color.split(",");
            rgba[3] = rgba[3]/255;
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

// returns a span with an inventoryIcon (if possible) or a sprite 
function DisplayImageElement(props) {
    const {item, optimalSize} = props;

    if(item.inventoryIcon) return <ImageElement item={item} optimalSize={optimalSize} type="inventoryIcon" />;
    if(item.sprite) return <ImageElement item={item} optimalSize={optimalSize} type="sprite" />;
    if(item.icon) return <ImageElement item={item} optimalSize={optimalSize} type="icon" />
    
    console.warn(`${item.identifier} has no displayable image`);
    return null;
}

function HoverElement(props) {
    const item = props.item;
    return <span className={"d-inline-block " + props.className}
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

function ReduceAfflictionInfo(props) {
    const { affliction } = props;

    return (
        <div className="col-lg-6 col-12">
            <HoverImageElement className="align-middle mr-3" item={getItemByIdentifier(affliction.identifier)} />
            {affliction.strength ? <span className="mb-2 align-middle d-inline-block mr-3">
                <span className="text-muted mr-1">Strength:</span>
                <span>-{affliction.strength}</span>
            </span> : null}
        </div>
    )
}

function AfflictionInfo(props) {
    const { affliction } = props;

    return (
        <div className="col-lg-6 col-12">
            <HoverImageElement className="mr-2" item={getItemByIdentifier(affliction.identifier)} optimalSize={2.5} />
            <div className="d-inline-block">
                {affliction.strength ? <div className="d-block">
                    <span className="text-muted mr-1">Strength:</span>
                    <span>{affliction.strength}</span>
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
            <span className="text-muted mr-1">{condition.property}</span>
            <span>{condition.condition}</span>
        </div>
    )
}

function Conditionals(props) {
    const { conditionals } = props;

    return conditionals.map(condition => <Conditional condition={condition} />);
}

function StatusEffect(props) {
    const { statusEffect } = props;
    
    return (
        <div className="col">
            <div className="col">
                {statusEffect.type ? <span className="badge badge-pill badge-primary mr-1">{statusEffect.type}</span> : null}
                {statusEffect.target ? <span className="badge badge-pill badge-primary mr-1">{statusEffect.target}</span> : null}
                {statusEffect.removeitem ? <span className="badge badge-pill badge-secondary mr-1">Remove Item</span> : null}
                {statusEffect.disabledeltatime ? <span className="badge badge-pill badge-secondary mr-1">Instant</span> : null}
            </div>
            {statusEffect.requireditems?.length ? <div className="col text-center">
                <span>
                    <span className="mr-1 mb-1 d-inline-block align-middle">Required item{statusEffect.requireditems.length > 1 ? "s" : ""}:</span>
                    {statusEffect.requireditems.map(requireditem =>
                        <HoverImageElement className="align-middle mr-2" item={getItemByIdentifier(requireditem)} />
                    )}
                </span>
            </div> : null}
            {statusEffect.condition ? <div className="col mb-1">
                <span className="text-muted mr-1">Condition:</span>
                <span>{statusEffect.condition}</span>
            </div> : null}
            {statusEffect.afflictions?.length || statusEffect.reduceafflictions?.length  ? <div className="col">
                <h5 className="mt-2">Afflictions:</h5>
                <div className="col row">
                    <AfflictionInfos afflictions={statusEffect.afflictions} reduceafflictions={statusEffect.reduceafflictions} />
                </div>
            </div> : null}
            {statusEffect.explosion ? <div className="col">
                <h5 className="mt-2">Explosion:</h5>
                <Explosion explosion={statusEffect.explosion} />
            </div> : null}
            {statusEffect.conditionals?.length ? <div className="col">
                <h5 className="mt-2">Conditions:</h5>
                <Conditionals conditionals={statusEffect.conditionals} />
            </div> : null}
        </div>
    )
}

function StatusEffects(props) {
    const { statusEffects } = props;

    return statusEffects
        .flatMap(statusEffect => [<StatusEffect statusEffect={statusEffect} />, <hr className="my-3" style={{"border-top": "1px solid rgba(255, 255, 255, .25)"}} />]) // i should really get to bundling the custom css
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
    StatusEffect,
    StatusEffects,
    Explosion,
    AfflictionInfo,
    ReduceAfflictionInfo,
    AfflictionInfos,
    Conditional,
    Conditionals,
}