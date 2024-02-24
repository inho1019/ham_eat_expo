import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppContext } from '../api/ContextAPI';
import add from '../../assets/board/board_reg.png'
import axios from 'axios';

const BoardForm = (props) => {

    const input1Ref = useRef(null);
    const input2Ref = useRef(null);
    const input3Ref = useRef(null);

    const {navigation,route} = props

    const { state , dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

    const onAlertTxt = (txt) => {
        dispatch({ type: 'SET_ALERTTXT' , payload : txt });
    };
    /////////// 키보드 활성화 여부 확인////////

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
                axios.post('https://hameat.onrender.com/board/write',boardDTO)
                .then(() => {
                    onLoading(false)
                    navigation.goBack();
                })
            } else {
                onAlertTxt('내용을 입력해주세요')
            }
        } else {
            onAlertTxt('제목을 입력해주세요')
        }
    }

    return (
        <ScrollView style={{flex : 1}}>
            <View style={{height: 10}}/>
            <Text style={styles.h2}>제목</Text>
            <TextInput style={styles.titleInput} placeholder='제목 입력' ref={input1Ref}
                value={boardDTO.title} onChangeText={(text) => onInput('title',text)} maxLength={100}
                onSubmitEditing={() => input2Ref.current.focus()}/>
            <Text style={styles.h2}>내용</Text>
            <TextInput style={[styles.contentInput,{height: 175}]} placeholder='내용 입력' ref={input2Ref}
                value={boardDTO.content} onChangeText={(text) => onInput('content',text)} 
                    multiline={true} numberOfLines={5}
                    onSubmitEditing={() => route.params?.type === 1 ? input3Ref.current.focus() : onSub()}/>
            { route.params?.type === 1 && <View>     
                <Text style={styles.h2}>이벤트 URL</Text>
                <TextInput style={styles.titleInput} placeholder='이벤트 URL 입력  *없을시 미입력' ref={input3Ref}
                    value={boardDTO.url} onChangeText={(text) => onInput('url',text)}
                    onSubmitEditing={() => onSub()}/>
            </View>}
            <View style={{flexDirection:'row-reverse',marginLeft:'5%',marginTop:'2%'}}>
                <Pressable onPress={() => onSub()}>
                    <Image source={add} style={{width:40,height:40}}/>
                </Pressable>
            </View>
        </ScrollView>
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
        borderColor: 'lightgray',
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
        borderColor: 'lightgray',
        borderRadius: 3,
        fontSize: 16,
        padding: 5,
        textAlignVertical: 'top',
        alignSelf: 'center',
        margin : 10,
        width: '95%',
        overflow:'scroll'
    },
});

export default BoardForm;