//contains the panel that shows after the vehicle has been registered
import React from 'react';
import { Modal, StyleSheet, Text, Button, View, TextInput } from 'react-native';
import Voice from 'react-native-voice';

class CarPrompter extends React.Component {

  constructor(props) {
    super()
    Voice.onSpeechResults = this.onSpeechResultsHandler;
    Voice.start('en-US');
    this.state = {
      color: "",
      manufacturer: ""
    }
  }

  onSpeechResultsHandler = (e) => {
    let text = e.value[0];
    let splitted = text.split(" ");
    this.setState({
      color: splitted[0],
      manufacturer: splitted[1] || ""
    })
    if(splitted[1]){
      Voice.stop();
      this.props.onFinish(this.state);
      console.warn("done listening");
    }
  }

  render() {
    return (
      <View>
        <Text>Color: {this.state.color || "say it"}</Text>
        <Text>Manufacturer: {this.state.manufacturer || "say it"}</Text>
      </View>
    )
  }
}

export default class Registered extends React.Component {

  constructor() {
    super();
    this.state ={};
  }

  handleColorReceived = (info) => {
    this.setState(info);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{this.props.vid}</Text>
        <Button title="Delete Registration"
          onPress={this.props.deleteRegistration}
          />
        {this.state.color? <Text>got color</Text>: <CarPrompter onFinish={this.handleColorReceived}></CarPrompter>}
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
  
