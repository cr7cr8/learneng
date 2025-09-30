import React, { memo, useCallback, useMemo, useTransition, createContext } from 'react';
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
    withRepeat,
    runOnUI,
    withDecay

} from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { FadeIn, FadeOut, BounceIn, BounceOut, SlideOutUp } from 'react-native-reanimated';
const { View, Text, FlatList, ScrollView } = ReAnimated

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
import * as Speech from 'expo-speech';

export const CardContext = createContext()

export default function Card(props, dim) {

    const { index, type, visibleCard, cardObj } = props

    const { sourceWordArr, frameTransY, shouldFrameDisplay, scrollRef2, isCardMoving, isScrollingY, isScrollingX, isListPlaying, speak, scrollX,
        downloadWord, refreshState, wordPos } = useContext(Context)
    const sourceWord = sourceWordArr[index]

    const isDownloaded = useSharedValue(false)



    const wordRowHeight = useSharedValue(0)
    const meaningRowHeight = useSharedValue(0)
    const meaningRowHeight_ = useSharedValue(0)

    useDerivedValue(() => {
        meaningRowHeight_.value = meaningRowHeight.value
        //   console.log("row height", index, sourceWord.wordName, wordRowHeight.value, meaningRowHeight.value)

    }, [wordRowHeight.value, meaningRowHeight.value])



    useEffect(() => {
        const hashName = CryptoJS(sourceWord.wordName).toString();
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName + hashName}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
            // console.log("===", sourceWord.wordName, refreshState, exists)
        })
    }, [visibleCard, refreshState])


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



    return (
        <CardContext.Provider value={{ meaningRowHeight_ }}>
            <View style={[cardStyle]}>


                <WordBlock visibleCard={visibleCard} index={index} wordRowHeight={wordRowHeight} meaningRowHeight={meaningRowHeight} meaningRowHeight_={meaningRowHeight_}>

                    <Text style={{ fontSize: 27, color: "#a75d09" }}>

                        {sourceWord.wordName}
                    </Text>
                </WordBlock>

                <WordBlock visibleCard={visibleCard} index={index} shouldCheckDownload={false}
                    wordRowHeight={wordRowHeight} meaningRowHeight={meaningRowHeight} meaningRowHeight_={meaningRowHeight_}>

                    <Text style={{ fontSize: 20, color: "#555" }}>

                        {sourceWord.meaning}
                    </Text>
                </WordBlock>


                {/* <GestureDetector gesture={Gesture.Pan().onChange(e => {

                    frameTransY.value = frameTransY.value - e.changeY
                })}>
                    <View> */}
                <SentenceArea index={index} sourceWord={sourceWord} visibleCard={visibleCard} wordRowHeight={wordRowHeight} meaningRowHeight={meaningRowHeight} />



                <GestureDetector gesture={Gesture.Simultaneous(

                    Gesture.Pan()
                        .onBegin(() => {
                            //   console.log(isScrollingY.value, isScrollingX.value)
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


                            if (isScrollingY.value || isScrollingX.value || Math.abs(e.velocityY) < 1000) {
                                if (frameTransY.value > screenHeight - headHeight) {
                                    frameTransY.value = withTiming(screenHeight - headHeight, { duration: 100 }, () => {
                                        isCardMoving.value = false
                                    })
                                }
                                else if (frameTransY.value < 160) {
                                    frameTransY.value = withTiming(0, { duration: 100 }, () => {
                                        isCardMoving.value = false
                                    })
                                }
                                else {
                                    isCardMoving.value = false
                                }
                                return
                            }



                            frameTransY.value = withDecay({
                                velocity: -e.velocityY,
                                velocityFactor: e.velocityY <= 0 ? 2 : 2,
                                deceleration: e.velocityY <= 0 ? 1 : 1,
                                rubberBandEffect: e.velocityY <= 0,
                                rubberBandFactor: 1,
                                clamp: [0, screenHeight - headHeight]
                            }, () => {
                                if (frameTransY.value > screenHeight - headHeight) {

                                    isCardMoving.value = false
                                }
                                else if (frameTransY.value < 160) {
                                    frameTransY.value = withTiming(0, { duration: 100 }, () => {
                                        isCardMoving.value = false
                                    })
                                }
                                else {
                                    isCardMoving.value = false
                                }

                            })



                        })
                        .onFinalize(e => {
                            // isCardMoving.value = false
                        })
                        .activeOffsetY([-10, 10]))} >
                    <View style={useAnimatedStyle(() => {
                        return {
                            // display: "flex",
                            // width: screenWidth,
                            // height: 80,
                            flex: 99999,
                            backgroundColor: "rgba(123,36,251,0.3)"
                        }
                    })} />
                </GestureDetector>

                {/* </View>
                </GestureDetector> */}

                {/* {sourceWord.exampleEnglishArr.map((item, arrIndex) => {

                    return (
                        <View key={arrIndex}>
                            <SentenceBlock visibleCard={visibleCard} index={index} arrIndex={arrIndex} shouldCheckDownload={true} wordRowHeight={wordRowHeight} meaningRowHeight={meaningRowHeight} >
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
                })} */}

            </View >

        </CardContext.Provider>
    )
}

