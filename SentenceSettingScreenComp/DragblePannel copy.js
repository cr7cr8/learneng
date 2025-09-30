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


import DraggableFlatList, {
    ScaleDecorator,
} from "react-native-draggable-flatlist";


function LeftAction({ props, sourceWord, item, arrIndex, getIndex, isWord = false }) {



    const progress = props[0]
    const dragWidth = props[1]
    const panel = props[2]

    const { sourceWordArr, setSouceWordArr, refreshWordToFile } = useContext(Context)



    useEffect(() => {

        setFirstTimeAmountEN(item.firstTimeAmountEN)
        setFirstTimeAmountCH(item.firstTimeAmountCH)
        setSecondTimeAmountEN(item.secondTimeAmountEN)
        setSecondTimeAmountCH(item.secondTimeAmountCH)

    }, [item])


    const [firstTimeAmountEN, setFirstTimeAmountEN] = useState(item.firstTimeAmountEN)
    const [firstTimeAmountCH, setFirstTimeAmountCH] = useState(item.firstTimeAmountCH)
    const [secondTimeAmountEN, setSecondTimeAmountEN] = useState(item.secondTimeAmountEN)
    const [secondTimeAmountCH, setSecondTimeAmountCH] = useState(item.secondTimeAmountCH)




    function increaseAmount(amountCode) {

        if (amountCode == "EN-firstTime") {
            setFirstTimeAmountEN(value => (value + 1) % 4)
        }
        else if (amountCode == "CH-firstTime") {
            setFirstTimeAmountCH(value => (value + 1) % 4)
        }
        else if (amountCode == "EN-secondTime") {
            setSecondTimeAmountEN(value => (value + 1) % 4)
        }
        else if (amountCode == "CH-secondTime") {
            setSecondTimeAmountCH(value => (value + 1) % 4)
        }
    }

    function saveAmount() {


        setSouceWordArr(sourceWordArr => {

            const arr = sourceWordArr.map(word => {

                if (word.wordName !== sourceWord.wordName) {
                    return word
                }
                else {
                    const newWord = JSON.parse(JSON.stringify(word))

                    if (isWord === false) {
                        newWord.exampleEnglishArr[arrIndex].firstTimeAmount = firstTimeAmountEN
                        newWord.exampleChineseArr[arrIndex].firstTimeAmount = firstTimeAmountCH
                        newWord.exampleEnglishArr[arrIndex].secondTimeAmount = secondTimeAmountEN
                        newWord.exampleChineseArr[arrIndex].secondTimeAmount = secondTimeAmountCH
                    }
                    else {
                        newWord.firstTimeAmount = firstTimeAmountEN
                        newWord.firstTimeMeaningAmount = firstTimeAmountCH
                        newWord.secondTimeAmount = secondTimeAmountEN
                        newWord.secondTimeMeaningAmount = secondTimeAmountCH

                    }

                    return newWord

                }

            })


            return [...arr]

        })

        panel.close()
        setTimeout(() => {
            refreshWordToFile()
        }, 100);


    }


    return (
        <View style={[
            { backgroundColor: "lightgreen", width: 300, height: 80, display: "flex", flexDirection: "row", alignItems: "center" },
            useAnimatedStyle(() => {
                return {
                    transform: [{ scale: interpolate(props[1].value, [0, 300], [0, 1], "clamp") }]
                    //transform: [{ translateX: interpolate(props[1].value, [0, 300], [-300, 0], "extend") }]
                    //opacity:interpolate(props[1].value, [0, 300], [0, 1], "clamp")
                }
            })
        ]}>

            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(increaseAmount)("EN-firstTime")
            })}>
                <View style={{
                    height: 60, width: 60,
                    backgroundColor: firstTimeAmountEN == item.firstTimeAmountEN ? "lightgray" : "lightblue",
                    justifyContent: "center", alignItems: "center"
                }}>
                    <Text style={{ fontSize: 30 }}>{firstTimeAmountEN}</Text>
                </View>
            </GestureDetector>

            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(increaseAmount)("CH-firstTime")
            })}>
                <View style={{
                    height: 60, width: 60,
                    backgroundColor: firstTimeAmountCH == item.firstTimeAmountCH ? "lightgray" : "lightblue",
                    justifyContent: "center", alignItems: "center"
                }}>
                    <Text style={{ fontSize: 30 }}>{firstTimeAmountCH}</Text>
                </View>
            </GestureDetector>


            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(increaseAmount)("EN-secondTime")
            })}>
                <View style={{
                    height: 60, width: 60,
                    backgroundColor: secondTimeAmountEN == item.secondTimeAmountEN ? "lightgray" : "lightblue",
                    justifyContent: "center", alignItems: "center"
                }}>
                    <Text style={{ fontSize: 30 }}>{secondTimeAmountEN}</Text>
                </View>
            </GestureDetector>

            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(increaseAmount)("CH-secondTime")
            })}>
                <View style={{
                    height: 60, width: 60,
                    backgroundColor: secondTimeAmountCH == item.secondTimeAmountCH ? "lightgray" : "lightblue",
                    justifyContent: "center", alignItems: "center"
                }}>
                    <Text style={{ fontSize: 30 }}>{secondTimeAmountCH}</Text>
                </View>
            </GestureDetector>




            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(saveAmount)()
            })}>
                <View style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                    <Icon
                        name="save" type='ionicon' color='orange'
                        containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "180deg" }], backgroundColor: "#aaf", justifyContent: "center" }}
                        size={45}
                    />
                </View>
            </GestureDetector>




        </View>
    )
}



