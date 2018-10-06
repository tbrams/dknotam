# dknotam
Use Google Maps for visualising current official NOTAMs in Denmark.

## Background
For my flight planning app, I needed a way to check relevant NOTAMs. I found a good and reliable source on 
[pilotweb](https://pilotweb.nas.faa.gov/) and in this example made a small `nodejs` based example on how to get to the data and put them on a simple Google Maps background.

This is by no means meant to be a complete application example, but will hopefully help demonstrate the basics. It has no build in database with access to Restricted airspace layout and so - hence will not be able to produce any polygon plotting as is. 

<p align="center">
<img width="745" alt="screenshot" src="https://user-images.githubusercontent.com/3058746/35766845-10bff990-08e0-11e8-9871-9b0d90c26bea.png">
</p>

## Usage
Out of the box, this example will examine and list all NOTAMs issued for Copenhagen Airport Roskilde, EKRK. Although this setup is admittedly not very exciting, please feel free to modify the configuration to suit your requirements. All you need to do is to edit the app.js file near the last line, and you will be able to quickly change this to, for example, EKDK for the Danish FIR, or something else to your liking.

Enjoy...
