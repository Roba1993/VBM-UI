import Konva from 'konva';


/**
 * Connector class to connect two nodes
 */
export default class Connection extends Konva.Line {
    /**
     * Connection object to combine two nodes.
     * 
     * @param {Defines the configuration for the connection} config 
     */
    constructor(config) {
        super({
            stroke: config.vbm.getConnectionRule(config.node.getNodeType()).color,
            lineCap: 'round',
            lineJoin: 'round',
            bezier: true,
        });

        this.startNode = null;
        this.endNode = null;

        this.vbm = config.vbm;
        this.setNodeByType(config.node);
        this.setStartPosition(config.node);
        

        // add connection to the list of all connections
        config.vbm.conGroup.add(this);
    }

    /**
     * Set's a node automatically as a start or end node
     * 
     * @param {Node to set either as start or end Node} node 
     */
    setNodeByType(node) {
        if (node.get_io_type() === "output") {
            this.startNode = node;
        }
        else {
            this.endNode = node;
        }
    }

    /**
     * Set the connection start and end position manual.
     * 
     * @param {x/y Array of the start position} posA 
     * @param {x/y Array of the end position} posB 
     */
    setStartPosition(node) {
        this.points(Connection.calculateBezier(node.absolutePosition().x, node.absolutePosition().y + node.getNodeHeight(), 0, 0));
    }

    /**
     * Set the line end position manually.
     * 
     * @param {x position of line end} x 
     * @param {y position of line end} y 
     */
    setEndPosition(x, y) {
        var points = this.points();
        var pa = this.vbm.stage.absolutePosition();
        this.points(Connection.calculateBezier(points[0], points[1], x - pa.x, y - pa.y));
    }

    /**
     * Updates the connection start and end position automatically.
     */
    updatePosition() {
        if (this.startNode != null && this.endNode != null) {
            this.points(Connection.calculateBezier(
                this.startNode.absolutePosition().x, this.startNode.absolutePosition().y + this.startNode.getNodeHeight(),
                this.endNode.absolutePosition().x, this.endNode.absolutePosition().y + this.endNode.getNodeHeight()));
        }

    }

    /**
     * Unregisters himself at the nodes and destroys himself
     */
    destroy() {
        if (this.startNode !== null) {
            this.startNode.removeConnection(this);
        }

        if (this.endNode !== null) {
            this.endNode.removeConnection(this);
        }

        // call super to destroy
        super.destroy();
    }

    /**
     * The activate function unregisters and destroys the old connection for a node
     * and registers himself within both nodes it's connected to.
     * 
     * @param {Pixel offset for the Y-Axes for the connection} offsetY 
     */
    activate(node) {
        // We set the second node and ensure, that he fit's his already existing counterpart
        if (node.get_io_type() === "output" && this.endNode !== null) {
            // we check of both nodes have different parent blocks
            if (this.endNode.getBlockId() === node.getBlockId()) {
                return "New startNode has same parent as defined endNode";
            }

            // we check if the new node have the same type
            if (this.endNode.getNodeType() !== node.getNodeType()) {
                return "New startNode has a different type as defined endNode";
            }

            this.startNode = node;
        }
        else if (node.get_io_type() === "input" && this.startNode !== null) {
            // we check of both nodes have different parent blocks
            if (this.startNode.getBlockId() === node.getBlockId()) {
                return "New endNode has same parent as defined startNode";
            }

            // we check if the new node have the same type
            if (this.startNode.getNodeType() !== node.getNodeType()) {
                return "New endNode has a different type as defined startNode";
            }

            this.endNode = node;
        }
        else {
            return "Both nodes had the same io type"
        }

        // set this connection at the nodes
        this.startNode.setConnection(this);
        this.endNode.setConnection(this);

        // remove as new connection
        this.vbm.newConnection = null;

        // update the position
        this.updatePosition();
        this.getLayer().draw();

        return true;
    }


    getConnectionInfo() {
        return {
            type: this.startNode.getNodeType(),
            startBlock: this.startNode.getBlockId(),
            endBlock: this.endNode.getBlockId(),
            startNode: this.startNode.getId(),
            endNode: this.endNode.getId(),
        }
    }

    /**
     * Calculates the line Bezier for an connection
     * based upon the start and line end.
     * 
     * @param {x start position} x1 
     * @param {y start position} y1 
     * @param {x end position} x2 
     * @param {y end position} y2 
     */
    static calculateBezier(x1, y1, x2, y2) {
        if (x1 < x2) {
            return [x1, y1, Math.round(x1 + ((x2 - x1) * 0.75)), y1, Math.round(x1 + ((x2 - x1) * 0.25)), y2, x2, y2];
        }
        else {
            return [x1, y1, Math.round(x2 + ((x1 - x2) * 0.25)), y1, Math.round(x2 + ((x1 - x2) * 0.75)), y2, x2, y2];
        }
    }
}