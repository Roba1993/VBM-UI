import VBM from './VBM';

class VisualModeler extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.shadow.innerHTML = `
          <div style="width: 100%; height: 100%;"></div>
        `;
    }

    connectedCallback() {
        let canvas = this.shadow.querySelector('div');
        let height = canvas.offsetHeight;
        let width = canvas.offsetWidth;

        import('konva').then(Konva => {
            window.Konva = Konva;
            this.vbm = new VBM(canvas, null, width, height);
            this.vbm.changed = this.changed;
            this.ready();
        });
    }

    set logic(logic) {
        this.vbm.setLogic(logic);
    }

    set model(model) {
        this.vbm.setBusinesModel(model);
    }

    get model() {
        return this.vbm.getBusinesModel();
    }

    ready() {
        // this function can be overwritten to get informed when the modeler is ready
    }

    changed(logicChange) {
        // this function gets called when something has changed
    }
}

// Register the new element with the browser.
customElements.define('visual-modeler', VisualModeler);
