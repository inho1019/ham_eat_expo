import React from 'react';
import { Button, Text, View } from 'react-native';

const BoardHome = (props) => {
    const {navigation} = props

    return (
        <View>
            <Text/>
            <Text/>
            <Text/>
            <Button title='자유 게시판' onPress={() => navigation.navigate('List',{ type : 0 })}/>
            <Button title='이벤트 게시판' onPress={() => navigation.navigate('List',{ type : 1 })}/>
            <Button title='공지사항' onPress={() => navigation.navigate('List',{ type : 2 })}/>
        </View>
    );
};

export default BoardHome;