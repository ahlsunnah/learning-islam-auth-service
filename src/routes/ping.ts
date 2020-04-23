async function routes(fastify, options, next) {
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      response: {
        200: {
          type: 'string',
        },
      },
    },
    handler: async (req, res): Promise<void> => {
      res.code(200).send('HELLO THERE');
    },
  });

  next();
}

module.exports = routes;
