import { useEffect, useState } from 'react';

export const useQueryParams = () => {
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if we're inside an iframe
    const isInIframe = window !== window.parent;

    function getQueryParams() {
      let search = '';

      if (isInIframe) {
        try {
          search = window.parent.location.search;
        } catch (error) {
          console.error('Cannot access parent location:', error);
          search = '';
        }
      } else {
        search = window.location.search;
      }

      const params = new URLSearchParams(search);
      const entries = Array.from(params.entries());
      return Object.fromEntries(entries);
    }

    function handleUrlChange() {
      setQueryParams(getQueryParams());
    }

    // Initial fetch of query parameters
    handleUrlChange();

    // Set up polling to detect URL changes in the parent page
    let lastSearch = '';
    const intervalId = setInterval(() => {
      const currentSearch = isInIframe ? window.parent.location.search : window.location.search;
      if (currentSearch !== lastSearch) {
        lastSearch = currentSearch;
        handleUrlChange();
      }
    }, 1000); // Adjust interval as needed

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return queryParams;
};
