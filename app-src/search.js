import * as React from "react";
import Data from "./data"
import { pageEventHandler } from "./util";
import { DisplayImageElement } from "./content/components";

// returns search results from a search string
function complexSearch(searchString) {
    // TODO: implement a better search algorithm that allows for multiple complex search functions
    if(searchString.toLowerCase().startsWith("#")) {
        const searchStringTrimmed = searchString.slice(1).toLowerCase();
        if(searchStringTrimmed.length == 0) return [];
        const results = [];
        
        for (const item of Data.items) {
            if(item.tags) {
                if(item.tags.filter(tag => {return tag.startsWith(searchStringTrimmed)}).length)
                    results.push(item);
            }
        }

        return results;
    }
    
    if(searchString.toLowerCase().startsWith(":")) {
        const searchStringTrimmed = searchString.slice(1).toLowerCase();
        if(searchStringTrimmed.length == 0) return [];
        const results = [];

        for (const item of Data.items) {
            if(item.category) {
                if(item.category.toLowerCase().startsWith(searchStringTrimmed))
                    results.push(item);
            }
        }

        return results;
    }

    if(searchString.toLowerCase().startsWith("@")) {
        const searchStringTrimmed = searchString.slice(1).toLowerCase();
        if(searchStringTrimmed.length == 0) return [];
        const results = [];

        for (const item of Data.items) {
            if(item.type) {
                if(item.type.toLowerCase().startsWith(searchStringTrimmed))
                    results.push(item);
            }
        }

        return results;
    }
    
    return Data.jsSearch.search(searchString);
}

// returns an array of li elements containing search results
function SearchResult(props) {
    const result = props.result;

    if(props.displayImage) {
        return (
            <li className="d-flex align-items-center" onClick={() => pageEventHandler(result)} >
                <span className="m-1">
                    <DisplayImageElement item={result} optimalSize={2} />
                </span>
                <span className="text-primary ml-2">{result.name}</span>
                <span className="text-secondary small ml-1">{result.identifier}</span>
            </li>
        )
    } else {
        return (
            <li className="p-1" onClick={() => pageEventHandler(result)} >
                <span className="text-white">{result.name}</span>
                <span className="text-secondary small ml-1">{result.identifier}</span>
            </li>
        )
    }
}

// front page searchbar
class MainSearchbar extends React.Component {
    handleInput(event) {
        const results = complexSearch(event.target.value);
        const top10 = results.slice(0,10);
        this.setState({results: top10});
    }

    constructor() {
        super();
        this.state = {
            results: []
        }

        this.handleInput = this.handleInput.bind(this);
    }

    render() {
        return [
            <input placeholder="Search" className="w-100 mt-3 p-2" type="text" id="searchbar" onChange={this.handleInput} />,
            <ul id="search-results" className="bg-light" style={this.state.results.length ? null : {display: "none"}} >
                {this.state.results.map(result => 
                    <SearchResult result={result} displayImage={true} />
                )}
            </ul>
        ]
    }
}

// sidebar search bar
class SidebarSearchbar extends React.Component {
    handleInput(event) {
        const results = complexSearch(event.target.value);
        this.setState({results: results});
    }

    constructor() {
        super();
        this.state = {
            results: []
        }

        this.handleInput = this.handleInput.bind(this);
    }

    render() {
        return [
            <div className="d-flex border-bottom mt-4">
                <input placeholder="Search" type="text" className="m-2 p-1 d-flex flex-fill" id="sidebar-searchbar" onChange={this.handleInput} />
            </div>,
            <ul id="sidebar-results" className="w-100 list-unstyled" results={this.state.results} >
                {this.state.results.map(result => 
                    <SearchResult result={result} key={result.identifier} onClick={() => pageEventHandler(result)} />
                )}
            </ul>
        ]
    }
}

export {
    MainSearchbar,
    SidebarSearchbar,
}