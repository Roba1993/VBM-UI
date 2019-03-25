class Node extends Konva.Group {
    constructor(config) {
        super({
            x: config.io == "input" ? 0 : config.width,
            y: config.position * 25 + 30,
        });

        this.config = config;
        this.vbm = config.vbm;
        this.linkObj = null;
        this.type = this.config.vbm.getConnectionRule(this.config.type);
        var that = this;

        this.addCircle();
        this.addText();

        // on entering we want to see the move mouse
        this.on('mouseover', function () {
            document.body.style.cursor = 'crosshair';
        });

        this.on('mousedown', function (evt) {
            if (that.vbm.newConnection != null) {
                return;
            }

            that.vbm.newConnection = new Connection({
                start: [that.absolutePosition().x, that.absolutePosition().y],
                end: [evt.evt.x, evt.evt.y],
                vbm: that.vbm,
                color: that.type.color,
            });
            that.vbm.newConnection.linkObjA = that;
            that.vbm.layer.draw();
        });

        this.on('mouseup', function (evt) {
            // No links to own block
            if (that.vbm.newConnection.linkObjA.config.block == that.config.block) {
                return;
            }

            // Only Input to Output mapping allowed
            if(that.vbm.newConnection.linkObjA.config.io == evt.target.parent.config.io) {
                return;
            }

            // connect the nodes together
            that.vbm.newConnection.linkObjB = evt.target.parent;
            that.vbm.newConnection.activate();
        });
    }

    addCircle() {
        var that = this;
        var circle = new Konva.Circle({
            radius: 7,
            fill: that.type.color,
        });
        this.add(circle);
    }

    addText() {
        var that = this;
        var text = new Konva.Text({
            text: that.config.name,
            size: 18,
            x: that.config.io == "input" ? 10 : that.config.name.length * -9,
            y: -5,
        });
        this.add(text);
    }
}


