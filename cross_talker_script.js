//import D3
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";


//set the dimensions of the area that we will be working with
let width = 1000;
let height = 1000;
let margin = 200;
let centerSize = 500;

let paddingPercentage = 50;

let showWellNames = false;

let fluxData = [];


let groups = {};

let csvFile = null;
let csvHeaders = [];
let metabolites = [];

let selectedMetabolites = [];

let metaboliteMap = {};
let metaboliteNormalMap = {};


let diagScale;

//let tickSizeArray = [];
let tickSizeScale;
let totalWidth = centerSize + 2 * margin;
let totalHeight = centerSize + 2 * margin;

let offsetX = (width - totalWidth) / 2;
let offsetY = 30;
let xStart = offsetX + margin;
let yStart = offsetY;
let xEnd = offsetX + margin + centerSize;
let yEnd = offsetY + centerSize;

let tickSizeArray = [];
let allConcValuesForScale;
let concValues = [];

const halfTick = {};

let concMode = "raw";

let normalizedConcValues = [];

let thicknessScale;





///  D3 visualization code below /////

//create the area on the left where graphics will take place
const svg = d3.select("#maincanvas")
    .append("svg")
    .attr("width", width)
    .attr("height", height);








let showSpecies = false;

document.getElementById("showSpeciesCheck").addEventListener("change", (e) => {
    showSpecies = e.target.checked;
    refreshCanvas(); // redraw rectangles & axes
});


//draw the rectangles
function drawRectangles() {
    svg.selectAll("rect").remove();
    svg.selectAll(".species-label").remove();

    const totalWidth = centerSize + 2 * margin;
    const totalHeight = centerSize + 2 * margin;

    const offsetX = (width - totalWidth) / 2;
    const offsetY = 30;

    svg.append("rect")
        .attr("x", offsetX)
        .attr("y", offsetY)
        .attr("width", margin)
        .attr("height", centerSize)
        .attr("fill", appearance.leftRectColor);

    svg.append("rect")
        .attr("x", offsetX + margin)
        .attr("y", offsetY + centerSize)
        .attr("width", centerSize)
        .attr("height", margin)
        .attr("fill", appearance.midRectColor);

    svg.append("rect")
        .attr("x", offsetX + margin + centerSize)
        .attr("y", offsetY)
        .attr("width", margin)
        .attr("height", centerSize)
        .attr("fill", appearance.rightRectColor);

    svg.append("rect")
        .attr("x", offsetX + margin)
        .attr("y", offsetY)
        .attr("width", centerSize)
        .attr("height", centerSize)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    if (showSpecies) {
        const leftSpecies = document.getElementById("leftSpeciesSelect").value;
        const rightSpecies = document.getElementById("rightSpeciesSelect").value;
        const bottomSpecies = document.getElementById("bottomSpeciesSelect").value;

        if (leftSpecies) {
            svg.append("text")
                .attr("class", "species-label")
                .attr("x", offsetX + 5)
                .attr("y", offsetY + 15)
                .text(leftSpecies)
                .attr("fill", "black")
                .attr("font-size", "14px")
                .attr("font-weight", "bold");
        }

        if (rightSpecies) {
            svg.append("text")
                .attr("class", "species-label")
                .attr("x", offsetX + margin + centerSize + 5)
                .attr("y", offsetY + 15)
                .text(rightSpecies)
                .attr("fill", "black")
                .attr("font-size", "14px")
                .attr("font-weight", "bold");
        }

        if (bottomSpecies) {
            svg.append("text")
                .attr("class", "species-label")
                .attr("x", offsetX + margin + 5)
                .attr("y", offsetY + centerSize + margin - 15)
                .text(bottomSpecies)
                .attr("fill", "black")
                .attr("font-size", "14px")
                .attr("font-weight", "bold");
        }
    }
}





