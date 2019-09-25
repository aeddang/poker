import express from 'express';
import articles from './router/articles';
import cors from  "cors";
const port = Number(process.env.PORT || 2083);
const app = express();
var corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}

app.use(cors(corsOptions));
app.use('/', express.static(__dirname + '/../dist'));
app.use('/articles', articles);

const server = app.listen(port, () => {
    console.log('Express listening on port ' + port);
});