function RightAction({ props, sourceWord, arrIndex, getIndex, isDownloaded, isWord = false }) {

    const { sourceWordArr, setSouceWordArr, refreshWordToFile, downloadWord, deleteDownloadWord, setRefreshState } = useContext(Context)

    const progress = props[0]
    const dragWidth = props[1]
    const panel = props[2]

    const navigate = useNavigation()
    function closePanel() {
        panel.close()
    }

    function checkDownload() {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        //const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        const hashName2 = isWord ? hashName1 : CryptoJS(sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
            setTimeout(() => {
                setRefreshState(Math.random())
            }, 100);

        })

    }

    function addSentence() {


        setSouceWordArr(sourceWordArr => {

            const arr = sourceWordArr.map(word => {
                if (sourceWord.wordName !== word.wordName) {
                    return word
                }
                else {
                    const randomNum = Math.round(1000 * Math.random())
                    const newWord = JSON.parse(JSON.stringify(word))

                    if (isWord) {
                        newWord.exampleEnglishArr.splice(arrIndex, 0, { "firstTimeAmount": 1, "key": "en-272201", "secondTimeAmount": 1, "sentence": `random sentence of ${word.wordName} ${randomNum}` })
                        newWord.exampleChineseArr.splice(arrIndex, 0, { "firstTimeAmount": 1, "key": "cn-272201", "secondTimeAmount": 1, "sentence": `${word.wordName} 随机句子 ${randomNum}` })

                    }
                    else {
                        newWord.exampleEnglishArr.splice(arrIndex + 1, 0, { "firstTimeAmount": 1, "key": "en-272201", "secondTimeAmount": 1, "sentence": `random sentence of ${word.wordName} ${randomNum}` })
                        newWord.exampleChineseArr.splice(arrIndex + 1, 0, { "firstTimeAmount": 1, "key": "cn-272201", "secondTimeAmount": 1, "sentence": `${word.wordName} 随机句子 ${randomNum}` })

                    }

                    return newWord
                }

            })
            closePanel()
            return arr
        })

    }

    function deleteSentence() {

        if (isWord) {
            navigate.goBack()
            setTimeout(() => {
                setSouceWordArr(sourceWordArr => {
                    const arr = sourceWordArr.filter(word => {
                        if (sourceWord.wordName !== word.wordName) {
                            return true
                        }
                        else {

                            // const newWord = JSON.parse(JSON.stringify(word))
                            // newWord.exampleEnglishArr.splice(arrIndex, 1)
                            // newWord.exampleChineseArr.splice(arrIndex, 1)

                            // setTimeout(() => {
                            //     deleteDownloadWord(word.wordName, word.exampleEnglishArr[arrIndex].sentence, checkDownload)
                            // }, 100);

                            return false
                        }

                    })


                    const hashName1 = CryptoJS(sourceWord.wordName).toString()

                    FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(data => {
                        // const { exists, isDirectory, size, uri } = item
                        // isDownloaded.value = exists
                        // setTimeout(() => {
                        //     setRefreshState(Math.random())
                        // }, 100);
                        data.forEach(item => {
                            if (item.substring(0, 64) === hashName1) {
                                FileSystem.deleteAsync(FileSystem.documentDirectory + item, { idempotent: true })
                            }


                        })

                    })


                    return arr
                })
            }, 0);




        }
        else {
            setSouceWordArr(sourceWordArr => {
                const arr = sourceWordArr.map(word => {
                    if (sourceWord.wordName !== word.wordName) {
                        return word
                    }
                    else {

                        const newWord = JSON.parse(JSON.stringify(word))
                        newWord.exampleEnglishArr.splice(arrIndex, 1)
                        newWord.exampleChineseArr.splice(arrIndex, 1)

                        setTimeout(() => {
                            deleteDownloadWord(word.wordName, word.exampleEnglishArr[arrIndex].sentence, checkDownload)
                        }, 100);

                        return newWord
                    }

                })

                closePanel()
                return arr
            })

        }


    }


    //console.log(sourceWord.wordName,sourceWord.exampleEnglishArr[getIndex()].sentence)

    function setIsDownloadFalse() {
        isDownloaded.value = false
    }
    function setIsDownloadTrue() {
        isDownloaded.value = true
    }


    return (
        <View style={[{ backgroundColor: "pink", width: 240, height: 80, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" },
        useAnimatedStyle(() => {
            return {
                transform: [{ scale: interpolate((-props[1].value), [0, 240], [0, 1], "clamp") }]
            }
        })


        ]}>
            <View style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                <Icon
                    onPress={e => {
                        // console.log(e.nativeEvent)
                        addSentence()
                    }}


                    name="add-circle-outline" type='ionicon' color='orange'
                    containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "0deg" }], backgroundColor: "#aaf", justifyContent: "center" }}
                    size={50}
                />
            </View>


            <GestureDetector gesture={Gesture.LongPress()
                .onStart(e => {
                    runOnJS(deleteSentence)()
                })
            }>
                <View style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                    <Icon

                        name="trash-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "0deg" }], backgroundColor: "#aaf", justifyContent: "center" }}
                        size={50}
                    />
                </View>
            </GestureDetector>
            <View style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                <Icon
                    name="create-outline" type='ionicon' color='orange'
                    containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "0deg" }], backgroundColor: "#aaf", justifyContent: "center" }}
                    size={50}
                />
            </View>

            <GestureDetector gesture={Gesture.LongPress()
                .onStart(e => {
                    runOnJS(downloadWord)(sourceWord.wordName, isWord ? sourceWord.wordName : sourceWord.exampleEnglishArr[arrIndex].sentence,
                        //  checkDownload
                        setIsDownloadTrue
                    )
                    runOnJS(closePanel)()
                })
            }>
                <View style={[{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }, useAnimatedStyle(() => {
                    return {
                        opacity: isDownloaded.value ? 0 : 1,
                        transform: [{ scale: isDownloaded.value ? 0 : 1 }]
                    }
                })]}>
                    <Icon
                        name="cloud-download-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "0deg" }], backgroundColor: "#aaf", justifyContent: "center" }}
                        size={50}
                    />
                </View>
            </GestureDetector>


            <GestureDetector gesture={Gesture.LongPress()
                .onStart(e => {
                    runOnJS(deleteDownloadWord)(sourceWord.wordName, isWord ? sourceWord.wordName : sourceWord.exampleEnglishArr[arrIndex].sentence,
                        //    checkDownload
                        setIsDownloadFalse
                    )
                    runOnJS(closePanel)()
                })
            }>
                <View style={[{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }, useAnimatedStyle(() => {
                    return {
                        backgroundColor: "rgba(123,212,143,0.9)",
                        position: "absolute",
                        right: 0,
                        zIndex: 100,
                        opacity: isDownloaded.value ? 1 : 0,
                        transform: [{ scale: isDownloaded.value ? 1 : 0 }]
                    }

                })]}>


                    <Icon
                        // onLongPress={function () {}} // not working in swipble panel
                        name="cloud-offline-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "0deg" }], backgroundColor: "transparent", justifyContent: "center" }}
                        size={50}
                    />
                </View>
            </GestureDetector>

        </View >
    )
}






