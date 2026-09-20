/**
 * Universal HTTP client with zero required dependencies.
 * Uses globalThis.fetch (native in Node.js 18+) with fallback to axios if available.
 */
let axiosInstance = null;
try {
  axiosInstance = require('axios');
} catch (e) {
  // axios not installed or optional, native fetch will be used
}

const httpGet = async (url, options = {}) => {
  const { params, headers = {}, timeout = 8000 } = options;

  let fullUrl = url;
  if (params && Object.keys(params).length > 0) {
    const urlObj = new URL(url);
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null) {
        if (typeof val === 'object') {
          if (Array.isArray(val)) {
            val.forEach(v => urlObj.searchParams.append(key, String(v)));
          } else {
            urlObj.searchParams.append(key, JSON.stringify(val));
          }
        } else {
          urlObj.searchParams.append(key, String(val));
        }
      }
    }
    fullUrl = urlObj.toString();
  }

  // 1. Try native fetch first (standard in Node 18, 20, 22, 24)
  if (typeof globalThis.fetch === 'function') {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), timeout) : null;

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          ...headers
        },
        signal: controller ? controller.signal : undefined
      });

      if (timer) clearTimeout(timer);

      const contentType = response.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }

      return {
        data,
        status: response.status,
        headers: response.headers
      };
    } catch (err) {
      if (timer) clearTimeout(timer);
      if (!axiosInstance) throw err;
    }
  }

  // 2. Fallback to axios if available
  if (axiosInstance) {
    return await axiosInstance.get(url, { params, headers, timeout });
  }

  throw new Error('No HTTP transport available (neither native fetch nor axios).');
};

module.exports = {
  httpGet
};
