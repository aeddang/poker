import express from 'express';

const port = Number( process.env.PORT || 8000 );
const app = express();

const apiServer = app.listen(port, () => {
    console.log('Express listening on port ' + port);
});

export default app
