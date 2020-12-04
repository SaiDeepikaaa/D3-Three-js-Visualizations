let margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 40
};

let height = 600;
let width = 1000;
let centered, slateGunData, shootingsPerStateAll, shootingsPerStateMale, shootingsPerStateFemale, states,
    indCityCount, sgdDataCombined, statesData, cityOrdinates, cityDetails, active = d3.select(null);

let projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale([1200]);

const path = d3.geoPath().projection(projection)
const color = d3.scaleSqrt()
    .domain([2, 50])
    .range(d3.schemeBlues[7]);

let svg = d3.select("#viz").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

let g = svg.append("g");

const div = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

const cityTooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltipCity')
    .style('opacity', 0);

const iconTooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltipIcon')
    .style('opacity', 0);

Promise.all([d3.json("assets/SGD/frequency_by_city.json"), d3.json("assets/SGD/states-albers-10m.json"), d3.json("assets/SGD/sgd_data.json"), d3.csv("assets/SGD/us-states-postal-code.csv")])
    .then(([sgdData, usData, sgdDataAll, stateData]) => {
        main(sgdData, usData, sgdDataAll, stateData);
    });

function main(sgdData, usData, sgdDataAll, stateData) {
    slateGunData = sgdData;
    usData = usData;
    sgdDataCombined = sgdDataAll;
    statesData = stateData;

    malesCount = getCounts(sgdDataCombined, 'M');
    femalesCount = getCounts(sgdDataCombined, 'F');
    shootingsPerStateAll = getCityCounts(slateGunData, 'all');

    addLegend(shootingsPerStateAll);

    d3.select('.cityState').text('United States of America');
    d3.select('.maleDeaths').text(d3.sum(Object.values(malesCount)));
    d3.select('.maleChildrenValue').text(malesCount.age1);
    d3.select('.maleTeensValue').text(malesCount.age2);
    d3.select('.maleAdultsValue').text(malesCount.age3);
    d3.select('.femaleDeaths').text(d3.sum(Object.values(femalesCount)));
    d3.select('.femaleChildrenValue').text(femalesCount.age1);







    d3.select('.femaleTeensValue').text(femalesCount.age2);
    d3.select('.femaleAdultsValue').text(femalesCount.age3);

    states = g.append("g")
        .attr("id", "states")
        .attr("cursor", "pointer")
        .selectAll("path")
        .data(topojson.feature(usData, usData.objects.states).features)
        .enter()
        .append("path")
        .attr("fill", d => color(shootingsPerState.get(d.properties.name)))
        .attr("d", path)
        .on("click", clicked)
        .on("mouseover", stateSelected)
        .on("mouseout", stateDisSelected)

    g.append("path")
        .datum(topojson.mesh(usData, usData.objects.states, (a, b) => a !== b))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("id", "state-borders")
        .attr("stroke-linejoin", "round")
        .attr("d", path);
}

function getCityCounts(sgdData, type) {
    shootingsPerState = new Map();
    sgdData.forEach(state => {
        if (shootingsPerState.get(state.statename) === undefined) {
            switch (type) {
                case 'male':
                    shootingsPerState.set(state.statename, state.males);
                    break;
                case 'female':
                    shootingsPerState.set(state.statename, state.females);
                    break;
                default:
                    shootingsPerState.set(state.statename, state.males + state.females);
                    break;
            }
        } else {
            currentCount = shootingsPerState.get(state.statename)
            switch (type) {
                case 'male':
                    newCount = currentCount + state.males;
                    break;
                case 'female':
                    newCount = currentCount + state.females;
                    break;
                default:
                    newCount = currentCount + state.males + state.females;
                    break;
            }
            shootingsPerState.set(state.statename, newCount);
        }
    });
    return shootingsPerState;
}

function reset() {
    active.classed("active", false);
    active = d3.select(null);

    g.transition()
        .delay(100)
        .duration(750)
        .style("stroke-width", "1.5px")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    g.selectAll('circle').remove();
    d3.select('.cityState').text('United States of America');
    d3.select('#details').selectAll('text').remove();

    malesCount = getCounts(sgdDataCombined, 'M');
    femalesCount = getCounts(sgdDataCombined, 'F');
    d3.select('.cityState').text('United States of America');
    d3.select('.maleDeaths').text(d3.sum(Object.values(malesCount)));
    d3.select('.maleChildrenValue').text(malesCount.age1);
    d3.select('.maleTeensValue').text(malesCount.age2);
    d3.select('.maleAdultsValue').text(malesCount.age3);
    d3.select('.femaleDeaths').text(d3.sum(Object.values(femalesCount)));
    d3.select('.femaleChildrenValue').text(femalesCount.age1);
    d3.select('.femaleTeensValue').text(femalesCount.age2);
    d3.select('.femaleAdultsValue').text(femalesCount.age3);
}

