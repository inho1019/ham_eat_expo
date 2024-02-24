import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Keyboard, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import addImg from '../../assets/burger/add_review.png'
import deleteImg from '../../assets/burger/delete.png'
import drag from '../../assets/burger/drag.png'
import star from '../../assets/burger/star.png'
import starNone from '../../assets/burger/star_none.png'
import starOne from '../../assets/burger/star_one.png'
import people from '../../assets/burger/people.png'
import foldT from '../../assets/burger/fold_true.png'
import foldF from '../../assets/burger/fold_false.png'
import won from '../../assets/burger/won.png'
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

    useEffect(() => {
        navigation.setOptions({
            title: ''
        });
        onLoading(true)
        axios.get(`https://hameat.onrender.com/rating/listSeq/${route.params?.burgerSeq}`)
            .then(res => {
            setRatings(res.data)
            axios.get(`https://hameat.onrender.com/ingre/list`)
            .then(res => {
                setIngres(res.data)
                axios.get(`https://hameat.onrender.com/burger/view/${route.params?.burgerSeq}`)
                .then(res => {
                    setBurgerDTO(res.data)
                    setMakeDTO(JSON.parse(res.data[0].make))
                    navigation.setOptions({
                        title: res.data[0].name
                    });
                    axios.get(`https://hameat.onrender.com/store/getSeq/${res.data[0].storeSeq}`)
                    .then(res => {
                        setStoreDTO(res.data)
                        onLoading(false)
                        setFirst(false)
                    })
                    .catch(() => {
                        onAlertTxt('불러오기 중 에러발생')
                        onLoading(false)
                        setFirst(false)
                    })
                })
                .catch(() => {
                    onAlertTxt('불러오기 중 에러발생')
                    onLoading(false)
                    setFirst(false)
                })
            })
            .catch(() => {
                onAlertTxt('불러오기 중 에러발생')
                onLoading(false)
                setFirst(false)
            })
        })
        .catch(() => {
            onAlertTxt('불러오기 중 에러발생')
            onLoading(false)
            setFirst(false)
        })
    },[route])

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
    return (
        <View>
            <ScrollView style={{height:'95%'}}>
                <Pressable onPress={() => setFold(!fold)} style={styles.fold}>
                    <Image source={fold ? foldT : foldF} style={{height:40,width:40}}/>
                </Pressable>
                {first && <View style={{width:200,height:200,overflow:'hidden',
                    alignSelf:'center', borderRadius:5, marginVertical:'5%'}}>
                        <Skel height={200} width={200}/>
                </View>}
                {!first && makeDTO.length > 0 && <Pressable 
                    onPress={() => setFold(!fold)}
                    style={styles.makeContainer}>
                    {makeDTO.map((item,index) => {
                        const getIngre = ingres.find(ing => ing.ingreSeq === item)
                        return <Image key={index} style={
                            {width: burgerDTO[0].size === 0 ? '50%' : burgerDTO[0].size === 2 ? '90%' : '70%',
                            aspectRatio: getIngre.width / getIngre.height + 
                                (burgerDTO[0].size === 0 ? - 0.3 : burgerDTO[0].size === 2 && + 0.4),
                            marginBottom: fold ? (((getIngre.type === 2 || getIngre.type === 3) && 
                                getIngre.height > 170 ? -(windowWidth*0.158) : -(windowWidth*0.126)) + 
                                (burgerDTO[0].size === 0 ? + (windowWidth*0.023) : burgerDTO[0].size === 2 && + -(windowWidth*0.019))) : 0,
                            zIndex:-index,alignSelf: 'center'}}
                            source={{ uri : getIngre.image}}
                            resizeMode='stretch'/>
                        })}
                    <Image 
                    source={{ uri : ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                        ingres.find(ing => ing.ingreSeq === makeDTO[0]).image :
                        'https://codingdiary.s3.eu-west-2.amazonaws.com/burger/normal_bun.png'}} 
                        style={{width: burgerDTO[0].size === 0 ? '50%' : burgerDTO[0].size === 2 ? '90%' : '70%',alignSelf:'center',
                        aspectRatio: 500/(ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                        ingres.find(ing => ing.ingreSeq === makeDTO[0]).height : 160), 
                        zIndex: -makeDTO.length,marginTop: burgerDTO[0].size === 0 ? 7 : burgerDTO[0].size === 1 ? 3 : 0}} />
                </Pressable>}
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
                    {burgerDTO[0].type !== 2 &&<View style={{flexDirection:'row',justifyContent:'center', marginTop:5}}>
                        <Image source={won} style={{height:25,width:25}}/>
                        <Text style={{fontSize: 17,textAlignVertical:'center'}}> 
                        &nbsp;{burgerDTO[0].price <= 0 ? '가격 정보가 없습니다' : burgerDTO[0].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }</Text>
                    </View>}
                    <View style={{flexDirection:'row',marginHorizontal: '5%',justifyContent:'space-between',marginBottom: 5}}>
                        {burgerDTO[0].type !== 2 &&<Text style={styles.h3}>{storeDTO ? storeDTO.name : '없는 매장'}</Text>}
                        {burgerDTO[0].type === 2 && <Text style={styles.h3}>{burgerDTO[1] ? burgerDTO[1].name : '탈퇴 회원'}</Text>}
                        {storeDTO && <View style={{flexDirection:'row',backgroundColor:'lightgray',borderRadius:5,padding:3}}>    
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
                {first && 
                    <View style={{width:'90%',height:80 ,overflow:'hidden', marginVertical: '5%',
                        marginLeft:'5%', borderRadius:10}}>
                            <Skel width={windowWidth*0.9} height={80}/>
                    </View>}
                {!first && burgerDTO[0] && <Text style={styles.content}>{burgerDTO[0].content}</Text>}
                {first && 
                    <View style={{width:250, height:250, overflow:'hidden', marginVertical: '3%',
                        alignSelf:'center' , borderRadius:5}}>
                            <Skel width={250} height={250}/>
                    </View>}
                {burgerDTO[0] && <View style={styles.nut}>
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
            </ScrollView>
                <Text></Text>
            <View {...panResponder3.panHandlers} style={styles.reviewOpen}>
                <Image style={styles.dragImg} source={drag}/>
            </View>
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
        marginTop: 10
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
    fold : {
        position: 'absolute',
        width:40,
        height: 40,
        top: 30,
        right: 30
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
})

export default HamburgerView;