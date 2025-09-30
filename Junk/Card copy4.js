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

import { StyleSheet, Button, Dimensions, TouchableOpacity, SafeAreaView, RefreshControl, BackHandler, Alert, Vibration } from 'react-native';
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

import { LinearGradient } from 'expo-linear-gradient';

import { ListItem, Avatar, LinearProgress, Tooltip, Icon, Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDebounce, useDebouncedCallback, useThrottledCallback } from 'use-debounce';
import CryptoJS from 'crypto-js/sha256';




export default function Card(props) {

    const { index, type, visibleCard } = props

    const { sourceWordArr, frameTransY, shouldFrameDisplay, scrollRef2, isCardMoving, isScrollingY, isScrollingX, isListPlaying, speak,
        downloadWord, refreshState } = useContext(Context)
    const sourceWord = sourceWordArr[index]

    const isDownloaded = useSharedValue(false)


    const barRowHeight = useSharedValue(20)
    const wordRowHeight = useSharedValue(0)
    const meaningRowHeight = useSharedValue(0)

    useDerivedValue(() => {

        //   console.log("row height", index, sourceWord.wordName, wordRowHeight.value, meaningRowHeight.value)

    }, [wordRowHeight.value, meaningRowHeight.value])






    useEffect(() => {
        //console.log(visibleCard.current)



        const hashName = CryptoJS(sourceWord.wordName).toString();
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName + hashName}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists


            // console.log("===", sourceWord.wordName, refreshState, exists)

        })



    }, [visibleCard.current, refreshState])


    const cardStyle = useAnimatedStyle(() => {



        return {
            width: screenWidth,
            height: screenHeight - headHeight,

            // transform:[{scale:0.9}],
            // backgroundColor: frameTransY.value > diff ? "wheat" : "#ffe59f"
            //   backgroundColor: "wheat",
            borderWidth: 0,
            borderTopWidth: 0,
            borderColor: "transparent",
            backgroundColor: "transparent",//isDownloaded.value?"wheat":"brown",
            //     backgroundColor: `rgb(${Math.floor(255*Math.random())},${Math.floor(255*Math.random())},${Math.floor(255*Math.random())})`//getRandomHexColor()
            opacity: frameTransY.value < 160 ? 0.5 : 1,
        }


    }, [frameTransY.value])

    const isOnBar = useSharedValue(false)
    const barStyle = useAnimatedStyle(() => {


        return {
            width: screenWidth, height: barRowHeight.value,
            backgroundColor: isOnBar.value
                ? "hsla(29, 97%, 69%, 0.8)"
                : isListPlaying.value
                    ? frameTransY.value >= screenHeight - headHeight - 80 ? "wheat" : "rgba(156, 243, 136, 0.6)"
                    : "wheat",

            justifyContent: "center", flexDirection: "row", alignItems: "center"
        }
    })





    function vibrate() {
        Vibration.vibrate(50)
    }



    return (

        <View style={[cardStyle]}>

            {/* <GestureDetector
                gesture={Gesture.Simultaneous(

                    Gesture.Pan()
                        .onBegin(e => {
                            isOnBar.value = true

                            console.log("scrollingXY", isScrollingX.value, isScrollingY.value)

                        })
                        .onStart(e => {
                            isCardMoving.value = true


                        })
                        .onChange(e => {

                            if ((!isScrollingY.value) && (!isScrollingX.value)) {
                                // console.log(e.velocityY)
                                if (e.velocityY < -2000) {
                                    frameTransY.value = withTiming(screenHeight - headHeight)
                                }
                                else if (e.velocityY > 2000) {
                                    frameTransY.value = withTiming(0, { duration: 150 })
                                }
                                else {
                                    frameTransY.value = frameTransY.value - e.changeY

                                }



                            }

                        })
                        .onEnd((e) => {
                            if (frameTransY.value > screenHeight - headHeight) {
                                frameTransY.value = withTiming(screenHeight - headHeight, { duration: 100 })
                            }
                            else if (frameTransY.value < 160) {
                                frameTransY.value = withTiming(0, { duration: 100 })
                            }
                        })
                        .onFinalize(e => {
                            isOnBar.value = false
                            isCardMoving.value = false
                        }),
                    //  .activeOffsetY([-10, 10]),
                    Gesture.Tap().numberOfTaps(2).onEnd((e) => {

                        if (frameTransY.value == screenHeight - headHeight - 80) {
                            frameTransY.value = withTiming(screenHeight / 2 + 80)
                        }
                        else {
                            frameTransY.value = withTiming(screenHeight - headHeight - 80)
                        }

                    }),



                    Gesture.LongPress()
                        .onStart((e) => {
                            !isDownloaded.value && runOnJS(downloadWord)(sourceWord.wordName, sourceWord.wordName)
                        }),


                )}

            >
                <View style={[barStyle]}>
                    <Icon
                        name="reorder-two-outline" type='ionicon' color="rgba(168, 155, 147, 1)"
                        containerStyle={{
                            width: 40, height: 40,

                            opacity: 0.5,
                            transform: [{ translateX: 8 }, { translateY: 0 }], alignItems: "center", justifyContent: "center"
                        }}
                        size={40}
                    />
                    <Icon
                        name="reorder-two-outline" type='ionicon' color="rgba(168, 155, 147, 1)"
                        containerStyle={{
                            width: 40, height: 40,

                            opacity: 0.5,
                            transform: [{ translateX: -8 }, { translateY: 0 }], alignItems: "center", justifyContent: "center"
                        }}
                        size={40}
                    />

                </View>
            </GestureDetector> */}

            {/* <View style={useAnimatedStyle(() => {
                return {
                    width: screenWidth,
                    height: 80,
                    backgroundColor: "#faa",
                    position: "absolute",
                        transform:[{translateY:-(screenHeight-frameTransY.value)+80+80+80+80+5-6    }],
                    top: 0,
                    left: 0,

                    zIndex: 300,
                }
            })}></View> */}

            <ContentBlock visibleCard={visibleCard} index={index} wordRowHeight={wordRowHeight} meaningRowHeight={meaningRowHeight}>

                <Text style={{ fontSize: 27, color: "#a75d09" }}>

                    {sourceWord.wordName}
                </Text>
            </ContentBlock>

            <ContentBlock visibleCard={visibleCard} index={index} shouldCheckDownload={false} wordRowHeight={wordRowHeight} meaningRowHeight={meaningRowHeight}>

                <Text style={{ fontSize: 20, color: "#555" }}>

                    {sourceWord.meaning}
                </Text>
            </ContentBlock>

            {sourceWord.exampleEnglishArr.map((item, arrIndex) => {

                return (
                    <View key={arrIndex}>
                        <SentenceBlock visibleCard={visibleCard} index={index} arrIndex={arrIndex} wordRowHeight={wordRowHeight} meaningRowHeight={meaningRowHeight} >
                            <Text style={{ fontSize: 25, color: "#333" }}>

                                {item.sentence}
                            </Text>
                        </SentenceBlock>
                        <SentenceBlock visibleCard={visibleCard} index={index} arrIndex={arrIndex} shouldCheckDownload={false} wordRowHeight={wordRowHeight} meaningRowHeight={meaningRowHeight}>
                            <Text style={{ fontSize: 25, color: "#333" }}>
                                {sourceWord.exampleChineseArr[arrIndex].sentence}
                            </Text>
                        </SentenceBlock>
                    </View>
                )
            })}




            {/* <View style={{ width: 200, height: 50 }}>
                <ScrollView style={{ backgroundColor: 'pink', }}>
                    <Text>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                        minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                        aliquip ex ea commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                        culpa qui officia deserunt mollit anim id est laborum.
                    </Text>
                </ScrollView>
            </View> */}


        </View >


    )
}


