import * as React from "react";
import Page from "../page";
import { getItemByIdentifier } from "../util";
import { ItemName, TagList, ImageElement, HoverImageElement, Card, AfflictionInfos, StatusEffects, HoverItemList } from "./components";
import Data from "../data";

function ItemCategory(props) {
    const { item } = props;
    if(!item.category) return null;
    
    return [
        <span className="text-muted mr-1">Category:</span>,
        <span className="text-info mr-1">{item.category}</span>   
    ]
}

function ItemTags(props) {
    const { item } = props;
    if(!item.tags) return null;
    
    return [
        <span className="text-muted mr-1">Tags:</span>,
        <TagList tags={item.tags}/>
    ];
}

function ItemHeader(props) {
    const { item } = props;

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
        <div className="col-lg-4 col-sm-12 d-inline-block">
            <div className="col mt-sm-3 mt-md-0">
                <ImageElement item={item} optimalSize={8} type="sprite" />
                <ImageElement item={item} optimalSize={8} type="inventoryIcon" />
            </div>
        </div>
    ]
}

function PriceCard(props) {
    const { item } = props;

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
            <div className="card-text text-centered mb-2">
                <span className="text-muted mr-1">Base:</span>
                <span>{item.price.baseprice}</span>
            </div>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th scope="col"><abbr title="City">CIT</abbr></th>
                        <th scope="col"><abbr title="Military">MIL</abbr></th>
                        <th scope="col"><abbr title="Mine">MIN</abbr></th>
                        <th scope="col"><abbr title="Outpost">OUT</abbr></th>
                        <th scope="col"><abbr title="Research">RES</abbr></th>
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
    const { item } = props;
    const { deconstruct } = item;

    return (
        <Card title="Deconstruct">
            <div className="card-text mb-2">
                <span className="text-muted mr-1">Time:</span>
                <span>{deconstruct.time}s</span>
            </div>
            <div className="col">
                {deconstruct.chooserandom ? <span className="badge badge-pill badge-primary mr-1">Random</span> : null}
                {deconstruct.amount ? <span className="badge badge-pill badge-secondary mr-1">{deconstruct.amount}</span> : null}
            </div>
            {deconstruct.items.map(itemname => 
                <div className="p-2 d-inline-block" style={{height: "3.5rem"}}>
                    <HoverImageElement item={getItemByIdentifier(itemname)} optimalSize={3.5} />
                </div>
            )}
        </Card>
    )
}

function FabricateCard(props) {
    const { item } = props;
    const { fabricate } = item;
    

    return (
        <Card title="Fabricate" >
            {fabricate.time ? <div className="card-text">
                <span className="text-muted mr-1">Time:</span>
                <span>{fabricate.time}s</span>
            </div> : null}
            {fabricate.skill ? <div className="card-text">
                <span className="text-muted mr-1">Skill:</span>
                <span className="text-info mr-1">{fabricate.skill.identifier}</span>
                <span>[{fabricate.skill.level}]</span>
            </div> : null}
            {fabricate.fabricators ? <div className="card-text mb-2">
                <span className="text-muted mr-1">Made in:</span>
                <span>{fabricate.fabricators}</span>
            </div> : null}
            <div class="card-text mb-2">
                {fabricate.requiresrecipe ? <span className="badge badge-pill badge-secondary mr-1">Requires Recipe</span> : null}
            </div>
            {fabricate.items.map(itemname => 
            <div className="p-2 d-inline-block" role="button" style={{height: "3.5rem"}}>
                <HoverImageElement item={getItemByIdentifier(itemname)} optimalSize={3.5} />
            </div>)}
        </Card>
    )
}

function ContainerCard(props) {
    const { item } = props;

    return (
        <Card title="Container" >
            <div className="card-text">
                <span className="text-muted mr-1">Size:</span>
                <span>{item.container.size}</span>
            </div>
            {item.container.items ? 
            <div className="card-text">
                <span className="text-muted mr-1">Items:</span>
                <TagList tags={item.container.items} />
            </div> : null}
            {item.container.requireditem ? 
            <div className="card-text">
                <span className="text-muted mr-1">Required Item:</span>
                <HoverImageElement item={getItemByIdentifier(item.container.requireditem.items)} optimalSize={2} />
            </div> : null}
        </Card>
    )
}

function Attack(props) {
    const { attack } = props;
    
    return (
        <div className="col">
            <h5 className="mt-2">Attack:</h5>
            {attack.itemdamage ? <div className="col">
                <span className="text-muted mr-1">Item damage:</span>
                <span>{attack.itemdamage}</span>
            </div> : null}
            {attack.structuredamage ? <div className="col">
                <span className="text-muted mr-1">Structure damage:</span>
                <span>{attack.structuredamage}</span>
            </div> : null}
            {attack.ballastfloradamage ? <div className="col">
                <span className="text-muted mr-1">Ballast flora damage:</span>
                <span>{attack.ballastfloradamage}</span>
            </div> : null}
            {attack.onlyhumans ? <div className="col">
                <span className="text-muted mr-1">Only humans:</span>
                <span>{attack.onlyhumans ? "True" : "False"}</span>
            </div> : null}
            {attack.severlimbsprobability ? <div className="col">
                <span className="text-muted mr-1">Sever Limbs Chance:</span>
                <span>{(attack.severlimbsprobability*100).toFixed(1)}%</span>
            </div> : null}
            {attack.targetimpulse ? <div className="col">
                <span className="text-muted mr-1">Target Impulse:</span>
                <span>{attack.targetimpulse}</span>
            </div> : null}
            {attack.targetforce ? <div className="col">
                <span className="text-muted mr-1">Target Force:</span>
                <span>{attack.targetforce}</span>
            </div> : null}
            

            {attack.afflictions?.length ? <div className="col">
                <h5 className="mt-2">Afflictions:</h5>
                <div className="col row">
                    <AfflictionInfos afflictions={attack.afflictions} />
                </div>
            </div> : null}

            {attack.statuseffects?.length ? <div className="col">
                <h5 className="mt-2">Attack Status Effects:</h5>
                <StatusEffects statuseffects={attack.statuseffects} />
            </div> : null}
        </div>
    )
}

