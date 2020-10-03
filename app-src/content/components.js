import * as React from "react";
import { mouseEnterHandler, mouseLeaveHandler } from "./hover";
import { pageEventHandler } from "../util";

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
    const item = props.item;
    const optimalSize = props.optimalSize;

    const img = item[props.type];
    if(!img) {
        console.warn(`${item.identifier} has no ${props.type}`);
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

        return (<span className="cropped-image" style={style} />);
    } catch (error) {
        console.error(`Error while calculating image dimensions for ${item.identifier}`);
        console.error(error);
        return null;
    }
}

// returns a span with an inventoryIcon (if possible) or a sprite 
function DisplayImageElement(props) {
    const item = props.item;
    const optimalSize = props.optimalSize;

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
    const {item, optimalSize} = props;
    return <HoverElement item={item}>
            <DisplayImageElement item={item} optimalSize={optimalSize} />
        </HoverElement>
    
}

export {
    ItemName,
    TagList,
    Card,
    ImageElement,
    DisplayImageElement,
    HoverElement,
    HoverImageElement,
}