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

import { StyleSheet, Button, Dimensions, TouchableOpacity, SafeAreaView, RefreshControl, BackHandler, Alert, Vibration, Keyboard } from 'react-native';
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
    FlipOutEasyX,
    FlipInEasyX

} from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { FadeIn, FadeOut, BounceIn, BounceOut, SlideOutUp } from 'react-native-reanimated';
const { View, Text, FlatList, ScrollView, } = ReAnimated

import { Context } from '../ContextProvider';
import { DragListContext } from "../SentenceSettingScreen";


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


function LeftAction({ props, sourceWord, item, arrIndex, getIndex }) {



    const progress = props[0]
    const dragWidth = props[1]
    const panel = props[2]

    const { sourceWordArr, setSouceWordArr, saveWordToFile } = useContext(Context)

    const navigation = useNavigation()

    // useEffect(() => {


    //         setFirstTimeAmountEN(item.firstTimeAmountEN)
    //         setFirstTimeAmountCH(item.firstTimeAmountCH)
    //         setSecondTimeAmountEN(item.secondTimeAmountEN)
    //         setSecondTimeAmountCH(item.secondTimeAmountCH)



    // }, [item])





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
        panel.close()
        setTimeout(() => {
            setSouceWordArr(sourceWordArr => {

                const arr = sourceWordArr.map(word => {

                    if (word.wordName !== sourceWord.wordName) {
                        return word
                    }
                    else {
                        const newWord = JSON.parse(JSON.stringify(word))


                        newWord.exampleEnglishArr[arrIndex].firstTimeAmount = firstTimeAmountEN
                        newWord.exampleChineseArr[arrIndex].firstTimeAmount = firstTimeAmountCH
                        newWord.exampleEnglishArr[arrIndex].secondTimeAmount = secondTimeAmountEN
                        newWord.exampleChineseArr[arrIndex].secondTimeAmount = secondTimeAmountCH


                        return newWord

                    }

                })


                return [...arr]

            })


            setTimeout(() => {
                saveWordToFile()
            }, 100);
        }, 200);



    }


    return (
        <View style={[
            { backgroundColor: "#e7cca0", width: 300, height: 80, display: "flex", flexDirection: "row", alignItems: "center" },
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
                    backgroundColor: firstTimeAmountEN == item.firstTimeAmountEN ? "#e7cca0" : "#fcd19dff",
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
                    backgroundColor: firstTimeAmountCH == item.firstTimeAmountCH ? "#e7cca0" : "#fcd19dff",
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
                    backgroundColor: secondTimeAmountEN == item.secondTimeAmountEN ? "#e7cca0" : "#fcd19dff",
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
                    backgroundColor: secondTimeAmountCH == item.secondTimeAmountCH ? "#e7cca0" : "#fcd19dff",
                    justifyContent: "center", alignItems: "center"
                }}>
                    <Text style={{ fontSize: 30 }}>{secondTimeAmountCH}</Text>
                </View>
            </GestureDetector>




            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(saveAmount)()
            })}>
                <View style={{ height: 60, width: 60, backgroundColor: "#e7cca0", justifyContent: "center", alignItems: "center" }}>
                    <Icon
                        name="save" type='ionicon' color='orange'
                        containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "180deg" }], backgroundColor: "transparent", justifyContent: "center" }}
                        size={45}
                    />
                </View>
            </GestureDetector>




        </View>
    )
}



