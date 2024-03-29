import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Image, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import foldT from '../../assets/burger/fold_true.png'
import foldF from '../../assets/burger/fold_false.png'
import reset from '../../assets/burger/reset.png'
import holding from '../../assets/burger/holding.png'
import holdingGif from '../../assets/burger/holding_gif.gif'
import info from '../../assets/burger/info.png'
import sizemImg from '../../assets/burger/size_m.png'
import sizelImg from '../../assets/burger/size_l.png'
import sizesImg from '../../assets/burger/size_s.png'
import pattynImg from '../../assets/burger/pattyn.png'
import pattysImg from '../../assets/burger/pattys.png'
import backImg from '../../assets/burger/up_arrow.png'
import nextImg from '../../assets/burger/down_arrow.png'
import max from '../../assets/main/max.png'
import min from '../../assets/main/min.png'

const HamburgerMake = (props) => {
    const{onBack,onAlert,route,onLoading,onMakes,updateBool,burgerDTO} = props

///////////애니메이션///////////////
    const ingreBox = useRef(new Animated.Value(0)).current;

    const aniIng = (num) => {
        Animated.timing(ingreBox, {
            toValue: num,
            duration: 500,
            useNativeDriver: false,
            easing: Easing.out(Easing.ease)
        }).start();
    }

    const ingAni = {
        marginTop: ingreBox.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 50],
        })
    };
///////////드래그 이벤트////////////
    const [resc,setResc] = useState(true)
    const [action,setAction] = useState(false)

    const panResponder = useRef(0)

    useEffect(() => {
        panResponder.current = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setAction(true)
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 50 || gestureState.dy < -50) {
                    if (gestureState.dy <= (250 - (burCon-49.5)*9) && gestureState.dy >= (-250 + (ingCon-49.5)*9)) {
                        setBurCon(burCon + parseInt(gestureState.dy/9))
                        setIngCon(ingCon - parseInt(gestureState.dy/9))
                    } else if (gestureState.dy > (250 - (burCon-49.5)*9)) {
                        setBurCon(74)
                        setIngCon(25)
                    } else if (gestureState.dy < (-250 + (ingCon-49.5)*9)) {
                        setBurCon(25)
                        setIngCon(74)
                    }
                }
                setResc(!resc)
                setAction(false)
            },
        })
    },[burCon,ingCon,resc])
//////////햄버거 추가 애니메이션//////////////
    const [ingX,setIngX] = useState(0)
    const [ingY,setIngY] = useState(0)
    const [moveImg,setMoveImg] = useState('')
    const [move,setMove] = useState(false)

    const [moveBox,setMoveBox]= useState(new Animated.Value(0));

    const aniMove = (e,src,seq) => {
        if(!move) {
            const x = e.nativeEvent.pageX;
            const y = e.nativeEvent.pageY;
            setIngX(x-50),
            setIngY(y-90)
            setMoveImg(src)
            setMove(true)
            Animated.timing(moveBox, {
                toValue: 1,
                duration: 500,
                useNativeDriver: false,
                easing: Easing.in(Easing.ease)
            }).start(() => {
                onMake(seq)
                setMoveBox(new Animated.Value(0));
                setMove(false);
                setMoveImg('');
            })        
        }
    }
