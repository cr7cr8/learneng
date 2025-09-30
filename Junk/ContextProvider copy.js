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
import Reanimated, { useSharedValue, useAnimatedRef, withTiming, useDerivedValue, runOnJS, useAnimatedStyle, } from 'react-native-reanimated';
const { View, Text, ScrollView, FlatList } = Reanimated

import startPromiseSequential from 'promise-sequential';

import { useDebounce, useDebouncedCallback, useThrottledCallback } from 'use-debounce';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';

import defaultwordsArr from "./defaultwords";

import * as Speech from 'expo-speech';
import { useAudioPlayer } from 'expo-audio';

//console.log(defaultWords)


// MediaLibrary.requestPermissionsAsync()
//     .then(info => {
//         if (info.granted) {
//             FileSystem.readAsStringAsync(FileSystem.documentDirectory + "defaultWords.txt").then(content => {

//               //  const asset = await MediaLibrary.createAssetAsync(FileSystem.documentDirectory + "defaultWords.txt")
//                 (async function () {
//                     // let album = await MediaLibrary.getAlbumAsync('wordsmemo')

//                     // console.log("----",album)
//                     // if (album == null) { await MediaLibrary.createAlbumAsync('wordsmemo', asset, false);   console.log(">>>>",asset) }
//                     const asset = await MediaLibrary.createAssetAsync(FileSystem.documentDirectory + "defaultWords.txt")
//                     let album = await MediaLibrary.getAlbumAsync('wordsmemo').catch(e => { console.log(e) });

//                     if (album == null) { await MediaLibrary.createAlbumAsync('wordsmemo', asset, false).catch(e => { console.log(e) }); }
//                     else {
//                         await MediaLibrary.addAssetsToAlbumAsync([asset], album, false).catch(e => { console.log(e) });
//                     }

//                 })()

//             })
//         }

//         console.log("====================================================", info)
//     })
//     .catch(e => { console.log(e) })


