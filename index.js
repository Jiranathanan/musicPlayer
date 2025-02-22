const $ = require('jquery');
var fs = require('fs');
var mm = require('musicmetadata');

function chooseMusic() {
    // console.log("Choose Music");
    $('input').click();
}

function musicSelected() {
    let files = $('input').get(0).files;
    // console.log(typeof(files))
    // for(let i = 0; i < files.length; i++) {
        // let { path } = files[i];
        // parseFile(path, {native: true})
        //     .then((metadata) => {
        //         console.log(metadata.common.title, metadata.common.artist, metadata.format.duration)
        //     })
        //     .catch(error => {
        //         console.error('Error parsing metadata:', error);
        //     }) 
        // console.log(files[i].name, files[i].path)
    // }
    let parser = mm(fs.createReadStream(files[0].path), function (err, metadata) {
        if (err) throw err;
        console.log(metadata);
      });
}

