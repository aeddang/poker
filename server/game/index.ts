import starter from './starter'


//const test = new Dealler()
const port = Number(process.env.PORT || 2567)
starter(port, {ante:1, gameRule:2})
starter(port+1, {ante:10, gameRule:2})
starter(port+2, {ante:100, gameRule:2})
starter(port+3, {ante:1000, gameRule:2})
