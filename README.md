# gifme
Gifme is a super-simple Ruby and JS app for grabbing, previewing, and linking to individual files
in a directory of images. Namely, animated gifs.

Now also a Slack app!

<a href="https://slack.com/oauth/authorize?scope=commands&client_id=17993112226.17993295106"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>

## Why would you do this
I wanted to be able to search my gif library and do so in a way more fancy/interesting than CMD+F.
I also wanted previews that were bandwidth-friendly, and (eventually) a tagging system with both
global and local tags.

I then wanted to make use of the app to basically use as a replacement for Slack’s Giphy
integration. Giphy integration is neat, but searching my own gif library from the comfort of a
Slack channel is neater.

## How did you do this
Take a look through the code and find out! But the TL;DR is this:

- The whole thing is a one-view Sinatra/Rack app with JavaScript search
- All routes except for `/` resolve as `/gifs/{request}`
- There is a symlink to a directory of images (gifs) in `public`
  - This is where you'd put (or symlink) your images/gifs if you wanted to run it yourself
- I'm using [Passenger](https://www.phusionpassenger.com) to run the Rack app on my Apache server
