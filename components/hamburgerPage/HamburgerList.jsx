import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import star from '../../assets/burger/star.png';
import starNone from '../../assets/burger/star_none.png';
import won from '../../assets/burger/won.png';
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

    const onAlertTxt = (txt) => {
        dispatch({ type: 'SET_ALERTTXT' , payload : txt });
    };
    
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
            if( route.params?.userSeq ) {
                navigation.setOptions({
                    title: '내 버거 목록'
                });
            } else {
                navigation.setOptions({
                    title: route.params?.type === 0 ? '프렌차이즈 버거 목록' : 
                    route.params?.type === 1 ? '수제 버거 목록' :  
                    route.params?.type === 2 ? 'DIY 버거 목록' : ''
                });
            }
            setType(route.params?.type)
        } else {
            setSearch(searchParam)
        }
        const unsubscribe = navigation.addListener('focus', () => {
            onLoading(true)
            setLoading(true)
            axios.get((!route.params?.userSeq && searchParam === undefined) ? `https://hameat.onrender.com/rating/listType/${route.params?.type}`
                    : `https://hameat.onrender.com/rating/listAll`)
            .then(res => {
                setRatings(res.data)
                axios.get(`https://hameat.onrender.com/ingre/list`)
                .then(res => {
                    setIngres(res.data)
                    axios.get( (!route.params?.userSeq && searchParam === undefined) ? `https://hameat.onrender.com/store/list/${route.params?.type}`
                    : `https://hameat.onrender.com/store/listAll`)
                    .then(res => {
                        setStores(res.data)
                        axios.get( (!route.params?.userSeq && searchParam === undefined) ? `https://hameat.onrender.com/burger/list/${route.params?.type}`
                            : `https://hameat.onrender.com/burger/listAll`)
                        .then(res => {
                            setBurgers(res.data)
                            onLoading(false)
                            setLoading(false)
                        }).catch(() => {
                            onAlertTxt('불러오기 중 에러발생')
                            onLoading(false)
                            setLoading(false)
                        })
                    }).catch(() => {
                        onAlertTxt('불러오기 중 에러발생')
                        onLoading(false)
                        setLoading(false)
                    })
                }).catch(() => {
                    onAlertTxt('불러오기 중 에러발생')
                    onLoading(false)
                    setLoading(false)
                })
            }).catch(() => {
                onAlertTxt('불러오기 중 에러발생')
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
        <View style={{flex : 1}}>
            {(!route.params?.userSeq && searchParam === undefined) &&
            <View style={{paddingTop:2,justifyContent: 'center'}}>
                <TextInput value={search} onChangeText={(text) => setSearch(text)} 
                    style={styles.searchBox} placeholder={type === 2 ? '버거 및 유저 검색' : '버거 및 가게 검색'}/>
            </View>}
            {(!route.params?.userSeq && searchParam === undefined) && type !== 2 &&<ScrollView style={styles.storeBox} horizontal={strPick === -1 ? true : false}>
                {stores.filter(str => strPick !== -1 ? str.storeSeq === strPick : (search.includes(str.name) || str.name.includes(search)))
                    .map((item,index) => <Pressable key={index}
                    style={[styles.storesItem,{backgroundColor : item.storeSeq === strPick ? 'darkgray' : 'lightgray'}]}
                    onPress={() => strPick === -1 ? setStrPick(item.storeSeq) : setStrPick(-1)}
                    >
                    <Text style={{fontSize: 17}}>#{item.name} </Text>
                </Pressable>)}
            </ScrollView>}
            {(loading && searchParam !== undefined) && 
            <View style={{width:'95%',aspectRatio:5/6, marginLeft:'2.5%'}}>
                <View style={[styles.itemSkel,{height:'24%',marginVertical:'0.5%'}]}>
                    <Skel height={'100%'} width={windowWidth*0.95}/>
                </View>
                <View style={[styles.itemSkel,{height:'24%',marginVertical:'0.5%'}]}>
                    <Skel height={'100%'} width={windowWidth*0.95}/>
                </View>
                <View style={[styles.itemSkel,{height:'24%',marginVertical:'0.5%'}]}>
                    <Skel height={'100%'} width={windowWidth*0.95}/>
                </View>
                <View style={[styles.itemSkel,{height:'24%',marginVertical:'0.5%'}]}>
                    <Skel height={'100%'} width={windowWidth*0.95}/>
                </View>
            </View>}
            {!loading && burgers.filter(bgs => route.params?.userSeq ? 
                                        (bgs[1] && bgs[1].userSeq === route.params?.userSeq)
                                            : ( bgs[0].name.includes(search) || search.includes(bgs[0].name) || 
                                            search.includes(bgs[0].content) || bgs[0].content.includes(search) ||
                                            (bgs[1] && search.includes(bgs[1].name)) || 
                                            (strPick === -1 && stores.filter(str => search.includes(str.name) || str.name.includes(search))
                                            .map(stt => stt.storeSeq).includes(bgs[0].storeSeq)))
                                            && (strPick >= 0 ? bgs[0].storeSeq === strPick : bgs)).length === 0 && 
                                            <Text style={styles.noList}>결과가 없습니다</Text>}
            <FlatList
                style={{flex : 1}}
                data={burgers.filter(bgs => route.params?.userSeq ? 
                                        (bgs[1] && bgs[1].userSeq === route.params?.userSeq)
                                            : ( bgs[0].name.includes(search) || search.includes(bgs[0].name) || 
                                            search.includes(bgs[0].content) || bgs[0].content.includes(search) ||
                                            (bgs[1] && search.includes(bgs[1].name)) || 
                                            (strPick === -1 && stores.filter(str => search.includes(str.name) || str.name.includes(search))
                                            .map(stt => stt.storeSeq).includes(bgs[0].storeSeq)))
                                            && (strPick >= 0 ? bgs[0].storeSeq === strPick : bgs)
                                            )}
                renderItem={(data) => {
                const makeDTO = JSON.parse(data.item[0].make)

                return <Pressable style={({pressed})  => [styles.burgerItem,{elevation : pressed ? 0.5 : 4,
                        borderTopColor: pressed ? 'whitesmoke' : 'white', height: data.index !== 0 ? 120 : (
                            stores.filter(str => strPick !== -1 ? str.storeSeq === strPick : (search.includes(str.name) || str.name.includes(search))).length > 0 &&
                            (!route.params?.userSeq && searchParam === undefined) && type !== 2) ? 160 : 120,
                        paddingTop: (stores.filter(str => strPick !== -1 ? str.storeSeq === strPick : (search.includes(str.name) || str.name.includes(search))).length > 0 &&
                            (!route.params?.userSeq && searchParam === undefined) && type !== 2 && data.index === 0) && 40}]} 
                        key={data.index} onPress={() => (!route.params?.userSeq && searchParam === undefined) ? navigation.navigate('View', { burgerSeq : data.item[0].burgerSeq }) 
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
                                    zIndex:-index+999,alignSelf: 'center'}}
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
                                zIndex: -makeDTO.length+999,marginTop: data.item[0].size === 0 ? 4 : data.item[0].size === 1 ? 3 : 0}} />
                        </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.itemName}>{data.item[0].name}</Text>
                        {data.item[0].type !== 2 && <Text style={styles.itemStore}>{stores.find(str => str.storeSeq === data.item[0].storeSeq) ? 
                        stores.find(str => str.storeSeq === data.item[0].storeSeq).name : '없는 매장'}</Text>}
                        {data.item[0].type === 2 && <Text style={styles.itemStore}>{data.item[1] ? data.item[1].name : '탈퇴 회원'}</Text>}{/* userSeq를 통한 유저명 가져오기 */}
                        {data.item[0].type !== 2 &&<View style={{flexDirection:'row',justifyContent:'center',marginTop:3}}>
                            <Image source={won} style={{width:23,height:23}}/>
                            <Text style={{fontSize:15,textAlignVertical:'center'}}>
                            &nbsp;{data.item[0].price <= 0 ? '가격 정보가 없습니다' : data.item[0].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</Text>
                        </View>}
                        <View style={[styles.starBox,{ width: data.item[0].type === 2 ? '80%' : '70%', margin: data.item[0].type === 2 ? 12 : 2 }]}>
                            <View style={[styles.starBack,{width : 
                                ratings.find(rat =>  ( (!route.params?.userSeq && searchParam === undefined) ? rat[0].burgerSeq : rat.burgerSeq ) 
                                    === data.item[0].burgerSeq) !== undefined &&
                                parseFloat(ratings.filter(rat => ( (!route.params?.userSeq && searchParam === undefined) ? rat[0].burgerSeq : rat.burgerSeq ) 
                                    === data.item[0].burgerSeq)
                                .reduce((acc, cur) => acc + ( (!route.params?.userSeq && searchParam === undefined) ? cur[0].rate : cur.rate ) , 0)) * 20 / 
                                ratings.filter(rat => ( (!route.params?.userSeq && searchParam === undefined) ? rat[0].burgerSeq : rat.burgerSeq )
                                    === data.item[0].burgerSeq).length + '%'}]}/>
                            <Image source={ratings.find(rat => ( (!route.params?.userSeq && searchParam === undefined) ? rat[0].burgerSeq : rat.burgerSeq )
                                    === data.item[0].burgerSeq) !== undefined ? star : starNone} style={styles.starImg}/>
                        </View>
                    </View>
            </Pressable>}}
                alwaysBounceVertical={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    noList : {
        textAlign:'center',
        fontSize: 17,
        color:'gray',
        paddingVertical: 5,
        fontWeight:'bold'
    },
    searchBox : {
        borderRadius: 5,
        backgroundColor: '#e5e5e5',
        color:'#505050',
        height: 40,
        fontSize: 18,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginVertical: 5,
        alignSelf: 'center',
        width: '95%',
        overflow:'hidden'
    },
    makeContainer : {
        width: '33%',
        justifyContent:'center',
        paddingHorizontal:'0.2%',
        overflow:'hidden',
    },
    infoContainer: {
        width: '67%',
        borderLeftWidth: 1,
        borderColor: 'gray',
        marginVertical: 3,
        paddingLeft: 5,
        borderStyle: 'dashed'
    },
    burgerItem : {
        flexDirection: 'row',
        overflow: 'hidden',
        paddingVertical: 1,
        marginHorizontal: '1%',
        borderRadius: 10,
        marginBottom: 3,
        marginTop: 1,
        backgroundColor:'white',
    },
    itemName : {
        fontSize: 18,
        fontWeight: 'bold',
    },
    itemStore : {
        borderBottomWidth : 1,
        borderBottomColor: 'gray',
        borderStyle: 'dashed',
        paddingBottom: 2,
        marginBottom: 2,
        fontWeight: 'bold',
        color: 'gray'
    },
    storeBox : {
        zIndex: 10,
        position:'absolute',
        top: 53,
        flexDirection: 'row',
    },
    storesItem : {
        opacity: 0.7,
        margin: 5,
        paddingHorizontal: 6,
        paddingVertical: 6,
        justifyContent: 'center',
        borderRadius: 5
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
});

export default HamburgerList;