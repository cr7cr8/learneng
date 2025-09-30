import React, { useState, useRef, useEffect, useContext, useCallback, createContext, useMemo } from 'react';
import { Audio } from 'expo-av';
export const Context = createContext()
import { activateKeepAwakeAsync, deactivateKeepAwake, useKeepAwake } from 'expo-keep-awake';

import { StyleSheet, Button, Dimensions, AppState, Vibration } from 'react-native';
const screenWidth = Dimensions.get('screen').width
const screenHeight = Dimensions.get('screen').height
//import wordUsObj from "./wordUsObj"
import { getStatusBarHeight } from 'react-native-status-bar-height';
const headHeight = getStatusBarHeight() > 24 ? 80 : 60

import * as MediaLibrary from 'expo-media-library';
import CryptoJS from 'crypto-js/sha256';
import promiseSequential from 'promise-sequential';
import Reanimated, { useSharedValue, useAnimatedRef, withTiming, useDerivedValue, runOnJS, useAnimatedStyle, runOnUI, } from 'react-native-reanimated';
const { View, Text, ScrollView, FlatList } = Reanimated

import startPromiseSequential from 'promise-sequential';

import { useDebounce, useDebouncedCallback, useThrottledCallback } from 'use-debounce';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

import defaultwordsArr from "./defaultwords";

import * as Speech from 'expo-speech';
import { useAudioPlayer } from 'expo-audio';




import superagent from "superagent";
//import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reject, resolve } from 'superagent/lib/request-base';


import {
    configureReanimatedLogger,
    ReanimatedLogLevel,
} from 'react-native-reanimated';
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false//true, // Reanimated runs in strict mode by default
});


