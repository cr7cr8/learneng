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
            width: screenWidth, height: 20,
            backgroundColor: isOnBar.value ? "hsla(29, 97%, 69%, 0.8)" : "wheat",
            justifyContent: "center", flexDirection: "row", alignItems: "center"
        }
    })


    const firstRowStyle = useAnimatedStyle(() => {

        const isOnFirst = frameTransY.value === screenHeight - (headHeight + 80)
        const isOnTop = frameTransY.value === screenHeight - headHeight




        return {
            width: screenWidth,
            height: isOnFirst ? 0 : "auto",
            // minHeight: isOnFirst ? (0) : (50),
            maxHeight: 160,


            //      height: frameTransY.value === screenHeight - headHeight - 80 ? 0 : "auto"
            paddingHorizontal: 0,
            paddingBottom: 0,

            margin: 0,

            borderWidth: 0,


            backgroundColor: isDownloaded.value
                ? "wheat"//"#FCD19D"
                : "#D6BD95",
            //backgroundColor:"pink"
        }
    })

    const contentLength = useSharedValue(160)
    const [enableScroll, setEnableScroll] = useState(contentLength.value <= 160)
    useDerivedValue(() => {
        runOnJS(setEnableScroll)(contentLength.value <= 160)
    }, [contentLength.value])


    const secondRowStyle = useAnimatedStyle(() => {
        const shouldMeaningScroll = contentLength.value > 160

        const isOnFirst = frameTransY.value === screenHeight - (headHeight + 80)
        return {
            width: screenWidth,
            height: isOnFirst ? 0 : "auto",
            padding: 0,
            maxHeight: 160,

            borderColor: "wheat",

            //borderRadius: shouldMeaningScroll ? 20 : 0,
            borderWidth: 0,
            borderTopWidth: isOnFirst ? 0 : shouldMeaningScroll ? 10 : 0,
            borderBottomWidth: isOnFirst ? 0 : 10,

            backgroundColor:
                shouldMeaningScroll
                    ? isDownloaded.value
                        ? "#FCD19D"
                        : "#D6BD95"
                    : isDownloaded.value
                        ? "wheat"
                        : "#DCC7A9"



            //  borderColor:"lightgreen",
        }
    })


    const scrollViewStyle = useAnimatedStyle(() => {

        return {
            backgroundColor: "#f3b18bff", width: screenWidth, height: frameTransY.value - 80 - 20 - 80 - 80
        }

    })


    function vibrate() {
        Vibration.vibrate(50)
    }



    return (

        <View style={[cardStyle]}>

            <GestureDetector
                gesture={Gesture.Simultaneous(

                    Gesture.Pan()
                        .onBegin(e => { isOnBar.value = true })
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
                            if (frameTransY.value > screenHeight - headHeight - 80) {
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
            </GestureDetector>
            <ContentBlock visibleCard={visibleCard} index={index}>

                <Text style={{ fontSize: 27, color: "#a75d09" }}>

                    {sourceWord.wordName}
                </Text>
            </ContentBlock>

            <ContentBlock visibleCard={visibleCard} index={index} shouldCheckDownload={false}>

                <Text style={{ fontSize: 20, color: "#555" }}>

                    {sourceWord.meaning}
                </Text>
            </ContentBlock>

            {sourceWord.exampleEnglishArr.map((item, arrIndex) => {

               return <ContentBlock visibleCard={visibleCard} index={index} >
                    <Text style={{ fontSize: 25, color: "#333" }}>

                        {item.sentence}
                    </Text>
                </ContentBlock>


            })}



            {/* <GestureDetector
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
                        .activeOffsetY([-10, 10]),


                    Gesture.LongPress()
                        .onStart((e) => {
                            !isDownloaded.value && runOnJS(downloadWord)(sourceWord.wordName, sourceWord.wordName)
                        }),


                )}

            >


                <View style={[firstRowStyle]}>
                    <ScrollView contentContainerStyle={{ paddingHorizontal: 4, }}>
                        <Text style={{ fontSize: 27, color: "#616601", color: "#a75d09" }}>
                            {sourceWord.wordName + sourceWord.wordName + sourceWord.wordName + sourceWord.wordName + sourceWord.wordName + sourceWord.wordName + sourceWord.wordName}
                        </Text>
                    </ScrollView>
                </View>

            </GestureDetector> */}


            {/* <GestureDetector
                gesture={Gesture.Simultaneous(
                    Gesture.Pan()
                        .onStart(e => {
                            isCardMoving.value = true

                        })
                        .onChange(e => {

                            if ((!isScrollingY.value) && (!isScrollingX.value)) {
                                // console.log(e.velocityY)
                                // if (e.velocityY < -2000) {
                                //     frameTransY.value = withTiming(screenHeight - headHeight)
                                // }
                                // else if (e.velocityY > 2000) {
                                //     frameTransY.value = withTiming(0,{duration:150})
                                // }
                                // else {
                                frameTransY.value = frameTransY.value - e.changeY

                                //}



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
                        .enabled(enableScroll),

                    Gesture.LongPress()
                        .onStart((e) => {
                            !isDownloaded.value && runOnJS(downloadWord)(sourceWord.wordName, sourceWord.wordName)
                        }),
                    Gesture.Tap()
                        .onEnd((e) => {
                            console.log(e.absoluteX)
                        })

                )}
            >

                <View style={[secondRowStyle]}>
                    <ScrollView contentContainerStyle={{ paddingHorizontal: 4, }}
                        // onLayout={e => { console.log(e.nativeEvent) }}
                        onContentSizeChange={(w, h) => { console.log("====", h); contentLength.value = h }}
                    >

                        <Text style={{ fontSize: 27, color: "#555555" }}>{sourceWord.meaning}</Text>
                    </ScrollView>

                </View>

            </GestureDetector> */}



            {/* <View style={[secondRowStyle]}>
                <Text style={{ fontSize: 25, color: "#555" }}>{sourceWord.meaning}</Text>
            </View> */}

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

            {/* <View style={[scrollViewStyle]}>
                <ScrollView
                    //    style={{ backgroundColor: "gray", overflow: "scroll" }} // do not use style in <scrollView>,use contentContainerSytle instead 
                    // specify its width and height in its parent element <View>
                    scrollEnabled={true}
                    contentContainerStyle={{ backgroundColor: "lightblue", overflow: "scroll" }}
                    fadingEdgeLength={10}
                >

                    {sourceWord.exampleEnglishArr.map((item, arrIndex) => {
                        return (

                            <SentencePanel key={arrIndex} visibleCard={visibleCard} arrIndex={arrIndex} index={index}>{sourceWord.exampleEnglishArr[arrIndex].sentence}</SentencePanel>
                            // <GestureDetector key={arrIndex} gesture={Gesture.LongPress().onStart(() => {

                            //     runOnJS(vibrate)()

                            //     if (!isListPlaying.value) {

                            //         runOnJS(speak)(sourceWord.exampleEnglishArr[arrIndex].sentence, sourceWord.exampleEnglishArr[arrIndex].sentence)
                            //     }


                            // })}>
                            //     <View style={[sentencePanelStyle, { backgroundColor: getRandomColor() }]}>
                            //         <Text style={{ fontSize: 30 }}>{sourceWord.exampleEnglishArr[arrIndex].sentence}</Text>
                            //         <Text style={{ fontSize: 30 }}>{sourceWord.exampleChineseArr[arrIndex].sentence}</Text>
                            //     </View>
                            // </GestureDetector>
                        )

                    })}

                </ScrollView>
            </View> */}
        </View >


    )
}


function ContentBlock({ index, children, visibleCard, shouldCheckDownload = true, ...props }) {

    const { sourceWordArr, frameTransY, isCardMoving, downloadWord, refreshState, isScrollingY, isScrollingX } = useContext(Context)
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
    }, [visibleCard.current, refreshState])

    const [shouldFramePanning, setShouldFramePanning] = useState(true)
    const contentLength = useSharedValue(160)

    const blockStyle = useAnimatedStyle(() => {

        const isOnFirst = frameTransY.value === screenHeight - (headHeight + 80)
        const isOnTop = frameTransY.value === screenHeight - headHeight
        const shouldContentScroll = contentLength.value > 160


        return {
            width: screenWidth,
            height: isOnFirst ? 0 : "auto",
            minHeight: 0,
            //minHeight: isOnFirst ? (0) : (0),
            maxHeight: 160,


            //      height: frameTransY.value === screenHeight - headHeight - 80 ? 0 : "auto"
            paddingHorizontal: 0,
            paddingBottom: 0,

            margin: 0,

            borderWidth: 0,



            backgroundColor:
                isDownloaded.value
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
                        !isDownloaded.value && runOnJS(downloadWord)(sourceWord.wordName, shouldCheckDownload ? contentPainText : sourceWord.wordName)
                    }),


            )}

        ><View style={[blockStyle]}>
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
                    </ScrollView>
                </LinearGradient>
            </View>
        </GestureDetector>


    )




}











