import React, { memo, useCallback, useMemo, useTransition } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, useContext } from 'react';
import * as Device from 'expo-device';
import ContextProvider from './ContextProvider';
import { RecyclerListView, DataProvider, LayoutProvider, } from "recyclerlistview";
import SwipeableItem, {
    useSwipeableItemParams,
    OpenDirection,
} from "react-native-swipeable-item";
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './StackNavigator';

import { StyleSheet, Button, Dimensions, TouchableOpacity, SafeAreaView, RefreshControl, Alert } from 'react-native';
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
    interpolateColor,


} from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { FadeIn, FadeOut, BounceIn, BounceOut, SlideOutUp } from 'react-native-reanimated';
const { View, Text, ScrollView, FlatList } = ReAnimated

import { Context } from './ContextProvider';
import { LinearGradient } from 'expo-linear-gradient';

import { Audio } from 'expo-av';
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

import startPromiseSequential from 'promise-sequential';

import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
const headHeight = 80;// getStatusBarHeight() > 24 ? 80 : 60



import { ListItem, Avatar, LinearProgress, Tooltip, Icon, Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDebounce, useDebouncedCallback, useThrottledCallback } from 'use-debounce';

import * as Speech from 'expo-speech';



import SwipebleRowItem from "./HomeScreenComp/SwipebleRowItem"
import Card from './HomeScreenComp/Card';
import ScrollPivot from './HomeScreenComp/ScrollPivot';
import CryptoJS from 'crypto-js/sha256';

import DraggableFlatList, {
    ScaleDecorator,
} from "react-native-draggable-flatlist";
import DragList, { DragListRenderItemInfo } from 'react-native-draglist';

import { BackHandler } from 'react-native';

BackHandler.addEventListener('hardwareBackPress', function () {
    // Custom logic for handling back button press
    // if (!this.onMainScreen()) {
    //     this.goBack();
    //     return true; // Prevents the default back action

    // }
    return false; // Allows the default back action
});


// const NUM_ITEMS = 20;
// function getColor(i) {
//     const multiplier = 255 / (NUM_ITEMS - 1);
//     const colorVal = i * multiplier;
//     return `rgb(${colorVal}, ${Math.abs(128 - colorVal)}, ${255 - colorVal})`;
// }


// const initialData = [...Array(NUM_ITEMS)].map((d, index) => {
//     const backgroundColor = getColor(index);
//     return {
//         key: `item-${index}`,
//         label: String(index) + "",
//         height: 80,
//         //    width: 60 + Math.random() * 40,

//         width: screenWidth,
//         backgroundColor
//     };
// });



// const router = useRoute()
//const sourceWord = router.params.wordPos
// console.log(wordPos.value,scrollX.value)

