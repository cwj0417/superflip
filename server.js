import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('.', import.meta.url)))
const port = Number(process.env.PORT) || 4321

const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.woff2': 'font/woff2'
}

createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    let pathname = decodeURIComponent(url.pathname)
    if (pathname.endsWith('/')) pathname += 'index.html'

    const file = resolve(join(root, normalize(pathname)))
    if (file !== root && !file.startsWith(root + sep)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Forbidden')
        return
    }

    try {
        const info = await stat(file)
        if (!info.isFile()) throw new Error('not a file')
        res.writeHead(200, {
            'Content-Type': mime[extname(file)] || 'application/octet-stream',
            'Cache-Control': 'no-cache'
        })
        createReadStream(file).pipe(res)
    } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found')
    }
}).listen(port, () => {
    console.log(`Super Flip → http://localhost:${port}`)
})
