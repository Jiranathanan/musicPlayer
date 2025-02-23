const $ = require('jquery');
const mm = require('music-metadata');

var songNumber = 0;

const songData = {
    path: [],
    title: []
};

const audioPlayer = $('audio').get(0);

function chooseMusic() {
    // console.log("Choose Music");
    $('input').click();
}

// function musicSelected() {
//     let files = $('input').get(0).files;
//     // console.log(files[0].path)
//     // console.log(typeof(files))
//     for(let i = 0; i < files.length; i++) {
//         let { path } = files[i];
//         mm.parseFile(path, {native: true})
//             .then((metadata) => {
//                 // console.log(metadata)
//                 console.log(metadata.common.title, metadata.common.artist, metadata.format.duration)

//                 let songRow = `
//                     <tr>
//                         <td>${i + 1}</td>
//                         <td>${metadata.common.title}</td>
//                         <td>${metadata.common.artist}</td>
//                         <td>${metadata.format.duration}</td>
//                     </tr>
//                 `;
//                 $('#table-body').append(songRow);

//             })
//             .catch(error => {
//                 console.error('Error parsing metadata:', error);
//             }) 
//         // console.log(files[i].name, files[i].path)
//     }
    
    
// }

// Refactor this code with async function to solve no. order
async function musicSelected() {
    let files = $('input').get(0).files;
    
    // Clear existing table content
    // $('#table-body').empty();
    
    // Create an array of promises
    const metadataPromises = Array.from(files).map(async (file, index) => {
        try {
            const metadata = await mm.parseFile(file.path, {native: true});
            return {
                metadata: metadata,
                path: file.path
            };
        } catch (error) {
            console.error('Error parsing metadata:', error);
            return null;
        }
    });
    
    // Wait for all promises to resolve
    try {
        const results = await Promise.all(metadataPromises);
        
        // Filter out any null results from errors and add to table
        results
            .filter(result => result !== null)
            .forEach(result => {
                const duration = secondsToTime(result.metadata.format.duration);
                const displayOrder = songNumber + 1;
                const songRow = `
                    <tr ondblclick="playSong(${songNumber})">
                        <td>${displayOrder}</td>
                        <td>${result.metadata.common.title}</td>
                        <td>${result.metadata.common.artist}</td>
                        <td>${duration}</td>
                    </tr>
                `;
                $('#table-body').append(songRow);
                songData.path[songNumber] = result.path;
                songData.title[songNumber] = result.metadata.common.title;
                songNumber++;

            });
    } catch (error) {
        console.error('Error processing files:', error);
    }
    console.log(songData);
}

function playSong(index) {
   audioPlayer.src = songData.path[index]; 
   audioPlayer.load();
   audioPlayer.play();
   $('h4').text(songData.title[index])
}


// Helper function
function secondsToTime(t) {
    return padZero(parseInt((t / (60)) % 60)) + ":" + 
           padZero(parseInt((t) % 60));
    }

function padZero(v) {
    return (v < 10) ? "0" + v : v;
    }