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
        <CardContext.Provider value={{ wordRowHeight }}>
            <View style={[cardStyle]}>

                <WordPanel sourceWord={sourceWord} index={index} visibleCard={visibleCard} />

                <SentenceArea index={index} sourceWord={sourceWord} visibleCard={visibleCard} wordRowHeight={wordRowHeight} />



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
                            backgroundColor: "wheat"//rgba(123,36,251,0.3)"
                        }
                    })} />
                </GestureDetector>



            </View >

        </CardContext.Provider>
    )
}
function WordPanel({ sourceWord, index, visibleCard }) {

    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, deleteDownloadWord, refreshState, isScrollingY, isScrollingX, stopSpeak, autoPlay,
        scrollRef2Scroll, wordPos, isListPlaying, scrollY, scrollX, speak, checkPlaying

    } = useContext(Context)

    const { wordRowHeight } = useContext(CardContext)

    const isDownloaded = useSharedValue(false)
    useEffect(() => {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        const hashName2 = CryptoJS(sourceWord.wordName).toString()
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
        })
    }, [visibleCard, refreshState])

    const englishHeight = useSharedValue(0)
    const chineseHeight = useSharedValue(0)


    function togglePlayingAsync(isEnglish = true) {
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
                isEnglish && speak(sourceWord.wordName, sourceWord.wordName)
                !isEnglish && speak(sourceWord.meaningSound, sourceWord.meaningSound)
            }
        })
    }

    const delayStopSpeak = () => {
        isListPlaying.value = false
        stopSpeak()
    }
    const navigation = useNavigation()
    function goToSentenceSettingScreen(mainPage = false) {
        if (mainPage) {
            navigation.navigate("SentenceSettingScreen", { wordPos: index })
            return
        }

        const obj = { wordPos: index, sentencePos: -1 }
        navigation.navigate("SentenceSettingScreen", obj)
    }



    return (
        <>
            <GestureDetector gesture={Gesture.Exclusive(

                Gesture.LongPress().minDuration(500)
                    .onStart((e) => {
                        !isDownloaded.value
                            ? runOnJS(downloadWord)(sourceWord.wordName, sourceWord.wordName)
                            : runOnJS(deleteDownloadWord)(sourceWord.wordName, sourceWord.wordName)
                    }),
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
                    .activeOffsetY([-10, 10]),




                Gesture.Tap()
                    .numberOfTaps(2)
                    .onEnd(e => {

                        if (e.x <= 100) {
                            if (!isListPlaying.value) {
                                isListPlaying.value = true
                                runOnJS(autoPlay)();
                                return
                            }
                            else {
                                runOnJS(delayStopSpeak)()
                                return
                            }
                        }
                        else {
                            if (e.y <= englishHeight.value) {

                                runOnJS(goToSentenceSettingScreen)(true)
                            }
                            else {
                                runOnJS(goToSentenceSettingScreen)()
                            }
                        }


                    }),
                Gesture.Tap()
                    .numberOfTaps(1)
                    .onStart(e => {
                        !isListPlaying.value && runOnJS(togglePlayingAsync)(e.y <= englishHeight.value)
                    }),


            )}>
                <View style={useAnimatedStyle(() => {
                    return {
                        height: "auto",
                        minHeight: 80,
                        paddingHorizontal: 4,
                        backgroundColor: isDownloaded.value ? "wheat" : "#e7cca0",
                        borderTopWidth: 2,
                        borderTopColor: isListPlaying.value ? "orange" : "wheat"
                    }
                })}
                    onLayout={e => {
                        wordRowHeight.value = e.nativeEvent.layout.height
                    }}
                >
                    <Text style={{ fontSize: 27, color: "#a75d09", }} onLayout={(e) => {

                        englishHeight.value = e.nativeEvent.layout.height

                    }}>
                        {sourceWord.wordName}
                    </Text>
                    <Text ellipsizeMode={"tail"} style={{ position: "absolute", right: 0, fontSize: 15, transform: [{ translateY: 8 }], color: "#555" }}>
                        {index + " "}
                    </Text>

                    <Text style={{ fontSize: 17, color: "#333" }} onLayout={(e) => {

                        chineseHeight.value = e.nativeEvent.layout.height
                    }}>
                        {sourceWord.meaning}
                    </Text>
                </View>
            </GestureDetector>
        </>
    )
}




