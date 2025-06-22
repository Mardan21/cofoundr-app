import { useAuth } from "@/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import {
  Avatar,
  Chip,
  Divider,
  IconButton,
  List,
  Text,
  Title,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const SWIPE_THRESHOLD = 120;

// Mock data for profiles
const mockProfiles = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "https://i.pravatar.cc/150?img=1",
    role: "cofounder",
    startupIdea: "AI-powered mental health platform",
    location: "San Francisco, CA",
    skills: ["Machine Learning", "Healthcare", "Product Management"],
    experience: "5 years in healthtech",
    education: "Stanford CS",
    projects: ["Built health monitoring app with 100k users"],
    accomplishments: ["Forbes 30 Under 30"],
    bio: "Looking for a technical co-founder to revolutionize mental healthcare accessibility",
    lookingFor: "Technical co-founder with ML expertise",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    avatar: "https://i.pravatar.cc/150?img=2",
    role: "investor",
    startupIdea: "Seed-stage investor in B2B SaaS",
    location: "New York, NY",
    skills: ["Venture Capital", "B2B SaaS", "Growth Strategy"],
    experience: "10 years in VC",
    education: "Harvard MBA",
    projects: ["Portfolio: 50+ startups, 5 unicorns"],
    accomplishments: ["Top 100 VC on Twitter"],
    bio: "Investing in the future of work. Check size: $250k-$2M",
    lookingFor: "B2B SaaS founders solving real problems",
  },
  {
    id: "3",
    name: "David Park",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: "mentor",
    startupIdea: "Helping founders scale from 0 to 1",
    location: "Austin, TX",
    skills: ["Product Strategy", "Fundraising", "Team Building"],
    experience: "Exited 2 startups, $50M total",
    education: "MIT Engineering",
    projects: ["Founded and sold EdTech startup", "Advised 20+ startups"],
    accomplishments: ["2x successful exits"],
    bio: "Passionate about helping first-time founders navigate the startup journey",
    lookingFor: "Ambitious founders who need guidance",
  },
];

