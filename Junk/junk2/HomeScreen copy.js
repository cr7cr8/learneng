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
    withRepeat

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
var sign = CryptoJS("hellofff").toString();
console.log(">>>>>>>", sign)

let startPos = 0

export default function HomeScreen() {



    const { sourceWordArr, scrollRef, scrollRef2, frameTransY, wordPos, isListPlaying, preLeft, preTop, scrollY, scrollX,
        isPanning, speak, autoPlay, isScrollingY, isScrollingX, isCardMoving, isManualDrag, shouldHideWordBlock } = useContext(Context)




    const headerViewStyle = useAnimatedStyle(() => {
        return {
            width: screenWidth,
            height: headHeight,
            // backgroundColor: "#faf",
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
            backgroundColor: "gray",
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
            (index,) => { const typeObj = { index, type: "typeB", sourceWord: sourceWordArr[index] && sourceWordArr[index] }; return typeObj },
            (typeObj, dim, index) => {
                if (index === index) { dim.width = screenWidth; dim.height = screenHeight - headHeight; }
                else { dim.width = screenWidth; dim.height = screenHeight - headHeight; }
            }
        )
    )
    useEffect(() => {
        setlayoutProvider2(new LayoutProvider(
            (index,) => { const typeObj = { index, type: "typeB", sourceWord: sourceWordArr[index] && sourceWordArr[index] }; return typeObj },
            (typeObj, dim) => {
                dim.width = screenWidth;
                dim.height = screenHeight - headHeight;

            }
        ))
    }, [sourceWordArr])


    //const frameTransY = useSharedValue(screenHeight - headHeight)


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




    // }, [wordPos.value])

    // const speak = useDebouncedCallback((word) => {
    //     Speech.stop()
    //     Speech.speak(word, {
    //         onDone: () => {
    //             //Speech.speak(sourceWord.meaningSound)
    //         }
    //     });

    // }, 300, { leading: true, trailing: true })


    const panningBarStyle = useAnimatedStyle(() => {
        //const isOnFirst = frameTransY.value === screenHeight - (headHeight + 80)
        return {


            width: screenWidth,
            height: 20,



            backgroundColor: isCardMoving.value ? "orange" : "wheat",
            position: "absolute",
            zIndex: 100,
            justifyContent: "center",
            alignItems: "flex-start",
            display: "flex",
            flexDirection: "row",
            //isScrollingY.value ? 0.5 : 0.51,
            elevation: isCardMoving.value ? 10 : 0,
            opacity: (!isScrollingY.value) && (!isScrollingX.value) ? 1 : 0,
        }

    })

    const panInfo = useSharedValue(0)
    const pan = Gesture.Pan()
        //.enabled(enablePan)
        .onBegin(e => {
            isCardMoving.value = true
        })
        .onStart((e) => {
            // if (isScrollingY.value) { return }

            panInfo.value = frameTransY.value
        })
        .onChange(e => {
            //   if (isScrollingY.value) { return }
            isScrollingY.value = false
            isCardMoving.value = true
            frameTransY.value = Math.max(0, Math.min(screenHeight - headHeight, frameTransY.value - e.changeY))



        })
        .onTouchesUp(e => {
            //  if (isScrollingY.value) { return }
            if (((screenHeight - headHeight) - frameTransY.value) < 80) {
                frameTransY.value = withTiming(screenHeight - headHeight, { duration: 50 })
            }

            else if (frameTransY.value < 160) {
                frameTransY.value = withTiming(0, { duration: 50 })

            }
            isCardMoving.value = false
        })
        //   .activeOffsetY([-10, 10])   // this line also use   .minDistance(20)

        .onFinalize(() => {
            isCardMoving.value = false
        })

    const doubleTap = Gesture.Tap().numberOfTaps(2).maxDelay(1000).onEnd(e => {
        //console.log(frameTransY.value)
        if (frameTransY.value === screenHeight - headHeight) {
            frameTransY.value = withTiming(0)
        }
        else {
            frameTransY.value = withTiming(screenHeight - headHeight)
        }

        // if (frameTransY.value === screenHeight - headHeight - 80) {
        //     frameTransY.value = withTiming(160)
        // }
        // else {
        //     frameTransY.value = withTiming(screenHeight - headHeight - 80)
        // }
    })



    const footStyle = useAnimatedStyle(() => {


        return {
            width: screenWidth,
            height: screenHeight - headHeight - 80,//frameTransY.vallue
            backgroundColor: "#D6BD95"
        }
    })

    // const [snapInterval, setSnapInterval] = useState(undefined)
    // useDerivedValue(() => {
    //     if (frameTransY.value === screenHeight - headHeight - 80) {
    //         runOnJS(setSnapInterval)(80)
    //     }
    //     else {
    //         runOnJS(setSnapInterval)(undefined)
    //     }

    // }, [frameTransY.value])

    // useDerivedValue(()=>{
    // console.log("scrollXvalue",scrollX.value,scrollX.value/screenWidth,Math.round(scrollX.value/screenWidth))
    // },[scrollX.value])

    return (
        <View style={{ width: 2 * screenWidth, height: screenHeight - headHeight, backgroundColor: "#eee", opacity: 1, flexDirection: "column", }}>

            <View style={[headerViewStyle]}>

                <TouchableOpacity activeOpacity={0.2} onPressOut={function () { }}>
                    <Icon
                        name="add-circle-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "180deg" }] }}
                        size={40}
                    />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.2} onPressOut={function () { }}>
                    <Icon
                        name="swap-horizontal-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "90deg" }] }}
                        size={40}
                    />
                </TouchableOpacity>


                <TouchableOpacity activeOpacity={0.2} onPressOut={function () { }}>
                    <Icon
                        name="funnel-outline" type='ionicon' color='orange'
                        containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "0deg" }, { translateX: 0 }, { translateY: 0 }], zIndex: 100, }}
                        size={40}
                    />
                </TouchableOpacity>



                <TouchableOpacity activeOpacity={0.2} onPressOut={function () { }}>
                    <Icon
                        name="save" type='ionicon' color='orange'
                        containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "180deg" }] }}
                        size={40}
                    />
                </TouchableOpacity>
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


                    renderFooter={function () {


                        // return <LinearGradient
                        //     colors={["#D6BD95",  "#fcd19dbb"]}
                        //     //colors={["#D6BD95", "wheat"]}
                        //     dither={true}
                        //     start={{ x: 0, y: 0 }}
                        //     end={{ x: 0, y: 1 }}
                        //     locations={[0.1, 0.8]}
                        //     //Example:  
                        //     // colors={[red', 'green']}
                        //     // locations={[0.3,0.4]}  // full red 30% of width   //mixed red-and-green (40% - 30% = 10%) of width     // full green  100% - 40% = 60% of width
                        //     //                        // ______red = 30%______   ___mixed = 10%___   _________green = 60%__________________     
                        //     style={{
                        //         // position: 'absolute',
                        //         // left: 0,
                        //         // right: 0,
                        //         // top: 0,
                        //         height: screenHeight - headHeight - 80,
                        //         width: screenWidth,
                        //         //     transform:[{translateX:10}]
                        //     }}
                        // />

                        return <View style={[footStyle]} />
                    }}

                    scrollViewProps={{
                        // scrollEnabled: enableScroll,
                        //snapToInterval: snapInterval,
                        disableIntervalMomentum: false,
                        refreshControl: (
                            <RefreshControl
                                refreshing={false}
                                onRefresh={async () => { console.log("refreshing -- 1") }}
                            />
                        ),
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
                {/* <GestureDetector gesture={Gesture.Exclusive(doubleTap, pan)}>
                    <View style={[panningBarStyle]}>

                        <Icon
                            name="reorder-two-outline" type='ionicon' color="rgba(168, 155, 147, 1)"
                            containerStyle={{
                                width: 40, height: 40,

                                opacity: 0.5,
                                transform: [{ translateX: 8 }, { translateY: -10 }], alignItems: "center", justifyContent: "center"
                            }}
                            size={40}
                        />
                        <Icon
                            name="reorder-two-outline" type='ionicon' color="rgba(168, 155, 147, 1)"
                            containerStyle={{
                                width: 40, height: 40,
                                opacity: 0.5,
                                transform: [{ translateX: -8 }, { translateY: -10 }], alignItems: "center", justifyContent: "center"
                            }}
                            size={40}

                        />
                    </View>
                </GestureDetector> */}

                <RecyclerListView

                    onScroll={function (e) {
                        isScrollingX.value = true
                        scrollX.value = e.nativeEvent.contentOffset.x

                        //    xPos.value = e.nativeEvent.contentOffset.x
                        // console.log(  e.nativeEvent.contentOffset.x)

                    }}
                    onVisibleIndicesChanged={(props) => {
                        //  showingPanel.current = props
                        //   console.log("visiblechanged",props)
                        visibleCard.current = props

                    }}

                    isHorizontal={true}
                    //  renderContentContainer={function(){return <></>}}
                    layoutProvider={layoutProvider2}
                    dataProvider={dataProvider.cloneWithRows(sourceWordArr.map(item => item.wordName))}
                    rowRenderer={function (props) {
                        return <Card {...props} visibleCard={visibleCard.current} />
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


                                // scrollRef.current._scrollViewRef.scrollTo({
                                //     y: e.nativeEvent.contentOffset.x / screenWidth * 80 - (screenHeight - frameTransY.value - headHeight) + 80,
                                //     animated: true
                                // })

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

            {sourceWordArr.length > 25 && <ScrollPivot />}

        </View>


    )





}

