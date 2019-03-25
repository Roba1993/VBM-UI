class Creation extends Konva.Group {
    constructor(config) {
        super({
            x: config.x,
            y: config.y,
        });

        this.config = config;
        this.config.width = 300;
        this.config.height = 500;

        this.add(this.createBox());
        this.textarea = this.createInput();

        this.on("mousedown", function () {
            this.moveToTop();
            this.config.vbm.layer.draw();
        });
    }

    hide() {
        super.hide();
        this.textarea.style.display = 'none';
    }

    show(pos) {
        super.show();
        this.textarea.style.display = 'block';
        this.x(pos.x);
        this.y(pos.y);
        this.updateTextAreaPos();
    }

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

    createInput() {
        // get the right position for the textarea
        var areaPosition = this.updateTextAreaPos();

        // create textarea and style it
        var textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        textarea.value = "";
        textarea.placeholder = "Add..."
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = this.config.width - 15 + 'px';
        textarea.style.height = 22 + 'px';
        textarea.style.fontSize = 20 + 'px';
        textarea.style.border = 'none';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'white';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.transformOrigin = 'left top';

        // on firefox different width
        if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
            textarea.style.width = this.config.width - 16 + 'px';
        }

        // focus into textare
        textarea.focus();

        return textarea;
    }

    createBox() {
        var that = this;

        // create the main box
        var box = new Konva.Rect({
            width: 300,
            height: 500,
            fill: '#FFD200',
            draggable: true,
            cornerRadius: 5
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

    createList() {
        var that = this;
        that.config.vbm.logic.blocks.forEach(element => {

        });
    }
}