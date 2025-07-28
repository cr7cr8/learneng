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
import superagent from "superagent"
import { ListItem, Avatar, LinearProgress, Button, Icon, Overlay, Badge, Switch, Input, Divider } from 'react-native-elements'

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
import * as FileSystem from 'expo-file-system';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
    TapGestureHandler
} from 'react-native-gesture-handler'; //npx expo install react-native-gesture-handler


export default function NewWordScreen() {
    const navigation = useNavigation()
    const { playSound, sourceWordArr, setSouceWordArr, saveWordToFile, isSaving, newWordText, setNewWordText } = useContext(Context)
    const newWordPanelStyle = useAnimatedStyle(() => {

        return {

            backgroundColor: "#c3e1a2",

            height: screenHeight - headBarHeight,
            width: screenWidth,

            zIndex: 100,
            overflow: "hidden",

            top: headBarHeight,

        }

    })

    const inputRef = useRef()

    const [recmenWordsArr, setRecmendWordsArr] = useState([])

    const [allWords, setAllwords] = useState([])

    const getWordsRecomendation = useDebouncedCallback((text) => {

       // superagent.get(`https://dict.youdao.com/suggest?num=20&ver=3.0&doctype=json&cache=false&le=jap&q=${text}`)
        superagent.get(`https://dict.youdao.com/suggest?num=20&ver=3.0&doctype=json&cache=false&le=en&q=${text}`)


            .then(data => {
                const obj = JSON.parse(data.text)
                //console.log(obj.data.entries)  
                obj?.data?.entries?.forEach(element => {
                    console.log(element.entry, element?.explain)
                });

                if (obj?.data?.entries) {
                    setRecmendWordsArr(obj.data.entries)
                }
                else {
                    setRecmendWordsArr([])
                }

            })

    }, 1000)

    useEffect(() => {

        const unsubscribe = navigation.addListener('focus', () => {
            //  !isListPlaying.value && playSound0(sourceWordArr[wordPos.value].wordName)

            FileSystem.readAsStringAsync(FileSystem.documentDirectory + "allwords.txt").then(content => {
                setAllwords(JSON.parse(content))

            })

            getWordsRecomendation(newWordText)

        });
        return unsubscribe

    }, [navigation]);





    return (
        <View style={[newWordPanelStyle]}>
            {/* <View style={{ width: screenWidth, height: headHeight, backgroundColor: "orange", opacity: 1, flexDirection: "column", }}> */}

            <Input
                cursorColor={"black"}
                ref={(ref) => { inputRef.current = ref }}
                // value={textContentEn}
                multiline={false}
                autoFocus={true}
                value={newWordText}
                inputContainerStyle={{

                    //left: -4,
                    //  marginBottom: 0,
                    marginTop: 10,
                    padding: 8,
                    height: 60,
                    width: (screenWidth - 20), borderWidth: 1, borderColor: "black", margin: 0, backgroundColor: "#aaa",
                    alignItems: "center"
                }}

                onChangeText={function (text) {
                    setNewWordText(text)
                    getWordsRecomendation(text)
                    // setTextContentEn(text)
                }}
                onPressIn={function () {
                    Keyboard.dismiss()
                    inputRef.current.focus()
                }}
            />
            <View style={{ width: screenWidth, height: 500, alignItems: "center" }}>
                <ScrollView
                    contentContainerStyle={{ backgroundColor: "#c3e1a2" }}
                >
                    {recmenWordsArr.map((item, index) => {

                        const isExist = Boolean(allWords.find((element) => element.wordName === item.entry))

                        return (


                            <View style={{
                                width: screenWidth - 20, minHeight: 80, borderBottomWidth: 1, position: "relative",

                                flexDirection: "row"
                            }}
                                key={index}
                            >


                                <TouchableOpacity activeOpacity={0.2}
                                    onPress={function () {
                                        playSound(item.entry)


                                    }}
                                >
                                    <View style={{ width: screenWidth - 20, backgroundColor: isExist ? "#c3e1a2" : "#eee", minHeight: 80 }}>
                                        <Text style={{ fontSize: 15, fontWeight: 800 }}>{item.entry}</Text>
                                        <Text style={{ flex: 1, flexWrap: "wrap", fontSize: 15 }}>{item?.explain}</Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity activeOpacity={0.2}

                                    onPress={function (e) {
                                        console.log(item.entry)
                                        playSound(item.entry)
                                        isSaving.value = true

                                        FileSystem.readAsStringAsync(FileSystem.documentDirectory + "allwords.txt").then(content => {
                                            // setSouceWordArr(JSON.parse(content).slice(0,1))
                                            const arr = JSON.parse(content)

                                            const word = sourceWordArr.find(word => word.wordName === item.entry)
                                            const wordInText = arr.find(word => word.wordName === item.entry)

                                            if (Boolean(word)) {
                                                setSouceWordArr((pre) => {

                                                    return [word, ...pre.filter(word => { return word.wordName !== item.entry })]
                                                })
                                                setTimeout(() => {
                                                    isSaving.value = false
                                                }, 0);
                                            }
                                            else if (Boolean(wordInText)) {

                                                setSouceWordArr((pre) => {
                                                    return [wordInText, ...pre]
                                                })
                                                setTimeout(() => {
                                                    isSaving.value = false
                                                }, 0);
                                            }
                                            else {
                                                const newWord = {
                                                    "wordName": item.entry,
                                                    "meaning": item.explain || "",
                                                    "meaningSound": item.explain || "",
                                                    "createTime": Date.now(),
                                                    "toppingTime": Date.now(),
                                                    "exampleEnglishArr": [],
                                                    "exampleChineseArr": [],
                                                    "level": 0,
                                                    "accent": "UK",
                                                    "showChinese": true,
                                                    "firstTimeAmount": 2,
                                                    "firstTimeMeaningAmount": 1,
                                                    "secondTimeAmount": 2,
                                                    "secondTimeMeaningAmount": 1
                                                }
                                                setSouceWordArr(pre => {
                                                    return [newWord, ...pre]
                                                })
                                                setAllwords(pre=>{
                                                    return [newWord,...pre]
                                                })

                                                setTimeout(() => {
                                                    saveWordToFile()
                                                }, 100);


                                            }
                                        })
                                    }}

                                >
                                    <View style={{
                                        //  backgroundColor: "skyblue",
                                        width: 60, height: 60,

                                        transform: [{ translateX: -60 }],
                                        // height: 80, width: 80, //backgroundColor: "pink",
                                        alignItems: "center", justifyContent: "center",

                                    }}>
                                        <Icon name="add-circle-outline" type='ionicon' color='orange'
                                            // onPress={function () {
                                            //     console.log("----")
                                            // }}

                                            containerStyle={{
                                                width: 60, height: 60, transform: [{ rotateZ: "180deg" }],

                                            }}
                                            // containerStyle={{ position: "absolute", right: 0, transform: [{ translateY: 0 }] }}
                                            size={60}
                                        />
                                    </View>
                                </TouchableOpacity>

                            </View>




                        )


                    })}
                </ScrollView >

            </View >
        </View >
    )

}