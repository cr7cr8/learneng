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

import { StyleSheet, Button, Dimensions, TouchableOpacity, SafeAreaView, RefreshControl, BackHandler, Alert } from 'react-native';
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
    useAnimatedReaction,


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

//import Ionicons from '@expo/vector-icons/Ionicons';

var sign = CryptoJS("hellofff").toString();
console.log(">>>>>>>", sign)

let startPos = 0




export default function HomeScreen() {
    // return <Text>aa</Text>


    const { sourceWordArr, scrollRef, scrollRef2, frameTransY, wordPos, isListPlaying, preLeft, preTop, scrollY, scrollX,
        isPanning, speak, autoPlay, stopSpeak, isScrollingY, isScrollingX, isCardMoving, isManualDrag, shouldHideWordBlock } = useContext(Context)




    const headerViewStyle = useAnimatedStyle(() => {
        return {
            width: screenWidth,
            height: headHeight,

            backgroundColor: "wheat",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "flex-end",


        }
    })


    const frameStyle1 = useAnimatedStyle(() => {
        return {
            width: screenWidth,
            height: screenHeight - headHeight,
            backgroundColor: "#D6BD95",//"darkgray",
            // transform: [{ scale: interpolate(frameTransY.value, [720, 160], [0.9, 1], "clamp") }],
            // opacity: interpolate(frameTransY.value, [720, 160], [0.8, 1], "clamp")
        }

    })

    const [dataProvider] = useState(new DataProvider((r1, r2) => {
        return r1 !== r2;
    }));
    const [layoutProvider] = useState(
        new LayoutProvider(
            (index) => {
                //   console.log(sourceWordArr[index],"=====")
                const typeObj = {
                    index,

                    type: "typeA",
                    //    wordName: sourceWordArr[index].wordName,
                };
                return typeObj
            },
            (typeObj, dim) => {
                dim.width = screenWidth;
                dim.height = 80;
            }
        )

    )
    const [layoutProvider2, setlayoutProvider2] = useState(
        new LayoutProvider(
            (index) => {
                const rowObj = {
                    index,
                    type: "typeB",
                    //starLevel: sourceWordArr[index]?.level,
                    // cardObj: { heightArr: new Array(sourceWordArr[index]?.exampleEnglishArr.length * 2 || 0).fill(false), }
                };
                return rowObj
            },
            (rowObj, dim, index) => {
                if (index === index) { dim.width = screenWidth; dim.height = screenHeight - headHeight; }
                else { dim.width = screenWidth; dim.height = screenHeight - headHeight; }
            }
        )
    )
    // useEffect(() => {

    //     setlayoutProvider2(new LayoutProvider(
    //         (index) => {
    //             const rowObj = {
    //                 index, type: "typeB",
    //               //  starLevel: sourceWordArr[index]?.level,
    //               //  cardObj: { heightArr: new Array(sourceWordArr[index]?.exampleEnglishArr.length * 2 || 0).fill(false), }
    //             };

    //             return rowObj
    //         },
    //         (rowObj, dim, index) => {
    //             if (index === index) { dim.width = screenWidth; dim.height = screenHeight - headHeight; }
    //             else { dim.width = screenWidth; dim.height = screenHeight - headHeight; }
    //         }
    //     ))
    // }, [sourceWordArr])





    const frameStyle2 = useAnimatedStyle(() => {


        return {
            // position: "absolute",
            width: screenWidth,
            height: screenHeight - headHeight,

            backgroundColor: "transparent",
            backgroundColor: "wheat",
            transform: [{ translateY: -frameTransY.value },],
            //opacity: frameTransY.value < 160 ? 0.5 : 1


            // opacity:interpolate(frameTransY.value, [-screenHeight + headHeight, 0], [1, 0], "clamp")
        }

    })

    const visiblePanel = useRef([])
    const visibleCard = useRef([])






    const footStyle = useAnimatedStyle(() => {


        return {
            width: screenWidth,
            height: screenHeight - headHeight - 80,//frameTransY.vallue
            backgroundColor: "#D6BD95"
        }
    })


    const navigation = useNavigation()



    // useEffect(() => {
    //     //navigation.addListener("blur", () => {
    //             //console.log("going to leave the page")
    //     //})


    //     //  if (navigation.getState().routes[0].name === "RegScreen") {
    //     const unsubscribe = navigation.addListener("beforeRemove", function (e) {
    //         // console.log(navigation.getState().routes[0].name === "RegScreen")
    //         e.preventDefault()
    //         BackHandler.exitApp()
    //     })

    //     return unsubscribe
    //     // }
    // }, [])


    if (sourceWordArr.length === 0) { return <></> }


    const playButtonStyle1 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: isListPlaying.value ? withTiming(0) : withTiming(1) }]
        }
    })


    const playButtonStyle2 = useAnimatedStyle(() => {
        return {
            transform: [{ scale: isListPlaying.value ? withTiming(1) : withTiming(0) }],
            position: "absolute"
        }
    })



    return (
        <View
            style={[{
                width: 2 * screenWidth, height: screenHeight - headHeight, backgroundColor: "#D6BD95",// "#eee", //"darkgray"
                opacity: 1, flexDirection: "column",
                //     backgroundColor: "rgba(245, 222, 179,1)"
            },


            ]}>

            <View style={{
                width: screenWidth,
                height: headHeight,

                backgroundColor: "wheat",
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "flex-end",
            }}
                onTouchStart={function () {
                    console.log("header bar pressed")
                }}>

                {/* <ScrollView contentContainerStyle={{ backgroundColor: "transparent" }}
                    disableIntervalMomentum={true}
                    snapToInterval={headHeight}
                    showsVerticalScrollIndicator={false}
                    overScrollMode={"never"}
                >

                    <View style={{ width: screenWidth, height: headHeight, flexDirection: "row", justifyContent: "space-evenly", alignItems: "flex-end", paddingBottom: 4 }}>



                        <TouchableOpacity activeOpacity={0.2} onPressOut={function () {

                            isListPlaying.value = !isListPlaying.value
                            setTimeout(() => {
                                if (isListPlaying.value) { autoPlay() }
                                else { stopSpeak() }
                            }, 0);


                        }}>
                            <View style={playButtonStyle1}>
                                <Icon
                                    name="play-outline" type='ionicon' color='orange'
                                    containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: isListPlaying.value ? "90deg" : "0deg" }] }}
                                    size={40}
                                />
                            </View>
                            <View style={playButtonStyle2}>
                                <Icon
                                    name="stop-outline" type='ionicon' color='orange'
                                    containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: isListPlaying.value ? "90deg" : "0deg" }] }}
                                    size={40}
                                />
                            </View>
                        </TouchableOpacity>







                        <TouchableOpacity activeOpacity={0.2} onPressOut={function () {

                            //navigation.navigate("SentenceSettingScreen", { wordPos: JSON.parse(JSON.stringify(wordPos.value)) })  //string ingerger to show the mainpage

                        }}>
                            <Icon
                                name="settings" type='ionicon' color='orange'
                                containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "180deg" }] }}
                                size={40}
                            />
                        </TouchableOpacity>


                        <TouchableOpacity activeOpacity={0.2} onPressOut={function () {

                            if (preLeft.value == screenWidth) {
                                preLeft.value = withTiming(preLeft.value + 40)
                            }
                            else {
                                preLeft.value = withTiming(screenWidth)
                            }
                        }}>
                            <Icon
                                name="code-working-outline" type='ionicon' color='orange'
                                containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "90deg" }, { translateX: 0 }, { translateY: 0 }], zIndex: 100, }}
                                size={40}
                            />
                        </TouchableOpacity>

                    </View>
                    <RateBar />

                </ScrollView> */}
        
        
            </View>

            <View style={frameStyle1}>
                <RecyclerListView

                    //snapToInterval={80}
                    disableRecycling={false}

                    onVisibleIndicesChanged={(props) => {
                        //  showingPanel.current = props
                        visiblePanel.current = props
                    }}

                    onScroll={(e) => {
                        // e.persist()
                        isScrollingY.value = true
                        scrollY.value = e.nativeEvent.contentOffset.y

                        if (e.nativeEvent.contentSize.height <= 2000) { return }
                        if (!isPanning.value) {
                            preTop.value = interpolate(



                                e.nativeEvent.contentOffset.y,
                                [0, e.nativeEvent.contentSize.height - (screenHeight - headHeight)],
                                [80, screenHeight - 80], "clamp")
                        }
                    }}

                    layoutProvider={layoutProvider} //not always get call when upate in expoGO
                    dataProvider={dataProvider.cloneWithRows(sourceWordArr.map(item => item.wordName))}

                    onEndReached={() => { }}
                    onEndReachedThreshold={0}
                    onEndReachedThresholdRelative={0}
                    showsVerticalScrollIndicator={true}
                    decelerationRate={1}

                    renderFooter={function () {
                        return <View style={[footStyle]} />
                    }}

                    scrollViewProps={{
                        decelerationRate: 0.9999, // not working
                        // scrollEnabled: enableScroll,
                        //snapToInterval: snapInterval,
                        disableIntervalMomentum: false,
                        // refreshControl: (
                        //     <RefreshControl
                        //         refreshing={false}
                        //         onRefresh={async () => { console.log("refreshing -- 1") }}
                        //     />
                        // ),
                        //contentOffset: { y: wordPos.value * 80, x: 0 }, // not working with wordPos.value
                        ref: scrollRef,

                        // onContentSizeChange: (...props) => { },
                        // onScrollBeginDrag: () => { },

                        onScrollBeginDrag: () => {
                            isScrollingY.value = true
                        },
                        onScrollEndDrag: () => {
                            isScrollingY.value = false
                        },
                        onMomentumScrollBegin: () => {
                            isScrollingY.value = true
                        },


                        onMomentumScrollEnd: (e) => {

                            isScrollingY.value = false
                        },




                    }}


                    //rowRenderer={SwipebleRowItem} //---> cannot auto update in expoGo
                    rowRenderer={function (props) {

                        return <SwipebleRowItem {...props} frameTransY={frameTransY} visiblePanel={visiblePanel} />
                    }}
                />

            </View>


            <View style={frameStyle2}>


                <RecyclerListView

                    onScroll={function (e) {

                        isScrollingX.value = true
                        scrollX.value = e.nativeEvent.contentOffset.x


                    }}
                    onVisibleIndicesChanged={(props) => {

                        visibleCard.current = props

                    }}

                    isHorizontal={true}
                    //  renderContentContainer={function(){return <></>}}
                    layoutProvider={layoutProvider2}
                    dataProvider={dataProvider.cloneWithRows(sourceWordArr.map(item => item.wordName))}
                    rowRenderer={function (props) {
                        //console.log(props)
                        return (

                            <>

                                <Card {...props} visibleCard={visibleCard.current} />
                            </>
                        )
                        // return <Card index={typeObj.index} item={item} xPos={xPos} sourceWord={sourceWordArr[typeObj.index]} />
                    }}

                    scrollViewProps={{
                        scrollEnabled: true,
                        //contentOffset: { x: route.params.pos * screenWidth, y: 0 },// not workiing
                        ref: scrollRef2,
                        disableIntervalMomentum: true,
                        snapToInterval: screenWidth,
                        //scrollEnabled: enableScroll,
                        contentContainerStyle: {

                            backgroundColor: "transparent",
                            elevation: 10,
                            shadowColor: 'red',


                        },
                        //disableScrollViewPanResponder: true, // no use, not available, use scrollEnabled instead
                        // refreshControl: (
                        //     <RefreshControl
                        //         refreshing={false}
                        //         onRefresh={async () => {
                        //       //      frameTransY.value = withTiming(160,{duration:150})
                        //             console.log("refreshing -- 2")
                        //         }}
                        //     />
                        // ),
                        onScrollBeginDrag: () => {
                            isScrollingX.value = true
                            isManualDrag.value = true
                            startPos = scrollX.value
                            //not called if it is programmly scrolled

                        },
                        onScrollEndDrag: () => {
                            isScrollingX.value = false
                            //not called if it is programmly scrolled
                        },
                        onMomentumScrollBegin: () => {

                            isScrollingX.value = true
                            //always called if there is animation
                        },
                        onMomentumScrollEnd: function (e) {
                            //always called if there is animation


                            // console.log(e.nativeEvent.contentOffset.x - startPos)



                            isScrollingX.value = false


                            if ((isListPlaying.value == false) && (isManualDrag.value)) {
                                wordPos.value = e.nativeEvent.contentOffset.x / screenWidth


                                if (e.nativeEvent.contentOffset.x - startPos) {
                                    speak(
                                        sourceWordArr[Math.round(e.nativeEvent.contentOffset.x / screenWidth)].wordName,
                                        sourceWordArr[Math.round(e.nativeEvent.contentOffset.x / screenWidth)].wordName
                                    )
                                }

                                scrollRef.current._scrollViewRef.scrollTo({
                                    y: e.nativeEvent.contentOffset.x / screenWidth * 80 - (screenHeight - frameTransY.value - headHeight),
                                    animated: true
                                })
                            }


                            isManualDrag.value = false

                        }
                    }}
                />
            </View>

            <ScrollPivot />

        </View>


    )





}

