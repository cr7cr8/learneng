import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import * as Device from 'expo-device';
import ContextProvider from './ContextProvider';


import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './StackNavigator';

import { StyleSheet, Button, Dimensions, SafeAreaView, Alert, BackHandler } from 'react-native';
const screenWidth = Dimensions.get('screen').width
const screenHeight = Dimensions.get('screen').height
import superagent, { source } from "superagent"

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
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
  runOnJS


} from 'react-native-reanimated';
import { FadeIn, FadeOut, BounceIn, BounceOut, SlideOutUp } from 'react-native-reanimated';
const { View, Text, ScrollView } = ReAnimated

import * as FileSystem from 'expo-file-system';

import { Audio } from 'expo-av';
//import CryptoJS from 'crypto-js/sha256';
import * as MediaLibrary from 'expo-media-library';
import startPromiseSequential from 'promise-sequential';
// function truncate(q) {
//   var len = q.length;
//   if (len <= 20) return q;
//   return q.substring(0, 10) + len + q.substring(len - 10, len);
// }

// var appKey = '32438b073fdf7bd1';
// var key = 'PQs5W5jVG27imVIldZM2hFDkB6TEVE0o';//注意：暴露appSecret，有被盗用造成损失的风险
// var salt = (new Date).getTime();
// var curtime = Math.round(new Date().getTime() / 1000);
// var query = '您好,欢迎再次使用有道智云文本翻译API接口服务';
// // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
// var from = 'zh-CHS';
// var to = 'en';
// var str1 = appKey + truncate(query) + salt + curtime + key;
// var vocabId = '您的用户词表ID';


