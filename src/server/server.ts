import fastify from "fastify";
import fastifyWebsocket from "fastify-websocket";

const port = 3001;
const server = fastify();
server.register(fastifyWebsocket);

server.get('/ws', { websocket: true }, (connection) => {
    connection.socket.on('message', message => {
        connection.socket.send('hi from server')
    })
})

server.listen(3001, err => {
    if (err) {
        server.log.error(err)
        process.exit(1)
    }
    console.log(`Server started on localhost:${port}`)
})
