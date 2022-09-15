let pixelratio = window.devicePixelRatio

if (pixelratio == null){
  pixelratio = 1
}


var margin = {top: 100, right: 200, bottom: 100, left: 200},
    width = window.innerWidth - margin.left - margin.right,
    height = window.innerHeight - margin.top - margin.bottom;

// set the active category type
var activecatnum = 0
var activelabelnum = 1
var color = d3.scaleOrdinal(colorDictionaries[activecatnum]);

var drawData = true;
var drawLoadings = false;
var showLabels = false;
var showGrid = false;
// load in the data and transform it
// get the value, category, and label types
let categoryValues = {}
for (let i = 0; i < categoryTypes.length; i++){
    categoryValues[categoryTypes[i]] = new Set();
}
let setdata = 0
let data = alldata[setdata]
let loadings = allloadings[setdata]
//let lines = linepairs[setdata]
let transitioning = false;
window.onload = function(){

function addDataInfo(data){
    for (i = 0; i < data.length; i++){
        data[i].size = 2.5;
        for (j = 0; j < labels[i].length; j ++){
            data[i][j] = labels[i][j];
        }
    }
}

addDataInfo(data)

var chartArea = d3.select("#dataviz").append("div")
    .style("position","relative")
    .style("float","left")
    .style("left", margin.left+"px")
    .style("top", margin.top+"px");

let canvas = chartArea.append("canvas")
    .classed("vizlayer",true)
    .style("position","absolute")
    .call(d3.zoom().scaleExtent([.1, 50])
    .on("zoom", zoom))
    .attr('width', width)
    .attr('height', height)
    .style("width",width+"px")
    .style("height",height+"px");

var context = canvas.node().getContext("2d");

canvas.attr("width",width * pixelratio);
canvas.attr("height",height * pixelratio);

// ...then scale it back down with CSS
canvas.style("width", width+ 'px')
canvas.style("height", height+ 'px')

context.scale(pixelratio,pixelratio)


let fontsize = 18;
context.font= fontsize+"px Open Sans";


var currenttransform = d3.zoomIdentity;

var svg = d3.select("#dataviz").append("svg")
    .classed("overlay",true)
    .style("position","absolute")
    .attr("width", 2*width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.select("#dataviz").append("svg")
    .style("position","relative")
    .attr("width", 0)
    .attr("height", height + margin.top + margin.bottom)
    .style("pointer-events", "none")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var x = d3.scaleLinear()
    .range([0, width]);
var y = d3.scaleLinear()
    .range([height, 0]);
var xScale = d3.scaleLinear()
    .range([0, width]);
var yScale = d3.scaleLinear()
    .range([height, 0]);

var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);
var x2Axis = d3.axisBottom(x);
var y2Axis = d3.axisLeft(y);


// set the domains of the default values (the first two value types)
var boundData = {x:0, y:1, xString:valueTypes[0], 
                    yString:valueTypes[1]};

var activeCatType = categoryTypes[activecatnum]

labels.forEach(function(d){
    categoryValues[activeCatType].add(d[activecatnum])
})

var activeCategories = categoryValues[activeCatType]


x.domain(d3.extent(data, function(d) { return d[valueTypes[0]]; })).nice();
y.domain(d3.extent(data, function(d) { return d[valueTypes[1]]; })).nice();
xScale.domain(d3.extent(data, function(d) { return d[valueTypes[0]]; })).nice();
yScale.domain(d3.extent(data, function(d) { return d[valueTypes[1]]; })).nice();


var gX = svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
var gY = svg.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);

var g2X = svg.append("g")
    .attr("class", "axis axis--x")
    .call(x2Axis);

var g2Y = svg.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate("+width+",0)")
    .call(y2Axis);


// var graphTitle = svg.append("text")
//   .attr("x", width + 40)
//   .attr("y", margin.top)
//   .attr("font-size",32)
//   .text("Scatter Plot (PCA)")

var xLabel = svg.append("text")
    .attr("x",width/2)
    .attr("y",height +40)
    .attr("font-size",18)
    .attr("text-anchor","middle")
    .text(boundData.xString + " ("+expVar[setdata][0]+")");

var yLabel = svg.append("text")
    .attr("x",0-40)
    .attr("y",height/2)
    .attr("font-size",18)
    .attr("text-anchor","middle")
    .attr("transform", "rotate(-90,-40,"+height/2+")")
    .text(boundData.yString+ " ("+expVar[setdata][1]+")");



