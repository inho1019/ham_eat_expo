import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import backImg from '../../assets/burger/up_arrow.png'
import addImg from '../../assets/burger/add.png'


const HamburgerStore = (props) => {

    const {onBack,navigation,onStore,onLoading,type,onAlert} = props

    const [stores,setStores] = useState([])
    const [search,setSearch] = useState('')

    useEffect(() => {
        onLoading(true)
        axios.get(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/store/list/${type}`)
        .then(res => {
            setStores(res.data)
            onLoading(false)
        })
        .catch(() => {
            onAlert('불러오기 중 에러발생')
            onLoading(false)
        })

    },[type])

    useEffect(() => {
        onLoading(true)
        const unsubscribe = navigation.addListener('focus', () => {
            axios.get(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/store/list/${type}`)
            .then(res => {
                setStores(res.data)
                onLoading(false)
            })
            .catch(() => {
                onAlert('불러오기 중 에러발생')
                onLoading(false)
            })
        });
        return unsubscribe;
      }, [navigation,type]);

    return (
        <View>
            <View style={{height: '7%',justifyContent: 'center'}}>
            <Pressable onPress={() => onBack()}>
                <Image source={backImg} style={{height:'95%',aspectRatio: 1/1, alignSelf:'center'}}/>
            </Pressable>
            </View>
            <View style={{height: '8%',justifyContent: 'center',borderBottomWidth : 2,borderColor: 'lightgray',}}>
            <TextInput value={search} onChangeText={(text) => setSearch(text)} 
                style={styles.searchBox} placeholder='가게 검색'/>
            </View>
            <ScrollView style={styles.storeList}>
                {stores.filter(str => str.name.includes(search)).map((item, index) => <Pressable key={index} 
                    onPress={() => onStore(item.storeSeq)} style={({pressed})  => [styles.storeBut,
                        {backgroundColor: pressed ? 'whitesmoke' : 'white'}
                    ]}>
                    <Text style={styles.storeTxt}>{item.name}</Text>
                </Pressable>)}
            {type === 1 &&
            <Pressable
                style={({pressed}) => [styles.addBut, {elevation: pressed ? 2 : 5}]}
                onPress={() => navigation.navigate('Add',{ type : type })}>
                <Text style={{fontSize: 16,fontWeight: 'bold',color: 'darkgray',verticalAlign:'middle'}}>매장 추가</Text>
                <Image source={addImg} style={{width: 30, height: 30}}/>
            </Pressable>}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    storeList: {
        height: '85%',
    },
    storeBut : {
        borderBottomWidth: 2,
        borderBottomColor: 'lightgray',
        padding: 20
    },
    storeTxt : {
        fontSize: 20
    },
    searchBox : {
        borderWidth: 2,
        borderRadius: 15,
        fontSize: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: 'center',
        width: '95%',
        overflow:'hidden'
    },
    addBut : {
        flexDirection:'row',
        justifyContent:'center',
        backgroundColor: 'whitesmoke',
        marginHorizontal: 10,
        marginVertical: 5,
        paddingHorizontal: '20%',
        borderRadius: 10,
        shadowColor: '#000',
        alignSelf: 'center'
    }
});

export default HamburgerStore