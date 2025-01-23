// components/CustomInput.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacity,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';


interface CustomInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  isPassword?: boolean;
  placeholderTextColor?: string;
  iconColor?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputContainerStyle,
  inputStyle,
  errorStyle,
  isPassword,
  iconColor,
  placeholderTextColor,
  secureTextEntry,
  ...textInputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const getInputStyles = () => {
    const baseStyles: StyleProp<TextStyle>[] = [styles.input];
    if (error) {
      baseStyles.push(styles.inputError);
    }
    if (inputStyle) {
      baseStyles.push(inputStyle);
    }
    if (isPassword) {
      baseStyles.push({ paddingRight: 50 }); // Make room for the icon
    }
    return baseStyles;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      <View style={styles.inputWrapper}>
        <TextInput
          {...textInputProps}
          style={getInputStyles()}
          placeholderTextColor={placeholderTextColor || "#EAECF0"}
          secureTextEntry={secureTextEntry && !showPassword}
        />
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.iconContainer}
            onPress={togglePasswordVisibility}
          >
            <Icon 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={24} 
              color={iconColor ||"#EAECF0"}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.errorText, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#FCFCFD',
    marginBottom: 8,
    fontWeight: '500'
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#EAECF0',
    backgroundColor: 'transparent',
    borderColor: "#D0D5DD",
    borderWidth: 1,
  },
  iconContainer: {
    position: 'absolute',
    right: 12,
    top: '40%',
    transform: [{ translateY: -12 }],
    padding: 4,
  },
  inputError: {
    borderColor: '#FF4444',
  } as TextStyle,
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
  }
});

export { CustomInput };