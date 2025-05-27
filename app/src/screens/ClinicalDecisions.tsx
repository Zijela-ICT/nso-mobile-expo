import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {HomeStackParamList} from '../stacks/HomeStack';
import {useNavigation} from '@react-navigation/native';
import {useFetchEbookUrl} from '@/hooks/api/queries/ebooks';
import {useFetchProfile} from '@/hooks/api/queries/settings';
import {Header} from '@/components';

const {width} = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type HomeNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'ClinicalDecision'
>;

const categoryStyles = [
  {color: '#F8FFFB', borderColor: '#ABCFBA'},
  {color: '#FFFAFC', borderColor: '#D7B6C3'},
  {color: '#F6F6FF', borderColor: '#B4B4DA'},
  {color: '#FFF4F1', borderColor: '#D8B4A9'},
  {color: '#F8FFFB', borderColor: '#ABCFBA'},
  {color: '#FFFAFC', borderColor: '#D7B6C3'},
  {color: '#F6F6FF', borderColor: '#B4B4DA'},
];

const ClinicalDecisions = () => {
  const {data, isLoading} = useFetchEbookUrl();
  const {isLoading: isLoadingProfile} = useFetchProfile();
  const navigation = useNavigation<HomeNavigationProp>();


  if (isLoading || isLoadingProfile) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Filter out content items that don't have subChapters or have empty subChapters
  const filteredContent = data?.book?.content?.filter(
    chapter => chapter.subChapters && chapter.subChapters.length > 0
  );

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#F8FFFB'}}>
      <Header />
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Sections</Text>
        <View style={styles.grid}>
          {filteredContent?.map((chapter, index) => {
            const style = categoryStyles[index % categoryStyles.length];
            const chapterTitle = chapter.chapter;
            const ageRange = chapter.chapter.match(/\((.*?)\)/)?.[1] || '';

            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  navigation.navigate('DynamicFlow', {
                    chapter,
                    chapterIndex: index,
                  });
                }}
                style={[
                  styles.card,
                  {
                    backgroundColor: style.color,
                    borderColor: style.borderColor,
                  },
                ]}>
                <Text style={styles.cardTitle}>{chapterTitle}</Text>
                {ageRange && (
                  <Text style={styles.cardSubtitle}>{ageRange}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 10,
    color: '#000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 30,
  },
  card: {
    width: CARD_WIDTH,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    height: 120,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#101828',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  headerSection: {
    backgroundColor: '#F8FFFB',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

export default ClinicalDecisions;