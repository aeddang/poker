import { PlayerData, Command} from "./interface"


enum Sender {
  AdminLv1 = 1,
  AdminLv2,
  AdminLv3,
  User,
  Individual,
}

const BOUNDERY = '$';


export function getJoinMsg (nick:string):string {
  return Sender.AdminLv3 + BOUNDERY + nick + " join!!";
}

export function getLeaveMsg (nick:string):string {
  return Sender.AdminLv3 + BOUNDERY + nick + " leave!!";
}

export function getMsg (nick:string, msg:string, isIndividual:boolean = false):string {
  let header = isIndividual ? Sender.Individual : Sender.User;
  return header + BOUNDERY + nick + "-> " + msg;
}
