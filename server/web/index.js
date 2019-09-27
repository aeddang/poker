import express from 'express';
import articles from './router/articles';
import cors from  "cors";
import crypto from  "crypto";
import bodyParser from "body-parser";
import base64url from "base64url"
import path from "path"
import methodOverride from "method-override";
const port = Number(process.env.PORT || 2053);
const app = express();
var corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
}

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride());
app.post('/', (req, res) => {
    let signed_request = req.body.signed_request;
    let encodedList = signed_request.split('.');
    let payload = base64UrlDecode(encodedList[1]);
    let sig = base64UrlDecode(encodedList[0]);
    let data = JSON.parse(  base64url.decode(payload) );
    let expectedSig = getHash(payload);
    if (sig != expectedSig) {
      console.log('Bad Signed JSON signature!');
      return res.send(null);
    }

    res.sendFile(path.resolve(__dirname + '/../dist/index.html'));
    function base64UrlDecode(decode){
       return decode.replace(/-/gi, '+').replace(/_/gi, '/');
    };

    function getHash(string){
      var hmac = crypto.createHmac('sha256', 'df601c25d0c8bafc620310c4dc3e01bc');
      hmac.update(string);
      return hmac.digest('base64').replace(/=/gi, '');
    };
});
app.use('/', express.static(__dirname + '/../dist'));
app.use('/articles', articles);

const server = app.listen(port, () => {
    console.log('Express listening on port ' + port);
});
