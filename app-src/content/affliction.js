import * as React from "react";
import Page from "../page";
import { Card, ItemName, ImageElement, TagList, StatusEffects, HoverItemList } from "./components";
import Data from "../data";
import Chart from "chart.js/auto";
import { Scatter } from "react-chartjs-2";

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
            {affliction.limbspecific ? [
                <span className="text-muted mr-1">Limb Specific:</span>,
                <span className="mr-1">{affliction.limbspecific}</span>
            ] : null}
            {affliction.indicatorlimb ? [
                <span className="text-muted mr-1">Indicator Limb:</span>,
                <span>{affliction.indicatorlimb}</span>
            ] : null}
            {affliction.showiconthreshhold ? [
                <span className="text-muted mr-1">Icon visible at:</span>,
                <span className="mr-1">{affliction.showiconthreshhold}</span>
            ] : null}
            {affliction.showinhealthscannerthreshold ? [
                <span className="text-muted mr-1">Health scanner visible at:</span>,
                <span className="mr-1">{affliction.showinhealthscannerthreshold}</span>
            ] : null}
        </div>
        <div className="col">
            <span className="text-muted mr-1">Maximum Strength:</span>
            <span>{affliction.maxstrength}</span>
        </div>
        {<div className="col">
            <span className="text-muted mr-1">Karma:</span>
            <span>{affliction.maxstrength}</span>
        </div>}
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

function AfflictionStrengthChart(props) {
    const { affliction } = props;
    const { effects } = affliction;
    if (!effects) return null;

    let dataset;
    for (const effect of effects) {
        const fromx = parseFloat(effect.minstrength);
        const tox = parseFloat(effect.maxstrength);

        if(effect.strengthchange) {
            if(!dataset)
                dataset = {
                    data: [],
                    label: "Strength Change",
                    borderColor: "rgba(170, 8, 8, 0.9)",
                    backgroundColor: "rgba(170, 8, 8, 0.75)"
                };

            const strengthchange = parseFloat(effect.strengthchange);
            dataset.data.push({x: fromx, y: strengthchange});
            dataset.data.push({x: tox, y: strengthchange});
        }
    }
    if (!dataset?.data.length) return null;

    const data = {
        datasets: [dataset],
    };

    const options = {
        showLine: true,
        elements: {
            line: {
                tension: 0,
            },
            point: {
                radius: 1,
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Affliction Strength",
                }
            },
            y: {
                title: {
                    display: true,
                    text: "Strength Change per second",
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: "Affliction Strength Change"
            }
        }
    }

    console.log(data);
    
    return (
        <div className="col-xl-5 col-12 mx-auto">
            <Scatter data={data} options={options} />
        </div>
    )
}

