import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
    //////////////////////////////////////////////

    const [boardList,setBoardList] = useState([])
    const [search,setSearch] = useState('')
    const [loading,setLoading] = useState(false)

    useEffect(()=>{
        if( searchParam === undefined ) {
            if( route.params?.userSeq ) {
                navigation.setOptions({
                    title: '내 글 목록'
                });
            } else {
                navigation.setOptions({
                    title: route.params?.type === 0 ? '자유 게시판' : 
                        route.params?.type === 1 ? '행사/이벤트 게시판' :  
                        route.params?.type === 2 ? '공지사항' : ''
                });
            }
        } else {
            setSearch(searchParam)
        }
        const unsubscribe = navigation.addListener('focus', () => {
            onLoading(true)
            setLoading(true)
            axios.get( (!route.params?.userSeq && (!route.params?.userSeq && searchParam === undefined)) ? 
                `https://hameat.onrender.com/board/list/${route.params?.type}`
                : `https://hameat.onrender.com/board/listAll`)
            .then(res => {
                setBoardList(res.data)
                onLoading(false)
                setLoading(false)
            }).catch(() => {
                onAlertTxt('불러오기 중 에러발생')
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
        <View style={{flex : 1}}>
        {(!route.params?.userSeq && searchParam === undefined) && 
        <View style={{justifyContent: 'center',paddingTop: 2}}>
            <TextInput value={search} onChangeText={(text) => setSearch(text)} 
                style={styles.searchBox} placeholder={'글 검색'}/>
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
            {!loading && boardList.filter(bdl => route.params?.userSeq ? 
                                            (bdl[1] && bdl[1].userSeq === route.params?.userSeq)
                                                : (bdl[0].title.includes(search) || search.includes(bdl[0].title) || 
                                                bdl[0].content.includes(search) || search.includes(bdl[0].content) || 
                                                (bdl[1] && search.includes(bdl[1].name)))).length === 0 && 
                                                <Text style={styles.noList}>결과가 없습니다</Text>}
            <FlatList
                style={{flex: 1}}
                data={boardList.filter(bdl => route.params?.userSeq ? 
                                        (bdl[1] && bdl[1].userSeq === route.params?.userSeq)
                                            :(bdl[0].title.includes(search) || search.includes(bdl[0].title) || 
                                            bdl[0].content.includes(search) || search.includes(bdl[0].content) || 
                                            (bdl[1] && search.includes(bdl[1].name))))}
                renderItem={(data) => <Pressable
                    onPress={() =>  (!route.params?.userSeq && searchParam === undefined) ? navigation.navigate('View',{ boardSeq : data.item[0].boardSeq }) 
                    : onGo(2,data.item[0].boardSeq) }
                    style={({pressed}) => [styles.item,{backgroundColor: pressed ? 'whitesmoke' : 'white'}]}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={[styles.h2,{maxWidth:'90%'}]} numberOfLines={1} ellipsizeMode="tail">{data.item[0].title}</Text>
                        <Text style={styles.h2c}>{ data.item[2] > 0 && `[${data.item[2]}]` }</Text>
                    </View>
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
            { (!route.params?.userSeq && searchParam === undefined) && 
                (route.params?.type !== 2 || state.user.own === 2) && <Pressable style={styles.writeBut}
                onPress={() => state.user.userSeq === -1 ? onPage(3)
                : navigation.navigate('Form',{ type : route.params?.type })}>
                <Image source={writeImg} style={{width: 50, height: 50}}/>
            </Pressable>}
        </View>
    );
};

const styles = StyleSheet.create({
    noList : {
        textAlign:'center',
        fontSize: 17,
        color:'gray',
        paddingVertical: 5,
        fontWeight:'bold'
    },
    searchBox : {
        borderRadius: 5,
        marginVertical: 5,
        backgroundColor: '#e5e5e5',
        color:'#505050',
        height: 40,
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
    h2c : {
        fontSize :18,
        textAlignVertical: 'center',
        marginLeft:5,
        fontWeight:'bold',
        color:'#2E8DFF'
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
    }
})

export default BoardList;