import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Avatar,
  Badge,
  List,
  Searchbar,
  Text,
  Title,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Mock data for conversations
const mockConversations = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "https://i.pravatar.cc/150?img=1",
    lastMessage: "That sounds great! When can we discuss the equity split?",
    timestamp: "2 min ago",
    unread: 2,
    isOnline: true,
  },
  {
    id: "2",
    name: "Marcus Johnson",
    avatar: "https://i.pravatar.cc/150?img=2",
    lastMessage: "I'd be happy to review your pitch deck",
    timestamp: "1 hour ago",
    unread: 0,
    isOnline: false,
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");

  const renderConversation = ({
    item,
  }: {
    item: (typeof mockConversations)[0];
  }) => (
    <TouchableOpacity
      onPress={() => {
        /* Navigate to chat */
      }}
    >
      <List.Item
        title={item.name}
        description={item.lastMessage}
        left={() => (
          <View>
            <Avatar.Image size={50} source={{ uri: item.avatar }} />
            {item.isOnline && <View style={styles.onlineIndicator} />}
          </View>
        )}
        right={() => (
          <View style={styles.rightContent}>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
            {item.unread > 0 && (
              <Badge style={styles.badge}>{item.unread}</Badge>
            )}
          </View>
        )}
        style={styles.conversationItem}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.header}>
        <Title style={styles.headerTitle}>Messages</Title>
      </LinearGradient>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search conversations"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Conversations List */}
      {mockConversations.length > 0 ? (
        <FlatList
          data={mockConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="message-text-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>
            Start matching to begin conversations
          </Text>
        </View>
      )}

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(app)/browse")}
        >
          <Icon name="home" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Browse</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Icon name="message" size={24} color="#6366f1" />
          <Text style={[styles.navText, styles.activeNav]}>Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/(app)/profile")}
        >
          <Icon name="account" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Profile</Text>
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
    paddingTop: 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  searchBar: {
    margin: 15,
    elevation: 0,
    backgroundColor: "white",
  },
  listContent: {
    paddingBottom: 10,
  },
  conversationItem: {
    backgroundColor: "white",
    marginHorizontal: 15,
    marginVertical: 5,
    borderRadius: 10,
    paddingVertical: 10,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: "white",
  },
  rightContent: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  timestamp: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  badge: {
    backgroundColor: "#6366f1",
  },
  emptyState: {
    flex: 1,
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
