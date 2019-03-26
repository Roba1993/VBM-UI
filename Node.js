class Node extends Konva.Group {
    constructor(config) {
        super({
            y: config.position * 25 + 30,
        });

        this.config = config;
        this.vbm = config.vbm;
        this.linkObj = null;
        this.type = this.config.vbm.getConnectionRule(this.config.type);
        var that = this;

        this.addCircle();
        this.addText();
        this.addValue();

        this.updateSize();

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
            if (that.vbm.newConnection.linkObjA.config.io == evt.target.parent.config.io) {
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

        this.icon = circle;
        this.add(circle);
    }

    addText() {
        var that = this;

        var text = new Text({
            text: that.config.io == "input" ? "   " + that.config.name : that.config.name + "   ",
            size: 18,
            x: 0,
            y: -5,
            editable: that.config.nameEdit,
            vbm: that.config.vbm,
        });

        that.config.io == "output" ? text.x(-text.width()) : text.x();

        this.text = text;
        this.add(text);
    }

    addValue() {
        if (this.type.valueEdit !== true) {
            this.value = null;
            return;
        }

        var that = this;

        var value = new TextBox({
            text: that.type.valueDefault,
            size: 18,
            y: -5,
            editable: 'click',
            fill: "white",
            minWidth: 20,
            minHeight: 10,
        })

        value.onTextChange = function (text) {
            that.updateSize();
            that.onTextChange(text);
        }

        that.config.io == "output" ? value.x(-that.text.width() - value.width() - 5) : value.x(that.text.width() + 5);
        that.value = value;
        that.add(value);
    }

    updateSize() {
        // update value position
        if (this.type.valueEdit === true && this.config.io == "output") {
            this.value.x(-this.text.width() - this.value.width() - 5);
        }
        else if (this.type.valueEdit === true) {
            this.value.x(this.text.width() + 5);
        }

        var valueWidth = this.value === null ? 0 : this.value.width();

        // update the node size
        this.height(this.text.height());
        this.width(this.text.width() + 5 + valueWidth);

        // redraw node
        if (this.getLayer() !== null) {
            this.getLayer().draw();
        }
    }

    // Function which gets called when the text
    // has changed and the edit area is closed
    onTextChange(text) {
    };

    // when the link object gets updated,
    // check if new value fields need to be created
    updateLinkObj(linkObj) {
        // set the new status
        this.linkObj = linkObj;

        // when there is a linked object destroy value field
        if (linkObj !== null && this.value !== null) {
            this.value.destroy();
            this.value = null;
        }
        // when there is no linked object create value field
        else if (linkObj === null && this.value === null) {
            this.addValue();
        }
    }
}



