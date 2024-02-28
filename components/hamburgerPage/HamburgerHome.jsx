import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    const [lastMargin,setLastMargin] = useState(0)
    const [burger,setBurger] = useState({})
    const [fren,setFren] = useState([])
    const [hand,setHand] = useState([])
    const [diy,setDiy] = useState([])
    const [newRating,setNewRating] = useState([])
    const [ratings,setRatings] = useState([])
    const [first,setFirst] = useState(true)
    const [starLod,setStartLod] = useState(false)
   
    const { state, dispatch } = useAppContext();

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

    useEffect(()=>{
        if(state.view !== -1) {
            navigation.navigate('View',{ burgerSeq : state.view })
            onView(-1)
        }
        const unsubscribe = navigation.addListener('focus', () => {
            axios.get(`https://hameat.onrender.com/ingre/list`)
            .then(ing => {
                setIngres(ing.data)
                Promise.all([
                    axios.get(`https://hameat.onrender.com/rating/listNew`),
                    axios.get(`https://hameat.onrender.com/burger/listHome/0`),
                    axios.get(`https://hameat.onrender.com/burger/listHome/1`),
                    axios.get(`https://hameat.onrender.com/burger/listHome/2`)
                ])
                .then(res => {
                    setFirst(false)
                    setStartLod(true)
                    setNewRating(res[0].data)
                    setFren(res[1].data)
                    setHand(res[2].data)
                    setDiy(res[3].data)
                    const ran = Math.floor(Math.random() * 3)
                    const mkDTO = ran === 0 ? JSON.parse(res[1].data[0].make) : 
                                  ran === 1 ? JSON.parse(res[2].data[0].make) : JSON.parse(res[3].data[0].make)
                    setMakeDTO(mkDTO)
                    const inDTO = mkDTO.map(md => {
                        const ingreIt = ing.data.find(ing => ing.ingreSeq === md);
                        return ingreIt !== undefined ? ingreIt : ing.data[0]
                    });
                    setLastMargin(windowWidth*inDTO.filter(ing => ing.type !== 4)[inDTO.filter(ing => ing.type !== 4).length - 1].height)
                    setBurger(ran === 0 ? res[1].data[0] : 
                                ran === 1 ? res[2].data[0] : res[3].data[0])
                    axios.get(`https://hameat.onrender.com/rating/listSeq/${
                                ran === 0 ? res[1].data[0].burgerSeq : ran === 1 ? 
                                res[2].data[0].burgerSeq : res[3].data[0].burgerSeq}`)
                    .then(res => {
                        setRatings(res.data)
                        setStartLod(false)
                    })
                    .catch(() => {
                        onAlertTxt('불러오기 중 에러발생')
                        setStartLod(false)
                    })
                })
                .catch(() => {
                    onAlertTxt('불러오기 중 에러발생')
                    setFirst(false)
                })
            })
            .catch(() => {
                onAlertTxt('불러오기 중 에러발생')   
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
                                    marginBottom: getIngre.type === 4 ? -(burger.size === 0 ? windowWidth*0.0646 : 
                                        burger.size === 1 ? windowWidth*0.0837 : windowWidth*0.0978) :
                                        ((getIngre.type === 2 || getIngre.type === 3) && 
                                        getIngre.height > 170 ? -(windowWidth*0.105) : -(windowWidth*0.084)) + 
                                        (burger.size === 0 ? + (windowWidth*0.015) : burger.size === 2 && + -(windowWidth*0.012)),
                                    zIndex:-index,alignSelf: 'center'}}
                                    source={{ uri : getIngre.image}}
                                    resizeMode='stretch'/>
                                })}
                            <Image 
                            source={{ uri : ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                                ingres.find(ing => ing.ingreSeq === makeDTO[0]).image :
                                ingres.find(ing => ing.ingreSeq === makeDTO[0]).name === '먹물 번' ? 
                                'https://postfiles.pstatic.net/MjAyNDAyMjVfMTY4/MDAxNzA4ODQxNDg2OTk0.9RaLSfxW7Tzloqsvz40r1omqWehGg7bZbh7st9OBmQkg.2JdsHC1yle6BINWRnsSUQib_A5GWvLE3mh2HhqXoQ9Ig.PNG/ink_bun.png?type=w966'
                                : 'https://postfiles.pstatic.net/MjAyNDAyMjVfNiAg/MDAxNzA4ODM5MDMxNzQ5.-eK1dABinObEUaWkHVMu03zQ818I4VUbkhhdwf7AlQIg.xFI7_6ktqqav2Uj-iqp-yy4F_b6WR9xbopK5xWIP0p4g.PNG/normal_bun.png?type=w966'}} 
                                style={{width: burger.size === 0 ? '50%' : burger.size === 2 ? '90%' : '70%',alignSelf:'center',
                                aspectRatio: 500/(ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                                ingres.find(ing => ing.ingreSeq === makeDTO[0]).height : 160), 
                                zIndex: -makeDTO.length,marginTop: burger.size === 0 ? lastMargin * 0.00011 : 
                                                                   burger.size === 1 ? lastMargin * 0.000065 : lastMargin * 0.00004}}/>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={{fontWeight:'bold',fontSize:22,textAlign:'center'}}>{burger.name}</Text>
                            <View style={styles.recomContent}>
                                <Text style={{padding: 8,fontSize:16,textAlign:'center',color:'gray'}} >"{burger.content}"</Text>
                            </View>

                               <View style={styles.starBox}>
                                { starLod ? 
                                <View style={[styles.itemSkel,{height:'100%'}]}>
                                    <Skel height={'100%'} width={windowWidth*0.45}/>
                                </View>
                                : <View>
                                    <View style={[styles.starBack,{width : 
                                    ratings.reduce((acc, cur) => acc + cur[0].rate , 0) * 20 / ratings.length + '%'}]}/>
                                    <Image source={ratings.length > 0 ? star : starNone } style={styles.starImg}/>
                                </View>
                                }
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
                style={({pressed}) => ({backgroundColor: pressed ? 'whitesmoke' : 'white',borderRadius: 10})}
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
                style={({pressed}) => ({backgroundColor: pressed ? 'whitesmoke' : 'white',borderRadius: 10})}
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
                style={({pressed}) => ({backgroundColor: pressed ? 'whitesmoke' : 'white',borderRadius: 10})}
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
            <View
                style={styles.h1Out}>
                <Text style={styles.h1}>새로운 평가</Text>
            </View>
            {first ?
                <View style={{width:'95%',aspectRatio:5/2,overflow:'hidden',justifyContent:'space-evenly',
                marginHorizontal:'2.5%', borderRadius:5, marginTop:'2%', flexDirection:'row',flexWrap:'wrap'}}>
                    <View style={[styles.itemSkel,{height:'18%'}]}><Skel height={'100%'} width={windowWidth*0.45}/></View>
                    <View style={[styles.itemSkel,{height:'18%'}]}><Skel height={'100%'} width={windowWidth*0.45}/></View>
                    <View style={[styles.itemSkel,{height:'18%'}]}><Skel height={'100%'} width={windowWidth*0.45}/></View>
                    <View style={[styles.itemSkel,{height:'18%'}]}><Skel height={'100%'} width={windowWidth*0.45}/></View>
                    <View style={[styles.itemSkel,{height:'18%'}]}><Skel height={'100%'} width={windowWidth*0.45}/></View>
                    <View style={[styles.itemSkel,{height:'18%'}]}><Skel height={'100%'} width={windowWidth*0.45}/></View>
                    <View style={[styles.itemSkel,{height:'18%'}]}><Skel height={'100%'} width={windowWidth*0.45}/></View>
                    <View style={[styles.itemSkel,{height:'18%'}]}><Skel height={'100%'} width={windowWidth*0.45}/></View>
                </View> 
                : <View style={{flexDirection:'row',flexWrap:'wrap'}}>
                    {newRating.map((item,index) =>
                        <Pressable key={index}
                            onPress={() => navigation.navigate('View', { burgerSeq : item.burgerSeq })}
                            style={({pressed}) => [styles.ratingItem,{backgroundColor:pressed ? 'whitesmoke' : 'white'}]}>
                            <Text style={styles.ratingTxt} numberOfLines={1} ellipsizeMode="tail">
                                {item.content}</Text>
                        </Pressable>
                    )}
                </View>
            }
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
        borderBottomWidth: 2,
        paddingBottom: 3,
        marginHorizontal: 10,
        marginTop: 20,
    },
    h1 : {
        fontSize: 23,
        fontFamily: 'esamanruMedium',
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
        height:22,
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
        fontSize: 24,
        fontFamily: 'chab',
        color:'#472523',
    },
    //////////rating 관련///////////
    ratingItem : {
        width: '45%',
        borderRadius: 3,
        marginHorizontal: '2.5%',
        paddingHorizontal: 5,
        paddingVertical: 1,
        marginTop: 5
    },
    ratingTxt : {
        fontSize: 15
    },
});

export default HamburgerHome;