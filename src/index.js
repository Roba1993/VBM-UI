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
        let self = this;

        import('konva').then(Konva => {
            window.Konva = Konva;

            self.canvas = this.shadow.querySelector('div');

            self.canvas.style.width = "100%";
            self.canvas.style.height = "100%";
    
            self.vbm = new VBM(this.canvas);
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
