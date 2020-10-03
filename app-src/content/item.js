import * as React from "react";
import Page from "../page";
import { getItemByIdentifier } from "../util";
import { ItemName, TagList, ImageElement, HoverImageElement, Card } from "./components";
import Data from "../data";

function ItemCategory(props) {
    if(!props.item.category) return null;
    return [
        <span className='text-muted mr-1'>Category:</span>,
        <span className='text-info mr-1'>{props.item.category}</span>   
    ]
}

function ItemTags(props) {
    if(!props.item.tags) return null 
    
    return [
        <span className="text-muted mr-1">Tags:</span>,
        <TagList tags={props.item.tags}/>
    ];
}

function ItemHeader(props) {
    const item = props.item
    return [
        <div className="col-lg-8 col-sm-12 d-inline-block">
            <ItemName item={item} />
            <div className="col">
                <ItemCategory item={item} />
                <ItemTags item={item} />
            </div>
            <div className="col">
                <span className="text-muted mr-1">Source File:</span>
                <span className="text-success">{item.sourceFile}</span>
            </div>
            <p className="lead col-12 mt-4">{item.description}</p>
        </div>,
        <div className='col-lg-4 col-sm-12 d-inline-block'>
            <div className='col mt-sm-3 mt-md-0'>
                <ImageElement item={item} optimalSize={8} type="sprite" />
                <ImageElement item={item} optimalSize={8} type="inventoryIcon" />
            </div>
        </div>
    ]
}

function PriceCard(props) {
    const item = props.item;

    // default to multiplier of 1 and not sold
    for (const type of ["city", "military", "mine", "outpost", "research"]) {
        if(!item.price[type]) {
            item.price[type] = {
                multiplier: 1,
                sold: "false"
            }
        }
    }

    return (
        <Card title="Price" >
            <div className='card-text text-centered mb-2'>
                <span className='text-muted mr-1'>Base:</span>
                <span>{item.price.baseprice}</span>
            </div>
            <table className='table table-bordered'>
                <thead>
                    <tr>
                        <th scope='col'><abbr title='City'>CIT</abbr></th>
                        <th scope='col'><abbr title='Military'>MIL</abbr></th>
                        <th scope='col'><abbr title='Mine'>MIN</abbr></th>
                        <th scope='col'><abbr title='Outpost'>OUT</abbr></th>
                        <th scope='col'><abbr title='Research'>RES</abbr></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{(item.price.city.multiplier * item.price.baseprice) >> 0}</td>
                        <td>{(item.price.military.multiplier * item.price.baseprice) >> 0}</td>
                        <td>{(item.price.mine.multiplier * item.price.baseprice) >> 0}</td>
                        <td>{(item.price.outpost.multiplier * item.price.baseprice) >> 0}</td>
                        <td>{(item.price.research.multiplier * item.price.baseprice) >> 0}</td>
                    </tr>
                    <tr>
                        <td>{item.price.city.sold == "false" ? "✘" : "✓"}</td>
                        <td>{item.price.military.sold == "false" ? "✘" : "✓"}</td>
                        <td>{item.price.mine.sold == "false" ? "✘" : "✓"}</td>
                        <td>{item.price.outpost.sold == "false" ? "✘" : "✓"}</td>
                        <td>{item.price.research.sold == "false" ? "✘" : "✓"}</td>
                    </tr>
                </tbody>
            </table>
        </Card>
    )
}

function DeconstructCard(props) {
    const item = props.item;

    return (
        <Card title="Deconstruct">
            <div className='card-text mb-2'>
                <span className='text-muted mr-1'>Time:</span>
                <span>{item.deconstruct.time}s</span>
            </div>
            {item.deconstruct.items.map(itemname => 
                <div className="p-2 d-inline-block" style={{height: "3.5rem"}}>
                    <HoverImageElement item={getItemByIdentifier(itemname)} optimalSize={3.5} />
                </div>
            )}
        </Card>
    )
}

function FabricateCard(props) {
    const item = props.item;

    const fabricatorObject = getItemByIdentifier(item.fabricate.fabricators);
    let fabricatorElement;
    if(fabricatorObject) {
        fabricatorElement = <span>{fabricatorObject.name}</span>;
        //addHoverEventHandlers(fabricatorElement, fabricatorObject);
    } else {
        fabricatorElement = <span>{item.fabricate.fabricators}</span>;
    }

    return (
        <Card title="Fabricate" >
            <div className='card-text'>
                <span className='text-muted mr-1'>Time:</span>
                <span>{item.fabricate.time}s</span>
            </div>
            {item.fabricate.skill ? 
            <div className='card-text'>
                <span className='text-muted mr-1'>Skill</span>
                <span className='text-info mr-1'>{item.fabricate.skill.name}</span>
                <span>[{item.fabricate.skill.level}]</span>
            </div> : null}
            <div className='card-text mb-2'>
                <span className='text-muted mr-1'>Made in:</span>
                {fabricatorElement}
            </div>
            {item.fabricate.items.map(itemname => <div className='p-2 d-inline-block' role='button' style={{height: "3.5rem"}}>
                <HoverImageElement item={getItemByIdentifier(itemname)} optimalSize={3.5} />
            </div>
            )}
        </Card>
    )
}

function ContainerCard(props) {
    const item = props.item;

    return (
        <Card title="Container" >
            <div className='card-text'>
                <span className='text-muted mr-1'>Size:</span>
                <span>{item.container.size}</span>
            </div>
            {item.container.items ? 
            <div className='card-text'>
                <span className='text-muted mr-1'>Items:</span>
                <TagList tags={item.container.items} />
            </div> : null}
            {item.container.requireditem ? 
            <div className='card-text'>
                <span className='text-muted mr-1'>Required Item:</span>
                <HoverImageElement item={getItemByIdentifier(item.container.requireditem.items)} optimalSize={2} />
            </div> : null}
        </Card>
    )
}

function HoverItemList(props) {
    const items = props.items;
    const optimalSize = props.optimalSize;

    return items.map(item => <HoverImageElement item={item} optimalSize={optimalSize} />)
}

function ItemCards(props) {
    const item = props.item;
    
    const cards = [];
    if(item.price) cards.push(<PriceCard item={item} />);
    if(item.deconstruct) cards.push(<DeconstructCard item={item} />);
    if(item.fabricate) cards.push(<FabricateCard item={item} />);
    if(item.container) cards.push(<ContainerCard item={item} />);

    const usedByItemList = [];
    const madeByItemList = [];

    for (const otherItem of Data.items) {
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

    if(usedByItemList.length) cards.push(
        <Card title="Used By">
            <div>
                <HoverItemList items={usedByItemList} optimalSize={3.5} />
            </div>
        </Card>
    )

    if(madeByItemList.length) cards.push(
        <Card title="Made By">
            <div>
                <HoverItemList items={madeByItemList} optimalSize={3.5} />
            </div>
        </Card>
    )

    return cards;
}

function ItemPage(props) {
    const item = props.item;
    console.log(item);
    return (
        <Page>
            <ItemHeader item={item} />
            <hr className="border-primary" style={{width: "calc(100% - 2rem)"}} />
            <div id="card-deck" className="row col-12 row-cols-xl-3 row-cols-lg-2 row-cols-1">
                <ItemCards item={item} />
            </div>
        </Page>
    )
}

export { ItemPage }