function WordBlock({ index, children, visibleCard, shouldCheckDownload = true, wordRowHeight, meaningRowHeight,

    ...props }) {

    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, deleteDownloadWord, refreshState, isScrollingY, isScrollingX, stopSpeak, autoPlay,
        scrollRef2Scroll, wordPos, isListPlaying, scrollY, scrollX, speak, checkPlaying

    } = useContext(Context)
    const { meaningRowHeight_ } = useContext(CardContext)


    const sourceWord = sourceWordArr[index]



    const isDownloaded = useSharedValue(false || (!shouldCheckDownload))
    const contentPainText = children.props.children
    //console.log(contentPainText) 





    useEffect(() => {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.wordName).toString()

        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
        })
    }, [visibleCard, refreshState])

    const [shouldFramePanning, setShouldFramePanning] = useState(true)
    const contentLength = useSharedValue(160)


    const blockStyle = useAnimatedStyle(() => {

        const isOnFirst = frameTransY.value === screenHeight - (headHeight + 80)
        const isOnTop = frameTransY.value === screenHeight - headHeight
        const shouldContentScroll = contentLength.value > 160


        return {

            width: screenWidth,
            // height: shouldHideWordBlock.value?0:"auto",
            height: "auto",
            // height: isListPlaying.value
            //     ? "auto"
            //     : shouldShowBlock.value
            //         ? "auto"
            //         : 0,

            // height: shouldShowBlock.value
            //     ? isOnFirst
            //         ? 0
            //         : "auto"
            //     : 0,


            minHeight: 0,
            //minHeight: isOnFirst ? (0) : (0),
            maxHeight: 160,


            //      height: frameTransY.value === screenHeight - headHeight - 80 ? 0 : "auto"
            paddingHorizontal: 0,
            paddingBottom: 0,

            margin: 0,

            borderWidth: 0,

            borderTopWidth: shouldCheckDownload ? 2 : 0,
            // borderTopColor: (frameTransY.value === screenHeight - headHeight - 80) //|| (frameTransY.value === screenHeight - headHeight)
            //     ? "wheat"
            //     : isListPlaying.value ? "lightgreen" : "wheat",

            borderTopColor: isListPlaying.value ? "lightgreen" : "wheat",

            // backgroundColor: isDownloaded.value
            //     ? "wheat"//"#FCD19D"
            //     : "#DFC98A",//"#D6BD95",

            backgroundColor: isDownloaded.value ? "wheat" : "#e7cca0",//"rgba(214, 189, 149, 0.5)",

            zIndex: shouldCheckDownload ? 200 : 100


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

    const delayStopSpeak = () => {
        isListPlaying.value = false
        stopSpeak()
    }

    function togglePlayingAsync() {
        //   console.log("check playing...")
        checkPlaying().then(([res1, res2]) => {
            //      console.log(res1,res2)
            if (res1 || res2) {
                console.log("to stop toggleplay")
                stopSpeak()
                // Speech.stop()
                // audioPlayer.pause()
            }
            else {
                shouldCheckDownload && speak(sourceWord.wordName, sourceWord.wordName)
                !shouldCheckDownload && speak(sourceWord.meaningSound, sourceWord.meaningSound)
            }
        })
    }
    const navigation = useNavigation()



    function goToSentenceSettingScreen(mainPage = false) {
        if (mainPage) {

            navigation.navigate("SentenceSettingScreen", { wordPos: index })

            return
        }

        const obj = { wordPos: index, sentencePos: -1 }

        // navigation.preload("SentenceSettingScreen", obj)
        // setTimeout(() => {
        navigation.navigate("SentenceSettingScreen", obj)
        // }, sourceWord.exampleEnglishArr.length*10);



    }


    return (

        <GestureDetector
            gesture={Gesture.Exclusive(

                Gesture.Pan()
                    .onBegin(() => {
                        //   console.log(isScrollingY.value, isScrollingX.value)
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
                        console.log("velocity", e.velocityY)
                        if (isScrollingY.value || isScrollingX.value || Math.abs(e.velocityY) < 1000) {
                            if (frameTransY.value > screenHeight - headHeight) {
                                frameTransY.value = withTiming(screenHeight - headHeight, { duration: 100 }, () => {
                                    isCardMoving.value = false
                                })
                            }
                            else if (frameTransY.value < 160) {
                                frameTransY.value = withTiming(0, { duration: 100 }, () => {
                                    isCardMoving.value = false
                                })
                            }
                            else {
                                isCardMoving.value = false
                            }
                            return
                        }



                        frameTransY.value = withDecay({
                            velocity: -e.velocityY,
                            velocityFactor: e.velocityY <= 0 ? 2 : 2,
                            deceleration: e.velocityY <= 0 ? 1 : 1,
                            rubberBandEffect: e.velocityY <= 0,
                            rubberBandFactor: 1,
                            clamp: [0, screenHeight - headHeight]
                        }, () => {

                            if (frameTransY.value > screenHeight - headHeight) {

                                isCardMoving.value = false
                            }
                            else if (frameTransY.value < 160) {
                                frameTransY.value = withTiming(0, { duration: 100 }, () => {
                                    isCardMoving.value = false
                                })
                            }
                            else {
                                isCardMoving.value = false
                            }

                        })



                    })
                    .onFinalize(e => {
                        // isCardMoving.value = false
                    })
                    .activeOffsetY([-10, 10])
                    .enabled(shouldFramePanning),



                Gesture.LongPress()
                    .onStart((e) => {
                        !isDownloaded.value
                            ? runOnJS(downloadWord)(sourceWord.wordName, shouldCheckDownload ? contentPainText : sourceWord.wordName)
                            : runOnJS(deleteDownloadWord)(sourceWord.wordName, shouldCheckDownload ? contentPainText : sourceWord.wordName)
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

                        if (shouldCheckDownload) {// ((e.absoluteY - (screenHeight - frameTransY.value)) <= 40) {
                            // frameTransY.value = withTiming(screenHeight - headHeight)
                            runOnJS(goToSentenceSettingScreen)(true)
                        }
                        else {
                            runOnJS(goToSentenceSettingScreen)()
                            //   frameTransY.value = withTiming(0)
                        }

                    }),
                Gesture.Tap().numberOfTaps(1).onEnd(e => {

                    !isListPlaying.value && runOnJS(togglePlayingAsync)(shouldCheckDownload)
                }),


            )}
        >
            <View style={[blockStyle]} >

                <GestureDetector gesture={
                    Gesture.Simultaneous(


                        Gesture.Tap().numberOfTaps(2).onEnd(e => {
                            if (!isListPlaying.value) {
                                isListPlaying.value = true
                                runOnJS(autoPlay)();



                                return
                            }
                            else {
                                //frameTransY.value = withTiming(0, { duration: 200 })
                                runOnJS(delayStopSpeak)()
                                return
                            }
                        }))}>
                    <View style={(useAnimatedStyle(() => {
                        return {
                            width: 100,
                            height: wordRowHeight.value + meaningRowHeight_.value,
                            backgroundColor: "transparent",// "rgba(255, 232, 104, 0.5)",
                            position: "absolute",
                            zIndex: 100,
                            transform: [{ scale: shouldCheckDownload ? 1 : 0 }]
                        }
                    }))} />
                </GestureDetector>


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
                        {children}
                        {shouldCheckDownload &&
                            <Text ellipsizeMode={"tail"} style={{ position: "absolute", right: 0, fontSize: 15, transform: [{ translateY: 8 }, { translateX: 0 }], color: "#555" }}>
                                {index + " "}
                            </Text>}
                        {/* {children}<Text>{String(" " + index)}</Text> */}
                    </ScrollView>
                </LinearGradient>
            </View>
        </GestureDetector>


    )




}

export const SentenceAreaContext = createContext()
function SentenceArea({ index, sourceWord, children, wordRowHeight, visibleCard, meaningRowHeight, ...props }) {
    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, refreshState, isScrollingY, setRefreshState, isScrollingX, scrollX, speak, isListPlaying,
        checkPlaying, audioPlayer, stopSpeak, sentencePlaingIndex, wordPos } = useContext(Context)



    const blockHeightArr = useSharedValue(new Array(sourceWord.exampleEnglishArr.length).fill(false))
    const paddingViewHeight = useSharedValue(0)
    //const isSpaceEnough = useSharedValue(true)
    useEffect(() => {

        paddingViewHeight.value = 0
        //console.log(sourceWord.wordName)
        blockHeightArr.modify((arr) => {
            "worklet";

            return new Array(sourceWord.exampleEnglishArr.length).fill(false)

        })
        //isSpaceEnough.value = true
    }, [visibleCard, sourceWordArr])



    const availableHeight = useSharedValue(frameTransY.value - wordRowHeight.value - meaningRowHeight.value)
    useDerivedValue(() => {
        availableHeight.value = frameTransY.value - wordRowHeight.value - meaningRowHeight.value


    }, [wordRowHeight.value, meaningRowHeight.value, frameTransY.value, scrollX.value, sourceWordArr])


    useDerivedValue(() => {

        //console.log(blockHeightArr.value)
        if (!blockHeightArr.value.includes(false)) {
            const sum = blockHeightArr.value.reduce((total, current) => total + current, 0)  //+ (blockHeightArr.value.length - 1) * 8;
            paddingViewHeight.value = sum //- blockHeightArr.value.at(-1)
        }
        if ((isListPlaying.value) && (wordPos.value === index)) {

            let toHeight = 0
            blockHeightArr.value.forEach((item, itemIndex) => {
                if (sentencePlaingIndex.value > itemIndex) {
                    toHeight = toHeight + item
                }


            })

            runOnJS(scroll)(toHeight)
        }



    })


    const areaScrollRef = useAnimatedRef()

    function scroll(y) {
        areaScrollRef.current && areaScrollRef.current.scrollTo({ x: 0, y, animated: true })
    }




    return (

        <SentenceAreaContext.Provider value={{ blockHeightArr }}>





            <View style={useAnimatedStyle(() => {

                let actualHeight = 0


                if (blockHeightArr.value.includes(false)) {
                    actualHeight = "auto"
                }
                else if (availableHeight.value - paddingViewHeight.value > 0) {
                    actualHeight = paddingViewHeight.value //* 2 - blockHeightArr.value.at(-1)

                }
                else {
                    actualHeight = availableHeight.value

                }

                return {
                    width: screenWidth,
                    height: actualHeight,
                    // height: paddingViewHeight.value ?
                    //     "auto"
                    //     : actualHeight,
                    // height:availableHeight.value,
                    // height: paddingViewHeight.value || "auto",
                    // height: paddingViewHeight.value ?
                    //     paddingViewHeight.value * 2 + blockHeightArr.value.at(-1)
                    //     : "auto",
                    //maxHeight: availableHeight.value,
                    //height: availableHeight.value,
                    borderWidth: 0,
                    backgroundColor: "lightblue",

                    display: "flex",
                    flexDirection: "column",
                    //opacity: actualHeight === "auto" ? 0 : withTiming(1)
                    //  transform: [{ scale: isSpaceEnough.value ? 0 : 1 }]

                }

            })}>
                <ScrollView contentContainerStyle={{ width: screenWidth, height: "auto", paddingBottom: 0, backgroundColor: "pink", display: "flex", overflow: "hidden" }}
                    // disableScrollViewPanResponder={true}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    ref={areaScrollRef}
                    onScroll={(e) => {
                        //   console.log(e.nativeEvent.contentOffset.y, e.nativeEvent.contentOffset)
                        // areaScrollY.value = e.nativeEvent.contentOffset.y


                        // if (e.nativeEvent.contentOffset.y) {
                        //     frameTransY.value = frameTransY.value + e.nativeEvent.contentOffset.y
                        // }

                    }}
                    onScrollToTop={(e) => {
                        console.log("==", e.nativeEvent.layoutMeasurement)
                    }}
                    overScrollMode={"always"}
                    onScrollBeginDrag={(e) => {
                        //             console.log(e.nativeEvent)
                    }}
                    onScrollEndDrag={(e) => {
                        //console.log("===",e.nativeEvent.contentOffset)
                    }}

                //   snapToInterval={40}
                >
                    {sourceWord.exampleEnglishArr.map((sentenceItem, arrIndex) => {

                        return (


                            <View key={arrIndex}>

                                <SentencePanel index={index} arrIndex={arrIndex} sentenceItem={sentenceItem} visibleCard={visibleCard} />

                            </View>

                        )
                    })}
                    <View style={useAnimatedStyle(() => {

                        let actualHeight = 0
                        let isOverSize = false


                        if (availableHeight.value - paddingViewHeight.value > 0) {
                            actualHeight = paddingViewHeight.value //* 2 - blockHeightArr.value.at(-1)
                            isOverSize = false
                        }
                        else {
                            actualHeight = availableHeight.value
                            isOverSize = true
                        }

                        return {
                            display: "flex", backgroundColor: "purple", width: screenWidth,

                            height: isOverSize
                                ? availableHeight.value - blockHeightArr.value.at(-1)
                                : paddingViewHeight.value - blockHeightArr.value.at(-1)
                        }
                    })} />



                </ScrollView>


                {/* <GestureDetector gesture={Gesture.Pan().onChange(e => {
                    frameTransY.value = frameTransY.value - e.changeY
                }).onEnd((e) => {

                    if (frameTransY.value > screenHeight - headHeight) {
                        frameTransY.value = withTiming(screenHeight - headHeight)
                    }
                    else if (frameTransY.value < 160) {

                        frameTransY.value = withTiming(0)
                    }


                }).activeOffsetY([-10, 10])}>
                    <View style={{ display: "flex", backgroundColor: "rgba(243, 116, 201, 1)", flex: 999999, }} />
                </GestureDetector> */}

            </View>


        </SentenceAreaContext.Provider>


    )



}

function SentencePanel({ index, arrIndex, visibleCard, ...props }) {
    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, refreshState, isScrollingY, setRefreshState, deleteDownloadWord,
        isScrollingX, scrollX, speak, isListPlaying, checkPlaying, audioPlayer, stopSpeak } = useContext(Context)

    const sourceWord = sourceWordArr[index]

    const isDownloaded = useSharedValue(false)
    const { blockHeightArr } = useContext(SentenceAreaContext)

    useEffect(() => {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        //const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        const hashName2 = CryptoJS(sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
        })
    }, [visibleCard, refreshState, scrollX.value, sourceWordArr])



    function togglePlayingAsync(isEnglish) {
        //   console.log("check playing...")
        checkPlaying().then(([res1, res2]) => {
            //      console.log(res1,res2)
            if (res1 || res2) {
                console.log("to stop togglePlayingAsync")
                stopSpeak()
                // Speech.stop()
                // audioPlayer.pause()
            }
            else {
                isEnglish
                    ? speak(sourceWord.wordName, sourceWord.exampleEnglishArr[arrIndex].sentence)
                    : speak(sourceWord.wordName, sourceWord.exampleChineseArr[arrIndex].sentence)
            }
        })
    }

    function checkDownload() {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        //const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        const hashName2 = CryptoJS(sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
            setTimeout(() => {
                setRefreshState(Math.random())
            }, 100);

        })

    }



    const viewRef = useAnimatedRef()
    useEffect(() => {
        setTimeout(() => {
            //  console.log(viewRef.current.nativeEvent.layout.height, sourceWord.wordName, arrIndex)
            const h = viewRef.current.nativeEvent.layout.height

            blockHeightArr.modify(arr => {
                "worklet";
                if (arr[arrIndex] === false) {
                    arr[arrIndex] = h
                }

                return arr
            })
        }, 100)
    })


    const englishHeight = useSharedValue(0)
    const chineseHeight = useSharedValue(0)

    const navigation = useNavigation()


    function goToSentenceSettingScreen() {
        const obj = { wordPos: index, sentencePos: arrIndex }

        // navigation.preload("SentenceSettingScreen", obj)
        // setTimeout(() => {
        navigation.navigate("SentenceSettingScreen", obj)
        // }, sourceWord.exampleEnglishArr.length*10);



    }


    return (
        <>
            <GestureDetector gesture={Gesture.Exclusive(
                Gesture.Tap().numberOfTaps(2)
                    .onStart(e => {
                        runOnJS(goToSentenceSettingScreen)()
                    }),

                Gesture.Tap().numberOfTaps(1)
                    .onStart(e => {
                        const y = e.y
                        //console.log("spaceEnough tap", englishHeight.value, chineseHeight.value, y)

                        !isListPlaying.value && runOnJS(togglePlayingAsync)(y <= englishHeight.value + 8)
                    }),



                Gesture.LongPress()
                    .onStart(e => {
                        //shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()

                        if (!isDownloaded.value) {
                            runOnJS(downloadWord)(sourceWord.wordName, sourceWord.exampleEnglishArr[arrIndex].sentence, checkDownload)

                        }
                        else if (isDownloaded.value) {
                            runOnJS(deleteDownloadWord)(sourceWord.wordName, sourceWord.exampleEnglishArr[arrIndex].sentence, checkDownload)

                        }


                        console.log("longlong")

                    })


            )}>
                <View style={useAnimatedStyle(() => {
                    return {
                        minHeight: 80,
                        backgroundColor: isDownloaded.value ? "wheat" : "#e7cca0",
                        paddingHorizontal: 4,
                        paddingBottom: 16,
                        paddingTop: 0
                    }
                })}

                    onLayout={e => {
                        e.persist()
                        viewRef.current = e
                    }}
                >

                    <Text style={{ fontSize: 25, color: "#333" }} onLayout={(e) => {

                        englishHeight.value = e.nativeEvent.layout.height
                    }}>
                        {sourceWord.exampleEnglishArr[arrIndex].sentence}
                    </Text>

                    <Text style={{ fontSize: 25, color: "#333" }} onLayout={(e) => {

                        chineseHeight.value = e.nativeEvent.layout.height
                    }}>
                        {sourceWord.exampleChineseArr[arrIndex].sentence}
                    </Text>

                </View>
            </GestureDetector>

        </>
    )
}

