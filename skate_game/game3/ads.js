var googleVideoAd;
var adTagUrl;

/**
 * Initialize the preloader once the page has loaded.
 */
window.onload = function () {
    adTagUrl = 'http://googleads.g.doubleclick.net/pagead/ads?ad_type=video_image_text&client=ca-video-pub-4968145218643279&videoad_start_delay=0&description_url=http%3A%2F%2Fwww.google.com&adtest=on';

    var adContainer = document.getElementById('block_game');
    if (!adContainer) {
        adContainer = document.createElement('DIV');
        adContainer.id = 'block_game';
    }
    googleVideoAd = new google.outstream.AdsController(
            adContainer,
            onAdLoaded,
            onDone);
    //document.getElementById('requestAndShow').disabled = false;
	requestAds();
};

function requestAds() {
    googleVideoAd.initialize();

    // Request ads
    googleVideoAd.requestAds(adTagUrl);
}

/*
 * Callback for when ad has completed loading.
 */
function onAdLoaded() {
    // Play ad
    googleVideoAd.showAd();
}

/*
 * Callback for when ad playback has completed.
 */
function onDone() {
    // Start your game here
}
