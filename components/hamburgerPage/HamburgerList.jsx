import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import star from '../../assets/burger/star.png'
import starNone from '../../assets/burger/star_none.png'
import won from '../../assets/burger/won.png'
import { useAppContext } from '../api/ContextAPI';
import { Skel } from 'react-native-ui-skel-expo'

const HamburgerList = (props) => {
    const {navigation,route,searchParam} = props

    const windowWidth = Dimensions.get('window').width;

    const { dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

    const onPage = (num) => {
        dispatch({ type: 'SET_PAGE' , payload : num });
    };


    const onView = (num) => {
        dispatch({ type: 'SET_VIEW' , payload : num });
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

    const [loading,setLoading] = useState(false)

    useEffect(()=>{
        if( route.params?.search ) {
            setSearch(route.params?.search)
        }
        if( searchParam === undefined ) {
            navigation.setOptions({
                title: route.params?.type === 0 ? '프렌차이즈 버거 목록' : 
                route.params?.type === 1 ? '수제 버거 목록' :  
                route.params?.type === 2 ? 'DIY 버거 목록' : ''
            });
            setType(route.params?.type)
        } else {
            setSearch(searchParam)
        }
        const unsubscribe = navigation.addListener('focus', () => {
            onLoading(true)
            setLoading(true)
            axios.get(searchParam === undefined ? `https://hameat.onrender.com/rating/listType/${route.params?.type}`
                    : `https://hameat.onrender.com/rating/listAll`)
            .then(res => {
                setRatings(res.data)
                axios.get(`https://hameat.onrender.com/ingre/list`)
                .then(res => {
                    setIngres(res.data)
                    axios.get( searchParam === undefined ? `https://hameat.onrender.com/store/list/${route.params?.type}`
                    : `https://hameat.onrender.com/store/listAll`)
                    .then(res => {
                        setStores(res.data)
                        axios.get( searchParam === undefined ? `https://hameat.onrender.com/burger/list/${route.params?.type}`
                            : `https://hameat.onrender.com/burger/listAll`)
                        .then(res => {
                            setBurgers(res.data)
                            onLoading(false)
                            setLoading(false)
                        }).catch(() => {
                            setAlertTxt('불러오기 중 에러발생')
                            onLoading(false)
                            setLoading(false)
                        })
                    }).catch(() => {
                        setAlertTxt('불러오기 중 에러발생')
                        onLoading(false)
                        setLoading(false)
                    })
                }).catch(() => {
                    setAlertTxt('불러오기 중 에러발생')
                    onLoading(false)
                    setLoading(false)
                })
            }).catch(() => {
                setAlertTxt('불러오기 중 에러발생')
                onLoading(false)
                setLoading(false)
            })
        });
        return unsubscribe;
    },[navigation,route])

    const onGo = (a,b) => {
        onPage(a)
        onView(b)
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {searchParam === undefined &&
            <View style={{height: '8%',paddingTop:2,justifyContent: 'center',borderBottomWidth : 2,borderColor: 'lightgray',}}>
                <TextInput value={search} onChangeText={(text) => setSearch(text)} 
                    style={styles.searchBox} placeholder={type === 2 ? '버거 및 유저 검색' : '버거 및 가게 검색'}/>
            </View>}
            {searchParam === undefined && type !== 2 &&<ScrollView style={styles.storeBox} horizontal={strPick === -1 ? true : false}>
                {stores.filter(str => strPick !== -1 ? str.storeSeq === strPick : (search.includes(str.name) || str.name.includes(search)))
                    .map((item,index) => <Pressable key={index}
                    style={[styles.storesItem,{backgroundColor : item.storeSeq === strPick ? 'darkgray' : 'lightgray'}]}
                    onPress={() => strPick === -1 ? setStrPick(item.storeSeq) : setStrPick(-1)}
                    >
                    <Text style={{fontSize: 17}}>#{item.name} </Text>
                </Pressable>)}
            </ScrollView>}
            {(loading && searchParam !== undefined) && 
            <View style={{width:'95%',aspectRatio:5/3, marginLeft:'2.5%'}}>
                <View style={[styles.itemSkel,{height:'48%',marginVertical:'1%'}]}>
                    <Skel height={'100%'} width={windowWidth*0.95}/>
                </View>
                <View style={[styles.itemSkel,{height:'48%',marginVertical:'1%'}]}>
                    <Skel height={'100%'} width={windowWidth*0.95}/>
                </View>
            </View>}
            {!loading && burgers.filter(bgs => ( bgs[0].name.includes(search) || search.includes(bgs[0].name) || 
                        search.includes(bgs[0].content) || bgs[0].content.includes(search) ||
                        (bgs[1] && search.includes(bgs[1].name)) || 
                        (strPick === -1 && stores.filter(str => search.includes(str.name) || str.name.includes(search))
                        .map(stt => stt.storeSeq).includes(bgs[0].storeSeq)))
                        && (strPick >= 0 ? bgs[0].storeSeq === strPick : bgs)
                        ).length === 0 && <Text style={styles.noList}>결과가 없습니다</Text>}
            <FlatList
                style={{height: searchParam === undefined ? '92%' : '100%'}}
                data={burgers.filter(bgs => ( bgs[0].name.includes(search) || search.includes(bgs[0].name) || 
                                            search.includes(bgs[0].content) || bgs[0].content.includes(search) ||
                                            (bgs[1] && search.includes(bgs[1].name)) || 
                                            (strPick === -1 && stores.filter(str => search.includes(str.name) || str.name.includes(search))
                                            .map(stt => stt.storeSeq).includes(bgs[0].storeSeq)))
                                            && (strPick >= 0 ? bgs[0].storeSeq === strPick : bgs)
                                            )}
                renderItem={(data) => {
                const makeDTO = JSON.parse(data.item[0].make)

                return <Pressable style={({pressed})  => [styles.burgerItem,{elevation : pressed ? 1 : 3,
                        borderTopColor: pressed ? 'whitesmoke' : 'white', height: data.index !== 0 ? 123 : (
                            stores.filter(str => strPick !== -1 ? str.storeSeq === strPick : (search.includes(str.name) || str.name.includes(search))).length > 0 &&
                            searchParam === undefined && type !== 2) ? 162 : 123,
                        paddingTop: (stores.filter(str => strPick !== -1 ? str.storeSeq === strPick : (search.includes(str.name) || str.name.includes(search))).length > 0 &&
                            searchParam === undefined && type !== 2 && data.index === 0) && 40}]} 
                        key={data.index} onPress={() => searchParam === undefined ? navigation.navigate('View', { burgerSeq : data.item[0].burgerSeq }) 
                        : onGo(1,data.item[0].burgerSeq)}>
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
                                ratings.find(rat =>  ( searchParam === undefined ? rat[0].burgerSeq : rat.burgerSeq ) 
                                    === data.item[0].burgerSeq) !== undefined &&
                                parseFloat(ratings.filter(rat => ( searchParam === undefined ? rat[0].burgerSeq : rat.burgerSeq ) 
                                    === data.item[0].burgerSeq)
                                .reduce((acc, cur) => acc + ( searchParam === undefined ? cur[0].rate : cur.rate ) , 0)) * 20 / 
                                ratings.filter(rat => ( searchParam === undefined ? rat[0].burgerSeq : rat.burgerSeq )
                                    === data.item[0].burgerSeq).length + '%'}]}/>
                            <Image source={ratings.find(rat => ( searchParam === undefined ? rat[0].burgerSeq : rat.burgerSeq )
                                    === data.item[0].burgerSeq) !== undefined ? star : starNone} style={styles.starImg}/>
                        </View>
                    </View>
            </Pressable>}}
                alwaysBounceVertical={false}
            />
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
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    noList : {
        textAlign:'center',
        fontSize: 17,
        color:'gray',
        paddingVertical: 10,
        fontWeight:'bold'
    },
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
        borderRadius: 10,
        backgroundColor:'whitesmoke',
        overflow:'hidden',
        marginRight: 10
    },
    infoContainer: {
        width: '65%'
    },
    burgerItem : {
        flexDirection: 'row',
        paddingHorizontal: 20,
        overflow: 'hidden',
        paddingVertical: 1,
        marginBottom: 3,
        backgroundColor:'white',
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
    itemSkel : {
        height: '25%',
        overflow: 'hidden',
        marginVertical: 3,
        borderRadius: 5
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