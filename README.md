BrowserDetection
================

Do you really need to detect what browser the user is using?  I would argue that in most cases you do not.  However, when working on the [Uniform] plugin for jQuery, there's a bit of code that needs to trigger a `change` event because Trident (Microsoft's rendering and JavaScript engine for Internet Explorer) didn't do the right thing at the right time.

What Do You Do?
---------------

Using only feature detection, the `browserDetection()` function will return information about your browser and rendering engine.  Simply include `browserDetection.js` and you'll get this new `browserDetection()` function.

    var result;
    result = browserDetection();
    // Sorry, the next line doesn't work in older IE
    console.log(result);

You will get something like this in the reply, assuming you are using IE8 in compatible mode.  Yes, the plugin can easily figure out you are pretending to be a lower version (hence `browserVersion` is `7`), but still correctly reports the `engineVersion`.

    {
        "browser": "msie",
        "browserVersion": 7,
        "engine": "trident",
        "engineVersion": "4"
    }
    
Why should this be used?
------------------------

Only use this when you need to fix or work around bugs in the rendering engine.  Otherwise you should try to use another library, such as [jQuery] that hides the complexities and lets you write in a more more cross-browser way.

It's the `engine` and `engineVersion` properties that should be used to determine if you need to employ your work-around.
    
What is Feature Detection?
--------------------------

It's using exposed properties of objects to determine how you should process things.  For instance, you could wish to iterate over an array.

    // Iterate using EcmaScript 5
    [ 'one', 'two' ].forEach(function (item) {
        console.log(item);
    });
    
The tragic part is that this code will break on older browsers.  You can decide to use this "feature" if you detect it.

    // Smarter iterate
    var index, array;
    
    array = [ 'one', 'two' ];
    if (Array.prototype.forEach) {
        // Use EcmaScript 5
        array.forEach(function (item) {
            console.log(item);
        ]);
    } else {
        // Older version - similar code
        for (index = 0; index < array.length; index += 1) {
            console.log(item);
        }
    }
    
You'll probably see that the next step is to create a function to iterate, but let's not take that route.  JavaScript is a very fine language for extending itself.  How about we add a poor implementation of `forEach` if it does not exist?

    // Provide a really bad implementation of "forEach" if
    // the object does not provide it already.
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function forEachShim(callback) {
            var index;
            
            for (index = 0; index < this.length; index += 1) {
                callback(this[index]);
            }
        };
    }

Now we have our "feature" and our EcmaScript 5 based code can use `Array.prototype.forEach`.

*Note:* Instead of using the above polyfill, try out [es5-shim] that does it better and fill in many other functions.

What About User-Agent?
----------------------

Browsers can easily lie.  Plugins change the User-Agent.  It's harder for them to change the features and more unlikely.  One can still do it, but hopefully they won't.  Remember, the point of doing it this way is to detect and work around a problem.

[es5-shim]: https://github.com/kriskowal/es5-shim
[jQuery]: http://jquery.com/
[Uniform]: https://github.com/pixelmatrix/uniform/

I Want To Help!
---------------

Fantastic!  There's tools in the `test/` folder to help you help this project.

* `index.html` - Data collection tool.  Uses `test.js` and reports data back to `postback.php` via image tags.
* `postback.php` - Accepts data from the testing page and writes out a chunk to the `tests/results/` directory.
* `assemble.php` - Command line PHP script to take the results from `postback.php` and assemble them into a single data file, intended for the `tests/data/` folder.
* `grid.php` - Web based page that will let you test JavaScript against all of the collected data files.
* `eval.html` - Need to run JavaScript without a console, such as in older Internet Explorer versions?  This simple page can help.
