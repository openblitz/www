import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Get theme from cookie
  const theme = event.cookies.get('theme') || 'system';
  
  return await resolve(event, {
    transformPageChunk: ({ html }) => {
      // Add theme class to html element based on cookie
      if (theme === 'light') {
        return html.replace('<html lang="en">', '<html lang="en" class="light">');
      } else if (theme === 'dark') {
        return html.replace('<html lang="en">', '<html lang="en" class="dark">');
      }
      // For 'system', don't add any class - CSS will handle it
      return html;
    }
  });
};
