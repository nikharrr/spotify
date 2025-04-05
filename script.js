let currentFolder;
let songs = [];
let currentSong = new Audio()

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2,'0');
    const formattedSeconds = String(remainingSeconds).padStart(2,'0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSong(folder) {
    currentFolder = folder;
    let a = await fetch(`http://127.0.0.1:3002/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")


    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    let songul = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songul.innerHTML = "";
    for (const song of songs) {
        let display=song.replaceAll("%20"," ");
        display=display.replace(".mp3"," ");
        songul.innerHTML = songul.innerHTML + `<li>
                            <img class="invert" width="23px" src="img/music.svg" alt="">
                            <div class="info">
                                <span>${display}</span>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" width="23px" src="img/play.svg" alt="">
                            </div>
                        </li>`
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",element => {
            let song=e.querySelector(".info").firstElementChild.innerHTML.trim()+ '.mp3'
            playMusic(song)
          
        })
    }
    )
    return songs;
}


const playMusic = (track,pause = false) => {
    currentSong.src = `/${currentFolder}/` + track; // Correct folder reference

    if (!pause) {
        currentSong.play();
        document.querySelector(".playbtn").getElementsByTagName("img")[0].src = "img/pause-stroke-rounded.svg"; // Correct file path
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track.replace(".mp3"," "));
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
};

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3002/Songs`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/Songs")) {
            let folder = e.href.split("/").slice(-2)[0];

            let a = await fetch(`/Songs/${folder}/info.json`)
            let response = await a.json();
            
            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div class="card" data-folder="${folder}">
                        <div class="cover">
                            <img src="/Songs/${folder}/cover.jpeg" alt="">
                            <button class="play">
                                <img src="img/play.svg" alt="">
                            </button>
                        </div>
                        <div class="content">
                            <h4>${response.title}</h4>
                            <div>${response.description}</div>
                        </div>
                    </div>`
        }

    }

    Array.from(document.getElementsByClassName("card")).forEach(e=>{
       
        e.addEventListener("click",async item=>{
        songs = await getSong(`Songs/${item.currentTarget.dataset.folder}`)  
        playMusic(songs[0])
    })
    })


}

async function main() {
    await getSong("Songs/Kabir-Singh");
    playMusic(songs[0],true);
    await displayAlbums();

    document.querySelector(".soonglist")
    currentSong.addEventListener("timeupdate",() => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".scroller").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    document.querySelector(".playbtn").addEventListener("click",() => {
        console.log('abs');

        if (currentSong.paused) {
            currentSong.play()
            document.querySelector(".playbtn").getElementsByTagName("img")[0].src = "img/pause-stroke-rounded.svg";
        }
        else {
            currentSong.pause()
            document.querySelector(".playbtn").getElementsByTagName("img")[0].src = "img/play-stroke-rounded.svg";
        }
    })

    document.querySelector(".seekbar").addEventListener("click",e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".scroller").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    document.querySelector(".hamburger").addEventListener("click",() => {
        document.querySelector(".sidebar").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click",() => {
        document.querySelector(".sidebar").style.left = "-110%";
    })

    document.querySelector(".prev").addEventListener("click",() => {
        currentSong.pause;
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })

    document.querySelector(".next").addEventListener("click",() => {
        currentSong.pause;
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e) => {
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = "img/volume.svg"
        }
    })

    document.querySelector(".volume>img").addEventListener("click",(e) => {
        if (e.target.src.includes("volume.svg")) {
            document.querySelector(".volume>img").src = "img/mute.svg"
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            document.querySelector(".volume>img").src = "img/volume.svg"
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })
}

main()