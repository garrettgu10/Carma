//contains the panel that shows after the vehicle has been registered
import React from 'react';
import { Modal, StyleSheet, Text, Button, View, TextInput, Alert } from 'react-native';
import Voice from 'react-native-voice';
import HOSTNAME from './HOSTNAME';
import {AsyncStorage} from 'react-native';

import Tts from 'react-native-tts';

class Prompter extends React.Component {

  constructor(props) {
    super()
    Voice.onSpeechResults = this.onSpeechResultsHandler;
    Voice.start('en-US');
    this.state = {
      color: "",
      manufacturer: "",
      message: ""
    }

    this.timeoutHandler = -1;
  }

  submitMessage = () => {
    Voice.stop();

    AsyncStorage.getItem('@Carma:vid').then((vid) => {
      let args = {
        content: this.state.message,
        color: this.state.color,
        id: vid
      }

      let queryString = Object.keys(args)
          .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(args[k]))
          .join('&');
      
      fetch(HOSTNAME + '/message?'+queryString).then((response) => {
        console.warn(JSON.stringify(response));
      }).catch((error) => {
        console.error(JSON.stringify(error));
      })
    })
  }

  onSpeechResultsHandler = (e) => {
    let text = e.value[0];
    let splitted = text.split(" ");
    this.setState({
      color: splitted[2],
      manufacturer: splitted[3] || "",
      message: splitted.length > 5 ? splitted.slice(5, splitted.length).join(' '): ""
    });

    if(this.timeoutHandler !== -1){
      clearTimeout(this.timeoutHandler);
    }
    this.timeoutHandler = setTimeout(this.submitMessage, 3000);
  }

  render() {
    return (
      <View style={{marginTop: 20}}>
        <Text>Color: {this.state.color || "waiting"}</Text>
        <Text>Manufacturer: {this.state.manufacturer || "waiting"}</Text>
        <Text>Message: {this.state.message || "waiting"}</Text> 
      </View>
    )
  }
}

export default class Registered extends React.Component {

  constructor() {
    super();
    this.state ={};
    this.numReceived = 0;
    AsyncStorage.getItem('@Carma:vid').then((vid) => {
      this.vid = vid;
      fetch(HOSTNAME+"/get_message?id=" + this.vid).then((response) => {
        return response.json()
      }).then((messages) => {
        this.numReceived = messages.length;
        console.warn(this.numReceived);
        setInterval(this.checkForMessages, 250);
      })
    })
    
  }

  handleColorReceived = (info) => {
    this.setState(info);
  }

  checkForMessages= () => {
    fetch(HOSTNAME+"/get_message?id=" + this.vid).then((response) => {
      return response.json()
    }).then((messages) => {
      if(this.numReceived != messages.length) {
        Alert.alert(messages[messages.length-1]);

        Tts.getInitStatus().then(() => {
          Tts.speak(messages[messages.length-1]);
        }, (err) => {
          console.warn(error);
        })
        
        this.numReceived = messages.length;
      }
    }).catch((err) => {
      console.warn(err);
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={{fontSize: 50}}>We're listening.</Text>
        <Prompter onFinish={this.handleColorReceived}></Prompter>
        <Button title="Delete Registration"
          onPress={this.props.deleteRegistration}
          />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  });
  
