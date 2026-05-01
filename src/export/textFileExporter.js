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

export function exportAsTextFile(params)
{
    const text = 
`Shaft diameter: ${params.shaftDiameter} mm
Shaft length: ${params.shaftLength} mm
Shaft material: ${params.shaftMaterial}
Ball diameter: ${params.ballDiameter} mm
Ball material: ${params.ballMaterial}
Fixture length: ${params.fixtureLength} mm`;

    downloadTextFile('config.txt', text);
}