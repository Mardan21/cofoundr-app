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
        label="Brief Bio"
        value={formData.bio}
        onChangeText={(text) => setFormData({ ...formData, bio: text })}
        error={!!errors.bio}
        style={styles.input}
        multiline
        numberOfLines={4}
        maxLength={500}
        placeholder="Tell us about yourself, your experience, and what you're looking for..."
      />
      <HelperText type="error" visible={!!errors.bio}>
        {errors.bio}
      </HelperText>
      <Text style={styles.charCount}>{formData.bio.length}/500 characters</Text>

      <View style={styles.buttonContainer}>
        <Button mode="outlined" onPress={onBack} style={styles.button}>
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[styles.button, styles.submitButton]}
        >
          Complete Profile
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
