import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppContext } from '../api/ContextAPI';
import mapIcon from '../../assets/burger/map.png';
import starOne from '../../assets/burger/star_one.png';
import deleteImg from '../../assets/burger/delete.png';
import MapModal from '../MapModal';

const HamburgerRating = (props) => {
    const {route,navigation,searchData} = props
    ////////////////////////////////////////////
    const getToday = (logTime) => {
        const date = new Date(logTime)
        const day = date.getDate();
        const month = date.getMonth()+1;
        const hour = date.getHours();
        const minutes = date.getMinutes();
        
        return `${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
    //////////////////////////////////////////////

    const { state , dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

    const onPageView = (pg,seq) => {
        dispatch({ type: 'SET_PAGE' , payload : pg });
        dispatch({ type: 'SET_VIEW' , payload : seq });
    };

    const onAlertTxt = (txt) => {
        dispatch({ type: 'SET_ALERTTXT' , payload : txt });
    };
    ///////////////////지도모달/////////////////
    const [mapModal,setMapModal] = useState(false)
    const [mapDTO,setMapDTO] = useState({
        longitude : 0,
        latitude : 0,
        name : '',
        address : '',
        placeUrl : '',
    })

    const onMapPlace = (data) => {
        setMapDTO({
            longitude:data.longitude,
            latitude:data.latitude,
            name:data.placeName,
            address:data.address,
            placeUrl:data.placeUrl
        })
        setMapModal(true)
    }

    const onClose = () => {
        setMapModal(false) 
    }
    /////////////////////////////////////////////
    const [ratings,setRatings] = useState([])
    const [touchActive,setTouchActive] = useState(true)

    useEffect(()=>{
        if( route.params?.userSeq ) {
            navigation.setOptions({
                title: '내 평가 목록'
            });
        }
        const unsubscribe = navigation.addListener('focus', () => {
            axios.get(`https://hameat.onrender.com/rating/listAll`)
            .then(res => {
                setRatings(res.data.reverse())
            })
        });
        return unsubscribe;
    },[])

    const onDelete = (ratingSeq) => {
        onLoading(true)
        axios.delete(`https://hameat.onrender.com/rating/delete/${ratingSeq}`,)
        .then(() => {
            onLoading(false)
            setRatings(ratings.filter(rat => rat.ratingSeq !== ratingSeq))
            onAlertTxt('삭제 완료')
        })
        .catch(() => {
            onAlertTxt('삭제 중 에러발생')
            onLoading(false)
        })
    }

    return (
        <View style={{flex : 1}}>
            {ratings.filter(rat => route.params?.userSeq ? 
                    (rat.userSeq === route.params?.userSeq)
                    : searchData !== undefined ? ( (rat.userSeq === route.params?.userSeq) ||
                    (rat.placeName && (rat.placeName.includes(searchData) || searchData.includes(rat.placeName))) || 
                    rat.content.includes(searchData) || searchData.includes(rat.content) ) : true).length === 0 &&
                    <Text style={styles.noList}>결과가 없습니다</Text>}
            <FlatList
                style={{flex : 1}}

                data={ratings.filter(rat => route.params?.userSeq ? 
                    (rat.userSeq === route.params?.userSeq)
                    : searchData !== undefined ? ( (rat.userSeq === route.params?.userSeq) ||
                    (rat.placeName && (rat.placeName.includes(searchData) || searchData.includes(rat.placeName))) || 
                    rat.content.includes(searchData) || searchData.includes(rat.content) ) : true)}

                renderItem={(data) => <Pressable style={styles.reviewItem} key={data.index}
                    onPress={() => touchActive && onPageView(1,data.item.burgerSeq) }>
                    <View style={{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:5}}>
                        <View style={{flexDirection:'row',marginBottom:5,width: route.params?.userSeq ? '90%' : '80%',flexWrap:'wrap'}}>
                            <View style={styles.reviewStar}>
                            <Image source={starOne} style={{width:17,height:17}}/>
                            <Text style={{fontSize: 14,fontWeight: 'bold'}}> {data.item.rate} </Text></View>
                            {data.item.placeName && <Pressable style={{flexDirection:'row'}}
                                onPressIn={() => setTouchActive(false)}
                                onPressOut={() => setTouchActive(true)}
                                onPress={() => onMapPlace(data.item)}>
                                <Text style={styles.reviewPlace}> #{data.item.placeName.split(' ')
                                    [data.item.placeName.split(' ').length - 1]} </Text>
                                <Image source={mapIcon} style={{height:20,width:20}}/>
                            </Pressable>}
                            {route.params?.userSeq && <Text style={styles.reviewTime}> | {getToday(data.item.logTime)}</Text>}
                        </View>
                        {data.item && state.user.userSeq === data.item.userSeq && 
                            <Pressable 
                                onPressIn={() => setTouchActive(false)}
                                onPressOut={() => setTouchActive(true)}
                                onPress={() => onDelete(data.item.ratingSeq)}>
                                <Image source={deleteImg} 
                                    style={{width: 25,height: 25}}/>
                            </Pressable>
                        }
                    </View>
                    <Text style={{fontSize:14,paddingHorizontal:10}}>{data.item.content}</Text>
                </Pressable>}
                alwaysBounceVertical={false}
            />
            <Modal 
                animationType="fade"
                visible={mapModal}
                transparent={true}>
                    <MapModal mapDTO={mapDTO} onClose={onClose}/>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    noList : {
        textAlign:'center',
        fontSize: 17,
        color:'gray',
        paddingVertical: 5,
        fontWeight:'bold'
    },
    reviewItem : {
        borderBottomColor:'lightgray',
        borderBottomWidth: 2,
        paddingVertical: 5
    },
    reviewStar : {
        flexDirection:'row',
        alignItems: 'center'
    },
    reviewName :{
        verticalAlign:'middle',
        fontSize : 17,
        fontWeight : 'bold',
        color: 'gray'
    },
    reviewPlace :{
        verticalAlign:'middle',
        fontSize : 15,
        color:'gray'
    },
    reviewTime :{
        fontSize: 14,
        color: 'gray',
        paddingTop: 5
    }
});

export default HamburgerRating;