draw(currenttransform, "transform",d3.zoomIdentity);

function zoom() {

    xScale = d3.event.transform.rescaleX(x);
    yScale = d3.event.transform.rescaleY(y);
    
    // update axes
    gX.call(xAxis.scale(xScale));
    gY.call(yAxis.scale(yScale));
    g2X.call(xAxis.scale(xScale));
    g2Y.call(yAxis.scale(yScale));
    context.clearRect(0, 0, width, height);
    currenttransform = d3.event.transform
    draw(currenttransform,"transform",d3.event.transform);
}

function draw(transform, operation=null,inputvalue=null) {
    context.fillStyle = '#222';
    context.fillRect(0, 0, width, height);
    context.font= fontsize+"px Open Sans"
    
    var i = -1, n = data.length;
    context.beginPath();

    if (showGrid) {
        xline = inputvalue.apply([0,y(0)])
        yline = inputvalue.apply([x(0),0])
        context.beginPath();
        context.moveTo(0,xline[1])
        context.lineTo(width,xline[1])
        context.strokeStyle="#aaa"
        context.stroke();
        context.beginPath();
        context.moveTo(yline[0],height)
        context.lineTo(yline[0],0)
        context.strokeStyle="#aaa"
        context.stroke();

    }

    // for (k = 0; k < lines.length; k++){
    //     if (operation == "transition"){
    //         lineds = [xScale(lines[k].startx1),yScale(lines[k].starty1)]
    //         linedy = [xScale(lines[k].startx2),yScale(lines[k].starty2)]
    //     } else {
    //         lineds = inputvalue.apply([x(lines[k][1]), y(lines[k][2])])
    //         linedy = inputvalue.apply([x(lines[k][3]), y(lines[k][4])])
    //     }
    //     context.strokeStyle="#fff" //labelToColor[lines[k][0]+"full"]
    //     context.beginPath();
    //     context.moveTo(lineds[0],lineds[1])
    //     context.lineTo(linedy[0],linedy[1])
        
    //     context.stroke()
    // }

    while (++i < n) {
    
        var da = []
        

        for (let j = 0; j<valueTypes.length;j++){
            da.push(data[i][valueTypes[j]])
        }
    
        //Use x scale because of transform
        if (operation == "transform"){
        if (boundData.x == -1) {
            var usex = 0
        } else {
            var usex = da[boundData.x]
        }
        if (boundData.y == -1){
            var usey = 0;
        } else {
            var usey = da[boundData.y]
        }
        
        var d = [x(usex), y(usey)];
        d = inputvalue.apply(d);
        

        } else if (operation == "transition") {
            var d = [xScale(data[i].startx), yScale(data[i].starty)]
            
        } else {
        if (boundData.x == -1) {
            var usex = 0
        } else {
            var usex = da[boundData.x]
        }
        if (boundData.y == -1){
            var usey = 0;
        } else {
            var usey = da[boundData.y]
        }
        var d = [xScale(usex), yScale(usey)]
        }
        
        data[i].px = d[0]
        data[i].py = d[1]
        
        data[i].c = color(data[i][activecatnum])
        
        
        
        
        
    
    }
    

    
    if (drawData){
        
        var i = -1, n = data.length-1;
        
        while (i++ < n){
        
        if (data[i].size > 0) {
        
            if (activeCategories.has(data[i][activecatnum])){
            context.moveTo(data[i].px,data[i].py);
            
            context.fillStyle = data[i].c;
            
            
            context.beginPath();
            context.arc(data[i].px,data[i].py, 4, 0, 2 * Math.PI);
            context.fill();
            context.closePath();
            
            
            if (transform.k > 2 || showLabels == true){
                context.fillText(data[i][activelabelnum],data[i].px+4,data[i].py-4)
            }
            }
        }
        }
        
    }

    
    if (drawLoadings) {

        var i = -1, n = loadings.length -1;
        while (i++ < n){
        var da = []
        
        for (j = 0; j < valueTypes.length; j++){
            da.push(loadings[i][1][valueTypes[j]])
        }
        
        currenttext = loadings[i][0]
        if (operation == "transform"){
            var d = [x(da[boundData.x]), y(da[boundData.y])]
            d = inputvalue.apply(d);
        } else if (operation == "transition") {
            var d = [xScale(loadings[i].startx), yScale(loadings[i].starty)]
        } else {
            var d = [xScale(da[boundData.x]), yScale(da[boundData.y])]
        }
        
        context.fillStyle="white";
        context.fillText(currenttext,d[0],d[1])

        }
    }
    context.closePath();
    }

