import { Hono } from 'hono';

const getHono = () => {
  const app = new Hono<{ Bindings: Env }>();
  return app;
};

export { getHono };
