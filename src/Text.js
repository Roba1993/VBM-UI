import Konva from 'konva';

/**
 * Text which can be clicked and edit 
 */
export default class Text extends Konva.Text {
    constructor(config) {
        super(config);
        this.config = config;
        var that = this;


        that.on('dblclick click', () => {
            // Only allow if editable
            if (that.config.editable === 'dblclick' || that.config.editable === 'click') {
                that.createEditTextarea();
            }
        });
    }

    /**
     * Function which gets called when the text has changed and the edit area is closed.
     * 
     * @param {The changed text} text 
     */
    onTextChange(text) { return text; };

    /**
     * Create a editable textfield ontop of the normal one
     */
    createEditTextarea() {
        var that = this;

        // hide text node
        that.hide();
        that.getLayer().draw();

        // create textarea over canvas with absolute position
        // first we need to find position for textarea
        // how to find it?

        // at first lets find position of text node relative to the stage:
        var textPosition = that.absolutePosition();

        // then lets find position of stage container on the page:
        var stageBox = that.getStage().container().getBoundingClientRect();

        // so position of textarea will be the sum of positions above:
        var areaPosition = {
            x: stageBox.left + textPosition.x,
            y: stageBox.top + textPosition.y
        };

        // create textarea and style it
        var textarea = document.createElement('textarea');
        document.body.appendChild(textarea);

        // apply many styles to match text on canvas as close as possible
        // remember that text rendering on canvas and on the textarea can be different
        // and sometimes it is hard to make it 100% the same. But we will try...
        textarea.value = that.text();
        textarea.style.position = 'absolute';
        textarea.style.top = areaPosition.y + 'px';
        textarea.style.left = areaPosition.x + 'px';
        textarea.style.width = that.width() - that.padding() * 2 + 'px';
        textarea.style.height =
            that.height() - that.padding() * 2 + 5 + 'px';
        textarea.style.fontSize = that.fontSize() + 'px';
        textarea.style.border = 'none';
        textarea.style.padding = '0px';
        textarea.style.margin = '0px';
        textarea.style.overflow = 'hidden';
        textarea.style.background = 'none';
        textarea.style.outline = 'none';
        textarea.style.resize = 'none';
        textarea.style.lineHeight = that.lineHeight();
        textarea.style.fontFamily = that.fontFamily();
        textarea.style.transformOrigin = 'left top';
        textarea.style.textAlign = that.align();
        textarea.style.color = that.fill();
        var transform = '';

        var px = 0;
        // also we need to slightly move textarea on firefox
        // because it jumps a bit
        var isFirefox =
            navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isFirefox) {
            px += 2 + Math.round(fontSize / 20);
        }
        transform += 'translateY(-' + px + 'px)';

        textarea.style.transform = transform;

        // reset height
        textarea.style.height = 'auto';
        // after browsers resized it we can set actual value
        textarea.style.height = textarea.scrollHeight + 3 + 'px';

        textarea.focus();
        textarea.select();

        that.textarea = textarea;

        function removeTextarea() {
            textarea.parentNode.removeChild(textarea);
            window.removeEventListener('click', handleOutsideClick);
            that.show();
            that.getLayer().draw();
        }

        function setTextareaWidth(newWidth) {
            if (!newWidth) {
                // set width for placeholder
                that.placeholder === undefined ? that.placeholder = " " : that.placeholder;
                newWidth = that.placeholder.length * that.fontSize();
            }
            // some extra fixes on different browsers
            var isSafari = /^((?!chrome|android).)*safari/i.test(
                navigator.userAgent
            );
            var isFirefox =
                navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            if (isSafari || isFirefox) {
                newWidth = Math.ceil(newWidth);
            }

            var isEdge =
                document.documentMode || /Edge/.test(navigator.userAgent);
            if (isEdge) {
                newWidth += 1;
            }
            textarea.style.width = newWidth + 'px';
        }

        textarea.addEventListener('keydown', function (e) {
            // hide on enter
            // but don't hide on shift + enter
            if (e.keyCode === 13 && !e.shiftKey) {
                that.text(that.onTextChange(textarea.value));
                removeTextarea();
            }
            // on esc do not set value back to node
            if (e.keyCode === 27) {
                removeTextarea();
            }

            var scale = that.getAbsoluteScale().x;
            setTextareaWidth(that.width() * scale);
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + that.fontSize() + 'px';
        });

        textarea.addEventListener('keyup', function (e) {
            if (e.keyCode === 46 || e.keyCode === 8) {
                e.stopPropagation();
            }

            that.textarea.value = that.onTextChange(that.textarea.value);
            that.text(that.textarea.value);
        });

        function handleOutsideClick(e) {
            if (e.target !== textarea) {
                that.text(that.onTextChange(textarea.value));
                removeTextarea();
            }
        }
        setTimeout(() => {
            window.addEventListener('click', handleOutsideClick);
        });

    }
}