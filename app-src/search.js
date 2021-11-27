import * as React from "react";
import Data from "./data"
import { pageEventHandler } from "./util";
import { DisplayImageElement } from "./content/components";

// returns search results from a search string
function complexSearch(searchString) {
    // TODO: implement a better search algorithm that allows for multiple complex search functions
    
    if (searchString.trim() == "") return [];
    let searchResults = new Set();
    const searchTokens = searchString.trim().split(" ");
    
    // a complex search means we have to manually iterate over every item, otherwise just delegate searching to the (much better) jsSearch library
    const complexSearchTokens = [];
    const simpleSearchTokens = [];
    for (const searchToken of searchTokens) {
        if (["#", ":", "@"].includes(searchToken.slice(0,1)))
            complexSearchTokens.push(searchToken);
        else
            simpleSearchTokens.push(searchToken);
    }

    if (complexSearchTokens.length) {
        for (const item of Data.items) {
            for (const searchToken of searchTokens) {
                const searchTokenSlice = searchToken.slice(1);
                const firstChar = searchToken.slice(0,1);
                if(!searchTokenSlice.length) continue;

                switch (firstChar) {
                    case "#":
                        if(item.tags?.find(tag => tag.toLowerCase().startsWith(searchTokenSlice)))
                            searchResults.add(item);
                        break;
                    case ":":
                        if((item.category ?? item.afflictiontype)?.toLowerCase().split(",").find(category => category.startsWith(searchTokenSlice)))
                            searchResults.add(item);
                        break;
                    case "@":
                        if(item.type?.toLowerCase().startsWith(searchTokenSlice))
                            searchResults.add(item);
                        break;
                }
            }
        }
    }

    if (simpleSearchTokens.length) {
        for (const searchToken of simpleSearchTokens)
            searchResults = new Set(...searchResults, Data.jsSearch.search(searchToken));
    }

    return Array.from(searchResults);
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