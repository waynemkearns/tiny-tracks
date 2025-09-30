import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function RegisterSW() {
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  
  // Register service worker
  const {
    updateServiceWorker,
    offlineReady: swOfflineReady,
    needRefresh: swNeedRefresh,
    loading,
  } = useRegisterSW({
    onOfflineReady() {
      setOfflineReady(true);
      toast({
        title: 'App ready for offline use',
        description: 'TinyTracks can now be used without an internet connection',
      });
      
      // Auto-hide offline ready toast after 3 seconds
      setTimeout(() => setOfflineReady(false), 3000);
    },
    onNeedRefresh() {
      setNeedRefresh(true);
    },
    onRegistered(r) {
      console.log('Service worker registered');
    },
    onRegisterError(error) {
      console.error('Service worker registration error', error);
    },
  });

  // Update service worker and refresh page
  const update = () => {
    updateServiceWorker(true);
  };
  
  // Effects to sync state
  useEffect(() => {
    setOfflineReady(swOfflineReady);
  }, [swOfflineReady]);
  
  useEffect(() => {
    setNeedRefresh(swNeedRefresh);
  }, [swNeedRefresh]);
  
  // Don't render anything if no notifications are needed
  if (!offlineReady && !needRefresh) {
    return null;
  }
  
  return (
    <div className="fixed bottom-20 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 pointer-events-auto max-w-md mx-4">
        {offlineReady && (
          <div className="flex items-center">
            <div className="mr-3 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div>
              <p className="font-medium">App ready for offline use</p>
              <p className="text-sm text-gray-500">You can use TinyTracks without internet</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-3"
              onClick={() => setOfflineReady(false)}
            >
              Close
            </Button>
          </div>
        )}
        
        {needRefresh && (
          <div className="flex items-center">
            <div className="mr-3 text-blue-500">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium">New version available</p>
              <p className="text-sm text-gray-500">Update to access the latest features</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-3"
              onClick={() => setNeedRefresh(false)}
            >
              Later
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="ml-2"
              onClick={update}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
