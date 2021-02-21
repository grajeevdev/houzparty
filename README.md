# houzparty
Now annoy your friends with your unholy music taste!

***v1.0.0 is live!***

## Features
Collaborative listening via rooms. Join rooms where the vibe of your house party is democratized. 
Allow individual users to vote on repeats or skips.
Allow guests to control track playback.
Or dont.

Its your party, after all :P

## Backend

Uses Django to serve two apps: myapp - a Room Controller, spotify - a Spotify API communicator

## Frontend

Uses React to render a purely functional frontend. Uses React Hooks and latest React functional paradigms as of React v16.6

## Set up

1. Checkout the repo 
   `git status https://github.com/grajeevdev/houzparty.git`

2. Enter the folder and navigate to frontend
    `cd ./frontend`

3. Install required React dependencies
    `npm install`

4. navigate to base directory and run django server :
    `cd..`
    `python manage.py runserver`
(Optional)

5. If you wish to make modifications to the front end, keep the webpack script running in the frontend folder
    `npm run dev` 
    
    
### Have fun!
