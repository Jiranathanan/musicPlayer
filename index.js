const $ = require('jquery');
const mm = require('music-metadata');

function chooseMusic() {
    // console.log("Choose Music");
    $('input').click();
}

function musicSelected() {
    let files = $('input').get(0).files;
    // console.log(files[0].path)
    // console.log(typeof(files))
    for(let i = 0; i < files.length; i++) {
        let { path } = files[i];
        mm.parseFile(path, {native: true})
            .then((metadata) => {
                // console.log(metadata)
                console.log(metadata.common.title, metadata.common.artist, metadata.format.duration)
            })
            .catch(error => {
                console.error('Error parsing metadata:', error);
            }) 
        // console.log(files[i].name, files[i].path)
    }
    
    
}