var colorselect = svg.selectAll(".colorselect")
    .data(limitedCategories)
    .enter().append("g")
    .attr("transform", function(d, i) { var adjust = (i*50)+height/14;return "translate(0," + adjust + ")"; });

// var colorr = colorselect.append("rect")
//     .attr("x", width + 60)
//     .attr("width", 80)
//     .attr("height", 40)
//     .attr("rx", 4)
//     .attr("ry", 4)
//     .attr("class", "colorselect")
//     .attr("id", function(d,i){return i})
//     .style("pointer-events","auto")
//     .on("click", function(d){setCategory(d);});

function setCategory(input){
    activecatnum =categoryTypes.indexOf(input)
    activeCatType = input
    activeCategories = categoryValues[activeCatType]
    
    labels.forEach(function(d){
        categoryValues[activeCatType].add(d[activecatnum])
    })
    color = d3.scaleOrdinal(colorDictionaries[activecatnum])
    draw(currenttransform, "transform", currenttransform)
    svg.selectAll(".legend").remove()
    legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { var adjust = (i*20)+20;return "translate(0," + adjust + ")"; });
    
    lrect = legend.append("rect")
    .attr("x", width - 46)
    .attr("width", 18)
    .attr("height", 18)
    .attr("id",function(d,i){return i})
    .style("fill", color)
    .style("pointer-events","auto")
    .on("click", function(d,i){toggleItem(d,i)});

legend.append("text")
    .attr("x", width - 52)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style('font-size', "12px")
    .style("text-anchor", "end")
    .text(function(d) { return d; });
    
    function toggleItem(d,i){
    referenceitem = d3.select(lrect._groups[0][i])
    if (activeCategories.has(d)) {
        activeCategories.delete(d);
        referenceitem.style("stroke",color(d))
                .style("stroke-opacity","1.0")
                .style("fill-opacity","0.0");
    } else {
        activeCategories.add(d)
        referenceitem.style("fill",color(d))
                    .style("fill-opacity","1.0")
                    .style("stroke-opacity","0.0")
        };
    draw(currenttransform);
    }
    
}

// colorselect.append("text")
//     .attr("x", width+100)
//     .attr("y", 26)
//     .style("text-anchor","middle")
//     .style('font-size',"18px")
//     .style('text-transform', 'capitalize')
//     .attr("class", "colortext")
//     .text(function(d) { return d; });
    

var legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { var adjust = (i*20)+20;return "translate(0," + adjust + ")"; });
    
var lrect = legend.append("rect")
    .attr("x", width - 46)
    .attr("width", 18)
    .attr("height", 18)
    .attr("id",function(d,i){return i})
    .style("fill", color)
    .style("pointer-events","auto")
    .on("click", function(d,i){toggleItem(d,i)});