export default function BrowseScreen() {
  const [profiles] = useState(mockProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [expandedCard, setExpandedCard] = useState(false);
  const swipe = useRef(new Animated.ValueXY()).current;
  // const tiltSign = useRef(new Animated.Value(1)).current;
  const router = useRouter();
  const { logout } = useAuth();

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, { dx, dy, y0 }) => {
      swipe.setValue({ x: dx, y: dy });
      // tiltSign.setValue(y0 > screenHeight * 0.5 ? 1 : -1);
    },
    onPanResponderRelease: (_, { dx, dy }) => {
      const direction = Math.sign(dx);
      const isActionActive = Math.abs(dx) > SWIPE_THRESHOLD;

      if (isActionActive) {
        // Swipe off screen
        Animated.timing(swipe, {
          toValue: { x: direction * screenWidth * 2, y: dy },
          duration: 300,
          useNativeDriver: true,
        }).start(() => handleSwipe(direction));
      } else {
        // Spring back
        Animated.spring(swipe, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 5,
        }).start();
      }
    },
  });

  const handleSwipe = (direction: number) => {
    if (direction === 1) {
      handleAction("interested");
    } else {
      handleAction("pass");
    }
  };

  const handleAction = (action: "pass" | "interested" | "super") => {
    console.log(`Action: ${action} on ${profiles[currentIndex].name}`);
    setExpandedCard(false);
    setCurrentIndex((prev) => prev + 1);
    swipe.setValue({ x: 0, y: 0 });
  };

  const forceSwipe = (direction: "left" | "right" | "up") => {
    const x =
      direction === "right"
        ? screenWidth * 2
        : direction === "left"
        ? -screenWidth * 2
        : 0;
    const y = direction === "up" ? -screenHeight : 0;

    Animated.timing(swipe, {
      toValue: { x, y },
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (direction === "right") handleAction("interested");
      else if (direction === "left") handleAction("pass");
      else handleAction("super");
    });
  };

  const renderCard = (profile: (typeof mockProfiles)[0], index: number) => {
    const isFirst = index === currentIndex;
    const dragHandlers = isFirst ? panResponder.panHandlers : {};

    const rotate = swipe.x.interpolate({
      inputRange: [-screenWidth / 2, 0, screenWidth / 2],
      outputRange: ["-10deg", "0deg", "10deg"],
    });

    const animatedCardStyle = {
      transform: [...swipe.getTranslateTransform(), { rotate }],
    };

    return (
      <Animated.View
        key={profile.id}
        style={[
          styles.cardContainer,
          isFirst && animatedCardStyle,
          { zIndex: profiles.length - index },
        ]}
        {...dragHandlers}
      >
        <View style={styles.card}>
          {/* Profile Header */}
          <View style={styles.cardHeader}>
            <Avatar.Image size={80} source={{ uri: profile.avatar }} />
            <View style={styles.headerInfo}>
              <Title style={styles.name}>{profile.name}</Title>
              <Text style={styles.role}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </Text>
              <Text style={styles.location}>📍 {profile.location}</Text>
            </View>
          </View>

          {/* Profile Content */}
          <View style={styles.contentArea}>
            <Text style={styles.startupIdea}>{profile.startupIdea}</Text>

            <View style={styles.chipsContainer}>
              {profile.skills.slice(0, 3).map((skill, idx) => (
                <Chip
                  key={idx}
                  style={styles.chip}
                  textStyle={styles.chipText}
                >
                  {skill}
                </Chip>
              ))}
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Looking for:</Text>
              <Text style={styles.lookingFor}>{profile.lookingFor}</Text>
            </View>

            {expandedCard && (
              <View style={styles.expandedContent}>
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Bio:</Text>
                  <Text style={styles.infoText}>{profile.bio}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Experience:</Text>
                  <Text style={styles.infoText}>{profile.experience}</Text>
                </View>

                <View style={styles.infoSection}>
                  <Text style={styles.sectionTitle}>Education:</Text>
                  <Text style={styles.infoText}>{profile.education}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Expand Button */}
          <TouchableOpacity
            onPress={() => setExpandedCard(!expandedCard)}
            style={styles.expandButton}
          >
            <Text style={styles.expandText}>
              {expandedCard ? "Show Less ▲" : "Show More ▼"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.header}>
        <IconButton
          icon="menu"
          size={24}
          iconColor="white"
          onPress={() => setDrawerVisible(true)}
        />
        <Title style={styles.headerTitle}>Discover</Title>
        <IconButton
          icon="filter-variant"
          size={24}
          iconColor="white"
          onPress={() => router.push("/(app)/preferences")}
        />
      </LinearGradient>

      {/* Cards */}
      <View style={styles.cardsArea}>
        {currentIndex < profiles.length ? (
          profiles
            .slice(currentIndex, currentIndex + 2)
            .reverse()
            .map((profile, index) =>
              renderCard(profile, currentIndex + (1 - index))
            )
        ) : (
          <View style={styles.emptyState}>
            <Icon name="account-search" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No more profiles found</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new matches
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {currentIndex < profiles.length && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.passButton]}
            onPress={() => forceSwipe("left")}
          >
            <Icon name="close" size={30} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.superButton]}
            onPress={() => forceSwipe("up")}
          >
            <Icon name="star" size={30} color="#f59e0b" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.interestedButton]}
            onPress={() => forceSwipe("right")}
          >
            <Icon name="handshake" size={30} color="#10b981" />
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#6366f1" />
          <Text style={[styles.navText, styles.activeNav]}>Browse</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(app)/messages")}
        >
          <Icon name="message" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(app)/profile")}
        >
          <Icon name="account" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Drawer Menu */}
      <Modal
        visible={drawerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDrawerVisible(false)}
      >
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={() => setDrawerVisible(false)}
        >
          <View style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <Title>Menu</Title>
              <IconButton
                icon="close"
                onPress={() => setDrawerVisible(false)}
              />
            </View>

            <List.Item
              title="Preferences"
              left={(props) => <List.Icon {...props} icon="filter" />}
              onPress={() => {
                setDrawerVisible(false);
                router.push("/(app)/preferences");
              }}
            />
            <List.Item
              title="Billing"
              left={(props) => <List.Icon {...props} icon="credit-card" />}
              onPress={() => {}}
            />
            <List.Item
              title="Settings"
              left={(props) => <List.Icon {...props} icon="cog" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Help & Support"
              left={(props) => <List.Icon {...props} icon="help-circle" />}
              onPress={() => {}}
            />
            <List.Item
              title="Terms of Service"
              left={(props) => <List.Icon {...props} icon="file-document" />}
              onPress={() => {}}
            />
            <List.Item
              title="Privacy Policy"
              left={(props) => <List.Icon {...props} icon="shield-lock" />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Logout"
              left={(props) => <List.Icon {...props} icon="logout" />}
              onPress={async () => {
                await logout();
                router.replace("/(auth)/welcome");
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
  },
  cardsArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContainer: {
    position: "absolute",
    width: screenWidth * 0.9,
    height: screenHeight * 0.7,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },
  headerInfo: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  role: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "600",
  },
  location: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  cardContent: {
  },
  startupIdea: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 15,
    lineHeight: 22,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#e5e7eb",
  },
  chipText: {
    fontSize: 12,
    color: "#374151",
  },
  infoSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
  },
  lookingFor: {
    fontSize: 14,
    color: "#1f2937",
    lineHeight: 20,
  },
  expandedContent: {
    marginTop: 10,
  },
  dividerContainer: {
    marginVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  expandButton: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 10,
  },
  expandText: {
    textAlign: "center",
    color: "#6366f1",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    paddingBottom: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passButton: {
    borderWidth: 2,
    borderColor: "#ef4444",
  },
  superButton: {
    borderWidth: 2,
    borderColor: "#f59e0b",
  },
  interestedButton: {
    borderWidth: 2,
    borderColor: "#10b981",
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
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 20,
    color: "#6b7280",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#9ca3af",
    marginTop: 8,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  drawerContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  contentArea: {
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
});
