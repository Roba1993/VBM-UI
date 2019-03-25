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

    showCreationArea() {
        var that = this;

        var add = new Creation({
            vbm: that,
            x: 100,
            y: 100
        });
        this.layer.add(add);
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

vbm.showCreationArea();