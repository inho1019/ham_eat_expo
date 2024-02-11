import React from 'react';
import Map from '../Map';

const HamburgerMap = (props) => {
    const {navigation,route} = props;

    return (
        <Map type={1} navigation={navigation} route={route}/>
    );
};


export default HamburgerMap;