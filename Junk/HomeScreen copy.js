import React, { memo, useCallback, useMemo, useTransition } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState, useContext } from 'react';
import * as Device from 'expo-device';
import ContextProvider from './ContextProvider';
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
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


import { Audio } from 'expo-av';
import startPromiseSequential from 'promise-sequential';

import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
const headHeight = getStatusBarHeight() > 24 ? 70 : 60



import { ListItem, Avatar, LinearProgress, Tooltip, Icon, Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDebounce, useDebouncedCallback, useThrottledCallback } from 'use-debounce';

export default function HomeScreen() {
    const { scrollRef, scrollRef2, wordPos, isListPlaying, saveWordToFile, refreshWordToFile, isSaving,
        startPlay, stopPlay, frameTransY, sourceWordArr, playSound0, playSound, setSouceWordArr, yPos
    } = useContext(Context)


    const setPoint = useDebouncedCallback(function () {
        AsyncStorage.setItem("buttonPoint", JSON.stringify({
            offsetX: offsetX.value,
            offsetY: offsetY.value,
            preOffsetX: offsetX.value,
            preOffsetY: offsetY.value
        }))


    },
        2000,
        {
            leading: false,
            trailing: true,
        }
    )



    const navigation = useNavigation()
    const route = useRoute()
    useEffect(() => {
        const unsubscribe = navigation.addListener("beforeRemove", function (e) {
            console.log("leaving Home")
        })
        return unsubscribe
    }, [])

    useEffect(() => {

        console.log("islistplaying", isListPlaying.value)
    }, [isListPlaying.value])

    const [cardRefresh, setCardRefrsh] = useState(Date.now())
    useEffect(() => {

        const unsubscribe = navigation.addListener('focus', () => {
            //  !isListPlaying.value && playSound0(sourceWordArr[wordPos.value].wordName)
            setTimeout(() => {
                setCardRefrsh(Date.now())
            }, 0)



            // setTimeout(() => {
            //     console.log("on homepage")
            //     setCardRefrsh(Date.now())
            //     //   if (scrollRef.current?._scrollViewRef?.scrollTo) {
            //     //   !isListPlaying.value && scrollRef.current._scrollViewRef.scrollTo({ y: wordPos.value * 80 - 80, animated: false })
            //     //   }
            // }, 2000)

        });
        return unsubscribe

    }, [navigation, isListPlaying.value]);

    useEffect(() => {
        const backAction = () => {

            //console.log("can go back,", navigation.canGoBack())

            if (navigation.canGoBack()) {
                navigation.goBack()
            }

            else if (frameTransY.value !== 0) {
                frameTransY.value = withTiming(0)
            }
            else {
                BackHandler.exitApp()
            }
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, []);

    const routesLength = useNavigationState((state) => state.routes.length);

    const [dataProvider] = useState(new DataProvider((r1, r2) => {
        return r1 !== r2;
    }));
    const [layoutProvider] = useState(
        new LayoutProvider(
            (index) => { const typeObj = { index, type: "typeA" }; return typeObj },
            (typeObj, dim) => {
                dim.width = screenWidth;
                dim.height = 80;
            }
        )

    )

    const [layoutProvider2] = useState(
        new LayoutProvider(
            (index) => { const typeObj = { index, type: "typeB" }; return typeObj },
            (typeObj, dim) => {
                dim.width = screenWidth;
                dim.height = screenHeight - headHeight;
            }
        )
    )


    const rowItemRenderer = function (typeObj, item) {


        // const SwipebleRowItemRender = memo(SwipebleRowItem, function (prevProp, nextProp) {
        //     console.log(prevProp, nextProp)
        //     console.log("Xxxxxxxxxxxxxxxxxxxxx")
        // })

        return <SwipebleRowItem typeObj={typeObj} item={item} key={item} sourceWord={sourceWordArr[typeObj.index]} />
       // return <SwipebleRowItem2 typeObj={typeObj} item={item} key={item} sourceWord={sourceWordArr[typeObj.index]} />

    }



    const onEndReach = () => { };


    const offsetX = useSharedValue(-10)
    const preOffsetX = useSharedValue(-10)

    const offsetY = useSharedValue(headHeight + 10)
    const preOffsetY = useSharedValue(headHeight + 10)

    useEffect(() => {

        AsyncStorage.getItem("buttonPoint").then(obj_ => {

            if (obj_) {
                const obj = JSON.parse(obj_)
                offsetX.value = obj.offsetX
                offsetY.value = obj.offsetY

                preOffsetX.value = obj.preOffsetX
                preOffsetY.value = obj.preOffsetY

                setTimeout(() => {
                    setCardRefrsh(Date.now())
                }, 1000);

            }


        })



    }, [])



    const [handleBarHeight, setHandleBarHeight] = useState(0)



    const panStyle = useAnimatedStyle(() => {

        return {
            transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
            // backgroundColor: "skyblue",
            backgroundColor: isListPlaying.value === true ? "green" : "red",
            borderRadius: 999,

            width: 80,
            height: 80,
            opacity: offsetX.value === 0 ? 1 : 0.5,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 500
            //  position: "absolute",
            //   right: isListPlaying.value ? -2222 : 0,

        }

    })


    const panStyle2 = useAnimatedStyle(() => {

        return {
            transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
            backgroundColor: isListPlaying.value === true ? "green" : "red",
            //backgroundColor: isListPlaying.value === true ? "green" : "red",
            borderRadius: 999,

            width: 80,
            height: 80,
            opacity: offsetX.value === 0 ? 1 : 0.5,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 500
            //  position: "absolute",
            //   right: isListPlaying.value ? -2222 : 0,

        }

    })





    function scrollByPercent(percent) {
        scrollRef.current._scrollViewRef.scrollTo({ y: (sourceWordArr.length * 80 - handleBarHeight) * percent, animated: true })
        const tempPos = Math.floor((sourceWordArr.length * screenWidth * percent) / screenWidth)
        scrollRef2.current._scrollViewRef.scrollTo({ x: tempPos * screenWidth, animated: true })
        if (frameTransY.value === -screenHeight + headHeight) {

            wordPos.value = tempPos === sourceWordArr.length ? (tempPos - 1) : tempPos
        }
        // console.log(tempPos, percent)

    }


    const pan = Gesture.Pan()
        .onTouchesDown(event => {

        })

        .onChange(event => {
            offsetX.value = Math.min(0, Math.max(-screenWidth + 80, preOffsetX.value + event.translationX))

            offsetY.value = Math.min(Math.max(headHeight, preOffsetY.value + event.translationY), screenHeight - 80)


        })
        .onEnd(event => {
            console.log(offsetY.value - headHeight)
            const movingPercent = (offsetY.value - headHeight) / (screenHeight - headHeight - 80)
            console.log("percent", movingPercent)
            !isListPlaying.value && offsetX.value === 0 && runOnJS(scrollByPercent)(movingPercent)
            preOffsetX.value = offsetX.value
            preOffsetY.value = offsetY.value

            runOnJS(setPoint)()
            // AsyncStorage.setItem("buttonPoint", JSON.stringify({
            //     offsetX: offsetX.value,
            //     offsetY: offsetY.value,
            //     preOffsetX: offsetX.value,
            //     preOffsetY: offsetY.value
            // }))
        })
        .onTouchesUp(event => {
            if (((preOffsetX.value === offsetX.value) && (!isListPlaying.value))
                &&
                (preOffsetY.value === offsetY.value)) {
                runOnJS(startPlay)()
            }
            else if ((preOffsetX.value === offsetX.value) && (isListPlaying.value) &&
                (preOffsetY.value === offsetY.value)) {
                runOnJS(stopPlay)()
            }

        })











    //const [posState, setPosState] = useState(wordPos.value)
    function scrollRef2ScrollTo(wordPos) {
        setTimeout(() => {
            scrollRef2.current._scrollViewRef.scrollTo({ x: wordPos.value * screenWidth, animated: isListPlaying.value ? true : false })
        }, 0);

    }

    useDerivedValue(() => {
        // console.log("========>>>>=====", wordPos.value);
        // runOnJS(scrollRef2?.current?._scrollViewRef.scrollTo)({ x: wordPos.value * screenWidth, animated: true })
        ((frameTransY.value !== -screenHeight + headHeight) || isListPlaying.value) && runOnJS(scrollRef2ScrollTo)(wordPos)
        //  runOnJS(setPosState)(wordPos.value) //needed to swipe the card when playing list

    }, [isListPlaying.value, frameTransY.value])

    const [enableScroll, setEnableScroll] = useState(!isListPlaying.value)
    useDerivedValue(() => {
        runOnJS(setEnableScroll)(!isListPlaying.value)
    }, [isListPlaying.value])

    const xPos = useSharedValue(0)

    useDerivedValue(() => {
        if ((!isListPlaying.value) && (frameTransY.value === -screenHeight + headHeight)) {
            wordPos.value = Math.round(xPos.value / screenWidth)

        }

    }, [isListPlaying.value, frameTransY.value])






    const frameStyle1 = useAnimatedStyle(() => {
        return {

            width: screenWidth,
            height: screenHeight - headHeight,
            backgroundColor: "darkgray",

        }

    })

    const frameStyle2 = useAnimatedStyle(() => {
        return {

            width: screenWidth,
            height: screenHeight - headHeight,
            backgroundColor: "darkgray",
            transform: [
                { translateY: frameTransY.value },
                //{ scale: interpolate(frameTransY.value, [-screenHeight + headHeight, 0], [1, 0.5], "clamp") }
            ],
            // opacity:interpolate(frameTransY.value, [-screenHeight + headHeight, 0], [1, 0], "clamp")
        }

    })

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



    return (
        <View style={{ width: 2 * screenWidth, height: screenHeight - headHeight, backgroundColor: "#eee", opacity: 1, flexDirection: "column", }}>


            <View style={[headerViewStyle]}>

                <TouchableOpacity activeOpacity={0.2} onPressOut={function () {

                    navigation.navigate("NewWordScreen")
                    //  console.log(sourceWordArr.length)
                }}>
                    <Icon name="add-circle-outline" type='ionicon' color='orange'


                        containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "180deg" }] }}
                        // containerStyle={{ position: "absolute", right: 0, transform: [{ translateY: 0 }] }}
                        size={40}
                    />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.2} onPressOut={function () {
                    refreshWordToFile()
                    // isSaving.value = true
                    // AsyncStorage.getItem("sortingObj").then((obj_) => {

                    //     const { levelBar, latestOnTop, shouldSlice, fromIndex, toIndex } = JSON.parse(obj_)

                    //     refreshWordToFile().then(() => {


                    //         FileSystem.readAsStringAsync(FileSystem.documentDirectory + "allwords.txt").then(content => {

                    //             const arr = JSON.parse(content)

                    //             setSouceWordArr(() => {
                    //                 const wordsArr = arr.filter(item => {
                    //                     return levelBar[item.level]
                    //                 })

                    //                 wordsArr.sort((word1, word2) => {
                    //                     return latestOnTop ? (word2.toppingTime - word1.toppingTime) : (-word2.toppingTime + word1.toppingTime)
                    //                 })

                    //                 if (shouldSlice) {
                    //                     isSaving.value = false
                    //                     return wordsArr.slice(Number(fromIndex), Number(toIndex)+1)
                    //                 }
                    //                 else {
                    //                     isSaving.value = false
                    //                     return wordsArr
                    //                 }
                    //             })
                    //         })
                    //     })
                    // })

                }}>

                    <Icon name="swap-horizontal-outline" type='ionicon' color='orange'


                        containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "90deg" }] }}
                        // containerStyle={{ position: "absolute", right: 0, transform: [{ translateY: 0 }] }}
                        size={40}
                    />

                </TouchableOpacity>


                <TouchableOpacity activeOpacity={0.2} onPressOut={function () {

                    //  navigation.navigate("WordSettingScreen", { sourceWord: sourceWordArr[wordPos.value] })
                    navigation.navigate("SortingScreen")
                }}>
                    <Icon name="funnel-outline" type='ionicon' color='orange'


                        containerStyle={{
                            width: 40, height: 40,
                            transform: [{ rotateZ: "0deg" }, { translateX: 0 }, { translateY: 0 }],
                            zIndex: 100,
                        }}

                        size={40}
                    />
                </TouchableOpacity>



                <TouchableOpacity activeOpacity={0.2} onPressOut={function () {
                    saveWordToFile()
                    //  console.log(sourceWordArr.length)
                }}>
                    <Icon name="save" type='ionicon' color='orange'


                        containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "180deg" }] }}
                        // containerStyle={{ position: "absolute", right: 0, transform: [{ translateY: 0 }] }}
                        size={40}
                    />
                </TouchableOpacity>
            </View>
            <View style={frameStyle1}>



                <RecyclerListView

                    onScroll={function (e) {
                        if (!handleBarHeight) { setHandleBarHeight(e.nativeEvent.layoutMeasurement.height) }
                        yPos.value = e.nativeEvent.contentOffset.y
                    }}
                    onItemLayout={e => {

                    }}

                    layoutProvider={layoutProvider}
                    dataProvider={dataProvider.cloneWithRows(sourceWordArr.map(item => item.wordName))}
                    //  dataProvider={dataProvider.cloneWithRows(sourceWordArr.map(item => item.key))}
                    rowRenderer={rowItemRenderer}
                    // extendedState={this.state}
                    onEndReached={onEndReach}
                    onEndReachedThreshold={0}
                    onEndReachedThresholdRelative={0}
                    scrollViewProps={{
                        // scrollEnabled: enableScroll,
                        refreshControl: (
                            <RefreshControl
                                refreshing={false}
                                onRefresh={async () => {
                                    console.log("refreshing")
                                    setCardRefrsh(Date.now())

                                }}

                            />
                        ),
                        //contentOffset: { y: wordPos.value * 80, x: 0 }, // not working with wordPos.value
                        ref: scrollRef,
                        onContentSizeChange: (...props) => { },
                        onScrollBeginDrag: () => { },
                        onScrollDragEnd: () => { },
                        onMomentumScrollEnd: (e) => { }






                    }}


                />
            </View>
            <View style={frameStyle2}>
                <RecyclerListView
                    onScroll={function (e) {


                        xPos.value = e.nativeEvent.contentOffset.x


                    }}
                    isHorizontal={true}
                    //  renderContentContainer={function(){return <></>}}
                    layoutProvider={layoutProvider2}
                    dataProvider={dataProvider.cloneWithRows(sourceWordArr.map(item => item.wordName))}
                    rowRenderer={function (typeObj, item) {

                        return <Card index={typeObj.index} item={item} xPos={xPos} sourceWord={sourceWordArr[typeObj.index]} />
                    }}

                    scrollViewProps={{

                        //contentOffset: { x: route.params.pos * screenWidth, y: 0 },// not workiing
                        ref: scrollRef2,
                        disableIntervalMomentum: true,
                        snapToInterval: screenWidth,
                        //scrollEnabled: enableScroll,
                        //  contentContainerStyle: { backgroundColor: "lightblue" },
                        onMomentumScrollEnd: function (e) {
                            //console.log(e.nativeEvent)
                            setTimeout(() => {
                                if (!isListPlaying.value) {
                                    wordPos.value = Math.round(xPos.value / screenWidth)
                                    console.log("momentumScrollEnd", wordPos.value)

                                    setTimeout(() => {
                                        !isListPlaying.value && scrollRef.current._scrollViewRef.scrollTo({ y: wordPos.value * 80 - 80, animated: true })
                                        !isListPlaying.value && playSound(sourceWordArr[wordPos.value].wordName)

                                    }, 0);

                                }

                            }, 0);

                        }
                    }}
                />








            </View>
            <View style={{ backgroundColor: "#aaa", width: 0, height: screenHeight - getStatusBarHeight(), position: "absolute", right: 80 + screenWidth }}>
                <GestureHandlerRootView >
                    <GestureDetector gesture={pan} >
                        <View style={panStyle}>
                            {enableScroll ?
                                <Text>Stopped</Text>
                                : <Text>Playing</Text>
                            }


                        </View>


                    </GestureDetector>
                </GestureHandlerRootView>
                <View style={[panStyle2, { display: "none" }]}>


                </View>

            </View>

        </View>


    )







}

