const { createClient } = require('@supabase/supabase-js')
// const dotenv = require('dotenv')

// dotenv.config();


// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.DBURL, process.env.DBKEY)


const API_KEY = process.env.APIKEY

const videoID = 'f17J3AXVK5w'


function now(){
    // return new Date('2026-02-26T00:00:00')
    return new Date()
}

function toSec(time){
    let timeSeperated = time.split(':')
    let second =Number(timeSeperated[2]||0)
    let minute =Number(timeSeperated[1])*60
    let hour = Number(timeSeperated[0])*60*60

    return second+minute+hour
}

function SumAverageCount(listOfData){
    let sum = 0
    let count = 0
    let startLikes = 0
    let endLikes = 0
    listOfData.forEach((data)=>{
        sum += data.views
        if(count===0){
            startLikes = data.likes
        }

        endLikes = data.likes

        count += 1
    })

    let returnObj = {
        sum: sum,
        count: count,
        average: sum/count,
        likesGained: endLikes - startLikes
    }

    return returnObj


}



async function insertData() {
    let currentTime = now()
    let timeString = currentTime.getHours().toString() + ':' + currentTime.getMinutes().toString()
    let dateString = currentTime.getFullYear().toString()+'-'+(currentTime.getMonth()+1).toString()+'-'+currentTime.getDate().toString()
    
    let data = await getStreamData(videoID)
    

    const maxtime = await supabase
    .from('day_table')
    .select('*')
    .order('time_of_day', {ascending:false})
    .limit(1)
    .single()
    
    // console.log(maxtime.data[time_of_day], timeString);
    if(maxtime.data!=null && toSec( maxtime.data['time_of_day']) > toSec(timeString)){
        let allRowsData = await supabase.from('day_table').select('*')

        console.log(maxtime.data.date_of_capture)
        let sac = SumAverageCount(allRowsData.data)
        const ins = await supabase.from('final_table').insert({date_of_capture: maxtime.data.date_of_capture, 
            averageviews:sac.average,
            likesgained: sac.likesGained
        })

        console.log("INSERT ERROR",ins.error, "INSERT ERROR")
        await supabase.from('day_table').delete().not('time_of_day', 'is', null)
    }
    
    const { error } = await supabase
    .from('day_table')
    .insert({ time_of_day: timeString, views: data.views, likes: data.likes, date_of_capture: dateString })
    
    console.log(error)
}




async function getStreamData(videoID) {
    
    
    let url = 'https://www.googleapis.com/youtube/v3/videos/' +
               '?part=liveStreamingDetails,statistics'+
               '&id='+videoID+
               '&key='+API_KEY

    let finalResponse
    try{
        let response = await fetch(url)
        finalResponse = await response.json()
    }
    catch(error){
        throw Error(error)
    }

    let data = {
        views: finalResponse.items[0].liveStreamingDetails.concurrentViewers,
        likes: finalResponse.items[0].statistics.likeCount
    }

    return data
}
insertData()
// let currentTime = new Date()
// let timeString = currentTime.getHours().toString() + ':' + currentTime.getMinutes().toString()

// console.log(timeString,toSec(timeString))
// // printData()
