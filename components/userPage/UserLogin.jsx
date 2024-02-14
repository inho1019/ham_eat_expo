import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useAppContext } from '../api/ContextAPI';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserLogin = (props) => {

  const {navigation} = props;

  /////////////alert애니메이션//////////////
  const [alertTxt,setAlertTxt] = useState('')

  useEffect(()=> {
      if(alertTxt !== '') {
          setTimeout(() => {
              setAlertTxt('')
          }, 2000)
      }
  },[alertTxt])
  ///////////// 애니메이션//////////////
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

  const onCount = (num) => {
      dispatch({ type: 'SET_COUNT' , payload : num });
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

  useEffect(() => {
    if(state.count > 0) {
      setTimeout(() => {
        onCount(state.count - 1)
      }, 999)
    } 
  },[state.count])
  ///////////////////////////////////////////
  const [loginDTO,setLoginDTO] = useState({
    email : '',
    pwd : ''
  })

  const [save,setSave] = useState(false)
  const [wrong,setWrong] = useState(0)

  const onInput = (name, value) => {
    setLoginDTO({
        ...loginDTO,
        [name] : value
    })
  }

  const onSub = () => {
    onLoading(true)
    axios.post(`https://hameat.onrender.com/user/login`,loginDTO)
    .then(res => {
      onLoading(false)
      aniLog(0)
      setLoginDTO({
        ...loginDTO,
        pwd : ''
      })
      if(res.data.bool) {
        onUser(res.data.userDTO)
        if(save) {
          AsyncStorage.setItem(
            'user',
            JSON.stringify(res.data.userDTO)
          );
        }
        onPage(4)
      } else {
        setAlertTxt('이메일 또는 비밀번호가 올바르지 않습니다 :: ' + (wrong + 1) + '회')
        if(wrong < 4) {
          setWrong(wrong + 1)
        } else {
          setWrong(0)
          onCount(60)
        }
      }
    })
    .catch(() => {
      setAlertTxt('로그인 중 에러발생')
      onLoading(false)
    })
  }

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
          {state.count > 0 ? <View 
          >
            <View style={[styles.wrg]}>
              <Text style={[styles.wrgTxt]}>{state.count}</Text>
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

export default UserLogin;