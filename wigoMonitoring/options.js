function save_options() {
    if(!jQuery('#soundUrl').val()) {
        jQuery('#soundUrl').val(defaultSoundUrl)
    }
    myAudio.pause();
    myAudio.currentTime = 0.0;
    var wigoUrl = jQuery('#wigoUrl').val();
    var soundVolume = jQuery('#soundVolume').val();
    var soundUrl = jQuery('#soundUrl').val();
    chrome.storage.sync.set({
        wigoUrl: wigoUrl,
        soundVolume: soundVolume,
        soundUrl: soundUrl
    }, function() {
        loading();
        jQuery('#status').html('Options saved !');
        jQuery('#status').show();
        restore_options();
        updateMontioring();
        setTimeout(function() {
            status.textContent = '';
            jQuery('#status').fadeOut();
        }, 3*1000);
    });
}

function testSound() {
    var soundVolume = jQuery('#soundVolume').val();
    var soundUrl = jQuery('#soundUrl').val();
    myAudio.pause();
    myAudio.currentTime = 0.0;
    myAudio.src = soundUrl;
    myAudio.volume = soundVolume;
    myAudio.play();
}

function stopSound() {
    myAudio.pause();
    myAudio.currentTime = 0;
}

function restore_options() {
    chrome.storage.sync.get(null, function(options) {
        if(options.hasOwnProperty('wigoUrl')){
            jQuery('#wigoUrl').val(options.wigoUrl);
        }
        if(options.hasOwnProperty('soundVolume')){
            jQuery('#soundVolume').val(options.soundVolume);
        }
        else
        {
            jQuery('#soundVolume').val(1);
        }
        if(options.hasOwnProperty('soundUrl')){
            jQuery('#soundUrl').val(options.soundUrl);
        }
        else
        {
            jQuery('#soundUrl').val(defaultSoundUrl);
        }
    });
}
jQuery(document).ready(function(){
    restore_options();
});
jQuery('form').submit(function(){
    save_options();
    return false;
});
jQuery('#soundVolume').change(function(){
    if(!jQuery('#soundUrl').val()) {
        jQuery('#soundUrl').val(defaultSoundUrl)
    }
    testSound();
});
jQuery('#soundTest').click(function(){
    if(!jQuery('#soundUrl').val()) {
        jQuery('#soundUrl').val(defaultSoundUrl)
    }
    testSound();
});
jQuery('#soundStop').click(function(){
    stopSound();
});
jQuery('#soundReset').click(function(){
    jQuery('#soundUrl').val(defaultSoundUrl);
});
