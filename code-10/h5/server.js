/** 极简静态服务器，只为把 index.html 提供给 web-view。 */
const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 5173
const ROOT = __dirname

http.createServer((req, res) => {
  const file = path.join(ROOT, req.url.split('?')[0] === '/' ? 'index.html' : req.url.split('?')[0])
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('not found') }
    const ext = path.extname(file)
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[ext] || 'text/plain'
    res.writeHead(200, { 'Content-Type': type + '; charset=utf-8' })
    res.end(buf)
  })
}).listen(PORT, () => console.log(`\nH5 页面： http://localhost:${PORT}\n`))
