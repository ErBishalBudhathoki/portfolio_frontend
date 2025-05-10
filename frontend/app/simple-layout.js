export function SimpleLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Portfolio Frontend - Redirecting to Backend</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f7f9fc;
            color: #333;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            text-align: center;
          }
          h1 {
            font-size: 32px;
            margin-bottom: 16px;
            color: #2d3748;
          }
          p {
            margin-bottom: 24px;
            font-size: 18px;
            color: #4a5568;
          }
          .card {
            background-color: white;
            border-radius: 8px;
            padding: 32px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 32px;
          }
          .button {
            display: inline-block;
            background-color: #4299e1;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            transition: background-color 0.3s;
            border: none;
            cursor: pointer;
            font-size: 16px;
          }
          .button:hover {
            background-color: #3182ce;
          }
          .link {
            color: #4299e1;
            text-decoration: none;
          }
          .link:hover {
            text-decoration: underline;
          }
          .status {
            display: inline-block;
            margin-top: 16px;
            font-size: 16px;
            color: #718096;
          }
        </style>
        <script src="/simple.js" defer></script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
} 