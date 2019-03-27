class VBM {
    constructor(element, logic) {
        this.logic = logic;
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
            width: document.getElementById(element).offsetWidth,
            height: document.getElementById(element).offsetHeight,
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
            that.creationArea.toggle({ x: evt.evt.x, y: evt.evt.y });
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
        });

        // update newConnection position is requried
        document.body.onmousemove = function (evt) {
            if (that.newConnection != null) {
                that.newConnection.setEndPosition(evt.x, evt.y);
                that.layer.draw();
            }
        };


        // define the creation dialog
        this.creationArea = new Creation({
            vbm: that,
            x: 100,
            y: 100
        });
        this.layer.add(this.creationArea);
        this.creationArea.hide();


        // add the layer to the stage
        this.stage.add(this.layer);
    }

    redrawConnections() {
        this.conGroup.children.forEach(con => {
            con.updatePosition();
        });
        this.layer.draw();
    }

    addBlock(id, x, y) {
        var that = this;
        this.logic.blocks.forEach(block => {
            if (block.id == id) {
                var b = JSON.parse(JSON.stringify(block));
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
}


var logic = {
    rules: {
        strictInputOutput: true,    // Only allows to link inputs and outputs
        strictDifferentBlock: true, // Deny any link to the own block
        strictConnections: true     // Only allows to link matching types
    },
    style: {
        background: '#EEEEEE',
    },
    connections: [
        { type: 'Execution', icon: 'circle', color: 'black' },
        { type: 'String', icon: 'circle', color: 'purple' },
        { type: 'Integer', icon: 'circle', color: 'green', valueEdit: true, valueDefault: '0' },
        { type: 'Float', icon: 'circle', color: 'green' },
    ],
    blocks: [
        {
            id: 1,
            name: 'Start',
            nameEdit: false,
            description: 'Startpoint for the logic',
            inputs: [],
            outputs: [{ name: 'Next', description: 'Connection to the next Execution block', type: 'Execution' }]
        },
        {
            id: 2,
            name: 'Console Log',
            nameEdit: false,
            description: 'Standard printf/log output to the terminal',
            inputs: [
                { name: 'Run', description: 'Connection to the next Execution block', type: 'Execution' },
                { name: 'Text', description: 'The text to log', type: 'String' }],
            outputs: [{ name: 'Next', description: 'Connection to the next Execution block', type: 'Execution' }]
        },
        {
            id: 3,
            name: 'Static Text',
            nameEdit: false,
            description: 'Definition of a static text',
            inputs: [],
            outputs: [{ name: 'Text', nameEdit: true, description: 'The defined static text', type: 'String' }]
        },
        {
            id: 4,
            name: 'Static Integer',
            nameEdit: false,
            description: 'Definition of a static integer',
            inputs: [],
            outputs: [{ name: '0', nameEdit: true, description: 'The defined static integer', type: 'Integer' }]
        },
        {
            id: 5,
            name: 'Addition',
            nameEdit: false,
            description: 'Definition of a static integer',
            inputs: [
                { name: 'Integer 1', description: 'Input 1 for the calulcation', type: 'Integer' },
                { name: 'Integer 2', description: 'Input 2 for the calculation', type: 'Integer' }
            ],
            outputs: [{ name: 'Result', description: 'The result of the addition', type: 'Integer' }]
        },
        {
            id: 6,
            name: 'Integer to String',
            nameEdit: false,
            description: 'Definition of a static integer',
            inputs: [{ name: 'Integer', description: 'Interger to convert to String', type: 'Integer' }],
            outputs: [{ name: 'String', description: 'The Ineteger as String', type: 'String' }]
        }
    ]
};


var vbm = new VBM('container', logic);
vbm.addBlock(1, 50, 50);