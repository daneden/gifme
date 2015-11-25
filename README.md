# gifme
Gifme is a super-simple Ruby and JS app for grabbing, previewing, and linking to individual files
in a directory of images. Namely, animated gifs.

## Why would you do this
I wanted to be able to search my gif library and do so in a way more fancy/interesting than CMD+F.
I also wanted previews that were bandwidth-friendly, and (eventually) a tagging system with both
global and local tags.

## How did you do this
Take a look through the code and find out! But the TL;DR is this:

- The whole thing is a one-view Sinatra/Rack app with JavaScript search
- All routes except for `/` resolve as `/gifs/{request}`
- There is a symlink to a directory of images (gifs) in `public`
  - This is where you'd put (or symlink) your images/gifs if you wanted to run it yourself
- I'm using [Passenger](https://www.phusionpassenger.com) to run the Rack app on my Apache server
