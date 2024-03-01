import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Keyboard, Linking, Modal, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { DefaultTheme } from '@react-navigation/native';
import NavBar from './NavBar';
import Main from './mainPage/Main';
import HamburgerMain from './hamburgerPage/HamburgerMain';
import { useAppContext } from './api/ContextAPI';
import UserMain from './userPage/UserMain';
import loadingImg from '../assets/loading.gif'
import UserMypageMain from './userPage/UserMypageMain';
import BoardMain from './boardPage/BoardMain';
import axios from 'axios';

const Index = () => {
    const navTheme = {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: 'white',
        },
    };
    
    const navHeader = {
        headerTitleStyle: { fontFamily: 'esamanruMedium'},
    };
    
    const { state, dispatch } = useAppContext();

    const onPage = (num) => {
        dispatch({ type: 'SET_PAGE' , payload : num });
    };

    const onAlertTxt = (txt) => {
        dispatch({ type: 'SET_ALERTTXT' , payload : txt });
    }
    /////////////////////////////////////////////
    const navref = useRef(new Animated.Value(1)).current;

    const aniNav = (num) => {
        Animated.timing(navref, {
            toValue: num,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          }).start();
    }

    ///////////////////////////////////////////////
    useEffect(()=> {
        if(state.alertTxt !== '') {
            const timeoutId = setTimeout(() => {
                onAlertTxt('')
            }, 2000)
            
            return () => clearTimeout(timeoutId);
        }
    },[state.alertTxt])
    
    /////////// 키보드 활성화 여부 확인////////
    const [key,setKey] = useState(false)
    
    useEffect(() => {
        const keyShow = () => {
            setKey(true)
        };
        
        const keyHide = () => {
            setKey(false)
        };
        
        const keyShowListner = Keyboard.addListener('keyboardDidShow', keyShow);
        const keyHideListner = Keyboard.addListener('keyboardDidHide', keyHide);

        axios.get(`https://hameat.onrender.com/vari/get/version`)
        .then(res => {
            if(res.data !== state.version) {
                onAlertTxt('업데이트가 존재합니다')
                setTimeout(() => {
                    Linking.openURL('https://play.google.com/store/apps/details?id=com.burger.HamEat')
                },2000)
            }
        })
        
        return () => {
            keyShowListner.remove();
            keyHideListner.remove();
        };
    }, []);
    ///////////////////////////////////////////
    useEffect(() => {
        if(key) aniNav(0.7)
        else aniNav(1)
    },[key])
    
    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} disabled={!key}>
            <View style={styles.container}>
                <View style={[styles.screenContainer,{height: '92%'}]}>
                    {
                        state.page === 0 && <Main navTheme={navTheme} navHeader={navHeader}/>
                    }
                    {
                        state.page === 1 && <HamburgerMain navTheme={navTheme} navHeader={navHeader}/>
                    }
                    {
                        state.page === 2 && <BoardMain navTheme={navTheme} navHeader={navHeader}/>
                    }
                    {
                        state.page === 3 && <UserMain navTheme={navTheme} navHeader={navHeader}/>
                    }
                    {
                        state.page === 4 && <UserMypageMain navTheme={navTheme} navHeader={navHeader}/>
                    }
                </View>
                <View style={{height: '8%'}}>
                    <NavBar onPage={onPage} page={state.page} navref={navref}/>
                </View>
                <Modal
                    animationType="fade"
                    transparent={true}
                    visible={state.loading}>
                    <View style={styles.modalView}>
                        <Image source={loadingImg} style={{width:100,height:100}}/>
                    </View>
                </Modal>
                <Modal
                    animationType="fade"
                    visible={state.alertTxt !== ''}
                    transparent={true}>
                    <TouchableWithoutFeedback onPress={() => dispatch({ type: 'SET_ALERTTXT', payload: '' })}>
                        <View style={{flex:1,flexDirection:'column-reverse'}}>
                            <View style={styles.alert}>
                                <Text style={styles.alertTxt}>{state.alertTxt}</Text>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container : {
        flex: 1,
    },
    screenContainer : {
        height: '92%'
    },
    ///////////alert///////////
    alert : {
        padding: 10,
        marginBottom: 70,
        borderRadius: 10,
        width: '95%',
        alignSelf: 'center',
        backgroundColor: '#666666',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    alertTxt : {
        color: 'whitesmoke',
        textAlign: 'center',
    },
});

export default Index