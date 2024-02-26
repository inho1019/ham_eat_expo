import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppContext } from '../api/ContextAPI';
import deleteImg from '../../assets/burger/delete.png';

const Carousel = () => {

    const { dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

    const onAlertTxt = (txt) => {
        dispatch({ type: 'SET_ALERTTXT' , payload : txt });
      };
///////////////////////////////////////////////////////

    const [carouselList,setCarouselList] = useState([])

    useEffect(() => {
        onLoading(true)
        axios.get('https://hameat.onrender.com/carousel/list')
        .then(res => {
            setCarouselList(res.data)
            onLoading(false)
        })
        .catch(() => {
            onAlertTxt('불러오기 중 에러발생')
            onLoading(false)
        })
    },[])

    
    const [carouselDTO,setCarouselDTO] = useState({
        type: 0,
        image: '',
        url : '',
        seq: 0,
    })
    
    useEffect(() => {
        setCarouselDTO({...carouselDTO,url : '', seq: 0})
    },[carouselDTO.type])

    const onSub = () => {
        onLoading(true)
        axios.post('https://hameat.onrender.com/carousel/write', carouselDTO)
        .then(res => {
            setCarouselList([res.data,...carouselList])
            setCarouselDTO({
                type: 0,
                image: '',
                url : '',
                seq: 0,
            })
            onLoading(false)
        })
        .catch(() => {
            onAlertTxt('등록 중 에러발생')
            onLoading(false)
        })
    }

    const onDelete = (seq) => {
        onLoading(true)
        axios.delete(`https://hameat.onrender.com/carousel/delete/${seq}`)
        .then(() => {
            setCarouselList(item => item.filter(car => car.carouselSeq !== seq))
            onLoading(false)
        })
        .catch(() => {
            onAlertTxt('삭제 중 에러발생')
            onLoading(false)
        })
    }

    return (
        <ScrollView style={{padding:5}}>
            <View style={{flexDirection:'row'}}><Text style={styles.h3}>등록</Text></View>
            <Text style={styles.h4}>Type</Text>
            <View style={{flexDirection:'row',justifyContent:'space-around',margin:20}}>
                <Pressable onPress={() => setCarouselDTO({...carouselDTO,type : 0})}>
                    <Text style={{fontSize:20,fontWeight: carouselDTO.type === 0 ? 'bold' : '400'}}>외부</Text>
                </Pressable>
                <Pressable onPress={() => setCarouselDTO({...carouselDTO,type : 1})}>
                    <Text style={{fontSize:20,fontWeight: carouselDTO.type === 1 ? 'bold' : '400'}}>버거</Text>
                </Pressable>
                <Pressable onPress={() => setCarouselDTO({...carouselDTO,type : 2})}>
                    <Text style={{fontSize:20,fontWeight: carouselDTO.type === 2 ? 'bold' : '400'}}>글</Text>
                </Pressable>
            </View>
            <Text style={styles.h4}>Image</Text>
                <TextInput style={styles.txtBox} value={carouselDTO.image}
                onChangeText={(text) => setCarouselDTO({...carouselDTO,image : text})}/>
            {carouselDTO.type === 0 ? <View>
                <Text style={styles.h4}>URL</Text>
                <TextInput style={styles.txtBox} value={carouselDTO.url}
                onChangeText={(text) => setCarouselDTO({...carouselDTO,url : text})}/>
            </View>
            : <View>
                <Text style={styles.h4}>Seq</Text>
                <TextInput style={styles.txtBox} keyboardType='numeric' value={carouselDTO.seq.toString()}
                onChangeText={(text) => setCarouselDTO({...carouselDTO,seq : text.replace(/[^0-9]/g, '')})}/>
            </View>}
            <View style={{flexDirection:'row',justifyContent:'center',marginVertical:10}}>
                <Button onPress={ onSub } title=' 등 록 ' style={styles.but}/>
            </View>

            <View style={{flexDirection:'row',marginTop:10}}><Text style={styles.h3}>목록</Text></View>
            <View>
                {carouselList.map((item,index) => <View key={index} 
                    style={{borderBottomColor:'gray',borderBottomWidth:2}}>
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                        <Text>type : {item.type}</Text>
                        <Text>seq : {item.seq}</Text>
                        <Pressable onPress={() => onDelete(item.carouselSeq)}>
                            <Image source={deleteImg} style={{width:22,height:22}}/>
                        </Pressable>
                    </View>
                    <Text>url : {item.url}</Text>
                    <Text>image : {item.image}</Text>
                </View>)}
            </View>
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
        padding: 3
    },
    h4 : {
        fontSize: 16,
        padding: 15,
        fontFamily: 'esamanruMedium',
    }
})

export default Carousel;