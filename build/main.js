// returns a span with a width and height (in rem) set to optimalSize (maintaining aspect ratio with margins) using the background and background-position to crop an image
function getImageElement(item, optimalSize, type) {
    let img = item[type];
    if(!img) {
        console.warn(`${item.identifier} has no ${type}`);
        return $("<span>");
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

        const imageWidthRem = imageSize[0]/widthpx * optimalWidth;
        const imageHeightRem = imageSize[1]/heightpx * optimalHeight;
        const offsetxRem = rect[0]/widthpx * optimalWidth;
        const offsetyRem = rect[1]/heightpx * optimalHeight;

        return $(`<span class="cropped-image" style="width:${optimalWidth}rem; height:${optimalHeight}rem; background:url(./${img.file.replaceAll("\\","/")}) no-repeat; background-position: -${offsetxRem}rem -${offsetyRem}rem; background-size: ${imageWidthRem}rem ${imageHeightRem}rem; margin: ${(optimalSize - optimalHeight)/2 - 0.25}rem ${(optimalSize - optimalWidth)/2}rem;">`);
    } catch (error) {
        console.error(`Error while calculating image dimensions for ${item.identifier}`);
        console.error(error);
        return $("<span>");
    }
}

// returns a span with an inventoryIcon (if possible) or a sprite 
function getDisplayImageElement(item, optimalSize) {
    if(item.inventoryIcon) return getImageElement(item, optimalSize, "inventoryIcon");
    if(item.sprite) return getImageElement(item, optimalSize, "sprite");
    
    console.warn(`${item.identifier} has no sprite or inventoryIcon`);
    return $("<span>");
}

// gets the contents of the hover element from an item
function getHoverElementContents(item) {
    //console.log(item);
    let elements = [
        $("<div class='col mt-2'>").append(
            $("<span class='h5 text-primary'>").append(item.name),
            $("<span class='h6 text-secondary ml-1'>").append(item.identifier)
        ),
        $("<div class='col my-2'>").append(
            item.category ? $("<span class='h6 text-info mr-1'>").append(item.category) : [],
            (item.category && item.tags) ? $("<span class='h6 text-secondary mr-1'>").append("|") : [],
            item.tags ? item.tags.map(tag => {return $("<span class='badge badge-pill badge-primary'>").append(tag)}) : [],
        )
    ];

    const imageElement = getDisplayImageElement(item, 5);
    imageElement.css("margin-left","");
    imageElement.css("margin-top","");
    elements.push($(`<div class="mx-auto d-block" style="width:${imageElement.css("width")}">`).append(imageElement));

    return elements;
}

