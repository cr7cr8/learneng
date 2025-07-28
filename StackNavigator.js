import React, { useState, useEffect, useRef, useContext, useTransition } from 'react';
import { StyleSheet, Button, Dimensions, TouchableOpacity, SafeAreaView, RefreshControl } from 'react-native';
const screenWidth = Dimensions.get('screen').width
const screenHeight = Dimensions.get('screen').height
import { getStatusBarHeight } from 'react-native-status-bar-height';
import ReAnimated, {
    useAnimatedStyle, useSharedValue, useDerivedValue,
    withTiming, cancelAnimation, runOnUI, useAnimatedReaction, runOnJS,
    useAnimatedGestureHandler,
    interpolate,
    withDelay,
    withSpring,
    useAnimatedScrollHandler,

    //interpolateColors,

    useAnimatedProps,
    withSequence,
    withDecay,
    useAnimatedRef,
    ZoomIn,
    SlideInRight,
    SlideInDown,
    SlideInUp,
    ZoomInLeft,
    ZoomInEasyUp,
    ZoomOut,
    SlideOutRight,
    SlideOutUp,
    SlideOutDown,


} from 'react-native-reanimated';

import HomeScreen from './HomeScreen';
import WordSettingScreen from './WordSettingScreen';
import EditorScreen from './EditorScreen';
import NewWordScreen from './NewWordScreen';
import SortingScreen from './SortingScreen';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import { ListItem, Avatar, LinearProgress, Tooltip, Icon, Input } from 'react-native-elements';
const { View, Text, ScrollView } = ReAnimated
import { createStackNavigator, CardStyleInterpolators, TransitionPresets, HeaderTitle, Header } from '@react-navigation/stack';
import { Context } from './ContextProvider';
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
const headHeight = getStatusBarHeight() > 24 ? 70 : 60
const Stack = createStackNavigator()
const screenOptions = function ({ navigation, route }) {

    return {
        headerShown: true, //not supported in Android  //route.name!=="Chat",//true,//route.name==="Home",//true,
        gestureEnabled: false,
        gestureDirection: "horizontal",
        headerTitleAlign: 'center',
        ...TransitionPresets.SlideFromRightIOS,
        //title: getFocusedRouteNameFromRoute(route) || "People",
        //header:function (props) {
        //  console.log("=====***==============")
        //  console.log(props)
        //},


        headerStyle: {
            height: getStatusBarHeight() > 24 ? 70 : 60,
            //   height:getStatusBarHeight(),
            elevation: 1,
            backgroundColor: "wheat"
        },




    }
}


