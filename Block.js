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

        this.on("mousedown", function() {
            this.moveToTop();
            this.config.vbm.layer.draw();
        });
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
            that.absolutePosition(pos);
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
            input.width = that.config.width;
            input.io = 'input';
            input.position = index;
            input.vbm = that.config.vbm;
            input.block = that;

            nodes.add(new Node(input));
        });

        this.config.outputs.forEach((input, index) => {
            input.width = that.config.width;
            input.io = 'output';
            input.position = index;
            input.vbm = that.config.vbm;
            input.block = that;

            nodes.add(new Node(input));
        });

        return nodes;
    }

    createHeader() {
        var that = this;
        var text = new Text({
            text: that.config.name,
            size: 20,
            x: 7,
            y: 7,
            vbm: that.config.vbm,
            editable: that.config.nameEdit,
        });

        return text;
    }
}