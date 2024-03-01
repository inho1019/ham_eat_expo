import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppContext } from '../api/ContextAPI';
import axios from 'axios';

const UserList = (props) => {
    const {navigation} = props

    const { state, dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

    const onAlertTxt = (txt) => {
        dispatch({ type: 'SET_ALERTTXT' , payload : txt });
      };
    //////////////////////////////////////////

    const [userList,setUserList] = useState([])
    const [search,setSearch] = useState('')
    
    useEffect(() => {
        if(state.user.own === 2) {
            onLoading(true)
            axios.get('https://hameat.onrender.com/user/list')
            .then(res => {
                setUserList(res.data)
                onLoading(false)
            })
            .catch(() => {
                onAlertTxt('불러오기 중 오류발생')
                navigation.goBack(-1)
                onLoading(false)
            })
        } else {
            onAlertTxt('권한이 없습니다')
            navigation.goBack(-1)
        }
    },[])

    const [out,setOut] = useState(-1)

    const onDelete = (seq) => {
        if(out === seq) {
            onLoading(true)
            axios.delete(`https://hameat.onrender.com/user/delete/${seq}`)
            .then(() => {
                axios.get('https://hameat.onrender.com/user/list')
                .then(res => {
                    onAlertTxt('탈퇴 처리되었습니다')
                    setUserList(res.data)
                    onLoading(false)
                })
                .catch(() => {
                    onAlertTxt('불러오기 중 오류발생')
                    onLoading(false)
                })
            })
            .catch(() => {
                onAlertTxt('삭제 중 오류발생')
                onLoading(false)
            })
        } else {
            setOut(seq)
            onAlertTxt('한번 더 클릭시 탈퇴됩니다')
        }
    }

    const onOwn = (seq,own) => {
        onLoading(true)
        axios.put(`https://hameat.onrender.com/user/update`, 
                { field : 2 , value : own, userSeq : seq} )
        .then(() => {
            axios.get('https://hameat.onrender.com/user/list')
            .then(res => {
                onAlertTxt('변동 처리되었습니다')
                setUserList(res.data)
                onLoading(false)
            })
            .catch(() => {
                onAlertTxt('불러오기 중 오류발생')
                onLoading(false)
            })
        })
        .catch(() => {
            onAlertTxt('변동 중 오류발생')
            onLoading(false)
        })
    }

    useEffect(() => {
        if(out !== -1) {
            setTimeout(() => {
                setOut(-1)
            },5000)
        }
    },[out])

    return (
        <View>
            <TextInput value={search} onChangeText={(text) => setSearch(text)} 
                style={styles.searchBox} placeholder={'유저 검색'}/>
            <FlatList
                data={userList.filter(item => 
                    item.name.replace(/\s/g, '').toLowerCase().includes(search.replace(/\s/g, '').toLowerCase()) 
                    || search.replace(/\s/g, '').toLowerCase().includes(item.name.replace(/\s/g, '').toLowerCase()))}
                renderItem={(data) => <View style={styles.itemBox}>
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                        <View style={{flexDirection:'row'}}>
                            <Text style={{fontSize: 17,fontWeight: 'bold'}}>{data.item.name}</Text>
                            <Text style={{fontSize: 17}}> | {data.item.own === 0 ? '일반 유저' : data.item.own === 1 ? '매니저' : '관리자'}</Text>
                        </View>
                        {data.item.own < 2  && <View style={{flexDirection:'row'}}>
                            <Pressable onPress={() => onOwn(data.item.userSeq,data.item.own + 1)}
                                style={[styles.itemBut,{backgroundColor:'#2E8DFF'}]}>
                                <Text style={styles.itemButTxt}>승급</Text>
                            </Pressable>
                        {data.item.own > 0 &&  <Pressable onPress={() => onOwn(data.item.userSeq,data.item.own - 1)}
                                style={[styles.itemBut,{backgroundColor:'tomato'}]}>
                                <Text style={styles.itemButTxt}>강등</Text>
                            </Pressable>}
                            <Pressable onPress={() => onDelete(data.item.userSeq)}
                                style={[styles.itemBut,{backgroundColor:'gray'}]}>
                                <Text style={styles.itemButTxt}>탈퇴</Text>
                            </Pressable>
                        </View>}
                    </View>
                    <View style={{flexDirection:'row',marginTop:2}}>
                        <Text>{data.item.birth}</Text>
                        <Text> | {data.item.gender === 0 ? '비공개' : data.item.gender === 1 ? '남자' : '여자'}</Text>
                        <Text> | {data.item.email}</Text>
                    </View>
                </View>}
                ListHeaderComponent={() => <View style={{paddingBottom:56}}/>}
            />
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
        position: 'absolute',
        top: 10,
        borderRadius: 5,
        zIndex: 9999,
        backgroundColor: '#e5e5e5',
        color:'#505050',
        height: 40,
        fontSize: 18,
        paddingHorizontal: 10,
        paddingVertical: 3,
        alignSelf: 'center',
        width: '96%',
        overflow:'hidden'
    },
    itemBox : {
        padding: 5,
        borderBottomColor: 'lightgray',
        borderBottomWidth: 2
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
})

export default UserList;