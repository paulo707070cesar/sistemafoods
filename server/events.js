// Canal de eventos em tempo real (Server-Sent Events) para sincronizar os terminais.
// SSE foi escolhido por funcionar com o mesmo cookie de sessão e não exigir dependências extras.

export function createEventHub() {
  const clients = new Set();

  function send(client, payload) {
    try {
      client.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {
      clients.delete(client);
    }
  }

  return {
    /** Handler Express que mantém a conexão aberta e envia eventos. */
    handle(req, res) {
      res.set({
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no'
      });
      res.flushHeaders?.();

      const client = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, res };
      clients.add(client);
      res.write(': conectado\n\n');

      // Mantém a conexão viva através de proxies que encerram ociosidade.
      const keepAlive = setInterval(() => {
        try {
          res.write(': ping\n\n');
        } catch {
          clearInterval(keepAlive);
          clients.delete(client);
        }
      }, 25000);

      req.on('close', () => {
        clearInterval(keepAlive);
        clients.delete(client);
      });
    },

    broadcast(payload) {
      for (const client of clients) send(client, payload);
    },

    clientCount() {
      return clients.size;
    }
  };
}
