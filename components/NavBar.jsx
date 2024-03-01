import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, View } from 'react-native';
import home from '../assets/navbar/home_tab.png'
import burger from '../assets/navbar/burger_tab.png'
import board from '../assets/navbar/board_tab.png'
import mypage from '../assets/navbar/mypage_tab.png'
import { useAppContext } from './api/ContextAPI';

const NavBar = ({onPage, page, navref}) => {

    const screenWidth = Dimensions.get('window').width * 0.89;

    ///////////// 애니메이션//////////////
    const mvs = useRef(new Animated.Value(-(screenWidth/2.5))).current;

    useEffect(() => {
        Animated.timing(mvs, {
            toValue: page === 0 ? -(screenWidth/2.5) : page === 1 ? -(screenWidth/7.5) :  
                     page === 2 ? (screenWidth/7.5) : (screenWidth/2.5),
            duration: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          }).start();
    },[page])

    const { state } = useAppContext();

   
    return (
        <View style={styles.container}>
            <Animated.View style={[styles.moves, { transform: [{ translateX: mvs}] }]}/>
            <Pressable 
                onPress={()=> onPage(0)}
                style={styles.tabBut}>
                <Animated.Image source={home} style={[styles.tabImg,{ transform: [{ scale: navref }] }]}/>
            </Pressable>
            <Pressable 
                onPress={()=> onPage(1)}
                style={styles.tabBut}>
                <Animated.Image source={burger} style={[styles.tabImg,{ transform: [{ scale: navref }] }]}/>
            </Pressable>
            <Pressable 
                onPress={()=> onPage(2)}
                style={styles.tabBut}>
                <Animated.Image source={board} style={[styles.tabImg,{ transform: [{ scale: navref }] }]}/>
            </Pressable>
            <Pressable 
                onPress={()=> onPage(state.user.userSeq === -1 ? 3 : 4)}
                style={styles.tabBut}>
                <Animated.Image source={mypage} style={[styles.tabImg,{ transform: [{ scale: navref }] }]}/>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '1%',
        backgroundColor: 'white',
        borderRadius: 5,
        paddingHorizontal: '1%',
        paddingVertical: '1%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    tabBut: {
        height: '100%',
        width: '25%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },
    tabImg: {
        width:30, 
        height:30,
        opacity: 0.9
    },
    moves:{
        zIndex: 1,
        position : 'absolute',
        height: '100%',
        width: '25%',
        marginHorizontal: '1%',
        backgroundColor: 'gray',
        borderRadius: 5,
        opacity: 0.2
    }
});

export default NavBar;