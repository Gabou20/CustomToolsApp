import {exportAsTextFile} from '../export/textFileExporter.js';

export function addExportButton(gui, params)
{
    const actions = {
        exportConfig: () => {
            console.log('Export!');
            exportAsTextFile(params);
        },
};

    gui.add(actions, 'exportConfig').name('Export configuration');
}