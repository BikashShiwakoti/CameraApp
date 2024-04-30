import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View,  Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import * as Speech from 'expo-speech';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { Audio } from 'expo-av';


const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);

  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [sound, setSound] = useState();

  const imageContainerRef = useRef();

  const [status, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    if (status === null) {
      requestPermission();
    }
  }, [status, requestPermission]);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const toggleCamera = () => {
    setCameraType(
      cameraType === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back
    );
  };
  

  const takePicture = async () => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      setCapturedPhotos([...capturedPhotos, photo.uri]);
    }
  };

  const takeScreenshot = async () => {
    try {
      const localUri = await captureRef(imageContainerRef, {
        format: 'jpg',
        quality: 1,
      });

      setCapturedPhotos([...capturedPhotos, localUri]);

    } catch (error) {
      console.error('Failed to save image:', error);
    }
  };

  const clearGallery = async () => {
    if (capturedPhotos.length > 0) {
      setCapturedPhotos([]);
      const thingToSay = 'Gallery cleared. Take pictures again to populate gallery';
      Speech.speak(thingToSay);
    }
  };

  return (
    <View style={styles.container}>
       <Camera
         ref={(ref) => setCamera(ref)}
         style={styles.camera}
         type={cameraType}
       />

      <TouchableOpacity style={styles.button} onPress={takePicture}>
        <Text style={styles.buttonText}>Take Picture</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={takeScreenshot}>
        <Text style={styles.buttonText}>Screenshot</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={toggleCamera}>
        <Text style={styles.buttonText}>Switch Camera</Text>
      </TouchableOpacity>


      <Text style={styles.heading}>Gallery</Text>
      <ScrollView horizontal style={styles.gallery}>
        <View style={styles.imageContainer} collapsable={false} ref={imageContainerRef}>
          {capturedPhotos.map((uri, index) => (
            <Image key={index} source={{ uri }} style={styles.galleryImage} />
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={clearGallery}>
        <Text style={styles.buttonText}>Clear Gallery</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    width: '100%',
    height: '50%',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  gallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 20,
    paddingHorizontal: 2,
  },
  galleryImage: {
    width: 100,
    height: 100,
    marginHorizontal: 5,
  },
  heading:{
    marginTop: 5,
    textAlign: 'center',
    backgroundColor: 'grey',
    fontSize: 20,
  },
  imageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: screenWidth,
    minHeight: 100, // Ensure container has non-zero height
  },
});
