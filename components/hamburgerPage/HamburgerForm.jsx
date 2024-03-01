import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import HamburgerStore from './HamburgerStore';
import HamburgerMake from './HamburgerMake';
import HamburgerWrite from './HamburgerWrite';
import axios from 'axios';
import { useAppContext } from '../api/ContextAPI';

const HamburgerForm = (props) => {
    const {navigation,route} = props

    const scrollRef = useRef(null)

    const windowHeight = Dimensions.get('window').height*0.85;
    
    ///////////// 애니메이션//////////////
    const fren = useRef(new Animated.Value(1)).current;
    const hand = useRef(new Animated.Value(1)).current;
    const mine = useRef(new Animated.Value(1)).current;

    const aniFren = (num) => {
        Animated.timing(fren, {
            toValue: num,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          }).start();
    }
    const aniHand = (num) => {
        Animated.timing(hand, {
            toValue: num,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          }).start();
    }
    const aniMine = (num) => {
        Animated.timing(mine, {
            toValue: num,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
        }).start();
    }
    ///////////////////////////////////////////

    const [page,setPage] = useState(0)
    const [burgerDTO,setBurgerDTO] = useState({
        type: -1,
        storeSeq: -1,
        userSeq: -1,
        size: -1,
        make: '',//json형식
        name: '',
        content: '',
        price: '',
        status: 0
    })

    const onInput = (name, value) => {
        setBurgerDTO({
            ...burgerDTO,
            [name] : value
        })
    }

    const { state , dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

    const onAlertTxt = (txt) => {
        dispatch({ type: 'SET_ALERTTXT' , payload : txt });
    };

    //////////////////Update 시//////////////////////////////////

    const [updateBool,setUpdateBool] = useState(false)

    useEffect(() => {
        if(route.params?.updateSeq !== undefined && !updateBool) {
            setUpdateBool(true)
            onLoading(true)
            navigation.setOptions({
                title: '버거 수정'
            });
            axios.get(`https://hameat.onrender.com/burger/view/${route.params?.updateSeq}`)
            .then(res => {
                setBurgerDTO(res.data[0])
                onLoading(false)
            })
            .catch(() => {
                onAlertTxt('불러오기 중 에러발생')
                onLoading(false)
                navigation.goBack(-1)
            })
        }
    },[route])

    /////////////////////////////////////////////////////////////

    const onType = (num) => {
        if(num === 2) {
            setPage(2)
        } else {
            setPage(1)
        }
        setBurgerDTO({...burgerDTO, type : num, price: '', storeSeq: -1})
        scrollRef.current.scrollTo({ y: windowHeight * (num === 2 ? 2 : 1), animated: true });
    }

    const onStore = (num) => {
        setBurgerDTO({...burgerDTO, storeSeq : num})
        setPage(2)
        scrollRef.current.scrollTo({ y: windowHeight*2, animated: true });
    }
    const onMake = (num,dto) => {
        setBurgerDTO({...burgerDTO, size : num, make : JSON.stringify(dto)})
        setPage(3)
        scrollRef.current.scrollTo({ y: windowHeight*3, animated: true });
    }

    const onBack = () => {
        if(page === 2) {
            if (burgerDTO.type === 2) {
                setPage(page - 2)
                scrollRef.current.scrollTo({ y: (page - 2) * windowHeight, animated: true });
                return
            }
        }
        setPage(page - 1)
        scrollRef.current.scrollTo({ y: (page - 1) * windowHeight, animated: true });
    }

    const onSubmit = (dto,bool) => {
        if(burgerDTO.name.length > 0) {
            if(burgerDTO.content.length > 0) {
                onLoading(true)
                if(updateBool) {
                    Promise.all([
                        axios.put(`https://hameat.onrender.com/burger/update`, burgerDTO),
                        axios.put(`https://hameat.onrender.com/rating/updateType`, burgerDTO)
                    ])
                    .then(() => {
                        axios.get(`https://hameat.onrender.com/burger/status/${route.params?.updateSeq}`)
                        .then(() => { 
                            onAlertTxt('수정이 완료되었습니다')
                            onLoading(false)
                            navigation.navigate('View', { burgerSeq : route.params?.updateSeq })
                        })
                        .catch(() => {
                            onAlertTxt('수정 중 에러발생')
                            onLoading(false)
                        })
                    })
                    .catch(() => {
                        onAlertTxt('수정 중 에러발생')
                        onLoading(false)
                    })
                } else {
                    axios.post(`https://hameat.onrender.com/burger/write`, {...burgerDTO, userSeq : state.user.userSeq} )
                    .then(res => {
                        if(bool) {
                            const ratingDTO = {...dto, burgerSeq : res.data.burgerSeq, type : burgerDTO.type, userSeq : state.user.userSeq }
                            axios.post(`https://hameat.onrender.com/rating/write`,ratingDTO)
                            .then(() => {
                                onLoading(false)
                                onAlertTxt('등록이 완료되었습니다')
                                navigation.navigate('Home')
                            })
                            .catch(() => {
                                onAlertTxt('평가 등록 중 에러발생')
                                onLoading(false)
                            })
                        } else {
                            onLoading(false)
                            onAlertTxt('등록이 완료되었습니다')
                            navigation.navigate('Home')
                        }
                    })
                    .catch(() => {
                        onAlertTxt('버거 등록 중 에러발생')
                        onLoading(false)
                    })
                }
            } else onAlertTxt('설명을 입력해 주세요');
        } else onAlertTxt('이름을 입력해 주세요')
    }
    
    return (
        <ScrollView style={{flex: 1}} ref={scrollRef} scrollEnabled={false}
            contentContainerStyle={{height: windowHeight * 4}}
            showsVerticalScrollIndicator={false}>
            <View style={{height:windowHeight,justifyContent: 'center',paddingVertical: '1%'}}>
                <Pressable style={{marginVertical:'7%'}}
                    onPress={() => onType(0)}
                    onPressIn={() => aniFren(1.2)}
                    onPressOut={() => aniFren(1)}
                >
                    <Animated.Text style={[styles.handText,{ transform: [{scale : fren}], 
                        color : updateBool ? burgerDTO.type === 0 ? 'black' : 'darkgray' : 'black' }]}>프렌차이즈 버거</Animated.Text>
                </Pressable>
                <Pressable style={{marginVertical:'7%'}}
                    onPress={() => onType(1)}
                    onPressIn={() => aniHand(1.2)}
                    onPressOut={() => aniHand(1)}
                >
                    <Animated.Text style={[styles.handText,{ transform: [{scale : hand}], 
                        color : updateBool ? burgerDTO.type === 1 ? 'black' : 'darkgray' : 'black' }]}>수제 버거</Animated.Text>
                </Pressable>
                <Pressable style={{marginVertical:'7%'}}
                    onPress={() => onType(2)}
                    onPressIn={() => aniMine(1.2)}
                    onPressOut={() => aniMine(1)}
                >
                    <Animated.Text style={[styles.handText,{ transform: [{scale : mine}], 
                        color : updateBool ? burgerDTO.type === 2 ? 'black' : 'darkgray' : 'black' }]}>DIY 버거</Animated.Text>
                </Pressable>
            </View>
            <View style={{height:windowHeight,paddingVertical: '1%'}}>
                <HamburgerStore onBack={onBack} navigation={navigation} updateBool={updateBool} burgerDTO={burgerDTO}
                route={route} type={burgerDTO.type} onStore={onStore} onLoading={onLoading} onAlert={onAlertTxt}/>
            </View>
            <View style={{height:windowHeight,paddingVertical: '1%'}}>
                <HamburgerMake onBack={onBack} navigation={navigation} onAlert={onAlertTxt}
                    route={route} onLoading={onLoading} onMakes={onMake} updateBool={updateBool} burgerDTO={burgerDTO}/>
            </View>
            <View style={{height:windowHeight,paddingVertical: '1%'}}>
                <HamburgerWrite onBack={onBack} navigation={navigation} onAlert={onAlertTxt}
                    onInput={onInput} burgerDTO={burgerDTO} onSubmit={onSubmit} updateBool={updateBool}/>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
    },
    handText : {
        fontSize: 30,
        fontFamily: 'esamanruMedium',
        textAlign: 'center',
    }
});

export default HamburgerForm;