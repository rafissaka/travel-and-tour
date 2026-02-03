/**
 * Basic HTML Sanitization Utility
 * 
 * Provides basic protection against XSS by removing dangerous tags and attributes.
 * For production applications with rich text, consider using a library like DOMPurify.
 */

export function sanitizeHtml(html: string): string {
    if (!html) return '';

    return html
        // Remove script tags and their content
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
        // Remove iframe, object, embed, applet
        .replace(/<(iframe|object|embed|applet)\b[^>]*>([\s\S]*?)<\/\1>/gim, "")
        // Remove event handlers (e.g., onclick, onload)
        .replace(/ on\w+="[^"]*"/gim, "")
        .replace(/ on\w+='[^']*'/gim, "")
        // Remove javascript: protocol in links
        .replace(/href=["']javascript:[^"']*["']/gim, 'href="#"');
}
