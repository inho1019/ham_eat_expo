import React, { useEffect, useState } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import WebView from 'react-native-webview';
import deleteImg from '../assets/burger/delete.png'
import pin from '../assets/burger/pin.png'
import axios from 'axios';
import { useAppContext } from './api/ContextAPI';

const MapModal = (props) => {
    const {mapDTO,onClose} = props

    const { dispatch } = useAppContext();
    
    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };
    
    ////////////////////////////////////////
    
    const [html,setHtml] = useState('')

    useEffect(() => {
        onLoading(true)
        axios.get('https://dapi.kakao.com/v2/maps/sdk.js?appkey=92439ca62b22c5ec0136bd7978c09894')
        .then(res =>{ 
            onLoading(false)
            setHtml(`
                <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <script type="text/javascript">${res.data}</script>
                </head>
                <body style="margin:0;">
                    <div id="map" style="width:90%; aspect-ratio: 1/1; margin-left:5%; border-radius:5%; margin-top:5%;"></div>
                    <script>
                        // Kakao Map Initialization
                        kakao.maps.load(function () {
                        var container = document.getElementById('map');

                        var options = {
                            center: new kakao.maps.LatLng(${mapDTO.latitude},${mapDTO.longitude}),
                            level: 3,
                        };
                        var map = new kakao.maps.Map(container, options);

                        var marker = new kakao.maps.Marker({
                            position: new kakao.maps.LatLng(${mapDTO.latitude},${mapDTO.longitude}),
                            map: map
                        });
                    });
                    </script>
                </body>
                </html>
        `)})
        .catch(() => 
            onLoading(false)
        )
    },[html])

    const openLink = () => {
        Linking.openURL(mapDTO.placeUrl)
        .catch((err) => console.error('Error opening external link:', err));
    };

    return (
        <View style={styles.mapModal}>
            <View style={{flexDirection:'row-reverse'}}>
                <Pressable onPress={() => onClose()}>
                    <Image source={deleteImg} style={{width:40,height:40,margin:10}}/>
                </Pressable>
            </View>
            <WebView
                source={{ html: html }}
                style={{backgroundColor:'transparent'}}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mixedContentMode='always'
            />
            <View style={styles.selItem}>
                <Text style={styles.h2}>{mapDTO.name}</Text>
                <View style={{flexDirection:'row',marginVertical:3}}>
                    <Text style={styles.h3}>{mapDTO.address}</Text>
                    <Pressable onPress={() => setHtml('')}>
                        <Image source={pin} style={{width:25,height:25,marginLeft:10}}/>
                    </Pressable>
                </View>
                <View style={{flexDirection:'row'}}>
                    <Pressable onPress={() => openLink()}
                        style={[styles.selBut,{width:'95%',backgroundColor:'lightgray'}]}>
                        <Text style={{fontSize:16,textAlign:'center',fontWeight:'bold'}}>자세히 보기</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mapModal: {
        flex : 1,
        backgroundColor: '#00000050'
    },
    selItem : {
        padding: '2.5%',
        marginHorizontal : '2.5%',
        marginBottom: '50%',
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
        fontSize: 18
    },
})

export default MapModal;