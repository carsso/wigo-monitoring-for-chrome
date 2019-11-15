chrome.storage.sync.get('wigoUrl', function(options) {
    if(options.wigoUrl) {
        jQuery('#wigoFrame').attr('src', options.wigoUrl);
    } else {
        jQuery('#wigoAlert').html('<h4>Missing configuration</h4><p>Specify your Wigo URL in options.</p><p><a href="options.html" class="btn btn-danger">Open options</a></p>').show();
    }
});
