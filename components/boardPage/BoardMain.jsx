import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator } from '@react-navigation/native-stack';
import BoardHome from './BoardHome';
import BoardList from './BoardList';
import BoardForm from './BoardForm';
import BoardView from './BoardView';

const Stack = createNativeStackNavigator();

const BoardMain = (props) => {
    const {navTheme,navHeader} = props

    return (
        <NavigationContainer theme={navTheme}>
            <Stack.Navigator initialRouteName="Home" screenOptions={navHeader}>
                <Stack.Screen name="Home" component={BoardHome} options={{ headerShown: false }}/>
                <Stack.Screen name="List" component={BoardList}/>
                <Stack.Screen name="Form" component={BoardForm}/>
                <Stack.Screen name="View" component={BoardView}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default BoardMain;