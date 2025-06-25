import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import indexRouter from './routes/index.js'


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) =>{
    console.log('Middle ware says: ');
    console.log('Request Method: ' + req.method);
    console.log('Request url: ' + req.url);
    console.log('Response code: ' + req.statusCode);
    console.log('_________________________________');
    next();
})


app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter)

app.listen(PORT, () =>{
    console.log('Server running on PORT:' + PORT);
})