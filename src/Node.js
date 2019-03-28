import Konva from 'konva';
import Text from './Text';
import TextBox from './TextBox';
import Connection from './Connection';

export default class Node extends Konva.Group {
    constructor(config) {
        super();

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

        // on mouse down create a new connection if possiblt
        this.on('mousedown', function (evt) {
            if (that.vbm.newConnection != null) {
                return;
            }

            that.vbm.newConnection = new Connection({
                start: [that.absolutePosition().x, that.absolutePosition().y + that.config.style.blockNodeTextSize / 2],
                end: [evt.evt.x, evt.evt.y],
                vbm: that.vbm,
                color: that.type.color,
            });
            that.vbm.newConnection.linkObjA = that;
            that.vbm.layer.draw();
        });

        // on mouse up try to complete the new connection between two nodes
        this.on('mouseup', function (evt) {
            // check if new connection is still null
            if (that.vbm.newConnection === null) {
                return;
            }

            // No links to own block when rule is set
            if (this.config.rules.strictDifferentBlock == true && that.vbm.newConnection.linkObjA.config.block == that.config.block) {
                return;
            }

            // Only Input to Output mapping allowed when rule is set
            if (this.config.rules.strictInputOutput == true && that.vbm.newConnection.linkObjA.config.io == evt.target.parent.config.io) {
                return;
            }

            // Only same type of nodes allowed when rule is set
            if (this.config.rules.strictConnections == true && that.vbm.newConnection.linkObjA.type.type !== evt.target.parent.type.type) {
                return;
            }

            // connect the nodes together
            that.vbm.newConnection.linkObjB = evt.target.parent;
            that.vbm.newConnection.activate(that.config.style.blockNodeTextSize / 2);
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

        var text = new Text({
            text: that.config.io == "input" ? "   " + that.config.name : that.config.name + "   ",
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
        if (this.type.valueEdit !== true) {
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
        return text;
    };

    /**
     * When the link object gets updated, check if new value fields need to be created.
     * Also updates if the circle if filled or not.
     * 
     * @param {The new link object to be set} linkObj 
     */
    updateLinkObj(linkObj) {
        // set the new status
        this.linkObj = linkObj;

        // when there is a linked object 
        if (linkObj !== null) {
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

    getNodeInfo() {
        if (this.linkObj === null) {
            return {
                blockId: null,
                blockTypeId: null,
                connectionType: this.type.type,
                value: (this.value !== null) ? this.value.text : null,
                nodeType: this.config.io,
            }
        }

        return {
            blockId: (this.linkObj.linkObjA === this) ? this.linkObj.linkObjB.getParent().getParent().id() : this.linkObj.linkObjA.getParent().getParent().id(),
            blockTypeId: (this.linkObj.linkObjA === this) ? this.linkObj.linkObjB.config.block.config.id : this.linkObj.linkObjA.config.block.config.id,
            connectionType: this.type.type,
            value: (this.value !== null) ? this.value.text : null,
            nodeType: this.config.io,
        }
    }
}



