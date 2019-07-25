import express from 'express';
import Debugger from '../skeleton/log';

const router = express.Router();
const debuger = new Debugger();
debuger.tag = "GET"

router.use((req, res, next) => {
    debuger.log(req,Date.now().toString());
    next();
});

router.get('/', (req, res) => {
  res.send('Hello get Router!\n');
});

router.get('/2', (req, res) => {
  res.send('Hello get Router2!\n');
});

router.get('/3', (req, res) => {
  res.send('Hello get Router3!\n');
});

export default router;
