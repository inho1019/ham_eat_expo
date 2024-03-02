import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import HamburgerList from '../hamburgerPage/HamburgerList';
import BoardList from '../boardPage/BoardList';
import max from '../../assets/main/max.png'
import min from '../../assets/main/min.png'
import Map from '../Map';
import HamburgerRating from '../hamburgerPage/HamburgerRating';

const Search = (props) => {
    const { route,navigation } = props

    const [ani,setAni] = useState(1)

    const [aning,setAning] = useState(false)

    ///////////// 애니메이션//////////////
    const searchAni = useRef(new Animated.Value(1)).current;

    const aniSearch = (num) => {
        setAning(true)
        Animated.timing(searchAni, {
            toValue: num,
            duration: 500,
            useNativeDriver: false,
            easing: Easing.out(Easing.ease)
        }).start(() => setAning(false));
    }

    const boardHeight = {
        height: searchAni.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['0%','18%','55%'],
        }),
    };
    const burgerHeight = {
        height: searchAni.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['55%','37%','0%'],
        }),
    };
    /////////////state/////////////////////////

    useEffect(() => {
        navigation.setOptions({
            title: route.params?.search
        });
    },[route])

    const onBoard = () => {
        if(ani !== 2) {
            aniSearch(2)
            setAni(2)
        } else {
            aniSearch(1)
            setAni(1)
        }
    }

    const onBurger = () => {
        if(ani !== 0) {
            aniSearch(0)
            setAni(0)
        } else {
            aniSearch(1)
            setAni(1)
        }
    }

    return (
        <View style={{flex:1,paddingHorizontal:5,paddingVertical:2}}>
            <View style={styles.h1Out}>
                <Text style={styles.h1}>게시판</Text>
                <Pressable
                    onPressIn={() => !aning && onBoard()}>
                    <Image source={ ani !== 2 ? max : min } style={{width: 26, height: 26}}/>
                </Pressable>
            </View>
            <Animated.View style={[boardHeight,{marginVertical: '1%'}]}>
                <BoardList navigation={navigation} searchParam={route.params?.search} route={route}/>
            </Animated.View>
            <View style={styles.h1Out}>
                <Text style={styles.h1}>햄버거</Text>
                <Pressable
                    onPressIn={() => !aning && onBurger()}>
                    <Image source={ ani !== 0 ? max : min  } style={{width: 26, height: 26}}/>
                </Pressable>
            </View>
            <Animated.View style={[burgerHeight,{marginVertical: '1%',overflow:'hidden'}]}>
                <HamburgerList navigation={navigation} searchParam={route.params?.search} route={route}/>
            </Animated.View>
            <View style={{flexDirection:'row'}}>
            <View style={{width:'50%'}}>
                <View style={styles.h1Out}>
                    <Text style={styles.h1}>매장</Text>
                </View>
                <View style={{height: '20%'}}>
                    <View style={{width:'100%',aspectRatio:1/1}}>
                        <Map type={3} searchParam={route.params?.search}/>
                    </View>
                </View>
            </View>
            <View style={{width:'50%'}}>
                <View style={styles.h1Out}>
                <Text style={styles.h1}>평가</Text>
                </View>
                <View style={{height: '20%'}}>
                    <View style={{width:'100%',aspectRatio:1/1}}>
                        <HamburgerRating navigation={navigation} searchData={route.params?.search} route={route}/>
                    </View>
                </View>
            </View>
            </View>
        </View>
    );
}; 

const styles = StyleSheet.create({
    h1Out : {
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'#e5e5e5',
        borderRadius: 5,
        paddingHorizontal: 5,
        marginHorizontal:5,
        paddingVertical:2,
    },
    h1 : {
        fontSize: 21,
        fontFamily:'esamanruMedium',
    },
})

export default Search