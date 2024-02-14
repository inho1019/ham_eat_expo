import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import HamburgerStore from './HamburgerStore';
import HamburgerMake from './HamburgerMake';
import HamburgerWrite from './HamburgerWrite';
import axios from 'axios';
import { useAppContext } from '../api/ContextAPI';

const HamburgerForm = (props) => {
    const {navigation,route} = props

    const scrollRef = useRef(null)

    const windowHeight = Dimensions.get('window').height*0.85;
    
    //////////////alert////////////////////
    const [alertTxt,setAlertTxt] = useState('')

    const onAlert = (txt) => {
        setAlertTxt(txt)
    }

    useEffect(()=> {
        if(alertTxt !== '') {
            setTimeout(() => {
                setAlertTxt('')
            }, 2000)
        }
    },[alertTxt])

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
        price: ''
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

    const onType = (num) => {
        if(num === 2) {
            setPage(2)
        } else {
            setPage(1)
        }
        setBurgerDTO({...burgerDTO, type : num})
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
                axios.post(`https://hameat.onrender.com/burger/write`, {...burgerDTO, userSeq : state.user.userSeq} )
                .then(res => {
                    if(bool) {
                        const ratingDTO = {...dto, burgerSeq : res.data.burgerSeq, type : burgerDTO.type, userSeq : state.user.userSeq }
                        axios.post(`https://hameat.onrender.com/rating/write`,ratingDTO)
                        .then(() => {
                            onLoading(false)
                            navigation.navigate('Home', { alertTxt:'등록이 완료되었습니다' })
                        })
                        .catch(() => {
                            setAlertTxt('평가 등록 중 에러발생')
                            onLoading(false)
                        })
                    } else {
                        onLoading(false)
                        navigation.navigate('Home', { alertTxt:'등록이 완료되었습니다' })
                    }
                })
                .catch(() => {
                    setAlertTxt('버거 등록 중 에러발생')
                    onLoading(false)
                })
            } else setAlertTxt('설명을 입력해 주세요');
        } else setAlertTxt('이름을 입력해 주세요')
    }
    return (
        <ScrollView style={{flex: 1, maxHeight: windowHeight * 4}} ref={scrollRef} scrollEnabled={false}
            showsVerticalScrollIndicator={false}    >
            <View style={{height:windowHeight,justifyContent: 'center',paddingVertical: '1%'}}>
                <Pressable style={{marginVertical:'7%'}}
                    onPress={() => onType(0)}
                    onPressIn={() => aniFren(1.2)}
                    onPressOut={() => aniFren(1)}
                >
                    <Animated.Text style={[styles.handText,{ transform: [{scale : fren}] }]}>프렌차이즈 버거</Animated.Text>
                </Pressable>
                <Pressable style={{marginVertical:'7%'}}
                    onPress={() => onType(1)}
                    onPressIn={() => aniHand(1.2)}
                    onPressOut={() => aniHand(1)}
                >
                    <Animated.Text style={[styles.handText,{ transform: [{scale : hand}] }]}>수제 버거</Animated.Text>
                </Pressable>
                <Pressable style={{marginVertical:'7%'}}
                    onPress={() => onType(2)}
                    onPressIn={() => aniMine(1.2)}
                    onPressOut={() => aniMine(1)}
                >
                    <Animated.Text style={[styles.handText,{ transform: [{scale : mine}] }]}>DIY 버거</Animated.Text>
                </Pressable>
            </View>
            <View style={{height:windowHeight,paddingVertical: '1%'}}>
                <HamburgerStore onBack={onBack} navigation={navigation} 
                route={route} type={burgerDTO.type} onStore={onStore} onLoading={onLoading} onAlert={onAlert}/>
            </View>
            <View style={{height:windowHeight,paddingVertical: '1%'}}>
                <HamburgerMake onBack={onBack} navigation={navigation} onAlert={onAlert}
                    route={route} onLoading={onLoading} onMakes={onMake}/>
            </View>
            <View style={{height:windowHeight,paddingVertical: '1%'}}>
                <HamburgerWrite onBack={onBack} navigation={navigation} onAlert={onAlert}
                    onInput={onInput} burgerDTO={burgerDTO} onSubmit={onSubmit}/>
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
        textAlign: 'center',
    },
    ///////////alert///////////
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
    },
});

export default HamburgerForm;