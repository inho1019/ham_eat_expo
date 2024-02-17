import React, { useEffect, useState } from 'react';
import { Image, Keyboard, Modal, StyleSheet, View } from 'react-native';
import { DefaultTheme } from '@react-navigation/native';
import NavBar from './NavBar';
import Main from './mainPage/Main';
import HamburgerMain from './hamburgerPage/HamburgerMain';
import { useAppContext } from './api/ContextAPI';
import UserMain from './userPage/UserMain';
import loadingImg from '../assets/loading.gif'
import UserMypageMain from './userPage/UserMypageMain';
import BoardMain from './boardPage/BoardMain';

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
     
         return () => {
           keyShowListner.remove();
           keyHideListner.remove();
         };
       }, []);
     ///////////////////////////////////////////

    return (
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
            <View style={{height: key ? 0 : '8%',overflow:'hidden',opacity: key ? 0 : 1}}>
                <NavBar onPage={onPage} page={state.page}/>
            </View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={state.loading}>
                <View style={styles.modalView}>
                    <Image source={loadingImg} style={{width:100,height:100}}/>
                </View>
            </Modal>
        </View>
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
    }
});

export default Index