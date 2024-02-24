import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import axios from 'axios';
import { useAppContext } from '../api/ContextAPI';

const HamburgerAdd = (props) => {
    const {route} = props;

    const { state , dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

    const onAlertTxt = (txt) => {
        dispatch({ type: 'SET_ALERTTXT' , payload : txt });
    };

////////////////////////////////////////////////////////////////////

    const [ingreDTO,setIngreDTO] = useState({
        type : -1,
        name : '',
        kcal : '',
        image : '',
        width : '500',
        height: '',
        carbohydrates: '',
        lipid: '',
        protein: ''
    })

    const onIngre = () => {
        onLoading(true)
        axios.post('https://hameat.onrender.com/ingre/write',ingreDTO)
        .then(res => {
            onLoading(false)
            onAlertTxt('재료가 등록되었습니다')
        }).catch(() => {
            onAlertTxt('등록 중 에러발생')
            onLoading(false)
        })
    }
    const [storeDTO,setStoreDTO] = useState({
        type : route.params.type,
        name : '',
        image : '',
        address : ''
    })

    const onStore = () => {
        onLoading(true)
        axios.post('https://hameat.onrender.com/store/write',storeDTO)
        .then(res => {
            onLoading(false)
            onAlertTxt('메장이 등록되었습니다')
        })
        .catch(() => {
            onAlertTxt('등록 중 에러발생')
            onLoading(false)
        })
      }

    return (
        <ScrollView>
            {route.params.type ===3 && state.user.own === 2 && 
            <View>
            <View style={styles.butContainer}>
                <Pressable 
                    style={[styles.typeBut,
                    {backgroundColor: ingreDTO.type === 0 ? '#2E8DFF' : 'white'}]}
                    onPress={() => setIngreDTO({...ingreDTO, type: 0})}
                >
                    <Text>Bun</Text>
                </Pressable>
                <Pressable
                    style={[styles.typeBut,
                    {backgroundColor: ingreDTO.type === 1 ? '#2E8DFF' : 'white'}]}
                    onPress={() => setIngreDTO({...ingreDTO, type: 1})}
                >
                    <Text>Patty</Text>
                </Pressable>
                <Pressable
                    style={[styles.typeBut,
                    {backgroundColor: ingreDTO.type === 2 ? '#2E8DFF' : 'white'}]}
                    onPress={() => setIngreDTO({...ingreDTO, type: 2})}
                >
                    <Text>Vegetable</Text>
                </Pressable>
                <Pressable
                    style={[styles.typeBut,
                    {backgroundColor: ingreDTO.type === 3 ? '#2E8DFF' : 'white'}]}
                    onPress={() => setIngreDTO({...ingreDTO, type: 3})}
                >
                    <Text>Filling</Text>
                </Pressable>
                <Pressable
                    style={[styles.typeBut,
                    {backgroundColor: ingreDTO.type === 4 ? '#2E8DFF' : 'white'}]}
                    onPress={() => setIngreDTO({...ingreDTO, type: 4})}
                >
                    <Text>Sauce</Text>
                </Pressable>
            </View>
            <View style={{flexDirection:'row'}}><Text style={styles.h4}>이름</Text></View>
            <TextInput value={ingreDTO.name} style={styles.txtBox}
                onChangeText={(text) => setIngreDTO({...ingreDTO, name: text})}/>
            <View style={{flexDirection:'row'}}><Text style={styles.h4}>칼로리(kcal)</Text></View>
            <TextInput 
                keyboardType="numeric" 
                value={ingreDTO.kcal} style={styles.txtBox}
                onChangeText={(text) => setIngreDTO({...ingreDTO, kcal: text.replace(/[^0-9]/g, '')})}/>
            <View style={{flexDirection:'row'}}><Text style={styles.h4}>탄수화물(g)</Text></View>
            <TextInput 
                keyboardType="numeric"
                value={ingreDTO.carbohydrates} style={styles.txtBox}
                onChangeText={(text) => setIngreDTO({...ingreDTO, carbohydrates: text.replace(/[^0-9]/g, '')})}/>
            <View style={{flexDirection:'row'}}><Text style={styles.h4}>단백질(g)</Text></View>
            <TextInput 
                keyboardType="numeric"
                value={ingreDTO.protein} style={styles.txtBox}
                onChangeText={(text) => setIngreDTO({...ingreDTO, protein: text.replace(/[^0-9]/g, '')})}/>
            <View style={{flexDirection:'row'}}><Text style={styles.h4}>지방(g)</Text></View>
            <TextInput 
                keyboardType="numeric"
                value={ingreDTO.lipid} style={styles.txtBox}
                onChangeText={(text) => setIngreDTO({...ingreDTO, lipid: text.replace(/[^0-9]/g, '')})}/>
            <View style={{flexDirection:'row'}}><Text style={styles.h4}>이미지</Text></View>
            <TextInput value={ingreDTO.image} style={styles.txtBox}
                onChangeText={(text) => setIngreDTO({...ingreDTO, image: text})}/>
            <View style={{flexDirection:'row'}}><Text style={styles.h4}>width *500 고정</Text></View>
            <TextInput 
                keyboardType="numeric"
                value={ingreDTO.width}
                style={styles.txtBox}
                />
            <View style={{flexDirection:'row'}}><Text style={styles.h4}>height</Text></View>
            <TextInput 
                keyboardType="numeric"
                value={ingreDTO.height} style={styles.txtBox}
                onChangeText={(text) => setIngreDTO({...ingreDTO, height: text.replace(/[^0-9]/g, '')})}/>
            <Pressable onPress={() => onIngre()}
                style={styles.addBut}>
                <Text style={styles.addButTxt}>재료 등록</Text>
            </Pressable>
            </View>}
            {route.params.type !== 3 && <View>
                <View style={{flexDirection:'row'}}><Text style={styles.h4}>프렌차이즈 이름</Text></View>
                <TextInput value={storeDTO.name} style={styles.txtBox}
                    onChangeText={(text) => setStoreDTO({...storeDTO, name: text})}/>
                <Pressable onPress={() => onStore()}
                    style={styles.addBut}>
                    <Text style={styles.addButTxt}>등록</Text>
                </Pressable>
            </View>}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    butContainer: {
        flexDirection:'row',
        justifyContent: 'space-evenly'
    },
    typeBut : {
        height: 70,
        width: 70,
        alignItems: 'center',
        justifyContent: 'center'
    },
    h4 : {
        borderTopColor: 'white',
        borderTopWidth: 7,
        backgroundColor: '#c7c7c7',
        fontSize: 15,
        fontWeight: 'bold',
        paddingHorizontal: 5,
        marginLeft: 5
    },
    txtBox : {
        fontSize: 14,
        borderBottomColor: 'black',
        borderBottomWidth: 1,
        marginHorizontal:15,
        marginBottom: 2,
        padding: 3
    },
    addBut : {
        alignSelf:'center',
        marginVertical: 30,
        paddingVertical: 10,
        paddingHorizontal: 40,
        backgroundColor:'#2E8DFF',
        borderRadius: 10,
    },
    addButTxt : {
        fontSize: 16,
        fontWeight:'bold',
        color: 'white'
    },
});
export default HamburgerAdd;