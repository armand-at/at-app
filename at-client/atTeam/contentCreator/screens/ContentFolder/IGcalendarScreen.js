import React from 'react';
import {
  Text,
  StyleSheet,
  View,
  Button,
  FlatList,
  Image,
  TouchableOpacity
} from 'react-native';
import io from 'socket.io-client/dist/socket.io';
import { Video, SecureStore } from 'expo';
import { getUrl } from '../../../../utils';


export default class IGcalendarScreen extends React.Component {
  static navigationOptions = {
  };

  constructor(){
    console.log("testCode");
    super()
    this.state = {
      posts: [],
    }

    this.socket = io.connect(getUrl('/content'), {reconnect: true});
  };

  async componentDidMount(){
    this.socket.emit('getCalendar', {
      clientUsername: await SecureStore.getItemAsync('clientSelectedUsername')
    });

    this.socket.on('gottenCalendar', async(data) => {
      this.setState({ posts: data });
    });

    this.socket.on('calendarItem', async (data) => {
      console.log('postts..', this.state.posts.length);
      console.log('got calendar item', data.index, data.contentType);
      const posts = this.state.posts;
      posts[data.index].base64 = data.base64;
      posts[data.index].contentType = data.contentType;
      this.setState({ posts: posts });
    });
  }

  _done = async () => {
    await this.socket.emit('done', {
      clientUsername: await SecureStore.getItemAsync('clientSelectedUsername'),
      entity: await SecureStore.getItemAsync('entityToken'),
      msg: 'Create Content Calendar'
    });

    this.props.navigation.navigate('Home');
  }

  render() {
    console.log('rendering..');
    console.log(this.state.posts.map(post => {
      if(post.base64)
        return post.base64.substring(0, 30);
    }));
    return (
      <FlatList
        data={this.state.posts}
        extraData={this.state}
        numColumns={3}
        renderItem={
          ({item}) => {
            console.log('item', item);
            const uri = `data:${item.contentType};base64,${item.base64}`;
            console.log('uri', uri.substring(0, 50));
            return (
              <TouchableOpacity onPress={() => this._selectPost(item.key)}>
                <Image source={{ uri: uri  }} style={{ width: 138, height: 138 }} />
                <View style={{ width: "100%", height: 1, backgroundColor: "gray" }} />
              </TouchableOpacity>
            );
          }
        }
        keyExtractor={(item, index) => index.toString()}
      />
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    backgroundColor: '#fff',
  },
});
