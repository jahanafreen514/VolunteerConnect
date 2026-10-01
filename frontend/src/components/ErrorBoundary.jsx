import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Automatically auto-heal chunk loading mismatches caused by fresh deployments
    const msg = String(error?.message || '');
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Expected a JavaScript-or-Wasm module script') ||
      msg.includes('text/html') ||
      msg.includes('MIME type')
    ) {
      if (!sessionStorage.getItem('vc_eb_chunk_retry')) {
        sessionStorage.setItem('vc_eb_chunk_retry', 'true');
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center text-[#354052] relative z-10">
          <div className="pastel-card p-8 border border-[#E6E8EC] rounded-3xl max-w-md shadow-soft-md flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F2D6DD] text-[#9B5B65] flex items-center justify-center mb-4 text-xl font-bold border border-[#F2D6DD]">
              !
            </div>
            <h1 className="text-xl font-bold text-[#354052] mb-2">Something went wrong</h1>
            <p className="text-[#667085] max-w-sm mb-6 text-xs leading-relaxed">
              The application encountered an unexpected issue while rendering this page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  sessionStorage.removeItem('vc_eb_chunk_retry');
                  sessionStorage.removeItem('vc_chunk_refreshed');
                  window.location.reload();
                }}
                className="btn-primary-pastel text-xs font-semibold px-4 py-2.5 shadow-soft-sm"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="btn-secondary-pastel text-xs font-semibold px-4 py-2.5"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
