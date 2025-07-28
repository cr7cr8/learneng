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

import { StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, RefreshControl, Keyboard, Alert, Platform, Pressable } from 'react-native';

const screenWidth = Dimensions.get('screen').width
const screenHeight = Dimensions.get('screen').height
import superagent from "superagent"
import { ListItem, Avatar, LinearProgress, Button, Icon, Overlay, Badge, Switch, Input, Divider } from 'react-native-elements'
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler'; //npx expo install react-native-gesture-handler
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist';

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
    interpolate,
    useDerivedValue

} from 'react-native-reanimated';
import { FadeIn, FadeOut, BounceIn, BounceOut, SlideOutUp } from 'react-native-reanimated';
const { View, Text, ScrollView, FlatList } = ReAnimated

import { Context } from './ContextProvider';


import { Audio } from 'expo-av';
import startPromiseSequential from 'promise-sequential';

import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';

const headHeight = getStatusBarHeight() > 24 ? 70 : 60;
const headBarHeight = getStatusBarHeight()
import { useDebounce, useDebouncedCallback, useThrottledCallback } from 'use-debounce';


//let audioSound = new Audio.Sound();


export default function WordSettingScreen() {

    const router = useRoute()
    const sourceWord = router.params.sourceWord

    const { sourceWordArr, saveWordToFile } = useContext(Context)
    const navigation = useNavigation()
    const route = useRoute()

    const realSourceWord = sourceWordArr.find(word => word.wordName === sourceWord.wordName)



    const [data, setData] = useState([])
    useEffect(() => {

        const unsubscribe = navigation.addListener('focus', () => {

            setData([...realSourceWord.exampleEnglishArr.map((example, index) => {
                console.log(example.key)
                return {
                    enKey: example.key,
                    cnKey: realSourceWord.exampleChineseArr[index].key,

                    englishSentence: example.sentence,
                    chineseSentence: realSourceWord.exampleChineseArr[index].sentence,

                    enFirstTimeAmount: example.firstTimeAmount,
                    cnFirstTimeAmount: realSourceWord.exampleChineseArr[index].firstTimeAmount,

                    enSecondTimeAmount: example.secondTimeAmount,
                    cnSecondTimeAmount: realSourceWord.exampleChineseArr[index].secondTimeAmount,
                }
            })])



        });
        return unsubscribe

    }, [navigation, route]);



    const meaningSelfPanel = useRef()

    const [refresh, setRefresh] = useState(Date.now())

    return (
        <View>

            <View style={{
                width: screenWidth, height: headHeight, backgroundColor: "wheat", flexDirection: "row", justifyContent: "space-evenly",
                alignItems: "flex-end"
            }}>

                <Text style={{ fontSize: 20, transform: [{ translateY: -4 }] }} >{sourceWord.wordName}</Text>



                <Icon name="add-circle-outline" type='ionicon' color='orange'
                    onPress={function () {

                        const realSourceWord = sourceWordArr.find(word => word.wordName === sourceWord.wordName)
                        const enKey = "en-" + Math.floor(Math.random() * 1000000)
                        const cnKey = "cn-" + Math.floor(Math.random() * 1000000)

                        realSourceWord.exampleEnglishArr.unshift(

                            {
                                key: enKey,
                                sentence: sourceWord.wordName + " added sentence",
                                firstTimeAmount: 2,
                                secondTimeAmount: 2,

                            }
                        )
                        realSourceWord.exampleChineseArr.unshift(
                            {
                                key: cnKey,
                                sentence: "附加的句子" + sourceWord.wordName + "的例子",
                                firstTimeAmount: 1,
                                secondTimeAmount: 1,
                            }
                        )

                        setData((data) => {


                            return [{

                                enKey,
                                cnKey,

                                englishSentence: sourceWord.wordName + " added sentence",
                                chineseSentence: "附加的句子" + sourceWord.wordName + "的例子",

                                enFirstTimeAmount: 2,
                                cnFirstTimeAmount: 1,

                                enSecondTimeAmount: 2,
                                cnSecondTimeAmount: 1,
                            }, ...data]

                        })
                    }}
                    // containerStyle={{  width: 40, height: 40, transform: [{ rotateZ: "180deg" }] }}
                    size={40}
                />

                <Icon name="save" type='ionicon' color='orange'
                    onPress={function () { saveWordToFile() }}
                    //    containerStyle={{  width: 40, height: 40, transform: [{ rotateZ: "0deg" }] }}
                    size={40}
                />

            </View>



            <View style={{
                //  backgroundColor: "lightblue",

                height: 80, width: screenWidth,
                overflow: "hidden"
            }} >



                <SwipeableItem
                    swipeDamping={10} //Hswipe velocity determines snap position ,smaller number means swipe velocity will have a larger effect and row will swipe open more easily
                    activationThreshold={20}
                    overSwipe={20}
                    snapPointsLeft={[screenWidth - 80]}//{[screenWidth - screenWidth/2]}
                    snapPointsRight={[screenWidth - 80]}//{ [screenWidth - screenWidth/2] }

                    ref={(ref) => { meaningSelfPanel.current = ref }}


                    onChange={({ openDirection, snapPoint, ...props }) => {

                    }}

                    renderUnderlayLeft={() => {

                        return <MeaningRightPanel sourceWord={sourceWord} meaningSelfPanel={meaningSelfPanel} />
                        //todo
                        // return <PanelRightItem selfPanel={selfPanel} getIndex={getIndex}
                        //     data={data} setData={setData} sourceWord={sourceWord} />
                    }}

                    renderUnderlayRight={() => {

                        return <MeaningLeftPanel sourceWord={sourceWord} meaningSelfPanel={meaningSelfPanel} />
                        // return <PanelLeftItem selfPanel={selfPanel} getIndex={getIndex}
                        //     data={data} setData={setData} sourceWord={sourceWord}
                        // />
                    }}
                >
                    <MeaningPanel sourceWord={sourceWord} />
                </SwipeableItem>
            </View>



            <View style={{ height: screenHeight - headHeight - 80 - headHeight, backgroundColor: "pink" }}>
                <DraggableFlatList
                    contentContainerStyle={{ transform: [{ translateY: 0 }], backgroundColor: "darkgray", minHeight: screenHeight - headHeight - 80 - headHeight, }}
                    keyExtractor={(item) => item.enKey}
                    data={data}
                    // getItemLayout={(data, index) => {
                    //     // console.log("----------",index)
                    //     return 230
                    // }}
                    renderItem={function ({ ...props }) {

                        return <RowItem {...props}
                            data={data} setData={setData} sourceWord={sourceWord}
                        />
                    }}
                    onDragEnd={({ data }) => {
                        //  console.log(data)

                        sourceWord.exampleEnglishArr = data.map(item => {
                            return {
                                key: item.enKey,
                                sentence: item.englishSentence,
                                firstTimeAmount: item.enFirstTimeAmount,
                                secondTimeAmount: item.enSecondTimeAmount,
                            }
                        })
                        sourceWord.exampleChineseArr = data.map(item => {
                            return {
                                key: item.cnKey,
                                sentence: item.chineseSentence,
                                firstTimeAmount: item.cnFirstTimeAmount,
                                secondTimeAmount: item.cnSecondTimeAmount,
                            }
                        })


                        const realSourceWord = sourceWordArr.find(word => word.wordName === sourceWord.wordName)

                        realSourceWord.exampleEnglishArr = sourceWord.exampleEnglishArr
                       // realSourceWord.exampleChinese = sourceWord.exampleChineseArr
                        realSourceWord.exampleChineseArr = sourceWord.exampleChineseArr


                        setData(data)





                    }}
                    dragItemOverflow={true}
                    onDragBegin={function (...props) {
                        // console.log(props)
                    }}

                    activationDistance={20}
                    autoscrollThreshold={5}
                    autoscrollSpeed={40}
                />
            </View>


            <RateBar sourceWord={sourceWord} />

        </View>

    )

}
function MeaningPanel({ sourceWord }) {
    const navigation = useNavigation()
    const { sourceWordArr, saveWordToFile } = useContext(Context)
    const realSourceWord = sourceWordArr.find(word => word.wordName === sourceWord.wordName)
    return (
        <View style={{ backgroundColor: "wheat", width: screenWidth, height: 80 }}>
            <Text style={{ fontSize: 15 }} ellipsizeMode={"tail"} numberOfLines={2}>{realSourceWord.meaning}</Text>
            <Text style={{ fontSize: 15, color: "gray" }} ellipsizeMode={"tail"} numberOfLines={2}>{realSourceWord.meaningSound}</Text>
            <Icon name="create-outline" type='ionicon' color='orange' size={60}
                containerStyle={{
                    position: "absolute", right: 0,
                    //   backgroundColor: "#cac", 
                    width: 60, height: 60, transform: [{ rotateZ: "0deg" }]
                }}
                onPress={function () {
                    navigation.navigate("EditorScreen", { exampleIndex: -1, sourceWord })

                }}
            />

        </View >
    )
}

