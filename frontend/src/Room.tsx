import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

const URL = "http://localhost:3000";

export const Room = ({
    name,
    localAudioTrack,
    localVideoTrack
}: {
    name: string,
    localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    // const name = searchParams.get("name");
    const [lobby, setLobby] = useState(true);
    const [socket, setSocket] = useState<null | Socket>(null);
    const [SendingPc, setSendingPc] = useState<RTCPeerConnection | null>(null)
    const [receivingPc, setReceivingPc] = useState<RTCPeerConnection | null>(null)
    const [remoteVideoTrack, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteAudioTrack, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [remoteMediaStream, setRemoteMediaStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // logic to init user to the room
        const socket = io(URL);
        socket.on("send-offer",async ({roomId}) => {
            console.log("sending offer")
            setLobby(false);
            const pc = new RTCPeerConnection();
            setSendingPc(pc);
            if (localVideoTrack) {
                pc.addTrack(localVideoTrack)
            }
            if (localAudioTrack) {
                pc.addTrack(localAudioTrack)
            }
        
            pc.onicecandidate = async (e) => {
                console.log("receving ice candidate locally")
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type:"sender",
                        roomId
                    })   
                }
            }

            pc.onnegotiationneeded =async () => {
                console.log("on negotiation needed")
                const sdp = await pc.createOffer();
                // @ts-ignore
                pc.setLocalDescription(sdp)
                socket.emit('offer', {
                    sdp,
                    roomId
                })
            }
        });

        socket.on("offer",async ({roomId, sdp: remotesdp}) => {
            console.log("recevied offer")
            setLobby(false);
            const pc = new RTCPeerConnection();
            pc.setRemoteDescription(remotesdp)
            const sdp = await pc.createAnswer();
            // @ts-ignore
            pc.setLocalDescription(sdp)
            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;    
            }
            setRemoteMediaStream(stream);
            // trickle ice
            setReceivingPc(pc);
            // @ts-ignore
            window.pcr = pc;

            pc.ontrack = (e) => {
                alert("on track")
                // console.error("inside ontrack")
                // const {track,type} = e;
                // if (type == 'audio') {
                //     // setRemoteAudioTrack(track);
                //     // @ts-ignore
                //     remoteVideoRef.current?.srcObject.addTrack(track)
                // }else {
                //     // setRemoteVideoTrack(track);
                //     // @ts-ignore`
                //     remoteVideoRef.current?.srcObject.addTrack(track)
                // }
                // // @ts-ignore
                // remoteVideoRef.current.play();
            }

            pc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return;
                }
                console.log("ice candidate on recevied offer")
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "receiver",
                        roomId
                    })   
                }
            }

            socket.emit('answer', {
                roomId,
                sdp: sdp
            });
            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track
                const track2 = pc.getTransceivers()[1].receiver.track
                console.log(track1);
                if (track1.kind === "video") {
                    setRemoteAudioTrack(track2)
                    setRemoteVideoTrack(track1)
                }else{
                    setRemoteAudioTrack(track1)
                    setRemoteVideoTrack(track2)
                }
                // @ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track1)
                // @ts-ignore
                remoteVideoRef.current.srcObject.addTrack(track2)
                remoteVideoRef.current?.play()
            }, 5000);
        });
        socket.on("answer", ({roomId, sdp: remotesdp}) => {
            setLobby(false);
            setSendingPc(pc => {
                pc?.setRemoteDescription(remotesdp)
                return pc
            })
            console.log("loop closed");
        });
        socket.on("lobby", () => {
            setLobby(true);
        })

        socket.on("add-ice-candidate", ({candidate, type}) => {
            console.log("add ice candidate from remote")
            console.log(candidate, type)
            if (type == "sender") {
                setReceivingPc(pc => {
                    if (!pc) {
                        console.error("Receiving pc not found")
                    }else {
                        console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            }else{
                setSendingPc(pc => {
                    if (!pc) {
                        console.error("Sending pc not found")
                    }
                    pc?.addIceCandidate(candidate)
                    return pc
                })
            }
        }) 

        setSocket(socket)
    },[name])
    
    useEffect(() => {
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack])
                localVideoRef.current.play()
            }
        }
    },[localVideoRef])

   
    return <div className="bg-slate-100 h-screen">
        <header className="bg-blue-400 text-white p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                    {/* <img src="logo.png" alt="Logo" className="h-8 w-8"> */}
                    <h1 className="text-xl font-bold">OMEGLE</h1>
                    </div>
                </div>
            </header>
        <div className="text-blue-400  text-2xl"> Hi {name}  </div>
        <div className="ml-5">
            <video className="rounded-xl h-auto" autoPlay width={400} height={400} ref={localVideoRef}/>
            <div className="text-blue-400 text-2xl">
            {lobby ? "waiting to conect you to someone........." : null}
            </div>
            <video className="rounded-lg h-auto" autoPlay width={400} height={400} ref={remoteVideoRef}/>
        </div>
        <footer className="mt-auto bg-blue-400">footer</footer>
    </div>
}