function AfflictionEffectChart(props) {
    const { affliction } = props;
    const { effects } = affliction;
    if (!effects) return null;

    // generate chart datasets from affliction effects
    const datasets = {};
    let resistancefor;
    let multiplybymaxvitality;
    for (const effect of effects) {
        const fromx = parseFloat(effect.minstrength);
        const tox = parseFloat(effect.maxstrength);

        // these are defined per effect, but in all vanilla use cases they apply for every effect
        resistancefor = effect.resistancefor;
        multiplybymaxvitality = effect.multiplybymaxvitality;

        if(effect.statuseffects?.length) {
            // parse statuseffect
            for (const statuseffect of effect.statuseffects) {
                // TODO: find a good way to display conditional statuseffects
                if (statuseffect.conditional) continue;
                if (statuseffect.conditions?.[0].property == "ishuman" && statuseffect.conditions?.[0].condition != "true")
                        continue;

                // parse any afflictions
                if(statuseffect.afflictions?.length) {
                    for (const affliction of statuseffect.afflictions) {
                        if(!datasets[affliction.identifier])
                            datasets[affliction.identifier] = {
                                data: [],
                                label: affliction.identifier,
                            }
                            
                            const afflictionstrength = parseFloat(affliction.strength);
                            datasets[affliction.identifier].data.push({x: fromx, y: afflictionstrength});
                            datasets[affliction.identifier].data.push({x: tox, y: afflictionstrength});
                    }
                }

                // parse other statuseffect attributes
                const possibleAttributes = ["speedmultiplier", "healthmultiplier"];
                for (const possibleAttribute of possibleAttributes) {
                    if(!statuseffect[possibleAttribute]) continue;
                    
                    const attributeValue = parseFloat(statuseffect[possibleAttribute]);
                    if(!datasets[possibleAttribute])
                        datasets[possibleAttribute] = {
                            data: [],
                            label: possibleAttribute,
                        }
                    
                    datasets[possibleAttribute].data.push({x: fromx, y: attributeValue});
                    datasets[possibleAttribute].data.push({x: tox, y: attributeValue});
                }
            }
        }

        // parse other effect attributes
        const possibleAttributes = ["buffmultiplier","speedmultiplier","skillmultiplier","resistance","vitalitydecrease"];
        for (const possibleAttribute of possibleAttributes) {
            const minAttribute = "min"+possibleAttribute;
            const maxAttribute = "max"+possibleAttribute;

            if(!effect[minAttribute] || !effect[maxAttribute]) continue;
            if(!datasets[possibleAttribute])
                datasets[possibleAttribute] = {
                    data: [],
                    label: possibleAttribute,
                }
            
            datasets[possibleAttribute].data.push({x: fromx, y: effect[minAttribute]});
            datasets[possibleAttribute].data.push({x: tox, y: effect[maxAttribute]});
        }
    }

    const data = {
        datasets: [],
    };

    const options = {
        showLine: true,
        elements: {
            line: {
                tension: 0,
            },
            point: {
                radius: 1,
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Affliction Strength",
                }
            },
            y: {
                title: {
                    display: true,
                    text: "Effect Strength",
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: "Affliction Effects"
            }
        }
    }

    const numDatasets = Object.keys(datasets).length;
    let i = 0;
    for (const datasetName of Object.keys(datasets)) {
        datasets[datasetName].borderColor = `hsla(${~~(++i/numDatasets*360)}, 75%, 40%, .9)`;
        datasets[datasetName].backgroundColor = `hsla(${~~(i/numDatasets*360)}, 75%, 30%, .75)`;
        data.datasets.push(datasets[datasetName]);
    }

    if(!data.datasets.length) return null;
    console.log(data);
    
    return (
        <div className="col-xl-5 col-12 mx-auto">
            <Scatter data={data} options={options} />
            {resistancefor ? <div className="col">
                <span className="text-muted mb-2 mr-1">Resistance for:</span>
                <TagList tags={resistancefor.split(",")} />
            </div> : null}
            {multiplybymaxvitality ? <div className="col">
                <span>"vitalitydecrease" is a percentage of maximum health</span>
            </div> : null}
        </div>
    )
}

function Range(props) {
    const {name, min, max, percentage} = props;

    return (
        <div className="col">
            <span className="text-muted mr-1">{name}:</span>
            {percentage ? 
            <span>{`${(parseFloat(min)*100).toFixed(1)}%`} -&gt; {`${(parseFloat(max)*100).toFixed(1)}%`}</span> 
            : <span>{min} -&gt; {max}</span>}
        </div>
    )
}

function StatValue(props) {
    const { statvalue } = props;

    return <Range name={statvalue.stattype} min={statvalue.minvalue ?? statvalue.value} max={statvalue.maxvalue ?? statvalue.value} />
}

function AfflictionEffectCard(props) {
    const { effect } = props;

    const minmaxlist = ["speedmultiplier","buffmultiplier","skillmultiplier","resistance"];

    return (
        <Card title="Effect">
            <Range name="Affliction Strength Range" min={effect.minstrength} max={effect.maxstrength} />
    
            {effect.strengthchange ? <div className="col">
                <span className="text-muted mr-1">Affliction Strength:</span>
                <span className={effect.strengthchange > 0 ? "text-success" : "text-danger"}>{effect.strengthchange > 0 ? "+" : ""}{effect.strengthchange}/s</span>
            </div> : null}
            
            {(effect.minvitalitydecrease && effect.maxvitalitydecrease) ? 
                <Range name={"Health Decrease" + (effect.multiplybymaxvitality?.toLowerCase() == "true" ? "*" : "")} min={effect.minvitalitydecrease} max={effect.maxvitalitydecrease} percentage={effect.multiplybymaxvitality} />
            : null}

            {effect.multiplybymaxvitality?.toLowerCase() == "true" ? <div className="col">
                <span className="text-muted">*Percent of Max Health</span>
            </div> : null}

            {minmaxlist.map(name => (effect["min"+name] && effect["max"+name]) ? <div className="col">
                <Range name={name} min={effect["min"+name]} max={effect["max"+name]} percentage={true} />
            </div> : null)}

            {effect.resistancefor ? <div className="col">
                <span className="text-muted mb-2 mr-1">Resistance for:</span>
                <TagList tags={effect.resistancefor.split(",")} />
            </div> : null}

            {effect.statuseffects?.length ? <div className="col">
                <h5 className="mt-2">Status Effects:</h5>
                <StatusEffects statuseffects={effect.statuseffects} />
            </div> : null}

            {effect.statvalues?.length ? <div className="col">
                <h5 className="mt-2">Stat Values:</h5>
                {effect.statvalues.map(statvalue => <StatValue statvalue={statvalue} />)}
            </div> : null}
        </Card>
    )
}