function MeleeWeaponCard(props) {
    const { item } = props;
    const { meleeweapon } = item;

    return (
        <Card title="Melee Weapon">
            {meleeweapon.reload ? <div className="card-text">
                <span className="text-muted mr-1">Swing time:</span>
                <span>{meleeweapon.reload}s</span>
            </div> : null}
            {meleeweapon.allowhitmultiple ? <div className="card-text">
                <span className="text-muted mr-1">Multiple Hits:</span>
                <span>{meleeweapon.allowhitmultiple ? "True" : "False"}</span>
            </div> : null}
            {meleeweapon.requiredskill ? <div className="card-text">
                <span className="text-muted mr-1">Skill:</span>
                <span className="text-info mr-1">{meleeweapon.requiredskill.identifier}</span>
                <span>[{meleeweapon.requiredskill.level}]</span>
            </div> : null}
            <div className="card-text">
                {meleeweapon.attack ? <Attack attack={meleeweapon.attack} /> : null}
                {meleeweapon.statuseffects?.length ? <div className="col">
                    <h5 className="mt-2">Item Status Effects:</h5>
                    <StatusEffects statuseffects={meleeweapon.statuseffects} />
                </div> : null}
            </div>
        </Card>
    )
}

function HoldableCard(props) {
    const { item } = props;
    const { holdable } = item;

    return (
        <Card title="Holdable">
            {holdable.reload ? <div className="card-text">
                <span className="text-muted mr-1">Swing time:</span>
                <span>{holdable.reload}s</span>
            </div> : null}
            {holdable.requiredskill ? <div className="card-text">
                <span className="text-muted mr-1">Skill:</span>
                <span className="text-info mr-1">{holdable.requiredskill.identifier}</span>
                <span>[{holdable.requiredskill.level}]</span>
            </div> : null}
            <div className="card-text">
                {holdable.statuseffects?.length ? <div className="col">
                    <h5 className="mt-2">Status Effects:</h5>
                    <StatusEffects statuseffects={holdable.statuseffects} />
                </div> : null}
            </div>
        </Card>
    )
}

function AiTargetCard(props) {
    const { item } = props;
    const { aitarget } = item;
    
    return <Card title="AI Target">
        {aitarget.sightrange ? <div className="card-text">
            <span className="text-muted mr-1">Sight range:</span>
            <span>{aitarget.sightrange/100}m</span>
        </div> : null}
        {aitarget.maxsightrange ? <div className="card-text">
            <span className="text-muted mr-1">Sight range max:</span>
            <span>{aitarget.maxsightrange/100}m</span>
        </div> : null}
        {aitarget.minsightrange ? <div className="card-text">
            <span className="text-muted mr-1">Sight range min:</span>
            <span>{aitarget.minsightrange/100}m</span>
        </div> : null}
        {aitarget.soundrange ? <div className="card-text">
            <span className="text-muted mr-1">Sound range:</span>
            <span>{aitarget.soundrange/100}m</span>
        </div> : null}
        {aitarget.maxsoundrange ? <div className="card-text">
            <span className="text-muted mr-1">Sound range max:</span>
            <span>{aitarget.maxsoundrange/100}m</span>
        </div> : null}
        {aitarget.minsoundrange ? <div className="card-text">
            <span className="text-muted mr-1">Sound range min:</span>
            <span>{aitarget.minsoundrange/100}m</span>
        </div> : null}
        {aitarget.fadeouttime ? <div className="card-text">
            <span className="text-muted mr-1">Fade out:</span>
            <span>{aitarget.fadeouttime}s</span>
        </div> : null}
        {aitarget.static ? <div className="card-text">
            <span className="text-muted mr-1">Static:</span>
            <span>{aitarget.static ? "True" : "False"}</span>
        </div> : null}
        {aitarget.sonardisruption ? <div className="card-text">
            <span className="text-muted mr-1">Sonar Disruption:</span>
            <span>{aitarget.sonardisruption ? "True" : "False"}</span>
        </div> : null}
    </Card>
}

function ItemCards(props) {
    const item = props.item;
    
    const cards = [];
    if(item.price) cards.push(<PriceCard item={item} />);
    if(item.aitarget) cards.push(<AiTargetCard item={item} />);
    if(item.deconstruct) cards.push(<DeconstructCard item={item} />);
    if(item.fabricate) cards.push(<FabricateCard item={item} />);
    if(item.container) cards.push(<ContainerCard item={item} />);

    const usedByItemList = [];
    const madeByItemList = [];

    for (const otherItem of Data.items) {
        if(otherItem.deconstruct) {
            if(otherItem.deconstruct.items?.includes(item.identifier)) {
                madeByItemList.push(otherItem);
            }
        }

        if(otherItem.fabricate) {
            if(otherItem.fabricate.items?.includes(item.identifier)) {
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
    
    // longest cards should be at the bottom
    if(item.holdable) cards.push(<HoldableCard item={item} />);
    if(item.meleeweapon) cards.push(<MeleeWeaponCard item={item} />);

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