import React, { memo, useCallback, useMemo, useTransition } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, useContext } from 'react';
import * as Device from 'expo-device';
import ContextProvider from './ContextProvider';
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
import SwipeableItem, {
    useSwipeableItemParams,
    OpenDirection,
} from "react-native-swipeable-item";
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './StackNavigator';

import { StyleSheet, Button, Dimensions, TouchableOpacity, SafeAreaView, RefreshControl, BackHandler, Alert } from 'react-native';
const screenWidth = Dimensions.get('screen').width
const screenHeight = Dimensions.get('screen').height
import superagent, { source } from "superagent"
import * as FileSystem from 'expo-file-system';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
    TapGestureHandler
} from 'react-native-gesture-handler'; //npx expo install react-native-gesture-handler

import ReAnimated, {
    useSharedValue,
    withTiming,
    withSpring,
    withDelay,
    useAnimatedStyle,
    Easing,
    LinearTransition,
    JumpingTransition,
    CurvedTransition,
    ZoomIn,
    runOnJS,
    useAnimatedRef,
    useDerivedValue,
    SlideInRight,
    interpolate,
    withRepeat

} from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { FadeIn, FadeOut, BounceIn, BounceOut, SlideOutUp } from 'react-native-reanimated';
const { View, Text, ScrollView, FlatList } = ReAnimated

import { Context } from './ContextProvider';


import { Audio } from 'expo-av';
import startPromiseSequential from 'promise-sequential';

import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
const headHeight = getStatusBarHeight() > 24 ? 80 : 60



import { ListItem, Avatar, LinearProgress, Tooltip, Icon, Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDebounce, useDebouncedCallback, useThrottledCallback } from 'use-debounce';


import SwipebleRowItem from "./HomeScreenComp/SwipebleRowItem"
import Card from './HomeScreenComp/Card';

export default function HomeScreen() {
    const { sourceWordArr } = useContext(Context)
    const scrollRef = useRef()
    const scrollRef2 = useRef()




    const headerViewStyle = useAnimatedStyle(() => {
        return {
            width: screenWidth,
            height: headHeight,
            // backgroundColor: "#faf",
            backgroundColor: "wheat",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "flex-end",

        }
    })


    const frameStyle1 = useAnimatedStyle(() => {
        return {
            width: screenWidth,
            height: screenHeight - headHeight,
            backgroundColor: "darkgray",
        }

    })

    const [dataProvider] = useState(new DataProvider((r1, r2) => {
        return r1 !== r2;
    }));
    const [layoutProvider] = useState(
        new LayoutProvider(
            (index) => {
                //   console.log(sourceWordArr[index],"=====")
                const typeObj = {
                    index,

                    type: "typeA",
                    //    wordName: sourceWordArr[index].wordName,
                };
                return typeObj
            },
            (typeObj, dim) => {
                dim.width = screenWidth;
                dim.height = 80;
            }
        )

    )
    const [layoutProvider2] = useState(
        new LayoutProvider(
            (index) => { const typeObj = { index, type: "typeB" }; return typeObj },
            (typeObj, dim) => {
                dim.width = screenWidth;
                dim.height = screenHeight - headHeight;
            }
        )
    )



    //const frameTransY = useSharedValue(screenHeight - headHeight)
    const frameTransY = useSharedValue(200)

    const frameStyle2 = useAnimatedStyle(() => {

        console.log(frameTransY.value, "-----------=============---eee------")
        return {

            width: screenWidth,
            height: screenHeight - headHeight,
            backgroundColor: "pink",
            transform: [
                { translateY: withTiming(-frameTransY.value) },



                //{ scale: interpolate(frameTransY.value, [-screenHeight + headHeight, 0], [1, 0.5], "clamp") }
            ],
            // opacity:interpolate(frameTransY.value, [-screenHeight + headHeight, 0], [1, 0], "clamp")
        }

    })


    return (
        <View style={{ width: 2 * screenWidth, height: screenHeight - headHeight, backgroundColor: "#eee", opacity: 1, flexDirection: "column", }}>

            <View style={[headerViewStyle]}>

                <TouchableOpacity activeOpacity={0.2} onPressOut={function () { }}>
                    <Icon
                        name="add-circle-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "180deg" }] }}
                        size={40}
                    />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.2} onPressOut={function () { }}>
                    <Icon
                        name="swap-horizontal-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "90deg" }] }}
                        size={40}
                    />
                </TouchableOpacity>


                <TouchableOpacity activeOpacity={0.2} onPressOut={function () { }}>
                    <Icon
                        name="funnel-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "0deg" }, { translateX: 0 }, { translateY: 0 }], zIndex: 100, }}
                        size={40}
                    />
                </TouchableOpacity>



                <TouchableOpacity activeOpacity={0.2} onPressOut={function () { }}>
                    <Icon
                        name="save" type='ionicon' color='orange'
                        containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "180deg" }] }}
                        size={40}
                    />
                </TouchableOpacity>
            </View>

            <View style={frameStyle1}>
                <RecyclerListView
                    onScroll={(e) => { }}
                    onItemLayout={e => { }}
                    layoutProvider={layoutProvider} //not always get call when upate in expoGO
                    dataProvider={dataProvider.cloneWithRows(sourceWordArr.map(item => item.wordName))}

                    onEndReached={() => { }}
                    onEndReachedThreshold={0}
                    onEndReachedThresholdRelative={0}

                    scrollViewProps={{
                        // scrollEnabled: enableScroll,
                        refreshControl: (
                            <RefreshControl
                                refreshing={false}
                                onRefresh={async () => { console.log("refreshing") }}
                            />
                        ),
                        //contentOffset: { y: wordPos.value * 80, x: 0 }, // not working with wordPos.value
                        ref: scrollRef,
                        onContentSizeChange: (...props) => { },
                        onScrollBeginDrag: () => { },
                        onScrollDragEnd: () => { },
                        onMomentumScrollEnd: (e) => { }
                    }}


                    //rowRenderer={SwipebleRowItem} //---> cannot auto update in expoGo
                    rowRenderer={function (props) {
                        return <SwipebleRowItem {...props} frameTransY={frameTransY} />
                    }}
                />

            </View>


            <View style={frameStyle2}>
                <RecyclerListView
                                onScroll={function (e) {
            
            
                                //    xPos.value = e.nativeEvent.contentOffset.x
            
             
                                }}
                                isHorizontal={true}
                                //  renderContentContainer={function(){return <></>}}
                                layoutProvider={layoutProvider2}
                                dataProvider={dataProvider.cloneWithRows(sourceWordArr.map(item => item.wordName))}
                                rowRenderer={function (props) {
                                    return <Card {...props} />
                                   // return <Card index={typeObj.index} item={item} xPos={xPos} sourceWord={sourceWordArr[typeObj.index]} />
                                }}
            
                                scrollViewProps={{
            
                                    //contentOffset: { x: route.params.pos * screenWidth, y: 0 },// not workiing
                                    ref: scrollRef2,
                                    disableIntervalMomentum: true,
                                    snapToInterval: screenWidth,
                                    //scrollEnabled: enableScroll,
                                    //contentContainerStyle: { backgroundColor: "lightblue" },
                                    onMomentumScrollEnd: function (e) {
                                    
            
                                    }
                                }}
                            />
            </View>



        </View>


    )







}
