import React from 'react';
import { Image, Modal, Pressable, View } from 'react-native';
import deleteImg from '../assets/burger/delete.png'

const ImageModal = (props) => {
    const {src,imgModal,onClose} = props

    return (
        <Modal
            animationType="fade"
            visible={imgModal}
            transparent={true}>
            <View style={{backgroundColor: '#00000050',padding:'5%'}}>
                <Image source={{ uri : src }} style={{width:'100%',height:'100%'}} resizeMode='contain'/>
            </View>
            <Pressable style={{position:'absolute',top:10,right:10}}
                onPress={onClose}>
                <Image source={deleteImg} style={{width:40,height:40}}/>
            </Pressable>
        </Modal>
    );
};

export default ImageModal;