const Hapi = require('@hapi/hapi');
const axios = require('axios');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

const init = async () => {
    await server.register([
        require('@hapi/vision'),
        require('@hapi/inert')
    ]);

    server.views({
        engines: {
            html: require('handlebars')
        },
        path: 'templates'
    });

    const appendNode = (node, object) => {
        if (node['id'] === object['parent_id']) {
            node['children'].push(object);
        } else {
            node['children'].forEach(item => appendNode(item, object));
        }
    }

    /**
     * @api {POST} /pomelo-challenges Request Appending Output
     *
     * @apiParam Appendix Input
     * @apiSuccess Appending Output
     */

    server.route({
        method: 'POST',
        path: '/pomelo-challenges',
        handler: (request, h) => {
            const payload = request.payload;
            let node = {};
            Object.keys(payload).forEach(key => {
                payload[key].forEach(object => {
                    if (!object['parent_id']) {
                        node = object;
                    }
                    appendNode(node, object);
                });
            });
            return h.response([node]).code(200);
        }
    });

    server.route({
        method: 'GET',
        path: '/pomelo-challenges',
        handler: async (request, h) => {
            const page = parseInt(request.query.page) || 1;
            if (page > 100) {
                return h.response({message: 'Only the first 1000 search results are available'}).code(400);
            }
            try {
                const response = await axios.get('https://api.github.com/search/repositories?q=nodejs&per_page=10&page=' + page)
                response.data.current_page = page;
                return h.view('index', response.data);
            } catch (err) {
                console.error(err);
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/templates/{path*}',
        handler: {
            directory: { path: 'templates' }
        }
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();

module.exports = server;
