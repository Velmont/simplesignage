Simple Signage
==============

A simple project to show images in a slideshow screens using web technologies.

It has a (very) simple admin where you can upload an image and active it so that
the screens that currently connect to the same site will show this image in its
slideshow.

The way this works is that you start a local server somewhere, this is where
the files will be stored and the address to which you'll connect all the
screens.

It's written in Flask and should be simple to set up for use.  Only one server
required, and an updated browser (with ES6 support).


Setting up a development environment
------------------------------------

First of all, this project uses git submodules. So you must make sure you've got those updated:

    $ git submodule update --init

Then install the Python dependencies:

    $ virtualenv env
    $ source env/bin/activate
    (env)$ pip install -r requirements.txt

You can now start the server:

    (env)$ python app.py


This will give you a webserver running on port 5000.  On your local machine you
might want to open the admin page:

    http://127.0.0.1:5000/admin

And on the remote machines (or another tab), you should open the viewer or client:

    http://<your_ip>:5000/


License
-------

MIT licensed.
Written by Odin Hørthe Omdal.
