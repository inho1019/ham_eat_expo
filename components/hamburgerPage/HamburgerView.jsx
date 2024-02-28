import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, FlatList, Image, Keyboard, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import addImg from '../../assets/burger/add_review.png'
import deleteImg from '../../assets/burger/delete.png'
import drag from '../../assets/burger/drag.png'
import star from '../../assets/burger/star.png'
import starNone from '../../assets/burger/star_none.png'
import starOne from '../../assets/burger/star_one.png'
import people from '../../assets/burger/people.png'
import won from '../../assets/burger/won.png'
import tab from '../../assets/burger/tab.png'
import mapIcon from '../../assets/burger/map.png'
import searchIcon from '../../assets/main/search.png'
import { useAppContext } from '../api/ContextAPI';
import MapModal from '../MapModal';
import Map from '../Map';
import { Skel } from 'react-native-ui-skel-expo'

const HamburgerView = (props) => {
    const {navigation,route} = props

    const windowWidth = Dimensions.get('window').width;

    const [rate,setRate] = useState(0)
    const [content,setContent] = useState('')
    const [first,setFirst] = useState(true)
    ///////////애니메이션///////////////
    const ingreBox = useRef(new Animated.Value(0)).current;

    const aniIng = (num) => {
        Animated.timing(ingreBox, {
            toValue: num,
            duration: 500,
            useNativeDriver: false,
            easing: Easing.out(Easing.ease)
        }).start();
    }

    const ingreAni = {
        left: ingreBox.interpolate({
        inputRange: [0, 1],
        outputRange: [-106, 0],
        }),
    };

    const tabAni = {
        width: ingreBox.interpolate({
            inputRange: [0, 1],
            outputRange: [40, 0],
        }),
        borderTopRightRadius: ingreBox.interpolate({
            inputRange: [0, 1],
            outputRange: [40, 0],
        }),
        borderBottomRightRadius: ingreBox.interpolate({
            inputRange: [0, 1],
            outputRange: [40, 0],
        }),
    };


    const ingAni = {
        marginTop: ingreBox.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 40],
        })
    };
    ///////////드래그 이벤트////////////
    const [starWidth, setStarWidth] = useState(0);

    const starLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        setStarWidth(width);
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gestureState) => {
            const point = ((gestureState.moveX-(starWidth*0.333)) * (100/starWidth)) - (starWidth*0.03)
            if( point >= 0 && point <= 100) {
                setRate(point)
            } else if (point < 0) {
                setRate(0)
            } else if (point > 100) {
                setRate(100)
            }
        },
    })
/////////////드래그 이벤트 2////////////////
    const panResponder2 = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderRelease: (_ , gestureState) => {
            if(gestureState.dy > 100) {
                setReview(false)
            }
        },
    })
