import React, { memo, useCallback, useMemo, useTransition } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, useContext } from 'react';
import * as Device from 'expo-device';

import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
import SwipeableItem, {
    useSwipeableItemParams,
    OpenDirection,
} from "react-native-swipeable-item";
import { NavigationContainer } from '@react-navigation/native';

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

import { Context } from '../ContextProvider';


import { Audio } from 'expo-av';
import startPromiseSequential from 'promise-sequential';

import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
const headHeight = getStatusBarHeight() > 24 ? 80 : 60



import { ListItem, Avatar, LinearProgress, Tooltip, Icon, Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDebounce, useDebouncedCallback, useThrottledCallback } from 'use-debounce';


export default function SwipebleRowItem(props) {



    const { index, type, frameTransY } = props


    const { sourceWordArr } = useContext(Context)
    const sourceWord = sourceWordArr[index]




    const styles = StyleSheet.create({
        rightAction: { width: 100, height: 80, backgroundColor: 'purple' },
        separator: {
            width: '100%',
            borderTopWidth: 1,
        },
        swipeable: {
            // marginTop: 200,
            height: 80,
            //  backgroundColor: 'papayawhip',
            backgroundColor: 'wheat',
            alignItems: 'center',
            borderBottomWidth: 1,
            justifyContent: "center"
        },
    });


    function RightAction(prog, drag) {
        const styleAnimation = useAnimatedStyle(() => {


            return {
                width: 100,
                backgroundColor: "pink",
                transform: [{ translateX: drag.value + 100 }],
                justifyContent: "center",
                alignItems: "center",
            };
        });

        return (
            <View style={styleAnimation}>
                <Text >Text</Text>
            </View>
        );
    }

    function LeftAction(prog, drag) {
        const styleAnimation = useAnimatedStyle(() => {
            return {
                width: 100,
                transform: [{ translateX: drag.value - 100 }],
            };
        });





        return (
            <View style={styleAnimation}>
                <Text style={styles.rightAction}>Text</Text>
            </View>
        );
    }



    return <GestureHandlerRootView>
        <ReanimatedSwipeable
            containerStyle={styles.swipeable}
            friction={2}
            enableTrackpadTwoFingerGesture
            leftThreshold={20}
            rightThreshold={20}
            renderRightActions={RightAction}
            renderLeftActions={LeftAction}
        >

            {/* <Text>{index} {sourceWord.wordName}</Text> */}

            <PanelItem sourceWord={sourceWord} index={index} frameTransY={frameTransY} />
        </ReanimatedSwipeable>
    </GestureHandlerRootView>
}


function PanelItem({ sourceWord, index, frameTransY, ...props }) {

    const rowItemStyle = useAnimatedStyle(() => {

        return {

            borderBottomWidth: 1,
            height: 80,
            zIndex: 100,
            // transform: [{ translateY: index * 80 }],
            //   backgroundColor: wordPos.value === index ? "#c3e1a2": "wheat"  // "#eee"
            //  backgroundColor: wordPos.value === index ? "wheat" : "#eee"
            backgroundColor: "#999",
            alignItems: "center",
            justifyContent: "center"

        }

    })



    const singleTap = Gesture.Tap()
        .maxDuration(250)
        .numberOfTaps(1)
        .onEnd(e => {
            console.log(index, 'Single tap!',);
        })

    const doubleTap = Gesture.Tap()
        .maxDuration(250)
        .numberOfTaps(2)
        .onEnd(e => {
            console.log(index, 'Double tap!');
            frameTransY.value = frameTransY.value === 0 ? 300 : 0
        })

    return (
        <>

            {/* <GestureHandlerRootView key={index}> */}
            <GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap)} >

                <View style={[rowItemStyle]} >
                    <Text>{index} {sourceWord.wordName}</Text>
                </View>
            </GestureDetector>


            {/*  </GestureHandlerRootView> */}



        </>)


}