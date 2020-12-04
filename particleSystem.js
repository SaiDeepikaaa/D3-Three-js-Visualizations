/* author: Andrew Burks */
"use strict";

/* Get or create the application global variable */
var App = App || {};

const ParticleSystem = function () {

    // setup the pointer to the scope 'this' variable
    const self = this;

    // data container
    const data = [];

    // scene graph group for the particle system
    const sceneObject = new THREE.Group();

    // bounds of the data
    const bounds = {};

    // create the containment box.
    // This cylinder is only to guide development.
    // TODO: Remove after the data has been rendered
    self.drawContainment = function () {

        // get the radius and height based on the data bounds
        const radius = (bounds.maxX - bounds.minX) / 2.0 + 1;
        const height = (bounds.maxY - bounds.minY) + 1;

        // create a cylinder to contain the particle system
        const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            wireframe: true
        });
        const cylinder = new THREE.Mesh(geometry, material);

        // add the containment to the scene
        sceneObject.add(cylinder);
    };

    // creates the particle system
    self.createParticleSystem = function () {
        const color = d3.scaleSequential()
            .domain([0, 30])
            .interpolator(d3.interpolateReds);

        // use self.data to create the particle system
        // draw your particle system here!
        let particleGeometry = new THREE.Geometry();
        let particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: THREE.VertexColors,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            map: new THREE.TextureLoader().load("https://threejs.org/examples/textures/sprites/disc.png")
        });
        data.forEach((vertex) => {
            let particlePosition = new THREE.Vector3(vertex.X, vertex.Z, vertex.Y);
            let particleColor = new THREE.Color(color(vertex.concentration))
            particleGeometry.vertices.push(particlePosition);
            particleGeometry.colors.push(particleColor);
        });
        let particleSystem = new THREE.Points(
            particleGeometry,
            particleMaterial
        );
        sceneObject.add(particleSystem);

        const radius = (2 * (bounds.maxX - bounds.minX) / 2.0 + 1);
        const height = (bounds.maxZ - bounds.minZ) + 2;
        const startAtCenter = (bounds.maxZ + bounds.minZ) / 2
        let planeGeometry = new THREE.PlaneGeometry(radius, height);
        let planeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.4
        });
        let plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.translateY(startAtCenter);
        document.addEventListener('keydown', function (event) {
            let currentZPosition = plane.position.z;
            switch (event.key) {
                case 'd':
                    if (currentZPosition >= bounds.maxX) {
                        break;
                    }
                    plane.translateZ(0.1);
                    self.BrushingEffect(currentZPosition, particleSystem, color);
                    self.generate2DPlot(currentZPosition, color);
                    break;
                case 'w':
                    if (currentZPosition >= bounds.maxX) {
                        break;
                    }
                    plane.translateZ(0.5);
                    self.BrushingEffect(currentZPosition, particleSystem, color);
                    self.generate2DPlot(currentZPosition, color);
                    break;
                case 'a':
                    if (currentZPosition <= bounds.minX) {
                        break;
                    }
                    plane.translateZ(-0.1);
                    self.BrushingEffect(currentZPosition, particleSystem, color);
                    self.generate2DPlot(currentZPosition, color);
                    break;
                case 's':
                    if (currentZPosition <= bounds.minX) {
                        break;
                    }
                    plane.translateZ(-0.5);
                    self.BrushingEffect(currentZPosition, particleSystem, color);
                    self.generate2DPlot(currentZPosition, color);
                    break;
                case 'r':
                    plane.position.z = 0;
                    self.reset(particleSystem, color);
                    self.generate2DPlot(currentZPosition, color);
            }
        });
        sceneObject.add(plane);
    };

    self.generate2DPlot = function (currentZPosition, color) {

        d3.selectAll('#plot').select('svg').remove();

        let scatterData = data.filter((particle) => {
            return particle.Y <= (currentZPosition + 0.01) && particle.Y >= (currentZPosition - 0.01);
        });
        const margin = {
                top: 50,
                right: 30,
                bottom: 50,
                left: 50
            },
            outerWidth = 600,
            outerHeight = 500,
            width = outerWidth - margin.left - margin.right,
            height = outerHeight - margin.top - margin.bottom;

        const div = d3
            .select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        let x = d3.scaleLinear()
            .range([0, width]);

        let y = d3.scaleLinear()
            .range([height, 0]);
        let xMax = d3.max(scatterData, function (d) {
            return d.X;
        }) * 1.05
        let xMin = d3.min(scatterData, function (d) {
            return d.X;
        })
        let yMax = d3.max(scatterData, function (d) {
            return d.Z;
        }) * 1.05
        let yMin = d3.min(scatterData, function (d) {
            return d.Z;
        })
        x.domain([xMin - 0.1, xMax + 0.1]);
        y.domain([yMin - 0.1, yMax + 0.1]);
        let svg = d3.select("#plot")
            .append("svg")
            .attr("width", outerWidth)
            .attr("height", outerHeight)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        const xAxisG = g.append('g')
            .attr('transform', `translate(0, ${innerHeight})`);
        const yAxisG = g.append('g');

        xAxisG.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2 - 100)
            .attr('y', -420)
            .text('X-Coordinate');

        yAxisG.append('text')
            .attr('class', 'axis-label')
            .attr('x', -height / 2 + 100)
            .attr('y', -70)
            .attr('transform', `rotate(-90)`)
            .style('text-anchor', 'middle')
            .text('Y-Coordinate');

        let xAxis = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        let yAxis = svg.append("g")
            .call(d3.axisLeft(y));

        svg.append('g')
            .selectAll("circle")
            .data(scatterData)
            .enter()
            .append("circle")
            .attr('id', 'circle')
            .attr("cx", function (d) {
                return x(d.X);
            })
            .attr("cy", function (d) {
                return y(d.Z);
            })
            .attr("r", 5)
            .style("fill", (d) => {
                return (color(d.concentration));
            })
            .style("opacity", 0.8)
            .on('mouseover', pointSelected)
            .on('mouseout', pointDisSelected)

        function pointSelected(d) {
            div.transition()
                .duration(200)
                .style('opacity', 0.9);
            div.html(generateTipData(d))
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY + 'px');
            d3.select(this)
                .style('opacity', 0.75)
        }

        function pointDisSelected(d) {
            div.transition()
                .duration(500)
                .style('opacity', 0);
            d3.select(this)
                .style('opacity', 1)
        }

        function generateTipData(data) {
            let text = `<span><b>X: </b>` + data.X + `</span><br/>`
            text += `<span><b>Y: </b>` + data.Z + `</span><br/>
                    <span><b>Concentration: </b>` + data.concentration + `</span>
                    `;
            return text;
        }
    };

    self.BrushingEffect = function (currentZPosition, particleSystem, color) {
        particleSystem.geometry.colorsNeedUpdate = true;
        const greyScale = d3.scaleSequential()
            .domain([0, 30])
            .interpolator(d3.interpolateGreys);
        for (let i = 0; i < particleSystem.geometry.vertices.length; i++) {
            if (data[i].Y >= (currentZPosition - 0.01) && data[i].Y <= (currentZPosition + 0.01)) {
                particleSystem.geometry.colors[i].set(color(data[i].concentration));
            } else {
                particleSystem.geometry.colors[i].set(greyScale(data[i].concentration));
            }
        };
    }

    self.reset = function (particleSystem, color) {
        particleSystem.geometry.colorsNeedUpdate = true;
        for (let i = 0; i < particleSystem.geometry.vertices.length; i++) {
            particleSystem.geometry.colors[i].set(color(data[i].concentration));
        };
    }

    // data loading function
    self.loadData = function (file) {

        // read the csv file
        d3.csv(file)
            // iterate over the rows of the csv file
            .row(function (d) {

                // get the min bounds
                bounds.minX = Math.min(bounds.minX || Infinity, d.Points0);
                bounds.minY = Math.min(bounds.minY || Infinity, d.Points1);
                bounds.minZ = Math.min(bounds.minZ || Infinity, d.Points2);

                // get the max bounds
                bounds.maxX = Math.max(bounds.maxX || -Infinity, d.Points0);
                bounds.maxY = Math.max(bounds.maxY || -Infinity, d.Points1);
                bounds.maxZ = Math.max(bounds.maxY || -Infinity, d.Points2);

                // add the element to the data collection
                data.push({
                    // concentration density
                    concentration: Number(d.concentration),
                    // Position
                    X: Number(d.Points0),
                    Y: Number(d.Points1),
                    Z: Number(d.Points2),
                    // Velocity
                    U: Number(d.velocity0),
                    V: Number(d.velocity1),
                    W: Number(d.velocity2)
                });
            })
            // when done loading
            .get(function () {
                // draw the containment cylinder
                // TODO: Remove after the data has been rendered

                // create the particle system
                self.createParticleSystem();
            });
    };

    // publicly available functions
    self.public = {

        // load the data and setup the system
        initialize: function (file) {
            self.loadData(file);
        },

        // accessor for the particle system
        getParticleSystems: function () {
            return sceneObject;
        }
    };

    return self.public;

};