function ContentBlock({ index, children, visibleCard, shouldCheckDownload = true, wordRowHeight, meaningRowHeight, ...props }) {

    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, refreshState, isScrollingY, isScrollingX, stopSpeak, autoPlay,
        scrollRef2Scroll, wordPos, isListPlaying, scrollY, scrollX,

    } = useContext(Context)
    const sourceWord = sourceWordArr[index]



    const isDownloaded = useSharedValue(false || (!shouldCheckDownload))
    const contentPainText = children.props.children
    //console.log(contentPainText)

    const shouldShowBlock = useSharedValue((index * 80 - (scrollY.value + (screenHeight - headHeight - frameTransY.value)) <= -70) && (index * 80 - (scrollY.value + (screenHeight - headHeight - frameTransY.value)) >= -90))
    useDerivedValue(() => {

        const extendedY = scrollY.value + (screenHeight - headHeight - frameTransY.value)

        // console.log(index * 80, extendedY, index * 80 - extendedY, (index * 80 - extendedY <= -70) && (index * 80 - extendedY >= -90))


        if ((index * 80 - extendedY <= -70) && (index * 80 - extendedY >= -90)) {
            shouldShowBlock.value = false
        }

        else {
            shouldShowBlock.value = true
        }

console.log("shouldShowBlock",shouldShowBlock.value)

    }, [scrollY.value, frameTransY.value])



    useEffect(() => {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.wordName).toString()

        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
        })
    }, [visibleCard.current, refreshState])

    const [shouldFramePanning, setShouldFramePanning] = useState(true)
    const contentLength = useSharedValue(160)

    const blockStyle = useAnimatedStyle(() => {

        const isOnFirst = frameTransY.value === screenHeight - (headHeight + 80)
        const isOnTop = frameTransY.value === screenHeight - headHeight
        const shouldContentScroll = contentLength.value > 160


        return {
            //   display: shouldShowBlock.value ? "contents" : "none",
            width: screenWidth,
            height: shouldShowBlock.value
                ? isOnFirst
                    ? 0
                    : "auto"
                : 0,
            minHeight: 0,
            //minHeight: isOnFirst ? (0) : (0),
            maxHeight: 160,


            //      height: frameTransY.value === screenHeight - headHeight - 80 ? 0 : "auto"
            paddingHorizontal: 0,
            paddingBottom: 0,

            margin: 0,

            borderWidth: 0,

            borderTopWidth: shouldCheckDownload ? 2 : 0,
            borderTopColor: (frameTransY.value === screenHeight - headHeight - 80) //|| (frameTransY.value === screenHeight - headHeight)
                ? "wheat"
                : isListPlaying.value ? "lightgreen" : "wheat",

            backgroundColor: isDownloaded.value
                ? "wheat"//"#FCD19D"
                : "#D6BD95",

            // backgroundColor:
            //     shouldContentScroll
            //         ? isDownloaded.value
            //             ? "#FCD19D"
            //             : "#D6BD95"
            //         : isDownloaded.value
            //             ? "wheat"
            //             : "#DCC7A9"
        }
    })

    const num = Math.random() * 5 + 1

    const arr = new Array(Math.floor(num)).fill(contentPainText).map((item, itemIndex) => { return item + " " + itemIndex })
    return (

        <GestureDetector
            gesture={Gesture.Simultaneous(
                Gesture.Pan()
                    .onBegin(() => {
                        console.log(isScrollingY.value, isScrollingX.value)
                    })
                    .onStart(e => {
                        isCardMoving.value = true

                    })
                    .onChange(e => {

                        if ((!isScrollingY.value) && (!isScrollingX.value)) {
                            frameTransY.value = frameTransY.value - e.changeY
                        }

                    })
                    .onEnd((e) => {
                        if (frameTransY.value > screenHeight - headHeight) {
                            frameTransY.value = withTiming(screenHeight - headHeight, { duration: 100 })
                        }
                        else if (frameTransY.value < 160) {
                            frameTransY.value = withTiming(0, { duration: 100 })
                        }
                    })
                    .onFinalize(e => {
                        isCardMoving.value = false
                    })
                    .activeOffsetY([-10, 10])
                    .enabled(shouldFramePanning),



                Gesture.LongPress()
                    .onStart((e) => {
                        !isDownloaded.value && runOnJS(downloadWord)(sourceWord.wordName, shouldCheckDownload ? contentPainText : sourceWord.wordName)
                    }),

                Gesture.Tap().numberOfTaps(2)

                    //.maxDelay(2000)
                    .onFinalize(e => {

                    })
                    .onTouchesDown((e) => {

                    })
                    .onTouchesUp((e) => {

                    })

                    .onEnd((e) => {

                        isListPlaying.value = !isListPlaying.value
                        if (isListPlaying.value) {

                            wordPos.value = index

                            runOnJS(autoPlay)()





                        }
                        else {


                            runOnJS(stopSpeak)()






                        }
                    }),



            )}

        ><View style={[blockStyle]} >




                <LinearGradient
                    // colors={["rgba(255, 179, 80, 0)", 'rgba(255, 179, 80, 0.8)', 'rgba(255, 155, 133, 1)',]}
                    colors={["transparent", shouldFramePanning ? "transparent" : 'rgba(80,80,80,0.3)',]}
                    dither={true}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0, 0.8]}
                    //Example:  
                    // colors={[red', 'green']}
                    // locations={[0.3,0.4]}  // full red 30% of width   //mixed red-and-green (40% - 30% = 10%) of width     // full green  100% - 40% = 60% of width
                    //                        // ______red = 30%______   ___mixed = 10%___   _________green = 60%__________________     
                    style={{
                        width: screenWidth,

                    }}
                >
                    <ScrollView
                        contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 4 }}

                        onLayout={e => {


                            if (shouldCheckDownload) {
                                wordRowHeight.value = e.nativeEvent.layout.height
                            }
                            else {
                                meaningRowHeight.value = e.nativeEvent.layout.height
                            }

                        }}

                        onContentSizeChange={(w, h) => {
                            contentLength.value = h



                            if (h > 160) {
                                setShouldFramePanning(false)
                            }
                            else {
                                setShouldFramePanning(true)
                            }
                        }}
                        scrollEnabled={!shouldFramePanning}
                    >
                        {/* {arr.map(item => {
                            return children
                        })}
                        <Text>{arr.length}</Text> */}
                        {children}
                    </ScrollView>
                </LinearGradient>
            </View>
        </GestureDetector>


    )




}




