// Helper function to display info message, depending on the verbose level
function infoOut(msg) {
    console.warn(msg);
}

function logOut(msg, verboseLevel) {
    verboseLevel = (verboseLevel === true ? 1 : verboseLevel || 0);
    if (verboseLevel >= 1) {
        console.warn(msg);
    }
}

function debugOut(msg, verboseLevel) {
    verboseLevel = (verboseLevel === true ? 1 : verboseLevel || 0);
    if (verboseLevel >= 2) {
        console.warn(msg);
    }
}

function infoTable(obj, verboseLevel) {
    verboseLevel = (verboseLevel === true ? 1 : verboseLevel || 0);
    if (verboseLevel >= 1) {
        const keys = Object.keys(obj);
        let maxKeyLength = 0;
        let maxValLength = 0;
        let table = ``;
        keys.map((key) => {
            const keyLength = String(key).length;
            const valStr = Array.isArray(obj[key]) ? obj[key].join(', ') : String(obj[key]);
            const valLength = valStr.length;
            maxKeyLength = (keyLength > maxKeyLength) ? keyLength : maxKeyLength;
            maxValLength = (valLength > maxValLength) ? valLength : maxValLength;
        });
        keys.map((key) => {
            const keyLength = String(key).length;
            const valStr = Array.isArray(obj[key]) ? obj[key].join(', ') : String(obj[key]);
            const valLength = valStr.length;
            const remainingKeyLength = maxKeyLength - keyLength;
            const remainingValLength = maxValLength - valLength;
            table += `| ${key}${(' ').repeat(remainingKeyLength)} | ${valStr}${(' ').repeat(remainingValLength)} |\n`;
        });
        let header = `|-${('-').repeat(maxKeyLength)}-|-${('-').repeat(maxValLength)}-|\n`;
        return (header + table + header);
    }
}

module.exports = {
    infoTable: infoTable,
    logOut: logOut,
    debugOut: debugOut,
    infoOut: infoOut
};
