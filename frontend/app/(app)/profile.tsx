import { useAuth } from "@/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Avatar,
  Card,
  Divider,
  IconButton,
  List,
  Text,
  Title,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/welcome");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.header}>
        <Title style={styles.headerTitle}>My Profile</Title>
        <IconButton
          icon="pencil"
          size={24}
          iconColor="white"
          onPress={() => {
            /* Navigate to edit profile */
          }}
        />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Avatar.Icon size={100} icon="account" style={styles.avatar} />
          <Title style={styles.name}>{user?.name || "Your Name"}</Title>
          <Text style={styles.role}>
            {user?.profileType
              ? user.profileType.charAt(0).toUpperCase() +
                user.profileType.slice(1)
              : "Role"}
          </Text>
          <Text style={styles.company}>
            {user?.showCompany && user?.companyName}
          </Text>
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

        {/* Profile Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>About</Title>
            <Text style={styles.bio}>{user?.bio || "No bio added yet"}</Text>
          </Card.Content>
        </Card>

        {/* Links */}
        {(user?.linkedinUrl || user?.githubUsername) && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.sectionTitle}>Links</Title>
              {user?.linkedinUrl && (
                <List.Item
                  title="LinkedIn"
                  description={user.linkedinUrl}
                  left={(props) => <List.Icon {...props} icon="linkedin" />}
                />
              )}
              {user?.githubUsername && (
                <List.Item
                  title="GitHub"
                  description={`@${user.githubUsername}`}
                  left={(props) => <List.Icon {...props} icon="github" />}
                />
              )}
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
              onPress={() => {
                /* Navigate to edit */
              }}
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
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  role: {
    fontSize: 16,
    color: "#6366f1",
    marginTop: 4,
  },
  company: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
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
});
