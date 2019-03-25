class Block extends Konva.Group {
    constructor(config) {
        super({
            x: config.x,
            y: config.y,
        });

        this.config = config;
        this.config.width = 100;
        this.config.height = 250;

        this.nodes = this.createNodes();

        this.add(this.createBox());
        this.add(this.createHeader());
        this.add(this.nodes);
    }

    createBox() {
        var that = this;

        // create the main box
        var box = new Konva.Rect({
            width: that.config.width,
            height: that.config.width,
            fill: '#FFD200',
            draggable: true,
            cornerRadius: 5
        });

        // on dragging move also the complete Block 
        box.dragBoundFunc(function (pos) {
            that.x(pos.x);
            that.y(pos.y);
            //that.updateConPos();
            that.config.vbm.redrawConnections();

            return {
                x: pos.x,
                y: pos.y
            };
        });

        // on entering we want to see the move mouse
        box.on('mouseover', function () {
            document.body.style.cursor = 'move';
        });

        // On leaving the set back the crosshair mouse
        box.on('mouseout', function () {
            document.body.style.cursor = 'crosshair';
        });

        return box;
    }

    createNodes() {
        var that = this;
        var nodes = new Konva.Group();

        this.config.inputs.forEach((input, index) => {
            var node = new Node({
                width: that.config.width,
                io: 'input',
                position: index,
                vbm: that.config.vbm,
                block: that,
            });

            nodes.add(node);
        });

        this.config.outputs.forEach((input, index) => {
            var node = new Node({
                width: that.config.width,
                io: 'output',
                position: index,
                vbm: that.config.vbm,
            });

            nodes.add(node);
        });

        return nodes;
    }

    createHeader() {
        var that = this;
        var text = new Text({
            text: "Function",
            size: 20,
            x: 7,
            y: 7,
            vbm: that.config.vbm,
        });

        return text;
    }
}