function SentenceBlock_({ index, arrIndex, children, visibleCard, shouldCheckDownload = true, wordRowHeight, meaningRowHeight, ...props }) {

    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, refreshState, isScrollingY, isScrollingX, speak, isListPlaying } = useContext(Context)
    const sourceWord = sourceWordArr[index]



    const isDownloaded = useSharedValue(false || (!shouldCheckDownload))
    const contentPainText = children.props.children
    //console.log(contentPainText)




    useEffect(() => {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()

        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
        })
    }, [visibleCard.current, refreshState])




    const [shouldFramePanning, setShouldFramePanning] = useState(true)
    const isContentOverSize = useSharedValue(false)

    const contentLength = useSharedValue(160)
    const maxHeight = useSharedValue(80)
    const availableHeight = useSharedValue(frameTransY.value - 20 - wordRowHeight.value - meaningRowHeight.value)




    useDerivedValue(() => {
        availableHeight.value = frameTransY.value - 20 - wordRowHeight.value - meaningRowHeight.value

        maxHeight.value = availableHeight.value / (2 * sourceWord.exampleEnglishArr.length)
        isContentOverSize.value = (maxHeight.value - contentLength.value) < 0


        // if (contentLength.value > maxHeight.value) {
        //     shouldFramePanning && runOnJS(setShouldFramePanning)(false)
        // }
        // else {
        //     !shouldFramePanning && runOnJS(setShouldFramePanning)(true)
        // }

    }, [contentLength.value, wordRowHeight.value, meaningRowHeight.value, frameTransY.value])




    const blockStyle = useAnimatedStyle(() => {




        return {
            width: screenWidth,
            height: "auto",

            minHeight: 0,

            maxHeight: maxHeight.value,//availableHeight.value / (2 * sourceWord.exampleEnglishArr.length),


            paddingBottom: 0,

            margin: 0,
            borderWidth: 0,
            backgroundColor:
                isDownloaded.value
                    ? "wheat"//"#FCD19D"
                    : "#D6BD95",

            backgroundColor:
                isContentOverSize.value
                    ? "pink"//"#FCD19D"
                    : "lightgreen",

        }
    })
    const num = Math.random() * 5 + 1

    let arr = useRef(new Array(Math.floor(num)).fill(contentPainText).map((item, itemIndex) => { return item + " " + itemIndex }))

    return (

        <GestureDetector
            gesture={Gesture.Simultaneous(
                Gesture.Pan()
                    .onStart(e => {
                        isCardMoving.value = true

                    })
                    .onChange(e => {

                        if ((!isScrollingY.value) && (!isScrollingX.value) && (!isContentOverSize.value)) {
                            frameTransY.value = frameTransY.value - e.changeY
                        }

                    })
                    .onEnd((e) => {
                        if (frameTransY.value > screenHeight - headHeight) {
                            frameTransY.value = withTiming(screenHeight - headHeight, { duration: 100 })
                        }
                        else if (frameTransY.value < 160) {
                            frameTransY.value = withTiming(0, { duration: 100 })
                        }
                    })
                    .onFinalize(e => {
                        isCardMoving.value = false
                    })
                    .activeOffsetY([-10, 10]),
                //.enabled(!isContentOverSize.value),
                //.enabled(shouldFramePanning),



                Gesture.LongPress()
                    .onStart((e) => {
                        !isDownloaded.value && runOnJS(downloadWord)(sourceWord.wordName, shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence)
                    }),
                Gesture.Tap()
                    .onStart(e => {
                        //console.log(e.absoluteX)
                        if (!isListPlaying.value) {
                            runOnJS(speak)(sourceWord.wordName, contentPainText)
                        }

                    })

            )}

        >
            <View style={[blockStyle]}>
                {/* <LinearGradient

                    colors={["transparent", shouldFramePanning ? "transparent" : 'rgba(80,80,80,0.2)',]}



                    dither={true}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0.3, 0.8]}

                    style={{
                        width: screenWidth,
                        position:"absolute"
                    }}
                > </LinearGradient> */}
                <ScrollView
                    contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 4 }}
                    onContentSizeChange={(w, h) => {
                        "worklet";
                        contentLength.value = h

                    }}
                // scrollEnabled={!shouldFramePanning}
                >
                    <View>
                        {/* {arr.current.map(item => { return children })}
                        <Text>{arr.current.length}</Text> */}
                        {children}{children}{children}{children}{children}{children}{children}{children}
                    </View>
                </ScrollView>

            </View>
        </GestureDetector>


    )




}


