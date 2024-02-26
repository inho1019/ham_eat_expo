import React, { useEffect, useState } from 'react';
import { Image, PanResponder, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import star from '../../assets/burger/star.png'
import backImg from '../../assets/burger/up_arrow.png'
import burgerReg from '../../assets/burger/burger_reg.png'
import Map from '../Map';


const HamburgerWrite = (props) => {
    const {onBack,onInput,onAlert,burgerDTO,onSubmit,updateBool} = props

    const [rating,setRating] = useState(false)
    const [price,setPrice] = useState(true)
    const [store,setStore] = useState(false)

    const [rate,setRate] = useState(0)
    const [content,setContent] = useState('')

    const [placeDTO,setPlaceDTO] = useState()

    const onPlace = (data) => {
        setPlaceDTO({
            placeName : data.place_name,
            address : data.address_name,
            placeUrl : data.place_url,
            longitude: data.x,
            latitude: data.y,
            placeId: data.id
        })
    }

    useEffect(() => {
        if(burgerDTO.type !== 0 ) setStore(false)
    },[burgerDTO])

///////////드래그 이벤트////////////
    const [starWidth, setStarWidth] = useState(0);

    const starLayout = (event) => {
        const { width } = event.nativeEvent.layout;
        setStarWidth(width);
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (event, gestureState) => {
            if((gestureState.moveX-(starWidth*0.333)) * (100/starWidth) >= 0 && 
                (gestureState.moveX-(starWidth*0.333)) * (100/starWidth) <= 100) {
                setRate((gestureState.moveX-(starWidth*0.333)) * (100/starWidth))
            } else if ((gestureState.moveX-(starWidth*0.333)) * (100/starWidth) < 0) {
                setRate(0)
            } else if ((gestureState.moveX-(starWidth*0.333)) * (100/starWidth) > 100) {
                setRate(100)
            }
        },
    })
///////////////////
    const onSub = () => {
        if(burgerDTO.type !== 2 && price && burgerDTO.price.length === 0) {
            onAlert('가격을 입력해 주세요')
        } else {
            if(rating) {
                if(content.length > 0) {
                    if(!store || placeDTO) {
                        const ratingDTO = {
                            rate : (5 / (100/rate)) > 4.85 ? 5 : (5 / (100/rate)) < 0.15 ? 
                                                            0 : (5 / (100/rate)).toFixed(2),
                            content : content,
                            userSeq : 0,
                            ...(store ? placeDTO : {})
                        }
                        onSubmit(ratingDTO,rating)
                    } else onAlert('지점을 선택해 주세요')
                } else onAlert('평가 내용을 입력해 주세요')
            } else {
                onSubmit(null,false)
            }
        }
    }

    return (
        <View style={{flex:1}}>
            <View style={{height:'7%'}}>
                <Pressable onPress={() => onBack()}>
                    <Image source={backImg} style={{height:'95%',aspectRatio: 1/1, alignSelf:'center'}}/>
                </Pressable>
            </View>
            <ScrollView style={{height:'93%'}}>
                <View style={{flexDirection:'row'}}><Text style={styles.h3}>이름</Text></View>
                    <TextInput value={burgerDTO.name} style={styles.txtBox} onChangeText={(text) => onInput('name', text)} />
                <View style={{flexDirection:'row'}}><Text style={styles.h3}>설명</Text></View>
                    <TextInput value={burgerDTO.content} style={styles.txtBox} onChangeText={(text) => onInput('content', text)} />
                {burgerDTO.type !== 2 && <View>
                <View style={{flexDirection: 'row'}}>
                    <Text style={[styles.h3,{marginTop: '3%'}]}>가격</Text>
                    <Switch 
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={'white'}
                        onValueChange={() => setPrice(!price)}
                        value={price}
                    />
                </View>
                {price && <View>
                        <TextInput 
                        keyboardType="numeric"
                        value={burgerDTO.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} 
                        style={styles.txtBox}
                        onChangeText={(text) => onInput('price', text.replace(/[^0-9]/g, ''))} />
                </View>}
                </View>}
                {!updateBool && <View style={{flexDirection: 'row'}}>
                    <Text style={[styles.h3,{marginTop: '3%'}]}>평가</Text>
                    <Switch 
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        thumbColor={'white'}
                        onValueChange={() => setRating(!rating)}
                        value={rating}
                    />
                </View>}
                {rating && <View>
                    <View style={styles.starBox} {...panResponder.panHandlers} onLayout={starLayout}>
                        <View style={[styles.starBack,{width : rate + '%'}]}/>
                        <Image source={star} style={styles.starImg}/>
                    </View>
                    <View style={{flexDirection:'row'}}>
                    <View style={{width: store ? '50%' : '100%'}}>
                        <View style={{flexDirection:'row'}}><Text style={[styles.h3]}>평가 내용</Text></View>
                        <TextInput value={content} multiline={true} maxLength={500} 
                            style={[styles.contentInput,{height: store ? 160 : 85}]} numberOfLines={3}
                            onChangeText={(text) => setContent(text)} />
                        {burgerDTO.type === 0 && <View style={{flexDirection:'row',zIndex:30}}>
                            <Text style={[styles.h3,{marginTop: store ? '7%' : '3.5%'}]}>지점</Text>
                            <Switch 
                                trackColor={{ false: "#767577", true: "#81b0ff" }}
                                thumbColor={'white'}
                                onValueChange={() => {
                                    setStore(!store)
                                    setPlaceDTO()
                                }}
                                value={store}
                            />
                            {placeDTO && <Text 
                                style={{fontSize:14,verticalAlign:'middle',marginLeft:5,color:'gray',fontWeight:'bold'}}>
                                #{placeDTO.placeName.split(' ')[placeDTO.placeName.split(' ').length-1]}</Text>}
                        </View>}
                        </View>
                        { store &&
                            <View style={{width:'50%'}}>
                                <Map type={2} onPlace={onPlace}/>
                            </View>
                        }
                        </View>
                </View>}
            </ScrollView>
            <View style={{position: 'absolute',height: '9%',flexDirection: 'row-reverse',margin: 20,bottom:0,right:0}}>
                <Pressable onPress={() => onSub()}>
                    <Image source={burgerReg} style={{height:'90%',aspectRatio: 1/1}}/>
                </Pressable>
            </View>
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
        padding: 3
    },
    starBox : {
        width: '60%',
        aspectRatio: 2900 / 512,
        alignSelf: 'center',
        marginVertical: 10
    },
    starImg : {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    },
    starBack : {
        position : 'absolute',
        borderWidth: 1,
        borderColor: 'white',
        height: '100%',
        backgroundColor : '#f7d158'
    },
    contentInput : {
        borderWidth: 2,
        borderRadius: 15,
        fontSize: 16,
        padding: 10,
        textAlignVertical: 'top',
        alignSelf: 'center',
        margin : 10,
        width: '95%',
        overflow:'scroll'
    },
});

export default HamburgerWrite;