export function DragblePannel({ item, drag, isActive, getIndex, allPannelArr }) {

    const english = item.englishLabel
    // const chinese = item.chineseLabel

    const { sourceWord, arrIndex } = item
    const isDownloaded = useSharedValue(false)

    //console.log(sourceWord)

    useEffect(() => {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        const hashName2 = CryptoJS(english).toString()
        // const hashName2 = CryptoJS(sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
        })
    }, [item])


    const panelRef = useAnimatedRef()

    if (!drag) {

        return (
            <ReanimatedSwipeable
                dragOffsetFromLeftEdge={5}
                dragOffsetFromRightEdge={5}
                ref={(ref) => {
                    allPannelArr.current.push(ref)
                    panelRef.current = ref
                }}

                containerStyle={{ backgroundColor: "darkgray" }}
                friction={1}
                // enableTrackpadTwoFingerGesture
                leftThreshold={10}
                rightThreshold={10}
                onSwipeableWillOpen={(e) => {
                    //  console.log(e)
                }}
                renderRightActions={

                    function (...props) {

                        return (
                            <>
                                <RightAction props={props} sourceWord={sourceWord} item={item} arrIndex={arrIndex} getIndex={getIndex} isDownloaded={isDownloaded} isWord={true} />
                            </>
                        )
                    }


                }
                renderLeftActions={

                    function (...props) {

                        return (
                            <LeftAction props={props} sourceWord={sourceWord} item={item} arrIndex={arrIndex} getIndex={getIndex} isWord={true} />
                            // <RightAction props={props} sourceWord={sourceWord} arrIndex={arrIndex} getIndex={getIndex} isDownloaded={isDownloaded} />
                        )
                    }



                }

            >


                <View
                    style={[useAnimatedStyle(() => {


                        return {
                            width: screenWidth, height: 80, justifyContent: "center", alignItems: "center", borderBottomWidth: 1,
                            borderBottomColor: "#D2B48C",
                            backgroundColor: isDownloaded.value ? "wheat" : "#e7cca0",
                            // backgroundColor: "gray"
                            // marginBottom: isActive
                            //     ? 0
                            //     : isLast ? screenHeight - headHeight - 80 - 80 : 0
                            marginBottom: 0


                        }


                    })]}>
                    <Text style={{ fontSize: 18 }} ellipsizeMode={"tail"} numberOfLines={2}>{item.englishLabel}</Text>
                    <Text style={{ fontSize: 15 }} ellipsizeMode={"tail"} numberOfLines={1}>{item.chineseLabel}</Text>
                </View>





            </ReanimatedSwipeable>




        )



    }





    return (
        <>

            <ScaleDecorator activeScale={0.9} key={item.key}>



                <ReanimatedSwipeable
                    dragOffsetFromLeftEdge={5}
                    dragOffsetFromRightEdge={5}
                    ref={(ref) => {
                        allPannelArr.current.push(ref)
                        panelRef.current = ref
                    }}

                    containerStyle={{ backgroundColor: "darkgray" }}
                    friction={1}
                    // enableTrackpadTwoFingerGesture
                    leftThreshold={10}
                    rightThreshold={10}
                    onSwipeableWillOpen={(e) => {
                        //  console.log(e)
                    }}
                    renderRightActions={

                        function (...props) {

                            return (
                                <>
                                    <RightAction props={props} sourceWord={sourceWord} item={item} arrIndex={arrIndex} getIndex={getIndex} isDownloaded={isDownloaded} />
                                </>
                            )
                        }


                    }
                    renderLeftActions={

                        function (...props) {

                            return (
                                <LeftAction props={props} sourceWord={sourceWord} item={item} arrIndex={arrIndex} getIndex={getIndex} />
                                // <RightAction props={props} sourceWord={sourceWord} arrIndex={arrIndex} getIndex={getIndex} isDownloaded={isDownloaded} />
                            )
                        }



                    }

                >

                    <TouchableOpacity
                        activeOpacity={1}
                        disabled={isActive}
                        onLongPress={() => {
                            allPannelArr.current.forEach(panel => panel?.close())
                            setTimeout(() => {
                                drag()
                            }, 0);

                        }}>
                        <View
                            style={[useAnimatedStyle(() => {


                                return {
                                    width: screenWidth, height: 80, justifyContent: "center", alignItems: "center", borderBottomWidth: 1,
                                    borderBottomColor: "#D2B48C",
                                    backgroundColor: isDownloaded.value ? "wheat" : "#e7cca0",
                                    // backgroundColor: "gray"
                                    // marginBottom: isActive
                                    //     ? 0
                                    //     : isLast ? screenHeight - headHeight - 80 - 80 : 0
                                    marginBottom: 0


                                }


                            })]}>
                            <Text style={{ fontSize: 18 }} ellipsizeMode={"tail"} numberOfLines={2}>{item.englishLabel}</Text>
                            <Text style={{ fontSize: 15 }} ellipsizeMode={"tail"} numberOfLines={1}>{item.chineseLabel}</Text>
                        </View>




                    </TouchableOpacity>

                </ReanimatedSwipeable>



            </ScaleDecorator>




        </>
    )

}



