var defaultLogic = {
    rules: {
        strictInputOutput: true,    // Only allows to link inputs and outputs
        strictDifferentBlock: true, // Deny any link to the own block
        strictConnections: true     // Only allows to link matching types
    },
    style: {
        // Block Header style definition
        blockHeaderMargin: 5,
        blockHeaderTextSize: 20,
        blockHeaderTextColor: '#FFFFFF',
        blockHeaderStartColor: '#7777f7DD',
        blockHeaderEndColor: '#7777f7DD',

        // Block style definition
        blockCornerRadius: 10,
        blockStartColor: '#000000DD',
        blockEndColor: '#000000DD',
        blockBorderColor: 'orange',
        blockNodeSpacing: 10,
        blockNodeTextSize: 16,
        blockNodeValueBackground: 'white',

        // Creation Dialog style definition
        creationWidth: 250,
        creationHeight: 350,
        creationColor: '#7777f7DD',
        creationTextSize: 16,
        creationTextSpacing: 4,
        creationCornerRadius: 10,
        creationFilterTextSize: 20,
    },
    connections: [
        { type: 'Execution', color: 'black' },
        { type: 'String', color: 'purple', valueEdit: true, valueDefault: 'Text', },
        { type: 'Integer', color: 'green', valueEdit: true, valueDefault: '0', valueCheck: (text) => { return text.replace(/[^\d]/g, ''); } },
        { type: 'Float', color: 'green', valueEdit: true, valueDefault: '0', valueCheck: (text) => { return text.replace(/[^(\d+\.?\d+)]/g, ''); } },
    ],
    blocks: [
        {
            id: 1,
            name: 'Start',
            nameEdit: false,
            description: 'Startpoint for the logic',
            inputs: [],
            outputs: [{ name: 'Next', description: 'Connection to the next Execution block', type: 'Execution' }],
            nodes: [{ id: 1, io: 'output', name: 'Next', description: 'Connection to the next Execution block', type: 'Execution' }],
        },
        {
            id: 2,
            name: 'Console Log',
            nameEdit: false,
            description: 'Standard printf/log output to the terminal',
            inputs: [
                { name: 'Run', description: 'Connection to the next Execution block', type: 'Execution' },
                { name: 'Text', description: 'The text to log', type: 'String' }],
            outputs: [{ name: 'Next', description: 'Connection to the next Execution block', type: 'Execution' }],
            nodes: [
                { id: 1, io: 'input', name: 'Run', description: 'Connection to the next Execution block', type: 'Execution' },
                { id: 2, io: 'output', name: 'Next', description: 'Connection to the next Execution block', type: 'Execution' },
                { id: 3, io: 'input', name: 'Text', description: 'The text to log', type: 'String' }
            ]
        },
        {
            id: 3,
            name: 'String',
            nameEdit: false,
            description: 'Static default String',
            nodes: [
                { id: 1, io: 'input', name: '', description: 'Text', type: 'String' },
                { id: 2, io: 'output', name: '', description: 'Text', type: 'String' },
            ]
        },
    ]
};

export default function combineDefaultLogic(logic) {
    if(logic === undefined) {
        return defaultLogic;
    }

    var rules = Object.assign(defaultLogic.rules, logic.rules);
    var style = Object.assign(defaultLogic.style, logic.style);
    var connections = (logic.connections === undefined) ? defaultLogic.connections : logic.connections;
    var blocks = (logic.blocks === undefined) ? defaultLogic.blocks : logic.blocks;

    blocks.forEach(block => {
        if(block.nodes === undefined) {
            block.nodes = [];
        }
    });

    return {
        rules: rules,
        style: style,
        connections: connections,
        blocks: blocks,
    }
}