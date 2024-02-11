import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator } from '@react-navigation/native-stack';
import UserPage from './UserPage';
import HamburgerAdd from '../hamburgerPage/HamburgerAdd';
import HamburgerMap from '../hamburgerPage/HamburgerMap';

const Stack = createNativeStackNavigator();

const UserMypageMain = (props) => {
    const {navTheme} = props

    return (
        <NavigationContainer theme={navTheme}>
        <Stack.Navigator initialRouteName="Page">
            <Stack.Screen name="Page" component={UserPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Add" component={HamburgerAdd} options={{ headerTitle: '등록'}}/>
            <Stack.Screen name="Map" component={HamburgerMap} options={{ headerTitle: '등록'}}/>
        </Stack.Navigator>
    </NavigationContainer>
    );
};

export default UserMypageMain;