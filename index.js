class VBM {
    constructor(element) {
        var that = this;

        // We use a single layer for all drawings
        this.layer = new Konva.Layer();


        // drawing group for all connections
        this.conGroup = new Konva.Group();
        this.layer.add(this.conGroup);
        // Variable for the new connection creation
        this.newConnection = null;


        // Konva stage (main area) init
        this.stage = new Konva.Stage({
            container: element,
            width: document.getElementById(element).offsetWidth,
            height: document.getElementById(element).offsetHeight
        });

        // The normal mouse icon is the crosshair in out VBM
        this.stage.on('mouseover', function (evt) {
            if (evt.target.nodeType == 'Stage') {
                document.body.style.cursor = 'crosshair';
            }
        });

        // On exit of the VBM area we set the default mouse icon
        this.stage.on('mouseout', function (evt) {
            document.body.style.cursor = 'default';
        });

        // remove the new connection when clicked on the free canvas
        this.stage.on('click', function (evt) {
            if (that.newConnection != null && evt.target.className != 'Circle') {
                that.newConnection.destroy();
                that.newConnection = null;
                that.layer.draw();
            }
        });

        // update newConnection position is requried
        document.body.onmousemove = function (evt) {
            if (that.newConnection != null) {
                that.newConnection.setEndPosition(evt.x, evt.y);
                that.layer.draw();
            }
        };

        // add the layer to the stage
        this.stage.add(this.layer);
    }

    redrawConnections() {
        this.conGroup.children.forEach(con => {
            con.updatePosition();
        });
        this.layer.draw();
    }

    addBlock(config) {
        var block = new Block(config);
        this.layer.add(block);
        this.layer.draw();
    }
}

var vbm = new VBM('container');

vbm.addBlock({
    vbm: vbm,
    x: 30,
    y: 30,
    inputs: [null, null],
    outputs: [],
});

vbm.addBlock({
    vbm: vbm,
    x: 30,
    y: 30,
    inputs: [null],
    outputs: [null, null],
});


/*var newLine = null;
var connections = [];

class Node extends Konva.Group {
    constructor(config) {
        super({
            x: config.x,
            y: config.y,
        });

        this.config = config;
        var that = this;

        var box = new Konva.Rect({
            x: 0,
            y: 0,
            width: 100,
            height: 200,
            fill: '#FFD200',
            draggable: true,
            cornerRadius: 5
        });

        box.dragBoundFunc(function (pos) {
            that.x(pos.x);
            that.y(pos.y);
            return {
                x: pos.x,
                y: pos.y
            };
        });

        box.on('mouseover', function () {
            document.body.style.cursor = 'move';
        });

        box.on('mouseout', function () {
            document.body.style.cursor = 'crosshair';
        });





        var circle = new Konva.Circle({
            x: 0,
            y: 50,
            radius: 10,
            fill: 'red',
        });

        circle.on('mousedown', function (evt) {
            if (newLine != null) {
                return;
            }

            newLine = new Connection({
                start: [circle.absolutePosition().x, circle.absolutePosition().y],
                end: [evt.evt.x, evt.evt.y],
            });
            newLine.linkObjA = circle;
            that.config.layer.add(newLine);
            newLine.setZIndex(0);
            that.config.layer.draw();
        });

        circle.on('mouseup', function (evt) {
            // can´t create a link to its own
            if (newLine.linkObjA == circle) {
                return;
            }

            // connect the nodes together
            newLine.linkObjB = evt.target;
            newLine.linkObjA.linkObj = newLine;
            newLine.linkObjB.linkObj = newLine;
            newLine.updatePosition();
            layer.draw();
            connections.push(newLine);
            newLine = null;
        });

        var text = new Text({
            text: "Function",
            size: 20,
            x: 7,
            y: 7,
        })

        this.add(box);
        this.add(text);
        this.add(circle);
    }
}

var stage = new Konva.Stage({
    container: 'container',
    width: window.innerWidth,
    height: window.innerHeight
});

stage.on('click', function (evt) {
    // remove the newLine when clicked on the free canvas
    if (newLine != null && evt.target.className != 'Circle') {
        newLine.destroy();
        newLine = null;
        layer.draw();
    }
});

document.body.onmousemove = function (evt) {
    // update newLine position is requried
    if (newLine != null) {
        newLine.setEndPosition(evt.x, evt.y);
        layer.draw();
    }
};


var layer = new Konva.Layer();

var node1 = new Node({
    x: 50,
    y: 50,
    layer: layer
});
layer.add(node1);

var node2 = new Node({
    x: 400,
    y: 50,
    layer: layer
});
layer.add(node2);

stage.add(layer);*/