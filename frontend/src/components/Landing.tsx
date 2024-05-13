import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom";
import { Room } from "../Room";

export const Landing = () => {
    const [name, setName ] = useState("");
    const [joined, setJoined] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [localAudioTrack, setlocalAudioTrack] = useState<MediaStreamTrack | null>(null);

    const getCam = async () => { 
        const stream = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        })
        const videoTracks = stream.getVideoTracks()[0]
        const audioTracks = stream.getAudioTracks()[0]
        setlocalAudioTrack(audioTracks);
        setLocalVideoTrack(videoTracks);
        if (!videoRef.current) {
            return;
        }
        videoRef.current.srcObject = new MediaStream([videoTracks]);
    }

    useEffect(() => {
        if (videoRef && videoRef.current) {
        getCam()
        }
    }, [videoRef]);

    if (!joined) {
        return <div>
            <video width={500} autoPlay ref={videoRef}></video>
            <input type="text" onChange={(e) => {
                setName(e.target.value);
            }} >

            </input>
            <button onClick={() => {
                setJoined(true)
            }}>join </button>
        </div>    
    }

    return<Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} ></Room>
    
}