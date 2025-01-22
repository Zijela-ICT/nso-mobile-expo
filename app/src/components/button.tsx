 // components/CustomButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleProp,
} from 'react-native';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  loadingText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  loadingText,
  containerStyle,
  textStyle,
  disabled = false,
  ...touchableProps
}) => {
  const getContainerStyles = (): StyleProp<ViewStyle>[] => {
    const baseStyle: StyleProp<ViewStyle>[] = [styles.button];
    
    // Add size-specific styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.buttonSmall);
        break;
      case 'large':
        baseStyle.push(styles.buttonLarge);
        break;
    }
    
    // Add variant-specific styles
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.buttonSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.buttonOutline);
        break;
    }

    // Add disabled state
    if (disabled || isLoading) {
      baseStyle.push({ opacity: 0.7 });
    }

    // Add custom styles
    if (containerStyle) {
      baseStyle.push(containerStyle);
    }

    return baseStyle;
  };

  const getTextStyles = (): StyleProp<TextStyle>[] => {
    const baseStyle: StyleProp<TextStyle>[] = [styles.buttonText];

    // Add variant-specific text styles
    switch (variant) {
      case 'outline':
        baseStyle.push(styles.buttonOutlineText);
        break;
    }

    // Add size-specific text styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.buttonTextSmall);
        break;
      case 'large':
        baseStyle.push(styles.buttonTextLarge);
        break;
    }

    // Add custom text styles
    if (textStyle) {
      baseStyle.push(textStyle);
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={getContainerStyles()}
      disabled={disabled || isLoading}
      {...touchableProps}
    >
      {isLoading ? (
        <>
          <ActivityIndicator color={variant === 'outline' ? '#333' : '#fff'} />
          {loadingText && (
            <Text style={[...getTextStyles(), styles.loadingText]}>
              {loadingText}
            </Text>
          )}
        </>
      ) : (
        <Text style={getTextStyles()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#E5E5E5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  } as const,
  buttonSmall: {
    padding: 8,
    borderRadius: 6,
  } as const,
  buttonLarge: {
    padding: 20,
    borderRadius: 10,
  } as const,
  buttonSecondary: {
    backgroundColor: '#027A48',
    borderColor: '#0CA554',
  } as const,
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  } as const,
  buttonText: {
    color: '#0CA554',
    fontSize: 16,
    fontWeight: '600',
  } as const,
  buttonTextSmall: {
    fontSize: 14,
  } as const,
  buttonTextLarge: {
    fontSize: 18,
  } as const,
  buttonOutlineText: {
    color: '#E5E5E5',
  } as const,
  loadingText: {
    marginLeft: 8,
  } as const,
});

export  {CustomButton};