// gets the contents of the page from an item
function getPageContents(item) {
    console.log(item);

    $("#sidebar, .overlay").removeClass("active");

    const sidebarButton = $("<button role='button' class='btn btn-secondary position-absolute p-2' style='top: 1rem; left: 1rem;'>").append(">");
    $(sidebarButton).on("click", () => {
        $("#sidebar, .overlay").addClass("active");
    })

    // TODO? maybe using react would be a better idea...
    const elements = [
        $("<div class='mt-5'>").append(
            sidebarButton,
            $("<div class='col-lg-8 col-sm-12 d-inline-block'>").append(
                $("<div class='col mt-1'>").append(
                    $("<p class='display-4'>").append(item.name),
                    $("<span class='text-muted mr-1'>").append("Identifier:"),
                    $("<span class='text-secondary'>").append(item.identifier)
                ),
                $("<div class='col'>").append(
                    item.category ? [
                        $("<span class='text-muted mr-1'>").append("Category:"),
                        $("<span class='text-info mr-1'>").append(item.category)
                    ] : [],
                    item.tags ? $("<span class='text-muted mr-1'>").append("Tags:") : [],
                    item.tags ? item.tags.map(tag => {return $("<span class='badge badge-pill badge-primary'>").append(tag)}): [],
                ),
                $("<div class='col'>").append(
                    $("<span class='text-muted mr-1'>").append("Source File:"),
                    $("<span class='text-success'>").append(item.sourceFile)
                ),
            ),
            $("<div class='col-lg-4 col-sm-12 d-inline-block'>").append(
                $("<div class='col mt-sm-3 mt-xl-0'>").append(
                    item.sprite ? getImageElement(item, 8, "sprite") : [],
                    item.inventoryIcon ? getImageElement(item, 8, "inventoryIcon") : [],
                ),
            ),
            $("<p class='lead col-12 mt-4'>").append(item.description),
            $("<hr class='border-primary' style='width: calc(100% - 2rem);'>")
        ),
    ];

    const cardDeck = $("<div id='card-deck' class='row col-12 row-cols-xl-3 row-cols-lg-2 row-cols-1'>");
    elements[0].append(cardDeck);

    if(item.price) {
        cardDeck.append(
            $("<div class='col mb-3'>").append(
                $("<div class='card'>").append(
                    $("<div class='card-body'>").append(
                        $("<h5 class='card-title'>").append("Price"),
                        $("<div class='card-text text-centered mb-2'>").append(
                            $("<span class='text-muted mr-1'>").append("Base:"),
                            $("<span>").append(item.price.baseprice),
                        ),
                        $("<table class='table table-bordered'>").append(
                            $("<thead><tr><th scope='col'>CIT</th><th scope='col'>MIL</th><th scope='col'>MIN</th><th scope='col'>OUT</th><th scope='col'>RES</th></tr></thead>"),
                            $("<tbody>").append(
                                $("<tr>").append(
                                    $("<td>").append((item.price.city.multiplier * item.price.baseprice) >> 0),
                                    $("<td>").append((item.price.military.multiplier * item.price.baseprice) >> 0),
                                    $("<td>").append((item.price.mine.multiplier * item.price.baseprice) >> 0),
                                    $("<td>").append((item.price.outpost.multiplier * item.price.baseprice) >> 0),
                                    $("<td>").append((item.price.research.multiplier * item.price.baseprice) >> 0),
                                ),
                                $("<tr>").append(
                                    $("<td>").append(item.price.city.sold == "false" ? "✘" : "✓"),
                                    $("<td>").append(item.price.military.sold == "false" ? "✘" : "✓"),
                                    $("<td>").append(item.price.mine.sold == "false" ? "✘" : "✓"),
                                    $("<td>").append(item.price.outpost.sold == "false" ? "✘" : "✓"),
                                    $("<td>").append(item.price.research.sold == "false" ? "✘" : "✓"),
                                )
                            )
                        )
                    )
                )
            )
        )
    }

    if(item.deconstruct) {
        cardDeck.append(
            $("<div class='col mb-3'>").append(
                $("<div class='card'>").append(
                    $("<div class='card-body'>").append(
                        $("<h5 class='card-title'>").append("Deconstruct"),
                        $("<div class='card-text mb-2'>").append(
                            $("<span class='text-muted mr-1'>").append("Time:"),
                            $("<span>").append(item.deconstruct.time+"s")
                        ),
                        item.deconstruct.items.map(i => {
                            const itemObj = getItemByIdentifier(i);
                            const itemElement = $("<div class='p-2 d-inline-block' role='button' style='height: 3.5rem;'>").append(
                                getDisplayImageElement(itemObj, 3.5),
                            );
                            addPageEventHandlers(itemElement, itemObj);
                            addHoverEventHandlers(itemElement, itemObj);
                            return itemElement;
                        }),
                    )
                )
            )
        )
    }

    if(item.fabricate) {
        const fabricatorObject = getItemByIdentifier(item.fabricate.fabricators);
        const fabricatorElement = $("<span>");
        if(fabricatorObject) {
            fabricatorElement.append(fabricatorObject.name);
            addHoverEventHandlers(fabricatorElement, fabricatorObject);
        } else {
            fabricatorElement.append(item.fabricate.fabricators);
        }

        cardDeck.append(
            $("<div class='col mb-3'>").append(
                $("<div class='card'>").append(
                    $("<div class='card-body'>").append(
                        $("<h5 class='card-title'>").append("Fabricate"),
                        $("<div class='card-text'>").append(
                            $("<span class='text-muted mr-1'>").append("Time:"),
                            $("<span>").append(item.fabricate.time+"s")
                        ),
                        item.fabricate.skill ? $("<div class='card-text'>").append(
                            $("<span class='text-muted mr-1'>").append("Skill:"),
                            $("<span class='text-info mr-1'>").append(item.fabricate.skill.name),
                            $("<span>").append("["+item.fabricate.skill.level+"]"),
                        ) : [],
                        $("<div class='card-text mb-2'>").append(
                            $("<span class='text-muted mr-1'>").append("Made in:"),
                            fabricatorElement,
                        ),
                        item.fabricate.items.map(i => {
                            const itemObj = getItemByIdentifier(i);
                            const itemElement = $("<div class='p-2 d-inline-block' role='button' style='height: 3.5rem;'>").append(
                                getDisplayImageElement(itemObj, 3.5),
                            );
                            addPageEventHandlers(itemElement, itemObj);
                            addHoverEventHandlers(itemElement, itemObj);
                            return itemElement;
                        }),
                    )
                )
            )
        )
    }

    const usedByItemList = [];
    const madeByItemList = [];

    for (const otherItem of window.items) {
        if(otherItem.deconstruct) {
            if(otherItem.deconstruct.items.includes(item.identifier)) {
                madeByItemList.push(otherItem);
            }
        }

        if(otherItem.fabricate) {
            if(otherItem.fabricate.items.includes(item.identifier)) {
                usedByItemList.push(otherItem);
            }
        }
    }

    console.log(usedByItemList);
    console.log(madeByItemList);

    if(usedByItemList.length) {
        cardDeck.append(
            $("<div class='col mb-3'>").append(
                $("<div class='card'>").append(
                    $("<div class='card-body'>").append(
                        $("<h5 class='card-title'>").append("Used by"),
                        $("<div>").append(
                            usedByItemList.map(i => {
                                const imageElement = getDisplayImageElement(i, 3.5);
                                imageElement.addClass("d-inline-block");
                                imageElement.attr("role","button");
                                addPageEventHandlers(imageElement, i);
                                addHoverEventHandlers(imageElement, i);
                                return imageElement;
                            })
                        )
                    )
                )
            )
        )
    }

    if(madeByItemList.length) {
        cardDeck.append(
            $("<div class='col mb-3'>").append(
                $("<div class='card'>").append(
                    $("<div class='card-body'>").append(
                        $("<h5 class='card-title'>").append("Made by"),
                        $("<div>").append(
                            madeByItemList.map(i => {
                                const imageElement = getDisplayImageElement(i, 3.5);
                                imageElement.addClass("d-inline-block");
                                imageElement.attr("role","button");
                                addPageEventHandlers(imageElement, i);
                                addHoverEventHandlers(imageElement, i);
                                return imageElement;
                            })
                        )
                    )
                )
            )
        )
    }

    return elements;
}