export default function ContextProvider(props) {

    const [sourceWordArr, setSouceWordArr] = useState([])
    const isListPlaying = useSharedValue(false)
    const [audioSound0] = useState(new Audio.Sound())
    const [audioSound] = useState(new Audio.Sound())
    const wasItOn = useRef(false)
    const [newWordText, setNewWordText] = useState("")

    function fetchTransParam() {
        return new Promise((resolve, reject) => {

            AsyncStorage.getItem("transParam").then(data => {

                if (data) {
                    const [key, token, tokenExpiryInterval, IG, IID] = JSON.parse(data)
                    if ((key + tokenExpiryInterval) <= (Date.now() + 3 * 60 * 1000)) {

                        superagent.get(`https://bing.com/translator`)
                            .then(data => {
                                const [key, token, tokenExpiryInterval] = JSON.parse(
                                    data.text.match(/params_AbusePreventionHelper\s?=\s?([^\]]+\])/)[1]
                                )
                                let IG = data.text.match(/IG:"([^"]+)"/)[1]
                                let IID = data.text.match(/data-iid="([^"]+)"/)[1]
                                AsyncStorage.setItem("transParam", JSON.stringify([key, token, tokenExpiryInterval, IG, IID]))
                                resolve([key, token, tokenExpiryInterval, IG, IID])
                            })
                    }
                    else {

                        resolve(JSON.parse(data))
                    }

                }
                else {
                    superagent.get(`https://bing.com/translator`)
                        .then(data => {
                            const [key, token, tokenExpiryInterval] = JSON.parse(
                                data.text.match(/params_AbusePreventionHelper\s?=\s?([^\]]+\])/)[1]
                            )
                            let IG = data.text.match(/IG:"([^"]+)"/)[1]
                            let IID = data.text.match(/data-iid="([^"]+)"/)[1]
                            AsyncStorage.setItem("transParam", JSON.stringify([key, token, tokenExpiryInterval, IG, IID]))
                            resolve([key, token, tokenExpiryInterval, IG, IID])
                        })
                }
            });

        })
    }

    function setSortingObj() {

        AsyncStorage.getItem("sortingObj").then(data => {

            if (!data) {
                AsyncStorage.setItem("sortingObj", JSON.stringify({
                    levelBar: [true, true, true, true, true, true],
                    latestOnTop: true,
                    shouldSlice: false,
                    fromIndex: 0,
                    toIndex: 10000,
                }))
            }
        })
        // AsyncStorage.removeItem("sortingObj")

    }


    useEffect(() => {
        setSortingObj()
        //fetchTransParam().then(data => console.log(data))
        refreshWordToFile()

        // FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(data => {

        //     data.forEach(item => {
        //         if (String(item).endsWith(".mp3")) {
        //             console.log("-----------", item)
        //             FileSystem.deleteAsync(FileSystem.documentDirectory + item, { idempotent: true })
        //         }
        //         else if (String(item).endsWith(".txt")) {
        //             console.log("-----------", item)
        //             FileSystem.deleteAsync(FileSystem.documentDirectory + item, { idempotent: true })
        //         }
        //     })



        // })


    }, [])


    useEffect(() => {
        //    console.log(appState.current)
        const unsubscribe = AppState.addEventListener("change", (nextAppState) => {
            console.log("----------", nextAppState)


            // if (nextAppState !== "active") {
            //     if (isListPlaying.value) {
            //         wasItOn.current = true
            //         stopPlay()
            //         console.log("playing turned off")
            //     }
            //     else {
            //         wasItOn.current = false
            //     }
            // }
            // else {

            //     if (wasItOn.current) {

            //         setTimeout(() => {
            //             startPlay()
            //         }, 300);

            //         wasItOn.current = false
            //         console.log("resume playing")
            //     }
            // }
        })


        return function () {
            unsubscribe.remove()
        }


    }, [sourceWordArr, wasItOn.current, isListPlaying.value])


    const isSaving = useSharedValue(false)
    const saveWordToFile = useDebouncedCallback(
        () => {


            console.log("writing allowrds.txt")
            isSaving.value = true
            FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(data => {
                if (data.includes("allwords.txt")) {


                    FileSystem.readAsStringAsync(FileSystem.documentDirectory + "allwords.txt")
                        .then(content => {
                            const arr = [...sourceWordArr]
                            const arr2 = []
                            const originalWordArr = JSON.parse(content)
                            originalWordArr.forEach(word => {
                                if ((arr.findIndex(item => word.wordName === item.wordName)) < 0) {
                                    arr2.push(word)
                                }
                            })
                            FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "allwords.txt", JSON.stringify(
                                [...arr, ...arr2]
                            )).then(info => {
                                console.log("allwords.txt has been rewritten")
                                isSaving.value = false

                            })
                        })
                        .catch(err => {
                            console.log(err)
                            isSaving.value = false

                        })


                }
                else {
                    const originalWordArr = defaultwordsArr
                    const arr = originalWordArr.map(oriWord => {
                        return sourceWordArr.find(word => { return word.wordName === oriWord.wordName }) || oriWord
                    })
                    FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "allwords.txt", JSON.stringify(arr)).then(info => {
                        console.log("allwords.txt has been rewritten")
                        isSaving.value = false

                    })

                }
            })


        },

        Math.min(sourceWordArr.length * 10, 1000),
        { leading: true, trailing: false }
    )

    const refreshWordToFile = useDebouncedCallback(
        () => {
            return new Promise((resolve, reject) => {
                console.log("refreshWordToFile")
                isSaving.value = true
                FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(data => {
                    if (data.includes("allwords.txt")) {


                        FileSystem.readAsStringAsync(FileSystem.documentDirectory + "allwords.txt")
                            .then(content => {
                                const arr = [...sourceWordArr]
                                const arr2 = []
                                const originalWordArr = JSON.parse(content)
                                originalWordArr.forEach(word => {
                                    if ((arr.findIndex(item => word.wordName === item.wordName)) < 0) {
                                        arr2.push(word)
                                    }
                                })
                                FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "allwords.txt", JSON.stringify(
                                    [...arr, ...arr2]
                                )).then(info => {
                                    console.log("allwords.txt has been rewritten")

                                    resolve()
                                })
                            })
                            .catch(err => {
                                console.log(err)

                                reject()
                            })


                    }
                    else {
                        const originalWordArr = defaultwordsArr
                        const arr = originalWordArr.map(oriWord => {
                            return sourceWordArr.find(word => { return word.wordName === oriWord.wordName }) || oriWord
                        })
                        FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "allwords.txt", JSON.stringify(arr)).then(info => {
                            console.log("allwords.txt has been rewritten")
                            isSaving.value = false
                            resolve()
                        })

                    }
                })
            }).then(() => {
                AsyncStorage.getItem("sortingObj").then((obj_) => {
                    const { levelBar, latestOnTop, shouldSlice, fromIndex, toIndex } = JSON.parse(obj_)
                    FileSystem.readAsStringAsync(FileSystem.documentDirectory + "allwords.txt").then(content => {

                        const arr = JSON.parse(content)

                        setSouceWordArr(() => {
                            const wordsArr = arr.filter(item => {
                                return levelBar[item.level]
                            })

                            wordsArr.sort((word1, word2) => {
                                return latestOnTop ? (word2.toppingTime - word1.toppingTime) : (-word2.toppingTime + word1.toppingTime)
                            })

                            if (shouldSlice) {
                                isSaving.value = false
                                return wordsArr.slice(Number(fromIndex), Number(toIndex) + 1)
                            }
                            else {
                                isSaving.value = false
                                return wordsArr
                            }
                        })
                    })

                })

            })

        },

        Math.min(sourceWordArr.length * 10, 1000),
        { leading: true, trailing: false }
    )


    const deleteWordToFile = useDebouncedCallback(
        (word) => {


            isSaving.value = true
            FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(data => {
                if (data.includes("allwords.txt")) {


                    FileSystem.readAsStringAsync(FileSystem.documentDirectory + "allwords.txt")
                        .then(content => {

                            const originalWordArr = JSON.parse(content).filter(element => element.wordName !== word.wordName)

                            FileSystem.writeAsStringAsync(FileSystem.documentDirectory + "allwords.txt", JSON.stringify(
                                originalWordArr
                            )).then(info => {
                                console.log("allwords.txt has been rewritten")
                                isSaving.value = false
                            })
                        })
                        .catch(err => {
                            console.log(err)
                            isSaving.value = false
                        })


                }
                else {

                    isSaving.value = false

                }
            })


        },
        Math.min(sourceWordArr.length * 10, 1000),
        { leading: true, trailing: false }
    )



    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {


        console.log("checking existence of allwords.txt")

        FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(data => {
            if (data.includes("allwords.txt")) {
                console.log("found allword.txt")
                FileSystem.readAsStringAsync(FileSystem.documentDirectory + "allwords.txt").then(content => {
                    // setSouceWordArr(JSON.parse(content).slice(0,1))
                    let arr = JSON.parse(content)

                    //arr.sort((word1, word2) => { return word2.toppingTime - word1.toppingTime })
                    Array(arr).sort()//.reverse()
                    arr.reverse()
                    // setSouceWordArr(arr.map(item => {

                    //     item.level = Math.floor(Math.random() * 6)
                    //     return item

                    // }))
                    setSouceWordArr(arr)
                })



            }
            else {
                console.log("NO allword.txt FOUND, NOT FOUND allword.txt")


                const now = Date.now()

                const arr = defaultwordsArr.map((word, index) => {
                    const random = Math.floor(Math.random() * 10000000)
                    return {
                        ...word,
                        createTime: now - random,
                        toppingTime: now - random + 5000,
                    }
                })


                arr.sort((word1, word2) => {

                    return Number(word2.toppingTime) - Number(word1.toppingTime)


                })


                setSouceWordArr(arr)
                saveWordToFile()
            }

            // setTimeout(() => {
            //     FileSystem.deleteAsync(FileSystem.documentDirectory + "allwords.txt", { idempotent: true }).then(()=>{
            //         console.log("allwords.txt deleted")
            //     })
            // }, 1000);



            //data.forEach(filename_ => {
            // FileSystem.getInfoAsync(FileSystem.documentDirectory + filename_, { md5: false, size: true }).then(fileArr => {
            //      console.log(info.uri)
            // })
            //   FileSystem.deleteAsync(FileSystem.cacheDirectory + filename_, {idempotent: true })
            //})
        })
    }, [])



    function setWordPos(value) {
        setTimeout(() => {
            wordPos.value = value
            //  console.log("wordPos",wordPos.value, value)
        }, 0);

    }



    const wordPos = useSharedValue(0)


    function keepAwake() {
        activateKeepAwakeAsync("myapp")
        //    console.log("KeepAwake activated")

    }
    function enableSleep() {
        deactivateKeepAwake("myapp")
        //    console.log("keepAwake deActivated")
    }

    useDerivedValue(() => {
        if (isListPlaying.value) {
            runOnJS(keepAwake)()
        }
        else {
            runOnJS(enableSleep)()
        }
    }, [isListPlaying.value])



    const scrollRef = useAnimatedRef()
    const scrollRef2 = useAnimatedRef()

    function playSound(sentence) {
        if (!sentence) { return Promise.resolve() }
        let regExp = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g;
        let isEnglish = !regExp.test(sentence)



        return new Promise((resolve, reject) => {
            let timeout = setTimeout(
                () => {
                    console.log("----------------------------------not played correctly", wordPos.value, sentence, Date.now())
                    resolve(true)
                },
                isEnglish ? Math.max(sentence.length * 300, 3000) : sentence.length * 1500 // should finsh the reading in wordlength * 300 milli senconds
            );

            audioSound.getStatusAsync()
                .then(info => {

                    if (!info.isLoaded) {

                        audioSound.setOnPlaybackStatusUpdate(function (info) {


                            if ((info.isLoaded) && (!info.isPlaying) && (info.didJustFinish)) {

                                timeout && clearTimeout(timeout); timeout = false
                                resolve()
                            }
                        });

                        audioSound.loadAsync(

                            // isEnglish  //https://dict.youdao.com/dictvoice?audio=%E4%B9%97%E3%82%8A%E7%89%A9%E9%85%94%E3%81%84.&le=jap&type=2
                            //     ? { uri: `https://dict.youdao.com/dictvoice?audio=${sentence}&le=jap&type=2` }
                            //     : { uri: `https://dict.youdao.com/dictvoice?audio=${sentence}&le=zh&type=1` }
                            // { uri: `https://dict.youdao.com/dictvoice?audio=${sentence}&le=eng&type=2` }

                            { uri: `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=${sentence}` }


                            , { shouldPlay: true }, true)
                            .catch(err => {
                                console.log(err)
                                resolve(true)

                            });
                    }
                    else {


                        audioSound.unloadAsync()
                            .then(info => {
                                audioSound.setOnPlaybackStatusUpdate(function (info) {

                                    if ((info.isLoaded) && (!info.isPlaying) && (info.didJustFinish)) {

                                        timeout && clearTimeout(timeout); timeout = false
                                        resolve()
                                    }




                                });

                                audioSound.loadAsync(
                                    // isEnglish  //https://dict.youdao.com/dictvoice?audio=%E4%B9%97%E3%82%8A%E7%89%A9%E9%85%94%E3%81%84.&le=jap&type=2
                                    //     ? { uri: `https://dict.youdao.com/dictvoice?audio=${sentence}&le=jap&type=2` }
                                    //     : { uri: `https://dict.youdao.com/dictvoice?audio=${sentence}&le=zh&type=1` }
                                    // { uri: `https://dict.youdao.com/dictvoice?audio=${sentence}&le=eng&type=2` }

                                    { uri: `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=${sentence}` }
                                    , { shouldPlay: true }, true)
                                    // .then(sound => {

                                    //     return audioSound0.playAsync()
                                    // })
                                    // .then(info => {

                                    //     console.log(info)

                                    // })
                                    .catch(err => {
                                        console.log(err)
                                        resolve(true)

                                    });

                            })
                            .catch(err => {
                                console.log("error in unloading async", err)
                                resolve(true)

                            })
                    }


                })
                .catch(err => {
                    console.log("error in get status async", err)
                    resolve(true)

                })


        })




    }

    function playSound0(sentence, inEnglish = true) {
        if (!sentence) { return Promise.resolve() }
        let regExp = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/g;
        let isEnglish = !regExp.test(sentence)
        isEnglish = inEnglish





        return new Promise((resolve, reject) => {
            let timeout = setTimeout(
                () => {
                    console.log("----------------------------------not played correctly", wordPos.value, sentence, Date.now())
                    resolve(true)
                },
                isEnglish ? Math.max(sentence.length * 300, 3000) : sentence.length * 1000 // should finsh the reading in wordlength * 300 milli senconds
            );





            audioSound0.getStatusAsync()
                .then(info => {

                    if (!info.isLoaded) {

                        audioSound0.setOnPlaybackStatusUpdate(function (info) {


                            if ((info.isLoaded) && (!info.isPlaying) && (info.didJustFinish)) {

                                timeout && clearTimeout(timeout); timeout = false
                                resolve()
                            }
                            else if ((info.isLoaded) && (info.isPlaying) && (!info.didJustFinish)) {

                                if (!isListPlaying.value) {
                                    audioSound0.stopAsync()
                                    resolve(true)
                                }

                            }
                            else {
                                if (!isListPlaying.value) {
                                    audioSound0.stopAsync()
                                    resolve(true)
                                }
                            }


                        });



                        audioSound0.loadAsync(


                            isEnglish  //https://dict.youdao.com/dictvoice?audio=%E4%B9%97%E3%82%8A%E7%89%A9%E9%85%94%E3%81%84.&le=jap&type=2
                                // ? { uri: `https://dict.youdao.com/dictvoice?audio=${sentence}&le=eng&type=2` }

                                ? { uri: `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-UK&tk=590080.996406&client=t&q=${sentence}` }

                                //: { uri: `https://dict.youdao.com/dictvoice?audio=${sentence}&le=zh&type=1` }
                                : { uri: `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=zh-CN&tk=590080.996406&client=t&q=${sentence}` }


                            , { shouldPlay: true }, true)
                            .catch(err => {
                                console.log(err)
                                resolve(true)

                            });




                    }
                    else {


                        audioSound0.unloadAsync()
                            .then(info => {
                                audioSound0.setOnPlaybackStatusUpdate(function (info) {

                                    if ((info.isLoaded) && (!info.isPlaying) && (info.didJustFinish)) {

                                        timeout && clearTimeout(timeout); timeout = false
                                        resolve()
                                    }
                                    else if ((info.isLoaded) && (info.isPlaying) && (!info.didJustFinish)) {

                                        if (!isListPlaying.value) {
                                            audioSound0.stopAsync()
                                            resolve(true)
                                        }

                                    }
                                    else {
                                        if (!isListPlaying.value) {
                                            audioSound0.stopAsync()
                                            resolve(true)
                                        }
                                    }


                                });

                                audioSound0.loadAsync(
                                    isEnglish  //https://dict.youdao.com/dictvoice?audio=%E4%B9%97%E3%82%8A%E7%89%A9%E9%85%94%E3%81%84.&le=jap&type=2
                                        // ? { uri: `https://dict.youdao.com/dictvoice?audio=${sentence}&le=eng&type=2` }

                                        ? { uri: `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-UK&tk=590080.996406&client=t&q=${sentence}` }

                                        // : { uri: `https://dict.youdao.com/dictvoice?audio=${sentence}&le=zh&type=1` }

                                        : { uri: `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=zh-CN&tk=590080.996406&client=t&q=${sentence}` }
                                    , { shouldPlay: true }, true)
                                    // .then(sound => {

                                    //     return audioSound0.playAsync()
                                    // })
                                    // .then(info => {

                                    //     console.log(info)

                                    // })
                                    .catch(err => {
                                        console.log(err)
                                        resolve(true)

                                    });

                            })
                            .catch(err => {
                                console.log("error in unloading async", err)
                                resolve(true)

                            })
                    }


                })
                .catch(err => {
                    console.log("error in get status async", err)
                    resolve(true)

                })


        })




    }

    const speakingPos = useSharedValue(-1)



    const yPos = useSharedValue(0)




    const stopPlay = useDebouncedCallback(
        () => {

            console.log("stopplay")

            isListPlaying.value = false

        },
        500,
        { leading: true, trailing: false }
    )

    const frameTransY = useSharedValue(0)



    const processingCoverStyle = useAnimatedStyle(() => {

        return {
            width: screenWidth,
            height: screenHeight,
            backgroundColor: "#aaa",
            opacity: 0.8,
            position: "absolute",
            top: 0,
            left: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            display: isSaving.value ? "flex" : "none"
        }
    })


    // if (sourceWordArr.length === 0) {
    //     return <Reanimated.Text style={{ fontSize: 30 }}>ArraySize 0</Reanimated.Text>
    // }
    const preLeft = useSharedValue(screenWidth)
    const preTop = useSharedValue(headHeight)
    const scrollY = useSharedValue(0)
    const scrollX = useSharedValue(0)
    const isPanning = useSharedValue(false)


    const audioPlayer = useAudioPlayer(``)
    // const audioPlayer = useAudioPlayer(`https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=this is a hippo`)


    const stopSpeak = () => {
        audioPlayer.pause()
        Speech.stop()
    }



    const speak = useDebouncedCallback((word1, word2) => {

        const hashName1 = CryptoJS(word1).toString();
        const hashName2 = CryptoJS(word2).toString();
        const hashName = hashName1 + hashName2

        return FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName}.mp3`)
            .then(item => {

                const { exists, isDirectory, size, uri } = item
                let resolveMethod;
                let rejectMethod;
                const p = new Promise((resolve, reject) => { resolveMethod = resolve; rejectMethod = reject })

                if (exists) {


                    const reading = setTimeout(() => {

                        listener.remove()
                        console.log(word2 + " audio reading ERROR ================")
                        resolveMethod(word2 + " audio reading ERROR")

                    }, 3000);

                    const listener = audioPlayer.addListener("playbackStatusUpdate", (status) => {
                        // console.log(Object.keys(status))



                        if (status.playing) {
                            reading && clearTimeout(reading)
                        }
                        else if (status.didJustFinish) {
                            listener.remove()
                            reading && clearTimeout(reading)
                            //   console.log("playing " + word + " done")
                            resolveMethod("playing " + word2 + " done")
                        }
                    })



                    Speech.stop()
                    audioPlayer.pause()
                    audioPlayer.replace(FileSystem.documentDirectory + `/${hashName}.mp3`)
                    audioPlayer.play()
                }
                else {
                    audioPlayer.pause()
                    Speech.stop()
                    Speech.speak(word2, {
                        onDone: () => {
                            resolveMethod(word2 + " Speech reading done")
                            //Speech.speak(sourceWord.meaningSound)
                        },
                        onError: () => {
                            rejectMethod(word2 + "speech reading ERROR")
                        }
                    });
                }

                return Promise.resolve(p)
            })
            .catch((error) => {
                return Promise.resolve("getFile " + word2 + ".mp3 error")
            })




        //file:///data/user/0/host.exp.exponent/files/vilify.mp3


    }, 200, { leading: true, trailing: false })


    const isScrollingY = useSharedValue(false)


    const isScrollingX = useSharedValue(false)
    function setIsScrollingX(bool) {
        isScrollingX.value = bool
    }

    const isCardMoving = useSharedValue(false)

    useDerivedValue(() => {
        // console.log("=================", isScrollingY.value, isCardMoving.value, isScrollingX.value)




    }, [isScrollingX.value, isScrollingY.value, isCardMoving.value, isListPlaying.value])


    function isAllScrollingStop() {
        "worklet"
        // console.log(!isScrollingY.value, !isCardMoving.value, !isScrollingX.value)
        return (!isScrollingY.value) && (!isCardMoving.value) && (!isScrollingX.value)
    }


    function isSomethingScrollingInUI(yesFn, noFn) {
        "worklet"
        console.log("==============+++++++++++=====isScrollingY,X, Card", isScrollingY.value, isScrollingX.value, isCardMoving.value)
        if ((isScrollingY.value) || (isCardMoving.value) || (isScrollingX.value)) {
            runOnJS(yesFn)()
        }
        else {
            runOnJS(noFn)()
        }

    }
    function keepCheckingScrollingUntillStop(fn = () => { }) {
        console.log("in keep calling")
        runOnUI(isSomethingScrollingInUI)(function () { keepCheckingScrollingUntillStop(fn) }, fn)
    }




    const autoPlay = useDebouncedCallback(function () {

        const arr = []
        arr.push(function () {
            if (!isListPlaying.value) { return Promise.resolve() }
            return speak(sourceWordArr[wordPos.value].wordName, sourceWordArr[wordPos.value].wordName)
        })


        // for (let i = 0; i < sourceWordArr[wordPos.value].firstTimeAmount; i++) {
        //     arr.push(function () {
        //         if (!isListPlaying.value) { return Promise.resolve() }
        //         return speak(sourceWordArr[wordPos.value].wordName, sourceWordArr[wordPos.value].wordName)
        //     })
        // }
        // for (let i = 0; i < sourceWordArr[wordPos.value].firstTimeMeaningAmount; i++) {
        //     arr.push(function () {
        //         if (!isListPlaying.value) { return Promise.resolve() }
        //         return speak(sourceWordArr[wordPos.value].meaningSound, sourceWordArr[wordPos.value].meaningSound)
        //     })
        // }
        // for (let i = 0; i < sourceWordArr[wordPos.value].secondTimeAmount; i++) {
        //     arr.push(function () {
        //         if (!isListPlaying.value) { return Promise.resolve() }
        //         return speak(sourceWordArr[wordPos.value].wordName, sourceWordArr[wordPos.value].wordName)
        //     })
        // }
        // for (let i = 0; i < sourceWordArr[wordPos.value].secondTimeMeaningAmount; i++) {
        //     arr.push(function () {
        //         if (!isListPlaying.value) { return Promise.resolve() }
        //         return speak(sourceWordArr[wordPos.value].meaningSound, sourceWordArr[wordPos.value].meaningSound)
        //     })
        // }

        // for (let i = 0; i < sourceWordArr[wordPos.value].exampleEnglishArr.length; i++) {

        //     for (let j = 0; j < sourceWordArr[wordPos.value].exampleEnglishArr[i].firstTimeAmount; j++) {
        //         arr.push(function () {
        //             if (!isListPlaying.value) { return Promise.resolve() }
        //             return speak(sourceWordArr[wordPos.value].wordName, sourceWordArr[wordPos.value].exampleEnglishArr[i].sentence)
        //         })
        //     }

        //     for (let j = 0; j < sourceWordArr[wordPos.value].exampleChineseArr[i].firstTimeAmount; j++) {
        //         arr.push(function () {
        //             if (!isListPlaying.value) { return Promise.resolve() }
        //             return speak(sourceWordArr[wordPos.value].exampleChineseArr[i].sentence, sourceWordArr[wordPos.value].exampleChineseArr[i].sentence)
        //         })
        //     }

        //     for (let j = 0; j < sourceWordArr[wordPos.value].exampleEnglishArr[i].secondTimeAmount; j++) {
        //         arr.push(function () {
        //             if (!isListPlaying.value) { return Promise.resolve() }
        //             return speak(sourceWordArr[wordPos.value].wordName, sourceWordArr[wordPos.value].exampleEnglishArr[i].sentence)
        //         })
        //     }

        //     for (let j = 0; j < sourceWordArr[wordPos.value].exampleChineseArr[i].secondTimeAmount; j++) {
        //         arr.push(function () {
        //             if (!isListPlaying.value) { return Promise.resolve() }
        //             return speak(sourceWordArr[wordPos.value].exampleChineseArr[i].sentence, sourceWordArr[wordPos.value].exampleChineseArr[i].sentence)
        //         })
        //     }
        // }









        return promiseSequential([

            ...arr,

            function () {
                if (!isListPlaying.value) { return Promise.resolve() }

                //console.log("-->scrollX", (scrollX.value / screenWidth), scrollX.value / screenWidth === wordPos.value)



                // keepCheckingScrollingUntillStop(() => {
                //     if (!isListPlaying.value) { return Promise.resolve() }

                //     return new Promise((resolve, reject) => {
                //         wordPos.value = withTiming((wordPos.value + 1) % sourceWordArr.length, { duration: 0 }, () => {
                //             runOnJS(resolve)()
                //         });
                //     })

                // })




                return new Promise((resolve, reject) => {

                    //    if (scrollX.value / screenWidth === wordPos.value) {
                    wordPos.value = withTiming((wordPos.value + 1) % sourceWordArr.length, { duration: 0 }, () => {
                        runOnJS(resolve)()
                    });
                    //    }
                    //    else {
                    //      const pos = Math.round(scrollX.value / screenWidth) % sourceWordArr.length
                    //        console.log(pos)
                    //        wordPos.value = withTiming(pos, { duration: 0 }, () => {
                    //            runOnJS(resolve)()
                    //        });
                    //    }


                })

            },



            /*
                        function () {
            
            
                            keepCheckingScrollingUntillStop(
                                () => {
                                    if (!isListPlaying.value) { return Promise.resolve() }
                                   // isScrollingY.value = true
                                    scrollRef.current._scrollViewRef.scrollTo({ y: wordPos.value * 80, animated: true })
                                    setTimeout(() => {
                                        keepCheckingScrollingUntillStop(function () {
                                            return Promise.resolve()
                                        })
                                    }, 0);
            
            
                                }
                            )
            
                        },
            
                        function () {
            
            
                            keepCheckingScrollingUntillStop(
                                () => {
                                    if (!isListPlaying.value) { return Promise.resolve() }
                                   // isScrollingX.value = true
                                    scrollRef2.current._scrollViewRef.scrollTo({ x: wordPos.value * screenWidth, animated: true })
                                    setTimeout(() => {
                                        keepCheckingScrollingUntillStop(function () {
                                            return Promise.resolve()
                                        })
                                    }, 0);
                                }
                            )
            
                        },
                        function () {
                            keepCheckingScrollingUntillStop(
                                () => {
                                    if (!isListPlaying.value) { return Promise.resolve() }
                                    else {
                                        setTimeout(() => {
                                            autoPlay()
                                        }, 0);
                                        return Promise.resolve()
                                    }
            
                                }
                            )
            
            
                            // if (!isListPlaying.value) { return Promise.resolve() }
            
            
            
            
                        }
            */










            function () {
                if (!isListPlaying.value) { return Promise.resolve() }

                let resolve;
                let reject;
                const p = new Promise((resolve_, reject_) => {
                    resolve = resolve_; reject = reject_
                })


                setTimeout(check); return p


                function check() {
                    //console.log("in checking", isAllStop())
                    if (!isListPlaying.value) { resolve() }
                    else if (isAllScrollingStop()) {

                        scrollRef.current._scrollViewRef.scrollTo({ y: wordPos.value * 80, animated: true })
                        //scrollRef2.current._scrollViewRef.scrollTo({ x: wordPos.value * screenWidth, animated: true })

                        checkAgain()
                        // setTimeout(() => { checkAgain() }, 10);
                    }
                    else {

                        setTimeout(() => { check() }, 10);
                    }
                }





                function checkAgain() {
                    console.log("===---+++++++++++", Date.now(), scrollY.value, scrollY.value / 80)
                    if (!isListPlaying.value) { return resolve() }
                    else if (isAllScrollingStop()) {
                        console.log(isAllScrollingStop(), isScrollingX.value, isScrollingY.value, isCardMoving.value)
                        setTimeout(() => {
                            scrollRef2.current._scrollViewRef.scrollTo({ x: wordPos.value * screenWidth, animated: true })

                            resolve()

                        }, 300); // time to delay after Y auto scroll fisnish
                    }
                    else {
                        console.log("===---+++++++++++", Date.now())
                        setTimeout(() => {

                            checkAgain()
                        }, 10);
                    }
                }


            },



            function () {

                if (!isListPlaying.value) { return Promise.resolve() }

                let resolve;
                let reject;
                const p = new Promise((resolve_, reject_) => {
                    resolve = resolve_; reject = reject_
                })
                check(); return p

                function check() {
                    if (!isListPlaying.value) { resolve() }
                    if (isAllScrollingStop()) {

                        setTimeout(() => {

                            autoPlay()
                        }, 0);
                        resolve()
                    }
                    else {
                        setTimeout(() => {


                            check()
                        }, 10);
                    }


                }

            }


        ])

    }, 0, { leading: true, trailing: false })


    const downloadWord = useDebouncedCallback(
        //function (word1, word2, setProgressWidth, setDownloadStatusTrue, setDownloadStatusFalse) {
        function (word1, word2) {
            Vibration.vibrate(50)

            const hashName1 = CryptoJS(word1).toString();
            const hashName2 = CryptoJS(word2).toString();
            const hashName = hashName1 + hashName2;


            return FileSystem.downloadAsync(
                `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=${word2}`,
                // https://fanyi.baidu.com/gettts?lan=uk&text=go as fast as you can&spd=3

                FileSystem.documentDirectory + hashName + '.mp3'
            )
                .then(({ uri }) => {
                    console.log('Finished downloading to ', uri);

                    setRefreshState(Math.random())
                    Promise.resolve(word2 + " downloaded")
                })
                .catch(error => {
                    console.error(error);

                    Promise.resolve(word2 + " error on downloading")
                });
        },
        1000,
        { leading: true, trailing: false, }

    )

    function deleteDownloadWord(word1, word2) {
        const hashName1 = CryptoJS(word1).toString();
        const hashName2 = CryptoJS(word2).toString();
        const hashName = hashName1 + hashName2;
        Vibration.vibrate(50)


        return FileSystem.getInfoAsync(FileSystem.documentDirectory + `${hashName}.mp3`)
            .then((item) => {
                const { exists, isDirectory, size, uri } = item
                if (!exists) {
                    console.log(word2 + " is not found, cannot delete")
                    //  setRefreshState(Math.random())
                    Promise.resolve(word2 + " is not found, cannot delete")
                }
                else {
                    return FileSystem.deleteAsync(FileSystem.documentDirectory + hashName + ".mp3", { idempotent: false })
                        .then(() => {
                            console.log(word2 + " deleteted")
                            setRefreshState(Math.random())
                            Promise.resolve(word2 + " deleteted")

                        })
                }


            })


    }



    function vibrate(time = 50) {
        Vibration.vibrate(time)
    }


    const [refreshState, setRefreshState] = useState(Date.now())
    const isManualDrag = useSharedValue(false)
    return (

        <Context.Provider value={{
            vibrate,
            playSound0,
            playSound,
            audioSound,
            sourceWordArr, setSouceWordArr,

            saveWordToFile,
            deleteWordToFile,

            fetchTransParam,

            wordPos, isListPlaying,

            stopPlay,
            isListPlaying,

            scrollRef,
            scrollRef2,
            setWordPos,
            // thumbX, thumbY,
            // preThumbX, preThumbY,
            frameTransY,

            speakingPos,
            yPos,

            newWordText, setNewWordText,
            isSaving,
            refreshWordToFile,

            preLeft,
            preTop,
            scrollY,
            scrollX,
            isPanning,

            audioPlayer,
            speak,
            stopSpeak,
            autoPlay,
            downloadWord,
            deleteDownloadWord,

            isScrollingY,
            isScrollingX, setIsScrollingX,
            isCardMoving,


            refreshState, setRefreshState,
            isManualDrag
        }}>



            {props.children}
            <View style={processingCoverStyle} >
                <Text style={{ fontSize: 30 }}>Saving...</Text>
            </View>

        </Context.Provider>



    )

}

