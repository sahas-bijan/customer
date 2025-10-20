import { createHonoApp } from './hono/routes';

const honoApp = createHonoApp();

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api')) {
      // Strip the /api prefix before passing to Hono
      const honoUrl = new URL(request.url);
      honoUrl.pathname = honoUrl.pathname.replace('/api', '');

      const honoRequest = new Request(honoUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      return honoApp.fetch(honoRequest, env, ctx);
    } else {
      return new Response('Not Found', { status: 404 });
    }
  },
} satisfies ExportedHandler<Env>;
