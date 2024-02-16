import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import burgerAdd from '../../assets/burger/burger_add.png'
import star from '../../assets/burger/star.png'
import starNone from '../../assets/burger/star_none.png'
import axios from 'axios';
import { useAppContext } from '../api/ContextAPI';
import { Skel } from 'react-native-ui-skel-expo'

const HamburgerHome = (props) => {
    const{navigation,route} = props

    const windowWidth = Dimensions.get('window').width;

    const [ingres,setIngres] = useState([])
    const [makeDTO,setMakeDTO] = useState([])
    const [burger,setBurger] = useState({})
    const [fren,setFren] = useState([])
    const [hand,setHand] = useState([])
    const [diy,setDiy] = useState([])
    const [ratings,setRatings] = useState([])
    const [first,setFirst] = useState(true)
   
    const { state, dispatch } = useAppContext();

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

    useEffect(()=>{
        if(state.view !== -1) {
            navigation.navigate('View',{ burgerSeq : state.view })
            onView(-1)
        }
        setAlertTxt(route.params?.alertTxt || '') 
        const unsubscribe = navigation.addListener('focus', () => {
            onLoading(true)
            axios.get(`https://hameat.onrender.com/ingre/list`)
            .then(res => {
                setIngres(res.data)
                axios.get(`https://hameat.onrender.com/burger/listHome/0`)
                .then(res0 => {
                    setFren(res0.data)
                    axios.get(`https://hameat.onrender.com/burger/listHome/1`)
                    .then(res1 => {
                        setHand(res1.data)
                        axios.get(`https://hameat.onrender.com/burger/listHome/2`)
                        .then(res2 => {
                            setDiy(res2.data)
                            const ran = Math.floor(Math.random() * 3)
                            setMakeDTO(ran === 0 ? JSON.parse(res0.data[0].make) : 
                                        ran === 1 ? JSON.parse(res1.data[0].make) : JSON.parse(res2.data[0].make))
                            setBurger(ran === 0 ? res0.data[0] : 
                                        ran === 1 ? res1.data[0] : res2.data[0])
                            axios.get(`https://hameat.onrender.com/rating/listSeq/${
                                        ran === 0 ? res0.data[0].burgerSeq : ran === 1 ? res1.data[0].burgerSeq : res2.data[0].burgerSeq}`)
                            .then(res => {
                                setRatings(res.data)
                                onLoading(false)
                                setFirst(false)
                            })
                            .catch(() => {
                                setAlertTxt('불러오기 중 에러발생')
                                onLoading(false)
                                setFirst(false)
                            })
                        })
                        .catch(() => {
                            setAlertTxt('불러오기 중 에러발생')
                            onLoading(false)
                            setFirst(false)
                        })
                    })
                    .catch(() => {
                        setAlertTxt('불러오기 중 에러발생')
                        onLoading(false)
                        setFirst(false)
                    })
                })
                .catch(() => {
                    setAlertTxt('불러오기 중 에러발생')
                    onLoading(false)
                    setFirst(false)
                })
            })
            .catch(() => {
                setAlertTxt('불러오기 중 에러발생')
                onLoading(false)
                setFirst(false)
            })
        });
        return unsubscribe;
    },[navigation,route])
    
    return (
        <ScrollView style={{flex:1}}>
            <View
                style={styles.h1Out}>
                <Text style={styles.h1}>신규 추천 버거</Text>
            </View>
                {first ? 
                <View style={{width:'95%',aspectRatio:5/2, marginLeft:'2.5%', marginVertical:'5%'}}>
                    <View style={{flexDirection:'row'}}>
                        <View style={[styles.itemSkel,{height:'100%'}]}>
                        <Skel height={'100%'} width={windowWidth*0.45}/></View>
                        <View style={{marginLeft:'5%'}}>
                            <View style={[styles.itemSkel,{height:'32%'}]}>
                                <Skel height={'100%'} width={windowWidth*0.45}/>
                            </View>
                            <View style={[styles.itemSkel,{height:'26%',marginVertical:'4%'}]}>
                                <Skel height={'100%'} width={windowWidth*0.45}/>
                            </View>
                            <View style={[styles.itemSkel,{height:'27%'}]}>
                                <Skel height={'100%'} width={windowWidth*0.45}/>
                            </View>
                        </View>
                    </View>
                </View> :
                <View>{makeDTO.length > 0 &&
                    <Pressable style={styles.recomContainer}
                        onPress={() => navigation.navigate('View', { burgerSeq : burger.burgerSeq })}>
                        <View style={styles.makeContainer}>
                            {makeDTO.map((item,index) => {
                                const getIngre = ingres.find(ing => ing.ingreSeq === item)
                                return <Image key={index} style={
                                    {width: burger.size === 0 ? '50%' : burger.size === 2 ? '90%' : '70%',
                                    aspectRatio: getIngre.width / getIngre.height + 
                                        (burger.size === 0 ? - 0.3 : burger.size === 2 && + 0.4),
                                    marginBottom: ((getIngre.type === 2 || getIngre.type === 3) && 
                                        getIngre.height > 170 ? -(windowWidth*0.105) : -(windowWidth*0.084)) + 
                                        (burger.size === 0 ? + (windowWidth*0.015) : burger.size === 2 && + -(windowWidth*0.012)),
                                    zIndex:-index,alignSelf: 'center'}}
                                    source={{ uri : getIngre.image}}
                                    resizeMode='stretch'/>
                                })}
                            <Image 
                            source={{ uri : ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                                ingres.find(ing => ing.ingreSeq === makeDTO[0]).image :
                                'https://codingdiary.s3.eu-west-2.amazonaws.com/burger/normal_bun.png'}} 
                                style={{width: burger.size === 0 ? '50%' : burger.size === 2 ? '90%' : '70%',alignSelf:'center',
                                aspectRatio: 500/(ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                                ingres.find(ing => ing.ingreSeq === makeDTO[0]).height : 160), 
                                zIndex: -makeDTO.length,marginTop: burger.size === 0 ? 7 : burger.size === 1 ? 3 : 0}} />
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={{fontWeight:'bold',fontSize:22,textAlign:'center'}}>{burger.name}</Text>
                            <Text style={{padding: 10,fontSize:16,textAlign:'center'}} >{burger.content}</Text>
                            <View style={styles.starBox}>
                                <View style={[styles.starBack,{width : 
                                    ratings.reduce((acc, cur) => acc + cur[0].rate , 0) * 20 / ratings.length + '%'}]}/>
                                <Image source={ratings.length > 0 ? star : starNone } style={styles.starImg}/>
                            </View>
                        </View>
                    </Pressable>}</View>
                }
            <View style={styles.buttonContainer}>    
                <Pressable
                    style={({pressed}) => [
                        styles.burgerBut, {elevation: pressed ? 2 : 10} 
                    ]}
                    onPress={() => state.user.userSeq !== -1 ? navigation.navigate('Form') : onPage(3)}>
                    <Image source={burgerAdd} style={styles.burgerIcon}/>
                    <Text style={styles.burgerText}>버거 등록</Text>
                </Pressable>
            </View> 
            <Pressable
                onPress={() => navigation.navigate('List',{ type : 0 })}>
                <View
                style={styles.h1Out}>
                    <Text style={styles.h1}>프렌차이즈 버거</Text>
                </View>       
                {first  ? 
                <View style={{width:'95%',aspectRatio:5/2,overflow:'hidden',
                    marginLeft:'2.5%', borderRadius:5, marginTop:'5%'}}>
                        <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                        <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                        <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                </View> :
                <View style={styles.itemBox}>
                    {fren.map((item,index) => <View style={styles.item} key={index}>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={styles.itemNew}>new</Text>
                        <View style={{width : '90%'}}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.itemContent}>{item.content}</Text>
                        </View>
                        </View>
                    </View>)}
                </View>}
            </Pressable>
            <Pressable
                onPress={() => navigation.navigate('List',{ type : 1 })}>
                <View
                style={styles.h1Out}>
                    <Text style={styles.h1}>수제 버거</Text>
                </View>
                {first  ? 
                <View style={{width:'95%',aspectRatio:5/2,overflow:'hidden',
                    marginLeft:'2.5%', borderRadius:5, marginTop:'5%'}}>
                        <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                        <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                        <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                </View> :
                <View style={styles.itemBox}>
                    {hand.map((item,index) => <View style={styles.item} key={index}>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={styles.itemNew}>new</Text>
                        <View style={{width : '90%'}}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.itemContent}>{item.content}</Text>
                        </View>
                        </View>
                    </View>)}
                </View>}
            </Pressable>
            <Pressable
                onPress={() => navigation.navigate('List',{ type : 2 })}>
                <View
                style={styles.h1Out}>
                    <Text style={styles.h1}>DIY 버거</Text>
                </View>
                {first  ? 
                <View style={{width:'95%',aspectRatio:5/2,overflow:'hidden',
                    marginLeft:'2.5%', borderRadius:5, marginTop:'5%'}}>
                        <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                        <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                        <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                </View> :
                <View style={styles.itemBox}>
                    {diy.map((item,index) => <View style={styles.item} key={index}>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={styles.itemNew}>new</Text>
                        <View style={{width : '90%'}}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text numberOfLines={1} ellipsizeMode="tail" style={styles.itemContent}>{item.content}</Text>
                        </View>
                        </View>
                    </View>)}
                </View>}
            </Pressable>
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    recomContainer : {
        flexDirection: 'row',
        width: '95%',
        alignSelf: 'center',
        marginTop: 10,
        paddingVertical: 15,
    },
    makeContainer : {
        width: '50%',
        justifyContent: 'center',
    },
    infoContainer : {
        width: '50%',
        paddingRight: 10
    },