/////////////드래그 이벤트 3////////////////
    const panResponder3 = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderRelease: (_ , gestureState) => {
            if(gestureState.dy < -100) {
                setReview(true)
            }
        },
    })
    ////////////////////////////////////////////
    const getToday = (logTime) => {
        const date = new Date(logTime)
        const day = date.getDate();
        const month = date.getMonth()+1;
        const hour = date.getHours();
        const minutes = date.getMinutes();
        
        return `${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    //////////////////////////////////////////////

    const { state , dispatch } = useAppContext();

    const onPage = (num) => {
        dispatch({ type: 'SET_PAGE' , payload : num });
    };

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

    const onAlertTxt = (txt) => {
        dispatch({ type: 'SET_ALERTTXT' , payload : txt });
    };
    ///////////////////지도모달/////////////////
    const [mapModal,setMapModal] = useState(false)
    const [mapDTO,setMapDTO] = useState({
        longitude : 0,
        latitude : 0,
        name : '',
        address : '',
        placeUrl : '',
    })

    const onMapStore = () => {
        setMapDTO({
            longitude:storeDTO.longitude,
            latitude:storeDTO.latitude,
            name:storeDTO.name,
            address:storeDTO.address,
            placeUrl:storeDTO.placeUrl
        })
        setMapModal(true)
    }

    const onMapPlace = (data) => {
        setMapDTO({
            longitude:data.longitude,
            latitude:data.latitude,
            name:data.placeName,
            address:data.address,
            placeUrl:data.placeUrl
        })
        setMapModal(true)
    }

    const onClose = () => {
       setMapModal(false) 
    }
    /////////////////////////////////////////////
    const [burgerDTO,setBurgerDTO] = useState([])
    const [makeDTO,setMakeDTO] = useState([])
    const [storeDTO,setStoreDTO] = useState({})
    const [ingres,setIngres] = useState([])
    const [ratings,setRatings] = useState([])
    const [review,setReview] = useState(false)
    const [store,setStore] = useState(false)
    const [fold,setFold] = useState(true)
    const [placeDTO,setPlaceDTO] = useState()
    const [status,setStatus] = useState(false)
    const [priceList,setPriceList] = useState([])
    const [lastMargin,setLastMargin] = useState(0)
    const [price,setPrice] = useState('')
    const [tabModal,setTabModal] = useState(false)

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if(!status) {
                if(first) {
                    navigation.setOptions({
                        title: '',
                        headerRight: () => (
                            <Pressable onPress={() => setTabModal(true)}>
                                <Image source={tab} style={{width:27,height:27}}/>
                            </Pressable>
                        )
                    });
                    Promise.all([
                        axios.get(`https://hameat.onrender.com/rating/listSeq/${route.params?.burgerSeq}`),
                        axios.get(`https://hameat.onrender.com/ingre/list`),
                        axios.get(`https://hameat.onrender.com/burger/view/${route.params?.burgerSeq}`),
                    ])
                    .then(res => {
                        if(res[2].data) {
                            setRatings(res[0].data)
                            setIngres(res[1].data)
                            setBurgerDTO(res[2].data)
                            setMakeDTO(JSON.parse(res[2].data[0].make))
                            const inDTO = JSON.parse(res[2].data[0].make).map(md => {
                                const ingreIt = res[1].data.find(ing => ing.ingreSeq === md);
                                return ingreIt !== undefined ? ingreIt : res[1].data[0]
                            });
                            setLastMargin(windowWidth*inDTO.filter(ing => ing.type !== 4)[inDTO.filter(ing => ing.type !== 4).length - 1].height)
                            navigation.setOptions({
                                title: res[2].data[0].name
                            });
                            axios.get(`https://hameat.onrender.com/store/getSeq/${res[2].data[0].storeSeq}`)
                            .then(res => {
                                setStoreDTO(res.data)
                                setFirst(false)
                            })
                            .catch(() => {
                                onAlertTxt('불러오기 중 에러발생')
                                setFirst(false)
                            })
                        } else {
                            onAlertTxt('삭제된 버거입니다')
                            navigation.goBack(-1)
                        }
                    })
                    .catch(() => {
                        onAlertTxt('불러오기 중 에러발생')
                        setFirst(false)
                    })
                } else {
                    onLoading(true)
                    axios.get(`https://hameat.onrender.com/burger/view/${route.params?.burgerSeq}`)
                    .then(res => {
                        onLoading(false)
                        setBurgerDTO(res.data)
                        setMakeDTO(JSON.parse(res.data[0].make))
                        const inDTO = JSON.parse(res.data[0].make).map(md => {
                            const ingreIt = ingres.find(ing => ing.ingreSeq === md);
                            return ingreIt !== undefined ? ingreIt : ingres[0]
                        });
                        setLastMargin(windowWidth*inDTO.filter(ing => ing.type !== 4)[inDTO.filter(ing => ing.type !== 4).length - 1].height)
                    })
                    .catch(() => {
                        onAlertTxt('불러오기 중 에러발생')
                        onLoading(false)
                        setFirst(false)
                    })
                }
            } else {
                onLoading(true)
                axios.get(`https://hameat.onrender.com/status/list/${route.params?.burgerSeq}`)
                .then(res => {
                    setPriceList(res.data)
                    onLoading(false)
                })
                .catch(() => {
                    onAlertTxt('불러오기 중 에러발생')
                    onLoading(false)
                    setFirst(false)
                })
            }
        })
        
        return unsubscribe;
    },[route,status])

    const onSub = () => {
        if(content.length > 0) {
            if(!store || placeDTO) {
            onLoading(true)
            Keyboard.dismiss()
            const ratingDTO = {
                burgerSeq : burgerDTO[0].burgerSeq,
                userSeq : state.user.userSeq,
                content : content,
                rate : (5 / (100/rate)) > 4.85 ? 5 : (5 / (100/rate)) < 0.15 ? 
                0 : (5 / (100/rate)).toFixed(2),
                type : burgerDTO[0].type,
                ...placeDTO
            }
            axios.post(`https://hameat.onrender.com/rating/write`,ratingDTO)
            .then(() => {
                setContent('')
                setPlaceDTO()
                setRate(0)
                axios.get(`https://hameat.onrender.com/rating/listSeq/${route.params?.burgerSeq}`)
                .then(res => {
                    setRatings(res.data)
                    onLoading(false)
                    onAlertTxt('평가 등록 완료')
                    setStore(false)
                })
                .catch(() => {
                    onAlertTxt('등록 중 에러발생')
                    onLoading(false)
                })
            })
            } else {
                Keyboard.dismiss()
                onAlertTxt('지점을 선택해주세요')
            }
        } else {
            Keyboard.dismiss()
            onAlertTxt('평가 내용을 입력해주세요')
        }
    }

    const onDelete = (ratingSeq) => {
        onLoading(true)
        axios.delete(`https://hameat.onrender.com/rating/delete/${ratingSeq}`,)
        .then(() => {
            onLoading(false)
            setRatings(ratings.filter(rat => rat[0].ratingSeq !== ratingSeq))
            onAlertTxt('삭제 완료')
        })
        .catch(() => {
            onAlertTxt('삭제 중 에러발생')
            onLoading(false)
        })
    }

    const onPlace = (data) => {
        setPlaceDTO({
            placeName : data.place_name,
            address : data.address_name,
            placeUrl : data.place_url,
            longitude: data.x,
            latitude: data.y,
            placeId: data.id
        })
    }

    const onStatus = (num) => {
        const statusDTO = {
            type : 0,
            burgerSeq : route.params?.burgerSeq,
            userSeq : state.user.userSeq,
            req : num
        }
        onLoading(true)
        axios.post(`https://hameat.onrender.com/status/write`,statusDTO)
        .then(res => {
            if(res.data === 0) {
                onAlertTxt('30일 이내에 신청한 내역이 존재합니다')
                onLoading(false)
            } else if(res.data === 1) {
                axios.get(`https://hameat.onrender.com/burger/status/${route.params?.burgerSeq}`)
                .then(() => { 
                    onAlertTxt('변동 신청이 완료되었습니다')
                    onLoading(false)
                })
                .catch(() => {
                    onAlertTxt('변동 중 에러발생')
                    onLoading(false)
                })
            } else {
                onAlertTxt('변동 중 에러발생')
            }
        })
        .catch(() => {
            onAlertTxt('변동 중 에러발생')
            onLoading(false)
        })

    }

    const onPrice = () => {
        Keyboard.dismiss()
        if(price === '') {
            onAlertTxt('가격을 입력해주세요')
        } else {
            const statusDTO = {
                type : 1,
                burgerSeq : route.params?.burgerSeq,
                userSeq : state.user.userSeq,
                req : price
            }
            onLoading(true)
            axios.post(`https://hameat.onrender.com/status/write`,statusDTO)
            .then(res1 => {           
                axios.get(`https://hameat.onrender.com/status/list/${route.params?.burgerSeq}`)
                .then(res2 => {
                    setPriceList(res2.data)
                    onLoading(false)
                    setPrice('')
                    if(res1.data === 0) {
                        onAlertTxt('신청한 내역이 존재합니다')
                    } else if(res1.data === 1) {
                        onAlertTxt('변동 신청이 완료되었습니다')
                    } else if(res1.data === 2) {
                        onAlertTxt('조건을 충족하여 가격이 변동되었습니다')
                    } else {
                        onAlertTxt('변동 중 에러발생')
                    }
                })
            })
            .catch(() => {
                onAlertTxt('변동 중 에러발생')
                onLoading(false)
            })
        }
    }

    const onPriceDelete = (seq) => {
        onLoading(true)
        axios.delete(`https://hameat.onrender.com/status/delete/${seq}`)
        .then(() => {
            axios.get(`https://hameat.onrender.com/status/list/${route.params?.burgerSeq}`)
            .then(res => {
                setPriceList(res.data)
                onLoading(false)
                onAlertTxt('삭제 완료')
            })
            .catch(() => {
                onAlertTxt('삭제 중 에러발생')
                onLoading(false)
            })

        })
        .catch(() => {
            onAlertTxt('삭제 중 에러발생')
            onLoading(false)
        })
    }

    const [deleteCount,setDeleteCount] = useState(0)

    const onBurgerDelete = () => {
        if(deleteCount === 0) {
            onAlertTxt('한번 더 클릭시 삭제됩니다')
            setDeleteCount(1)
            setTimeout(() => setDeleteCount(0),5000)
        } else {
            onLoading(true)
            axios.delete(`https://hameat.onrender.com/burger/delete/${route.params?.burgerSeq}`)
            .then(() => {
                onLoading(false)
                navigation.goBack(-1)
                onAlertTxt('삭제 완료')
            })
        }
    }

    useEffect(() => {
        aniIng(fold ? 0 : 1)
    },[fold])

    return (
        <View>
            <ScrollView style={{height:'95%',marginBottom:20}}>
                {!first && <Animated.View style={[styles.ingreOut,ingreAni]} ref={ingreBox}>
                    <Pressable style={styles.ingreInfo} onPress={() => setFold(true)}>
                        {ingres.sort((a, b) => a.type - b.type).map((item,index) => makeDTO.includes(item.ingreSeq) && 
                        <Text key={index} style={styles.ingreTxt}>
                            {item.name} X {makeDTO.filter(md => md === item.ingreSeq).length}
                        </Text>)}
                    </Pressable>
                    <Pressable onPress={() => setFold(false)}>
                        <Animated.View style={[styles.fold,tabAni]} ref={ingreBox}>
                            <Image source={searchIcon} style={{height:20,width:20}}/>
                        </Animated.View>    
                    </Pressable>
                    </Animated.View>}
                <View style={{borderBottomColor:'whitesmoke',borderBottomWidth:20,paddingBottom:15,marginBottom:12}}>
                    {first && <View style={{width:200,height:200,overflow:'hidden',
                        alignSelf:'center', borderRadius:5, marginVertical:'5%'}}>
                            <Skel height={200} width={200}/>
                    </View>}
                    {!first && makeDTO.length > 0 && <Pressable 
                        onPress={() => setFold(!fold)}
                        style={styles.makeContainer}>
                        {makeDTO.map((item,index) => {
                            const getIngre = ingres.find(ing => ing.ingreSeq === item)
                            return <Animated.Image key={index} style={
                                [ingAni,{width: burgerDTO[0].size === 0 ? '50%' : burgerDTO[0].size === 2 ? '90%' : '70%',
                                aspectRatio: getIngre.width / getIngre.height + 
                                    (burgerDTO[0].size === 0 ? - 0.3 : burgerDTO[0].size === 2 && + 0.4),
                                marginBottom: getIngre.type === 4 ? -(burgerDTO[0].size === 0 ? windowWidth*0.0955 : 
                                    burgerDTO[0].size === 1 ? windowWidth*0.1233 : windowWidth*0.1443) :
                                     ((getIngre.type === 2 || getIngre.type === 3) && 
                                    getIngre.height > 170 ? -(windowWidth*0.158) : -(windowWidth*0.126)) + 
                                    (burgerDTO[0].size === 0 ? + (windowWidth*0.023) : burgerDTO[0].size === 2 && + -(windowWidth*0.019)),
                                zIndex:-index,alignSelf: 'center'}]}
                                source={{ uri : getIngre.image}}
                                resizeMode='stretch'/>
                            })}
                        <Animated.View ref={ingreBox} style={[ingAni,{zIndex: -makeDTO.length}]}>
                            <Image 
                            source={{ uri : ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                                ingres.find(ing => ing.ingreSeq === makeDTO[0]).image :
                                ingres.find(ing => ing.ingreSeq === makeDTO[0]).name === '먹물 번' ? 
                                'https://postfiles.pstatic.net/MjAyNDAyMjVfMTY4/MDAxNzA4ODQxNDg2OTk0.9RaLSfxW7Tzloqsvz40r1omqWehGg7bZbh7st9OBmQkg.2JdsHC1yle6BINWRnsSUQib_A5GWvLE3mh2HhqXoQ9Ig.PNG/ink_bun.png?type=w966'
                                : 'https://postfiles.pstatic.net/MjAyNDAyMjVfNiAg/MDAxNzA4ODM5MDMxNzQ5.-eK1dABinObEUaWkHVMu03zQ818I4VUbkhhdwf7AlQIg.xFI7_6ktqqav2Uj-iqp-yy4F_b6WR9xbopK5xWIP0p4g.PNG/normal_bun.png?type=w966'}}
                                style={{width: burgerDTO[0].size === 0 ? '50%' : burgerDTO[0].size === 2 ? '90%' : '70%',alignSelf:'center',
                                aspectRatio: 500/(ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                                ingres.find(ing => ing.ingreSeq === makeDTO[0]).height : 160), 
                                marginTop: burgerDTO[0].size === 0 ? lastMargin * 0.00018 : burgerDTO[0].size === 1 ? lastMargin * 0.00007 : lastMargin * 0.00005}}/>
                        </Animated.View>
                    </Pressable>}
                </View>
                {first && <View style={{width:150,height:50,overflow:'hidden',
                    alignSelf:'center', borderRadius:5, marginVertical:'2%'}}>
                        <Skel width={150} height={50}/>
                </View>}
                {first && <View style={{flexDirection:'row',justifyContent:'space-between',margin:'3%'}}>
                    <View style={{width:100,height:40,overflow:'hidden',
                        borderRadius:5}}>
                            <Skel width={100} height={40}/>
                    </View>
                    <View style={{width:100,height:40,overflow:'hidden',
                        borderRadius:5}}>
                            <Skel width={100} height={40}/>
                    </View>
                </View>}
                {!first && burgerDTO[0] && <View style={{marginBottom:15}}>
                    <Text style={styles.h1}>{burgerDTO[0].name}</Text>
                    {burgerDTO[0].type !== 2 &&<View style={{flexDirection:'row',justifyContent:'center', marginTop:15, marginBottom:5}}>
                        <Pressable
                            onPress={() => state.user.userSeq === -1 ? 
                                onAlertTxt('로그인 후 이용가능') : setStatus(true)}
                            style={({pressed}) => [styles.statusIn,{opacity: pressed ? 0.7 : 1 }]}
                            >
                            <Image source={won} style={{height:25,width:25}}/>
                            <Text style={{fontSize: 17,textAlignVertical:'center'}}> 
                            &nbsp;{burgerDTO[0].price <= 0 ? '가격 정보 없음' : burgerDTO[0].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</Text>
                            <Text style={[styles.status,{backgroundColor:burgerDTO[0].status === 0 ? '#2E8DFF' : 'tomato'}]}>
                                {burgerDTO[0].status === 0 ? '판매중' : '단종' }</Text>
                        </Pressable>
                    </View>}
                    <View style={{flexDirection:'row',marginHorizontal: '5%',justifyContent:'space-between',marginBottom: 5}}>
                        {burgerDTO[0].type !== 2 &&<Text style={styles.h3}>{storeDTO ? storeDTO.name : '없는 매장'}</Text>}
                        {burgerDTO[0].type === 2 && <Text style={styles.h3}>{burgerDTO[1] ? burgerDTO[1].name : '탈퇴 회원'}</Text>}
                        {storeDTO && <View style={{flexDirection:'row',backgroundColor:'whitesmoke',borderRadius:5,padding:3}}>    
                            {storeDTO.type === 1 && <Pressable onPress={() => onMapStore()}
                            style={{marginHorizontal:5}}>
                                <Image source={mapIcon} style={{height:30,width:30}}/>
                            </Pressable>}
                            {(storeDTO.type === 0 || storeDTO.type === 1) && <Pressable style={{marginHorizontal:5}}
                            onPress={() => navigation.navigate('List',{ type : storeDTO.type, search: storeDTO.name })}>
                                <Image source={searchIcon} style={{height:30,width:30}}/>
                            </Pressable>}
                        </View>}
                    </View>
                </View>}
                <Pressable style={styles.starOut} onPress={() => setReview(true)}>
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                        <View style={{flexDirection:'row'}}>
                        <Image source={starOne} style={{width:20,height:20}}/>
                        {ratings.length > 0 ? <View style={{flexDirection:'row'}}>
                            <Text style={{fontSize: 15,fontWeight: 'bold'}}> 
                            &nbsp;{(ratings.reduce((acc, cur) => acc + cur[0].rate , 0) / ratings.length).toFixed(2)} | </Text>
                            <Image source={people} style={{width:20,height:20}}/>
                            <Text style={{fontSize: 15,fontWeight: 'bold'}}> {ratings.length}</Text></View>
                        : <Text style={{fontSize: 15,fontWeight: 'bold'}}> 등록된 평가가 없습니다</Text>}</View>
                        <Pressable style={{marginRight:5}} onPress={() => setReview(true)}>
                            <Text style={styles.beRate}>평가</Text>
                        </Pressable>
                    </View>
                    <View style={styles.starBox}>
                        <View style={[styles.starBack,{width : 
                            ratings.reduce((acc, cur) => acc + cur[0].rate , 0) / ratings.length * 20 + '%'}]}/>
                        <Image source={ratings.length > 0 ? star : starNone } style={styles.starImg}/>
                    </View>
                </Pressable>
                {first ? 
                    <View style={{width:'90%',height:80 ,overflow:'hidden', marginVertical: '5%',
                        marginLeft:'5%', borderRadius:10}}>
                            <Skel width={windowWidth*0.9} height={80}/>
                    </View>
                    : <Text style={styles.content}>{burgerDTO[0].content}</Text>}
                {first ? 
                    <View style={{width:250, height:250, overflow:'hidden', marginVertical: '3%',
                    alignSelf:'center' , borderRadius:5}}>
                        <Skel width={250} height={250}/>
                    </View>
                : <View style={styles.nut}>
                    <Text style={styles.nutTitle}>예상 영양 정보</Text>
                    <Text style={styles.nutTxt}>탄수화물&nbsp;
                        {((makeDTO.reduce((acc, cur) => acc + ingres.find(ing => ing.ingreSeq === cur).carbohydrates, 0) +
                        (makeDTO.length > 0 && ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 && 
                        ingres.find(ing => ing.ingreSeq === makeDTO[0]).carbohydrates)) * 
                        (burgerDTO[0].size === 0 ? 0.85 : burgerDTO[0].size === 2 ? 1.19 : burgerDTO[0].size === 1 && 1 )).toFixed(1)}g
                    </Text>
                    <Text style={styles.nutTxt}>단백질&nbsp;
                        {((makeDTO.reduce((acc, cur) => acc + ingres.find(ing => ing.ingreSeq === cur).protein, 0) +
                            (makeDTO.length > 0 && ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 && 
                            ingres.find(ing => ing.ingreSeq === makeDTO[0]).protein)) * 
                            (burgerDTO[0].size === 0 ? 0.85 : burgerDTO[0].size === 2 ? 1.19 : burgerDTO[0].size === 1 && 1 )).toFixed(1)}g
                    </Text>
                    <Text style={styles.nutTxt}>지방&nbsp;
                        {((makeDTO.reduce((acc, cur) => acc + ingres.find(ing => ing.ingreSeq === cur).lipid, 0) +
                            (makeDTO.length > 0 && ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 && 
                            ingres.find(ing => ing.ingreSeq === makeDTO[0]).lipid)) * 
                            (burgerDTO[0].size === 0 ? 0.85 : burgerDTO[0].size === 2 ? 1.19 : burgerDTO[0].size === 1 && 1 )).toFixed(1)}g
                    </Text>
                    <Text style={styles.kcalTxt}>총&nbsp;
                        {parseInt((makeDTO.reduce((acc, cur) => acc + ingres.find(ing => ing.ingreSeq === cur).kcal, 0) +
                        (makeDTO.length > 0 && ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 && 
                        ingres.find(ing => ing.ingreSeq === makeDTO[0]).kcal)) * 
                        (burgerDTO[0].size === 0 ? 0.85 : burgerDTO[0].size === 2 ? 1.19 : burgerDTO[0].size === 1 && 1 ))}
                    Kcal</Text>
                </View>}
                <View style={{paddingBottom:30}}/>
            </ScrollView>
            <View {...panResponder3.panHandlers} style={styles.reviewOpen}>
                <Image style={styles.dragImg} source={drag}/>
            </View>
                <Modal 
                    animationType="fade"
                    visible={status}
                    transparent={true}>
                        <View style={{flex:1,justifyContent:'center',backgroundColor: '#00000050'}}>
                        <Pressable style={{position:'absolute',top:10,right:10}}
                            onPress={() => setStatus(false)}>
                            <Image source={deleteImg} style={{width:40,height:40}}/>
                        </Pressable>
                            <View style={styles.statusModal}>
                                <View style={{flexDirection:'row',marginBottom:20}}><Text style={styles.h2}>판매 여부 변동</Text></View>
                                <View style={{flexDirection:'row',justifyContent:'space-evenly'}}>
                                    <Pressable
                                        onPress={() => onStatus(0)}
                                        style={({pressed}) => [styles.statBut,{backgroundColor: '#2E8DFF' ,opacity: pressed ? 0.7 : 1}]}>
                                        <Text style={styles.statButTxt}>판매중</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={() => onStatus(1)}
                                        style={({pressed}) => [styles.statBut,{backgroundColor: 'tomato' ,opacity: pressed ? 0.7 : 1}]}>
                                        <Text style={styles.statButTxt}>단종</Text>
                                    </Pressable>
                                </View>
                                <View style={{flexDirection:'row',marginTop:20}}><Text style={styles.h2}>가격 변동</Text></View>
                                <View style={{flexDirection:'row',justifyContent:'space-around',paddingHorizontal:'4%',marginTop:20}}>
                                    <TextInput 
                                        keyboardType="numeric"
                                        value={price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 
                                        style={styles.txtBox}
                                        onSubmitEditing={ onPrice }
                                        onChangeText={(text) => setPrice(text.replace(/[^0-9]/g, ''))} />
                                    <Pressable
                                        onPress={ onPrice }
                                        style={({pressed}) => [styles.priceBut,{opacity: pressed ? 0.7 : 1}]}>
                                        <Text style={styles.priceButTxt}>신청</Text>
                                    </Pressable>
                                </View>
                                <Text style={{marginHorizontal:20,marginBottom: 10,fontSize: 12}}>
                                    *2개 이상의 동일한 신청 발생시 가격 변동</Text>
                                <View style={{flexDirection:'row'}}><Text style={styles.h2}>신청 기록</Text></View>
                                <Text style={{marginHorizontal:20,marginVertical: 5,fontSize: 12}}>*가격 변동 시 초기화</Text>
                                <ScrollView style={styles.priceList}>
                                    {priceList.map((item,index) => <View key={index}
                                        style={styles.priceItem}>
                                        <Text style={{fontSize:15,fontWeight:'bold',color:'gray'}}>
                                            {item.req.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원 | {getToday(item.logTime)}</Text>
                                        <Pressable 
                                            onPress={() => item.userSeq === state.user.userSeq ? onPriceDelete(item.statusSeq) : setPrice(item.req)}
                                            style={[styles.itemBut,{backgroundColor: item.userSeq === state.user.userSeq ? 'tomato' : '#2E8DFF'}]}>
                                            <Text style={styles.itemButTxt}>{item.userSeq === state.user.userSeq ? '취소' : '선택'}</Text>
                                        </Pressable>
                                    </View>)}
                                </ScrollView>
                            </View>
                        </View>
                </Modal>
                <Modal 
                    animationType="fade"
                    visible={mapModal}
                    transparent={true}>
                        <MapModal mapDTO={mapDTO} onClose={onClose}/>
                </Modal>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={review}>
                    <View style={{flex : 1, flexDirection:'column-reverse'}}>                          
                        <View style={styles.review}>
                            <View {...panResponder2.panHandlers}>
                                <Image style={styles.dragImg} source={drag}/>
                            </View>
                            { state.user.userSeq !== -1 ? <View>
                            <View style={{flexDirection:'row'}}><Text style={styles.h2}>평점</Text></View>
                            <View style={styles.starBoxModal} {...panResponder.panHandlers} onLayout={starLayout}>
                                <View style={[styles.starBackModal,{width : rate + '%'}]}/>
                                <Image source={star} style={styles.starImgModal}/>
                            </View>
                            <View style={{flexDirection:'row'}}>
                            <View style={{width: store ? '50%' : '100%'}}>
                                <View style={{flexDirection:'row'}}><Text style={[styles.h2]}>평가 내용</Text></View>
                                <TextInput value={content} multiline={true} maxLength={500} 
                                    style={[styles.contentInput,{height: store ? 160 : 85}]} numberOfLines={3}
                                    onChangeText={(text) => setContent(text)} onSubmitEditing={() => onSub()}/>
                                {burgerDTO[0] && 
                                    burgerDTO[0].type === 0 && <View style={{flexDirection:'row',zIndex:30}}>
                                    <Text style={[styles.h2,{marginTop: store ? '7%' : '3.5%'}]}>지점</Text>
                                    <Switch 
                                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                                        thumbColor={'white'}
                                        onValueChange={() => {
                                            setStore(!store)
                                            setPlaceDTO()
                                        }}
                                        value={store}
                                    />
                                    {placeDTO && <Text 
                                        style={{fontSize:14,verticalAlign:'middle',marginLeft:5,color:'gray',fontWeight:'bold'}}>
                                        #{placeDTO.placeName.split(' ')[placeDTO.placeName.split(' ').length-1]}</Text>}
                                </View>}
                            </View>
                            { store &&
                                <View style={{width:'50%'}}>
                                    <Map type={2} onPlace={onPlace}/>
                                </View>
                            }
                            </View>
                            <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                                <Text style={{verticalAlign:'bottom',fontSize:19,fontWeight:'bold'}}>평가 [{ratings.length}]</Text>
                                <Pressable 
                                    onPress={() => onSub()}>
                                    <Image source={addImg} style={{width:40,height:40}}/>
                                </Pressable>
                            </View>
                            </View> :
                            <View>
                                <Pressable style={{paddingHorizontal: 10, paddingVertical:20}}
                                onPress={() => onPage(3)}>
                                    <Text style={{fontSize: 20,fontWeight: 'bold',textAlign: 'center'}}>로그인 후 리뷰 작성</Text>
                                </Pressable>
                                <Text style={{verticalAlign:'bottom',fontSize:19,fontWeight:'bold'}}>평가 [{ratings.length}]</Text>
                            </View> 
                            }
                            <View style={styles.line}/>
                            <FlatList
                            data={ratings}
                            renderItem={(data) => <View style={styles.reviewItem} key={data.index}>
                                <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:5}}>
                                    <View style={{flexDirection:'row',marginBottom:5,width:'90%',flexWrap:'wrap'}}>
                                        <View style={styles.reviewStar}>
                                        <Image source={starOne} style={{width:18,height:18}}/>
                                        <Text style={{fontSize: 15,fontWeight: 'bold'}}> {data.item[0].rate} </Text></View>
                                        <Text style={styles.reviewName}>{data.item[1] ? data.item[1].name : '탈퇴한 회원'}</Text>
                                        <Text style={styles.reviewTime}> | {getToday(data.item[0].logTime)}</Text>
                                        {data.item[0].placeName && <Pressable style={{flexDirection:'row'}}
                                            onPress={() => onMapPlace(data.item[0])}>
                                            <Text style={styles.reviewPlace}> #{data.item[0].placeName.split(' ')
                                                [data.item[0].placeName.split(' ').length - 1]} </Text>
                                            <Image source={mapIcon} style={{height:22,width:22}}/>
                                        </Pressable>}
                                    </View>
                                    {data.item[0] && state.user.userSeq === data.item[0].userSeq && 
                                        <Pressable onPress={() => onDelete(data.item[0].ratingSeq)}>
                                            <Image source={deleteImg} style={{width:30,height:30}}/>
                                        </Pressable>
                                    }
                                </View>
                                <Text style={{fontSize:15,paddingHorizontal:10}}>{data.item[0].content}</Text>
                            </View>}
                            alwaysBounceVertical={false}
                            />
                        </View>
                        <TouchableWithoutFeedback onPress={() => setReview(false)}>
                                <View style={{flex: 1}}/>
                        </TouchableWithoutFeedback>  
                    </View>
                </Modal>
                <Modal
                    animationType="fade"
                    visible={tabModal}
                    transparent={true}>
                    <TouchableWithoutFeedback onPress={() => setTabModal(false)}>
                        <View style={{flex:1,justifyContent:'center',backgroundColor: '#00000050'}}>
                            {!first && 
                            <View style={styles.tabBox}>
                                <Text style={styles.num}>NO.{burgerDTO[0].burgerSeq} {burgerDTO[0].name}</Text>
                                {((burgerDTO[1] && burgerDTO[1].userSeq === state.user.userSeq) || state.user.own === 2) && <View>
                                    <Pressable onPress={() => {
                                            setTabModal(false)
                                            navigation.navigate('Update', { updateSeq : burgerDTO[0].burgerSeq })
                                        }}
                                        style={({pressed}) => [styles.tabBut,{backgroundColor: pressed ? 'whitesmoke' : 'white'}]}>
                                        <Text style={styles.tabButTxt}>버거 수정</Text>
                                    </Pressable>
                                    {(burgerDTO[0].type === 2 || state.user.own === 2) &&
                                    <Pressable onPress={ onBurgerDelete }
                                        style={({pressed}) => [styles.tabBut,{backgroundColor: pressed ? 'whitesmoke' : 'white'}]}>
                                        <Text style={styles.tabButTxt}>버거 삭제</Text>
                                    </Pressable>}      
                                </View>}
                                <Pressable
                                    style={({pressed}) => [styles.tabBut,{backgroundColor: pressed ? 'whitesmoke' : 'white'}]}
                                    onPress={() => {
                                        if(state.user.userSeq === -1) onAlertTxt('로그인 후 이용가능') 
                                        else {
                                        setStatus(true)
                                        setTabModal(false)
                                    }}}>
                                    <Text style={styles.tabButTxt}>변동 신청</Text>
                                </Pressable>
                                {storeDTO && <View>    
                                    {storeDTO.type === 1 && <Pressable onPress={() => {
                                        onMapStore()
                                        setTabModal(false)
                                    }}
                                    style={({pressed}) => [styles.tabBut,{backgroundColor: pressed ? 'whitesmoke' : 'white'}]}>
                                        <Text style={styles.tabButTxt}>매장 위치</Text>
                                    </Pressable>}
                                    {(storeDTO.type === 0 || storeDTO.type === 1) && <Pressable 
                                    style={({pressed}) => [styles.tabBut,{backgroundColor: pressed ? 'whitesmoke' : 'white'}]}
                                    onPress={() => {
                                        navigation.navigate('List',{ type : storeDTO.type, search: storeDTO.name })
                                        setTabModal(false)
                                    }}>
                                        <Text style={styles.tabButTxt}>매장 검색</Text>
                                    </Pressable>}
                                </View>}
                            </View>}
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    makeContainer : {
        width: '70%',
        justifyContent: 'center',
        alignSelf : 'center',
        marginTop: 10,
        paddingVertical: 20
    },
    h1 : {
        textAlign : 'center',
        fontSize: 25,
        fontWeight: 'bold',
        marginVertical: 5
    },
    h2 : {
        borderTopColor: 'white',
        borderTopWidth: 10,
        backgroundColor: '#c7c7c7',
        fontSize: 17,
        fontWeight: 'bold',
        paddingHorizontal: 5,
        marginLeft: 5
    },
    h3 : {
        color:'gray',
        fontSize: 19,
        fontWeight: 'bold',
        borderBottomWidth: 4,
        borderBottomColor: 'lightgray',
        marginTop: 5
    },
    itemBut : {
        marginHorizontal: 3,
        width: 35,
        height: 25,
        justifyContent:'center',
        alignItems:'center',
        borderRadius: 5,
    },
    itemButTxt : {
        color:'white',
        fontWeight: 'bold',
        fontSize: 13
    },
    line : {
        marginVertical: 2,
        height: 2,
        backgroundColor: 'lightgray'
    },
    content : {
        marginVertical: 20,
        marginHorizontal: '5%',
        fontSize: 16,
        borderRadius: 10,
        paddingHorizontal: '5%',
        paddingVertical: '5%',
        backgroundColor: 'whitesmoke',
        elevation: 5
    },
    reviewOpen : {
        backgroundColor: 'white',
        height: '10%',
        marginTop: '-6%',
        marginHorizontal : '1%',
        elevation: 10,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: '2%'
    },
    num : {
        fontSize: 16,
        alignSelf:'center',
        color: 'gray',
        fontWeight:'bold',
        marginVertical: 10
    },
    status : {
        marginLeft: 10,
        borderRadius: 5,
        width: 70,
        alignItems :'center',
        textAlign:'center',
        fontSize: 16,
        fontWeight:'bold',
        color:'white'
    },
    statusIn : {
        flexDirection:'row',
        padding:5,
        borderRadius: 10,
        borderWidth:2,
        borderColor:'lightgray',
        backgroundColor:'whitesmoke',
    },
    ingreOut : {
        width: 100,
        position: 'absolute',
        flexDirection:'row',
        top: 15,
        zIndex: 9999,
    },
    fold : {
        height: 40,
        opacity: 0.5,
        backgroundColor:'#666666',
        justifyContent:'center',
        alignItems:'center',
        overflow:'hidden'
    },
    ingreInfo : {
        paddingHorizontal: 7,
        width: 100,
        opacity: 0.5,
        borderWidth: 1,
        borderColor:'black',
        backgroundColor:'white',
        borderLeftWidth: 0,
        paddingBottom: 5,
    },
    ingreTxt : {
        fontSize: 13,
        marginVertical: 1,
        fontWeight:'bold',
        paddingBottom: 3,
        paddingTop: 2,
        borderBottomColor: 'black',
        borderBottomWidth: 1
    },
    ////////status Modal////////
    statusModal : {
        backgroundColor: 'white',
        elevation: 10,
        borderRadius: 20,
        padding: 10,
        paddingVertical: 30,
        marginHorizontal: '4%',
    },
    statBut : {
        width: 100,
        paddingVertical: 10,
        borderRadius: 10
    },
    statButTxt : {
        textAlign:'center',
        fontSize: 17,
        fontWeight:'bold',
        color: 'white'
    },
    priceList : {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'darkgray',
        height: '25%',
        marginHorizontal: '4%',
        overflow:'hidden',
    },
    txtBox : {
        width: '60%',
        fontSize: 15,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'darkgray',
        marginBottom: 10,
        padding: 3
    },
    priceBut : {
        width: '20%',
        borderRadius: 5,
        justifyContent: 'center',
        borderWidth: 2,
        borderColor:'lightgray',
        backgroundColor :'whitesmoke',
        height: 35,
    },
    priceButTxt : {
        textAlign:'center',
        fontWeight:'bold',
        fontSize: 15,
        color: 'gray'
    },
    priceItem : {
        padding:7, 
        borderBottomWidth:1, 
        borderBottomColor:'lightgray', 
        backgroundColor:'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopLeftRadius:5,
        borderTopRightRadius:5,
    },
    /////////평점///////////////
    starOut : {
        borderWidth: 2,
        borderColor: 'black',
        marginHorizontal: '15%',
        padding: '1%',
        borderRadius: 5,
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
        width: '100%',
        aspectRatio: 2900 / 512,
        alignSelf: 'center',
        margin: 5
    },
    beRate : {
        fontSize:15,
        fontWeight:'bold',
        color:'gray',
        borderBottomColor:'gray',
        borderBottomWidth:2
    },
    ////////리뷰 모달/////////
    review : {
        flex: 4,
        backgroundColor: 'white',
        marginHorizontal : '1%',
        elevation: 20,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: '2%'
    },
    reviewStar : {
        flexDirection:'row',
        marginRight: 7,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 3,
        paddingTop: 2,
        paddingLeft: 2.5,
    },
    reviewName :{
        verticalAlign:'middle',
        fontSize : 17,
        fontWeight : 'bold',
        color: 'gray'
    },
    reviewPlace :{
        verticalAlign:'middle',
        fontSize : 17,
        color:'gray'
    },
    reviewTime :{
        fontSize: 14,
        color: 'gray',
        paddingTop: 5
    },
    reviewItem : {
        borderBottomColor:'lightgray',
        borderBottomWidth: 2,
        paddingVertical: 10
    },
    dragImg : {
        width: 40,
        height: 40,
        alignSelf: 'center'
    },
    starBoxModal : {
        width: '60%',
        aspectRatio: 2900 / 512,
        alignSelf: 'center',
        marginVertical: 10
    },
    starImgModal : {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    },
    starBackModal : {
        position : 'absolute',
        borderWidth: 1,
        borderColor: 'white',
        height: '100%',
        backgroundColor : '#f7d158'
    },
    contentInput : {
        borderWidth: 2,
        borderRadius: 15,
        fontSize: 16,
        padding: 7,
        alignSelf: 'center',
        textAlignVertical: 'top',
        margin : 10,
        width: '95%',
        overflow:'scroll'
    },
    nut : {
        marginTop: 5,
        alignSelf:'center',
        width: '60%',
        padding: '3%'
    },
    nutTitle : {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'gray',
        borderBottomWidth: 2,
        borderBottomColor: 'gray',
        paddingBottom: 3,
        marginBottom: 3
    },
    nutTxt : {
        fontSize: 16,
        color: 'gray',
        marginVertical: 2
    },
    kcalTxt: {
        borderTopWidth: 2,
        borderTopColor: 'gray',
        fontSize: 18,
        color: 'gray',
        fontWeight: 'bold',
        paddingTop: 3,
        marginTop: 3
    },
    ///////////tabModal//////////
    tabBox : {
        width: '70%',
        borderRadius: 5,
        overflow:'hidden',
        backgroundColor:'white',
        alignSelf:'center',
        elevation:5
    },
    tabBut : {
        width: '100%',
        height: 50,
        justifyContent:'center',
    },
    tabButTxt: {
        fontSize: 17,
        fontWeight: 'bold',
        textAlign:'center'
    }
})

export default HamburgerView;