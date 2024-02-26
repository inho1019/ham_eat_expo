import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Keyboard, Linking, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import commentAdd from '../../assets/board/comment_reg.png'
import favImg from '../../assets/board/fav.png'
import deleteImg from '../../assets/burger/delete.png';
import { useAppContext } from '../api/ContextAPI';
import ImageModal from '../ImageModal';

const BoardView = (props) => {
    const {navigation,route} = props

    const { state , dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

    const onAlertTxt = (txt) => {
        dispatch({ type: 'SET_ALERTTXT' , payload : txt });
    };

    const onPage = (num) => {
        dispatch({ type: 'SET_PAGE' , payload : num });
    };
    ////////////////////////////////////////////

    const [imgModal,setImgModal] = useState(false)
    const [imgSrc,setImgSrc] = useState('')

    const onOpen = (src) => {
        setImgSrc('http' + src)
        setImgModal(true)
    }

    const onClose = () => {
        setImgModal(false)
        setImgSrc('')
    }

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
        const unsubscribe = navigation.addListener('focus', () => {
            onLoading(true)
            Promise.all([
                axios.get(`https://hameat.onrender.com/board/view/${route.params?.boardSeq}`),
                axios.get(`https://hameat.onrender.com/comment/list/${route.params?.boardSeq}`)
            ])
            .then(res => {
                onLoading(false)
                if(res[0].data) {
                    setBoardDTO(res[0].data)
                    setCommentList(res[1].data)
                    navigation.setOptions({
                        title: res[0].data[0].title
                    });
                } else {
                    onAlertTxt('삭제된 글입니다')
                    navigation.goBack(-1)
                }
            })
            .catch(() => {
                onAlertTxt('불러오기 중 에러발생')
                onLoading(false)
            })
        })
        return unsubscribe;

    },[route,navigation])

    const onFav = () => {
        if(state.user.userSeq !== -1) {
            if(!JSON.parse(boardDTO[0].fav).includes(state.user.userSeq)) {
                onLoading(true)
                const jsonFav = JSON.stringify([...JSON.parse(boardDTO[0].fav),state.user.userSeq]);
                axios.put(`https://hameat.onrender.com/board/fav`, 
                    { boardSeq :boardDTO[0].boardSeq, fav: jsonFav} )
                .then(() => {
                    onLoading(false)
                    setBoardDTO([{...boardDTO[0],fav:jsonFav},boardDTO[1]])
                }).catch(() => {
                    onAlertTxt('추천 중 에러발생')
                    onLoading(false)
                })
            } else {
                onAlertTxt('이미 추천한 글입니다')
            }
        } else {
            onAlertTxt('로그인 후 추천 가능')
        }
    }

    const onUpdate = () => {
        navigation.navigate('Form',{ type : boardDTO[0].type, update : true, data : boardDTO[0] })
    }

    const onDelete = () => {
        if(boardDTO[1].userSeq === state.user.userSeq) {
            onLoading(true)
            axios.delete(`https://hameat.onrender.com/board/delete/${boardDTO[0].boardSeq}`)
            .then(() => {
                onLoading(false)
                navigation.navigate('List',{ type : boardDTO[0].type })
            })
        } else {
            onAlertTxt('잘못된 접근입니다') 
        }
    }

    const [imageArray,setImageArray] = useState([])

    useEffect(() => {
        if(boardDTO && boardDTO[0].url.length > 0) { 
            const getMetaInfo = async () => {
                try {
                    const response = await fetch(boardDTO[0].url); // 원하는 웹사이트 URL로 변경
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
    },[boardDTO])

    const [commentList,setCommentList] = useState([])
    const [commentDTO,setCommentDTO] = useState({
        userSeq : state.user.userSeq,
        boardSeq : route.params?.boardSeq,
        content : ''
    })

    const onSub = () => {
        Keyboard.dismiss();
        if(commentDTO.content.length > 0) {
            onLoading(true)
            axios.post(`https://hameat.onrender.com/comment/write`,commentDTO)
            .then(res => {
                setCommentList((item) => {
                    return [[res.data,state.user],...item]
                })
                setCommentDTO((item) => {
                    return {...item, content : ''}
                })
                onLoading(false)
            })
            .catch(() => {
                onAlertTxt('등록 중 에러발생')
                onLoading(false)
            })
        } else {
            onAlertTxt('내용을 입력해주세요') 
        }
    }

    const onDeleteCom = (seq) => {
        onLoading(true)
        axios.delete(`https://hameat.onrender.com/comment/delete/${seq}`)
        .then(() => {
            setCommentList((com) => com.filter(item => item[0].commentSeq !== seq))
            onLoading(false)
        })
        .catch(() => {
            onAlertTxt('삭제 중 에러발생')
            onLoading(false)
        })
    }

    const openLink = () => {
        Linking.openURL(boardDTO[0].url)
        .catch((err) => console.error('Error opening external link:', err));
    };

    return (
        <View style={{flex: 1}}>   
            <FlatList
                ListHeaderComponent={() => boardDTO && <TouchableWithoutFeedback>
                    <View style={{flexDirection:'column', borderBottomWidth:10,borderBottomColor:'whitesmoke'}}>
                    <View style={{borderBottomWidth:2,borderBottomColor:'lightgray',padding: 5}}>
                        <Text style={styles.h1}>{boardDTO[0].title}</Text>
                        <View style={{flexDirection:'row'}}>
                            <View style={{width:'100%'}}>
                                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                                    <Text style={styles.h2}>{boardDTO[1] ? boardDTO[1].name : '탈퇴 회원'}</Text>
                                    {boardDTO[1].userSeq === state.user.userSeq && <View style={{flexDirection:'row'}}>
                                        <View style={{flexDirection:'column'}}>
                                            <Pressable onPress={onUpdate}
                                                style={[styles.itemBut,{backgroundColor:'#2E8DFF'}]}>
                                                <Text style={styles.itemButTxt}>수정</Text>
                                            </Pressable>
                                        </View>
                                        <View style={{flexDirection:'column'}}>
                                        <Pressable onPress={onDelete}
                                            style={[styles.itemBut,{backgroundColor:'tomato'}]}>
                                            <Text style={styles.itemButTxt}>삭제</Text>
                                        </Pressable>
                                        </View>
                                    </View>}
                                </View>
                                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                                <View style={{flexDirection:'row'}}>
                                    <Text style={styles.h3}>조회 {boardDTO[0].hit}</Text>
                                    <Text style={styles.h3}> | 추천 {JSON.parse(boardDTO[0].fav).length}</Text>
                                    <Text style={styles.h3}> | {getToday(boardDTO[0].logTime)}</Text>
                                </View>
                                <Text style={styles.h3}>NO.{boardDTO[0].boardSeq}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    {boardDTO[0].url !== '' && <Pressable style={styles.link}
                        onPress={openLink}>
                        <Text style={{color:'gray'}}>{boardDTO[0].url}</Text>
                    </Pressable>}
                    <View style={{padding:5}}>
                        <Text style={styles.h4}>{boardDTO[0].content}</Text>
                        <View style={styles.imageSection}>
                            {imageArray.map((item,index) => 
                            <Pressable
                                key={index} 
                                style={{width: imageArray.length > 1 ? 
                                        (imageArray.length % 2 === 1 && index+1 === imageArray.length) ?
                                        '100%' : '50%' : '100%',aspectRatio: imageArray.length > 1 ? 
                                        (imageArray.length % 2 === 1 && index+1 === imageArray.length) ?
                                        2 : 1 : 1/1}}
                                onPress={() => onOpen(item)}>
                                <Image 
                                    source={{ uri:'http' + item}}
                                    resizeMode="cover"
                                    style={{width:'100%',height:'100%'}}
                                />
                            </Pressable>)}
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
                </View>
                </TouchableWithoutFeedback>}
                data={commentList}
                renderItem={(data) => <TouchableWithoutFeedback>
                    <View style={{padding:5,borderBottomColor:'lightgray',borderBottomWidth:1}}>
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{fontSize:16,fontWeight:'bold',color:'gray'}}>{data.item[1].name}</Text>
                        <Text style={{fontSize:14,textAlignVertical:'center',color:'gray'}}> | {getToday(data.item[0].logTime)}</Text>
                    </View>
                        {data.item[1].userSeq === state.user.userSeq && 
                        <Pressable onPress={ () => onDeleteCom(data.item[0].commentSeq) }>
                            <Image source={deleteImg} style={{width:25,height:25}}/>
                        </Pressable>}
                    </View>
                    <Text style={{marginVertical:1}}>{data.item[0].content}</Text>
                </View></TouchableWithoutFeedback>}
                ListFooterComponent={() => <View style={{paddingBottom:100}}/>}
            />
            {state.user.userSeq !== -1 ? <View><TextInput style={styles.commentInput} value={commentDTO.content}
                onChangeText={(text) => setCommentDTO({...commentDTO, content : text})} 
                onSubmitEditing={ onSub } placeholder='댓글 입력'/>
            <Pressable onPress={ onSub }>
                <Image source={commentAdd} style={styles.commentAdd}/>
            </Pressable>
            </View> : <Pressable style={styles.commentInput} onPress={() => onPage(3)}>
                <Text style={{fontSize:16,textAlign:'center',fontWeight:'bold'}}>로그인 후 댓글 작성</Text>
            </Pressable>}
            <ImageModal imgModal={imgModal} src={imgSrc} onClose={onClose}/>
        </View>
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
        marginHorizontal: 4,
        width: 40,
        height: 25,
        justifyContent:'center',
        alignItems:'center',
        borderRadius: 3,
    },
    itemButTxt : {
        color:'white',
        fontWeight: 'bold',
        fontSize: 15
    },
    imageSection :{
        flexDirection:'row',
        flexWrap:'wrap',
        alignItems:'center',
        marginHorizontal: '2.5%',
        marginTop: 30,
        overflow:'hidden',
        borderRadius: 20,
    },
    link : {
        backgroundColor:'whitesmoke',
        marginHorizontal: 10,
        marginTop: 5,
        padding: 3,
        borderRadius:5
    },
    commentInput : {
        position: 'absolute',
        width: '100%',
        bottom: 0,
        borderTopColor:'darkgray',
        backgroundColor:'whitesmoke',
        borderTopWidth: 2,
        fontSize: 15,
        padding: 8
    },
    commentAdd : {
        position: 'absolute',
        width: 30,
        height : 30,
        bottom: 5,
        right: 10,
        zIndex: 999
    },
})

export default BoardView;