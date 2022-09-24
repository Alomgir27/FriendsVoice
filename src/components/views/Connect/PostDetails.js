import React from 'react'

import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Dimensions, SafeAreaView, ScrollView, StatusBar, Platform, TextInput } from 'react-native'

import { connect } from 'react-redux'
import { useEffect, useState } from 'react'

import { MaterialCommunityIcons } from 'react-native-vector-icons'

import { Video } from 'expo-av'
import moment from 'moment'


import firebase from '../../../../firebase';

import { LogBox } from 'react-native';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);


function PostDetails(props) {

  const [post, setPost] = useState([])
  const [comment, setComment] = useState('')

  useEffect(() => {
    setPost(props.route.params.post)
    console.log(props.route.params.post)
  }, [])

  const getMoment = (timestamp) => {
    try {
      return moment(timestamp.toDate()).fromNow()
    } catch (error) {
      return moment(firebase.firestore.Timestamp.now().toDate()).fromNow()
    }
  }

  return (
    <View style={[styles.container, { backgroundColor : props.UI.backgroundColor}]}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => props.navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={props.UI.textColor} />
        </TouchableOpacity>
      </View>
      <View style={styles.postContainer}>
        <View style={styles.postHeader}>
          <View style={styles.postHeaderLeft}>
            <Image source={{ uri: post.user?.photoURL }} style={styles.postProfileImage} />
            <View style={styles.postHeaderText}>
              <Text style={[styles.postUsername, { color : props.UI.textColor}]}>{post.user?.name}</Text>
              <Text style={[styles.postTime, { color : props.UI.textColor}]}>{moment(post.timestamp?.toDate()).fromNow()}</Text>
           </View>
          </View>
        </View>
        <Text style={styles.postText}>{post.caption}</Text>
        <View style={styles.postBody}>
          {post.type === 'image' ? <Image source={{ uri: post.remoteUri }} style={styles.postImage} /> : null}
          {post.type === 'video' ? <Video source={{ uri: post.remoteUri }} style={styles.postVideo} shouldPlay={false} isLooping={false} resizeMode="cover" useNativeControls={true} /> : null}
        </View>
        <View style={styles.postFooterContainer}>
          <TouchableOpacity style={styles.postFooterLeftItem}
             onPress={() => {
              if(!post.likes.includes(props.User.currentUser.uid)){
                firebase.firestore()
                .collection('posts')
                .doc(post.user.uid)
                .collection('userPosts')
                .doc(post.id)
                .collection('likes')
                .doc(props.User.currentUser.uid)
                .set({})
                .then(() => {
                  firebase.firestore()
                  .collection('posts')
                  .doc(post.user.uid)
                  .collection('userPosts')
                  .doc(post.id)
                  .update({
                    likesCount: post.likesCount + 1
                  })
                  setPost(prev => {
                    return {
                      ...prev,
                      likesCount : prev.likesCount + 1,
                      likes : [...prev.likes, props.User.currentUser.uid]
                    }
                  })

                  props.route.params?.setPosts(prev => {
                    return prev.map(item => {
                      if(item.id === post.id){
                        return {
                          ...item,
                          likesCount : item.likesCount + 1,
                          likes : [...item.likes, props.User.currentUser.uid]
                        }
                      }
                      return item
                    })
                  })


                })
                .catch((err) => {
                  console.log(err);
                })
              }
              else {
                console.log('You already liked this post');
                firebase.firestore()
                .collection('posts')
                .doc(post.user.uid)
                .collection('userPosts')
                .doc(post.id)
                .collection('likes')
                .doc(props.User.currentUser.uid)
                .delete()
                .then(() => {
                  firebase.firestore()
                  .collection('posts')
                  .doc(post.user.uid)
                  .collection('userPosts')
                  .doc(post.id)
                  .update({
                    likesCount: post.likesCount - 1
                  })
                  setPost(prev => {
                    return {
                      ...prev,
                      likesCount : prev.likesCount - 1,
                      likes : prev.likes.filter((uid) => uid !== props.User.currentUser.uid)
                    }
                  })
                  props.route.params?.setPosts(prev => {
                    return prev.map((item) => {
                      if(item.id === post.id){
                        return {
                          ...item,
                          likesCount : item.likesCount - 1,
                          likes : item.likes.filter((uid) => uid !== props.User.currentUser.uid)
                        }
                      }
                      return item
                    })
                  })
                })
                .catch((err) => {
                  console.log(err);
                })
              }
            }}
          >
          {post.likes?.includes(props.User.currentUser.uid) ? (
              <MaterialCommunityIcons name="heart" size={24} color={props.UI.colors.darkRed} />
            ) : (
              <MaterialCommunityIcons name="heart-outline" size={24} color={props.UI.textColor} />
            )}
            <Text style={styles.postFooterLeftItemText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postFooterLeftItem}>
            <MaterialCommunityIcons name="share-outline" size={24} color={props.UI.textColor} />
            <Text style={styles.postFooterLeftItemText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.postFooterRightItem}>
            <MaterialCommunityIcons name="bookmark-outline" size={24} color={props.UI.textColor} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.commentsContainer}>
        <Text style={[styles.commentsTitle, { color : props.UI.textColor}]}>Comments</Text>
        <View style={styles.commentInputContainer}>
          <TextInput placeholder="Write a comment..."
            style={[styles.commentInput, { color : props.UI.textColor}]}
            value={comment}
            onChangeText={(text) => setComment(text)}
          />
          <TouchableOpacity style={styles.commentButton}
            onPress={() => {
              firebase.firestore()
              .collection('posts')
              .doc(post.user.uid)
              .collection('userPosts')
              .doc(post.id)
              .collection('comments')
              .add({
                comment,
                timestamp : firebase.firestore.FieldValue.serverTimestamp(),
                user : {
                  uid : props.User.currentUser.uid,
                  name : props.User.currentUser.name,
                  photoURL : props.User.currentUser.photoURL,
                  token : props.User.currentUser?.token || null
                }
              })
              .then(() => {
                setPost(prev => {
                  return {
                    ...prev,
                    commentsCount : prev.commentsCount + 1,
                    comments : [{
                      comment,
                      timestamp : firebase.firestore.FieldValue.serverTimestamp(),
                      user : {
                        uid : props.User.currentUser.uid,
                        name : props.User.currentUser.name,
                        photoURL : props.User.currentUser.photoURL,
                        token : props.User.currentUser?.token || null
                      }
                    }, ...prev.comments]
                  }
                })
                props.route.params?.setPosts(prev => {
                  return prev.map(item => {
                    if(item.id === post.id){
                      return {
                        ...item,
                        commentsCount : item.commentsCount + 1,
                        comments : [{
                          comment,
                          timestamp : firebase.firestore.FieldValue.serverTimestamp(),
                          user : {
                            uid : props.User.currentUser.uid,
                            name : props.User.currentUser.name,
                            photoURL : props.User.currentUser.photoURL,
                            token : props.User.currentUser?.token || null
                          }
                        }, ...item.comments,]
                      }
                    }
                    return item
                  })
                })
                setComment('')
              })
              .catch((err) => {
                console.log(err);
              }
              )
            }}
          >
            <MaterialCommunityIcons name="send" size={24} color={props.UI.textColor} />
          </TouchableOpacity>
        </View>
        <FlatList
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          data={post.comments}
          renderItem={({ item }) => (
            <View style={styles.commentContainer}>
              <View style={styles.commentHeader}>
                <View style={styles.commentHeaderLeft}>
                  <Image source={{ uri: item.user?.photoURL }} style={styles.commentProfileImage} />
                  <View style={styles.commentHeaderText}>
                    <Text style={{ color : props.UI.textColor, flex : 1, flexDirection: 'row'}}>
                      <Text style={{ fontWeight: 'bold' }}>{item.user?.name}</Text>
                      <Text style={{ fontSize: 13}}> {getMoment(item.timestamp)}</Text>
                    </Text>
                    <Text style={[styles.commentText, { color : props.UI.textColor }]}>{item.comment}</Text>
                  </View>
                </View>
                
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={styles.commentSeparator} />}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  postContainer: {
    flex: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  postProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10
  },
  postUsername: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  postTime: {
    fontSize: 12,
  },
  postBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postText: {
    fontSize: 14,
    lineHeight: 20,
    marginVertical: 5,
    marginLeft: 50
  },
  postImage: {
    flex: 1,
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  postVideo: {
    flex: 1,
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc'
  },
  postFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  postFooterLeftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20
  },
  postFooterLeftItemText: {
    fontSize: 14,
    marginLeft: 5
  },
  postFooterRight: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  postFooterRightItem: {
    marginLeft: 20
  },
  commentsContainer: {
    padding: 10
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10
  },
  commentButton: {
    marginLeft: 10,
  },
  commentContainer: {
    marginBottom: 10
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  commentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    marginTop: 5
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  commentTime: {
    fontSize: 12,
  },
  commentBody: {
    paddingVertical: 5,
    paddingLeft: 40
  },
  commentText: {
    fontSize: 14
  },
  commentHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  postHeaderText: {
    fontSize: 14,
  },
  commentHeaderText: {
   fontSize: 14,
  },
  commentSeparator: {
    height: 1,
  },
  postFooterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingHorizontal: 10
  },
});


const mapStateToProps = (store) => ({
  UI : store.UI,
  User : store.User,
  Users : store.Users,
})

export default connect(mapStateToProps)(PostDetails)