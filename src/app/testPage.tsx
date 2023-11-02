'use client'

import { NextPage } from 'next';
import dynamic from 'next/dynamic'

const DashPlayer: NextPage = () => {
    const VideoPlayer = dynamic(() => import('./dashVideo'));
    return (
        <div>
            <VideoPlayer videoURL='https://editedvideosean.s3.us-west-2.amazonaws.com/output/output.mpd'></VideoPlayer>
        </div>
    )
}

export default DashPlayer;

