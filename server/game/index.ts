import starter from './starter'


//const test = new Dealler()
const port = Number(process.env.PORT || 2568)
starter(port, {serverId:"1",ante:1, gameRule:2})
starter(port+1, {serverId:"2",ante:10, gameRule:2})
starter(port+2, {serverId:"3",ante:100, gameRule:2})
starter(port+3, {serverId:"4",ante:1000, gameRule:2})
