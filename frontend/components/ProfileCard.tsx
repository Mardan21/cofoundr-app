import React from 'react';
import { View, StyleSheet, Text, Image, ScrollView, Dimensions } from 'react-native';
import { User } from '@/types/User';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Chip } from 'react-native-paper';

interface ProfileCardProps {
  user: User;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: user.profile_pic_url }} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />
      <View style={styles.infoContainer}>
        <View style={styles.header}>
            <Text style={styles.name}>{user.full_name}</Text>
            <Text style={styles.age}>, 28</Text>
        </View>
        <Text style={styles.role}>{user.role}</Text>
        <ScrollView style={styles.details} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Startup Idea</Text>
            <Text style={styles.sectionContent}>{user.startupIdea}</Text>

            <Text style={styles.sectionTitle}>Looking For</Text>
            <Text style={styles.sectionContent}>{user.lookingFor}</Text>

            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
                {user.skills?.map((skill, index) => (
                    <Chip key={index} style={styles.skillChip} textStyle={styles.skillChipText}>
                        {skill}
                    </Chip>
                ))}
            </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    card: {
      width: Dimensions.get('window').width * 0.9,
      height: Dimensions.get('window').height * 0.75,
      borderRadius: 20,
      backgroundColor: '#fefefe',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.36,
      shadowRadius: 6.68,
      elevation: 11,
      overflow: 'hidden', // Ensures the gradient and image stay within the border radius
    },
    image: {
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    gradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '50%',
    },
    infoContainer: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      flex: 1,
      justifyContent: 'flex-end',
      height: '45%',
    },
    header:{
        flexDirection:'row',
        alignItems: 'center',
    },
    name: {
      fontSize: 32,
      color: 'white',
      fontWeight: 'bold',
    },
    age:{
        fontSize: 28,
        color: 'white',
        fontWeight:'300',
    },
    role: {
      fontSize: 18,
      color: 'white',
      marginBottom: 10,
    },
    details:{
        flexGrow: 0,
    },
    sectionTitle: {
      fontSize: 16,
      color: 'white',
      fontWeight: 'bold',
      marginTop: 10,
    },
    sectionContent: {
      fontSize: 14,
      color: 'white',
      marginBottom: 5,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5,
    },
    skillChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginRight: 5,
        marginBottom: 5,
    },
    skillChipText: {
        color: 'white',
    },
  });

export default ProfileCard; 