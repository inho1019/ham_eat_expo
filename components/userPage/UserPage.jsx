import React, { useEffect, useState } from 'react';
import { Button, Image, Keyboard, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../api/ContextAPI';
import deleteImg from '../../assets/burger/delete.png';
import axios from 'axios';

const UserPage = (props) => {
    const {navigation} = props

    ////////////////////redux///////////////////////
    const { state, dispatch } = useAppContext();

    const onUser = (userDTO) => {
        dispatch({ type: 'SET_USER' , payload : userDTO });
    };

    const onPage = (num) => {
        dispatch({ type: 'SET_PAGE' , payload : num });
    };

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

    const onAlertTxt = (txt) => {
        dispatch({ type: 'SET_ALERTTXT' , payload : txt });
      };
    ///////////비밀번호 변경/////////////////
    const pwdPattern = (pwd) => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
        return passwordRegex.test(pwd);
    }
    const [pwd,setPwd] = useState('') 
    const [pwdCheck,setPwdCheck] = useState('') 
    const [pwdSame,setPwdSame] = useState(false)

    useEffect(() => {
        if(pwd.length > 0) {
            if(pwdPattern(pwd)) {
                if (pwd === pwdCheck) {
                    setPwdSame(true)
                    setPwdTxt('')
                } else {
                    setPwdSame(false)
                    setPwdTxt('비밀번호가 유효하지 않거나 일치하지 않습니다')
                }
            } else {
                setPwdSame(false)
                setPwdTxt('비밀번호가 유효하지 않거나 일치하지 않습니다')
            }
        }
    },[pwd,pwdCheck])

    const [policyTxt,setPolicyTxt] = useState('')
    const [termsTxt,setTermsTxt] = useState('')
    const [policyModal,setPolicyModal] = useState(false)
    const [termsModal,setTermsModal] = useState(false)

    useEffect(() => {
        onLoading(true)
        Promise.all([
            axios.get('https://hameat.onrender.com/policy'),
            axios.get('https://hameat.onrender.com/terms'),
        ])
        .then(res => {
          setPolicyTxt(res[0].data.replace(/<br>/g, '\n'))
          setTermsTxt(res[1].data.replace(/<br>/g, '\n'))
          onLoading(false)
        })
        .catch(() => {
          onAlertTxt('약관 및 정책 불러오기 중 에러발생')
          onLoading(false)
      })
    },[])

    const onChangePwd = async () => {
        onLoading(true)
        axios.put(`https://hameat.onrender.com/user/update`, 
        { field : 1 , value : pwd, userSeq : state.user.userSeq} )
        .then(res => {
            onLoading(false)
            setPwd('')
            setPwdCheck('')
            setPwdSame(false)
            setSecret(false)
            setSecretModal(0)
            if(res.data) {
                onAlertTxt('비밀번호 변경이 완료되었습니다')
            } else {
                onAlertTxt('비밀번호 변경을 실패하였습니다')
            }
        })
        .catch(() => {
            onAlertTxt('비밀번호 변경 중 에러발생')
            onLoading(false)
        })
    }
    
    const onDelete = () => {
        setSecretModal(false)
        onLoading(true)
        axios.delete(`https://hameat.onrender.com/user/delete/${state.user.userSeq}`)
        .then(res => {
            if(res.data) {
                onUser({
                    userSeq : -1,
                    email : '',
                    pwd : '',
                    name : '',
                    gender : -1,
                    birth : '',
                    own : -1
                })
                AsyncStorage.removeItem('token');
                AsyncStorage.removeItem('userSeq');
                onAlertTxt('탈퇴가 완료되었습니다');
                onPage(3);
            } else {
                onAlertTxt('탈퇴를 실패하였습니다')
            }
            onLoading(false)
        })
        .catch(() => {
            onAlertTxt('탈퇴 중 에러발생')
            onLoading(false)
        })
    }
    ////////////닉네임 변경/////////////////
    const [name,setName] = useState('')
    const [nameCheck,setNameCheck] = useState(false)

    const namePattern = (name) => {
    return (name.length >= 2 && name.length <= 16) ? true : false;
    }

    useEffect(() => {
        if(namePattern(name)) {
            axios.post(`https://hameat.onrender.com/user/nameCheck`, { name : name } )
            .then(res => {
                if(res.data) setNameCheck(false)
                else setNameCheck(true)
            })
            .catch(() => {
                onAlertTxt('이름 체크 중 에러발생')
            })
        } else {
          setNameCheck(false)
        }
    },[name])

    const onChangeName = async () => {
        onLoading(true)
        const user = await AsyncStorage.getItem('user');
        axios.put(`https://hameat.onrender.com/user/update`, 
                 { field : 0 , value : name, userSeq : state.user.userSeq} )
        .then(res => {
            onLoading(false)
            setNameModal(false)
            if(res.data) {
                setName('')
                if (user) {
                    AsyncStorage.setItem(
                        'user',
                        JSON.stringify({...state.user, name : name})
                    );
                }
                onUser({...state.user, name : name})
                onAlertTxt('닉네임 변경이 완료되었습니다')
            } else {
                onAlertTxt('닉네임 변경을 실패하였습니다')
            }
        })
        .catch(() => {
            onAlertTxt('닉네임 변경 중 에러발생')
            onLoading(false)
        })
      }
    //////////////////////////////////////////// 
    const [nameModal,setNameModal] = useState(false)
    const [secretModal,setSecretModal] = useState(0)
    const [secret,setSecret] = useState(false)
    const [rePwd,setRePwd] = useState('')
    const [pwdTxt,setPwdTxt] = useState('')
    const [variDTO,setVariDTO] = useState({
        name: '',
        valu: ''
    })

    const onLogout = () => {
        onUser({
            userSeq : -1,
            email : '',
            pwd : '',
            name : '',
            gender : -1,
            birth : '',
            own : -1
        })
        AsyncStorage.removeItem('token');
        AsyncStorage.removeItem('userSeq');
        onAlertTxt('로그아웃이 완료되었습니다')
        onPage(3)
    }

    const onSecret = () => {
        onLoading(true)
        axios.post(`https://hameat.onrender.com/user/checkPwd`,
                  { pwd : rePwd, userSeq: state.user.userSeq })
        .then(res => {
            setRePwd('')
            if(res.data) {
                setPwdTxt('')
                setSecret(true)
            } else {
                setPwdTxt('비밀번호가 올바르지 않습니다')
            }
            onLoading(false)
        })
        .catch(() => {
            onAlertTxt('패스워드 체크 중 에러발생')
            onLoading(false)
        })
    }
    
    const openLink = (url) => {
        Linking.openURL(url)
        .catch((err) => console.error('Error opening external link:', err));
    };

    const onValu = () => {
        Keyboard.dismiss()
        if(variDTO.name.length > 0 && variDTO.valu.length) {
            onLoading(true)
            axios.post(`https://hameat.onrender.com/vari/set`,variDTO)
            .then(() => {
                setVariDTO({
                    name: '',
                    valu: ''
                })
                onLoading(false)
                onAlertTxt('설정 완료')
            })
            .catch(() => {
                onAlertTxt('오류 발생')
                onLoading(false)
            })
        } else {
            onAlertTxt('값을 입력해주세요')
        }
    }

    return (
        <ScrollView style={{flex: 1, padding:'5%'}}>
            <Text style={styles.h1}>{state.user.name}</Text>
            <Text style={styles.h2}>내 게시물</Text>
            <View style={{flexDirection:'row',justifyContent:'space-around',marginVertical: 20}}>
                <Pressable
                    onPress={() => navigation.navigate('BoardList', { userSeq : state.user.userSeq })}
                    style={({pressed}) => [ styles.myBigBut,{ elevation : pressed ? 2 : 5 }]}>
                    <Text style={styles.h3}>글</Text>
                </Pressable>
                <Pressable
                    onPress={() => navigation.navigate('BurgerList', { userSeq : state.user.userSeq })}
                    style={({pressed}) => [ styles.myBigBut,{ elevation : pressed ? 2 : 5 }]}>
                    <Text style={styles.h3}>버거</Text>
                </Pressable>
                <Pressable
                    onPress={() => navigation.navigate('RatingList', { userSeq : state.user.userSeq })}
                    style={({pressed}) => [ styles.myBigBut,{ elevation : pressed ? 2 : 5 }]}>
                    <Text style={styles.h3}>평가</Text>
                </Pressable>
            </View>
            {state.user.own === 2 && <View>
                <Text style={styles.h2}>관리자</Text>
                <Pressable onPress={() => navigation.navigate('Add',{ type : 0 })}
                    style={({ pressed }) => ({
                        backgroundColor: pressed ? 'whitesmoke' : 'white',
                    })}>
                    <Text style={styles.myBut}>프렌차이즈 등록</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Map',{ type : 1 })}
                    style={({ pressed }) => ({
                        backgroundColor: pressed ? 'whitesmoke' : 'white',
                    })}>
                    <Text style={styles.myBut}>수제 버거 매장 등록</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Add',{ type : 3 })}
                    style={({ pressed }) => ({
                        backgroundColor: pressed ? 'whitesmoke' : 'white',
                    })}>
                    <Text style={styles.myBut}>재료 등록</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('Carousel')}
                    style={({ pressed }) => ({
                        backgroundColor: pressed ? 'whitesmoke' : 'white',
                    })}>
                    <Text style={styles.myBut}>캐러셀 관리</Text>
                </Pressable>
                <Pressable onPress={() => navigation.navigate('List')}
                    style={({ pressed }) => ({
                        backgroundColor: pressed ? 'whitesmoke' : 'white',
                    })}>
                    <Text style={styles.myBut}>유저 관리</Text>
                </Pressable>
                <View style={{flexDirection:'row',marginTop:15}}>
                    <Text style={[styles.h3,{marginVertical:5}]}>환경 변수</Text>
                    <Pressable style={styles.changeBut} onPress={ onValu }>
                        <Text>설정</Text>
                    </Pressable>
                </View>
                <View style={{flexDirection:'row'}}>
                    <Text style={[styles.myBut,{borderBottomWidth:0}]}>이름</Text>
                    <TextInput style={[styles.txtBox,{width:'20%'}]} value={variDTO.name}
                        onChangeText={(text) => setVariDTO({...variDTO,name : text})}/>
                    <Text style={[styles.myBut,{borderBottomWidth:0}]}>값</Text>
                    <TextInput style={[styles.txtBox,{width:'20%'}]} value={variDTO.valu}
                        onChangeText={(text) => setVariDTO({...variDTO,valu : text})}/>
                </View>
                <Text/>
            </View>}
            <Text style={styles.h2}>이용안내</Text>
            <Pressable
                style={({ pressed }) => ({
                    backgroundColor: pressed ? 'whitesmoke' : 'white',
                  })}>
                <Text style={styles.myBut}>앱 버전 :: {state.version}</Text>
            </Pressable>
            <Pressable
                onPress={() => setPolicyModal(true)}
                style={({ pressed }) => ({
                    backgroundColor: pressed ? 'whitesmoke' : 'white',
                  })}>
                <Text style={styles.myBut}>개인정보 처리 방침</Text>
            </Pressable>
            <Pressable
                onPress={() => setTermsModal(true)}
                style={({ pressed }) => ({
                    backgroundColor: pressed ? 'whitesmoke' : 'white',
                  })}>
                <Text style={styles.myBut}>이용약관</Text>
            </Pressable>
            <Text/>
            <Text style={styles.h2}>계정</Text>
            <Pressable onPress={() => setNameModal(true)}
                style={({ pressed }) => ({
                    backgroundColor: pressed ? 'whitesmoke' : 'white',
                  })}>
                <Text style={styles.myBut}>닉네임 변경</Text>
            </Pressable>
            <Pressable onPress={() => setSecretModal(1)}
                style={({ pressed }) => ({
                    backgroundColor: pressed ? 'whitesmoke' : 'white',
                  })}>
                <Text style={styles.myBut}>비밀번호 변경</Text>
            </Pressable>
            <Pressable onPress={() => setSecretModal(2)}
                style={({ pressed }) => ({
                    backgroundColor: pressed ? 'whitesmoke' : 'white',
                  })}>
                <Text style={styles.myBut}>회원 탈퇴</Text>
            </Pressable>
            <Pressable onPress={() => onLogout()}
                style={({ pressed }) => ({
                    backgroundColor: pressed ? 'whitesmoke' : 'white',
                  })}>
                <Text style={styles.myBut}>로그아웃</Text>
            </Pressable>
            <Pressable onPress={() => openLink('https://kr.freepik.com/')}>
                <Text style={{textAlign:'center',fontSize:15,color:'darkgray',fontWeight:'bold',marginVertical:30}}>
                Images Designed By FreePik</Text>
            </Pressable>
            <Modal
                animationType="fade"
                visible={policyModal || termsModal}
                transparent={true}>
                <View style={styles.policyModal}>
                    <ScrollView style={styles.policyScroll}>
                        {policyModal &&<Text style={[styles.h2,{marginVertical:20}]}>개인정보 처리 방침</Text>}
                        {termsModal && <Text style={[styles.h2,{marginVertical:20}]}>이용약관</Text>}
                        {policyModal && <Text>{policyTxt}</Text>}
                        {termsModal && <Text>{termsTxt}</Text>}
                    </ScrollView>
                    <View style={{position:'absolute',right: 5,top:5}}>
                        <Pressable onPress={() => {
                                setPolicyModal(false)
                                setTermsModal(false)
                            }}>
                            <Image source={deleteImg} style={{width:30,height:30}}/>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                visible={nameModal}
                transparent={true}>
                <View style={{flex:1,justifyContent:'center'}}>
                    <View style={styles.nameModal}>
                        <View style={{flexDirection: 'row',paddingRight:15 ,alignSelf:'flex-end'}}>
                            <Pressable onPress={() => setNameModal(false)}>
                            <Image source={deleteImg} style={{width:30,height:30}}/>
                            </Pressable>
                        </View>
                        <Text style={[styles.h3,{marginBottom:10}]}>변경할 닉네임을 입력해주세요</Text>       
                        <View style={{flexDirection:'row'}}>
                            <TextInput style={styles.txtBox}
                            value={name} onChangeText={(text) => setName(text)} 
                            placeholder='닉네임 입력'/>
                            <Pressable onPress={() => nameCheck && onChangeName()}
                                style={[styles.changeBut,{borderColor: nameCheck ? 'gray' : 'lightgray'}]}>
                                <Text style={{color: nameCheck ? 'gray' : 'lightgray',fontWeight:'bold'}}>변경</Text>
                            </Pressable>
                        </View>
                        { name.length > 0 &&<Text style={[styles.smTxt,{color: nameCheck ? '#2E8DFF' : 'tomato'}]}>
                        {nameCheck ? '사용 가능한 닉네임입니다' : '중복이거나 사용 불가한 닉네임입니다' }</Text>}
                    </View>
                </View>
            </Modal>
            <Modal
                animationType="fade"
                visible={secretModal > 0}
                transparent={true}>
                <View style={{flex:1,justifyContent:'center'}}>
                    <View style={styles.nameModal}>
                        <View style={{flexDirection: 'row',paddingRight:15 ,alignSelf:'flex-end'}}>
                            <Pressable onPress={() => {
                                setSecretModal(0)
                                setSecret(false) 
                            }}>
                            <Image source={deleteImg} style={{width:30,height:30}}/>
                            </Pressable>
                        </View>
                        { !secret && <View>
                        <Text style={[styles.h3,{marginBottom:10}]}>비밀번호를 입력해주세요</Text>       
                        <View style={{flexDirection:'row'}}>
                            <TextInput style={styles.txtBox} secureTextEntry={true}
                            value={rePwd} onChangeText={(text) => setRePwd(text)} 
                            placeholder='비밀번호 입력'/>
                            <Pressable onPress={() => onSecret()}
                                style={[styles.changeBut,{borderColor: 'gray'}]}>
                                <Text style={{color: 'gray',fontWeight:'bold'}}>확인</Text>
                            </Pressable>
                        </View>
                        </View>}
                        { secret && secretModal === 1 && <View>
                            <Text style={[styles.h3,{marginBottom:10}]}>새 비밀번호를 입력해주세요</Text>       
                            <Text style={styles.smTxt}>8자리 이상 20자리 이하, 영문, 숫자, 특수문자 포함</Text>
                                <TextInput style={styles.txtBox} secureTextEntry={true}
                                value={pwd} onChangeText={(text) => setPwd(text)} 
                                placeholder='비밀번호 입력'/>
                            <Text style={[styles.h3,{marginBottom:10}]}>비밀번호를 확인해주세요</Text>       
                                <TextInput style={styles.txtBox} secureTextEntry={true}
                                value={pwdCheck} onChangeText={(text) => setPwdCheck(text)} 
                                placeholder='비밀번호 확인'/>
                            <View style={{flexDirection:'row',justifyContent:'center'}}>
                            <Pressable onPress={() => pwdSame && onChangePwd()}
                                style={[styles.changeBut,{borderColor: pwdSame ? 'gray' : 'lightgray',paddingVertical: 7}]}>
                                <Text style={{color: pwdSame ? 'gray' : 'lightgray',fontWeight:'bold'}}>변경</Text>
                            </Pressable>
                            </View>
                        </View>}
                        { secret && secretModal === 2 && <View>
                            <Text style={[styles.h3,{marginBottom:10,color:'tomato'}]}>정말 탈퇴하시겠습니까?</Text>   
                            <Text style={[styles.smTxt,{marginBottom:20}]}>탈퇴한 계정은 복구가 불가합니다</Text>   
                            <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                                <Pressable onPress={() => onDelete()}>
                                    <Text>예</Text>
                                </Pressable>
                                <Pressable onPress={() => {
                                    setSecret(false)
                                    setSecretModal(0)
                                }}>
                                    <Text style={{fontWeight:'bold'}}>아니요</Text>
                                </Pressable>
                            </View>
                        </View>}
                        <Text style={[styles.smTxt,{color: 'tomato'}]}>{pwdTxt}</Text>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    h1 : {
        fontSize: 40,
        fontFamily: 'esamanruMedium',
        marginBottom: 30,
        borderBottomWidth: 5,
        paddingVertical: 10,
        borderBottomColor:'gray'
    },
    h2 : {
        fontSize: 23,
        fontFamily: 'esamanruMedium',
    },
    h3 : {
        fontSize: 18,
        fontWeight: 'bold',
    },
    h6 : {
        borderTopColor: 'white',
        borderTopWidth: 10,
        backgroundColor: '#c7c7c7',
        fontSize: 17,
        fontWeight: 'bold',
        paddingHorizontal: 5,
        marginLeft: 5
    },
    txtBox : {
        fontSize: 15,
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        marginHorizontal:15,
        marginBottom:5,
        padding: 3
    },
    smTxt : {
        paddingTop:3,
        paddingLeft: 10,
        fontSize : 12,
        fontWeight:'bold',
        color:'gray'
    },
    myBigBut : {
        width: '30%',
        paddingVertical: 15,
        marginVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        shadowColor: '#000',
    },
    myBut : {
        color: 'gray',
        fontSize: 17,
        padding: 4,
        paddingLeft: '1%',
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: 'gray',
        marginHorizontal: '1%',
        marginVertical: 3
    },
    //policyModal
    policyModal : {
        marginHorizontal: '5%',
        marginBottom: '20%',
        marginTop: '5%',
        paddingHorizontal: '2%',
        paddingVertical: '1%',
        backgroundColor:'white',
        borderWidth: 2,
        borderColor: 'black',
        borderRadius: 5
    },
    //nickname변경
    nameModal : {
        width: '90%',
        paddingVertical: 15,
        borderRadius: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        shadowColor: '#000',
        elevation: 5
    },
    changeBut : {
        justifyContent:'center',
        backgroundColor:'whitesmoke',
        marginLeft: 10,
        borderWidth: 2,
        paddingHorizontal: 15,
        marginVertical: 3,
        borderRadius: 5
    },
})

export default UserPage;