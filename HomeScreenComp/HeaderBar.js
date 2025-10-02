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

import { StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, RefreshControl, BackHandler, Alert, Button, Vibration } from 'react-native';
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
    withRepeat,
    runOnUI,

} from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { FadeIn, FadeOut, BounceIn, BounceOut, SlideOutUp } from 'react-native-reanimated';
const { View, Text, ScrollView, FlatList } = ReAnimated

import { Context } from '../ContextProvider';


import { Audio } from 'expo-av';
import { useAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

import startPromiseSequential from 'promise-sequential';

import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
const headHeight = getStatusBarHeight() > 24 ? 80 : 60



import { ListItem, Avatar, LinearProgress, Tooltip, Icon, Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDebounce, useDebouncedCallback, useThrottledCallback } from 'use-debounce';

import CryptoJS from 'crypto-js/sha256';


export function HeaderBar() {


    const { sourceWordArr, scrollRef0, scrollRef, scrollRef2, frameTransY, wordPos, isListPlaying, preLeft, preTop, scrollY, scrollX,
        isPanning, speak, autoPlay, stopSpeak, isScrollingY, isScrollingX, isCardMoving, isManualDrag, shouldHideWordBlock } = useContext(Context)

    const navigation = useNavigation()

    const playButtonStyle1 = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: isListPlaying.value ? withTiming(0) : withTiming(1) },

            ]
        }
    })


    const playButtonStyle2 = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: isListPlaying.value ? withTiming(1) : withTiming(0) },

            ],
            position: "absolute"
        }
    })




    // scrollRef0.current.scrollTo({ y: 0, animated: true })
    function scorllRef0ToEnd() {
        scrollRef0.current.scrollToEnd()
    }


    return (
        <View style={{
            width: screenWidth,
            height: headHeight,

            backgroundColor: "wheat",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "flex-end",
        }}
            onTouchStart={function () {
                //    scrollRef0.current.scrollTo({ y: 0, animated: true })
            }}>

            <ScrollView contentContainerStyle={{ backgroundColor: "transparent" }}
                // onScroll={e=>{
                //     console.log(e.nativeEvent.contentOffset.y)
                // }}
                disableIntervalMomentum={true}
                snapToInterval={headHeight}
                showsVerticalScrollIndicator={false}
                overScrollMode={"never"}
                ref={(ref) => scrollRef0.current = ref}
            >
                <GestureDetector gesture={Gesture.Pan().onEnd(() => {

                    runOnJS(scorllRef0ToEnd)()

                })}>
                    <View style={{ width: screenWidth, height: headHeight, flexDirection: "row", justifyContent: "space-evenly", alignItems: "flex-end", paddingBottom: 4 }}>


                        <GestureDetector gesture={Gesture.Tap().onEnd(() => {
                            isListPlaying.value = !isListPlaying.value

                            if (isListPlaying.value) { runOnJS(autoPlay)() }
                            else { runOnJS(stopSpeak)() }

                        })}>
                            <View >
                                <View style={playButtonStyle1}>
                                    <Icon
                                        name="play-outline" type='ionicon' color='orange'
                                        containerStyle={{ width: 40, height: 40, }}
                                        size={40}
                                    />
                                </View>
                                <View style={playButtonStyle2}>
                                    <Icon
                                        name="stop-outline" type='ionicon' color='orange'
                                        containerStyle={{ width: 40, height: 40, }}
                                        size={40}
                                    />
                                </View>
                            </View>
                        </GestureDetector>



                        <GestureDetector gesture={Gesture.Tap().onEnd(() => {


                        })}>

                            <Icon
                                name="add-circle-outline" type='ionicon' color='orange'
                                containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "180deg" }] }}
                                size={40}
                            />
                        </GestureDetector>

                        <GestureDetector gesture={Gesture.Tap().onEnd(() => {


                        })}>

                            <Icon
                                name="refresh-outline" type='ionicon' color='orange'
                                containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "180deg" }] }}
                                size={40}
                            />
                        </GestureDetector>


                        <GestureDetector gesture={Gesture.Tap().onEnd(() => {


                        })}>

                            <Icon
                                name="options-outline" type='ionicon' color='orange'
                                containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "180deg" }] }}
                                size={40}
                            />
                        </GestureDetector>



                        {/* <GestureDetector gesture={Gesture.Tap().onEnd(() => {
                            runOnJS(scorllRef0ToEnd)()
                        })}>
                            <Icon
                                name="chevron-expand-outline" type='ionicon' color='orange'
                                containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "0deg" }, { translateX: 0 }, { translateY: 0 }], zIndex: 100, }}
                                size={40}
                            />

                        </GestureDetector> */}

                        <GestureDetector gesture={Gesture.Tap().onEnd(() => {
                            if (preLeft.value == screenWidth) {
                                preLeft.value = withTiming(preLeft.value + 40)
                            }
                            else {
                                preLeft.value = withTiming(screenWidth)
                            }
                        })}>
                            <View style={useAnimatedStyle(() => {
                                return {

                                    transform: [{ rotate: preLeft.value == screenWidth ? withTiming("90deg", { duration: 200 }) : withTiming("0deg", { duration: 50 }) }]
                                }

                            })}>
                                <Icon
                                    name="chevron-expand" type='ionicon' color='orange'
                                    containerStyle={{ width: 40, height: 40, zIndex: 100, }}
                                    size={40}
                                />
                            </View>
                        </GestureDetector>

                    </View>
                </GestureDetector>

                {sourceWordArr.length > 0 && <RateBar />}

            </ScrollView>

        </View>

    )


}