////////////////////////////////////////////
    const [ingres,setIngres] = useState([])
    const [size,setSize] = useState(-1)
    const [sizeModal,setSizeModal] = useState(false)
    const [makeDTO,setMakeDTO] = useState([])
    const [fold,setFold] = useState(true)
    const [burCon,setBurCon] = useState(49.5)
    const [ingCon,setIngCon] = useState(49.5)
    const [sizeMode,setSizeMode] = useState(0)

    const [bunBox,setBunBox] = useState(true)
    const [pattyBox,setPattyBox] = useState(true)
    const [vegeBox,setVegeBox] = useState(true)
    const [fillBox,setFillBox] = useState(true)
    const [sauBox,setSauBox] = useState(true)

    const [lastMargin,setLastMargin] = useState(0)
    const [first,setFirst] = useState(true)

    const windowWidth = Dimensions.get('window').width;

    const scrollRef = useRef();

    const onMake = (num) => {
        setMakeDTO([...makeDTO,num])
        if(!fold) scrollRef.current.scrollToEnd({ animated: true });
    }

    const onCheck = () => {
        if(makeDTO.length > 2) {
            onMakes(size,makeDTO)
        } else {
            onAlert('3가지 이상의 재료를 선택해 주세요');
        }
    }

    useEffect(() => {
        if(updateBool && burgerDTO.make.length > 0 && first && ingres.length > 0) {
            setSize(burgerDTO.size)
            setMakeDTO(JSON.parse(burgerDTO.make))
            setFirst(false)
        }
    },[burgerDTO,ingres])

    useEffect(() => {
        onLoading(true)
        axios.get(`https://hameat.onrender.com/ingre/list`)
        .then(res => {
            setIngres(res.data)
            onLoading(false)
        })
        .catch(() => {
            onAlert('불러오기 중 에러발생')
            onLoading(false)
        })
    },[route])

    useEffect(() => {
        if(makeDTO.length > 1) {
            const inDTO = makeDTO.map(md => {
                const ingreIt = ingres.find(ing => ing.ingreSeq === md);
                return ingreIt !== undefined ? ingreIt : ingres[0]
            });
            setLastMargin(windowWidth*inDTO.filter(ing => ing.type !== 4)[inDTO.filter(ing => ing.type !== 4).length - 1].height)
        }
    },[makeDTO])

    useEffect(() => {
        aniIng(fold ? 0 : 1)
    },[fold])

    return (
        <View style={{flex:1}}>
            <View style={[styles.arrowBut,{top: 0}]}>
                <Pressable onPress={() => onBack()}>
                    <Image source={backImg} style={{height:'95%',aspectRatio: 1/1, alignSelf:'center'}}/>
                </Pressable>
            </View>
             <ScrollView 
                ref={ scrollRef }
                onScroll={() => setAction(false)}
                style={[styles.burgerContainer,{height:burCon + '%'}]}>
                <View style={styles.totalContainer}>
                    <View style={styles.makeContainer}>
                        {!fold && <Text style={styles.topTxt}>* 재료 클릭시 삭제</Text>}
                        {size >= 0 && <View>
                            <Text style={{color:'gray',textAlign:'center'}}>{size === 0 ? 'S ' : size === 2 ? 'L' : size === 1 ? 'M' : ''} SIZE</Text>
                            <View style={[styles.sizeBar,{width: size === 0 ? '50%' : size === 2 ? '90%' : size === 1 ? '70%' : 0 }]}/>
                        </View>}
                        <Pressable onPress={() => setFold(false)} disabled={!fold}>
                        {makeDTO.map((item,index) => {
                            const getIngre = ingres.find(ing => ing.ingreSeq === item)

                            return <Pressable key={index} disabled={fold}
                                onPress={() => !fold && (index !== 0 || makeDTO.length === 1) &&  setMakeDTO(prevMakeDTO => {
                                    const newMakeDTO = [...prevMakeDTO.slice(0, index), ...prevMakeDTO.slice(index + 1)];
                                    return newMakeDTO;
                                })}
                                style={{zIndex:-index,alignSelf:'center'}}>
                                <Animated.Image ref={ingreBox} style={[ingAni,
                                {width: size === 0 ? '50%' : size === 2 ? '90%' : '70%',
                                aspectRatio: getIngre.width / getIngre.height + 
                                    (size === 0 ? - 0.3 : size === 2 && + 0.4),
                                marginBottom: ((getIngre.type === 2 || getIngre.type === 3) && 
                                    getIngre.height > 170 ? -(windowWidth*0.15) : -(windowWidth*0.12)) + 
                                    (size === 0 ? + (windowWidth*0.025) : size === 2 && + -(windowWidth*0.015)),
                                }]}
                                source={{ uri : getIngre.image}}
                                resizeMode='stretch'/>
                            </Pressable>})}
                        {makeDTO.length > 0 && <Animated.View ref={ingreBox} style={[ingAni,{zIndex: -makeDTO.length}]}>
                            <Image 
                            source={{ uri : ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                            ingres.find(ing => ing.ingreSeq === makeDTO[0]).image :
                            ingres.find(ing => ing.ingreSeq === makeDTO[0]).name === '먹물 번' ? 
                            'https://postfiles.pstatic.net/MjAyNDAyMjVfMTY4/MDAxNzA4ODQxNDg2OTk0.9RaLSfxW7Tzloqsvz40r1omqWehGg7bZbh7st9OBmQkg.2JdsHC1yle6BINWRnsSUQib_A5GWvLE3mh2HhqXoQ9Ig.PNG/ink_bun.png?type=w966'
                            : 'https://postfiles.pstatic.net/MjAyNDAyMjVfNiAg/MDAxNzA4ODM5MDMxNzQ5.-eK1dABinObEUaWkHVMu03zQ818I4VUbkhhdwf7AlQIg.xFI7_6ktqqav2Uj-iqp-yy4F_b6WR9xbopK5xWIP0p4g.PNG/normal_bun.png?type=w966'}} 
                            style={{width: size === 0 ? '50%' : size === 2 ? '90%' : '70%',alignSelf:'center',
                            aspectRatio: 500/(ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 ? 
                            ingres.find(ing => ing.ingreSeq === makeDTO[0]).height : 160), 
                            marginTop: size === 0 ? lastMargin * 0.00009 : size === 1 ? lastMargin * 0.00007 : lastMargin * 0.00002}} />
                        </Animated.View>}
                        </Pressable>
                    </View>
                    <View style={styles.infoContainer}> 
                        <View style={styles.iconContainer}>
                            <Pressable onPress={() => setFold(!fold)}>
                                <Image source={fold ? foldT : foldF} resizeMode='contain' style={styles.topIcon}/>
                            </Pressable>
                            <Pressable onPress={() => setMakeDTO([])}>
                                <Image source={reset} resizeMode='contain' style={styles.topIcon}/>
                            </Pressable>
                        </View>
                        <View style={{padding: 5}}>
                            {ingres.sort((a, b) => a.type - b.type).map((item,index) => makeDTO.includes(item.ingreSeq) && 
                            <Text key={index} style={styles.ingreTxt}>
                                {item.name} X {makeDTO.filter(md => md === item.ingreSeq).length}
                            </Text>)}
                        </View>
                        <View style={styles.nut}>
                            <Text style={styles.nutTxt}>탄수화물&nbsp;
                                {((makeDTO.reduce((acc, cur) => acc + ingres.find(ing => ing.ingreSeq === cur).carbohydrates, 0) +
                                (makeDTO.length > 0 && ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 && 
                                ingres.find(ing => ing.ingreSeq === makeDTO[0]).carbohydrates)) * 
                                (size === 0 ? 0.85 : size === 2 ? 1.19 : size === 1 && 1 )).toFixed(1)}g
                            </Text>
                            <Text style={styles.nutTxt}>단백질&nbsp;
                                {((makeDTO.reduce((acc, cur) => acc + ingres.find(ing => ing.ingreSeq === cur).protein, 0) +
                                    (makeDTO.length > 0 && ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 && 
                                    ingres.find(ing => ing.ingreSeq === makeDTO[0]).protein)) * 
                                    (size === 0 ? 0.85 : size === 2 ? 1.19 : size === 1 && 1 )).toFixed(1)}g
                            </Text>
                            <Text style={styles.nutTxt}>지방&nbsp;
                                {((makeDTO.reduce((acc, cur) => acc + ingres.find(ing => ing.ingreSeq === cur).lipid, 0) +
                                    (makeDTO.length > 0 && ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 && 
                                    ingres.find(ing => ing.ingreSeq === makeDTO[0]).lipid)) * 
                                    (size === 0 ? 0.85 : size === 2 ? 1.19 : size === 1 && 1 )).toFixed(1)}g
                            </Text>
                        <Text style={styles.kcalTxt}>총&nbsp;
                            {parseInt((makeDTO.reduce((acc, cur) => acc + ingres.find(ing => ing.ingreSeq === cur).kcal, 0) +
                            (makeDTO.length > 0 && ingres.find(ing => ing.ingreSeq === makeDTO[0]).type !== 0 && 
                            ingres.find(ing => ing.ingreSeq === makeDTO[0]).kcal)) * 
                            (size === 0 ? 0.85 : size === 2 ? 1.19 : size === 1 && 1 ))}
                        Kcal</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

                <View style={{height: '5%',marginVertical:'-3.5%'}} 
                    {...panResponder.current.panHandlers}>
                        <View style={{height:'38%'}}/>
                        <View style={{backgroundColor: action ? 'lightgray' : 'whitesmoke',height:'24%',justifyContent:'center'}}>
                            <Image source={action ? holdingGif : holding} style={styles.hold}/>
                        </View>
                        <View style={{height:'38%'}}/>
                </View>

            <ScrollView 
                onScroll={() => setAction(false)}
                style={[styles.ingreContainer,{height:ingCon + '%'}]}>
                <View style={styles.ingreTop}> 
                        <Text style={styles.ingreTitle}>Size </Text> 
                </View>
                <View style={styles.sizeBox}>
                    <Pressable onPress={() => setSize(0)}>
                        <Text style={[styles.sizeTxt,{color: size === 0 ? 'black' : 'darkgray'}]}>S</Text>
                    </Pressable>
                    <Pressable onPress={() => setSize(1)}>
                        <Text style={[styles.sizeTxt,{color: size === 1 ? 'black' : 'darkgray'}]}>M</Text>
                    </Pressable>
                    <Pressable onPress={() => setSize(2)}>
                        <Text style={[styles.sizeTxt,{color: size === 2 ? 'black' : 'darkgray'}]}>L</Text>
                    </Pressable>
                </View>
                {size !== -1 && <View>
                <View style={styles.ingreTop}>  
                    <Text style={styles.ingreTitle}>Bun</Text>
                    <Pressable onPress={() => setBunBox(!bunBox)}>
                        <Image source={bunBox ? max : min} style={{width:25,height:25,marginTop:6}}/>
                    </Pressable>
                </View>
                <ScrollView horizontal={bunBox}>
                    <View style={{display:'flex',flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>
                    {makeDTO.length === 0 && ingres.filter(ing => ing.type === 0 && ing.name !== '추가 번')
                        .map((item,index) => 
                        <Pressable key={index}
                            style={styles.ingreItem}
                            onPress={(e) => aniMove(e,item.image,item.ingreSeq)}>
                            <Image source={{ uri: item.image }} style={styles.ingreImage} resizeMode='contain'/>
                            <Text style={{fontSize:15}}>{item.name}</Text>
                        </Pressable>
                    )}
                    {makeDTO.length > 0 && 
                        ingres.filter(ing => ing.type === 0 && ing.name === '추가 번')
                        .map((item,index) => 
                            <Pressable 
                                key={index}
                                style={styles.ingreItem}
                                onPress={(e) => aniMove(e,item.image,item.ingreSeq)}>
                                <Image source={{ uri: item.image }} style={styles.ingreImage} resizeMode='contain'/>
                                <Text style={{fontSize:15}}>추가 번</Text>
                            </Pressable>
                        )
                    }
                    </View>
                </ScrollView>
                <View style={styles.ingreTop}> 
                    <Text style={styles.ingreTitle}>Patty</Text>
                    <Pressable onPress={() => setPattyBox(!pattyBox)}>
                        <Image source={pattyBox ? max : min} style={{width:25,height:25,marginTop:6}}/>
                    </Pressable>
                </View>
                <ScrollView horizontal={pattyBox}>
                    <View style={{display:'flex',flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>
                    {ingres.filter(ing => ing.type === 1).map((item,index) => 
                        <Pressable key={index}
                            style={styles.ingreItem}
                            onPress={(e) => aniMove(e,item.image,item.ingreSeq)}>
                            <Image source={{ uri: item.image }} style={styles.ingreImage} resizeMode='contain'/>
                            <Text style={{fontSize:15}}>{item.name}</Text>
                        </Pressable>
                    )}
                    </View>
                </ScrollView>
                <View style={styles.ingreTop}> 
                    <Text style={styles.ingreTitle}>Vegetable</Text>
                    <Pressable onPress={() => setVegeBox(!vegeBox)}>
                        <Image source={vegeBox ? max : min} style={{width:25,height:25,marginTop:6}}/>
                    </Pressable>
                </View>
                <ScrollView horizontal={vegeBox}>
                    <View style={{display:'flex',flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>
                    {ingres.filter(ing => ing.type === 2).map((item,index) => 
                        <Pressable key={index}
                            style={styles.ingreItem}
                            onPress={(e) => aniMove(e,item.image,item.ingreSeq)}>
                            <Image source={{ uri: item.image }} style={styles.ingreImage} resizeMode='contain'/>
                            <Text style={{fontSize:15}}>{item.name}</Text>
                        </Pressable>
                    )}
                    </View>
                </ScrollView>
                {makeDTO.length > 0 && <View>
                <View style={styles.ingreTop}> 
                    <Text style={styles.ingreTitle}>Filling</Text>
                    <Pressable onPress={() => setFillBox(!fillBox)}>
                        <Image source={fillBox ? max : min} style={{width:25,height:25,marginTop:6}}/>
                    </Pressable>
                </View>
                <ScrollView horizontal={fillBox}>
                    <View style={{display:'flex',flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>
                        {ingres.filter(ing => ing.type === 3).map((item,index) => 
                            <Pressable key={index}
                                style={styles.ingreItem}
                                onPress={(e) => aniMove(e,item.image,item.ingreSeq)}>
                                <Image source={{ uri: item.image }} style={styles.ingreImage} resizeMode='contain'/>
                                <Text style={{fontSize:15}}>{item.name}</Text>
                            </Pressable>
                        )}
                    </View>
                </ScrollView>
                <View style={styles.ingreTop}> 
                    <Text style={styles.ingreTitle}>Sauce</Text>
                    <Pressable onPress={() => setSauBox(!sauBox)}>
                        <Image source={sauBox ? max : min} style={{width:25,height:25,marginTop:6}}/>
                    </Pressable>
                </View>
                <ScrollView horizontal={sauBox}>
                    <View style={{display:'flex',flexDirection:'row',flexWrap:'wrap',justifyContent:'center'}}>
                        {ingres.filter(ing => ing.type === 4).map((item,index) => 
                            <Pressable key={index}
                                style={styles.ingreItem}
                                onPress={(e) => aniMove(e,item.image,item.ingreSeq)}>
                                <Image source={{ uri: item.image }} style={styles.ingreImage} resizeMode='contain'/>
                                <Text style={{fontSize:15}}>{item.name}</Text>
                            </Pressable>
                        )}
                    </View>
                </ScrollView>
                </View>}
            </View>}
            <View style={{height:30}}/>
             </ScrollView>
             <Modal
                animationType="fade"
                transparent={true}
                visible={sizeModal}>
                <View style={styles.centeredView}>
                    <ScrollView style={styles.modalView}>
                        <Pressable
                            style={styles.buttonClose}
                            onPress={() => setSizeModal(!sizeModal)}>
                            <Text style={styles.textStyle}>닫기</Text>
                        </Pressable>
                        <View style={styles.modalButs}>
                            <Pressable onPress={() => setSizeMode(0)}
                                style={[styles.sizeMode,{backgroundColor:sizeMode === 0 ? 'lightgray' : 'white'}]}>
                                <Text>기본</Text>
                            </Pressable>
                            <Pressable onPress={() => setSizeMode(1)}
                                style={[styles.sizeMode,{backgroundColor:sizeMode === 1 ? 'lightgray' : 'white'}]}>
                                <Text>패티</Text>
                            </Pressable>
                        </View>
                        {sizeMode === 0 && <View style={{alignItems:'center'}}>
                            <Text>S : 직경 9.5cm 이하, 속재료 적음</Text>
                            <Image source={sizesImg} style={{width:90,height:90}}/>
                            <Text>ex:: 데리버거, 와퍼 주니어</Text><Text/>
                            <Text>M : 직경 9.5cm 이상, 속재료 적당</Text>
                            <Image source={sizemImg} style={{width:100,height:100}}/>
                            <Text>ex:: 싸이버거, 불고기 버거(L사), 새우 버거</Text><Text/>
                            <Text>L : 직경 10cm 이상, 속재료 많음</Text>
                            <Image source={sizelImg} style={{width:110,height:110}}/>
                            <Text>ex:: 와퍼, 한우 불고기 버거 </Text><Text/>
                        </View>}
                        {sizeMode === 1 && <View style={{alignItems:'center'}}>
                            <Text>기본 : 50g 이상</Text>
                            <Image source={pattynImg} style={{width:200,height:100}}/>
                            <Text>ex:: 1955 버거, AZ 버거</Text><Text/>
                            <Text>Thin : 50g 미만</Text>
                            <Image source={pattysImg} style={{width:200,height:100}}/>
                            <Text>ex:: 빅맥, 데리 버거</Text><Text/>
                        </View>}
                        <View style={{height:50}}/>
                    </ScrollView>
                </View>
            </Modal>
            <Pressable style={styles.onModal} onPress={() => setSizeModal(true)}>
                        <Image source={info} style={styles.infoImg}/>
                        <Text style={{fontSize: 11,paddingTop: 7}}>기준 보기</Text>
            </Pressable>
            <View style={[styles.arrowBut,{bottom: 0}]}>
                <Pressable onPress={() => onCheck()}>
                    <Image source={nextImg} style={{height:'95%',aspectRatio: 1/1, alignSelf:'center'}}/>
                </Pressable>
            </View> 
            {move && 
                <Animated.Image source={{ uri: moveImg }} 
                resizeMode='contain'
                style={{position:'absolute', 
                width:90, height:50,
                transform: [{
                    scale : moveBox.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2.1*(windowWidth/411)*(size === 0 ? 0.7 : size === 1 ? 1 : 1.3)],
                })}],
                opacity: moveBox.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                }),
                left: moveBox.interpolate({
                    inputRange: [0, 1],
                    outputRange: [ingX, windowWidth*0.25],
                }),
                top: moveBox.interpolate({
                    inputRange: [0, 1],
                    outputRange: [ingY, 150],
                })}}/>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    hold : {
        height: '400%',
        aspectRatio: 1/1,
        alignSelf: 'center',
    },
    burgerContainer : {
        padding: 10,
        alignContent: 'center',
    },
    makeContainer : {
        width: '69%',
        minHeight: 200,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'lightgray',
        paddingBottom: 20
    },  
    infoContainer : {
        width: '30%',
        minHeight: 200,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'lightgray',
        paddingBottom: 20
    },
    totalContainer : {
        flexDirection : 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },
    ingreContainer : {
        zIndex: -1,
    },
    ingreTop : {
        flexDirection:'row',
        justifyContent:'space-between',
        paddingHorizontal:20
    },
    sizeTxt : {
        fontSize: 35,
        fontFamily: 'esamanruMedium',
    },
    sizeBox : {
        padding: 20,
        justifyContent:'space-around',
        flexDirection: 'row'
    },
    ingreItem : {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingBottom: 5,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    ingreImage : {
        width: 90,
        height: 50,
        margin: 10
    },
    sizeBar : {
        borderBottomWidth:1,
        borderBottomColor: 'gray',
        alignSelf:'center',
        marginTop: 2,
        marginBottom: 10
    },
    ingreTitle : {
        fontSize: 16,
        paddingTop: 10,
        fontFamily: 'esamanruMedium',
    },
    topTxt :{
        fontSize: 11,
        marginLeft: 5,
        marginTop: 2,
    },
    topIcon : {
        width: 40,
        height: 40
    },
    iconContainer : {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingTop: 10,
        borderBottomColor: 'lightgray',
        paddingBottom: 5,
        borderBottomWidth: 2
    },
    ingreTxt : {
        borderBottomWidth: 1,
        borderBottomColor : 'lightgray',
        color: 'gray',
        fontWeight: 'bold',
        paddingVertical: 1
    },
    nut : {
        alignSelf:'center',
        backgroundColor: 'lightgray',
        paddingHorizontal: 5,
        borderRadius: 5,
        marginTop: 10,
    },
    nutTxt :{
        fontSize: 13,
        color: 'gray',
        paddingVertical: 1,
    },
    kcalTxt :{
        fontSize: 16,
        fontWeight: 'bold',
        color: 'gray',
        paddingVertical: 1,
    },
    infoImg : {
        margin: 5,
        width: 22,
        height: 22
    },
    onModal : {
        flexDirection:'row',
        position:'absolute',
        backgroundColor: 'lightgray',
        paddingRight: 5,
        borderRadius: 5,
        bottom: '3%',
        right: 10,
        opacity: 0.7
    },
    // 모달
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        maxHeight: '60%',
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonClose: {
        backgroundColor: 'tomato',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 7,
        width: '40%',
        alignSelf: 'center',
        marginBottom: 10
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalButs : {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 15
    },
    sizeMode : {
        borderWidth: 2,
        borderColor: 'lightgray',
        padding: 5
    },
    /////////////////위아래 버튼
    arrowBut : {
        height: '7%',
        justifyContent: 'center',
        position: 'absolute',
        left:'43%',
        opacity: 0.8,
        zIndex: 999
    }
});


export default HamburgerMake;