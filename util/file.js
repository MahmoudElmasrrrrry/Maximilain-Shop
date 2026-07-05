const fs = require('fs')

const fileHelper = (filePath) => {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Failed to delete file:', filePath, err);
        }
    })
}

module.exports = fileHelper