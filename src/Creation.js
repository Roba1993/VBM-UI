import Konva from 'konva';

/**
 * Creation dialog to filter and add new blocks
 */
export default class Creation extends Konva.Group {
    constructor(config) {
        super({
            x: config.x,
            y: config.y,
        });

        this.config = config;

        this.box = this.createBox();
        this.add(this.box);
        this.textarea = this.createInput();

        this.createList();

        this.on("mousedown", function () {
            this.moveToTop();
            this.config.vbm.layer.draw();
        });
    }

    /**
     * Hide the creation dialog
     */
    hide() {
        super.hide();
        this.textarea.style.display = 'none';
    }

    /**
     * Show the creation dialog at the givin position.
     * 
     * @param {Position to show the create dialog} pos 
     */
    show(pos) {
        super.show();
        this.textarea.style.display = 'block';
        this.textarea.value = "";
        this.textarea.focus();
        this.updateList();
        this.absolutePosition(pos);
        this.updateTextAreaPos();
        this.moveToTop();

        let s = {
            x: 1 / this.getStage().scaleX(),
            y: 1 / this.getStage().scaleY()
        };

        this.scale(s);
    }

    /**
     * Toggle the visibility of the create dialog
     * 
     * @param {Position to show the create dialog} pos 
     */
    toggle(pos) {
        if (this.isVisible() === true) {
            this.hide();
        }
        else {
            this.show(pos);
        }
    }

    /**
     * The textare need to be updated manually, becuase it's an html textare ontop of the canvas
     */
    updateTextAreaPos() {
        // then lets find position of stage container on the page:
        var stageBox = this.config.vbm.stage.container().getBoundingClientRect();

        var pos = this.absolutePosition();

        // so position of textarea will be the sum of positions above:
        var areaPosition = {
            x: stageBox.left + pos.x + 7,
            y: stageBox.top + pos.y + 7
        };

        // set position of textarea if available
        if (this.textarea) {
            this.textarea.style.top = areaPosition.y + 'px';
            this.textarea.style.left = areaPosition.x + 'px';
        }


        return areaPosition;
    }

    /**
     * Create the textarea
     */
    createInput() {
        var that = this;
        // get the right position for the textarea
        var areaPosition = this.updateTextAreaPos();

        // create textarea and style it
        var textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        textarea.value = "";
        textarea.placeholder = "Filter..."
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = that.config.logic.style.creationWidth - 15 + 'px';
        textarea.style.height = (that.config.logic.style.creationFilterTextSize + 2) + 'px';
        textarea.style.fontSize = that.config.logic.style.creationFilterTextSize + 'px';
        textarea.style.border = 'none';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'white';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.transformOrigin = 'left top';
        textarea.style.borderRadius = "5px";

        // on firefox different width
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            textarea.style.width = that.config.logic.style.creationWidth - 16 + 'px';
        }

        textarea.addEventListener('keyup', function (e) {
            // hide on enter
            // but don't hide on shift + enter
            if (e.keyCode === 13 && !e.shiftKey) {
                that.hide();
                that.getLayer().draw();
            }
            // on esc do not set value back to node
            if (e.keyCode === 27) {
                that.hide();
                that.getLayer().draw();
            }

            that.updateList();
        });

        // focus into textare
        textarea.focus();

        return textarea;
    }

    /**
     * Create the background box for the creation dialog
     */
    createBox() {
        var that = this;

        // create the main box
        var box = new Konva.Rect({
            width: that.config.logic.style.creationWidth,
            height: that.config.logic.style.creationHeight,
            fill: that.config.logic.style.creationColor,
            cornerRadius: that.config.logic.style.creationCornerRadius,
            draggable: true,
        });

        // on dragging move also the complete Block 
        box.dragBoundFunc(function (pos) {
            that.absolutePosition(pos);
            that.updateTextAreaPos();

            return {
                x: pos.x,
                y: pos.y
            };
        });

        return box;
    }

    /**
     * Create the list of entries of the creation dialog
     */
    createList() {
        var that = this;

        var list = new Konva.Group({
            x: 10,
            y: 40,
        });

        var list_clip = new Konva.Group({
            clip: {
                x: 0,
                y: 0,
                width: that.config.logic.style.creationWidth - 10,
                height: that.config.logic.style.creationWidth - 45,
            }
        });
        list.add(list_clip);

        var index = 0;
        that.config.vbm.logic.blocks.forEach(element => {
            if (index < 15 && element.name.toLowerCase().includes(this.textarea.value.toLowerCase())) {
                var name = element.name.replace(/([A-Z])/g, ' $1').trim();

                var text = new Konva.Text({
                    y: index * (that.config.logic.style.creationTextSize + that.config.logic.style.creationTextSpacing),
                    text: name,
                    fontSize: that.config.logic.style.creationTextSize,
                });

                text.on('mousedown', function (evt) {
                    var pos = that.absolutePosition();
                    that.config.vbm.addBlock(element.id, pos.x, pos.y);
                    that.hide();
                });

                index += 1;
                list.add(text);
            }
        });

        this.list = list;
        this.add(list);
    }

    /**
     * Update the list of entries
     */
    updateList() {
        this.list.destroy();
        this.createList();
        this.getLayer().draw();
    }
}