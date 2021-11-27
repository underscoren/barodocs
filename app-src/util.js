import * as React from "react";
import * as ReactDOM from "react-dom";
import $ from "jquery";
import Data from "./data";
import { ItemPage } from "./content/item";
import { AfflictionPage } from "./content/affliction";
import Page from "./page";

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
    const { item } = props;

    if(!item) {
        return (
            <Page>
                <p className="mt-5 display-4 text-danger text-center">Error</p>
                <div className="col mr-4 mt-3">
                    <p>Item does not exist</p>
                </div>
            </Page>
        );
    }

    switch(item.type) {
        case "item":
            return <ItemPage item={item} />
        case "affliction":
            return <AfflictionPage affliction={item} />;
        default:
            console.log(item);
            console.error("Unknown item type",item.type);
            return (
                <Page>
                    <p className="mt-5 display-4 text-danger text-center">Error</p>
                    <div className="col mr-4 mt-3">
                        <p>Unknown item type</p>
                    </div>
                </Page>
            );
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
    $("#page").show(); // make sure the page is actually shown
    $("#search").hide();
    $("#sidebar").show();
    $("#sidebar, .overlay").removeClass("active");
    $("#hover").hide();
    renderPage(itemObj);
}

export {
    getItemByIdentifier, 
    getItemIfNeeded,
    PageContents,
    renderPage,
    pageEventHandler,
}