// function RateBar() {

//     const { setSouceWordArr, saveWordToFile, sourceWordArr, refreshState, setRefreshState, wordPos, scrollX } = useContext(Context)




//     const localLevel = useDerivedValue(() => {
//         return sourceWordArr[Math.round(scrollX.value / screenWidth)].level
//     }, [scrollX.value])

//     // const localPos = useSharedValue(6)
//     // useAnimatedReaction(
//     //     () => { return wordPos.value },
//     //     (current, previous) => {
//     //         console.log(previous,current)
//     //         localPos.value = sourceWordArr[wordPos.value].level
//     //     },
//     //    // [] // calls when wordPos value change
//     // )




//     function saveLevel(newLevel) {
//         const sourceWord = sourceWordArr[Math.round(scrollX.value / screenWidth)]

//         setSouceWordArr(sourceWordArr => {
//             const arr = sourceWordArr.map(word => {
//                 if (word.wordName !== sourceWord.wordName) {
//                     return word
//                 }
//                 else {
//                     const newWord = JSON.parse(JSON.stringify(word))
//                     newWord.level = newLevel
//                     return newWord
//                 }

//             })


//             return arr

//         })


//         setTimeout(() => {
//             saveWordToFile()
//         }, 100);

//     }



//     return (
//         <View style={useAnimatedStyle(() => {

