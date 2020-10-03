import * as React from "react";
import Page from "../page";
import { getItemByIdentifier } from "../util";
import { Card, ItemName, ImageElement, HoverElement } from "./components";
//import { Chart } from "chart.js";

function AfflictionHeader(props) {
    const affliction = props.affliction;

    return [
    <div className="col-lg-8 col-sm-12 d-inline-block">
        <ItemName item={affliction} />
        <div className="col">
            <span className="text-muted mr-1">Type:</span>
            <span className="text-info">{affliction.afflictiontype}</span>
        </div>
        <div className="col">
            <span className="text-muted mr-1">Limb Specific:</span>
            <span className="mr-1">{affliction.limbspecific}</span>
            {(affliction.limbspecific == "false") ? [
                <span className="text-muted mr-1">Indicator Limb:</span>,
                <span>{affliction.indicatorlimb}</span>
            ] : null}
        </div>
        <div className="col">
            <span className="text-muted mr-1">Maximum Strength:</span>
            <span>{affliction.maxstrength}</span>
        </div>
        <div className="col">
            <span className="text-muted mr-1">Source File:</span>
            <span className="text-success">{affliction.sourceFile}</span>
        </div>
        <p className="lead col-12 mt-4">{affliction.description}</p>
    </div>,
    <div className="col-lg-4 col-sm-12 d-inline-block">
        <div className="col mt-sm-3 mt-md-0">
            <ImageElement item={affliction} optimalSize={8} type="icon" />
        </div>
    </div>
    ]
}

function Range(props) {
    if(!props.min || !props.max) return null;
    return <div className="col">
        <span className="text-muted mr-1">{props.name}:</span>
        <span>{props.min} -&gt; {props.max}</span>
    </div>
}

function StatusEffect(props) {
    const statusEffect = props.statusEffect;
    const afflictionObj = getItemByIdentifier(statusEffect.affliction?.identifier);

    return [
        statusEffect.speedMultiplier ? <div className="col">
            <span className="text-muted mr-1">Movement Speed:</span>
            <span>{(statusEffect.speedMultiplier * 100)>>0}%</span>
        </div> : null,
        statusEffect.affliction ? <div className="col">
            <span className="text-muted mr-1">Affliction:</span>
            <HoverElement className="mr-1" item={afflictionObj}>{afflictionObj.name}</HoverElement>
            <span className="text-success">+{statusEffect.affliction.amount}/s</span>
        </div> : null,
    ]
}

function Effect(props) {
    const effect = props.effect;

    const minmaxlist = ["speedmultiplier","buffmultiplier","resistance"];

    return (
        <Card title="Effect">
            <Range name="Affliction Strength Range" min={effect.minstrength} max={effect.maxstrength} />
    
            {effect.strengthchange ? <div className="col">
                <span className="text-muted mr-1">Affliction Strength:</span>
                <span className={effect.strengthchange > 0 ? "text-success" : "text-danger"}>{effect.strengthchange > 0 ? "+" : ""}{effect.strengthchange}/s</span>
            </div> : null}
            
            {/* TODO: Change this to show % Health Decrease if multiplybymaxvitality == true */}
            <Range name={"Health Decrease" + (effect.multiplybymaxvitality ? "*" : "")} min={effect.minvitalitydecrease} max={effect.maxvitalitydecrease} />

            {effect.multiplybymaxvitality == "true" ? <div className="col">
                <span className="text-muted">*Multiplied by Max Health</span>
            </div> : null}

            {effect.resistancefor ? <div className="col">
                <span className="text-muted mr-1">Resistance for:</span>
                <span className="text-info">{effect.resistancefor}</span>
            </div> : null}

            {minmaxlist.map(name => <div className="col">
                <Range name={name} min={effect["min"+name]} max={effect["max"+name]} />
            </div>)}

            {effect.statusEffects.length ? <div className="col">
                <h5 className="mt-2">Status Effects:</h5>
                {effect.statusEffects.map(statusEffect => <StatusEffect statusEffect={statusEffect} />)}
            </div> : null}
        </Card>
    )
}

function AfflictionEffects(props) {
    const affliction = props.affliction;

    if(affliction.effects.length == 0) return null;

    return affliction.effects.map(effect => <Effect effect={effect} />);
}

function AfflictionPage(props) {
    const affliction = props.affliction;
    console.log(affliction);
    return (
        <Page>
            <AfflictionHeader affliction={affliction} />
            <hr className="border-primary" style={{width: "calc(100% - 2rem)"}} />
            <div id="card-deck" className="row col-12 row-cols-xl-3 row-cols-lg-2 row-cols-1">
                <AfflictionEffects affliction={affliction} />
            </div>
        </Page>
    )
}

export { AfflictionPage }