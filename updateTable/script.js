const { createClient } = require('@supabase/supabase-js')
//const dotenv = require('dotenv')

//dotenv.config();


// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.DBURL, process.env.DBKEY)


const API_KEY = process.env.APIKEY

const videoID = 'f17J3AXVK5w'

async function insertData() {
    let currentTime = new Date()
    let timeString = currentTime.getHours().toString() + ':' + currentTime.getMinutes().toString()

    let data = await getStreamData(videoID)


    const { error } = await supabase
        .from('day_table')
        .insert({ time_of_day: timeString, views: data.views, likes: data.likes })

    console.log(error)
}




async function getStreamData(videoID) {

    let url = 'https://www.googleapis.com/youtube/v3/videos/' +
               '?part=liveStreamingDetails,statistics'+
               '&id='+videoID+
               '&key='+API_KEY

    let response = await fetch(url)
    let finalResponse = await response.json()

    let data = {
        views: finalResponse.items[0].liveStreamingDetails.concurrentViewers,
        likes: finalResponse.items[0].statistics.likeCount
    }

    return data
}
insertData()

// printData()
