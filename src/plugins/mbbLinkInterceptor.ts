/**
 * 🐱 Anymd Plugin Core - MBB Link Interceptor 🐱
 *
 *    /\_/\
 *   ( o.o )
 *    > ^ <  meow!
 *
 * Intercepts mbb:// and web+mbb:// URI protocols to route them to the internal MBB plugin bundle/actions
 * without triggering page reloads.
 */

export const MBB_ACTION_EVENT = 'mbb-action';

export interface MbbActionPayload {
  protocol: 'mbb:' | 'web+mbb:';
  action: string;
  params: Record<string, string>;
  originalUri: string;
}

/**
 * Parses mbb:// or web+mbb:// URIs into structured action and parameters
 */
export function parseMbbUri(uri: string): MbbActionPayload | null {
  try {
    const cleanUri = uri.trim();
    if (!cleanUri.startsWith('mbb://') && !cleanUri.startsWith('web+mbb://')) {
      return null;
    }

    const protocol = cleanUri.startsWith('mbb://') ? 'mbb:' : 'web+mbb:';
    
    // For parsing using URL API, substitute protocol to http temporary
    let parseableUrl = cleanUri;
    if (protocol === 'mbb:') {
      parseableUrl = cleanUri.replace('mbb://', 'http://mbb-action/');
    } else {
      parseableUrl = cleanUri.replace('web+mbb://', 'http://mbb-action/');
    }

    const url = new URL(parseableUrl);
    let action = url.hostname;
    let path = url.pathname;

    if (action === 'mbb-action') {
      const segments = path.split('/').filter(Boolean);
      action = segments[0] || 'default';
      path = '/' + segments.slice(1).join('/');
    }

    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Extract path variables if it is a shorthand routing (e.g., mbb://vault/school)
    const pathSegments = path.split('/').filter(Boolean);
    if (action === 'vault' || action === 'switch-vault' || action === 'switch') {
      if (pathSegments[0]) {
        params['vault'] = pathSegments[0];
      }
    } else if (pathSegments.length > 0) {
      params['path_param'] = pathSegments[0];
    }

    return {
      protocol,
      action,
      params,
      originalUri: uri
    };
  } catch (error) {
    console.error('Failed to parse MBB URI:', error);
    return null;
  }
}

/**
 * Routes the parsed payload to internal actions
 */
export function routeMbbAction(payload: MbbActionPayload): void {
  console.log('Routing MBB action:', payload);
  
  // Dispatch a CustomEvent for the React application to listen to
  const event = new CustomEvent(MBB_ACTION_EVENT, { detail: payload });
  window.dispatchEvent(event);

  // If a global bundle/handler is registered, call it directly
  if (typeof (window as any).mbbPluginBundle?.handleAction === 'function') {
    (window as any).mbbPluginBundle.handleAction(payload);
  }
}

/**
 * Global click interceptor to catch any clicked markdown or external links
 */
export function setupLinkInterceptor(): () => void {
  const handleLinkClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    if (href.startsWith('mbb://') || href.startsWith('web+mbb://')) {
      event.preventDefault();
      const parsed = parseMbbUri(href);
      if (parsed) {
        routeMbbAction(parsed);
      }
    }
  };

  document.addEventListener('click', handleLinkClick, true);

  // Handle page load if URI protocol is passed in query string (e.g. web+mbb redirection)
  const handleInitialQuery = () => {
    const params = new URLSearchParams(window.location.search);
    const customUri = params.get('uri');
    if (customUri && (customUri.startsWith('mbb://') || customUri.startsWith('web+mbb://'))) {
      const parsed = parseMbbUri(customUri);
      if (parsed) {
        routeMbbAction(parsed);
      }
    }
  };

  if (document.readyState === 'complete') {
    handleInitialQuery();
  } else {
    window.addEventListener('load', handleInitialQuery);
  }

  // Register protocol handler if supported
  if (typeof navigator !== 'undefined' && navigator.registerProtocolHandler) {
    try {
      navigator.registerProtocolHandler(
        'web+mbb',
        window.location.origin + window.location.pathname + '?uri=%s',
        'myBlackbox Deep Link Handler'
      );
    } catch (e) {
      console.warn('Protocol handler registration failed:', e);
    }
  }

  return () => {
    document.removeEventListener('click', handleLinkClick, true);
    window.removeEventListener('load', handleInitialQuery);
  };
}
