import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import backImg from '../../assets/burger/up_arrow.png'
import addImg from '../../assets/burger/add.png'
import mapIcon from '../../assets/burger/map.png'
import MapModal from '../MapModal';


const HamburgerStore = (props) => {

    const {onBack,navigation,onStore,onLoading,type,onAlert,burgerDTO,updateBool} = props

    const [stores,setStores] = useState([])
    const [search,setSearch] = useState('')
    const [upStoreSeq,setUpStoreSeq] = useState(-1)

    ///////////////////지도모달/////////////////
    const [storeTouch,setStoreTouch] = useState(true)
    const [mapModal,setMapModal] = useState(false)
    const [mapDTO,setMapDTO] = useState({
        longitude : 0,
        latitude : 0,
        name : '',
        address : '',
        placeUrl : '',
    })

    const onMapPlace = (data) => {
        setMapDTO({
            longitude:data.longitude,
            latitude:data.latitude,
            name:data.name,
            address:data.address,
            placeUrl:data.placeUrl
        })
        setMapModal(true)
    }

    const onClose = () => {
        setMapModal(false) 
    }
    /////////////////////////////////////////////

    useEffect(() => {
        onLoading(true)
        axios.get(`https://hameat.onrender.com/store/list/${type}`)
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
            axios.get(`https://hameat.onrender.com/store/list/${type}`)
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


    useEffect(() => {
        if(updateBool && burgerDTO.storeSeq !== -1 && upStoreSeq === -1) {
            setUpStoreSeq(burgerDTO.storeSeq)
        }
    },[burgerDTO])

    return (
        <View>
            <View style={{height: '7%',justifyContent: 'center'}}>
            <Pressable onPress={() => onBack()}>
                <Image source={backImg} style={{height:'95%',aspectRatio: 1/1, alignSelf:'center'}}/>
            </Pressable>
            </View>
            <View style={{height: '8%',justifyContent: 'center'}}>
            <TextInput value={search} onChangeText={(text) => setSearch(text)} 
                style={styles.searchBox} placeholder='가게 검색'/>
            </View>
            <ScrollView style={styles.storeList}>
                {stores.filter(str => str.name.includes(search)).map((item, index) => <Pressable key={index} 
                    onPress={() => storeTouch && onStore(item.storeSeq)} style={({pressed})  => [styles.storeBut,
                        {backgroundColor: pressed ? 'whitesmoke' : upStoreSeq === item.storeSeq ? 'lightgray' : 'white'}
                    ]}>
                    <Text style={styles.storeTxt}>{item.name}</Text>
                    {type === 1 && <Pressable
                        style={{paddingHorizontal:10}}
                        onPress={() => onMapPlace(item)}
                        onPressIn={() => setStoreTouch(false)}
                        onPressOut={() => setStoreTouch(true)}>
                        <Image source={mapIcon} style={{width: 27,height: 27}}/>
                    </Pressable>}
                </Pressable>)}
            {type === 1 &&
                <Pressable
                    style={({pressed}) => [styles.addBut, {elevation: pressed ? 2 : 5}]}
                    onPress={() => navigation.navigate('Add',{ type : type })}>
                    <Text style={{fontSize: 16,fontWeight: 'bold',color: 'darkgray',verticalAlign:'middle'}}>매장 추가</Text>
                    <Image source={addImg} style={{width: 30, height: 30}}/>
                </Pressable>}
            </ScrollView>
            <Modal
                animationType="fade"
                visible={mapModal}
                transparent={true}>
                    <MapModal mapDTO={mapDTO} onClose={onClose}/>
            </Modal>
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
        flexDirection: 'row',
        padding: 20
    },
    storeTxt : {
        fontSize: 20
    },
    searchBox : {
        borderRadius: 5,
        backgroundColor: '#e5e5e5',
        color:'#505050',
        height: 40,
        fontSize: 18,
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
        marginVertical: 10,
        paddingHorizontal: '20%',
        borderRadius: 10,
        shadowColor: '#000',
        alignSelf: 'center'
    }
});

export default HamburgerStore