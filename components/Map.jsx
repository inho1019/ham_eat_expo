import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Keyboard, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { requestForegroundPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import deleteImg from '../assets/burger/delete.png'
import { useAppContext } from './api/ContextAPI';
import { Skel } from 'react-native-ui-skel-expo'

const Map = (props) => {
    const {type,navigation,route,onPlace,searchParam,onMapSearch} = props

    const windowWidth = Dimensions.get('window').width;
    ////////////////////////////////////////////

    const { state, dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };

    const onAlertTxt = (txt) => {
        dispatch({ type: 'SET_ALERTTXT' , payload : txt });
    };
//////////////////////////////////////////////////////

    const kakaoMapFront = `
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=92439ca62b22c5ec0136bd7978c09894"></script>
        </head>
        <body style="margin:0;">
            <div id="map" style="width:90%; aspect-ratio: 1/1; margin-left:5%; border-radius:5%;"></div>
            <script>
                kakao.maps.load(function () {
    `;
    
    const kakaoMapCenter = ` 
        var container = document.getElementById('map');
                            
        var options = {
            center: new kakao.maps.LatLng(0,0),
            level: 7,
        };
        var map = new kakao.maps.Map(container, options);
        `

    const kakaoMapBack = `
                });
            </script>
        </body>
        </html>
    `;

    const [link,setLink] = useState(kakaoMapFront + kakaoMapCenter + kakaoMapBack)
    const [search,setSearch] = useState('')
    const [searchData,setSearchData] = useState([])
    
    const [selData,setSelData] = useState()
    const [dupData,setDupData] = useState(true)
    
    const [focus,setFocus] = useState(false)

    const [loading,setLoading] = useState(false)

    useEffect(() => {
        if(type === 3) {
            setSearch(searchParam)
        } else {
            setLoading(true)
            const getLocationAsync = async () => {
            try {
                const { status } = await requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                onAlertTxt('위치 권한이 허용되지 않았습니다');
                setLoading(false)
                return;
                }
                
                const location = await Promise.race([getCurrentPositionAsync({ accuracy: 6 }), 
                    new Promise(() => setTimeout(() => { 
                        if(location === undefined) {
                            setLoading(false)
                            onAlertTxt('위치를 찾을 수 없습니다');
                        }
                    }, 10000))]);


                axios.post(`https://hameat.onrender.com/map/current`, 
                    { search : `햄버거` , latitude : location.coords.latitude , longitude : location.coords.longitude })
                    .then(res => {
                        setSearchData(res.data.documents)
                        setLink(kakaoMapFront + 
                            ` var container = document.getElementById('map');
                            
                            var data = ${JSON.stringify(res.data.documents)};
            
                            var options = {
                                center: new kakao.maps.LatLng(${location.coords.latitude},${location.coords.longitude}),
                                level: 7,
                            };
                            var map = new kakao.maps.Map(container, options);
            
            
                            for(let i = 0;i < data.length;i++) {
                                var marker = new kakao.maps.Marker({
                                    position: new kakao.maps.LatLng(data[i].y,data[i].x), 
                                    map: map
                                });
                                kakao.maps.event.addListener(marker, 'click', function (){
                                    var position = this.getPosition();
                                    window.ReactNativeWebView.postMessage(JSON.stringify(data[i]))
                                });
                            }`
                        + kakaoMapBack)
                        setLoading(false)
                })
                .catch(() => {
                    setLoading(false)
                    onAlertTxt(`불러오기 중 에러발생`);
                })
            } catch (error) {
                setLoading(false)
                onAlertTxt(`불러오기 중 에러발생`);
            }
            };
            getLocationAsync();
        }
      }, []);
    
    useEffect(() => {
        if(searchData.length > 0) {
            setLink(kakaoMapFront + 
                ` var container = document.getElementById('map');
                
                var data = ${JSON.stringify(searchData)};

                var options = {
                    center: new kakao.maps.LatLng(data[0].y,data[0].x),
                    level: 5,
                };
                var map = new kakao.maps.Map(container, options);


                for(let i = 0;i < data.length;i++) {
                    var marker = new kakao.maps.Marker({
                        position: new kakao.maps.LatLng(data[i].y,data[i].x), 
                        map: map
                    });
                    kakao.maps.event.addListener(marker, 'click', function (){
                        var position = this.getPosition();
                        window.ReactNativeWebView.postMessage(JSON.stringify(data[i]))
                    });
                }`
            + kakaoMapBack)
        }
    },[searchData])

    useEffect(() => {
        if(searchData.length > 0 && selData) {
            setLink(kakaoMapFront + 
                ` var container = document.getElementById('map');
                
                var data = ${JSON.stringify(searchData)};

                var options = {
                    center: new kakao.maps.LatLng(${selData.y},${selData.x}),
                    level: 3,
                };
                var map = new kakao.maps.Map(container, options);


                for(let i = 0;i < data.length;i++) {
                    var marker = new kakao.maps.Marker({
                        position: new kakao.maps.LatLng(data[i].y,data[i].x), 
                        map: map
                    });
                    kakao.maps.event.addListener(marker, 'click', function (){
                        var position = this.getPosition();
                        window.ReactNativeWebView.postMessage(JSON.stringify(data[i]))
                    });
                }`
            + kakaoMapBack)
            onLoading(true)
            axios.get(`https://hameat.onrender.com/store/check/${selData.id}`)
            .then(res => {
                setDupData(res.data)
                onLoading(false)
            })
            .catch(() => {
                setDupData(true)
                onLoading(false)
            })
        }
    },[selData])

    useEffect(() => {
        if(search.length > 0) {
            axios.post(`https://hameat.onrender.com/map/search`, { search : search })
            .then(res => {
                setSearchData(res.data.documents)
            })
        } else {
            setSearchData([])
        }
    },[search])

    const webMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            setFocus(false)
            setSelData(data)
        } catch (error) {
            onAlertTxt('데이터 불러오기에 실패하였습니다')
        }
    };

    useEffect(() => {
        if(!focus) Keyboard.dismiss()
    },[focus])

    const onStore = (data) => {
        onLoading(true)
        const storeDTO = {
            type : route.params.type,
            name : data.place_name,
            image : '',
            address : data.address_name,
            placeUrl : data.place_url,
            longitude: data.x,
            latitude: data.y,
            placeId: data.id
        } 
        axios.post('https://hameat.onrender.com/store/write',storeDTO)
        .then(res => {
            onLoading(false)
            navigation.goBack();
        })
        .catch(() => {
            onAlertTxt('등록 중 에러발생')
            onLoading(false)
        })
      }

    const openLink = () => {
        Linking.openURL(selData.place_url)
          .catch((err) => console.error('Error opening external link:', err));
    };

    const onSel = (data) => {
        setFocus(false)
        setSelData(data)
    }

    const onRating = () => {
        onPlace(selData)
        setSelData()
    }

    return (
        <View style={{flex:1}}>
            {type !== 0 && type !== 3 && <View style={{zIndex: 20}}>
                <TextInput style={type === 2 ? styles.searchBox2 : styles.searchBox} 
                placeholder='매장 검색'
                onFocus={() => setFocus(true)}
                value={search}  onChangeText={(text) => setSearch(text)}/>
            </View>}
            {(type !== 0 && type !== 3) && searchData.length > 0 && focus && <View style={type === 2 ? styles.searchListOut2 : styles.searchListOut }>
            <ScrollView style={styles.searchList}>
            {searchData.map((item,index) => <Pressable key={index} 
                onPress={() => onSel(item)}
                style={{paddingVertical:5, borderBottomWidth:1, borderColor:'lightgray'}}>
                <Text style={{fontSize: 15,fontWeight:'bold',}}>{item.place_name}</Text>
            </Pressable>)}
            </ScrollView>
            <View style={{flexDirection:'row-reverse',marginTop:3}}><Pressable onPress={() => setFocus(false)}>
                <Image source={deleteImg} style={{width:25,height:25}}/>
            </Pressable></View>
            </View>}
            {loading ? 
            <View style={{width:'90%',aspectRatio:1/1,overflow:'hidden',
                marginLeft:'5%', borderRadius:20, marginTop: type !== 0 ? '7%' : 5}}>
                <Skel height={'100%'} width={windowWidth*0.9}/>
            </View>
            : <TouchableWithoutFeedback>
                <WebView
                    style={{marginTop: type !== 0 ? '7%' : 5}}
                    source={{ html: link }}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    onMessage={webMessage}
                />
            </TouchableWithoutFeedback>
            }
            {selData && <View style={styles.selItem}>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={[styles.h2,{fontSize : type === 2 || type === 3 ? 18 : 23,
                            width : type === 2 || type === 3 ? '80%' : 'auto'}]}>
                    {selData.place_name}</Text>
                    <Pressable onPress={() => setSelData()}>
                        <Image source={deleteImg} style={{width:30,height:30}}/>
                    </Pressable>
                </View>
                <Text style={[styles.h3,{fontSize : type === 2 || type === 3 ? 15 : 18}]}>{selData.address_name}</Text>
                <View style={{flexDirection:'row'}}>
                    { type !== 2 && <Pressable onPress={() => openLink()}
                        style={[styles.selBut,{width: type === 3 ? '95%' : '45%',backgroundColor:'lightgray'}]}>
                        <Text style={{fontSize:16,textAlign:'center',fontWeight:'bold'}}>자세히 보기</Text>
                    </Pressable>}
                    { type === 0 && <Pressable onPress={() => onMapSearch(selData.place_name)}
                        style={[styles.selBut,{width:'45%',backgroundColor:'#2E8DFF'}]}>
                        <Text style={{fontSize:16,textAlign:'center',fontWeight:'bold',color:'white'}}>매장 검색</Text>
                    </Pressable>}
                    { type === 1 && <Pressable onPress={() => !dupData && onStore(selData)}
                        style={[styles.selBut,{width: '45%',backgroundColor:'#2E8DFF',opacity: dupData ? 0.6 : 1}]}>
                        <Text style={{fontSize:16,textAlign:'center',fontWeight:'bold',color:'white'}}>
                            {dupData ? state.loading ? '로딩중' : '등록 불가' : '등록'}</Text>
                    </Pressable>}
                    { type === 2 && <Pressable onPress={() => onRating()}
                        style={[styles.selBut,{width: '95%',backgroundColor:'#2E8DFF'}]}>
                        <Text style={{fontSize:16,textAlign:'center',fontWeight:'bold',color:'white'}}>
                            {state.loading ? '로딩중' : '선택'}</Text>
                    </Pressable>}
                </View>
            </View>}
        </View>
    );
}
const styles = StyleSheet.create({
    searchBox : {
        borderWidth: 2,
        borderRadius: 5,
        fontSize: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginVertical: 10,
        alignSelf: 'center',
        width: '95%',
        overflow:'hidden',
    },
    searchBox2 : {
        borderWidth: 2,
        borderRadius: 10,
        fontSize: 17,
        paddingHorizontal: 5,
        paddingVertical: 2,
        alignSelf: 'center',
        width: '95%',
        overflow:'hidden',
    },
    searchList : {
        maxHeight: 125,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    searchListOut : {
        zIndex: 10,
        top: 50,
        maxHeight: 155,
        backgroundColor: 'white',
        opacity : 0.8,
        width: '85%',
        left: '7.5%',
        position:'absolute',
        borderBottomLeftRadius:5,
        borderBottomRightRadius:5,
        borderTopWidth: 0,
        borderColor: 'lightgray',
        borderWidth: 2,
    },
    searchListOut2: {
        zIndex: 10,
        top: 40,
        maxHeight: 125,
        backgroundColor: 'white',
        opacity : 0.8,
        width: '85%',
        left: '7.5%',
        position:'absolute',
        borderBottomLeftRadius:5,
        borderBottomRightRadius:5,
        borderTopWidth: 0,
        borderColor: 'lightgray',
        borderWidth: 2,
    },
    selItem : {
        padding: '2.5%',
        marginHorizontal : '2.5%',
        marginBottom: '5%',
        backgroundColor: 'white',
        borderRadius: 10,
        backgroundColor: 'whitesmoke',
        elevation: 5
    },
    selBut : {
        margin: '2.5%',
        paddingVertical: '2%',
        borderRadius: 10
    },
    h2 : {
        fontSize: 23,
        fontWeight: 'bold',
    },
    h3 : {
        fontSize: 18,
        marginVertical: 5
    },
})

export default Map;