// var sign = CryptoJS(str1).toString();
// //var sign = CryptoJS.SHA256(str1).toString(CryptoJS.enc.Hex);
export default function App() {


  // superagent.post('https://openapi.youdao.com/api')
  //   .query({
  //     q: query,
  //     appKey: appKey,
  //     salt: salt,
  //     from: from,
  //     to: to,
  //     sign: sign,
  //     signType: "v3",
  //     curtime: curtime,
  //     vocabId: vocabId, 


  //   })
  //   .then(data => {
  //     console.log(JSON.parse(decodeURI(data.text)).translation)
  //   })
  //   .catch(err=>{
  //     console.log(err)
  //   })
  const [audioSound] = useState(new Audio.Sound())

  function playword() {

    startPromiseSequential([

      function () { return promiseSpeak("small") }, function () { return promiseSpeak("peter") },
      function () { return promiseSpeak("small") }, function () { return promiseSpeak("peter") },
      function () { return promiseSpeak("small") }, function () { return promiseSpeak("peter") },
      function () { return promiseSpeak("small") }, function () { return promiseSpeak("peter") },
      function () { return promiseSpeak("small") }, function () { return promiseSpeak("peter") },
      function () { return promiseSpeak("small") }, function () { return promiseSpeak("peter") },
      function () { return promiseSpeak("small") }, function () { return promiseSpeak("peter") },
      function () { return promiseSpeak("small") }, function () { return promiseSpeak("peter") },

    ])
  }



  function promiseSpeak(word) {

    return new Promise((resolve, reject) => {
      FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(data => {
        console.log("===", word)
        if (data.includes(word + ".mp4")) {

          audioSound.unloadAsync()
            .then(() => {

              audioSound.loadAsync(

                //  { uri: `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=this is a hippo` }
                { uri: FileSystem.documentDirectory + word + ".mp4" }
                , { shouldPlay: true }, true)
                .then(() => {


                  audioSound.setOnPlaybackStatusUpdate(function (info) {
                    if (info.didJustFinish) {
                      resolve()
                    }

                    // if ((info.isLoaded) && (!info.isPlaying) && (info.didJustFinish)) {

                    //     timeout && clearTimeout(timeout); timeout = false
                    //     resolve()
                    // }
                  });
                })
            })
        }
        // else {

        //   const downloadResumable = FileSystem.createDownloadResumable(
        //     `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=${word}`,
        //     FileSystem.documentDirectory + word + '.mp4',
        //     {},
        //     () => {
        //       audioSound.unloadAsync()
        //         .then(() => {
        //           console.log("xx")
        //           audioSound.loadAsync(

        //             //  { uri: `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=this is a hippo` }
        //             { uri: FileSystem.documentDirectory + word + ".mp4" }
        //             , { shouldPlay: true }, true)
        //         })

        //     }
        //   );
        //   downloadResumable.downloadAsync().then(() => { resolve() }).catch(() => { reject() })

        // }

      })

    })



  }


  async function speak(word) {

    FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(data => {
      console.log(data)
      if (data.includes(word + ".mp4")) {
        audioSound.unloadAsync()
          .then(() => {
            console.log("xx")
            audioSound.loadAsync(

              //  { uri: `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=this is a hippo` }
              { uri: FileSystem.documentDirectory + word + ".mp4" }
              , { shouldPlay: true }, true)
          }).then(() => {



          })

      }

      else {

        const downloadResumable = FileSystem.createDownloadResumable(
          `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=${word}`,
          FileSystem.documentDirectory + word + '.mp4',
          {},
          () => {
            audioSound.unloadAsync()
              .then(() => {
                console.log("xx")
                audioSound.loadAsync(

                  //  { uri: `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=this is a hippo` }
                  { uri: FileSystem.documentDirectory + word + ".mp4" }
                  , { shouldPlay: true }, true)
              })

          }
        );
        downloadResumable.downloadAsync()

      }



    })






    // FileSystem.readDirectoryAsync(FileSystem.documentDirectory).then(data => {

    //   data.forEach(item => {
    //     console.log(item)
    //   })

    // })

    // MediaLibrary.requestPermissionsAsync().then(info => {
    //   if (info.granted) {
    //     MediaLibrary.createAssetAsync(FileSystem.documentDirectory + "small.mp4").then((asset) => { // this line is creating file in DCIM folder



    //       MediaLibrary.getAlbumAsync('wordsmemoa').then(album => {
    //         console.log(album)
    //         if (album == null) {

    //            MediaLibrary.createAlbumAsync('wordsmemoa', asset, false).then(()=>{

    //            })

    //           //   .then(info => {
    //           //     Alert.alert("done", asset.uri)
    //           //     console.log(info, asset, album)
    //           //   })
    //           //   .catch(e => {
    //           //     Alert.alert(e)
    //           //     console.log(e)
    //           //   });
    //         }
    //            else {
    //             console.log("memo folder alreay there")
    //             MediaLibrary.addAssetsToAlbumAsync([asset], album, false)
    //               // .then(info => {
    //               //   Alert.alert("done", asset.uri)
    //               //   console.log(info, asset, album)
    //               // })
    //               // .catch(e => {
    //               //   Alert.alert(e)
    //               //   console.log("---------------",e)
    //               // });
    //            }

    //       })
    //     })
    //   }
    // })


    // const downloadResumable = FileSystem.createDownloadResumable(
    //   'https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=this is a hippo',
    //   FileSystem.documentDirectory + 'small.mp4',
    //   {},
    //   () => { }
    // );

    // try {
    //   const { uri } = await downloadResumable.downloadAsync();
    //   console.log('Finished downloading to ', uri);
    // } catch (e) {
    //   console.error(e);
    // }




    // audioSound.unloadAsync()
    //   .then(() => {
    //     audioSound.loadAsync(

    //       { uri: `https://audio.wordhippo.com/mp3/translate_tts?ie=UTF-8&tl=en-US&tk=590080.996406&client=t&q=this is a hippo` }

    //       , { shouldPlay: true }, true)
    //   }).then(() => {



    //   })
  }




  return (
    <>
      {/* <StatusBar style="dark" />

      <View style={{ top: 30, zIndex: 900 }}>
        <Button title="Press to hear some words"

          onPress={playword}
        // onPress={speak.bind(null, "peter")} 

        />
      </View> */}



      <ContextProvider><AppStarter /></ContextProvider> 

    </>
  )
}


function AppStarter() {

  // useEffect(() => {

  //   Alert.alert("Expire on 2024 May 4th", "", [{
  //     text: "OK", onPress: () => {

  //       if (Date.now() > 1714795297213) {
  //         BackHandler.exitApp()
  //       }
  //     }
  //   }])

  // }, [])


  return (

    <NavigationContainer><StackNavigator /></NavigationContainer>


  )
}





function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}