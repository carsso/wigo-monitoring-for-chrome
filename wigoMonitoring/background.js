
function start() {
    loading();
    updateMontioring();
    setInterval(function() {
        updateMontioring();
    }, 30*1000); // 60 * 1000 milsec
}
start();
