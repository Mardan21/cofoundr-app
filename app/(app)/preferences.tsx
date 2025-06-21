import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  Divider,
  IconButton,
  RadioButton,
  Text,
  Title,
} from "react-native-paper";

export default function PreferencesScreen() {
  const router = useRouter();
  const [profileType, setProfileType] = useState("all");
  const [distance, setDistance] = useState(50);

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
        <Title style={styles.headerTitle}>Filter Preferences</Title>
        <View style={{ width: 48 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Profile Type Filter */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Show me</Title>
          <RadioButton.Group
            onValueChange={(value) => setProfileType(value)}
            value={profileType}
          >
            <RadioButton.Item label="Everyone" value="all" />
            <RadioButton.Item label="Cofounders only" value="cofounder" />
            <RadioButton.Item label="Mentors only" value="mentor" />
            <RadioButton.Item label="Investors only" value="investor" />
          </RadioButton.Group>
        </View>

        <Divider />

        {/* Distance Filter */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Maximum distance</Title>
          <Text style={styles.distanceText}>{distance} miles</Text>
          <Slider
            value={distance}
            onValueChange={setDistance}
            minimumValue={5}
            maximumValue={100}
            step={5}
            style={styles.slider}
          />
          <View style={styles.distanceLabels}>
            <Text>5 mi</Text>
            <Text>100 mi</Text>
          </View>
        </View>

        <Divider />

        {/* Additional Filters (Coming Soon) */}
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Advanced Filters</Title>
          <Text style={styles.comingSoon}>
            Industry, skills, and experience filters coming soon!
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={() => router.back()}
          style={styles.saveButton}
        >
          Save Preferences
        </Button>
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
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "white",
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  distanceText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  slider: {
    marginHorizontal: -10,
  },
  distanceLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  comingSoon: {
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
  footer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  saveButton: {
    backgroundColor: "#6366f1",
  },
});