function MeaningLeftPanel({ sourceWord, meaningSelfPanel }) {

    const { sourceWordArr, setSouceWordArr, deleteWordToFile } = useContext(Context)
    const [refresh, setRefresh] = useState(Date.now())
    const realSourceWord = sourceWordArr.find(word => word.wordName === sourceWord.wordName)
    const navigation = useNavigation()
    const panelLeftStyle = useAnimatedStyle(() => {

        return {

            borderBottomWidth: 1,
            height: 80,
            zIndex: 100,
            // transform: [{ translateY: index * 80 }],
            //  backgroundColor: "pink",
            overflow: "hidden",
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row",
            backgroundColor: "pink",
            //backgroundColor: "#eee"

        }

    })

    return (
        <View style={[panelLeftStyle]}>
            <Icon name="enter-outline" type='ionicon' color='red'
                onPress={function () { meaningSelfPanel.current.close() }}
                containerStyle={{ backgroundColor: "orange", width: 60, height: 60, transform: [{ rotateZ: "180deg" }] }}
                size={60}
            />



            <TouchableOpacity onPressOut={function () {
                realSourceWord.firstTimeAmount = (realSourceWord.firstTimeAmount + 1) % 4
                setRefresh(Date.now())
            }}>
                <View style={{ borderRadius: 999, height: 60, width: 60, justifyContent: "center", alignItems: "center", backgroundColor: "yellow" }}>
                    <Text style={{ fontSize: 20 }}>{realSourceWord.firstTimeAmount}</Text>
                </View>

            </TouchableOpacity>

            <TouchableOpacity onPressOut={function () {
                realSourceWord.secondTimeAmount = (realSourceWord.secondTimeAmount + 1) % 4
                setRefresh(Date.now())
            }}>
                <View style={{ borderRadius: 999, height: 60, width: 60, justifyContent: "center", alignItems: "center", backgroundColor: "yellow" }}>
                    <Text style={{ fontSize: 20 }}>{realSourceWord.secondTimeAmount}</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onLongPress={function () {

                navigation.goBack()

                setTimeout(() => {
                    setSouceWordArr(pre => {

                        return pre.filter(word => word.wordName !== sourceWord.wordName)


                    })
                    deleteWordToFile(sourceWord)

                }, 500);

                // realSourceWord.exampleEnglishArr = realSourceWord.exampleEnglishArr.filter((item, index) => {
                //     if (index === getIndex()) {
                //         return false
                //     }
                //     else { return true }
                // })

                // realSourceWord.exampleChineseArr = realSourceWord.exampleChineseArr.filter((item, index) => {
                //     if (index === getIndex()) {
                //         return false
                //     }
                //     else { return true }
                // })

                // setData(data => {
                //     return data.filter((item, index) => {
                //         if (index === getIndex()) {
                //             return false
                //         }
                //         else {
                //             return true
                //         }
                //     })

                // })

            }}>
                <Icon name="trash-outline" type='ionicon' color='red'

                    containerStyle={{ backgroundColor: "orange", width: 60, height: 60, transform: [{ rotateZ: "0deg" }] }}
                    size={60}
                />
            </TouchableOpacity>


        </View>
    )
}

