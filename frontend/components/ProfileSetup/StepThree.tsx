import { ProfileSetupData } from "@/types/User";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput, Title } from "react-native-paper";

interface StepThreeProps {
  formData: ProfileSetupData;
  setFormData: (data: ProfileSetupData) => void;
  errors: Partial<ProfileSetupData>;
  setErrors: (errors: Partial<ProfileSetupData>) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export default function StepThree({
  formData,
  setFormData,
  errors,
  setErrors,
  onBack,
  onSubmit,
}: StepThreeProps) {
  const validate = () => {
    const newErrors: Partial<ProfileSetupData> = {};

    if (!formData.bio.trim()) {
      newErrors.bio = "Bio is required";
    } else if (formData.bio.length < 50) {
      newErrors.bio = "Bio must be at least 50 characters";
    } else if (formData.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters";
    }

    if (!formData.lookingFor.trim()) {
      newErrors.lookingFor = "Please describe what you're looking for";
    } else if (formData.lookingFor.length < 20) {
      newErrors.lookingFor = "Please provide more details about what you're looking for";
    } else if (formData.lookingFor.length > 300) {
      newErrors.lookingFor = "Description must be less than 300 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <View>
      <Title style={styles.stepTitle}>About You</Title>

      <TextInput
        label="Brief Bio *"
        value={formData.bio}
        onChangeText={(text) => setFormData({ ...formData, bio: text })}
        error={!!errors.bio}
        style={styles.input}
        multiline
        numberOfLines={4}
        maxLength={500}
        placeholder="Tell us about yourself, your experience, background, and what drives you..."
      />
      <HelperText type="error" visible={!!errors.bio}>
        {errors.bio}
      </HelperText>
      <Text style={styles.charCount}>{formData.bio.length}/500 characters</Text>

      <TextInput
        label="What are you looking for? *"
        value={formData.lookingFor}
        onChangeText={(text) => setFormData({ ...formData, lookingFor: text })}
        error={!!errors.lookingFor}
        style={styles.input}
        multiline
        numberOfLines={3}
        maxLength={300}
        placeholder="Describe what kind of co-founder, mentor, investor, or collaboration you're seeking..."
      />
      <HelperText type="error" visible={!!errors.lookingFor}>
        {errors.lookingFor}
      </HelperText>
      <Text style={styles.charCount}>{formData.lookingFor.length}/300 characters</Text>

      <View style={styles.summary}>
        <Title style={styles.summaryTitle}>Profile Summary</Title>
        <Text style={styles.summaryText}>
          • Name: {formData.full_name || "Not provided"}
        </Text>
        <Text style={styles.summaryText}>
          • Role: {formData.profileType || "Not selected"}
        </Text>
        <Text style={styles.summaryText}>
          • LinkedIn: {formData.linkedinId ? "✓ Provided" : "Not provided"}
        </Text>
        <Text style={styles.summaryText}>
          • Startup Idea: {formData.startupIdea ? "✓ Provided" : "Not provided"}
        </Text>
        <Text style={styles.summaryText}>
          • Additional Links: {formData.links?.length > 1 ? `${formData.links.length - 1} added` : "None"}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={onBack} style={styles.button}>
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[styles.button, styles.submitButton]}
        >
          Create Profile
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    marginBottom: 8,
  },
  charCount: {
    textAlign: "right",
    color: "#666",
    fontSize: 12,
    marginBottom: 16,
  },
  summary: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginVertical: 20,
  },
  summaryTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  submitButton: {
    marginLeft: 8,
  },
});
