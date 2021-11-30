import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import { getItemIfNeeded } from "../util";
import { TagList, DisplayImageElement } from "./components";

// gets the contents of the hover element from an item
function HoverContentsItem(props) {
    const { item } = props;

    return <>
        <div className="col mt-2">
            <span className="h5 text-primary mr-1">{item.name}</span>
            <span className="h6 text-secondary">{item.identifier}</span>
        </div>
        <div className="col my-2">
            {item.category ? <span className="h6 text-info mr-1">{item.category}</span> : null }
            {(item.category && item.tags) ? <span className="h6 text-secondary mr-1">|</span> : null}
            {item.tags ? <TagList tags={item.tags} /> : null}
        </div>
        <div className="mx-auto d-block" style={{width: "5rem"}}>
            <DisplayImageElement item={item} optimalSize={5} />
        </div>
    </>
}

function HoverContentsAffliction(props) {
    const { affliction } = props;

    return <>
        <div className="col mt-2">
            <span className="h5 text-primary">{affliction.name}</span>
            <span className="h6 text-secondary ml-1">{affliction.identifier}</span>
        </div>
        <div className="col my-2">
            <span className="h6 text-info mr-1">{affliction.afflictiontype}</span>
        </div>
        <div className="mx-auto d-block" style={{width: "5rem"}}>
            <DisplayImageElement item={affliction} optimalSize={5} />
        </div>
    </>
}

function HoverContents(props) {
    const { item } = props;

    switch(item.type) {
        case "item":
            return <HoverContentsItem item={item} />
        case "affliction":
            return <HoverContentsAffliction affliction={item} />
        default:
            console.warn("Unknown item type");
            return <div className="m-3"><p className="text-error">Error</p></div>;
    }
}

function mouseEnterHandler(item) {
    item = getItemIfNeeded(item);
    $("#hover").show();
    ReactDOM.render(
        <HoverContents item={item} />,
        $("#hover")[0]
    )
}

function mouseLeaveHandler() {
    $("#hover").hide()
}

export {
    HoverContents,
    mouseEnterHandler,
    mouseLeaveHandler,
}