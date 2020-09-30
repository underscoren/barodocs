import $ from "jquery";
import "popper.js";
import "bootstrap";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as JsSearch from 'js-search';

import Data from "./data";
import { MainSearchbar, SidebarSearchbar } from "./search";
import { getItemByIdentifier, renderPage } from "./util";

// setup event handlers for dismissing the sidebar
$("#sidebar-dismiss, .overlay").on("click", () => {
    $("#sidebar, .overlay").removeClass("active");
});

// update hover element position on mousemove
$(document).on("mousemove", event => {
    const hover = $("#hover");
    hover.css({
        "top": `${event.pageY - hover.height() - 10}px`,
        "left": `${Math.min(event.pageX + 10, window.innerWidth - hover.width() - 10)}px`,
    });
});

// load json and render components
new Data();
Data.load().then(json => {
    Data.jsSearch = new JsSearch.Search("identifier");
    Data.jsSearch.addIndex("name");
    Data.jsSearch.addIndex("identifier");
    Data.jsSearch.addDocuments(json);
    Data.loaded = true;

    ReactDOM.render(
        <MainSearchbar />,
        $("#mainsearchbar")[0]
    );

    ReactDOM.render(
        <SidebarSearchbar />,
        $("#sidebarsearchbar")[0]
    );

    const setupPage = () => {
        if(Data.isClick) return Data.isClick = false;
        $("#search").hide();
        $("#sidebar").show();
        const item = getItemByIdentifier(window.location.hash.slice(1));
        renderPage(item);
    }

    // if the url hash is set, automatically render the correct page
    if(window.location.hash) {
        setupPage();
    }

    // if the window hash is changed (e.g. via going back/forward in history), render the correct page
    $(window).on("hashchange", () => {
        setupPage();
    });
    
}).catch(err => {
    console.error("Error loading items.json");
    console.error(err);
})