export default function StackNavigator() {
    const { wordsArr, wordPos } = useContext(Context)
    const navigator = useNavigation()


    // setTimeout(() => {
    //     navigator.navigate("CardScreen")
    // }, 3000);

    return (

        <>
            <Stack.Navigator

                initialRouteName='HomeScreen'
                screenOptions={screenOptions}
            >
                <Stack.Screen name="HomeScreen"

                    options={function ({ navigation, router }) {
                        return {
                            headerShown: false,
                            header: (props) => {

                                return (
                                    <Header  {...props} />

                                )


                            },
                            // headerTitle:"SSSS",
                            //  headerTitle: (props) => { return <Text style={{ fontSize: 20 }}>{wordsArr.length}</Text> }
                            headerTitle: HomeScreenTitle,
                            //headerTitle:"",
                            headerTransparent: true,

                            // headerRight: () => (
                            //   <Button
                            //     title="delete"
                            //     onPress={function () {

                            //       AsyncStorage.getItem("token").then(token => {
                            //         console.log(token)
                            //         token && deleteFolder(token.userName)
                            //         token && AsyncStorage.removeItem("token")
                            //       })




                            //     }}
                            //   />
                            // ),
                        }
                    }}


                    component={HomeScreen}
                />

                {/* <Stack.Screen name="CardScreen"
                    options={function ({ navigation, router }) {

                        return {
                            headerShown: true,
                            // header: (props) => <Header {...props} />,
                            headerTitle: HomeScreenTitle,
                            //headerTransparent: true,

                            // headerRight: () => (
                            //   <Button
                            //     title="delete"
                            //     onPress={function () {

                            //       AsyncStorage.getItem("token").then(token => {
                            //         console.log(token)
                            //         token && deleteFolder(token.userName)
                            //         token && AsyncStorage.removeItem("token")
                            //       })
                            //     }}
                            //   />
                            // ),
                        }

                    }}
                    //         component={function () { return <></> }}
                    component={CardScreen}
                /> */}
                <Stack.Screen name="WordSettingScreen"
                    options={function ({ navigation, router }) {

                        return {
                            headerShown: false,
                            // header: (props) => <Header {...props} />,
                            // headerTitle: HomeScreenTitle,
                            headerTransparent: true,

                            // headerRight: () => (
                            //   <Button
                            //     title="delete"
                            //     onPress={function () {

                            //       AsyncStorage.getItem("token").then(token => {
                            //         console.log(token)
                            //         token && deleteFolder(token.userName)
                            //         token && AsyncStorage.removeItem("token")
                            //       })
                            //     }}
                            //   />
                            // ),
                        }

                    }}
                    //         component={function () { return <></> }}
                    component={WordSettingScreen}
                />
                <Stack.Screen name="EditorScreen"
                    options={function ({ navigation, router }) {

                        return {
                            headerShown: false,
                            // header: (props) => <Header {...props} />,
                            // headerTitle: HomeScreenTitle,
                            headerTransparent: true,

                            // headerRight: () => (
                            //   <Button
                            //     title="delete"
                            //     onPress={function () {

                            //       AsyncStorage.getItem("token").then(token => {
                            //         console.log(token)
                            //         token && deleteFolder(token.userName)
                            //         token && AsyncStorage.removeItem("token")
                            //       })
                            //     }}
                            //   />
                            // ),
                        }

                    }}
                    //         component={function () { return <></> }}
                    component={EditorScreen}
                />

                <Stack.Screen name="NewWordScreen"
                    options={function ({ navigation, router }) {

                        return {
                            headerShown: false,
                            // header: (props) => <Header {...props} />,
                            // headerTitle: HomeScreenTitle,
                            headerTransparent: true,

                            // headerRight: () => (
                            //   <Button
                            //     title="delete"
                            //     onPress={function () {

                            //       AsyncStorage.getItem("token").then(token => {
                            //         console.log(token)
                            //         token && deleteFolder(token.userName)
                            //         token && AsyncStorage.removeItem("token")
                            //       })
                            //     }}
                            //   />
                            // ),
                        }

                    }}
                    //         component={function () { return <></> }}
                    component={NewWordScreen}
                />

                <Stack.Screen name="SortingScreen"
                    options={function ({ navigation, router }) {

                        return {
                            headerShown: false,
                            // header: (props) => <Header {...props} />,
                            // headerTitle: HomeScreenTitle,
                            headerTransparent: true,

                            // headerRight: () => (
                            //   <Button
                            //     title="delete"
                            //     onPress={function () {

                            //       AsyncStorage.getItem("token").then(token => {
                            //         console.log(token)
                            //         token && deleteFolder(token.userName)
                            //         token && AsyncStorage.removeItem("token")
                            //       })
                            //     }}
                            //   />
                            // ),
                        }

                    }}
                    //         component={function () { return <></> }}
                    component={SortingScreen}
                />

            </Stack.Navigator>




        </>
    )


}


function HomeScreenTitle() {
    const { sourceWordArr, wordPos, isListPlaying, startPlay, stopPlay, frameTransY, saveWordToFile, } = useContext(Context)
    const navigation = useNavigation()
    const route = useRoute()
    // console.log(route.name)

    const viewStyle = useAnimatedStyle(() => {
        return {
            flexDirection: "row"
        }
    })




    return (
        <View style={[viewStyle]}>



            {/* <Button title={route.name === "HomeScreen" ? "CardScreen" : "HomeScreen"} onPress={function () {

                if (frameTransY.value === 0) {
                    frameTransY.value = withTiming(-screenHeight + headHeight)
                }
                else {
                    frameTransY.value = withTiming(0)
                }
                //  navigation.navigate(route.name==="HomeScreen"?"CardScreen":"HomeScreen", { initialPos: wordPos.value })
            }} /> */}


            <TouchableOpacity onPressOut={function () {
                saveWordToFile()
                //  console.log(sourceWordArr.length)
            }}>
                <Icon name="save" type='ionicon' color='skyblue'


                    containerStyle={{ width: 40, height: 40, transform: [{ rotateZ: "180deg" }] }}
                    // containerStyle={{ position: "absolute", right: 0, transform: [{ translateY: 0 }] }}
                    size={40}
                />
            </TouchableOpacity>
            {/* <Button onPress={decreaseTenPage} title="    <<   " />
            <Button onPress={decreaseOnePage} title="    <    " />
            <Text style={{ fontSize: 20 }}>{pageNum + ""}</Text>
            <Button onPress={increaseOnePage} title="    >    " />
            <Button onPress={increaseTenPage} title="    >>   " /> */}
        </View>
    )

}