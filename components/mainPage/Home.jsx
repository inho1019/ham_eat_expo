import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import searchIcon from '../../assets/main/search.png'
import logo from '../../assets/icon.png'
import Map from '../Map';

const Home = (props) => {
    const{navigation} = props 

    const [search,setSearch] = useState('')

    const [mapStop,setMapStop] = useState(false)
///////////캐러셀/////////////
    const data = [{//캐러셀용 DB제작후 삽입 예정
        type : 0,
        src : 'https://img.freepik.com/free-vector/hand-drawn-tasty-food-restaurant-facebook-cover_23-2150966640.jpg?w=1800&t=st=1708146307~exp=1708146907~hmac=37f3f7b8ff4f61277f56fa24102c5b0b71651f8f5cf6ff716161b469f1bdfe12'
    },{
        type : 0,
        src : 'https://img.freepik.com/free-psd/flat-design-burger-template_23-2150091675.jpg?w=1800&t=st=1708146272~exp=1708146872~hmac=07e7b2c390f1fed6ffcd9d4581d0239849d64a3212d981af482deacdd0a6042e'
    },{
        type : 0,
        src : 'https://img.freepik.com/free-psd/american-retro-restaurant-instagram-posts-template_23-2150133048.jpg?w=1800&t=st=1708146287~exp=1708146887~hmac=e4ff7f1b3a524043b419caad081844f973e56b93c277f0c72a48be3a84a1d186'
    }];
    const [itemWidth, setItemWidth] = useState(0);

    ///////////////캐러셀 추적////////////////
    const [currentPage, setCurrentPage] = useState(0);

    const pageChange = (event) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const pageIndex = Math.round(offsetX / event.nativeEvent.layoutMeasurement.width);
      setCurrentPage(pageIndex);
    };
    //////////////////////////////////////////
////////////////////////////
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
                    onChangeText={(text) => setSearch(text)}
                    onSubmitEditing={onSearch}
                />
                <Pressable onPress={onSearch}>
                    <Image source={searchIcon} style={styles.searchIcon}/>
                </Pressable>
            </View>
            <View 
                style={{flex: 1,maxHeight: '16%',aspectRatio: 3.125/1,marginTop:12,marginBottom:7}}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    contentContainerStyle={{width: `${100 * data.length}%`}}
                    scrollEventThrottle={100}
                    decelerationRate="fast"
                    onMomentumScrollEnd={pageChange}
                    onContentSizeChange={w => setItemWidth(w / data.length)}
                    showsHorizontalScrollIndicator={false}>
                    <View style={{flexDirection: 'row'}}>
                        {data.map((item,index) => <Pressable
                        key={index}
                        style={{width: itemWidth,height: '100%'}}>
                            <Image source={{uri : item.src}} style={{width:'100%',height: '100%'}} resizeMode='cover'/>
                        </Pressable>)}
                    </View>
                </ScrollView>
                <View style={{flexDirection: 'row',position:'absolute',bottom: 5, right: 5}}>
                    {data.map((_,index) => <View key={index} 
                    style={[styles.carBall,{ opacity : index === currentPage ? 0.7 : 0.3}]}/>)}
                </View>
            </View>
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
    carBall : {
        width: 15,
        height: 15,
        borderRadius: 15,
        backgroundColor: 'black',
        margin: 1,
    },
    h2 : {
        fontSize: 25,
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