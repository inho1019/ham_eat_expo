import { LogBox, StatusBar, SafeAreaView } from 'react-native';
import Index from './components/Index';
import { useEffect, useState } from 'react';
import { AppProvider } from './components/api/ContextAPI';

export default function App() {

  useEffect(() => {
    LogBox.ignoreLogs([
      'Non-serializable values were found in the navigation state',
    ]);
  }, [])

  return (
    <AppProvider style={{flex : 1}}>
      <Index/>
    </AppProvider>
  );
}