function SentenceBlock({ index, arrIndex, children, visibleCard, shouldCheckDownload = true, wordRowHeight, meaningRowHeight, ...props }) {

    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, refreshState, isScrollingY, isScrollingX, speak, isListPlaying } = useContext(Context)
    const sourceWord = sourceWordArr[index]



    const isDownloaded = useSharedValue(false || (!shouldCheckDownload))
    const contentPainText = children.props.children
    //console.log(contentPainText)




    useEffect(() => {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()

        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
        })
    }, [visibleCard.current, refreshState])


    const contentLength = useSharedValue(160)
    const maxHeight = useSharedValue(80)
    const availableHeight = useSharedValue(frameTransY.value - 20 - wordRowHeight.value - meaningRowHeight.value)
    const isScrollViewOverSized = useSharedValue(contentLength.value - maxHeight.value > 4)

    useDerivedValue(() => {
        availableHeight.value = frameTransY.value - 20 - wordRowHeight.value - meaningRowHeight.value
        // console.log(sourceWord.wordName, "availableHeight", availableHeight.value)
        maxHeight.value = availableHeight.value / (2 * sourceWord.exampleEnglishArr.length)


        if (contentLength.value - maxHeight.value > 4) {
            isScrollViewOverSized.value = true

        }
        else {
            isScrollViewOverSized.value = false

        }

    }, [contentLength.value, wordRowHeight.value, meaningRowHeight.value, frameTransY.value

    ])




    const blockStyle = useAnimatedStyle(() => {




        return {
            width: screenWidth,
            height: "auto",

            minHeight: 0,

            maxHeight: maxHeight.value,//availableHeight.value / (2 * sourceWord.exampleEnglishArr.length),


            paddingBottom: 0,

            margin: 0,
            borderWidth: 0,
            backgroundColor:
                isDownloaded.value
                    ? "wheat"//"#FCD19D"
                    : "#D6BD95",

        }
    })
    const num = Math.random() * 5 + 1

    let arr = useRef(new Array(Math.floor(num)).fill(contentPainText).map((item, itemIndex) => { return item + " " + itemIndex }))

    const scrollViewHeight = useSharedValue("auto")

    return (<>



        <View style={[blockStyle]}>


            <GestureDetector
                gesture={Gesture.Simultaneous(
                    Gesture.Pan()
                        .onStart(e => {
                            isCardMoving.value = true

                        })
                        .onChange(e => {

                            if ((!isScrollingY.value) && (!isScrollingX.value)) {
                                frameTransY.value = frameTransY.value - e.changeY
                            }

                        })
                        .onEnd((e) => {
                            if (frameTransY.value > screenHeight - headHeight) {
                                frameTransY.value = withTiming(screenHeight - headHeight, { duration: 100 })
                            }
                            else if (frameTransY.value < 160) {
                                frameTransY.value = withTiming(0, { duration: 100 })
                            }
                        })
                        .onFinalize(e => {
                            isCardMoving.value = false
                        })
                        .enabled(true)

                        .activeOffsetY([-10, 10]),
                    // .enabled(!isScrollViewOverSized.value),



                    Gesture.LongPress()
                        .onStart((e) => {
                            !isDownloaded.value && runOnJS(downloadWord)(sourceWord.wordName, shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence)
                        }),
                    Gesture.Tap()
                        .onStart(e => {
                            console.log(e.absoluteX)
                            if (!isListPlaying.value) {
                                runOnJS(speak)(sourceWord.wordName, contentPainText)
                            }

                        })

                )}

            >
                <View
                    style={useAnimatedStyle(() => {

                        return {
                            width: screenWidth, height: scrollViewHeight.value,
                            // height:  isScrollViewOverSized.value ?0:scrollViewHeight.value,
                            position: "absolute",
                            opacity: isScrollViewOverSized.value ? 0 : 1,
                            backgroundColor: "transparent",//"pink",
                            paddingHorizontal: 4,
                            zIndex: isScrollViewOverSized.value ? -100 : 100,
                            // position: isScrollViewOverSized.value ? "absolute" : "relative",
                            // zIndex:300

                        }

                    })}
                >
                    {/* {arr.current.map(item => { return children })}
                    <Text textBreakStrategy={"simple"} style={{color:"red",fontSize:20}}>{arr.current.length}</Text> */}
                    {children}{children}{children}
                </View>
            </GestureDetector>





            <LinearGradient

                colors={["transparent", 'rgba(80,80,80,0.2)',]}
                dither={true}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                locations={[0.3, 0.8]}
                style={{ position: "absolute" }}


            >

                <View style={useAnimatedStyle(() => {

                    return {
                        width: screenWidth,
                        height: isScrollViewOverSized.value ? scrollViewHeight.value : 0,

                    }

                })} />


            </LinearGradient>
            <ScrollView
                style={useAnimatedStyle(() => {

                    return {
                        //  width: screenWidth,
                        //  height: isScrollViewOverSized.value ? scrollViewHeight.value : 0,
                        //opacity: 1
                        // position: isScrollViewOverSized.value ?"relative":"absolute"
                        //display:isScrollViewOverSized.value ?"contents":"none"

                        transform: [{ scale: isScrollViewOverSized.value ? 1 : 0 }]
                    }

                })}
                contentContainerStyle={{ paddingBottom: 4, backgroundColor: "transparent" }}
                onContentSizeChange={(w, h) => {
                    "worklet";
                    contentLength.value = h

                }}
                scrollEnabled={true}
                onLayout={(e) => {
                    scrollViewHeight.value = e.nativeEvent.layout.height
                }}
            //scrollEnabled={!shouldFramePanning}
            >


                <GestureDetector
                    gesture={Gesture.Simultaneous(



                        Gesture.LongPress()
                            .onStart((e) => {
                                !isDownloaded.value && runOnJS(downloadWord)(sourceWord.wordName, shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence)
                            }),
                        Gesture.Tap()
                            .onStart(e => {
                                console.log(e.absoluteX)
                                if (!isListPlaying.value) {
                                    runOnJS(speak)(sourceWord.wordName, contentPainText)
                                }

                            })

                    )}

                >
                    <View
                        style={useAnimatedStyle(() => {

                            return {
                                paddingHorizontal: 4,
                                width: screenWidth,

                            }

                        })}
                    >
                        {/* {arr.current.map(item => { return children })}
                    <Text>{arr.current.length}</Text> */}
                        {children}{children}{children}
                    </View>
                </GestureDetector>
            </ScrollView>
        </View>


    </>)




}








