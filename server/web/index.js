import express from 'express';
import articles from './router/articles';

const port = Number(process.env.PORT || 3000);
const app = express();

app.use('/', express.static(__dirname + '/../dist'));
app.use('/articles', articles);

const server = app.listen(port, () => {
    console.log('Express listening on port ' + port);
});
