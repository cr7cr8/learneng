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
// var sign = CryptoJS("hellofff").toString();
// console.log(">>>>>>>", sign)
import { LinearGradient } from 'expo-linear-gradient';

const styles = StyleSheet.create({
    textStyle: { width: 100, height: 80, backgroundColor: 'purple' },
    separator: {
        width: '100%',
        borderTopWidth: 0,
    },
    swipeable: {
        // marginTop: 200,
        height: 80,
        //  backgroundColor: 'papayawhip',
        // backgroundColor: 'wheat',
        alignItems: 'center',
        borderWidth: 0,
        borderBottomWidth: 0,
        borderBottomColor: "rgba(168, 155, 147, 1)",//"#D6BD95",
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

function LeftAction(progress, drag, panel) {



    const { autoPlay, isListPlaying } = useContext(Context)
    const styleAnimation = useAnimatedStyle(() => {

        return {
            width: screenWidth,


            backgroundColor: "rgba(168, 155, 147, 1)",
            transform: [{ translateX: drag.value - screenWidth }],
            justifyContent: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 0,

        };
    });






    const iconContainnerStyle = useAnimatedStyle(() => {

        return {
            width: 80,
            height: 80,
            // backgroundColor: panelRef?.dowloadStatus?.value ? "#FCD19D" : "red",//"#D6BD95",
            backgroundColor: "wheat"
        }

    })

    return (
        <View style={styleAnimation}>


            <GestureDetector gesture={Gesture.Tap().onStart(() => {

            }).onEnd(() => {
                panel.close()
            })}>

                <View style={[iconContainnerStyle]}>
                    <Icon
                        name="play-outline" type='ionicon' color='orange'
                        containerStyle={{
                            width: 80, height: 80,
                            transform: [{ rotateZ: "0deg" }], alignItems: "center", justifyContent: "center"
                        }}
                        size={60}

                    />
                </View>
            </GestureDetector>




        </View>
    );
}





export default function SwipebleRowItem(props) {



    // audioPlayer.play()

    const { index, type, frameTransY, visiblePanel, } = props



    const { sourceWordArr, scrollRef, isListPlaying } = useContext(Context)
    const sourceWord = sourceWordArr[index]


    const panelRef = useRef()



    useEffect(() => {
        // console.log(visiblePanel)
        if (!visiblePanel.current.includes(index)) {
            // panelRef.current.close()
            panelRef.current.reset()

        }
    }, [visiblePanel.current])



    return <>
        {/* <GestureHandlerRootView> */}
        <ReanimatedSwipeable
            containerStyle={styles.swipeable}
            friction={2}
            // enableTrackpadTwoFingerGesture
            leftThreshold={20}
            rightThreshold={20}
            renderRightActions={RightAction}
            renderLeftActions={LeftAction

                // function (...props) { 
                //     return <LeftAction progress={props[0]} drag={props[1]} panel={props[2]} panelRef={panelRef} />
                // }
            }
            onSwipeableWillOpen={() => {
                // function endAutoPlay() { 'worklet'; isListPlaying.value = false }
                // isListPlaying.value && function () { runOnUI(endAutoPlay)() }()
            }}
            onSwipeableOpen={(direction) => {
                // console.log(panelRef.current)

                setTimeout(() => {
                    panelRef.current.close()
                }, 2000);

            }}
            ref={panelRef}
        >
            <PanelItem sourceWord={sourceWord} index={index} visiblePanel={visiblePanel} panelRef={panelRef} />
        </ReanimatedSwipeable>
        {/* </GestureHandlerRootView> */}
    </>
}


function PanelItem({ sourceWord, index, visiblePanel, panelRef, ...props }) {



    const { sourceWordArr, scrollRef2, wordPos, frameTransY, shouldFrameDisplay, isListPlaying,
        audioPlayer,
        speak, autoPlay,
        downloadWord, isScrollingX
    } = useContext(Context)




    function scrollRef2Scroll() {

        // speak(sourceWord.wordName)
        // setTimeout(() => { scrollRef2.current._scrollViewRef.scrollTo({ x: index * screenWidth, animated: false }) }, 1000)


        scrollRef2.current._scrollViewRef.scrollTo({

            x: Math.max(10, index * screenWidth - 10),
            animated: false
        })
        setTimeout(() => {
            scrollRef2.current._scrollViewRef.scrollTo({ x: index * screenWidth, animated: true })
        }, 0);

    }









    const singleTap = Gesture.Tap()

        .onStart(e => {

            //runOnJS(vibrate)(100)
            // if (!isListPlaying.value && index == wordPos.value && e.absoluteX <= screenWidth / 3) {
            //     isListPlaying.value = true
            //     runOnJS(autoPlay)()
            // }
            // else if (isListPlaying.value && e.absoluteX <= screenWidth / 3) {
            //     isListPlaying.value = false
            // }
            // else if (isListPlaying.value) {
            // }

            if (!isListPlaying.value) {
                runOnJS(speak)(sourceWord.wordName)
                wordPos.value = index
                runOnJS(scrollRef2Scroll)()
            }



            // if (isListPlaying.value) { isListPlaying.value = false }
            // else if (!isListPlaying.value && index == wordPos.value) {
            //     isListPlaying.value = true
            //     runOnJS(autoPlay)()
            // }
            // else {
            //     runOnJS(speak)(sourceWord.wordName)
            //     wordPos.value = index
            //     runOnJS(scrollRef2Scroll)()
            // }


        })
        .maxDuration(250)
        .numberOfTaps(1)
        .onEnd(e => {
            //    console.log(index, 'Single tap!',);



        })



    const doubleTap = Gesture.Tap()
        .onStart(e => {
            //    frameTransY.value = frameTransY.value === 0 ? 300 : 0

            //  if (isListPlaying.value) { return }
            //    runOnJS(speak)(sourceWord.wordName)
            //    wordPos.value = index
            //    runOnJS(scrollRef2Scroll)()



        })

        .maxDuration(250)
        .numberOfTaps(2)
        .onTouchesUp(e => {
            //   console.log(e.state, "=====")

            //  isListPlaying.value != isListPlaying.value
            //   isListPlaying.value = false
            //  runOnJS(autoPlay)()


        })
        .onEnd(e => {

            //runOnJS(toggleAutoPlay)()

            const y = Math.min(screenHeight - (headHeight + 80), Math.max(160, screenHeight - e.absoluteY - (80 - e.y)))

            if ((!shouldFrameDisplay.value)) {

                shouldFrameDisplay.value = !shouldFrameDisplay.value
                frameTransY.value = withTiming(y, { duration: 200 })
            }


            else if ((shouldFrameDisplay.value)) {

                frameTransY.value = withTiming(0, { duration: 200 }, () => {
                    shouldFrameDisplay.value = !shouldFrameDisplay.value;
                })
            }
         
        })


    function vibrate() {
        Vibration.vibrate(50)
    }





    const downloadStatus = useSharedValue(false)

    useEffect(() => {
        panelRef.downloadStatus = downloadStatus
        //   panelRef.current["downloadStatus"] = downloadStatus
        //    console.log(  panelRef.current.dowloadStatus.value,"----")
    }, [])

    const isFingerOn = useSharedValue(false)
    useEffect(() => {

        isFingerOn.value = false


        FileSystem.getInfoAsync(FileSystem.documentDirectory + `/${sourceWord.wordName}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            downloadStatus.value = exists
            progressWidth.value = 0

        })
    }, [visiblePanel.current])


    function setProgressWidth() {
        progressWidth.value = withTiming(80, { duration: 100 })
    }


    function setDownloadStatusTrue() {
        progressWidth.value = withTiming(screenWidth, { duration: 200 }, () => {
            downloadStatus.value = true
            progressWidth.value = 0
        })
    }
    function setDownloadStatusFalse() {
        progressWidth.value = withTiming(0, { duration: 200 }, () => {
            downloadStatus.value = false
        })
    }


    const longPress = Gesture.LongPress()

        .onStart(e => {
            if (!downloadStatus.value) {
                runOnJS(downloadWord)(sourceWord.wordName, setProgressWidth, setDownloadStatusTrue, setDownloadStatusFalse)

            }


        })


    const panelStyle = useAnimatedStyle(() => {
        return {

            width: screenWidth, height: 80,
            borderBottomWidth: frameTransY.value === screenHeight - headHeight - 80 ? 0 : 1,
            borderBottomColor: "rgba(168, 155, 147, 1)",//"#D6BD95",
            paddingHorizontal: 4,
            // backgroundColor: wordPos.value === index
            //     ? "orange"
            //     : downloadStatus.value



            //         ? "#FCD19D"
            //         : "#D6BD95"
            backgroundColor: downloadStatus.value
                ? "#FCD19D"
                : "#D6BD95"

        }
    })

    const progressWidth = useSharedValue(0)
    const progressStyle = useAnimatedStyle(() => {


        return {
            width: downloadStatus.value ? 0 : progressWidth.value,
            height: 80,
            // backgroundColor: "rgba(30, 117, 77, 1)",
            //  backgroundColor:  "rgba(245, 222, 179,0.8)", 
            // backgroundColor: "rgb(184,167,134)",
            // backgroundColor: "wheat",
            backgroundColor: "wheat",
            position: "absolute",

        }
    })







    const focusedPanelStyle = useAnimatedStyle(() => {
        return {
            position: "absolute",
            top: 0,
            left: 0,
            opacity: wordPos.value == index
                ? 1
                : frameTransY.value === screenHeight - headHeight - 80
                    ? isListPlaying.value ? 1 : 0
                    : 0,
            backgroundColor: "orange"
        }
    })


    const autoButtonStyle = useAnimatedStyle(() => {
        return {
            width: 100, height: 80,
            position: "absolute",
            left: 0, top: 0,
            backgroundColor: isFingerOn.value ? "orange" : "transparent",
            opacity: isFingerOn.value ? 0.5 : 0.1
        }
    })


    const textWordStyle = useAnimatedStyle(() => {

        return {
            fontSize: frameTransY.value === screenHeight - headHeight - 80 ? 45 : 25,
            color: "#a55e0cff"
        }

    })

    const textMeaningStyle = useAnimatedStyle(() => {

        return {
            fontSize: 18,
            color: "#555",
            opacity: frameTransY.value === screenHeight - headHeight - 80 ? 0 : 1
        }
    })

    return (
        <>
            {/* <View style={{ width: screenWidth, height: 80 }}> */}


            <GestureDetector gesture={Gesture.Simultaneous(singleTap, doubleTap, longPress)}>

                <View style={[panelStyle]} >
                    <View style={[progressStyle]}></View>
                    <View style={[focusedPanelStyle]}>
                        <LinearGradient
                            colors={["rgba(255, 179, 80, 0)", 'rgba(255, 179, 80, 0.8)', 'rgba(255, 155, 133, 1)',]}
                            dither={true}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 1 }}
                            locations={[0 / screenWidth, 120 / screenWidth, 0.95]}
                            //Example:  
                            // colors={[red', 'green']}
                            // locations={[0.3,0.4]}  // full red 30% of width   //mixed red-and-green (40% - 30% = 10%) of width     // full green  100% - 40% = 60% of width
                            //                        // ______red = 30%______   ___mixed = 10%___   _________green = 60%__________________     
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                height: 80,
                                width: screenWidth,
                                //     transform:[{translateX:10}]
                            }}
                        />
                    </View>


                    {/* <Text ellipsizeMode={"tail"} style={{ fontSize: 15, transform: [{ translateY: 0 }], color: "#a55e0cff" }} >
                            {index + " "}
                        </Text> */}
                    <Text numberOfLines={1} ellipsizeMode={"tail"} style={textWordStyle} >
                        {sourceWord.wordName + "\n"}
                    </Text>

                    <Text ellipsizeMode={"tail"} style={{
                        position: "absolute", right: 0,
                        fontSize: 15, transform: [{ translateY: 8 }], color: "#555"
                    }}>
                        {index + " "}
                    </Text>

                    <Text numberOfLines={1} ellipsizeMode={"tail"} style={textMeaningStyle} >
                        {sourceWord.meaning}
                    </Text>
                </View >
            </GestureDetector >







            <GestureDetector gesture={
                Gesture.Exclusive(
                    Gesture.Tap().numberOfTaps(2)
                        .onFinalize(e => {
                            isFingerOn.value = false
                        })
                        .onTouchesDown((e) => {
                            isFingerOn.value = true
                        })
                        .onTouchesUp((e) => {
                            isFingerOn.value = false
                        })

                        .onEnd((e) => {
                            // if ((!shouldFrameDisplay.value)) {
                            //     const y = Math.max(160, frameTransY.value)
                            //     frameTransY.value = 0
                            //     shouldFrameDisplay.value = !shouldFrameDisplay.value

                            //     frameTransY.value = withTiming(y, { duration: 200 })
                            // }


                            // else if ((shouldFrameDisplay.value)) {
                            //     const y = frameTransY.value

                            //     frameTransY.value = withTiming(0, { duration: 200 }, () => {
                            //         shouldFrameDisplay.value = !shouldFrameDisplay.value;
                            //         frameTransY.value = y
                            //     })
                            // }

////////////
                            isListPlaying.value = !isListPlaying.value
                            if (isListPlaying.value) {

                                wordPos.value = index
                                runOnJS(scrollRef2Scroll)()
                                runOnJS(autoPlay)()


                                if ((!shouldFrameDisplay.value)) {
                                    const y = Math.max(160, frameTransY.value)
                                    frameTransY.value = 0
                                    shouldFrameDisplay.value = !shouldFrameDisplay.value

                                    frameTransY.value = withTiming(y, { duration: 200 })
                                }


                            }
                            else {

                                if ((!shouldFrameDisplay.value)) {
                                    const y = Math.max(160, frameTransY.value)
                                    frameTransY.value = 0
                                    shouldFrameDisplay.value = !shouldFrameDisplay.value

                                    frameTransY.value = withTiming(y, { duration: 200 })
                                }


                                // if ((shouldFrameDisplay.value)) {
                                //     wordPos.value = index
                                //     runOnJS(scrollRef2Scroll)()
                                //     const y = frameTransY.value
                                //     frameTransY.value = withTiming(0, { duration: 200 }, () => {
                                //         shouldFrameDisplay.value = !shouldFrameDisplay.value;
                                //         frameTransY.value = y
                                //     })
                                // }

                            }
                        }),
                    Gesture.Tap().numberOfTaps(1)
                        .onFinalize(e => {
                            isFingerOn.value = false
                        })
                        .onTouchesDown((e) => {
                            isFingerOn.value = true
                        })
                        .onTouchesUp((e) => {
                            isFingerOn.value = false
                        })

                        .onStart(() => {
                            if (!isListPlaying.value) {
                                wordPos.value = index
                                runOnJS(scrollRef2Scroll)()
                                runOnJS(speak)(sourceWord.wordName)
                            }
                        }),
                    Gesture.LongPress()
                        .onFinalize(e => {
                            isFingerOn.value = false
                        })
                        .onTouchesDown((e) => {
                            isFingerOn.value = true
                        })
                        .onTouchesUp((e) => {
                            isFingerOn.value = false
                        })
                        .onStart(e => {
                            if (!downloadStatus.value) {
                                runOnJS(downloadWord)(sourceWord.wordName, setProgressWidth, setDownloadStatusTrue, setDownloadStatusFalse)

                            }


                        })



                    //singleTap, longPress

                )
            }
            >

                <View style={[autoButtonStyle]} />

            </GestureDetector>
            {/* </View> */}
        </>)


}

{/* <View style={[iconContainnerStyle]}>
                    <Icon
                        name="play-outline" type='ionicon' color='wheat'
                        containerStyle={{
                            width: 80, height: 80,
                            transform: [{ rotateZ: "0deg" }], alignItems: "center", justifyContent: "center"
                        }}
                        size={60}

                    />
                </View> */}

function FunctionalComponent(props) {
    return <View
        collapsable={false}
        collapsableChildren={false}
        style={{ width: 200, height: 80, left: 0, top: 0, zIndex: 80, backgroundColor: "red", transform: [{ translateY: -80 }], opacity: 0.5 }} >
        {props.children}
    </View>;
}