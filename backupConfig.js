const stat = require('fs').statSync;
const path = require('path');
const AdmZip = require('adm-zip');

/**
 * Backup Konfiguration
 */
newArchive(`C:/Temp/soa-dashboard-config-backup-${+new Date}.zip`, [
  './customisation',
  './frontend/src/customisation',
  './frontend/.env',
]);

/**
 * @param {String} zipFileName
 * @param {Array<String>} pathNames
 */
function newArchive(zipFileName, pathNames) {

  const zip = new AdmZip();

  pathNames.forEach(pathName => {
    const absoluteName = path.join(__dirname, pathName)
    const p = stat(absoluteName);
    if (p.isFile()) {
      console.log('Add File', absoluteName)
      zip.addLocalFile(absoluteName, pathName);
    } else if (p.isDirectory()) {
      console.log('Add Directory', absoluteName)
      zip.addLocalFolder(absoluteName, pathName);
    }
  });

  zip.writeZip(zipFileName);
  console.log(`
BACKUP der Konfiguration

Verzeichnisse ${pathNames.join(', ')} nach ${zipFileName} gesichert.

Extrahiere mit 7-Zip, Windows zeigt keine Dateien an.
  
  `)
}
