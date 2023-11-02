
'use client'
import dashjs from "dashjs";
import React, { useEffect } from "react";


interface DashVideoProps {
    videoURL: string;
};

const VideoPlayer: React.FC<DashVideoProps> = ({
    videoURL
}: DashVideoProps) => {

    const video = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        if (video.current) {
            const player = dashjs.MediaPlayer().create();
            player.initialize(video.current, videoURL, true);
            player.updateSettings({
                streaming: {
                    buffer: {
                        bufferTimeAtTopQuality: 3
                    }
                }
            });
            console.log(`here : ${videoURL}`)
        }
    }, [videoURL]);
    return (
        <div>
            <video ref={video} controls />
        </div>
    );
}

export default VideoPlayer;