legend.append("text")
    .attr("x", width - 52)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style('font-size', "12px")
    .style("text-anchor", "end")
    .text(function(d) { return d; });
    
    function toggleItem(d,i){
    var referenceitem = d3.select(lrect._groups[0][i])
    if (activeCategories.has(d)) {
        activeCategories.delete(d);
        referenceitem.style("stroke",color(d))
                .style("stroke-opacity","1.0")
                .style("fill-opacity","0.0");
    } else {
        activeCategories.add(d)
        
        referenceitem.style("fill",color(d))
                    .style("fill-opacity","1.0")
                    .style("stroke-opacity","0.0")
        };
    draw(currenttransform);
    }
    svg.append('g')
        .append('rect')
        .attr("x",-160)
        .attr("y",height/14)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width","80")
        .attr("height","40")
        .attr("class", "interact")
        .style("pointer-events","auto")
        .on("click",toggleLoadings)
    
    svg.append("text")
        .attr("x", -120)
        .attr("y",height/14+26)
        .style('font-size', "18px")
        .style("pointer-events","none")
        .attr("class", "interacttext")
        .attr("text-anchor","middle")
        .text("Loadings")

    svg.append("text")
        .attr("x", -120)
        .attr("y", 0)
        .style('font-size', "24px")
        .attr("text-anchor","middle")
        .style("alignment-baseline", "hanging")
        .style('fill', "#fff")
        .text("Toggle")

    // svg.append("text")
    //     .attr("x", width+100)
    //     .attr("y", 0)
    //     .style('font-size', "24px")
    //     .attr("text-anchor","middle")
    //     .style("alignment-baseline", "hanging")
    //     .style('fill', "#fff")
    //     .text("Color")

    function toggleLoadings() {
        drawLoadings = !drawLoadings;
        draw(currenttransform, "transform", currenttransform);
    }

    svg.append('g')
        .append('rect')
        .attr("x",-160)
        .attr("y",height/14+50)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width","80")
        .attr("height","40")
        .attr("class", "interact")
        .style("pointer-events","auto")
        .on("click",toggleData)
    
    svg.append("text")
        .attr("x", -120)
        .attr("y",height/14+50+26)
        .style('font-size', "18px")
        .style("pointer-events","none")
        .attr("class", "interacttext")
        .attr("text-anchor","middle")
        .text("Data")

    function toggleData() {
        drawData = !drawData;
        draw(currenttransform, "transform", currenttransform)
    }
    
    svg.append('g')
        .append('rect')
        .attr("x",-160)
        .attr("y",height/14+100)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width","80")
        .attr("height","40")
        .attr("class", "interact")
        .style("pointer-events","auto")
        .on("click",toggleLabels)
    
    svg.append("text")
        .attr("x", -120)
        .attr("y",height/14+100+26)
        .style('font-size', "18px")
        .style("pointer-events","none")
        .attr("class", "interacttext")
        .attr("text-anchor","middle")
        .text("Labels")

    function toggleLabels() {
        showLabels = !showLabels;
        draw(currenttransform, "transform", currenttransform)
    }


    svg.append('g')
        .append('rect')
        .attr("x",-160)
        .attr("y",height/14+200)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width","80")
        .attr("height","40")
        .attr("class", "interact")
        .style("pointer-events","auto")
        .on("click",fontUp)
    
    svg.append("text")
        .attr("x", -120)
        .attr("y",height/14+200+26)
        .style('font-size', "18px")
        .style("pointer-events","none")
        .attr("class", "interacttext")
        .attr("text-anchor","middle")
        .text("Font+")

    function fontUp(){
        fontsize += 6
        if (fontsize > 120) {
            fontsize = 120
        }
        draw(currenttransform)
    }
    svg.append('g')
    .append('rect')
    .attr("x",-160)
    .attr("y",height/14+250)
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("width","80")
    .attr("height","40")
    .attr("class", "interact")
    .style("pointer-events","auto")
    .on("click",fontDown)

