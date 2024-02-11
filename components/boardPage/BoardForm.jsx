import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppContext } from '../api/ContextAPI';
import add from '../../assets/board/board_reg.png'
import axios from 'axios';

const BoardForm = (props) => {

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

    const [boardDTO,setBoardDTO] = useState({
        userSeq : state.user.userSeq,
        type : route.params?.type,
        title : '',
        content : '',
        url : '',
        hit : 0,
        fav : '[]',
    })

    const onInput = (name,value) => {
        setBoardDTO({...boardDTO, [name] : value})
    }

    useEffect(()=>{
        navigation.setOptions({
            title: route.params?.update ? '글 수정'  : '글 작성'
        });
        if(route.params?.update) {
            setBoardDTO(route.params?.data)
        }
    },[route])

    const onSub = () => {
        if(boardDTO.title.length > 0) {
            if(boardDTO.content.length > 0) {
                onLoading(true)
                axios.post('https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/board/write',boardDTO)
                .then(res => {
                    onLoading(false)
                    navigation.goBack();
                })
            } else {
                setAlertTxt('내용을 입력해주세요')
            }
        } else {
            setAlertTxt('제목을 입력해주세요')
        }
    }

    return (
        <View>
            <View style={{height:20}}/>
            <Text style={styles.h2}>제목</Text>
            <TextInput style={styles.titleInput} placeholder='제목 입력'
                value={boardDTO.title} onChangeText={(text) => onInput('title',text)} maxLength={100}/>
            <Text style={styles.h2}>내용</Text>
            <TextInput style={styles.contentInput} placeholder='내용 입력'
                value={boardDTO.content} onChangeText={(text) => onInput('content',text)} 
                    multiline={true} numberOfLines={5}/>
            { route.params?.type === 1 && <View>     
                <Text style={styles.h2}>이벤트 URL</Text>
                <TextInput style={styles.titleInput} placeholder='이벤트 URL 입력  *없을시 미입력'
                    value={boardDTO.url} onChangeText={(text) => onInput('url',text)}/>
            </View>}
            <View style={{flexDirection:'row-reverse',marginLeft:'5%',marginTop:'2%'}}>
                <Pressable onPress={() => onSub()}>
                    <Image source={add} style={{width:40,height:40}}/>
                </Pressable>
            </View>
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
        </View>
    );
};

const styles = StyleSheet.create({
    h2 : {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 5,
        marginTop: 5
    },
    titleInput : {
        borderWidth: 2,
        borderRadius: 3,
        height: 33,
        fontSize: 16,
        padding: 5,
        textAlignVertical: 'top',
        alignSelf: 'center',
        margin : 10,
        width: '95%',
        overflow:'scroll'
    },
    contentInput : {
        borderWidth: 2,
        borderRadius: 3,
        height: 175,
        fontSize: 16,
        padding: 5,
        textAlignVertical: 'top',
        alignSelf: 'center',
        margin : 10,
        width: '95%',
        overflow:'scroll'
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

export default BoardForm;