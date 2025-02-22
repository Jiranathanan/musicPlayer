const $ = require('jquery');


function chooseMusic() {
    // console.log("Choose Music");
    $('input').click();
}

function musicSelected() {
    let files = $('input').get(0).files;
    // console.log(typeof(files))
    for(let i = 0; i < files.length; i++) {
        console.log(files[i].name);
    }
}