function clicked(event, d) {
    cityOrdinates = new Map();
    cityDetails = new Array();
    g.selectAll('circle').remove();

    div.transition()
        .duration(500)
        .style('opacity', 0);

    if (d3.select('.background').node() === this) return reset();

    if (active.node() === this) return reset();

    active.classed("active", false);
    active = d3.select(this).classed("active", true)

    stateDetails = d;

    slateGunData.forEach(city => {
        if (city.statename === d.properties.name) {
            cityOrdinates.set(city.city, [city.lng, city.lat])
            cityDetails.push(city);
        }
    });

    deathsMax = Math.max.apply(Math, cityDetails.map(function (o) {
        return o.males + o.females;
    }));

    deathsMin = Math.min.apply(Math, cityDetails.map(function (o) {
        return o.males + o.females;
    }));

    radiusScaler = d3.scaleLinear()
        .domain([deathsMin, deathsMax])
        .range([1, 10]);

    let bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .5 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    g.transition()
        .duration(750)
        .style("stroke-width", 1.5 / scale + "px")
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

    console.log(cityOrdinates);
    g.selectAll("circle")
        .data(cityOrdinates)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            return projection(d[1])[0];
        })
        .attr("cy", function (d) {
            return projection(d[1])[1];
        })
        .attr("r", (d, i) => {
            indCityCount = cityDetails.find(({
                city
            }) => city === d[0])
            return radiusScaler(indCityCount.males + indCityCount.females) + 'px';
        })
        .attr("fill", (d) => {
            indCityCount = cityDetails.find(({
                city
            }) => city === d[0])
            if (indCityCount.males == 0) {
                return 'red'
            } else if (indCityCount.females == 0) {
                return 'blue'
            }
            gradient(indCityCount.males, indCityCount.females)
            return 'url(#gradient)'
        })
        .style('opacity', 0.4)
        .attr('stroke', 'black')
        .attr('stroke-width', '0.5px')
        .on("mouseover", citySelected)
        .on("mouseout", cityDisSelected)
        .on("click", getDetails);

    getDetails(d);
}


function stateSelected(d, i) {
    div.transition()
        .duration(200)
        .style('opacity', 0.9);
    div.html(generateTipData(i))
        .style('left', d.pageX + 'px')
        .style('top', d.pageY + 'px');
    d3.select(this)
        .style('opacity', 0.75)
        .attr('class', 'state-borders');
}

function stateDisSelected(d) {
    div.transition()
        .duration(500)
        .style('opacity', 0);
    d3.select(this)
        .style('opacity', 1)
}

function citySelected(d, i) {
    cityData = cityDetails.find(({
        city
    }) => city === i[0]);
    d3.selectAll('tooltip').remove()
    cityTooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
    cityTooltip.html(generateCityTipData(cityData))
        .style('left', d.pageX + 'px')
        .style('top', d.pageY + 'px');
    d3.select(this)
        .style('opacity', 0.75)
}

function cityDisSelected() {
    cityTooltip.transition()
        .style('opacity', 0);
    d3.select(this)
        .style('opacity', 0.4)
}

function generateTipData(data) {
    shootingsPerStateMale = getCityCounts(slateGunData, 'male');
    shootingsPerStateFemale = getCityCounts(slateGunData, 'female');
    text = `<span><b>` + data.properties.name + `</b></span>`
    text += `<table style="margin-top: 2.5px;">
                            <tr><td>Total Deaths: </td><td style="text-align:right">` + shootingsPerStateAll.get(data.properties.name) + `</td></tr>
                            <tr><td>Deaths(Male): </td><td style="text-align:right">` + shootingsPerStateMale.get(data.properties.name) + `</td></tr>
                            <tr><td>Deaths(Female): </td><td style="text-align:right">` + shootingsPerStateFemale.get(data.properties.name) + `</td></tr>
                    </table>
                    `;
    return text;
}

function generateCityTipData(cityData) {
    text = `<span><b>` + cityData.city + `</b></span>`
    text += `<table style="margin-top: 2.5px;">
                            <tr><td>Total Deaths: </td><td style="text-align:right">` + (cityData.males + cityData.females) + `</td></tr>
                            <tr><td>Deaths(Male): </td><td style="text-align:right">` + cityData.males + `</td></tr>
                            <tr><td>Deaths(Female): </td><td style="text-align:right">` + cityData.females + `</td></tr>
                    </table>
                    `;
    return text;
}