/*
function SentenceBlockSpaceEnough({ index, arrIndex, children, visibleCard, shouldCheckDownload = true, wordRowHeight, meaningRowHeight, ...props }) {



    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, refreshState, isScrollingY, setRefreshState, deleteDownloadWord,
        isScrollingX, scrollX, speak, isListPlaying, checkPlaying, audioPlayer, stopSpeak } = useContext(Context)

    const sourceWord = sourceWordArr[index]


    const { blockHeightArr } = useContext(SentenceAreaContext)





    const isDownloaded = useSharedValue(false || (!shouldCheckDownload))
    const contentPainText = children.props.children
    //console.log(contentPainText)




    useEffect(() => {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        //const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        const hashName2 = CryptoJS(sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
        })
    }, [visibleCard, refreshState, scrollX.value, sourceWordArr])


    const contentLength = useSharedValue(160)
    const maxHeight = useSharedValue(80)
    const availableHeight = useSharedValue(frameTransY.value - wordRowHeight.value - meaningRowHeight.value)
    const isScrollViewOverSized = useSharedValue(contentLength.value - maxHeight.value > 4)

    useDerivedValue(() => {
        availableHeight.value = frameTransY.value - wordRowHeight.value - meaningRowHeight.value

        maxHeight.value = availableHeight.value / (2 * sourceWord.exampleEnglishArr.length)


        if (contentLength.value - maxHeight.value > 4) {
            isScrollViewOverSized.value = true
        }
        else {
            isScrollViewOverSized.value = false
        }

    }, [contentLength.value, wordRowHeight.value, meaningRowHeight.value, frameTransY.value, scrollX.value, sourceWordArr])

    const sentenceIndex = shouldCheckDownload ? arrIndex * 2 : arrIndex * 2 + 1
    useEffect(() => {
        setTimeout(() => {
            if (!blockHeightArr.value[sentenceIndex]) {
                const h = eref.current?.nativeEvent?.layout?.height
                blockHeightArr.modify(arr => {
                    "worklet";
                    if (h > 0) {
                        arr[sentenceIndex] = h
                    }

                    return arr
                })
            }

        }, 100);
    })
    function togglePlayingAsync() {
        //   console.log("check playing...")
        checkPlaying().then(([res1, res2]) => {
            //      console.log(res1,res2)
            if (res1 || res2) {
                console.log("to stop")
                stopSpeak()
                // Speech.stop()
                // audioPlayer.pause()
            }
            else {
                speak(sourceWord.wordName, contentPainText)
            }
        })
    }

    function checkDownload() {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        //const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        const hashName2 = CryptoJS(sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
            setTimeout(() => {
                setRefreshState(Math.random())
            }, 100);

        })

    }

    const isSpaceEnough = useSharedValue(true)
    const blockStyle = useAnimatedStyle(() => {

        let blockHeight = "auto"

        let isLastSentence = (sentenceIndex + 1) === blockHeightArr.value.length


        // if (!blockHeightArr.value.includes(false)) {

        //     const sum = blockHeightArr.value.reduce((total, current) => total + current, 0) + (blockHeightArr.value.length - 1) * 8;
        //     //marginBottom except last sentenceBlock is 8
        //     const ratioArr = blockHeightArr.value.map(item => { return item / sum })
        //     if (sum <= availableHeight.value) {
        //         blockHeight = blockHeightArr.value[sentenceIndex]
        //         isSpaceEnough.value = true
        //     }
        //     else {
        //         blockHeight = Math.max(80, availableHeight.value * (ratioArr[sentenceIndex]))
        //         isSpaceEnough.value = false
        //     }
        // }


        return {

            width: screenWidth,
            height: blockHeight,
            minHeight: 80,

            // maxHeight: maxHeight.value,//availableHeight.value / (2 * sourceWord.exampleEnglishArr.length),
            margin: 0,
            marginBottom: isLastSentence ? 0 : shouldCheckDownload ? 0 : 8,
            padding: 0,

            borderWidth: 0,
            // backgroundColor: isDownloaded.value
            //     ? "wheat"//"#FCD19D"
            //     : "#D6BD95",
            //  backgroundColor: bc,

            // backgroundColor: isDownloaded.value
            //     ? "wheat"//"#FCD19D"
            //     : "#DFC98A",//"#D6BD95",


            backgroundColor: isDownloaded.value ? "wheat" : "rgba(214, 189, 149, 0.5)",




            opacity: blockHeight === "auto" ? 0 : 1,// withTiming(1),

            overflow: "hidden",

            display: "flex",
            alignItems: sentenceIndex % 2 === 0 ? "flex-end" : "flex-start",
            flexDirection: "row",

        }



    })

    const eref = useRef(0)
    return (<>






        <GestureDetector gesture={Gesture.Simultaneous(
            Gesture.Tap().numberOfTaps(1)
                .onStart(e => {
                    console.log("spaceEnough tap")

                    !isListPlaying.value && runOnJS(togglePlayingAsync)()
                })

                .onFinalize(e => {

                }),

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
                .activeOffsetY([-10, 10]),

            Gesture.LongPress()
                .onStart(e => {
                    //shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()

                    if (!isDownloaded.value) {
                        runOnJS(downloadWord)(sourceWord.wordName, sourceWord.exampleEnglishArr[arrIndex].sentence, checkDownload)

                    }
                    else if (isDownloaded.value) {
                        runOnJS(deleteDownloadWord)(sourceWord.wordName, sourceWord.exampleEnglishArr[arrIndex].sentence, checkDownload)

                    }


                    console.log("longlong")

                })
                .onEnd(e => {
                })
                .onFinalize(e => {

                })

        )}>

            <View

            >
                <View style={[blockStyle, useAnimatedStyle(() => {
                    return {
                        paddingHorizontal: 4,
                    }
                })]}

                    onLayout={(e) => {
                        e.persist()
                        eref.current = e

                    }}
                >
                    {children}
                </View >
            </View>

        </GestureDetector>



    </>)




}


function SentenceBlock({ index, arrIndex, children, visibleCard, shouldCheckDownload = true, wordRowHeight, meaningRowHeight, ...props }) {







    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, refreshState, isScrollingY, setRefreshState, deleteDownloadWord,
        isScrollingX, scrollX, speak, isListPlaying, checkPlaying, audioPlayer, stopSpeak } = useContext(Context)

    const sourceWord = sourceWordArr[index]


    const { blockHeightArr } = useContext(SentenceAreaContext)





    const isDownloaded = useSharedValue(false || (!shouldCheckDownload))
    const contentPainText = children.props.children
    //console.log(contentPainText)




    useEffect(() => {


        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        //     const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()

        const hashName2 = CryptoJS(sourceWord.exampleEnglishArr[arrIndex].sentence).toString()

        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
        })
    }, [visibleCard, refreshState, scrollX.value, isDownloaded.value, sourceWordArr])





    const contentLength = useSharedValue(160)
    const maxHeight = useSharedValue(80)
    const availableHeight = useSharedValue(frameTransY.value - wordRowHeight.value - meaningRowHeight.value)
    const isScrollViewOverSized = useSharedValue(contentLength.value - maxHeight.value > 4)

    useDerivedValue(() => {
        availableHeight.value = frameTransY.value - wordRowHeight.value - meaningRowHeight.value

        maxHeight.value = availableHeight.value / (2 * sourceWord.exampleEnglishArr.length)


        if (contentLength.value - maxHeight.value > 4) {
            isScrollViewOverSized.value = true
        }
        else {
            isScrollViewOverSized.value = false
        }

    }, [contentLength.value, wordRowHeight.value, meaningRowHeight.value, frameTransY.value, scrollX.value, sourceWordArr])







    const sentenceIndex = shouldCheckDownload ? arrIndex * 2 : arrIndex * 2 + 1
    useEffect(() => {
        setTimeout(() => {
            if (!blockHeightArr.value[sentenceIndex]) {
                const h = eref.current?.nativeEvent?.layout?.height
                blockHeightArr.modify(arr => {
                    "worklet";
                    if (h > 0) {
                        arr[sentenceIndex] = h
                    }

                    return arr
                })
            }

        }, 100);
    })
    function togglePlayingAsync() {
        //   console.log("check playing...")
        checkPlaying().then(([res1, res2]) => {
            //      console.log(res1,res2)
            if (res1 || res2) {
                console.log("to stop")
                stopSpeak()
                // Speech.stop()
                // audioPlayer.pause()
            }
            else {
                speak(sourceWord.wordName, contentPainText)
            }
        })
    }


    function checkDownload() {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        //const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        const hashName2 = CryptoJS(sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
            setTimeout(() => {
                setRefreshState(Math.random())
            }, 100);

        })

    }


    const isSpaceEnough = useSharedValue(true)


    const blockStyle = useAnimatedStyle(() => {


        let blockHeight = "auto"
        let isLastSentence = (sentenceIndex + 1) === blockHeightArr.value.length
        let actualHeight = blockHeightArr.value[sentenceIndex] || 80

        if (!blockHeightArr.value.includes(false)) {

            const sum = blockHeightArr.value.reduce((total, current) => total + current, 0) + (blockHeightArr.value.length - 1) * 8;
            //marginBottom except last sentenceBlock is 8
            const ratioArr = blockHeightArr.value.map(item => { return item / sum })
            if (sum <= availableHeight.value) {
                blockHeight = blockHeightArr.value[sentenceIndex]
                isSpaceEnough.value = true
                actualHeight = blockHeightArr.value[sentenceIndex] || 80
            }
            else {
                blockHeight = Math.max(80, availableHeight.value * (ratioArr[sentenceIndex]))
                isSpaceEnough.value = false
                actualHeight = blockHeightArr.value[sentenceIndex] || 80
            }
        }


        return {

            width: screenWidth,
            height: blockHeight,
            minHeight: 80,

            // maxHeight: maxHeight.value,//availableHeight.value / (2 * sourceWord.exampleEnglishArr.length),
            margin: 0,
            marginBottom: isLastSentence ? 0 : shouldCheckDownload ? 0 : 8,
            padding: 0,

            borderWidth: 0,

            borderColor: "wheat",
            // backgroundColor: isDownloaded.value
            //     ? actualHeight <= 80 ? "wheat" : "#FCD19D"
            //     //    : actualHeight <= 80 ? "#D6BD95" : "#DFC98A",
            //     : actualHeight <= 80 ? "#DFC98A" : "#D6BD95",


            // backgroundColor: isDownloaded.value ? "wheat" :"rgba(144, 180, 143, 0.4)",// "#D6BD95",
            backgroundColor: isDownloaded.value ? "wheat" : "rgba(214, 189, 149, 0.5)",// "#D6BD95",



            opacity: blockHeight === "auto" ? 0 : 1,


            overflow: "hidden",

            display: "flex",
            alignItems: sentenceIndex % 2 === 0 ? "flex-end" : "flex-start",
            flexDirection: "row",

        }



    })




    const eref = useRef(0)

    return (<>
        <GestureDetector gesture={Gesture.Simultaneous(
            Gesture.Tap().numberOfTaps(1)
                .onStart(e => {
                    console.log("tap")
                    !isListPlaying.value && runOnJS(togglePlayingAsync)()
                })

                .onFinalize(e => {

                }),
            Gesture.LongPress()
                .onStart(e => {

                    if (!isDownloaded.value) {
                        runOnJS(downloadWord)(sourceWord.wordName, sourceWord.exampleEnglishArr[arrIndex].sentence, checkDownload)

                    }
                    else if (isDownloaded.value) {
                        runOnJS(deleteDownloadWord)(sourceWord.wordName, sourceWord.exampleEnglishArr[arrIndex].sentence, checkDownload)

                    }
                    console.log("longlong")

                })


        )}>
            <View style={[blockStyle]}

                onLayout={(e) => {
                    e.persist()
                    eref.current = e

                }}
            >
                <View style={
                    useAnimatedStyle(() => {

                        return {

                            width: blockHeightArr.value[sentenceIndex] <= 80 ? 0 : screenWidth,
                            //          width: blockHeightArr.value[sentenceIndex] <= 80 ? 0 : 16,


                            position: "absolute",
                            top: 0,
                            bottom: 0,
                            overflow: "hidden",
                            //     backgroundColor: isDownloaded.value ? "#D6BD95" : "wheat"

                            // backgroundColor:
                            //     blockHeightArr.value[sentenceIndex] <= 80
                            //         ? "transparent"
                            //           : isDownloaded.value ? "#D6BD95" : "wheat",
                            //        // : isDownloaded.value ? "#eec1787e" : "wheat",
                        }
                    })
                }>
                    <LinearGradient
                        // colors={["rgba(255, 179, 80, 0)", 'rgba(255, 179, 80, 0.8)', 'rgba(255, 155, 133, 1)',]}
                        //colors={["transparent",  'rgba(80,80,80,0.3)',]}
                        //colors={["transparent", 'rgba(80,80,80,0.3)',]}
                        //colors={["transparent", 'rgba(214, 189, 149, 1)',]}
                        //  colors={['rgba(223, 201, 138, 0.8)',"transparent", ]}
                        //colors={['rgba(217, 217, 177, 1))', "transparent",]}
                        //colors={['rgba(144, 180, 143, 0.4)', "transparent",]}
                        // colors={['rgba(122, 192, 125, 0.25)', "transparent",]}
                        //colors={['rgba(207, 167, 119, 0.3)', "transparent",]}
                        // colors={['rgba(231, 205, 174, 0.3)', "transparent",]}
                        colors={["transparent", 'rgba(252, 209, 157, 0.8)',]}


                        dither={true}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        locations={[0.1, 0.9]}
                        //Example:  
                        // colors={[red', 'green']}
                        // locations={[0.3,0.4]}  // full red 30% of width   //mixed red-and-green (40% - 30% = 10%) of width     // full green  100% - 40% = 60% of width
                        //                        // ______red = 30%______   ___mixed = 10%___   _________green = 60%__________________     
                        style={{
                            width: screenWidth,
                            position: "absolute",
                            top: 0,
                            bottom: 0

                        }}
                    ></LinearGradient>


                </View>

                <ScrollView
                    contentContainerStyle={{ width: screenWidth, backgroundColor: "transparent", padding: 0, paddingHorizontal: 4, elevation: 0 }}
                    onContentSizeChange={(w, h) => { }}
                    nestedScrollEnabled={true}
                    scrollEnabled={true}
                    persistentScrollbar={false}
                    fadingEdgeLength={2}
                    disableScrollViewPanResponder={false}
                >
                    {children}
                </ScrollView>
            </View >
        </GestureDetector >
    </>)




}
*/








function getRandomColor0() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}





function getBCColor(num) {
    const arr = ["#d9d9b1", "#d9d9b1", "#e6e6cc", "#e6e6cc", "#eeeedd", "#eeeedd", "#b5caac", "#d9d9c1"]
    //const arr = ["#d9d9b1", "#d9d9b1", "#d9d9b1", "#d9d9b1", "#d9d9b1", "#d9d9b1", "#d9d9b1", "#d9d9b1"]
    return arr[num]

}