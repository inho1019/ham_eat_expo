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

    const [first,setFirst] = useState(true)

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
            Promise.all([
                axios.get(`https://hameat.onrender.com/ingre/list`),
                axios.get((!route.params?.userSeq && searchParam === undefined) ? `https://hameat.onrender.com/rating/listType/${route.params?.type}`
                : `https://hameat.onrender.com/rating/listAll`),
                axios.get( (!route.params?.userSeq && searchParam === undefined) ? `https://hameat.onrender.com/store/list/${route.params?.type}`
                : `https://hameat.onrender.com/store/listAll`),
                axios.get( (!route.params?.userSeq && searchParam === undefined) ? `https://hameat.onrender.com/burger/list/${route.params?.type}`
                : `https://hameat.onrender.com/burger/listAll`)
            ])
            .then(res => {
                setIngres(res[0].data)
                setRatings(res[1].data)
                setStores(res[2].data)
                setBurgers(res[3].data)
                onLoading(false)
                setFirst(false)
            })
            .catch(() => {
                onLoading(false)
                setFirst(false)
                onAlertTxt('불러오기 중 에러발생')
            })
        })
        return unsubscribe;
    },[navigation,route])

    const onGo = (a,b) => {
        onPage(a)
        onView(b)
    }

    return (
        <View style={{flex : 1}}>
            {(!route.params?.userSeq && searchParam === undefined) &&
            <TextInput value={search} onChangeText={(text) => setSearch(text)} 
                style={styles.searchBox} placeholder={type === 2 ? '버거 및 유저 검색' : '버거 및 가게 검색'}/>}
            {(!route.params?.userSeq && searchParam === undefined) && type !== 2 &&<ScrollView style={styles.storeBox} horizontal={strPick === -1 ? true : false}>
                {stores.filter(str => strPick !== -1 ? str.storeSeq === strPick : (search.includes(str.name) || str.name.includes(search)))
                    .map((item,index) => <Pressable key={index}
                    style={[styles.storesItem,{backgroundColor : item.storeSeq === strPick ? 'darkgray' : 'lightgray'}]}
                    onPress={() => strPick === -1 ? setStrPick(item.storeSeq) : setStrPick(-1)}
                    >
                    <Text style={{fontSize: 17}}>#{item.name} </Text>
                </Pressable>)}
            </ScrollView>}
            {(first && searchParam !== undefined) && 
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
            {!first && burgers.filter(bgs => route.params?.userSeq ? 
                (bgs[1] && bgs[1].userSeq === route.params?.userSeq)
                    : ( bgs[0].name.replace(/\s/g, '').toLowerCase().includes(search.replace(/\s/g, '').toLowerCase()) || 
                    search.replace(/\s/g, '').toLowerCase().includes(bgs[0].name.replace(/\s/g, '').toLowerCase()) || 
                    search.replace(/\s/g, '').toLowerCase().includes(bgs[0].content.replace(/\s/g, '').toLowerCase()) || 
                    bgs[0].content.replace(/\s/g, '').toLowerCase().includes(search.replace(/\s/g, '').toLowerCase()) ||
                    (bgs[1] && search.replace(/\s/g, '').toLowerCase().includes(bgs[1].name.replace(/\s/g, '').toLowerCase())) || 
                    (strPick === -1 && stores.filter(str => search.replace(/\s/g, '').toLowerCase().includes(str.name.replace(/\s/g, '').toLowerCase()) || 
                    str.name.replace(/\s/g, '').toLowerCase().includes(search.replace(/\s/g, '').toLowerCase()))
                    .map(stt => stt.storeSeq).includes(bgs[0].storeSeq)))
                    && (strPick >= 0 ? bgs[0].storeSeq === strPick : bgs)).length === 0 && 
                <Text style={styles.noList}>결과가 없습니다</Text>}
            {!first && <FlatList
                style={{flex : 1}}
                data={burgers.filter(bgs => route.params?.userSeq ? 
                    (bgs[1] && bgs[1].userSeq === route.params?.userSeq)
                        : ( bgs[0].name.replace(/\s/g, '').toLowerCase().includes(search.replace(/\s/g, '').toLowerCase()) || 
                        search.replace(/\s/g, '').toLowerCase().includes(bgs[0].name.replace(/\s/g, '').toLowerCase()) || 
                        search.replace(/\s/g, '').toLowerCase().includes(bgs[0].content.replace(/\s/g, '').toLowerCase()) ||
                        bgs[0].content.replace(/\s/g, '').toLowerCase().includes(search.replace(/\s/g, '').toLowerCase()) ||
                        (bgs[1] && search.replace(/\s/g, '').toLowerCase().includes(bgs[1].name.replace(/\s/g, '').toLowerCase())) || 
                        (strPick === -1 && stores.filter(str => search.replace(/\s/g, '').toLowerCase().includes(str.name.replace(/\s/g, '').toLowerCase()) || 
                        str.name.replace(/\s/g, '').toLowerCase().includes(search.replace(/\s/g, '').toLowerCase()))
                        .map(stt => stt.storeSeq).includes(bgs[0].storeSeq)))
                        && (strPick >= 0 ? bgs[0].storeSeq === strPick : bgs)
                    )}
                renderItem={(data) => {
                const makeDTO = JSON.parse(data.item[0].make)
                const inDTO = makeDTO.map(md => {
                    const ingreIt = ingres.find(ing => ing.ingreSeq === md);
                    return ingreIt !== undefined ? ingreIt : ingres[0]
                });
                const lastMargin = windowWidth*inDTO.filter(ing => ing.type !== 4)[inDTO.filter(ing => ing.type !== 4).length - 1].height

                return <Pressable style={({pressed})  => [styles.burgerItem,{elevation : pressed ? 0.5 : 5,
                        borderTopColor: pressed ? 'whitesmoke' : 'white',
                        marginTop: (stores.filter(str => strPick !== -1 ? str.storeSeq === strPick : (search.includes(str.name) || str.name.includes(search))).length > 0 &&
                            (!route.params?.userSeq && searchParam === undefined) && type !== 2 && data.index === 0) ? 44 : 1}]} 
                        key={data.index} onPress={() => (!route.params?.userSeq && searchParam === undefined) ? navigation.navigate('View', { burgerSeq : data.item[0].burgerSeq }) 
                        : onGo(1,data.item[0].burgerSeq)}>
                        <View style={styles.makeContainer}>
                            {makeDTO.map((item,index) => {
                                const getIngre = ingres.find(ing => ing.ingreSeq === item)
                                return <Image key={index} style={
                                    {width: data.item[0].size === 0 ? '50%' : data.item[0].size === 2 ? '90%' : '70%',
                                    aspectRatio: getIngre.width / getIngre.height + 
                                        (data.item[0].size === 0 ? - 0.3 : data.item[0].size === 2 && + 0.4),
                                    marginBottom: getIngre.type === 4 ? -(data.item[0].size === 0 ? windowWidth*0.0435 : 
                                        data.item[0].size === 1 ? windowWidth*0.0563 : windowWidth*0.0658) :
                                        ((getIngre.type === 2 || getIngre.type === 3) && 
                                        getIngre.height > 170 ? -(windowWidth*0.07) : -(windowWidth*0.06)) + 
                                        (data.item[0].size === 0 ? + (windowWidth*0.0125) : data.item[0].size === 2 && + -(windowWidth*0.006)),
                                    zIndex:-index+999,alignSelf: 'center'}}
                                    source={{ uri : getIngre.image}}
                                    resizeMode='stretch'/>
                                })}
                            <Image 
                            source={{ uri : ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                                ingres.find(ing => ing.ingreSeq === makeDTO[0]).image :
                                ingres.find(ing => ing.ingreSeq === makeDTO[0]).name === '먹물 번' ? 
                                'https://postfiles.pstatic.net/MjAyNDAyMjVfMTY4/MDAxNzA4ODQxNDg2OTk0.9RaLSfxW7Tzloqsvz40r1omqWehGg7bZbh7st9OBmQkg.2JdsHC1yle6BINWRnsSUQib_A5GWvLE3mh2HhqXoQ9Ig.PNG/ink_bun.png?type=w966'
                                : 'https://postfiles.pstatic.net/MjAyNDAyMjVfNiAg/MDAxNzA4ODM5MDMxNzQ5.-eK1dABinObEUaWkHVMu03zQ818I4VUbkhhdwf7AlQIg.xFI7_6ktqqav2Uj-iqp-yy4F_b6WR9xbopK5xWIP0p4g.PNG/normal_bun.png?type=w966'}} 
                                style={{width: data.item[0].size === 0 ? '50%' : data.item[0].size === 2 ? '90%' : '70%',alignSelf:'center',
                                aspectRatio: 500/(ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                                ingres.find(ing => ing.ingreSeq === makeDTO[0]).height : 160), 
                                zIndex: -makeDTO.length+999, marginTop: data.item[0].size === 0 ? lastMargin * 0.00008 : 
                                                                        data.item[0].size === 1 ? lastMargin * 0.00004 : lastMargin * 0.00001}}/>
                        </View>
                    <View style={styles.infoContainer}>
                        <Text style={styles.itemName}>{data.item[0].name}</Text>
                        {data.item[0].type !== 2 && <Text style={styles.itemStore}>{stores.find(str => str.storeSeq === data.item[0].storeSeq) ? 
                        stores.find(str => str.storeSeq === data.item[0].storeSeq).name : '없는 매장'}</Text>}
                        {data.item[0].type === 2 && <Text style={styles.itemStore}>{data.item[1] ? data.item[1].name : '탈퇴 회원'}</Text>}{/* userSeq를 통한 유저명 가져오기 */}
                        {data.item[0].type !== 2 &&<View style={{flexDirection:'row',justifyContent:'center',marginVertical:4}}>
                            <View style={{flexDirection:'row',justifyContent:'center'}}><Image source={won} style={{width:22,height:22}}/>
                            <Text style={{fontSize:15,textAlignVertical:'center'}}>
                            &nbsp;{data.item[0].price <= 0 ? '가격 정보 없음' : data.item[0].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</Text></View>
                            <Text style={[styles.status,{backgroundColor:data.item[0].status === 0 ? '#2E8DFF' : 'tomato'}]}>
                                {data.item[0].status === 0 ? '판매중' : '단종' }</Text>
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
                ListHeaderComponent={() => (!route.params?.userSeq && searchParam === undefined) && <View style={{paddingBottom:56}}/>}
                ListFooterComponent={() => <View style={{paddingBottom:10}}/>}
                alwaysBounceVertical={false}
            />}
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
        position: 'absolute',
        top: 10,
        borderRadius: 5,
        zIndex: 9999,
        backgroundColor: '#e5e5e5',
        color:'#505050',
        height: 40,
        fontSize: 18,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: 'center',
        width: '96%',
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
        marginBottom: 4,
        marginTop: 2,
        height: 127,
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
    status : {
        borderRadius: 5,
        width: 60,
        alignItems :'center',
        textAlign:'center',
        fontSize: 15,
        fontWeight:'bold',
        color:'white',
        marginLeft: 10
    },
});

export default HamburgerList;