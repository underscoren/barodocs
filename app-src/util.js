import * as React from "react";
import * as ReactDOM from "react-dom";
import $ from "jquery";
import Data from "./data";
import { ItemPage } from "./item";
import Page from "./page";
import { mouseEnterHandler, mouseLeaveHandler } from "./hover";

// returns a list of pills with tag names
function TagList(props) {
    const tags = props.tags;

    return tags.map(tag => <span className="badge badge-pill badge-primary">{tag}</span>);
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
            margin: ((optimalSize - optimalHeight)/2 - 0.25)+"rem "+((optimalSize - optimalWidth)/2)+"rem",
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

    if(item.inventoryIcon) return (<ImageElement item={item} optimalSize={optimalSize} type="inventoryIcon" />);
    if(item.sprite) return (<ImageElement item={item} optimalSize={optimalSize} type="sprite" />);
    
    console.warn(`${item.identifier} has no displayable image`);
    return null;
}

function HoverImageElement(props) {
    const {item, optimalSize} = props;
    return <span className="d-inline-block"
        onMouseEnter={() => mouseEnterHandler(item)} 
        onMouseLeave={() => mouseLeaveHandler()} 
        onClick={() => pageEventHandler(item)}>
            <DisplayImageElement item={item} optimalSize={optimalSize} />
        </span>
}

// returns the item object using a given identifier
function getItemByIdentifier(itemName) {
    if(!Data.loaded) {
        console.error("Items have not been loaded");
        return;
    }
    
    const itemObj = Data.items.find(i => {return i.identifier === itemName});    
    if(!itemObj) {
        console.warn(`Cannot find ${itemName}`);
        return;
    }

    return itemObj;
}

// returns the item or finds the object if a string is passed
function getItemIfNeeded(possibleItemObject) {
    if(typeof possibleItemObject == "string") {
        const itemObj = getItemByIdentifier(possibleItemObject);
        if(!itemObj) return;
        
        return itemObj;
    }
    
    return possibleItemObject;
}

// returns the correct page content for different item types
function PageContents(props) {
    const item = props.item
    switch(item.type) {
        case "item":
            return <ItemPage item={item} />
        //case "affliction":
            //return getAfflictionPageContents(item);
        default:
            console.log(item);
            console.error("Unknown item type",item.type);
            return <Page><p className="mt-5 text-danger text-center">Error</p></Page>;
    }
}

// tells react to render the page
function renderPage(itemObj) {
    ReactDOM.render(
        <PageContents item={itemObj} />,
        $("#page")[0]
    )
}

// used by other components to set the page contents
function pageEventHandler(item) {
    const itemObj = getItemIfNeeded(item);
    Data.isClick = true; // prevent the page from rendering twice
    window.location.hash = itemObj.identifier;
    $("#search").hide();
    $("#sidebar").show();
    $("#sidebar, .overlay").removeClass("active");
    $("#hover").hide();
    renderPage(itemObj);
}

export {
    TagList,
    ImageElement, 
    DisplayImageElement, 
    getItemByIdentifier, 
    getItemIfNeeded,
    PageContents,
    renderPage,
    pageEventHandler,
    HoverImageElement,
}