function MeaningRightPanel({ sourceWord, meaningSelfPanel }) {
    const { sourceWordArr } = useContext(Context)
    const [refresh, setRefresh] = useState(Date.now())
    const realSourceWord = sourceWordArr.find(word => word.wordName === sourceWord.wordName)


    const panelRightStyle = useAnimatedStyle(() => {

        return {

            borderBottomWidth: 1,
            // width:screenWidth-80,
            height: 80,
            zIndex: 100,
            // transform: [{ translateY: index * 80 }],
            //  backgroundColor: "pink",
            overflow: "hidden",
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row-reverse",
            backgroundColor: "pink",
            //backgroundColor: "#eee"

        }

    })

    return (
        <View style={[panelRightStyle]}>
            <Icon name="enter-outline" type='ionicon' color='red'
                onPress={function () { meaningSelfPanel.current.close() }}
                containerStyle={{ backgroundColor: "orange", width: 60, height: 60, transform: [{ rotateZ: "0deg" }] }}
                size={60}
            />

            <TouchableOpacity onPressOut={function () {
                realSourceWord.secondTimeMeaningAmount = (realSourceWord.secondTimeMeaningAmount + 1) % 4
                setRefresh(Date.now())
            }}>
                <View style={{ borderRadius: 999, height: 60, width: 60, justifyContent: "center", alignItems: "center", backgroundColor: "yellow" }}>
                    <Text style={{ fontSize: 20 }}>{realSourceWord.secondTimeMeaningAmount}</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPressOut={function () {
                realSourceWord.firstTimeMeaningAmount = (realSourceWord.firstTimeMeaningAmount + 1) % 4
                setRefresh(Date.now())
            }}>
                <View style={{ borderRadius: 999, height: 60, width: 60, justifyContent: "center", alignItems: "center", backgroundColor: "yellow" }}>
                    <Text style={{ fontSize: 20 }}>{realSourceWord.firstTimeMeaningAmount}</Text>
                </View>
            </TouchableOpacity>



        </View>
    )
}