export function RateBar() { //!!! Make sure the Card.js render first, then render this component!!!




    const { setSouceWordArr, saveWordToFile, sourceWordArr, refreshState, setRefreshState, wordPos, scrollX, scrollRef0, } = useContext(Context)




    const localLevel = useDerivedValue(() => {
        return sourceWordArr[Math.round(scrollX.value / screenWidth)].level
    }, [scrollX.value])



    // const localPos = useSharedValue(6)
    // useAnimatedReaction(
    //     () => { return wordPos.value },
    //     (current, previous) => {
    //         console.log(previous,current)
    //         localPos.value = sourceWordArr[wordPos.value].level
    //     },
    //    // [] // calls when wordPos value change
    // )

    function scrollToTop() {
        scrollRef0.current.scrollToEnd()
        scrollRef0.current.scrollTo({ y: 0, animated: true })
    }



    function saveLevel(newLevel) {
        const sourceWord = sourceWordArr[Math.round(scrollX.value / screenWidth)]

        setSouceWordArr(sourceWordArr => {
            const arr = sourceWordArr.map(word => {
                if (word.wordName !== sourceWord.wordName) {
                    return word
                }
                else {
                    const newWord = JSON.parse(JSON.stringify(word))
                    newWord.level = newLevel
                    return newWord
                }

            })


            return arr

        })


        setTimeout(() => {
            saveWordToFile()
        }, 100);

    }



    return (<GestureDetector gesture={Gesture.Pan().onEnd(() => {

        runOnJS(scrollToTop)();
    })}>
        <View style={useAnimatedStyle(() => {

            return {
                backgroundColor: "transparent",// isDownloaded.value ? "wheat" : "#e7cca0",
                width: screenWidth, height: headHeight, flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "flex-end",
                padding: 0, margin: 0, paddingHorizontal: 0, marginHorizontal: 0,
                paddingBottom: 4
            }
        })}>

            {[0, 1, 2, 3, 4, 5].map((levelIndex, index) => {


                return <GestureDetector key={index} gesture={Gesture.Tap().onStart(e => {
                    if (localLevel.value === levelIndex) { return }
                    else {
                        localLevel.value = levelIndex
                        runOnJS(saveLevel)(levelIndex)
                    }
                })} >
                    <View style={

                        [useAnimatedStyle(() => {
                            return {
                                width: 40, height: 40, borderRadius: 999, borderColor: "orange", flexDirection: "row",
                                borderWidth: 1, justifyContent: "center", alignItems: "center",
                                backgroundColor: localLevel.value === levelIndex
                                    ? "orange"
                                    : "transparent",

                                padding: 0, margin: 0, paddingHorizontal: 0, marginHorizontal: 0
                            }
                        })]
                    }>

                        <Text style={[
                            useAnimatedStyle(() => {
                                return { color: localLevel.value === levelIndex ? "wheat" : "orange", fontSize: 15, fontWeight: "900" }
                            }),
                        ]}>{levelIndex}</Text>

                    </View>

                </GestureDetector>
            })

            }



        </View >
    </GestureDetector>
    )
}
