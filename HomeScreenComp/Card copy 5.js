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
    runOnUI

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

                <SentenceArea index={index} sourceWord={sourceWord} visibleCard={visibleCard} wordRowHeight={wordRowHeight} meaningRowHeight={meaningRowHeight} />
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

    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, refreshState, isScrollingY, isScrollingX, stopSpeak, autoPlay,
        scrollRef2Scroll, wordPos, isListPlaying, scrollY, scrollX

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

            backgroundColor: isDownloaded.value
                ? "wheat"//"#FCD19D"
                : "#DFC98A",//"#D6BD95",



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
    return (

        <GestureDetector
            gesture={Gesture.Simultaneous(
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

                        if (shouldCheckDownload) {// ((e.absoluteY - (screenHeight - frameTransY.value)) <= 40) {
                            frameTransY.value = withTiming(screenHeight - headHeight)
                        }
                        else {
                            frameTransY.value = withTiming(0)
                        }

                    }),



            )}
        >
            <View style={[blockStyle]} >

                <GestureDetector gesture={Gesture.Tap().numberOfTaps(2).onEnd(e => {
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
                })}>
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
                            <Text ellipsizeMode={"tail"} style={{ position: "absolute", right: 0, fontSize: 15, transform: [{ translateY: 8 }], color: "#555" }}>
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



    const blockHeightArr = useSharedValue(new Array(sourceWord.exampleEnglishArr.length * 2).fill(false))
    useEffect(() => {
        blockHeightArr.modify((arr) => {
            "worklet";
            return new Array(sourceWord.exampleEnglishArr.length * 2).fill(false)
        })
        isSpaceEnough.value = true
    }, [visibleCard])


    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, refreshState, isScrollingY, setRefreshState, isScrollingX, scrollX, speak, isListPlaying, checkPlaying, audioPlayer, stopSpeak } = useContext(Context)

    const availableHeight = useSharedValue(frameTransY.value - wordRowHeight.value - meaningRowHeight.value)
    useDerivedValue(() => {
        availableHeight.value = frameTransY.value - wordRowHeight.value - meaningRowHeight.value


    }, [wordRowHeight.value, meaningRowHeight.value, frameTransY.value, scrollX.value])

    const isSpaceEnough = useSharedValue(true)
    useDerivedValue(() => {
        if (!blockHeightArr.value.includes(false)) {
            const sum = blockHeightArr.value.reduce((total, current) => total + current, 0) + (blockHeightArr.value.length - 1) * 8;
            //marginBottom except last sentenceBlock is 8
            if (sum <= availableHeight.value) {

                isSpaceEnough.value = true
            }
            else {

                isSpaceEnough.value = false
            }
        }


    })


    return (

        <SentenceAreaContext.Provider value={{ blockHeightArr }}>
            <View style={[{ position: "relative" }, useAnimatedStyle(() => {


                return {
                    // opacity: blockHeightArr.value.includes(false) ? 0 : 1
                }


            })]} >
                <View style={useAnimatedStyle(() => {

                    return {
                        width: screenWidth,
                        height: availableHeight.value,
                        transform: [{ scale: isSpaceEnough.value ? 1 : 0 }],
                        position: "absolute",
                        //   opacity: blockHeightArr.value.includes(false) ? 0 : 1
                    }


                })}>

                    {sourceWord.exampleEnglishArr.map((item, arrIndex) => {

                        return (
                            <View key={arrIndex}>
                                <SentenceBlockSpaceEnough visibleCard={visibleCard} index={index} arrIndex={arrIndex} shouldCheckDownload={true} wordRowHeight={wordRowHeight} meaningRowHeight={meaningRowHeight} >
                                    <Text style={{ fontSize: 25, color: "#333" }}>
                                        {item.sentence}
                                    </Text>
                                </SentenceBlockSpaceEnough>
                                <SentenceBlockSpaceEnough visibleCard={visibleCard} index={index} arrIndex={arrIndex} shouldCheckDownload={false} wordRowHeight={wordRowHeight} meaningRowHeight={meaningRowHeight}>
                                    <Text style={{ fontSize: 25, color: "#333" }}>
                                        {sourceWord.exampleChineseArr[arrIndex].sentence}
                                    </Text>
                                </SentenceBlockSpaceEnough>
                            </View>
                        )
                    })}
                </View>



                <View style={useAnimatedStyle(() => {

                    return {
                        width: screenWidth,
                        height: availableHeight.value,
                        borderWidth: 0,

                        transform: [{ scale: isSpaceEnough.value ? 0 : 1 }]
                    }

                })}>
                    <ScrollView contentContainerStyle={{ width: screenWidth, paddingBottom: 0, }}
                        // disableScrollViewPanResponder={true}
                        scrollEnabled={true}
                        nestedScrollEnabled={false}
                    //   snapToInterval={40}
                    >
                        {sourceWord.exampleEnglishArr.map((item, arrIndex) => {

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
                        })}

                    </ScrollView>
                </View>
            </View>
        </SentenceAreaContext.Provider>


    )



}



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
    }, [visibleCard, refreshState, scrollX.value])


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

    }, [contentLength.value, wordRowHeight.value, meaningRowHeight.value, frameTransY.value, scrollX.value])

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


        if (!blockHeightArr.value.includes(false)) {

            const sum = blockHeightArr.value.reduce((total, current) => total + current, 0) + (blockHeightArr.value.length - 1) * 8;
            //marginBottom except last sentenceBlock is 8
            const ratioArr = blockHeightArr.value.map(item => { return item / sum })
            if (sum <= availableHeight.value) {
                blockHeight = blockHeightArr.value[sentenceIndex]
                isSpaceEnough.value = true
            }
            else {
                blockHeight = Math.max(80, availableHeight.value * (ratioArr[sentenceIndex]))
                isSpaceEnough.value = false
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
            // backgroundColor: isDownloaded.value
            //     ? "wheat"//"#FCD19D"
            //     : "#D6BD95",
            //  backgroundColor: bc,

            backgroundColor: isDownloaded.value
                ? "wheat"//"#FCD19D"
                : "#DFC98A",//"#D6BD95",
            opacity: blockHeight === "auto" ? 0 : withTiming(1),

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
    }, [visibleCard, refreshState, scrollX.value, isDownloaded.value])





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

    }, [contentLength.value, wordRowHeight.value, meaningRowHeight.value, frameTransY.value, scrollX.value])







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
            backgroundColor: isDownloaded.value
                ? actualHeight <= 80 ? "wheat" : "#FCD19D"
                //    : actualHeight <= 80 ? "#D6BD95" : "#DFC98A",
                : actualHeight <= 80 ? "#DFC98A" : "#D6BD95",

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
        </GestureDetector>
    </>)




}









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