function RowItem({ drag, getIndex, isActive, item, inputRefEn, inputRefCn, data, setData, sourceWord }) {




    const {
        englishitem,
        chineseItem,
        enFirstTimeAmount,
        enSecondTimeAmount,
        cnFirstTimeAmount,
        cnSecondTimeAmount
    } = item

    const selfPanel = useRef()

    return (
        <ScaleDecorator activeScale={0.9}>
            <SwipeableItem
                swipeDamping={10} //Hswipe velocity determines snap position ,smaller number means swipe velocity will have a larger effect and row will swipe open more easily
                activationThreshold={20}
                overSwipe={20}
                snapPointsLeft={[screenWidth - 80]}//{[screenWidth - screenWidth/2]}
                snapPointsRight={[screenWidth - 80]}//{ [screenWidth - screenWidth/2] }

                ref={(ref) => { selfPanel.current = ref }}


                onChange={({ openDirection, snapPoint, ...props }) => {

                }}

                renderUnderlayLeft={() => {
                    return <PanelRightItem selfPanel={selfPanel} getIndex={getIndex}
                        data={data} setData={setData} sourceWord={sourceWord} />
                }}

                renderUnderlayRight={() => {
                    return <PanelLeftItem selfPanel={selfPanel} getIndex={getIndex}
                        data={data} setData={setData} sourceWord={sourceWord}
                    />
                }}
            >
                <PanelItem item={item} drag={drag} getIndex={getIndex} sourceWord={sourceWord} />

            </SwipeableItem>

        </ScaleDecorator>

    )


}


function PanelItem({ drag, item, getIndex, sourceWord }) {

    const panelItem = useAnimatedStyle(() => {

        return {

            borderBottomWidth: 1,
            height: 80,
            zIndex: 100,
            // transform: [{ translateY: index * 80 }],
            backgroundColor: "#eee",
            overflow: "hidden",
            elevation: 2,
            //backgroundColor: "#eee"

        }

    })
    const firstTimeTap = useRef(0)

    const navigation = useNavigation()

    return (
        <Pressable onLongPress={drag}
            onPressOut={function (e) {
                //     if ((e.nativeEvent.timestamp - firstTimeTap.current) < 200) {

                console.log(" tap", e.nativeEvent.timestamp - firstTimeTap.current)


            }}
        >
            <View style={[panelItem]} >

                <Text style={{ fontSize: 15 }} ellipsizeMode={"tail"} numberOfLines={2}>{item.englishSentence}</Text>

                <Text style={{ fontSize: 15, color: "gray" }} ellipsizeMode={"tail"} numberOfLines={2}>{item.chineseSentence}</Text>


                <Icon name="create-outline" type='ionicon' color='orange' size={60}
                    containerStyle={{
                        position: "absolute", right: 0,
                        //  backgroundColor: "#cac",
                        width: 60, height: 60, transform: [{ rotateZ: "0deg" }]
                    }}
                    onPress={function () {
                        navigation.navigate("EditorScreen", { exampleIndex: getIndex(), sourceWord })

                    }}
                />

            </View>
        </Pressable>
    )

}

