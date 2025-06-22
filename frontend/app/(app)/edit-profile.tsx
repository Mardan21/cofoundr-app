import { useAuth } from "@/hooks/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import {
  Avatar,
  Card,
  Divider,
  IconButton,
  List,
  Text,
  Title,
  TextInput,
  Button,
  Chip,
  SegmentedButtons,
  Portal,
  Modal,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { User, Link } from "@/types/User";
import { updateUserProfile } from "@/utils/api";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    bio: user?.bio || "",
    startupIdea: user?.startupIdea || "",
    lookingFor: user?.lookingFor || "",
    role: user?.role || "",
    city: user?.city || "",
    state: user?.state || "",
    profileType: user?.profileType || "founder",
    skills: user?.skills || [],
    links: user?.links || [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [newLink, setNewLink] = useState({ name: "", url: "" });

  const profileTypes = [
    { value: "founder", label: "Founder" },
    { value: "cofounder", label: "Co-founder" },
    { value: "mentor", label: "Mentor" },
    { value: "investor", label: "Investor" },
  ];

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    setIsLoading(true);
    try {
      // Call the API to update the user profile
      const updatedUser = await updateUserProfile(user.id, formData);
      
      // Update the local state
      await updateUser(updatedUser);
      
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert("Error", error.message || "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
      setShowSkillModal(false);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addLink = () => {
    if (newLink.name.trim() && newLink.url.trim()) {
      setFormData(prev => ({
        ...prev,
        links: [...prev.links, { ...newLink }]
      }));
      setNewLink({ name: "", url: "" });
      setShowLinkModal(false);
    }
  };

  const removeLink = (linkToRemove: Link) => {
    setFormData(prev => ({
      ...prev,
      links: prev.links.filter(link => 
        link.name !== linkToRemove.name || link.url !== linkToRemove.url
      )
    }));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#6366f1", "#8b5cf6"]} style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor="white"
          onPress={() => router.back()}
        />
        <Title style={styles.headerTitle}>Edit Profile</Title>
        <IconButton
          icon="content-save"
          size={24}
          iconColor="white"
          onPress={handleSave}
          disabled={isLoading}
        />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Basic Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Basic Information</Title>
            
            <TextInput
              label="Full Name"
              value={formData.full_name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Role/Title"
              value={formData.role}
              onChangeText={(text) => setFormData(prev => ({ ...prev, role: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="City"
              value={formData.city}
              onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="State/Country"
              value={formData.state}
              onChangeText={(text) => setFormData(prev => ({ ...prev, state: text }))}
              style={styles.input}
              mode="outlined"
            />

            <Text style={styles.label}>Profile Type</Text>
            <SegmentedButtons
              value={formData.profileType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, profileType: value as any }))}
              buttons={profileTypes}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* About */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>About</Title>
            <TextInput
              label="Bio"
              value={formData.bio}
              onChangeText={(text) => setFormData(prev => ({ ...prev, bio: text }))}
              style={styles.textArea}
              mode="outlined"
              multiline
              numberOfLines={4}
            />
          </Card.Content>
        </Card>

        {/* Startup Idea */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Startup Idea</Title>
            <TextInput
              label="Describe your startup idea"
              value={formData.startupIdea}
              onChangeText={(text) => setFormData(prev => ({ ...prev, startupIdea: text }))}
              style={styles.textArea}
              mode="outlined"
              multiline
              numberOfLines={4}
            />
          </Card.Content>
        </Card>

        {/* Looking For */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Looking For</Title>
            <TextInput
              label="What are you looking for in a co-founder?"
              value={formData.lookingFor}
              onChangeText={(text) => setFormData(prev => ({ ...prev, lookingFor: text }))}
              style={styles.textArea}
              mode="outlined"
              multiline
              numberOfLines={4}
            />
          </Card.Content>
        </Card>

        {/* Skills */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Skills</Title>
              <IconButton
                icon="plus"
                size={20}
                onPress={() => setShowSkillModal(true)}
              />
            </View>
            <View style={styles.skillsContainer}>
              {formData.skills.map((skill, index) => (
                <Chip
                  key={index}
                  style={styles.skillChip}
                  mode="outlined"
                  onClose={() => removeSkill(skill)}
                >
                  {skill}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Links */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title style={styles.sectionTitle}>Links</Title>
              <IconButton
                icon="plus"
                size={20}
                onPress={() => setShowLinkModal(true)}
              />
            </View>
            {formData.links.map((link, index) => (
              <List.Item
                key={index}
                title={link.name}
                description={link.url}
                left={(props) => <List.Icon {...props} icon="link" />}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="delete"
                    size={20}
                    onPress={() => removeLink(link)}
                  />
                )}
              />
            ))}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Add Skill Modal */}
      <Portal>
        <Modal
          visible={showSkillModal}
          onDismiss={() => setShowSkillModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>Add Skill</Title>
          <TextInput
            label="Skill"
            value={skillInput}
            onChangeText={setSkillInput}
            style={styles.input}
            mode="outlined"
            autoFocus
          />
          <View style={styles.modalButtons}>
            <Button onPress={() => setShowSkillModal(false)}>Cancel</Button>
            <Button onPress={addSkill} mode="contained">Add</Button>
          </View>
        </Modal>
      </Portal>

      {/* Add Link Modal */}
      <Portal>
        <Modal
          visible={showLinkModal}
          onDismiss={() => setShowLinkModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Title style={styles.modalTitle}>Add Link</Title>
          <TextInput
            label="Name (e.g., LinkedIn, GitHub)"
            value={newLink.name}
            onChangeText={(text) => setNewLink(prev => ({ ...prev, name: text }))}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="URL"
            value={newLink.url}
            onChangeText={(text) => setNewLink(prev => ({ ...prev, url: text }))}
            style={styles.input}
            mode="outlined"
            keyboardType="url"
          />
          <View style={styles.modalButtons}>
            <Button onPress={() => setShowLinkModal(false)}>Cancel</Button>
            <Button onPress={addLink} mode="contained">Add</Button>
          </View>
        </Modal>
      </Portal>
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
  card: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  textArea: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#374151",
  },
  segmentedButtons: {
    marginBottom: 15,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    marginBottom: 8,
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
  },
}); 