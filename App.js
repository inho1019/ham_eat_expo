import { StatusBar, SafeAreaView } from 'react-native';
import Index from './components/Index';
import { AppProvider } from './components/api/ContextAPI';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';

export default function App() {

  const [fontLoad, setFontLoad] = useState(false);

    useEffect(() => {
        const loadFonts = async () => {
            await Font.loadAsync({
                'chab' : require('./assets/fonts/chab.ttf'),
                'esamanruMedium' : require('./assets/fonts/esamanruMedium.ttf'),
            });
            setFontLoad(true);
        };
        loadFonts();
    }, []);

    if (!fontLoad) {
        return null;
    }

  return (
    <AppProvider style={{flex : 1}}>
      <Index/>
    </AppProvider>
  );
}