/////////평점///////////////
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
///////아이템 관련///////////////////
    h1Out : {
        flexDirection:'row',
        justifyContent:'space-between',
        borderBottomColor:'black',
        borderBottomWidth:2,
        paddingBottom:3,
        marginHorizontal: 10,
        marginTop: 20,
    },
    h1 : {
        fontSize: 25,
        fontWeight: 'bold',
    },
    itemBox : {
        padding: 10,
        paddingBottom: 10
    },
    itemContent : {
        paddingHorizontal: 10,
        color: 'gray'
    },
    item : {
        borderBottomColor : 'lightgray',
        borderBottomWidth : 1 
    },
    itemName : {
        fontSize: 17,
        fontWeight: 'bold'
    },
    itemNew : {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'black',
        marginRight: 5,
        width: 35,
        height:25,
        alignSelf:'center',
        textAlign:'center'
    },
    itemSkel : {
        height: '25%',
        overflow: 'hidden',
        marginVertical: 3,
        borderRadius: 5
    },
//////////////////////////
    buttonContainer : {
        flex: 1,
    },
    burgerBut : {
        width: '85%',
        marginVertical: 20,
        paddingVertical: 15,
        borderRadius: 10,
        flexDirection: 'row',
        backgroundColor: 'white',
        justifyContent:'space-evenly',
        alignItems: 'center' ,
        alignSelf: 'center',
        shadowColor: '#000'
    },
    burgerIcon : {
        width: 70,
        height: 70,
    },
    burgerText : {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'black'
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

export default HamburgerHome;