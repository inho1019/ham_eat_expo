import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import searchIcon from '../../assets/main/search.png'
import logo from '../../assets/icon.png'
import Map from '../Map';
import { useAppContext } from '../api/ContextAPI';
import { Skel } from 'react-native-ui-skel-expo'
import axios from 'axios';

const Home = (props) => {
    const{navigation} = props 

    const [search,setSearch] = useState('')

    const [mapStop,setMapStop] = useState(false)

    const windowWidth = Dimensions.get('window').width;

    const { dispatch } = useAppContext();

    const onLoading = (bool) => {
        dispatch({ type: 'SET_LOADING' , payload : bool });
    };
    //////////캐러셀/////////////
    const [carousel,setCarousel] = useState([]);
    
    useEffect(() => {
        onLoading(true)
        axios.get('https://hameat.onrender.com/carousel/list')
        .then(res => {
            setCarousel(res.data)
            onLoading(false)
        })
        .catch(() => {
            alert('불러오기 중 에러발생')
            onLoading(false)
        })
    },[])

    const [itemWidth, setItemWidth] = useState(0);

    useEffect(() => {
        if(scrollRef.current) {
            scrollRef.current.scrollTo({ x: itemWidth * 1 , animated: false });
        }
    },[itemWidth])

    ///////////////캐러셀 추적////////////////
    const [currentPage, setCurrentPage] = useState(1);

    const pageChange = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const pageIndex = Math.round(offsetX / event.nativeEvent.layoutMeasurement.width);
        setCurrentPage(pageIndex);
    };
    ////////////////케러셀 자동 이동//////////////////////////

    const scrollRef = useRef(null)

    useEffect(() => {
        if(itemWidth > 0) {
            if(currentPage === 0) {
                setCurrentPage(carousel.length)
                scrollRef.current.scrollTo({ x: itemWidth * (carousel.length), animated: false });
            } else if(currentPage === carousel.length + 1) {
                setCurrentPage(1)
                scrollRef.current.scrollTo({ x: itemWidth, animated: false });
            } else {
                const timeoutId = setTimeout(() => {
                    if (currentPage === 1) scrollRef.current.scrollTo({ x: itemWidth, animated: false });
                    if (scrollRef.current !== null) {
                        scrollRef.current.scrollTo({ x: itemWidth * (currentPage + 1), animated: true });
                        setCurrentPage(currentPage + 1);
                    }
                }, 5000);
                return () => clearTimeout(timeoutId);
            }
        }
    },[itemWidth,currentPage,carousel])

    ///////////////////////////////////////////

    useEffect(()=>{
        const unsubscribe = navigation.addListener('focus', () => {
            setMapStop(false)
        })
        unsubscribe;
    },[navigation])

    const onSearch = () => {
        setMapStop(true)
        requestAnimationFrame(() => navigation.navigate('Search', { search : search }))
    }

    const onMapSearch = (txt) => {
        setMapStop(true)
        requestAnimationFrame(() => navigation.navigate('Search', { search : txt }))
    } 

    const openLink = (url) => {
        Linking.openURL(url)
        .catch((err) => console.error('Error opening external link:', err));
    };

    return (
        <KeyboardAvoidingView style={{flex:1}}>
            <View style={{flexDirection:'row',borderBottomColor: 'whitesmoke', borderBottomWidth: 20,paddingBottom: 5,marginBottom: 5}}>
                <Image source={logo} style={styles.logo}/>
                <Text style={styles.logoTxt}>HAMEAT</Text>
            </View>
            <Text style={styles.h2}>통합 검색</Text>
            <View style={styles.searchContainer}>
                <TextInput 
                    value={search}
                    style={styles.searchBox}
                    placeholder='통합 검색'
                    onChangeText={(text) => setSearch(text)}
                    onSubmitEditing={onSearch}
                />
                <Pressable onPress={onSearch}>
                    <Image source={searchIcon} style={styles.searchIcon}/>
                </Pressable>
            </View>
            { carousel.length > 0 ?
                <View 
                    style={styles.carBox}>
                    <ScrollView
                        ref={ scrollRef }
                        horizontal
                        pagingEnabled
                        contentContainerStyle={{width: `${100 * (carousel.length + 2)}%`}}
                        scrollEventThrottle={100}
                        decelerationRate="fast"
                        onMomentumScrollEnd={pageChange}
                        onContentSizeChange={w => setItemWidth(w / (carousel.length + 2))}
                        showsHorizontalScrollIndicator={false}
                        initialPage={1}>
                        <View style={{flexDirection: 'row'}}>
                            <View style={{width: itemWidth,height: '100%'}}>
                                <Image source={{uri : carousel[carousel.length-1].image}} style={{width:'100%',height: '100%'}} resizeMode='cover'/>  
                            </View>
                            {carousel.map((item,index) => <Pressable
                            key={index}
                            onPress={() => item.type === 0 && openLink(item.url)}
                            style={{width: itemWidth,height: '100%'}}>
                                <Image source={{uri : item.image}} style={{width:'100%',height: '100%'}} resizeMode='cover'/>
                            </Pressable>)}
                            <View style={{width: itemWidth,height: '100%'}}>
                                <Image source={{uri : carousel[0].image}} style={{width:'100%',height: '100%'}} resizeMode='cover'/>  
                            </View>
                        </View>
                    </ScrollView>
                    <View style={{flexDirection: 'row',position:'absolute',bottom: 5, right: 5}}>
                        {carousel.map((_,index) => <View key={index} 
                        style={[styles.carBall,{ opacity : index === currentPage-1 ? 0.7 : 0.3}]}/>)}
                    </View>
                </View> :
                <View style={styles.carBox}>
                    <Skel height={'100%'} width={windowWidth}/>
                </View>
            }
            <Text style={styles.h2}>주변 매장</Text>
            {!mapStop && <Map type={0} onMapSearch={onMapSearch}/>}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    logo : {
        height: 30,
        width: 30,
        marginLeft: 10,
        marginTop: 5,
    },
    logoTxt : {
        fontSize: 21,
        fontFamily: 'chab',
        color:'#472523',
        textAlignVertical:'bottom',
        marginLeft: 10
    },
    carBox : {
        width:'95%',
        alignSelf:'center',
        aspectRatio: 3/1,
        marginTop:20,
        marginBottom:15,
        borderRadius:10,
        overflow:'hidden'
    },
    carBall : {
        width: 15,
        height: 15,
        borderRadius: 15,
        backgroundColor: 'black',
        margin: 1,
    },
    h2 : {
        fontSize: 23,
        fontFamily: 'esamanruMedium',
        marginHorizontal: '2%',
        marginTop: 10,
        marginBottom: 5
    },
    searchContainer : {
        marginVertical: 5,
        flexDirection: 'row',
        justifyContent:'space-evenly'
    },
    searchBox : {
        borderRadius: 5,
        backgroundColor: '#e5e5e5',
        color:'#505050',
        height: 40,
        fontSize: 18,
        paddingLeft: 10,
        paddingRight: 10,
        width: '80%',
        overflow:'hidden'
    },
    searchIcon : {
        width: 30,
        height: 30,
        margin: 5
    },
});

export default Home