function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
+
    function SentenceBlock1({ index, arrIndex, children, visibleCard, shouldCheckDownload = true, wordRowHeight, meaningRowHeight, ...props }) {

        const { sourceWordArr, frameTransY, isCardMoving, downloadWord, refreshState, isScrollingY, isScrollingX, speak, isListPlaying } = useContext(Context)
        const sourceWord = sourceWordArr[index]



        const isDownloaded = useSharedValue(false || (!shouldCheckDownload))
        const contentPainText = children.props.children
        //console.log(contentPainText)




        useEffect(() => {
            const hashName1 = CryptoJS(sourceWord.wordName).toString()
            const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()

            FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
                const { exists, isDirectory, size, uri } = item
                isDownloaded.value = exists
            })
        }, [visibleCard.current, refreshState])




        const [shouldFramePanning, setShouldFramePanning_] = useState(true)

        const setShouldFramePanning = useThrottledCallback((should) => {


            setShouldFramePanning_(should)


        }, 100, { leading: true, trailing: true })





        const contentLength = useSharedValue(160)
        const maxHeight = useSharedValue(80)
        const availableHeight = useSharedValue(frameTransY.value - 20 - wordRowHeight.value - meaningRowHeight.value)
        useDerivedValue(() => {
            availableHeight.value = frameTransY.value - 20 - wordRowHeight.value - meaningRowHeight.value
            // console.log(sourceWord.wordName, "availableHeight", availableHeight.value)
            maxHeight.value = availableHeight.value / (2 * sourceWord.exampleEnglishArr.length)


            if (contentLength.value - maxHeight.value > 4) {
                runOnJS(setShouldFramePanning)(false)
            }
            else {
                runOnJS(setShouldFramePanning)(true)
            }

        }, [contentLength.value, wordRowHeight.value, meaningRowHeight.value, frameTransY.value])




        const blockStyle = useAnimatedStyle(() => {




            return {
                width: screenWidth,
                height: "auto",

                minHeight: 0,

                maxHeight: maxHeight.value,//availableHeight.value / (2 * sourceWord.exampleEnglishArr.length),


                paddingBottom: 0,

                margin: 0,
                borderWidth: 0,
                backgroundColor:
                    isDownloaded.value
                        ? "wheat"//"#FCD19D"
                        : "#D6BD95",

            }
        })
        const num = Math.random() * 5 + 1

        let arr = useRef(new Array(Math.floor(num)).fill(contentPainText).map((item, itemIndex) => { return item + " " + itemIndex }))

        return (

            <GestureDetector
                gesture={Gesture.Simultaneous(
                    Gesture.Pan()
                        .onStart(e => {
                            isCardMoving.value = true

                        })
                        .onChange(e => {

                            if ((!isScrollingY.value) && (!isScrollingX.value)) {
                                frameTransY.value = frameTransY.value - e.changeY
                            }

                        })
                        .onEnd((e) => {
                            if (frameTransY.value > screenHeight - headHeight) {
                                frameTransY.value = withTiming(screenHeight - headHeight, { duration: 100 })
                            }
                            else if (frameTransY.value < 160) {
                                frameTransY.value = withTiming(0, { duration: 100 })
                            }
                        })
                        .onFinalize(e => {
                            isCardMoving.value = false
                        })
                        .activeOffsetY([-10, 10])
                        .enabled(shouldFramePanning),



                    Gesture.LongPress()
                        .onStart((e) => {
                            !isDownloaded.value && runOnJS(downloadWord)(sourceWord.wordName, shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence)
                        }),
                    Gesture.Tap()
                        .onStart(e => {
                            //console.log(e.absoluteX)
                            if (!isListPlaying.value) {
                                runOnJS(speak)(sourceWord.wordName, contentPainText)
                            }

                        })

                )}

            >
                <View style={[blockStyle]}>
                    <LinearGradient

                        colors={["transparent", shouldFramePanning ? "transparent" : 'rgba(80,80,80,0.2)',]}



                        dither={true}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        locations={[0.3, 0.8]}
                        //Example:  
                        // colors={[red', 'green']}
                        // locations={[0.3,0.4]}  // full red 30% of width   //mixed red-and-green (40% - 30% = 10%) of width     // full green  100% - 40% = 60% of width
                        //                        // ______red = 30%______   ___mixed = 10%___   _________green = 60%__________________     
                        style={{
                            width: screenWidth,
                        }}
                    >
                        <ScrollView
                            contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 4 }}
                            onContentSizeChange={(w, h) => {
                                "worklet";
                                contentLength.value = h

                            }}
                            scrollEnabled={!shouldFramePanning}
                        >
                            <View>
                                {arr.current.map(item => { return children })}
                                <Text>{arr.current.length}</Text>
                                {/* {children}{children}{children}{children}{children}{children}{children}{children} */}
                            </View>
                        </ScrollView>
                    </LinearGradient>
                </View>
            </GestureDetector>


        )




    }

