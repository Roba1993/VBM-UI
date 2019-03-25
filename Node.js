class Node extends Konva.Group {
    constructor(config) {
        super({
            x: config.io == "input" ? 0 : config.width,
            y: config.position * 25 + 30,
        });

        this.config = config;
        this.vbm = config.vbm;
        this.linkObj = null;
        var that = this;

        this.config.text = "Test";


        this.addCircle();
        this.addText();

        this.on('mousedown', function (evt) {
            if (that.vbm.newConnection != null) {
                return;
            }

            that.vbm.newConnection = new Connection({
                start: [that.absolutePosition().x, that.absolutePosition().y],
                end: [evt.evt.x, evt.evt.y],
                vbm: that.vbm,
            });
            that.vbm.newConnection.linkObjA = that;
            that.vbm.layer.draw();
        });

        this.on('mouseup', function (evt) {
            if (that.vbm.newConnection.linkObjA.config.block == that.config.block) {
                return;
            }

            console.log(evt);

            // connect the nodes together
            that.vbm.newConnection.linkObjB = evt.target.parent;
            that.vbm.newConnection.activate();
        });
    }

    addCircle() {
        var circle = new Konva.Circle({
            radius: 7,
            fill: 'red',
        });
        this.add(circle);
    }

    addText() {
        var that = this;
        var text = new Konva.Text({
            text: that.config.text,
            size: 18,
            x: that.config.io == "input" ? 10 : that.config.text.length * -9,
            y: -5,
        });
        this.add(text);
    }
}



