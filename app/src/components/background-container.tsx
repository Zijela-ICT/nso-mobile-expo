// BackgroundContainer.tsx
import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ImageSourcePropType,
  Image,
} from 'react-native';

interface BackgroundContainerProps {
  children: ReactNode;
  backgroundImage: ImageSourcePropType;
  formHeight?: any;
}

const BackgroundContainer = ({
  children,
  backgroundImage,
  formHeight = '45%',
}: BackgroundContainerProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
        >
          <View style={styles.overlay}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/chprbn.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Form Container */}
            <View style={[styles.formContainer, { height: formHeight }]}>
              {children}
            </View>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 200,
    height: 60,
  },
  formContainer: {
    backgroundColor: '#027A48',
    borderTopRightRadius: 100,
    paddingHorizontal: 24,
    paddingTop: 32,
    marginTop: 'auto',
  },
});

export default BackgroundContainer;