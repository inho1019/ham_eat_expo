import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// 초기 상태
const initialState = {
  loading : false,
  page: 0,
  alertTxt: '',
  date: new Date(),
  view : -1,
  user: {
    userSeq : -1,
    email : '',
    pwd : '',
    name : '',
    gender : -1,
    birth : '',
    own : -1
  }
};

// Context 생성
const AppContext = createContext();

// Reducer 함수
const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'SET_LOADING' :
      return { ...state, loading: action.payload }
    case 'SET_DATE' :
      return { ...state, date: action.payload }
    case 'SET_USER' :
      return { ...state, user: action.payload }
    case 'SET_VIEW' :
      return { ...state, view: action.payload }
    case 'SET_ALERTTXT' :
      return { ...state, alertTxt: action.payload }
    default:
      return state;
  }
};

// Context Provider 컴포넌트
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const getUserSession = async () => {
        const token = await AsyncStorage.getItem('token');
        const userSeq = await AsyncStorage.getItem('userSeq');
        if (userSeq && token) {
          axios.post('https://hameat.onrender.com/jwt/userByToken',{ token : token, userSeq : parseInt(userSeq) })
          .then(res => {
            dispatch({ type: 'SET_LOADING', payload: false });
            if(res.data) {
              dispatch({ type: 'SET_USER', payload: res.data });
              axios.post(`https://hameat.onrender.com/jwt/getToken`,{ userSeq : res.data.userSeq })
              .then(res2 => 
                {
                  AsyncStorage.multiSet([
                  ['token', res2.data],
                  ['userSeq', res.data.userSeq.toString()],
              ])})
            } else {
              dispatch({ type: 'SET_ALERTTXT', payload: '로그인 실패::다시 로그인 해주세요' })
              AsyncStorage.removeItem('token');
              AsyncStorage.removeItem('userSeq');
            }
          })
          .catch(() => {
            dispatch({ type: 'SET_ALERTTXT', payload: '로그인 중 오류 발생' })
          })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    getUserSession();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};



// Custom Hook: useContext를 사용하여 context에 접근하는 편리한 함수
export const useAppContext = () => {
  return useContext(AppContext);
};