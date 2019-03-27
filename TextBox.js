class TextBox extends Konva.Group {
    constructor(config) {
        super({
            x: config.x,
            y: config.y,
        });
        this.text = config.text;
        this.config = config;
        var that = this;

        var textfield = new Text({
            fontFamily: config.fontFamily,
            fontSize: config.fontSize,
            fontStyle: config.fontStyle,
            fontVariant: config.fontVariant,
            textDecoration: config.textDecoration,
            text: config.text,
            align: config.align,
            verticalAlign: config.verticalAlign,
            padding: config.padding,
            lineHeight: config.lineHeight,
            wrap: config.wrap,
            ellipsi: config.ellipsi,
            editable: config.editable,
        });
        this.textfield = textfield;

        var box = new Konva.Rect({
            fill: config.fill,
            cornerRadius: config.cornerRadius,
            stroke: config.stroke,
            y: -1,
        });
        this.box = box;

        textfield.onTextChange = function (text) {
            that.text = text;
            that.updateSize();
            return that.onTextChange(text);
        }

        box.on('dblclick click', () => {
            // when editable start edit on click of box
            if (that.config.editable === 'dblclick' || that.config.editable === 'click') {
                textfield.createEditTextarea();
            }
        });

        this.add(box);
        this.add(textfield);

        this.updateSize();
    }

    updateSize() {
        // get the textfield size and ensure that we get min sizes
        var width = this.textfield.width() > this.config.minWidth ? this.textfield.width() : this.config.minWidth;
        var height = this.textfield.height() > this.config.minHeight ? this.textfield.height() : this.config.minHeight;

        // update the box size based upon the text size
        this.box.width(width);
        this.box.height(height);

        // update group size based upon the box size
        this.width(this.box.width());
        this.height(this.box.height());

        // redraw the layer to update box
        if (this.getLayer() !== null) {
            this.getLayer().draw();
        }
    }

    // Function which gets called when the text
    // has changed and the edit area is closed
    onTextChange(text) { return text; };
}