function HeadLeft({ props, sourceWord, item, arrIndex, getIndex, isWord = false }) {



    const progress = props[0]
    const dragWidth = props[1]
    const panel = props[2]

    const { sourceWordArr, setSouceWordArr, refreshWordToFile } = useContext(Context)



    useEffect(() => {

        setFirstTimeAmountEN(item.firstTimeAmountEN)
        setFirstTimeAmountCH(item.firstTimeAmountCH)
        setSecondTimeAmountEN(item.secondTimeAmountEN)
        setSecondTimeAmountCH(item.secondTimeAmountCH)

    }, [item])


    const [firstTimeAmountEN, setFirstTimeAmountEN] = useState(item.firstTimeAmountEN)
    const [firstTimeAmountCH, setFirstTimeAmountCH] = useState(item.firstTimeAmountCH)
    const [secondTimeAmountEN, setSecondTimeAmountEN] = useState(item.secondTimeAmountEN)
    const [secondTimeAmountCH, setSecondTimeAmountCH] = useState(item.secondTimeAmountCH)




    function increaseAmount(amountCode) {

        if (amountCode == "EN-firstTime") {
            setFirstTimeAmountEN(value => (value + 1) % 4)
        }
        else if (amountCode == "CH-firstTime") {
            setFirstTimeAmountCH(value => (value + 1) % 4)
        }
        else if (amountCode == "EN-secondTime") {
            setSecondTimeAmountEN(value => (value + 1) % 4)
        }
        else if (amountCode == "CH-secondTime") {
            setSecondTimeAmountCH(value => (value + 1) % 4)
        }
    }

    function saveAmount() {


        setSouceWordArr(sourceWordArr => {

            const arr = sourceWordArr.map(word => {

                if (word.wordName !== sourceWord.wordName) {
                    return word
                }
                else {
                    const newWord = JSON.parse(JSON.stringify(word))

                    if (isWord === false) {
                        newWord.exampleEnglishArr[arrIndex].firstTimeAmount = firstTimeAmountEN
                        newWord.exampleChineseArr[arrIndex].firstTimeAmount = firstTimeAmountCH
                        newWord.exampleEnglishArr[arrIndex].secondTimeAmount = secondTimeAmountEN
                        newWord.exampleChineseArr[arrIndex].secondTimeAmount = secondTimeAmountCH
                    }
                    else {
                        newWord.firstTimeAmount = firstTimeAmountEN
                        newWord.firstTimeMeaningAmount = firstTimeAmountCH
                        newWord.secondTimeAmount = secondTimeAmountEN
                        newWord.secondTimeMeaningAmount = secondTimeAmountCH

                    }

                    return newWord

                }

            })


            return [...arr]

        })

        panel.close()
        setTimeout(() => {
            refreshWordToFile()
        }, 100);


    }


    return (
        <View style={[
            { backgroundColor: "lightgreen", width: 300, height: 80, display: "flex", flexDirection: "row", alignItems: "center" },
            useAnimatedStyle(() => {
                return {
                    transform: [{ scale: interpolate(props[1].value, [0, 300], [0, 1], "clamp") }]
                    //transform: [{ translateX: interpolate(props[1].value, [0, 300], [-300, 0], "extend") }]
                    //opacity:interpolate(props[1].value, [0, 300], [0, 1], "clamp")
                }
            })
        ]}>

            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(increaseAmount)("EN-firstTime")
            })}>
                <View style={{
                    height: 60, width: 60,
                    backgroundColor: firstTimeAmountEN == item.firstTimeAmountEN ? "lightgray" : "lightblue",
                    justifyContent: "center", alignItems: "center"
                }}>
                    <Text style={{ fontSize: 30 }}>{firstTimeAmountEN}</Text>
                </View>
            </GestureDetector>

            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(increaseAmount)("CH-firstTime")
            })}>
                <View style={{
                    height: 60, width: 60,
                    backgroundColor: firstTimeAmountCH == item.firstTimeAmountCH ? "lightgray" : "lightblue",
                    justifyContent: "center", alignItems: "center"
                }}>
                    <Text style={{ fontSize: 30 }}>{firstTimeAmountCH}</Text>
                </View>
            </GestureDetector>


            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(increaseAmount)("EN-secondTime")
            })}>
                <View style={{
                    height: 60, width: 60,
                    backgroundColor: secondTimeAmountEN == item.secondTimeAmountEN ? "lightgray" : "lightblue",
                    justifyContent: "center", alignItems: "center"
                }}>
                    <Text style={{ fontSize: 30 }}>{secondTimeAmountEN}</Text>
                </View>
            </GestureDetector>

            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(increaseAmount)("CH-secondTime")
            })}>
                <View style={{
                    height: 60, width: 60,
                    backgroundColor: secondTimeAmountCH == item.secondTimeAmountCH ? "lightgray" : "lightblue",
                    justifyContent: "center", alignItems: "center"
                }}>
                    <Text style={{ fontSize: 30 }}>{secondTimeAmountCH}</Text>
                </View>
            </GestureDetector>




            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(saveAmount)()
            })}>
                <View style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                    <Icon
                        name="save" type='ionicon' color='orange'
                        containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "180deg" }], backgroundColor: "#aaf", justifyContent: "center" }}
                        size={45}
                    />
                </View>
            </GestureDetector>




        </View>
    )
}