function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function SentencePanel({ ...props }) {

    const { index, type, visibleCard, children, arrIndex } = props


    const { sourceWordArr, speak, downloadWord, refreshState, isListPlaying, scrollRef2 } = useContext(Context)
    const sourceWord = sourceWordArr[index]
    const bc = getRandomColor();



    const isDownloaded = useSharedValue(false)

    useEffect(() => {

        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        const hashName2 = CryptoJS(children).toString()

        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists



        })



    }, [visibleCard.current, refreshState])


    const sentencePanelStyle = useAnimatedStyle(() => {

        return {
            minHeight: 80,
            backgroundColor: isDownloaded.value ? "#81be81ff" : "#ca8a92ff",
            transform: [{ scale: 1 }],
            elevation: 5
        }

    })


    function scrollRef2ScrollToRight() {



        // scrollRef2.current._scrollViewRef.scrollTo({

        //     x: Math.max(10, (index ) * screenWidth - screenWidth * 0.99),
        //     animated: false
        // })
        setTimeout(() => {
            scrollRef2.current._scrollViewRef.scrollTo({ x: (index + 1) * screenWidth, animated: true })
        }, 0);

    }
    function scrollRef2ScrollToLeft() {



        // scrollRef2.current._scrollViewRef.scrollTo({

        //     x: Math.max(10, (index ) * screenWidth - screenWidth * 0.99),
        //     animated: false
        // })
        setTimeout(() => {
            scrollRef2.current._scrollViewRef.scrollTo({ x: (index - 1) * screenWidth, animated: true })
        }, 0);

    }

    return (
        <GestureDetector gesture={Gesture.Simultaneous(
            // Gesture.LongPress().onStart((e) => {

            //     if (!isDownloaded.value) {
            //         runOnJS(downloadWord)(sourceWord.wordName, children)
            //         console.log(children)
            //     }

            // }),
            // Gesture.Tap().onEnd((e) => {

            //     if (!isListPlaying.value) {
            //         console.log(sourceWord.wordName, children)
            //         //    runOnJS(speak)(sourceWord.wordName, children)
            //     }

            // }),
            // Gesture.Pan()//.activeOffsetX([-0, 0]).failOffsetX([-8, 8])
            //     .activeOffsetX([-0, 0]).failOffsetY([-1, 1])
            //     .onStart((e) => {


            //     }).onChange(e => {
            //         //    console.log(e.velocityX)


            //     })
            //     .onFinalize((e) => {
            //         console.log(e.velocityX)
            //         if (e.velocityX >= 1000) {
            //             runOnJS(scrollRef2ScrollToLeft)()
            //         }

            //         else if (e.velocityX <= -1000) {
            //             runOnJS(scrollRef2ScrollToRight)()
            //         }

            //         else if (e.translationX <= -100) {
            //             runOnJS(scrollRef2ScrollToRight)()
            //         }
            //         else if (e.translationX >= 100) {
            //             runOnJS(scrollRef2ScrollToLeft)()
            //         }
            //     })
        )}>
            <View style={[sentencePanelStyle]}>
                <Text style={{ fontSize: 30 }}>{children + children + children + children + children + children + children + children + children + children}</Text>
                <Text style={{ fontSize: 30 }}>{children + children + children + children + children + children + children + children + children + children}</Text>
                <Text style={{ fontSize: 30 }}>{children + children + children + children + children + children + children + children + children + children}</Text>
                <Text style={{ fontSize: 25, color: "#555" }}>{sourceWord.exampleChineseArr[arrIndex].sentence}</Text>
            </View>

        </GestureDetector >

    )

}
