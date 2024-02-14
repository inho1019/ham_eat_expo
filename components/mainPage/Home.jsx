import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import searchIcon from '../../assets/main/search.png'
import logo from '../../assets/main/logo.png'
import Map from '../Map';

const Home = (props) => {
    const{navigation} = props 

    const [search,setSearch] = useState('')

    const [mapStop,setMapStop] = useState(false)

    useEffect(()=>{
        const unsubscribe = navigation.addListener('focus', () => {
            setMapStop(false)
        })
        unsubscribe;
    },[navigation])

    const onSearch = () => {
        setMapStop(true)
        requestAnimationFrame(() => navigation.navigate('Search', { search : search }))
    }

    const onMapSearch = (txt) => {
        setMapStop(true)
        requestAnimationFrame(() => navigation.navigate('Search', { search : txt }))
    } 

    return (
        <View style={{flex:1}}>
            <View style={{borderBottomColor: 'whitesmoke', borderBottomWidth: 20,paddingBottom: 10}}>
                <Image source={logo} style={styles.logo}/>
            </View>
            <Text style={styles.h2}>통합 검색</Text>
            <View style={styles.searchContainer}>
                <TextInput 
                    value={search}
                    style={styles.searchBox}
                    onChangeText={(text) => setSearch(text)}
                    onSubmitEditing={onSearch}
                />
                <Pressable onPress={onSearch}>
                    <Image source={searchIcon} style={styles.searchIcon}/>
                </Pressable>
            </View>
            <Text style={styles.h2}>주변 매장</Text>
            {!mapStop && <Map type={0} onMapSearch={onMapSearch}/>}
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
        marginHorizontal: '2%',
        marginTop: 10,
        marginBottom: 5
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