function SwipebleRowItem2({typeObj, item, sourceWord }){
    const { playMeaningSound, scrollRef, wordPos, isListPlaying,
        startPlay, stopPlay,
    } = useContext(Context)

    const selfPanel = useRef()
    const [panelRefresh, setPanelRefrsh] = useState(Date.now())

    const styles = StyleSheet.create({
        rightAction: { width: 100, height: 80, backgroundColor: 'purple' },
        separator: {
          width: '100%',
          borderTopWidth: 1,
        },
        swipeable: {
          marginTop:200,
          height: 80,
          backgroundColor: 'papayawhip',
          alignItems: 'center',
          borderBottomWidth:1,
          justifyContent:"center"
        },
      });

      function RightAction(prog, drag) {
        const styleAnimation = useAnimatedStyle(() => {
      
      
          return {
            width:100,
            backgroundColor:"pink",
            transform: [{ translateX: drag.value + 100 }],
            justifyContent:"center",
            alignItems:"center",
          };
        });
      
        return (
          <View style={styleAnimation}>
            <Text >Text</Text>
          </View>
        );
      }
      
      function LeftAction(prog, drag) {
        const styleAnimation = useAnimatedStyle(() => {
          return {
            width:100,
            transform: [{ translateX: drag.value - 100 }],
          };
        });
      
        return (
          <View style={styleAnimation}>
            <Text style={styles.rightAction}>Text</Text>
          </View>
        );
      }








    return     <GestureHandlerRootView>
    <ReanimatedSwipeable
      containerStyle={styles.swipeable}
      friction={2}
      enableTrackpadTwoFingerGesture
      leftThreshold={20}
      rightThreshold={20}
      renderRightActions={RightAction}
      renderLeftActions={LeftAction}
      >
      
      <Text>{item}</Text>
    </ReanimatedSwipeable>
  </GestureHandlerRootView>


}