function getItemByIdentifier(itemName) {
    if(!items) {
        console.error("Items have not been loaded");
        return;
    }
    
    const itemObj = items.find(i => {return i.identifier === itemName});    
    if(!itemObj) {
        console.warn(`Cannot find ${itemName}`);
        return;
    }

    return itemObj;
}

function addHoverEventHandlers(element, item) {
    if(typeof item === "string") {
        item = getItemByIdentifier(item);
    }
    if(!item) return;

    element.mouseenter(() => {
        $("#hover").empty();
        $("#hover").append(getHoverElementContents(item));
        $("#hover").show();
    });
    element.mouseleave(() => { $("#hover").hide() });
}

function addPageEventHandlers(element, item) {
    if(typeof item == "string") {
        item = getItemByIdentifier(item);
    }
    if(!item) return;

    element.click(() => {
        window.location.hash = item.identifier;
        $("#search").hide();
        $("#sidebar").show();
        $("#page").empty();
        $("#page").append(
            getPageContents(item)
        );
        $("#hover").hide();
    });
}

function complexSearch(searchString) {
    if(searchString.toLowerCase().startsWith("tag: ")) {
        const searchStringTrimmed = searchString.slice(5).toLowerCase();
        const results = [];
        
        for (const item of window.items) {
            if(item.tags.filter(tag => {return tag.startsWith(searchStringTrimmed)}).length)
                results.push(item);
        }

        return results;
    }
    
    if(searchString.toLowerCase().startsWith("category: ")) {
        const searchStringTrimmed = searchString.slice(10).toLowerCase();
        const results = [];

        for (const item of window.items) {
            if(item.category) {
                if(item.category.toLowerCase().startsWith(searchStringTrimmed))
                    results.push(item);
            }
        }

        return results;
    }
    
    return window.nameSearch.search(searchString);
}

