import express from 'express';
import crypto from 'crypto';
const router = express.Router();

router.use((req, res, next) => {
    console.log('Time: ', Date.now().toString());
    next();
});

router.get('/', (req, res) => {
    res.send('articles');
});

router.post('/', (req, res) => {
    let signed_request = req.body.signed_request;
    console.log('signed_request : ' + signed_request);
    let encodedList = signed_request.split('.');
    let payload = encodedList[1];
    let sig = base64UrlDecode(encodedList[0]);
    console.log('sig : ' + sig);
    console.log('payload : ' + payload);
    let data = JSON.parse( base64UrlDecode(payload) );
    console.log(data);
    let expectedSig = getHash(payload);
    if ($sig !== $expected_sig) {
      console.log('Bad Signed JSON signature!');
      return res.send(null);
    }
    res.send(data);

    function base64UrlDecode(decode){
       return Buffer.from(decode.replace(/-_/gi, '+/'), 'base64').toString('ascii');
    };

    function getHash(string){
      var hmac = crypto.createHmac('sha256', 'df601c25d0c8bafc620310c4dc3e01bc');
      hmac.update(string);
      return hmac.digest('binary');
    };
});




router.get('/read/:id', (req, res) => {
    res.send('You are reading article ' + req.params.id);
});

export default router;
