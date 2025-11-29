const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'public', 'data');
const db = {};

fs.readdirSync(dataDir).forEach((file) => {
    if (path.extname(file) === '.json') {
        const name = path.basename(file, '.json');
        const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
        db[name] = data;
    }
});

module.exports = () => db;