svg.append("text")
    .attr("x", -120)
    .attr("y",height/14+250+26)
    .style('font-size', "18px")
    .style("pointer-events","none")
    .attr("class", "interacttext")
    .attr("text-anchor","middle")
    .text("Font-")
    function fontDown(){
        fontsize -= 6
        if (fontsize < 6) {
            fontsize = 6
        }
        draw(currenttransform)
    }
    // svg.append("text")
    //     .attr("x", width+100)
    //     .attr("y",height/14 + (50 * (limitedCategories.length))+ 24)
    //     .style('font-size', "24px")
    //     .style("pointer-events","none")
    //     .style("fill","#fff")
    //     .attr("class", "interacttext")
    //     .attr("text-anchor","middle")
    //     .style("alignment-baseline","middle")
    //     .text("Labels")

    var labelselect = svg.selectAll(".labelselect")
        .data(categoryTypes)
        .enter().append("g")
        .attr("transform", function(d, i) { var adjust = (i*50)+height/14 + (50 * (limitedCategories.length + 1));return "translate(0," + adjust + ")"; });
    
    // var labelr = labelselect.append("rect")
    //     .attr("x", width + 60)
    //     .attr("width", 80)
    //     .attr("height", 40)
    //     .attr("rx", 4)
    //     .attr("ry", 4)
    //     .attr("class", "labelselect")
    //     .attr("id", function(d,i){return i})
    //     .style("pointer-events","auto")
    //     .on("click", function(d){setLabelValue(d);});
    
    // labelselect.append("text")
    //     .attr("x", width+100)
    //     .attr("y", 26)
    //     .style("text-anchor","middle")
    //     .style('font-size',"18px")
    //     .style('text-transform', 'capitalize')
    //     .attr("class", "labeltext")
    //     .text(function(d) { return d; });

    function setLabelValue(input){
        activelabelnum = categoryTypes.indexOf(input)
        draw(currenttransform, "transform", currenttransform)
    }

    svg.append('g')
        .append('rect')
        .attr("x",-160)
        .attr("y",height/14 + 150)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width","80")
        .attr("height","40")
        .attr("class", "interact")
        .style("pointer-events","auto")
        .on("click",toggleGrid)
    
    svg.append("text")
        .attr("x", -120)
        .attr("y",height/14+150+26)
        .style('font-size', "18px")
        .style("pointer-events","none")
        .attr("class", "interacttext")
        .attr("text-anchor","middle")
        .text("MFW")

    function toggleGrid(){
        // showGrid = !showGrid
        if (!transitioning){
            let olddata = setdata
        if (setdata < alldata.length -1){
            setdata += 1
        } else {
            setdata = 0
        }
        changeData(olddata,setdata)
        
        
        draw(currenttransform, "transform", currenttransform)
        }
        

    }

    let title = svg.append("text")
        .attr("x", width/2)
        .attr("y", -margin.top/2)
        .style("text-anchor","middle")
        .style("font-size","32px")
        .style("alignment-baseline", "middle")
        .text("Principal Component Analysis "+loadings.length+ " MFW")

    function changeData(current, goal){
        transitioning = true
        xLabel.text(boundData.xString + " ("+expVar[setdata][0]+")")
        yLabel.text(boundData.yString + " ("+expVar[setdata][1]+")")
        for (i=0; i < alldata[current].length; i++){
            d = alldata[current][i]
            d.startx = d.PC1
            d.starty = d.PC2
            d.destx = alldata[goal][i].PC1
            d.desty = alldata[goal][i].PC2
        }
        
        // for (i=0; i < linepairs[current].length; i++){
        //     d = linepairs[current][i]
        //     d.startx1 = d[1]
        //     d.starty1 = d[2]
        //     d.startx2 = d[3]
        //     d.starty2 = d[4]

        //     d.destx1 = linepairs[goal][i][1]
        //     d.desty1 = linepairs[goal][i][2]
        //     d.destx2 = linepairs[goal][i][3]
        //     d.desty2 = linepairs[goal][i][4]
        // }

        loadings = allloadings[goal]
        title.text("Principal Component Analysis "+loadings.length+ " MFW")
        if (drawLoadings) {
        
        for (i = 0; i < loadings.length; i ++){
            d = loadings[i]
            
            if (i < allloadings[current].length){
                d.startx = allloadings[current][i][1].PC1
                d.starty = allloadings[current][i][1].PC2
            } else {
                d.startx = 0
                d.starty = 0
            }            
            d.destx = d[1].PC1
            d.desty = d[1].PC2
            
        }
        
        }

        const duration = 1000;
        const ease = d3.easeCubic
        timer = d3.timer((elapsed) =>{
        const t = Math.min(1,ease(elapsed / duration));
        data.forEach(d =>{
            
            d.startx = d.startx * (1-t) + d.destx * t;
            d.starty = d.starty * (1-t) + d.desty * t;
        });
        if (drawLoadings){
            loadings.forEach(d => {
            d.startx = d.startx * (1-t) + d.destx * t;
            d.starty = d.starty * (1-t) + d.desty * t;
            })
        }
        // lines.forEach(d=>{
        //     d.startx1 = d.startx1 * (1-t) + d.destx1 * t;
        //     d.starty1 = d.starty1 * (1-t) + d.desty1 * t;
        //     d.startx2 = d.startx2 * (1-t) + d.destx2 * t;
        //     d.starty2 = d.starty2 * (1-t) + d.desty2 * t;
        // })

        draw(currenttransform, "transition", currenttransform);
        if (t == 1){
            data = alldata[goal]
            //lines = linepairs[goal]
            addDataInfo(data)
            
            timer.stop();
            transitioning = false;
            // if (goal < alldata.length){
            //     changeData(goal, goal+1)
            // }
            
        }
        })
        
        // boundData.x = goalx
        // boundData.y = goaly
        // boundData.xString = "PC"+String(goalx + 1)
        // boundData.yString = "PC"+String(goaly + 1)
        // xLabel.text(boundData.xString)
        // yLabel.text(boundData.yString)
        // transitionButton.style("pointer-events","auto")
    }

};
