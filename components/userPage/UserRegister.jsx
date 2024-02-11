import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Image, Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Calendar } from "react-native-calendars";
import { useAppContext } from '../api/ContextAPI';
import deleteImg from '../../assets/burger/delete.png'


const UserRegister = (props) => {
    const {navigation} = props;
    
    const { dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };
    
    /////////////alert애니메이션//////////////
    const [alertTxt,setAlertTxt] = useState('')

    useEffect(()=> {
        if(alertTxt !== '') {
            setTimeout(() => {
                setAlertTxt('')
                if(complete) {
                  setComplete(false)
                  navigation.navigate('Login')
                }
            }, 2000)
        }
    },[alertTxt])
    ////////////이메일 정규식//////////////////
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
    })

    const onInput = (name, value) => {
      setUserDTO({
          ...userDTO,
          [name] : value
      })
    }

    const [email,setEmail] = useState('')
    
    const [count,setCount] = useState(-1)
    const [getAuth,setGetAuth] = useState('')
    const [auth,setAuth] = useState('')

    const [authGo,setAuthGo] = useState(false)
    const [authCom,setAuthCom] = useState(false)

    const [nameCheck,setNameCheck] = useState(false)

    const [complete,setComplete] = useState(false)
    
    const [cal,setCal] = useState(false)

    const onEmail = () => {
      Keyboard.dismiss();
      if(emailPattern(email)) {
        onLoading(true)
        axios.post(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/user/emailCheck`, { email: email })
        .then(res => {
          if(!res.data) {
            axios.post(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/user/email`, { email: email })
            .then(res => {
              setGetAuth(res.data)
              setAuthGo(true)
              setCount(180)
              onLoading(false)
            })
          } else {
            onLoading(false)
            setAlertTxt('중복된 이메일입니다')
            setEmail('')
          }
        })
      } else {
        setAlertTxt('올바른 이메일을 입력하세요')
        setEmail('')
      }
    }

    const onAuth = () => {
      if(auth == getAuth) {
        setAuthGo(false)
        setAuthCom(true)
        setAlertTxt('인증 성공')
      } else {
        setAlertTxt('인증번호를 확인해주세요')
        setAuth('')
      }
    }

    useEffect(() => {
      if(authGo) {
        if(count === 0) {
          setAuthGo(false)
          setCount(-1)
          setAlertTxt('인증 가능시간이 초과되었습니다')
          setGetAuth('')
        } else {
          setTimeout(() => {
            setCount(count - 1)
          }, 999)
        }
      }
    },[count])

    useEffect(() => {
      if(namePattern(userDTO.name)) {
        axios.post(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/user/nameCheck`, { name : userDTO.name } )
        .then(res => {
          if(res.data) setNameCheck(false)
          else setNameCheck(true)
        })
      } else {
        setNameCheck(false)
      }
    },[userDTO.name])

    const [year,setYear] = useState(new Date().getFullYear())
    const [month,setMonth] = useState(new Date().getMonth() + 1)
    const [day,setDay] = useState(new Date().getDate())

    const onYear = (num) => {
      Keyboard.dismiss()
      setYear(num)
      setCal(false)
      requestAnimationFrame(()=>setCal(true))
    }

    const onSub = () => {
      Keyboard.dismiss()
      if (pwdPattern(userDTO.pwd)){
        if (pwdCheck === userDTO.pwd) {
          if (nameCheck) {
            onLoading(true)
            const dto = {...userDTO, birth : `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`, email : email}
            axios.post(`https://port-0-ham-eat-3wh3o2blr4s3qj5.sel5.cloudtype.app/user/register`, dto )
            .then(res => {
              onLoading(false)
              if(res.data) {
                setComplete(true)
                setAlertTxt('회원가입이 완료되었습니다')
              } else {
                setComplete(true)
                setAlertTxt('회원가입에 실패 :: 관리자 문의 요망')
              }
            })
          } else {
            setAlertTxt('중복이거나 사용 불가한 닉네임입니다')
          }
        } else {
          setAlertTxt('비밀번호가 일치하지 않습니다')
        }
      } else {
        setAlertTxt('비밀번호 형식이 올바르지 않습니다')
      }
    }

    return (
      <ScrollView style={{ flex: 1, paddingTop: 30 }}>
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
            { userDTO.name.length > 0 &&<Text style={[styles.smTxt,{color: nameCheck ? 'skyblue' : 'tomato'}]}>
              {nameCheck ? '사용 가능한 닉네임입니다' : '중복이거나 사용 불가한 닉네임입니다' }</Text>}
            <View style={{ flexDirection : 'row' }}><Text style={styles.h3}>성별</Text></View>
            <View style={{ flexDirection : 'row' , justifyContent : 'space-around'}}>
              <Pressable onPress={() => onInput('gender',0)}>
                <Text style={[styles.genTxt,{color: userDTO.gender === 0 ? 'black' : 'darkgray'}]}>비공개</Text>
              </Pressable>
              <Pressable onPress={() => onInput('gender',1)}>
                <Text style={[styles.genTxt,{color: userDTO.gender === 1 ? 'skyblue' : 'darkgray'}]}>남자</Text>
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
              <Text style={styles.txtBox}>{year}-{month.toString().padStart(2, '0')}-{day.toString().padStart(2, '0')}</Text>
            </Pressable>
            <Pressable style={styles.but} onPress={() => onSub()}>
              <Text style={styles.butTxt}>회원가입</Text>
            </Pressable>
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
              <View style={{flexDirection: 'row',justifyContent:'space-around',paddingBottom: 10,backgroundColor:'white'}}>
                <Pressable onPress={() => onYear(year-10)}><Text style={styles.yearTxt}>-10</Text></Pressable>
                <Pressable onPress={() => onYear(year-1)}><Text style={styles.yearTxt}>-1</Text></Pressable>
                <Pressable onPress={() => onYear(new Date().getFullYear())}>
                  <Text style={styles.yearTxt}>YEAR</Text>
                </Pressable>
                <Pressable onPress={() => onYear(year+1)}><Text style={styles.yearTxt}>+1</Text></Pressable>
                <Pressable onPress={() => onYear(year+10)}><Text style={styles.yearTxt}>+10</Text></Pressable>
              </View>
                <Calendar 
                  current={`${year}-${month}-${day}`}
                  style={{borderBottomWidth:1,borderColor:'black'}}
                  onDayPress={(day) => {
                    setCal(false)
                    setYear(day.year)
                    setMonth(day.month)
                    setDay(day.day)
                  }}
                />
              </View>
          </Modal>
      </ScrollView>
    );
};

const styles = StyleSheet.create({
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

export default UserRegister;