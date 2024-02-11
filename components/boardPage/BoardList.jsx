import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppContext } from '../api/ContextAPI';
import writeImg from '../../assets/board/write.png'
import axios from 'axios';

const BoardList = (props) => {
    const {navigation,route} = props

    const { state , dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

    const onPage = (num) => {
        dispatch({ type: 'SET_PAGE' , payload : num });
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

    const [boardList,setBoardList] = useState([])
    const [search,setSearch] = useState('')

    useEffect(()=>{
        navigation.setOptions({
            title: route.params?.type === 0 ? '자유 게시판' : 
                   route.params?.type === 1 ? '행사/이벤트 게시판' :  
                   route.params?.type === 2 ? '공지사항' : ''
        });
        const unsubscribe = navigation.addListener('focus', () => {
            onLoading(true)
            axios.get(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/board/list/${route.params?.type}`)
            .then(res => {
                setBoardList(res.data)
                onLoading(false)
            }).catch(() => {
                setAlertTxt('불러오기 중 에러발생')
                onLoading(false)
            })
        });
        return unsubscribe;
    },[navigation,route])

    return (
        <View>
            <View style={{height: '8%',paddingTop:2,justifyContent: 'center',borderBottomWidth : 2,borderColor: 'lightgray',}}>
                <TextInput value={search} onChangeText={(text) => setSearch(text)} 
                    style={styles.searchBox} placeholder={'검색'}/>
            </View>
            <FlatList
                style={{height:'92%'}}
                data={boardList.filter(bdl => (bdl[0].title.includes(search) || 
                                            search.includes(bdl[0].title) || 
                                            search.includes(bdl[0].content) || 
                                            (bdl[1] && search.includes(bdl[1].name))))}
                renderItem={(data) => <Pressable
                    onPress={() => navigation.navigate('View',{ boardSeq : data.item[0].boardSeq })}
                    style={({pressed}) => [styles.item,{backgroundColor: pressed ? 'whitesmoke' : 'white'}]}>
                    <Text style={styles.h2} numberOfLines={1} ellipsizeMode="tail">{data.item[0].title}</Text>
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                        <View style={{flexDirection:'row'}}>
                            <Text style={styles.h3}>{data.item[1] ? data.item[1].name : '탈퇴 회원'}</Text>
                            <Text style={styles.h3}> | 조회 {data.item[0].hit}</Text>
                            <Text style={styles.h3}> | 추천 {JSON.parse(data.item[0].fav).length}</Text>
                        </View>
                        <View>
                            <Text style={styles.h3}>{getToday(data.item[0].logTime)}</Text>
                        </View>
                    </View>
                </Pressable>}
                alwaysBounceVertical={false}
            />
            { (route.params?.type !== 2 || state.user.own === 2) && <Pressable style={styles.writeBut}
                onPress={() => state.user.userSeq === -1 ? onPage(3)
                : navigation.navigate('Form',{ type : route.params?.type })}>
                <Image source={writeImg} style={{width: 50, height: 50}}/>
            </Pressable>}
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
    searchBox : {
        borderWidth: 2,
        borderRadius: 5,
        fontSize: 18,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: 'center',
        width: '95%',
        overflow:'hidden'
    },
    h2 : {
        fontSize :18,
        marginBottom: 2
    },
    h3 : {
        fontSize: 15,
        color:'gray'
    },
    item : {
        padding: 5,
        borderColor:'lightgray',
        borderTopWidth: 0.5,
        borderBottomWidth: 1,
    },
    writeBut : {
        position:'absolute',
        bottom: 10,
        right: 10,
        opacity : 0.8
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

export default BoardList;