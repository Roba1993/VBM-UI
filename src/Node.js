import Konva from 'konva';
import Text from './Text';
import TextBox from './TextBox';
import Connection from './Connection';

export default class Node extends Konva.Group {
    constructor(config) {
        super();

        this.config = config;
        this.vbm = config.vbm;
        this.linkedObjects = [];
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

        // on mouse down create a new connection if possible
        this.on('mousedown', function (evt) {
            if (that.vbm.newConnection != null) {
                return;
            }

            that.vbm.newConnection = new Connection({
                vbm: that.vbm,
                node: that,
            });

            that.vbm.newConnection.setEndPosition([evt.evt.LayerX, evt.evt.layerY]);
            that.vbm.layer.draw();
        });

        // on mouse up try to complete the new connection between two nodes
        this.on('mouseup', function (evt) {
            // check if new connection is still null
            if (that.vbm.newConnection === null) {
                return;
            }

            // try to finish the new connection
            let x = that.vbm.newConnection.activate(evt.target.parent);
            console.log(x);

            if(x !== true) {
                return;
            }
        });
    }

    /**
     * Add the circle for the node
     */
    addCircle() {
        var that = this;

        var circle = new Konva.Circle({
            fill: 'transparent',
            radius: that.config.style.blockNodeTextSize / 2,
            stroke: that.type.color,
            strokeWidth: 3,
            y: that.config.style.blockNodeTextSize / 2,
        });

        this.icon = circle;
        this.add(circle);
    }

    /**
     * Add the text for the node
     */
    addText() {
        var that = this;

        var str = that.config.name === undefined ? this.type.type : that.config.name;

        var text = new Text({
            text: that.config.io == "input" ? "   " + str : str + "   ",
            fontSize: that.config.style.blockNodeTextSize,
            editable: that.config.nameEdit,
            vbm: that.config.vbm,
        });

        that.config.io == "output" ? text.x(-text.width()) : text.x();

        this.text = text;
        this.add(text);
    }

    /**
     * Add the value textbox for the node
     */
    addValue() {
        if (this.type.valueEdit !== true || this.config.io === "output") {
            this.value = null;
            return;
        }

        var that = this;

        var value = new TextBox({
            text: that.type.valueDefault,
            fontSize: that.config.style.blockNodeTextSize,
            editable: 'click',
            fill: that.config.style.blockNodeValueBackground,
            minWidth: 20,
            minHeight: 10,
            cornerRadius: 3,
        })

        // register own event handler when the textbox changes
        value.onTextChange = function (text) {
            that.updateSize();

            // execute the evaluation rule for this kind of connection type
            if (typeof that.type.valueCheck === "function") {
                text = that.type.valueCheck(text);
            }

            return that.onTextChange(text)
        }

        that.config.io == "output" ? value.x(-that.text.width() - value.width() - 5) : value.x(that.text.width() + 5);
        that.value = value;
        that.add(value);
    }

    /**
     * Update the size of the node based upon the changes happend within
     */
    updateSize() {
        // update value position
        if (this.type.valueEdit === true && this.config.io === "input") {
            this.value.x(this.text.width() + 5);
        }

        var valueWidth = this.value === null ? 0 : this.value.width();

        // update the node size
        this.height(this.text.height());
        this.width(this.text.width() + 5 + valueWidth);

        this.linkedObjects.forEach(o => {
            o.updatePosition();
        });

        // redraw node
        if (this.getLayer() !== null) {
            this.getLayer().draw();
        }
    }

    // Function which gets called when the text
    // has changed and the edit area is closed
    onTextChange(text) {
        return text;
    };

    setConnection(connection) {
        if (this.get_io_type() === "input") {
            // only one input connection allowed, if we have more
            if (this.linkedObjects.length !== 0) {
                // destroy them all
                this.linkedObjects.forEach(o => {
                    o.destroy();
                });
            }

            // create a new list with just the new connection
            this.linkedObjects = [connection];
        }
        else {
            this.linkedObjects.push(connection);
        }

        this.updateLinkObj();
    }

    removeConnection(connection) {
        if (this.get_io_type() === "input") {
            this.linkedObjects = [];
        }
        else {
            this.linkedObjects = this.linkedObjects.filter(o => {
                return o !== connection;
            });
        }

        this.updateLinkObj();
    }

    /**
     * When the link object gets updated, check if new value fields need to be created.
     * Also updates if the circle if filled or not.
     * 
     * @param {The new link object to be set} linkObj 
     */
    updateLinkObj() {
        // when there is a linked object 
        if (this.linkedObjects.length !== 0) {
            if (this.value !== null) {
                //destroy value field
                this.value.destroy();
                this.value = null;
            }

            // set icon as filled circle
            this.icon.fill(this.type.color);
        }
        // when there is no linked object 
        else {
            if (this.value === null) {
                // create value field
                this.addValue();
            }

            // set icon as not filled circle
            this.icon.fill('transparent');
        }
    }

    get_io_type() {
        return this.config.io;
    }

    getNodeHeight() {
        return this.config.style.blockNodeTextSize / 2;
    }

    getId() {
        return this.config.id;
    }

    getBlockId() {
        return this.getParent().getParent().id()
    }

    getNodeType() {
        return this.type.type;
    }

    getNodeInfo() {
        return {
            id: this.config.id,
            nodeType: this.config.io,
            connectionType: this.type.type,
            value: (this.value !== null) ? this.value.text : null,
            connections: this.linkedObjects.map(o => o.getConnectionInfo())
        }
    }
}



