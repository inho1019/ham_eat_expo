import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Home';
import Search from './Search';

const Stack = createNativeStackNavigator();

const Main = (props) => {
    const{ navTheme } = props

    return (
        <NavigationContainer theme={navTheme}>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={Home} options={{ headerShown: false }}/>
                <Stack.Screen name="Search" component={Search} options={{ headerTitle: '검색'}}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Main;