import { useAuth } from "@/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
  View,
  ScrollView,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  Avatar,
  Divider,
  IconButton,
  List,
  Title,
  Button,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { User } from "@/types/User";
import { getRecommendations, recordSwipe } from "@/utils/api";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const SWIPE_THRESHOLD = 120;

export default function BrowseScreen() {
  const [profiles, setProfiles] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [expandedCard, setExpandedCard] = useState(false);
  
  const swipe = useRef(new Animated.ValueXY()).current;
  const router = useRouter();
  const { user, logout } = useAuth();

  const fetchProfiles = async (limit: number) => {
    if (!user?.id) return [];
    try {
        const userIdToFetch = "6857b0f7b01beb3b82c39f91"; // Using hardcoded ID as requested
        const data = await getRecommendations(userIdToFetch, limit);
        return data.recommendations || [];
    } catch (error: any) {
        Alert.alert("Error", "Could not fetch profiles: " + error.message);
        return [];
    }
  };

  const loadInitialProfiles = async () => {
    setIsLoading(true);
    const initialProfiles = await fetchProfiles(5);
    setProfiles(initialProfiles);
    setIsLoading(false);
  };

  const loadMoreProfiles = async () => {
      if (isFetchingMore) return;
      setIsFetchingMore(true);
      const newProfiles = await fetchProfiles(3);
      if (newProfiles.length > 0) {
          setProfiles(prev => {
              const existingIds = new Set(prev.map((p: User) => p.id));
              const uniqueNewProfiles = newProfiles.filter((p: User) => !existingIds.has(p.id));
              return [...prev, ...uniqueNewProfiles];
          });
      }
      setIsFetchingMore(false);
  };

  useEffect(() => {
    loadInitialProfiles();
  }, [user]);

  useEffect(() => {
      if (profiles.length > 0 && currentIndex >= profiles.length - 2) {
          loadMoreProfiles();
      }
  }, [currentIndex, profiles.length]);


  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, { dx, dy }) => {
      swipe.setValue({ x: dx, y: dy });
    },
    onPanResponderRelease: (_, { dx, dy }) => {
      const direction = Math.sign(dx);
      const isActionActive = Math.abs(dx) > SWIPE_THRESHOLD;

      if (isActionActive) {
        Animated.timing(swipe, {
          toValue: { x: direction * screenWidth * 2, y: dy },
          duration: 300,
          useNativeDriver: true,
        }).start(() => handleSwipe(direction));
      } else {
        Animated.spring(swipe, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 5,
        }).start();
      }
    },
  });

  const handleSwipe = (direction: number) => {
    const swipedUser = profiles[currentIndex];
    if (!swipedUser || !user?.id) return;

    const decision = direction === 1 ? 1 : 0; // 1 for right (like), 0 for left (dislike)
    const userIdToSwipe = "6857b0f7b01beb3b82c39f91"; // Hardcoded as requested
    
    recordSwipe(userIdToSwipe, swipedUser.id, decision).catch(err => console.error("Swipe API call failed", err));

    setExpandedCard(false);
    setCurrentIndex((prev) => prev + 1);
    swipe.setValue({ x: 0, y: 0 });
  };
  
  const forceSwipe = (direction: "left" | "right") => {
    const x = direction === "right" ? screenWidth * 2 : -screenWidth * 2;
    Animated.timing(swipe, {
      toValue: { x, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => handleSwipe(direction === "right" ? 1 : -1));
  };

  const renderCard = (profile: User, index: number) => {
    const isFirst = index === currentIndex;
    const dragHandlers = isFirst ? panResponder.panHandlers : {};

    const rotate = swipe.x.interpolate({
      inputRange: [-screenWidth / 2, 0, screenWidth / 2],
      outputRange: ["-10deg", "0deg", "10deg"],
      extrapolate: "clamp",
    });

    const animatedCardStyle = {
      transform: [...swipe.getTranslateTransform(), { rotate }],
    };

    if (index < currentIndex) {
        return null;
    }

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
        <LinearGradient colors={["#ffffff", "#f8fafc"]} style={styles.card}>
          <View style={styles.cardHeader}>
            <Avatar.Image size={90} source={{ uri: profile.profile_pic_url }} />
            <View style={styles.headerInfo}>
              <Title style={styles.name}>{profile.full_name}</Title>
              <Text style={styles.roleText}>{profile.role}</Text>
              <View style={styles.locationRow}>
                <Icon name="map-marker" size={16} color="#6b7280" />
                <Text style={styles.location}>{profile.city}, {profile.state}</Text>
              </View>
            </View>
          </View>
          <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
            <View style={styles.ideaContainer}>
              <Text style={styles.ideaLabel}>Startup Idea</Text>
              <Text style={styles.startupIdea}>{profile.startupIdea}</Text>
            </View>

             <View style={styles.lookingForSection}>
                <Text style={styles.sectionTitle}>Looking for</Text>
                <Text style={styles.lookingFor}>{profile.lookingFor}</Text>
            </View>

            {expandedCard && (
              <View style={styles.expandedContent}>
                 <View style={styles.skillsSection}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <View style={styles.chipsContainer}>
                        {profile.skills?.map((skill, idx) => (
                        <View key={idx} style={styles.chipWrapper}>
                            <Text style={styles.chipText}>{skill}</Text>
                        </View>
                        ))}
                    </View>
                </View>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.expandButton} onPress={() => setExpandedCard(!expandedCard)}>
            <Text style={styles.expandText}>{expandedCard ? "Show Less" : "Show More"}</Text>
            <Icon name={expandedCard ? "chevron-up" : "chevron-down"} size={20} color="#6366f1" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.header}>
        <IconButton icon="menu" size={24} iconColor="white" onPress={() => setDrawerVisible(true)} />
        <Title style={styles.headerTitle}>Discover</Title>
        <IconButton icon="filter-variant" size={24} iconColor="white" onPress={() => router.push("/(app)/preferences")} />
      </LinearGradient>

      <View style={styles.cardsArea}>
        {isLoading ? (
            <ActivityIndicator size="large" color="#6366f1" />
        ) : profiles.length > 0 && currentIndex < profiles.length ? (
          profiles.map((p, i) => renderCard(p, i)).reverse()
        ) : (
          <View style={styles.emptyState}>
            <Icon name="account-search" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No more profiles found</Text>
          </View>
        )}
      </View>

      {currentIndex < profiles.length && !isLoading && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.passButton]} onPress={() => forceSwipe("left")}>
            <Icon name="close" size={30} color="#ef4444" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.interestedButton]} onPress={() => forceSwipe("right")}>
            <Icon name="heart" size={30} color="#10b981" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#6366f1" />
          <Text style={[styles.navText, styles.activeNav]}>Browse</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(app)/messages")}>
          <Icon name="message" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push("/(app)/profile")}>
          <Icon name="account" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={drawerVisible} transparent animationType="slide" onRequestClose={() => setDrawerVisible(false)}>
        <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={() => setDrawerVisible(false)}>
          <View style={styles.drawerContent}>
            <List.Item title="Preferences" onPress={() => { setDrawerVisible(false); router.push("/(app)/preferences"); }} />
            <Divider />
            <List.Item title="Logout" onPress={async () => { await logout(); router.replace("/(auth)/welcome"); }} />
          </View>
        </TouchableOpacity>
      </Modal>

      {isFetchingMore && (
        <View style={styles.loadingIndicatorContainer}>
          <ActivityIndicator size="small" color="#6366f1" />
          <Text style={styles.loadingText}>Finding more profiles...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 40, paddingBottom: 10, paddingHorizontal: 15 },
  headerTitle: { color: "white", fontSize: 20 },
  cardsArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  cardContainer: { position: "absolute", width: screenWidth * 0.9, height: screenHeight * 0.7, },
  card: { flex: 1, borderRadius: 24, backgroundColor: "#ffffff", shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 16, elevation: 8, overflow: 'hidden' },
  cardHeader: { flexDirection: "row", alignItems: 'center', padding: 24, paddingBottom: 16 },
  headerInfo: { marginLeft: 15, flex: 1 },
  name: { fontSize: 24, fontWeight: "bold", color: "#1f2937" },
  roleText: { fontSize: 14, color: "#6366f1", fontWeight: "600" },
  locationRow: { marginTop: 4, flexDirection: "row", alignItems: "center" },
  location: { fontSize: 14, color: "#6b7280", marginLeft: 4 },
  contentArea: { flex: 1, paddingHorizontal: 24 },
  ideaContainer: { marginBottom: 20 },
  ideaLabel: { fontSize: 14, fontWeight: "600", color: "#6b7280", marginBottom: 8 },
  startupIdea: { fontSize: 16, fontWeight: "500", color: "#1f2937", lineHeight: 24 },
  lookingForSection: { marginBottom: 20, },
  sectionTitle: { fontSize: 14, fontWeight: "600", color: "#6b7280", marginBottom: 12 },
  lookingFor: { fontSize: 15, color: "#4b5563", lineHeight: 22, },
  expandedContent: {},
  skillsSection: {},
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chipWrapper: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f1f5f9', marginRight: 8, marginBottom: 8 },
  chipText: { fontSize: 12, color: "#475569", fontWeight: "500" },
  expandButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 20, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  expandText: { color: "#6366f1", fontSize: 15, fontWeight: "600", marginRight: 5 },
  actionButtons: { flexDirection: "row", justifyContent: "center", paddingBottom: 20, paddingTop: 10,},
  actionButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: "white", justifyContent: "center", alignItems: "center", marginHorizontal: 15, elevation: 3 },
  passButton: { borderWidth: 2, borderColor: "#ef4444" },
  interestedButton: { borderWidth: 2, borderColor: "#10b981" },
  bottomNav: { flexDirection: "row", backgroundColor: "white", paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  navItem: { flex: 1, alignItems: "center" },
  navText: { fontSize: 12, color: "#9ca3af", marginTop: 4 },
  activeNav: { color: "#6366f1" },
  emptyState: { alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 20, color: "#6b7280", marginTop: 20 },
  drawerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)" },
  drawerContent: { backgroundColor: "white", position: 'absolute', left: 0, top: 0, bottom: 0, width: screenWidth * 0.75, paddingVertical: 50 },
  loadingIndicatorContainer: {
    position: 'absolute',
    bottom: 85, // Position it above the bottom nav
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loadingText: {
    marginLeft: 10,
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
});
