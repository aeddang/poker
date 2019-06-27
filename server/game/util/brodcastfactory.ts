import { PlayerData, Command} from "./interface"


enum Sender {
  AdminLv1 = 1,
  AdminLv2,
  AdminLv3,
  User,
  Individual,
  Push
}

const BOUNDERY = '$^$'
const SECOND_BOUNDERY = '$->$'
export function getPushMsg (id:string, msg:string):string {
  return Sender.Push + BOUNDERY + JSON.stringify(msg) + BOUNDERY + id
}

export function getJoinMsg (nick:string):string {
  return Sender.AdminLv3 + BOUNDERY + nick + " join!!"
}

export function getLeaveMsg (nick:string):string {
  return Sender.AdminLv3 + BOUNDERY + nick + " leave!!"
}

export function getMsg (id:string, nick:string, msg:string, isIndividual:boolean = false):string {
  let header = isIndividual ? Sender.Individual : Sender.User
  return header + BOUNDERY + nick + SECOND_BOUNDERY + msg + BOUNDERY + id
}