function SwipebleRowItem({ typeObj, item, sourceWord }) {

    const { playMeaningSound, scrollRef, wordPos, isListPlaying,
        startPlay, stopPlay,
    } = useContext(Context)


    const selfPanel = useRef()

    const [panelRefresh, setPanelRefrsh] = useState(Date.now())

    return (
        <SwipeableItem key={item}
            swipeDamping={10} //Hswipe velocity determines snap position ,smaller number means swipe velocity will have a larger effect and row will swipe open more easily
            activationThreshold={20}
            overSwipe={20}
            snapPointsLeft={[80]}//{[screenWidth - screenWidth/2]}
            snapPointsRight={[160]}//{[screenWidth - 80]}//{ [screenWidth - screenWidth/2] }

            ref={(ref) => {

                selfPanel.current = ref

            }}

            onChange={({ openDirection, snapPoint, ...props }) => {

            }}

            renderUnderlayLeft={() => {
                return <UnderlayRight item={item} index={typeObj.index} selfPanel={selfPanel} sourceWord={sourceWord} setPanelRefrsh={setPanelRefrsh} />
            }}

            renderUnderlayRight={() => {


                return <UnderlayLeft item={item} index={typeObj.index} selfPanel={selfPanel} sourceWord={sourceWord} setPanelRefrsh={setPanelRefrsh} />
            }}
        >
            <PanelItem wordPos={wordPos} item={item} index={typeObj.index} selfPanel={selfPanel} sourceWord={sourceWord} />

        </SwipeableItem>
    )
}


