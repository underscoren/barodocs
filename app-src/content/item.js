import * as React from "react";
import Page from "../page";
import { getItemByIdentifier } from "../util";
import { ItemName, TagList, ImageElement, HoverImageElement, Card, AfflictionInfos, StatusEffects, HoverItemList, HoverElement, PossibleItem } from "./components";
import Data from "../data";

function ItemHeader(props) {
    const { item } = props;
    const variantItem = item.variantof ? getItemByIdentifier(item.variantof) : undefined;

    return <>
        <div className="col-lg-8 col-sm-12 d-inline-block">
            <ItemName item={item} />
            <div className="col">
                {item.category ? <>
                    <span className="text-muted mr-1">Category:</span>
                    <span className="text-info mr-1">{item.category}</span>
                </> : null}
                {item.tags ? <>
                    <span className="text-muted mr-1">Tags:</span>
                    <TagList tags={item.tags}/>
                </> : null}
                {item.variantof ? <>
                    <span className="text-muted mr-1">Variant of:</span>
                    <HoverElement item={variantItem} >
                        <span><u>{variantItem.name}</u></span>
                    </HoverElement>
                </> : null}
            </div>
            {item.maxstacksize ? <div className="col">
                <span className="text-muted mr-1">Stack size:</span>
                <span>{item.maxstacksize}</span>
            </div> : null}
            {item.impacttolerance ? <div className="col">
                <span className="text-muted mr-1">Impact tolerance:</span>
                <span>{item.impacttolerance}</span>
            </div> : null}
            <div className="col">
                <span className="text-muted mr-1">Source File:</span>
                <span className="text-success">{item.sourceFile}</span>
            </div>
            <p className="lead col-12 mt-4">{item.description}</p>
        </div>
        <div className="col-lg-4 col-sm-12 d-inline-block">
            <div className="col mt-sm-3 mt-md-0">
                    <ImageElement item={variantItem ?? item} optimalSize={8} type="sprite" color={item?.spriteColor} />
                    <ImageElement item={variantItem ?? item} optimalSize={8} type="inventoryIcon" color={item?.inventoryIconColor} />
            </div>
        </div>
    </>
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
            {deconstruct.items?.map((itemname, i) => 
                <div key={i} className="p-2 d-inline-block" style={{height: "3.5rem"}}>
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
            <div className="card-text">
                {fabricate.requiresrecipe ? <span className="badge badge-pill badge-secondary mr-1">Requires Recipe</span> : null}
            </div>
            {fabricate.items?.map((fabitem, i) => 
            <div key={i} className="p-2 d-inline-block" role="button" style={{height: "3.5rem"}}>
                <PossibleItem identifier={fabitem.identifier ?? fabitem.tag} optimalSize={3.5} />
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
                    <AfflictionInfos afflictions={attack.afflictions} instant={true} />
                </div>
            </div> : null}

            {attack.statuseffects?.length ? <div className="col">
                <h5 className="mt-2">Attack Status Effects:</h5>
                <StatusEffects statuseffects={attack.statuseffects} />
            </div> : null}
        </div>
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
            {holdable.characterusable ? <div className="card-text">
                <span className="text-muted mr-1">Character Usable:</span>
                <span>{holdable.characterusable}</span>
            </div> : null}
            {holdable.requiredskills?.length ? <div className="card-text">
                <h5>Required Skill{holdable.requiredskills.length > 1 ? "s" : ""}:</h5>
                <Skills skills={holdable.requiredskills} />
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

function Skill(props) {
    const { skill } = props;
    
    return <div className="col">
        <span className="text-info mr-1">{skill.identifier}</span>
        <span>[{skill.level}]</span>
    </div>
}

function Skills(props) {
    const { skills } = props;

    return skills.map(skill => <Skill key={skill.identifier+skill.level} skill={skill} />)
}

function ProjectileCard(props) {
    const { item } = props;
    const { projectile } = item;

    return (
        <Card title="Projectile">
            <div className="card-text">
                {projectile.hitscan ? <span className="badge badge-pill badge-primary">Hitscan</span> : null}
                {projectile.hitscancount ? <span className="badge badge-pill badge-primary">x{projectile.hitscancount}</span> : null}
                {projectile.removeonhit ? <span className="badge badge-pill badge-primary">Remove on hit</span> : null}
                {projectile.characterusable?.toLowerCase() == "false" ? <span className="badge badge-pill badge-primary">Not Character Usable</span> : null}
            </div>
            <div className="card-text">
                {projectile.maxtargetstohit ? <>
                    <span className="text-muted mr-1">Max targets to hit:</span>
                    <span>{projectile.maxtargetstohit}</span>
                </> : null}
                {projectile.spread ? <>
                    <span className="text-muted mr-1">Spread:</span>
                    <span>{projectile.spread}&deg;</span>
                </> : null}
                {projectile.staticspread ? <>
                    <span className="text-muted mr-1">Static spread:</span>
                    <span>{projectile.staticspread}&deg;</span>
                </> : null}
            </div>
            <div className="card-text">
                {projectile.attack ? <Attack attack={projectile.attack} /> : null}
                {projectile.statuseffects?.length ? <div className="col">
                    <h5 className="mt-2">Item Status Effects:</h5>
                    <StatusEffects statuseffects={projectile.statuseffects} />
                </div> : null}
            </div>
        </Card>
    )
}

function ThrowableCard(props) {
    const { item } = props;
    const { throwable } = item;

    return (
        <Card title="Throwable">
            <div className="card-text">
                {throwable.characterusable?.toLowerCase() == "false" ? <span className="badge badge-pill badge-primary">Not Character Usable</span> : null}
            </div>
            <div className="card-text">
                {throwable.throwforce ? <>
                    <span className="text-muted mr-1">Throw force:</span>
                    <span>{throwable.throwforce}</span>
                </> : null}
            </div>
            <div className="card-text">
                {throwable.attack ? <Attack attack={throwable.attack} /> : null}
                {throwable.statuseffects?.length ? <div className="col">
                    <h5 className="mt-2">Item Status Effects:</h5>
                    <StatusEffects statuseffects={throwable.statuseffects} />
                </div> : null}
            </div>
        </Card>
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
            {meleeweapon.requiredskills?.length ? <div className="card-text">
                <h5>Required Skill{meleeweapon.requiredskills.length > 1 ? "s" : ""}:</h5>
                <Skills skills={meleeweapon.requiredskills} />
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

function RangedWeaponCard(props) {
    const { item } = props;
    const { rangedweapon } = item;

    return (
        <Card title="Ranged Weapon">
            {rangedweapon.reload ? <div className="card-text">
                <span className="text-muted mr-1">Reload:</span>
                <span>{rangedweapon.reload}s</span>
            </div> : null}
            {rangedweapon.spread ? <div className="card-text">
                <span className="text-muted mr-1">Spread:</span>
                <span>{rangedweapon.spread}&deg;</span>
            </div> : null}
            {rangedweapon.unskilledspread ? <div className="card-text">
                <span className="text-muted mr-1">Unskilled Spread:</span>
                <span>{rangedweapon.unskilledspread}&deg;</span>
            </div> : null}
            {rangedweapon.requiredskills?.length ? <div className="card-text">
                <h5>Required Skill{rangedweapon.requiredskills.length > 1 ? "s" : ""}:</h5>
                <Skills skills={rangedweapon.requiredskills} />
            </div> : null}
            <div className="card-text">
                {rangedweapon.statuseffects?.length ? <div className="col">
                    <h5 className="mt-2">Status Effects:</h5>
                    <StatusEffects statuseffects={rangedweapon.statuseffects} />
                </div> : null}
            </div>
        </Card>
    )
}

function ImportantItemCards(props) {
    const { item } = props;

    const cards = [];

    if(item.meleeweapon) cards.push(<MeleeWeaponCard item={item} key="MeleeWeaponCard" />);
    if(item.rangedweapon) cards.push(<RangedWeaponCard item={item} key="RangedWeaponCard" />);
    if(item.holdable) cards.push(<HoldableCard item={item} key="HoldableCard" />);
    if(item.projectile) cards.push(<ProjectileCard item={item} key="ProjectileCard" />);
    if(item.throwable) cards.push(<ThrowableCard item={item} key="ThrowableCard" />);

    return cards;
}

function ItemCards(props) {
    const { item } = props;
    
    const cards = [];
    if(item.price) cards.push(<PriceCard item={item} key="PriceCard" />);
    if(item.aitarget) cards.push(<AiTargetCard item={item} key="AiTargetCard" />);
    if(item.deconstruct) cards.push(<DeconstructCard item={item} key="DeconstructCard" />);
    if(item.fabricate) cards.push(<FabricateCard item={item} key="FabricateCard" />);
    if(item.container) cards.push(<ContainerCard item={item} key="ContainerCard" />);

    // find other items that make or are created by this item
    const usedByItemList = [];
    const madeByItemList = [];

    for (const otherItem of Data.items) {
        if(otherItem.deconstruct?.items?.includes(item.identifier))
            madeByItemList.push(otherItem);
        
        if(otherItem.fabricate?.items?.find(otherItem => otherItem.identifier == item.identifier || otherItem.tag == item.identifier))
            usedByItemList.push(otherItem);
    }

    if(usedByItemList.length) cards.push(
        <Card key="usedByItemList" title="Used By">
            <div>
                <HoverItemList items={usedByItemList} optimalSize={3.5} />
            </div>
        </Card>
    )

    if(madeByItemList.length) cards.push(
        <Card key="madeByItemList" title="Made By">
            <div>
                <HoverItemList items={madeByItemList} optimalSize={3.5} />
            </div>
        </Card>
    )

    return cards;
}

function ItemPage(props) {
    const { item } = props;
    console.log(item);

    return (
        <Page>
            <ItemHeader item={item} />
            <hr className="border-primary" style={{width: "calc(100% - 2rem)"}} />
            <div id="card-deck" className="row col-12 row-cols-xl-3 row-cols-lg-2 row-cols-1">
                <ImportantItemCards item={item} />
            </div>
            <div id="card-deck" className="row col-12 row-cols-xl-3 row-cols-lg-2 row-cols-1">
                <ItemCards item={item} />
            </div>
        </Page>
    )
}

export { ItemPage }