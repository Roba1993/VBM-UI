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
        this.canvas = this.shadow.querySelector('div');

        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";

        console.log(this.getAttribute('logic'));

        this.vbm = new VBM(this.canvas);
        this.vbm.addBlock(1, 50, 50);
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