function PanelItem({ wordPos, index, item, selfPanel, sourceWord }) {




    const { playSound, frameTransY, sourceWordArr,
        startPlay, stopPlay, isListPlaying, setWordPos, scrollRef2 } = useContext(Context)
    const realSourceWord = sourceWordArr.find(item => item.wordName === sourceWord.wordName)

    const { percentOpen, openDirection, openLeft, openRight, percentOpenLeft, percentOpenRight, open, isGestureActive, close } = useSwipeableItemParams();




    const navigation = useNavigation()
    const [refresh, setRefresh] = useState(Date.now())
    useEffect(() => {

        const unsubscribe = navigation.addListener('focus', () => {
            //  !isListPlaying.value && playSound0(sourceWordArr[wordPos.value].wordName)
            setTimeout(() => {
                setRefresh(Date.now())
            }, 0)



            // setTimeout(() => {
            //     console.log("on homepage card")
            //     setCardRefrsh(Date.now())
            //     //   if (scrollRef.current?._scrollViewRef?.scrollTo) {
            //     //   !isListPlaying.value && scrollRef.current._scrollViewRef.scrollTo({ y: wordPos.value * 80 - 80, animated: false })
            //     //   }
            // }, 2000)

        });
        return unsubscribe

    }, [navigation]);

    const rowItemStyle = useAnimatedStyle(() => {

        return {

            borderBottomWidth: 1,
            height: 80,
            zIndex: 100,
            // transform: [{ translateY: index * 80 }],
            //   backgroundColor: wordPos.value === index ? "#c3e1a2": "wheat"  // "#eee"
            backgroundColor: wordPos.value === index ? "wheat" : "#eee"
            //backgroundColor: "#eee"

        }

    })

    const tap = Gesture.Tap()

        .onEnd(event => {
            if (percentOpen.value !== 0) {
                runOnJS(selfPanel.current.close)()
            }
            else if ((!isListPlaying.value) && (percentOpen.value === 0)) {
                //  runOnJS(console.log)(index)
                runOnJS(playSound)(item)
                wordPos.value = index
                //runOnJS(setWordPos)(index)
                //      scrollRef.current._scrollViewRef.scrollTo({ x: wordPos.value * screenWidth, animated: true })
                // runOnJS(scrollRef2.current._scrollViewRef.scrollTo)({ x: wordPos.value * screenWidth, animated: true})

            }

        })

    const onHandlerStateChange = (event) => {

        if ((event.nativeEvent.state === 5) && (percentOpen.value === 0)) {
            //  setTimeout(() => {
            frameTransY.value = withTiming(-screenHeight + headHeight)
            //   }, 0);
            //frameTransY.value = withTiming(-screenHeight + headHeight)
            // navigation.navigate("CardScreen", { pos: wordPos.value })
        }



        // console.log("tap state", event.nativeEvent.state, "percentage open", percentOpen.value)
    }

    return (

        <GestureHandlerRootView key={item}>
            <GestureDetector gesture={tap} >
                <TapGestureHandler
                    //  ref={doubleTapRef}
                    onHandlerStateChange={onHandlerStateChange}
                    numberOfTaps={2}
                >
                    <View style={[rowItemStyle]} //entering={SlideInRight}
                        key={item} >
                        <Text style={{ fontWeight: 600 }} ellipsizeMode={"tail"} numberOfLines={1}>{index + " " + item}</Text>

                        {realSourceWord.showChinese && <Text ellipsizeMode={"tail"} numberOfLines={2}>{realSourceWord.meaning}</Text>}
                    </View>
                </TapGestureHandler>
            </GestureDetector>
        </GestureHandlerRootView>
    )



}

