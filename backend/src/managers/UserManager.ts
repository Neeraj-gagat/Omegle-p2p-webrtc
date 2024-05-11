import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";


export interface User{
    socket:Socket;
    name: string;

}

export class UserManager {
    private users: User[];
    private queue: string[];
    private rooManager: RoomManager;
    
    constructor(){
        this.users = [];
        this.queue = [];
        this.rooManager = new RoomManager();
    }
    addUser(name:string, socket: Socket){
        this.users.push({
            name,socket
        })
        this.queue.push(socket.id);
        socket.send("lobby");
        this.clearQueue()
        this.initHandler(socket)
    }
    removeUser(socketId:string){
        const user = this.users.find(x => x.socket.id === socketId);
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x === socketId);
    }

    clearQueue(){
        console.log("inside clear queue")
        console.log(this.queue.length)
        if (this.queue.length < 2) {
            return;
        }
        const id1 = this.queue.pop()
        const id2 = this.queue.pop()

        const user1 = this.users.find(x => x.socket.id === id1);
        const user2 = this.users.find(x => x.socket.id === id2);
        console.log(user1)
        console.log(user2)
        
        if(!user1 || !user2){
            return
        }

        console.log("creating room");

        const room = this.rooManager.createRoom(user1,user2);
        this.clearQueue();
    }

    initHandler(socket:Socket){
        socket.on("offer", ({sdp, roomId}: {sdp: string, roomId: string}) => {
            this.rooManager.onOffer(roomId,sdp);
        })

        socket.on("answer", ({sdp, roomId}: {sdp: string, roomId: string}) => {
            this.rooManager.onAnswer(roomId,sdp);
        })
    }

}