function gradient(maleCount, femaleCount) {
    const total = maleCount + femaleCount;
    let gradient = svg.append("svg:defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    gradient.append("svg:stop")
        .attr("offset", '0%')
        .attr("stop-color", "blue")
        .attr("stop-opacity", 1);

    gradient.append("svg:stop")
        .attr("offset", Math.round((maleCount / total) * 100) + '%')
        .attr("stop-color", "blue")
        .attr("stop-opacity", 1);

    gradient.append("svg:stop")
        .attr("offset", Math.round((femaleCount / total) * 100) + '%')
        .attr("stop-color", "red")
        .attr("stop-opacity", 1);

    gradient.append("svg:stop")
        .attr("offset", '100%')
        .attr("stop-color", "red")
        .attr("stop-opacity", 1);
};

function addLegend(shootingsPerStateAll) {
    let legendWidth = 140,
        legendHeight = 400;

    let key = d3.select("#viz")
        .append("svg")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("class", "legend");

    let legend = key.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradientLegend")
        .attr("x1", "100%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    legend.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color(Math.max(...shootingsPerStateAll.values())))
        .attr("stop-opacity", 1);

    legend.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color(Math.min(...shootingsPerStateAll.values())))
        .attr("stop-opacity", 1);

    key.append("rect")
        .attr("width", legendWidth - 100)
        .attr("height", legendHeight)
        .style("fill", "url(#gradientLegend)")
        .attr("transform", "translate(0,10)")

    let y = d3.scaleLinear()
        .range([legendHeight, 0])
        .domain([100, 1400]);

    let yAxis = d3.axisRight(y);

    key.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(41,12)")
        .call(yAxis)
}


function getDetails(d, i) {
    if (i) {
        d3.select('#details').selectAll('text').remove();
        deathsData = sgdDataCombined.filter(states => {
            return states.city === i[0];
        });
        d3.select('.cityState').text(i[0] + ', ' + deathsData[0].state);
    } else {
        stateName = d.properties.name;
        d3.select('#details').selectAll('text').remove();
        d3.select('.cityState').text(stateName + ',USA');
        stateMapping = statesData.find(state => state.State === d.properties.name);
        deathsData = sgdDataCombined.filter(states => {
            return states.state === stateMapping.PostalCode;
        });
    };

    malesCount = getCounts(deathsData, 'M');
    femalesCount = getCounts(deathsData, 'F');
    d3.select('.maleDeaths').text(d3.sum(Object.values(malesCount)));
    d3.select('.maleChildrenValue').text(malesCount.age1);
    d3.select('.maleTeensValue').text(malesCount.age2);
    d3.select('.maleAdultsValue').text(malesCount.age3);
    d3.select('.femaleDeaths').text(d3.sum(Object.values(femalesCount)));
    d3.select('.femaleChildrenValue').text(femalesCount.age1);
    d3.select('.femaleTeensValue').text(femalesCount.age2);
    d3.select('.femaleAdultsValue').text(femalesCount.age3);


    d3.select("#details")
        .style("margin-left", "100px")
        .style("margin-right", "150px")
        .style("text-align", "justify")
        .selectAll(".text")
        .data(deathsData)
        .enter()
        .append("text")
        .attr("class", "fa")
        .style('font-size', function (d) {
            return '30px'
        })
        .style('padding-right', "5px")
        .style("padding-bottom", "10px")
        .text(d => {
            if (d.gender === 'M') {
                return '\uf183';
            } else {
                return '\uf182';
            }
        })
        .style("color", (d) => {
            if (d.gender === 'M') {
                return assignColorGender(d.agegroup)
            }
            return assignColorAge(d.agegroup)
        })
        .on('mouseover', iconHovered)
        .on('mouseout', iconOvered)
        .on('click', (d, i) => {
            return window.open(i.url)
        })
}

function assignColorAge(ageGroup) {
    switch (ageGroup) {
        case 1:
            return "#fcae91"
        case 2:
            return "#fb6a4a"
        case 3:
            return "#cb181d"
        default:
            return "#fee5d9"
    }
}

function assignColorGender(ageGroup) {
    switch (ageGroup) {
        case 1:
            return "#bdd7e7"
        case 2:
            return "#6baed6"
        case 3:
            return "#2171b5"
        default:
            return "#eff3ff"
    }
}

function getCounts(sgdDataCombined, type) {
    const age1 = sgdDataCombined.filter(states => {
        return states.gender === type && states.agegroup === 1;
    }).length;
    const age2 = sgdDataCombined.filter(states => {
        return states.gender === type && states.agegroup === 2;
    }).length;
    const age3 = sgdDataCombined.filter(states => {
        return states.gender === type && states.agegroup === 3;
    }).length;
    const age9 = sgdDataCombined.filter(states => {
        return states.gender === type && states.agegroup === 9;
    }).length;
    return {
        age1,
        age2,
        age3,
        age9
    };
}

function iconHovered(d, i) {
    let iconData = i;
    d3.selectAll('iconTooltip').remove()
    iconTooltip.transition()
        .duration(200)
        .style('opacity', 0.9);
    iconTooltip.html(() => {
            return generateIconTipData(iconData)
        })
        .style('left', d.pageX + 'px')
        .style('top', d.pageY + 10 + 'px');
}

function iconOvered() {
    iconTooltip.transition()
        .style('opacity', 0);
}

function generateIconTipData(iconData) {
    text = `<span>Name:<b>` + iconData.name + `</b></span>`
    text += `<table style="margin-top: 2.5px;">
                            <tr><td>Age: </td><td>` + iconData.age + `</td></tr>
                            <tr><td>Place: </td><td>` + iconData.city + ',' + iconData.state + `</td></tr>
                            <tr><td>Gender: </td><td>` + iconData.gender + `</td></tr>
                    </table>
                    `;
    return text;
}