function UnderlayLeft({ item, index, selfPanel, sourceWord, setPanelRefrsh }) {

    const { sourceWordArr, setSouceWordArr, audioSound, playSound, isListPlaying, wordPos, frameTransY

    } = useContext(Context)

    const realSourceWord = sourceWordArr.find(item => item.wordName === sourceWord.wordName)

    const { percentOpen } = useSwipeableItemParams();

    let rank = 0;

    function resetRank() {
        rank = 0;
        sourceWordArr.forEach((word) => {
            if (realSourceWord.toppingTime < word.toppingTime) {
                rank++
            }
        })
    }
    resetRank()

    useDerivedValue(() => {
        if (percentOpen.value === 1) {
            runOnJS(resetRank)()
        }
    }, [percentOpen.value])




    const animStyle = useAnimatedStyle(
        () => ({
            //  opacity: percentOpen.value,
            height: 80,
            width: 160,//screenWidth - 80,
            backgroundColor: "darkgray",
            //  transform: [{ translateY: 80 * index }],
            zIndex: 0,
            justifyContent: "space-evenly",
            alignItems: "center",
            flexDirection: "row"
        }),
        [percentOpen]
    );
    return (
        <View
            style={[animStyle]} // Fade in on open
        >
            {/* <Icon name="enter-outline" type='ionicon' color='red'

                onPress={function () {
                    selfPanel.current.close()
                }}
                containerStyle={{ backgroundColor: "orange", width: 60, height: 60, transform: [{ rotateZ: "180deg" }] }}
                // containerStyle={{ position: "absolute", right: 0, transform: [{ translateY: 0 }] }}
                size={60}
            /> */}
            {/* <Icon name="megaphone-outline" type='ionicon' color='red'
                onPress={function () {
                    // if (isListPlaying.value) { return }

                    // wordPos.value = index

                    // frameTransY.value = withTiming(-screenHeight + headHeight)


                    // const arr = []
                    // arr.push(function () {
                    //     return new Promise((resolve, reject) => {


                    //         console.log(">>>>>>>>>Single play start")
                    //         resolve()
                    //     })
                    // })
                    // sourceWord.exampleEnglishArr.forEach((sentence, index) => {
                    //     arr.push(function (shouldTerminate) {

                    //         if (shouldTerminate) {
                    //             return Promise.resolve(true)
                    //         }

                    //         return playSound(sentence)
                    //     })
                    //     arr.push(function (shouldTerminate) {
                    //         if (shouldTerminate) {
                    //             return Promise.resolve(true)
                    //         }

                    //         return playSound(sourceWord.exampleChineseArr[index])
                    //     })

                    // })
                    // arr.push(function () {
                    //     return new Promise((resolve, reject) => {


                    //         console.log(">>>>>>>>>Single play end")
                    //         resolve()
                    //     })
                    // })
                    // // const arr = sourceWord.exampleChineseArr.map((sentence, index) => {
                    // //     return function () {
                    // //         return playSound(sentence)
                    // //     }
                    // // })
                    // console.log(arr)

                    // startPromiseSequential(arr)


                }}
                containerStyle={{ backgroundColor: "orange", width: 60, height: 60 }}
                // containerStyle={{ position: "absolute", right: 0, transform: [{ translateY: 0 }] }}
                size={60}
            /> */}

            <Icon name={realSourceWord.showChinese ? "eye-off-outline" : "eye-outline"} type='ionicon' color='red'

                onPress={function () {

                    realSourceWord.showChinese = !realSourceWord.showChinese
                    setTimeout(() => {
                        setPanelRefrsh(Date.now())
                    }, 0);


                }}
                containerStyle={{ //backgroundColor: "orange",
                    justifyContent: "center", alignItems: "center",
                    width: 60, height: 60, transform: [{ rotateZ: "0deg" }]
                }}
                // containerStyle={{ position: "absolute", right: 0, transform: [{ translateY: 0 }] }}
                size={50}
            />
            <TouchableOpacity onPress={function () {

                realSourceWord.toppingTime = Date.now()
                // setSouceWordArr(arr => {
                //     arr[index].toppingTime = Date.now()
                //     return arr
                //     //return [...arr]
                // })

                setTimeout(() => {
                    setPanelRefrsh(Date.now())
                }, 0);

            }}>
                <View style={{ borderRadius: 999, height: 60, width: 60, justifyContent: "center", alignItems: "center", backgroundColor: "yellow" }}>
                    <Text style={{ fontSize: 15 }}>
                        {rank}
                    </Text>
                </View>
            </TouchableOpacity>






            {/* <TouchableOpacity onPress={function () {
                realSourceWord.showChinese = !realSourceWord.showChinese
                // setSouceWordArr(arr => {

                //     arr[index].showChinese = !arr[index].showChinese
                //     return arr
                //     // return [...arr.map(a => a)]
                //     // return arr.map(item => {
                //     //     if (item.wordName !== sourceWord.wordName) {

                //     //         return item
                //     //     }
                //     //     else {
                //     //         console.log(item.wordName, "---", item.showChinese, sourceWord.showChinese)
                //     //         item.showChinese = !item.showChinese
                //     //         // setPanelRefrsh(Date.now())
                //     //         return item
                //     //     }
                //     // })
                // })

                setTimeout(() => {
                    setPanelRefrsh(Date.now())
                }, 0);

            }}>
                <View style={{ borderRadius: 999, height: 60, width: 60, justifyContent: "center", alignItems: "center", backgroundColor: "yellow" }}>
                    <Text style={{ fontSize: 20 }}>
                        {realSourceWord.showChinese ? "Y" : "N"}
                    </Text>
                </View>
            </TouchableOpacity> */}





        </View>
    );

}

