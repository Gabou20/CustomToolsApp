import {exportAsText, exportAsXml} from '../export/textFileExporter.js';

export function addExportMenu(gui, params)
{
    const exportFolder = gui.addFolder('Export');

    const exportSettings = {
        format: 'txt',
    };

    const actions = {
        exportConfig: () => {
            console.log('Export!');
            switch (exportSettings.format) {
                case 'txt':
                    exportAsText(params);
                    break;
                case 'xml':
                    exportAsXml(params);
                    break;
            };
        }
    };

    exportFolder.add(exportSettings, 'format', ['txt', 'xml']).name('Format');
    exportFolder.add(actions, 'exportConfig').name('Export configuration');
}