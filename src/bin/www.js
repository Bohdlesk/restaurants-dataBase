const http = require('http');
const {app} = require('../app')

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is up and listening on port ${port}...`);
});