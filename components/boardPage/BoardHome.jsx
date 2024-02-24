import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import noticeImg from '../../assets/board/notice.png'
import axios from 'axios';
import { useAppContext } from '../api/ContextAPI';
import { Skel } from 'react-native-ui-skel-expo'
import ImageModal from '../ImageModal';

const BoardHome = (props) => {
    const {navigation} = props

    const { state, dispatch } = useAppContext();

    const onView = (num) => {
        dispatch({ type: 'SET_VIEW' , payload : num });
    };

    const onAlertTxt = (txt) => {
        dispatch({ type: 'SET_ALERTTXT' , payload : txt });
    };

    const windowWidth = Dimensions.get('window').width;
    ////////////////////////////////////////////
    const getToday = (logTime) => {
        const date = new Date(logTime)
        const day = date.getDate();
        const month = date.getMonth()+1;
        const hour = date.getHours();
        const minutes = date.getMinutes();
        
        return `${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    
    const [free,setFree] = useState([])
    const [event,setEvent] = useState([])
    const [notice,setNotice] = useState([])
    
    const [bestFree,setBestFree] = useState()
    const [bestEvent,setBestEvent] = useState()
    
    const [first,setFirst] = useState(true)

    const [imgModal,setImgModal] = useState(false)

    const onClose = () => {
        setImgModal(false)
    }
    
    useEffect(()=>{
        if(state.view !== -1) {
            navigation.navigate('View',{ boardSeq : state.view })
            onView(-1)
        }
        const unsubscribe = navigation.addListener('focus', () => {
            axios.get(`https://hameat.onrender.com/board/listHome/0`)
            .then(res0 => {
                setFree(res0.data)
                axios.get(`https://hameat.onrender.com/board/listHome/1`)
                .then(res1 => {
                    setEvent(res1.data)
                    axios.get(`https://hameat.onrender.com/board/listHome/2`)
                    .then(res2 => {
                        setNotice(res2.data)
                        axios.get(`https://hameat.onrender.com/board/best/0`)
                        .then(res3 => {
                            setBestFree(res3.data)
                            axios.get(`https://hameat.onrender.com/board/best/1`)
                            .then(res4 => {
                                setBestEvent(res4.data)
                                setFirst(false)
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
            })
            .catch(() => {
                onAlertTxt('불러오기 중 에러발생')
                setFirst(false)
            })
        });
        return unsubscribe;
    },[navigation])
    
    //////////////이미지 따오기//////////////////
    const [imageArray,setImageArray] = useState([])

    useEffect(() => {
        if(bestEvent && bestEvent.url.length > 0) { 
            const getMetaInfo = async () => {
                try {
                    const response = await fetch(bestEvent.url); // 원하는 웹사이트 URL로 변경
                    const html = await response.text();

                    const metaImg = /content="http(.*?)"/g;
                    const tagImg = /src="http(.*?)"/g;

                    let match;
                    const imgArray = [];
    
                    while ((match = metaImg.exec(html)) !== null) {
                        const imagePattern = /\.(jpg|jpeg|png|gif|bmp)$/i;
                        if (imagePattern.test(match[1])) {
                          imgArray.push(match[1]);
                        }
                    }

                    while ((match = tagImg.exec(html)) !== null) {
                        const imagePattern = /\.(jpg|jpeg|png|gif)$/i;
                        if (imagePattern.test(match[1])) {
                          imgArray.push(match[1]);
                        }
                    }
                    
                    setImageArray([...new Set(imgArray)])
                } catch (e) {
                    console.log(e)
                }
            };
            getMetaInfo();
        }
    },[bestEvent])
    //////////////////////////////////////////////
    const openLink = () => {
        Linking.openURL(bestEvent.url)
        .catch((err) => console.error('Error opening external link:', err));
    };

    return (
        <ScrollView>
            { (first || notice.length === 0) ? 
                <View style={{width:'95%',aspectRatio:10/1, marginLeft:'2.5%', marginTop:'5%'}}>
                    <View style={[styles.itemSkel,{height:'100%'}]}>
                        <Skel height={'100%'} width={windowWidth*0.95}/>
                    </View>
                </View>
                :<Pressable 
                onPress={() => navigation.navigate('View',{ boardSeq : notice[0].boardSeq })}
                style={styles.noticeBox}>
                <Image source={noticeImg} style={{width:30,height:30}}/>
                <Text style={[styles.noticeTxt,{color:'gray'}]}>공지</Text>
                <Text style={styles.noticeTxt} numberOfLines={1} ellipsizeMode="tail">
                    {notice[0].title}</Text>
            </Pressable>}
            <View style={styles.h1Out}>
                <Text style={styles.h1}>실시간 인기글</Text>
            </View>
            { (first || !bestFree) ? 
                <View style={{width:'95%',aspectRatio:5/2, marginLeft:'2.5%', marginTop:'5%'}}>
                    <View style={[styles.itemSkel,{height:'100%'}]}>
                        <Skel height={'100%'} width={windowWidth*0.95}/>
                    </View>
                </View>
                :<Pressable style={styles.recomContainer}
                onPress={() => navigation.navigate('View',{ boardSeq : bestFree.boardSeq })}>
                <Text style={styles.h2}>{bestFree.title}</Text>
                <Text style={styles.recomInfo}>
                    조회 {bestFree.hit} | 추천 {JSON.parse(bestFree.fav).length} | {getToday(bestFree.logTime)}</Text>
                <Text numberOfLines={3} ellipsizeMode="tail" style={styles.recomTxt}>{ bestFree.content }</Text>
            </Pressable>}
            { (first || !bestEvent) ? 
                <View style={{width:'95%',aspectRatio:5/2, marginLeft:'2.5%', marginTop:'5%'}}>
                    <View style={[styles.itemSkel,{height:'100%'}]}>
                        <Skel height={'100%'} width={windowWidth*0.95}/>
                    </View>
                </View>
                :<View style={styles.eventContainer}>
                {imageArray.length > 0 &&
                <Pressable
                    style={styles.eventImgBox}
                    onPress={() => setImgModal(true)}>
                    <Image source={{ uri : 'http' + imageArray[0] }} 
                        resizeMode='cover'
                        style={{width:'100%',height:'100%'}}/>
                </Pressable>}
                <View style={[styles.eventInfo,{width: imageArray.length > 0 ? '45%' : '95%',
                        padding: imageArray.length > 0 ? '0' : '1%' }]}>
                    <Pressable
                        onPress={openLink}>
                        <Text style={styles.linkBut}>바로가기</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => navigation.navigate('View',{ boardSeq : bestEvent.boardSeq })}
                        style={{aspectRatio: imageArray.length > 0 ? 3/2 : 3/1 }}>
                        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.eventTitle}>{ bestEvent.title }</Text>
                        <Text numberOfLines={2} ellipsizeMode="tail" style={styles.recomTxt}>{ bestEvent.content }</Text>
                    </Pressable>
                </View>
            </View>}
            <Pressable onPress={() => navigation.navigate('List', { type : 0 } )}
                style={({pressed}) => [styles.h1Out,{backgroundColor: pressed ? 'whitesmoke' : 'white'}]}>
                <Text style={styles.h1}>자유 게시판</Text>
                <Text style={styles.more}>more </Text>
            </Pressable>
            {first ?
                <View style={{width:'95%',aspectRatio:7/2,overflow:'hidden',
                marginLeft:'2.5%', borderRadius:5, marginTop:'5%'}}>
                    <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                    <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                    <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                </View> 
                :   <View style={styles.itemBox}>
                    {free.map((item,index) => <Pressable key={index}
                        style={({pressed}) => ({backgroundColor: pressed ? 'whitesmoke' : 'white'})}
                        onPress={() => navigation.navigate('View',{ boardSeq : item.boardSeq })}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.item}>{item.title}</Text>
                    </Pressable>)}
                </View>
            }
            <Pressable onPress={() => navigation.navigate('List', { type : 1 } )}
                style={({pressed}) => [styles.h1Out,{backgroundColor: pressed ? 'whitesmoke' : 'white'}]}>
                <Text style={styles.h1}>행사/이벤트 게시판</Text>
                <Text style={styles.more}>more </Text>
            </Pressable>
            {first ?
                <View style={{width:'95%',aspectRatio:7/2,overflow:'hidden',
                marginLeft:'2.5%', borderRadius:5, marginTop:'5%'}}>
                    <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                    <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                    <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                </View> 
                :    <View style={styles.itemBox}>
                    {event.map((item,index) => <Pressable key={index}
                        style={({pressed}) => ({backgroundColor: pressed ? 'whitesmoke' : 'white'})}
                        onPress={() => navigation.navigate('View',{ boardSeq : item.boardSeq })}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.item}>{item.title}</Text>
                    </Pressable>)}
                </View>
            }
            <Pressable onPress={() => navigation.navigate('List', { type : 2 } )}
                style={({pressed}) => [styles.h1Out,{backgroundColor: pressed ? 'whitesmoke' : 'white'}]}>
                <Text style={styles.h1}>공지사항</Text>
                <Text style={styles.more}>more </Text>
            </Pressable>
            {first ?
                <View style={{width:'95%',aspectRatio:7/2,overflow:'hidden',
                marginLeft:'2.5%', borderRadius:5, marginTop:'5%'}}>
                    <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                    <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                    <View style={styles.itemSkel}><Skel height={'100%'} width={windowWidth*0.95}/></View>
                </View> 
                :    <View style={styles.itemBox}>
                    {notice.map((item,index) => <Pressable key={index}
                        style={({pressed}) => ({backgroundColor: pressed ? 'whitesmoke' : 'white'})}
                        onPress={() => navigation.navigate('View',{ boardSeq : item.boardSeq })}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.item}>{item.title}</Text>
                    </Pressable>)}
                </View>
            }
            <ImageModal imgModal={imgModal} src={'http' + imageArray[0]} onClose={onClose}/>
        </ScrollView>
    );
};
const styles = StyleSheet.create({
    noticeBox : {
        flexDirection:'row',
        marginHorizontal: 10,
        borderColor: 'lightgray',
        backgroundColor:'whitesmoke',
        borderWidth : 2,
        borderRadius: 10,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginTop : 20
    },
    noticeTxt : {
        color: 'black',
        textAlignVertical:'center',
        marginLeft: 10,
        fontSize: 16,
        maxWidth:'90%',
        fontWeight:'bold',
    },
    ////////////////인기글//////////////
    recomContainer : {
        backgroundColor: 'white',
        borderRadius: 10,
        margin: 10,
        marginVertical: 15,
        padding: 10,
        elevation: 10,
    },
    h2 : {
        marginHorizontal: 5,
        fontSize: 21,
        fontWeight: 'bold',
        color:'black'
    },
    recomTxt : {
        fontSize: 15,
        marginVertical: 5,
        color:'gray'
    },
    recomInfo : {
        borderBottomColor: 'lightgray',
        borderBottomWidth: 2,
        paddingVertical:2,
        color: 'gray',
        fontSize: 16
    },
    eventContainer : {
        flexDirection:'row',
        backgroundColor: 'white',
        borderRadius: 10,
        margin: 10,
        elevation: 10,
    },
    eventImgBox : {
        margin:'2.5%',
        width: '45%',
        aspectRatio: 1/1,
        backgroundColor:'whitesmoke',
        borderRadius: 10,
        overflow:'hidden'
    },
    eventInfo : {
        margin:'2.5%',
        width: '45%',
    },
    eventTitle : {
        marginTop: 5,
        fontSize: 19,
        fontWeight: 'bold',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 2,
        paddingVertical:2,
        color:'black'
    },
    linkBut : {
        width:'98%',
        textAlign:'center',
        fontSize: 17,
        paddingVertical: 3,
        marginVertical: 3,
        marginHorizontal: '1%',
        borderRadius: 8,
        fontWeight:'bold',
        color:'white',
        backgroundColor:'#2E8DFF'
    },
///////아이템 관련///////////////////
    h1Out : {
        flexDirection:'row',
        justifyContent:'space-between',
        borderBottomColor:'black',
        borderBottomWidth:2,
        paddingBottom:3,
        marginHorizontal: 10,
        paddingTop: 10,
        marginTop: 10,
    },
    h1 : {
        fontSize: 23,
        fontFamily:'esamanruMedium',
    },
    more : {
        textAlignVertical:'bottom',
        color:'darkgray',
        fontSize: 16
    },
    itemBox : {
        paddingHorizontal: 10,
        marginHorizontal: 10,
        paddingTop: 5,
        marginTop: 5,
        paddingBottom: 10
    },
    itemContent : {
        paddingHorizontal: 10,
        color: 'gray'
    },
    item : {
        borderBottomColor : 'lightgray',
        borderBottomWidth : 1,
        fontSize: 17,
        color: 'gray',
        fontWeight: 'bold',
        marginVertical: 3,
        paddingHorizontal: 5
    },
    itemSkel : {
        height: '25%',
        overflow: 'hidden',
        marginVertical: 3,
        borderRadius: 5
    },
});

export default BoardHome;