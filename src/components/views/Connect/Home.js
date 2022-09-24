import React, { useEffect, useRef, useState, useCallback} from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Alert, ImageBackground, Button, Platform, FlatList  } from 'react-native'

import moment from 'moment';

import { MaterialCommunityIcons } from 'react-native-vector-icons';

import { Video } from 'expo-av';

import { connect } from 'react-redux'

import firebase from '../../../../firebase';


function Home(props) {

  const [comment, setComment] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    props.Users.posts.sort((x, y) => {
      return x.timestamp - y.timestamp;
    }).reverse();
    console.log(props.Users.posts);
    setPosts(props.Users.posts);

  }, [props.Users.posts]);


  const renderItem = useCallback(({ item }) => {
    return (
    <View style={[styles.postContainer, { backgroundColor : props.UI.backgroundColor}]} key={item.key}>
    <View style={styles.postHeader}>
      <TouchableOpacity onPress={() => props.navigation.navigate('Profile', { uid: item.user.uid,  user: item.user })}>
        <Image source={{ uri: item.user.photoURL }} style={styles.profilePicture} />
      </TouchableOpacity>
      <View style={styles.postHeaderContent}>
        <Text style={[styles.name, { color : props.UI.textColor}]}>{item.user.name}</Text>
        <Text style={styles.timestamp}>
          {moment(item.timestamp.toDate()).fromNow()}
        </Text>
      </View>
    </View>
      {item.type === 'video' ? (
        <View style={{ flex: 1,
          justifyContent : 'center', 
          alignContent : 'center',
          alignItems : 'center',
           }}>
           <Video
            source={{ uri: item.remoteUri }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            isLooping
            useNativeControls
            style={styles.postImage}
          />
        </View>
      ) : (
        <Image
          source={{ uri: item.remoteUri }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      <Text style={[styles.postDescription, { color: props.UI.textColor}]}>{item.caption}</Text>

      <View style={styles.postFooter}>
        <View style={styles.postFooterForLikesAndComments}>
          <TouchableOpacity style={styles.postFooterForLikesAndCommentsButton}
            onPress={() => {
              if(!item.likes.includes(props.User.currentUser.uid)){
                firebase.firestore()
                .collection('posts')
                .doc(item.user.uid)
                .collection('userPosts')
                .doc(item.id)
                .collection('likes')
                .doc(props.User.currentUser.uid)
                .set({})
                .then(() => {
                  firebase.firestore()
                  .collection('posts')
                  .doc(item.user.uid)
                  .collection('userPosts')
                  .doc(item.id)
                  .update({
                    likesCount: item.likesCount + 1
                  })
                  setPosts(posts.map((post) => {
                    if(post.id === item.id){
                      return {
                        ...post,
                        likesCount: post.likesCount + 1,
                        likes: [...post.likes, props.User.currentUser.uid]
                      }
                    }
                    return post;
                  }))

                })
                .catch((err) => {
                  console.log(err);
                })
              }
              else {
                console.log('You already liked this post');
                firebase.firestore()
                .collection('posts')
                .doc(item.user.uid)
                .collection('userPosts')
                .doc(item.id)
                .collection('likes')
                .doc(props.User.currentUser.uid)
                .delete()
                .then(() => {
                  firebase.firestore()
                  .collection('posts')
                  .doc(item.user.uid)
                  .collection('userPosts')
                  .doc(item.id)
                  .update({
                    likesCount: item.likesCount - 1
                  })
                  setPosts(posts.map((post) => {
                    if(post.id === item.id){
                      return {
                        ...post,
                        likesCount: post.likesCount - 1,
                        likes: post.likes.filter((uid) => uid !== props.User.currentUser.uid)
                      }
                    }
                    return post;
                  }))
                })
                .catch((err) => {
                  console.log(err);
                })
              }
            }}
          >
            {item.likes?.includes(props.User.currentUser.uid) ? (
              <MaterialCommunityIcons name="heart" size={24} color={props.UI.colors.darkRed} />
            ) : (
              <MaterialCommunityIcons name="heart-outline" size={24} color={props.UI.textColor} />
            )}
            <Text style={[styles.postFooterForLikesAndCommentsButtonText, { color : props.UI.textColor}]}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postFooterForLikesAndCommentsButton}
           onPress={() => {
            props.navigation.navigate('PostDetails', {post : item, setPosts : setPosts})
           }}
          >
            <MaterialCommunityIcons name="comment-outline" size={24} color={props.UI.textColor} />
            <Text style={[styles.postFooterForLikesAndCommentsButtonText, { color : props.UI.textColor}]}>Comment</Text>
          </TouchableOpacity>
          <View style={styles.postFooterForShare}>
            <TouchableOpacity style={styles.postFooterForShareButton}>
              <MaterialCommunityIcons name="share-outline" size={24} color={props.UI.textColor} />
              <Text style={[styles.postFooterForShareButtonText, { color : props.UI.textColor}]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.postFooterForLikesandCommentsCount}>
          { item.likesCount > 0 ? (
            <Text style={[styles.postFooterForLikesandCommentsCountText, { color : props.UI.textColor}]}>Liked by <Text style={[styles.postFooterForLikesandCommentsCountTextBold, { color : props.UI.textColor}]}>You </Text> and <Text style={[styles.postFooterForLikesandCommentsCountTextBold, { color : props.UI.textColor}]}>{item.likesCount > 0 && (
              item.likesCount
            )} others</Text></Text>
          ) : (
            <Text style={[styles.postFooterForLikesandCommentsCountText, { color : props.UI.textColor}]}></Text>
          )}
        </View>
        {item.comments.length > 0 && (
         <View style={styles.postHeader}>
          <TouchableOpacity onPress={() => props.navigation.navigate('Profile', { uid: item.user.uid,  user: item.user })}>
            <Image source={{ uri: item.comments[0].user.photoURL }} style={styles.postFooterForCommentsImage} />
          </TouchableOpacity>
          <View style={styles.postHeaderContent}>
            <Text style={[styles.name, { color : props.UI.textColor}]}>{item.comments[0].user.name}</Text>
            <Text style={{ fontSize: 14, opacity: 0.7, color: props.UI.textColor }}>
              {item.comments[0].comment}
            </Text>
          </View>
        </View>
        )}

        <View style={styles.postFooterForAddComment}>
          <TextInput
            style={styles.postFooterForAddCommentInput}
            placeholder="Add a comment..."
            placeholderTextColor="#8c8c8c"
            onChangeText={(text) => setComment(text)}
            value={comment}
          />
          <TouchableOpacity
            style={styles.postFooterForAddCommentButton}
            onPress={() => {
              firebase.firestore()
              .collection('posts')
              .doc(item.user.uid)
              .collection('userPosts')
              .doc(item.id)
              .collection('comments')
              .doc(props.User.currentUser.uid)
              .set({
                comment: comment,
                user: {
                  uid: props.User.currentUser.uid,
                  name: props.User.currentUser.name,
                  photoURL: props.User.currentUser.photoURL,
                  token: props.User.currentUser?.token || null
                },
                timestamp:  firebase.firestore.FieldValue.serverTimestamp()
              })
              .then(() => {
                firebase.firestore()
                  .collection('posts')
                  .doc(item.user.uid)
                  .collection('userPosts')
                  .doc(item.id)
                  .update({
                    commentsCount: item.commentsCount + 1
                  })
                  .then(()=> {
                    setPosts(posts.map((post) => {
                      if(post.id === item.id){
                        return {
                          ...post,
                          commentsCount: item.commentsCount + 1,
                          comments: [{
                            comment: comment,
                            user: {
                              uid: props.User.currentUser.uid,
                              name: props.User.currentUser.name,
                              photoURL: props.User.currentUser.photoURL,
                              token: props.User.currentUser?.token || null
                            },
                            timestamp:  firebase.firestore.FieldValue.serverTimestamp()
                          }, ...post.comments]

                        }
                      }
                      return post;
                    }))
                    setComment('');
                  })
              })
            }}
          >
            <Text style={styles.postFooterForAddCommentButtonText}>
              <MaterialCommunityIcons name="send" size={20} color={props.UI.textColor} />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
     </View>
    )
  }, [comment, props.UI.backgroundColor, props.UI.colors.darkRed, props.UI.textColor, posts]);




  return (
    <View style={[styles.container, { backgroundColor : props.UI.backgroundColor}]}>
      <FlatList
        showsVerticalScrollIndicator={false}
        numColumns={1}
        data={posts}
        renderItem={renderItem}

        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postContainer: {
    flex: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postHeaderContent: {
    marginLeft: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 11,
    color: '#c4c6ce',
  },
  postImage: {
    width: '100%',
    height: 400,
  },
  postDescription: {
    margin: 10,
    fontSize: 14,
  },
  postFooter: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 10,
  },
  postFooterForLikesAndComments: {
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  postFooterForLikes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postFooterForLikesText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  postFooterForComments: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postFooterForCommentsText: {
    fontSize: 14,
    marginLeft: 5,
  },
  postFooterForAddComment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  postFooterForAddCommentInput: {
    width: '90%',
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
    padding: 10,
  },
  postFooterForAddCommentButton: {
    width: '10%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  postFooterForAddCommentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postFooterForLikesAndCommentsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
  },
  postFooterForLikesAndCommentsButtonText: {
    fontSize: 14,
    marginLeft: 5,
  },
  postFooterForShare: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
  },
  postFooterForShareButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
  },
  postFooterForShareButtonText: {
    fontSize: 14,
    marginLeft: 5,
  },
  postFooterForLikesandCommentsCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
  },
  postFooterForLikesandCommentsCountText: {
    fontSize: 14,
  },
  postFooterForLikesandCommentsCountTextBold: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  postFooterForCommentsTextBold: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  postFooterForCommentsImage : {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  postFooterForCommentsImageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
  },
  postFooterForCommentsImageContainerText: {
    fontSize: 14,
    marginLeft: 5,
  },
  

});


const mapStateToProps = (store) => ({
  UI: store.UI,
  User: store.User,
  Users : store.Users,
})


export default connect(mapStateToProps)(Home);