function HeadRight({ props, sourceWord, arrIndex, getIndex, isDownloaded, isWord = false }) {

    const { sourceWordArr, setSouceWordArr, refreshWordToFile, downloadWord, deleteDownloadWord, setRefreshState } = useContext(Context)

    const progress = props[0]
    const dragWidth = props[1]
    const panel = props[2]

    const navigate = useNavigation()
    function closePanel() {
        panel.close()
    }

    function checkDownload() {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        //const hashName2 = CryptoJS(shouldCheckDownload ? contentPainText : sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        const hashName2 = isWord ? hashName1 : CryptoJS(sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
            setTimeout(() => {
                setRefreshState(Math.random())
            }, 100);

        })

    }

    function addSentence() {


        setSouceWordArr(sourceWordArr => {

            const arr = sourceWordArr.map(word => {
                if (sourceWord.wordName !== word.wordName) {
                    return word
                }
                else {
                    const randomNum = Math.round(1000 * Math.random())
                    const newWord = JSON.parse(JSON.stringify(word))

                    if (isWord) {
                        newWord.exampleEnglishArr.splice(arrIndex, 0, { "firstTimeAmount": 1, "key": "en-272201", "secondTimeAmount": 1, "sentence": `random sentence of ${word.wordName} ${randomNum}` })
                        newWord.exampleChineseArr.splice(arrIndex, 0, { "firstTimeAmount": 1, "key": "cn-272201", "secondTimeAmount": 1, "sentence": `${word.wordName} 随机句子 ${randomNum}` })

                    }
                    else {
                        newWord.exampleEnglishArr.splice(arrIndex + 1, 0, { "firstTimeAmount": 1, "key": "en-272201", "secondTimeAmount": 1, "sentence": `random sentence of ${word.wordName} ${randomNum}` })
                        newWord.exampleChineseArr.splice(arrIndex + 1, 0, { "firstTimeAmount": 1, "key": "cn-272201", "secondTimeAmount": 1, "sentence": `${word.wordName} 随机句子 ${randomNum}` })

                    }

                    return newWord
                }

            })
            closePanel()
            return arr
        })

    }

    function deleteSentence() {

        if (isWord) {
            navigate.goBack()
            setTimeout(() => {
                setSouceWordArr(sourceWordArr => {
                    const arr = sourceWordArr.filter(word => {
                        if (sourceWord.wordName !== word.wordName) {
                            return true
                        }
                        else {

                            // const newWord = JSON.parse(JSON.stringify(word))
                            // newWord.exampleEnglishArr.splice(arrIndex, 1)
                            // newWord.exampleChineseArr.splice(arrIndex, 1)

                            // setTimeout(() => {
                            //     deleteDownloadWord(word.wordName, word.exampleEnglishArr[arrIndex].sentence, checkDownload)
                            // }, 100);

                            return false
                        }

                    })


                    const hashName1 = CryptoJS(sourceWord.wordName).toString()

                    FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(data => {
                        // const { exists, isDirectory, size, uri } = item
                        // isDownloaded.value = exists
                        // setTimeout(() => {
                        //     setRefreshState(Math.random())
                        // }, 100);
                        data.forEach(item => {
                            if (item.substring(0, 64) === hashName1) {
                                FileSystem.deleteAsync(FileSystem.documentDirectory + item, { idempotent: true })
                            }


                        })

                    })


                    return arr
                })
            }, 0);




        }
        else {
            setSouceWordArr(sourceWordArr => {
                const arr = sourceWordArr.map(word => {
                    if (sourceWord.wordName !== word.wordName) {
                        return word
                    }
                    else {

                        const newWord = JSON.parse(JSON.stringify(word))
                        newWord.exampleEnglishArr.splice(arrIndex, 1)
                        newWord.exampleChineseArr.splice(arrIndex, 1)

                        setTimeout(() => {
                            deleteDownloadWord(word.wordName, word.exampleEnglishArr[arrIndex].sentence, checkDownload)
                        }, 100);

                        return newWord
                    }

                })

                closePanel()
                return arr
            })

        }


    }


    //console.log(sourceWord.wordName,sourceWord.exampleEnglishArr[getIndex()].sentence)

    function setIsDownloadFalse() {
        isDownloaded.value = false
    }
    function setIsDownloadTrue() {
        isDownloaded.value = true
    }


    return (
        <View style={[{ backgroundColor: "pink", width: 240, height: 80, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" },
        useAnimatedStyle(() => {
            return {
                transform: [{ scale: interpolate((-props[1].value), [0, 240], [0, 1], "clamp") }]
            }
        })


        ]}>
            <View style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                <Icon
                    onPress={e => {
                        // console.log(e.nativeEvent)
                        addSentence()
                    }}


                    name="add-circle-outline" type='ionicon' color='orange'
                    containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "0deg" }], backgroundColor: "#aaf", justifyContent: "center" }}
                    size={50}
                />
            </View>


            <GestureDetector gesture={Gesture.LongPress()
                .onStart(e => {
                    runOnJS(deleteSentence)()
                })
            }>
                <View style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                    <Icon

                        name="trash-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "0deg" }], backgroundColor: "#aaf", justifyContent: "center" }}
                        size={50}
                    />
                </View>
            </GestureDetector>
            <View style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                <Icon
                    name="create-outline" type='ionicon' color='orange'
                    containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "0deg" }], backgroundColor: "#aaf", justifyContent: "center" }}
                    size={50}
                />
            </View>

            <GestureDetector gesture={Gesture.LongPress()
                .onStart(e => {
                    runOnJS(downloadWord)(sourceWord.wordName, isWord ? sourceWord.wordName : sourceWord.exampleEnglishArr[arrIndex].sentence,
                        //  checkDownload
                        setIsDownloadTrue
                    )
                    runOnJS(closePanel)()
                })
            }>
                <View style={[{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }, useAnimatedStyle(() => {
                    return {
                        opacity: isDownloaded.value ? 0 : 1,
                        transform: [{ scale: isDownloaded.value ? 0 : 1 }]
                    }
                })]}>
                    <Icon
                        name="cloud-download-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "0deg" }], backgroundColor: "#aaf", justifyContent: "center" }}
                        size={50}
                    />
                </View>
            </GestureDetector>


            <GestureDetector gesture={Gesture.LongPress()
                .onStart(e => {
                    runOnJS(deleteDownloadWord)(sourceWord.wordName, isWord ? sourceWord.wordName : sourceWord.exampleEnglishArr[arrIndex].sentence,
                        //    checkDownload
                        setIsDownloadFalse
                    )
                    runOnJS(closePanel)()
                })
            }>
                <View style={[{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }, useAnimatedStyle(() => {
                    return {
                        backgroundColor: "rgba(123,212,143,0.9)",
                        position: "absolute",
                        right: 0,
                        zIndex: 100,
                        opacity: isDownloaded.value ? 1 : 0,
                        transform: [{ scale: isDownloaded.value ? 1 : 0 }]
                    }

                })]}>


                    <Icon
                        // onLongPress={function () {}} // not working in swipble panel
                        name="cloud-offline-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "0deg" }], backgroundColor: "transparent", justifyContent: "center" }}
                        size={50}
                    />
                </View>
            </GestureDetector>

        </View >
    )
}



