import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Text, Title } from "react-native-paper";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/welcome");
  };

  const getProfileTypeIcon = () => {
    switch (user?.profileType) {
      case "cofounder":
        return "account-group";
      case "mentor":
        return "school";
      case "investor":
        return "cash";
      default:
        return "account";
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Welcome back, {user?.name}!</Title>
        <Button mode="text" onPress={handleLogout} style={styles.logoutButton}>
          Logout
        </Button>
      </View>

      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Icon size={64} icon={getProfileTypeIcon()} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <Text style={styles.profileType}>
                {user?.profileType?.charAt(0).toUpperCase() +
                  user?.profileType?.slice(1)}
              </Text>
              {user?.showCompany && (
                <Text style={styles.companyName}>{user?.companyName}</Text>
              )}
            </View>
          </View>

          <Text style={styles.bioLabel}>Bio:</Text>
          <Text style={styles.bio}>{user?.bio}</Text>

          {user?.linkedinUrl && (
            <Text style={styles.link}>LinkedIn: {user.linkedinUrl}</Text>
          )}

          {user?.githubUsername && (
            <Text style={styles.link}>GitHub: @{user.githubUsername}</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.placeholderCard}>
        <Card.Content>
          <Title>Coming Soon</Title>
          <Text>
            This is where you'll discover and connect with potential cofounders,
            mentors, and investors. Stay tuned!
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
  },
  logoutButton: {
    marginRight: -8,
  },
  profileCard: {
    margin: 20,
    marginTop: 10,
  },
  profileHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  profileInfo: {
    marginLeft: 16,
    justifyContent: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  profileType: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  companyName: {
    fontSize: 14,
    color: "#666",
  },
  bioLabel: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  bio: {
    color: "#666",
    lineHeight: 20,
  },
  link: {
    color: "#1976d2",
    marginTop: 8,
  },
  placeholderCard: {
    margin: 20,
    marginTop: 0,
  },
});
