import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useWishlistStore } from '@/stores/wishlistStore';

/**
 * Custom hook to manage wishlist data fetching
 * Ensures only one API call is made regardless of how many components use it
 */
export function useWishlist() {
  const { user, isLoaded } = useUser();
  const {
    items,
    isLoading,
    setItems,
    setLoading,
    setLastFetched,
    shouldRefetch,
    clearWishlist,
    isInWishlist,
    getWishlistItemId,
  } = useWishlistStore();

  // Track if a fetch is in progress to prevent duplicate calls
  const fetchingRef = useRef(false);

  useEffect(() => {
    const fetchWishlist = async () => {
      // Don't fetch if already fetching
      if (fetchingRef.current) return;

      // Don't fetch if user is not loaded or not authenticated
      if (!isLoaded || !user) {
        if (isLoaded && !user) {
          // User is logged out, clear wishlist
          clearWishlist();
        }
        return;
      }

      // Don't fetch if we have recent data
      if (!shouldRefetch()) {
        return;
      }

      fetchingRef.current = true;
      setLoading(true);

      try {
        const response = await fetch('/api/wishlist');
        if (response.ok) {
          const data = await response.json();
          // Handle both direct array and wrapped response
          const wishlistItems = Array.isArray(data) ? data : (data.data || []);
          setItems(wishlistItems);
          setLastFetched();
        } else if (response.status === 401) {
          // User is not authenticated, clear wishlist
          clearWishlist();
        } else if (response.status === 429) {
          // Rate limited - don't clear data, just log
          console.warn('Wishlist API rate limited, using cached data');
        }
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        // Don't clear data on network errors
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    };

    fetchWishlist();
  }, [isLoaded, user, shouldRefetch, setItems, setLoading, setLastFetched, clearWishlist]);

  return {
    items,
    isLoading,
    isInWishlist,
    getWishlistItemId,
    refetch: () => {
      // Force a refetch by clearing the timestamp
      useWishlistStore.setState({ lastFetched: null });
    },
  };
}
