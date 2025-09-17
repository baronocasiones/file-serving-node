const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){ 
    fs.mkdirSync(uploadDir); 
}

const server = http.createServer((req, res) => {
    
    if (req.url === '/upload' && req.method === 'POST') {
        let body = [];

        req.on('data', chunk => body.push(chunk));
        req.on('end', () => {
            body = Buffer.concat(body);

            const boundary = req.headers['content-type'].split('boundary=')[1];
            const parts = body.toString().split(`--${boundary}`);

            parts.forEach(part => {
                if (part.includes('Content-Disposition')) {
                    const match = part.match(/filename="(.+)"/);
                    if (match) {
                        const filename = path.basename(match[1]);
                        const allowedTypes = ['.png', '.jpg', '.jpeg', '.gif', '.txt', '.pdf'];
                        const ext = path.extname(filename).toLowerCase();

                        if (!allowedTypes.includes(ext)) {
                            res.writeHead(400, { 'Content-Type': 'text/plain' });
                            return res.end('Error: File type not allowed');
                        }

                        const fileData = part.split('\r\n\r\n')[1];
                        const fileBuffer = Buffer.from(fileData, 'binary');

                        fs.writeFile(path.join(uploadDir, filename), fileBuffer, err => {
                            if (err) {
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                return res.end('Error saving file');
                            }
                            res.writeHead(200, { 'Content-Type': 'text/plain' });
                            res.end('Upload Successful');
                        });
                    }
                }
            });
        });
        return; 
    }

    
    let filePath = path.join(
        __dirname,
        'public',
        req.url === '/' ? 'index.html' : req.url
    );

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': mime.lookup(filePath) });
            res.end(content, 'utf8');
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
