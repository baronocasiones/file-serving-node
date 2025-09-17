const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');


const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);

    fs.readFile(filePath, (err, content) => {
        if(err) {
            if(err.code === 'ENOENT'){
                console.log(content);
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf8');
            } else{
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else{
            res.writeHead(200, { 'Content-Type': mime.lookup(filePath) });
            console.log(content)
            res.end(content, 'utf8');
        }
    });
    // if(req.url === '/upload' && req.method === 'POST'){
    //     let body = [];
    //     req.on('data', (chunk) => body.push(chunk));
    //
    //     req.on('end', () => {
    //         body = Buffer.concat(body);
    //         console.log('Received file data, length: ', body.length);
    //         res.writehead(200, { 'content'})
    //         res.end('Upload Successful');
    //     });
    // }
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