//             return {
//                 backgroundColor: "transparent",// isDownloaded.value ? "wheat" : "#e7cca0",
//                 width: screenWidth, height: headHeight, flexDirection: "row",
//                 justifyContent: "space-evenly",
//                 alignItems: "flex-end",
//                 padding: 0, margin: 0, paddingHorizontal: 0, marginHorizontal: 0,
//                 paddingBottom: 4
//             }
//         })}>

//             {[0, 1, 2, 3, 4, 5].map((levelIndex, index) => {


//                 return <GestureDetector key={index} gesture={Gesture.Tap().onStart(e => {
//                     if (localLevel.value === levelIndex) { return }
//                     else {
//                         localLevel.value = levelIndex
//                         runOnJS(saveLevel)(levelIndex)
//                     }
//                 })} >
//                     <View style={

//                         [useAnimatedStyle(() => {
//                             return {
//                                 width: 40, height: 40, borderRadius: 999, borderColor: "orange", flexDirection: "row",
//                                 borderWidth: 1, justifyContent: "center", alignItems: "center",
//                                 backgroundColor: localLevel.value === levelIndex
//                                     ? "orange"
//                                     : "transparent",

//                                 padding: 0, margin: 0, paddingHorizontal: 0, marginHorizontal: 0
//                             }
//                         })]
//                     }>

//                         <Text style={[
//                             useAnimatedStyle(() => {
//                                 return { color: localLevel.value === levelIndex ? "wheat" : "orange", fontSize: 15, fontWeight: "900" }
//                             }),
//                         ]}>{levelIndex}</Text>

//                     </View>

//                 </GestureDetector>
//             })

//             }



//         </View >
//     )
// }


