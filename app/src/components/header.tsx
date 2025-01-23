import {View, Text, TouchableOpacity, Image, StyleSheet, Platform} from 'react-native';
import React from 'react';
import {NotificationBing} from 'iconsax-react-native';
import {useFetchProfile} from '@/hooks/api/queries/settings';

const Header = () => {
  const {data: userProfile} = useFetchProfile();
  const profile = userProfile?.data;

  return (
    <View style={styles.headerSection}>
      <Image
        source={require('../assets/chprbn.png')}
        style={{width: 100, height: 40, resizeMode: 'contain'}}
      />
      <View style={styles.details}>
        <View style={{marginRight: 10}}>
          <Text style={styles.profileName}>
            {!!profile?.firstName && profile?.firstName} {profile?.lastName}
          </Text>
          <Text style={styles.cadre}>{profile?.cadre}</Text>
        </View>
        <TouchableOpacity>
          <NotificationBing size="24" color="#101828" variant="Outline" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: '#F8FFFB',
    borderBottomColor: '#F2F4F7',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  details: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },

  profileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#101828',
  },
  cadre: {
    fontSize: 14,
    color: '#667085',
    fontWeight: '400',
  },
});

export {Header};