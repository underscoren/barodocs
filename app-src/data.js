import $ from "jquery";

// not the best way to store globals, but better than polluting the global scope
class Data {
    static loaded;
    static items;
    static jsSearch;
    static isClick;

    constructor() {
        Data.loaded = false;
        Data.isClick = false;
    }

    static load() {
        return new Promise((resolve, reject) => {
            $.getJSON("Content/items.json", json => {
                console.log("Loaded JSON");
                Data.items = json;
                resolve(json);
            }).fail(err => {
                reject(err);
            });
        });
    }
}

export default Data;