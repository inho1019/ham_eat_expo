import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Keyboard, Linking, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useAppContext } from '../api/ContextAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserLogin = (props) => {

  const {navigation} = props;

  const loginBut = useRef(new Animated.Value(0)).current;
  const registerBut = useRef(new Animated.Value(0)).current;

  const aniLog = (num) => {
      Animated.timing(loginBut, {
          toValue: num,
          duration: 500,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease)
        }).start();
  }
  const aniReg = (num) => {
      Animated.timing(registerBut, {
          toValue: num,
          duration: 500,
          useNativeDriver: false,
          easing: Easing.out(Easing.ease)
        }).start();
  }

  const logButBack = {
    backgroundColor: loginBut.interpolate({
      inputRange: [0, 1],
      outputRange: ['white', 'gray'],
    }),
  };
  const logTxtCol = {
    color: loginBut.interpolate({
      inputRange: [0, 1],
      outputRange: ['gray', 'white'],
    }),
  };
  const regButBack = {
    backgroundColor: registerBut.interpolate({
      inputRange: [0, 1],
      outputRange: ['white', 'gray'],
    }),
  };
  const regTxtCol = {
    color: registerBut.interpolate({
      inputRange: [0, 1],
      outputRange: ['gray', 'white'],
    }),
  };
  /////////////state/////////////////////////
  const { state, dispatch } = useAppContext();

  const onDate = (date) => {
      dispatch({ type: 'SET_DATE' , payload : date });
  };

  const onLoading = (bool) => {
    dispatch({ type: 'SET_LOADING' , payload : bool });
  };

  const onUser = (userDTO) => {
    dispatch({ type: 'SET_USER' , payload : userDTO });
  };

  const onPage = (num) => {
    dispatch({ type: 'SET_PAGE' , payload : num });
  };

  const onAlertTxt = (txt) => {
    dispatch({ type: 'SET_ALERTTXT' , payload : txt });
  };

  ///////////////////////////////////////////
  
  const [loginDTO,setLoginDTO] = useState({
    email : '',
    pwd : ''
  })
  
  const [save,setSave] = useState(true)
  const [wrong,setWrong] = useState(0)
  const [count,setCount] = useState(9999)
  
  const onInput = (name, value) => {
    setLoginDTO({
      ...loginDTO,
      [name] : value
    })
  }
  
  const onSub = () => {
    Keyboard.dismiss()
    onLoading(true)
    axios.post(`https://hameat.onrender.com/user/login`,loginDTO)
    .then(res => {
      aniLog(0)
      setLoginDTO({
        ...loginDTO,
        pwd : ''
      })
      if(res.data.bool) {
        axios.post(`https://hameat.onrender.com/jwt/getToken`,{ userSeq : res.data.userDTO.userSeq })
        .then(res2 =>{
          onLoading(false)
          onUser(res.data.userDTO)
          if(save) {
                AsyncStorage.multiSet([
                ['token', res2.data],
                ['userSeq', res.data.userDTO.userSeq.toString()],
            ])
          }
          onAlertTxt('로그인 성공')
          onPage(4)
        })
        } else {
          onLoading(false)
          onAlertTxt('이메일 또는 비밀번호가 올바르지 않습니다 :: ' + (wrong + 1) + '회')
          if(wrong < 4) {
            setWrong(wrong + 1)
          } else {
            setWrong(0)
            let currentDate = new Date();
            currentDate.setMinutes(currentDate.getMinutes() + 1);
            onDate(currentDate)
            setCount(60)
          }
        }
      })
      .catch(() => {
        onAlertTxt('로그인 중 에러발생')
        onLoading(false)
      })
    }

    useEffect(() => {
      if(state.date < new Date()) {
        setCount(-1)
      } else {
        setTimeout(() => {
          setCount(parseInt((state.date - new Date())/1000))
        }, 1000)
      }
    },[count])
    
    const openLink = (url) => {
      Linking.openURL(url)
      .catch((err) => console.error('Error opening external link:', err));
    };
    
    return (
      <View style={{ flex: 1, justifyContent: 'center'}}>
      <View style={styles.loginBox}>
        <View style={{ flexDirection: 'row' }}><Text style={styles.h3}>이메일</Text></View>
        <TextInput style={styles.txtBox} placeholder='이메일 입력' value={loginDTO.email} onChangeText={(text) => onInput('email',text)}/>
        <View style={{ flexDirection: 'row' }}><Text style={styles.h3}>비밀번호</Text></View>
        <TextInput style={styles.txtBox} placeholder='비밀번호 입력' secureTextEntry={true} 
          value={loginDTO.pwd} onChangeText={(text) => onInput('pwd',text)}/>
        <View style={{flexDirection: 'row-reverse'}}>
          <Switch 
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={'white'}
              onValueChange={() => setSave(!save)}
              value={save}
          />
          <Text style={{verticalAlign:'middle',fontWeight:'bold'}}>자동 로그인</Text>
        </View>
        <View style={{flexDirection:'row', justifyContent:'space-around', marginVertical: 15}}>
          {count > 0 ? <View 
          >
            <View style={[styles.wrg]}>
              <Text style={[styles.wrgTxt]}>{count > 60 ? '로딩중' : count}</Text>
            </View>
          </View> :
          <Pressable 
            onPress={() => onSub()}
            onPressIn={() => aniLog(1)}
            onPressOut={() => aniLog(0)}
          >
            <Animated.View style={[styles.but,logButBack]}>
              <Animated.Text style={[styles.butTxt,logTxtCol]}>로그인</Animated.Text>
            </Animated.View>
          </Pressable>}
          <Pressable 
            onPress={() => navigation.navigate('Register')}
            onPressIn={() => aniReg(1)}
            onPressOut={() => aniReg(0)}
          >
            <Animated.View style={[styles.but,regButBack]}>
              <Animated.Text style={[styles.butTxt,regTxtCol]}>회원가입</Animated.Text>
            </Animated.View>
          </Pressable>
        </View>
      </View>
      <Pressable onPress={() => openLink('https://kr.freepik.com/')}>
        <Text style={{textAlign:'center',fontSize:15,color:'darkgray',fontWeight:'bold',marginTop:5}}>
        Images Designed By FreePik</Text>
      </Pressable>
    </View>
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
  loginBox : {
    padding: 10,
    margin: 10,
  },
  but : {
    paddingHorizontal : 30,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 2,
    borderColor:'gray'
  },
  butTxt : {
    fontWeight : 'bold',
    fontSize : 15
  },
  wrg : {
    paddingHorizontal : 30,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 2,
    borderColor:'lightgray',
    backgroundColor: 'lightgray'
  },
  wrgTxt : {
    color: 'white',
    fontWeight : 'bold',
    fontSize : 15
  },
})

export default UserLogin;