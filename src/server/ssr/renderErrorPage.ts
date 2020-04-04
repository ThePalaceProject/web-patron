function renderErrorPage(message = "There was a problem with this request.") {
  return `
      <!doctype html>
      <html lang="en">
        <head>
          <title>Error</title>
        </head>
        <body>
          <div style="text-align: center; margin-top: 200px;">
            <h1>${message}</h1>
            <br />
            <h3><a class="btn btn-lg btn-primary" href="/">Home Page</a></h3>
          </div>
        </body>
      </html>
      `;
}

export default renderErrorPage;
