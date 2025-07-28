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

import { StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, RefreshControl, Keyboard, Alert, Platform, Pressable, TextInput } from 'react-native';

const screenWidth = Dimensions.get('screen').width
const screenHeight = Dimensions.get('screen').height
import superagent from "superagent"
import { ListItem, Avatar, LinearProgress, Button, Icon, Overlay, Badge, Switch, Divider, Slider, Input } from 'react-native-elements'
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler'; //npx expo install react-native-gesture-handler
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from 'react-native-draggable-flatlist';
import * as MediaLibrary from 'expo-media-library';
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

import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
export default function SortingScreen() {

    const { sourceWordArr, setSouceWordArr, isSaving, refreshWordToFile, wordPos, scrollRef } = useContext(Context)

    const [levelBar, setLevelBar] = useState([true, true, true, true, true, true])




    const [latestOnTop, setLatestOnTop] = useState(true)
    const navigation = useNavigation()




    const [shouldSlice, setShouldSlice] = useState(true)


    const [showingFromIndex, setShowingFromIndex] = useState(0)
    const [fromIndex, setFromIndex] = useState(0)

    const [showingToIndex, setShowingToIndex] = useState(sourceWordArr.length)
    const [toIndex, setToIndex] = useState(sourceWordArr.length)

    useFocusEffect(
        useCallback(() => {


            AsyncStorage.getItem("sortingObj").then(obj_ => {
                const obj = JSON.parse(obj_)


                setLevelBar(obj.levelBar)
                setLatestOnTop(obj.latestOnTop)
                setShouldSlice(obj.shouldSlice)

                setShowingFromIndex(obj.fromIndex)
                setShowingToIndex(obj.toIndex)

                setFromIndex(obj.fromIndex)
                setToIndex(obj.toIndex)

            })

            // FileSystem.readAsStringAsync(FileSystem.documentDirectory + "allwords.txt").then(content => {
            //     // setSouceWordArr(JSON.parse(content).slice(0,1))
            //     const arr = JSON.parse(content)

            //     setToIndex(arr.length)
            //     setShowingToIndex(arr.length)
            // })

            return () => {
                //  console.log("bbb")
            };
        }, [])
    );


    return (

        <View style={{ backgroundColor: "#c3e1a2", flex: 1, width: screenWidth, height: screenHeight }}>
            <LevelBarCompo levelBar={levelBar} setLevelBar={setLevelBar} />





            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8, paddingHorizontal: 32 }}>

                <Text style={{ fontSize: 20 }}>Latest on Top</Text>
                <Switch value={latestOnTop}

                    style={{
                        transform: [{ scale: 1.5 }, { translateY: 1 }],
                        // backgroundColor: "pink",
                    }}
                    color='orange'
                    onChange={function () {
                        setLatestOnTop(pre => !pre)
                    }} />



            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8, paddingHorizontal: 32 }}>

                <Text style={{ fontSize: 20 }}>Should slice</Text>
                <Switch value={shouldSlice}
                    style={{
                        transform: [{ scale: 1.5 }, { translateY: 1 }],
                        //   backgroundColor: "pink",
                    }}
                    color='orange'
                    onChange={function () {
                        setShouldSlice(pre => !pre)
                    }} />



            </View>





            {/* <Text style={{ fontSize: 15 }}>From</Text> */}

            <View style={{ flexDirection: "row", marginVertical: 8 }}>

                <View>
                    <Input
                        disabled={!shouldSlice}
                        inputContainerStyle={{ width: 100, backgroundColor: "lightgray", borderWidth: 1 }}
                        style={{ fontSize: 20, textAlign: "center" }}
                        onPressIn={function (e) {
                            Keyboard.dismiss()
                        }}
                        onChangeText={function (text) {
                            setShowingFromIndex(text)
                            if (Number.isInteger(Number(text))) {
                                setFromIndex(Number(text))
                            }
                        }}
                        value={showingFromIndex + ""}
                        onBlur={function (e) {
                            //  console.log("xxxx")
                            //  e.target.value = fromIndex
                            setShowingFromIndex(fromIndex)
                        }}
                    />
                </View>
                <View>
                    <Input
                        disabled={!shouldSlice}
                        inputContainerStyle={{ width: 100, backgroundColor: "lightgray", borderWidth: 1 }}
                        style={{ fontSize: 20, textAlign: "center" }}
                        onPressIn={function (e) {
                            Keyboard.dismiss()
                        }}
                        onChangeText={function (text) {
                            setShowingToIndex(text)
                            if (Number.isInteger(Number(text))) {
                                setToIndex(Number(text))
                            }
                        }}
                        value={showingToIndex + ""}
                        onBlur={function (e) {
                            //  console.log("yyyyy")
                            //  e.target.value = toIndex
                            setShowingToIndex(toIndex)
                        }}
                    />
                </View>
            </View>

            <Button title="export" onPress={async function () {
                console.log("xx")


                const downloadDir = FileSystem.StorageAccessFramework.getUriForDirectoryInRoot(
                    'DCIM'
                );
                console.log(downloadDir)
                const permission =
                    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
                        downloadDir
                    );
                console.log({ permission });


                const destinationUri =
                await FileSystem.StorageAccessFramework.createFileAsync(
                  permission.directoryUri,
                  Date.now()+"",
                  "text/plain",
                  //'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                );



                 FileSystem.StorageAccessFramework.writeAsStringAsync(
                    destinationUri,
                    JSON.stringify(sourceWordArr)
                  ).then(()=>{
                    console.log("dddd")
                  });


                //console.log(sourceWordArr)

                // FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "export.txt", JSON.stringify(sourceWordArr)).then(async () => {

                //     const downloadDir = FileSystem.StorageAccessFramework.getUriForDirectoryInRoot(
                //         'DCIM'
                //     );
                //     console.log(downloadDir)
                //     const permission =
                //         await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
                //             downloadDir
                //         );
                //     console.log({ permission });


                //     const destinationUri =
                //     await FileSystem.StorageAccessFramework.createFileAsync(
                //       permission.directoryUri,
                //       "pppded",
                //       "text/plain",
                //       //'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                //     );



                //      FileSystem.StorageAccessFramework.writeAsStringAsync(
                //         destinationUri,
                //         "fffff"
                //       ).then(()=>{
                //         console.log("dddd")
                //       });

                //     // FileSystem.readDirectoryAsync("content://com.android.externalstorage.documents/tree/primary:Download").then(aa => {
                //     //     console.log(aa)
                //     // })
                //     // console.log("writing export done", FileSystem.documentDirectory)

                //     //    const downloadDir = FileSystem.StorageAccessFramework.getUriForDirectoryInRoot(
                //     //        'Download/TTT'
                //     //    );

                //     //    console.log({downloadDir})

                //     // FileSystem.StorageAccessFramework.readDirectoryAsync(downloadDir).then(item=>{
                //     //     console.log(item)
                //     // })

                //     // console.log(downloadDir)


                //     // const permission =
                //     // await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync(
                //     //   downloadDir,

                //     // );

                //     // console.log({permission})


                //     //  console.log({ destinationUri });


                //     // const destinationUri =
                //     // await FileSystem.StorageAccessFramework.createFileAsync(
                //     //   permission.directoryUri,
                //     //   filename,
                //     //   mimeType
                //     // );
                //     //  console.log({ destinationUri });


                //     //  MediaLibrary.requestPermissionsAsync()
                //     //     .then(info => {
                //     //         if (info.granted) {
                //     //             //   FileSystem.readAsStringAsync(FileSystem.documentDirectory + "export.txt").then(content => {


                //     //             (async function () {
                //     //                 const asset = await MediaLibrary.createAssetAsync(FileSystem.documentDirectory + "export.txt")
                //     //                 let album = await MediaLibrary.getAlbumAsync('wordsmemo').catch(e => { console.log(e) });

                //     //                 if (album == null) {
                //     //                     MediaLibrary.createAlbumAsync('wordsmemo', asset, false)
                //     //                         .then(info => {
                //     //                             Alert.alert("done", asset.uri)
                //     //                             console.log(info, asset,album)
                //     //                         })
                //     //                         .catch(e => {
                //     //                             Alert.alert(e)
                //     //                             console.log(e)
                //     //                         });
                //     //                 }
                //     //                 else {
                //     //                     MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
                //     //                         .then(info => {
                //     //                             Alert.alert("done", asset.uri)
                //     //                             console.log(info, asset,album)
                //     //                         })
                //     //                         .catch(e => {
                //     //                             Alert.alert(e)
                //     //                             console.log(e)
                //     //                         });
                //     //                 }

                //     //             })()
                //     //             //       })
                //     //         }

                //     //         console.log("====================================================", info)
                //     //     })
                //     //     .catch(e => {
                //     //         Alert.alert(e)
                //     //         console.log(e)
                //     //      })












                // })

            }} />


            <Button title="Load" onPress={function () {

                DocumentPicker.getDocumentAsync({ multiple: false, type: "text/*", copyToCacheDirectory: false }).then(data => {
                    //  console.log(data.assets[0].uri)

                    FileSystem.readAsStringAsync(data.assets[0].uri).then(content => {
                        //    console.log("==========",content)

                        try {
                            const contentObj = JSON.parse(content)
                            setLevelBar([true, true, true, true, true, true])
                            setLatestOnTop(true)
                            setShouldSlice(false)
                            setSouceWordArr(contentObj)
                            FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "allwords.txt", content).then(() => {
                                console.log("allwords.txt has been rewritten")
                            })
                        }
                        catch (err) {
                            Alert.alert("File not match")
                        }




                    })


                })
            }} />

            <Button title="OK"
                containerStyle={{ transform: [{ translateY: 200 }] }}

                onPress={function () {
                    isSaving.value = true

                    FileSystem.readAsStringAsync(FileSystem.documentDirectory + "allwords.txt").then(content => {
                        // setSouceWordArr(JSON.parse(content).slice(0,1))
                        AsyncStorage.setItem("sortingObj", JSON.stringify({
                            levelBar,
                            latestOnTop,
                            shouldSlice,
                            fromIndex,
                            toIndex,
                        }))

                        const arr = JSON.parse(content)

                        setSouceWordArr(() => {
                            const wordsArr = arr.filter(item => {
                                return levelBar[item.level]
                            })

                            wordsArr.sort((word1, word2) => {
                                return latestOnTop ? (word2.toppingTime - word1.toppingTime) : (-word2.toppingTime + word1.toppingTime)
                            })

                            if (shouldSlice) {
                                //isSaving.value = false
                                const ttt = wordsArr.slice(Number(fromIndex), Number(toIndex) + 1)

                                setTimeout(() => {
                                    isSaving.value = false
                                    navigation.goBack()
                                }, 1000);
                                wordPos.value = Math.min(wordPos.value, Math.max(ttt.length - 1, 0))
                                scrollRef.current._scrollViewRef.scrollTo({ y: 0, animated: false })
                                return ttt
                            }
                            else {
                                setTimeout(() => {
                                    isSaving.value = false
                                    navigation.goBack()
                                }, 1000);
                                wordPos.value = Math.min(wordPos.value, Math.max(wordsArr.length - 1, 0))
                                scrollRef.current._scrollViewRef.scrollTo({ y: 0, animated: false })
                                return wordsArr
                            }


                        })

                        // arr.sort((word1, word2) => { return word2.toppingTime - word1.toppingTime })
                        // // setSouceWordArr(arr.map(item => {

                        // //     item.level = Math.floor(Math.random() * 6)
                        // //     return item

                        // // }))
                        // setSouceWordArr(arr)
                    })



                    // setSouceWordArr(arr => {
                    //     const wordsArr = arr.filter(item => {
                    //         return levelBar[item.level]
                    //     })

                    //     return wordsArr
                    // })

                }} />
        </View>

    )
}


function LevelBarCompo({ levelBar, setLevelBar }) {




    return <View style={{
        backgroundColor: "wheat", width: screenWidth, height: headHeight, flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "flex-end"
    }}>


        {levelBar.map((isOn, index) => {

            return <TouchableOpacity key={index} activeOpacity={0.2} onPress={function () {


                setLevelBar((pre) => {

                    pre[index] = !pre[index]

                    return [...pre]
                })

            }}>
                <View style={{
                    width: 40, height: 40, borderRadius: 999, borderColor: "orange",
                    borderWidth: 1, justifyContent: "center", alignItems: "center",
                    backgroundColor: isOn ? "orange" : "wheat"
                }}>

                    <Text style={{
                        fontWeight: 900,

                        color: isOn ? "wheat" : "orange"
                    }}>{index}</Text>

                </View>
            </TouchableOpacity>

        })}
    </View>

}