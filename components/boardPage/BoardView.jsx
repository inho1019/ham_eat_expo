import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import favImg from '../../assets/board/fav.png'
import { useAppContext } from '../api/ContextAPI';

const BoardView = (props) => {
    const {navigation,route} = props

    const { state , dispatch } = useAppContext();

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

    const [boardDTO,setBoardDTO] = useState()

    const getToday = (logTime) => {
        const date = new Date(logTime)
        const day = date.getDate();
        const month = date.getMonth()+1;
        const hour = date.getHours();
        const minutes = date.getMinutes();
        
        return `${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }

    useEffect(() => {
        navigation.setOptions({
            title: ''
        });
        onLoading(true)
        axios.get(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/board/view/${route.params?.boardSeq}`)
        .then(res =>{
            setBoardDTO(res.data)
            navigation.setOptions({
                title: res.data[0].title
            });
            onLoading(false)
        }).catch(() => {
            setAlertTxt('불러오기 중 에러발생')
            onLoading(false)
        })
    },[route])

    const onFav = () => {
        if(state.user.userSeq === -1) {
            if(!JSON.parse(boardDTO[0].fav).includes(state.user.userSeq)) {
                onLoading(true)
                const jsonFav = JSON.stringify([...JSON.parse(boardDTO[0].fav),state.user.userSeq]);
                axios.put(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/board/fav`, 
                    { boardSeq :boardDTO[0].boardSeq, fav: jsonFav} )
                .then(() => {
                    onLoading(false)
                    setBoardDTO([{...boardDTO[0],fav:jsonFav},boardDTO[1]])
                }).catch(() => {
                    setAlertTxt('추천 중 에러발생')
                    onLoading(false)
                })
            } else {
                setAlertTxt('이미 추천한 글입니다')
            }
        } else {
            setAlertTxt('로그인 후 추천 가능')
        }
    }

    const onUpdate = () => {
        navigation.navigate('Form',{ update : true, data : boardDTO[0] })
    }

    const onDelete = () => {
        if(boardDTO[1].userSeq === state.user.userSeq) {
            onLoading(true)
            axios.delete(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/board/delete/${boardDTO[0].boardSeq}`)
            .then(() => {
                onLoading(false)
                navigation.navigate('List',{ type : boardDTO[0].type })
            })
        } else {
            setAlertTxt('잘못된 접근입니다') 
        }
    }

    const [imageArray,setImageArray] = useState([])

    useEffect(() => {
        if(boardDTO && boardDTO[0].url.length > 0) { 
            const getMetaInfo = async () => {
                try {
                    const response = await fetch(boardDTO[0].url); // 원하는 웹사이트 URL로 변경
                    const html = await response.text();
                    
                    const regex = /content="http(.*?)"/g;
                    let match;
                    const imgArray = [];
    
                    while ((match = regex.exec(html)) !== null) {
                        const imagePattern = /\.(jpg|jpeg|png|gif|bmp)$/i;
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
    },[boardDTO])

    const openLink = () => {
        Linking.openURL(boardDTO[0].url)
        .catch((err) => console.error('Error opening external link:', err));
    };

    return (
        <ScrollView>
            {boardDTO && <View style={{flexDirection:'column', borderBottomWidth:10,borderBottomColor:'whitesmoke'}}>
                <View style={{borderBottomWidth:2,borderBottomColor:'lightgray',padding: 5}}>
                    <Text style={styles.h1}>{boardDTO[0].title}</Text>
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                        <View>
                            <View style={{flexDirection:'row'}}>
                                <Text style={styles.h2}>{boardDTO[1] ? boardDTO[1].name : '탈퇴 회원'}</Text>
                            </View>
                            <View style={{flexDirection:'row'}}>
                                <Text style={styles.h3}>조회 {boardDTO[0].hit}</Text>
                                <Text style={styles.h3}> | 추천 {JSON.parse(boardDTO[0].fav).length}</Text>
                                <Text style={styles.h3}> | {getToday(boardDTO[0].logTime)}</Text>
                            </View>
                        </View>
                        {boardDTO[1].userSeq === state.user.userSeq && <View style={{flexDirection:'row'}}>
                            <Pressable onPress={onUpdate}
                                style={[styles.itemBut,{backgroundColor:'#2E8DFF'}]}>
                                <Text style={styles.itemButTxt}>수정</Text>
                            </Pressable>
                            <Pressable onPress={onDelete}
                                style={[styles.itemBut,{backgroundColor:'tomato'}]}>
                                <Text style={styles.itemButTxt}>삭제</Text>
                            </Pressable>
                        </View>}
                    </View>
                </View>
                <Pressable style={styles.link}
                    onPress={openLink}>
                    <Text style={{color:'gray'}}>{boardDTO[0].url}</Text>
                </Pressable>
                <View style={{padding:5}}>
                    <Text style={styles.h4}>{boardDTO[0].content}</Text>
                    <View style={styles.imageSection}>
                        {imageArray.map((item,index) => 
                        <Image key={index} 
                            source={{ uri:'http' + item}}
                            style={{width: 100/imageArray.length + '%',aspectRatio: 1/1}}
                        />)}
                    </View>
                </View>
                <View style={{flexDirection:'row',justifyContent:'center',marginTop:30}}>
                    <Pressable onPress={() => onFav()}>
                        <Image source={favImg} style={{width:50,height:50}}/>
                    </Pressable>
                </View>
                <View style={{flexDirection:'row',justifyContent:'center'}}>
                    <Text style={styles.favTxt}>{JSON.parse(boardDTO[0].fav).length}</Text>
                </View>
            </View>}
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
    h1 : {
        marginVertical: 5,
        fontSize: 20,
    },
    h2 : {
        borderTopColor: 'white',
        borderTopWidth: 10,
        backgroundColor: '#c7c7c7',
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 5,
        marginBottom: 2
    },
    h3 : {
        fontSize: 16,
        color:'gray'
    },
    h4 : {
        fontSize: 16
    },
    favTxt : {
        marginBottom: 15,
        marginTop: 5,
        fontSize:17,
        fontWeight:'bold',
        textAlign:'center',
        paddingHorizontal: 7,
        borderRadius: 5,
        color:'gray',
        backgroundColor:'lightgray'
    },
    itemBut : {
        marginBottom:27,
        paddingTop: 3,
        marginHorizontal: 4,
        paddingHorizontal: 10,
        borderRadius: 5,
    },
    itemButTxt : {
        color:'white',
        fontWeight: 'bold',
        fontSize: 15
    },
    imageSection :{
        marginHorizontal:10,
        marginTop: 30,
        overflow:'hidden',
        borderRadius: 20
    },
    link : {
        backgroundColor:'whitesmoke',
        marginHorizontal: 10,
        marginTop: 5,
        padding: 3,
        borderRadius:5
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
})

export default BoardView;