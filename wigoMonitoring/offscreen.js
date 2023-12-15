const audio = new Audio();
async function playAudio(source, volume) {
    if (volume || source) {
        try {
            await audio.pause();
            audio.currentTime = 0.0;
            audio.src = source;
            audio.volume = volume;
            await audio.play();
        } catch (e) {
            console.log(e);
        }
    }
}

chrome.runtime.onMessage.addListener(msg => {
    if ('play' in msg) {
        playAudio(msg.play.source, msg.play.volume);
    }
});