export function HeadPanel({ item, drag, isActive, getIndex, allPannelArr }) {

    const english = item.englishLabel
    // const chinese = item.chineseLabel

    const { sourceWord, arrIndex } = item
    const isDownloaded = useSharedValue(false)

    //console.log(sourceWord)

    useEffect(() => {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        const hashName2 = CryptoJS(english).toString()
        // const hashName2 = CryptoJS(sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
        })
    }, [item])


    const panelRef = useAnimatedRef()



    return (
        <ReanimatedSwipeable
            dragOffsetFromLeftEdge={5}
            dragOffsetFromRightEdge={5}
            ref={(ref) => {
                allPannelArr.current.push(ref)
                panelRef.current = ref
            }}

            containerStyle={{ backgroundColor: "darkgray" }}
            friction={1}
            // enableTrackpadTwoFingerGesture
            leftThreshold={10}
            rightThreshold={10}
            onSwipeableWillOpen={(e) => {
                //  console.log(e)
            }}
            renderRightActions={

                function (...props) {

                    return (
                        <>
                            <HeadRight props={props} sourceWord={sourceWord} item={item} arrIndex={arrIndex} getIndex={getIndex} isDownloaded={isDownloaded} isWord={true} />
                        </>
                    )
                }


            }
            renderLeftActions={

                function (...props) {

                    return (
                        <HeadLeft props={props} sourceWord={sourceWord} item={item} arrIndex={arrIndex} getIndex={getIndex} isWord={true} />
                        // <RightAction props={props} sourceWord={sourceWord} arrIndex={arrIndex} getIndex={getIndex} isDownloaded={isDownloaded} />
                    )
                }



            }

        >


            <View
                style={[useAnimatedStyle(() => {


                    return {
                        width: screenWidth, height: 80, justifyContent: "center", alignItems: "center", borderBottomWidth: 1,
                        borderBottomColor: "#D2B48C",
                        backgroundColor: isDownloaded.value ? "wheat" : "#e7cca0",
                        // backgroundColor: "gray"
                        // marginBottom: isActive
                        //     ? 0
                        //     : isLast ? screenHeight - headHeight - 80 - 80 : 0
                        marginBottom: 0


                    }


                })]}>
                <Text style={{ fontSize: 18 }} ellipsizeMode={"tail"} numberOfLines={2}>{item.englishLabel}</Text>
                <Text style={{ fontSize: 15 }} ellipsizeMode={"tail"} numberOfLines={1}>{item.chineseLabel}</Text>
            </View>





        </ReanimatedSwipeable>




    )



}








