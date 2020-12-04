const shapeCicle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
const circle1Animation = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
const shapeRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
const shapeCircle1 = document.createElementNS("http://www.w3.org/2000/svg", 'circle');
const circle2Animation = document.createElementNS("http://www.w3.org/2000/svg", 'animate');
const rectAnimation = document.createElementNS("http://www.w3.org/2000/svg", 'animate');

const circleAttributes = {
    "id": "circle1",
    "r": "30",
    "cx": "50",
    "cy": "50",
    "fill": "white",
    "stroke": "#368bff",
    "stroke-width": "3"
}

const circle1Attributes = {
    "id": "circle2",
    "r": "30",
    "cx": "50",
    "cy": "325",
    "fill": "white",
    "stroke": "#368bff",
    "stroke-width": "3"
}

const rectAttributes = {
    "id": "rect",
    "x": "30",
    "y": "175",
    "width": "50",
    "height": "50",
    "fill": "white",
    "stroke": "#368bff",
    "stroke-width": "3"
}

const circle1AnimateAttributes = {
    "id": "circle1Animation",
    "attributeName": "cx",
    "from": "50",
    "to": "800",
    "dur": "5s",
    "begin": "0s",
    "fill": "freeze"
}

const circle2AnimateAttributes = {
    "id": "circle2Animation",
    "attributeName": "cx",
    "from": "50",
    "to": "800",
    "dur": "5s",
    "begin": "0s",
    "fill": "freeze"
}

const rectAnimateAttributes = {
    "id": "rectAnimation",
    "attributeName": "x",
    "from": "10",
    "to": "800",
    "dur": "5s",
    "begin": "0s",
    "fill": "freeze"
}

function setAttributestoShapes(element, attributes) {
    for (let attribute in attributes) {
        element.setAttribute(attribute, attributes[attribute])
    }
};

function gameDifficulty(level) {
    switch (level) {
        case "1":
            return 3;
            break;
        case "2":
            return 2;
        default:
            return 5;
            break;
    }
}

setAttributestoShapes(shapeCicle, circleAttributes);
setAttributestoShapes(shapeCircle1, circle1Attributes);
setAttributestoShapes(shapeRect, rectAttributes);
setAttributestoShapes(circle1Animation, circle1AnimateAttributes);
setAttributestoShapes(circle2Animation, circle2AnimateAttributes);
setAttributestoShapes(rectAnimation, rectAnimateAttributes);



function startGame() {
    let zapped = 0
    document.getElementById("zapped").innerHTML = "";
    const difficulty = document.getElementById('difficulty');
    const level = difficulty.options[difficulty.selectedIndex].value;
    const duration = gameDifficulty(level);
    circle1Animation.setAttribute("dur", duration);
    circle2Animation.setAttribute("dur", duration);
    rectAnimation.setAttribute("dur", duration);
    const svgElement = document.getElementById("game-svg")
    svgElement.appendChild(shapeCicle);
    svgElement.appendChild(shapeCircle1);
    svgElement.appendChild(shapeRect);
    const svgCircle = document.getElementById('circle1');
    svgCircle.appendChild(circle1Animation);
    const svgCircle1 = document.getElementById('circle2');
    svgCircle1.appendChild(circle2Animation);
    const svgRect = document.getElementById('rect');
    svgRect.appendChild(rectAnimation);
    document.getElementById('circle1Animation').beginElement();
    document.getElementById('circle2Animation').beginElement();
    document.getElementById('rectAnimation').beginElement();
    let timeout = setTimeout(function () {
        document.getElementById("zapped").innerHTML = `Caught: ${zapped}      Missed: ${3 - zapped}`;
        svgCircle.remove();
        svgCircle1.remove();
        svgRect.remove();
    }, duration * 1000);
    document.getElementById('circle1').onclick = function () {
        this.remove();
        zapped++
    }
    document.getElementById('circle2').onclick = function () {
        this.remove();
        zapped++
    }
    document.getElementById('rect').onclick = function () {
        this.remove();
        zapped++
    }
}