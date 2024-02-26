import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator } from '@react-navigation/native-stack';
import HamburgerHome from './HamburgerHome';
import HamburgerForm from './HamburgerForm';
import HamburgerList from './HamburgerList';
import HamburgerView from './HamburgerView';
import HamburgerMap from './HamburgerMap';

const Stack = createNativeStackNavigator();

const HamburgerMain = (props) => {
    const {navTheme,navHeader} = props

    return (
        <NavigationContainer theme={navTheme}>
            <Stack.Navigator initialRouteName="Home" screenOptions={navHeader}>
                <Stack.Screen name="Home" component={HamburgerHome} options={{ headerShown: false }}/>
                <Stack.Screen name="Form" component={HamburgerForm} options={{ headerTitle: '버거 등록'}}/>
                <Stack.Screen name="Update" component={HamburgerForm} options={{ headerTitle: '버거 수정'}}/>
                <Stack.Screen name="Add" component={HamburgerMap} options={{ headerTitle: '등록'}}/>
                <Stack.Screen name="List" component={HamburgerList}/>
                <Stack.Screen name="View" component={HamburgerView}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default HamburgerMain;