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
    const remoteVideoRef = useRef<HTMLVideoElement>();
    const localVideoRef = useRef<HTMLVideoElement>();

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
                        type:"sender"
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

            pc.onicecandidate = async (e) => {
                console.log("icwe candidate on recevied offer")
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "receiver"
                    })   
                }
            }

            pc.ontrack = (({track, type}) => {
                if (type == 'audio') {
                    // setRemoteAudioTrack(track);
                    // @ts-ignore
                    remoteVideoRef.current?.srcObject.addTrack(track)
                }else {
                    // setRemoteVideoTrack(track);
                    // @ts-ignore`
                    remoteVideoRef.current?.srcObject.addTrack(track)
                }
            })
            socket.emit('answer', {
                roomId,
                sdp: sdp
            })
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
                    pc?.addIceCandidate(candidate)
                    return pc
                })
            }else{
                setReceivingPc(pc => {
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

   
    return <div>
        Hi {name}
        <video autoPlay width={400} height={400} ref={localVideoRef}/>
        {lobby ? "waiting to conect you to someone" : null}
        <video autoPlay width={400} height={400} ref={remoteVideoRef}/>
    </div>
}