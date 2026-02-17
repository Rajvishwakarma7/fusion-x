import { io } from ".."

export const sendMessage = ()=>{
    io.emit('message','Hello')
}
