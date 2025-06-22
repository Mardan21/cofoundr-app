import { useAuth } from "@/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Image, ActivityIndicator, Alert } from "react-native";
import {
  Avatar,
  Card,
  Divider,
  IconButton,
  List,
  Text,
  Title,
  Chip,
  Button,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Audio } from 'expo-av';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function playSound(base64Audio: string) {
    if (isPlaying && sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      return;
    }

    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
      return;
    }

    setIsLoading(true);
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${base64Audio}` },
        { shouldPlay: true }
      );
      
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          newSound.unloadAsync();
          setSound(null);
        }
      });

      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Could not play audio.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/welcome");
  };

  const formatDate = (dateInfo: any) => {
    if (!dateInfo || dateInfo === "None") return "Present";
    if (typeof dateInfo === 'object' && dateInfo.year) {
      return `${dateInfo.month}/${dateInfo.year}`;
    }
    return "Present";
  };

  const renderExperience = (experience: any, index: number) => (
    <View key={index} style={styles.experienceItem}>
      <View style={styles.experienceHeader}>
        <Text style={styles.experienceTitle}>{experience.title}</Text>
        <Text style={styles.experienceCompany}>{experience.company}</Text>
      </View>
      <Text style={styles.experienceDuration}>
        {formatDate(experience.starts_at)} - {formatDate(experience.ends_at)}
      </Text>
      {experience.location && (
        <Text style={styles.experienceLocation}>{experience.location}</Text>
      )}
      {experience.description && (
        <Text style={styles.experienceDescription}>{experience.description}</Text>
      )}
    </View>
  );

  const renderEducation = (education: any, index: number) => (
    <View key={index} style={styles.educationItem}>
      <View style={styles.educationHeader}>
        <Text style={styles.educationSchool}>{education.school}</Text>
        <Text style={styles.educationDegree}>
          {education.degree_name} {education.field_of_study && `in ${education.field_of_study}`}
        </Text>
      </View>
      <Text style={styles.educationDuration}>
        {formatDate(education.starts_at)} - {formatDate(education.ends_at)}
      </Text>
      {education.description && (
        <Text style={styles.educationDescription}>{education.description}</Text>
      )}
    </View>
  );

  const renderProject = (project: any, index: number) => (
    <View key={index} style={styles.projectItem}>
      <Text style={styles.projectName}>{project.name}</Text>
      {project.description && (
        <Text style={styles.projectDescription}>{project.description}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.header}>
        <Title style={styles.headerTitle}>My Profile</Title>
        <IconButton
          icon="pencil"
          size={24}
          iconColor="white"
          onPress={() => router.push("/(app)/edit-profile")}
        />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {user?.profile_pic_url ? (
            <Image source={{ uri: user.profile_pic_url }} style={styles.avatarImage} />
          ) : (
            <Avatar.Icon size={100} icon="account" style={styles.avatar} />
          )}
          <Title style={styles.name}>{user?.full_name || "Your Name"}</Title>
          <Text style={styles.role}>{user?.role || "Professional"}</Text>
          <Text style={styles.location}>
            {user?.city && user?.state ? `${user.city}, ${user.state}` : "Location not set"}
          </Text>
          <Chip 
            mode="outlined" 
            style={styles.profileTypeChip}
            textStyle={styles.profileTypeText}
          >
            {user?.profileType ? user.profileType.charAt(0).toUpperCase() + user.profileType.slice(1) : "Founder"}
          </Chip>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>5</Text>
            <Text style={styles.statLabel}>Conversations</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>89%</Text>
            <Text style={styles.statLabel}>Response Rate</Text>
          </View>
        </View>

        {/* About */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>About</Title>
            <Text style={styles.bio}>{user?.bio || "No bio added yet"}</Text>
          </Card.Content>
        </Card>

        {/* Audio Profile */}
        {user?.audio_base64 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Audio Profile</Title>
              <Text style={styles.audioDescription}>
                Listen to an AI-generated summary of your profile
              </Text>
              <TouchableOpacity 
                style={[styles.playButton, isPlaying && styles.playingButton]}
                onPress={() => user?.audio_base64 && playSound(user.audio_base64)}
                disabled={isLoading}
              >
                <View style={styles.playButtonContent}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Icon name={isPlaying ? "pause-circle" : "play-circle"} size={24} color="white" />
                  )}
                  <Text style={styles.playButtonText}>{isPlaying ? "Pause" : "Play Audio Profile"}</Text>
                </View>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}

        {/* Startup Idea */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Startup Idea</Title>
            <Text style={styles.startupIdea}>{user?.startupIdea || "No startup idea added yet"}</Text>
          </Card.Content>
        </Card>

        {/* Looking For */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Looking For</Title>
            <Text style={styles.lookingFor}>{user?.lookingFor || "No preference set yet"}</Text>
          </Card.Content>
        </Card>

        {/* Skills */}
        {user?.skills && user.skills.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Skills</Title>
              <View style={styles.skillsContainer}>
                {user.skills.map((skill, index) => (
                  <Chip key={index} style={styles.skillChip} mode="outlined">
                    {skill}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Experience */}
        {user?.experiences && user.experiences.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Experience</Title>
              {user.experiences.map((experience, index) => renderExperience(experience, index))}
            </Card.Content>
          </Card>
        )}

        {/* Education */}
        {user?.education && user.education.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Education</Title>
              {user.education.map((education, index) => renderEducation(education, index))}
            </Card.Content>
          </Card>
        )}

        {/* Projects */}
        {user?.accomplishment_projects && user.accomplishment_projects.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Projects</Title>
              {user.accomplishment_projects.map((project, index) => renderProject(project, index))}
            </Card.Content>
          </Card>
        )}

        {/* Links */}
        {user?.links && user.links.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Links</Title>
              {user.links.map((link, index) => (
                <List.Item
                  key={index}
                  title={link.name}
                  description={link.url}
                  left={(props) => <List.Icon {...props} icon="link" />}
                  onPress={() => {/* Handle link opening */}}
                />
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Account Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Account</Title>
            <List.Item
              title="Edit Profile"
              left={(props) => <List.Icon {...props} icon="pencil" />}
              onPress={() => router.push("/(app)/edit-profile")}
            />
            <List.Item
              title="Settings"
              left={(props) => <List.Icon {...props} icon="cog" />}
              onPress={() => {
                /* Navigate to settings */
              }}
            />
            <List.Item
              title="Premium"
              description="Unlock all features"
              left={(props) => (
                <List.Icon {...props} icon="star" color="#f59e0b" />
              )}
              onPress={() => {
                /* Navigate to premium */
              }}
            />
            <Divider style={styles.divider} />
            <List.Item
              title="Logout"
              left={(props) => (
                <List.Icon {...props} icon="logout" color="#ef4444" />
              )}
              onPress={handleLogout}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(app)/browse")}
        >
          <Icon name="home" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Browse</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(app)/messages")}
        >
          <Icon name="message" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="account" size={24} color="#6366f1" />
          <Text style={[styles.navText, styles.activeNav]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "white",
  },
  avatar: {
    backgroundColor: "#6366f1",
    marginBottom: 10,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  role: {
    fontSize: 16,
    color: "#6366f1",
    marginTop: 4,
  },
  location: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  profileTypeChip: {
    marginTop: 8,
    borderColor: "#6366f1",
  },
  profileTypeText: {
    color: "#6366f1",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 20,
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
  },
  card: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  bio: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  startupIdea: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  lookingFor: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    marginBottom: 8,
  },
  experienceItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  experienceHeader: {
    marginBottom: 4,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  experienceCompany: {
    fontSize: 14,
    color: "#6366f1",
  },
  experienceDuration: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  experienceLocation: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  experienceDescription: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 18,
  },
  educationItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  educationHeader: {
    marginBottom: 4,
  },
  educationSchool: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  educationDegree: {
    fontSize: 14,
    color: "#6366f1",
  },
  educationDuration: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  educationDescription: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 18,
  },
  projectItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  projectName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 18,
  },
  divider: {
    marginVertical: 10,
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  activeNav: {
    color: "#6366f1",
  },
  audioDescription: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  playButton: {
    backgroundColor: "#6366f1",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  playingButton: {
    backgroundColor: '#8b5cf6', // A different color for when it's playing
  },
  playButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
