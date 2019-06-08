import VBM from './VBM';

class VisualModeler extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.shadow.innerHTML = `
          <div></div>
        `;
    }

    connectedCallback() {
        import('konva').then(Konva => {
            window.Konva = Konva;

            this.canvas = this.shadow.querySelector('div');

            this.canvas.style.width = "100%";
            this.canvas.style.height = "100%";
    
            this.vbm = new VBM(this.canvas);
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

}

// Register the new element with the browser.
customElements.define('visual-modeler', VisualModeler);
