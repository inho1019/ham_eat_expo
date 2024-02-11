import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import star from '../../assets/burger/star.png'
import starNone from '../../assets/burger/star_none.png'
import won from '../../assets/burger/won.png'
import { useAppContext } from '../api/ContextAPI';

const HamburgerList = (props) => {
    const {navigation,route} = props

    const windowWidth = Dimensions.get('window').width;

    const { dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

     /////////////alert애니메이션//////////////
     const [alertTxt,setAlertTxt] = useState('')

     useEffect(()=> {
         if(alertTxt !== '') {
             setTimeout(() => {
                 setAlertTxt('')
             }, 2000)
         }
     },[alertTxt])
     ////////////////////////////////////////////

    const [type,setType] = useState(-1)
    const [burgers,setBurgers] = useState([])
    const [stores,setStores] = useState([])
    const [ingres,setIngres] = useState([])
    const [ratings,setRatings] = useState([])
    const [strPick,setStrPick] = useState(-1)
    const [search,setSearch] = useState('')

    useEffect(()=>{
        navigation.setOptions({
            title: route.params?.type === 0 ? '프렌차이즈 버거 목록' : 
                   route.params?.type === 1 ? '수제 버거 목록' :  
                   route.params?.type === 2 ? 'DIY 버거 목록' : ''
        });
        onLoading(true)
        axios.get(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/rating/listType/${route.params?.type}`)
        .then(res => {
            setRatings(res.data)
            axios.get(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/ingre/list`)
            .then(res => {
                setIngres(res.data)
                axios.get(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/store/list/${route.params?.type}`)
                .then(res => {
                    setStores(res.data)
                    axios.get(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/burger/list/${route.params?.type}`)
                    .then(res => {
                        setBurgers(res.data)
                        onLoading(false)
                    }).catch(() => {
                        setAlertTxt('불러오기 중 에러발생')
                        onLoading(false)
                    })
                }).catch(() => {
                    setAlertTxt('불러오기 중 에러발생')
                    onLoading(false)
                })
            }).catch(() => {
                setAlertTxt('불러오기 중 에러발생')
                onLoading(false)
            })
        }).catch(() => {
            setAlertTxt('불러오기 중 에러발생')
            onLoading(false)
        })
        setType(route.params?.type)
    },[route])

    return (
        <View>
            <View style={{height: '8%',paddingTop:2,justifyContent: 'center',borderBottomWidth : 2,borderColor: 'lightgray',}}>
                <TextInput value={search} onChangeText={(text) => setSearch(text)} 
                    style={styles.searchBox} placeholder={type === 2 ? '버거 및 유저 검색' : '버거 및 가게 검색'}/>
            </View>
            {type !== 2 &&<ScrollView style={styles.storeBox} horizontal={strPick === -1 ? true : false}>
                {stores.filter(str => strPick !== -1 ? str.storeSeq === strPick : str.name.includes(search))
                    .map((item,index) => <Pressable key={index}
                    style={[styles.storesItem,{backgroundColor : item.storeSeq === strPick ? 'darkgray' : 'lightgray'}]}
                    onPress={() => strPick === -1 ? setStrPick(item.storeSeq) : setStrPick(-1)}
                    >
                    <Text style={{fontSize: 17}}>#{item.name} </Text>
                </Pressable>)}
            </ScrollView>}
            <FlatList
                style={styles.burgerFlat}
                data={burgers.filter(bgs => ( bgs[0].name.includes(search) ||
                                            search.includes(bgs[0].name) || 
                                            search.includes(bgs[0].content) || 
                                            (bgs[1] && search.includes(bgs[1].name)) || 
                                            (strPick === -1 && stores.filter(str => search.includes(str.name)).map(stt => stt.storeSeq).includes(bgs[0].storeSeq)))
                                            && (strPick >= 0 ? bgs[0].storeSeq === strPick : bgs)
                                            )}
                renderItem={(data) => {
                const makeDTO = JSON.parse(data.item[0].make)

                return <Pressable style={({pressed})  => [styles.burgerItem,{opacity : pressed ? 0.8 : 1,
                        borderTopColor: pressed ? 'whitesmoke' : 'white', height: data.index !== 0 ? 120 : type !== 2 ? 160 : 120,
                        paddingTop: (type !== 2 && data.index === 0) && 40}]} 
                        key={data.index} onPress={() => navigation.navigate('View', { burgerSeq : data.item[0].burgerSeq })}>
                        <View style={styles.makeContainer}>
                        {makeDTO.map((item,index) => {
                            const getIngre = ingres.find(ing => ing.ingreSeq === item)
                            return <Image key={index} style={
                                {width: data.item[0].size === 0 ? '50%' : data.item[0].size === 2 ? '90%' : '70%',
                                aspectRatio: getIngre.width / getIngre.height + 
                                    (data.item[0].size === 0 ? - 0.3 : data.item[0].size === 2 && + 0.4),
                                marginBottom: ((getIngre.type === 2 || getIngre.type === 3) && 
                                    getIngre.height > 170 ? -(windowWidth*0.07) : -(windowWidth*0.06)) + 
                                    (data.item[0].size === 0 ? + (windowWidth*0.0125) : data.item[0].size === 2 && + -(windowWidth*0.006)),
                                zIndex:-index,alignSelf: 'center'}}
                                source={{ uri : getIngre.image}}
                                resizeMode='stretch'/>
                            })}
                        <Image 
                        source={{ uri : ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                            ingres.find(ing => ing.ingreSeq === makeDTO[0]).image :
                            'https://codingdiary.s3.eu-west-2.amazonaws.com/burger/normal_bun.png'}} 
                            style={{width: data.item[0].size === 0 ? '50%' : data.item[0].size === 2 ? '90%' : '70%',alignSelf:'center',
                            aspectRatio: 500/(ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                            ingres.find(ing => ing.ingreSeq === makeDTO[0]).height : 160), 
                            zIndex: -makeDTO.length,marginTop: data.item[0].size === 0 ? 7 : data.item[0].size === 1 ? 3 : 0}} />
                    </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.itemName}>{data.item[0].name}</Text>
                        {type !== 2 && <Text style={styles.itemStore}>{stores.find(str => str.storeSeq === data.item[0].storeSeq) ? 
                        stores.find(str => str.storeSeq === data.item[0].storeSeq).name : '없는 매장'}</Text>}
                        {type === 2 && <Text style={styles.itemStore}>{data.item[1] ? data.item[1].name : '탈퇴 회원'}</Text>}{/* userSeq를 통한 유저명 가져오기 */}
                        {type !== 2 &&<View style={{flexDirection:'row',justifyContent:'center'}}>
                            <Image source={won} style={{width:23,height:23}}/>
                            <Text style={{textAlign:'center',verticalAlign:'middle',fontSize:15}}>&nbsp;{data.item[0].price}원</Text>
                        </View>}
                        <View style={[styles.starBox,{ width: type === 2 ? '80%' : '70%',margin: type === 2 ? 10 : 5 }]}>
                            <View style={[styles.starBack,{width : 
                                ratings.find(rat => rat[0].burgerSeq === data.item[0].burgerSeq) !== undefined &&
                                parseFloat(ratings.filter(rat => rat[0].burgerSeq === data.item[0].burgerSeq)
                                .reduce((acc, cur) => acc + cur[0].rate , 0)) * 20 / 
                                ratings.filter(rat => rat[0].burgerSeq === data.item[0].burgerSeq).length + '%'}]}/>
                            <Image source={ratings.find(rat => rat[0].burgerSeq === data.item[0].burgerSeq) !== undefined ? star : starNone} style={styles.starImg}/>
                        </View>
                    </View>
            </Pressable>}}
                alwaysBounceVertical={false}
            />
            <View style={{height: 50}}/>
            <Modal 
                animationType="fade"
                visible={alertTxt !== ''}
                transparent={true}>
                <View style={{flex:1,flexDirection:'column-reverse'}}>
                    <View style={styles.alert}>
                        <Text style={styles.alertTxt}>{alertTxt}</Text>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    searchBox : {
        borderWidth: 2,
        borderRadius: 5,
        fontSize: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: 'center',
        width: '95%',
        overflow:'hidden'
    },
    makeContainer : {
        width: '35%',
        justifyContent: 'center',
        marginTop: 2,
        height: 115,
        borderRadius: 20,
        backgroundColor: 'white',
        elevation: 2,
        marginRight: 10
    },
    infoContainer: {
        width: '65%'
    },
    burgerItem : {
        flexDirection: 'row',
        paddingHorizontal: 20,
        overflow: 'hidden',
        marginVertical: 1,
        backgroundColor:'white',
    },
    burgerFlat : {
        height: '92%'
    },
    itemName : {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemStore : {
        borderBottomWidth : 1,
        borderBottomColor: 'gray',
        paddingBottom: 2,
        marginBottom: 2,
        fontWeight: 'bold',
        color: 'gray'
    },
    storeBox : {
        zIndex: 10,
        position:'absolute',
        top: '8%',
        height : '6%',
        flexDirection: 'row',
    },
    storesItem : {
        opacity: 0.7,
        margin: 5,
        paddingHorizontal: 5,
        height: '80%',
        justifyContent: 'center',
        borderRadius: 10
    },
    starImg : {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    },
    starBack : {
        position : 'absolute',
        borderWidth: 1,
        borderColor: 'white',
        height: '100%',
        backgroundColor : '#f7d158'
    },
    starBox : {
        aspectRatio: 2900 / 512,
        alignSelf: 'center',
    },
    //alert
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
    }
});

export default HamburgerList;