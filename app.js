require('dotenv').config();

const express = require('express');
const hbs = require('hbs');


// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

hbs.registerPartials(__dirname + "/views/partials");

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
});

//Retrieve an access token
spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log(`Something went wrong when retrieving an access token`, error));


// Our routes go here:
app.get("/", (req, res) => {
    res.render("index.hbs");
});

app.get("/artist-search", (req, res) => {
    console.log('req.query', req.query);
    
    const { artistName } = req.query;
    const lowercaseArtistName = artistName.toLowerCase();

    spotifyApi
        .searchArtists(lowercaseArtistName)
        .then(data => {
            console.log('The received data from the api:', data.body);
            console.log('data.body.artists.items', data.body.artists.items);
            const { items } = data.body.artists;
            console.log("items[0]", items[0]);
            res.render('artist-search-results', {items});
        })
        .catch(err => console.log('Error occurred while searching artists: ', err));


});

app.get("/albums/:artistId", (req, res) => {
    console.log('req.params', req.params);
    const { artistId } = req.params;
    console.log('artistId:', artistId);
    spotifyApi
        .getArtistAlbums(artistId)
        .then(data => {
            console.log('data.body', data.body);
            const { items } = data.body;

            spotifyApi
                .getArtist(artistId)
                .then( artistData => {
                    const {name} = artistData.body;
                    res.render('albums', {name, items});
                })
                .catch(err=> console.log(`Error occurred while finding artist Name for the artistId:${artistId}`, err))
           
        })
        .catch(err => console.log(`Error occurred while searching albums for the artistId:${artistId}`,err));
});

app.get("/tracks/:trackId", (req, res) => {
    console.log('req.params', req.params);
    const { trackId } = req.params;
    spotifyApi
        .getAlbumTracks(trackId)
        .then(data => {
            console.log('tracks data', data.body);
            const {items} = data.body;
            res.render('tracks', {items})
        })
        .catch(err=> console.log('Error occurred while searching album tracks', err))
});

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