function UnderlayRight({ item, index, selfPanel, sourceWord, setPanelRefrsh }) {

    const { setSouceWordArr, audioSound } = useContext(Context)
    const { percentOpen } = useSwipeableItemParams();

    const navigation = useNavigation()

    const animStyle = useAnimatedStyle(
        () => ({
            //  opacity: percentOpen.value,
            height: 80,
            width: screenWidth,
            backgroundColor: "darkgray",
            //   transform: [{ translateY: 80 * index }],
            zIndex: 0,
            flexDirection: "row-reverse",
            alignItems: "center",
            right: 0,

        }),
        [percentOpen]
    );

    return (
        <View
            style={[animStyle]} // Fade in on open
        >


            <Icon name="settings" type='ionicon' color='red'

                onPress={function () {


                    navigation.navigate("WordSettingScreen", { sourceWord })

                    selfPanel.current.close()


                }}
                containerStyle={{// backgroundColor: "orange",
                    justifyContent: "center", alignItems: "center",
                    width: 80, height: 80, transform: [{ rotateZ: "0deg" }]
                }}
                // containerStyle={{ position: "absolute", right: 0, transform: [{ translateY: 0 }] }}
                size={50}
            />


            {/* <Icon name="enter-outline" type='ionicon' color='red'

                onPress={function () {
                    selfPanel.current.close()
                }}
                containerStyle={{ backgroundColor: "orange", width: 60, height: 60, transform: [{ rotateZ: "0deg" }] }}
                // containerStyle={{ position: "absolute", right: 0, transform: [{ translateY: 0 }] }}
                size={60}
            />


            <TouchableOpacity onPressOut={function () {
                setSouceWordArr(arr => {
                    arr[index].level = arr[index].level + 1
                    return arr
                    //return [...arr]
                })

                setTimeout(() => {
                    setPanelRefrsh(Date.now())
                }, 0);

            }}>
                <View style={{ borderRadius: 999, height: 60, width: 60, justifyContent: "center", alignItems: "center", backgroundColor: "yellow" }}>
                    <Text style={{ fontSize: 20 }}>
                        {sourceWord.level}
                    </Text>
                </View>
            </TouchableOpacity>

            <Icon name="construct-outline" type='ionicon' color='red'

                onPress={function () {


                    navigation.navigate("WordSettingScreen", { sourceWord })

                }}
                containerStyle={{ backgroundColor: "orange", width: 60, height: 60, transform: [{ rotateZ: "0deg" }] }}
                // containerStyle={{ position: "absolute", right: 0, transform: [{ translateY: 0 }] }}
                size={60}
            /> */}


        </View>
    );
};










