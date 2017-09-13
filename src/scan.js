/**
 * Created by sybil052 on 2017/4/24.
 */
import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Platform,
    Vibration,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions
} from 'react-native';

const {width, height}  = Dimensions.get('window');

import Camera from 'react-native-camera';
import ViewFinder from './viewFinder';

import backIcon from './img/backIcon.png';//返回按钮
import scanLine from './img/scan_line.png';//扫描线

export default class Scan extends Component {
    constructor(props) {
        super(props);
        this.camera = null;
        this.state = {
            transCode:'',//条码
            openFlash: false,
            active: true,
            flag:true,
            fadeInOpacity: new Animated.Value(0), // 初始值
            isEndAnimation:false,//结束动画标记
        }
        this._goBack = this._goBack.bind(this);
        this._startAnimation = this._startAnimation.bind(this);
        this.barcodeReceived = this.barcodeReceived.bind(this);
        this._changeFlash = this._changeFlash.bind(this);
        this.changeState = this.changeState.bind(this);
    }
    componentDidMount() {
        this._startAnimation(false);
    }
    //开始动画，循环播放
    _startAnimation(isEnd) {
        Animated.timing(this.state.fadeInOpacity, {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear
        }).start(
            () => {
                if (isEnd){
                    this.setState({
                        isEndAnimation:true
                    });
                    return;
                }
                if (!this.state.isEndAnimation){
                    this.state.fadeInOpacity.setValue(0);
                    this._startAnimation(false)
                }
            }
        );
        console.log("开始动画");
    }
    barcodeReceived(e) {
        if (e.data !== this.transCode) {
            Vibration.vibrate([0, 500, 200, 500]);
            this.transCode = e.data; // 放在this上，防止触发多次，setstate有延时
            if(this.state.flag){
                this.changeState(false);
                //通过条码编号获取数据
            }
            console.log("transCode="+this.transCode);
        }
    }
    //返回按钮点击事件
    _goBack() {
        this.setState({
            isEndAnimation:true,
        });
        // this.props.navigator.pop();
    }
    //开灯关灯
    _changeFlash() {
        this.setState({
            openFlash: !this.state.openFlash,
        });
    }
    //改变请求状态
    changeState(status){
        this.setState({
            flag:status
        });
        console.log('status='+status);
    }

    render(){
        const {
            openFlash,
            active,
        } = this.state;
        return(
            <View style={styles.allContainer}>
                {(() => {
                    if (active) {
                        return (
                            <Camera
                                ref={cam => this.camera = cam}
                                style={styles.cameraStyle}
                                barcodeScannerEnabled={true}
                                onBarCodeRead={
                                    this.barcodeReceived
                                }
                                torchMode={openFlash ? 'on' : 'off'}>
                                <View style={styles.container}>
                                    <View style={styles.titleContainer}>
                                        <View style={styles.leftContainer}>
                                            <TouchableOpacity activeOpacity={1} onPress={ this._goBack}>
                                                <View>
                                                    <Image style={ styles.backImg } source={ backIcon }/>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.centerContainer}/>
                                <View style={{flexDirection:'row'}}>
                                    <View style={styles.fillView}/>
                                    <View style={styles.scan}>
                                        <ViewFinder/>
                                        <Animated.View style={[styles.scanLine, {
                                            opacity: 1,
                                            transform:[{
                                                translateY:this.state.fadeInOpacity.interpolate({
                                                    inputRange:[0,1],
                                                    outputRange:[0,220]
                                                })
                                            }]
                                        }]}>
                                            <Image source={scanLine}/>
                                        </Animated.View>
                                    </View>
                                    <View style={styles.fillView}/>
                                </View>
                                <View style={styles.bottomContainer}>
                                    <Text
                                        style={[
                                            styles.text,
                                            {
                                                textAlign: 'center',
                                                width: 220,
                                                marginTop: active ? 25 : 245,
                                            },
                                        ]}
                                        numberOfLines={2}
                                    >
                                        将运单上的条码放入框内即可自动扫描。
                                    </Text>
                                    <TouchableOpacity onPress={this._changeFlash}>
                                        <View style={styles.flash}>
                                            <Text style={styles.icon}>&#xe61a;</Text>
                                            <Text style={styles.text}>
                                                开灯/关灯
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </Camera>
                        );
                    }
                })()}
            </View>
        )
    }
}

const styles =StyleSheet.create({
    allContainer:{
        flex:1,
    },
    container: {
        ...Platform.select({
            ios: {
                height: 64,
            },
            android: {
                height: 50
            }
        }),
        backgroundColor:'#000',
        opacity:0.5
    },
    titleContainer: {
        flex: 1,
        ...Platform.select({
            ios: {
                paddingTop: 15,
            },
            android: {
                paddingTop: 0,
            }
        }),
        flexDirection: 'row',
    },
    leftContainer: {
        flex:0,
        justifyContent: 'center',
    },
    backImg: {
        marginLeft: 10,
    },
    cameraStyle: {
        alignSelf: 'center',
        width: width,
        height: height,
    },
    flash: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 60,
    },
    flashIcon: {
        fontSize: 1,
        color: '#fff',
    },
    text: {
        fontSize: 14,
        color: '#fff',
        marginTop: 5
    },
    icon:{
        color: '#fff',
        fontSize: 20,
        fontFamily: 'iconfont'
    },
    scanLine:{
        alignSelf:'center',
    },
    centerContainer:{
        ...Platform.select({
            ios: {
                height: 80,
            },
            android: {
                height: 60,
            }
        }),
        width: width,
        backgroundColor: '#000',
        opacity: 0.5
    },
    bottomContainer:{
        alignItems: 'center',
        backgroundColor: '#000',
        alignSelf: 'center',
        opacity: 0.5,
        flex: 1,
        width:width
    },
    fillView:{
        width: (width-220)/2,
        height: 220,
        backgroundColor: '#000',
        opacity: 0.5
    },
    scan:{
        width: 220,
        height: 220,
        alignSelf: 'center'
    }

});