function PanelLeftItem({ selfPanel, getIndex, sourceWord, data, setData }) {

    const navigation = useNavigation()
    const route = useRoute()
    const { sourceWordArr } = useContext(Context)


    const realSourceWord = sourceWordArr.find(word => word.wordName === sourceWord.wordName)

    const panelLeftItemStyle = useAnimatedStyle(() => {

        return {

            borderBottomWidth: 1,
            height: 80,
            zIndex: 100,
            // transform: [{ translateY: index * 80 }],
            //  backgroundColor: "pink",
            overflow: "hidden",
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row"

            //backgroundColor: "#eee"

        }

    })
    const [refresh, setRefresh] = useState(Date.now())
    return (
        <View style={[panelLeftItemStyle]} >
            <Icon name="enter-outline" type='ionicon' color='red'
                onPress={function () { selfPanel.current.close() }}
                containerStyle={{ backgroundColor: "orange", width: 60, height: 60, transform: [{ rotateZ: "180deg" }] }}
                size={60}
            />




            <TouchableOpacity onPressOut={function () {

                realSourceWord.exampleEnglishArr[getIndex()].firstTimeAmount = (realSourceWord.exampleEnglishArr[getIndex()].firstTimeAmount + 1) % 4
                setRefresh(Date.now())
            }}>
                <View style={{ borderRadius: 999, height: 60, width: 60, justifyContent: "center", alignItems: "center", backgroundColor: "yellow" }}>
                    <Text style={{ fontSize: 20 }}>{realSourceWord.exampleEnglishArr[getIndex()].firstTimeAmount}</Text>
                </View>

            </TouchableOpacity>

            <TouchableOpacity onPressOut={function () {

                realSourceWord.exampleEnglishArr[getIndex()].secondTimeAmount = (realSourceWord.exampleEnglishArr[getIndex()].secondTimeAmount + 1) % 4
                setRefresh(Date.now())
            }}>
                <View style={{ borderRadius: 999, height: 60, width: 60, justifyContent: "center", alignItems: "center", backgroundColor: "yellow" }}>
                    <Text style={{ fontSize: 20 }}>{realSourceWord.exampleEnglishArr[getIndex()].secondTimeAmount}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onLongPress={function () {


                realSourceWord.exampleEnglishArr = realSourceWord.exampleEnglishArr.filter((item, index) => {
                    if (index === getIndex()) {
                        return false
                    }
                    else { return true }
                })

                realSourceWord.exampleChineseArr = realSourceWord.exampleChineseArr.filter((item, index) => {
                    if (index === getIndex()) {
                        return false
                    }
                    else { return true }
                })

                setData(data => {
                    return data.filter((item, index) => {
                        if (index === getIndex()) {
                            return false
                        }
                        else {
                            return true
                        }
                    })

                })

            }}>
                <Icon name="trash-outline" type='ionicon' color='red'

                    containerStyle={{ backgroundColor: "orange", width: 60, height: 60, transform: [{ rotateZ: "0deg" }] }}
                    size={60}
                />
            </TouchableOpacity>
        </View>
    )

}


