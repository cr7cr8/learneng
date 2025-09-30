import React, { createContext, memo, useCallback, useMemo, useTransition } from 'react';
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
    FlipOutEasyX,


} from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { FadeIn, FadeOut, BounceIn, BounceOut, SlideOutUp, FlipInEasyX } from 'react-native-reanimated';
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

import { DragblePannel, HeadPannel, EditorCard } from './SentenceSettingScreenComp/DragblePannel';


BackHandler.addEventListener('hardwareBackPress', function () {
    // Custom logic for handling back button press
    // if (!this.onMainScreen()) {
    //     this.goBack();
    //     return true; // Prevents the default back action

    // }
    return false; // Allows the default back action
});



export const DragListContext = createContext()
export default function DragListScreen() {


    const { sourceWordArr, setSouceWordArr, wordPos, scrollX, saveWordToFile, setRefreshState } = useContext(Context)
    const router = useRoute()


    const sourceWord = sourceWordArr[router.params.wordPos % sourceWordArr.length]
    // const sourceWord = JSON.parse(JSON.stringify(router.params))
    //  console.log(sourceWord.exampleEnglishArr)

    const exampleDataArr = sourceWord?.exampleEnglishArr?.map((item, index) => {


        const hashName1 = CryptoJS(sourceWord.wordName).toString()

        const hashName2 = CryptoJS(item.sentence).toString()
        const key = "item-" + Math.random()

        return {
            //key,
            // key: "item-" + Math.random(),
            key: hashName1 + hashName2,//item.sentence,//   "item-" + Math.random(),
            englishLabel: String(item.sentence) + "",
            chineseLabel: sourceWord?.exampleChineseArr[index].sentence,
            firstTimeAmountEN: item.firstTimeAmount,
            firstTimeAmountCH: sourceWord?.exampleChineseArr[index].firstTimeAmount,
            secondTimeAmountEN: item.secondTimeAmount,
            secondTimeAmountCH: sourceWord?.exampleChineseArr[index].secondTimeAmount,

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




    const navigation = useNavigation()
    const allPannelArr = useRef([])
    const flatlistScrollY = useSharedValue(0)


    const editorCardY = useSharedValue(screenHeight)

    const [enText, setEnText] = useState("")
    const [chText, setChText] = useState("")
    const [sentenceIndex, setSentenceIndex] = useState("")


    function goBack() {
        navigation.goBack()
    }



    const newSentenceIndex = useSharedValue(-1)




    const isDownloadedArr = useSharedValue([])
    useEffect(() => {

        const hashName1 = CryptoJS(sourceWord.wordName).toString()
        const hashName2 = CryptoJS(sourceWord.wordName).toString()
        FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            isDownloadedArr.modify((arr) => {
                "worklet";
                arr.push({ sentenceCode: hashName1 + hashName2, isDownloaded: exists, isNewAdded: false })
                return arr
            })
        })

        sourceWord.exampleEnglishArr.forEach(item => {

            const hashName1 = CryptoJS(sourceWord.wordName).toString()
            const hashName2 = CryptoJS(item.sentence).toString()
            FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName1 + hashName2}.mp3`).then(item => {
                const { exists, isDirectory, size, uri } = item

                isDownloadedArr.modify((arr) => {
                    "worklet";
                    arr.push({ sentenceCode: hashName1 + hashName2, isDownloaded: exists, isNewAdded: false })
                    return arr
                })
            })
        })


    }, [])

    const [shouldRender, setShouldRender] = useState(false)
    useEffect(() => {
        setTimeout(() => {
            setShouldRender(true)
        }, 0);

    }, [])


    const paddingBlockMarker = useSharedValue(0)


    const isAlwaysOnTop = useSharedValue(false)

    return (

        <DragListContext.Provider value={{
            editorCardY, enText, setEnText, chText, setChText, sentenceIndex, setSentenceIndex, sourceWord,
            newSentenceIndex, isDownloadedArr
        }}>
            <View style={useAnimatedStyle(() => {

                return {
                    backgroundColor: "wheat",
                    flex: 1
                }

            })}>
                {/* <View style={headerStyle}>


                </View> */}

                <DraggableFlatList
                    containerStyle={{ width: screenWidth, height: screenHeight, backgroundColor: "darkgray" }}
                    onScrollOffsetChange={function (e) {
                        flatlistScrollY.value = e
                        if (e !== 0) {
                            isAlwaysOnTop.value = false
                        }


                        // console.log(e)
                    }}
                    // ItemSeparatorComponent={function () {
                    //     return <View style={{ width: screenWidth, height: 10, backgroundColor: "lightgreen" }}></View>
                    // }}
                    onEndReached={e => {
                        // console.log(e.distanceFromEnd)
                    }}
                    onScrollEndDrag={e => {

                        if (isAlwaysOnTop.value) {
                            goBack()
                        }


                    }}
                    onTouchCancel={e => {

                        //  touchEndY.value = e.nativeEvent.pageY
                        // console.log(touchEndY.value, touchStartY.value)
                    }}
                    onTouchMove={e => {
                        //  console.log(e.nativeEvent.pageY)
                    }}
                    onTouchEndCapture={e => {
                        //   console.log(e.nativeEvent.pageY)
                    }}



                    onTouchStart={e => {




                        isAlwaysOnTop.value = flatlistScrollY.value === 0
                    }}


                    // refreshControl={
                    //     <RefreshControl
                    //         refreshing={false}
                    //         onRefresh={() => {
                    //             console.log("refreshing ---1")
                    //         }}
                    //     />
                    // }


                    nestedScrollEnabled={true}

                    ListHeaderComponent={function (...props) {
                      
                        const item = {
                            key: sourceWord.wordName,//"item-" + Math.random(),
                            englishLabel: sourceWord.wordName,
                            chineseLabel: sourceWord.meaning,
                            firstTimeAmountEN: sourceWord.firstTimeAmount,
                            firstTimeAmountCH: sourceWord.firstTimeMeaningAmount,
                            secondTimeAmountEN: sourceWord.secondTimeAmount,
                            secondTimeAmountCH: sourceWord.secondTimeMeaningAmount,

                            height: 80,
                            width: screenWidth,
                            backgroundColor: getRandomColor(),
                            arrIndex: 0,
                            sourceWord,
                        }
                        return <HeadPannel item={item} />

                    }}
                    ListFooterComponent={function () {
                        return (

                            <GestureDetector gesture={Gesture.Pan().activeOffsetX([-10, 10])
                                .onStart(e => {

                                    //  console.log(flatlistScrollY.value)
                                })

                                .onEnd(e => {
                                    if ((Math.abs(e.translationX) >= 1) || (Math.abs(e.velocityX) >= 1000)) {
                                        runOnJS(goBack)()
                                    }
                                })}>
                                <View style={{ width: screenWidth, height: screenHeight - 80, backgroundColor: "wheat" }}
                                    onLayout={e => {

                                        paddingBlockMarker.value = e.nativeEvent.target
                                    }}

                                ></View>
                            </GestureDetector>
                        )
                    }}

                    data={data}
                    //   activationDistance={0}
                    //   autoscrollThreshold={0}
                    dragItemOverflow={true}
                    // renderPlaceholder={function () {
                    //     return <View style={headerStyle}><Text>aaa</Text></View>
                    // }}
                    onDragEnd={({ data, from, to, ...props }) => {

                        //if (from === to) return
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
                                    return newSourceWord//{...sourceWord}
                                }
                            })

                        })

                        setTimeout(() => {
                            saveWordToFile()
                        }, 100);

                        setData(data)
                    }}
                    //itemExitingAnimation={FlipOutEasyX}
                    keyExtractor={(item) => item.key}
                    // renderItem={RenderItem}
                    renderItem={
                        function ({ item, drag, isActive, getIndex, ...props }) {

                            if (!shouldRender) {

                                return <View style={useAnimatedStyle(() => {
                                    return {
                                        width: screenWidth,
                                        height: 80,
                                        backgroundColor: "darkgray"
                                    }
                                })} />
                            }


                            //     // return <View entering={FlipInEasyX.delay(getIndex() * 100)} style={{
                            //     //     width: screenWidth, height: 80, borderBottomWidth: 1,
                            //     //     borderBottomColor: "#D2B48C", backgroundColor: "#e7cca0"
                            //     // }} />
                            // }
                            return (

                                <DragblePannel item={item} drag={drag} isActive={isActive} getIndex={getIndex} allPannelArr={allPannelArr} />

                            )
                        }
                    }
                />


                <EditorCard />

            </View>

        </DragListContext.Provider >
    );

}









function getRandomColor() {
    "worklet";
    return `rgba(${Math.floor(256 * Math.random())},${Math.floor(256 * Math.random())},${Math.floor(256 * Math.random())},0.8)`
}
