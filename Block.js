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

        this.createBox();
        this.add(this.createHeader());
        this.add(this.nodes);

        this.on("mousedown", function (evt) {
            this.moveToTop();
            // onfocus all blocks when no shift is pressed
            if (evt.evt.shiftKey == false) {
                this.config.vbm.unfocusAll();
            }
            this.focus(true);
            this.config.vbm.layer.draw();
        });
    }

    destroy() {
        this.nodes.children.forEach(node => {
            if (node.linkObj != null) {
                node.linkObj.destroy();
            }
        });

        super.destroy();
    }

    focus(status) {
        if (status === false || status === true) {
            this.box.strokeEnabled(status);
        }

        return this.box.strokeEnabled();
    }

    createBox() {
        var that = this;

        // create the main box
        var box = new Konva.Rect({
            width: that.config.width,
            height: that.config.width,
            fill: '#FFD200',
            draggable: true,
            cornerRadius: 5,
            stroke: "orange",
        });

        // on do nothing we handle dragging wihtin drag move
        box.dragBoundFunc(function () {
            return {
                x: that.absolutePosition().x,
                y: that.absolutePosition().y,
            }
        });

        // on drag 
        box.on('dragmove', function (evt) {
            // get all selected blocks
            var move = that.config.vbm.layer.getChildren(child => {
                return (typeof child.focus === "function" && child.focus() === true);
            });

            // move all selected box
            move.forEach(comp => {
                var pos = comp.absolutePosition();
                pos.x += evt.evt.movementX;
                pos.y += evt.evt.movementY;
                comp.absolutePosition(pos);
            });

            // update all connections
            that.config.vbm.redrawConnections();
        });

        // on entering we want to see the move mouse
        box.on('mouseover', function () {
            document.body.style.cursor = 'move';
        });

        // On leaving the set back the crosshair mouse
        box.on('mouseout', function () {
            document.body.style.cursor = 'crosshair';
        });

        this.box = box;
        this.focus(false);
        this.add(box);
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