export default function DragListScreen() {


    const { sourceWordArr, setSouceWordArr, wordPos, scrollX, refreshWordToFile } = useContext(Context)
    const router = useRoute()
    // console.log(router.params)

    const sourceWord = sourceWordArr[wordPos.value]


    const exampleDataArr = sourceWord?.exampleEnglishArr?.map((item, index) => {
        return {
            key: `item-${index}`,
            label: String(item.sentence) + "",
            chineseLabel: sourceWord?.exampleChineseArr[index].sentence,
            height: 80,
            width: screenWidth,
            backgroundColor: getRandomColor(),
            arrIndex: index,
            sourceWord,

        }


    }) || []

    const [data, setData] = useState(exampleDataArr);

    useEffect(() => {
        setData(exampleDataArr)
    }, [sourceWordArr])

    // const RenderItem = ({ item, drag, isActive }) => {
    //     return (
    //         <ScaleDecorator activeScale={0.9} key={item.key}>

    //             <TouchableOpacity
    //                 activeOpacity={1}
    //                 onLongPress={drag}
    //                 disabled={isActive}
    //                 style={[
    //                     {
    //                         height: 80,
    //                         width: screenWidth,
    //                         alignItems: "center",
    //                         justifyContent: "center",
    //                     },

    //                     //  { backgroundColor: isActive ? "red" : item.backgroundColor },
    //                     { backgroundColor: item.backgroundColor },
    //                     // { transform: [{ scale: isActive ? 0.9 : 1 }] },
    //                 ]}
    //             >
    //                 <ReanimatedSwipeable
    //                     dragOffsetFromLeftEdge={5}
    //                     dragOffsetFromRightEdge={5}


    //                     containerStyle={{ backgroundColor: "wheat" }}
    //                     friction={1}
    //                     // enableTrackpadTwoFingerGesture
    //                     leftThreshold={10}
    //                     rightThreshold={10}
    //                     onSwipeableWillOpen={(e) => {
    //                         //  console.log(e)
    //                     }}
    //                     renderRightActions={

    //                         // function (...props) {
    //                         //     console.log(props[0], props[1])
    //                         //     return (
    //                         //         <View style={{ backgroundColor: "pink", width: 100, height: 100 }}><Text>Right</Text></View>
    //                         //     )
    //                         // }
    //                         RightAction
    //                     }
    //                     renderLeftActions={
    //                         LeftAction
    //                     }

    //                 >
    //                     <View style={[useAnimatedStyle(() => {

    //                         return {
    //                             width: screenWidth, height: 80, justifyContent: "center", alignItems: "center", borderBottomWidth: 1,
    //                             borderBottomColor: "#D2B48C",
    //                             //    backgroundColor: getRandomColor()
    //                             // backgroundColor: "gray"
    //                         }


    //                     })]}>
    //                         <Text style={{ fontSize: 18 }} ellipsizeMode={"tail"} numberOfLines={2}>{item.label}</Text>
    //                         <Text style={{ fontSize: 15 }} ellipsizeMode={"tail"} numberOfLines={1}>{item.chineseLabel}</Text>
    //                     </View>
    //                 </ReanimatedSwipeable>
    //             </TouchableOpacity>
    //         </ScaleDecorator >
    //     );
    // };

    const headerStyle = useAnimatedStyle(() => {

        return {
            width: screenWidth,
            height: 80,
            backgroundColor: "wheat",
            justifyContent: "flex-end"
        }

    })


    const navigation = useNavigation()
    const [isPending, starTransition] = useTransition()

    const allPannelArr = useRef([])

    return (

        <>
            {/* <View style={headerStyle}>

            
            </View>
            <View style={headerStyle}>
                <Text style={{ fontSize: 30, justifyContent: "center", alignContent: "center", alignSelf: "center" }}>{sourceWord.wordName}</Text>
         
            </View> */}


            <DraggableFlatList
                containerStyle={{ width: screenWidth, height: screenHeight - headHeight - 80 - 80, backgroundColor: "pink" }}
                data={data}
                activationDistance={0}
                dragItemOverflow={true}
                // renderPlaceholder={function () {
                //     return <View style={headerStyle}><Text>aaa</Text></View>
                // }}
                onDragEnd={({ data, from, to, ...props }) => {

                    if (from === to) return
                    let engArr = [...sourceWord.exampleEnglishArr];
                    let chnArr = [...sourceWord.exampleChineseArr];
                    //console.log(from,to)
                    engArr.splice(to, 0, engArr.splice(from, 1)[0]);
                    chnArr.splice(to, 0, chnArr.splice(from, 1)[0]);

                    const newSourceWord = { ...sourceWord, exampleEnglishArr: engArr, exampleChineseArr: chnArr }

                    setSouceWordArr((sourceWordArr) => {

                        return sourceWordArr.map(item => {
                            if (item.wordName !== sourceWord.wordName) {
                                return item
                            }
                            else {
                                return newSourceWord//{ ...sourceWord }
                            }
                        })

                    })

                    setTimeout(() => {
                        refreshWordToFile()
                    }, 100);


                    //console.log(props)


                    setData(data)


                }}
                keyExtractor={(item) => item.key}
                // renderItem={RenderItem}
                renderItem={
                    function ({ item, drag, isActive, getIndex, ...props }) {


                        return <DragblePannel item={item} drag={drag} isActive={isActive} getIndex={getIndex} allPannelArr={allPannelArr} />
                    }
                }
            />

        </>
    );

}
function LeftAction({ props, sourceWord, arrIndex, getIndex }) {



    const progress = props[0]
    const dragWidth = props[1]
    const panel = props[2]

    const { sourceWordArr, setSouceWordArr, refreshWordToFile } = useContext(Context)


    useEffect(() => {
        console.log(Date.now())
    }, [])


    const [amountStateArr, setAmountStateArr] = useState([
        sourceWord.exampleEnglishArr[getIndex()].firstTimeAmount,
        sourceWord.exampleChineseArr[getIndex()].firstTimeAmount,
        sourceWord.exampleEnglishArr[getIndex()].secondTimeAmount,
        sourceWord.exampleChineseArr[getIndex()].secondTimeAmount
    ])

    //const [firstTimeAmount, setFirstTimeAmount] = useState(sourceWord.exampleEnglishArr[arrIndex].firstTimeAmount)
    const firstTimeAmountEN = JSON.stringify((sourceWord.exampleEnglishArr[getIndex()].firstTimeAmount))
    const firstTimeAmountCH = JSON.stringify((sourceWord.exampleChineseArr[getIndex()].firstTimeAmount))

    const secondTimeAmountEN = JSON.stringify((sourceWord.exampleEnglishArr[getIndex()].secondTimeAmount))
    const secondTimeAmountCH = JSON.stringify((sourceWord.exampleChineseArr[getIndex()].secondTimeAmount))


    function increaseAmount(amountCode) {


        setSouceWordArr(sourceWordArr => {

            return sourceWordArr.map(word => {

                if (word.wordName !== sourceWord.wordName) {
                    return word
                }
                else {
                    const newWord = JSON.parse(JSON.stringify(word))
                    // console.log(word)

                    if (amountCode == "EN-firstTime") {
                        newWord.exampleEnglishArr[getIndex()].firstTimeAmount = (newWord.exampleEnglishArr[getIndex()].firstTimeAmount + 1) % 4
                    }
                    else if (amountCode == "CH-firstTime") {
                        newWord.exampleChineseArr[getIndex()].firstTimeAmount = (newWord.exampleChineseArr[getIndex()].firstTimeAmount + 1) % 4
                    }
                    else if (amountCode == "EN-secondTime") {
                        newWord.exampleEnglishArr[getIndex()].secondTimeAmount = (newWord.exampleEnglishArr[getIndex()].secondTimeAmount + 1) % 4
                        //console.log( newWord.exampleEnglishArr[getIndex()].secondTimeAmount)
                    }
                    else if (amountCode == "CH-secondTime") {
                        newWord.exampleChineseArr[getIndex()].secondTimeAmount = (newWord.exampleChineseArr[getIndex()].secondTimeAmount + 1) % 4
                    }



                    return newWord
                }

            })



        })


        setTimeout(() => {
            refreshWordToFile()
        }, 100);

    }



    return (
        <View style={[
            { backgroundColor: "lightgreen", width: 240, height: 80, display: "flex", flexDirection: "row", alignItems: "center" },
            useAnimatedStyle(() => {
                return {
                    transform: [{ scale: interpolate(props[1].value, [0, 240], [0, 1], "clamp") }]
                }
            })
        ]}>

            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(increaseAmount)("EN-firstTime")
            })}>
                <View activeOpacity={0.2} style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 30 }}>{firstTimeAmountEN}</Text>
                </View>
            </GestureDetector>

            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(increaseAmount)("CH-firstTime")
            })}>
                <View activeOpacity={0.2} style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 30 }}>{firstTimeAmountCH}</Text>
                </View>
            </GestureDetector>
            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(increaseAmount)("EN-secondTime")
            })}>
                <View activeOpacity={0.2} style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 30 }}>{secondTimeAmountEN}</Text>
                </View>
            </GestureDetector>

            <GestureDetector gesture={Gesture.Tap().onEnd(e => {
                runOnJS(increaseAmount)("CH-secondTime")
            })}>
                <View style={{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }}>
                    <Text style={{ fontSize: 30 }}>{secondTimeAmountCH}</Text>
                </View>
            </GestureDetector>






        </View>
    )
}