function RightAction({ props, sourceWord, arrIndex, getIndex, isDownloaded, panelHeight, panelMargin }) {

    const { sourceWordArr, setSouceWordArr, saveWordToFile, downloadWord, deleteDownloadWord, setRefreshState } = useContext(Context)
    const { editorCardY, enText, setEnText, chText, setChText, sentenceIndex, setSentenceIndex, newSentenceIndex, isDownloadedArr } = useContext(DragListContext)
    const progress = props[0]
    const dragWidth = props[1]
    const panel = props[2]

    const navigate = useNavigation()
    function closePanel() {
        panel.close()
    }

    function checkDownload() {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        const hashName2 = CryptoJS(sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        // FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
        //     const { exists, isDirectory, size, uri } = item
        //    // isDownloaded.value = exists
        //     setTimeout(() => {
        //         setRefreshState(Math.random())
        //     }, 100);

        // })

        isDownloadedArr.modify((arr) => {
            "worklet";
            const newArr = arr.map(item => {
                return item.sentenceCode !== hashName1 + hashName2
            })
            return newArr
            //  arr.push(exists)
        })

    }

    function addSentence() {
        closePanel()
        setTimeout(() => {
            newSentenceIndex.current = arrIndex + 1
            setSouceWordArr(sourceWordArr => {

                const arr = sourceWordArr.map(word => {
                    if (sourceWord.wordName !== word.wordName) {
                        return word
                    }
                    else {
                        const randomNum = Math.round(1000 * Math.random())
                        const newWord = JSON.parse(JSON.stringify(word))


                        newWord.exampleEnglishArr.splice(arrIndex + 1, 0, { "firstTimeAmount": 1, "key": "en-272201", "secondTimeAmount": 1, "sentence": `random sentence of ${word.wordName} ${randomNum}` })
                        newWord.exampleChineseArr.splice(arrIndex + 1, 0, { "firstTimeAmount": 1, "key": "cn-272201", "secondTimeAmount": 1, "sentence": `${word.wordName} 随机句子 ${randomNum}` })



                        return newWord
                    }

                })
                //closePanel()
                return arr
            })

            setTimeout(() => {
                saveWordToFile()
            }, 100);

        }, 100);



    }

    function deleteSentence() {
        closePanel()
        setTimeout(() => {
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

                //closePanel()
                return arr
            })
            setTimeout(() => {
                saveWordToFile()
            }, 100);

        }, 0);





    }


    //console.log(sourceWord.wordName,sourceWord.exampleEnglishArr[getIndex()].sentence)

    function setIsDownloadFalse() {
        isDownloaded.value = false
    }
    function setIsDownloadTrue() {
        isDownloaded.value = true
    }


    return (
        <View style={[{ backgroundColor: "pink", width: 180, height: 80, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" },
        useAnimatedStyle(() => {
            return {
                transform: [{ scale: interpolate((-props[1].value), [0, 180], [0, 1], "clamp") }]
            }
        })


        ]}>
            <View style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                <Icon
                    onPress={e => {
                        // console.log(e.nativeEvent)
                        panelMargin.value = withTiming(80, { duration: 300 }, () => {
                            runOnJS(addSentence)()
                        })

                    }}


                    name="add-circle-outline" type='ionicon' color='orange'
                    containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "0deg" }], backgroundColor: "#aaf", justifyContent: "center" }}
                    size={50}
                />
            </View>


            <GestureDetector gesture={Gesture.LongPress()
                .onStart(e => {

                    panelHeight.value = withTiming(0, { duration: 300 }, () => {
                        runOnJS(deleteSentence)()
                    })


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

            {/* <GestureDetector gesture={Gesture.Tap()
                .onStart(e => {
                    editorCardY.value = withTiming(0, { duration: 150 }, () => {
                        runOnJS(setEnText)(sourceWord.exampleEnglishArr[arrIndex].sentence)
                        runOnJS(setChText)(sourceWord.exampleChineseArr[arrIndex].sentence)
                        runOnJS(setSentenceIndex)(sourceWord.wordName + ">" + arrIndex)

                    })

                })
            }>
                <View style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                    <Icon
                        name="create-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "0deg" }], backgroundColor: "#aaf", justifyContent: "center" }}
                        size={50}
                    />
                </View>
            </GestureDetector> */}

            <GestureDetector gesture={Gesture.LongPress()
                .onStart(e => {
                    runOnJS(downloadWord)(sourceWord.wordName, sourceWord.exampleEnglishArr[arrIndex].sentence,
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
                    runOnJS(deleteDownloadWord)(sourceWord.wordName, sourceWord.exampleEnglishArr[arrIndex].sentence,
                        //    checkDownload
                        setIsDownloadFalse
                    )
                    runOnJS(closePanel)()
                })
            }>
                <View style={[{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" },
                useAnimatedStyle(() => {
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






export function DragblePannel({ item, drag, isActive, getIndex, allPannelArr, shouldRender }) {



    const { sourceWord, arrIndex } = item


    const { editorCardY, enText, setEnText, chText, setChText, sentenceIndex, setSentenceIndex, isFirstTimeRender, newSentenceIndex, isDownloadedArr } = useContext(DragListContext)


    const isDownloaded = useSharedValue(false)



    useEffect(() => {
        if (getIndex() === sourceWord.exampleEnglishArr.length - 1) {
            isFirstTimeRender.current = false
            newSentenceIndex.current = -1
        }
    }, [])


    // useEffect(() => {
    //     const hashName1 = CryptoJS(sourceWord.wordName).toString()
    //     const hashName2 = CryptoJS(item.englishLabel).toString()

    //     FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
    //         const { exists, isDirectory, size, uri } = item
    //         isDownloaded.value = exists
    //     })
    // }, [item])

    const hashName1 = CryptoJS(sourceWord.wordName).toString()
    const hashName2 = CryptoJS(item.englishLabel).toString()

    useEffect(() => {




        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            //isDownloaded.value = exists
            isDownloadedArr.push(hashName1 + hashName2 + "-" + exists)
        })




    }, [])


    // const navigation = useNavigation()
    // useEffect(() => {
    //     navigation.addListener("focus", () => {
    //         const hashName1 = CryptoJS(sourceWord.wordName).toString()
    //         const hashName2 = CryptoJS(item.englishLabel).toString()

    //         FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
    //             const { exists, isDirectory, size, uri } = item
    //             isDownloaded.value = exists
    //         })

    //     })



    // }, [item])


    const panelRef = useAnimatedRef()


    const panelHeight = useSharedValue(80)
    const panelMargin = useSharedValue(0)




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
                            return (<RightAction props={props} sourceWord={sourceWord} item={item} arrIndex={arrIndex} getIndex={getIndex} isDownloaded={isDownloaded}
                                panelHeight={panelHeight} panelMargin={panelMargin} />)
                        }
                    }
                    renderLeftActions={
                        function (...props) {
                            return (<LeftAction props={props} sourceWord={sourceWord} item={item} arrIndex={arrIndex} getIndex={getIndex} />)
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
                        <GestureDetector gesture={Gesture.Simultaneous(Gesture.Tap().numberOfTaps(2).onStart(e => {

                            editorCardY.value = withTiming(0, { duration: 150 }, () => {
                                if (sentenceIndex !== arrIndex) {
                                    runOnJS(setEnText)(sourceWord.exampleEnglishArr[arrIndex].sentence)
                                    runOnJS(setChText)(sourceWord.exampleChineseArr[arrIndex].sentence)
                                    runOnJS(setSentenceIndex)(arrIndex)

                                }

                            })


                        }).enabled(!isActive))}>
                            <View entering={(isFirstTimeRender.current || getIndex() == newSentenceIndex.current) ? FlipInEasyX.delay(arrIndex * 50) : undefined}


                                style={[useAnimatedStyle(() => {
                                    const item = isDownloadedArr.value.find(item => {
                                        return hashName1 + hashName2 === item.sentenceCode
                                    })

                                    const isDownloaded = item.isDownloaded
                                    return {
                                        width: screenWidth, justifyContent: "center", alignItems: "center",
                                        borderBottomWidth: panelHeight.value === 80 ? 1 : 0,
                                        borderBottomColor: "#D2B48C",
                                        backgroundColor: isDownloaded ? "wheat" : "#e7cca0",
                                        padding: panelHeight.value === 80 ? 4 : 0,
                                        height: panelHeight.value,
                                        marginBottom: panelMargin.value,
                                    }


                                })]}>
                                <Text style={{ fontSize: 18 }} ellipsizeMode={"tail"} numberOfLines={2}>{item.englishLabel}</Text>
                                <Text style={{ fontSize: 16, color: "#555" }} ellipsizeMode={"tail"} numberOfLines={1}>{item.chineseLabel}</Text>
                            </View>
                        </GestureDetector>
                    </TouchableOpacity>
                </ReanimatedSwipeable>
            </ScaleDecorator>

        </>
    )

}



function HeadLeft({ props, sourceWord, item }) {



    const progress = props[0]
    const dragWidth = props[1]
    const panel = props[2]

    const { sourceWordArr, setSouceWordArr, saveWordToFile } = useContext(Context)



    useEffect(() => {

        // setFirstTimeAmountEN(item.firstTimeAmountEN)
        // setFirstTimeAmountCH(item.firstTimeAmountCH)
        // setSecondTimeAmountEN(item.secondTimeAmountEN)
        // setSecondTimeAmountCH(item.secondTimeAmountCH)

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


                    newWord.firstTimeAmount = firstTimeAmountEN
                    newWord.firstTimeMeaningAmount = firstTimeAmountCH
                    newWord.secondTimeAmount = secondTimeAmountEN
                    newWord.secondTimeMeaningAmount = secondTimeAmountCH



                    return newWord

                }

            })


            return [...arr]

        })

        panel.close()
        setTimeout(() => {
            saveWordToFile()
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

function HeadRight({ props, sourceWord, isDownloaded }) {

    const { sourceWordArr, setSouceWordArr, saveWordToFile, downloadWord, deleteDownloadWord, setRefreshState } = useContext(Context)




    const progress = props[0]
    const dragWidth = props[1]
    const panel = props[2]

    const { editorCardY, enText, chText, setEnText, setChText, sentenceIndex, setSentenceIndex } = useContext(DragListContext)



    const navigate = useNavigation()
    function closePanel() {
        panel.close()
    }

    function checkDownload() {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()

        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName1}.mp3`).then(item => {
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
                    newWord.exampleEnglishArr.splice(0, 0, { "firstTimeAmount": 1, "key": "en-272201", "secondTimeAmount": 1, "sentence": `random sentence of ${word.wordName} ${randomNum}` })
                    newWord.exampleChineseArr.splice(0, 0, { "firstTimeAmount": 1, "key": "cn-272201", "secondTimeAmount": 1, "sentence": `${word.wordName} 随机句子 ${randomNum}` })
                    return newWord
                }

            })
            closePanel()
            return arr
        })

    }

    function deleteSentence() {


        navigate.goBack()
        setTimeout(() => {
            setSouceWordArr(sourceWordArr => {
                const arr = sourceWordArr.filter(word => {
                    return sourceWord.wordName !== word.wordName
                })


                const hashName1 = CryptoJS(sourceWord.wordName).toString()
                FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(data => {

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


    //console.log(sourceWord.wordName,sourceWord.exampleEnglishArr[getIndex()].sentence)

    function setIsDownloadFalse() {
        isDownloaded.value = false
    }
    function setIsDownloadTrue() {
        isDownloaded.value = true
    }


    return (
        <View style={[{ backgroundColor: "pink", width: 180, height: 80, display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" },
        useAnimatedStyle(() => {
            return {
                transform: [{ scale: interpolate((-props[1].value), [0, 180], [0, 1], "clamp") }]
            }
        })


        ]}>
            <View style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                <Icon
                    onPress={e => {
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

            {/* <GestureDetector gesture={Gesture.Tap().onStart(e => {

                editorCardY.value = withTiming(0, { duration: 150 }, () => {
                    runOnJS(setEnText)(sourceWord.meaning)
                    runOnJS(setChText)(sourceWord.meaningSound)
                    runOnJS(setSentenceIndex)(sourceWord.wordName)
                })


            })}>
                <View style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                    <Icon
                        name="create-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 60, height: 60, transform: [{ rotateZ: "0deg" }], backgroundColor: "#aaf", justifyContent: "center" }}
                        size={50}
                    />
                </View>
            </GestureDetector> */}

            <GestureDetector gesture={Gesture.LongPress()
                .onStart(e => {
                    runOnJS(downloadWord)(sourceWord.wordName, sourceWord.wordName, setIsDownloadTrue)



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
                    runOnJS(deleteDownloadWord)(sourceWord.wordName, sourceWord.wordName, setIsDownloadFalse)
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



export function HeadPannel({ item }) {



    const { sourceWord, arrIndex } = item
    const isDownloaded = useSharedValue(false)

    const { editorCardY, enText, setEnText, chText, setChText, sentenceIndex, setSentenceIndex } = useContext(DragListContext)

    //console.log(sourceWord)

    useEffect(() => {
        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        const hashName2 = CryptoJS(sourceWord.wordName).toString()
        // const hashName2 = CryptoJS(sourceWord.exampleEnglishArr[arrIndex].sentence).toString()
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloaded.value = exists
        })
    }, [item])






    return (
        <ReanimatedSwipeable
            dragOffsetFromLeftEdge={5}
            dragOffsetFromRightEdge={5}
            ref={(ref) => { }}

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

                        <HeadRight props={props} sourceWord={sourceWord} item={item} isDownloaded={isDownloaded} />

                    )
                }


            }
            renderLeftActions={

                function (...props) {

                    return (
                        <HeadLeft props={props} sourceWord={sourceWord} item={item} />

                    )
                }



            }

        >

            <GestureDetector gesture={Gesture.Simultaneous(Gesture.Tap().numberOfTaps(2).onStart(e => {


                //console.log("sentence index",sentenceIndex)

                editorCardY.value = withTiming(0, { duration: 150 }, () => {
                    if (sentenceIndex !== -1) {
                        runOnJS(setEnText)(sourceWord.meaning)
                        runOnJS(setChText)(sourceWord.meaningSound)
                        runOnJS(setSentenceIndex)(-1)
                    }


                })


            }))}>
                <View
                    style={[useAnimatedStyle(() => {


                        return {
                            width: screenWidth, height: 80, justifyContent: "center", alignItems: "center", borderBottomWidth: 1,
                            borderBottomColor: "#D2B48C",
                            backgroundColor: isDownloaded.value ? "wheat" : "#e7cca0",

                        }


                    })]}>
                    <Text style={{ fontSize: 27, color: "#a75d09", }} ellipsizeMode={"tail"} numberOfLines={2}>{item.englishLabel}</Text>
                    <Text style={{ fontSize: 17, color: "#555", }} ellipsizeMode={"tail"} numberOfLines={1}>{item.chineseLabel}</Text>
                </View>
            </GestureDetector>




        </ReanimatedSwipeable>




    )



}


export function EditorCard() {

    const { fetchTransParam, deleteDownloadWord, setRefreshState, setSouceWordArr, saveWordToFile } = useContext(Context)
    const { editorCardY, enText, setEnText, chText, setChText, sentenceIndex, setSentenceIndex, sourceWord } = useContext(DragListContext)

    const inputRefEN = useAnimatedRef()
    const inputRefCH = useAnimatedRef()



    function dismissKeyboard() {
        Keyboard.dismiss()
    }
    const navigation = useNavigation()
    function goBack() {
        navigation.goBack()
    }

    const route = useRoute()

    function setInfo() {
        setTimeout(() => {
            setSentenceIndex(route.params.sentencePos)
            setEnText(sourceWord.exampleEnglishArr[route.params.sentencePos].sentence)
            setChText(sourceWord.exampleChineseArr[route.params.sentencePos].sentence)
        }, 0);

    }


    useEffect(() => {
        const listener = navigation.addListener("focus", () => {
            if (Number.isInteger(route.params.sentencePos)) {


                editorCardY.value = withTiming(0, { duration: 0 }, () => {
                    runOnJS(setInfo)()
                })



            }

        })
        return listener

        // if (Number.isInteger(route.params.sentencePos)) {

        //     editorCardY.value = 0
        //     setSentenceIndex(route.params.sentencePos)
        //     setEnText(sourceWord.exampleEnglishArr[route.params.sentencePos].sentence)
        //     setChText(sourceWord.exampleChineseArr[route.params.sentencePos].sentence)
        // }


    }, [])

    // const route = useRoute()
    // useEffect(() => {
    //    const listener = navigation.addListener("focus", () => {
    //         console.log("landed on editor card")
    //     })


    //     //  if (navigation.getState().routes[0].name === "RegScreen") {
    //     // const unsubscribe = navigation.addListener("beforeRemove", function (e) {
    //     //     // console.log(navigation.getState().routes[0].name === "RegScreen")
    //     //     e.preventDefault()
    //     //     BackHandler.exitApp()
    //     // })

    //      return ()=>{
    //         console.log(listener)
    //         listener.remove()
    //      }
    //     // }
    // }, [])


    return (

        <>
            <View style={useAnimatedStyle(() => {

                return {
                    width: screenWidth,
                    height: screenHeight,
                    backgroundColor: "#29e",
                    top: 0,
                    left: 0,
                    transform: [{ translateY: editorCardY.value }],
                    position: "absolute",
                    zIndex: 990
                }
            })}>
                <GestureDetector gesture={Gesture.Pan()
                    .onChange(e => {
                        // console.log(e.velocityX)
                        editorCardY.value = Math.max(0, editorCardY.value + e.changeY)
                    })
                    .onEnd(e => {

                        editorCardY.value = (editorCardY.value <= 40) ? withTiming(0) : withTiming(screenHeight, { duration: 150 }, () => {
                            runOnJS(dismissKeyboard)()

                        })


                        if ((e.translationX >= 100) || (e.velocityX >= 1000)) {
                            runOnJS(goBack)()
                        }
                    })}
                >
                    <View style={useAnimatedStyle(() => {

                        return {
                            width: screenWidth,
                            height: 80,
                            backgroundColor: "rgba(222, 229, 182, 1)",
                            flexDirection: "row-reverse",
                            alignItems: "flex-end",
                            paddingHorizontal: 4,
                            justifyContent: "space-between"

                        }
                    })}>
                        <TouchableOpacity activeOpacity={0.2} onPressOut={function () {
                            editorCardY.value = withTiming(screenHeight)
                            Keyboard.dismiss()
                        }}>
                            <Icon
                                name="chevron-back-circle-outline" type='ionicon' color='orange'
                                containerStyle={{ width: 50, height: 50, transform: [{ rotateZ: "270deg" }] }}
                                size={50}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.2} onPressOut={async function () {
                            console.log("ff")
                            const [key, token, tokenExpiryInterval, IG, IID] = await fetchTransParam()

                            superagent.post("https://cn.bing.com/ttranslatev3")
                                .set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0')
                                .set('referer', 'https://cn.bing.com/translator')
                                .query({
                                    fromLang: "en",//"ja",// 'auto-detect', //"en"
                                    text: enText,// 'they steppted into the deck as if there is no one cares',
                                    token: token,
                                    key: key,
                                    to: 'zh-Hans',
                                    tryFetchingGenderDebiasedTranslations: true,
                                    IG: IG,  //can be dummy
                                    IID: IID + ".1",  // can be dummy
                                    isVertical: "1",  // can omit

                                })
                                .then(data => {
                                    try {
                                        console.log(JSON.parse(data.text)[0].translations[0].text)
                                        setChText(JSON.parse(data.text)[0].translations[0].text)

                                    }
                                    catch (err) {
                                        console.log(err)


                                    }
                                })

                                .catch(err => {
                                    console.log(err)
                                })






                        }}>
                            <Icon
                                name="language" type='ionicon' color='orange'
                                containerStyle={{ width: 50, height: 50, transform: [{ rotateZ: "0deg" }] }}
                                size={50}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.2} onPressOut={function () {


                            if (enText == sourceWord.exampleEnglishArr[sentenceIndex].sentence &&
                                chText == sourceWord.exampleChineseArr[sentenceIndex].sentence) {
                                console.log("sentence not changed")
                                return
                            }


                            enText !== sourceWord.exampleEnglishArr[sentenceIndex].sentence && deleteDownloadWord(
                                sourceWord.wordName, sourceWord.exampleEnglishArr[sentenceIndex].sentence,
                                () => { setRefreshState(Math.random()) }
                            )

                            setSouceWordArr((sourceWordArr) => {

                                const arr = sourceWordArr.map(item => {
                                    if (item.wordName !== sourceWord.wordName) {
                                        return item
                                    }
                                    else {

                                        const newSourceWord = JSON.parse(JSON.stringify(sourceWord))
                                        newSourceWord.exampleEnglishArr[sentenceIndex].sentence = enText
                                        newSourceWord.exampleChineseArr[sentenceIndex].sentence = chText

                                        return newSourceWord
                                    }
                                })

                                return arr
                            })

                            setTimeout(() => {
                                saveWordToFile()
                            }, 100);

                            // deleteDownloadWord(word.wordName, word.exampleEnglishArr[arrIndex].sentence, checkDownload)
                            // FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(data => {

                            //     data.forEach(item => {
                            //         if (item.substring(0, 64) === hashName1) {
                            //             FileSystem.deleteAsync(FileSystem.documentDirectory + item, { idempotent: true })
                            //         }
                            //     })

                            // })

                            //  editorCardY.value = withTiming(screenHeight)
                            //  Keyboard.dismiss()
                            //     console.log(sourceWord)
                            //     if(sentenceIndex&&sentenceIndex>=0){
                            //sourceWord.exampleEnglishArr[sentenceIndex].sentence
                            //     }



                        }}>
                            <Icon
                                name="save" type='ionicon' color='orange'
                                containerStyle={{ width: 50, height: 50, transform: [{ rotateZ: "0deg" }] }}
                                size={45}
                            />
                        </TouchableOpacity>


                    </View>
                </GestureDetector>

                <View style={{ flexDirection: "row", alignSelf: "center" }}>
                    <Text style={{ fontSize: 27, marginHorizontal: 4, alignSelf: "center" }}>{`${sourceWord.wordName}`}</Text>
                    <Text style={{ fontSize: 20, marginHorizontal: 4, alignSelf: "center" }}>{`[${sentenceIndex}]`}</Text>
                </View>
                <TouchableOpacity
                    onPressIn={function () {
                        Keyboard.dismiss()
                        inputRefEN.current.focus()
                    }} activeOpacity={0.8}

                    style={{ flexDirection: "row", justifyContent: "flex-start", alignItems: "flex-start", height: 140 }}
                >
                    <Input
                        onLayout={() => {
                            Keyboard.dismiss()
                        }}
                        cursorColor={"black"}
                        ref={(ref) => { inputRefEN.current = ref }}
                        value={enText}
                        multiline={true}
                        autoFocus={false}
                        style={{ padding: 0, paddingHorizontal: 4 }}
                        inputContainerStyle={{

                            //left: -4,
                            marginBottom: 0,
                            marginTop: 0,
                            paddingTop: 0,
                            height: 130,
                            width: (screenWidth - 8), borderWidth: 1, borderColor: "black", margin: 0, backgroundColor: "#aaa",
                            justifyContent: "flex-start", alignItems: "flex-start",
                            alignSelf: "center"
                        }}

                        onChangeText={function (text) {
                            setEnText(text)
                        }}
                    // onPressIn={function () {
                    //     inputRefEn.current.focus()
                    // }}
                    />
                </TouchableOpacity>


                <TouchableOpacity onPressIn={function () {
                    Keyboard.dismiss()
                    inputRefCH.current.focus()

                }}
                    activeOpacity={0.8}
                    style={{ height: 140 }}

                >
                    <Input
                        onLayout={() => {
                            Keyboard.dismiss()
                        }}
                        cursorColor={"black"}
                        ref={(ref) => { inputRefCH.current = ref }}
                        value={chText}
                        multiline={true}
                        autoFocus={false}
                        style={{ padding: 0, paddingHorizontal: 4 }}
                        inputContainerStyle={{

                            //left: -4,
                            marginBottom: 0, marginTop: 0,

                            height: 130,
                            width: (screenWidth - 8), borderWidth: 1, borderColor: "black", margin: 0, backgroundColor: "#aaa",
                            justifyContent: "flex-start", alignItems: "flex-start",
                            alignSelf: "center"
                        }}

                        onChangeText={function (text) {
                            setChText(text)
                        }}
                    // onPressIn={function () {
                    //     inputRefEn.current.focus()
                    // }}
                    />
                </TouchableOpacity>

                <GestureDetector gesture={Gesture.Pan()
                    .onChange(e => {
                        // editorCardY.value = Math.max(0, editorCardY.value + e.changeY)
                    })
                    .onEnd(e => {

                        // editorCardY.value = (editorCardY.value <= 40) ? withTiming(0) : withTiming(screenHeight, { duration: 150 }, () => {
                        //     runOnJS(dismissKeyboard)()
                        //     //  Keyboard.dismiss()
                        // })

                        if ((e.translationY >= 50) || (e.velocityY >= 1000)) {
                            editorCardY.value = withTiming(screenHeight, { duration: 150 }, () => {
                                runOnJS(dismissKeyboard)()
                                //  Keyboard.dismiss()
                            })

                        }


                        if ((e.translationX >= 50) || (e.velocityX >= 1000)) {
                            runOnJS(goBack)()
                        }
                    })
                }>
                    <View style={useAnimatedStyle(() => {

                        return {
                            width: screenWidth,
                            //height: 80,
                            backgroundColor: "rgba(121, 229, 182, 1)",
                            flexDirection: "row-reverse",
                            alignItems: "flex-end",
                            paddingHorizontal: 4,
                            justifyContent: "space-between",
                            flex: 999

                        }
                    })}></View>
                </GestureDetector>

            </View>
        </>
    )


}