function PanelRightItem({ selfPanel, getIndex, sourceWord, data, setData }) {

    const { sourceWordArr } = useContext(Context)


    const realSourceWord = sourceWordArr.find(word => word.wordName === sourceWord.wordName)

    const panelRightItemStyle = useAnimatedStyle(() => {

        return {

            borderBottomWidth: 1,
            height: 80,
            zIndex: 100,
            // transform: [{ translateY: index * 80 }],
            //  backgroundColor: "pink",
            overflow: "hidden",
            justifyContent: "flex-start",
            alignItems: "center",
            flexDirection: "row-reverse"

            //backgroundColor: "#eee"

        }

    })
    const [refresh, setRefresh] = useState(Date.now())



    return (
        <View style={[panelRightItemStyle]} >
            <Icon name="enter-outline" type='ionicon' color='red'
                onPress={function () { selfPanel.current.close() }}
                containerStyle={{ backgroundColor: "orange", width: 60, height: 60, transform: [{ rotateZ: "0deg" }] }}
                size={60}
            />

            <TouchableOpacity onPressOut={function () {

                realSourceWord.exampleChineseArr[getIndex()].secondTimeAmount = (realSourceWord.exampleChineseArr[getIndex()].secondTimeAmount + 1) % 4
                setRefresh(Date.now())
            }}>
                <View style={{ borderRadius: 999, height: 60, width: 60, justifyContent: "center", alignItems: "center", backgroundColor: "yellow" }}>
                    <Text style={{ fontSize: 20 }}>{realSourceWord.exampleChineseArr[getIndex()].secondTimeAmount}</Text>
                </View>
            </TouchableOpacity>


            <TouchableOpacity onPressOut={function () {

                realSourceWord.exampleChineseArr[getIndex()].firstTimeAmount = (realSourceWord.exampleChineseArr[getIndex()].firstTimeAmount + 1) % 4
                setRefresh(Date.now())
            }}>
                <View style={{ borderRadius: 999, height: 60, width: 60, justifyContent: "center", alignItems: "center", backgroundColor: "yellow" }}>
                    <Text style={{ fontSize: 20 }}>{realSourceWord.exampleChineseArr[getIndex()].firstTimeAmount}</Text>
                </View>

            </TouchableOpacity>







        </View>

    )

}


function RateBar({ sourceWord }) {
    const { sourceWordArr, setSouceWordArr, saveWordToFile } = useContext(Context)
    const navigation = useNavigation()
    const [refresh, setRefresh] = useState(Date.now())
    const realSourceWord = sourceWordArr.find(word => word.wordName === sourceWord.wordName)
    return (
        <View style={{
            backgroundColor: "wheat", width: screenWidth, height: headHeight, flexDirection: "row",
            justifyContent: "space-evenly",
            alignItems: "center"
        }}>
            {[0, 1, 2, 3, 4, 5].map((level, index) => {



                return <TouchableOpacity key={index} activeOpacity={0.2} onPressOut={function () {
                    realSourceWord.level = level
                    // setSouceWordArr((pre) => {
                    //     const word = pre.find(word => word.wordName === sourceWord.wordName)
                    //     word.level = level
                    //     return pre
                    //     return [...pre]
                    // })
                    setTimeout(() => {
                        saveWordToFile()
                        setRefresh(Date.now())
                    }, 0);

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
                navigation.goBack()
                //navigation.navigate("WordSettingScreen", { sourceWord })
                //saveWordToFile()
            }}>
                <Icon name="return-up-back-outline" type='ionicon' color='orange'


                    containerStyle={{
                        width: 40, height: 40,
                        //position:"absolute",
                        zIndex: 300,
                        transform: [
                            { rotateZ: "0deg" },
                            { translateY: 0 }, { translateX: 0 }
                        ]
                    }}

                    size={40}
                />
            </TouchableOpacity>

        </View>
    )
}





function useKeyboardHeight(platforms = ['ios', 'android']) {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    useEffect(() => {
        if (isEventRequired(platforms)) {
            const listen1 = Keyboard.addListener('keyboardDidShow', keyboardDidShow);
            const listen2 = Keyboard.addListener('keyboardDidHide', keyboardDidHide); // cleanup function



            return () => {
                // Keyboard.removeListener('keyboardDidShow', keyboardDidShow);
                // Keyboard.removeListener('keyboardDidHide', keyboardDidHide);

                listen1.remove()
                listen2.remove()

            };
        }
        else {

            return () => { };
        }
    }, []);

    const isEventRequired = platforms => {
        try {
            return (platforms === null || platforms === void 0 ? void 0 : platforms.map(p => p === null || p === void 0 ? void 0 : p.toLowerCase()).indexOf(Platform.OS)) !== -1 || !platforms;
        } catch (ex) { }

        return false;
    };

    const keyboardDidShow = frames => {

        setKeyboardHeight(frames.endCoordinates.height);
    };

    const keyboardDidHide = () => {

        setKeyboardHeight(0);
    };

    return keyboardHeight;
};


