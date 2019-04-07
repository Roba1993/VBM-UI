import Konva from 'konva';
import Block from './Block';
import Creation from './Creation';
import Connection from './Connection';
import combineDefaultLogic from './Config';

export default class VBM {
    constructor(element, logic) {
        this.logic = combineDefaultLogic(logic);
        this.idCounter = 0;
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
            width: element.offsetWidth,
            height: element.offsetHeight,
            //width: 900,
            //height: 900,
            draggable: true
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

            if (evt.target.nodeType == "Stage" && evt.evt.button === 0) {
                that.hideCreationArea();
                that.focusAll(false);
            }
        });

        // update on drag end
        this.stage.on('dragend', function (evt) {
            that.creationArea.updateTextAreaPos();
        });

        // context menu opne create
        this.stage.on('contextmenu', function (evt) {
            console.log(evt.evt);
            that.creationArea.toggle({ x: evt.evt.layerX, y: evt.evt.layerY });
            that.focusAll(false);
            that.layer.draw();
            evt.evt.preventDefault();
        });

        // on dragging move also special inputs
        this.stage.dragBoundFunc(function (pos) {
            if (that.newConnection !== null) {
                return that.stage.absolutePosition();
            }

            that.creationArea.updateTextAreaPos();
            return {
                x: pos.x,
                y: pos.y
            };
        });

        document.addEventListener('keyup', function (e) {
            if (e.keyCode === 46 || e.keyCode === 8) {
                that.destroyAllSelected();
            }
            else if (e.keyCode === 65 && e.ctrlKey === true) {
                that.focusAll(true);
            }
            else if (e.keyCode === 120) {
                console.log(that.getBusinesModel());
                console.log(JSON.stringify(that.getBusinesModel()));
            }
        });

        // update newConnection position is requried
        document.body.onmousemove = function (evt) {
            if (that.newConnection != null) {
                that.newConnection.setEndPosition(evt.layerX, evt.layerY);
                that.layer.draw();
            }
        };


        // define the creation dialog
        this.creationArea = new Creation({
            vbm: that,
            logic: JSON.parse(JSON.stringify(that.logic)),
        });
        this.layer.add(this.creationArea);
        this.creationArea.hide();


        // add the layer to the stage
        this.stage.add(this.layer);
    }

    redrawConnections() {
        var that = this;

        this.conGroup.children.forEach(con => {
            con.updatePosition(that.logic.style.blockNodeTextSize / 2);
        });
        this.layer.draw();
    }

    addBlock(blockIid, x, y, uid) {
        var that = this;
        this.logic.blocks.forEach(block => {
            if (block.id == blockIid) {
                var b = JSON.parse(JSON.stringify(block));
                b.uid = uid;
                b.vbm = that;
                b.x = x;
                b.y = y;
                b.logic = JSON.parse(JSON.stringify(that.logic));

                this.layer.add(new Block(b));
                this.layer.draw();
                return true;
            }
        });

        return false;
    }

    showCreationArea(x, y) {
        this.creationArea.show({ x: x, y: y });
        this.layer.draw();
    }

    hideCreationArea() {
        this.creationArea.hide();
    }

    getConnectionRule(type) {
        var ret = null;

        this.logic.connections.forEach(con => {
            if (con.type === type) {
                ret = JSON.parse(JSON.stringify(con));
                ret.valueCheck = con.valueCheck;
            }
        });

        return ret;
    }

    focusAll(status) {
        this.layer.children.forEach(comp => {
            if (typeof comp.focus === "function") {
                comp.focus(status);
            }
        });
        this.layer.draw();
    }

    destroyAllSelected() {
        var remove = this.layer.getChildren(child => {
            return (typeof child.focus === "function" && child.focus() === true);
        });

        remove.forEach(comp => {
            comp.destroy();
        });

        this.layer.draw();
    }

    getBusinesModel() {
        var blocks = [];

        this.layer.getChildren().forEach(block => {
            if (block.type === 'Block') {
                blocks.push(block.getBlockInfo());
            }
        });

        return blocks;
    }

    getNewId() {
        return ++this.idCounter;
    }

    clear() {
        // clear sheet
        this.conGroup.destroyChildren();
        this.layer.getChildren().forEach(block => {
            if (block.type === 'Block') {
                block.destroy();
            }
        });

        this.idCounter = 0;
    }

    setBusinesModel(blocksConfig) {
        var that = this;
        this.clear();

        // Create the single blocks
        blocksConfig.forEach(block => {
            that.addBlock(block.blockTypeId, block.position.x, block.position.y, block.blockId);
            that.idCounter = (block.blockId > that.idCounter) ? block.blockId : that.idCounter;
        });

        // Create the connection between the new created blocks
        this.layer.getChildren().forEach(block => {
            if (block.type === 'Block') {
                // get the block from the configuration to know it to be state
                var blockConfig = blocksConfig.find(b => { return b.blockId === block.id(); });

                // loop over all nodes of the existing block
                block.nodes.getChildren().forEach(node => {
                    // only input nodes are handled (outputs get generated automatically)
                    if (node.config.io === "input") {
                        // get the right node configuration for this node of the already created block
                        var nodeConfig = blockConfig.nodes.find(n => { return n.id === node.config.id });

                        // set the node value
                        if (node.value !== null && nodeConfig.value !== undefined) {
                            node.value.setText(nodeConfig.value);
                            node.updateSize();

                        }

                        // we need to have connected block and node
                        if (nodeConfig.connectedBlockId !== null || nodeConfig.connectedNodeId !== null) {
                            // create a new connection
                            var newConnection = new Connection({
                                start: [0, 0],
                                end: [0, 0],
                                vbm: that,
                                color: that.getConnectionRule(nodeConfig.connectionType).color,
                            });
                            newConnection.linkObjA = node;
                            newConnection.linkObjB = that.getNode(nodeConfig.connectedBlockId, nodeConfig.connectedNodeId);

                            // add connection and activate it
                            that.conGroup.add(newConnection);
                            newConnection.activate(node.config.style.blockNodeTextSize / 2);
                        }


                    }
                });

                block.updateBlock();
            }
        });

        that.redrawConnections();
    }

    getNode(blockId, nodeId) {
        var ret = null;

        // loop over all blocks
        this.layer.getChildren().forEach(block => {
            // search for the right block id
            if (block.type === 'Block' && block.id() === blockId) {
                var nodes = block.nodes.getChildren().filter(n => { return (n.config !== undefined) });
                ret = nodes.find(r => { return r.config.id === nodeId });
            }
        });

        return ret;
    }

    setLogic(logic) {
        this.logic = combineDefaultLogic(logic);
        this.clear();
        this.stage.draw();
    }
}
