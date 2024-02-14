import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import HamburgerList from '../hamburgerPage/HamburgerList';
import BoardList from '../boardPage/BoardList';
import Map from '../Map';

const Search = (props) => {
    const { route,navigation } = props

    useEffect(() => {
        navigation.setOptions({
            title: route.params?.search
        });
    },[route])

    return (
        <View style={{flex:1,padding:5}}>
                <Text style={styles.h1}>게시판</Text>
            <View style={{height: '25%' ,zIndex: 10}}>
                <BoardList navigation={navigation} searchParam={route.params?.search}/>
            </View>
                <Text style={styles.h1}>햄버거</Text>
            <View style={{height: '35%' }}>
                <HamburgerList navigation={navigation} searchParam={route.params?.search} route={route}/>
            </View>
            <View style={{flexDirection:'row'}}>
            <View style={{width:'50%'}}>
                <Text style={styles.h1}>매장</Text>
                <View style={{height: '20%'}}>
                    <View style={{width:'100%',aspectRatio:1/1}}>
                        <Map type={3} searchParam={route.params?.search}/>
                    </View>
                </View>
            </View>
            <View style={{width:'50%'}}>
                <Text style={styles.h1}>평가</Text>
                <View style={{height: '20%'}}>
                    <View style={{width:'100%',aspectRatio:1/1}}>

                    </View>
                </View>
            </View>
            </View>
        </View>
    );
}; 

const styles = StyleSheet.create({
    h1 : {
        fontSize: 21,
        fontWeight: 'bold',
        backgroundColor:'white',
        marginHorizontal:5,
        borderBottomColor:'black',
        borderBottomWidth:2
    },
})

export default Search