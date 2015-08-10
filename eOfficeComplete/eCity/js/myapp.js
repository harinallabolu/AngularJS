var myJsArray = {};

function myLoadScript(scriptName, callback) {

    if (!myJsArray[scriptName]) {
        // adding the script tag to the head as suggested before
        var body = document.getElementsByTagName('body')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = scriptName;

        // then bind the event to the callback function
        // there are several events for cross browser compatibility
        //script.onreadystatechange = callback;
        //script.onload = callback;
        script.onload = function () {
            myJsArray[scriptName].finished = true;

            if (callback)
                callback();
        };

        myJsArray[scriptName] = {
            finished: false,
            script: script
        }

        // fire the loading
        body.appendChild(script);

    } else if (!myJsArray[scriptName].finished && callback) {
        var oldHandler = myJsArray[scriptName].script.onload;
        myJsArray[scriptName].script.onload = function () {
            oldHandler();

            callback();
        };

    } else if (callback) {// changed else to else if(callback)
        //console.log("JS file already added!");
        //execute function
        callback();
    }

}