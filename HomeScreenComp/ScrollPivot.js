import React, { memo, useCallback, useMemo, useTransition } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, useContext } from 'react';
import * as Device from 'expo-device';
import ContextProvider from '../ContextProvider';
import { RecyclerListView, DataProvider, LayoutProvider, } from "recyclerlistview";
import SwipeableItem, {
    useSwipeableItemParams,
    OpenDirection,
} from "react-native-swipeable-item";
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from '../StackNavigator';

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
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import startPromiseSequential from 'promise-sequential';

import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
const headHeight = getStatusBarHeight() > 24 ? 80 : 60



import { ListItem, Avatar, LinearProgress, Tooltip, Icon, Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDebounce, useDebouncedCallback, useThrottledCallback } from 'use-debounce';

import * as Speech from 'expo-speech';
import { reject, resolve } from 'superagent/lib/request-base';
import promiseSequential from 'promise-sequential';



export default function ScrollPivot() {

    const { sourceWordArr, scrollRef, scrollRef2, wordPos, isListPlaying, frameTransY, preLeft, preTop, scrollY, isPanning, isScrollingY,


    } = useContext(Context)






    const scroll1 = useThrottledCallback(
        (y) => {

            const newY = interpolate(
                y,
                [80, screenHeight - headHeight],
                [0, sourceWordArr.length * 80 - (screenHeight - headHeight)],
                "clamp"
            );

            scrollRef.current._scrollViewRef.scrollTo({
                y: newY,
                animated: true
            })
        },
        100,
        { leading: true, trailing: true }

    )



    function scroll2(y) {

        const newY = interpolate(
            y,
            [80, screenHeight - headHeight],
            [0, sourceWordArr.length * 80 - (screenHeight - headHeight)],
            "clamp"
        );

        scrollRef.current._scrollViewRef.scrollTo({
            y: newY + 1,
            animated: false
        })

        setTimeout(() => {
            scrollRef.current._scrollViewRef.scrollTo({
                y: newY,
                animated: true
            })
        }, 10);

    }




    function stopScroll() {



        scrollRef.current._scrollViewRef.scrollTo({ y: scrollY.value, animated: false })
    }

    function endPanning() {
        setTimeout(() => {
            isPanning.value = false
            isScrollingY.value = false
        }, 300);
    }


    const pan = Gesture.Pan()
        .onStart((e) => {
            isPanning.value = true



        })
        .onChange(e => {

            //     preTop.value = Math.max(headHeight, Math.min(screenHeight - 80, preTop.value + e.changeY));
            preTop.value = e.absoluteY - headHeight / 2//preTop.value + e.changeY

            //console.log( preTop.value)

            //runOnJS(scroll1)(preTop.value)
        })

        .onFinalize(e => {

            isPanning.value = false
            //runOnJS(scroll1)(preTop.value)
            runOnJS(scroll2)(preTop.value)
            //runOnJS(endPanning)()
        })



    const tap = Gesture.Tap()
        .onTouchesDown(() => {
            runOnJS(stopScroll)()
        })
        .onStart(() => {
            //  runOnJS(stopScroll)()
        })
        .onEnd(() => {

            //isListPlaying.value = !isListPlaying.value
            //runOnJS(startAutoRead)()

            //  console.log(wordPos.value, "isListPlaying", isListPlaying.value)
        })









    const pivotStyle = useAnimatedStyle(() => {

        return {
            width: 80,
            height: 80,

            borderColor: "orange",
            borderWidth: 4,

            backgroundColor: "wheat",//"rgba(231, 231, 224, 0.67)f",//"transparent",
            borderTopLeftRadius: 999,
            borderBottomLeftRadius: 999,

            position: "absolute",

            left: preLeft.value - 40,

            // left:
            //     isPanning.value
            //         ? preLeft.value - 40
            //         : isListPlaying.value
            //             ? preLeft.value - 40
            //             : isScrollingY.value ? withTiming(preLeft.value - 40) : withTiming(preLeft.value),






            //  top: withTiming(interpolate(preTop.value, [0, 1], [80, screenHeight - headHeight], "clamp")),//preTop.value,
            top: preTop.value,

            //       borderRadius: 1000,
            //         borderTopRightRadius: preLeft.value === screenWidth - 80 ? 0 : 1000,
            //        borderBottomRightRadius: preLeft.value === screenWidth - 80 ? 0 : 1000,
        
            //  borderRightWidth: 10,
            //  borderRightWidth: 0,
            //borderRightColor: isListPlaying.value ? "lightgreen" : "#faa",



            transform: [
                //   { translateX: interpolate(frameTransY.value, [screenHeight - headHeight, screenHeight - headHeight - 80], [80, 0], "clamp") },
                { scale: 1 }
            ],
            elevation: 8,
            shadowColor: "black",

            
            // opacity: interpolate(frameTransY.value, [screenHeight - headHeight, screenHeight - headHeight - 80], [0, 0.8], "clamp"),
            opacity: isPanning.value ? 1 : isListPlaying.value ? 0.5 : isScrollingY.value ? withTiming(0.8) : withTiming(0.5),
        }

    })



    function startAutoRead() {

        function readWord() {
            return new Promise((resolve, reject) => {

                if (!isListPlaying.value) { resolve(false) }
                Speech.stop()
                Speech.speak(sourceWordArr[wordPos.value].wordName, {
                    onDone: () => {
                        resolve(true)
                    },
                    onError: () => {
                        console.log("fail on reading " + wordPos.value + " " + sourceWordArr[wordPos.value].wordName)
                        resolve(false)
                    }
                })
            })
        }

        function increasePos() {
            return new Promise((resolve, reject) => {
                if (!isListPlaying.value) { resolve(false) }
                wordPos.value = (wordPos.value + 1) % sourceWordArr.length
                setTimeout(() => {
                    resolve(true)
                }, 0);
            })
        }

        function scrollWord() {
            return new Promise((resolve, reject) => {
                if (!isListPlaying.value) { resolve(false) }
                scrollRef.current._scrollViewRef.scrollTo({ y: wordPos.value * 80, animated: true })
                scrollRef2.current._scrollViewRef.scrollTo({ x: wordPos.value * screenWidth, animated: true })
                setTimeout(() => {
                    resolve(true)
                }, 150)

            })

        }



        if (isListPlaying.value) {

            startPromiseSequential([
                readWord, increasePos, scrollWord,

            ]).then((res) => {
                startAutoRead()
            }).catch(res => {

            })

        }
        else {
            Speech.stop()
            scrollRef.current._scrollViewRef.scrollTo({ y: wordPos.value * 80, animated: true })
            scrollRef2.current._scrollViewRef.scrollTo({ x: wordPos.value * screenWidth, animated: true })


        }









    }


    return (

        <GestureDetector gesture={Gesture.Race(
            pan,
            tap
        )}>

            <View style={[pivotStyle]}>

            </View>

        </GestureDetector>

    )

}