function Card({ xPos, index, item, sourceWord }) {
    const { sourceWordArr, setSouceWordArr, saveWordToFile, playSound, isListPlaying } = useContext(Context)
    const navigation = useNavigation()
    const [cardRefresh, setCardRefrsh] = useState(Date.now())

    const realSourceWord = sourceWordArr.find(word => word.wordName === sourceWord.wordName)

    useEffect(() => {

        const unsubscribe = navigation.addListener('focus', () => {
            //  !isListPlaying.value && playSound0(sourceWordArr[wordPos.value].wordName)
            setTimeout(() => {
                setCardRefrsh(Date.now())
            }, 0)



            // setTimeout(() => {
            //     console.log("on homepage card")
            //     setCardRefrsh(Date.now())
            //     //   if (scrollRef.current?._scrollViewRef?.scrollTo) {
            //     //   !isListPlaying.value && scrollRef.current._scrollViewRef.scrollTo({ y: wordPos.value * 80 - 80, animated: false })
            //     //   }
            // }, 2000)

        });
        return unsubscribe

    }, [navigation]);


    const { frameTransY, speakingPos } = useContext(Context)


    const cardStyle = useAnimatedStyle(() => {

        return {
            // backgroundColor: "#aaf",
            //backgroundColor: "#c3e1a2",
            backgroundColor: "wheat",
            width: screenWidth,
            height: screenHeight - headHeight,
            borderBottomWidth: 1,
            borderBottomColor: "black",
            // borderRightWidth: 1,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            //elevation: 10,
            //  height: 200,
            // scale: interpolate(frameTransY.value, [, index * screenWidth, (index + 1) * screenWidth], [1, 1, 1], "clamp"),
            //    transform:[{scale:interpolate(frameTransY.value, [0, -screenWidth], [0, 1], "clamp")}],
            //    opacity:interpolate(frameTransY.value, [0, -screenWidth], [0, 0.5], "clamp"),
        }

    })

    const onHandlerStateChange = (event) => {

        if (event.nativeEvent.state === 5) {
            //      setTimeout(() => {
            frameTransY.value = withTiming(0)
            //      }, 0);

        }
    }


    const onRefresh = () => {
        frameTransY.value = withTiming(0)
    };

    useDerivedValue(() => {
        if (frameTransY.value === -screenHeight + headHeight) {
            runOnJS(setCardRefrsh)(Date.now())
        }

    }, [frameTransY.value])


    const cardScrollRef = useAnimatedRef()

    return (
        //  <ScrollView contentContainerStyle={[cardStyle, transStyle]}>

        <TapGestureHandler
            //  ref={doubleTapRef}
            onHandlerStateChange={onHandlerStateChange}
            numberOfTaps={2}
        >
            <View style={[cardStyle]}>
                <ScrollView contentContainerStyle={{ width: screenWidth }}
                    ref={cardScrollRef}
                    horizontal={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={false}
                            onRefresh={onRefresh}
                        />
                    }
                >
                    <TouchableOpacity
                        activeOpacity={0.1}
                        onPress={function () {
                            if (!isListPlaying.value) { playSound(sourceWord.wordName) }
                        }}>

                        <View>
                            <Text style={[{ fontSize: 20, marginLeft: 8 },]}>{index + " " + sourceWord.wordName}</Text>
                            <Text style={[{ fontSize: 18, marginHorizontal: 8, color: "#666" },]}>{sourceWord.meaning}</Text>
                            <Text style={[{ fontSize: 15, color: "#888", marginHorizontal: 8 },]}>{sourceWord.meaningSound}</Text>
                        </View>

                    </TouchableOpacity>





                    {realSourceWord.exampleEnglishArr.map((example, exampleIndex) => {
                        return (
                            <ExampleText
                                key={exampleIndex}
                                realSourceWord={realSourceWord}
                                exampleIndex={exampleIndex} text={example.sentence} wordIndex={index} cardScrollRef={cardScrollRef}
                            />
                            // <TouchableOpacity key={exampleIndex}
                            //     activeOpacity={0.1}
                            //     onLayout={function (e) { console.log("lllllalyout", e.nativeEvent.layout.y) }}
                            //     onPress={function () {
                            //         if (!isListPlaying.value) { playSound(example.sentence) }
                            //     }}>
                            //     {/* <View  > */}
                            //     {/* <Text style={{ fontSize: 20, color: speakingPos.value === exampleIndex ? "red" : "black" }}>{example}</Text> */}

                            //     <ExampleText
                            //         realSourceWord={realSourceWord}
                            //         exampleIndex={exampleIndex} text={example.sentence} wordIndex={index} cardScrollRef={cardScrollRef}
                            //     />
                            //     {/* <Text style={{ fontSize: 18, color: "#888", marginHorizontal: 8 }}>{realSourceWord.exampleChineseArr[exampleIndex].sentence}</Text> */}
                            //     {/* </View> */}
                            // </TouchableOpacity>
                        )
                    })}


                </ScrollView>


                <RateBar sourceWord={sourceWord} />

            </View>

        </TapGestureHandler>
    )

}

