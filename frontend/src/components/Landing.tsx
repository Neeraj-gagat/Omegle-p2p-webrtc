import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom";

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

    return <div>
        <video ref={videoRef}></video>
        <input type="text" onChange={(e) => {
            setName(e.target.value);
        }} >

        </input>
        <Link to={`/room/?name=${name}`}>join </Link>
    </div>
}