import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom";
import { Socket } from "socket.io-client";

export const Room = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const name = searchParams.get("name");
    const [socket, setSocket] = useState<null | Socket>(null)

    useEffect(() => {
        // logic to init user to the room

    },[name])
    return <div>
        Hi {name}
    </div>
}