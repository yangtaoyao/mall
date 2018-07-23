/**
 * 应用服务端入口
 */
const app = require('./server/server.js')

// 处理监听
const hostname = '127.0.0.1';
const port     = process.env.PORT || 2080;
app.listen(port, (err) => {
    if (err) throw err
    app.set('url', `http://${hostname}:${port}`)
    console.log(`Server running at http://${hostname}:${port}/`)
})