function ExampleText({ exampleIndex, text, wordIndex, cardScrollRef, realSourceWord }) {

    const { frameTransY, speakingPos, wordPos, isListPlaying, playSound } = useContext(Context)
    const exampleY = useSharedValue(0)
    const textStyle = useAnimatedStyle(() => {
        return {
            fontSize: 20,
            color: (isListPlaying.value === true && wordIndex === wordPos.value && speakingPos.value === exampleIndex) ? "red" : "black",
            marginHorizontal: 8
        }
    })

    function scrollTo(y) {

        cardScrollRef.current.scrollTo({ y: y, animated: true })
    }

    useDerivedValue(() => {
        //  console.log(wordPos.value, "--- exampleY value -------", exampleY.value, speakingPos.value)
        if (isListPlaying.value === true && wordIndex === wordPos.value && speakingPos.value === exampleIndex) {
            console.log("xxx", speakingPos.value, exampleIndex, exampleY.value)
            //  if (exampleY.value > 600) {
            runOnJS(scrollTo)(exampleY.value)
            //   }
        }
        else if (isListPlaying.value && speakingPos.value == -1) {
            runOnJS(scrollTo)(0)
        }
    }, [isListPlaying.value, speakingPos.value, wordPos.value])


    return (
        <TouchableOpacity
            activeOpacity={0.1}
            onLayout={function (e) { exampleY.value = e.nativeEvent.layout.y; console.log("lllllalyout", e.nativeEvent.layout.y) }}
            onPress={function () {
                if (!isListPlaying.value) { playSound(realSourceWord.exampleEnglishArr[exampleIndex].sentence) }
            }}>
            <View >
                <Text style={textStyle} >{realSourceWord.exampleEnglishArr[exampleIndex].sentence}</Text>

                <Text style={{ fontSize: 18, color: "#888", marginHorizontal: 8 }}>{realSourceWord.exampleChineseArr[exampleIndex].sentence}</Text>
            </View>
        </TouchableOpacity>
    )
}



function RateBar({ sourceWord }) {
    const { setSouceWordArr, saveWordToFile, sourceWordArr } = useContext(Context)
    const realSourceWord = sourceWordArr.find(word => word.wordName === sourceWord.wordName)
    const navigation = useNavigation()
    const [refresh, setRefresh] = useState(Date.now())

    return (
        <View style={{
            backgroundColor: "wheat", width: screenWidth, height: headHeight, flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center"
        }}>
            {[0, 1, 2, 3, 4, 5].map((level, index) => {



                return <TouchableOpacity key={index} activeOpacity={0.2} onPress={function () {

                    realSourceWord.level = level
                    // setSouceWordArr((pre) => {
                    //     const word = pre.find(word => word.wordName === sourceWord.wordName)
                    //     word.level = level
                    //     return pre
                    //     //return [...pre]
                    // })
                    setTimeout(() => {
                        setRefresh(Date.now())

                    }, 0)
                    setTimeout(() => {
                        saveWordToFile()
                    }, 100);

                }}>
                    <View style={{
                        width: 40, height: 40, borderRadius: 999, borderColor: "orange",
                        borderWidth: 1, justifyContent: "center", alignItems: "center",
                        backgroundColor: realSourceWord.level === level ? "orange" : "wheat"
                    }}>

                        <Text style={{
                            fontWeight: 900,

                            color: realSourceWord.level === level ? "wheat" : "orange"
                        }}>{level}</Text>

                    </View>
                </TouchableOpacity>

            })

            }

            <TouchableOpacity activeOpacity={0.2} onPressOut={function () {

                navigation.navigate("WordSettingScreen", { sourceWord })

            }}>
                <Icon name="settings" type='ionicon' color='orange'


                    containerStyle={{
                        width: 40, height: 40,
                        //position:"absolute",
                        zIndex: 300,
                        transform: [
                            { rotateZ: "180deg" },
                            { translateY: 0 }, { translateX: 0 }
                        ]
                    }}

                    size={40}
                />
            </TouchableOpacity>

        </View>
    )
}