import superagent from "superagent";
//import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reject, resolve } from 'superagent/lib/request-base';


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
        //             FileSystem.deleteAsync(FileSystem.documentDirectory + item,{idempotent:true})
        //         }
        //     })



        // })


    }, [])


    useEffect(() => {
        //    console.log(appState.current)
        const unsubscribe = AppState.addEventListener("change", (nextAppState) => {
            console.log(nextAppState)


            if (nextAppState !== "active") {
                if (isListPlaying.value) {
                    wasItOn.current = true
                    stopPlay()
                    console.log("playing turned off")
                }
                else {
                    wasItOn.current = false
                }
            }
            else {

                if (wasItOn.current) {

                    setTimeout(() => {
                        startPlay()
                    }, 300);

                    wasItOn.current = false
                    console.log("resume playing")
                }
            }
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




        FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(data => {
            if (data.includes("allwords.txt")) {
                console.log("has allword.txt")
                FileSystem.readAsStringAsync(FileSystem.documentDirectory + "allwords.txt").then(content => {
                    // setSouceWordArr(JSON.parse(content).slice(0,1))
                    const arr = JSON.parse(content)

                    arr.sort((word1, word2) => { return word2.toppingTime - word1.toppingTime })
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

    function makePlayList_(wordPos) {
        const startPos = wordPos.value
        const playArr = [

            function () {
                return new Promise(resolve => {
                    isListPlaying.value = true

                    setTimeout(() => {
                        console.log("playList start >>>>>>>", wordPos.value, isListPlaying.value)
                        resolve()
                    }, 0)
                })
            }
        ]

        //  const arr = [...sourceWordArr.slice(wordPos.value), ...sourceWordArr.slice(0, wordPos.value)]
        const arr = [...sourceWordArr.slice(wordPos.value, wordPos.value + 1)]
        arr.forEach((word, index) => {
            playArr.push(
                function (shouldTerminate) {

                    speakingPos.value = -1;
                    if (!isListPlaying.value) { return }
                    else if (shouldTerminate) { return Promise.resolve(true) }
                    else { return playSound0(word.wordName) }
                }
            )

            word.showChinese && playArr.push(
                function (shouldTerminate) {
                    if (!isListPlaying.value) { return }
                    else if (shouldTerminate) { return Promise.resolve(shouldTerminate) }
                    else { return playSound0(word.meaningSound) }

                }
            )



            const sourceWord = sourceWordArr[wordPos.value]
            sourceWord.exampleEnglishArr.forEach((example, exampleIndex) => {
                playArr.push(
                    function (shouldTerminate) {
                        speakingPos.value = exampleIndex;

                        if (!isListPlaying.value) { return }
                        else if (shouldTerminate) { return Promise.resolve(true) }
                        return new Promise((resolve, reject) => {

                            setTimeout(() => {
                                if (isListPlaying.value) {
                                    resolve(playSound0(example.sentence))
                                }
                                else {
                                    resolve()
                                }
                            }, 0);
                        })

                    }

                )

                playArr.push(
                    function (shouldTerminate) {
                        speakingPos.value = exampleIndex;

                        if (!isListPlaying.value) { return }
                        else if (shouldTerminate) { return Promise.resolve(true) }
                        return new Promise((resolve, reject) => {

                            setTimeout(() => {
                                if (isListPlaying.value) {
                                    resolve(playSound0(sourceWord.exampleChineseArr[exampleIndex].sentence))
                                }
                                else {
                                    resolve()
                                }
                            }, 0);
                        })

                    }

                )


            })





            playArr.push(function (shouldTerminate) {
                if (!isListPlaying.value) { return }

                return new Promise((resolve, reject) => {

                    //  setTimeout(() => {
                    if (isListPlaying.value) {


                        function addPos() {
                            wordPos.value = (wordPos.value + 1) % sourceWordArr.length
                            setTimeout(() => {
                                if ((startPos === wordPos.value) && (sourceWordArr.length !== 1)) {
                                    addPos()
                                }
                                else {
                                    scrollRef.current._scrollViewRef.scrollTo({ y: wordPos.value * 80, animated: true })
                                    resolve(shouldTerminate)
                                }
                            }, 0);


                        }

                        addPos()

                    }
                    else {
                        resolve(shouldTerminate)
                    }
                    //    }, 0);
                })
            })





        })







        playArr.push(function (shouldTerminate) {

            speakingPos.value = -1;
            if (shouldTerminate) {
                //  isListPlaying.value = false

                console.log("playList end due to interupte, but carry on playing >>>>>>>>>", sourceWordArr[wordPos].wordName)
            }
            else if (startPos === wordPos.value) {

                //increasePos()
            }
            console.log("playList end >>>>>>>>>", wordPos.value, isListPlaying.value)

        })

        return playArr

    }

    const yPos = useSharedValue(0)


    function makePlayList(wordPos) {
        const startPos = wordPos.value
        const playArr = [

            function () {
                return new Promise(resolve => {
                    isListPlaying.value = true


                    setTimeout(() => {
                        resolve()
                    }, (Math.abs(yPos.value - wordPos.value * 80) <= 400) ? 0 : 1000)

                    scrollRef.current._scrollViewRef.scrollTo({ y: wordPos.value * 80, animated: true })
                })
            },


            function () {
                return new Promise(resolve => {
                    isListPlaying.value = true
                    //    scrollRef.current._scrollViewRef.scrollTo({ y: wordPos.value * 80, animated: true })

                    setTimeout(() => {
                        console.log("playList start >>>>>>>", wordPos.value, isListPlaying.value)
                        speakingPos.value = -1
                        resolve()
                    }, 0)
                })
            }
        ]


        const word = sourceWordArr[wordPos.value]

        for (let i = 0; i < word.firstTimeAmount; i++) {



            playArr.push(
                function (shouldTerminate) {


                    if (!isListPlaying.value) { return }
                    else if (shouldTerminate) { return Promise.resolve(true) }

                    else { return playSound0(word.wordName) }
                }
            )
        }

        for (let i = 0; i < word.firstTimeMeaningAmount; i++) {

            playArr.push(
                function (shouldTerminate) {
                    if (!isListPlaying.value) { return }
                    else if (shouldTerminate) { return Promise.resolve(shouldTerminate) }
                    else { return playSound0(word.meaningSound, false) }
                }
            )

        }


        for (let i = 0; i < word.secondTimeAmount; i++) {
            playArr.push(
                function (shouldTerminate) {


                    if (!isListPlaying.value) { return }
                    else if (shouldTerminate) { return Promise.resolve(true) }
                    else { return playSound0(word.wordName) }
                }
            )
        }


        for (let i = 0; i < word.secondTimeMeaningAmount; i++) {

            playArr.push(
                function (shouldTerminate) {
                    if (!isListPlaying.value) { return }
                    else if (shouldTerminate) { return Promise.resolve(shouldTerminate) }
                    else { return playSound0(word.meaningSound, false) }
                }
            )

        }



        word.exampleEnglishArr.forEach((example, exampleIndex) => {
            //  console.log("----------------------", example)

            const chineseExample = word.exampleChineseArr[exampleIndex]

            for (let i = 0; i < example.firstTimeAmount; i++) {
                playArr.push(
                    function (shouldTerminate) {
                        speakingPos.value = exampleIndex;

                        if (!isListPlaying.value) { return }
                        else if (shouldTerminate) { return Promise.resolve(true) }
                        return new Promise((resolve, reject) => {

                            setTimeout(() => {
                                if (isListPlaying.value) {
                                    resolve(playSound0(example.sentence))
                                }
                                else {
                                    resolve()
                                }
                            }, 0);
                        })

                    }
                )
            }
            for (let i = 0; i < chineseExample.firstTimeAmount; i++) {
                playArr.push(
                    function (shouldTerminate) {


                        if (!isListPlaying.value) { return }
                        else if (shouldTerminate) { return Promise.resolve(true) }
                        return new Promise((resolve, reject) => {

                            setTimeout(() => {
                                if (isListPlaying.value) {
                                    resolve(playSound0(chineseExample.sentence, false))
                                }
                                else {
                                    resolve()
                                }
                            }, 0);
                        })

                    }

                )
            }

            for (let i = 0; i < example.secondTimeAmount; i++) {
                playArr.push(
                    function (shouldTerminate) {


                        if (!isListPlaying.value) { return }
                        else if (shouldTerminate) { return Promise.resolve(true) }
                        return new Promise((resolve, reject) => {

                            setTimeout(() => {
                                if (isListPlaying.value) {
                                    resolve(playSound0(example.sentence))
                                }
                                else {
                                    resolve()
                                }
                            }, 0);
                        })

                    }
                )

            }
            for (let i = 0; i < chineseExample.secondTimeAmount; i++) {
                playArr.push(
                    function (shouldTerminate) {


                        if (!isListPlaying.value) { return }
                        else if (shouldTerminate) { return Promise.resolve(true) }
                        return new Promise((resolve, reject) => {

                            setTimeout(() => {
                                if (isListPlaying.value) {
                                    resolve(playSound0(chineseExample.sentence, false))
                                }
                                else {
                                    resolve()
                                }
                            }, 0);
                        })

                    }

                )
            }
        })





        playArr.push(function (shouldTerminate) {
            if (!isListPlaying.value) { return }

            return new Promise((resolve, reject) => {

                //  setTimeout(() => {
                if (isListPlaying.value) {


                    function addPos() {
                        wordPos.value = (wordPos.value + 1) % sourceWordArr.length
                        setTimeout(() => {
                            //incase previouse increase fail,increase wordPos by one in settimeout if sourcewordarr length is more than one
                            if ((startPos === wordPos.value) && (sourceWordArr.length !== 1)) {
                                addPos()
                            }
                            else {

                                resolve(shouldTerminate)
                                // if (wordPos.value !== 0) {
                                //     console.log(yPos.value, wordPos.value * 80)
                                //     //  scrollRef.current._scrollViewRef.scrollTo({ y: wordPos.value * 80, animated: true })    
                                //     resolve(shouldTerminate)





                                // }
                                // else {
                                //     //      scrollRef.current._scrollViewRef.scrollTo({ y: wordPos.value * 80, animated: false })
                                //     setTimeout(() => {
                                //         resolve(shouldTerminate)
                                //     }, 1000);
                                // }




                            }
                        }, 0);


                    }

                    addPos()

                }
                else {
                    resolve(shouldTerminate)
                }
                //    }, 0);
            })
        })


        playArr.push(
            function (shouldTerminate) {
                speakingPos.value = -1;
                if (!isListPlaying.value) { return }
                else if (shouldTerminate) { return Promise.resolve(true) }

                return new Promise(function (resolve, reject) {


                    console.log("playlist end ----- >>>>>>>>>", wordPos.value - 1, isListPlaying.value)
                    resolve()
                })



            }
        )

        return playArr

    }

    // const startPlay = useDebouncedCallback(
    //     () => {
    //         console.log("startplay")
    //         isListPlaying.value = true
    //         setTimeout(() => {
    //             const list = makePlayList(wordPos)
    //             setTimeout(() => {
    //                 startPromiseSequential(list).then(() => {
    //                     if (isListPlaying.value) {
    //                         startPlay()
    //                     }
    //                 })
    //             }, 0);
    //         }, 0);


    //     },
    //     500,
    //     { leading: true, trailing: false }

    // )


    const startPlay = () => {
        console.log("startplay")
        isListPlaying.value = true


        setTimeout(() => {
            const list = makePlayList(wordPos)
            startPromiseSequential(list).then(() => {
                if (isListPlaying.value) {
                    //isListPlaying.value = false

                    startPlay()

                }
            })
        }, 0);

    }


    const stopPlay = useDebouncedCallback(
        () => {

            console.log("stopplay")

            isListPlaying.value = false

        },
        500,
        { leading: true, trailing: false }
    )
 
    const frameTransY = useSharedValue(160)
    const shouldFrameDisplay = useSharedValue(true)
   
 
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
    const isPanning = useSharedValue(false)


    const audioPlayer = useAudioPlayer(``)
    // const audioPlayer = useAudioPlayer(`https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=this is a hippo`)

    audioPlayer.addListener("playbackStatusUpdate", (status) => {

        // console.log(status)
    })

    const speak = useDebouncedCallback((word) => {


        const hashName = CryptoJS(word).toString();
        // console.log("---->", word + " " + hashName.substring(0, 16))


        // FileSystem.getInfoAsync(FileSystem.documentDirectory).then(item => {
        //     console.log(item)
        // })

        FileSystem.getInfoAsync(FileSystem.documentDirectory + `/${word}.mp3`).then(item => {
            const { exists, isDirectory, size, uri } = item
            console.log(word + ".mp3", exists ? "is downloaded" : "does not exist")
            if (exists) {

                Speech.stop()
                audioPlayer.pause()
                audioPlayer.replace(FileSystem.documentDirectory + `/${word}.mp3`)

                audioPlayer.play()
            }
            else {
                audioPlayer.pause()
                Speech.stop()
                Speech.speak(word, {
                    onDone: () => {

                        //Speech.speak(sourceWord.meaningSound)
                    }
                });
            }

        })

        //file:///data/user/0/host.exp.exponent/files/vilify.mp3

        // FileSystem.downloadAsync(
        //     `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=${word}`,
        //	https://fanyi.baidu.com/gettts?lan=uk&text=go as fast as you can&spd=3

        //     FileSystem.documentDirectory + word + '.mp3'
        // )
        //     .then(({ uri }) => {
        //         console.log('Finished downloading to ', uri);
        //     })
        //     .catch(error => {
        //         console.error(error);
        //     });


        // Speech.stop()
        // Speech.speak(word, {
        //     onDone: () => {

        //         //Speech.speak(sourceWord.meaningSound)
        //     }
        // });


        //  audioPlayer.replace(`https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=${word}`)
        //      audioPlayer.replace(`https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-UK&tk=590080.996406&client=t&q=${word}`)
        //  audioPlayer.pause()
        //      audioPlayer.play()

    }, 200, { leading: true, trailing: false })

    const downloadWord = useDebouncedCallback(
        function (word, setProgressWidth, setDownloadStatusTrue, setDownloadStatusFalse) {
            Vibration.vibrate(50)
            setProgressWidth && setProgressWidth()
            FileSystem.downloadAsync(
                `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=${word}`,
                // https://fanyi.baidu.com/gettts?lan=uk&text=go as fast as you can&spd=3

                FileSystem.documentDirectory + word + '.mp3'
            )
                .then(({ uri }) => {
                    console.log('Finished downloading to ', uri);
                    setDownloadStatusTrue && setDownloadStatusTrue()
                })
                .catch(error => {
                    console.error(error);
                    setDownloadStatusFalse && setDownloadStatusFalse()
                });
        },
        1000,
        { leading: true, trailing: false, }

    )


    return (

        <Context.Provider value={{
            playSound0,
            playSound,
            audioSound,
            sourceWordArr, setSouceWordArr,

            saveWordToFile,
            deleteWordToFile,

            fetchTransParam,

            wordPos, isListPlaying,
            makePlayList,
            startPlay, stopPlay,
            isListPlaying,

            scrollRef,
            scrollRef2,
            setWordPos,
            // thumbX, thumbY,
            // preThumbX, preThumbY,
            frameTransY,
            shouldFrameDisplay,
            speakingPos,
            yPos,

            newWordText, setNewWordText,
            isSaving,
            refreshWordToFile,

            preLeft,
            preTop,
            scrollY,
            isPanning,

            audioPlayer,
            speak,
            downloadWord
        }}>



            {props.children}
            <View style={processingCoverStyle} >
                <Text style={{ fontSize: 30 }}>Saving...</Text>
            </View>

        </Context.Provider>



    )

}

