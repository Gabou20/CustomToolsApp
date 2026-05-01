function downloadTextFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

export function exportAsText(params)
{
    const text = 
`Connector type: ${params.connectorType}
Fixture length: ${params.fixtureLength} mm
Shaft material: ${params.shaftMaterial}
Shaft diameter: ${params.shaftDiameter} mm
Shaft length: ${params.shaftLength} mm
Stylus end type: ${params.endType}
Stylus end material: ${params.ballMaterial}
Ball diameter: ${params.ballDiameter} mm
Disk thickness: ${params.diskThickness} mm`
    
downloadTextFile('config.txt', text);
}

export function exportAsXml(params)
{

}