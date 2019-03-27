/**
 * Connector class to connect two nodes
 */
class Connection extends Konva.Line {
    /**
     * Connection object to combine two nodes.
     * 
     * @param {Defines the configuration for the connection} config 
     */
    constructor(config) {
        super({
            stroke: config.color,
            lineCap: 'round',
            lineJoin: 'round',
            bezier: true,
        });

        this.config = config;
        this.linkObjA = null;
        this.linkObjB = null;

        this.setPosition(config.start, config.end);
        this.config.vbm.conGroup.add(this);
    }

    /**
     * Set the connection start and end position manual.
     * 
     * @param {x/y Array of the start position} posA 
     * @param {x/y Array of the end position} posB 
     */
    setPosition(posA, posB) {
        var pa = this.config.vbm.stage.absolutePosition();
        this.points(Connection.calculateBezier(posA[0] - pa.x, posA[1] - pa.y, posB[0] - pa.x, posB[1] - pa.y));
    }

    /**
     * Set the line end position manually.
     * 
     * @param {x position of line end} x 
     * @param {y position of line end} y 
     */
    setEndPosition(x, y) {
        var points = this.points();
        var pa = this.config.vbm.stage.absolutePosition();
        this.points(Connection.calculateBezier(points[0], points[1], x - pa.x, y - pa.y));
    }

    /**
     * Updates the connection start and end position automatically.
     */
    updatePosition(offsetY) {
        if (this.linkObjA != null && this.linkObjB != null) {
            this.setPosition(
                [this.linkObjA.absolutePosition().x, this.linkObjA.absolutePosition().y + offsetY],
                [this.linkObjB.absolutePosition().x, this.linkObjB.absolutePosition().y + offsetY]);
        }

    }

    /**
     * Unregisters himself at the nodes and destroys himself
     */
    destroy() {
        // unlink the connection object in link object B
        // if a full connection is available
        if (this.linkObjB !== null) {
            this.linkObjB.updateLinkObj(null);

            // unlink the connection object in link object A
            if (this.linkObjA !== null) {
                this.linkObjA.updateLinkObj(null);
            }
        }
        // for a half connection just set the linkObjA to null
        else {
            this.linkObjA = null;
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
    activate(offsetY) {
        // Both linkObjects need to be set
        if (this.linkObjA == null || this.linkObjA == null) {
            return;
        }

        // delete the previous existing connection for node A
        if (this.linkObjA.linkObj != null) {
            this.linkObjA.linkObj.destroy();
        }

        // delete the previous existing connection for node B
        if (this.linkObjB.linkObj != null) {
            this.linkObjB.linkObj.destroy();
        }

        // set this connection as the actual connection for node A&B
        this.linkObjA.updateLinkObj(this);
        this.linkObjB.updateLinkObj(this);

        // add to the connection list and remove as new connection
        this.config.vbm.newConnection = null;

        // update the position
        this.updatePosition(offsetY);
        this.config.vbm.layer.draw();
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