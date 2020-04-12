import fastify from 'fastify';
import * as knex from 'knex';

declare module 'fastify' {
  export interface FastifyInstance<
    HttpServer = import('http').Server,
    HttpRequest = import('http').IncomingMessage,
    HttpResponse = import('http').ServerResponse
  > {
    knex: knex;
  }
}
