// NetworkProvider.js
import React, {createContext, useState, useEffect, useContext} from 'react';
import NetInfo from '@react-native-community/netinfo';
import NoInternetConnection from './NoInternetConnection'; // Adjust the path

// Create context
const NetworkContext = createContext({isConnected: true});

export const useNetwork = () => useContext(NetworkContext);

export const NetworkProvider = ({children}) => {
  const [isConnected, setIsConnected] = useState(true);

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected);
    
    return state.isConnected;
  };

  useEffect(() => {
    // Check connection on mount
    checkConnection();

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NetworkContext.Provider value={{isConnected, checkConnection}}>
      {children}
      {!isConnected && <NoInternetConnection onRetry={checkConnection} />}
    </NetworkContext.Provider>
  );
};

export default NetworkProvider;