export const SentenceAreaContext = createContext()
function SentenceArea({ index, sourceWord, children, wordRowHeight, visibleCard, ...props }) {
    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, refreshState, isScrollingY, setRefreshState, isScrollingX, scrollX, speak, isListPlaying,
        checkPlaying, audioPlayer, stopSpeak, sentencePlaingIndex, wordPos } = useContext(Context)



    const blockHeightArr = useSharedValue(new Array(sourceWord.exampleEnglishArr.length).fill(false))
    const totalPanelHeight = useSharedValue(0)
    //const isSpaceEnough = useSharedValue(true)
    useEffect(() => {

        totalPanelHeight.value = 0
        //console.log(sourceWord.wordName)
        blockHeightArr.modify((arr) => {
            "worklet";

            return new Array(sourceWord.exampleEnglishArr.length).fill(false)

        })
        //isSpaceEnough.value = true
    }, [visibleCard, sourceWordArr])



    const availableHeight = useSharedValue(frameTransY.value - wordRowHeight.value)
    useDerivedValue(() => {
        availableHeight.value = frameTransY.value - wordRowHeight.value


    }, [wordRowHeight.value, frameTransY.value, scrollX.value, sourceWordArr])


    useDerivedValue(() => {

        //console.log(blockHeightArr.value)
        if (!blockHeightArr.value.includes(false)) {
            const sum = blockHeightArr.value.reduce((total, current) => total + current, 0)
            totalPanelHeight.value = sum
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
                else if (availableHeight.value - totalPanelHeight.value > 0) {
                    actualHeight = totalPanelHeight.value // - blockHeightArr.value.at(-1)

                }
                else {
                    actualHeight = availableHeight.value

                }

                return {
                    width: screenWidth,
                    height: actualHeight,

                    borderWidth: 0,
                    backgroundColor: "#D6BD95",//"darkgray",//"lightblue",

                    display: "flex",
                    flexDirection: "column",

                }

            })}>
                <ScrollView
                    // endFillColor={"rgba(253, 115, 129, 1)"}
                    // fadingEdgeLength={80}
                    onTouchMove={e => {
                          console.log("===",e.nativeEvent.pageY)
                    }}
                    contentContainerStyle={{ width: screenWidth, height: "auto", paddingBottom: 0, backgroundColor: "pink", display: "flex", overflow: "hidden" }}
onResponderEnd={(e)=>{
    console.log(e)
}} 

                    // disableScrollViewPanResponder={true}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    ref={areaScrollRef}
                    onScroll={(e) => {
                        console.log(e.nativeEvent.contentOffset.y)
  //console.log("dddd", e)
                    }}
                    onScrollBeingDrag={function (e) {
                        console.log("dddd", e)
                    }}
                    overScrollMode={"never"}
                    onScrollBeginDrag={(e) => {
                        //             console.log(e.nativeEvent)
                    }}
                    onScrollEndDrag={(e) => {
                       // console.log("===",e.nativeEvent.contentOffset)
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
                    <View


                        style={useAnimatedStyle(() => {

                            let actualHeight = 0
                            let isOverSize = false


                            if (availableHeight.value - totalPanelHeight.value > 0) {
                                actualHeight = totalPanelHeight.value //* 2 - blockHeightArr.value.at(-1)
                                isOverSize = false
                            }
                            else {
                                actualHeight = availableHeight.value
                                isOverSize = true
                            }

                            return {
                                display: "flex", backgroundColor: "#D6BD95",//"darkgray",// "purple", 
                                width: screenWidth,


                                height: isOverSize
                                    ? availableHeight.value - blockHeightArr.value.at(-1)
                                    : totalPanelHeight.value - blockHeightArr.value.at(-1)





                            }
                        })} />



                </ScrollView>




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