function AfflictionPage(props) {
    const { affliction } = props;
    console.log(affliction);

    // these are sets to prevent duplicate entries
    const causedBy = new Set();
    const removedBy = new Set();

    // searches through all status effects for any afflictions that cause or remove this affliction
    // returns null or an object with two bool properties: isCausedBy and isRemovedBy
    const searchAllStatusEffects = possibleObject => {
        if(!possibleObject?.statuseffects?.length) return;
        for (const statuseffect of possibleObject.statuseffects) {
            let isCausedBy = statuseffect.afflictions?.find(otherAffliction =>
                   otherAffliction.identifier     == affliction.identifier 
                || otherAffliction.afflictiontype == affliction.afflictiontype
            );

            let isRemovedBy = statuseffect.reduceafflictions?.find(otherAffliction =>
                   otherAffliction.identifier     == affliction.identifier 
                || otherAffliction.afflictiontype == affliction.afflictiontype 
                || otherAffliction.identifier     == affliction.afflictiontype
            );

            if (isCausedBy || isRemovedBy)
                return {isCausedBy, isRemovedBy};
        }
    }

    for (const item of Data.items) {
        if(item.type == "item") {
            // look through item and attack status effects
            for (const possibleObject of [
                    item.holdable, 
                    item.meleeweapon,  item.meleeweapon?.attack, 
                    item.rangedweapon, item.rangedweapon?.attack,
                    item.throwable,    item.throwable?.attack,
                    item.projectile,   item.projectile?.attack,
                ]) {
                const results = searchAllStatusEffects(possibleObject);
                if (results?.isCausedBy) causedBy.add(item);
                if (results?.isRemovedBy) removedBy.add(item);
            }

            // look through attack afflictions
            for (const possibleObject of [
                item.meleeweapon?.attack,
                item.rangedweapon?.attack,
                item.throwable?.attack,
                item.projectile?.attack,
            ]) {
                possibleObject?.afflictions?.forEach(otherAffliction => {
                    if (otherAffliction.identifier == affliction.identifier || otherAffliction.afflictiontype == affliction.afflictiontype) {
                        causedBy.add(item)
                        return;
                    }
                });
            }
        }

        if (item.type == "affliction") {
            if (!item.effects?.length) continue;
            for (const effect of item.effects) {
                const results = searchAllStatusEffects(effect);
                if (results?.isCausedBy) causedBy.add(item);
                if (results?.isRemovedBy) removedBy.add(item);
            }
        }
    }

    console.log(causedBy);
    console.log(removedBy);

    return (
        <Page>
            <AfflictionHeader affliction={affliction} />
            <hr className="border-primary" style={{width: "calc(100% - 2rem)"}} />
            {(affliction.effects?.length > 1) ? <div className="row col mx-auto mb-2">
                <AfflictionStrengthChart affliction={affliction} />
                <AfflictionEffectChart affliction={affliction} />
            </div> : null}
            <div id="card-deck" className="row col-12 row-cols-xl-3 row-cols-lg-2 row-cols-1">
                {affliction.effects?.map(effect => <AfflictionEffectCard effect={effect} /> )}
                {causedBy.size ? <Card title="Caused by">
                    <div>
                        <HoverItemList items={Array.from(causedBy)} optimalSize={3.5} />
                    </div>
                </Card> : null}
                {removedBy.size ? <Card title="Removed by">
                    <div>
                        <HoverItemList items={Array.from(removedBy)} optimalSize={3.5} />
                    </div>
                </Card> : null}
            </div>
        </Page>
    )
}

export { AfflictionPage }