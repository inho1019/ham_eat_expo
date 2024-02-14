import React, { createContext, useContext, useEffect, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 초기 상태
const initialState = {
  loading : false,
  page: 0,
  count: 0,
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
    case 'SET_COUNT' :
      return { ...state, count: action.payload }
    case 'SET_USER' :
      return { ...state, user: action.payload }
    case 'SET_VIEW' :
      return { ...state, view: action.payload }
    default:
      return state;
  }
};

// Context Provider 컴포넌트
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  useEffect(() => {
    const getUserSession = async () => {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const action = JSON.parse(user);
          dispatch({ type: 'SET_USER', payload: action });
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