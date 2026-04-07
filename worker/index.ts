export default {
  async fetch(request: Request, env: Record<string, unknown>): Promise<Response> {
    const url = new URL(request.url);

    // Redirect www to apex
    if (url.hostname === "www.overnit.com") {
      url.hostname = "overnit.com";
      return Response.redirect(url.toString(), 301);
    }

    // Let the asset handler + SPA fallback handle everything else
    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler;
