import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator } from '@react-navigation/native-stack';
import UserLogin from './UserLogin';
import UserRegister from './UserRegister';

const Stack = createNativeStackNavigator();

const UserMain = (props) => {
    const {navTheme,navHeader} = props

    return (
        <NavigationContainer theme={navTheme}>
            <Stack.Navigator initialRouteName="Login" screenOptions={navHeader}>
                <Stack.Screen name="Login" component={UserLogin} options={{ headerShown: false }}/>
                <Stack.Screen name="Register" component={UserRegister} options={{ headerTitle: '회원가입' }}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default UserMain;