function drawAxes() {

    if (selectedMetabolites.length == 0) {
        alert("Please upload a CSV file and select your desired metabolites!");
        return;
    }



    svg.selectAll(".axis").remove();
    svg.selectAll(".diag-label").remove();
    svg.selectAll(".diag-tick").remove();
    svg.selectAll("line.arrow").remove();
    svg.selectAll(".custom-label").remove();
    svg.selectAll(".label-bg").remove();


    const totalWidth = centerSize + 2 * margin;
    const totalHeight = centerSize + 2 * margin;

    const offsetX = (width - totalWidth) / 2;
    const offsetY = 30;


    // left axis //
    const yLeftScale = d3.scalePoint()
        .domain(selectedMetabolites)
        .range([offsetY, offsetY + centerSize])
        .padding((paddingPercentage / 100));

    const leftAxis = d3.axisLeft(yLeftScale).tickFormat("");

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${offsetX + margin}, 0)`)
        .call(leftAxis);


    let maxLabelSize = 0;
    selectedMetabolites.forEach(comp => {
        const y = yLeftScale(comp);



        const g = svg.append("g")
            .attr("class", "custom-label")
            .attr("transform", `translate(${offsetX + margin - 10}, ${y})`);

        const text = g.append("text")
            .text(comp)
            .attr("x", -40)
            .attr("y", 4)
            .attr("text-anchor", "end")
            .attr("font-size", "12px");

        const bbox = text.node().getBBox();



        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;



        g.insert("rect", "text")
            .attr("class", "label-bg")
            .attr("x", bbox.x - 2)
            .attr("y", bbox.y - 2)
            .attr("width", bbox.width + 6)
            .attr("height", bbox.height + 4)
            .attr("fill", "white")
            .attr("stroke", "black");


    });


    // bottom scale
    const xBottomScale = d3.scalePoint()
        .domain(selectedMetabolites)
        .range([offsetX + margin, offsetX + margin + centerSize])
        .padding((paddingPercentage / 100));

    const bottomAxis = d3.axisBottom(xBottomScale).tickFormat("");



    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${offsetY + centerSize})`)
        .call(bottomAxis);

    selectedMetabolites.forEach(comp => {
        const x = xBottomScale(comp);



        //const metConcNode = metaboliteMap[metabolite];

        const g = svg.append("g")
            .attr("class", "custom-label")
            .attr("transform", `translate(${x},${offsetY + centerSize + 10}) rotate(-90)`);

        const text = g.append("text")
            .text(comp)
            .attr("x", -40)
            .attr("y", 4)
            .attr("text-anchor", "end")
            .attr("font-size", "12px");

        const bbox = text.node().getBBox();

        g.insert("rect", "text")
            .attr("class", "label-bg")
            .attr("x", bbox.x - 2)
            .attr("y", bbox.y - 2)
            .attr("width", bbox.width + 6)
            .attr("height", bbox.height + 4)
            .attr("fill", "white")
            .attr("stroke", "black");
    });




    // right scale
    const yRightScale = d3.scalePoint()
        .domain(selectedMetabolites)
        .range([offsetY, offsetY + centerSize])
        .padding((paddingPercentage / 100));

    const rightAxis = d3.axisRight(yRightScale).tickFormat("");

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${offsetX + margin + centerSize},0)`)
        .call(rightAxis);

    selectedMetabolites.forEach(comp => {
        const y = yRightScale(comp);

        const g = svg.append("g")
            .attr("class", "custom-label")
            .attr("transform", `translate(${offsetX + margin + centerSize + 10},${y})`);

        const text = g.append("text")
            .text(comp)
            .attr("x", 40)
            .attr("y", 4)
            .attr("text-anchor", "start")
            .attr("font-size", "12px");

        const bbox = text.node().getBBox();

        g.insert("rect", "text")
            .attr("class", "label-bg")
            .attr("x", bbox.x - 2)
            .attr("y", bbox.y - 2)
            .attr("width", bbox.width + 6)
            .attr("height", bbox.height + 4)
            .attr("fill", "white")
            .attr("stroke", "black");

    });




    // diagonal scale










    if (timeCol != null) {
        drawDiagScale();
        drawScaledTicks(timeCol, yLeftScale, yRightScale, xBottomScale, diagScale);
    }





    console.log(selectedMetabolites);

    //let normalFlux;

    function drawArrows(fluxData, yLeftScale, yRightScale, xBottomScale, diagScale) {
        if (!fluxData || fluxData.length === 0) return;

        // define arrow marker once
        // define arrow marker once
        if (svg.select("#arrow").empty()) {
            svg.append("defs").append("marker")
                .attr("id", "arrow")
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 6)      // adjust so arrow tip touches the line end
                .attr("refY", 0)
                .attr("markerWidth", 18)            // fixed size in pixels
                .attr("markerHeight", 18)
                .attr("orient", "auto")
                .attr("markerUnits", "userSpaceOnUse")  // THIS MAKES SIZE CONSTANT
                .append("path")
                .attr("d", "M0,-5 L10,0 L0,5 L5,0 L0,-5")
                .attr("fill", "black");
        }


        const totalWidth = centerSize + 2 * margin;
        const offsetX = (width - totalWidth) / 2;
        const offsetY = 30;

        const maxThickness = 8;
        const minThickness = 1;

        //compute z-scores for thickness
        const fluxValues = fluxData.map(d => d.flux);


        // get min and max of raw flux values
        const fluxExtent = d3.extent(fluxValues);


        const allFluxMagnitudes = fluxData.map(d => Math.abs(d.flux));


        const minFluxAbs = d3.min(allFluxMagnitudes);
        const maxFluxAbs = d3.max(allFluxMagnitudes);

        const minArrowWidth = 1;
        const maxArrowWidth = 8;

        // thicknessScale = d3.scaleSymlog()
        //     .domain([minFluxAbs, maxFluxAbs])
        //     .range([minArrowWidth, maxArrowWidth])
        //     .constant(1);


        // create a linear scale from raw flux → thickness
        thicknessScale = d3.scaleSymlog()
            .domain(fluxExtent)
            .range([minThickness, maxThickness])
            .constant(1);


        const legendThicknessScale = d3.scaleSymlog()
            .domain([minFluxAbs, maxFluxAbs])
            .range([minThickness, maxThickness])
            .constant(1);

        // assign thickness to each flux object
        fluxData.forEach(d => {
            d.thickness = thicknessScale(d.flux);
            // const conc = tickSizeArray.find(t => t.metabolite === d.metabolite).concentration;
            // const tickSize = tickSizeScale(conc);
            // const halfTick = tickSize / 2;
            // console.log("halftick:", tickSize);

            svg.append("defs").append("marker")
                .attr("id", `arrow-${d.metabolite}`) // unique per metabolite
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 6)
                .attr("refY", 0)
                .attr("markerWidth", 18)
                .attr("markerHeight", 18)
                .attr("orient", "auto")
                .attr("markerUnits", "userSpaceOnUse")
                .append("path")
                .attr("d", "M0,-5 L10,0 L0,5 L5,0 L0,-5")
                .attr("fill", "black");


        });



        const rectangles = [
            {
                rect: 'left',
                scale: yLeftScale,
                startX: offsetX + margin,
                startYFunc: d => yLeftScale(d.metabolite),
                species: document.getElementById("leftSpeciesSelect").value
            },
            {
                rect: 'right',
                scale: yRightScale,
                startX: offsetX + margin + centerSize,
                startYFunc: d => yRightScale(d.metabolite),
                species: document.getElementById("rightSpeciesSelect").value
            },
            {
                rect: 'bottom',
                scale: xBottomScale,
                startXFunc: d => xBottomScale(d.metabolite),
                startY: offsetY + centerSize,
                species: document.getElementById("bottomSpeciesSelect").value
            }
        ];




        rectangles.forEach(r => {
            if (!r.species) return;

            fluxData
                .filter(d => d.species === r.species && selectedMetabolites.includes(d.metabolite))
                .forEach(d => {
                    let startX, startY;

                    // -----------------------------------
                    // 1. Compute raw start positions
                    // -----------------------------------
                    if (r.rect === 'bottom') {
                        startX = r.startXFunc(d);
                        startY = r.startY;
                    } else {
                        startX = r.startX;
                        startY = r.startYFunc(d);
                    }


                    const t = diagScale(d.metabolite);
                    if (t === undefined) return;

                    let diagX = offsetX + margin + t * centerSize;
                    let diagY = offsetY + t * centerSize;

                    if (r.rect == "left") {
                        diagX -= 2 * halfTick[d.metabolite];
                    }
                    else if (r.rect == "right") {
                        diagX += 2 * halfTick[d.metabolite];
                    }
                    else {
                        diagY += 2 * halfTick[d.metabolite];
                    }

                    // If diagonal also needs halftick:
                    // diagX += halfTick[d.metabolite];
                    // diagY += halfTick[d.metabolite];

                    console.log("for", d.metabolite, "it should be going", halfTick[d.metabolite], "points off");

                    // -----------------------------------
                    // 5. Determine direction
                    // -----------------------------------
                    // compute raw x2/y2 based on flux direction
                    let x1 = d.flux >= 0 ? startX : diagX;
                    let y1 = d.flux >= 0 ? startY : diagY;
                    let x2 = d.flux >= 0 ? diagX : startX;
                    let y2 = d.flux >= 0 ? diagY : startY;

                    // compute pullback vector for arrow line (7 pixels)
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const pullback = 7;
                    const ratio = pullback / len;

                    // shorten line by moving x2/y2 toward x1/y1
                    x2 -= dx * ratio;
                    y2 -= dy * ratio;





                    console.log("drawing line", startX, startY, "->", diagX, diagY);

                    svg.append("line")
                        .attr("class", "arrow")
                        .attr("x1", x1)
                        .attr("y1", y1)
                        .attr("x2", x2)
                        .attr("y2", y2)
                        .attr("stroke", d.flux >= 0 ? appearance.arrowColorOut : appearance.arrowColorIn)
                        .attr("stroke-width", d.thickness)
                        .attr("marker-end", "url(#arrow)");
                });


            const fluxValues = fluxData.map(d => d.flux);
            //const concValues = tickSizeArray.map(d => d.concentration);

            drawLegend (
                d3.min(fluxValues),
                d3.max(fluxValues),
                // d3.min(concValues),
                // d3.max(concValues),
                legendThicknessScale,
                tickSizeScale
            );
        });


    }



    drawArrows(fluxData, yLeftScale, yRightScale, xBottomScale, diagScale);
}


function makeScale(){

    let minVal;
    let maxVal;

    if (concMode == "raw"){
    minVal = d3.min(concValues);
    maxVal = d3.max(concValues);
    } else if (concMode == "normalized"){
        minVal = d3.min(normalizedConcValues);
        maxVal = d3.max(normalizedConcValues);
    }

    tickSizeScale = d3.scaleSymlog()
        .domain([minVal, maxVal])
        .range([5, 20])
        .constant(1);
}

function drawDiagScale() {



    totalWidth = centerSize + 2 * margin;
    totalHeight = centerSize + 2 * margin;

    offsetX = (width - totalWidth) / 2;
    offsetY = 30;
    xStart = offsetX + margin;
    yStart = offsetY;
    xEnd = offsetX + margin + centerSize;
    yEnd = offsetY + centerSize;


    // // Determine what tickInput is
    let tickValues = [];
    let tickMap = {}; // metabolite → tick size

    //if (!Array.isArray(tickInput)){console.log("thats not an array")};


    tickValues = tickSizeArray.map(d => d.concentration);

    
    // const minVal = d3.min(allConcValuesForScale);
    // const maxVal = d3.max(allConcValuesForScale);

    // tickSizeScale = d3.scaleSymlog()
    //     .domain([minVal, maxVal])
    //     .range([5, 30])
    //     .constant(1);

    concValues = tickSizeArray.map(d => d.concentration);

    makeScale();


    // //tickInput.forEach(d => tickValues[d.metabolite] = tickSizeScale(d.concentration));
    tickSizeArray.forEach(d => tickMap[d.metabolite] = tickSizeScale(d.concentration));

    console.log("tick values: ", tickValues);
    console.log("tick sizes:", tickSizeArray);
    console.log("tick map:", tickMap);






    // Draw the diagonal line
    svg.append("line")
        .attr("x1", xStart)
        .attr("y1", yStart)
        .attr("x2", xEnd)
        .attr("y2", yEnd)
        //.attr("stroke", "white")
        .attr("stroke-width", 2);

    // Diagonal position scale
    diagScale = d3.scalePoint()
        .domain(selectedMetabolites)
        .range([0, 1])
        .padding(paddingPercentage / 100);

    // Draw ticks and optionally labels
    selectedMetabolites.forEach(comp => {
        const t = diagScale(comp);
        const x = xStart + t * (xEnd - xStart);
        const y = yStart + t * (yEnd - yStart);

        // Determine tick size
        let tickSize = tickMap[comp];
        //let tickSize = 15;


        halfTick[comp] = tickSize / 2;
        console.log(halfTick);

        console.log(tickSize);



        // svg.selectAll(".diag-tick")
        //     .data(selectedMetabolites)
        //     .enter()
        //     .append("rect")
        //     .attr("class", "diag-tick")
        //     .attr("x", d => {
        //         const t = diagScale(d);
        //         return xStart + t * (xEnd - xStart) - tickMap[d] / 2;
        //     })
        //     .attr("y", d => {
        //         const t = diagScale(d);
        //         return yStart + t * (yEnd - yStart) - tickMap[d] / 2;
        //     })
        //     .attr("width", d => tickMap[d])
        //     .attr("height", d => tickMap[d])
        //     // .attr("r", d => tickMap[d])
        //     .attr("fill", appearance.tickFillColor);

        svg.selectAll(".diag-tick")
            .data(selectedMetabolites)
            .enter()
            .append("circle")
            .attr("class", "diag-tick")
            .attr("cx", d => {
                const t = diagScale(d);
                return xStart + t * (xEnd - xStart);
            })
            .attr("cy", d => {
                const t = diagScale(d);
                return yStart + t * (yEnd - yStart);
            })
            // .call(sel => setCircleDiameter(sel, d => tickMap[d]))
            .attr("r", d => tickMap[d])
            .attr("fill", appearance.tickFillColor)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5);



        const g = svg.append("g")
            .attr("class", "custom-label")
            .attr("transform", `translate(${x + 12},${y - 12})`)
            .attr("stroke", "black")                 // thin border
            .attr("stroke-width", 0.5);

        // svg.append("circle")
        //     .attr("cx", 200)
        //     .attr("cy", 200)
        //     .attr("r", 30)
        //     .attr("fill", appearance.tickFillColor)
        //     .attr("stroke", "black")
        //     .attr("stroke-width", 0.5);








        // Label if showWellNames
        if (showWellNames) {
            const g = svg.append("g")
                .attr("class", "custom-label")
                .attr("transform", `translate(${x + 12},${y - 12})`);

            const text = g.append("text")
                .text(comp)
                .attr("font-size", "12px")
                .attr("text-anchor", "start");

            const bbox = text.node().getBBox();
            g.insert("rect", "text")
                .attr("class", "label-bg")
                .attr("x", bbox.x - 3)
                .attr("y", bbox.y - 2)
                .attr("width", bbox.width + 6)
                .attr("height", bbox.height + 4)
                .attr("fill", "white")
                .attr("stroke", "black");
        }
    });
}

/**
* Draw scaled ticks/nodes for each metabolite × species using concentration at timeCol.
*
* @param {number} timeCol    - index of the time column (the same index you pass to calculateFlux)
* @param {object} yLeftScale - d3 scalePoint for left axis
* @param {object} yRightScale- d3 scalePoint for right axis
* @param {object} xBottomScale- d3 scalePoint for bottom axis
* @param {object} diagScale  - (optional) diag scale if you want diag ticks (can be null)
* @param {object} opts       - optional settings (minRadius, maxRadius, skipSpecies array)
*/
function drawScaledTicks(timeCol, yLeftScale, yRightScale, xBottomScale, diagScale) {
    const selected = new Set(selectedMetabolites);  // <— only draw these

    // Clean previous
    svg.selectAll(".scaled-tick").remove();

    // // Build a global list of concentrations ONLY for selected metabolites
    // const allPosConcs = [];

    // selected.forEach(met => {
    //     const rows = metaboliteMap[met];
    //     if (!rows) return;

    //     rows.forEach(row => {
    //         const conc = parseFloat(row[timeCol + 1]);
    //         if (isFinite(conc) && conc > 0) {
    //             allPosConcs.push(conc);
    //         }
    //     });
    // });

    // // If nothing selected → stop
    // if (allPosConcs.length === 0) return;

    // let concExtent;
    // const fluxExtent = d3.extent(fluxValues);

    // if (concMode == "normal"){
    //     const concValues = 
    //     concExtent = 
    // }

    //concValues = [];
    let rows = null;
    selected.forEach( met => {
        if (concMode == "normalized"){
            rows = metaboliteNormalMap[met];
        } else if(concMode == "raw"){
            rows = metaboliteMap[met];
        }

        const conc = parseFloat(rows[timeCol + 1]);
        concValues.push(conc);
    });
    
    makeScale();

    // Species lookup for rectangles
    const leftSpecies = document.getElementById("leftSpeciesSelect").value;
    const rightSpecies = document.getElementById("rightSpeciesSelect").value;
    const bottomSpecies = document.getElementById("bottomSpeciesSelect").value;

    const totalWidth = centerSize + 2 * margin;
    const offsetX = (width - totalWidth) / 2;
    const offsetY = 30;

    // Draw ticks ONLY for metabolites in selectedMetabolites
    selected.forEach(met => {
        let rows;

        if (concMode == "raw"){
            rows = metaboliteMap[met];
        }

        else if (concMode == "normalized"){
            rows = metaboliteNormalMap[met];
        }
        
        //if (!rows) return;

        rows.forEach(row => {
            const species = row[1];
            const conc = parseFloat(row[timeCol + 1]);
            if (!isFinite(conc)) return;

            const r = Math.abs(tickSizeScale(conc));

            // LEFT RECTANGLE
            if (species === leftSpecies) {
                const cy = yLeftScale(met);
                if (cy !== undefined) {
                    svg.append("circle")
                        .attr("class", "scaled-tick")
                        .attr("cx", offsetX + margin - r)
                        .attr("cy", cy)
                        .attr("r", r)
                        .attr("fill", appearance.tickFillColor)
                        .attr("stroke", "black")                 // thin border
                        .attr("stroke-width", 0.5);              // border thickness
                }
            }

            // RIGHT RECTANGLE
            if (species === rightSpecies) {
                const cy = yRightScale(met);
                if (cy !== undefined) {
                    svg.append("circle")
                        .attr("class", "scaled-tick")
                        .attr("cx", offsetX + margin + centerSize + r)
                        .attr("cy", cy)
                        .attr("r", r)
                        .attr("fill", appearance.tickFillColor)
                        .attr("stroke", "black")                 // thin border
                        .attr("stroke-width", 0.5);              // border thickness
                }
            }

            // BOTTOM RECTANGLE
            if (species === bottomSpecies) {
                const cx = xBottomScale(met);
                if (cx !== undefined) {
                    svg.append("circle")
                        .attr("class", "scaled-tick")
                        .attr("cx", cx)
                        .attr("cy", offsetY + centerSize + r)
                        .attr("r", r)
                        .attr("fill", appearance.tickFillColor)
                        .attr("stroke", "black")                 // thin border
                        .attr("stroke-width", 0.5);              // border thickness
                }
            }
        });
    });
}

function setCircleDiameter(selection, diameterAccessor) {
    selection.attr("r", d => diameterAccessor(d) / 2);
}


/// File handling and parsing below ////


//code to handle files coming from the input
document.getElementById("fileInput").addEventListener("change", e => {
    csvFile = e.target.files[0];
});




document.getElementById("processBtn").addEventListener("click", () => {
    if (csvFile == null) {
        alert("Please upload a CSV file!");
        return;
    }

    // Read and process each file
    const reader = new FileReader();


    reader.onload = e => {
        const rows = $.csv.toArrays(e.target.result);

        csvHeaders = rows[0];       // first row is header
        metabolites = rows.slice(1);       // everything else is data rows
        console.log("Parsed concentration/flux data:", metabolites);


        const compoundNames = metabolites.map(r => r[0]);


        for (let i = 0; i < metabolites.length; i++) {
            const row = metabolites[i];
            const type = row[1]; // the "type/species" column

            // if this group doesn't exist yet, make it
            if (!groups[type]) {
                groups[type] = [];
            }

            // add this metabolite to its group
            groups[type].push(row);
        }

        // for(let i = 2; i < metabolites[i].length; i += 2){
        //     console.log("this is time value #" + i/2);
        // }



        console.log(groups);

        ['compoundSelect', 'leftSpeciesSelect', 'rightSpeciesSelect', 'bottomSpeciesSelect', 'timeDropdown']
            .forEach(id => document.getElementById(id).disabled = false);
        document.getElementById("visualizeBtn").disabled = false;

        populateSpeciesDropdowns();

        populateDropdown(compoundNames);

        populateTimeDropdown(csvHeaders);



    };

    reader.readAsText(csvFile);

    //populateCompoundDropdown();

});


function populateSpeciesDropdowns() {
    const speciesNames = Object.keys(groups);

    ['leftSpeciesSelect', 'rightSpeciesSelect', 'bottomSpeciesSelect'].forEach(id => {
        const select = document.getElementById(id);
        select.innerHTML = "";
        speciesNames.forEach(name => {

            if (name == "Community" || name == "Control") return;

            const opt = document.createElement("option");
            opt.value = name;
            opt.textContent = name;
            select.appendChild(opt);
        });
    });
}




function populateTimeDropdown(headers) {
    const timeColumns = [];

    // collect all time column indices (every other column starting at index 2)
    for (let i = 3; i < headers.length; i += 3) {
        timeColumns.push(i);
    }

    const select = document.getElementById("timeDropdown");
    select.innerHTML = "";

    // placeholder
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select time frame...";
    placeholder.selected = true;
    placeholder.disabled = true;
    select.appendChild(placeholder);

    // create options with column indices as data attributes
    for (let i = 0; i < timeColumns.length; i++) {
        const opt = document.createElement("option");
        opt.textContent = `${headers[timeColumns[i]]}`;
        opt.value = `${timeColumns[i]}`; // store indices as "start-end"
        select.appendChild(opt);
    }
}




// Variable to store user's choice
let timeCol = null;

// Get the dropdown element
const timeDropdown = document.getElementById("timeDropdown");

// Listen for changes
timeDropdown.addEventListener("change", (e) => {

    // the time value that the user chooses
    // const timeCol = e.target.value.map(Number);
    timeCol = Number(e.target.value);


    // calculate flux based on the time value
    console.log(timeCol);
    fluxData = calculateFlux(timeCol);

    // redraw axes with arrows
    drawRectangles();
    drawAxes();


});




function calculateFlux(time) {
    const fluxData = []; // store {metabolite, flux}
    tickSizeArray = [];
    allConcValuesForScale = [];

    const nodeSizeScale = [];
    const nodeSizeData = {};



    // Build index of metabolite → rows
    metaboliteMap = {};
    metaboliteNormalMap = {};

    metabolites.forEach(row => {
        const metabolite = row[0];
        if (!metaboliteMap[metabolite]) metaboliteMap[metabolite] = [];
        metaboliteMap[metabolite].push(row);

        const clonedRow = structuredClone(row);
        if (!metaboliteNormalMap[metabolite]) metaboliteNormalMap[metabolite] = [];
        metaboliteNormalMap[metabolite].push(clonedRow);

        //allConcValuesForScale.push(row[time + 1]);
    });

    // metabolites.forEach(row => {
    //     const metabolite = row[0];
    //     if (!metaboliteNormalMap[metabolite]) metaboliteNormalMap[metabolite] = [];
    //     metaboliteNormalMap[metabolite].push(row);
    // });

    metabolites.forEach(row => {

        const metabolite = row[0];
        const species = row[1];


        if (row[1] !== "Control" && row[1] != "Community") { // skip control
            // get the values for the time and the concentration at each time point
            const timePoint = parseFloat(row[time]);
            const concAtTime = parseFloat(row[time + 1]);
            const stddevAtTime = parseFloat(row[time + 2]);








            //finding the community concentration for each of them at said time
            const rowsForMet = metaboliteMap[metabolite];
            const communityRow = rowsForMet.find(r => r[1] === "Community");

            if (!communityRow) {
                console.warn(`No community row found for metabolite ${metabolite}`);
                return;
            }

            const communityConcAtTime = parseFloat(communityRow[time + 1]);
            const communityStddev = parseFloat(communityRow[time + 2]);



            const diffusionCoefficient = parseFloat(row[2]);




            const fluxCalc = diffusionCoefficient * (concAtTime - communityConcAtTime);

            console.log({
                metabolite,
                fluxCalc,
                concAtTime,
                stddevAtTime,
                communityConcAtTime,
                diffusionCoefficient
            });

            const normalizedFlux = (fluxCalc / (Math.sqrt((stddevAtTime * ((concAtTime) ** 2)) + (communityStddev * ((communityConcAtTime) ** 2)))));












            console.log("------ FLUX CALCULATION ------");
            console.log("Metabolite:", metabolite);
            console.log("Species:", species);
            console.log("Species  conc:", concAtTime);
            //console.log("Normalized Conc:", normalizedConc);
            console.log("Community  conc:", communityConcAtTime);
            console.log("Diffusion coefficient:", diffusionCoefficient);
            console.log("SD species", stddevAtTime);
            console.log("SD community", communityStddev);
            console.log("Calculated flux:", fluxCalc);
            console.log("Calculated normalized flux:", normalizedFlux)
            console.log("------------------------------");




            //const flux = (endConc - startConc) / (endTime - startTime); // simple example
            console.log(row[0], "flux:", fluxCalc);

            fluxData.push({ metabolite: row[0], flux: normalizedFlux, species: row[1] });

            //tickSizeArray.push({ metabolite: communityRow[0], concentration: communityConcAtTime })


            //metaboliteNormalMap[metabolite][row][time + 1] = normalizedConc;





        }
    });

    metabolites.forEach(row => {



        const metabolite = row[0];
        const species = row[1];

        if (species == "Control") return;

        const timePoint = parseFloat(row[time]);
        const concAtTime = parseFloat(row[time + 1]);
        const stddevAtTime = parseFloat(row[time + 2]);








        //finding the community concentration for each of them at said time
        const rowsForMet = metaboliteMap[metabolite];
        const controlRow = rowsForMet.find(r => r[1] === "Control");


        const controlConcAtTime = parseFloat(controlRow[time + 1]);
        const controlStddev = parseFloat(controlRow[time + 2]);

        const normalizedConc = ((concAtTime - controlConcAtTime) / (Math.sqrt((stddevAtTime * ((concAtTime) ** 2)) + (controlStddev * ((controlConcAtTime) ** 2)))));

        // metaboliteNormalMap[row[time +1]] = normalizedConc;

        const clonedRows = metaboliteNormalMap[metabolite];

        const clonedRow = clonedRows.find(r =>
            r[1] === species && parseFloat(r[time]) === timePoint
        );

        // update the concentration column inside the cloned row
        clonedRow[time + 1] = normalizedConc;

        normalizedConcValues.push(normalizedConc);

    });

    metabolites.forEach(row => {

        const metabolite = row[0];
        const species = row[1];

        if (species != "Community") return;

        if (concMode == "normalized") {
            const rowsForMet = metaboliteNormalMap[metabolite];
            const communityRow = rowsForMet.find(r => r[1] === "Community");
            const communityConcAtTime = parseFloat(communityRow[time + 1]);
            tickSizeArray.push({ metabolite: communityRow[0], concentration: communityConcAtTime });
        }

        else if(concMode == "raw") {
            const rowsForMet = metaboliteMap[metabolite];
            const communityRow = rowsForMet.find(r => r[1] === "Community");
            const communityConcAtTime = parseFloat(communityRow[time + 1]);
            tickSizeArray.push({ metabolite: communityRow[0], concentration: communityConcAtTime });
        }


    });





    console.log(tickSizeArray);
    console.log(metaboliteMap);
    console.log(metaboliteNormalMap);
    drawDiagScale();



    return fluxData;
}



function drawLegend(minFlux, maxFlux, minConc, maxConc, scaleThickness, tickSizeScale) {

    // remove old legend
    svg.selectAll(".legend-group").remove();

    const legendWidth = 200;
    const legendHeight = 150;

    const legendX = 40;   // bottom-left fixed location
    const legendY = height - 200;

    // Create a draggable group
    const legend = svg.append("g")
        .attr("class", "legend-group")
        .attr("transform", `translate(${legendX},${legendY})`)
        .call(
            d3.drag()
                .on("drag", function (event) {
                    d3.select(this).attr(
                        "transform",
                        `translate(${event.x},${event.y})`
                    );
                })
        );

    // Background box
    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("opacity", 0.9);

    // ========== ARROW THICKNESS ============= //

    // thinnest
    legend.append("line")
        .attr("x1", 20)
        .attr("y1", 25)
        .attr("x2", 80)
        .attr("y2", 25)
        .attr("stroke", "black")
        .attr("stroke-width", scaleThickness(minFlux))
        .attr("marker-end", "url(#arrow)");

    legend.append("text")
        .attr("x", 90)
        .attr("y", 30)
        .text(minFlux.toPrecision(3));

//     // thickest
    legend.append("line")
        .attr("x1", 20)
        .attr("y1", 55)
        .attr("x2", 80)
        .attr("y2", 55)
        .attr("stroke", "black")
        .attr("stroke-width", scaleThickness(maxFlux))
        .attr("marker-end", "url(#arrow)");

    legend.append("text")
        .attr("x", 90)
        .attr("y", 60)
        .text(maxFlux.toPrecision(3));

    legend.append("text")
        .attr("x", 20)
        .attr("y", 15)
        .text("Normalized Flux → thickness")
        .attr("font-weight", "bold")
        .attr("font-size", 12);

//     // ========== NODE SIZE ============= //

    legend.append("text")
        .attr("x", 20)
        .attr("y", 85)
        .text("Conc → node size")
        .attr("font-weight", "bold")
        .attr("font-size", 12);

//     // smallest
    legend.append("circle")
        .attr("cx", 35)
        .attr("cy", 110)
        .attr("r", tickSizeScale(minConc))
        .attr("fill", "gray");

    legend.append("text")
        .attr("x", 50)
        .attr("y", 115)
        .text(minConc.toPrecision(3));

//     // largest
    legend.append("circle")
        .attr("cx", 150)
        .attr("cy", 110)
        .attr("r", tickSizeScale(maxConc))
        .attr("fill", "gray");

    legend.append("text")
        .attr("x", 140)
        .attr("y", 115)
        .text(maxConc.toPrecision(3));
}





let ts;  // global Tom Select instance

function populateDropdown(compoundNames) {

    const select = document.getElementById("compoundSelect");

    // clear previous options
    select.innerHTML = "";

    // add new options
    compoundNames.forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
    });

    // destroy previous Tom Select if it exists
    if (ts) ts.destroy();

    // reinitialize Tom Select
    ts = new TomSelect("#compoundSelect", {
        plugins: ['remove_button'],
        persist: false,
        create: false,
        maxItems: null,
        // sortField: {
        //     field: "text",
        //     direction: "asc"
        // },
        onChange: (values) => {
            selectedMetabolites = values; // always keep track of current selection
        },
        dropdownParent: 'body',
        maxOptions: 200
    });


}





/// code for buttons and sliders ////



document.getElementById("visualizeBtn").addEventListener("click", () => {
    drawRectangles();
    drawAxes();


});

document.getElementById("fluxBtn").addEventListener("click", () => {
    calculateFlux(timeCol);
});


function refreshCanvas() {
    svg.attr("width", width).attr("height", height);
    drawRectangles();
    drawAxes();
    drawDiagScale();
}

document.getElementById("marginSlider").addEventListener("input", e => {
    margin = Number(e.target.value);
    document.getElementById("marginVal").textContent = margin;
    refreshCanvas();
});

document.getElementById("centerSlider").addEventListener("input", e => {
    centerSize = Number(e.target.value);
    document.getElementById("centerVal").textContent = centerSize;
    refreshCanvas();
});

document.getElementById("widthSlider").addEventListener("input", e => {
    width = Number(e.target.value);
    document.getElementById("widthVal").textContent = width;
    refreshCanvas();
});

document.getElementById("heightSlider").addEventListener("input", e => {
    height = Number(e.target.value);
    document.getElementById("heightVal").textContent = height;
    refreshCanvas();
});

document.getElementById("paddingSlider").addEventListener("input", e => {
    paddingPercentage = Number(e.target.value);
    document.getElementById("paddingVal").textContent = paddingPercentage;
    refreshCanvas();
});

document.getElementById("wellNamesCheck").addEventListener("change", e => {
    showWellNames = e.target.checked;
    refreshCanvas();
})



document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Are you sure you want to reset everything? This will clear your current visualization and data.")) {

        svg.selectAll("*").remove();

        // reset globals
        csvFile = null;
        csvHeaders = [];
        metabolites = [];
        selectedMetabolites = [];
        fluxData = [];
        groups = {};
        selectedTimeInterval = null;

        // reset inputs
        document.getElementById("fileInput").value = "";
        if (ts) { ts.destroy(); ts = null; }
        document.getElementById("compoundSelect").innerHTML = "";
        document.getElementById("timeDropdown").innerHTML = "<option disabled selected>Select time frame...</option>";

        // reset sliders/checkbox/colors
        margin = 200; centerSize = 500; width = 1000; height = 1000; paddingPercentage = 50; showWellNames = false;
        ['marginSlider', 'centerSlider', 'widthSlider', 'heightSlider', 'paddingSlider'].forEach(id => document.getElementById(id).value = eval(id.replace('Slider', '')));
        document.getElementById("wellNamesCheck").checked = false;

        ['leftRectColorPicker', 'midRectColorPicker', 'rightRectColorPicker', 'tickFillColorPicker', 'arrowColorPickerIn', 'arrowColorPickerOut'].forEach(id => document.getElementById(id).value = appearance[id.replace('Picker', '')]);
        ['leftRectColorText', 'midRectColorText', 'rightRectColorText', 'tickFillColorText', 'arrowColorTextIn', 'arrowColorTextOut'].forEach(id => document.getElementById(id).value = appearance[id.replace(/Text/, '')]);

        // disable all controls except reset + file input
        document.getElementById("processBtn").disabled = true;
        document.getElementById("visualizeBtn").disabled = true;
        document.getElementById("fluxBtn").disabled = true;
        ['compoundSelect', 'leftSpeciesSelect', 'rightSpeciesSelect', 'bottomSpeciesSelect', 'timeDropdown',
            'marginSlider', 'centerSlider', 'widthSlider', 'heightSlider', 'paddingSlider',
            'wellNamesCheck',
            'leftRectColorPicker', 'midRectColorPicker', 'rightRectColorPicker', 'tickFillColorPicker', 'arrowColorPickerIn', 'arrowColorPickerOut',
            'leftRectColorText', 'midRectColorText', 'rightRectColorText', 'tickFillColorText', 'arrowColorTextIn', 'arrowColorTextOut']
            .forEach(id => document.getElementById(id).disabled = true);

        alert("Reset complete! You can now upload a new file.");
    }
});








let appearance = {
    leftRectColor: "#4e9eef",
    midRectColor: "#ff6d1f",
    rightRectColor: "#5dc723",
    tickFillColor: "#000000",
    arrowColorIn: "#000000",
    arrowColorOut: "#000000"
};



function bindColorControl(pickerId, textId, key) {
    const picker = document.getElementById(pickerId);
    const textbox = document.getElementById(textId);

    // Picking with color picker
    picker.addEventListener("input", () => {
        appearance[key] = picker.value;
        textbox.value = picker.value;
        refreshCanvas();
    });

    // Typing color manually
    textbox.addEventListener("change", () => {
        const val = textbox.value.trim();

        // Browser validation
        const temp = new Option().style;
        temp.color = val;

        if (temp.color !== "") {
            appearance[key] = val;
            picker.value = val.startsWith("#") ? val : picker.value;
            refreshCanvas();
        } else {
            alert("Invalid color format. Use hex, rgb(), hsl(), etc.");
        }
    });
}


bindColorControl("leftRectColorPicker", "leftRectColorText", "leftRectColor");
bindColorControl("midRectColorPicker", "midRectColorText", "midRectColor");
bindColorControl("rightRectColorPicker", "rightRectColorText", "rightRectColor");
bindColorControl("tickFillColorPicker", "tickFillColorText", "tickFillColor");
bindColorControl("arrowColorPickerIn", "arrowColorTextIn", "arrowColorIn");
bindColorControl("arrowColorPickerOut", "arrowColorTextOut", "arrowColorOut");




///// workflow control and or button disability
// Buttons
document.getElementById("processBtn").disabled = true;
document.getElementById("visualizeBtn").disabled = true;
document.getElementById("fluxBtn").disabled = true;

// Dropdowns
['compoundSelect', 'leftSpeciesSelect', 'rightSpeciesSelect', 'bottomSpeciesSelect', 'timeDropdown']
    .forEach(id => document.getElementById(id).disabled = true);

// Sliders
['marginSlider', 'centerSlider', 'widthSlider', 'heightSlider', 'paddingSlider']
    .forEach(id => document.getElementById(id).disabled = true);

// Checkbox
document.getElementById("wellNamesCheck").disabled = true;

// Color pickers
['leftRectColorPicker', 'midRectColorPicker', 'rightRectColorPicker', 'tickFillColorPicker', 'arrowColorPickerIn', 'arrowColorPickerOut']
    .forEach(id => document.getElementById(id).disabled = true);
['leftRectColorText', 'midRectColorText', 'rightRectColorText', 'tickFillColorText', 'arrowColorTextIn', 'arrowColorTextOut']
    .forEach(id => document.getElementById(id).disabled = true);

// Reset is always enabled
document.getElementById("resetBtn").disabled = false;




document.getElementById("fileInput").addEventListener("change", e => {
    csvFile = e.target.files[0];
    document.getElementById("processBtn").disabled = !csvFile;
});









document.getElementById("visualizeBtn").addEventListener("click", () => {
    drawRectangles();
    drawAxes();

    // enable flux button
    document.getElementById("fluxBtn").disabled = false;

    // enable all customization controls
    ['marginSlider', 'centerSlider', 'widthSlider', 'heightSlider', 'paddingSlider',
        'wellNamesCheck',
        'leftRectColorPicker', 'midRectColorPicker', 'rightRectColorPicker', 'tickFillColorPicker', 'arrowColorPickerIn', 'arrowColorPickerOut',
        'leftRectColorText', 'midRectColorText', 'rightRectColorText', 'tickFillColorText', 'arrowColorTextIn', 'arrowColorTextOut']
        .forEach(id => document.getElementById(id).disabled = false);
});




document.getElementById("fluxBtn").addEventListener("click", () => {
    if (!document.getElementById("timeDropdown").value) {
        return alert("Select a time interval first!");
    }

    const [start, end] = document.getElementById("timeDropdown").value.split("-").map(Number);
    fluxData = calculateFlux(timeCol);

    drawRectangles();
    drawAxes();
});

document.getElementById("normConcBtn").addEventListener("click", () => {
    concMode = "normalized";
    calculateFlux(timeCol);
    drawAxes();
});

document.getElementById("rawConcBtn").addEventListener("click", () => {
    concMode = "raw";
    calculateFlux(timeCol);
    drawAxes();
});


function getTimestamp() {
    const now = new Date();

    const pad = n => n.toString().padStart(2, "0");

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hour = pad(now.getHours());
    const minute = pad(now.getMinutes());
    const second = pad(now.getSeconds());

    return `${year}-${month}-${day}_${hour}-${minute}-${second}`;
}


document.getElementById("downloadSVG").addEventListener("click", () => {
    // Select your SVG element
    const svg = document.querySelector("svg");

    // Serialize it to a string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    // Create a blob with the SVG string
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });

    // Create a temporary download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `diagram_${getTimestamp()}.svg`;  // filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);  // cleanup
});

function downloadPNG() {
    const svg = document.getElementById("svg");
    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svg);

    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = svg.viewBox.baseVal.width || svg.clientWidth;
        canvas.height = svg.viewBox.baseVal.height || svg.clientHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const pngURL = canvas.toDataURL("image/png");

        const a = document.createElement("a");
        a.href = pngURL;
        a.download = `diagram_${getTimestamp()}.png`;
        a.click();

        URL.revokeObjectURL(url);
    };
    img.src = url;
}


async function downloadPDF() {
    const { jsPDF } = window.jspdf;

    const svg = document.getElementById("mainSVG");
    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svg);

    const pdf = new jsPDF("landscape", "pt", [
        svg.clientWidth,
        svg.clientHeight
    ]);

    pdf.svg(svg, { x: 0, y: 0 }).then(() => {
        pdf.save(`diagram_${getTimestamp()}.pdf`);
    });
}



document.addEventListener("DOMContentLoaded", () => {
    const header = document.getElementById("moduleHeader");
    if (!header) return;

    // Tiny mitochondrion graphic
    const mitoSVG = `
        <svg viewBox="0 0 64 64" class="mito-icon mito-animated">
            <ellipse cx="32" cy="32" rx="26" ry="14" fill="#ff9f43" stroke="#d35400" stroke-width="4"/>
            <path d="M16 32c6-8 12 8 18 0s12 8 18 0"
                  fill="none" stroke="#ffeaa7" stroke-width="4" stroke-linecap="round"/>
        </svg>
    `;

    // Flex row to hold them
    const iconRow = document.createElement("div");
    iconRow.classList.add("mito-row");

    // Two animated mitochondria
    iconRow.innerHTML = mitoSVG + mitoSVG;

    // Attach below header
    header.appendChild(iconRow);
});
