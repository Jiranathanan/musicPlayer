const $ = require('jquery');
const mm = require('music-metadata');

var songNumber = 0;
let playing = false;
let currentlyPlayingIndex = null;

let timer = null;

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
                currentlyPlaying = result.path;
                songNumber++;

            });
    } catch (error) {
        console.error('Error processing files:', error);
    }
    // console.log(songData);
}

function playSong(index) {
    // clear any existing timer before setting a new one
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    if (index !== currentlyPlayingIndex) {
        audioPlayer.src = songData.path[index]; 
        audioPlayer.load();
        audioPlayer.play();
        playing = true;
        $('h4').text(songData.title[index])
        updatePlayButton();
        activateButton();
        currentlyPlayingIndex = index;
        // set interval for timer to display song duration
        timer = setInterval(updateTime, 1000);
    } else if (index === currentlyPlayingIndex) {
       if(audioPlayer.paused) {
            audioPlayer.play();
            playing = true;
            // restart timer when resuming
            timer = setInterval(updateTime, 1000);
       } else {
            audioPlayer.pause();
            playing = false;
            // clear timer when pausing
            timer = null;
       }
       updatePlayButton();
       activateButton();
    }
}

function play() {
    if (currentlyPlayingIndex === null) {
        return
    }
    if (playing) {
        audioPlayer.pause();
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        playing = false;
    } else {
        audioPlayer.play();
        playing = true;
        if (timer) {
            clearInterval(timer);
        }
        timer = setInterval(updateTime, 1000);
    }
    updatePlayButton();
    activateButton();
}

function playNext() {
    if(currentlyPlayingIndex === null) {
        return
    }
    // make sure to clear the timer when going to the next song
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    let nextSong = currentlyPlayingIndex + 1;
    if(nextSong >= songData.path.length) {
        nextSong = 0;
        currentlyPlayingIndex = null; // prevent confusion between pause and load a new song
    }
    playSong(nextSong);
}

function playPrevious() {
    if(currentlyPlayingIndex === null) {
        return
    }
    // make sure to clear the timer when going to the previous song
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    let previousSong = currentlyPlayingIndex - 1;
    if(previousSong < 0) {
        previousSong = songData.path.length - 1; // make it to the last song, 
        // if wanna stay at start set previousSong = 0;
        currentlyPlayingIndex = null; // prevent confusion between pause and load a new song
    }
    playSong(previousSong);
}

function updateTime() {
    $('#time-left').text(secondsToTime(audioPlayer.currentTime));
    $('#total-time').text(secondsToTime(audioPlayer.duration));
    console.log("tick");
    if(audioPlayer.currentTime >= audioPlayer.duration) {
        playNext();
    }
}

function updatePlayButton() {
    let playIcon = $('#play-button span');
    if (playing) {
        playIcon.removeClass('icon-play');
        playIcon.addClass('icon-pause');
    } else {
        playIcon.removeClass('icon-pause');
        playIcon.addClass('icon-play');
    }
}

function activateButton() {
    let playButton = $('#play-button');
    if(playing) {
        playButton.addClass('active');
    } else {
        playButton.removeClass('active');
    }
}

function clearPlaylist() {
    clearInterval(timer);
    $('#table-body').empty();
    $('h4').text('');
    audioPlayer.pause();
    audioPlayer.src = '';
    currentlyPlayingIndex = null;
    playing = false;
    updatePlayButton();
    activateButton();
    songNumber = 0;
    songData.path = [];
    songData.title = [];
    resetDuration();
}

function resetDuration() {
    setTimeout( () => {
        $('#time-left').text('00:00');
        $('#total-time').text('00:00');
    }, 250)
}

// Helper function
function secondsToTime(t) {
    return padZero(parseInt((t / (60)) % 60)) + ":" + 
           padZero(parseInt((t) % 60));
    }

function padZero(v) {
    return (v < 10) ? "0" + v : v;
    }


// Debugging
const debugInterval = setInterval( () => {
    console.log($('#total-time').html());
}, 500);

function stopDebugging() {
    clearInterval(debugInterval);
}

// comment out when no need to debug the timer
stopDebugging();