function SentenceBlock0({ index, arrIndex, children, visibleCard, shouldCheckDownload = true, wordRowHeight, meaningRowHeight, ...props }) {

    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, refreshState, isScrollingY, isScrollingX, speak, isListPlaying } = useContext(Context)
    const sourceWord = sourceWordArr[index]



    const isDownloaded = useSharedValue(false || (!shouldCheckDownload))
    const contentPainText = children.props.children
    //console.log(contentPainText)




    useEffect(() => {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()

        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
        })
    }, [visibleCard.current, refreshState])




    const [shouldFramePanning, setShouldFramePanning] = useState(true)
    const contentLength = useSharedValue(160)
    const maxHeight = useSharedValue(80)
    const availableHeight = useSharedValue(frameTransY.value - 20 - wordRowHeight.value - meaningRowHeight.value)
    useDerivedValue(() => {
        availableHeight.value = frameTransY.value - 20 - wordRowHeight.value - meaningRowHeight.value
        // console.log(sourceWord.wordName, "availableHeight", availableHeight.value)
        maxHeight.value = availableHeight.value / (2 * sourceWord.exampleEnglishArr.length)


        if (contentLength.value > maxHeight.value) {
            shouldFramePanning && runOnJS(setShouldFramePanning)(false)
        }
        else {
            !shouldFramePanning && runOnJS(setShouldFramePanning)(true)
        }

    }, [contentLength.value, wordRowHeight.value, meaningRowHeight.value, frameTransY.value])




    const blockStyle = useAnimatedStyle(() => {




        return {
            width: screenWidth,
            height: "auto",

            minHeight: 0,

            maxHeight: maxHeight.value,//availableHeight.value / (2 * sourceWord.exampleEnglishArr.length),


            paddingBottom: 0,

            margin: 0,
            borderWidth: 0,
            backgroundColor:
                isDownloaded.value
                    ? "wheat"//"#FCD19D"
                    : "#D6BD95",

        }
    })
    const num = Math.random() * 5 + 1

    let arr = useRef(new Array(Math.floor(num)).fill(contentPainText).map((item, itemIndex) => { return item + " " + itemIndex }))

    return (

        <GestureDetector
            gesture={Gesture.Simultaneous(
                Gesture.Pan()
                    .onStart(e => {
                        isCardMoving.value = true

                    })
                    .onChange(e => {

                        if ((!isScrollingY.value) && (!isScrollingX.value)) {
                            frameTransY.value = frameTransY.value - e.changeY
                        }

                    })
                    .onEnd((e) => {
                        if (frameTransY.value > screenHeight - headHeight - 80) {
                            frameTransY.value = withTiming(screenHeight - headHeight, { duration: 100 })
                        }
                        else if (frameTransY.value < 160) {
                            frameTransY.value = withTiming(0, { duration: 100 })
                        }
                    })
                    .onFinalize(e => {
                        isCardMoving.value = false
                    })
                    .activeOffsetY([-10, 10])
                    .enabled(shouldFramePanning),



                Gesture.LongPress()
                    .onStart((e) => {
                        !isDownloaded.value && runOnJS(downloadWord)(sourceWord.wordName, shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence)
                    }),
                Gesture.Tap()
                    .onStart(e => {
                        //console.log(e.absoluteX)
                        if (!isListPlaying.value) {
                            runOnJS(speak)(sourceWord.wordName, contentPainText)
                        }

                    })

            )}

        >
            <View style={[blockStyle]}>
                <LinearGradient

                    colors={["transparent", shouldFramePanning ? "transparent" : 'rgba(80,80,80,0.2)',]}



                    dither={true}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    locations={[0.3, 0.8]}
                    //Example:  
                    // colors={[red', 'green']}
                    // locations={[0.3,0.4]}  // full red 30% of width   //mixed red-and-green (40% - 30% = 10%) of width     // full green  100% - 40% = 60% of width
                    //                        // ______red = 30%______   ___mixed = 10%___   _________green = 60%__________________     
                    style={{
                        width: screenWidth,
                    }}
                >
                    <ScrollView
                        contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 4 }}
                        onContentSizeChange={(w, h) => {
                            "worklet";
                            contentLength.value = h

                        }}
                        scrollEnabled={!shouldFramePanning}
                    >
                        <View>
                            {arr.current.map(item => { return children })}
                            <Text>{arr.current.length}</Text>
                            {/* {children}{children}{children}{children}{children}{children}{children}{children} */}
                        </View>
                    </ScrollView>
                </LinearGradient>
            </View>
        </GestureDetector>


    )




}

