# dknotam
Use Google Maps for visualising official NOTAMs in Denmark

## Background
For my flight planning app, I needed a way to check relevant NOTAMs. I found a good and realiable source on pilotweb and in this example made a small 
nodejs based example on how to get to the data and put them on simple Google Maps screen.
<p/>
This is by no means ment to be a complete application example, but will help demonstrate the basics. It has no build in database with 
access to Restricted airspaces and so and hence will not be able to produce any kind of polygon plotting as is.

<p align="center">
<img width="745" alt="screenshot" src="https://user-images.githubusercontent.com/3058746/35766845-10bff990-08e0-11e8-9871-9b0d90c26bea.png">
</p>

## Usage

Out of the box, this example will examine and list all notams issued for Copenhagen Airport Roskilde, EKRK - which is admittedly not very exiting, but if you edit the
`app.js`file and go to the bottom, you will be able to quickly change this to for example `EKDK` for the Danish FIR, or something else to your liking.

Enjoy...
