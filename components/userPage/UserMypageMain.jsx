import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator } from '@react-navigation/native-stack';
import UserPage from './UserPage';
import HamburgerAdd from '../hamburgerPage/HamburgerAdd';
import HamburgerMap from '../hamburgerPage/HamburgerMap';
import HamburgerList from '../hamburgerPage/HamburgerList';
import BoardList from '../boardPage/BoardList';
import HamburgerRating from '../hamburgerPage/HamburgerRating';

const Stack = createNativeStackNavigator();

const UserMypageMain = (props) => {
    const {navTheme,navHeader} = props

    return (
        <NavigationContainer theme={navTheme}>
        <Stack.Navigator initialRouteName="Page" screenOptions={navHeader}>
            <Stack.Screen name="Page" component={UserPage} options={{ headerShown: false }}/>
            <Stack.Screen name="Add" component={HamburgerAdd} options={{ headerTitle: '등록'}}/>
            <Stack.Screen name="Map" component={HamburgerMap} options={{ headerTitle: '등록'}}/>
            <Stack.Screen name="BurgerList" component={HamburgerList}/>
            <Stack.Screen name="BoardList" component={BoardList}/>
            <Stack.Screen name="RatingList" component={HamburgerRating}/>
        </Stack.Navigator>
    </NavigationContainer>
    );
};

export default UserMypageMain;