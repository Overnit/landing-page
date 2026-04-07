export default {
  async fetch(request: Request, env: Record<string, unknown>): Promise<Response> {
    const url = new URL(request.url);

    // Redirect www to apex
    if (url.hostname === "www.overnit.com") {
      url.hostname = "overnit.com";
      return Response.redirect(url.toString(), 301);
    }

    // Let assets binding handle static files
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler;