function RightAction({ props, sourceWord, arrIndex, getIndex, isDownloaded }) {

    const { sourceWordArr, setSouceWordArr, refreshWordToFile, downloadWord, deleteDownloadWord, setRefreshState } = useContext(Context)

    const progress = props[0]
    const dragWidth = props[1]
    const panel = props[2]


    function closePanel() {
        panel.close()
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

    function addSentence() {


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
            closePanel()
            return arr
        })

    }

    function deleteSentence() {
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


    //console.log(sourceWord.wordName,sourceWord.exampleEnglishArr[getIndex()].sentence)

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
                    runOnJS(downloadWord)(sourceWord.wordName, sourceWord.exampleEnglishArr[arrIndex].sentence, checkDownload)
                    runOnJS(closePanel)()
                })
            }>
                <View style={[{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }, useAnimatedStyle(() => {
                    return {
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
                    runOnJS(deleteDownloadWord)(sourceWord.wordName, sourceWord.exampleEnglishArr[arrIndex].sentence, checkDownload)
                    runOnJS(closePanel)()
                })
            }>
                <View style={[{ height: 60, width: 60, backgroundColor: "lightblue", justifyContent: "center", alignItems: "center" }, useAnimatedStyle(() => {
                    return {
                        backgroundColor: "rgba(123,212,143,0.9)",
                        position: "absolute",
                        right: 0,
                        zIndex: 100,
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



function DragblePannel({ item, drag, isActive, getIndex, allPannelArr }) {

    const english = item.label
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
        <>

            <ScaleDecorator activeScale={0.9} key={item.key}>

                {/* <TouchableOpacity
                    activeOpacity={1}
                    onLongPress={function (e) { }}
                    disabled={isActive}
                    style={[
                        {
                            height: 80,
                            width: screenWidth,
                            alignItems: "center",
                            justifyContent: "center",
                        },

                        //  { backgroundColor: isActive ? "red" : item.backgroundColor },
                        // { backgroundColor: item.backgroundColor },
                        // { transform: [{ scale: isActive ? 0.9 : 1 }] },
                        // { backgroundColor: item.backgroundColor },
                    ]}
                > */}

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
                                    <RightAction props={props} sourceWord={sourceWord} arrIndex={arrIndex} getIndex={getIndex} isDownloaded={isDownloaded} />
                                </>
                            )
                        }


                    }
                    renderLeftActions={

                        function (...props) {

                            return (
                                <LeftAction props={props} sourceWord={sourceWord} arrIndex={arrIndex} getIndex={getIndex} />
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
                                    backgroundColor: isDownloaded.value ? "wheat" : "#e7cca0"
                                    // backgroundColor: "gray"
                                }


                            })]}>
                            <Text style={{ fontSize: 18 }} ellipsizeMode={"tail"} numberOfLines={2}>{item.label}</Text>
                            <Text style={{ fontSize: 15 }} ellipsizeMode={"tail"} numberOfLines={1}>{item.chineseLabel}</Text>
                        </View>
                    </TouchableOpacity>
                </ReanimatedSwipeable>


                {/* </TouchableOpacity> */}
            </ScaleDecorator>
        </>
    )

}







function getRandomColor() {
    "worklet";
    return `rgba(${Math.floor(256 * Math.random())},${Math.floor(256 * Math.random())},${Math.floor(256 * Math.random())},0.8)`
}
