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
        return <div className="bg-slate-100 h-screen">
            <header className="bg-blue-400 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                    {/* <img src="logo.png" alt="Logo" className="h-8 w-8"> */}
                    <h1 className="text-xl font-bold">OMEGLE</h1>
                    </div>
                </div>
            </header>
            <div className="flex justify-center">
                <video className="rounded-lg h-auto" autoPlay ref={videoRef}></video>
            </div>
            <div className="flex flex-col justify-center items-center">
            <input
            // style={{width: "10%"}}
            className="bg-gray-50 h-10 w-40 text-xl text-center border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Name" type="text" onChange={(e) => {
                setName(e.target.value);
            }} >
            </input>
            <button
            className="bg-black rounded-md px-6 py-2 text-white"
            onClick={() => {
                setJoined(true)
            }}>join </button>
            </div>
            
        </div>    
    }

    return <div>
        <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} ></Room>
    </div>
    
}