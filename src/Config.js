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
            outputs: [{ name: 'Next', description: 'Connection to the next Execution block', type: 'Execution' }]
        },
        {
            id: 2,
            name: 'Console Log',
            nameEdit: false,
            description: 'Standard printf/log output to the terminal',
            inputs: [
                { name: 'Run', description: 'Connection to the next Execution block', type: 'Execution' },
                { name: 'Text', description: 'The text to log', type: 'String' }],
            outputs: [{ name: 'Next', description: 'Connection to the next Execution block', type: 'Execution' }]
        },
        {
            id: 3,
            name: 'Static Text',
            nameEdit: false,
            description: 'Definition of a static text',
            inputs: [],
            outputs: [{ name: 'Text', nameEdit: true, description: 'The defined static text', type: 'String' }]
        },
        {
            id: 4,
            name: 'Static Integer',
            nameEdit: false,
            description: 'Definition of a static integer',
            inputs: [],
            outputs: [{ name: '0', nameEdit: true, description: 'The defined static integer', type: 'Integer' }]
        },
        {
            id: 5,
            name: 'Addition Integer',
            nameEdit: false,
            description: 'Definition of a static integer',
            inputs: [
                { name: 'Integer 1', description: 'Input 1 for the calulcation', type: 'Integer' },
                { name: 'Integer 2', description: 'Input 2 for the calculation', type: 'Integer' }
            ],
            outputs: [{ name: 'Result', description: 'The result of the addition', type: 'Integer' }]
        },
        {
            id: 6,
            name: 'Integer to String',
            nameEdit: false,
            description: 'Definition of a static integer',
            inputs: [{ name: 'Integer', description: 'Interger to convert to String', type: 'Integer' }],
            outputs: [{ name: 'String', description: 'The Ineteger as String', type: 'String' }]
        },
        {
            id: 7,
            name: 'Addition Float',
            nameEdit: false,
            description: 'Definition of a static integer',
            inputs: [
                { name: 'Float 1', description: 'Input 1 for the calulcation', type: 'Float' },
                { name: 'Float 2', description: 'Input 2 for the calculation', type: 'Float' }
            ],
            outputs: [{ name: 'Result', description: 'The result of the addition', type: 'Float' }]
        },
        {
            id: 8,
            name: 'Float to String',
            nameEdit: false,
            description: 'Definition of a static integer',
            inputs: [{ name: 'Float', description: 'Interger to convert to String', type: 'Float' }],
            outputs: [{ name: 'String', description: 'The Ineteger as String', type: 'String' }]
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

    return {
        rules: rules,
        style: style,
        connections: connections,
        blocks: blocks,
    }
}