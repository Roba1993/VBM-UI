import Konva from 'konva';
import Node from './Node';
import Text from './Text';

export default class Block extends Konva.Group {
    constructor(config) {
        super({
            x: config.x,
            y: config.y,
        });

        this.config = config;
        this.type = 'Block';
        (this.config.uid === undefined) ? this.id(this.config.vbm.getNewId()) : this.id(this.config.uid);

        this.headerText = this.createHeaderText();
        this.nodes = this.createNodes();

        this.createBox();
        this.add(this.headerText);
        this.add(this.nodes);

        this.updateBlock();

        // in mouse down set the right focus
        this.on("mousedown", function (evt) {
            if (!this.focus() && evt.evt.shiftKey === false) {
                this.config.vbm.focusAll(false);
            }

            if (this.focus() && evt.evt.shiftKey === true) {
                this.focus(false);
            }
            else {
                this.focus(true);
            }

            this.moveToTop();
            this.config.vbm.layer.draw();
        });

    }

    /**
     * Destroys this block and the connection belonging to it.
     */
    destroy() {
        this.nodes.children.forEach(node => {
            if (node.linkObj != null) {
                node.linkObj.destroy();
            }
        });

        super.destroy();
    }

    /**
     * This function can either set or return the focus state
     * 
     * @param {New focus status true/false} status 
     */
    focus(status) {
        if (status === false || status === true) {
            this.box.strokeEnabled(status);
        }

        return this.box.strokeEnabled();
    }

    /**
     * Create the background box
     */
    createBox() {
        var that = this;

        // create the main box
        var box = new Konva.Rect({
            draggable: true,
            cornerRadius: that.config.logic.style.blockCornerRadius,
            stroke: that.config.logic.style.blockBorderColor,
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

    /**
     * Create all the nodes within this box
     */
    createNodes() {
        var that = this;
        var nodes = new Konva.Group();


        var headerHeight = (this.headerText.height() + (this.config.logic.style.blockHeaderMargin * 2));
        var inputIndex = 0;
        var outputIndex = 0;

        /*
        // create the input nodes
        this.config.inputs.forEach((input, index) => {
            nodes.add(that.createNode(input, index, 'input'));
        });

        // create the output nodes
        this.config.outputs.forEach((input, index) => {
            nodes.add(that.createNode(input, index, 'output'));
        });
        */
        this.config.nodes.forEach(input => {
            var index = (input.io === 'input') ? inputIndex++ : outputIndex++;

            input.width = that.config.width;
            input.position = index;
            input.vbm = that.config.vbm;
            input.block = that;
            input.rules = that.config.logic.rules;
            input.style = that.config.logic.style;

            var n = new Node(input);
            n.y(((n.height() + this.config.logic.style.blockNodeSpacing) * index) + headerHeight + this.config.logic.style.blockNodeSpacing);
            n.onTextChange = function (text) {
                that.updateBlock();
                return text;
            }

            nodes.add(n);
        });


        return nodes;
    }

    /**
     * Creates a single node
     * 
     * @param {Either Input or Output node} io 
     */
    createNode(input, index, io) {
        var that = this;
        var headerHeight = (this.headerText.height() + (this.config.logic.style.blockHeaderMargin * 2));

        input.width = that.config.width;
        input.io = io;
        input.position = index;
        input.vbm = that.config.vbm;
        input.block = that;
        input.rules = that.config.logic.rules;
        input.style = that.config.logic.style;

        var n = new Node(input);
        n.y(((n.height() + this.config.logic.style.blockNodeSpacing) * index) + headerHeight + this.config.logic.style.blockNodeSpacing);
        n.onTextChange = function (text) {
            that.updateBlock();
            return text;
        }

        return n;
    }

    /**
     * Create the header text and make it moveable
     */
    createHeaderText() {
        var that = this;
        var text = new Text({
            text: that.config.name,
            fontSize: that.config.logic.style.blockHeaderTextSize,
            x: that.config.logic.style.blockHeaderMargin,
            y: that.config.logic.style.blockHeaderMargin,
            vbm: that.config.vbm,
            editable: that.config.nameEdit,
            fill: that.config.logic.style.blockHeaderTextColor,
            draggable: true,
        });

        // on entering we want to see the move mouse
        text.on('mouseover', function () {
            document.body.style.cursor = 'move';
        });

        // On leaving the set back the crosshair mouse
        text.on('mouseout', function () {
            document.body.style.cursor = 'crosshair';
        });

        // on drag 
        text.on('dragmove', function (evt) {
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

        // on do nothing we handle dragging wihtin drag move
        text.dragBoundFunc(function () {
            return {
                x: that.absolutePosition().x + that.config.logic.style.blockHeaderMargin,
                y: that.absolutePosition().y + that.config.logic.style.blockHeaderMargin,
            }
        });

        return text;
    }

    /**
     * Calculate the height and and width of the nodes
     */
    calcHeightAndWidth() {
        var height = 0;
        var widthLeft = 0;
        var widthRight = 0;

        this.nodes.getChildren().forEach(n => {
            if (n.config.io === 'output') {
                if (n.text.width() > widthRight) {
                    widthRight = n.width();
                }
            }
            else {
                if (n.text.width() > widthLeft) {
                    widthLeft = n.width();
                }
            }

            if (n.y() + n.text.height() > height) {
                height = n.y() + n.height();
            }
        });

        return {
            height: height,
            widthLeft: widthLeft,
            widthRight: widthRight,
        }
    }

    /**
     * Update the position of all output nodes, when the width of the box has changed
     * 
     * @param {Width of the box and align the nodes towards} width 
     */
    updateNodePosition(width) {
        this.nodes.getChildren().forEach(n => {
            if (n.config.io === 'output') {
                n.x(width);
                n.text.x(- n.text.width());
            }
        });
    }

    /**
     * This function gets executed to update the block settings whenever somethink is changing within
     */
    updateBlock() {
        var wh = this.calcHeightAndWidth();
        var width = wh.widthLeft + 15 + wh.widthRight;

        if (this.headerText.width() + (this.config.logic.style.blockHeaderMargin * 2) > width) {
            width = this.headerText.width() + (this.config.logic.style.blockHeaderMargin * 2);
        }

        // update block size
        this.width(width);
        this.height(wh.height + this.config.logic.style.blockNodeSpacing);

        // update box size
        this.box.width(this.width());
        this.box.height(this.height());

        // gradient color of the box
        var headerYColorPos = ((this.headerText.height() + (this.config.logic.style.blockHeaderMargin * 2)) / this.height());
        this.box.fillLinearGradientStartPoint({ y: 0 });
        this.box.fillLinearGradientEndPoint({ y: this.height() });
        this.box.fillLinearGradientColorStops([
            0, this.config.logic.style.blockStartColor,
            headerYColorPos, this.config.logic.style.blockEndColor,
            headerYColorPos + 0.0001, this.config.logic.style.blockHeaderStartColor,
            1, this.config.logic.style.blockHeaderEndColor,
        ]);

        // update the position of all nodes
        this.nodes.getChildren().forEach(n => {
            if (n.config.io === 'output') {
                n.x(width);
            }
        });

        // redraw node
        if (this.getLayer() !== null) {
            this.getLayer().draw();
        }
    }

    getBlockInfo() {
        var nodes = [];

        this.nodes.getChildren().forEach(node => {
            nodes.push(node.getNodeInfo());
        })

        return {
            blockId: this.id(),
            blockTypeId: this.config.id,
            position: this.absolutePosition(),
            nodes: nodes,
        };
    }
}