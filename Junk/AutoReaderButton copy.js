import React, { memo, useCallback, useMemo, useTransition } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, useContext } from 'react';
import * as Device from 'expo-device';
import ContextProvider from '.././ContextProvider';
import { RecyclerListView, DataProvider, LayoutProvider, } from "recyclerlistview";
import SwipeableItem, {
    useSwipeableItemParams,
    OpenDirection,
} from "react-native-swipeable-item";
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from '.././StackNavigator';

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

import { Context } from '.././ContextProvider';


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


export default function AutoReaderButton() {

    const { sourceWordArr, scrollRef, scrollRef2, wordPos, isListPlaying, preLeft, preTop } = useContext(Context)

    function scroll(y) {


        ///console.log(y,)

        const scrollY = interpolate(



            y,
            [80, screenHeight - headHeight],
            [0, sourceWordArr.length * 80 - (screenHeight - headHeight)],
            "clamp"
        )

        //  console.log(y,scrollY)

        scrollRef.current._scrollViewRef.scrollTo({ y: scrollY, animated: false })
        //const percent = (y - 80) / (screenHeight - headHeight - 80)

        //scrollRef.current._scrollViewRef.scrollTo({ y: sourceWordArr.length * 80 * percent, animated: true })
        //    console.log((y - 80), (y - 80) / (screenHeight - headHeight - 80) * 100 + "%")

    }

    // function scrollByPercent(percent) {
    //     scrollRef.current._scrollViewRef.scrollTo({ y: sourceWordArr.length * 80 * percent, animated: true })
    // }


    const percent = useSharedValue(0)
    const pan = Gesture.Pan()
        .onChange(e => {

            // console.log(e.changeX, e.changeY, e)


            //preLeft.value = Math.min(screenWidth - 80, Math.max(0, preLeft.value + e.changeX));
            preTop.value = Math.max(headHeight, Math.min(screenHeight - 80, preTop.value + e.changeY));

            // if (preLeft.value === screenWidth - 80) {
            //     runOnJS(scroll)(Math.max(headHeight, Math.min(screenHeight - 80, preTop.value + e.changeY)))
            // }

            // console.log(e.changeY, e.absoluteY, screenHeight)


            // percent.value = interpolate(e.absoluteY, [screenHeight - headHeight, screenHeight - 100], [0, 1], "clamp")
            // console.log(percent.value)



        })

        .onEnd(e => {
            runOnJS(scroll)(preTop.value)

            // runOnJS(scrollByPercent)(percent.value)
            // if (preLeft.value === screenWidth - 80) {
            //     runOnJS(scroll)(preTop.value)
            // }



        })

    const tap = Gesture.Tap()
        .onStart(() => { })
        .onEnd(() => {

            isListPlaying.value = !isListPlaying.value
            runOnJS(startAutoRead)()

            //  console.log(wordPos.value, "isListPlaying", isListPlaying.value)
        })

    const pivotStyle = useAnimatedStyle(() => {


        return {
            width: 80,
            height: 80,
            backgroundColor: isListPlaying.value ? "lightgreen" : "#faa",
            position: "absolute",
            left: preLeft.value,
            //  top: withTiming(interpolate(preTop.value, [0, 1], [80, screenHeight - headHeight], "clamp")),//preTop.value,
            top: preTop.value,

            borderRadius: 1000,
            borderTopRightRadius: preLeft.value === screenWidth - 80 ? 0 : 1000,
            borderBottomRightRadius: preLeft.value === screenWidth - 80 ? 0 : 1000,
            opacity: 0.9,
            transform: [{ scale: 1 }],
            elevation: 10,
        }

    })

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








    function startAutoRead() {

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
            tap)}>

            <View style={[pivotStyle]}>

            </View>

        </GestureDetector>

    )

}