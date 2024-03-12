import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Image, Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useAppContext } from '../api/ContextAPI';
import deleteImg from '../../assets/burger/delete.png'

LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
};

LocaleConfig.defaultLocale = 'ko';

const UserRegister = (props) => {
    const {navigation} = props;
    
    const { dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };
    
    const onAlertTxt = (txt) => {
      dispatch({ type: 'SET_ALERTTXT' , payload : txt });
    };
    /////////////////////////////////////////////
    const emailPattern = (email) => {
      const emailRegex = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
      return emailRegex.test(email);
    }
    ////////////비밀번호 정규식/////////////////
    const pwdPattern = (pwd) => {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
      return passwordRegex.test(pwd);
    }
    ////////////닉네임 정규식/////////////////
    const namePattern = (name) => {
      return (name.length >= 2 && name.length <= 16) ? true : false;
    }
    ////////////////////////////////////////////

    const [pwdCheck,setPwdCheck] = useState('')

    const [userDTO,setUserDTO] = useState({
      email : '',
      pwd : '',
      name : '',
      gender : 0,
      birth : new Date(),
      secretKey : ''
    })

    const onInput = (name, value) => {
      setUserDTO({
          ...userDTO,
          [name] : value
      })
    }

    const [email,setEmail] = useState('')
    
    const [count,setCount] = useState(-1)
    const [authDate,setAuthDate] = useState()
    const [getAuth,setGetAuth] = useState('')
    const [auth,setAuth] = useState('')

    const [authGo,setAuthGo] = useState(false)
    const [authCom,setAuthCom] = useState(false)

    const [nameCheck,setNameCheck] = useState(false)

    const [policy,setPolicy] = useState(true)
    const [policyTxt,setPolicyTxt] = useState('')
    const [termsTxt,setTermsTxt] = useState('')
    
    const [cal,setCal] = useState(false)

    const onEmail = () => {
      Keyboard.dismiss();
      if(emailPattern(email)) {
        onLoading(true)
        axios.post(`https://hameat.onrender.com/user/emailCheck`, { email: email })
        .then(res => {
          if(!res.data) {
            axios.post(`https://hameat.onrender.com/user/email`, { email: email })
            .then(res => {
              setGetAuth(res.data)
              setAuthGo(true)
              let currentDate = new Date();
              currentDate.setMinutes(currentDate.getMinutes() + 3);
              setAuthDate(currentDate)
              setCount(180)
              onLoading(false)
            })
          } else {
            onLoading(false)
            onAlertTxt('중복된 이메일입니다')
            setEmail('')
          }
        })
      } else {
        onAlertTxt('올바른 이메일을 입력하세요')
        setEmail('')
      }
    }

    const onAuth = () => {
      if(auth == getAuth) {
        setAuthGo(false)
        setAuthCom(true)
        onAlertTxt('인증 성공')
      } else {
        onAlertTxt('인증번호를 확인해주세요')
        setAuth('')
      }
    }

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

    useEffect(() => {
      if(authGo) {
        if(authDate < new Date()) {
          setAuthGo(false)
          setCount(-1)
          setAuthDate()
          onAlertTxt('인증 가능시간이 초과되었습니다')
          setGetAuth('')
        } else {
          setTimeout(() => {
            setCount(parseInt((authDate - new Date())/1000))
          }, 1000)
        }
      }
    },[count])

    useEffect(() => {
      if(namePattern(userDTO.name)) {
        axios.post(`https://hameat.onrender.com/user/nameCheck`, { name : userDTO.name } )
        .then(res => {
          if(res.data) setNameCheck(false)
          else setNameCheck(true)
        })
      } else {
        setNameCheck(false)
      }
    },[userDTO.name])

    
    const onSub = () => {
      Keyboard.dismiss()
      if (pwdPattern(userDTO.pwd)){
        if (pwdCheck === userDTO.pwd) {
          if (nameCheck) {
            onLoading(true)
            const dto = {...userDTO, birth : `${datec.getFullYear()}-${(datec.getMonth()+1).toString().padStart(2, '0')}-${datec.getDate().toString().padStart(2, '0')}`, email : email}
            axios.post(`https://hameat.onrender.com/user/register`, dto )
            .then(res => {
              onLoading(false)
              if(res.data) {
                onAlertTxt('회원가입이 완료되었습니다')
                navigation.navigate('Login', { email : email } )
              } else {
                onAlertTxt('회원가입에 실패 :: 관리자 문의 요망')
              }
            })
          } else {
            onAlertTxt('중복이거나 사용 불가한 닉네임입니다')
          }
        } else {
          onAlertTxt('비밀번호가 일치하지 않습니다')
        }
      } else {
        onAlertTxt('비밀번호 형식이 올바르지 않습니다')
      }
    }
    
    const [datec,setDatec] = useState(new Date())
    const [yearModal,setYearModal] = useState(false)

    let yearList = []
    for(let i = 0; i < 100; i++) {
        let year = new Date().getFullYear();
        yearList.push(year - i)
    }

    const calendarHeader = (date) => {
      const year = date.getFullYear();
      
      return (
        <Pressable
        onPress={() => {
          setYearModal(true)
          setDatec(date)
        }}>
            <Text style={{fontSize:18,fontWeight:'bold'}}>{year}년 {date.getMonth() + 1}월</Text>
        </Pressable>
  )}

    return (
      <View style={{ flex: 1}}>
        {policy ? <View>
          <View style={{ flexDirection : 'row' , marginVertical: 15}}><Text style={styles.h3}>이용약관</Text></View>
          <ScrollView style={styles.policyScroll}>
              <Text style={{flexWrap: 'wrap',paddingBottom: 100}}>{termsTxt}</Text>
          </ScrollView>
          <View style={{ flexDirection : 'row' , marginVertical: 15}}><Text style={styles.h3}>개인정보 처리 방침</Text></View>
          <ScrollView style={styles.policyScroll}>
              <Text style={{flexWrap: 'wrap',paddingBottom: 100}}>{policyTxt}</Text>
          </ScrollView>
          <Pressable style={styles.but} onPress={() => {
            setPolicy(false)
            onAlertTxt('이용약관 및 개인정보 처리 방침에 동의하셨습니다')
          }}>
            <Text style={styles.butTxt}>동의</Text>
          </Pressable>
        </View>  
      : <ScrollView style={{ flex: 1, paddingTop: 30 }}>
          <View style={{ flexDirection : 'row' }}><Text style={styles.h3}>이메일</Text></View>
          <TextInput style={[styles.txtBox,{color:authCom ? 'darkgray' : 'black'}]} 
            value={email} onChangeText={(text) => !authCom && setEmail(text)} 
            placeholder='이메일 입력'/>
          {!authGo && !authCom && <Pressable style={styles.but} onPress={() => onEmail()}>
              <Text style={styles.butTxt}>인증번호 받기</Text>
          </Pressable> }
          {authGo && <View>
            <View style={{ flexDirection : 'row'}}>
              <Text style={styles.h3}>인증번호 </Text>
              <TextInput style={styles.txtBox} value={auth} onChangeText={(text) => setAuth(text.replace(/[^0-9]/g, ''))} 
              keyboardType={'numeric'} placeholder='6자리 인증번호 입력'/>
              <Text style={styles.count}>{parseInt(count/60).toString().padStart(2, '0')}:
              {parseInt(count%60).toString().padStart(2, '0')}</Text>
            </View>
            <Pressable style={styles.but} onPress={() => onAuth()}>
              <Text style={styles.butTxt}>인증</Text>
            </Pressable>
          </View>}
          {authCom && <View>
            <View style={{ flexDirection : 'row' }}><Text style={styles.h3}>비밀번호</Text></View>
            <Text style={styles.smTxt}>8자리 이상 20자리 이하, 영문, 숫자, 특수문자 포함</Text>
            <TextInput style={styles.txtBox} secureTextEntry={true} 
              value={userDTO.pwd} onChangeText={(text) => onInput('pwd',text)} 
              placeholder='비밀번호 입력'/>
            { userDTO.pwd.length > 0 && !pwdPattern(userDTO.pwd) &&
            <Text style={[styles.smTxt,{color:'tomato'}]}>비밀번호 형식이 올바르지 않습니다</Text>}
            <View style={{ flexDirection : 'row' }}><Text style={styles.h3}>비밀번호 확인</Text></View>
            <TextInput style={styles.txtBox}  secureTextEntry={true} 
              value={pwdCheck} onChangeText={(text) => pwdPattern(userDTO.pwd) && setPwdCheck(text)} 
              placeholder='비밀번호 재입력'/>
            { pwdCheck.length > 0 && pwdCheck !== userDTO.pwd &&
            <Text style={[styles.smTxt,{color:'tomato'}]}>비밀번호가 일치하지 않습니다</Text>}
            <View style={{ flexDirection : 'row' }}><Text style={styles.h3}>닉네임</Text></View>            
            <TextInput style={styles.txtBox}
              value={userDTO.name} onChangeText={(text) => onInput('name',text)} 
              placeholder='닉네임 입력'/>
            { userDTO.name.length > 0 &&<Text style={[styles.smTxt,{color: nameCheck ? '#2E8DFF' : 'tomato'}]}>
              {nameCheck ? '사용 가능한 닉네임입니다' : '중복이거나 사용 불가한 닉네임입니다' }</Text>}
            <View style={{ flexDirection : 'row' }}><Text style={styles.h3}>성별</Text></View>
            <View style={{ flexDirection : 'row' , justifyContent : 'space-around'}}>
              <Pressable onPress={() => onInput('gender',0)}>
                <Text style={[styles.genTxt,{color: userDTO.gender === 0 ? 'black' : 'darkgray'}]}>비공개</Text>
              </Pressable>
              <Pressable onPress={() => onInput('gender',1)}>
                <Text style={[styles.genTxt,{color: userDTO.gender === 1 ? '#2E8DFF' : 'darkgray'}]}>남자</Text>
              </Pressable>
              <Pressable onPress={() => onInput('gender',2)}>
                <Text style={[styles.genTxt,{color: userDTO.gender === 2 ? 'tomato' : 'darkgray'}]}>여자</Text>
              </Pressable>
            </View>
            <View style={{ flexDirection : 'row' }}><Text style={styles.h3}>생일</Text></View>
            <Pressable onPress={() => {
              setCal(true)
              Keyboard.dismiss()
            }}>
              <Text style={styles.txtBox}>{`${datec.getFullYear()}-${(datec.getMonth()+1).toString().padStart(2, '0')}-${datec.getDate().toString().padStart(2, '0')}`}</Text>
            </Pressable>
            <Pressable style={styles.but} onPress={() => onSub()}>
              <Text style={styles.butTxt}>회원가입</Text>
            </Pressable>
          </View>}
          <Modal 
              animationType="fade"
              visible={cal}
              transparent={true}>
              <View style={{flex:1,justifyContent:'center',opacity:0.9}}>
              <View style={{flexDirection: 'row-reverse',padding:5,borderTopWidth:1,
                borderColor:'black',backgroundColor:'white'}}>
                <Pressable onPress={() => setCal(false)}>
                  <Image source={deleteImg} style={{width:30,height:30}}/>
                </Pressable>
              </View>
                <Calendar 
                  current={`${datec.getFullYear()}-${(datec.getMonth()+1).toString().padStart(2, '0')}-${datec.getDate().toString().padStart(2, '0')}`}
                  style={{borderBottomWidth:1,borderColor:'black'}}
                  onDayPress={(day) => {
                    setCal(false)
                    setDatec(new Date(day.dateString))
                  }}
                  renderHeader={calendarHeader}
                />
              </View>
          </Modal>
          <Modal 
                animationType="fade"
                visible={yearModal}
                transparent={true}>
                <TouchableWithoutFeedback onPress={() => setYearModal(false)}>
                    <View style={styles.yearModal}>         
                        <ScrollView style={styles.yearScroll}>
                            {yearList.map((item,index) => <Pressable
                                key={index}
                                onPress={() => {
                                    setYearModal(false)
                                    setDatec(dat => {
                                        dat.setFullYear(item)
                                    return dat})}}>
                                <Text style={[styles.yearItem,{backgroundColor:datec.getFullYear() === item ? 'lightgray' : 'whitesmoke'}]}>{item}</Text>
                            </Pressable>)}
                        </ScrollView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </ScrollView>}
    </View>
    );
};

const styles = StyleSheet.create({
  policyScroll : {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'darkgray',
    height: '30%',
    marginHorizontal: '4%',
  },
  h3 : {
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
  but : {
    width:'85%',
    paddingVertical:20,
    backgroundColor:'gray',
    alignSelf:'center',
    borderRadius: 10,
    marginVertical: 15
  },
  butTxt : {
    textAlign:'center',
    fontSize:19,
    fontWeight:'bold',
    color: 'white',
    textDecorationLine: 'underline'
  },
  count : {
    paddingTop : 5,
    fontSize: 20,
    fontWeight : 'bold',
    color: 'gray'
  },
  smTxt : {
    paddingTop:3,
    paddingLeft: 10,
    fontSize : 12,
    fontWeight:'bold',
    color:'gray'
  },
  genTxt : {
    fontSize: 25,
    fontWeight: 'bold'
  },
  yearTxt : {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'gray'
  },
  yearModal : {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearScroll : {
      maxHeight: 150,
      width:100,
      backgroundColor:'whitesmoke'
  },
  yearItem : {
      height:50,
      width:100,
      textAlign:'center',
      textAlignVertical:'center',
      fontSize: 22,
      fontWeight:'bold'
  }
})

export default UserRegister;