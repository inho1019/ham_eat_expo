import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppContext } from '../api/ContextAPI';
import writeImg from '../../assets/board/write.png'
import axios from 'axios';
import { Skel } from 'react-native-ui-skel-expo'

const BoardList = (props) => {
    const {navigation,route,searchParam} = props

    const { state , dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

    const onPage = (num) => {
        dispatch({ type: 'SET_PAGE' , payload : num });
    };

    const onView = (num) => {
        dispatch({ type: 'SET_VIEW' , payload : num });
    };

    const windowWidth = Dimensions.get('window').width;
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
    const [loading,setLoading] = useState(false)

    useEffect(()=>{
        if( searchParam === undefined ) {
            navigation.setOptions({
                title: route.params?.type === 0 ? '자유 게시판' : 
                       route.params?.type === 1 ? '행사/이벤트 게시판' :  
                       route.params?.type === 2 ? '공지사항' : ''
            });
        } else {
            setSearch(searchParam)
        }
        const unsubscribe = navigation.addListener('focus', () => {
            onLoading(true)
            setLoading(true)
            axios.get( searchParam === undefined ? 
                `https://hameat.onrender.com/board/list/${route.params?.type}`
                : `https://hameat.onrender.com/board/listAll`)
            .then(res => {
                setBoardList(res.data)
                onLoading(false)
                setLoading(false)
            }).catch(() => {
                setAlertTxt('불러오기 중 에러발생')
                onLoading(false)
                setLoading(false)
            })
        });
        return unsubscribe;
    },[navigation,route])

    const onGo = (a,b) => {
        onPage(a)
        onView(b)
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
        {searchParam === undefined && <View style={{height: '8%',paddingTop:2,justifyContent: 'center',borderBottomWidth : 2,borderColor: 'lightgray',}}>
            <TextInput value={search} onChangeText={(text) => setSearch(text)} 
                style={styles.searchBox} placeholder={'검색'}/>
        </View>}
            {(loading && searchParam !== undefined) && 
            <View style={{width:'95%',aspectRatio:5/4, marginLeft:'2.5%'}}>
                <View style={[styles.itemSkel,{height:'15%',marginVertical:'1%'}]}>
                    <Skel height={'100%'} width={windowWidth*0.95}/>
                </View>
                <View style={[styles.itemSkel,{height:'15%',marginVertical:'1%'}]}>
                    <Skel height={'100%'} width={windowWidth*0.95}/>
                </View>
                <View style={[styles.itemSkel,{height:'15%',marginVertical:'1%'}]}>
                    <Skel height={'100%'} width={windowWidth*0.95}/>
                </View>
                <View style={[styles.itemSkel,{height:'15%',marginVertical:'1%'}]}>
                    <Skel height={'100%'} width={windowWidth*0.95}/>
                </View>
                <View style={[styles.itemSkel,{height:'15%',marginVertical:'1%'}]}>
                    <Skel height={'100%'} width={windowWidth*0.95}/>
                </View>
                <View style={[styles.itemSkel,{height:'15%',marginVertical:'1%'}]}>
                    <Skel height={'100%'} width={windowWidth*0.95}/>
                </View>
            </View>}
            {!loading && boardList.filter(bdl => (
                        bdl[0].title.includes(search) || search.includes(bdl[0].title) || 
                        bdl[0].content.includes(search) || search.includes(bdl[0].content) || 
                        (bdl[1] && search.includes(bdl[1].name)))).length === 0 && 
                        <Text style={styles.noList}>결과가 없습니다</Text>}
            <FlatList
                style={{height: searchParam === undefined ? '92%' : '100%'}}
                data={boardList.filter(bdl => (
                                    bdl[0].title.includes(search) || search.includes(bdl[0].title) || 
                                    bdl[0].content.includes(search) || search.includes(bdl[0].content) || 
                                    (bdl[1] && search.includes(bdl[1].name))))}
                renderItem={(data) => <Pressable
                    onPress={() =>  searchParam === undefined ? navigation.navigate('View',{ boardSeq : data.item[0].boardSeq }) 
                    : onGo(2,data.item[0].boardSeq) }
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
            { searchParam === undefined && 
                (route.params?.type !== 2 || state.user.own === 2) && <Pressable style={styles.writeBut}
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
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    noList : {
        textAlign:'center',
        fontSize: 17,
        color:'gray',
        paddingVertical: 10,
        fontWeight:'bold'
    },
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
        borderBottomColor:'lightgray',
        borderBottomWidth: 1,
    },
    writeBut : {
        position:'absolute',
        bottom: 10,
        right: 10,
        opacity : 0.8
    },
    itemSkel : {
        height: '25%',
        overflow: 'hidden',
        marginVertical: 3,
        borderRadius: 5
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