import React from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import searchIcon from '../../assets/main/search.png'
import logo from '../../assets/main/logo.png'
import Map from '../Map';

const Home = (props) => {
    const{navigation} = props 

    return (
        <View style={{flex:1}}>
            <View style={{borderBottomColor: 'whitesmoke', borderBottomWidth: 10,paddingBottom: 10}}>
                <Image source={logo} style={styles.logo}/>
            </View>
            <Text style={styles.h2}>통합 검색</Text>
            <View style={styles.searchContainer}>
                <TextInput 
                    style={styles.searchBox}
                    onSubmitEditing={() => navigation.navigate('Search')}
                />
                <Pressable onPress={() => navigation.navigate('Search')}>
                    <Image source={searchIcon} style={styles.searchIcon}/>
                </Pressable>
            </View>
            <Text style={styles.h2}>주변 매장</Text>
            <Map type={0}/>
        </View>
    );
};

const styles = StyleSheet.create({
    logo : {
        height: 30,
        aspectRatio: 1300/288,
        marginLeft: 10,
        marginTop: 5,
    },
    h2 : {
        fontSize: 25,
        fontWeight: 'bold',
        margin: '2%'
    },
    searchContainer : {
        marginVertical: 5,
        flexDirection: 'row',
        justifyContent:'space-evenly'
    },
    searchBox : {
        borderWidth: 2,
        borderRadius: 5,
        height: 40,
        fontSize: 20,
        paddingLeft: 10,
        paddingRight: 10,
        width: '80%',
        overflow:'hidden'
    },
    searchIcon : {
        width: 30,
        height: 30,
        margin: 5
    },
});

export default Home