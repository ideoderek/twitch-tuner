Twitch Tuner
============

A Chrome extension that notifies users when their favorite Twitch.tv streamers are live.

Current version: `0.1.0` October 30, 2016

Attribution
-----------

The majority of the images included in this repository are Google's open source material design icons (or are derived from those icons). Google makes its material design icons available under the Apache License Version 2.0; check out their [website](https://design.google.com/icons/) and GitHub [repository](https://github.com/google/material-design-icons/).

Installation
------------

The Twitch Tuner repository only contains the extension's source files, in the `app` directory. To use the extension in Chrome, you first have to build it:

1. Install Node.js
2. Install npm
3. Run `npm install` in the root directory

Now you are ready to build the extension. There are two ways to do this. You can do `npm run pack` to perform a one-time build. Or you can do `npm run watch-pack` to watch for changes to the source files and automatically build the extension when they occur.

Both methods will create a directory called `pkg` containing the built extension.

To run the built extension in Chrome:

1. Navigate to [`chrome://extensions`](chrome://extensions)
2. Ensure that the "Developer mode" checkbox is selected
3. Click the "Load unpacked extension..." button
4. Select the `pkg` directory and click "OK"

The extension should now be loaded into Chrome. To view any changes you make to the source files, reload the extension by clicking the "Reload" button in Chrome.

Contributing
------------

Issues and pull requests are welcome.

License
-------

**The MIT License (MIT)**

Copyright (c) 2016 ideoderek

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.