$("#sidebar-dismiss, .overlay").on("click", () => {
    $("#sidebar, .overlay").removeClass("active");
});

$(document).on("mousemove", event => {
    const hover = $("#hover");
    hover.css({
        "top": `${event.pageY - hover.height() - 10}px`,
        "left": `${Math.min(event.pageX + 10, window.innerWidth - hover.width() - 10)}px`,
    });
});

$.getJSON("Content/items.json", json => {
    console.log("Loaded JSON");
    window.items = json;

    // TODO: dont pollute global scope like this (static class?)
    window.nameSearch = new JsSearch.Search("identifier");
    window.nameSearch.addIndex("name");
    window.nameSearch.addIndex("identifier");

    window.nameSearch.addDocuments(json);

    $("#searchbar").on("input", function() {
        if($(this).val()) {
            const results = complexSearch($(this).val());
            let top10 = results.slice(0,10);
            
            if(top10.length) {
                $("#search-results").show();
                $("#search-results").empty();
                for (const result of top10) {
                    const resultElement = $("<li class='d-flex align-items-center'>").append([
                        $(getDisplayImageElement(result, 2)).addClass("m-1"),
                        $(`<span class="text-primary ml-2">${result.name}</span>`),
                        $(`<span class="text-secondary small ml-1">${result.identifier}</span>`)
                    ]);
                    
                    //addHoverEventHandlers(resultElement, result.item);
                    addPageEventHandlers(resultElement, result);
                    $("#search-results").append(resultElement);
                }
            } else {
                $("#search-results").hide();
            }
        } else {
            $("#search-results").hide();
        }
    });

    $("#sidebar-searchbar").on("input", function() {
        if($(this).val()) {
            const results = complexSearch($(this).val());
            //console.log(results);

            if(results.length) {
                $("#sidebar-results").show();
                $("#sidebar-results").empty();

                for (const result of results) {
                    const resultElement = $("<li class='p-1'>").append(
                        $(`<span class="text-white">${result.name}</span>`),
                        $(`<span class="text-secondary small ml-1">${result.identifier}</span>`),
                    );

                    addPageEventHandlers(resultElement, result);
                    $("#sidebar-results").append(resultElement);
                }
            } else {
                $("#sidebar-results").hide();
            }
        } else {
            $("#sidebar-results").hide();
        }
    });

    const setPage = () => {
        const fragment = window.location.hash.slice(1);
        const item = getItemByIdentifier(fragment);
        if(!item) return;

        $("#search").hide();
        $("#sidebar").show();
        $("#page").empty();
        $("#page").append(
            getPageContents(item)
        );
    }

    if(window.location.hash) {
        setPage();
    }

    $(window).on("hashchange", () => {
        setPage();
    });
});