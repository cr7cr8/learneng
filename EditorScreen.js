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

import { StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, RefreshControl, Keyboard, Alert, Platform, Pressable, BackHandler } from 'react-native';

const screenWidth = Dimensions.get('screen').width
const screenHeight = Dimensions.get('screen').height
import superagent, { source } from "superagent"
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

//import axios from 'axios';
import { Audio } from 'expo-av';
import startPromiseSequential from 'promise-sequential';

import { getStatusBarHeight } from 'react-native-status-bar-height';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';

const headHeight = getStatusBarHeight() > 24 ? 70 : 60;
const headBarHeight = getStatusBarHeight()
import { useDebounce, useDebouncedCallback, useThrottledCallback } from 'use-debounce';



export default function EditorScreen() {


    const { sourceWordArr, setSourceWordArr, fetchTransParam, saveWordToFile } = useContext(Context)
    
    const navigation = useNavigation()
    const route = useRoute()

    const sourceWord = route.params.sourceWord
    const realSourceWord = sourceWordArr.find(word => word.wordName === sourceWord.wordName)
    const exampleIndex = route.params.exampleIndex



    const editorPanelStyle = useAnimatedStyle(() => {

        return {

            backgroundColor: "#c3e1a2",

            height: screenHeight - headBarHeight,
            width: screenWidth,

            zIndex: 100,
            overflow: "hidden",

            top: headBarHeight,

        }

    })

    const editorToolBarStyle = useAnimatedStyle(() => {

        return {
            width: screenWidth,
            flexDirection: "row",
            justifyContent: "space-around"


        }
    })

    const [textContentEn, setTextContentEn] = useState(
        function () {
            if (exampleIndex >= 0) {
                return realSourceWord.exampleEnglishArr[exampleIndex].sentence || ""
            }
            else {
                return realSourceWord.meaning || ""
            }
        }
    )
    const [textContentCn, setTextContentCn] = useState(

        function () {
            if (exampleIndex >= 0) {
                return realSourceWord.exampleChineseArr[exampleIndex].sentence || ""
            }
            else {
                return realSourceWord.meaningSound || ""
            }
        }


    )

    const inputRefEn = useRef()
    const inputRefCn = useRef()

    const headerViewStyle = useAnimatedStyle(() => {


        return {
            width: screenWidth,
            height: headHeight,
            backgroundColor: "#faf",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "flex-end",


        }
    })

    return (
        // <View style={[editorPanelStyle]}>
        <View >

            <View style={[headerViewStyle]}>


                <Icon name="create" type='ionicon' color='blue'

                    onPress={function () {

                        //console.log(inputRefEn.current.isFocused())
                        if (inputRefEn.current.isFocused()) {
                            Keyboard.dismiss()
                            inputRefCn.current.focus()
                        }
                        else if (!inputRefEn.current.isFocused()) {
                            Keyboard.dismiss()
                            inputRefEn.current.focus()
                        }


                        //inputRefEn.current.focus()
                        //console.log(inputRefEn.current.isFocused())
                        //Keyboard.emit("aa")

                    }}


                    containerStyle={{ backgroundColor: "#cac", width: 40, height: 40, transform: [{ rotateZ: "0deg" }] }}

                    size={40}
                />
                {exampleIndex >= 0 && <Icon name="language" type='ionicon' color='blue'

                    onPress={async function () {



                        const [key, token, tokenExpiryInterval, IG, IID] = await fetchTransParam()

                        superagent.post("https://cn.bing.com/ttranslatev3")
                            .set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0')
                            .set('referer', 'https://cn.bing.com/translator')
                            .query({
                                fromLang: "en",//"ja",// 'auto-detect', //"en"
                                text: textContentEn,// 'they steppted into the deck as if there is no one cares',
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
                                    setTextContentCn(JSON.parse(data.text)[0].translations[0].text)
                                }
                                catch (err) {
                                    console.log(err)


                                }
                            })

                            .catch(err => {
                                console.log(err)
                            })








                    }}


                    containerStyle={{ backgroundColor: "#cac", width: 40, height: 40, transform: [{ rotateZ: "0deg" }] }}

                    size={40}
                />
                }

                <Icon name="save" type='ionicon' color='blue'

                    onPress={function () {


                        sourceWordArr.forEach(word => {
                            if ((word.wordName === realSourceWord.wordName) && (exampleIndex >= 0)) {
                                word.exampleEnglishArr[exampleIndex].sentence = textContentEn
                                word.exampleChineseArr[exampleIndex].sentence = textContentCn
                            }
                            else if ((word.wordName === realSourceWord.wordName) && (exampleIndex < 0)) {
                                {
                                    word.meaning = textContentEn
                                    word.meaningSound = textContentCn
                                    word.key = Math.random() + ""
                                    // word.wordName = word.wordName+"_"
                                }
                            };
                        })

                        saveWordToFile()

                    }}


                    containerStyle={{ backgroundColor: "#cac", width: 40, height: 40, transform: [{ rotateZ: "0deg" }] }}

                    size={40}
                />


            </View>

            <Text style={{ fontSize: 20, marginHorizontal: 8 }}>{sourceWord.wordName}{(exampleIndex == -1 ? "" : " example " + exampleIndex)}</Text>

            {/* <View style={editorToolBarStyle}>


                {exampleIndex >= 0 && <Icon name="language" type='ionicon' color='red'

                    onPress={async function () {



                        const [key, token, tokenExpiryInterval, IG, IID] = await fetchTransParam()

                        superagent.post("https://cn.bing.com/ttranslatev3")
                            .set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0')
                            .set('referer', 'https://cn.bing.com/translator')
                            .query({
                                fromLang: "en",//'auto-detect', //"en"
                                text: textContentEn,// 'they steppted into the deck as if there is no one cares',
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
                                    setTextContentCn(JSON.parse(data.text)[0].translations[0].text)
                                }
                                catch (err) {
                                    console.log(err)


                                }
                            })

                            .catch(err => {
                                console.log(err)
                            })








                    }}


                    containerStyle={{ backgroundColor: "#cac", width: 40, height: 40, transform: [{ rotateZ: "0deg" }] }}

                    size={40}
                />
                }

                <Icon name="create" type='ionicon' color='red'

                    onPress={function () {
                        //inputRefEn.current.focus()
                        //console.log(inputRefEn.current.isFocused())
                        //         Keyboard.emit("aa")

                    }}


                    containerStyle={{ backgroundColor: "#cac", width: 40, height: 40, transform: [{ rotateZ: "0deg" }] }}

                    size={40}
                />


                <Icon name="save" type='ionicon' color='red'

                    onPress={function () {


                        sourceWordArr.forEach(word => {
                            if ((word.wordName === sourceWord.wordName) && (exampleIndex >= 0)) {
                                word.exampleEnglishArr[exampleIndex].sentence = textContentEn
                                word.exampleChineseArr[exampleIndex].sentence = textContentCn
                            }
                            else if ((word.wordName === sourceWord.wordName) && (exampleIndex < 0)) {
                                {
                                    word.meaning = textContentEn
                                    word.meaningSound = textContentCn
                                    word.key = Math.random() + ""
                                    // word.wordName = word.wordName+"_"
                                }
                            };
                        })

                    }}


                    containerStyle={{ backgroundColor: "#cac", width: 40, height: 40, transform: [{ rotateZ: "0deg" }] }}

                    size={40}
                />





            </View> */}




            <View style={{ backgroundColor: "pink", padding: 0, margin: 0, transform: [{ translateX: 0 }] }}>
                <TouchableOpacity onPressIn={function () {
                    Keyboard.dismiss()
                    inputRefEn.current.focus()
                }} activeOpacity={0.8}>
                    <Input
                        cursorColor={"black"}
                        ref={(ref) => { inputRefEn.current = ref }}
                        value={textContentEn}
                        multiline={true}
                        autoFocus={true}
                        inputContainerStyle={{

                            //left: -4,
                            marginBottom: 0, marginTop: 10,

                            height: 130,
                            width: (screenWidth - 20), borderWidth: 1, borderColor: "black", margin: 0, backgroundColor: "#aaa",
                            alignItems: "flex-start"
                        }}

                        onChangeText={function (text) {
                            setTextContentEn(text)
                        }}
                    // onPressIn={function () {

                    //     inputRef.current.focus()
                    // }}
                    />
                </TouchableOpacity>



                <TouchableOpacity onPressIn={function () {

                    Keyboard.dismiss()
                    inputRefCn.current.focus()
                }} activeOpacity={0.8}>
                    <Input
                        cursorColor={"black"}
                        ref={(ref) => { inputRefCn.current = ref }}
                        value={textContentCn}
                        multiline={true}
                        inputContainerStyle={{
                            marginBottom: 0, marginTop: 0,
                            top: -20,
                            height: 110,
                            width: (screenWidth - 20), borderWidth: 1, borderColor: "black", margin: 0, backgroundColor: "#aaa",
                            alignItems: "flex-start"
                        }}

                        onChangeText={function (text) {
                           // setSourceWordArr(pre=>[...pre])
                            setTextContentCn(text)
                        }}
                    // onPressIn={function () {

                    //     inputRef.current.focus()
                    // }}
                    />
                </TouchableOpacity>


            </View>



        </View>
    )

}